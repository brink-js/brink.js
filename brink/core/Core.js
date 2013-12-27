"use strict";

if (typeof window !=="undefined" && window.define && window.define.amd) {

	/**
	* Allows us to store module id's on Classes for easier debugging, See;
	* https://github.com/jrburke/requirejs/wiki/Internal-API:-onResourceLoad
	**/

	require.onResourceLoad = function (context, map) {
		var module = context.require(map.id);

		if (module && module._isBrinkClass) {
			module.__amdID = module.prototype.__amdID = map.id;
		}
	};
}

// Polyfills
require("../polyfills/array-index-of");
require("../polyfills/array-is-array");
require("../polyfills/function-bind");
require("../polyfills/request-animation-frame");

Function.prototype.watches = function (p) {
	p = Array.prototype.slice.call(arguments);
	this.__watches__ = p.length ? p : ["all"];
	return this;
};

Function.prototype.unwatch = function () {
	this.__watches__ = false;
	if (this.__watcherFunction__) {
		this.__watcherFunction__.unwatch();
	}
	return this;
}