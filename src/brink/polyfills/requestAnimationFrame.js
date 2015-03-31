;(function () {

    'use strict';

    var _global = typeof window !== 'undefined' ? window : global;

    if (typeof _global !== 'undefined' && (!_global.requestAnimationFrame || !_global.cancelAnimationFrame)) {

        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for (var x = 0; x < vendors.length && !_global.requestAnimationFrame; x ++) {
            _global.requestAnimationFrame = _global[vendors[x] + 'RequestAnimationFrame'];
            _global.cancelAnimationFrame = _global[vendors[x] + 'CancelAnimationFrame'] ||
                _global[vendors[x] + 'CancelRequestAnimationFrame'];
        }

        if (!_global.requestAnimationFrame) {
            _global.requestAnimationFrame = function (callback) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = _global.setTimeout(function () {
                    callback(currTime + timeToCall);
                }, timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        }

        if (!_global.cancelAnimationFrame) {
            _global.cancelAnimationFrame = function (id) {
                clearTimeout(id);
            };
        }

        return _global.requestAnimationFrame;
    }

})();
