/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';

    var AppInit = brackets.getModule('utils/AppInit'),
        NodeDomain = brackets.getModule('utils/NodeDomain'),
        ExtensionUtils = brackets.getModule('utils/ExtensionUtils'),
        ProjectManager = brackets.getModule('project/ProjectManager'),
        EditorManager = brackets.getModule('editor/EditorManager'),
        Dialogs = brackets.getModule("widgets/Dialogs"),
        DefaultDialogs  = brackets.getModule("widgets/DefaultDialogs"),
        Omnisharp = new NodeDomain('omnisharp-brackets', ExtensionUtils.getModulePath(module, '../node/omnisharp'));
    
    var isRunning = false,
        dialog;
    
    function start() {
        if (isRunning) {
            return;
        }

        var projectPath = ProjectManager.getInitialProjectPath();
        Omnisharp.exec('startOmnisharp', projectPath).fail(function (err) {
            console.error('fail: ' + err);
        });
    }
    
    function stop() {
        if (isRunning) {
            console.info('Omnisharp is not currently running');
        }

        Omnisharp.exec('stopOmnisharp');
    }
    
    function makeRequest(service, data, callback) {
        Omnisharp.exec('callService', service, data)
            .done(function (body) {
                callback(null, body);
            })
            .fail(function (err) {
                callback(err, null);
            });
    }
    
    function onOmnisharpError(data) {
        console.error(data);
        isRunning = false;
    }
    
    function onOmnisharpExited() {
        console.info('Omnisharp has stopped');
        isRunning = false;
    }
    
    function onOmnisharpReady() {
        dialog.close();
        isRunning = true;
        $(exports).triggerHandler('omnisharpReady');
    }
    
    function onOmnisharpStarting() {
        dialog = Dialogs.showModalDialog(
            DefaultDialogs.DIALOG_ID_EXT_CHANGED,
            '',
            'Launching Omnisharp',
            [],
            true
        );
    }
    
    function onActiveEditorChange(event, newActive, oldActive) {
        var document = newActive.document;
        if (document === null) {
            return;
        }

        var language = document.getLanguage();
        if (language.getId() === 'csharp') {
            start();
        }
    }
    
    function beforeAppClose() {
        Omnisharp.exec('stopOmnisharp');
    }
    
    AppInit.appReady(function () {
        $(Omnisharp).on('omnisharpError', onOmnisharpError);
        $(Omnisharp).on('omnisharpExited', onOmnisharpExited);
        $(Omnisharp).on('omnisharpReady', onOmnisharpReady);
        $(Omnisharp).on('omnisharpStarting', onOmnisharpStarting);
        $(EditorManager).on('activeEditorChange', onActiveEditorChange);
        $(ProjectManager).on("beforeAppClose", beforeAppClose);
    });

    exports.makeRequest = makeRequest;
});