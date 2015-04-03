$b(

    [
        './Adapter',
        '../utils/xhr'
    ],

    function (Adapter, xhr) {

        'use strict';

        return Adapter({

            host : '',
            prefix : '',
            pluralizeURLs : false,

            getURL : function (model, usePK) {

                var url;

                url = [this.get('host'), this.get('prefix')];
                url.push(model.url || (this.pluralizeURLs ? model.collectionKey : model.modelKey));

                if (usePK) {
                    url.push(model.get('pk'));
                }

                return url.join('/').replace(/([^:]\/)\/+/g, '$1');
            },

            fetch : function (record) {
                return xhr(this.getURL(record, true), null, 'GET');
            },

            fetchAll : function (model) {
                return xhr(this.getURL(model, false), null, 'GET');
            },

            createRecord : function (record) {
                return xhr(this.getURL(record, false), record.serialize(), 'POST');
            },

            updateRecord : function (record) {
                return xhr(this.getURL(record, true), record.serialize(), 'PUT');
            },

            deleteRecord : function (record) {
                return xhr(this.getURL(record, true), null, 'DELETE');
            }
        });
    }

).attach('$b');