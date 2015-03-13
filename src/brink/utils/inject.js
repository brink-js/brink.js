$b(

    [],

    function () {

        'use strict';

        return function (Class) {

            Class.inject.apply(Class, arguments);

        };
    }

).attach('$b');
