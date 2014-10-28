/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';

    var EditorManager = brackets.getModule("editor/EditorManager"),
        DocumentManager = brackets.getModule('document/DocumentManager'),
        Omnisharp = require('modules/omnisharp'),
        Helpers = require('modules/helpers');

    function refreshDocument(service, errorMessage) {
        var document = DocumentManager.getCurrentDocument();
        var data = Helpers.buildRequest();

        Omnisharp.makeRequest(service, data, function (err, data) {
            if (err !== null) {
                console.error(errorMessage);
            }

            document.setText(data.Buffer);
        });
    }
    
    return {
        formatDocument: function () {
            refreshDocument('codeformat', 'Error formatting document');
        },
        fixUsings: function () {
            refreshDocument('fixusings', 'Error fixing using statements');
        }
    };
});