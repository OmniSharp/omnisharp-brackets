/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */
define(function (require, exports, module) {
    'use strict';

    var EditorManager = brackets.getModule("editor/EditorManager"),
        CodeMirror = brackets.getModule("thirdparty/CodeMirror2/lib/codemirror"),
        DocumentManager = brackets.getModule('document/DocumentManager'),
        Omnisharp = require('modules/omnisharp'),
        Helpers = require('modules/helpers'),
        InlineWidget = brackets.getModule("editor/InlineWidget").InlineWidget;

    var inlineEditorTemplate = require("text!omnisharp-codeactions-editor-template.html");
    
    function getCursorPosition() {
        var editor = EditorManager.getActiveEditor();
        return editor.getCursorPos(true, "start");
    }
    
    function InlineCodePreviewWidget(hostEditor) {
        InlineWidget.call(this);
        this.hostEditor = hostEditor;
    }
    
    InlineCodePreviewWidget.prototype = Object.create(InlineWidget.prototype);
    InlineCodePreviewWidget.prototype.constructor = InlineCodePreviewWidget;
    InlineCodePreviewWidget.prototype.parentClass = InlineWidget.prototype;

    InlineCodePreviewWidget.prototype.load = function (hostEditor) {
        InlineCodePreviewWidget.prototype.parentClass.load.apply(this, arguments);
        $(inlineEditorTemplate).appendTo(this.$htmlContent);
        this.previewPane = $('.inline-editor-holder .omnisharp-code', this.$htmlContent).get(0);
    };

    InlineCodePreviewWidget.prototype.onAdded = function () {
        this.cursorPos = getCursorPosition();
        //go and get our stuff
        //CodeActionsInlineEditor.prototype.parentClass.load.apply(this, arguments);
        InlineCodePreviewWidget.prototype.parentClass.onAdded.apply(this, arguments);

        this.setInlineContent();
        // Setting initial height is a *required* part of the InlineWidget contract
        this.adjustHeight();
    };

    InlineCodePreviewWidget.prototype.adjustHeight = function () {
        this.lineHeight = +($(this.previewPane).css('line-height').replace('px', ''));
        this.setHeight(this, this.lineHeight * 10 + 'px');
    };

    InlineCodePreviewWidget.prototype.setInlineContent = function () {
        var self = this;
        console.log("codeAction exectuted");

        var sidebar = $(self.$htmlContent);
        var $list = $('ul', sidebar);

        $list.append(
            $('<li>')
                .attr('class', 'section-header')
                .append(($('<span>').text('Code Actions')))
        );
    };

    InlineCodePreviewWidget.prototype.createListItem = function (action, index) {
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

    InlineCodePreviewWidget.prototype.setSelectedItem = function ($listItem) {
        var container = $listItem.parents(".omnisharp-inline-code-preview-container"),
            containerHeight = container.height(),
            itemTop = $listItem.position().top,
            scrollTop = container.scrollTop();

        $(".selection", container)
            .show()
            .toggleClass("animate", true)
            .css("top", itemTop)
            .height($listItem.outerHeight());

        this.previewCode($listItem.data('index'));
    };

    InlineCodePreviewWidget.prototype.previewCode = function (item) {

    };
    InlineCodePreviewWidget.prototype.setHeight = function (inlineWidget, height, ensureVisible) {
        var node = inlineWidget.htmlContent,
            oldHeight = (node && $(node).height()) || 0,
            changed = (oldHeight !== height),
            isAttached = inlineWidget.info !== undefined;

        function updateHeight() {
            // Notify CodeMirror for the height change.
            if (isAttached) {
                inlineWidget.info.changed();
            }
        }
        
        function setOuterHeight() {
            function finishAnimating(e) {
                if (e.target === node) {
                    updateHeight();
                    $(node).off("webkitTransitionEnd", finishAnimating);
                }
            }
            $(node).height(height);
            if ($(node).hasClass("animating")) {
                $(node).on("webkitTransitionEnd", finishAnimating);
            } else {
                updateHeight();
            }
        }

        // Make sure we set an explicit height on the widget, so children can use things like
        // min-height if they want.
        if (changed || !node.style.height) {
            // If we're animating, set the wrapper's height on a timeout so the layout is finished before we animate.
            if ($(node).hasClass("animating")) {
                window.setTimeout(setOuterHeight, 0);
            } else {
                setOuterHeight();
            }
        }

        if (ensureVisible && isAttached) {
            var offset = $(node).offset(), // offset relative to document
                position = $(node).position(), // position within parent linespace
                scrollerTop = this.hostEditor.getVirtualScrollAreaTop();

            this.hostEditor._codeMirror.scrollIntoView({
                left: position.left,
                top: offset.top - scrollerTop,
                right: position.left, // don't try to make the right edge visible
                bottom: offset.top + height - scrollerTop
            });
        }
    };
    
    exports.InlineCodePreivewWidget = InlineCodePreviewWidget;
});