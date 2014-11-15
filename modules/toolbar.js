/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';

    var AppInit = brackets.getModule('utils/AppInit'),
        Omnisharp = require('modules/omnisharp');

    var $button;

    function addButton() {
        var $toolbar = $('#main-toolbar .buttons');

        $button = $('<a/>')
            .attr('id', 'omnisharp-notification');
        $button.append($('<span/>')
            .addClass('loadingSpan'));

        $toolbar.append($button);
    }

    function onOmnisharpReady() {
        $button.removeClass();
        $button.addClass('ready');
    }

    function onOmnisharpStarting() {
        $button.removeClass();
        $button.addClass('starting');
    }

    function onOmnisharpError() {
        $button.removeClass();
        $button.addClass('error');
    }

    function onOmnisharpQuit() {
        $button.removeClass();
    }

    function init() {
        addButton();

        $(Omnisharp).on('omnisharpReady', onOmnisharpReady);
        $(Omnisharp).on('omnisharpQuit', onOmnisharpQuit);
        $(Omnisharp).on('omnisharpStarting', onOmnisharpStarting);
        $(Omnisharp).on('omnisharpError', onOmnisharpError);
    }

    exports.init = init;
});