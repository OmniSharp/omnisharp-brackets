/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window, Mustache */

define(function (require, exports, module) {
    'use strict';

    var Omnisharp = require('modules/omnisharp'),
        Helpers = require('modules/helpers');

    exports.formatFile = function () {
        Omnisharp.codeFormat()
            .done(function (res) {
                Helpers.refreshDocument(res);
            });
    };
});
