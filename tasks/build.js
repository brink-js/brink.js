require('require-main')();

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
