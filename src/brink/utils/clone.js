$b.define(

    [
        './merge',
        './isObject'
    ],

    function (merge, isObject) {

        'use strict';

        return function (o, deep, a) {

            function arrayOrObject (o, r) {
                return Array.isArray(o) ? [] : isObject(o) ? {} : null;
            }

            a = arrayOrObject(o);

            return a ? merge(a, o, deep) : null;
        };
    }

).attach('$b');