$b(

    function () {

        'use strict';

        return function (s) {
            return typeof s === 'string' ? s.replace(/^\s+|\s+$/gm, '') : s;
        };
    }

).attach('$b');