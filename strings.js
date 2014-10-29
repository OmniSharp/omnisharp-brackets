/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';

    var EditorManager = brackets.getModule("editor/EditorManager"),
        DocumentManager = brackets.getModule('document/DocumentManager');

    var packageAuthor = 'mat-mcloughlin',
        packageName = 'omnisharp-brackets',
        packageString = packageAuthor + '.' + packageName + '.';
    return {
        omnisharpMenu: packageString + 'omnisharpMenu',
        startOmnisharp: packageString + 'startOmnisharp',
        stopOmnisharp: packageString + 'stopOmnisharp',
        renameOk: packageString + 'renameOk',
        renameCancel: packageString + 'renameCancel',
        renameInput: packageString + 'renameInput'
    };
});