/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';

    var NodeDomain = brackets.getModule('utils/NodeDomain'),
        ExtensionUtils = brackets.getModule('utils/ExtensionUtils'),
        ProjectManager = brackets.getModule('project/ProjectManager'),
        EditorManager = brackets.getModule('editor/EditorManager'),
        DocumentManager = brackets.getModule('document/DocumentManager'),
        Omnisharp = new NodeDomain('omnisharp-brackets', ExtensionUtils.getModulePath(module, '../node/omnisharp'));

    var isRunning = false;

    function buildRequest(additionalParameters) {
        var document = DocumentManager.getCurrentDocument(),
            filename = document.file._path,
            text = document.getText(),
            editor = EditorManager.getActiveEditor(),
            cursorPos = editor.getCursorPos(true, "start"),
            request = {
                line: cursorPos.line + 1,
                column: cursorPos.ch + 1,
                buffer: text,
                filename: filename
            };

        $.extend(request, additionalParameters || {});

        return request;
    }

    function start() {
        if (isRunning) {
            return;
        }

        isRunning = true;

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

    function makeRequestDeferred(service, request) {
        var extendedRequest = buildRequest(request),
            deferred = new $.Deferred();

        Omnisharp.exec('callService', service, extendedRequest)
            .done(function (res) {
                deferred.resolve(res);
            })
            .fail(function (err) {
                deferred.reject(err);
            });

        return deferred;
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
        Omnisharp.on('omnisharpError', onOmnisharpError);
        Omnisharp.on('omnisharpQuit', onOmnisharpQuit);
        Omnisharp.on('omnisharpReady', onOmnisharpReady);
        Omnisharp.on('omnisharpStarting', onOmnisharpStarting);
        EditorManager.on('activeEditorChange', onActiveEditorChange);
        ProjectManager.on('beforeAppClose', kill);
        ProjectManager.on('projectClose', kill);
        ProjectManager.on('projectOpen', kill);
    }

    exports.makeRequest = makeRequest;
    exports.start = start;
    exports.stop = stop;
    exports.init = init;

    exports.autoComplete = function (request) {
        return makeRequestDeferred('autocomplete', request);
    };

    exports.rename = function (request) {
        return makeRequestDeferred('rename', request);
    };

    exports.findSymbols = function (request) {
        return makeRequestDeferred('findsymbols', request);
    };

    exports.gotoDefinition = function (request) {
        return makeRequestDeferred('gotoDefinition', request);
    };

    exports.rename = function (request) {
        return makeRequestDeferred('rename', request);
    };
});
