$b(

    [],

    function () {

        'use strict';

        return function (fn) {

            function ready () {

                if (fn) {
                    fn();
                }
            }

            if (typeof document !== 'undefined') {

                if (document.readyState === 'complete') {
                    ready();
                    return;
                }

                document.addEventListener('DOMContentLoaded', ready);

                return;
            }

            fn();

        };
    }

).attach('$b');