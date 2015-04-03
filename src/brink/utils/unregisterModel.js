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

            var mKey,
                cKey;

            mKey = model.modelKey;
            cKey = model.collectionKey;

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
