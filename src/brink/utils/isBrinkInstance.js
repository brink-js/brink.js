$b(

    [

    ],

    function () {

        'use strict';

        return function (obj) {
            return obj.constructor.__meta.isObject;
        };
    }

).attach('$b');