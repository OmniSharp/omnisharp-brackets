/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';

    var CommandManager = brackets.getModule('command/CommandManager'),
        Commands = brackets.getModule('command/Commands'),
        Omnisharp = require('modules/omnisharp'),
        EditorManager = brackets.getModule('editor/EditorManager'),
        FileUtils = brackets.getModule('file/FileUtils'),
        Helpers = require('modules/helpers');

    function exec() {
        var req = Helpers.buildRequest();

        Omnisharp.makeRequest('gotoDefinition', req, function (err, res) {
            if (err !== null) {
                console.error(err);
            }

            if (res.FileName === null) {
                return;
            }

            var unixPath = FileUtils.convertWindowsPathToUnixPath(res.FileName);
            CommandManager.execute(Commands.CMD_ADD_TO_WORKINGSET_AND_OPEN, { fullPath: unixPath, paneId: 'first-pane' }).done(function () {
                var editor = EditorManager.getActiveEditor();
                editor.setCursorPos(res.Line - 1, res.Column - 1, true);
            });
        });
    }

    exports.exec = exec;
});
