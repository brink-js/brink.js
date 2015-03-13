var cp,
    jscs,
    jshint;

cp = require('child_process');

console.log('');

jscs = cp.fork('./node_modules/jscs/bin/jscs', ['src/brink']);

jscs.on('exit', function (code, signal) {

    if (!code) {
        console.log('');
        console.log('------------------------------------------------');
        jshint = cp.fork('./node_modules/jshint/bin/jshint', ['--reporter', './tasks/lint-reporter.js', 'src/brink']);

        jshint.on('exit', function (code, signal) {
            console.log('');
        });

    }

});