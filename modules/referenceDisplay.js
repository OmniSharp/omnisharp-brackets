/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';

    var AppInit = brackets.getModule('utils/AppInit'),
        EditorManager = brackets.getModule('editor/EditorManager'),
        CodeMirror = brackets.getModule('thirdparty/CodeMirror2/lib/codemirror'),
        Helpers = require('modules/helpers'),
        Omnisharp = require('modules/omnisharp'),
        InlineCodePreviewWidget = require('modules/inlineCodePreviewWidget'),
        DocumentManager = brackets.getModule('document/DocumentManager');

    var isRunning,
        isLoading,
        currentWidgets = [];

    function getCodeMirror() {
        var editor = EditorManager.getActiveEditor();
        return editor._codeMirror;
    }

    function getLeadingWhitespace(line) {
        var temp = DocumentManager.getCurrentDocument().getLine(line);
        return temp.match(/^[\s]*/)[0];
    }
    
    function onAnchorClick(e) {
        var editor = EditorManager.getActiveEditor(),
            widget = new InlineCodePreviewWidget.InlineCodePreivewWidget(EditorManager.getActiveEditor()),
            anchor = $(e.currentTarget),
            member = anchor.data('omnisharp-file-member');
        
        widget.load(EditorManager.getActiveEditor());
        
        alert(JSON.stringify(anchor.data('omnisharp-file-member')));
        editor.addInlineWidget(editor.getCursorPos(), widget);
        widget.onAdded();
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
        anchor.data('omnisharp-file-member', data);
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
                currentWidgets.push(codeMirror.addLineWidget(member.Line - 2, createElement(data, member), {
                    coverGutter: false,
                    noHScroll: true
                }));
            }
        });
    }

    function clearWidgets() {
        currentWidgets.map(function (widget, idx) {
            widget.clear();
        });
        currentWidgets = [];
    }

    function load() {
        if (!isLoading) {
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
});