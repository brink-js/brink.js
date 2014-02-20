var fs = require('fs'),
    includer = require('includer'),
    wrench = require('wrench'),
    uglify = require('uglify-js');

$b = require('../src/brink/brink.js');

$b.configure({
    baseUrl : __dirname + '/../src'
});

$b.build({
    cwd : __dirname,
    file : '../brink.js',
    minify : false
});


$b.build({
    cwd : __dirname,
    file : '../dist/brink-prod.js',
    minifiedFile : '../dist/brink-prod.min.js',
    exclude : ['brink/node/**', 'brink/dev/**'],
    minify : false
});


$b.build({
    cwd : __dirname,
    file : '../dist/brink-dev.js',
    exclude : ['brink/node/**'],
    minify : false
});
