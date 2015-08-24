$b(

    [
        '../core/Class'
    ],

    function (Class) {

        'use strict';

        var Adapter = Class({

            /***********************************************************************

            Adapters are how you interface with your persistence layer.
            Adapters receive requests from the store and perform the necessary actions,
            returning promises that get resolved when operations are complete.



            Generally, you will not interact with Adapters directly, the Store and Models will proxy
            requests to your adapters. This allows you to easily swap out Adapters
            if you want to change your persistence layer, and even mix and match adapters
            for different models.



            For help with writing your own Adapter, {{#crossLink "Brink.RESTAdapter"}}{{/crossLink}}
            can be used as a good reference implementation.

            @class Brink.Adapter
            @constructor

            @module Brink
            @submodule data
            ************************************************************************/

            __init : function () {

                var meta;

                meta = this.constructor.__meta;

                if (this.fetch === Adapter.prototype.fetch) {
                    $b.warn('`' + meta.name + '` must implement the `fetch()` method');
                }

                if (this.fetchAll === Adapter.prototype.fetchAll) {
                    $b.warn('`' + meta.name + '` must implement the `fetchAll()` method');
                }

                if (this.createRecord === Adapter.prototype.createRecord) {
                    $b.warn('`' + meta.name + '` must implement the `createRecord()` method');
                }

                if (this.updateRecord === Adapter.prototype.updateRecord) {
                    $b.warn('`' + meta.name + '` must implement the `updateRecord()` method');
                }

                if (this.deleteRecord === Adapter.prototype.deleteRecord) {
                    $b.warn('`' + meta.name + '` must implement the `deleteRecord()` method');
                }

                return this._super.apply(this, arguments);
            },

            /***********************************************************************
            Fetches a record from the persistence layer.

            @method fetch
            @param  {Model} record The record you want to fetch.
            @return {Promise}
            ************************************************************************/
            fetch : $b.F,

            /***********************************************************************
            Fetches all records of a Model from the persistence layer.

            @method fetchAll
            @param  {ModelClass} Model The Class you want to fetch records of.
            @return {Promise}
            ************************************************************************/
            fetchAll : $b.F,

            /***********************************************************************
            Saves a new record to your persistence layer.

            @method createRecord
            @param  {Model} record The record you want to create.
            @return {Promise}
            ************************************************************************/

            createRecord : $b.F,

            /***********************************************************************
            Updates a record in your persistence layer.

            @method updateRecord
            @param  {Model} record The record you want to update.
            @return {Promise}
            ************************************************************************/

            updateRecord : $b.F,

            /***********************************************************************
            Deletes a record in your persistence layer.

            @method deleteRecord
            @param  {Model} record The record you want to delete.
            @return {Promise}
            ************************************************************************/

            deleteRecord : $b.F,


            /***********************************************************************
            Saves a record in your persistence layer.

            @method saveRecord
            @param  {Model} record The record you want to save. This will call createRecord()
            or updateRecord(), depending on whether or not the record is new.
            @return {Promise}
            ************************************************************************/

            saveRecord : function (record) {

                if (record.get('isNew')) {
                    return this.createRecord(record);
                }

                return this.updateRecord(record);
            },

            /***********************************************************************
            Hook for doing anything you need to based on a new Model definition.

            @method registerModel
            @param  {Model} Model
            ************************************************************************/

            registerModel : function () {
                // Hook for if you need to do any fancy pants stuff...
            }

        });

        return Adapter;
    }

).attach('$b');
