/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';
    
    var CodeHintManager = brackets.getModule('editor/CodeHintManager'),
        EditorManager = brackets.getModule("editor/EditorManager"),
        Helpers = require('modules/helpers'),
        Omnisharp = require('modules/omnisharp');

    var intellisense = {
        hasHints: function (editor, implicitChar) {
            if (implicitChar === ' ' || implicitChar === '.') {
                return true;
            }
            
            return false;
        },
        getHints: function (implicitChar) {
            var deferred = $.Deferred();
            
            var data = Helpers.buildRequest();
            data.wordToComplete = '';
            
            Omnisharp.makeRequest('autocomplete', data, function (err, data) {
                if (err !== null) {
                    deferred.reject();
                }
                
                var completions = data.map(function (completion) {
                    return completion.CompletionText;
                });
                var something = {
                    hints: completions,
                    match: null,
                    selectInitial: true,
                    handleWideResults: true
                };
                
                deferred.resolve(something);
            });
                
            return deferred.promise();
        },
        insertHint: function (hint) {
        }
    };
    
    return {
        init: function () {
            CodeHintManager.registerHintProvider(intellisense, ['csharp'], 0);
        }
    };
});