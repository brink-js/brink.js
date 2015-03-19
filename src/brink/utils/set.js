$b(

    [
        './get',
        './getObjKeyPair'
    ],

    /***********************************************************************
    @class Brink
    ************************************************************************/
    function (get, getObjKeyPair) {

        'use strict';

        /***********************************************************************
        Set property/properties or a nested property on an `Object`. Works on POJOs as well
        as `Brink.Object` instances.

        **Setting single properties:**

        ```javascript
        var obj = {};

        $b.set(obj, 'test', 'test');
        $b.set(obj, 'some.nested.key', 'test2');

        console.log(obj); // { test: 'test', some: { nested: { key: 'test2' } } }

        ```

        **Setting multiple properties:**

        ```javascript
        var obj = {};

        $b.set(obj, {test : 'test', test2 : 'test2'});

        console.log(obj); // { test: 'test', test2: 'test2' }

        ```

        @method set
        @param {Object} obj The object containing the property/properties to set.
        @param {String|Object} key The name of the property to set.
        If setting multiple properties, an `Object` containing key : value pairs.
        @param {Any} [val] The value of the property.
        @return {Object} The Object passed in as the first argument.
        ************************************************************************/
        var set = function (obj, key, val, quiet, skipCompare) {

            var i,
                old,
                isDiff;

            if (typeof key === 'string') {

                obj = getObjKeyPair(obj, key, true);
                key = obj[1];
                obj = obj[0];
                old = get(obj, key);

                isDiff = old !== val;

                if (skipCompare || isDiff) {

                    if (obj instanceof $b.Object) {

                        if (isDiff) {
                            if (old instanceof $b.Object) {
                                old.__removeReference(obj);
                            }

                            if (val instanceof $b.Object) {
                                val.__addReference(obj, key);
                            }
                        }

                        if (obj.__meta.setters[key]) {
                            obj.__meta.setters[key].call(obj, val, key);
                        }

                        else {

                            if (obj.__meta.pojoStyle) {
                                obj[key] = val;
                            }

                            obj.__meta.values[key] = val;
                        }

                        if (!quiet) {
                            obj.propertyDidChange(key);
                        }
                    }

                    else {
                        obj[key] = val;
                    }
                }

                return obj;
            }

            else if (arguments.length === 2) {

                for (i in key) {
                    set(obj, i, key[i], val, quiet);
                }

                return obj;
            }

            $b.error('Tried to call `set` with unsupported arguments', arguments);
        };

        return set;
    }

).attach('$b');
