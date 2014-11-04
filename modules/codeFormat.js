/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';

    var EditorManager = brackets.getModule("editor/EditorManager"),
        DocumentManager = brackets.getModule('document/DocumentManager'),
        Omnisharp = require('modules/omnisharp'),
        Helpers = require('modules/helpers');

    function refreshDocument(service) {
        var document = DocumentManager.getCurrentDocument();
        var data = Helpers.buildRequest();

        Omnisharp.makeRequest(service, data, function (err, data) {
            if (err !== null) {
                console.error(err);
            }

            document.setText(data.Buffer);
        });
    }
    
    function formatDocument() {
        refreshDocument('codeformat');
    }
    
    function fixUsings() {
        refreshDocument('fixusings');
    }
    
    exports.fixUsings = fixUsings;
    exports.formatDocument = formatDocument;
});