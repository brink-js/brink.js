(function () {

    'use strict';

    var IS_NODE,
        _global,
        origRequire,
        resolver,
        moduleIndex;

    moduleIndex = 0;

    IS_NODE = typeof exports !== 'undefined' && this.exports !== exports;

    _global = IS_NODE ? global : window;
    origRequire = typeof require !== 'undefined' ? require : null;

    resolver = (function () {

        var  _loadQ = [],
            _defineQ = [],
            _loadedFiles = {},
            _modules = $b.__registry = {},
            _metas = {},
            _head,
            // Used for checking circular dependencies.
            _dependencies = {},
            // Used in various places, defined here for smaller file size
            _rem = ['require', 'exports', 'module'],

            // Configurable properties...
            _config = {},
            _baseUrl = '',
            _urlArgs = '',
            _waitSeconds = 10,
            _paths = {};

        /**
        * Normalizes a path/url, cleaning up duplicate slashes,
        * takes care of `../` and `./` parts
        */
        function _normalize (path, prevPath) {
            // Replace any matches of './'  with '/'
            path = path.replace(/(^|[^\.])(\.\/)/g, '$1');

            // Replace any matches of 'some/path/../' with 'some/'
            while (prevPath !== path) {
                prevPath = path;
                path = path.replace(/([\w,\-]*[\/]{1,})([\.]{2,}\/)/g, '');
            }

            // Replace any matches of multiple '/' with a single '/'
            return path.replace(/(\/{2,})/g, '/');
        }

        function _meta () {

            return {

                id : null,
                module : null,
                url : null,
                attachTo : null,
                attachPath : null,

                attach : function (s) {

                    var i;

                    this.attachPath = s;

                    s = s.split('.');

                    this.attachTo = require(s[0]);

                    for (i = 1; i < s.length; i ++) {
                        this.attachTo = this.attachTo[s[i]] = this.attachTo[s[i]] || {};
                    }

                    if (this.module) {
                        this.resolve();
                    }
                },

                resolve : function (id, module) {

                    var meta,
                        idPart;

                    if (id) {
                        this.id = id;
                    }

                    if (module) {
                        this.module = module;
                    }

                    meta = _metas[id] || {id : this.id};
                    meta.module = this.module;
                    meta.url = this.url || meta.url;
                    meta.attachPath = this.attachPath || meta.attachPath;
                    meta.order = meta.order || moduleIndex ++;

                    _metas[id] = meta;

                    module = this.module.exports || this.module;

                    if (this.attachTo) {
                        idPart = this.id.split('/').pop();

                        if (this.attachPath === '$b') {
                            _module(idPart, this.module);

                            if ($b.CoreObject && module.prototype instanceof $b.CoreObject) {
                                module.toString = function () {
                                    return 'Brink.' + idPart;
                                };
                            }
                        }

                        this.attachTo[idPart] = this.module.exports || this.module;
                    }

                    if (this.id && module && !module.hasOwnProperty('toString')) {

                        if ($b.CoreObject && module.prototype instanceof $b.CoreObject) {

                            module.toString = function () {
                                return id;
                            };
                        }
                    }
                }
            };
        }

        /**
        * Similar to UNIX dirname, returns the parent path of another path.
        */
        function _getContext (path) {
            return path.substr(0, path.lastIndexOf('/'));
        }

        /**
        * Given a path and context (optional), will normalize the url
        * and convert a relative path to an absolute path.
        */
        function _resolve (path, context) {

            /**
            * If the path does not start with a '.', it's relative
            * to the base URL.
            */
            context = (path && path.indexOf('.') < 0) ? '' : context;

            /**
            * Never resolve 'require', 'module' and 'exports' to absolute paths
            * For plugins, only resolve the plugin path, not anything after the first '!'
            */
            if (path && (~_rem.indexOf(path) || ~path.indexOf('!'))) {
                return path.replace(/([\d,\w,\s,\.\/]*)(?=\!)/, function ($0, $1) {
                    return _resolve($1, context);
                });
            }

            return _normalize((context ? context + '/' : '') + path);
        }

        /**
        * Loop through all of the items in _loadQ and if all modules in a given
        * queue are defined, call the callback function associated with the queue.
        */
        function _checkLoadQ (i, j, q, ready) {

            for (i = _loadQ.length - 1; ~i && (q = _loadQ[i]); i --) {

                ready = 1;
                for (j = q.m.length - 1; ~j && ready; j --) {
                    ready = _module(q.m[j]);
                }
                if (ready) {
                    _loadQ.splice(i, 1);
                    require(q.m, q.cb);
                }
            }
        }

        /**
        * Invokes the first anonymous item in _defineQ.
        * Called from script.onLoad, and loader plugins .fromText() method.
        */
        function _invokeAnonymousDefine (id, url, q) {

            if (_defineQ.length) {

                q = _defineQ.splice(0, 1)[0];

                if (q) {
                    /**
                    * If the q is not null, it's an anonymous module and we have to invoke define()
                    * But first we need to tell the q which id to use, and set alreadyQed to true.
                    */
                    q.splice(0, 0, id); // set the module id
                    q.splice(3, 0, 1); // set alreadyQed to true
                    q.splice(4, 0, 0); // set depsLoaded to false

                    if (url) {
                        q[5].url = url;
                    }

                    define.apply($b, q);
                }
            }
        }

        /**
        * Injects a script tag into the DOM
        */
        function _inject (f, m, script, q, isReady, timeoutID) {

            // If in a CJS environment, resolve immediately.
            if (IS_NODE) {
                origRequire(f);
                _invokeAnonymousDefine(m, f);
                return 1;
            }

            _head = _head || document.getElementsByTagName('head')[0];

            script = document.createElement('script');
            script.src = f;

            /**
            * Bind to load events, we do it this way vs. addEventListener for IE support.
            * No reason to use addEventListener() then fallback to script.onload, just always use script.onload;
            */
            script.onreadystatechange = script.onload = function () {

                if (!script.readyState || script.readyState === 'complete' || script.readyState === 'loaded') {

                    clearTimeout(timeoutID);
                    script.onload = script.onreadystatechange = script.onerror = null;

                    _invokeAnonymousDefine(m, f);
                }
            };

            /**
            * script.onerror gets called in two ways.
            * The first, if a script request actually errors (i.e. a 404)
            * The second, if a script takes more than X seconds to respond. Where X = _waitSeconds
            */
            script.onerror = function () {

                clearTimeout(timeoutID);
                script.onload = script.onreadystatechange = script.onerror = null;

                throw new Error(f + ' failed to load.');
            };

            timeoutID = setTimeout(script.onerror, _waitSeconds * 1000);

            // Prepend the script to document.head
            _head.insertBefore(script, _head.firstChild);

            return 1;
        }

        /**
        * Does all the loading of modules and plugins.
        */
        function _load (modules, callback, context, i, q, m, f) {

            q = {m: modules, cb: callback};
            _loadQ.push(q);

            for (i = 0; i < modules.length; i ++) {
                m = modules[i];
                if (~m.indexOf('!')) {
                    /**
                    * If the module id has a '!' in it, it's a plugin...
                    */
                    _loadPluginModule(m, context, q, i);
                    continue;
                }

                /**
                * Otherwise, it's normal module, not a plugin. Inject the file into the DOM if
                * the file has not been loaded yet and if the module is not yet defined.
                */
                f = _getURL(m);
                _loadedFiles[f] = (!_module(m) && !_loadedFiles[f]) ? _inject(f, m) : 1;
            }
        }

        /**
        * Called by _load() and require() used for loading and getting plugin-type modules
        */
        function _loadPluginModule (module, context, q, moduleIndex, definition, plugin, pluginPath) {

            /**
            * Set the plugin path. Plugins are stored differently than normal modules
            * Essentially they are stored along with the context in a special 'plugins'
            * subpath. This allows modules to lookup plugins with the sync require('index!./foo:./bar') method
            */
            pluginPath = (context ? context + '/' : '') + 'plugins/' + module.replace(/\//g, '_');

            /*
            * Update the path to this plugin in the queue
            */
            if (q) {
                q.m[moduleIndex] = pluginPath;
            }

            module = module.split('!');
            plugin = module.splice(0, 1)[0];
            module = module.join('!');

            /*
            * Let's check to see if the module is already defined.
            */
            definition = _module(pluginPath);

            /*
            * If the plugin is defined, no need to do anything else, so return.
            * If q is null, return no matter what.
            */
            if (!q || definition) {
                return definition;
            }

            /**
            * Let's make sure the plugin is loaded before we do anything else.
            */
            require(plugin, function (pluginModule) {

                /**
                * If the plugin module has a normalize() method defined, use it
                */
                module = pluginModule.normalize ?
                    pluginModule.normalize(module, function (path) {
                        return _resolve(path, context);
                    }) :
                    _normalize(module);

                function load (definition) {
                    _module(pluginPath, {exports: definition});
                    _checkLoadQ();
                }

                load.fromText = function (name, definition, dqL) {

                    /**
                    * Update the module path in the load queue with the newly computed module id
                    */
                    q.m[moduleIndex] = pluginPath = name;

                    /**
                    * Store the length of the define queue, to check against after the eval().
                    */
                    dqL = _defineQ.length;

                    /**
                    * Yes, eval/Function is bad, evil. I hate it, you hate it, but some plugins need it.
                    * If you don't have any plugins using fromText(), feel free to comment
                    * the entire load.fromText() out and re-minify the source.
                    * I use Function vs eval() because nothing executing through fromText() should need access
                    * to local vars, and Uglify does not mangle variables if it finds 'eval()' in your code.
                    */

                    /*jslint evil: true */
                    new Function(definition)();

                    if (_defineQ.length - dqL) {
                        // Looks like there was a define call in the eval'ed text.
                        _invokeAnonymousDefine(pluginPath);
                    }
                };

                return pluginModule.load(
                    module,
                    require.localize(_getContext(plugin)),
                    load,
                    _config[plugin] || {}
                );
            });
        }

        /**
        * Gets the module by `id`, otherwise if `def` is specified, define a new module.
        */
        function _module (id, def, noExports, module) {

            /**
            * Always return back the id for 'require', 'module' and 'exports',
            * these are replaced by calling _swapValues
            */
            if (~_rem.indexOf(id)) {
                return id;
            }

            /**
            * If a definition was specified, set the module definition
            */
            module = _modules[id] = def || _modules[id];

            /**
            * noExports is set to true from within define, to get back the full module object.
            * If noExports != true, then we return the exports property of the module.
            * If the module is not defined, return false
            */
            return (module && module.exports) ? (noExports ? module : module.exports) : 0;
        }

        /**
        * Gets the URL for a module by `id`. Paths passed to _getURL must be absolute.
        * To get URLs for relative paths use require.toUrl(id, context)
        */
        function _getURL (id, prefix) {

            /**
            * If the path starts with a '/', or 'http', it's an absolute URL
            * If it's not an absolute URL, prefix the request with baseUrl
            */

            prefix = (!id.indexOf('/') || !id.indexOf('http')) ? '' : _baseUrl;

            for (var p in _paths) {
                id = id.replace(new RegExp('(^' + p + ')', 'g'), _paths[p]);
            }

            return prefix + id + (id.indexOf('.') < 0 ? '.js' : '') + _urlArgs;
        }

        /**
        * Takes an array as the first argument, and an object as the second.
        * Replaces any values found in the array, with values in the object.
        */
        function _swapValues (a, s, j) {
            for (var i in s) {
                j = a.indexOf(i);
                if (~j) {
                    a[j] = s[i];
                }
            }
            return a;
        }

        /**
        * Stores dependencies for this module id.
        * Also checks for any circular dependencies, if found, it defines those modules as empty objects temporarily
        */
        function _resolveCircularReferences (id, dependencies, circulars, i, j, d, subDeps, sd) {

            _dependencies[id] = dependencies;

            /**
            * Check for any dependencies that have circular references back to this module
            */
            for (i = 0; i < dependencies.length; i ++) {
                d = dependencies[i];
                subDeps = _dependencies[d];
                if (subDeps) {
                    for (j = 0; j < subDeps.length; j ++) {
                        sd = subDeps[j];
                        if (dependencies.indexOf(sd) < 0) {
                            if (sd !== id) {
                                dependencies.push(sd);
                            }
                            else {
                                /**
                                * Circular reference detected, define circular
                                * references as empty modules to be defined later
                                */
                                _module(d, {exports : {}});
                            }
                        }
                    }
                }
            }
        }

        /**
        * Define modules. AMD-spec compliant.
        */
        function define (
            id,
            dependencies,
            factory,
            alreadyQed,
            depsLoaded,
            meta,
            module,
            facArgs,
            context,
            ri,
            localRequire
        ) {

            if (!meta) {
                meta = _meta();
            }

            if (typeof id !== 'string') {

                /**
                * No id means that this is an anonymous module,
                * push it to a queue, to be defined upon onLoad
                */

                factory = dependencies;
                dependencies = id;
                id = 0;
                _defineQ.push([dependencies, factory, meta]);

                return meta;
            }

            if (!Array.isArray(dependencies)) {
                factory = dependencies;
                dependencies = [];
            }

            if (!alreadyQed) {
                /**
                * ID was specified, so this is not an anonymous module,
                * However, we still need to add an empty queue here to be cleaned up by onLoad
                */
                // TODO : REVISIT
                // _defineQ.push(0);
            }

            context = _getContext(id);
            localRequire = require.localize(context);

            /**
            * No dependencies, but the factory function is expecting arguments?
            * This means that this is a CommonJS-type module...
            */

            if (!dependencies.length && factory.length && typeof factory === 'function' && !factory.__meta) {

                /**
                * Let's check for any references of sync-type require('moduleID')
                */
                factory.toString()
                    // Remove any comments first
                    .replace(/(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg, '')
                    // Now let's check for any sync style require('module') calls
                    .replace(/(?:require)\(\s*['']([^''\s]+)['']\s*\)/g,

                        function ($0, $1) {
                            if (dependencies.indexOf($1) < 0) {
                                /**
                                * We're not actually replacing anyting inside factory.toString(),
                                * but this is a nice, clean, convenient way to add any
                                * sync-type require() matches to the dependencies array.
                                */
                                dependencies.push($1);
                            }
                        }
                    );

                dependencies = (_rem.slice(0, factory.length)).concat(dependencies);
            }

            if (dependencies.length && !depsLoaded) {

                /**
                * Dependencies have not been loaded yet, so let's call require() to load them
                * After the dependencies are loaded, reinvoke define() with depsLoaded set to true.
                */
                _resolveCircularReferences(id, dependencies.slice(0));

                localRequire(dependencies, function () {
                    define(id, Array.prototype.slice.call(arguments, 0), factory, 1, 1, meta);
                });

                return meta;
            }

            /**
            * At this point, we know all dependencies have been loaded,
            * and `dependencies` is an actually array of modules, not their ids
            * Get the module if it has already been defined, otherwise let's create it
            */

            module = _module(id, 0, 1);
            module = module || {exports: {}};

            if (typeof factory === 'function' && !factory.__meta) {

                /**
                * If the factory is a function, we need to invoke it.
                * First let's swap 'require', 'module' and 'exports' with actual objects
                */
                facArgs = _swapValues(
                    dependencies.length ? dependencies : (_rem.slice(0, factory.length)),
                    {
                        'require' : localRequire,
                        'module' : module,
                        'exports' : module.exports
                    }
                );

                /**
                * In some scenarios, the global require object might have slipped through,
                * If so, replace it with a localized require.
                */
                ri = facArgs.indexOf(require);
                if (~ri) {
                    facArgs[ri] = localRequire;
                }

                /**
                * If the function returns a value, then use that as the module definition
                * Otherwise, assume the function modifies the exports object.
                */
                module.exports = factory.apply(factory, facArgs) || module.exports;
            }

            else {
                /**
                * If the factory is not a function, set module.exports to whatever factory is
                */
                module.exports = factory;
            }

            /**
            * Make the call to define the module.
            */
            _module(id, module);
            meta.resolve(id, module);

            /**
            * Clear the dependencies from the _dependencies object.
            * _dependencies gets checked regularly to resolve circular dependencies
            * and if this module had any circulars, they have already been resolved.
            */
            delete _dependencies[id];

            /**
            * Now let's check the _loadQ
            */
            _checkLoadQ();

            return meta;
        }

        /**
        * Our define() function is an AMD implementation
        */
        define.amd = {};

        function undefine (id) {
            _modules[id] = _metas[id] = null;
            delete _modules[id];
            delete _metas[id];
        }

        /**
        * Asynchronously loads in js files for the modules specified.
        * If all modules are already defined, the callback function is invoked immediately.
        * If id(s) is specified but no callback function, attempt to get the module and
        * return the module if it is defined, otherwise throw an Error.
        */
        function require (ids, callback, context, plugins, i, modules, plugin) {

            if (!callback) {

                /**
                * If no callback is specified, then try to get the module by it's ID
                */

                ids = _resolve(ids, context);
                callback = _module(ids);

                if (!callback) {

                    plugin = _loadPluginModule(ids, context);

                    if (plugin) {
                        return plugin;
                    }

                    return {
                        id : ids,
                        __isRequire : true,
                        resolve : function (cb) {
                            return require(ids, cb);
                        }
                    };
                }

                /**
                * Otherwise return the module's definition.
                */
                return callback;
            }

            ids = (!Array.isArray(ids)) ? [ids] : ids;
            modules = [];

            for (i = 0; i < ids.length; i ++) {
                /**
                * Convert all relative paths to absolute paths,
                * Then check to see if the modules are already defined.
                */
                ids[i] = _resolve(ids[i], context);
                modules.push(_module(ids[i]));
            }

            if (~modules.indexOf(0)) {
                /**
                * If any one of the modules is not yet defined, we need to
                * wait until the undefined module(s) are loaded, so call load() and return.
                */
                _load(ids, callback, context);
                return;
            }

            /**
            * Otherwise, we know all modules are already defined.
            * Invoke the callback immediately, swapping 'require' with the actual require function
            */
            return callback.apply($b, _swapValues(modules, {'require' : require}));
        }

        /**
        * Configure, possible configuration properties are:
        *
        *    - baseUrl
        *    - urlArgs
        *    - waitSeconds
        */
        require.config = function (obj) {

            _config = obj || {};

            _baseUrl = _config.baseUrl ? _config.baseUrl : _baseUrl;

            // Add a trailing slash to baseUrl if needed.
            _baseUrl += (_baseUrl && _baseUrl.charAt(_baseUrl.length - 1) !== '/') ? '/' : '';
            _baseUrl = _normalize(_baseUrl);

            _urlArgs = _config.urlArgs ? '?' + _config.urlArgs : _urlArgs;

            _waitSeconds = _config.waitSeconds || _waitSeconds;

            for (var p in _config.paths) {
                _paths[p] = _config.paths[p];
            }
        };

        /**
        * Get a url for a relative id.
        * You do not need to specify `context` if calling this from within a define() call,
        * or a localized version of require();
        */
        require.toUrl = function (id, context) {
            return _getURL(_resolve(id, context));
        };

        require.metas = function () {

            var p,
                metasArray;

            metasArray = [];

            for (p in _metas) {
                metasArray.push(_metas[p]);
            }

            return metasArray.sort(function (a, b) {
                return a.order - b.order;
            });
        };

        /**
        * Returns a localized version of require, so that modules do not need
        * to specify their own id, when requiring relative modules, or resolving relative urls.
        */
        require.localize = function (context) {

            function localRequire (ids, callback) {
                return require(ids, callback, context);
            }

            localRequire.toUrl = function (id) {
                return require.toUrl(id, context);
            };

            return localRequire;
        };

        return {
            require : require,
            define  : define,
            undefine : undefine
        };

    })();

    $b.require = resolver.require;
    $b.define = resolver.define;
    $b.undefine = resolver.undefine;

    /* jshint ignore : start */
    if (origRequire) {
        require = origRequire;
    }
    /* jshint ignore : end */

}).call(this);
