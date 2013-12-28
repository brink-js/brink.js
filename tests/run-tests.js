var Brink = require("../brink/brink.js"),
	Mocha = require('mocha'),
    fs = require('fs'),
    path = require('path'),
    globals = require("./shared/globals"),
    mocha,
    p;

mocha = new Mocha({
	ui : "bdd",
	reporter : "spec"
});

for (p in globals) {
	global[p] = globals[p];
}

function addTests(folder, p) {

	fs.readdirSync(folder).filter(function (file) {

		p = path.join(folder, file); 

		if (fs.statSync(p).isDirectory()) {
			addTests(p);
			return;
		}

		if (file === 'index.js') {
			mocha.addFile(p);
		}
	});
}

addTests(path.join(__dirname, "brink"));

mocha.run(function(failures) {
  process.on('exit', function () {
    process.exit(failures);
  });
});

Brink.initialize();