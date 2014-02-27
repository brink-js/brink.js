$b(

    [
        './RESTAdapter',
        '../core/Class',
        '../utils/clone',
        '../utils/promise'
    ],

    function (RESTAdapter, Class, clone, promise) {

        'use strict';

        var Model = Class({

            primaryKey : 'id',

            url : null,
            adapter : RESTAdapter.create(),

            typeKey : null,
            collectionKey : null,

            __data : null,
            __dirtyAttributes : null,

            __currentPromise : null,

            __isDirty : false,
            __isSaving : false,
            __isLoaded : false,
            __isDeleting : false,
            __isDeleted : false,

            pk : $b.computed({

                watch : ['primaryKey'],

                get : function () {

                    var pk = this.get('primaryKey');

                    if (!pk) {
                        return null;
                    }

                    return this.get(pk);
                },

                set : function (val) {

                    var pk = this.get('primaryKey');

                    return this.set(pk, val);
                }
            }),

            dirtyAttributes : $b.computed({

                watch : ['__dirtyAttributes'],

                get : function () {
                    return this.get('__dirtyAttributes') || [];
                },

                set : function (val) {

                    val = val || [];

                    this.set('__dirtyAttributes', val);
                    this.set('__isDirty', val && !!val.length);

                    return val;
                }

            }),

            isValid : $b.computed(function () {
                return this.validate();
            }),

            isNew : $b.computed(function () {
                return this.primaryKey ? !this.get('pk') : false;
            }, 'pk'),

            isLoaded : $b.computed(function () {
                return this.get('__isLoaded');
            }, '__isLoaded'),

            isLoading : $b.computed(function () {
                return !this.get('__isLoaded');
            }, '__isLoaded'),

            isDeleted : $b.computed(function () {
                return this.get('__isDeleted');
            }, '__isDeleted'),

            isClean : $b.computed(function () {
                return !this.get('isDirty');
            }, 'isDirty'),

            descriptor : function (key, val) {

                var meta = this.__meta;

                val = this._super.apply(this, arguments);

                if (val.isAttribute) {
                    meta.attributes.push(p);
                }

                else if (val.isRelationship) {
                    meta.relationships.push(p);
                }

                return val;
            },

            __parsePrototype : function () {

                var meta = this.__meta = this.__meta || {};

                meta.atttributes = clone(meta.attributes || []);
                meta.relationships = clone(meta.relationships || []);

                this._super();
            },

            getAttributes : function () {
                return this.__meta.attributes;
            },

            getRelationships : function () {
                return this.__meta.relationships;
            },

            serialize : function (isNested) {

                var p,
                    pk,
                    key,
                    meta,
                    json,
                    nestedJson,
                    attributes,
                    properties,
                    relationships;

                pk = this.get('pk');
                json = {};
                attributes = this.getAttributes();
                relationships = this.getRelationships();

                properties = this.getProperties(attributes.concat(relationships));

                for (p in properties) {

                    meta = this.constructor.metaForProperty(p);
                    key = meta.options.key || p;

                    json[key] = meta.serialize.call(this);
                }

                if (this.primaryKey) {
                    json[this.primaryKey] = pk;
                }

                if (isNested) {
                    nestedJson = json;
                    json = {};
                    json[this.typeKey] = nestedJson;
                }

                return json;
            },

            deserialize : function (json) {

                var p,
                    pk,
                    key,
                    meta,
                    item,
                    data,
                    jsonItem,
                    attributes,
                    properties,
                    relationships;

                data = {};
                attributes = this.getAttributes();
                relationships = this.getRelationships();

                properties = this.getProperties(attributes.concat(relationships));

                pk = this.get('pk');

                for (p in properties) {

                    meta = this.constructor.metaForProperty(p);
                    key = meta.options.key || p;

                    jsonItem = json[key];

                    if (typeof jsonItem !== 'undefined') {
                        data[meta.key] = jsonItem === null ? null : meta.deserialize.call(this, jsonItem);
                    }
                }

                if (this.primaryKey) {
                    this.set('pk', json[this.primaryKey] || pk);
                }

                this.set('__data', data);
                this.set('__isLoaded', true);
                this.set('dirtyAttributes', []);
            },

            validate : function () {
                return true;
            },

            merge : function (data) {

                data = data instanceof Model ? data.deserialize() : data;
                data[this.primaryKey] = null;

                this.deserialize(data);
            },

            save : function () {
                return this.saveRecord();
            },

            fetch : function () {
                return this.fetchRecord();
            },

            fetchRecord : function () {

                this.set('__isLoaded', false);

                if (this.__currentPromise) {
                    if (this.__currentPromise._state !== 1 && this.__currentPromise._state !== 2) {
                        return this.__currentPromise = this.__currentPromise.then(this.fetchRecord.bind(this));
                    }
                }

                return this.__currentPromise = this.adapter.fetch(this.constructor, this.get('pk')).then(function (json) {

                    json = json[this.typeKey] || json;
                    json = Array.isArray(json) ? json[0] : json;

                    this.deserialize(json);

                }.bind(this));
            },

            saveRecord : function () {

                if (this.get('isValid')) {

                    if (this.__currentPromise) {
                        if (this.__currentPromise._state !== 1 && this.__currentPromise._state !== 2) {
                            return this.__currentPromise = this.__currentPromise.then(this.saveRecord.bind(this));
                        }
                    }

                    this.set('dirtyAttributes', []);

                    return this.__currentPromise = this.adapter.saveRecord(this).then(function (json) {

                        var isNew = this.get('isNew');

                        json = json[this.typeKey] || json;
                        json = Array.isArray(json) ? json[0] : json;

                        this.deserialize(json);

                        if (isNew) {
                            this.store.add(this);
                        }

                        this.set('__isSaving', false);

                    }.bind(this));
                }

                else {
                    return promise(function (resolve, reject) {
                        reject(new Error('Tried to save an invalid record.'));
                    });
                }
            },

            deleteRecord : function () {

                this.set('__isDeleting', true);

                if (this.__currentPromise) {
                    if (this.__currentPromise._state !== 1 && this.__currentPromise._state !== 2) {
                        return this.__currentPromise = this.__currentPromise.then(this.deleteRecord.bind(this));
                    }
                }

                return this.__currentPromise = this.adapter.deleteRecord(this).then(function (json) {

                    this.store.remove(this);

                    this.set('__isDeleting', false);
                    this.set('__isDeleted', true);

                    this.destroy();

                }.bind(this));
            },

            clone : function () {

                var copy,
                    data;

                data = this.get('__data') || {};

                copy = this.constructor.create();
                copy.set('__data', clone(data));
                copy.set('pk', null);

                copy.set('__isLoaded', true);
                copy.set('dirtyAttributes', []);

                return copy;
            },

            revert : function () {
                this.merge(this.__originalData);
                this.__originalData = null;
                this.set('dirtyAttributes', []);
            }
        });

        Model.extend = function () {

            var i,
                p,
                v,
                props,
                proto,
                classProps,
                SubModel;

            SubModel = Class.extend.apply(this, arguments);
            proto = SubModel.prototype;

            d = {};
            classProps = ['primaryKey', 'url', 'adapter', 'typeKey', 'collectionKey'];

            props = [].slice.apply(arguments, [-1])[0];

            for (i = 0; i < classProps.length; i ++) {

                p = classProps[i];
                v = props[p];

                if (p) {
                    SubModel[p] = v;
                }
            }

            /*
                TODO : Need to re-implement this

                relationships = proto.getRelationships();
                dirtyChecks = ['__isDirty'];

                for (i = 0; i < relationships.length; i ++) {
                    p = relationships[i];
                    meta = r.metaForProperty(p);

                    if (meta.isRelationship && meta.options.embedded) {
                        dirtyChecks.push(p + '.__isDirty');
                    }
                }

                defineProperty(r.prototype, 'isDirty', computed.or.apply(this, dirtyChecks));
            */

            return SubModel;
        };

        return Model;
    }

).attach('$b');
