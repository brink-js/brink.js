$b(

    [
        './get',
        './getObjKeyPair'
    ],

    function (get, getObjKeyPair) {

        'use strict';

        return function (obj, key, val, quiet, skipCompare) {

            var i;

            if (typeof key === 'string') {

                obj = getObjKeyPair(obj, key);
                key = obj[1];
                obj = obj[0];

                if (skipCompare || get(obj, key) !== val) {

                    if (obj instanceof $b.Object) {

                        if (obj.__meta.setters[key]) {
                            val = obj.__meta.setters[key].call(obj, val, key);
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

                return val;
            }

            else if (arguments.length === 1) {

                for (i in key) {
                    obj.set(i, key[i], val, quiet);
                }

                return obj;
            }

            $b.error('Tried to call `set` with unsupported arguments', arguments);
        };
    }

).attach('$b');
