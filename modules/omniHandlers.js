/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';

    var CommandManager = brackets.getModule('command/CommandManager'),
        Helpers = require('modules/helpers'),
        Omnisharp = require('modules/omnisharp'),
        OmniCommands = require('modules/omniCommands'),
        OmniStrings = require('modules/omniStrings'),
        RenameCommand = require('commands/rename'),
        goToDefinitionCommand = require('commands/goToDefinition'),
        ReferenceDisplay = require('modules/referenceDisplay');

    function fixCodeIssue() {
        Helpers.makeRequestAndRefreshDocument('fixcodeissue');
    }

    function formatDocument() {
        Helpers.makeRequestAndRefreshDocument('codeformat');
    }

    function fixUsings() {
        Helpers.makeRequestAndRefreshDocument('fixusings');
    }

    function init() {
        CommandManager.register(OmniStrings.CMD_FORMAT_DOCUMENT, OmniCommands.FORMAT_DOCUMENT, formatDocument);
        CommandManager.register(OmniStrings.CMD_FIX_USINGS, OmniCommands.FIX_USINGS, fixUsings);
        CommandManager.register(OmniStrings.CMD_GO_TO_DEFINITION, OmniCommands.GO_TO_DEFINITION, goToDefinitionCommand.exec);
        CommandManager.register(OmniStrings.CMD_RENAME, OmniCommands.RENAME, RenameCommand.exec);
        CommandManager.register(OmniStrings.CMD_START_OMNISHARP, OmniCommands.START_OMNISHARP, Omnisharp.start);
        CommandManager.register(OmniStrings.CMD_STOP_OMNISHARP, OmniCommands.STOP_OMNISHARP, Omnisharp.stop);
        CommandManager.register(OmniStrings.CMD_FIX_CODE_ISSUE, OmniCommands.FIX_CODE_ISSUE, fixCodeIssue);
        CommandManager.register(OmniStrings.CMD_RELOAD_REFERENCE_DISPLAY, OmniCommands.RELOAD_REFERENCE_DISPLAY, ReferenceDisplay.reload);
    }

    exports.init = init;
});
