$b(
    [
        '../utils/get',
        '../utils/set',
        '../utils/computed'
    ],

    function (get, set, computed) {

        'use strict';

        return (function (type, options) {

            if (typeof type === 'object') {
                options = type;
                type = 'string';
            }

            type = type || 'string';

            options = options || {};

            var attr = computed({

                get : function (key) {

                    var data;

                    data = this.__meta.data;

                    if (typeof data[key] === 'undefined') {
                        return options.defaultValue;
                    }

                    return data[key];
                },

                set : function (val, key) {

                    var meta,
                        data,
                        dirty,
                        dirtyIdx,
                        pristine;

                    meta = this.__meta;
                    dirty = get(this, 'dirtyAttributes');
                    data = meta.data;
                    pristine = meta.pristineData;

                    if (dirty) {

                        if (typeof pristine[key] === 'undefined') {
                            pristine[key] = data[key];
                            dirty.push(key);
                        }

                        else {

                            dirtyIdx = dirty.indexOf(key);

                            if (pristine[key] === val && ~dirtyIdx) {
                                dirty.remove(key);
                            }

                            else if (!~dirtyIdx) {
                                dirty.push(key);
                            }
                        }
                    }

                    data[key] = val;
                }

            });

            attr.meta({

                type : type,
                isAttribute : true,
                options : options,

                serialize : function () {
                    return get(this, attr.meta().key);
                },

                deserialize : function (val) {
                    set(this, attr.meta().key, val);
                    return val;
                }
            });

            return attr;
        });
    }

).attach('$b');