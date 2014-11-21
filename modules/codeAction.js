/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */
define(function (require, exports, module) {
    'use strict';

    var EditorManager = brackets.getModule("editor/EditorManager"),
        DocumentManager = brackets.getModule('document/DocumentManager'),
        Omnisharp = require('modules/omnisharp'),
        Helpers = require('modules/helpers'),
        InlineWidget = brackets.getModule("editor/InlineWidget").InlineWidget;


    var inlineEditorTemplate = require("text!omnisharp-codeactions-editor-template.html");

    function CodeActionsInlineEditor(pos, hostEditor) {
        InlineWidget.call(this);
        this.hostEditor = hostEditor;

    }
    CodeActionsInlineEditor.prototype = Object.create(InlineWidget.prototype);
    CodeActionsInlineEditor.prototype.constructor = CodeActionsInlineEditor;
    CodeActionsInlineEditor.prototype.parentClass = InlineWidget.prototype;

    CodeActionsInlineEditor.prototype.load = function (hostEditor) {
        CodeActionsInlineEditor.prototype.parentClass.load.apply(this, arguments);
        $(inlineEditorTemplate).appendTo(this.$htmlContent);
    };

    CodeActionsInlineEditor.prototype.onAdded = function () {
        //go and get our stuff
        //CodeActionsInlineEditor.prototype.parentClass.load.apply(this, arguments);
        CodeActionsInlineEditor.prototype.parentClass.onAdded.apply(this, arguments);

        this.setInlineContent();
        // Setting initial height is a *required* part of the InlineWidget contract
        this._adjustHeight();
    };

    CodeActionsInlineEditor.prototype._adjustHeight = function () {
        var inlineWidgetHeight = 100; //todo: somehow make this dynamic :(
        this.hostEditor.setInlineWidgetHeight(this, inlineWidgetHeight);
    };


    CodeActionsInlineEditor.prototype.setInlineContent = function () {
        var self = this;
        console.log("codeAction exectuted");

        var sidebar = $(self.$htmlContent);
        var list = $('ul', sidebar);

        self.actionsList = list;

        var data = Helpers.buildRequest();
        Omnisharp.makeRequest('getcodeactions', data, function (err, returnedData) {
            //todo, grab strings for titles/etc properly
            list.append($('<li>').attr('class', 'section-header').append(($('<span>').text('Code Actions'))));
            if (returnedData.CodeActions) {
                $(returnedData.CodeActions).each(function (i, el) {
                    var item = self._createListItem(el);
                    list.append(item);
                });
            }
        });
    };


    CodeActionsInlineEditor.prototype._createListItem = function (action, index) {
        var self = this;
        var listItem = $('<li>').append(($('<span>').text(action))).data('idx', index);

        listItem.mousedown(function () {
            self.listItemSelected($(this).data('idx'));
        });
        return listItem;
    };

    CodeActionsInlineEditor.prototype.listItemSelected = function (index) {
        var self = this;
        var data = Helpers.buildRequest();
        data.codeaction = index;

        Omnisharp.makeRequest('runcodeaction', data, function (err, data) {
            //get the document and set the new text
            self.hostEditor.document.setText(data.Text);
        });
    };


    function codeActionsInlineEditorProvider(hostEditor, pos) {
        if (!Helpers.isCSharp()) {
            return;
        }
        if (!Omnisharp.isOmnisharpRunning()) {
            return;
        }
        var inlineEditor = new CodeActionsInlineEditor(pos, hostEditor);
        inlineEditor.load(hostEditor); // only needed to appease weird InlineWidget API

        return new $.Deferred().resolve(inlineEditor);
    }

    function init() {
        EditorManager.registerInlineEditProvider(codeActionsInlineEditorProvider);
    }
    
    
    exports.init = init;
   
});
//lots of extra lines, just for mat







