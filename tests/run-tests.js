var p,
    fs,
    path,
    chai,
    mocha,
    timeout;

require('require-main')();

fs = require('fs');
path = require('path');
chai = require('chai'),
mocha = require('mocha');

mocha = new mocha({
    ui : 'bdd',
    reporter : 'spec'
});
mocha.checkLeaks();
global.expect = chai.expect;

var done = function (failures) {
    process.exit(failures);
};

function addTests (folder, p) {

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

module.exports = function (cb) {

    if (timeout) {
        clearTimeout(timeout);
        timeout = null;
    }

    mocha.run(cb);
};

addTests(path.join(__dirname, 'brink'));

timeout = setTimeout(function () {
    mocha.run(done);
}, 0);