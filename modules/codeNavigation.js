/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';

    var EditorManager = brackets.getModule('editor/EditorManager'),
        CommandManager = brackets.getModule('command/CommandManager'),
        Commands = brackets.getModule('command/Commands'),
        FileUtils = brackets.getModule('file/FileUtils'),
        Omnisharp = require('modules/omnisharp'),
        Helpers = require('modules/helpers');

    function goToDefinition() {
        var data = Helpers.buildRequest();

        Omnisharp.makeRequest('gotoDefinition', data, function (err, data) {
            if (err !== null) {
                console.error(err);
            }

            if (data.FileName === null) {
                return;
            }

            var unixPath = FileUtils.convertWindowsPathToUnixPath(data.FileName);
            CommandManager.execute(Commands.CMD_ADD_TO_WORKINGSET_AND_OPEN, { fullPath: unixPath, paneId: 'first-pane' }).done(function () {
                var editor = EditorManager.getActiveEditor();
                editor.setCursorPos(data.Line - 1, data.Column - 1, true);
            });
        });
    }
    
    exports.gotoDefinition = goToDefinition;
});