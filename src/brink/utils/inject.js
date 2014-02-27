$b(

    [],

    function () {

        'use strict';

        return function (Class, p, v) {

            Class.inject.apply(Class, arguments);

        };
    }

).attach('$b');
