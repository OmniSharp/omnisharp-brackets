/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */
define(function (require, exports, module) {
    'use strict';

    var EditorManager = brackets.getModule("editor/EditorManager"),
        CodeMirror = brackets.getModule("thirdparty/CodeMirror2/lib/codemirror"),
        DocumentManager = brackets.getModule('document/DocumentManager'),
        Omnisharp = require('modules/omnisharp'),
        Helpers = require('modules/helpers'),        
        Differ = require('modules/differ'),
        InlineWidget = brackets.getModule("editor/InlineWidget").InlineWidget;

    var inlineEditorTemplate = require("text!omnisharp-codeactions-editor-template.html");

    function getCodeActionResult(index, callback) {
        var req = Helpers.buildRequest();
        req.codeAction = index;
        
        // curious about this line
        //var cursor = this.hostEditor.getCursorPos(true, "start");
        
        Omnisharp.makeRequest('runcodeaction', req, function (err, res) {
            var document = DocumentManager.getCurrentDocument();
            var code = Differ.diff(document.getText().split('\n'), res.Text.split('\n'));
           
            callback(code, 0);
        });
    }
    
    function getCodeActions(callback) {
        var req = Helpers.buildRequest();
        
        Omnisharp.makeRequest('getcodeactions', req, function (err, res) {
            if (res.CodeActions) {
                callback(res.CodeActions);
            } else {
                callback([]);
            }
        });
    }
    
    function getCursorPosition() {
        var editor = EditorManager.getActiveEditor();
        return editor.getCursorPos(true, "start");
    }
    
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
        this.cursorPos = getCursorPosition();
        //go and get our stuff
        //CodeActionsInlineEditor.prototype.parentClass.load.apply(this, arguments);
        CodeActionsInlineEditor.prototype.parentClass.onAdded.apply(this, arguments);

        this.setInlineContent();
        // Setting initial height is a *required* part of the InlineWidget contract
        this._adjustHeight();
    };

    CodeActionsInlineEditor.prototype._adjustHeight = function () {
        this.lineHeight = +($(this.previewPane).css('line-height').replace('px', ''));
        this.hostEditor.setInlineWidgetHeight(this, this.lineHeight * 10 + 'px');
    };


    CodeActionsInlineEditor.prototype.setInlineContent = function () {
        var self = this;
        console.log("codeAction exectuted");

        var sidebar = $(self.$htmlContent);
        var $list = $('ul', sidebar);

        $list.append(
            $('<li>')
                .attr('class', 'section-header')
                .append(($('<span>').text('Code Actions')))
        );

        getCodeActions(function (codeActions) {
            codeActions.forEach(function (codeAction, index) {
                var $item = self._createListItem(codeAction, index);
                $list.append($item);
            });

            self.setSelectedItem($('li:nth-child(2)', $list));
        });
    };

    CodeActionsInlineEditor.prototype._createListItem = function (action, index) {
        var self = this;
        var listItem = $('<li>').append(($('<span>').text(action))).data('index', index);

        listItem.mousedown(function () {
            self.setSelectedItem($(this));
        });

        listItem.dblclick(function () {
            self.runCodeAction($(this).data('index'));
        });
        
        return listItem;
    };

    CodeActionsInlineEditor.prototype.setSelectedItem = function ($listItem) {
        var container = $listItem.parents(".code-action-container"),
            containerHeight = container.height(),
            itemTop = $listItem.position().top,
            scrollTop = container.scrollTop();

        $(".selection", container)
            .show()
            .toggleClass("animate", true)
            .css("top", itemTop)
            .height($listItem.outerHeight());

        this.previewCodeAction($listItem.data('index'));
    };

    CodeActionsInlineEditor.prototype.previewCodeAction = function (codeAction) {
        var self = this,
            iterator = 0;
        
        getCodeActionResult(codeAction, function (buffer, lineNumber) {
            // var lines = (buffer.split(/\n/g) || []);
            
            // var text = '';
            // for (iterator = self.cursorPos.line - 2; iterator < lines.length; iterator++) {
            //     text += lines[iterator] + '\n';
            // }
            
            
            self.previewPane.innerHTML = '';
            CodeMirror(self.previewPane, { value: buffer, lineNumbers: true, mode: 'text/x-csharp', readOnly: 'nocursor', firstLineNumber: 1 });
            //CodeMirror.runMode(text, "csharp", self.previewPane);
            //scroll the correct line into view, i hate css
        });
    };

    CodeActionsInlineEditor.prototype.runCodeAction = function (codeAction) {
        var self = this;
        
        getCodeActionResult(codeAction, function (text, lineNumber) {
            self.hostEditor.document.setText(text);
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