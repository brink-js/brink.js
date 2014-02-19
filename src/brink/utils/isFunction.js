$b(

    function () {

        'use strict';

        return function (obj) {
            return typeof obj == 'function';
        };
    }

).attach('$b');