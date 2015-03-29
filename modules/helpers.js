/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';

    var EditorManager = brackets.getModule("editor/EditorManager"),
        DocumentManager = brackets.getModule('document/DocumentManager'),
        CommandManager = brackets.getModule('command/CommandManager'),
        Commands = brackets.getModule('command/Commands'),
        Omnisharp = require('modules/omnisharp'),
        CodeMirror = brackets.getModule("thirdparty/CodeMirror2/lib/codemirror"),
        mode = CodeMirror.getMode(CodeMirror.defaults, 'text/x-csharp'),
        FileUtils = brackets.getModule('file/FileUtils');

    function isCSharp() {
        var document = DocumentManager.getCurrentDocument();
        if (document === null) {
            return;
        }

        var language = document.getLanguage();
        return language.getId() === 'csharp';
    }

    function buildRequest(additionalParameters) {
        var document = DocumentManager.getCurrentDocument(),
            filename = document.file._path,
            text = document.getText(),
            editor = EditorManager.getActiveEditor(),
            cursorPos = editor.getCursorPos(true, "start"),
            request = {
                line: cursorPos.line + 1,
                column: cursorPos.ch + 1,
                buffer: text,
                filename: filename
            };

        $.extend(request, additionalParameters || {});

        return request;
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

    exports.goto = function (res) {
        var unixPath = FileUtils.convertWindowsPathToUnixPath(res.FileName);
        
        CommandManager.execute(Commands.CMD_ADD_TO_WORKINGSET_AND_OPEN, { fullPath: unixPath, paneId: 'first-pane' }).done(function () {
            var editor = EditorManager.getActiveEditor();
            editor.setCursorPos(res.Line - 1, res.Column - 1, true);
        });
    };

    exports.escapeHtml = function (text) {
        var map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };

        return text.replace(/[&<>"']/g, function (m) { return map[m]; });
    };
});
