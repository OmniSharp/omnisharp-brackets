/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';

    var NodeDomain = brackets.getModule('utils/NodeDomain'),
        ExtensionUtils = brackets.getModule('utils/ExtensionUtils'),
        ProjectManager = brackets.getModule('project/ProjectManager'),
        EditorManager = brackets.getModule('editor/EditorManager'),
        Omnisharp = new NodeDomain('omnisharp-brackets', ExtensionUtils.getModulePath(module, '../node/omnisharp'));

    var isRunning = false;

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
        if (!isRunning) {
            return;
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

        $(exports).triggerHandler('omnisharpError');
    }

    function onOmnisharpQuit() {
        console.info('Omnisharp has quit');
        isRunning = false;

        $(exports).triggerHandler('omnisharpQuit');
    }

    function onOmnisharpReady() {
        isRunning = true;

        $(exports).triggerHandler('omnisharpReady');
    }

    function onOmnisharpStarting() {
        $(exports).triggerHandler('omnisharpStarting');
    }

    function onActiveEditorChange(event, newActive) {
        if (newActive === null) {
            return;
        }

        var document = newActive.document;
        if (document === null) {
            return;
        }

        var language = document.getLanguage();
        if (language.getId() === 'csharp') {
            start();
        }
    }

    function kill() {
        Omnisharp.exec('stopOmnisharp');
    }

    function init() {
        $(Omnisharp).on('omnisharpError', onOmnisharpError);
        $(Omnisharp).on('omnisharpQuit', onOmnisharpQuit);
        $(Omnisharp).on('omnisharpReady', onOmnisharpReady);
        $(Omnisharp).on('omnisharpStarting', onOmnisharpStarting);
        $(EditorManager).on('activeEditorChange', onActiveEditorChange);
        $(ProjectManager).on('beforeAppClose', kill);
        $(ProjectManager).on('projectClose', kill);
        $(ProjectManager).on('projectOpen', kill);
    }

    exports.makeRequest = makeRequest;
    exports.start = start;
    exports.stop = stop;
    exports.init = init;
});