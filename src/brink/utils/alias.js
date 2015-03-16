$b(

    [
        './computed'
    ],

    /***********************************************************************
    @class Brink
    ************************************************************************/
    function (computed) {

        'use strict';
        /***********************************************************************
        Alias a property to another property on the object.

        ```javascript

        var obj = $b.Object.create({
            a : 'test',
            b : $b.alias('a')
        });

        console.log(obj.a, obj.b); //test, test
        this.b = 'test2';
        console.log(obj.a, obj.b); // test2, test2


        ```

        ```javascript

        var obj = $b.Object.create({a : 'test'});
        obj.prop('b', $b.alias('a'));

        console.log(obj.a, obj.b); // test, test

        obj.b = 'test2';

        console.log(obj.a, obj.b); // test2, test2

        ```

        @method alias
        @param {String} key The property to alias.
        @return {ComputedProperty} A computed property with a getter/setter that references the alias.
        ************************************************************************/
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
