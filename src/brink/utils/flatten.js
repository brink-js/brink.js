$b.define(

    [
        './merge'
    ],

    function (merge) {

        'use strict';

        return function flatten (a, duplicates) {

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

            if (!duplicates) {
                merge([], b);
            }

            return b;
        };
    }

).attach('$b');