/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';

    var ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        CommandManager = brackets.getModule('command/CommandManager'),
        Commands = brackets.getModule('command/Commands'),
        FileUtils = brackets.getModule('file/FileUtils'),
        FileSystem = brackets.getModule('filesystem/FileSystem');

    var path = ExtensionUtils.getModulePath(module),
        preferencesPath = FileUtils.getParentPath(path) + 'preferences.json',
        unixPath = FileUtils.convertWindowsPathToUnixPath(preferencesPath);

    var preferences;

    function open() {
        CommandManager.execute(Commands.CMD_ADD_TO_WORKINGSET_AND_OPEN, { fullPath: unixPath, paneId: 'first-pane' });
    }

    function loadPreferences(callback) {
        var preferencesFile = FileSystem.getFileForPath(unixPath);
        preferencesFile.read(function (err, jsonString) {
            preferences = JSON.parse(jsonString);
            callback();
        });
    }

    function get() {
        return preferences;
    }

    exports.open = open;
    exports.loadPreferences = loadPreferences;
    exports.get = get;
});
