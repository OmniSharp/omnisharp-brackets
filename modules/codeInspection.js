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
        var token = getToken({ line: problem.Line - 1, ch: problem.Column - 1 }),
            start = { line: problem.Line - 1, ch: problem.Column - 1 },
            end = { line: problem.EndLine === -1 ? problem.Line - 1 : problem.EndLine - 1, ch: problem.EndColumn === -1 ? problem.Column : problem.EndColumn - 1 };

        codeMirror.markText(start, end, { className: 'omnisharp-' + type });
    }

    function processProblem(problem) {
        setMark(problem, problem.LogLevel.toLowerCase());

        return {
            pos: { line: problem.Line - 1, ch: problem.Column - 1},
            message: problem.Text,
            type: getLogLevel(problem.LogLevel)
        };
    }

    function scanFileAsync(text, fullPath) {
        editor = EditorManager.getActiveEditor();
        codeMirror = editor._codeMirror;
        clearMarks();

        var deferred = $.Deferred();

        Omnisharp.codeCheck()
            .done(function (res) {
                var result = {
                    errors: []
                };

                if (res.Errors !== undefined) {
                    result.errors = res.Errors.map(function (error) {
                        return processProblem(error);
                    });
                }

                if (res.QuickFixes !== undefined) {
                    result.errors = res.QuickFixes.map(function (quickFix) {
                        return processProblem(quickFix);
                    });
                }

                deferred.resolve(result);
            })
            .fail(function () {
                deferred.resolve({ errors: [] });
            });

        return deferred.promise();
    }

    exports.init = function () {
        CodeInspection.register('csharp', {
            name: 'Omnisharp',
            scanFileAsync: scanFileAsync
        });
    };
});
