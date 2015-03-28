/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window, Mustache */

define(function (require, exports, module) {
    'use strict';

    var CodeHintManager = brackets.getModule('editor/CodeHintManager'),
        EditorManager = brackets.getModule('editor/EditorManager'),
        CodeMirror = brackets.getModule('thirdparty/CodeMirror2/lib/codemirror'),
        Omnisharp = require('modules/omnisharp'),
        Snippets = require('modules/snippets'),
        CompletionTemplate = require("text!htmlContent/completion-template.html");

    var isIdentifierRegEx = /^[a-zA-Z._(]+$/,
        getHintsRegEx = /^[a-zA-Z0-9._(]+$/,
        cleanTokenRegEx = /^[a-zA-Z0-9_]+$/,
        mode = CodeMirror.getMode(CodeMirror.defaults, 'text/x-csharp'),
        useSnippet = true,
        codeMirror = CodeMirror();

    function isIdentifier(key) {
        return key.match(isIdentifierRegEx) !== null;
    }

    function hintableKey(key) {
        return key === null || key === '.' || isIdentifier(key);
    }

    function hintable(token) {
        switch (token.type) {
        case 'comment':
        case 'number':
        case 'regexp':
        case 'string':
        case 'def':
            return false;
        default:
            return true;
        }
    }

    function getCursor() {
        var editor = EditorManager.getActiveEditor();
        return editor.getCursorPos();
    }

    function getToken(cursor) {
        var editor = EditorManager.getActiveEditor(),
            codeMirror = editor._codeMirror;

        return codeMirror.getTokenAt(cursor)
    }

    function cleanToken(token) {
        if (token.string === '.') {
            return '';
        }

        return token.string.replace(/\s+$/, '');
    }

    function getCompletion(completion) {
        completion.HasReturnType = completion.ReturnType !== null;
        return Mustache.render(CompletionTemplate, completion);
    }

    var intellisense = {
        hasHints: function (editor, key) {
            return hintableKey(key);
        },
        getHints: function (key) {
            var cursor = getCursor(),
                token = getToken(cursor);

            if (token && hintableKey(key) && hintable(token)) {
                if (CodeHintManager.isOpen() && token.type === null && token.string !== '.') {
                    return false;
                }

                var deferred = $.Deferred(),
                    request = {
                        wordToComplete: cleanToken(token),
                        wantReturnType: true,
                        wantKind: true
                    };

                Omnisharp.autoComplete(request)
                    .done(function (res) {
                        var completions = res.map(function (completion) {
                            return getCompletion(completion);
                        });

                        deferred.resolve({
                            hints: completions,
                            match: null,
                            selectInitial: true,
                            handleWideResults: true
                        });
                    })
                    .fail(deferred.reject);

                return deferred;
            }

            return null;
        },
        insertHint: function (hint) {
            var editor = EditorManager.getActiveEditor(),
                data = $($(hint)[2]).data(),
                cursor = getCursor(),
                token = getToken(cursor),
                adjustment = token.string === '.' ? 1 : 0;

            editor._codeMirror.replaceRange(data.completiontext, {
                line: cursor.line,
                ch: token.start + adjustment
            }, {
                line: cursor.line,
                ch: cursor.ch + adjustment
            });

            return false;
        },
        insertHintOnTab: true
    };

    function omnisharpReady() {
        CodeHintManager.registerHintProvider(intellisense, ['csharp'], 0);
    }

    function omnisharpQuit() {
        CodeHintManager._removeHintProvider(intellisense, ['csharp']);
    }

    exports.init = function () {
        $(Omnisharp).on('omnisharpReady', omnisharpReady);
        $(Omnisharp).on('omnisharpQuit', omnisharpQuit);
        $(Omnisharp).on('omnisharpError', omnisharpQuit);
    };
});
