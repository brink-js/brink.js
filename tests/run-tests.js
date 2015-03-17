var p,
    fs,
    path,
    chai,
    mocha;

require('require-main')();

fs = require('fs');
path = require('path');
chai = require("chai"),
mocha = require('mocha');

mocha = new mocha({
    ui : 'bdd',
    reporter : 'spec'
});

global.expect = chai.expect;

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

addTests(path.join(__dirname, 'brink'));

mocha.run(function(failures) {
    process.exit(failures);
});
