$b(

    [
        '../core/Class',
        './Model',
        './Collection',
        '../utils/get',
        '../utils/set'
    ],

    function (Class, Model, Collection, get, set) {

        'use strict';

        var Store = Class({

            init : function () {
                this.__registry = $b.__models;
                this.__store = {};
            },

            clear : function () {
                this.__store = {};
            },

            add : function (mKey, records) {

                var i,
                    l,
                    record,
                    collection;

                if (arguments.length === 1) {
                    records = mKey;
                    records = Array.isArray(records) ? records : [records];
                    mKey = records[0].modelKey;
                }

                else {
                    records = Array.isArray(records) ? records : [records];
                }

                collection = this.getCollection(mKey);

                for (i = 0, l = records.length; i < l; i ++) {
                    record = records[i];
                    record.__store = this;
                    collection.push(record);
                }

                return collection;
            },

            remove : function (mKey, records) {

                var i,
                    l,
                    collection;

                if (arguments.length === 1) {
                    records = mKey;
                    records = Array.isArray(records) ? records : [records];
                    mKey = records[0].modelKey;
                }

                else {
                    records = Array.isArray(records) ? records : [records];
                }

                collection = this.getCollection(mKey);

                for (i = 0, l = records.length; i < l; i ++) {
                    collection.remove(records[i]);
                }

                return collection;
            },

            all : function (mKey) {
                return this.getCollection(mKey);
            },

            find : function (mKey, q) {

                var collection;

                collection = this.getCollection(mKey);

                if (typeof q === 'number' || typeof q === 'string') {
                    return collection.findBy('pk', q);
                }

                if (typeof q === 'function') {
                    return collection.find(q);
                }

                return collection.find(function (item) {

                    var p,
                        doesMatch;

                    doesMatch = true;

                    for (p in q) {
                        if (get(item, p) !== q[p]) {
                            doesMatch = false;
                        }
                    }

                    return doesMatch;

                }, this);
            },

            findOrCreate : function (mKey, pk) {

                var record;

                record = this.find(mKey, pk);

                if (!record) {
                    record = this.modelFor(mKey).create();
                    set(record, 'pk', pk);
                    this.add(mKey, record);
                }

                return record;
            },

            filter : function (mKey, q) {

                var collection;

                collection = this.getCollection(mKey);

                if (typeof q === 'function') {
                    return collection.filter(q);
                }

                return collection.filter(function (item) {

                    var p,
                        doesMatch;

                    doesMatch = true;

                    for (p in q) {
                        if (get(item, p) !== q[p]) {
                            doesMatch = false;
                        }
                    }

                    return doesMatch;

                }, this);
            },

            getCollection : function (mKey) {

                var Class,
                    collection;

                Class = this.modelFor(mKey);

                if (!Class) {
                    throw new Error('No model was found with a modelKey of "' + mKey + '"');
                }

                collection = this.__store[Class.collectionKey];

                if (!collection) {
                    collection = this.__store[Class.collectionKey] = this.createCollection(Class);
                }

                return collection;
            },

            createCollection : function (mKey) {

                var Class,
                    collection;

                Class = this.modelFor(mKey);

                if (!Class) {
                    throw new Error('No model was found with a modelKey of "' + mKey + '"');
                }

                collection = Collection.create();

                set(collection, 'modelClass', Class);

                return collection;
            },

            modelFor : function (mKey) {

                return (
                    typeof mKey !== 'string' ? mKey : this.__registry[mKey]
                );
            },

            destroy : function (destroyRecords) {

                var p;

                if (destroyRecords) {
                    for (p in this.__store) {
                        this.__store[p].destroy(true);
                    }
                }

                this.__registry = null;
                this.__store = {};

                this._super.apply(this, arguments);
            }
        });

        return Store;
    }

).attach('$b');