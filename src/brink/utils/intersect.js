$b(

    [
        './flatten'
    ],

    /***********************************************************************
    @class Brink
    ************************************************************************/
    function (flatten) {

        'use strict';

        /***********************************************************************
        Compare two arrays and return an `Array` with items that exist
        in both arrays.

        @method intersect
        @param {Array} arr1 The first `Array` to compare.
        @param {Array} arr2 The second `Array` to compare.
        @return {Array} `Array` of items that exist in both arrays.
        ************************************************************************/
        return function (a, b) {

            var i,
                c;

            b = flatten([].slice.call(arguments, 1));
            c = [];

            for (i = 0; i < b.length; i ++) {
                if (~a.indexOf(b[i])) {
                    c.push(b[i]);
                }
            }

            return c;
        };
    }

).attach('$b');
