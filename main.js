/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';

    var CommandManager = brackets.getModule('command/CommandManager'),
        Menus = brackets.getModule('command/Menus'),
        AppInit = brackets.getModule('utils/AppInit'),
        NodeDomain = brackets.getModule('utils/NodeDomain'),
        ExtensionUtils = brackets.getModule('utils/ExtensionUtils'),
        ProjectManager = brackets.getModule('project/ProjectManager'),
        CodeInspection = brackets.getModule("language/CodeInspection");

    var omnisharp = new NodeDomain('phoenix', ExtensionUtils.getModulePath(module, 'node/omnisharp'));
    
    $(omnisharp).on('omnisharpError', function (data) {
        alert(data);
    });
    
    function startOmnisharp() {
        var projectPath = ProjectManager.getInitialProjectPath();
        omnisharp.exec('startOmnisharp', projectPath)
            .done(function (port) {
                alert('omnisharp started on: ' + port);
            }).fail(function (err) {
                alert('fail: ' + err);
            });
    }
    
    function validateFile(text, fullPath) {
        var deferred = $.Deferred();
        
        var data = {
            line: 1,
            column: 1,
            buffer: text,
            filename: fullPath
        };
        
        omnisharp.exec('callService', 'syntaxerrors', data)
            .done(function (body) {
                var errors = body.Errors.map(function (error) {
                    return {
                        pos: { line: error.Line, ch: error.Column },
                        message: error.Message,
                        type: CodeInspection.Type.error
                    };
                });
                deferred.resolve({ errors: errors });
            }).fail(function (err) {
                alert(err);
                deferred.reject();
            });
        
        return deferred.promise();
    }
    
    function createMenu() {
        var menu = Menus.addMenu('Phoenix', 'mat-mcloughlin.phoenix.phoenixMenu');
        menu.addMenuItem('mat-mcloughlin.phoenix.startOmnisharp');
        menu.addMenuItem('mat-mcloughlin.phoenix.checkFile');
    }

    AppInit.appReady(function () {
        CommandManager.register('Start Omnisharp', 'mat-mcloughlin.phoenix.startOmnisharp', startOmnisharp);
        CommandManager.register('Check file', 'mat-mcloughlin.phoenix.checkFile', validateFile);
        createMenu();
        
        CodeInspection.register('csharp', {
            name: 'omnisharp',
            scanFileAsync: validateFile
        });
    });
});