//[22:26] <MarcelGerber> So the API is Dialogs.showModalDialog(dlgClass, title, message, buttons, autoDismiss)
//[22:26] <MarcelGerber> dlgClass is one of the ones listed at https://github.com/adobe/brackets/blob/master/src/widgets/DefaultDialogs.js
//[22:27] <MarcelGerber> title and message are pretty self-explanatory, buttons and autoDismiss are optional
//[22:28] <MarcelGerber> buttons defaults to just an "OK" button, so if you need more than that, like Yes/No or Ok/Close, you'd need to pass that in, too
//[22:30] <MarcelGerber> For knowing when your dialog was closed, simply use .done(function () { ... })

/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';

    var EditorManager = brackets.getModule("editor/EditorManager"),
        DocumentManager = brackets.getModule('document/DocumentManager'),
        Dialogs = brackets.getModule("widgets/Dialogs"),
        DefaultDialogs  = brackets.getModule("widgets/DefaultDialogs"),
        Omnisharp = require('modules/omnisharp'),
        Helpers = require('modules/helpers');

    return {
        rename: function () {
            Dialogs.showModalDialog(
                DefaultDialogs.DIALOG_ID_SAVE_CLOSE,
                'Rename',
                '<input type="text" id="mat-mcloughlin.omnisharp-brackets.renameValue" />',
                [
                    { className: 'Primary', id: 'mat-mcloughlin.omnisharp-brackets.renameOk', text: 'Ok' },
                    { className: 'left', id: 'mat-mcloughlin.omnisharp-brackets.renameCancel', text: 'Cancel' }
                ],
                true
            ).done(function (buttonId) {
                // Only call rename if ok is clicked
                alert('hello');
            });
        }
    };
});