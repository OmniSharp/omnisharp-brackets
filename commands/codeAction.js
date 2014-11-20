/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */
define(function(require, exports, module) {
    'use strict';

    var EditorManager = brackets.getModule("editor/EditorManager"),
        DocumentManager = brackets.getModule('document/DocumentManager'),
        Omnisharp = require('modules/omnisharp'),
        Helpers = require('modules/helpers'),
        CodeHintManager = brackets.getModule('editor/CodeHintManager'),
        InlineWidget = brackets.getModule("editor/InlineWidget").InlineWidget,
        FileUtils = brackets.getModule('file/FileUtils');


        var inlineEditorTemplate  = require("text!omnisharp-codeactions-editor-template.html");

    function exec() {
        console.log("codeAction exectuted");

        var data = Helpers.buildRequest();
        Omnisharp.makeRequest('getcodeactions', data, function(err, returnedData) {
            console.log(returnedData);
        });

        EditorManager.registerInlineEditProvider(myProvider);
        //runcodeaction
    }


    function CodeActionsInlineEditor(pos) {
        InlineWidget.call(this);

        $(inlineEditorTemplate).appendTo(this.$htmlContent);
    }
    CodeActionsInlineEditor.prototype = Object.create(InlineWidget.prototype);
    CodeActionsInlineEditor.prototype.constructor = CodeActionsInlineEditor;
    CodeActionsInlineEditor.prototype.parentClass = InlineWidget.prototype;
    CodeActionsInlineEditor.prototype.onAdded = function () {
        CodeActionsInlineEditor.prototype.parentClass.onAdded.apply(this, arguments);
        // Setting initial height is a *required* part of the InlineWidget contract
        this._adjustHeight();
    };


    CodeActionsInlineEditor.prototype._adjustHeight = function () {
        var inlineWidgetHeight = 100;
        this.hostEditor.setInlineWidgetHeight(this, inlineWidgetHeight);
    };

    function codeActionsInlineEditorProvider(hostEditor, pos) {
        var langId = hostEditor.getLanguageForSelection().getId();
        if (langId !== "csharp") {
            return null;
        }
        var inlineEditor = new CodeActionsInlineEditor(pos);
        inlineEditor.load(hostEditor);  // only needed to appease weird InlineWidget API

        return new $.Deferred().resolve(inlineEditor);
    }

    EditorManager.registerInlineEditProvider(codeActionsInlineEditorProvider);


    exports.exec = exec;


});
