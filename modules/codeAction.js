/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */
define(function (require, exports, module) {
    'use strict';

    var EditorManager = brackets.getModule("editor/EditorManager"),
        CodeMirror = brackets.getModule("thirdparty/CodeMirror2/lib/codemirror"),
        DocumentManager = brackets.getModule('document/DocumentManager'),
        Omnisharp = require('modules/omnisharp'),
        Helpers = require('modules/helpers'),
        runmode = require('modules/runmode'),
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
        this.previewPane = $('.inline-editor-holder .omnisharp-code', this.$htmlContent).get(0);

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
        /*        var inlineWidgetHeight = 100; //todo: somehow make this dynamic :(*/
        
        //set the hight to 10 lines for now?
        this.lineHeight = +($(this.previewPane).css('line-height').replace('px', ''));
        this.hostEditor.setInlineWidgetHeight(this, this.lineHeight * 10 + 'px');
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
            var selectedItem = $(this);
            self.setSelectedItem(selectedItem);

        });

        listItem.dblclick(function () {
            self.runCodeAction($(this).data('idx'));
        });
        return listItem;
    };

    CodeActionsInlineEditor.prototype.setSelectedItem = function (jqueryListItem) {
        //TODO: , move these and the container to memeber properties
        var container = jqueryListItem.parents(".code-action-container");
        var index = jqueryListItem.data('idx');
        //move the seleceted item down
        var containerHeight = container.height();
        var itemTop = jqueryListItem.position().top;
        var scrollTop = container.scrollTop();

        $(".selection", container)
            .show()
            .toggleClass("animate", true)
            .css("top", itemTop)
            .height(jqueryListItem.outerHeight());

        // finally, we set the preview
        this.previewCodeAction(jqueryListItem.data('idx'));

    };

    CodeActionsInlineEditor.prototype.previewCodeAction = function (index) {
        var self = this;
        this._getCodeActionResult(index, function (text, lineNumber) {
            self.previewPane.innerHTML = '';
            CodeMirror.runMode(text, "csharp", self.previewPane);
            //scroll the correct line into view, i hate css
        });
    };



    CodeActionsInlineEditor.prototype.runCodeAction = function (index) {
        var self = this;
        //run the code action, and get the preview with some hackery
        this._getCodeActionResult(index, function (text, lineNumber) {
            self.hostEditor.document.setText(text);
        });
    };


    CodeActionsInlineEditor.prototype._getCodeActionResult = function (index, callback) {
        var self = this;
        var data = Helpers.buildRequest();
        data.codeaction = index;
        var cursor = this.hostEditor.getCursorPos(true, "start");
        Omnisharp.makeRequest('runcodeaction', data, function (err, data) {
            if (callback) {
                callback(data.Text, cursor.line + 1);
            }
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