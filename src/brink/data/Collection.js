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

        var Collection = BrinkArray({

            modelKey : null,
            collectionKey : null,

            modelClass : computed({

                get : function () {
                    return this._modelClass;
                },

                set : function (val) {
                    this._modelClass = val;
                    if (val) {
                        set(this, 'modelKey', val.modelKey);
                        set(this, 'collectionKey', val.collectionKey);
                    }
                }
            })

        });

        return Collection;
    }

).attach('$b');