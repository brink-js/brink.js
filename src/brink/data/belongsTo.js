$b(
    [
        '../utils/get',
        '../utils/set',
        '../utils/computed'
    ],

    function (get, set, computed) {

        'use strict';

        /***********************************************************************
        Define a Schema belongsTo relationship (many to one).

        @method belongsTo
        @param  {String} modelKey The modelKey of the relationship.
        @param  {Object} options Options for the relationship.
        @return {ComputedProperty}
        ************************************************************************/

        return (function make (mKey, options) {

            options = options || {};

            var belongsTo = computed({

                get : function (key) {

                    var val,
                        store;

                    store = this.store;

                    if (typeof this.__meta.data[key] === 'undefined') {

                        if (typeof options.defaultValue !== 'undefined') {
                            val = options.defaultValue;
                        }

                        else if (options.embedded) {
                            val = store.__registry[mKey].create();
                        }

                        if (typeof val !== 'undefined') {
                            this.__meta.data[key] = val;
                        }
                    }

                    return this.__meta.data[key];
                },

                set : function (val, key) {

                    var meta,
                        data,
                        store,
                        dirty,
                        dirtyIdx,
                        pristine;

                    meta = this.__meta;
                    store = this.store;
                    dirty = get(this, 'dirtyAttributes');
                    data = meta.data;
                    pristine = meta.pristineData;

                    if (dirty) {

                        if (typeof pristine[key] === 'undefined') {

                            if (typeof data[key] === 'undefined') {
                                pristine[key] = options.defaultValue;
                            }

                            else {
                                pristine[key] = data[key];
                            }

                            dirty.push(key);
                        }

                        else {

                            dirtyIdx = dirty.indexOf(key);

                            if (pristine[key] === val && ~dirtyIdx) {
                                dirty.remove(key);
                            }

                            else if (!~dirtyIdx) {
                                dirty.push(key);
                            }
                        }
                    }

                    if (store && val && !(val instanceof store.__registry[mKey])) {

                        if (typeof val !== 'string' && typeof val !== 'number') {
                            val = String(val);
                        }

                        val = store.findOrCreate(mKey, val);
                    }

                    else if (val) {
                        $b.assert(
                            'Must be a model of type "' + mKey + '".',
                            val instanceof store.__registry[mKey]
                        );
                    }

                    data[key] = val;
                }
            });

            belongsTo.meta({

                type : 'belongsTo',
                isRelationship : true,
                options : options,
                relationshipKey : mKey,

                serialize : function (filter, dirty) {

                    var key,
                        val,
                        meta,
                        store,
                        undef;

                    meta = belongsTo.meta();
                    key = meta.key;
                    store = this.store;

                    val = get(this, key);

                    if (val && val instanceof store.__registry[mKey]) {

                        if (options.embedded) {
                            val = dirty ? val.serializeDirty(filter) : val.serialize(filter);
                            if (dirty && Object.keys(val).length === 0){val = undef;}
                        }

                        else {
                            val = get(val, 'pk');
                        }

                    }

                    if (!filter || filter(meta, key, val)) {
                        return val;
                    }
                },

                serializeDirty : function (filter) {
                    return belongsTo.meta().serialize.call(this, filter, true);
                },

                deserialize : function (val, override, filter) {

                    var key,
                        meta,
                        store,
                        record;

                    meta = belongsTo.meta();
                    key = meta.key;
                    store = this.store;

                    if (options.embedded) {

                        record = get(this, key) || store.__registry[mKey].create();

                        if (val && typeof val === 'object') {
                            val = record.deserialize(val, override, filter);
                        }
                    }

                    set(this, key, val);

                    return val;
                },

                revert : function (revertRelationships) {

                    var key,
                        val,
                        meta;

                    meta = belongsTo.meta();
                    key = meta.key;

                    val = get(this, key);

                    if (val) {
                        val.revert(revertRelationships);
                    }
                }
            });

            belongsTo.clone = function () {
                return make(mKey, options);
            };

            return belongsTo;
        });
    }

).attach('$b');
