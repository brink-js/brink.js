$b(

    [],

    /***********************************************************************
    @class Brink
    ************************************************************************/
    function () {

        'use strict';

        $b.__models = {};

        /***********************************************************************
        @method unregisterModel
        @param {Brink.Model} Model
        ************************************************************************/
        return function (model) {

            var meta,
                mKey,
                cKey;

            meta = model.__meta;
            mKey = meta.modelKey;
            cKey = meta.collectionKey;

            if (!$b.__models[mKey]) {
                throw new Error('`modelKey` not registered : "' + mKey +  '".');
            }

            else if (!$b.__models[cKey]) {
                throw new Error('`collectionKey` not registered : "' + cKey +  '".');
            }

            $b.__models[mKey] = null;
            $b.__models[cKey] = null;
        };
    }

).attach('$b');
