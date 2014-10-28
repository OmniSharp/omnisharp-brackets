/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';

    var EditorManager = brackets.getModule("editor/EditorManager"),
        DocumentManager = brackets.getModule('document/DocumentManager'),
        Omnisharp = require('modules/omnisharp'),
        Helpers = require('modules/helpers');

    return {
        formatDocument: function () {
            var document = DocumentManager.getCurrentDocument();
            var deferred = $.Deferred();

            var data = Helpers.buildRequest();
            
            Omnisharp.makeRequest('codeformat', data, function (err, data) {
                if (err !== null) {
                    console.error('error formatting document');
                }

                document.setText(data.Buffer);
            });

            return deferred.promise();
        }
    };
});