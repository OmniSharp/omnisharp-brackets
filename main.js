/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';

    var CommandManager = brackets.getModule('command/CommandManager'),
        Menus = brackets.getModule('command/Menus'),
        AppInit = brackets.getModule('utils/AppInit'),
        ProjectManager = brackets.getModule('project/ProjectManager');

    var omnisharp = require('modules/omnisharp'),
        codeInspection = require('modules/codeInspection'),
        contextMenu = require('modules/contextMenu');

    function createMenu() {
        var menu = Menus.addMenu('Phoenix', 'mat-mcloughlin.phoenix.phoenixMenu');
        menu.addMenuItem('mat-mcloughlin.phoenix.startOmnisharp');
        menu.addMenuItem('mat-mcloughlin.phoenix.stopOmnisharp');
    }

    AppInit.appReady(function () {
        CommandManager.register('Start Omnisharp', 'mat-mcloughlin.phoenix.startOmnisharp', omnisharp.start);
        CommandManager.register('Stop Omnisharp', 'mat-mcloughlin.phoenix.stopOmnisharp', omnisharp.stop);

        createMenu();

        codeInspection.init();
        omnisharp.init();
        contextMenu.init();
    });
});
