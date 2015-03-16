$b(

    [
        './computed',
        './getObjKeyPair',
        './isBrinkInstance'
    ],

    /***********************************************************************
    @class Brink
    ************************************************************************/
    function (computed, getObjKeyPair, isBrinkInstance) {

        'use strict';
        /***********************************************************************
        Two-way bind a property on `A` to a property on `B`

        ```javascript

        var a = $b.Object.create({
            test : 'test'
        });

        var b = $b.Object.create({
            test : $b.bindTo(a, 'test')
        });

        console.log(a.test, b.test); // test, test
        b.test = 'test2';
        console.log(a.test, b.test); // test2, test2

        ```

        @method bindTo
        @param {Brink.Object} obj The object that contains the property to alias.
        @param {String} key The property to alias.
        ************************************************************************/
        return function (a, prop, isDefined) {

            var b;

            if (arguments.length > 1) {

                $b.assert('Object must be an instance of Brink.Object or Brink.Class', isBrinkInstance(a));

                if (!isDefined) {
                    a.prop(prop);
                }

                b = computed({

                    get : function () {
                        return a.get(prop);
                    },

                    set : function (val) {
                        val = val;
                        return a.set(prop, val);
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