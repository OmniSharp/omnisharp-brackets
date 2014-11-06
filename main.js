/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';

    var CommandManager = brackets.getModule('command/CommandManager'),
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        Menus = brackets.getModule('command/Menus'),
        AppInit = brackets.getModule('utils/AppInit'),
        ProjectManager = brackets.getModule('project/ProjectManager'),
        Strings = require('strings'),
        Omnisharp = require('modules/omnisharp'),
        CodeInspection = require('modules/codeInspection'),
        ContextMenu = require('modules/contextMenu'),
        CodeFormat = require('modules/codeFormat'),
        Intellisense = require('modules/intellisense'),
        Toolbar = require('modules/toolbar'),
        Snippets = require('modules/snippets');

    function createMenu() {
        var menu = Menus.addMenu('Omnisharp', Strings.omnisharpMenu);
        menu.addMenuItem('mat-mcloughlin.omnisharp.formatDocument');
        menu.addMenuItem('mat-mcloughlin.omnisharp.fixUsings');
    }
    
    AppInit.appReady(function () {
        ExtensionUtils.loadStyleSheet(module, "omnisharp.css");

        
        CommandManager.register('Format Document', 'mat-mcloughlin.omnisharp.formatDocument', CodeFormat.formatDocument);
        CommandManager.register('Fix Usings', 'mat-mcloughlin.omnisharp.fixUsings', CodeFormat.fixUsings);

        createMenu();

        Intellisense.init();
    });
});