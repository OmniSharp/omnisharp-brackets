/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';

    var EditorManager = brackets.getModule("editor/EditorManager"),
        DocumentManager = brackets.getModule('document/DocumentManager'),
        Omnisharp = require('modules/omnisharp'),
        Helpers = require('modules/helpers');

    return {
        gotoDefinition: function () {
            var document = DocumentManager.getCurrentDocument();
            var filename = document.file._path;

            var data = Helpers.buildRequest();

            Omnisharp.makeRequest('gotoDefinition', data, function (err, data) {
                if (err !== null) {
                    console.error(err);
                }

                var document = DocumentManager.getDocumentForPath(data.FileName);
            });
        }
    };
});