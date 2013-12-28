"use strict";

var extend = require("../utils/extend");
require("../polyfills/function-bind");

/*=========================== HELPER FUNCTIONS ===========================*/

var _createSuperFunction = function (fn, superFn) {
	return function () {
		var r, tmp = this._super || null;

		// Reference the prototypes method, as super temporarily
		this._super = superFn;

		r = fn.apply(this, arguments);

		// Reset this._super
		this._super = tmp;
		return r;
	};
};

var _bindFunction = function (scope, p) {

	var i,
		fn = scope[p],
		fn2 = scope[p].bind(scope);

	for (i in fn) {
		if (fn.hasOwnProperty(i)) {
			fn2[i] = fn[i];
		}
	}

	return fn2;
}

/*
If Function.toString() works as expected, return a regex that checks for `this._super`
otherwise return a regex that passes everything.
*/

var _doesCallSuper = (/xyz/).test(function () {
	var xyz;
	xyz = true;
}) ? (/\bthis\._super\b/) : (/.*/);

/*=========================== END OF HELPER FUNCTIONS ===========================*/

module.exports = (function () {

	// Setup a dummy constructor for prototype-chaining without any overhead.
	var Prototype = function () {};
	var MClass = function () {};

	MClass.extend = function (props) {

		Prototype.prototype = this.prototype;
		var p, proto = extend(new Prototype(), props);

		function Class(vars) {

			var fn,
				p;

			for (p in this) {
				if (typeof this[p] === "function") {
					this[p] = _bindFunction(this, p);
				}
			}

			fn = this.__init__ || this.init || this.prototype.constructor;
			return fn.apply(this, arguments);
		}

		for (p in props) {
			if (
				typeof props[p] === "function" &&
				typeof this.prototype[p] === "function" &&
				_doesCallSuper.test(props[p])
			) {
				// this._super() magic, as-needed
				proto[p] = _createSuperFunction(props[p], this.prototype[p]);
			}

			else if (typeof props[p] === "object") {

				if (props[p] instanceof Array) {
					proto[p] = props[p].concat();
				}

				else if (props[p] !== null) {
					proto[p] = extend({}, props[p]);
				}
			}
		}

		proto.extend = MClass.extend.bind(Class);

		Class.prototype = proto;
		extend(Class, this, proto["static"]);
		Class._isBrinkClass = true;

		Class.prototype.constructor = Class;

		if (typeof Class.prototype.setup === "function") {
			Class.prototype.setup.call(Class);
		}

		return Class;
	};

	return MClass;

}());
