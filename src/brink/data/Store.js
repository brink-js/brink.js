$b(

    [
        './Model',
        './Collection',
        '../core/Class',
        '../utils/get',
        '../utils/set'
    ],

    function (Model, Collection, Class, get, set) {

        'use strict';

        var Store = Class({

            /***********************************************************************

            The store is a glorified cache, with convenience methods to work with your
            Adapters to update or query your persistence layer as needed.

            By having a Store, you will need to access your persistence layer
            much less frequently and you will be able to return records from the
            store instantly.

            @module Brink
            @submodule data

            @class Brink.Store
            @constructor
            ************************************************************************/

            init : function () {
                this.__registry = $b.__models;
                this.__store = {};
            },


            /***********************************************************************
            Clear the store. Removes all record instances in the store.
            This does not in any way affect the persistence layer or call any methods
            on the models' adapters.

            @method clear
            @param  {Brink.Model} Model
            ************************************************************************/

            clear : function () {
                this.__store = {};
            },

            /***********************************************************************
            Adds new record(s) to the store.
            This does not in any way affect the persistence layer or call any methods
            on the models' adapters.

            @method add
            @param  {String|Model} model The modelKey or Model class to add records for.
            @param  {Model|Array} records The record or records you want to add to the store.
            @return {Brink.Collection}
            ************************************************************************/

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

                    if (!~collection.indexOf(record)) {
                        set(record, 'store', this);
                        collection.push(record);
                    }
                }

                return collection;
            },

            /***********************************************************************
            Removes record(s) from the store.
            This does not in any way affect the persistence layer or call any methods
            on the models' adapters.

            @method remove
            @param  {String|Model} model The modelKey or Model class to remove records for.
            @param  {Model|Array} The record or records you want to remove from the store.
            @return {Brink.Collection}
            ************************************************************************/

            remove : function (mKey, records) {

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
                    collection.remove(records[i]);
                }

                return collection;
            },

            /***********************************************************************
            Returns all the records of a specific type in the store.

            @method all
            @param  {String|Model} model The modelKey or Model class of the records you want to get.
            @return {Brink.Collection}
            ************************************************************************/

            all : function (mKey) {
                return this.getCollection(mKey);
            },

            /***********************************************************************
            Returns all the records of a specific type from the persistence layer
            and adds them to the store.

            @method fetchAll
            @param  {String|Model} model The modelKey or Model class of the records you want to get.
            @return {Brink.Collection}
            ************************************************************************/

            fetchAll : function (mKey) {

                var i,
                    item,
                    model,
                    record,
                    primaryKey;

                model = this.modelFor(mKey);
                primaryKey = model.primaryKey;

                return model.adapter.fetchAll(model).then(function (json) {

                    json = Array.isArray(json) ? json : [json];

                    for (i = 0; i < json.length; i ++) {
                        item = json[i];
                        record = this.findOrCreate(model, item[model.primaryKey]);
                        record.deserialize(item);
                    }

                    return this.all(model);

                }.bind(this));
            },

            /***********************************************************************
            Find a record in the store.

            @method find
            @param  {String|Model} model The modelKey or Model class of the record you want to find.
            @param  {String|Number|Object} q The primary key or an object of parameters you want to match.
            @return {Brink.Model}
            ************************************************************************/

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

                    var p;

                    for (p in q) {
                        if (get(item, p) !== q[p]) {
                            return false;
                        }
                    }

                    return true;

                }, this);
            },

            /***********************************************************************
            Find a record in the store by primary key or create one.

            @method findOrCreate
            @param  {String|Model} model The modelKey or Model class of the record you want to find.
            @param  {String|Number} pk The primary key of the record.
            @return {Brink.Model}
            ************************************************************************/

            findOrCreate : function (mKey, pk) {

                var record;

                if (pk) {
                    record = this.find(mKey, pk);
                }

                if (!record) {
                    record = this.modelFor(mKey).create();
                    set(record, 'pk', pk);
                    this.add(mKey, record);
                }

                return record;
            },

            /***********************************************************************
            Creates a new record and adds it to the store.

            @method createRecord
            @param  {String|Model} model The modelKey or Model class of the record you want to find.
            @param  {Object} data The data you want to populate the record with.
            @return {Brink.Model}
            ************************************************************************/

            createRecord : function (mKey, data) {

                var record;

                record = this.modelFor(mKey).create(data);
                this.add(mKey, record);

                return record;
            },

            /***********************************************************************
            Filters through all records in the store of a specific type and returns matches.

            @method filter
            @param  {String|Model} model The modelKey or Model class of the record you want to find.
            @param  {Function|Object} q An object of parameters you want to match or a filter function.
            @return {Brink.Array}
            ************************************************************************/

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

           /***********************************************************************
            Given a modelKey or collectionKey returns the corresponding Model Class.

            @method modelFor
            @param  {String} model The modelKey or collectionKey to get the Class for.
            @return {Brink.Model}
            ************************************************************************/

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
