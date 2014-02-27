$b(

    [
        './Adapter',
        '../browser/ajax',
        '../utils/promise'
    ],

    function (Adapter, ajax, promise) {

        'use strict';

        return Adapter({

            host : '',
            prefix : '',

            ajaxOptions : function (url, method) {

                return {
                    url : url,
                    type : method,
                    contentType : "application/json",
                    dataType : "json"
                };
            },

            ajax : function (url, data, method, options) {

                options = options || this.ajaxOptions(url, method);

                data = data || {};

                return promise(function (resolve, reject) {

                    if (method === "GET") {
                        options.data = data;
                    }

                    else {
                        options.data = JSON.stringify(data);
                    }

                    options.success = function (json) {
                        Ember.run(null, resolve, json);
                    };

                    options.error = function(jqXHR, textStatus, errorThrown) {
                        if (jqXHR) {
                            jqXHR.then = null;
                        }

                        Ember.run(null, reject, jqXHR);
                    };


                    ajax(options);
                });
            },

            httpGet : function (url, data) {
                return this.ajax(url, data, 'GET');
            },

            httpPost : function (url, data) {
                return this.ajax(url, data, 'POST');
            },

            httpPut : function (url, data) {
                return this.ajax(url, data, 'PUT');
            },

            httpDelete : function (url, data) {
                return this.ajax(url, data, 'DELETE');
            },

            getURL : function (factory, id) {

                var url;

                url = [this.get('host'), this.get('prefix')];

                url.push(factory.url || factory.typeKey);

                if (id) {
                    url.push(id);
                }

                return url.join('/').replace(/([^:]\/)\/+/g, "$1");
            },

            fetch : function (factory, id) {
                return this.httpGet(
                    this.getURL(factory, id)
                );
            },

            fetchAll : function (factory) {
                return this.httpGet(
                    this.getURL(factory)
                );
            },

            createRecord : function (record) {
                return this.httpPost(
                    this.getURL(record.constructor),
                    record.serialize()
                );
            },

            updateRecord : function (record) {
                return this.httpPut(
                    this.getURL(record.constructor, record.get('pk')),
                    record.serialize()
                );
            },

            deleteRecord : function (record) {
                return this.httpDelete(
                    this.getURL(record.constructor, record.get('pk'))
                );
            }
        });
    }

).attach('$b');
