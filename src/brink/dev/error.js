$b(

    function () {

        'use strict';

        return function (msg) {
            throw new Error(msg);
        };
    }

).attach('$b');