/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';

    var AppInit = brackets.getModule('utils/AppInit'),
        Menus = brackets.getModule('command/Menus'),
        CommandManager = brackets.getModule('command/CommandManager'),
        CodeFormat = require('modules/codeFormat'),
        CodeNavigation = require('modules/codeNavigation'),
        Refactor = require('modules/refactor'),
        Helpers = require('modules/helpers');
    
    AppInit.appReady(function () {
        CommandManager.register('Goto Definition', 'mat-mcloughlin.omnisharp-brackets.gotoDefinition', CodeNavigation.gotoDefinition);
        CommandManager.register('Rename', 'mat-mcloughlin.omnisharp-brackets.rename', Refactor.rename);

        var contextMenu = Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU);

        $(contextMenu).on("beforeContextMenuOpen", function () {
            if (Helpers.isCSharp()) {
                contextMenu.addMenuItem('mat-mcloughlin.omnisharp-brackets.gotoDefinition');
                contextMenu.addMenuItem('mat-mcloughlin.omnisharp-brackets.rename');
            } else {
                contextMenu.removeMenuItem('mat-mcloughlin.omnisharp-brackets.gotoDefinition');
                contextMenu.removeMenuItem('mat-mcloughlin.omnisharp-brackets.rename');
            }
        });
    });
});