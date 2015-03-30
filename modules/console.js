/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';

    var WorkspaceManager = brackets.getModule('view/WorkspaceManager'),
        Omnisharp = require('modules/omnisharp'),
        ConsoleTemplate = require('text!htmlContent/console-template.html');

    var _panel,
        _logData = [],
        _currentPanel = 'omnisharp';

    function clear() {
        var $console = _panel.$panel.find(".console");
        $console.html("");
    }

    function render() {
		var $console = _panel.$panel.find(".console"),
            $element = "",
			i = 0;

		for (i = 0; i < _logData.length; i++) {
            if (_logData[i].text === '' || _logData[i].type !== _currentPanel) {
                continue;
            }

            $element = $("<input type='text' />");

            $element.val(_logData[i].text);
            $element.addClass(_logData[i].type);

			$console.append($element);
		}
        $console.animate({ scrollTop: $console[0].scrollHeight }, 20);
	}

    function add(msg, type) {
		var texts = msg.toString().split('\n'),
			i = 0;

		for (i = 0; i < texts.length; i++) {
			_logData.push({type: type, text: texts[i]});
		}

        render();
    }

    exports.init = function() {
        _panel = WorkspaceManager.createBottomPanel('omnisharp.console', $(ConsoleTemplate));
        _panel.show();

        _panel.$panel.find(".close").on("click", function () {
            _panel.hide();
        });

        _panel.$panel.find("#panelButtons > button").on("click", function () {

            _currentPanel = $(this).attr('data-filter');

            _panel.$panel.find("#panelButtons > button").addClass('disabled')
            $(this).removeClass('disabled');

            clear();
            render();
        });


        $(Omnisharp).on('omnisharpStd', function(e,     data) {
            add(data, 'omnisharp');
        });
    };
});
