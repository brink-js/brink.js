$b(

    [
        '../core/Class'
    ],

    function (Class) {

        'use strict';

        return Class({

            find : function (model, q) {
                return this.store.find(model, q);
            },

            all : function (model) {
                return this.store.all(model);
            },

            saveRecord : function (model) {

                if (model.get('isNew')) {
                    return this.createRecord(model);
                }

                return this.updateRecord(model);
            },

            fetch : $b.required('Adapters must implement the `fetch()` method'),
            fetchAll : $b.required('Adapters must implement the `fetchAll()` method'),
            createRecord : $b.required('Adapters must implement the `createRecord()` method'),
            updateRecord : $b.required('Adapters must implement the `updateRecord()` method'),
            deleteRecord : $b.required('Adapters must implement the `deleteRecord()` method')
        });
    }

).attach('$b');