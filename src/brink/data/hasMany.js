$b(
    [
        './Collection',
        '../utils/get',
        '../utils/set',
        '../utils/computed'
    ],

    function (Collection, get, set, computed) {

        'use strict';

        return (function make (mKey, options) {

            options = options || {};

            if (options.map) {
                options.embedded = true;
            }

            var hasMany = computed({

                get : function (key) {

                    if (!this.__meta.data[key]) {
                        this.__meta.data[key] = Collection.create();
                    }

                    return this.__meta.data[key];
                },

                set : function (val, key) {

                    var meta,
                        data,
                        store,
                        dirty,
                        dirtyIdx,
                        pristine;

                    meta = this.__meta;
                    store = this.store;
                    dirty = get(this, 'dirtyAttributes');
                    data = meta.data;
                    pristine = meta.pristineData;

                    if (dirty) {

                        if (typeof pristine[key] === 'undefined') {

                            if (typeof data[key] === 'undefined') {
                                pristine[key] = options.defaultValue;
                            }

                            else {
                                pristine[key] = data[key];
                            }

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

                    if (val) {
                        $b.assert(
                            'Must be a collection.',
                            val instanceof Collection
                        );
                    }

                    data[key] = val;
                }
            });

            hasMany.meta({

                type : 'hasMany',
                isRelationship : true,
                options : options,

                serialize : function (filter) {

                    var i,
                        val,
                        map,
                        key,
                        val2,
                        meta;

                    meta = hasMany.meta();
                    key = meta.key;
                    map = options.map || {};

                    val = get(this, key);

                    if (val) {
                        val = val.serialize(options.embedded, filter);
                    }

                    if (val && options.map) {

                        val2 = {};

                        for (i = 0; i < val.length; i ++) {

                            if (map.value) {
                                val2[val[i][map.key]] = val[i][map.value];
                            }

                            else {
                                val2[val[i][map.key]] = val[i];
                                delete val[i][map.key];
                            }
                        }

                        val = val2;
                    }

                    if (!filter || filter(meta, key, val)) {
                        return val;
                    }

                },

                deserialize : function (val, override, filter) {

                    var i,
                        j,
                        obj,
                        key,
                        map,
                        obj2,
                        val2,
                        meta,
                        store,
                        record,
                        records,
                        collection;

                    meta = hasMany.meta();
                    key = meta.key;
                    map = options.map || {};
                    store = this.store;

                    val = val || [];

                    if (options.map) {
                        val2 = [];

                        for (i in val) {

                            if (val[i] && !Array.isArray(val[i]) && typeof val[i] === 'object') {
                                obj = val[i];
                            }

                            else {
                                obj = {value : val[i]};
                            }

                            obj.key = i;
                            obj2 = {};

                            for (j in obj) {
                                obj2[map[j] || j] = obj[j];
                            }

                            val2.push(obj2);
                        }

                        val = val2;
                    }

                    records = [];
                    collection = get(this, key) || Collection.create();

                    for (i = 0; i < val.length; i ++) {

                        if (val && val[i]) {

                            if (options.embedded && typeof val[i] === 'object') {

                                record = $b.__models[mKey].create();

                                if (store) {
                                    store.add(mKey, record);
                                }

                                record.deserialize(val[i], override, filter);
                            }

                            else {

                                if (!store) {
                                    record = $b.__models[mKey].create({pk : val[i]});
                                }

                                else {
                                    record = store.findOrCreate(mKey, val[i]);
                                }
                            }

                            records.push(record);
                        }
                    }

                    collection.set('content', records);
                    set(this, key, collection);

                    return collection;
                },

                revert : function (revertRelationships) {

                    var key,
                        val,
                        meta,
                        pristine;

                    meta = hasMany.meta();
                    key = meta.key;
                    pristine = this.__meta.pristineData;

                    if (options.embedded) {
                        val = get(this, key);
                        if (val) {
                            pristine[key] = undefined;
                            val.revertAll(revertRelationships);
                        }
                    }

                    else if (pristine[key]) {
                        set(this, key, pristine[key]);
                    }
                }
            });

            hasMany.clone = function () {
                return make(mKey, options);
            };

            return hasMany;
        });
    }

).attach('$b');
