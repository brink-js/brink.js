$b(

    [
        '../core/Class'
    ],

    function (Class) {

        'use strict';

        var Adapter = Class({

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

            fetch : $b.F,
            fetchAll : $b.F,
            createRecord : $b.F,
            updateRecord : $b.F,
            deleteRecord : $b.F,

            saveRecord : function (record) {

                if (record.get('isNew')) {
                    return this.createRecord(record);
                }

                return this.updateRecord(record);
            },

            registerModel : function () {
                // Hook for if you need to do any fancy pants stuff...
            }

        });

        return Adapter;
    }

).attach('$b');