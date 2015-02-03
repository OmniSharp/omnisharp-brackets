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
    
    function OmnisharpInlineWidget(hostEditor) {
        InlineWidget.call(this);
        this.hostEditor = hostEditor;
    }
    
    OmnisharpInlineWidget.prototype = Object.create(InlineWidget.prototype);
    OmnisharpInlineWidget.prototype.constructor = OmnisharpInlineWidget;
    OmnisharpInlineWidget.prototype.parentClass = InlineWidget.prototype;

    OmnisharpInlineWidget.prototype.load = function (hostEditor, $html) {
        OmnisharpInlineWidget.prototype.parentClass.load.apply(this, arguments);
        $html.appendTo(this.$htmlContent);
    };

    OmnisharpInlineWidget.prototype.onAdded = function () {
        OmnisharpInlineWidget.prototype.parentClass.onAdded.apply(this, arguments);
        this.setInlineContent();
        this.adjustHeight();
    };

    OmnisharpInlineWidget.prototype.adjustHeight = function () {
        //default to 300, override this to set your own
        this.setHeight(this, '300px');
    };

    OmnisharpInlineWidget.prototype.setInlineContent = function () {
    };
    
    OmnisharpInlineWidget.prototype.setHeight = function (inlineWidget, height, ensureVisible) {
        //taken from the brackets source :(
        var node = this.$htmlContent,
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
    
    exports.OmnisharpInlineWidget = OmnisharpInlineWidget;
});