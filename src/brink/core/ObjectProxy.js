$b(

    [
        './Object',
        '../utils/get',
        '../utils/set',
        '../utils/getObjKeyPair'
    ],

    function (Obj, get, set, getObjKeyPair) {

        'use strict';

        return Obj({

            proxy : null,

            __hasProp : function (key) {

                var obj,
                    meta;

                obj = getObjKeyPair(this, key);
                key = obj[1];
                obj = obj[0] || this;

                meta = obj.__meta;

                return typeof meta.properties[key] !== 'undefined';
            },

            get : function (key) {
                return get(
                    this.__hasProp(key) ? this : this.get('proxy'),
                    key
                );
            },

            set : function (key, val, quiet, skipCompare) {
                return set(
                    this.__hasProp(key) ? this : this.get('proxy'),
                    key,
                    val,
                    quiet,
                    skipCompare
                );
            }
        });
    }

).attach('$b');