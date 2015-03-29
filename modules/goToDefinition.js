/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';

    var Omnisharp = require('modules/omnisharp'),
        Helpers = require('modules/helpers');

    exports.exec = function () {
        var req = Helpers.buildRequest();

        Omnisharp.gotoDefinition()
            .done(function (res) {
                if (res.FileName === null) {
                    return;
                }

                Helpers.goto(res);
            });
    };
});
