/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';
    
    var CodeHintManager = brackets.getModule('editor/CodeHintManager'),
        EditorManager = brackets.getModule("editor/EditorManager"),
        Helpers = require('modules/helpers'),
        Omnisharp = require('modules/omnisharp');

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
    
//    function getArguments(snippet) {
//        if (snippet === null) {
//            return [];
//        }
//        var argumentSnippets = snippet.match(argumentsRegEx);
//        if (argumentSnippets === null) {
//            return [];
//        }
//        
//        return argumentSnippets.map(function (argumentSnippet) {
//            var argumentSnippetSplit = argumentSnippet.split(':');
//            return {
//                number: argumentSnippetSplit[0].substring(2),
//                displayText: argumentSnippetSplit[1].substring(0, argumentSnippetSplit[1].length - 1),
//                snippet: argumentSnippet
//            };
//        });
//    }
    
//    function getPreviousToken(cursor) {
//        var editor = EditorManager.getActiveEditor(),
//            token = getToken(cursor),
//            prev = token,
//            doc = editor.document;
//
//        do {
//            if (prev.start < cursor.ch) {
//                cursor.ch = prev.start;
//            } else if (prev.start > 0) {
//                cursor.ch = prev.start - 1;
//            } else if (cursor.line > 0) {
//                cursor.ch = doc.getLine(cursor.line - 1).length;
//                cursor.line--;
//            } else {
//                break;
//            }
//            prev = getToken(cursor);
//        } while (!tokenRegEx.test(prev.string));
//        
//        return prev;
//    }
    
//    function findPreviousDot() {
//        var cursor = getCursor(),
//            token = getToken(cursor);
//        
//        if (token && token.string === ".") {
//            return cursor;
//        } else {
//            token = getPreviousToken(cursor);
//            if (token && token.string === ".") {
//                return cursor;
//            }
//        }
//        return undefined;
//    }
    
    function getCompletion(completion) {
        return '<span data-completiontext="' +
            completion.CompletionText +
            '">' +
            completion.DisplayText +
            ' : <strong>' +
            completion.ReturnType +
            '</strong></span>';
        
//        var display = completion.CompletionText;
//        display += '\t';
//        display += completion.DisplayText;
//        
//        var params = /\(|\)/.split(completion.DisplayText);
//        var paramsSplit = [];
//        
//        if (params.length === 3) {
//            if (params[1] !== '') {
//                paramsSplit = params[1].split(',');
//            }
//        }
//        
//        var completionText = completion.CompletionText;
//        
//        if (/^T\W/.match(completionText)) {
//        }
                
    }
    
    var intellisense = {
        hasHints: function (editor, implicitChar) {
            if (implicitChar === ' ' || implicitChar === null || implicitChar === '.') {
                return true;
            }
            
            return false;
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
                completionText = $(hint).data().completiontext,
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

            editor._codeMirror.replaceRange(completionText, start, end);
    
            return false;
        }
    };
    
    return {
        init: function () {
            CodeHintManager.registerHintProvider(intellisense, ['csharp'], 0);
        }
    };
});