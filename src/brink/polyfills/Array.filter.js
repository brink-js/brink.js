;(function () {

	'use strict';

	if (!Array.prototype.filter) {

		Array.prototype.filter = function (fn) {

			var i,
				t,
				len,
				res,
				val,
				thisArg;

			if (this === void 0 || this === null) {
				throw new TypeError();
			}

			t = Object(this);
			len = t.length >>> 0;

			if (typeof fn != "function") {
				throw new TypeError();
			}

			res = [];
			thisArg = arguments.length >= 2 ? arguments[1] : void 0;

			for (i = 0; i < len; i++) {

				if (i in t) {

					val = t[i];

					if (fn.call(thisArg, val, i, t)) {
						res.push(val);
					}
				}
			}

			return res;
		};
	}

})();