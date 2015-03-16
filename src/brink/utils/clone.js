$b(

    [
        './merge',
        './isObject'
    ],

    /***********************************************************************
    @class Brink
    ************************************************************************/
    function (merge, isObject) {

        'use strict';

        /***********************************************************************
        Creates a copy of a plain Object or Array. (Do not use on Brink.Object/Array instances).

        @method clone
        @param {Object|Array} obj The object or array to clone.
        @param {Boolean} [deep=false] Whether or not to deep copy (`true`) or shallow copy (`false`)
        ************************************************************************/
        return function (o, deep, a) {

            function arrayOrObject (o) {
                return Array.isArray(o) ? [] : isObject(o) ? {} : null;
            }

            a = arrayOrObject(o);

            return a ? merge(a, o, deep) : null;
        };
    }

).attach('$b');