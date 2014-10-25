/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';
    
    var CodeInspection = brackets.getModule("language/CodeInspection");
    
    var globals = require('modules/globals');
    
    function validateFile(text, fullPath) {
        var deferred = $.Deferred();

        var data = {
            line: 1,
            column: 1,
            buffer: text,
            filename: fullPath
        };

        globals.omnisharp.exec('callService', /*'codecheck'*/ 'syntaxerrors', data)
            .done(function (body) {
                var errors = body.Errors.map(function (error) {
                    return {
                        pos: { line: error.Line - 1, ch: error.Column },
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
    
    return {
        init: function () {
            CodeInspection.register('csharp', {
                name: 'omnisharp',
                scanFileAsync: validateFile
            });
        }
    };
});