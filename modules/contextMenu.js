/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';

    var Omnisharp = require('modules/omnisharp'),
        Menus = brackets.getModule('command/Menus'),
        CommandManager = brackets.getModule('command/CommandManager'),
        Helpers = require('modules/helpers'),
        OmniCommands = require('modules/omniCommands'),
        PreferencesManager = brackets.getModule('preferences/PreferencesManager'),
        prefs = PreferencesManager.getExtensionPrefs('omnisharp');

    var contextMenu = Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU);

    prefs.definePreference('rename', 'string', 'alt-r');
    prefs.definePreference('goToDefinition', 'string', 'alt-F12');

    function enable() {
        CommandManager.get(OmniCommands.GO_TO_DEFINITION).setEnabled(true);
        CommandManager.get(OmniCommands.RENAME).setEnabled(true);
        CommandManager.get(OmniCommands.FIX_CODE_ISSUE).setEnabled(true);
    }

    function disable() {
        CommandManager.get(OmniCommands.GO_TO_DEFINITION).setEnabled(false);
        CommandManager.get(OmniCommands.RENAME).setEnabled(false);
        CommandManager.get(OmniCommands.FIX_CODE_ISSUE).setEnabled(false);
    }

    function beforeContextMenuOpen() {
        if (Helpers.isCSharp()) {
            contextMenu.addMenuItem(OmniCommands.GO_TO_DEFINITION, prefs.get('goToDefinition'));
            contextMenu.addMenuItem(OmniCommands.RENAME, prefs.get('rename'));
            contextMenu.addMenuItem(OmniCommands.FIX_CODE_ISSUE);
        } else {
            contextMenu.removeMenuItem(OmniCommands.GO_TO_DEFINITION);
            contextMenu.removeMenuItem(OmniCommands.RENAME);
            contextMenu.removeMenuItem(OmniCommands.FIX_CODE_ISSUE);
        }
    }

    function init() {
        disable();

        contextMenu.on("beforeContextMenuOpen", beforeContextMenuOpen);

        $(Omnisharp).on('omnisharpReady', enable);
        $(Omnisharp).on('omnisharpQuit', disable);
        $(Omnisharp).on('omnisharpError', disable);
    }

    exports.init = init;
});
