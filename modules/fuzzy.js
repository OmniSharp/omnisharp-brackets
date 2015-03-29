/*
 * Fuzzy
 * https://github.com/myork/fuzzy
 *
 * Copyright (c) 2012 Matt York
 * Licensed under the MIT license.
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';

    var fuzzy = {};

    // Return all elements of `array` that have a fuzzy
    // match against `pattern`.
    fuzzy.simpleFilter = function (pattern, array) {
        return array.filter(function (string) {
            return fuzzy.test(pattern, string);
        });
    };

    // Does `pattern` fuzzy match `string`?
    fuzzy.test = function (pattern, string) {
        return fuzzy.match(pattern, string) !== null;
    };

    // If `pattern` matches `string`, wrap each matching character
    // in `opts.pre` and `opts.post`. If no match, return null
    fuzzy.match = function (pattern, string, opts) {
        opts = opts || {};
        var patternIdx = 0,
            result = [],
            len = string.length,
            totalScore = 0,
            currScore = 0,
            pre = opts.pre || '',
            post = opts.post || '',
            compareString =  (opts.caseSensitive && string) || string.toLowerCase(),
            ch,
            compareChar,
            idx;

        pattern = (opts.caseSensitive && pattern) || pattern.toLowerCase();

      // For each character in the string, either add it to the result
      // or wrap in template if it's the next string in the pattern
        for (idx = 0; idx < len; idx++) {
            ch = string[idx];
            
            if (compareString[idx] === pattern[patternIdx]) {
                ch = pre + ch + post;
                patternIdx += 1;

                // consecutive characters should increase the score more than linearly
                currScore += 1 + currScore;
            } else {
                currScore = 0;
            }
            
            totalScore += currScore;
            result[result.length] = ch;
        }

        // return rendered string if we have a match for every char
        if (patternIdx === pattern.length) {
            return {rendered: result.join(''), score: totalScore};
        }

        return null;
    };

    // The normal entry point. Filters `arr` for matches against `pattern`.
    // It returns an array with matching values of the type:
    //
    //     [{
    //         string:   '<b>lah' // The rendered string
    //       , index:    2        // The index of the element in `arr`
    //       , original: 'blah'   // The original element in `arr`
    //     }]
    //
    // `opts` is an optional argument bag. Details:
    //
    //    opts = {
    //        // string to put before a matching character
    //        pre:     '<b>'
    //
    //        // string to put after matching character
    //      , post:    '</b>'
    //
    //        // Optional function. Input is an entry in the given arr`,
    //        // output should be the string to test `pattern` against.
    //        // In this example, if `arr = [{crying: 'koala'}]` we would return
    //        // 'koala'.
    //      , extract: function(arg) { return arg.crying; }
    //    }
    fuzzy.filter = function (pattern, arr, opts) {
        opts = opts || {};
        
        return arr.reduce(function (prev, element, idx, arr) {
            var str = element;
            
            if (opts.extract) {
                str = opts.extract(element);
            }
          
            var rendered = fuzzy.match(pattern, str, opts);
          
            if (rendered !== null) {
                prev[prev.length] = {
                    string: rendered.rendered,
                    score: rendered.score,
                    index: idx,
                    original: element
                };
            }
          
            return prev;
        }, [])

        // Sort by score. Browsers are inconsistent wrt stable/unstable
        // sorting, so force stable by using the index in the case of tie.
        // See http://ofb.net/~sethml/is-sort-stable.html
            .sort(function (a, b) {
                var compare = b.score - a.score;
                
                if (compare) {
                    return compare;
                }
                
                return a.index - b.index;
            });
    };

    exports.fuzzy = fuzzy;
});