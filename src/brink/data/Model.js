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

            primaryKey : 'id',

            name : null,
            pluralName : null,

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

                json = {};

                i = props.length;
                while (i--) {
                    p = props[i];
                    desc = this.prop(p);
                    pMeta = desc.meta;

                    if (!override && ~dirty.indexOf(p)) {
                        continue;
                    }

                    key = pMeta.options.key || p;
                    val = json[key];

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
                    json[this.primaryKey] = null;
                }

                return this.constructor.create(json);
            },

            fetch : function () {
                console.log('fetch');
            },

            save : function () {
                console.log('save');
            },

            revert : function () {
                console.log('revert');
            },

            del : function () {
                console.log('delete');
            }
        });

        return Model;
    }

).attach('$b');
