$b(

    [
        './computed',
        './isBrinkInstance'
    ],

    function (computed, isBrinkInstance) {

        'use strict';

        return function (a, prop, isDefined) {

            var b,
                val;

            $b.assert('Object must be an instance of Brink.Object or Brink.Class', isBrinkInstance(a));

            val = a.get(prop);

            if (!isDefined) {
                a.descriptor(prop);
            }

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

            a.watch(prop, b.__didChange);

            return b;
        };
    }

).attach('$b');