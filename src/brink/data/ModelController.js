$b(

    [
        '../core/Class',
        '../utils/get'
    ],

    function (Class, get) {

        'use strict';

        var ModelController = Class({

            store : $b.bindTo('model.store'),

            model : $b.computed({

                get : function () {
                    return this._model;
                },

                set : function (val) {

                    this._model = val;

                    if (val.__meta.controller) {
                        val.__meta.controller.destroy(false);
                    }

                    val.__meta.controller = this;
                }
            }),

            serialize : function () {
                return this.model.serialize.apply(null, arguments);
            },

            deserialize : function () {
                return this.model.deserialize.apply(null, arguments);
            },

            save : function () {
                return this.model.save.apply(null, arguments);
            },

            fetch : function () {
                return this.model.fetch.apply(null, arguments);
            },

            delete : function () {
                return this.model.delete.apply(null, arguments);
            },

            clone : function () {
                return this.model.clone.apply(null, arguments);
            },

            revert : function () {
                return this.model.revert.apply(null, arguments);
            },

            destroy : function (destroyModel) {

                var model;

                model = get(this, 'model');

                if (destroyModel && model) {
                    model.destroy();
                }

                return this._super.call(this);
            }
        });

        return ModelController;
    }

).attach('$b');
