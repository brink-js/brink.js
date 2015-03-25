$b(

    [],

    function () {

        'use strict';

        return function (fn) {

            if (typeof document !== 'undefined') {

                if (document.readyState === 'complete') {
                    fn();
                    return;
                }

                document.addEventListener('DOMContentLoaded', fn);

                return;
            }

            fn();

        };
    }

).attach('$b');