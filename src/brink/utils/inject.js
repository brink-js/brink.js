$b(

    [],

    /***********************************************************************
    @class Brink
    ************************************************************************/
    function () {

        'use strict';

        /***********************************************************************
        Inject a property into a subclass' prototype.

        @method inject
        @param {String|Object} A single key (`String`) or object of key : value pairs.
        @param {Any} [val] If setting a single property, the value of the property.
        ************************************************************************/
        return function (Class) {
            Class.inject.apply(Class, arguments);
        };
    }

).attach('$b');
