$b(

    [
        './merge',
        '../config'
    ],

    /***********************************************************************
    @class Brink
    ************************************************************************/
    function (merge, config) {

        'use strict';

        /***********************************************************************
        Set Brink configuration properties at runtime.

        @method configure
        @param {Object} obj Object of configuration properties.
        ************************************************************************/
        return function (o) {
            $b.merge(config, o);
            return config;
        };
    }

).attach('$b');
