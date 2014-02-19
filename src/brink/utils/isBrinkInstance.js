$b(

    [

    ],

    function () {

        'use strict';

        return function (obj) {
            return obj.constructor.__isObject;
        };
    }

).attach('$b');