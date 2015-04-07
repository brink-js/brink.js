$b(
    [
        '../utils/xhr'
    ],

    function (xhr) {

        'use strict';

        return {

            load : function (name, req, load, config) {

                if (!config.isBuild) {
                    xhr(req.toUrl(name)).then(function (content) {
                        load(content);
                    });
                }

                else {
                    load('');
                }
            },

            loadFromFileSystem : function (plugin, name) {

                var fs = global.nodeRequire('fs');
                var file = require.toUrl(name);
                var val = fs.readFileSync(file).toString();

                val = 'define("' + plugin + '!' + name  + '", function () {\nreturn ' + val + ';\n});\n';

                return val;
            },

            write : function (pluginName, moduleName, write) {
                write(this.loadFromFileSystem(pluginName, moduleName));
            }
        };
    }
).attach('$b');