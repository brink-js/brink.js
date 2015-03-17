$b(

    [
        './get'
    ],

    /***********************************************************************
    @class Brink
    ************************************************************************/
    function (get) {

        'use strict';

        /***********************************************************************
        Given an object and a 'nested property', return the sub-object and key name.

        ```javascript
        var obj = {
            some : {
                nested : {
                    key : 'test'
                }
            }
        };

        console.log($b.getObjKeyPair(obj, 'some.nested.key')) // [ { key: 'test' }, 'key' ]
        ```

        @method getObjKeyPair
        @param {Object} The object containing the nested key.
        @param {String} key The nested key.
        @param {Boolean} [createIfNull=false] Whether to create objects for nested keys if the path would be invalid.
        @return {Array} An `Array` of `[obj, unNestedKeyName]`
        ************************************************************************/
        return function (obj, key, createIfNull) {

            var i,
                val;

            key = key.split('.');

            for (i = 0; i < key.length - 1; i ++) {
                val = get(obj, key[i]);
                if (val == null && createIfNull) {
                    val = obj[key[i]] = {};
                }
                obj = val;
            }

            key = key.pop();

            return [obj, key];
        };
    }

).attach('$b');
