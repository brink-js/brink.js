;(function () {

	'use strict';

	if (!Array.prototype.indexOf) {

		Array.prototype.indexOf = function (a, b) {

			if (!this.length || !(this instanceof Array) || arguments.length < 1) {
				return -1;
			}

			b = b || 0;

			if (b >= this.length) {
				return -1;
			}

			while (b < this.length) {
				if (this[b] === a) {
					return b;
				}
				b += 1;
			}
			return -1;
		};
	}

})();