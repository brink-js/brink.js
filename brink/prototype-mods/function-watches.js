var watches = require("../core/watches");

module.exports = function () {

	Function.prototype.watches = function () {
		watches.apply(this, Array.prototype.concat.call(arguments, this));
	};

};