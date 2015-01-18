/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window, CodeMirror */

define(function (require, exports, module) {
    'use strict';

    var AppInit = brackets.getModule('utils/AppInit'),
        CodeHintManager = brackets.getModule('editor/CodeHintManager'),
        EditorManager = brackets.getModule("editor/EditorManager"),
        Helpers = require('modules/helpers'),
        Omnisharp = require('modules/omnisharp'),
        Snippets = require('modules/snippets');

    var isIdentifierRegEx = /^[a-zA-Z._(]+$/,
        getHintsRegEx = /^[a-zA-Z0-9._(]+$/,
        cleanTokenRegEx = /^[a-zA-Z0-9_]+$/,
        showOnDot = true,
        mode = CodeMirror.getMode(CodeMirror.defaults, 'text/x-csharp');

    function isIdentifier(key) {
        return key.match(isIdentifierRegEx) !== null;
    }

    function hintableKey(key) {
        return (key === null || (showOnDot && key === '.') || isIdentifier(key));
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

    function highlightLine(line) {
        var stream = new CodeMirror.StringStream(line),
            result,
            node = document.createElement('span'),
            state = CodeMirror.startState(mode);

        while (!stream.eol()) {
            var style = mode.token(stream, state);

            if (style) {
                var sp = node.appendChild(document.createElement('span'));
                sp.className = 'cm-' + style.replace(/ +/g, ' cm-');
                sp.appendChild(document.createTextNode(stream.current()));
            } else {
                node.appendChild(document.createTextNode(stream.current()));
            }
            stream.start = stream.pos;
        }

        return node.innerHTML;
    }

    function getCursor() {
        var editor = EditorManager.getActiveEditor();
        return editor.getCursorPos();
    }

    function getToken(cursor) {
        var editor = EditorManager.getActiveEditor();
        var codeMirror = editor._codeMirror;
        return codeMirror.getTokenAt(cursor);
    }

    function cleanToken(token) {
        if (token.string === '.') {
            return '';
        }
        return token.string;
    }

    function getCompletion(completion) {
        var completionHtml = '<span data-completiontext="' + completion.CompletionText + '" >' + completion.DisplayText + '</span>';

        return completionHtml + '</span>';
    }

    function prepSnippet(completionText) {
        var snippet = completionText.replace(/\{\d\:/g, '{');

        return snippet.replace('$0', '${cursor}');
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
                    data = Helpers.buildRequest(),
                    cleanedToken = cleanToken(token);

                data.wordToComplete = cleanedToken;
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
            }

            return null;
        },
        insertHint: function (hint) {
            var editor = EditorManager.getActiveEditor(),
                data = $(hint).data(),
                completionText = data.completiontext,
                cursor = getCursor(),
                token = getToken(cursor),
                adjustment = token.string === '.' ? 1 : 0;

            var start = {
                line: cursor.line,
                ch: token.start + adjustment
            };

            var end = {
                line: cursor.line,
                ch: cursor.ch + adjustment
            };
//
//            // if (data.issnippet) {
//            //     var snippet = prepSnippet(completionText);
//            //     Snippets.install({ from: start, to: end }, snippet);
//            // } else {
            editor._codeMirror.replaceRange(completionText, start, end);
//            // }

            return false;
        },
        insertHintOnTab: true

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
