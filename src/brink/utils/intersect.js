$b(

    [
    ],

    /***********************************************************************
    @class Brink
    ************************************************************************/
    function () {

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
                c,
                d;

            c = [];
            i = b.length;

            if (!a.length || !i) {
                return c;
            }

            while (i--) {
                d = b[i];
                if (~a.indexOf(d)) {
                    c.push(d);
                }
            }

            return c;
        };
    }

).attach('$b');
