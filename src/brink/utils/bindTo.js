$b(

    [
        './computed',
        './getObjKeyPair',
        './isBrinkInstance'
    ],

    function (computed, getObjKeyPair, isBrinkInstance) {

        'use strict';

        return function (a, prop, isDefined) {

            var b;

            if (arguments.length > 1) {

                $b.assert('Object must be an instance of Brink.Object or Brink.Class', isBrinkInstance(a));

                if (!isDefined) {
                    a.prop(prop);
                }

                b = computed({

                    get : function () {
                        return a ? a.get(prop) : null;
                    },

                    set : function (val) {
                        val = val;
                        return a ? a.set(prop, val) : val;
                    },

                    __didChange : function () {
                        return b.didChange();
                    },

                    value : a.get(prop)
                });

                a.watch(prop, b.__didChange);
            }

            else {

                prop = a;

                b = computed({

                    watch : prop,

                    get : function () {
                        return this.get(prop);
                    },

                    set : function (val) {
                        return this.set(prop, val);
                    }
                });
            }

            return b;
        };
    }

).attach('$b');