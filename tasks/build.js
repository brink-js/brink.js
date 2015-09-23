var fs = require('fs'),
    packageJSON = require('../package.json');

require('../src/brink/node.js');

$b.build({
    cwd : __dirname,
    file : '../dist/' + packageJSON.version + '/brink-prod.js',
    minifiedFile : '../dist/' + packageJSON.version + '/brink-prod.min.js',
    exclude : ['brink/node/**', 'brink/dev/**'],
    minify : false
});

$b.build({
    cwd : __dirname,
    file : '../dist/' + packageJSON.version + '/brink-dev.js',
    exclude : ['brink/node/**'],
    minify : false
}, function () {
    fs.createReadStream('../dist/' + packageJSON.version + '/brink-dev.js')
    .pipe(fs.createWriteStream('../brink.js'));
});

