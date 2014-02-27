$b(

    [],

    function () {

        'use strict';

        if (typeof window !== 'undefined') {

            include('../../node_modules/component-ajax/index.js');

            return ajax;
        }

        return $b.F;
    }

).attach('$b');