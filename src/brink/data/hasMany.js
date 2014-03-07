$b(

    [
        './Model',
        './Collection',
        '../utils/computed',
        '../utils/clone'
    ],

    function (Model, Collection, computed, clone) {

        'use strict';

        return function (factoryName, options) {

            var attr = computed({

                type : 'hasMany',
                factory : null,
                options : options,
                isRelationship : true,

                value : options.defaultValue,

                get : function () {
                    return this.__data ? this.__data[attr.key] : null;
                },

                set : function (val) {

                    var key,
                        data,
                        factory,
                        isDirty,
                        dirtyAttrs,
                        dirtyIndex;

                    key = attr.key;

                    factory = attr.factory = attr.factory || this.store.getFactory(factoryName);

                    data = this.__data = this.__data || {};
                    this.__originalData = this.__originalData || clone(data);
                    isDirty = this.__originalData[key] !== val;

                    dirtyAttrs = this.get('dirtyAttributes');
                    dirtyIndex = dirtyAttrs.indexOf(key);

                    if (dirtyIndex < 0 && isDirty) {
                        dirtyAttrs.push(key);
                        this.set('dirtyAttributes', dirtyAttrs);
                    }

                    else if (!isDirty && dirtyIndex >= 0) {
                        dirtyAttrs.splice(dirtyIndex, 1);
                        this.set('dirtyAttributes', dirtyAttrs);
                    }

                    if (val) {
                        $b.assert('Invalid relationship assignment. Expected value of type : $b.Collection', val instanceof Collection);
                    }

                    data[key] = val;
                },

                serialize : function () {

                    var val,
                        data;

                    data = this.__data = this.__data || {};

                    val = data ? data[attr.key] : null;

                    return val ? val.serialize(options.embedded) : null;
                },

                deserialize : function (val) {

                    var i,
                        meta,
                        record,
                        records,
                        factory,
                        collection;

                    val = [].concat(val);
                    records = [];

                    factory = attr.factory = attr.factory || this.store.getFactory(factoryName);

                    collection = Collection.create();

                    for (i = 0; i < val.length; i ++) {

                        if (val[i]) {

                            if (options.embedded && typeof val[i] === 'object') {
                                record = factory.create();
                                record.deserialize(val[i]);
                            }

                            else {
                                record = this.store.findInCacheOrCreate(factoryName, val);
                            }

                            records.push(record);
                        }
                    }

                    if (records.length) {
                        collection.set('factory', factory);
                        collection.set('primaryKey', factory.primaryKey);
                        collection.set('typeKey', factory.typeKey);
                        collection.set('collectionKey', factory.collectionKey);

                        collection.push.apply(collection, records);
                    }

                    return collection;
                }

            });

            return attr;
        };
    }

).attach('$b');