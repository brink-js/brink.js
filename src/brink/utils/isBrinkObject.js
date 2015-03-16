$b(

    /***********************************************************************
    @class Brink
    ************************************************************************/
    function () {

        'use strict';

        /***********************************************************************
        Test whether or not a value is a `Brink.Object` subclass.

        @method isBrinkObject
        @param {Any} obj The value to check.
        @return {Boolean} Whether or not the value is a `Brink.Object` subclass.
        ************************************************************************/
        return function (obj) {
            return obj.__isObject;
        };
    }

).attach('$b');