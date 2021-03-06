$b(

    [
        './isObject'
    ],

    /***********************************************************************
    @class Brink
    ************************************************************************/
    function (isObject) {

        'use strict';

        /***********************************************************************
        Merge one `Array` or `Object` into another `Array` or `Object`.
        Modifies the first `Object` or `Array` passed in as an argument.

        @method merge
        @param {Object|Array} obj1 The `Object` or `Array` to merge into.
        @param {Object|Array} obj2 The `Object` or `Array` containing values to merge.
        @param {Boolean} [deep=false] Whether or not to deep copy objects when merging
        (`true`) or shallow copy (`false`)
        @return {Object|Array} The merged `Object` or `Array`.
        ************************************************************************/
        return function merge (a, b, deep) {

            var p,
                o,
                d;

            function arrayOrObject (o) {
                return Array.isArray(o) ? [] : isObject(o) ? {} : false;
            }

            if (Array.isArray(a) || Array.isArray(b)) {

                a = a || [];
                b = b || [];

                for (p = 0; p < b.length; p ++) {

                    o = b[p];

                    if (!~a.indexOf(o)) {
                        d = deep ? arrayOrObject(o) : null;
                        a.push(d ? merge(d, o, true) : o);
                    }
                }
                return a;
            }

            else if (isObject(a) || isObject(b)) {

                a = a || {};
                b = b || {};

                for (p in b) {

                    o = b[p];

                    if (!b.hasOwnProperty(p)) {
                        continue;
                    }

                    d = deep ? arrayOrObject(o) : null;
                    a[p] = d ? merge(d, o, true) : o;
                }

                return a;
            }

            return null;

        };
    }

).attach('$b');