/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';

    var CommandManager = brackets.getModule('command/CommandManager'),
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        Menus = brackets.getModule('command/Menus'),
        Omnisharp = require('modules/omnisharp'),
        AppInit = brackets.getModule('utils/AppInit'),
        CodeInspection = require('modules/codeInspection'),
        ContextMenu = require('modules/contextMenu'),
        Intellisense = require('modules/intellisense'),
        Toolbar = require('modules/toolbar'),
        OmniCommands = require('modules/omniCommands'),
        OmniHandlers = require('modules/omniHandlers'),
        OmniStrings = require('modules/omniStrings');

    function enable() {
        CommandManager.get(OmniCommands.START_OMNISHARP).setEnabled(false);
        CommandManager.get(OmniCommands.STOP_OMNISHARP).setEnabled(true);
        CommandManager.get(OmniCommands.FIX_USINGS).setEnabled(true);
        CommandManager.get(OmniCommands.FORMAT_DOCUMENT).setEnabled(true);
    }

    function disable() {
        CommandManager.get(OmniCommands.START_OMNISHARP).setEnabled(true);
        CommandManager.get(OmniCommands.STOP_OMNISHARP).setEnabled(false);
        CommandManager.get(OmniCommands.FIX_USINGS).setEnabled(false);
        CommandManager.get(OmniCommands.FORMAT_DOCUMENT).setEnabled(false);
    }

    function createMenu() {
        var menu = Menus.addMenu('Omnisharp', 'omnisharp.omnisharp-brackets.omnisharpMenu');

        menu.addMenuItem(OmniCommands.START_OMNISHARP);
        menu.addMenuItem(OmniCommands.STOP_OMNISHARP);
        menu.addMenuDivider();
        menu.addMenuItem(OmniCommands.FIX_USINGS);
        menu.addMenuItem(OmniCommands.FORMAT_DOCUMENT);
        menu.addMenuItem(OmniCommands.CODE_ACTION);

        disable();
    }

    AppInit.appReady(function () {
        ExtensionUtils.loadStyleSheet(module, 'styles/omnisharp.css');

        createMenu();

        $(Omnisharp).on('omnisharpReady', enable);
        $(Omnisharp).on('omnisharpQuit', disable);
        $(Omnisharp).on('omnisharpError', disable);

        ContextMenu.init();
        CodeInspection.init();
        Intellisense.init();
        Toolbar.init();
    });
});
