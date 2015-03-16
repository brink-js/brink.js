$b(

    /***********************************************************************
    @class Brink
    ************************************************************************/
    function () {

        'use strict';

        var objectTypes = {
            'function' : true,
            'object' : true,
            'unknown' : true
        };

        /***********************************************************************
        Test whether or not a value is an `Object`.

        @method isObject
        @param {Any} obj The value to check.
        @return {Boolean} Whether or not the value is an `Object`.
        ************************************************************************/
        return function (obj) {
            return obj ? !!objectTypes[typeof obj] : false;
        };
    }

).attach('$b');