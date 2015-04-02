$b(
    [
        './Collection',
        '../utils/get',
        '../utils/set',
        '../utils/computed'
    ],

    function (Collection, get, set, computed) {

        'use strict';

        return (function (mKey, options) {

            var ModelClass;

            ModelClass = $b.__models[mKey];

            if (!ModelClass) {
                throw new Error('No model was found with a modelKey of "' + mKey + '"');
            }

            options = options || {};

            var hasMany = computed({

                get : function (key) {
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
                    store = this.__store;
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

                serialize : function () {

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
                        val = val.serialize(options.embedded);
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

                    return val;
                },

                deserialize : function (val) {

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
                    store = this.__store;

                    val = val || [];

                    if (options.embedded) {
                        hasMany.meta({fromJSON : val});
                    }

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
                                record = ModelClass.create();
                                record.deserialize(val[i]);
                            }

                            else {

                                if (!store) {
                                    record = ModelClass.create({pk : val[i]});
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

                revert : function () {

                    var meta,
                        json;

                    meta = hasMany.meta();

                    json = meta.fromJSON;

                    if (json) {
                        meta.deserialize.call(this, json);
                    }
                }

            });

            return hasMany;
        });
    }

).attach('$b');