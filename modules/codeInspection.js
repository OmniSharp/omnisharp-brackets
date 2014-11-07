/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';

    var AppInit = brackets.getModule('utils/AppInit'),
        CodeInspection = brackets.getModule("language/CodeInspection"),
        Helpers = require('modules/helpers'),
        Omnisharp = require('modules/omnisharp');

    function getLogLevel(logLevel) {
        return logLevel === 'Error' ? CodeInspection.Type.ERROR : CodeInspection.Type.WARNING;
    }
    
    function validateFile(text, fullPath) {
        var deferred = $.Deferred();

        var data = Helpers.buildRequest();

        Omnisharp.makeRequest('codecheck', data, function (err, data) {
            if (err !== null) {
                deferred.reject();
            }

            var result = {
                errors: []
            };

            if (data.Errors !== undefined) {
                result.errors = data.Errors.map(function (error) {
                    return {
                        pos: { line: error.Line - 1, ch: error.Column },
                        message: error.Message,
                        type: getLogLevel(error.LogLevel)
                    };
                });
            }

            if (data.QuickFixes !== undefined) {
                result.errors = data.QuickFixes.map(function (quickFix) {
                    return {
                        pos: { line: quickFix.Line - 1, ch: quickFix.Column },
                        message: quickFix.Text,
                        type: getLogLevel(quickFix.LogLevel)
                    };
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