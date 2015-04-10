$b(

    [
        './Adapter',
        '../utils/Q'
    ],

    function (Adapter, Q) {

        'use strict';

        /* jscs : disable */

        /**
        * Generates a GUID string.
        * @returns {String} The generated GUID.
        * @example af8a8416-6e18-a307-bd9c-f2c947bbb3aa
        * @author Slavik Meltser (slavik@meltser.info).
        * @link http://slavik.meltser.info/?p=142
        */

        function guid () {
            function _p8(s) {
                var p = (Math.random().toString(16) + '000000000').substr(2, 8);
                return s ? '-' + p.substr(0, 4) + '-' + p.substr(4, 4) : p ;
            }
            return _p8() + _p8(true) + _p8(true) + _p8();
        }

        /* jscs : enable */

        return Adapter({

            init : function () {
                this.__cache = {};
            },

            loadRecords : function (key) {

                if (!this.__cache[key]) {
                    this.__cache[key] = JSON.parse(localStorage[key]);
                }

                return this.__cache[key];
            },

            saveRecords : function (key) {
                localStorage[key] = JSON.stringify(this.__cache[key]);
            },

            fetch : function (record) {

                var records,
                    deferred;

                deferred = Q.deferred();
                records = this.loadRecords(record.collectionKey);

                setTimeout(function () {
                    deferred.resolve(records[record.get('pk')]);
                }, 0);

                return deferred.promise;
            },

            fetchAll : function (model) {

                var records,
                    deferred;

                deferred = Q.deferred();
                records = this.loadRecords(model.collectionKey);

                setTimeout(function () {
                    deferred.resolve(records);
                }, 0);

                return deferred.promise;
            },

            createRecord : function (record) {
                record.set('pk', guid());
                return this.updateRecord(record);
            },

            updateRecord : function (record) {

                var json,
                    records,
                    deferred;

                json = record.serialize();

                deferred = Q.deferred();
                records = this.loadRecords(record.collectionKey);
                records[record.get('pk')] = json;
                this.saveRecords(record.collectionKey);

                setTimeout(function () {
                    deferred.resolve(json);
                }, 0);

                return deferred.promise;
            },

            deleteRecord : function (record) {

                var records,
                    deferred;

                deferred = Q.deferred();
                records = this.loadRecords(record.collectionKey);
                delete records[record.get('pk')];

                this.saveRecords(record.collectionKey);

                setTimeout(function () {
                    deferred.resolve();
                }, 0);

                return deferred.promise;
            }
        });
    }

).attach('$b');