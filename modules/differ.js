/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';

    var results = [];
    
    var makeRow = function (x, y, type, text) {
        results.push({
            type: type,
            lineno: y || x,
            text: text
        });
    };

    var getDiff = function (matrix, a1, a2, x, y) {
        if (x > 0 && y > 0 && a1[y-1] === a2[x-1]) {
            getDiff(matrix, a1, a2, x-1, y-1);
            makeRow(x, y, ' ', a1[y-1]);
        } else {
            if (x > 0 && (y === 0 || matrix[y][x-1] >= matrix[y-1][x])) {
                getDiff(matrix, a1, a2, x-1, y);
                makeRow(x, '', '+', a2[x-1]);
            } else if (y > 0 && (x === 0 || matrix[y][x-1] < matrix[y-1][x])) {
                getDiff(matrix, a1, a2, x, y-1);
                makeRow('', y, '-', a1[y-1]);
            } else {
                return;
            }
        }
    };

    var constructCode = function() {
        var i,
            constructedCode = '';
        
        for (i = results.length - 1; i >= 0; i--) {
            if (results[i].type !== ' ') {
                constructedCode += results[i].type + '' + results[i].text + '\n';
            };
        };

        return constructedCode;
    };
    
    var diff = function (a1, a2) {
        results = [];
        var matrix = new Array(a1.length + 1);
        var x, y;

        for (y = 0; y < matrix.length; y++) {
            matrix[y] = new Array(a2.length + 1);

            for (x = 0; x < matrix[y].length; x++) {
                matrix[y][x] = 0;
            }
        }
    
        for (y = 1; y < matrix.length; y++) {
            for (x = 1; x < matrix[y].length; x++) {
                if (a1[y-1] === a2[x-1]) {
                    matrix[y][x] = 1 + matrix[y-1][x-1];
                }  else {
                    matrix[y][x] = Math.max(matrix[y-1][x], matrix[y][x-1]);
                }
            }
        }

        getDiff(matrix, a1, a2, x-1, y-1);
        return constructCode();

    };

    exports.diff = diff;
});