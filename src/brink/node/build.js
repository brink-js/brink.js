$b(

    [],

    function () {

        'use strict';

        return function (opts, done) {

            var fs = require('fs'),
                path = require('path'),
                includer = require('includer'),
                wrench = require('wrench'),
                uglify = require('uglify-js'),
                minimatch = require('minimatch'),
                modules = [];

            console.log('');

            /* jscs : disable validateQuoteMarks */
            /* jshint quotmark : false */

            function replaceAnonymousDefine (id, src) {

                // Replace the first instance of '$b(' or '$b.define('
                src = src.replace(/(\$b|\.define)(\s)?(\()/, "$1$2$3'" + id + "', ");
                return src;
            }
            /* jscs : enable */

            function replaceModules (modules, src) {

                if (!modules || !modules.length) {
                    return src;
                }

                return src.replace(
                    /([t| ]+)(\/\*{{modules}}\*\/)([\s\S]+?)(\/\*{{\/modules}}\*\/)/,
                    '$1' + JSON.stringify(modules, null, '    ').split('\n').join('\n$1')
                );
            }

            function wrap (src) {
                return '\n    ' + src.replace(/\n/g, '\n    ') + '\n';
            }

            function matches (path) {

                var i;

                for (i = 0; i < opts.include.length; i ++) {

                    if (!minimatch(path, opts.include[i])) {
                        return false;
                    }
                }

                for (i = 0; i < opts.exclude.length; i ++) {

                    if (minimatch(path, opts.exclude[i])) {
                        return false;
                    }
                }

                return true;
            }

            opts = opts || {};

            opts.include = [].concat(opts.include || ['**']);
            opts.exclude = [].concat(opts.exclude || []);
            opts.modules = [].concat(opts.modules || []);

            if (opts.cwd) {
                process.chdir(opts.cwd);
            }

            if (!opts.file && !opts.minifiedFile) {
                $b.error('No output file specified.');
            }

            includer(

                __dirname + '/../browser.js',

                {
                    wrap : wrap
                },

                function (err, src) {

                    var cb,
                        moduleSrc;

                    $b.configure(opts);

                    cb = function () {

                        var p,
                            meta,
                            metas,
                            minifiedSrc;

                        metas = $b.require.metas();

                        metas.forEach(function (item) {
                            console.log('\t' + item.id);
                        });

                        for (p in metas) {

                            meta = metas[p];

                            if (meta.url) {

                                if (matches(meta.id)) {

                                    modules.push(meta.id);

                                    moduleSrc = fs.readFileSync(require.resolve(meta.url), {encoding : 'utf8'});
                                    moduleSrc = replaceAnonymousDefine(meta.id, moduleSrc);

                                    src += wrap(moduleSrc);
                                }
                            }
                        }

                        src = ';(function () {\n' + replaceModules(modules, src) + '\n}).call(this);';

                        if (opts.minifiedFile) {

                            minifiedSrc = uglify.minify(src, {fromString: true}).code;

                            wrench.mkdirSyncRecursive(path.dirname(opts.minifiedFile));

                            fs.writeFileSync(opts.minifiedFile, minifiedSrc);

                            console.log(fs.realpathSync(opts.minifiedFile) + ' written successfully.');
                        }

                        if (opts.file) {
                            wrench.mkdirSyncRecursive(path.dirname(opts.file));

                            fs.writeFileSync(opts.file, src);

                            console.log(fs.realpathSync(opts.file) + ' written successfully.');
                        }

                        console.log('');

                        if (done) {
                            done();
                        }
                    };

                    if (opts.modules.length) {
                        $b.require(opts.modules, cb);
                    }

                    else {
                        cb();
                    }
                }
            );
        };
    }

).attach('$b');
