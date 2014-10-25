/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';
    
    var CommandManager = brackets.getModule('command/CommandManager'),
        Menus = brackets.getModule('command/Menus'),
        AppInit = brackets.getModule('utils/AppInit'),
        ProjectManager = brackets.getModule('project/ProjectManager');
    
    var globals = require('modules/globals'),
        codeInspection = require('modules/codeInspection');

    $(globals.omnisharp).on('omnisharpError', function (data) {
        alert(data);
        globals.omnisharpRunning = false;
    });
    
    $(globals.omnisharp).on('omnisharpExited', function () {
        alert('Omnisharp is stopped');
        globals.omnisharpRunning = false;
    });
    
    $(globals.omnisharp).on('omnisharpReady', function () {
        alert('Omnisharp Ready');
        globals.omnisharpRunning = true;
    });
    
    function startOmnisharp() {
        if (globals.omnisharpRunning) {
            alert('Omnisharp is already running.');
            return;
        }
        
        var projectPath = ProjectManager.getInitialProjectPath();
        globals.omnisharp.exec('startOmnisharp', projectPath)
            .done(function (port) {
            }).fail(function (err) {
                alert('fail: ' + err);
            });
    }
    
    function stopOmnisharp() {
        if (!globals.omnisharpRunning) {
            alert('Omnisharp is not currently running');
        }
        
        globals.omnisharp.exec('stopOmnisharp');
    }
        
    function createMenu() {
        var menu = Menus.addMenu('Phoenix', 'mat-mcloughlin.phoenix.phoenixMenu');
        menu.addMenuItem('mat-mcloughlin.phoenix.startOmnisharp');
        menu.addMenuItem('mat-mcloughlin.phoenix.stopOmnisharp');
    }

    AppInit.appReady(function () {
        CommandManager.register('Start Omnisharp', 'mat-mcloughlin.phoenix.startOmnisharp', startOmnisharp);
        CommandManager.register('Stop Omnisharp', 'mat-mcloughlin.phoenix.stopOmnisharp', stopOmnisharp);
        
        createMenu();
        
        codeInspection.init();
    });
});