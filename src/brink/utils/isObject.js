$b(

    function () {

        'use strict';

        var objectTypes = {
            'function': true,
            'object': true,
            'unknown': true
        };

        return function (obj) {
            return obj ? !!objectTypes[typeof obj] : false;
        };
    }

).attach('$b');