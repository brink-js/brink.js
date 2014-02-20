$b(

    [
        './assert',
        './computed',
        './isBrinkInstance'
    ],

    function (assert, computed, isBrinkInstance) {

        'use strict';

        return function (o, prop) {

            var value;

            assert('Object must be an instance of Brink.Object or Brink.Class', isBrinkInstance(o));

            value = o.get(prop);

            return computed({

                get : function () {
                    return o ? o.get(prop) : value;
                },

                set : function (val) {
                    value = val;
                    return o ? o.set(prop, val) : value;
                },

                value : value
            });

            return o;
        };
    }

).attach('$b');