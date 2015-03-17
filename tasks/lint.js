var cp,
    jscs,
    chalk,
    jshint;

cp = require('child_process');
chalk = require('chalk'),

console.log('');
console.log('------------------------------------------------');
console.log('');


console.log(chalk.gray('Running jscs check....\n'));
jscs = cp.fork('./node_modules/jscs/bin/jscs', ['src/brink']);

jscs.on('exit', function (code, signal) {

    if (!code) {
        console.log('');
        console.log(chalk.gray('Running jshint check....'));

        jshint = cp.fork('./node_modules/jshint/bin/jshint', ['--reporter', './tasks/lint-reporter.js', 'src/brink']);

        jshint.on('exit', function (code, signal) {
            console.log('');
        });

    }
});