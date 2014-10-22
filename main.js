/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';

    var CommandManager = brackets.getModule('command/CommandManager'),
        Menus = brackets.getModule('command/Menus'),
        AppInit = brackets.getModule('utils/AppInit'),
        NodeDomain = brackets.getModule('utils/NodeDomain'),
        ExtensionUtils = brackets.getModule('utils/ExtensionUtils'),
        ProjectManager  = brackets.getModule("project/ProjectManager");

    var omnisharp = new NodeDomain('phoenix', ExtensionUtils.getModulePath(module, 'node/omnisharp'));

    function startOmnisharp() {
        alert(ProjectManager.getInitialProjectPath());
        var projectPath = ProjectManager.getInitialProjectPath();
        omnisharp.exec('startOmnisharp', projectPath)
            .done(function (port) {
                alert('omnisharp started on: ' + port);
            }).fail(function (err) {
                alert('fail: ' + err);
            });
    }
    
    function createMenu() {
        var menu = Menus.addMenu('Phoenix', 'mat-mcloughlin.phoenix.phoenixMenu');
        menu.addMenuItem('mat-mcloughlin.phoenix.startOmnisharp');
    }

    AppInit.appReady(function () {

        CommandManager.register('Start Omnisharp', 'mat-mcloughlin.phoenix.startOmnisharp', startOmnisharp);

        createMenu();
    });
    
});