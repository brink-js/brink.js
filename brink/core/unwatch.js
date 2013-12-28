module.exports = function (fn) {

	fn.__watches__ = false;

	if (fn.__watcherFunction__) {
		fn.__watcherFunction__.unwatch();
	}

	return fn;
}