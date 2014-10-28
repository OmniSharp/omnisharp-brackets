/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';

    var EditorManager = brackets.getModule("editor/EditorManager"),
        DocumentManager = brackets.getModule('document/DocumentManager');
    
    return {
        isCSharp: function () {
            var document = DocumentManager.getCurrentDocument();
            if (document === null) {
                return;
            }

            var language = document.getLanguage();
            return language.getId() === 'csharp';
        },
        buildRequest: function () {
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
    };
});