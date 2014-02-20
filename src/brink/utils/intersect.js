$b(

    [
        './flatten'
    ],

    function (flatten) {

        'use strict';

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
