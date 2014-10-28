/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';

    var Menus = brackets.getModule('command/Menus'),
        CommandManager = brackets.getModule('command/CommandManager'),
        CodeFormat = require('modules/codeFormat'),
        CodeNavigation = require('modules/codeNavigation'),
        Helpers = require('modules/Helpers');

    return {
        init: function () {
            CommandManager.register('Goto Definition', 'mat-mcloughlin.omnisharp-brackets.gotoDefinition', CodeNavigation.gotoDefinition);
            CommandManager.register('Format Document', 'mat-mcloughlin.omnisharp-brackets.formatDocument', CodeFormat.formatDocument);

            var contextMenu = Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU);

            $(contextMenu).on("beforeContextMenuOpen", function () {
                if (Helpers.isCSharp()) {
                    contextMenu.addMenuItem('mat-mcloughlin.omnisharp-brackets.gotoDefinition');
                    contextMenu.addMenuItem('mat-mcloughlin.omnisharp-brackets.formatDocument');
                } else {
                    contextMenu.removeMenuItem('mat-mcloughlin.omnisharp-brackets.gotoDefinition');
                    contextMenu.removeMenuItem('mat-mcloughlin.omnisharp-brackets.formatDocument');
                }
            });
        }
    };
});