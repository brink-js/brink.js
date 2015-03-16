$b(

    [
    ],

    /***********************************************************************
    @class Brink
    ************************************************************************/
    function () {

        'use strict';
        /***********************************************************************
        Get a property or nested property on an object. Works on POJOs as well
        as `Brink.Object` instances.

        ```javascript
        var obj = {
            test : 'test',
            some : {
                nested : {
                    key : 'test2'
                }
            }
        };

        console.log($b.get(obj, 'test')); // 'test';
        console.log($b.get(obj, 'some.nested.key')); // 'test2';
        ```

        @method get
        @param {Object} The object containing the property.
        @param {String} key The property or nested property to get.
        @return {Any} The value of the property.
        ************************************************************************/
        return function (obj, key) {

            var i,
                k;

            key = key.split('.');

            for (i = 0; i < key.length; i ++) {
                k = key[i];

                if (!obj) {
                    return null;
                }

                if (obj instanceof $b.Object) {

                    if (obj.__meta.getters[k]) {
                        obj = obj.__meta.getters[k].call(obj, k);
                    }

                    else {
                        obj = obj.__meta.pojoStyle ? obj[k] : obj.__meta.values[k];
                    }
                }

                else {
                    obj = obj[k];
                }
            }

            return obj;
        };
    }

).attach('$b');
