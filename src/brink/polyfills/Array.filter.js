;(function () {

    'use strict';

    if (!Array.prototype.filter) {

        Array.prototype.filter = function (fn, scope) {

            var result = [];

            this.forEach(function (val, i) {
                if (fn.call(scope, val, i, this)) {
                    result.push(val);
                }
            });

            return result;

        };
    }

})();