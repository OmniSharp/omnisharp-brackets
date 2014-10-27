/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';

    var editorManager = brackets.getModule("editor/EditorManager");
    var DocumentManager = brackets.getModule('document/DocumentManager');

    var omnisharp = require('modules/omnisharp');

    function formatDoc() {
        var document = DocumentManager.getCurrentDocument();
        var filename = document.file._path;
        var text = document.getText();
        var deferred = $.Deferred();

        var editor = editorManager.getActiveEditor();
        var cursorPos = editor.getCursorPos(true, "start");

        var data = {
            line: cursorPos.line + 1,
            column: cursorPos.ch + 1,
            buffer: text,
            filename: filename
        };

        omnisharp.makeRequest('codeformat', data, function (err, data) {
            if (err !== null) {
                console.info('error formatting document')
            }

            document.setText(data.Buffer);
        });

        return deferred.promise();
    }

    return {
        formatDocument : formatDoc
      };
});
