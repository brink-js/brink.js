'use strict';

var $b,
    _global,
    CONFIG,
    IS_NODE,
    IS_BROWSER,
    EMPTY_FN;

/*jshint ignore : start */
IS_NODE = typeof exports !== 'undefined' && this.exports !== exports;
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

/********* POLYFILLS *********/

include('./polyfills/Array.forEach.js');
include('./polyfills/Array.filter.js');
include('./polyfills/Array.indexOf.js');
include('./polyfills/Array.isArray.js');
include('./polyfills/Document.registerElement.js');
include('./polyfills/Function.bind.js');
include('./polyfills/requestAnimationFrame.js');

$b.F = EMPTY_FN;

/*
    These are empty functions for production builds,
    only the dev version actually implements these, but
    we don't want code that uses them to Error.
*/

$b.assert = $b.error = EMPTY_FN;

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
            'brink/utils/promise',

            'brink/utils/xhr',
            'brink/utils/ready',

            'brink/utils/isBrinkInstance',
            'brink/utils/isFunction',
            'brink/utils/isObject',

            'brink/utils/merge',
            'brink/utils/set',
            'brink/utils/trim',
            'brink/utils/unbound',
            'brink/utils/registerModel',
            'brink/utils/unregisterModel',

            'brink/core/Object',
            'brink/core/Class',
            'brink/core/Array',
            'brink/core/Dictionary',
            'brink/core/ObjectProxy',
            'brink/core/InstanceManager',

            'brink/dom/Attr',
            'brink/dom/DOMObject',
            'brink/dom/Element',
            'brink/dom/Template',
            'brink/dom/Component',
            'brink/dom/Tag',
            'brink/dom/Text',

            'brink/dom/tags/if',
            'brink/dom/tags/for',

            'brink/data/Adapter',
            'brink/data/RESTAdapter',

            'brink/data/attr',
            'brink/data/belongsTo',
            'brink/data/hasMany',
            'brink/data/Model',
            'brink/data/Store',
            'brink/data/Collection',

            'brink/amd/text',
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