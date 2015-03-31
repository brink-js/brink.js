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
            }
        });

        return Store;
    }

).attach('$b');