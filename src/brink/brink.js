'use strict';

var $b,
    _global,
    CONFIG,
    IS_NODE,
    IS_BROWSER,
    EMPTY_FN;

/*jshint ignore : start */
IS_NODE = typeof module !== 'undefined' && module.exports;
IS_BROWSER = !IS_NODE;
/*jshint ignore : end */

_global = IS_NODE ? global : window;
CONFIG = _global.Brink || _global.$b || {};

CONFIG.IS_NODE = IS_NODE;
CONFIG.IS_BROWSER = IS_BROWSER;

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

if (IS_NODE) {
    process.env.NODE_PATH = __dirname + '/src/';
    require('./polyfills/Array.forEach.js');
    require('./polyfills/Array.filter.js');
    require('./polyfills/Array.indexOf.js');
    require('./polyfills/Array.isArray.js');
    require('./polyfills/Document.registerElement.js');
    require('./polyfills/Function.bind.js');
    require('./polyfills/requestAnimationFrame.js');
    require('./resolvers/async');
}

else {

    /********* POLYFILLS *********/

    include('./polyfills/Array.forEach.js');
    include('./polyfills/Array.filter.js');
    include('./polyfills/Array.indexOf.js');
    include('./polyfills/Array.isArray.js');
    include('./polyfills/Document.registerElement.js');
    include('./polyfills/Function.bind.js');
    include('./polyfills/requestAnimationFrame.js');

    /********* RESOLVER *********/

    include('./resolvers/async');
}

$b.F = EMPTY_FN;

/*
    These are empty functions for production builds,
    only the dev version actually implements these, but
    we don't want code that uses them to Error.
*/

$b.assert = $b.error = EMPTY_FN;

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
            'brink/dev/warn',

            'brink/utils/alias',
            'brink/utils/bindTo',
            'brink/utils/clone',
            'brink/utils/computed',
            'brink/utils/configure',
            'brink/utils/defineProperty',

            'brink/utils/extend',
            'brink/utils/expandProps',
            'brink/utils/flatten',
            'brink/utils/intersect',
            'brink/utils/params',
            'brink/utils/Q',

            'brink/utils/xhr',
            'brink/utils/ready',

            'brink/utils/isBrinkInstance',
            'brink/utils/isFunction',
            'brink/utils/isObject',

            'brink/utils/merge',
            'brink/utils/set',
            'brink/utils/trim',
            'brink/utils/unbound',

            'brink/core/Object',
            'brink/core/Class',
            'brink/core/Array',
            'brink/core/Dictionary',
            'brink/core/ObjectProxy',
            'brink/core/InstanceManager',

            'brink/data/Adapter',
            'brink/data/RESTAdapter',

            'brink/data/attr',
            'brink/data/belongsTo',
            'brink/data/hasMany',
            'brink/data/Model',
            'brink/data/Schema',
            'brink/data/Store',
            'brink/data/Collection',

            'brink/node/build'
        ]
        /*{{/modules}}*/

        , function () {

            /* jscs : enable */

            /********* ALIASES *********/

            $b.merge($b.config, CONFIG);

            if ($b.isFunction(deps)) {
                cb = deps;
                cb($b);
            }

            else {
                deps = deps || [];
                if (deps.length) {
                    $b.require(deps, cb);
                }

                else {
                    if (cb) {
                        cb();
                    }
                }
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

    $b.configure({paths : {brink : __dirname, plugins : __dirname + '/amd'}});
    $b.init();
    $b.configure({paths : null});

    module.exports = $b;
}
