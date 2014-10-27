/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';
    
    var Menus = brackets.getModule('command/Menus'),
        CommandManager = brackets.getModule('command/CommandManager'),
        EditorManager = brackets.getModule('editor/EditorManager'),
        DocumentManager = brackets.getModule('document/DocumentManager');
    
    var omnisharp = require('modules/omnisharp');
    
    function isCSharp() {
        var document = DocumentManager.getCurrentDocument();
        if (document === null) {
            return;
        }
        
        var language = document.getLanguage();
        return language.getId() === 'csharp';
    }
    
    function gotoDefinition() {
        var document = DocumentManager.getCurrentDocument();
        var filename = document.file._path;

        var data = {
            line: 1,
            column: 1,
            buffer: document.getText(),
            filename: filename
        };
        omnisharp.makeRequest('gotoDefinition', data, function (err, data) {
            if (err !== null) {
                var tests = 1;
                // freak out
            }
            
            var test = 1;
        });
    }
    
    return {
        init: function () {
            CommandManager.register('Goto Definition', 'mat-mcloughlin.phoenix.gotoDefinition', gotoDefinition);
            
            var contextMenu = Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU);

            $(contextMenu).on("beforeContextMenuOpen", function () {
                if (isCSharp()) {
                    contextMenu.addMenuItem('mat-mcloughlin.phoenix.gotoDefinition');
                } else {
                    contextMenu.removeMenuItem('mat-mcloughlin.phoenix.gotoDefinition');
                }
            });
        }
    };
});