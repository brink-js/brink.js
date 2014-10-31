$b(

    [
        './get'
    ],

    function (get) {

        'use strict';

        return function (obj, key) {

            var i;

            key = key.split('.');

            for (i = 0; i < key.length - 1; i ++) {
                obj = get(obj, key[i]);
            }

            key = key.pop();

            return [obj, key];
        };
    }

).attach('$b');
