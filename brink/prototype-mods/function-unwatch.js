var unwatch = require("../core/unwatch");

module.exports = function () {

	Function.prototype.unwatch = function () {
		unwatch.apply(this, [this]);
	};

};