$b(

    /***********************************************************************
    @class Brink
    ************************************************************************/
    function () {

        'use strict';

        function bodyEncode (s) {
            return encodeURIComponent(s).replace(/[!'()*]/g, function (c) {
                return '%' + c.charCodeAt(0).toString(16);
            });
        }

        /***********************************************************************
        Serializes an object into URL params (or request body)

        @method params
        @param {Object} obj The `Object` to serialize.
        @return {String} The serialized Object.
        ************************************************************************/
        return function (o, isBody) {

            var p,
                result,
                encode = isBody ? bodyEncode : encodeURIComponent;

            result = '';

            for (p in o) {
                result += (result ? '&' : '') + encode(p) + '=' + encode(o[p]);
            }

            return result;
        };
    }

).attach('$b');