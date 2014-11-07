/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';

    var AppInit = brackets.getModule('utils/AppInit'),
        CodeInspection = brackets.getModule("language/CodeInspection"),
        Helpers = require('modules/helpers'),
        EditorManager = brackets.getModule("editor/EditorManager"),
        Omnisharp = require('modules/omnisharp');

    var editor,
        codeMirror;

    function getToken(cursor) {
        return codeMirror.getTokenAt(cursor);
    }
    
    function clearMarks() {
        codeMirror.doc.getAllMarks().forEach(function (mark) {
            mark.clear();
        })
    }

    function getLogLevel(logLevel) {
        return logLevel === 'Error' ? CodeInspection.Type.ERROR : CodeInspection.Type.WARNING;
    }
    
    function setMark(problem) {
        var token = getToken({ line: problem.Line -1, ch: problem.Column - 1 });
        codeMirror.markText(
            { line: problem.Line - 1, ch: token.start },
            { line: problem.Line - 1, ch: token.end },
            { className: 'omnisharp-error' }
        );
    }

    function processProblem(problem) {
        if (problem.LogLevel === 'Error') {
            setMark(problem);
        }
                    
        return {
            pos: { line: problem.Line - 1, ch: problem.Column },
            message: problem.Text,
            type: getLogLevel(problem.LogLevel)
        };
    }
    
    function validateFile(text, fullPath) {
        editor = EditorManager.getActiveEditor();
        codeMirror = editor._codeMirror;
        clearMarks();
        
        var deferred = $.Deferred(),
            data = Helpers.buildRequest();

        Omnisharp.makeRequest('codecheck', data, function (err, data) {
            if (err !== null) {
                deferred.reject();
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
        CodeInspection.register('csharp', {
            name: 'omnisharp',
            scanFileAsync: validateFile
        });
    }

    AppInit.appReady(function () {
        $(Omnisharp).on('omnisharpReady', onOmnisharpReady);
    });
});