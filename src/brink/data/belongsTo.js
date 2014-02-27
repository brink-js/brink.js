$b(

    [
        './Model',
        '../utils/computed',
        '../utils/clone'
    ],

    function (Model, computed, clone) {

        'use strict';

        return function (factoryName, options) {

            var attr = computed({

                type : 'belongsTo',
                factory : null,
                options : options,
                isRelationship : true,

                value : options.defaultValue,

                get : function () {
                    return this.__meta.data ? this.__meta.data[attr.key] : null;
                },

                set : function (val) {

                    var key,
                        data,
                        factory,
                        isDirty,
                        dirtyAttrs,
                        dirtyIndex;

                    key = attr.key;

                    factory = attr.factory = attr.factory || this.store.getFactory(factoryName);

                    data = this.__meta.data = this.__meta.data || {};
                    this.__meta.originalData = this.__meta.originalData || clone(data);
                    isDirty = this.__meta.originalData[key] !== val;

                    dirtyAttrs = this.get('dirtyAttributes');
                    dirtyIndex = dirtyAttrs.indexOf(key);

                    if (dirtyIndex < 0 && isDirty) {
                        dirtyAttrs.push(key);
                        this.set('dirtyAttributes') = dirtyAttrs;
                    }

                    else if (!isDirty && dirtyIndex >= 0) {
                        dirtyAttrs.splice(dirtyIndex, 1);
                        this.set('dirtyAttributes', dirtyAttrs);
                    }

                    if (typeof val === 'string' || typeof val === 'number') {
                        val = this.store.findInCacheOrCreate(factoryName, val);
                    }

                    if (val) {
                        $b.assert('Invalid relationship assignment. Expected value of type : ' + factoryName, val instanceof factory);
                    }

                    data[key] = val;
                },

                serialize : function () {

                    var val,
                        data;

                    data = this.__meta.data = this.__meta.data || {};

                    val = data ? data[attr.key] : null;

                    if (val && val instanceof Model) {

                        if (options.embedded) {
                            return val.serialize();
                        }

                        return val.get('pk');
                    }

                    return val;
                },

                deserialize : function (val) {

                    var record,
                        factory;

                    factory = attr.factory = attr.factory || this.store.getFactory(factoryName);

                    if (options.embedded && typeof val === 'object') {
                        record = factory.create(val);
                    }

                    else {
                        record = this.store.findInCacheOrCreate(factoryName, val);
                    }

                    return record;
                }

            });

            return attr;
        };
    }

).attach('$b');
