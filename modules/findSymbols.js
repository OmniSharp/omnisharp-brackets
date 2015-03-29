/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window, Mustache */

define(function (require, exports, module) {
    'use strict';

    var Omnisharp = require('modules/omnisharp'),
        Fuzzy = require('modules/fuzzy').fuzzy,
        Helpers = require('modules/helpers'),
        QuickOpen = brackets.getModule('search/QuickOpen'),
        ProjectManager = brackets.getModule('project/ProjectManager'),
        FindSymbolsTemplate = require("text!htmlContent/find-symbols-template.html");

    var _completionList = [],
        _projectPath = ProjectManager.getInitialProjectPath();

    function search(query, matcher) {
        var trimedQuery = query.substring(4);

        return Fuzzy.filter(trimedQuery, _completionList, {
            extract: function (el) { return el.Text; }
        });
    }

    function match(query) {
        if (query.indexOf('sym:') === 0) {
            return true;
        }
    }

    function itemSelect(item) {
        Helpers.goto(item.original);
    }

    function resultsFormatter(item) {
        return Mustache.render(FindSymbolsTemplate, {
            Kind: item.original.Kind,
            Text: item.original.Text,
            Path: item.original.FileName.replace(_projectPath, '')
        });
    }

    QuickOpen.addQuickOpenPlugin({
        name: 'omnisharp.findSymbols',
        label: 'Find Symbols',
        languageIds: ['csharp'],
        search: search,
        match: match,
        itemSelect: itemSelect,
        resultsFormatter: resultsFormatter
    });

    exports.exec = function () {
        Omnisharp.findSymbols({filter: ''})
            .done(function (res) {
                _completionList = res.QuickFixes;
                QuickOpen.beginSearch('sym:');
            });
    };
});
