var cp,
    yui,
    packageJSON;

cp = require('child_process');
packageJSON = require('../package.json');

console.log('');

yui = cp.fork('./node_modules/yuidocjs/lib/cli.js', [
    '-c',
        './tasks/yuidoc.json',
    '-t',
        './tasks/yuidoc-theme',
    '-H',
        './tasks/yuidoc-theme/helpers/helpers.js',
    '--project-version',
        packageJSON.version
]);

yui.on('exit', function (code, signal) {

    if (!code) {
        console.log('');
    }

});