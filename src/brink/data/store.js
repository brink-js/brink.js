$b(

    [
        './Model',
        './Collection',
        '../core/Class',
        '../core/Array',
        '../utils/next'
    ],

    function (Model, Collection, Class, Arr, next) {

        'use strict';

        var Store = Class({

            factoryPrefix : '',
            factorySuffix : '',

            __cache : null,
            __registry : null,
            __store : null,

            init : function () {

                this.__cache = {};
                this.__registry = {};
                this.__store = {};
            },

            getTypeKey : function (key) {
                key = key.split('.');
                key = key[key.length - 1];
                key = key.charAt(0).toLowerCase() + key.slice(1);
                return key;
            },

            addToCache : function (model, records) {

                var i,
                    pk,
                    cache,
                    record,
                    factory;

                factory = this.getFactory(model);
                cache = this.__cache[factory.collectionKey] = this.__cache[factory.collectionKey] || {};

                for (i = 0; i < records.length; i ++) {

                    record = records[i];
                    pk = record.get('pk');

                    cache[pk] = record;
                }

                return cache;
            },

            removeFromCache : function (model, records) {

                var i,
                    pk,
                    cache,
                    record,
                    factory;

                factory = this.getFactory(model);
                cache = this.__cache[factory.collectionKey] = this.__cache[factory.collectionKey] || {};

                for (i = 0; i < records.length; i ++) {

                    record = records[i];
                    pk = record.get('pk');

                    cache[pk] = null;
                }

                return cache;
            },

            findInCache : function (model, id) {

                var cache,
                    factory;

                factory = this.getFactory(model);
                cache = this.__cache[factory.collectionKey] = this.__cache[factory.collectionKey] || {};
                return cache[id];
            },

            findInCacheOrCreate : function (model, id) {

                var record,
                    factory;

                factory = this.getFactory(model);

                if (id) {
                    record = this.findInCache(model, id);
                }

                if (!record) {
                    record = factory.create();
                    record.set('pk', id);
                    this.add(factory, record);
                }

                return record;
            },

            getCollection : function (model) {

                var factory,
                    collection;

                factory = this.getFactory(model);

                if (!factory) {
                    $b.error('No model was found for \'' + model + '\'');
                }

                collection = this.__store[factory.collectionKey];

                if (!collection) {
                    collection = this.__store[factory.collectionKey] = Collection.create({content : Arr.create()});

                    collection.set('factory', factory);
                    collection.set('primaryKey', factory.primaryKey);
                    collection.set('typeKey', factory.typeKey);
                    collection.set('collectionKey', factory.collectionKey);
                }

                return collection;
            },

            getFactory : function (key) {

                var factory,
                    typeKey,
                    normalizedKey;

                factory = typeof key !== 'string' ? key : null;

                if (!factory) {
                    factory = this.__registry[key];
                }

                if (!factory) {

                    normalizedKey = this.container.normalize('model:' + key);
                    typeKey = this.getTypeKey(key);

                    factory = this.container.lookupFactory(normalizedKey);

                    if (factory) {
                        factory.typeKey = factory.typeKey || typeKey;
                        factory.collectionKey = factory.collectionKey || factory.typeKey + 's';
                    }
                }

                if (factory) {
                    factory.store = factory.prototype.store = this;
                }

                return factory;
            },

            registerModel : function (key) {

                var factory = this.getFactory(key);

                this.__registry[factory.typeKey] = factory;
                this.__registry[factory.collectionKey] = factory;

                return factory;
            },

            find : function (model, q) {

                var collection;

                collection = this.getCollection(model);

                if (typeof q === 'number' || typeof q === 'string') {
                    return this.findInCache(model, q);
                }

                return collection.filter(function (item, index, collection) {

                    var p,
                        doesMatch;

                    doesMatch = true;

                    for (p in q) {
                        if (item.get(p) !== q[p]) {
                            doesMatch = false;
                        }
                    }

                    return doesMatch;

                }, this);
            },

            all : function (model) {
                return this.getCollection(model);
            },

            fetchUnloadedRecords : function () {

                var p,
                    i,
                    r;

                for (p in this.__cache) {
                    for (i in this.__cache[p]) {
                        r = this.__cache[p][i];
                        if (!r.get('isLoaded')) {
                            r.fetchRecord();
                        }
                    }
                };
            },

            fetch : function (model, q) {

                var record,
                    factory;

                factory = this.getFactory(model);

                return factory.adapter.fetch(factory, q).then(function (json) {

                    json = json[factory.typeKey] || json;
                    json = Array.isArray(json) ? json[0] : json;

                    record = this.findInCacheOrCreate(model, json[factory.primaryKey]);
                    record.deserialize(json);

                    return record;

                }.bind(this));
            },

            fetchAll : function (model) {

                var i,
                    item,
                    record,
                    records,
                    factory,
                    collection;

                records = [];
                factory = this.getFactory(model);

                return factory.adapter.fetchAll(factory).then(function (json) {

                    json = json[factory.collectionKey] || json;
                    json = Array.isArray(json) ? json : [json];

                    for (i = 0; i < json.length; i ++) {
                        item = json[i];
                        record = this.findInCacheOrCreate(model, item[factory.primaryKey]);
                        record.deserialize(item);
                        records.push(record);
                    }

                    collection = Collection.create({content : records});
                    return collection;

                }.bind(this));
            },

            add : function (model, records) {

                if (model instanceof Model || model instanceof Collection) {
                    records = model;
                    model = model.factory || model.constructor;
                }

                records = [].concat(records);
                this.addToCache(model, records);
                return this.getCollection(model).pushObjects(records);
            },

            remove : function (model, records) {

                if (model instanceof Model || model instanceof Collection) {
                    records = model;
                    model = model.factory || model.constructor;
                }

                records = [].concat(records);
                this.removeFromCache(model, records);
                return this.getCollection(model).removeObjects(records);
            },

            injectType : function (type, data) {

                var i,
                    item,
                    record,
                    factory;

                factory = this.getFactory(type);
                data = Array.isArray(data) ? data : [data];

                for (i = 0; i < data.length; i ++) {
                    item = data[i];
                    if (item) {
                        record = this.findInCacheOrCreate(factory, item[factory.primaryKey]);
                        record.deserialize(item);
                    }
                }
            },

            inject : function (type, data) {

                var p;

                if (typeof type === 'object') {
                    data = type;
                    type = null;
                }

                if (type) {
                    return this.injectType(type, data);
                }

                for (p in data) {
                    if (this.__registry[p]) {
                        this.injectType(p, data[p]);
                    }
                }

                next(this.fetchUnloadedRecords);
            }
        });

        return Store.create();
    }

).attach('$b');