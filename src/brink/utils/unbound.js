$b(

    [],

    /***********************************************************************
    @class Brink
    ************************************************************************/
    function () {

        'use strict';
        /***********************************************************************
        @method unbound
        @param {Any} value
        ************************************************************************/
        return function (val) {

            return {
                value : val,
                __isUnbound : true
            };
        };
    }

).attach('$b');