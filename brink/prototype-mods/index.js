var mods = [require("./function-watches"), require("./function-unwatch")];

module.exports = function (i) {
	for (i = 0; i < mods.length; i ++) {
		mods[i]();
	}
}