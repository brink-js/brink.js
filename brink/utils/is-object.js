"use strict";

module.exports = (function () {

	return function (obj) {

		var objectTypes = {
			"function": true,
			"object": true,
			"unknown": true
		};

		return obj ? !!objectTypes[typeof obj] : false;
	}
	
})();
