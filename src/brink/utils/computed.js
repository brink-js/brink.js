$b(

    [
        './flatten',
        './isFunction',
        './expandProps'
    ],

    function (flatten, isFunction, expandProps) {

        'use strict';

        return function (o, v) {

            if (isFunction(o)) {
                o = {
                    watch : flatten([].slice.call(arguments, 1)),
                    get : o
                };
            }

            o.watch = expandProps(o.watch ? [].concat(o.watch) : []);
            o.__isComputed = true;

            return o;
        };
    }

).attach('$b');