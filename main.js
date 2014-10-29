/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';

    var CommandManager = brackets.getModule('command/CommandManager'),
        Menus = brackets.getModule('command/Menus'),
        AppInit = brackets.getModule('utils/AppInit'),
        ProjectManager = brackets.getModule('project/ProjectManager'),
        Strings = require('strings'),
        Omnisharp = require('modules/omnisharp'),
        CodeInspection = require('modules/codeInspection'),
        ContextMenu = require('modules/contextMenu');

    function createMenu() {
        var menu = Menus.addMenu('Omnisharp', Strings.omnisharpMenu);
        menu.addMenuItem(Strings.startOmnisharp);
        menu.addMenuItem(Strings.stopOmnisharp);
    }

    AppInit.appReady(function () {
        CommandManager.register('Start Omnisharp', Strings.startOmnisharp, Omnisharp.start);
        CommandManager.register('Stop Omnisharp', Strings.stopOmnisharp, Omnisharp.stop);

        createMenu();

        CodeInspection.init();
        Omnisharp.init();
        ContextMenu.init();
    });
});