/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';

    var AppInit = brackets.getModule('utils/AppInit'),
        Omnisharp = require('modules/omnisharp'),
        Menus = brackets.getModule('command/Menus'),
        CommandManager = brackets.getModule('command/CommandManager'),
        CodeNavigation = require('modules/codeNavigation'),
        Refactor = require('modules/refactor'),
        Helpers = require('modules/helpers'),
        Strings = require('strings');
    
    function onOmnisharpReady() {
        CommandManager.get(Strings.gotoDefinition).setEnabled(true);
        CommandManager.get(Strings.rename).setEnabled(true);
    }

    function onOmnisharpEnd() {
        CommandManager.get(Strings.gotoDefinition).setEnabled(false);
        CommandManager.get(Strings.rename).setEnabled(false);
    }

    AppInit.appReady(function () {
        CommandManager.register('Goto Definition', Strings.gotoDefinition, CodeNavigation.gotoDefinition);
        CommandManager.register('Rename', Strings.rename, Refactor.rename);

        CommandManager.get(Strings.gotoDefinition).setEnabled(false);
        CommandManager.get(Strings.rename).setEnabled(false);

        var contextMenu = Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU);

        $(contextMenu).on("beforeContextMenuOpen", function () {
            if (Helpers.isCSharp()) {
                contextMenu.addMenuItem(Strings.gotoDefinition);
                contextMenu.addMenuItem(Strings.rename);
            } else {
                contextMenu.removeMenuItem(Strings.gotoDefinition);
                contextMenu.removeMenuItem(Strings.rename);
            }
        });

        $(Omnisharp).on('omnisharpReady', onOmnisharpReady);
        $(Omnisharp).on('omnisharpQuit', onOmnisharpEnd);
        $(Omnisharp).on('omnisharpError', onOmnisharpEnd);
    });
});