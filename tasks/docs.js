var cp,
    yui;

cp = require('child_process');

console.log('');

yui = cp.fork('./node_modules/yuidocjs/lib/cli.js', [
    '-c',
        './tasks/yuidoc.json',
    '-t',
        './tasks/yuidoc-theme',
    '-H',
        './tasks/yuidoc-theme/helpers/helpers.js'
]);

yui.on('exit', function (code, signal) {

    if (!code) {
        console.log('');
    }

});