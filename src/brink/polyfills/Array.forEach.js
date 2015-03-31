;(function () {

    'use strict';

    if (!Array.prototype.forEach) {

        Array.prototype.forEach = function (fn, scope) {

            var i,
                l;

            l = this.length || 0;

            for (i = 0; i < l; i ++) {
                fn.call(scope, this[i], i, this);
            }
        };
    }

})();