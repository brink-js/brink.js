var fs = require('fs'),
    includer = require('includer'),
    wrench = require('wrench'),
    uglify = require('uglify-js');

function replaceAnonymousDefine (id, src) {

    // Replace the first instance of '$b(' or '$b.define('
    src = src.replace(/(\$b|\.define)?(\s)?(\()/, "$1$2$3'" + id + "', ");
    return src;
};

function wrap (src) {
    return '\n    ' + src.replace(/\n/g, '\n    ') + '\n';
}

includer(

    './src/brink/brink.js',

    {
        wrap : wrap
    },

    function (err, src) {

        var $b,
            moduleSrc;


        fs.writeFileSync('./brink.js', ';(function () {\n' + src + '\n})()');

        $b = require('./brink');

        $b.configure({
            baseUrl : './src'
        });

        $b.init(function () {

            var p,
                meta,
                metas;

            metas = $b.require.metas();

            for (p in metas) {

                meta = metas[p];

                if (meta.url) {

                    moduleSrc = fs.readFileSync(meta.url, {encoding : 'utf8'});
                    moduleSrc = replaceAnonymousDefine(meta.id, moduleSrc);

                    src += wrap(moduleSrc);
                }
            }

            src = ';(function () {\n' + src + '\n})();';

            wrench.mkdirSyncRecursive('./dist');

            fs.writeFileSync('./brink.js', src);

            fs.writeFileSync('./dist/brink.js', src);
            fs.writeFileSync('./dist/brink.min.js', uglify.minify('./brink.js').code);

            console.log("Build complete!");
        });

    }
);
