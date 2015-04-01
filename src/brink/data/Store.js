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
                    Class,
                    collection;

                Class = this.modelFor(mKey);
                collection = this.getCollection(mKey);

                for (i = 0, l = records.length; i < l; i ++) {
                    collection.push(records[i]);
                }

                return collection;
            },

            remove : function (mKey, records) {

                var i,
                    l,
                    Class,
                    collection;

                Class = this.modelFor(mKey);
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

                var meta,
                    Class,
                    collection;

                Class = this.modelFor(mKey);

                if (!Class) {
                    throw new Error('No model was found with a modelKey of "' + mKey + '"');
                }

                meta = Class.__meta;
                collection = this.__store[meta.collectionKey];

                if (!collection) {
                    collection = this.__store[meta.collectionKey] = this.createCollection(Class);
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