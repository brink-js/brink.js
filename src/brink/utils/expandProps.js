$b.define(

    function () {

        'use strict';

        return function (a, b, i, j, p, n, s) {

            s = [];

            for (i = 0; i < a.length; i ++) {

                p = a[i];

                if (~p.indexOf(',')) {
                    p = p.split('.');
                    n = p[0];
                    b = p[1].split(',');
                    p = [];

                    for (j = 0; j < b.length; j ++) {
                        p.push([n, b[j]].join('.'));
                    }
                }

                s = s.concat(p);
            }

            return s;
        };
    }

).attach('$b');