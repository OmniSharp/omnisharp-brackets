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

    exports.isCSharp = function () {
        var document = DocumentManager.getCurrentDocument();
        if (document === null) {
            return;
        }

        var language = document.getLanguage();
        return language.getId() === 'csharp';
    };

    exports.refreshDocument = function (res) {
        var document = DocumentManager.getCurrentDocument();

        document.setText(res.Buffer || res.Text);
    };

    exports.highlightCode = function (line) {
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
    };

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
