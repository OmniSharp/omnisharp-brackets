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
        
        menu.addMenuItem(Strings.startOmnisharp);
        menu.addMenuItem(Strings.stopOmnisharp);
        menu.addMenuDivider();
        menu.addMenuItem(Strings.fixUsings);
        menu.addMenuItem(Strings.formatDocument);

        CommandManager.get(Strings.startOmnisharp).setEnabled(true);
        CommandManager.get(Strings.stopOmnisharp).setEnabled(false);
        CommandManager.get(Strings.fixUsings).setEnabled(false);
        CommandManager.get(Strings.formatDocument).setEnabled(false);
    }

    function onOmnisharpReady() {
        CommandManager.get(Strings.startOmnisharp).setEnabled(false);
        CommandManager.get(Strings.stopOmnisharp).setEnabled(true);
        CommandManager.get(Strings.fixUsings).setEnabled(true);
        CommandManager.get(Strings.formatDocument).setEnabled(true);
    }

    function onOmnisharpEnd() {
        CommandManager.get(Strings.startOmnisharp).setEnabled(true);
        CommandManager.get(Strings.stopOmnisharp).setEnabled(false);
        CommandManager.get(Strings.fixUsings).setEnabled(false);
        CommandManager.get(Strings.formatDocument).setEnabled(false);
    }
    
    AppInit.appReady(function () {
        ExtensionUtils.loadStyleSheet(module, "omnisharp.css");

        CommandManager.register('Format Document', Strings.formatDocument, CodeFormat.formatDocument);
        CommandManager.register('Fix Usings', Strings.fixUsings, CodeFormat.fixUsings);
        CommandManager.register('Start Omnisharp', Strings.startOmnisharp, Omnisharp.start);
        CommandManager.register('Stop Omnisharp', Strings.stopOmnisharp, Omnisharp.stop);

        createMenu();
        $(Omnisharp).on('omnisharpReady', onOmnisharpReady);
        $(Omnisharp).on('omnisharpQuit', onOmnisharpEnd);
        $(Omnisharp).on('omnisharpError', onOmnisharpEnd);
    });
});