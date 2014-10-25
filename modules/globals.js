/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';
    
    var NodeDomain = brackets.getModule('utils/NodeDomain'),
        ExtensionUtils = brackets.getModule('utils/ExtensionUtils');
    
    return {
        omnisharpRunning: false,
        omnisharp: new NodeDomain('phoenix', ExtensionUtils.getModulePath(module, '../node/omnisharp'))
    };
});