$b(

    [
    ],

    function () {

        'use strict';

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
