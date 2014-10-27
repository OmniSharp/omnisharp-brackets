/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';
    
    var NodeDomain = brackets.getModule('utils/NodeDomain'),
        ExtensionUtils = brackets.getModule('utils/ExtensionUtils'),
        ProjectManager = brackets.getModule('project/ProjectManager');

    var omnisharp = new NodeDomain('phoenix', ExtensionUtils.getModulePath(module, '../node/omnisharp'));

    return {
        isRunning: false,
        init: function () {
            var self = this;

            $(omnisharp).on('omnisharpError', function (data) {
                alert(data);
                self.isRunning = false;
            });

            $(omnisharp).on('omnisharpExited', function () {
                alert('Omnisharp is stopped');
                self.isRunning = false;
            });

            $(omnisharp).on('omnisharpReady', function () {
                alert('Omnisharp Ready');
                self.isRunning = true;
            });
        },
        start: function () {
            if (this.isRunning) {
                alert('Omnisharp is already running.');
                return;
            }

            var projectPath = ProjectManager.getInitialProjectPath();
            omnisharp.exec('startOmnisharp', projectPath)
                .done(function (port) {

                }).fail(function (err) {
                    alert('fail: ' + err);
                });
        },
        stop: function () {
            if (!this.isRunning) {
                alert('Omnisharp is not currently running');
            }

            omnisharp.exec('stopOmnisharp');
        },
        makeRequest: function (service, data, callback) {
            omnisharp.exec('callService', /*'codecheck'*/ service, data)
                .done(function (body) { callback(null, body); })
                .fail(function (err) { callback(err, null); });
        }
    };
});