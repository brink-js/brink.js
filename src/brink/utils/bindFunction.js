$b(

    [],

    function () {

        'use strict';

        // Faster than Function.prototype.bind in V8, not sure about others.
        return function (fn, scope) {
            return function () {
                return fn.apply(scope, arguments);
            }
        };
    }

).attach('$b');
