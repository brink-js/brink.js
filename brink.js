;(function () {

    'use strict';
    
    var $b,
        _global,
        CONFIG,
        IS_NODE,
        EMPTY_FN;
    
    /*jshint ignore : start */
    IS_NODE = typeof exports !== 'undefined' && this.exports !== exports;
    /*jshint ignore : end */
    
    _global = IS_NODE ? global : window;
    CONFIG = _global.Brink || _global.$b || {};
    
    EMPTY_FN = function () {};
    
    if (IS_NODE) {
        _global = global;
        _global.include = _global.include || require;
    }
    
    else {
        _global = window;
    }
    
    $b = _global.$b = _global.Brink = function () {
    
        var args;
    
        args = Array.prototype.slice.call(arguments, 0);
    
        if (args.length) {
    
            if (args.length === 1 && typeof args[0] === 'string') {
                if ($b.require) {
                    return $b.require.apply(_global, args);
                }
            }
    
            if ($b.define) {
    
                if (!Array.isArray(args[0]) && !Array.isArray(args[1])) {
                    args.splice(args.length - 1, 0, []);
                }
    
                return $b.define.apply(_global, args);
            }
        }
    
        return $b;
    };
    
    /********* POLYFILLS *********/
    
        ;(function () {
        
        	'use strict';
        
        	if (!Array.prototype.forEach) {
        
        		Array.prototype.forEach = function (fn, scope) {
        
        			var i,
        				l;
        
        			l = this.length || 0;
        
        			for (i = 0; i < l; i ++) {
        				fn.call(scope, this[i], i, this);
        			}
        		};
        	}
        
        })();
    
    
        ;(function () {
        
        	'use strict';
        
        	if (!Array.prototype.filter) {
        
        		Array.prototype.filter = function (fn, scope) {
        
        			var result = [];
        
        			this.forEach(function (val, i) {
        				if (fn.call(scope, val, i, this)) {
        					result.push(val);
        				}
        			});
        
        			return result;
        
        		};
        	}
        
        })();
    
    
        ;(function () {
        
        	'use strict';
        
        	if (!Array.prototype.indexOf) {
        
        		Array.prototype.indexOf = function (a, b) {
        
        			if (!this.length || !(this instanceof Array) || arguments.length < 1) {
        				return -1;
        			}
        
        			b = b || 0;
        
        			if (b >= this.length) {
        				return -1;
        			}
        
        			while (b < this.length) {
        				if (this[b] === a) {
        					return b;
        				}
        				b += 1;
        			}
        			return -1;
        		};
        	}
        
        })();
    
    
        ;(function () {
        
            'use strict';
        
            if (!Array.isArray) {
        
                Array.isArray = function (vArg) {
                    return Object.prototype.toString.call(vArg) === '[object Array]';
                };
            }
        
        })();
    
    
        ;(function () {
        
        	'use strict';
        
        	if (!Function.prototype.bind) {
        
        		Function.prototype.bind = function (oThis) {
        
        			if (typeof this !== 'function') {
        				// closest thing possible to the ECMAScript 5 internal IsCallable function
        				throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
        			}
        
        			var aArgs = Array.prototype.slice.call(arguments, 1),
        				fToBind = this,
        				FNOP = function () {},
        				fBound = function () {
        					return fToBind.apply(this instanceof FNOP ? this : oThis || window,
        					aArgs.concat(Array.prototype.slice.call(arguments)));
        				};
        
        			FNOP.prototype = this.prototype;
        			fBound.prototype = new FNOP();
        			return fBound;
        		};
        	}
        
        })();
    
    
        ;(function () {
        
        	'use strict';
        
        	var _global = typeof window !== 'undefined' ? window : global;
        
        	if (typeof _global !== 'undefined' && (!_global.requestAnimationFrame || !_global.cancelAnimationFrame)) {
        
        		var lastTime = 0;
        		var vendors = ['ms', 'moz', 'webkit', 'o'];
        		for (var x = 0; x < vendors.length && !_global.requestAnimationFrame; x ++) {
        			_global.requestAnimationFrame = _global[vendors[x] + 'RequestAnimationFrame'];
        			_global.cancelAnimationFrame = _global[vendors[x] + 'CancelAnimationFrame'] ||
        				_global[vendors[x] + 'CancelRequestAnimationFrame'];
        		}
        
        		if (!_global.requestAnimationFrame) {
        			_global.requestAnimationFrame = function (callback) {
        				var currTime = new Date().getTime();
        				var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        				var id = _global.setTimeout(function () {
        					callback(currTime + timeToCall);
        				}, timeToCall);
        				lastTime = currTime + timeToCall;
        				return id;
        			};
        		}
        
        		if (!_global.cancelAnimationFrame) {
        			_global.cancelAnimationFrame = function (id) {
        				clearTimeout(id);
        			};
        		}
        
        		return _global.requestAnimationFrame;
        	}
        
        })();
    
    /*
        These are empty functions for production builds,
        only the dev version actually implements these, but
        we don't want code that uses them to Error.
    */
    
    $b.assert = $b.error = $b.required = EMPTY_FN;
    
    /********* RESOLVER *********/
    
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
                    _modules = {},
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
        
                            var idPart;
        
                            if (id) {
                                this.id = id;
                            }
        
                            if (module) {
                                this.module = module;
                            }
        
                            _metas[id] = {
                                module : this.module,
                                id : this.id,
                                url : this.url,
                                attachPath : this.attachPath,
                                order : moduleIndex ++
                            };
        
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
                    context = (path.indexOf('.') < 0) ? '' : context;
        
                    /**
                    * Never resolve 'require', 'module' and 'exports' to absolute paths
                    * For plugins, only resolve the plugin path, not anything after the first '!'
                    */
                    if (~_rem.indexOf(path) || ~path.indexOf('!')) {
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
    
    $b.require.config(CONFIG);
    
    $b.define('$b', $b);
    
    $b.configure = function (o) {
    
        var p;
    
        for (p in o) {
            CONFIG[p] = o[p];
        }
    
        $b.require.config(CONFIG);
    
        return $b;
    };
    
    $b.init = function (deps, cb) {
    
        $b.require(
    
            /* jscs : disable requireCommaBeforeLineBreak */
    
            [
                "brink/config",
                "brink/dev/error",
                "brink/dev/assert",
                "brink/dev/required",
                "brink/utils/isObject",
                "brink/utils/merge",
                "brink/utils/flatten",
                "brink/utils/isFunction",
                "brink/utils/expandProps",
                "brink/utils/computed",
                "brink/utils/alias",
                "brink/utils/get",
                "brink/utils/getObjKeyPair",
                "brink/utils/isBrinkInstance",
                "brink/utils/bindTo",
                "brink/utils/clone",
                "brink/utils/configure",
                "brink/utils/defineProperty",
                "brink/utils/extend",
                "brink/utils/inject",
                "brink/utils/intersect",
                "brink/utils/isBrinkObject",
                "brink/utils/set",
                "brink/utils/trim",
                "brink/core/CoreObject",
                "brink/utils/bindFunction",
                "brink/core/Object",
                "brink/core/NotificationManager",
                "brink/core/Class",
                "brink/core/Array",
                "brink/core/Dictionary",
                "brink/core/RunLoop",
                "brink/core/InstanceWatcher",
                "brink/core/InstanceManager",
                "brink/browser/ajax",
                "brink/browser/ReactMixin",
                "brink/node/build"
            ]
    
            , function () {
    
            /* jscs : enable */
    
                /********* ALIASES *********/
    
                $b.merge($b, {
                    F : EMPTY_FN
                });
    
                $b.merge($b.config, CONFIG);
    
                if ($b.isFunction(deps)) {
                    cb = deps;
                    cb($b);
                }
    
                else {
                    $b.require(deps, cb);
                }
    
            }
        );
    };
    
    if (IS_NODE) {
    
        $b.build = function () {
    
            var args = arguments;
    
            $b.init(function () {
                $b.build.apply(null, args);
            });
        };
    
        module.exports = $b;
    }

    $b.define('brink/config', 
    
        function () {
    
            'use strict';
    
            var IS_IE,
                IE_VERSION,
                DIRTY_CHECK;
    
            IE_VERSION = (function (rv, ua, re) {
    
                if (typeof navigator !== 'undefined' && navigator && navigator.appName === 'Microsoft Internet Explorer') {
    
                    ua = navigator.userAgent;
                    re = new RegExp('MSIE ([0-9]{1,}[\.0-9]{0,})');
    
                    if (re.exec(ua) != null) {
                        rv = parseFloat(RegExp.$1);
                    }
                }
    
                return rv || -1;
            })();
    
            IS_IE = IE_VERSION > -1;
    
            DIRTY_CHECK = (IS_IE && IE_VERSION < 9) || (!Object.defineProperty && !Object.__defineGetter__);
    
            return ({
                DIRTY_CHECK : DIRTY_CHECK,
                IS_IE : IS_IE,
                IE_VERSION : IE_VERSION
            });
        }
    
    ).attach('$b');

    $b('brink/dev/error', 
    
        function () {
    
            'use strict';
    
            return function (msg) {
                throw new Error(msg);
            };
        }
    
    ).attach('$b');

    $b('brink/dev/assert', 
    
        [
            './error'
        ],
    
        function (error) {
    
            'use strict';
    
            return function (msg, test) {
    
                if (!test) {
                    error(msg);
                }
            };
        }
    
    ).attach('$b');
    

    $b('brink/dev/required', 
    
        [
        ],
    
        function () {
    
            'use strict';
    
            return function () {
    
                return function () {
    
                };
    
            };
        }
    
    ).attach('$b');
    

    $b('brink/utils/isObject', 
    
        /***********************************************************************
        @class Brink
        ************************************************************************/
        function () {
    
            'use strict';
    
            var objectTypes = {
                'function' : true,
                'object' : true,
                'unknown' : true
            };
    
            /***********************************************************************
            Test whether or not a value is an `Object`.
    
            @method isObject
            @param {Any} obj The value to check.
            @return {Boolean} Whether or not the value is an `Object`.
            ************************************************************************/
            return function (obj) {
                return obj ? !!objectTypes[typeof obj] : false;
            };
        }
    
    ).attach('$b');

    $b('brink/utils/merge', 
    
        [
            './isObject'
        ],
    
        /***********************************************************************
        @class Brink
        ************************************************************************/
        function (isObject) {
    
            'use strict';
    
            /***********************************************************************
            Merge one `Array` or `Object` into another `Array` or `Object`.
            Modifies the first `Object` or `Array` passed in as an argument.
    
            @method merge
            @param {Object|Array} obj1 The `Object` or `Array` to merge into.
            @param {Object|Array} obj2 The `Object` or `Array` containing values to merge.
            @param {Boolean} [deep=false] Whether or not to deep copy objects when merging (`true`) or shallow copy (`false`)
            @return {Object|Array} The merged `Object` or `Array`.
            ************************************************************************/
            return function merge (a, b, deep) {
    
                var p,
                    o,
                    d;
    
                function arrayOrObject (o) {
                    return Array.isArray(o) ? [] : isObject(o) ? {} : false;
                }
    
                if (Array.isArray(a) || Array.isArray(b)) {
    
                    a = a || [];
                    b = b || [];
    
                    for (p = 0; p < b.length; p ++) {
    
                        o = b[p];
    
                        if (!~a.indexOf(o)) {
                            d = deep ? arrayOrObject(o) : null;
                            a.push(d ? merge(d, o, true) : o);
                        }
                    }
                    return a;
                }
    
                else if (isObject(a) || isObject(b)) {
    
                    a = a || {};
                    b = b || {};
    
                    for (p in b) {
    
                        o = b[p];
    
                        if (!b.hasOwnProperty(p)) {
                            continue;
                        }
    
                        d = deep ? arrayOrObject(o) : null;
                        a[p] = d ? merge(d, o, true) : o;
                    }
    
                    return a;
                }
    
                return null;
    
            };
        }
    
    ).attach('$b');

    $b('brink/utils/flatten', 
    
        [
            './merge'
        ],
    
        /***********************************************************************
        @class Brink
        ************************************************************************/
        function (merge) {
    
            'use strict';
    
            /***********************************************************************
            Flatten an array.
    
            This will go through each item in the array and if the value
            is also an array, will merge it into the parent array.
    
            Does not modify the original array.
    
            @method flatten
            @param {Array} arr The array to flatten.
            @param {Boolean} [keepDuplicates=false] Whether or not to keep duplicate values when flattening.
            @return {Array} The flattened array.
            ************************************************************************/
            return function flatten (a, keepDuplicates) {
    
                var i,
                    b,
                    c;
    
                b = [];
    
                for (i = 0; i < a.length; i ++) {
    
                    c = a[i];
    
                    if (Array.isArray(c)) {
                        c = flatten(c);
                    }
    
                    b = b.concat(c);
                }
    
                if (!keepDuplicates) {
                    merge([], b);
                }
    
                return b;
            };
        }
    
    ).attach('$b');

    $b('brink/utils/isFunction', 
    
        /***********************************************************************
        @class Brink
        ************************************************************************/
        function () {
    
            'use strict';
    
            /***********************************************************************
            Test whether or not a value is a `Function`.
    
            @method isFunction
            @param {Any} fn The value to check.
            @return {Boolean} Whether or not the value is a `Function`.
            ************************************************************************/
            return function (obj) {
                return typeof obj === 'function';
            };
        }
    
    ).attach('$b');

    $b('brink/utils/expandProps', 
    
        /***********************************************************************
        @class Brink
        ************************************************************************/
        function () {
    
            'use strict';
    
            return function (a, b, i, j, p, n, s) {
    
                a = [].concat(a);
    
                s = [];
    
                for (i = 0; i < a.length; i ++) {
    
                    p = a[i];
    
                    if (~p.indexOf('.')) {
    
                        b = p.split('.');
                        b.splice(b.length - 1, 1);
                        n = null;
    
                        while (b.length) {
                            n = n ? n + '.' : '';
                            n += b.splice(0, 1)[0];
                            s.push(n);
                        }
                    }
    
                    if (~p.indexOf(',')) {
                        p = p.split('.');
                        n = p.splice(0, p.length - 1).join('.');
                        b = p[0].split(',');
                        p = [];
    
                        for (j = 0; j < b.length; j ++) {
                            p.push([n, b[j]].join(n ? '.' : ''));
                        }
                    }
    
                    s = s.concat(p);
                }
    
                return s;
            };
        }
    
    ).attach('$b');

    $b('brink/utils/computed', 
    
        [
            './flatten',
            './isFunction',
            './expandProps'
        ],
    
        /***********************************************************************
        @class Brink
        ************************************************************************/
        function (flatten, isFunction, expandProps) {
    
            'use strict';
    
            /***********************************************************************
            Create a computed property on a {{#crossLink "Brink.Object"}}{{/crossLink}}
            instance or subclass.
    
            There are two ways to define computed properties, both methods are given below.
    
            **METHOD 1:**
            ```javascript
    
            var Person = $b.Object.extend({
                firstName : '',
                lastLame : '',
                fullName : $b.computed(function () {
                    return this.firstName + ' ' + this.lastName;
                }, 'firstName', 'lastName')
            });
    
            personInstance = Person.create({firstName : 'Jane', lastName : 'Doe'});
            console.log(personInstance.fullName); // 'Jane Doe';
    
            personInstance.lastName = 'Smith';
            console.log(personInstance.fullName); // 'Jane Smith';
    
            ```
            **METHOD 2:**
            ```javascript
            var personInstance = $b.Object.create({
                firstName : 'Jane',
                lastName : 'Smith',
                fullName : $b.computed({
    
                    watch : ['firstName', 'lastName'],
    
                    get : function () {
                        return [this.firstName, this.lastName].join(' ');
                    },
    
                    set : function (val) {
                        val = val.split(' ');
                        this.firstName = val[0];
                        this.lastName = val[1] || '';
                        return val.join(' ');
                    }
                })
            });
    
            console.log(personInstance.fullName); // 'Jane Smith';
            personInstance.fullName = 'John Doe';
            console.log(personInstance.firstName, personInstance.lastName); // 'John', 'Doe';
    
            ```
    
            You can use the second method with a getter AND setter, only a getter or only a setter.
            The first method only allows supplying a getter.
    
            The `watch` property is an array of properties that will cause this computed
            property to return a new value. In the first method, these properties
            can be specified after the getter.
    
            If you just want getter/setter support for a property you can specify an
            empty array for the `watch` property or not define it at all.
    
            @method computed
            @param {Function} fn The getter for the computed property.
            @param {String} ...watch The properties to watch.
            @return {ComputedProperty}
            ************************************************************************/
            return function (o) {
    
                if (isFunction(o)) {
                    o = {
                        watch : flatten([].slice.call(arguments, 1)),
                        get : o
                    };
                }
    
                if (typeof o.value === 'undefined') {
                    o.value = o.defaultValue;
                }
    
                o.watch = expandProps(o.watch ? [].concat(o.watch) : []);
                o.__isComputed = true;
    
                return o;
            };
        }
    
    ).attach('$b');

    $b('brink/utils/alias', 
    
        [
            './computed'
        ],
    
        /***********************************************************************
        @class Brink
        ************************************************************************/
        function (computed) {
    
            'use strict';
            /***********************************************************************
            Alias a property to another property on the object.
    
            ```javascript
    
            var obj = $b.Object.create({
                a : 'test',
                b : $b.alias('a')
            });
    
            console.log(obj.a, obj.b); //test, test
            this.b = 'test2';
            console.log(obj.a, obj.b); // test2, test2
    
    
            ```
    
            ```javascript
    
            var obj = $b.Object.create({a : 'test'});
            obj.prop('b', $b.alias('a'));
    
            console.log(obj.a, obj.b); // test, test
    
            obj.b = 'test2';
    
            console.log(obj.a, obj.b); // test2, test2
    
            ```
    
            @method alias
            @param {String} key The property to alias.
            @return {ComputedProperty} A computed property with a getter/setter that references the alias.
            ************************************************************************/
            return function (s) {
    
                return computed({
    
                    watch : [s],
    
                    get : function () {
                        return this.get(s);
                    },
    
                    set : function (val) {
                        return this.set(s, val);
                    }
                });
            };
        }
    
    ).attach('$b');
    

    $b('brink/utils/get', 
    
        [
        ],
    
        /***********************************************************************
        @class Brink
        ************************************************************************/
        function () {
    
            'use strict';
            /***********************************************************************
            Get a property or nested property on an object. Works on POJOs as well
            as `Brink.Object` instances.
    
            ```javascript
            var obj = {
                test : 'test',
                some : {
                    nested : {
                        key : 'test2'
                    }
                }
            };
    
            console.log($b.get(obj, 'test')); // 'test';
            console.log($b.get(obj, 'some.nested.key')); // 'test2';
            ```
    
            @method get
            @param {Object} The object containing the property.
            @param {String} key The property or nested property to get.
            @return {Any} The value of the property.
            ************************************************************************/
            return function (obj, key) {
    
                var i,
                    k;
    
                key = key.split('.');
    
                for (i = 0; i < key.length; i ++) {
                    k = key[i];
    
                    if (!obj) {
                        return null;
                    }
    
                    if (obj instanceof $b.Object) {
    
                        if (obj.__meta.getters[k]) {
                            obj = obj.__meta.getters[k].call(obj, k);
                        }
    
                        else {
                            obj = obj.__meta.pojoStyle ? obj[k] : obj.__meta.values[k];
                        }
                    }
    
                    else {
                        obj = obj[k];
                    }
                }
    
                return obj;
            };
        }
    
    ).attach('$b');
    

    $b('brink/utils/getObjKeyPair', 
    
        [
            './get'
        ],
    
        /***********************************************************************
        @class Brink
        ************************************************************************/
        function (get) {
    
            'use strict';
    
            /***********************************************************************
            Given an object and a 'nested property', return the sub-object and key name.
    
            ```javascript
            var obj = {
                some : {
                    nested : {
                        key : 'test'
                    }
                }
            };
    
            console.log($b.getObjKeyPair(obj, 'some.nested.key')) // [ { key: 'test' }, 'key' ]
            ```
    
            @method getObjKeyPair
            @param {Object} The object containing the nested key.
            @param {String} key The nested key.
            @param {Boolean} [createIfNull=false] Whether to create objects for nested keys if the path would be invalid.
            @return {Array} An `Array` of `[obj, unNestedKeyName]`
            ************************************************************************/
            return function (obj, key, createIfNull) {
    
                var i,
                    val;
    
                key = key.split('.');
    
                for (i = 0; i < key.length - 1; i ++) {
                    val = get(obj, key[i]);
                    if (val == null) {
                        val = obj[key[i]] = {};
                    }
                    obj = val;
                }
    
                key = key.pop();
    
                return [obj, key];
            };
        }
    
    ).attach('$b');
    

    $b('brink/utils/isBrinkInstance', 
    
        [
    
        ],
    
        /***********************************************************************
        @class Brink
        ************************************************************************/
        function () {
    
            'use strict';
    
            /***********************************************************************
            Test whether or not a value is an instance of `Brink.Object` or `Brink.Object` subclass.
    
            @method isBrinkInstance
            @param {Any} obj The value to check.
            @return {Boolean} Whether or not the value is an instance of `Brink.Object`.
            ************************************************************************/
            return function (obj) {
                return obj.constructor.__meta.isObject;
            };
        }
    
    ).attach('$b');

    $b('brink/utils/bindTo', 
    
        [
            './computed',
            './getObjKeyPair',
            './isBrinkInstance'
        ],
    
        /***********************************************************************
        @class Brink
        ************************************************************************/
        function (computed, getObjKeyPair, isBrinkInstance) {
    
            'use strict';
            /***********************************************************************
            Two-way bind a property on `A` to a property on `B`
    
            ```javascript
    
            var a = $b.Object.create({
                test : 'test'
            });
    
            var b = $b.Object.create({
                test : $b.bindTo(a, 'test')
            });
    
            console.log(a.test, b.test); // test, test
            b.test = 'test2';
            console.log(a.test, b.test); // test2, test2
    
            ```
    
            @method bindTo
            @param {Brink.Object} obj The object that contains the property to alias.
            @param {String} key The property to alias.
            ************************************************************************/
            return function (a, prop, isDefined) {
    
                var b;
    
                if (arguments.length > 1) {
    
                    $b.assert('Object must be an instance of Brink.Object or Brink.Class', isBrinkInstance(a));
    
                    if (!isDefined) {
                        a.prop(prop);
                    }
    
                    b = computed({
    
                        get : function () {
                            return a.get(prop);
                        },
    
                        set : function (val) {
                            val = val;
                            return a.set(prop, val);
                        },
    
                        __didChange : function () {
                            return b.didChange();
                        },
    
                        value : a.get(prop)
                    });
    
                    a.watch(prop, b.__didChange);
                }
    
                else {
    
                    prop = a;
    
                    b = computed({
    
                        watch : prop,
    
                        get : function () {
                            return this.get(prop);
                        },
    
                        set : function (val) {
                            return this.set(prop, val);
                        }
                    });
                }
    
                return b;
            };
        }
    
    ).attach('$b');

    $b('brink/utils/clone', 
    
        [
            './merge',
            './isObject'
        ],
    
        /***********************************************************************
        @class Brink
        ************************************************************************/
        function (merge, isObject) {
    
            'use strict';
    
            /***********************************************************************
            Creates a copy of a plain Object or Array. (Do not use on Brink.Object/Array instances).
    
            @method clone
            @param {Object|Array} obj The object or array to clone.
            @param {Boolean} [deep=false] Whether or not to deep copy (`true`) or shallow copy (`false`)
            ************************************************************************/
            return function (o, deep, a) {
    
                function arrayOrObject (o) {
                    return Array.isArray(o) ? [] : isObject(o) ? {} : null;
                }
    
                a = arrayOrObject(o);
    
                return a ? merge(a, o, deep) : null;
            };
        }
    
    ).attach('$b');

    $b('brink/utils/configure', 
    
        [
            './merge',
            '../config'
        ],
    
        /***********************************************************************
        @class Brink
        ************************************************************************/
        function (merge, config) {
    
            'use strict';
    
            /***********************************************************************
            Set Brink configuration properties at runtime.
    
            @method configure
            @param {Object} obj Object of configuration properties.
            ************************************************************************/
            return function (o) {
                $b.merge(config, o);
                return config;
            };
        }
    
    ).attach('$b');
    

    $b('brink/utils/defineProperty', 
    
        [
            './isBrinkInstance'
        ],
    
        /***********************************************************************
        @class Brink
        ************************************************************************/
        function (isBrinkInstance) {
    
            'use strict';
    
            /***********************************************************************
            Used by `Brink.Object.prototype.prop()` for property descriptors.
    
            @method defineProperty
            @private
            ************************************************************************/
            return function (obj, prop, descriptor) {
    
                $b.assert('Object must be an instance of Brink.Object or Brink.Class', isBrinkInstance(obj));
    
                descriptor.configurable = true;
                descriptor.enumerable = descriptor.enumerable !== 'undefined' ? descriptor.enumerable : true;
    
                if (prop.indexOf('__') === 0) {
                    descriptor.configurable = false;
                    descriptor.enumerable = false;
                }
    
                descriptor.get = obj.__defineGetter(prop, descriptor.get || obj.__writeOnly(prop));
                descriptor.set = obj.__defineSetter(prop, descriptor.set || obj.__readOnly(prop));
    
                descriptor.defaultValue = (
                    typeof descriptor.defaultValue !== 'undefined' ?
                    descriptor.defaultValue :
                    descriptor.value
                );
    
                delete descriptor.value;
                delete descriptor.writable;
    
                return descriptor;
            };
        }
    
    ).attach('$b');

    $b('brink/utils/extend', 
    
        [
            './isObject',
            './isFunction'
        ],
    
        /***********************************************************************
        @class Brink
        ************************************************************************/
    
        /***********************************************************************
        Used by `Brink.CoreObject` for inheritance and mixins.
    
        @method extend
        @private
        ************************************************************************/
        function (isObject, isFunction) {
    
            'use strict';
    
            function isPlainObject (o) {
                return isObject(o) && o.constructor === Object;
            }
    
            function isArray (a) {
                return Array.isArray(a);
            }
    
            function extend (target) {
    
                var i,
                    l,
                    src,
                    clone,
                    copy,
                    deep,
                    name,
                    options,
                    copyIsArray;
    
                // Handle case when target is a string or something (possible in deep copy)
                if (typeof target !== 'object' && !isFunction(target)) {
                    target = {};
                }
    
                i = isObject(arguments[1]) ? 1 : 2;
                deep = (arguments[1] === true);
    
                for (l = arguments.length; i < l; i ++) {
    
                    // Only deal with non-null/undefined values
                    if ((options = arguments[i]) != null) {
    
                        // Extend the base object
                        for (name in options) {
    
                            src = target[name];
                            copy = options[name];
    
                            // Prevent never-ending loop
                            if (target === copy) {
                                continue;
                            }
    
                            // Recurse if we're merging plain objects or arrays
                            if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
    
                                if (copyIsArray) {
                                    copyIsArray = false;
                                    clone = src && isArray(src) ? src : [];
    
                                }
    
                                else {
                                    clone = src && isPlainObject(src) ? src : {};
                                }
    
                                // Never move original objects, clone them
                                target[name] = extend(clone, deep, copy);
                            }
    
                            // Don't bring in undefined values
                            else if (copy !== undefined) {
                                target[name] = copy;
                            }
                        }
                    }
                }
    
                return target;
            }
    
            return extend;
        }
    
    ).attach('$b');

    $b('brink/utils/inject', 
    
        [],
    
        /***********************************************************************
        @class Brink
        ************************************************************************/
        function () {
    
            'use strict';
    
            /***********************************************************************
            Inject a property into a subclass' prototype.
    
            @method inject
            @param {String|Object} A single key (`String`) or object of key : value pairs.
            @param {Any} [val] If setting a single property, the value of the property.
            ************************************************************************/
            return function (Class) {
                Class.inject.apply(Class, arguments);
            };
        }
    
    ).attach('$b');
    

    $b('brink/utils/intersect', 
    
        [
            './flatten'
        ],
    
        /***********************************************************************
        @class Brink
        ************************************************************************/
        function (flatten) {
    
            'use strict';
    
            /***********************************************************************
            Compare two arrays and return an `Array` with items that exist
            in both arrays.
    
            @method intersect
            @param {Array} arr1 The first `Array` to compare.
            @param {Array} arr2 The second `Array` to compare.
            @return {Array} `Array` of items that exist in both arrays.
            ************************************************************************/
            return function (a, b) {
    
                var i,
                    c;
    
                b = flatten([].slice.call(arguments, 1));
                c = [];
    
                for (i = 0; i < b.length; i ++) {
                    if (~a.indexOf(b[i])) {
                        c.push(b[i]);
                    }
                }
    
                return c;
            };
        }
    
    ).attach('$b');
    

    $b('brink/utils/isBrinkObject', 
    
        /***********************************************************************
        @class Brink
        ************************************************************************/
        function () {
    
            'use strict';
    
            /***********************************************************************
            Test whether or not a value is a `Brink.Object` subclass.
    
            @method isBrinkObject
            @param {Any} obj The value to check.
            @return {Boolean} Whether or not the value is a `Brink.Object` subclass.
            ************************************************************************/
            return function (obj) {
                return obj.__isObject;
            };
        }
    
    ).attach('$b');

    $b('brink/utils/set', 
    
        [
            './get',
            './getObjKeyPair'
        ],
    
        /***********************************************************************
        @class Brink
        ************************************************************************/
        function (get, getObjKeyPair) {
    
            'use strict';
    
            /***********************************************************************
            Set property/properties or a nested property on an `Object`. Works on POJOs as well
            as `Brink.Object` instances.
    
            **Setting single properties:**
    
            ```javascript
            var obj = {};
    
            $b.set(obj, 'test', 'test');
            $b.set(obj, 'some.nested.key', 'test2');
    
            console.log(obj); // { test: 'test', some: { nested: { key: 'test2' } } }
    
            ```
    
            **Setting multiple properties:**
    
            ```javascript
            var obj = {};
    
            $b.set(obj, {test : 'test', test2 : 'test2'});
    
            console.log(obj); // { test: 'test', test2: 'test2' }
    
            ```
    
            @method set
            @param {Object} obj The object containing the property/properties to set.
            @param {String|Object} key The name of the property to set. If setting multiple properties, an `Object` containing key : value pairs.
            @param {Any} [val] The value of the property.
            @return {Object} The Object passed in as the first argument.
            ************************************************************************/
            var set = function (obj, key, val, quiet, skipCompare) {
    
                var i;
    
                if (typeof key === 'string') {
    
                    obj = getObjKeyPair(obj, key, true);
                    key = obj[1];
                    obj = obj[0];
    
                    if (skipCompare || get(obj, key) !== val) {
    
                        if (obj instanceof $b.Object) {
    
                            if (obj.__meta.setters[key]) {
                                val = obj.__meta.setters[key].call(obj, val, key);
                            }
    
                            else {
    
                                if (obj.__meta.pojoStyle) {
                                    obj[key] = val;
                                }
    
                                obj.__meta.values[key] = val;
                            }
    
                            if (!quiet) {
                                obj.propertyDidChange(key);
                            }
                        }
    
                        else {
                            obj[key] = val;
                        }
                    }
    
                    return obj;
                }
    
                else if (arguments.length === 2) {
    
                    for (i in key) {
                        set(obj, i, key[i], val, quiet);
                    }
    
                    return obj;
                }
    
                $b.error('Tried to call `set` with unsupported arguments', arguments);
            };
    
            return set;
        }
    
    ).attach('$b');
    

    $b('brink/utils/trim', 
    
        /***********************************************************************
        @class Brink
        ************************************************************************/
        function () {
    
            'use strict';
    
            /***********************************************************************
            Replaces all whitespace at the beginning and end of a `String`.
    
            @method trim
            @param {String} str The `String` to trim.
            @return {String} The trimmed string.
            ************************************************************************/
            return function (s) {
                return typeof s === 'string' ? s.replace(/^\s+|\s+$/gm, '') : s;
            };
        }
    
    ).attach('$b');

    $b('brink/core/CoreObject', 
    
        [
            '../utils/extend'
        ],
    
        function (extend) {
    
            'use strict';
    
            var CoreObject;
    
            /***********************************************************************
    
            `Brink.CoreObject` is not meant to be used directly.
            Instead, use {{#crossLink "Brink.Object"}}{{/crossLink}} or {{#crossLink "Brink.Class"}}{{/crossLink}}.
    
            @class Brink.CoreObject
            @constructor
            ************************************************************************/
            CoreObject = function () {};
    
            CoreObject.extend = function (props) {
    
                var C,
                    i,
                    proto;
    
                if (arguments.length > 1) {
    
                    i = 0;
                    C = this;
    
                    while (i < arguments.length - 1) {
                        C = C.extend(arguments[i]);
                        i ++;
                    }
    
                    return C;
                }
    
                proto = this.buildPrototype.call(this, props);
    
                function BrinkObject (callInit) {
    
                    var fn;
    
                    if (callInit === true || callInit === false) {
    
                        if (callInit) {
                            fn = this.__init || this.init || this.constructor;
                            fn.call(this);
                        }
    
                        return this;
                    }
    
                    return BrinkObject.extend.apply(BrinkObject, arguments);
                }
    
                BrinkObject.prototype = proto;
                extend(BrinkObject, this, proto.statics || {});
    
                BrinkObject.prototype.constructor = BrinkObject;
    
                return BrinkObject;
            };
    
            CoreObject.buildPrototype = function (props) {
                var BrinkPrototype = function () {};
                BrinkPrototype.prototype = this.prototype;
                return extend(new BrinkPrototype(), props);
            };
    
            CoreObject.inject = function (p, v) {
    
                if (typeof p === 'object') {
                    extend(this.prototype, p);
                }
    
                else {
                    this.prototype[p] = v;
                }
    
                return this;
            };
    
            CoreObject.create = function () {
    
                var init,
                    instance;
    
                instance = new this(false);
    
                init = instance.__init || instance.init;
    
                if (init) {
                    instance = init.apply(instance, arguments) || instance;
                }
    
                return instance;
            };
    
            return CoreObject;
        }
    
    ).attach('$b');
    

    $b('brink/utils/bindFunction', 
    
        [],
    
        /***********************************************************************
        @class Brink
        ************************************************************************/
        function () {
    
            'use strict';
            /***********************************************************************
            Bind a function to a specific scope. Like `Function.prototype.bind()`. Does
            not modify the original function.
    
            ```javascript
    
            var obj = $b.Object.create({
                a : 'test'
            });
    
            function test () {
                console.log(this.a);
            }
    
            var boundTest = $b.bindFunction(test, obj);
            boundTest(); // test
    
            ```
    
            @method bindFunction
            @param {Function} fn The function to bind.
            @param {Brink.Object|Brink.Class} The scope to bind to.
            @return {Function} The bound version of the function.
            ************************************************************************/
            // Faster than Function.prototype.bind in V8, not sure about others.
            return function (fn, scope) {
                return function () {
                    return fn.apply(scope, arguments);
                };
            };
        }
    
    ).attach('$b');
    

    $b('brink/core/Object', 
    
        [
            '../config',
            './CoreObject',
            '../utils/get',
            '../utils/set',
            '../utils/clone',
            '../utils/merge',
            '../utils/bindTo',
            '../utils/flatten',
            '../utils/intersect',
            '../utils/isFunction',
            '../utils/expandProps',
            '../utils/bindFunction',
            '../utils/getObjKeyPair',
            '../utils/defineProperty'
    
        ],
    
        function (
            config,
            CoreObject,
            get,
            set,
            clone,
            merge,
            bindTo,
            flatten,
            intersect,
            isFunction,
            expandProps,
            bindFunction,
            getObjKeyPair,
            defineProperty
        ) {
    
            'use strict';
    
            var Obj;
    
            Obj = CoreObject.extend({
    
                /***********************************************************************
    
                `Brink.Object` is the primary base Class. Most of your Objects will
                extend this Class, unless you need the added functionality of Brink.Class.
    
                @class Brink.Object
                @extends Brink.CoreObject
                @constructor
                ************************************************************************/
                __init : function (o) {
    
                    var p,
                        meta;
    
                    if (!this.__meta) {
                        this.__parsePrototype.call(this);
                        meta = this.__meta;
                    }
    
                    else {
                        meta = this.__buildMeta();
                    }
    
                    if (o && typeof o === 'object' && !Array.isArray(o)) {
    
                        o = clone(o);
    
                        for (p in o) {
                            this.prop(p, o[p]);
                        }
                    }
    
                    for (p in meta.properties) {
                        this.__defineProperty.call(this, p, meta.properties[p]);
                    }
    
                    if (this.init) {
                        this.init.apply(this, arguments);
                    }
    
                    meta.isInitialized = true;
    
                    if ($b.instanceManager) {
                        $b.instanceManager.add(this, meta);
                    }
    
                    return this;
                },
    
                __buildMeta : function () {
    
                    var meta;
    
                    meta = this.__meta = clone(this.__meta || {});
    
                    meta.getters = clone(meta.getters || {});
                    meta.setters = clone(meta.setters || {});
    
                    meta.properties = clone(meta.properties || {});
                    meta.methods = clone(meta.methods || []);
                    meta.dependencies = clone(meta.dependencies || []);
    
                    meta.values = {};
                    meta.watchers = {
                        fns : [],
                        props : []
                    };
    
                    return meta;
                },
    
                __parsePrototype : function () {
    
                    var p,
                        v,
                        meta;
    
                    meta = this.__buildMeta();
    
                    for (p in this) {
    
                        v = this[p];
    
                        if (isFunction(v)) {
                            if (p !== 'constructor' && !~meta.methods.indexOf(p)) {
                               meta.methods.push(p);
                            }
                        }
    
                        else if (this.hasOwnProperty(p)) {
    
                            if (p !== '__meta') {
    
                                if (v && v.__isRequire && ~!meta.dependencies.indexOf(p)) {
                                    meta.dependencies.push(p);
                                }
    
                                else {
                                    this.prop.call(this, p, v);
                                }
                            }
                        }
                    }
    
                },
    
                __defineProperty : function (p, d) {
    
                    if (!config.DIRTY_CHECK) {
    
                        d = clone(d);
    
                       // Modern browsers, IE9 +
                        if (Object.defineProperty) {
                            Object.defineProperty(this, p, d);
                        }
    
                        // Old FF
                        else if (this.__defineGetter__) {
                            this.__defineGetter__(p, d.get);
                            this.__defineSetter__(p, d.set);
                        }
    
                        else {
                            this.__meta.pojoStyle = true;
                        }
    
                        if (typeof d.defaultValue !== 'undefined') {
                            this.set(p, d.defaultValue, true, true);
                        }
                    }
    
                    else {
                        this.__meta.pojoStyle = true;
                        this[p] = d.defaultValue;
                    }
    
                    if (d.watch && d.watch.length) {
                        this.watch(d.watch, d.didChange);
                    }
                },
    
                __undefineProperties : function () {
    
                    var p;
    
                    for (p in this.__meta.properties) {
                        delete this[p];
                    }
                },
    
                __readOnly : function (p) {
    
                    if (this.__meta.pojoStyle) {
                        return $b.error('Tried to write to a read-only property `' + p + '` on ' + this);
                    }
                },
    
                __writeOnly : function (p) {
    
                    if (this.__meta.pojoStyle) {
                        return $b.error('Tried to read a write-only property `' + p + '` on ' + this);
                    }
                },
    
                __defineGetter : function (p, fn) {
    
                    if (isFunction(fn)) {
                        this.__meta.getters[p] = fn;
                    }
    
                    return function () {
                        return this.get(p);
                    };
                },
    
                __defineSetter : function (p, fn) {
    
                    if (isFunction(fn)) {
                        this.__meta.setters[p] = fn;
                    }
    
                    return function (val) {
                        return this.set(p, val);
                    };
                },
    
                /***********************************************************************
                Invalidate one or more properties. This will trigger any bound and computed properties
                depending on these properties to also get updated.
    
                This will also trigger any watchers of this property in the next Run Loop.
    
                @method propertyDidChange
                @param  {Array|String} props A single property or an array of properties.
                ************************************************************************/
                propertyDidChange : function () {
    
                    var props;
    
                    props = flatten([].slice.call(arguments, 0, arguments.length));
    
                    if ($b.instanceManager) {
                        $b.instanceManager.propertyDidChange(this, props);
                    }
                },
    
                /***********************************************************************
                Gets a subset of properties on this object.
    
                @method getProperties
                @param {Array} keys A listof keys you want to get
                @return {Object} Object of key : value pairs for properties in `keys`.
                ************************************************************************/
                getProperties : function () {
    
                    var i,
                        p,
                        o,
                        props;
    
                    props = flatten([].slice.call(arguments, 0, arguments.length));
                    o = {};
    
                    if (props.length) {
    
                        for (i = 0; i < props.length; i ++) {
                            o[props[i]] = this.get(props[i]);
                        }
    
                        return o;
                    }
    
                    for (p in this.__meta.properties) {
                        o[p] = this.get(p);
                    }
    
                    return o;
                },
    
                /***********************************************************************
                Gets all properties that have changed since the last Run Loop.
    
                @method getChangedProperties
                @return {Object} Object of key : value pairs for all changed properties.
                ************************************************************************/
                getChangedProperties : function () {
                    return this.getProperties.apply(this, this.__meta.changedProps);
                },
    
                /***********************************************************************
                Get or create a property descriptor.
    
                @method prop
                @param {String} key Poperty name.
                @param [val] Default value to use for the property.
                @return {PropertyDescriptor}
                ************************************************************************/
                prop : function (key, val) {
    
                    var obj;
    
                    obj = getObjKeyPair(this, key);
                    key = obj[1];
                    obj = obj[0];
    
                    if (typeof obj.__meta.properties[key] !== 'undefined') {
                        if (typeof val === 'undefined') {
                            return obj.__meta.properties[key];
                        }
                    }
    
                    if (!val || !val.__isComputed) {
    
                        val = {
                            get : true,
                            set : true,
                            value : val
                        };
                    }
    
                    val = obj.__meta.properties[key] = defineProperty(obj, key, val);
                    val.key = key;
    
                    val.bindTo = bindFunction(function (o, p) {
                        o.prop(p, bindTo(obj, key, true));
                    }, obj);
    
                    val.didChange = bindFunction(function () {
                        obj.propertyDidChange(key);
                    }, obj);
    
                    if (obj.__meta.isInitialized) {
                        obj.__defineProperty(key, val);
                    }
    
                    return val;
                },
    
                /***********************************************************************
                Bind a property to a property on another object.
    
                This can also be achieved with : `a.prop('name').bindTo(b, 'name');`
    
                @method bindProperty
                @param {String} key Poperty name on ObjectA.
                @param {Brink.Object} obj ObjectB, whose property you want to bind to.
                @param {String} key2 Property name on ObjectB.
                ***********************************************************************/
                bindProperty : function (key, obj, key2) {
                    return this.prop(key).bindTo(obj, key2);
                },
    
                /***********************************************************************
                Get the value of a property.
    
                This is identical to doing `obj.key` or `obj[key]`,
                unless you are supporting <= IE8.
    
                @method get
                @param {String} key The property to get.
                @return The value of the property or `undefined`.
                ***********************************************************************/
                get : function (key) {
                    return get(this, key);
                },
    
                /***********************************************************************
                Set the value of a property.
    
                This is identical to doing `obj.key = val` or `obj[key] = val`,
                unless you are supporting <= IE8.
    
                You can also use this to set nested properties.
                I.e. `obj.set('some.nested.key', val)`
    
                @method set
                @param {String} key The property to set.
                @param val The value to set.
                @return The value returned from the property's setter.
                ***********************************************************************/
                set : function (key, val, quiet, skipCompare) {
                    return set(this, key, val, quiet, skipCompare);
                },
    
                /***********************************************************************
                Watch a property or properties for changes.
    
                ```javascript
    
                var obj = $b.Object.create({
    
                    color : 'green',
                    firstName : 'Joe',
                    lastName : 'Schmoe',
    
                    init : function () {
                        this.watch('color', this.colorChanged.bind(this));
                        this.watch(['firstName', 'lastName'], this.nameChanged.bind(this));
                    },
    
                    colorChanged : function () {
                        console.log(this.color);
                    },
    
                    nameChanged : function () {
                        console.log(this.firstName + ' ' + this.lastName);
                    }
                });
    
                obj.color = 'red';
                obj.firstName = 'John';
                obj.lastName = 'Doe';
    
                ```
    
                Watcher functions are only invoked once per Run Loop, this means that the `nameChanged`
                method above will only be called once, even though we changed two properties that
                `nameChanged` watches.
    
                You can skip the `props` argument to watch all properties on the Object.
    
                @method watch
                @param {null|String|Array} props The property or properties to watch.
                @param {Function} fn The function to call upon property changes.
                ***********************************************************************/
                watch : function () {
    
                    var fn,
                        props;
    
                    props = arguments[0];
                    fn = arguments[1];
    
                    if ($b.instanceManager) {
    
                        if (typeof fn !== 'function') {
    
                            fn = [].slice.call(arguments, arguments.length - 1, arguments.length)[0];
    
                            if (arguments.length === 1) {
                                props = [];
                            }
    
                            else {
                                props = expandProps(flatten([].slice.call(arguments, 0, arguments.length - 1)));
                            }
                        }
    
                        else {
                            props = expandProps([].concat(props));
                        }
    
                        $b.instanceManager.watch(this, props, fn);
                    }
    
                    else {
                        $b.error('InstanceManager does not exist, can\'t watch for property changes.');
                    }
                },
    
                /***********************************************************************
                Remove a watcher.
    
                @method unwatch
                @param {Function|Array} fns The function(s) you no longer want to trigger on property changes.
                ***********************************************************************/
                unwatch : function () {
    
                    if ($b.instanceManager) {
                        $b.instanceManager.unwatch(this, flatten(arguments));
                    }
    
                    else {
                        $b.error('InstanceManager does not exist, can\'t watch for property changes.');
                    }
    
                },
    
                /***********************************************************************
                Remove all watchers watching properties this object.
    
                USE WITH CAUTION.
    
                This gets called automatically during `destroy()`, it's not very common
                you would want to call this directly.
    
                Any and all other objects that have bound properties,
                watchers or computed properties dependent on this Object instance will
                stop working.
    
                @method unwatchAll
                ***********************************************************************/
                unwatchAll : function () {
    
                    if ($b.instanceManager) {
                        $b.instanceManager.unwatchAll(this);
                    }
    
                    else {
                        $b.error('InstanceManager does not exist, can\'t watch for property changes.');
                    }
                },
    
                willNotifyWatchers : function () {
    
                },
    
                didNotifyWatchers : function () {
                    if (this.__meta) {
                        this.__meta.changedProps = [];
                    }
                },
    
                /***********************************************************************
                Destroys an object, removes all bindings and watchers and clears all metadata.
    
                In addition to calling `destroy()` be sure to remove all
                references to the object so that it gets Garbage Collected.
    
                @method destroy
                ***********************************************************************/
                destroy : function () {
    
                    this.unwatchAll();
                    this.__undefineProperties();
    
                    if ($b.instanceManager) {
                        $b.instanceManager.remove(this);
                    }
    
                    this.__meta = null;
                }
            });
    
            /***********************************************************************
            Extends an object's prototype and creates a new subclass.
    
            The new subclass will inherit all properties and methods of the Object being
            extended.
    
            ```javascript
    
            var Animal = $b.Object.extend({
    
                numLegs : 4,
    
                walk : function () {
                    for (var i = 1; i <= this.numLegs; i ++) {
                        console.log('moving leg #' + i);
                    }
                }
            });
    
            var Dog = Animal.extend({
    
                bark : function () {
                    console.log('woof!!');
                },
    
                walkAndBark : function () {
                    this.bark();
                    this.walk();
                }
            });
    
            var doggy = Dog.create();
            doggy.walkAndBark();
    
            ```
    
            If you want `super()` method support, use {{#crossLink "Brink.Class"}}{{/crossLink}}
    
            ```javascript
    
            var Animal = $b.Class.extend({
    
                numLegs : 4,
    
                walk : function () {
                    for (var i = 1; i <= this.numLegs; i ++) {
                        console.log('moving leg #' + i);
                    }
                }
            });
    
            var Dog = Animal.extend({
    
                bark : function () {
                    console.log('woof!!');
                },
    
                walk : function () {
                    this._super();
                    console.log('all ' + this.numLegs + ' legs moved successfully.');
                },
    
                walkAndBark : function () {
                    this.bark();
                    this.walk();
                }
            });
    
            var doggy = Dog.create();
            doggy.walkAndBark();
    
            ```
    
            @method extend
            ***********************************************************************/
            Obj.extend = function () {
    
                var proto,
                    SubObj;
    
                SubObj = CoreObject.extend.apply(this, arguments);
    
                proto = SubObj.prototype;
                proto.__parsePrototype.call(proto);
    
                return SubObj;
            };
    
            Obj.define = function () {
                $b.define(this.prototype.__dependencies, bindFunction(this.resolveDependencies, this));
                return this;
            };
    
            Obj.resolveDependencies = function () {
    
                var proto,
                    p;
    
                proto = this.prototype;
    
                for (p in proto.__dependencies) {
                    proto[p] = proto.__dependencies[p].resolve();
                }
    
                this.__meta.dependenciesResolved = true;
    
                return this;
            };
    
            Obj.load = function (cb) {
    
                cb = typeof cb === 'function' ? cb : function () {};
    
                if (this.__meta.dependenciesResolved) {
                    cb(this);
                }
    
                $b.require(this.prototype.__dependencies, bindFunction(function () {
                    this.resolveDependencies.call(this);
                    cb(this);
                }, this));
    
                return this;
            };
    
            Obj.__meta = merge(Obj.__meta || {}, {isObject: true});
    
            return Obj;
        }
    
    ).attach('$b');

    $b('brink/core/NotificationManager', 
    
        [
            '../utils/isFunction'
        ],
    
        function (isFunction) {
    
            'use strict';
    
            var _interests,
                _pendingNotifications,
    
                Notification,
                NotificationManager;
    
            _pendingNotifications = [];
            _interests = {};
    
            Notification = function (name, args, callback) {
                this.name = name;
                this.args = args;
                this.data = args && args.length === 1 ? args[0] : null;
                this.callback = callback;
                return this;
            };
    
            Notification.prototype.data = {};
            Notification.prototype.name = '';
            Notification.prototype.dispatcher = null;
            Notification.prototype.status = 0;
            Notification.prototype.pointer = 0;
            Notification.prototype.callback = null;
    
            Notification.prototype.hold = function () {
                this.status = 2;
            };
    
            Notification.prototype.release = function () {
                this.status = 1;
                NotificationManager.releaseNotification(this);
            };
    
            Notification.prototype.cancel = function () {
                this.data = {};
                this.name = '';
                this.status = 0;
                this.pointer = 0;
                this.dispatcher = null;
                this.callback = null;
    
                NotificationManager.cancelNotification(this);
            };
    
            Notification.prototype.dispatch = function (obj) {
                this.status = 1;
                this.pointer = 0;
                this.dispatcher = obj;
                NotificationManager.publishNotification(this);
            };
    
            Notification.prototype.respond = function () {
                if (this.callback) {
                    this.callback.apply(this.dispatcher, arguments);
                    this.cancel();
                }
            };
    
            function _publishNotification(notification) {
                _pendingNotifications.push(notification);
                _notifyObjects(notification);
            }
    
            function _notifyObjects(notification) {
    
                var name,
                    subs,
                    len;
    
                name = notification.name;
    
                if (_interests[name]) {
    
                    subs = _interests[name].slice(0);
                    len = subs.length;
    
                    while (notification.pointer < len) {
                        if (notification.status === 1) {
                            subs[notification.pointer].apply(null, [].concat(notification, notification.args));
                            notification.pointer ++;
                        } else {
                            return;
                        }
                    }
    
                    subs = null;
    
                    /**
                    * Notified all subscribers, notification is no longer needed,
                    * unless it has a callback to be called later via notification.respond()
                    */
                    if (notification.status === 1 && !notification.callback) {
                        notification.cancel();
                    }
                }
            }
    
            NotificationManager = {};
    
            NotificationManager.subscribe = function (name, fn, priority) {
    
                priority = isNaN(priority) ? -1 : priority;
                _interests[name] = _interests[name] || [];
    
                if (priority <= -1 || priority >= _interests[name].length) {
                    _interests[name].push(fn);
                } else {
                    _interests[name].splice(priority, 0, fn);
                }
            };
    
            NotificationManager.unsubscribe = function (name, fn) {
                var fnIndex = _interests[name].indexOf(fn);
                if (fnIndex > -1) {
                    _interests[name].splice(fnIndex, 1);
                }
            };
    
            NotificationManager.publish = function () {
    
                var notification,
                    args = Array.prototype.slice.call(arguments),
                    name = args[0],
                    dispatcher = args[args.length - 1],
                    callback = args[args.length - 2];
    
                callback = isFunction(callback) ? callback : null;
    
                args = args.slice(1, (callback ? args.length - 2 : args.length - 1));
    
                notification = new Notification(name, args, callback);
                notification.status = 1;
                notification.pointer = 0;
                notification.dispatcher = dispatcher;
                _publishNotification(notification);
            };
    
            NotificationManager.releaseNotification = function (notification) {
                notification.status = 1;
                if (_pendingNotifications.indexOf(notification) > -1) {
                    _notifyObjects(notification);
                }
            };
    
            NotificationManager.cancelNotification = function (notification) {
                _pendingNotifications.splice(_pendingNotifications.indexOf(notification), 1);
                notification = null;
            };
    
             $b.define('notificationManager', NotificationManager).attach('$b');
    
            return NotificationManager;
        }
    
    ).attach('$b.__');

    $b('brink/core/Class', 
    
        [
            '../config',
            './Object',
            './NotificationManager',
            '../utils/bindFunction',
            '../utils/merge'
        ],
    
        function (config, Obj, NotificationManager, bindFunction, merge) {
    
            'use strict';
    
            var Class,
                doesCallSuper;
    
            function superfy (fn, superFn) {
    
                return function () {
    
                    var r, tmp = this._super || null;
    
                    // Reference the prototypes method, as super temporarily
                    this._super = superFn;
    
                    r = fn.apply(this, arguments);
    
                    // Reset _super
                    this._super = tmp;
                    return r;
                };
            }
    
            /*
            If Function.toString() works as expected, return a regex that checks for `this._super`
            otherwise return a regex that passes everything.
            */
    
            doesCallSuper = (/xyz/).test(function () {
                var xyz;
                xyz = true;
            }) ? (/\bthis\._super\b/) : (/.*/);
    
            Class = Obj({
    
                /***********************************************************************
    
                `Brink.Class` provides several useful inheritance helpers
                and other utilities not found on `Brink.Object`:
    
                - `super()` method support.
    
                - Automatically bound methods.
    
                - Publish/Subscribe system.
    
                @class Brink.Class
                @extends Brink.Object
                @constructor
                ************************************************************************/
                __init : superfy(function () {
    
                    var i,
                        p,
                        meta;
    
                    this._super.apply(this, arguments);
    
                    meta = this.__meta;
    
                    /*
                        Auto-binding methods is very expensive as we have to do
                        it every time an instance is created. It roughly doubles
                        the time it takes to instantiate
    
                        Still, it's not really an issue unless you are creating thousands
                        of instances at once. Creating 10,000 instances with auto-bound
                        methods should still take < 500ms.
    
                        We auto-bind on $b.Class and not on $b.Object because it's
                        far more likely you'd be creating a lot of Object instances at once
                        and shouldn't need the overhead of this.
                    */
                    if (config.AUTO_BIND_METHODS || 1) {
                        for (i = 0; i < meta.methods.length; i ++) {
                            p = meta.methods[i];
                            if (!~p.indexOf('__')) {
                                this[p] = bindFunction(this[p], this);
                            }
                        }
                    }
    
                    return this;
    
                }, Obj.prototype.__init),
    
                /***********************************************************************
                Subscribe to notifications of type `name`.
    
                @method subscribe
                @param {String} name The name of the notifications to subscribe to.
                @param {Function} handler A function to handle the notifications.
                @param {Number} [priority] Lower is higher priority (priority of 0 will hear about the notifications before any other handler)
                ************************************************************************/
                subscribe : function (name, handler, priority) {
    
                    this._interestHandlers = this._interestHandlers || {};
    
                    if (handler && !this._interestHandlers[name]) {
                        handler = handler;
                        NotificationManager.subscribe(name, handler, priority);
                        this._interestHandlers[name] = handler;
                    }
                },
    
                /***********************************************************************
                Unsubscribe from notifications of type `name`.
    
                @method unsubscribe
                @param {String} name The name of the notifications to unsubscrube from.
                ************************************************************************/
                unsubscribe : function (name) {
    
                    if (this._interestHandlers && this._interestHandlers[name]) {
                        NotificationManager.unsubscribe(name, this._interestHandlers[name]);
                        delete this._interestHandlers[name];
                    }
                },
    
                /***********************************************************************
                Unsubscribe from all notifications.
    
                This gets called automatically during `destroy()`, it's not very common
                you would want to call this directly.
    
                @method unsubscribeAll
                ************************************************************************/
                unsubscribeAll : function () {
    
                    var interest;
    
                    for (interest in this._interestHandlers) {
                        if (this._interestHandlers.hasOwnProperty(interest)) {
                            this.unsubscribe(interest);
                        }
                    }
    
                    this._interestHandlers = [];
                },
    
                /***********************************************************************
                Publish a notification.
    
                @method publish
                @param {String} name The name of the notification to publish.
                @param {Function} handler A function to handle the notifications.
                @param {Any} [...args] The arguments you want to send to the notification handlers.
                ************************************************************************/
                publish : function (/*name, arg1, arg2, arg3..., callback*/) {
                    var args = Array.prototype.slice.call(arguments);
                    NotificationManager.publish.apply(NotificationManager, [].concat(args, this));
                },
    
                destroy : superfy(function () {
                    this.unsubscribeAll();
                    return this._super.apply(this, arguments);
                }, Obj.prototype.destroy)
            });
    
            Class.buildPrototype = function (props) {
    
                var p,
                    proto;
    
                proto = Obj.buildPrototype.call(this, props);
    
                for (p in props) {
    
                    if (
                        typeof props[p] === 'function' &&
                        typeof this.prototype[p] === 'function' &&
                        doesCallSuper.test(props[p])
                    ) {
                        // this._super() magic, as-needed
                        proto[p] = superfy(props[p], this.prototype[p]);
                    }
    
                    else if (
                        typeof props[p] === 'object' && (
                            p === 'concatProps' ||
                            ~(props.concatProps || []).indexOf(p) ||
                            ~(this.prototype.concatProps || []).indexOf(p)
                        )
                    ) {
                        proto[p] = merge(this.prototype[p], props[p]);
                    }
                }
    
                return proto;
            };
    
            return Class;
        }
    
    ).attach('$b');

    $b('brink/core/Array', 
    
        [
            './Object'
        ],
    
        function (Obj) {
    
            'use strict';
    
            var Arr,
                AP;
    
            AP = Array.prototype;
    
            Arr = Obj({
    
                content : null,
                length : 0,
    
                oldContent : null,
                pristineContent : null,
    
                init : function (content) {
    
                    this.set('content', content);
                    this.set('oldContent', content.concat());
                    this.set('length', this.content.length);
    
                    this.watch('content', this.contentDidChange);
                },
    
                get : function (i) {
    
                    if (isNaN(i)) {
                        return Obj.prototype.get.apply(this, arguments);
                    }
    
                    return this.content[i];
                },
    
                set : function (i, val) {
    
                    if (isNaN(i)) {
                        return Obj.prototype.set.apply(this, arguments);
                    }
    
                    this.replaceAt(i, val);
                    return val;
                },
    
                findBy : function (q, v) {
    
                    var i,
                        item;
    
                    for (i = 0; i < this.content.length; i ++) {
                        item = this.content[i];
                        if (item[q] === v) {
                            return item;
                        }
                    }
    
                    return null;
                },
    
                findIndexBy : function (q, v) {
    
                    var i,
                        item;
    
                    for (i = 0; i < this.content.length; i ++) {
                        item = this.content[i];
                        if (item[q] === v) {
                            return i;
                        }
                    }
    
                    return -1;
                },
    
                forEach : function (fn, scope) {
    
                    var i;
    
                    for (i = 0; i < this.content.length; i ++) {
                        fn.call(scope, this.content[i], i, this);
                    }
    
                },
    
                concat : function () {
                    var r = AP.concat.apply(this.content, arguments);
                    return this.prototype.constructor.create(r);
                },
    
                insert : function () {
                    return this.push.apply(this, arguments);
                },
    
                insertAt : function (i, o) {
                    this.splice(i, 0, o);
                    return this.get('length');
                },
    
                push : function () {
    
                    var i;
    
                    for (i = 0; i < arguments.length; i ++) {
                        this.insertAt(this.length, arguments[i]);
                    }
    
                    return this.length;
                },
    
                pop : function (i) {
                    i = this.length - 1;
                    return this.removeAt(i);
                },
    
                remove : function (o, i) {
    
                    i = this.content.indexOf(o);
    
                    if (~i) {
                        return this.removeAt(i);
                    }
    
                    return false;
                },
    
                removeAt : function (i, r) {
                    r = AP.splice.call(this.content, i, 1);
                    this.contentDidChange();
                    return r[0];
                },
    
                replace : function (a, b, i) {
    
                    i = this.content.indexOf(a);
    
                    if (~i) {
                        return this.replaceAt(i, b);
                    }
                },
    
                replaceAt : function (i, o) {
                    this.removeAt(i);
                    return this.insertAt(i, o);
                },
    
                splice : function (i, l) {
    
                    var j,
                        rest,
                        removed;
    
                    removed = [];
                    rest = AP.splice.call(arguments, 2, arguments.length);
    
                    if (l > 0) {
    
                        j = i;
                        l = i + l;
    
                        while (j < l) {
                            removed.push(this.removeAt(i));
    
                            j ++;
                        }
                    }
    
                    for (j = 0; j < rest.length; j ++) {
                        this.content.splice(i + j, 0, rest[j]);
                        this.contentDidChange();
                    }
    
                    return removed;
                },
    
                shift : function () {
                    return this.removeAt(0);
                },
    
                unshift : function () {
                    var i;
                    for (i = 0; i < arguments.length; i ++) {
                        this.insertAt(0, this.arguments[i]);
                    }
    
                    return this.length;
                },
    
                reverse : function () {
                    var r;
                    if (!this.pristineContent) {
                        this.pristineContent = this.content;
                    }
    
                    r = AP.reverse.apply(this.content, arguments);
                    this.contentDidChange();
                    return this;
                },
    
                filter : function () {
    
                    if (!this.pristineContent) {
                        this.pristineContent = this.content;
                    }
    
                    this.content = AP.filter.apply(this.content, arguments);
                    this.contentDidChange();
                    return this.content;
                },
    
                sort : function () {
    
                    if (!this.pristineContent) {
                        this.pristineContent = this.content;
                        this.content = this.content.concat();
                    }
    
                    AP.sort.apply(this.content, arguments);
                    this.contentDidChange();
                    return this.content;
                },
    
                reset : function () {
                    this.content = this.pristineContent;
                    this.pristineContent = null;
                },
    
                willNotifyWatchers : function () {
    
                    this.getChanges = function () {
    
                        var i,
                            changes,
                            newItem,
                            oldItem,
                            newIndex,
                            oldIndex,
                            oldContent,
                            newContent;
    
                        oldContent = this.oldContent;
                        newContent = this.content;
    
                        changes = {
                            added : [],
                            removed : [],
                            moved : []
                        };
    
                        for (i = 0; i < Math.max(oldContent.length, newContent.length); i ++) {
    
                            newItem = newContent[i];
                            oldItem = oldContent[i];
    
                            if (newItem === oldItem) {
                                continue;
                            }
    
                            if (oldItem) {
    
                                newIndex = newContent.indexOf(oldItem);
    
                                // Has it been moved?
                                if (~newIndex) {
                                    changes.moved.push({
                                        oldIndex : i,
                                        newIndex : newIndex,
                                        item : oldItem
                                    });
                                }
    
                                // Nope, it's been removed
                                else {
                                    changes.removed.push({
                                        index : i,
                                        item : oldItem
                                    });
                                }
                            }
    
                            else {
    
                                oldIndex = oldContent.indexOf(newItem);
    
                                // Has it been moved?
                                if (~oldIndex) {
                                    changes.moved.push({
                                        oldIndex : oldIndex,
                                        newIndex : i,
                                        item : newItem
                                    });
                                }
    
                                // Nope, it's been added
                                else {
                                    changes.added.push({
                                        index : i,
                                        item : newItem
                                    });
                                }
                            }
                        }
    
                        this.getChanges = function () {
                            return changes;
                        };
    
                        return changes;
    
                    }.bind(this);
                },
    
                didNotifyWatchers : function () {
    
                    this.oldContent = this.content.concat();
    
                    if (this.__meta) {
                        this.__meta.changedProps = [];
                        this.__meta.contentChanges = {};
                    }
    
                },
    
                contentDidChange : function () {
                    this.set('length', this.content.length);
                    this.propertyDidChange('@each');
                }
    
            });
    
            return Arr;
        }
    
    ).attach('$b');

    $b('brink/core/Dictionary', 
    
        [
            './Object'
        ],
    
        function (Obj) {
    
            'use strict';
    
            return Obj({
    
                keys : null,
                values : null,
    
                init : function () {
    
                    var i;
    
                    this.keys = [];
                    this.values = [];
    
                    for (i = 0; i < arguments.length; i ++) {
                        this.add.apply(this, [].concat(arguments[i]));
                    }
    
                    this.length = this.keys.length;
                },
    
                get : function (key) {
    
                    var i;
    
                    i = typeof key !== 'string' ? this.keys.indexOf(key) : -1;
    
                    if (~i) {
                        return this.values[i];
                    }
    
                    return Obj.prototype.get.apply(this, arguments);
                },
    
                set : function (key, val) {
    
                    var i;
    
                    i = typeof key !== 'string' ? this.keys.indexOf(key) : -1;
    
                    if (~i) {
                        this.values[i] = val;
                        return val;
                    }
    
                    return Obj.prototype.set.apply(this, arguments);
                },
    
                add : function (key, val) {
                    this.keys.push(key);
                    this.values[this.keys.length - 1] = val;
                },
    
                remove : function () {
    
                    var i,
                        j,
                        removed;
    
                    removed = [];
    
                    for (j = 0; j < arguments.length; j ++) {
    
                        i = this.keys.indexOf(arguments[j]);
    
                        if (~i) {
                            this.keys.splice(i, 1);
                            removed.push(this.values.splice(i, 1)[0]);
                        }
                    }
    
                    return removed;
                },
    
                has : function (o) {
                    return !~this.keys.indexOf(o);
                },
    
                indexOf : function (o) {
                    return this.keys.indexOf(o);
                },
    
                forEach : function (fn, scope) {
    
                    var i;
    
                    for (i = 0; i < this.keys.length; i ++) {
                        fn.call(scope, this.values[i], this.keys[i], i, this);
                    }
    
                    return this;
                }
    
            });
        }
    
    ).attach('$b');

    $b('brink/core/RunLoop', 
    
        [
            './CoreObject'
        ],
    
        function (CoreObject) {
    
            'use strict';
    
            return CoreObject.extend({
    
                __interval : 25,
                __timerID : null,
                __started : false,
    
                init : function (interval) {
    
                    this.clear();
    
                    if (typeof interval !== 'undefined') {
                        this.setInterval.call(this, interval);
                    }
    
                    return this;
                },
    
                setInterval : function (val) {
    
                    val = isNaN(val) ? val.toLowerCase() : val;
                    this.__interval = (val === 'raf' || val === 'requestanimationframe') ? 'raf' : val;
    
                    if (this.stopTimer()) {
                        this.start();
                    }
                },
    
                startTimer : function (fn) {
    
                    fn = fn.bind(this);
    
                    if (this.__interval === 'raf') {
                        return requestAnimationFrame(fn);
                    }
    
                    return setTimeout(fn, this.__interval);
                },
    
                stopTimer : function () {
    
                    if (!this.__timerID) {
                        return false;
                    }
    
                    if (this.__interval === 'raf') {
                        cancelAnimationFrame(this.__timerID);
                    }
    
                    else {
                        clearTimeout(this.__timerID);
                    }
    
                    this.__timerID = null;
    
                    return true;
                },
    
                start : function (restart) {
                    this.__started = true;
                    if (!this.__timerID || restart) {
                        this.stopTimer();
                        /* jshint boss : true */
                        return this.__timerID = this.startTimer(function () {
                            this.start(true);
                            this.run();
                        });
                    }
                },
    
                restart : function () {
                    this.start(true);
                },
    
                stop : function () {
                    this.__started = false;
                    return this.stopTimer();
                },
    
                defer : function () {
                    return this.start();
                },
    
                deferOnce : function () {
                    this.stopTimer();
                    /* jshint boss : true */
                    return this.__timerID = this.startTimer(function () {
                        this.stopTimer();
                        this.run();
                    }.bind(this));
                },
    
                run : function () {
    
                    var i,
                        fn,
                        args,
                        scope;
    
                    if (!this.__once.length && !this.__loop.length) {
                        return false;
                    }
    
                    for (i = 0; i < this.__once.length; i ++) {
    
                        fn = this.__once[i];
                        args = this.__onceArgs[i][0];
                        scope = this.__onceArgs[i][1];
    
                        fn.call(scope, args);
                    }
    
                    for (i = 0; i < this.__loop.length; i ++) {
    
                        fn = this.__loop[i];
                        args = this.__loopArgs[i][0];
                        scope = this.__loopArgs[i][1];
    
                        fn.call(scope, args);
                    }
    
                    this.__once = [];
                    this.__onceArgs = [];
    
                    return true;
                },
    
                once : function (fn, args, scope) {
    
                    var idx = this.__once.indexOf(fn);
    
                    if (idx < 0) {
    
                        this.__once.push(fn);
                        idx = this.__once.length - 1;
                    }
    
                    else {
                        args = args || this.__onceArgs[idx][0];
                        scope = scope || this.__onceArgs[idx][0];
                    }
    
                    this.__onceArgs[idx] = [args || null, scope || null];
                },
    
                loop : function (fn, args, scope) {
    
                    var idx = this.__loop.indexOf(fn);
    
                    if (idx < 0) {
    
                        this.__loop.push(fn);
                        idx = this.__loop.length - 1;
                    }
    
                    this.__loopArgs[idx] = [args || null, scope || null];
                },
    
                remove : function (fn) {
    
                    var i;
    
                    i = this.__once.indexOf(fn);
    
                    if (i >= 0) {
                        this.__once.splice(i, 1);
                    }
    
                    i = this.__loop.indexOf(fn);
    
                    if (i >= 0) {
                        this.__loop.splice(i, 1);
                    }
                },
    
                clear : function () {
                    this.__loop = [];
                    this.__once = [];
    
                    this.__loopArgs = [];
                    this.__onceArgs = [];
                }
    
            });
        }
    
    ).attach('$b.__');

    $b('brink/core/InstanceWatcher', 
    
        [
            '../config',
            './CoreObject',
            './RunLoop',
            '../utils/intersect'
        ],
    
        function (config, CoreObject, RunLoop, intersect) {
    
            'use strict';
    
            return CoreObject.extend({
    
                init : function (instances) {
    
                    this.instances = instances;
    
                    this.runLoop = RunLoop.create();
                    this.runLoop.loop(this.run.bind(this));
    
                    this.watchLoop = RunLoop.create();
                    this.watchLoop.name = 'watchLoop';
    
                    if (config.DIRTY_CHECK) {
                        this.start();
                    }
    
                    return this;
                },
    
                dirtyCheck : function (meta, instance) {
    
                    var i,
                        p;
    
                    for (i = 0; i < meta.watchedProps.length; i ++) {
    
                        p = meta.watchedProps[i];
    
                        if (meta.values[p] !== instance[p]) {
                            instance.set(p, instance[p], false, true);
                        }
                    }
                },
    
                notifyWatchers : function (meta, instance) {
    
                    var i,
                        fn,
                        props,
                        willNotify,
                        intersected;
    
                    for (i = 0; i < meta.watchers.fns.length; i ++) {
    
                        fn = meta.watchers.fns[i];
                        props = meta.watchers.props[i];
                        intersected = props.length ? intersect(props, meta.changedProps) : meta.changedProps.concat();
    
                        if (!intersected.length) {
                            continue;
                        }
    
                        willNotify = true;
                        this.watchLoop.once(fn, intersected);
                    }
    
                    if (willNotify) {
                        instance.willNotifyWatchers.call(instance);
                    }
    
                    while (this.watchLoop.run()) {
    
                    }
    
                    instance.didNotifyWatchers.call(instance);
                },
    
                run : function () {
    
                    this.instances.forEach(function (meta, instance) {
    
                        if (config.DIRTY_CHECK) {
                            this.dirtyCheck(meta, instance);
                        }
    
                        if (meta.changedProps.length) {
                            this.notifyWatchers(meta, instance);
                        }
    
                    }, this);
    
                    if (!config.DIRTY_CHECK) {
                        this.stop();
                    }
                },
    
                start : function () {
                    this.runLoop.start();
                },
    
                stop : function () {
                    this.runLoop.stop();
                }
    
            });
        }
    
    ).attach('$b.__');
    

    $b('brink/core/InstanceManager', 
    
        [
            './CoreObject',
            './Dictionary',
            './InstanceWatcher',
            '../config',
            '../utils/merge',
            '../utils/flatten'
        ],
    
        function (CoreObject, Dictionary, InstanceWatcher, config, merge, flatten) {
    
            'use strict';
    
            var InstanceManager,
                IID = 1;
    
            InstanceManager = CoreObject.extend({
    
                instances : null,
    
                init : function () {
                    this.instances = Dictionary.create();
                    this.watcher = InstanceWatcher.create(this.instances);
                },
    
                buildMeta : function (meta) {
    
                    meta = meta || {};
                    meta.iid = IID ++;
    
                    meta.changedProps = meta.changedProps || [];
    
                    return meta;
                },
    
                add : function (instance, meta) {
    
                    meta = this.buildMeta(meta);
                    this.instances.add(instance, meta);
    
                    return meta;
                },
    
                remove : function () {
                    this.instances.remove.apply(this.instances, arguments);
                },
    
                forEach : function (fn) {
                    return this.instances.forEach(fn);
                },
    
                propertyDidChange : function (obj, props) {
    
                    var d,
                        i,
                        p,
                        p2,
                        meta;
    
                    props = [].concat(props);
    
                    meta = obj.__meta;
    
                    for (i = 0; i < props.length; i ++) {
    
                        p = props[i];
    
                        if (config.DIRTY_CHECK) {
                            meta.values[p] = this[p];
                        }
    
                        for (p2 in meta.properties) {
    
                            d = meta.properties[p2];
    
                            if (~(Array.isArray(d.watch) ? d.watch : []).indexOf(p)) {
                                this.propertyDidChange(obj, p2);
                            }
                        }
                    }
    
                    merge(meta.changedProps, props);
    
                    this.watcher.start();
                },
    
                watch : function (obj, props, fn) {
    
                    var idx,
                        meta;
    
                    meta = obj.__meta;
    
                    idx = meta.watchers.fns.indexOf(fn);
    
                    if (!~idx) {
                        meta.watchers.fns.push(fn);
                        idx = meta.watchers.fns.length - 1;
                    }
    
                    meta.watchers.props[idx] = merge(meta.watchers.props[idx] || [], props);
                    meta.watchedProps = flatten(meta.watchers.props);
                },
    
                unwatch : function (obj, fns) {
    
                    var i,
                        fn,
                        idx,
                        meta;
    
                    meta = obj.__meta;
    
                    for (i = 0; i < fns.length; i ++) {
    
                        fn = fns[i];
    
                        idx = meta.watchers.fns.indexOf(fn);
    
                        if (~idx) {
                            meta.watchers.fns.splice(idx, 1);
                            meta.watchers.props.splice(idx, 1);
                        }
                   }
    
                    meta.watchedProps = flatten(meta.watchers.props);
                },
    
                unwatchAll : function (obj) {
    
                    var meta;
    
                    meta = obj.__meta;
    
                    meta.watchers = {
                        fns : [],
                        props : []
                    };
    
                    meta.watchedProps = [];
                }
    
            });
    
            $b.define('instanceManager', InstanceManager.create({})).attach('$b');
    
            return $b('instanceManager');
        }
    );

    $b('brink/browser/ajax', 
    
        [],
    
        function () {
    
            'use strict';
    
            return $b.F;
        }
    
    ).attach('$b');

    $b('brink/browser/ReactMixin', 
    
        function () {
    
            'use strict';
    
            if (typeof window !== 'undefined' && window.React) {
    
                var origCreateClass = window.React.createClass;
    
                React.createClass = function () {
    
                    var Constructor = origCreateClass.apply(this, arguments);
    
                    return function (props, children) {
    
                        var instance,
                            __props;
    
                        if (props instanceof $b.Object) {
                            __props = props;
                            props = props.getProperties();
                        }
    
                        instance = Constructor.call(this, props, children);
    
                        if (__props) {
                            instance.__props = __props;
                        }
    
                        return instance;
                    };
                };
            }
    
            return {
    
                componentWillMount : function () {
                    if (this.__props) {
                        this.__props.watch(this.__propsChanged);
                    }
                },
    
                __propsChanged : function () {
                    this.setProps(this.__props.getChangedProperties());
                },
    
                componentWillUnmount : function () {
                    if (this.__props) {
                        this.__props.unwatch(this.__propsChanged);
                    }
                }
            };
        }
    
    ).attach('$b');
    

    $b('brink/node/build', 
    
        [],
    
        function () {
    
            'use strict';
    
            return function (opts) {
    
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
    
                    __dirname + '/../brink.js',
    
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
                                console.log(item.id);
                            });
    
                            for (p in metas) {
    
                                meta = metas[p];
    
                                if (meta.url) {
    
                                    if (matches(meta.id)) {
    
                                        modules.push(meta.id);
    
                                        moduleSrc = fs.readFileSync(meta.url, {encoding : 'utf8'});
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
    

}).call(this);