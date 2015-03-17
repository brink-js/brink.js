'use strict';

var $b,
    _global,
    CONFIG,
    IS_NODE,
    EMPTY_FN;

/*jshint ignore : start */
IS_NODE = typeof exports !== 'undefined' && this.exports !== exports;
/*jshint ignore : end */

_global = IS_NODE ? global : window;
CONFIG = _global.Brink || _global.$b || {};

EMPTY_FN = function () {};

if (IS_NODE) {
    _global = global;
    _global.include = _global.include || require;
}

else {
    _global = window;
}

$b = _global.$b = _global.Brink = function () {

    var args;

    args = Array.prototype.slice.call(arguments, 0);

    if (args.length) {

        if (args.length === 1 && typeof args[0] === 'string') {
            if ($b.require) {
                return $b.require.apply(_global, args);
            }
        }

        if ($b.define) {

            if (!Array.isArray(args[0]) && !Array.isArray(args[1])) {
                args.splice(args.length - 1, 0, []);
            }

            return $b.define.apply(_global, args);
        }
    }

    return $b;
};

/********* POLYFILLS *********/

include('./polyfills/Array.forEach.js');
include('./polyfills/Array.filter.js');
include('./polyfills/Array.indexOf.js');
include('./polyfills/Array.isArray.js');
include('./polyfills/Function.bind.js');
include('./polyfills/requestAnimationFrame.js');

/*
    These are empty functions for production builds,
    only the dev version actually implements these, but
    we don't want code that uses them to Error.
*/

$b.assert = $b.error = $b.required = EMPTY_FN;

/********* RESOLVER *********/

include('./resolvers/async');

$b.require.config(CONFIG);

$b.define('$b', $b);

$b.configure = function (o) {

    var p;

    for (p in o) {
        CONFIG[p] = o[p];
    }

    $b.require.config(CONFIG);

    return $b;
};

$b.init = function (deps, cb) {

    $b.require(

        /* jscs : disable requireCommaBeforeLineBreak */

        /*{{modules}}*/
        [
            'brink/config',

            'brink/dev/assert',
            'brink/dev/error',
            'brink/dev/required',

            'brink/utils/alias',
            'brink/utils/bindTo',
            'brink/utils/clone',
            'brink/utils/computed',
            'brink/utils/configure',
            'brink/utils/defineProperty',

            'brink/utils/expandProps',
            'brink/utils/extend',
            'brink/utils/flatten',
            'brink/utils/inject',
            'brink/utils/intersect',

            'brink/utils/isBrinkInstance',
            'brink/utils/isBrinkObject',
            'brink/utils/isFunction',
            'brink/utils/isObject',

            'brink/utils/merge',
            'brink/utils/set',
            'brink/utils/trim',

            'brink/core/Object',
            'brink/core/Class',
            'brink/core/Array',
            'brink/core/Dictionary',

            'brink/core/InstanceManager',

            'brink/browser/ajax',
            'brink/browser/ReactMixin',

            'brink/node/build'
        ]
        /*{{/modules}}*/

        , function () {

        /* jscs : enable */

            /********* ALIASES *********/

            $b.merge($b, {
                F : EMPTY_FN
            });

            $b.merge($b.config, CONFIG);

            if ($b.isFunction(deps)) {
                cb = deps;
                cb($b);
            }

            else {
                $b.require(deps, cb);
            }

        }
    );
};

if (IS_NODE) {

    $b.build = function () {

        var args = arguments;

        $b.init(function () {
            $b.build.apply(null, args);
        });
    };

    $b.configure({paths : {brink : __dirname}});
    $b.init();
    $b.configure({paths : null});

    module.exports = $b;
}