var packageJSON = require('../package.json');

require('require-main')();

$b.build({
    cwd : __dirname,
    file : '../dist/brink-prod.js',
    minifiedFile : '../dist/' + packageJSON.version + '/brink-prod.min.js',
    exclude : ['brink/node/**', 'brink/dev/**'],
    minify : false
});


$b.build({
    cwd : __dirname,
    file : '../dist/' + packageJSON.version + '/brink-dev.js',
    exclude : ['brink/node/**'],
    minify : false
});
