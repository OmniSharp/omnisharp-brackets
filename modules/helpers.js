/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';

    var EditorManager = brackets.getModule("editor/EditorManager"),
        DocumentManager = brackets.getModule('document/DocumentManager'),
        Omnisharp = require('modules/omnisharp'),
        mode = CodeMirror.getMode(CodeMirror.defaults, 'text/x-csharp');


    function isCSharp() {
        var document = DocumentManager.getCurrentDocument();
        if (document === null) {
            return;
        }

        var language = document.getLanguage();
        return language.getId() === 'csharp';
    }

    function buildRequest() {
        var document = DocumentManager.getCurrentDocument();
        var filename = document.file._path;
        var text = document.getText();

        var editor = EditorManager.getActiveEditor();
        var cursorPos = editor.getCursorPos(true, "start");

        return {
            line: cursorPos.line + 1,
            column: cursorPos.ch + 1,
            buffer: text,
            filename: filename
        };
    }

    function makeRequestAndRefreshDocument(service) {
        var document = DocumentManager.getCurrentDocument();
        var req = buildRequest();

        Omnisharp.makeRequest(service, req, function (err, res) {
            if (err !== null) {
                console.error(err);
            }

            document.setText(res.Buffer || res.Text);
        });
    }

    function highlightCode(line) {
        var stream = new CodeMirror.StringStream(line),
            result,
            node = document.createElement('span'),
            state = CodeMirror.startState(mode);

        while (!stream.eol()) {
            var style = mode.token(stream, state);

            if (style) {
                var sp = node.appendChild(document.createElement('span'));
                sp.className = 'cm-' + style.replace(/ +/g, ' cm-');
                sp.appendChild(document.createTextNode(stream.current()));
            } else {
                node.appendChild(document.createTextNode(stream.current()));
            }
            stream.start = stream.pos;
        }

        return node.innerHTML;
    }

    exports.isCSharp = isCSharp;
    exports.highlightCode = highlightCode;
    exports.buildRequest = buildRequest;
    exports.makeRequestAndRefreshDocument = makeRequestAndRefreshDocument;
});
