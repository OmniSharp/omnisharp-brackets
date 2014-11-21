/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';

    var packageString = 'omnisharp.omnisharp-brackets.';

    exports.FORMAT_DOCUMENT = packageString + 'formatDocument';
    exports.FIX_USINGS = packageString + 'fixUsings';
    exports.GO_TO_DEFINITION = packageString + 'goToDefinition';
    exports.RENAME = packageString + 'rename';
    exports.START_OMNISHARP = packageString + 'startOmnisharp';
    exports.STOP_OMNISHARP = packageString + 'stopOmnisharp';
    exports.FIX_CODE_ISSUE = packageString + 'fixCodeIssue';
});
