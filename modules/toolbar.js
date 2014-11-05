/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';

    var button;
    
    function init() {
        var toolbar = $('#main-toolbar .buttons');
        button = $('<a/>')
            .text('O')
            .attr('id', 'omnisharp-notification')
            .addClass('inactive');
        toolbar.append(button);
    }
    
    exports.init = init;
});