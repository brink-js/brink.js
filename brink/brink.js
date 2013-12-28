"use strict";

var makePrototypeMods = require("./prototype-mods/index");

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
require("./polyfills/array-index-of");
require("./polyfills/array-is-array");
require("./polyfills/function-bind");
require("./polyfills/request-animation-frame");

module.exports = {

	//AbstractClass	:	require("./core/AbstractClass"),
	Class			:	require("./core/Class"),
	Object			:	require("./core/Object"),
	Controller		:	require("./core/Controller"),
	Mixin			:	require("./core/Mixin"),
	Application		:	require("./core/Application"),

	Router			:	require("./routing/Router"),
	HistoryRouter	:	require("./routing/HistoryRouter"),
	HashRouter		:	require("./routing/HashRouter"),
	QueryRouter		:	require("./routing/QueryRouter"),

	//AbstractView	:	require("./views/AbstractView"),
	View			:	require("./views/View"),
	ContainerView	:	require("./views/ContainerView"),

	DS : {
		Model		:	require("./data/Model"),
		Collection	:	require("./data/Collection"),
		Adapter		:	require("./data/Adapter"),
		Types		:	require("./data/Types")
	},

	watches 		:	require("./core/watches"),
	unwatch 		:	require("./core/unwatch"),

	/**************************************************************/

	MODIFY_PROTOTYPES : true,

	/**************************************************************/

	initialize : function () {
		if (this.MODIFY_PROTOTYPES) {
			makePrototypeMods();
		}
	}

};