$b.define(

    [
        './merge',
        '../config'
    ],

    function (merge, config) {

        'use strict';

        return function (o) {
            $b.merge(config, o);
            return config;
        };
    }

).attach('$b');
