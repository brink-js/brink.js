$b(

    [
        './ModelController',
        '../core/Class',
        '../core/Array',
        '../utils/get',
        '../utils/set',
        '../utils/bindTo',
        '../utils/computed'
    ],

    function (ModelController, Class, BrinkArray, get, set, bindTo, computed) {

        'use strict';

        var Model = Class({

            store : null,
            adapter : null,
            modelKey : null,
            collectionKey : null,
            controllerClass : null,

            primaryKey : 'id',

            dirtyAttributes : null,

            isSaving : false,
            isFetching : false,
            isLoaded : false,
            isDeleting : false,

            isDirty : computed(function () {
                return !!get(this, 'dirtyAttributes.length');
            }, 'dirtyAttributes.length'),

            isClean : computed(function () {
                return !get(this, 'isDirty');
            }, 'isDirty'),

            isNew : computed(function () {
                return !get(this, 'pk');
            }, 'pk'),

            pk : computed({

                get : function () {
                    return this.primaryKey ? get(this, this.primaryKey) : null;
                },

                set : function (val) {
                    return this.primaryKey ? set(this, this.primaryKey, val) : null;
                }
            }),

            __init : function (o) {

                var p,
                    desc,
                    meta,
                    pMeta,
                    cMeta,
                    attributes,
                    relationships;

                this._super.call(this);

                meta = this.__meta;
                cMeta = this.constructor.__meta;

                meta.isInitialized = false;

                if (cMeta.attributes) {
                    meta.attributes = cMeta.attributes;
                    meta.relationships = cMeta.relationships;
                }

                else {

                    attributes = [];
                    relationships = [];

                    for (p in meta.properties) {
                        desc = meta.properties[p];
                        pMeta = desc.meta && desc.meta();

                        if (pMeta) {
                            if (pMeta.isAttribute) {
                                attributes.push(p);
                            }

                            else if (pMeta.isRelationship) {
                                relationships.push(p);
                            }
                        }
                    }

                    meta.attributes = cMeta.attributes = attributes;
                    meta.relationships = cMeta.relationships = relationships;
                }

                meta.data = {};

                meta.pristineData = {};
                meta.pristineContent = {};

                if (typeof o === 'object') {
                    this.deserialize(o);
                }

                set(this, 'dirtyAttributes', BrinkArray.create());

                meta.isInitialized = true;
            },

            getController : function () {

                var controller = this.__meta.controller;

                if (!controller) {
                    if (!this.constructor.controllerClass) {
                        return null;
                    }
                    controller = this.constructor.controllerClass.create({model : this});
                }

                return controller;
            },

            serialize : function (filter) {

                var i,
                    l,
                    p,
                    pk,
                    key,
                    val,
                    desc,
                    json,
                    meta,
                    pMeta,
                    props,
                    attributes,
                    relationships;

                meta = this.__meta;

                attributes = meta.attributes;
                relationships = meta.relationships;

                props = attributes.concat(relationships);

                json = {};

                for (i = 0, l = props.length; i < l; i ++) {
                    p = props[i];
                    desc = this.prop(p);
                    pMeta = desc.meta();
                    key = pMeta.options.key || p;

                    val = pMeta.serialize.call(this, filter);
                    if (typeof val !== 'undefined') {
                        set(json, key, val);
                    }
                }

                if (this.primaryKey) {
                    pk = get(this, 'pk');
                    if (typeof pk !== 'undefined') {
                        set(json, this.primaryKey, pk);
                    }
                }

                return json;
            },

            deserialize : function (json, override, filter) {

                var i,
                    p,
                    key,
                    val,
                    desc,
                    meta,
                    pMeta,
                    props,
                    dirty,
                    attributes,
                    relationships;

                meta = this.__meta;

                if (!json) {
                    return this;
                }

                dirty = get(this, 'dirtyAttributes') || [];
                attributes = meta.attributes;
                relationships = meta.relationships;

                props = attributes.concat(relationships);

                i = props.length;
                while (i--) {
                    p = props[i];
                    desc = this.prop(p);
                    pMeta = desc.meta();

                    if (!override && ~dirty.indexOf(p)) {
                        continue;
                    }

                    key = pMeta.options.key || p;
                    val = get(json, key);

                    if (typeof val !== 'undefined' && (!filter || filter(pMeta, key, val))) {
                        val = pMeta.deserialize.call(this, val, override, filter);
                        meta.pristineData[p] = val;
                    }
                }

                if (this.primaryKey && json[this.primaryKey]) {
                    set(this, 'pk', json[this.primaryKey]);
                }

                set(this, 'isLoaded', true);

                return this;
            },

            save : function () {

                var self,
                    isNew;

                self = this;
                isNew = get(this, 'isNew');

                set(this, 'isSaving', true);

                return this.adapter.saveRecord(this).then(function (json) {
                    self.deserialize(json);
                    set(self, 'isSaving', false);
                    set(self, 'isLoaded', true);

                    if (isNew && self.store) {
                        self.store.add(self);
                    }
                });
            },

            fetch : function () {

                var self,
                    isNew;

                self = this;
                isNew = get(this, 'isNew');

                $b.assert('Can\'t fetch records without a primary key.', !isNew);

                set(this, 'isFetching', true);

                return this.adapter.fetchRecord(this).then(function (json) {

                    self.deserialize(json);
                    set(self, 'isFetching', false);
                    set(self, 'isLoaded', true);
                });
            },

            delete : function () {

                var self,
                    isNew;

                self = this;
                isNew = get(this, 'isNew');

                set(this, 'isDeleting', true);

                return this.adapter.deleteRecord(this).then(function () {

                    if (self.store) {
                        self.store.remove(this);
                    }

                    self.destroy();
                });
            },

            clone : function () {

                var json = this.serialize();

                if (typeof json[this.primaryKey] !== 'undefined') {
                    delete json[this.primaryKey];
                }

                return this.constructor.create(json);
            },

            revert : function (revertRelationships) {

                var i,
                    p,
                    key,
                    desc,
                    meta,
                    pMeta,
                    props,
                    dirty,
                    attributes,
                    relationships;

                meta = this.__meta;

                dirty = get(this, 'dirtyAttributes');
                attributes = meta.attributes;
                relationships = meta.relationships;

                props = attributes.concat(relationships);

                i = props.length;
                while (i--) {
                    p = props[i];
                    desc = this.prop(p);
                    pMeta = desc.meta();

                    key = pMeta.options.key || p;

                    if (
                        pMeta.isAttribute ||
                        (pMeta.isRelationship &&
                        (revertRelationships || pMeta.options.embedded))
                    ) {
                        pMeta.revert.call(this, revertRelationships);
                    }
                }

                return this;
            }
        });

        Model.extend = function () {

            var p,
                props,
                meta,
                proto,
                toProxy,
                SubClass;

            SubClass = Class.extend.apply(this, arguments);
            proto = SubClass.prototype;

            if (proto.url) {
                SubClass.url = proto.url;
            }

            if (proto.primaryKey) {
                SubClass.primaryKey = proto.primaryKey;
            }

            if (proto.modelKey) {
                meta = SubClass.__meta;

                if (!proto.collectionKey) {
                    proto.collectionKey = proto.modelKey.concat('s');
                }

                SubClass.modelKey = proto.modelKey;
                SubClass.collectionKey = proto.collectionKey;

                $b.registerModel(SubClass);
            }

            if (proto.adapter) {
                SubClass.adapter = proto.adapter;
                proto.adapter.registerModel(SubClass);
            }

            if (proto.controllerClass) {

                toProxy = {};

                props = proto.__meta.properties;

                for (p in props) {
                    toProxy[p] = bindTo('model.' + p);
                }

                SubClass.controllerClass = proto.controllerClass.extend(toProxy);

                delete proto.controllerClass;
            }

            return SubClass;
        };

        Model.unregister = function () {
            $b.unregisterModel(this);
        };

        return Model;
    }

).attach('$b');
