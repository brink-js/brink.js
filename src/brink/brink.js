'use strict';

var $b,
	_global,
	include,
	CONFIG;

_global = typeof window !== 'undefined' ? window : global;
CONFIG = _global.Brink || _global.$b || {};

include = _global.include || require;

$b = _global.$b = _global.Brink = function () {

	if (arguments.length) {

		if (arguments.length === 1 && typeof arguments[0] === 'string') {
			if ($b.require) {
				return $b.require.apply(_global, arguments);
			}
		}

		if ($b.define) {
			return $b.define.apply(_global, arguments);
		}
	}

	return $b;
};

/********* POLYFILLS *********/

include('./polyfills/Array.indexOf.js');
include('./polyfills/Array.isArray.js');
include('./polyfills/Function.bind.js');
include('./polyfills/requestAnimationFrame.js');

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

        /*{{modules}}*/
		[
			'brink/config',

			'brink/utils/alias',
			'brink/utils/assert',
			'brink/utils/clone',
			'brink/utils/computed',
			'brink/utils/configure',

			'brink/utils/defineProperty',
			'brink/utils/error',
			'brink/utils/expandProps',
			'brink/utils/extend',
			'brink/utils/flatten',
			'brink/utils/intersect',

			'brink/utils/isBrinkInstance',
			'brink/utils/isBrinkObject',
			'brink/utils/isFunction',
			'brink/utils/isObject',
			'brink/utils/merge',

			'brink/core/Object',
			'brink/core/Class',

			'brink/node/build'
		]
        /*{{/modules}}*/

		, function () {

			/********* ALIASES *********/

			$b.merge($b, {
				F : function () {}
			});

			$b.merge($b.config, CONFIG);

			if ($b.config.DIRTY_CHECK) {
				$b.__.DirtyChecker.start();
			}

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

if (typeof window === 'undefined' && module && module.exports) {

	$b.build = function () {

		var args = arguments;

		$b.init(function () {
			$b.build.apply(null, args);
		});
	};

	module.exports = $b;
}
