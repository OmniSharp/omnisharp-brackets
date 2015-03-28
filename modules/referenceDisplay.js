/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';

    var AppInit = brackets.getModule('utils/AppInit'),
        EditorManager = brackets.getModule('editor/EditorManager'),
        CodeMirror = brackets.getModule('thirdparty/CodeMirror2/lib/codemirror'),
        Helpers = require('modules/helpers'),
        Omnisharp = require('modules/omnisharp'),
        InlineCodePreviewWidget = require('modules/omnisharpInlineWidget'),
        CommandManager = brackets.getModule('command/CommandManager'),
        FileUtils = brackets.getModule('file/FileUtils'),
        Commands = brackets.getModule('command/Commands'),
        DocumentManager = brackets.getModule('document/DocumentManager'),
        PreferencesManager = brackets.getModule('preferences/PreferencesManager'),
        prefs = PreferencesManager.getExtensionPrefs('omnisharp');

    var findReferencesTemplate = require("text!htmlContent/omnisharp-findreferences-template.html");

    var isRunning,
        isLoading,
        referenceWidgets = [],
        lineWidgets = [];

        prefs.definePreference('enableCodeLens', 'bool', true);

    function getCodeMirror() {
        var editor = EditorManager.getActiveEditor();
        return editor._codeMirror;
    }

    function getLeadingWhitespace(line) {
        var temp = DocumentManager.getCurrentDocument().getLine(line);
        return temp.match(/^[\s]*/)[0];
    }

    function createWidgetItem(widget, reference) {
        var highlightedCode = Helpers.highlightCode(reference.Text),
            listItem = $('<li>')
                .append($('<span>')
                    .text('L' + reference.Line + ': ')
                    .append($('<a style="cursor: pointer;">').append($('<span>' + highlightedCode + '</span>')))
                    )
                .data('reference', reference);

        listItem.mousedown(function () {
            var unixPath = FileUtils.convertWindowsPathToUnixPath(reference.FileName);
            CommandManager.execute(Commands.CMD_ADD_TO_WORKINGSET_AND_OPEN, {
                fullPath: unixPath,
                paneId: 'first-pane'
            }).done(function () {
                var editor = EditorManager.getActiveEditor();
                editor.setCursorPos(reference.Line - 1, reference.Column - 1, true);
            });
        });

        return listItem;
    }

    function setWidgetContent(widget) {

        //this overrides the prototype method of the widget loading
        var content = $(widget.$htmlContent),
            $list = $('ul', content),
            document = DocumentManager.getCurrentDocument(),
            dataToSend = {
                filename: document.file._path,
                line: widget.member.Line,
                column: widget.member.Column + 1
            },
            filename;

        Omnisharp.makeRequest('findusages', dataToSend, function (err, data) {
            if (err !== null) {
                console.error(err);
            } else {
                var referencesByFileName = [];

                data.QuickFixes.map(function (reference, idx) {
                    if (!referencesByFileName[reference.FileName]) {
                        referencesByFileName[reference.FileName] = [];
                    }

                    referencesByFileName[reference.FileName].push(reference);
                });

                Object.keys(referencesByFileName).map(function (filename, idx) {
                    var references = referencesByFileName[filename],
                        header = $('<li>')
                            .attr('class', 'filename')
                            .append($('<span>').text(filename.replace(/^.*[\\\/]/, '')))
                            .append($('<ul>'));

                    $list.append(header);

                    references.map(function (reference, fnidx) {
                        $('ul', header).append(createWidgetItem(widget, reference));
                    });
                });

                widget.adjustHeight();
            }
        });

        return function () {};
    }

    function onAnchorClick(e) {
        var editor = EditorManager.getActiveEditor(),
            widget = new InlineCodePreviewWidget.OmnisharpInlineWidget(EditorManager.getActiveEditor()),
            anchor = $(e.currentTarget),
            member = anchor.data('omnisharp-file-member'),
            currentWidget = anchor.data('omnisharp-reference-widget');

        if (currentWidget !== undefined) {
            currentWidget.close();
            anchor.removeData('omnisharp-reference-widget');
            return;
        }

        widget.load(EditorManager.getActiveEditor(), $(findReferencesTemplate));
        widget.member = member;
        widget.setInlineContent = setWidgetContent(widget);
        widget.adjustHeight = function () {
            widget.setHeight(widget, $(".omnisharp-references", widget.$htmlContent).height() + 'px');
        };

        editor.addInlineWidget({
            line: member.Line - 2,
            ch: member.Column
        }, widget);

        widget.onAdded();
        anchor.data('omnisharp-reference-widget', widget);
        referenceWidgets.push(widget);
    }

    function createElement(data, member) {
        var text = data.QuickFixes.length + ' reference',
            whitespace = getLeadingWhitespace(member.Line - 1),
            anchor,
            finalElement;

        if (data.QuickFixes.length !== 1) {
            text += 's';
        }

        finalElement = $('<pre class="omnisharp-reference-display">' + whitespace + '<small><a>' + text + '</a></small></pre>').get(0);
        anchor = $("a", finalElement);
        anchor.data('omnisharp-file-member', member);
        anchor.click(onAnchorClick);

        return finalElement;
    }

    function processMember(member) {
        var codeMirror = getCodeMirror(),
            document = DocumentManager.getCurrentDocument(),
            dataToSend = {
                filename: document.file._path,
                line: member.Line,
                column: member.Column + 1
            };

        Omnisharp.makeRequest('findusages', dataToSend, function (err, data) {
            if (err !== null) {
                console.error(err);
            } else {
                lineWidgets.push(codeMirror.addLineWidget(member.Line - 2, createElement(data, member), {
                    coverGutter: false,
                    noHScroll: true
                }));
            }
        });
    }

    function clearWidgets() {
        lineWidgets.map(function (widget, idx) {
            widget.clear();
        });
        referenceWidgets.map(function (widget, idx) {
            widget.close();
        });
        lineWidgets = [];
        referenceWidgets = [];
    }

    function load() {
        if (prefs.get('enableCodeLens')) {
            if (!isLoading) {
                try {
                    isLoading = true;
                    var document = DocumentManager.getCurrentDocument(),
                        dataToSend = {
                            filename: document.file._path
                        };

                    clearWidgets();

                    Omnisharp.makeRequest('currentfilemembersasflat', dataToSend, function (err, data) {
                        if (err !== null) {
                            console.error(err);
                        } else {
                            data.map(function (member) {
                                return processMember(member);
                            });
                        }
                    });

                    isLoading = false;
                } catch (ex) {
                    isLoading = false;
                }
            }
        }
    }

    function onOmnisharpReady() {
        isRunning = true;
        load();
    }

    function onOmnisharpEnd() {
        isRunning = false;
    }

    function init() {
        $(Omnisharp).on('omnisharpReady', onOmnisharpReady);
        $(Omnisharp).on('omnisharpQuit', onOmnisharpEnd);
        $(Omnisharp).on('omnisharpError', onOmnisharpEnd);
        isLoading = false;
        isRunning = false;

        EditorManager.on("activeEditorChange", function (a, b, c) {
            if (isRunning) {
                load();
            }
        });
    }
    exports.init = init;
    exports.reload = load;
});
