$b(

    [
        './merge'
    ],

    /***********************************************************************
    @class Brink
    ************************************************************************/
    function (merge) {

        'use strict';

        /***********************************************************************
        Flatten an array.

        This will go through each item in the array and if the value
        is also an array, will merge it into the parent array.

        Does not modify the original array.

        @method flatten
        @param {Array} arr The array to flatten.
        @param {Boolean} [keepDuplicates=false] Whether or not to keep duplicate values when flattening.
        @return {Array} The flattened array.
        ************************************************************************/
        return function flatten (a, keepDuplicates) {

            var i,
                b,
                c;

            b = [];

            for (i = 0; i < a.length; i ++) {

                c = a[i];

                if (Array.isArray(c)) {
                    c = flatten(c);
                }

                b = b.concat(c);
            }

            if (!keepDuplicates) {
                merge([], b);
            }

            return b;
        };
    }

).attach('$b');