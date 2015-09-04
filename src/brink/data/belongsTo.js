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

                    if (store && val && !(val instanceof $b.__models[mKey])) {

                        if (typeof val !== 'string' && typeof val !== 'number') {
                            val = String(val);
                        }

                        val = store.findOrCreate(mKey, val);
                    }

                    else if (val) {
                        $b.assert(
                            'Must be a model of type "' + mKey + '".',
                            val instanceof $b.__models[mKey]
                        );
                    }

                    data[key] = val;
                }
            });

            belongsTo.meta({

                type : 'belongsTo',
                isRelationship : true,
                options : options,

                serialize : function (filter) {

                    var key,
                        val,
                        meta;

                    meta = belongsTo.meta();
                    key = meta.key;

                    val = get(this, key);

                    if (val && val instanceof $b.__models[mKey]) {

                        if (options.embedded) {
                            val = val.serialize(filter);
                        } else {
                            val = get(val, 'pk');
                        }

                    }

                    if (!filter || filter(meta, key, val)) {
                        return val;
                    }

                },

                deserialize : function (val, override, filter) {

                    var key,
                        meta,
                        record;

                    meta = belongsTo.meta();
                    key = meta.key;

                    if (options.embedded) {
                        record = get(this, key) || $b.__models[mKey].create();

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
