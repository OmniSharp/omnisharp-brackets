/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';

    var CommandManager = brackets.getModule('command/CommandManager'),
        Helpers = require('modules/helpers'),
        Omnisharp = require('modules/omnisharp'),
        OmniCommands = require('modules/omniCommands'),
        OmniStrings = require('modules/omniStrings'),
        RenameCommand = require('modules/rename'),
        GoToDefinitionCommand = require('modules/goToDefinition'),
        FindSymbols = require('modules/findSymbols'),
        FormatCode = require('modules/formatCode'),
        ReferenceDisplay = require('modules/referenceDisplay'),
        Console = require('modules/console');

    // function fixCodeIssue() {
    //     Helpers.makeRequestAndRefreshDocument('fixcodeissue');
    // }

    // function fixUsings() {
    //     Helpers.makeRequestAndRefreshDocument('fixusings');
    // }

    function init() {
        CommandManager.register(OmniStrings.CMD_FORMAT_DOCUMENT, OmniCommands.FORMAT_DOCUMENT, FormatCode.formatFile);
        //CommandManager.register(OmniStrings.CMD_FIX_USINGS, OmniCommands.FIX_USINGS, fixUsings);
        CommandManager.register(OmniStrings.CMD_GO_TO_DEFINITION, OmniCommands.GO_TO_DEFINITION, GoToDefinitionCommand.exec);
        CommandManager.register(OmniStrings.CMD_RENAME, OmniCommands.RENAME, RenameCommand.exec);
        CommandManager.register(OmniStrings.CMD_START_OMNISHARP, OmniCommands.START_OMNISHARP, Omnisharp.start);
        CommandManager.register(OmniStrings.CMD_STOP_OMNISHARP, OmniCommands.STOP_OMNISHARP, Omnisharp.stop);
        //CommandManager.register(OmniStrings.CMD_FIX_CODE_ISSUE, OmniCommands.FIX_CODE_ISSUE, fixCodeIssue);
        CommandManager.register(OmniStrings.CMD_RELOAD_REFERENCE_DISPLAY, OmniCommands.RELOAD_REFERENCE_DISPLAY, ReferenceDisplay.reload);
        CommandManager.register(OmniStrings.CMD_FIND_SYMBOLS, OmniCommands.FIND_SYMBOLS, FindSymbols.exec);
        CommandManager.register(OmniStrings.CMD_SHOW_CONSOLE, OmniCommands.SHOW_CONSOLE, Console.show);
    }

    exports.init = init;
});
