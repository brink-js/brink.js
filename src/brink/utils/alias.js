$b.define(

    [
        './computed'
    ],

    function (computed) {

        'use strict';

        return function (s) {

            return computed({

                watch : [s],

                get : function () {
                    return this.get(s);
                },

                set : function (val) {
                    return this.set(s, val);
                }
            });
        };
    }

).attach('$b');
