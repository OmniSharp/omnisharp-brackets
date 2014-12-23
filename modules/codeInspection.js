/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';

    var CodeInspection = brackets.getModule("language/CodeInspection"),
        Helpers = require('modules/helpers'),
        EditorManager = brackets.getModule("editor/EditorManager"),
        Omnisharp = require('modules/omnisharp');

    var editor,
        codeMirror,
        isRegistered = false,
        isRunning = false;

    function getToken(cursor) {
        return codeMirror.getTokenAt(cursor);
    }

    function clearMarks() {
        codeMirror.doc.getAllMarks().forEach(function (mark) {
            mark.clear();
        });
    }

    function getLogLevel(logLevel) {
        return logLevel === 'Error' ? CodeInspection.Type.ERROR : CodeInspection.Type.WARNING;
    }

    function setMark(problem, type) {
        var token = getToken({ line: problem.Line - 1, ch: problem.Column - 1 });
        var start = { line: problem.Line - 1, ch: problem.Column - 1 };
        var end = { line: problem.EndLine === -1 ? problem.Line - 1 : problem.EndLine - 1, ch: problem.EndColumn === -1 ? problem.Column : problem.EndColumn - 1 };
        codeMirror.markText(start, end, { className: 'omnisharp-' + type });
    }

    function processProblem(problem) {
        if (problem.LogLevel === 'Error' || problem.LogLevel === 'Warning') {
            setMark(problem, problem.LogLevel.toLowerCase());
        }

        return {
            pos: { line: problem.Line - 1, ch: problem.Column - 1},
            message: problem.Text,
            type: getLogLevel(problem.LogLevel)
        };
    }

    function validateFile(text, fullPath) {
        editor = EditorManager.getActiveEditor();
        codeMirror = editor._codeMirror;
        clearMarks();

        var deferred = $.Deferred();

        if (!isRunning) {
            deferred.resolve({ errors: [] });
            return deferred;
        }

        var data = Helpers.buildRequest();
        
        Omnisharp.makeRequest('codecheck', data, function (err, data) {
            if (err !== null) {
                deferred.reject();
                return deferred;
            }

            var result = {
                errors: []
            };

            if (data.Errors !== undefined) {
                result.errors = data.Errors.map(function (error) {
                    return processProblem(error);
                });
            }

            if (data.QuickFixes !== undefined) {
                result.errors = data.QuickFixes.map(function (quickFix) {
                    return processProblem(quickFix);
                });
            }

            deferred.resolve(result);
        });

        return deferred.promise();
    }

    function onOmnisharpReady() {
        isRunning = true;

        if (!isRegistered) {
            CodeInspection.register('csharp', {
                name: 'Omnisharp',
                scanFileAsync: validateFile
            });

            isRegistered = true;
        }
    }

    function onOmnisharpEnd() {
        isRunning = false;
    }

    function init() {
        $(Omnisharp).on('omnisharpReady', onOmnisharpReady);
        $(Omnisharp).on('omnisharpQuit', onOmnisharpEnd);
        $(Omnisharp).on('omnisharpError', onOmnisharpEnd);
    }

    exports.init = init;
});
