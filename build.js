var fs = require('fs'),
    includer = require('includer'),
    wrench = require('wrench'),
    uglify = require('uglify-js');

includer(

    './src/brink/brink.js',

    {
        wrap : function (src) {
            return '\n\t' + src.replace(/\n/g, '\n\t') + '\n';
        }
    },

    function (err, src) {

        fs.writeFileSync('./brink.js', ';(function () {\n' + src + '\n})()');

        var $b = require('./brink');

        $b.configure({
            baseUrl : './src'
        });

        $b.init(function () {
            console.dir($b.require.metas());
        });

    }
);
