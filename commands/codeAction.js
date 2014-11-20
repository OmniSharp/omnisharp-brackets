/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';

    var EditorManager = brackets.getModule("editor/EditorManager"),
        DocumentManager = brackets.getModule('document/DocumentManager'),
        Omnisharp = require('modules/omnisharp'),
        Helpers = require('modules/helpers'),
        CodeHintManager = brackets.getModule('editor/CodeHintManager'),
        Dialogs = brackets.getModule("widgets/Dialogs"),
        DefaultDialogs  = brackets.getModule("widgets/DefaultDialogs"),
        FileUtils = brackets.getModule('file/FileUtils');

    function exec() {
      console.log("codeAction exectuted");

      var data = Helpers.buildRequest();
      Omnisharp.makeRequest('getcodeactions', data, function (err, returnedData) {
        console.log(returnedData);
      });
    }

    exports.exec = exec;
});
