$b(

    /***********************************************************************
    @class Brink
    ************************************************************************/
    function () {

        'use strict';

        /***********************************************************************
        Replaces all whitespace at the beginning and end of a `String`.

        @method trim
        @param {String} str The `String` to trim.
        @return {String} The trimmed string.
        ************************************************************************/
        return function (s) {
            return typeof s === 'string' ? s.replace(/^\s+|\s+$/gm, '') : s;
        };
    }

).attach('$b');