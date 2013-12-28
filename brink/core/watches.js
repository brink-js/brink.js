module.exports = function (i, p, fn) {

	p = [];

	for (i = 0; i < arguments.length; i ++) {

		if (typeof arguments[i] === "function") {
			fn = arguments[i];
			break;
		}

		p.push(arguments[i]);
	}

	fn.__watches__ = p.length ? p : ["all"];
	return fn;
};