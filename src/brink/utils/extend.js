$b(

    [
        './isObject',
        './isFunction'
    ],

    /***********************************************************************
    @class Brink
    ************************************************************************/

    /***********************************************************************
    Used by `Brink.CoreObject` for inheritance and mixins.

    @method extend
    @private
    ************************************************************************/
    function (isObject, isFunction) {

        'use strict';

        function isPlainObject (o) {
            return isObject(o) && o.constructor === Object;
        }

        function isArray (a) {
            return Array.isArray(a);
        }

        function extend (target) {

            var i,
                l,
                src,
                clone,
                copy,
                deep,
                name,
                options,
                copyIsArray;

            // Handle case when target is a string or something (possible in deep copy)
            if (typeof target !== 'object' && !isFunction(target)) {
                target = {};
            }

            i = isObject(arguments[1]) ? 1 : 2;
            deep = (arguments[1] === true);

            for (l = arguments.length; i < l; i ++) {

                // Only deal with non-null/undefined values
                if ((options = arguments[i]) != null) {

                    // Extend the base object
                    for (name in options) {

                        src = target[name];
                        copy = options[name];

                        // Prevent never-ending loop
                        if (target === copy) {
                            continue;
                        }

                        // Recurse if we're merging plain objects or arrays
                        if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {

                            if (copyIsArray) {
                                copyIsArray = false;
                                clone = src && isArray(src) ? src : [];

                            }

                            else {
                                clone = src && isPlainObject(src) ? src : {};
                            }

                            // Never move original objects, clone them
                            target[name] = extend(clone, deep, copy);
                        }

                        // Don't bring in undefined values
                        else if (copy !== undefined) {
                            target[name] = copy;
                        }
                    }
                }
            }

            return target;
        }

        return extend;
    }

).attach('$b');