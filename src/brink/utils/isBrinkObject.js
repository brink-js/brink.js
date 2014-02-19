$b(

    function () {

        'use strict';

        return function (obj) {
            return obj.__isObject;
        };
    }

).attach('$b');