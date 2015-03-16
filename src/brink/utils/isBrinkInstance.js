$b(

    [

    ],

    /***********************************************************************
    @class Brink
    ************************************************************************/
    function () {

        'use strict';

        /***********************************************************************
        Test whether or not a value is an instance of `Brink.Object` or `Brink.Object` subclass.

        @method isBrinkInstance
        @param {Any} obj The value to check.
        @return {Boolean} Whether or not the value is an instance of `Brink.Object`.
        ************************************************************************/
        return function (obj) {
            return obj.constructor.__meta.isObject;
        };
    }

).attach('$b');