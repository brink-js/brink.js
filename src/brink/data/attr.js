$b(

    [
        '../utils/computed',
        '../utils/clone'
    ],

    function (computed, clone) {

        'use strict';

        return function (type, options) {

            if (typeof type === 'object') {
                type = 'auto';
                options = type;
            }

            type = type || 'auto';

            options = options || {};

            var attr = computed({

                type : type,
                options : options,
                isAttribute : true,

                value : options.defaultValue,

                get : function (key) {
                    return this.__meta.data ? this.__meta.data[key] : null;
                },

                set : function (val, key) {

                    var data,
                        isDirty,
                        dirtyAttrs,
                        dirtyIndex;

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

                    data[key] = val;
                },

                serialize : function () {
                    return this.__meta.data ? this.__meta.data[attr.key] : null;
                },

                deserialize : function (val) {
                    return val;
                }
            });

            return attr;
        };
    }

).attach('$b');