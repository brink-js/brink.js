$b(

    [
        '../core/Class',
        '../core/Array',
        '../utils/get',
        '../utils/set',
        '../utils/computed'
    ],

    function (Class, BrinkArray, get, set, computed) {

        'use strict';

        var Model = Class({

            modelKey : null,
            collectionKey : null,

            primaryKey : 'id',

            dirtyAttributes : null,

            isSaving : false,
            isFetching : false,
            isLoaded : false,
            isDeleting : false,
            isDeleted : false,

            isDirty : computed(function () {
                return !!get(this, 'dirtyAttributes.length');
            }, 'dirtyAttributes.length'),

            isClean : computed(function () {
                return !get(this, 'isDirty');
            }, 'isDirty'),

            pk : computed({

                get : function () {
                    return get(this, this.primaryKey);
                },

                set : function (val) {
                    return set(this, this.primaryKey, val);
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

                for (p in o) {
                    set(this, p, o[p]);
                }

                meta.pristineData = {};
                meta.pristineContent = {};

                set(this, 'dirtyAttributes', BrinkArray.create());
            },

            serialize : function () {

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

                    val = pMeta.serialize.call(this);
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

            deserialize : function (json, override) {

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

                dirty = get(this, 'dirtyAttributes');
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

                    if (typeof val !== 'undefined') {
                        val = pMeta.deserialize.call(this, val, override);
                        meta.pristineData[p] = val;
                    }
                }

                if (this.primaryKey) {
                    set(this, 'pk', json[this.primaryKey]);
                }

                set(this, 'isLoaded', true);

                return this;
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
                    val,
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
                        pMeta.revert.call(this, revertRelationships)
                    }
                }

                return this;
            }
        });

        Model.extend = function () {

            var meta,
                proto,
                SubClass;

            SubClass = Class.extend.apply(this, arguments);
            proto = SubClass.prototype;

            if (proto.modelKey) {
                meta = SubClass.__meta;

                if (!proto.collectionKey) {
                    proto.collectionKey = proto.modelKey.concat('s');
                }

                meta.modelKey = proto.modelKey;
                meta.collectionKey = proto.collectionKey;

                $b.registerModel(SubClass);
            }

            return SubClass;
        };

        Model.unregister = function () {
            $b.unregisterModel(this);
        };

        return Model;
    }

).attach('$b');
