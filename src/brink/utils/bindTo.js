$b(

    [
        './assert',
        './computed',
        './isBrinkInstance'
    ],

    function (assert, computed, isBrinkInstance) {

        'use strict';

        return function (a, prop) {

            var b,
                val;

            assert('Object must be an instance of Brink.Object or Brink.Class', isBrinkInstance(a));

            val = a.get(prop);

            b = computed({

                get : function () {
                    return a ? a.get(prop) : val;
                },

                set : function (val) {
                    val = val;
                    return a ? a.set(prop, val) : val;
                },

                __didChange : function () {
                    return b.didChange();
                },

                didChange : function () {

                },

                value : val
            });

            a.watch(b.__didChange, prop);

            return b;
        };
    }

).attach('$b');