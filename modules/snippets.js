/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';

    var EditorManager = brackets.getModule("editor/EditorManager"),
        CodeMirror = brackets.getModule('thirdparty/CodeMirror2/lib/codemirror'),
        Pos = CodeMirror.Pos;

    var ourMap = {
        Tab : selectNextVariable,
        Esc : uninstall,
        Enter : uninstall
    };

    function TemplateState() {
        this.marked = [];
        this.selectableMarkers = [];
        this.varIndex = -1;
    }

    function parseTemplate(template) {
        var content = template;
        var tokens = [];
        var varParsing = false;
        var last = null;
        var token = '';
        var posX = 0,
            i;

        for (i = 0; i < content.length; i++) {
            var current = content.charAt(i);

            if (current === "\n") {
                if (token !== '') {
                    tokens.push(token);
                }

                token = '';
                tokens.push(current);
                posX = 0;
                last = null;
            } else {
                var addChar = true;

                if (varParsing) {
                    if (current === "}") {
                        varParsing = false;
                        addChar = false;

                        tokens.push({
                            "variable" : token,
                            "x" : posX
                        });

                        posX += token.length;
                        token = '';
                    }
                } else {
                    if (current === "$" && (i + 1) <= content.length) {
                        i++;
                        var next = content.charAt(i);

                        if (next === "{") {
                            varParsing = true;
                            addChar = false;

                            if (token !== '') {
                                tokens.push(token);
                                posX += token.length;
                            }

                            token = '';
                        }
                    }

                }

                if (addChar && last !== "$") {
                    token += current;
                    last = current;
                } else {
                    last = null;
                }
            }
        }

        if (token !== '') {
            tokens.push(token);
        }

        return tokens;
    }

    function isSpecialVar(variable) {
        return variable === 'cursor' || variable === 'line_selection';
    }

    function selectNextVariable(codeMirror) {
        var state = codeMirror._templateState,
            i;

        if (state.selectableMarkers.length > 0) {
            state.varIndex++;

            if (state.varIndex >= state.selectableMarkers.length) {
                state.varIndex = 0;
            }

            var marker = state.selectableMarkers[state.varIndex];
            var pos = marker.find();
            var templateVar = marker._templateVar;

            codeMirror.setSelection(pos.from, pos.to);

            for (i = 0; i < state.marked.length; i++) {
                var m = state.marked[i];

                if (m === marker) {
                    m.className = "";
                    m.startStyle = "";
                    m.endStyle = "";
                } else {
                    if (m._templateVar === marker._templateVar) {
                        m.className = "CodeMirror-templates-variable-selected";
                        m.startStyle = "";
                        m.endStyle = "";
                    } else {
                        m.className = "CodeMirror-templates-variable";
                        m.startStyle = "CodeMirror-templates-variable-start";
                        m.endStyle = "CodeMirror-templates-variable-end";
                    }
                }
            }

            codeMirror.refresh();

            if (templateVar === "cursor") {
                codeMirror.replaceRange("", pos.from, { line: pos.from.line, ch: pos.from.ch + 2 });
                codeMirror.setSelection(pos.from);
                uninstall(codeMirror);
            }
        }
    }

    function getCodeMirror() {
        var editor = EditorManager.getActiveEditor();
        return editor._codeMirror;
    }

    function getMarkerChanged(codeMirror, textChanged) {
        var markers = codeMirror.findMarksAt(textChanged.from),
            i;

        if (markers) {
            for (i = 0; i < markers.length; i++) {
                var marker = markers[i];
                if (marker._templateVar) {
                    return marker;
                }
            }
        }
        return null;
    }

    function onChange(codeMirror, textChanged) {
        var state = codeMirror._templateState,
            i;

        if (!textChanged.origin || !state || state.updating) {
            return;
        }

        try {
            state.updating = true;
            var markerChanged = getMarkerChanged(codeMirror, textChanged);

            if (markerChanged === null) {
                uninstall(codeMirror);
            } else {
                var posChanged = markerChanged.find();
                var newContent = codeMirror.getRange(posChanged.from, posChanged.to);

                for (i = 0; i < state.marked.length; i++) {
                    var marker = state.marked[i];

                    if (marker !== markerChanged && marker._templateVar === markerChanged._templateVar) {
                        var pos = marker.find();
                        codeMirror.replaceRange(newContent, pos.from, pos.to);
                    }
                }
            }
        } finally {
            state.updating = false;
        }
    }

    function uninstall(codeMirror) {
        var state = codeMirror._templateState,
            i;

        for (i = 0; i < state.marked.length; i++) {
            state.marked[i].clear();
        }

        state.marked.length = 0;
        state.selectableMarkers.length = 0;
        codeMirror.off("change", onChange);
        codeMirror.removeKeyMap(ourMap);
        delete codeMirror._templateState;
    }

    function install(range, snippet) {
        var codeMirror = getCodeMirror(),
            i;

        if (codeMirror._templateState) {
            uninstall(codeMirror);
        }

        var state = new TemplateState();
        codeMirror._templateState = state;

        var template = snippet,
            tokens = parseTemplate(template),
            content = '',
            line = 0,
            markers = [],
            variables = [],
            from,
            to,
            selectable,
            x,
            y;

        for (i = 0; i < tokens.length; i++) {
            var token = tokens[i];

            if (token.variable) {
                if (!isSpecialVar(token.variable)) {
                    content += token.variable;
                    from = new Pos(range.from.line + line, token.x);
                    to = new Pos(range.from.line + line, token.x + token.variable.length);
                    selectable = variables[token.variable] !== false;

                    markers.push({
                        from : from,
                        to : to,
                        variable : token.variable,
                        selectable : selectable
                    });

                    variables[token.variable] = false;
                } else {
                    content += "//";
                    from = new Pos(range.from.line + line, token.x);
                    to = new Pos(range.from.line + line, token.x + 2);
                    selectable = variables[token.variable] !== false;

                    markers.push({
                        from : from,
                        to : to,
                        variable : token.variable,
                        selectable : true
                    });

                    variables[token.variable] = false;
                }
            } else {
                content += token;

                if (token === "\n") {
                    line++;
                }
            }
        }

        from = range.from;
        to = range.to;
        codeMirror.replaceRange(content, from, to);

        var lines = content.split("\n");

        for (x = 0; x < lines.length; x++) {
            var targetLine = from.line + x;

            codeMirror.indentLine(targetLine);
            line = codeMirror.getLine(targetLine);
            var deltaIndent = line.length - lines[x].length;

            for (y = 0; y < markers.length; y++) {
                if (markers[y].from.line === targetLine) {
                    markers[y].from.ch += deltaIndent;
                    markers[y].to.ch += deltaIndent;
                }
            }
        }

        for (i = 0; i < markers.length; i++) {
            var marker = markers[i];

            from = marker.from;
            to = marker.to;

            var markText = codeMirror.markText(from, to, {
                className : "CodeMirror-templates-variable",
                startStyle : "CodeMirror-templates-variable-start",
                endStyle : "CodeMirror-templates-variable-end",
                inclusiveLeft : true,
                inclusiveRight : true,
                _templateVar : marker.variable
            });

            state.marked.push(markText);

            if (marker.selectable === true) {
                state.selectableMarkers.push(markText);
            }
        }

        selectNextVariable(codeMirror);

        codeMirror.on("change", onChange);
        codeMirror.addKeyMap(ourMap);
    }

    exports.install = install;
});
