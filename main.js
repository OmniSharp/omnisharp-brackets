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
        ContextMenu = require('modules/contextMenu'),
        CodeFormat = require('modules/codeFormat'),
        Intellisense = require('modules/intellisense');

    function createMenu() {
        var menu = Menus.addMenu('Omnisharp', Strings.omnisharpMenu);
        menu.addMenuItem('mat-mcloughlin.omnisharp-brackets.formatDocument');
        menu.addMenuItem('mat-mcloughlin.omnisharp-brackets.fixUsings');
    }

    AppInit.appReady(function () {
        CommandManager.register('Format Document', 'mat-mcloughlin.omnisharp-brackets.formatDocument', CodeFormat.formatDocument);
        CommandManager.register('Fix Usings', 'mat-mcloughlin.omnisharp-brackets.fixUsings', CodeFormat.fixUsings);

        createMenu();

        Intellisense.init();
    });
});