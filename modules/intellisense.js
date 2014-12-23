/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';
    
    var AppInit = brackets.getModule('utils/AppInit'),
        CodeHintManager = brackets.getModule('editor/CodeHintManager'),
        EditorManager = brackets.getModule("editor/EditorManager"),
        Helpers = require('modules/helpers'),
        Omnisharp = require('modules/omnisharp'),
        Snippets = require('modules/snippets');

    var tokenRegEx = /[A-Za-z0-9_]/;
    
    function getCursor() {
        var editor = EditorManager.getActiveEditor();
        return editor.getCursorPos();
    }
    
    function getToken(cursor) {
        var editor = EditorManager.getActiveEditor();
        var codeMirror = editor._codeMirror;
        return codeMirror.getTokenAt(cursor);
    }
    
    function getCompletion(completion) {
        // var completionText = completion.Snippet || completion.CompletionText;
        // return '<span data-completiontext="' +
        //     completionText +
        //     '" data-issnippet="' +
        //     (completion.Snippet !== false).toString() +
        //     '" >' +
        //     completion.DisplayText +
        //     ' : <strong>' +
        //     completion.ReturnType +
        //     '</strong></span>';

        var completionHtml = '<span data-completiontext="' + completion.CompletionText + '" >' + completion.CompletionText + ' <span style="color:gray">' + completion.DisplayText + '</span>';

        return completionHtml + '</span>';
    }
    
    function prepSnippet(completionText) {
        var snippet = completionText.replace(/\{\d\:/g, '{');
        return snippet.replace('$0', '${cursor}');
    }
    
    var intellisense = {
        hasHints: function (editor, implicitChar) {
            return !implicitChar || implicitChar.match(/[\w\.]/) !== null;
        },
        getHints: function (implicitChar) {
            var deferred = $.Deferred(),
                data = Helpers.buildRequest(),
                cursor = getCursor(),
                token = getToken(cursor).string,
                cleanToken = tokenRegEx.test(token) ? token : '';
            
            data.wordToComplete = cleanToken;
            data.wantReturnType = true;
            data.wantSnippet = true;
            
            Omnisharp.makeRequest('autocomplete', data, function (err, res) {
                if (err !== null) {
                    deferred.reject(err);
                } else {
                    
                    var completions = res.map(function (completion) {
                        return getCompletion(completion);
                    });

                    var results = {
                        hints: completions,
                        match: null,
                        selectInitial: true,
                        handleWideResults: true
                    };

                    deferred.resolve(results);
                }
            });
                
            return deferred;
        },
        insertHint: function (hint) {
            var editor = EditorManager.getActiveEditor(),
                data = $(hint).data(),
                completionText = data.completiontext,
                cursor = getCursor(),
                token = getToken(cursor),
                adjustment = tokenRegEx.test(token.string) ? 0 : 1;
            
            
            var start = {
                line: cursor.line,
                ch: token.start + adjustment
            };

            var end = {
                line: cursor.line,
                ch: cursor.ch + adjustment
            };

            // if (data.issnippet) {
            //     var snippet = prepSnippet(completionText);
            //     Snippets.install({ from: start, to: end }, snippet);
            // } else {
            editor._codeMirror.replaceRange(completionText, start, end);
            // }
    
            return false;
        }
    };

    function onOmnisharpReady() {
        CodeHintManager.registerHintProvider(intellisense, ['csharp'], 0);
    }

    function onOmnisharpEnd() {
        CodeHintManager._removeHintProvider(intellisense, ['csharp']);
    }
    
    function init() {
        $(Omnisharp).on('omnisharpReady', onOmnisharpReady);
        $(Omnisharp).on('omnisharpQuit', onOmnisharpEnd);
        $(Omnisharp).on('omnisharpError', onOmnisharpEnd);
    }
    
    exports.init = init;
});