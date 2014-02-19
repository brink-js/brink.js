$b(

    [
        './error'
    ],

    function (error) {

        'use strict';

        return function (msg, test) {

            if (!test) {
                error(msg);
            }
        };
    }

).attach('$b');
