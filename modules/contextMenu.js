/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';

    var Menus = brackets.getModule('command/Menus'),
        CommandManager = brackets.getModule('command/CommandManager'),
        CodeFormat = require('modules/codeFormat'),
        CodeNavigation = require('modules/codeNavigation'),
        Refactor = require('modules/refactor'),
        Helpers = require('modules/helpers');

    return {
        init: function () {
            CommandManager.register('Goto Definition', 'mat-mcloughlin.omnisharp-brackets.gotoDefinition', CodeNavigation.gotoDefinition);
            CommandManager.register('Format Document', 'mat-mcloughlin.omnisharp-brackets.formatDocument', CodeFormat.formatDocument);
            CommandManager.register('Fix Usings', 'mat-mcloughlin.omnisharp-brackets.fixUsings', CodeFormat.fixUsings);
            CommandManager.register('Rename', 'mat-mcloughlin.omnisharp-brackets.rename', Refactor.rename);

            var contextMenu = Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU);

            $(contextMenu).on("beforeContextMenuOpen", function () {
                if (Helpers.isCSharp()) {
                    contextMenu.addMenuItem('mat-mcloughlin.omnisharp-brackets.gotoDefinition');
                    contextMenu.addMenuItem('mat-mcloughlin.omnisharp-brackets.formatDocument');
                    contextMenu.addMenuItem('mat-mcloughlin.omnisharp-brackets.fixUsings');
                    contextMenu.addMenuItem('mat-mcloughlin.omnisharp-brackets.rename');
                } else {
                    contextMenu.removeMenuItem('mat-mcloughlin.omnisharp-brackets.gotoDefinition');
                    contextMenu.removeMenuItem('mat-mcloughlin.omnisharp-brackets.formatDocument');
                    contextMenu.removeMenuItem('mat-mcloughlin.omnisharp-brackets.fixUsings');
                    contextMenu.removeMenuItem('mat-mcloughlin.omnisharp-brackets.rename');
                }
            });
        }
    };
});