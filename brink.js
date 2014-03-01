;(function () {

    'use strict';
    
    var $b,
    	_global,
    	CONFIG,
    	EMPTY_FN;
    
    _global = typeof window !== 'undefined' ? window : global;
    CONFIG = _global.Brink || _global.$b || {};
    
    EMPTY_FN = function () {};
    
    if (typeof window === 'undefined') {
    	_global = global;
    	_global.include = _global.include || require;
    }
    
    else {
    	_global = window;
    }
    
    $b = _global.$b = _global.Brink = function () {
    
    	if (arguments.length) {
    
    		if (arguments.length === 1 && typeof arguments[0] === 'string') {
    			if ($b.require) {
    				return $b.require.apply(_global, arguments);
    			}
    		}
    
    		if ($b.define) {
    			return $b.define.apply(_global, arguments);
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
            		return Object.prototype.toString.call(vArg) === "[object Array]";
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
        
        	if (typeof _global !=="undefined" && (!_global.requestAnimationFrame || !_global.cancelAnimationFrame)) {
        
        		var lastTime = 0;
        		var vendors = ['ms', 'moz', 'webkit', 'o'];
        		for (var x = 0; x < vendors.length && !_global.requestAnimationFrame; x ++) {
        			_global.requestAnimationFrame = _global[vendors[x] + 'RequestAnimationFrame'];
        			_global.cancelAnimationFrame = _global[vendors[x] + 'CancelAnimationFrame'] || _global[vendors[x] + 'CancelRequestAnimationFrame'];
        		}
        
        		if (!_global.requestAnimationFrame) {
        			_global.requestAnimationFrame = function (callback, element) {
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
        
            var _global,
                origRequire,
                resolver,
                moduleIndex;
        
            moduleIndex = 0;
        
            _global = typeof window !== 'undefined' ? window : global;
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
                    _rem = ["require", "exports", "module"],
        
                    // Configurable properties...
                    _config = {},
                    _baseUrl = "",
                    _urlArgs = "",
                    _waitSeconds = 10,
                    _paths = {};
        
                /**
                * Normalizes a path/url, cleaning up duplicate slashes,
                * takes care of `../` and `./` parts
                */
                function _normalize (path, prevPath) {
                    // Replace any matches of "./"  with "/"
                    path = path.replace(/(^|[^\.])(\.\/)/g, "$1");
        
                    // Replace any matches of "some/path/../" with "some/"
                    while (prevPath !== path) {
                        prevPath = path;
                        path = path.replace(/([\w,\-]*[\/]{1,})([\.]{2,}\/)/g, "");
                    }
        
                    // Replace any matches of multiple "/" with a single "/"
                    return path.replace(/(\/{2,})/g, "/");
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
        
                            if (this.id) {
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
        
                            module.toString = function () {
                                return id;
                            };
        
                            if (this.attachTo) {
                                idPart = this.id.split('/').pop();
        
                                if (this.attachPath === '$b') {
                                    _module(idPart, this.module);
                                }
        
                                this.attachTo[idPart] = this.module.exports || this.module;
                            }
                        }
                    }
                }
        
                /**
                * Similar to UNIX dirname, returns the parent path of another path.
                */
                function _getContext (path) {
                    return path.substr(0, path.lastIndexOf("/"));
                }
        
                /**
                * Given a path and context (optional), will normalize the url
                * and convert a relative path to an absolute path.
                */
                function _resolve (path, context) {
        
                    /**
                    * If the path does not start with a ".", it's relative
                    * to the base URL.
                    */
                    context = (path.indexOf(".") < 0) ? "" : context;
        
                    /**
                    * Never resolve "require", "module" and "exports" to absolute paths
                    * For plugins, only resolve the plugin path, not anything after the first "!"
                    */
                    if (~_rem.indexOf(path) || ~path.indexOf("!")) {
                        return path.replace(/([\d,\w,\s,\.\/]*)(?=\!)/, function ($0, $1) {
                            return _resolve($1, context);
                        });
                    }
        
                    return _normalize((context ? context + "/" : "") + path);
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
                    if (typeof window === 'undefined') {
                        origRequire(f);
                        _invokeAnonymousDefine(m, f);
                        return 1;
                    }
        
                    _head = _head || document.getElementsByTagName('head')[0];
        
                    script = document.createElement("script");
                    script.src = f;
        
                    /**
                    * Bind to load events, we do it this way vs. addEventListener for IE support.
                    * No reason to use addEventListener() then fallback to script.onload, just always use script.onload;
                    */
                    script.onreadystatechange = script.onload = function () {
        
                        if (!script.readyState || script.readyState === "complete" || script.readyState === "loaded") {
        
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
                    script.onerror = function (e) {
        
                        clearTimeout(timeoutID);
                        script.onload = script.onreadystatechange = script.onerror = null;
        
                        throw new Error(f + " failed to load.");
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
                        if (~m.indexOf("!")) {
                            /**
                            * If the module id has a "!"" in it, it's a plugin...
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
                    * Essentially they are stored along with the context in a special "plugins"
                    * subpath. This allows modules to lookup plugins with the sync require("index!./foo:./bar") method
                    */
                    pluginPath = (context ? context + "/" : "") + "plugins/" + module.replace(/\//g, "_");
        
                    /*
                    * Update the path to this plugin in the queue
                    */
                    if (q) {
                        q.m[moduleIndex] = pluginPath;
                    }
        
                    module = module.split("!");
                    plugin = module.splice(0,1)[0];
                    module = module.join("!");
        
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
                            * to local vars, and Uglify does not mangle variables if it finds "eval()" in your code.
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
                    * Always return back the id for "require", "module" and "exports",
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
                    * If the path starts with a "/", or "http", it's an absolute URL
                    * If it's not an absolute URL, prefix the request with baseUrl
                    */
        
                    prefix = (!id.indexOf("/") || !id.indexOf("http")) ? "" : _baseUrl;
        
        
                    for(var p in _paths) {
                        id = id.replace(new RegExp("(^" + p + ")", "g"), _paths[p]);
                    }
        
                    return prefix + id + (id.indexOf(".") < 0 ? ".js" : "") + _urlArgs;
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
                function _resolveCircularReferences (id, dependencies, circulars, i, j, d, subDeps, sd, cid) {
        
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
                                    else{
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
                function define (id, dependencies, factory, alreadyQed, depsLoaded, meta, module, facArgs, context, ri, localRequire) {
        
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
                        //_defineQ.push(0);
                    }
        
                    context = _getContext(id);
                    localRequire = require.localize(context);
        
                    /**
                    * No dependencies, but the factory function is expecting arguments?
                    * This means that this is a CommonJS-type module...
                    */
        
                    if (!dependencies.length && factory.length && typeof factory === "function") {
        
                        /**
                        * Let's check for any references of sync-type require("moduleID")
                        */
                        factory.toString()
                            .replace(/(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg, "") // Remove any comments first
                            .replace(/(?:require)\(\s*["']([^'"\s]+)["']\s*\)/g, // Now let's check for any sync style require("module") calls
        
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
        
                        dependencies = (_rem.slice(0,factory.length)).concat(dependencies);
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
        
                    if (typeof factory === "function") {
        
                        /**
                        * If the factory is a function, we need to invoke it.
                        * First let's swap "require", "module" and "exports" with actual objects
                        */
                        facArgs =_swapValues(
                            dependencies.length ? dependencies : (_rem.slice(0,factory.length)),
                            {
                                "require" : localRequire,
                                "module" : module,
                                "exports" : module.exports
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
                    * Invoke the callback immediately, swapping "require" with the actual require function
                    */
                    return callback.apply($b, _swapValues(modules, {"require" : require}));
                }
        
                /**
                * Configure, possible configuration properties are:
                *
                *    - baseUrl
                *    - urlArgs
                *    - waitSeconds
                */
                require.config = function (obj) {
        
                    var cwd;
        
                    _config = obj || {};
        
                    _baseUrl = _config.baseUrl ? _config.baseUrl : _baseUrl;
        
                    // Add a trailing slash to baseUrl if needed.
                    _baseUrl += (_baseUrl && _baseUrl.charAt(_baseUrl.length-1) !== "/") ? "/" : "";
                    _baseUrl = _normalize(_baseUrl);
        
                    _urlArgs = _config.urlArgs ? "?" + _config.urlArgs : _urlArgs;
        
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
        
        
            if (origRequire) {
                require = origRequire;
            }
        })();
    
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
                "brink/utils/isBrinkInstance",
                "brink/utils/bindTo",
                "brink/utils/clone",
                "brink/utils/configure",
                "brink/utils/defineProperty",
                "brink/utils/extend",
                "brink/utils/inject",
                "brink/utils/intersect",
                "brink/utils/promise",
                "brink/utils/isBrinkObject",
                "brink/utils/next",
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
                "brink/data/attr",
                "brink/data/Adapter",
                "brink/data/RESTAdapter",
                "brink/data/Model",
                "brink/data/belongsTo",
                "brink/data/Collection",
                "brink/data/hasMany",
                "brink/data/store",
                "brink/node/build"
            ]
    
    		, function () {
    
    
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
    
    if (typeof window === 'undefined' && module && module.exports) {
    
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
    
                if (typeof navigator !== 'undefined' && navigator && navigator.appName == 'Microsoft Internet Explorer') {
    
                    ua = navigator.userAgent;
                    re = new RegExp('MSIE ([0-9]{1,}[\.0-9]{0,})');
    
                    if (re.exec(ua) != null) {
                        rv = parseFloat( RegExp.$1);
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
    
        function () {
    
            'use strict';
    
            var objectTypes = {
                'function': true,
                'object': true,
                'unknown': true
            };
    
            return function (obj) {
                return obj ? !!objectTypes[typeof obj] : false;
            };
        }
    
    ).attach('$b');

    $b('brink/utils/merge', 
    
        [
            './isObject'
        ],
    
        function (isObject) {
    
            'use strict';
    
            return function merge (a, b, deep) {
    
                var p,
                    o,
                    d;
    
                function arrayOrObject (o, r) {
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
    
        function (merge) {
    
            'use strict';
    
            return function flatten (a, duplicates) {
    
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
    
                if (!duplicates) {
                    merge([], b);
                }
    
                return b;
            };
        }
    
    ).attach('$b');

    $b('brink/utils/isFunction', 
    
        function () {
    
            'use strict';
    
            return function (obj) {
                return typeof obj == 'function';
            };
        }
    
    ).attach('$b');

    $b('brink/utils/expandProps', 
    
        function () {
    
            'use strict';
    
            return function (a, b, i, j, p, n, s) {
    
                s = [];
    
                for (i = 0; i < a.length; i ++) {
    
                    p = a[i];
    
                    if (~p.indexOf(',')) {
                        p = p.split('.');
                        n = p[0];
                        b = p[1].split(',');
                        p = [];
    
                        for (j = 0; j < b.length; j ++) {
                            p.push([n, b[j]].join('.'));
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
    
        function (flatten, isFunction, expandProps) {
    
            'use strict';
    
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
    
        function (computed) {
    
            'use strict';
    
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
    

    $b('brink/utils/isBrinkInstance', 
    
        [
    
        ],
    
        function () {
    
            'use strict';
    
            return function (obj) {
                return obj.constructor.__meta.isObject;
            };
        }
    
    ).attach('$b');

    $b('brink/utils/bindTo', 
    
        [
            './computed',
            './isBrinkInstance'
        ],
    
        function (computed, isBrinkInstance) {
    
            'use strict';
    
            return function (a, prop, isDefined) {
    
                var b,
                    val;
    
                $b.assert('Object must be an instance of Brink.Object or Brink.Class', isBrinkInstance(a));
    
                val = a.get(prop);
    
                if (!isDefined) {
                    a.descriptor(prop);
                }
    
                b = computed({
    
                    get : function () {
                        return a ? a.get(prop) : val;
                    },
    
                    set : function (val) {
                        val = val;
                        return a ? a.set(prop, val) : val;
                    },
    
                    __didChange : function () {
                        return b.didChange();
                    },
    
                    didChange : function () {
    
                    },
    
                    value : val
                });
    
                a.watch(prop, b.__didChange);
    
                return b;
            };
        }
    
    ).attach('$b');

    $b('brink/utils/clone', 
    
        [
            './merge',
            './isObject'
        ],
    
        function (merge, isObject) {
    
            'use strict';
    
            return function (o, deep, a) {
    
                function arrayOrObject (o, r) {
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
    
        function (merge, config) {
    
            'use strict';
    
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
    
        function (isBrinkInstance) {
    
            'use strict';
    
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
    
                descriptor.defaultValue = typeof descriptor.defaultValue !== 'undefined' ? descriptor.defaultValue : descriptor.value;
    
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
    
        function (isObject, isFunction) {
    
            'use strict';
    
            return function (target) {
    
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
    			if (typeof target !== "object" && !isFunction(target)) {
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
            };
        }
    
    ).attach('$b');

    $b('brink/utils/inject', 
    
        [],
    
        function () {
    
            'use strict';
    
            return function (Class, p, v) {
    
                Class.inject.apply(Class, arguments);
    
            };
        }
    
    ).attach('$b');
    

    $b('brink/utils/intersect', 
    
        [
            './flatten'
        ],
    
        function (flatten) {
    
            'use strict';
    
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
    

    // https://github.com/tildeio/rsvp.js/
    (function(global) {
    
    var define, requireModule, require, requirejs;
    
    (function() {
      var registry = {}, seen = {};
    
      define = function(name, deps, callback) {
        registry[name] = { deps: deps, callback: callback };
      };
    
      requirejs = require = requireModule = function(name) {
      requirejs._eak_seen = registry;
    
        if (seen[name]) { return seen[name]; }
        seen[name] = {};
    
        if (!registry[name]) {
          throw new Error("Could not find module " + name);
        }
    
        var mod = registry[name],
            deps = mod.deps,
            callback = mod.callback,
            reified = [],
            exports;
    
        for (var i=0, l=deps.length; i<l; i++) {
          if (deps[i] === 'exports') {
            reified.push(exports = {});
          } else {
            reified.push(requireModule(resolve(deps[i])));
          }
        }
    
        var value = callback.apply(this, reified);
        return seen[name] = exports || value;
    
        function resolve(child) {
          if (child.charAt(0) !== '.') { return child; }
          var parts = child.split("/");
          var parentBase = name.split("/").slice(0, -1);
    
          for (var i=0, l=parts.length; i<l; i++) {
            var part = parts[i];
    
            if (part === '..') { parentBase.pop(); }
            else if (part === '.') { continue; }
            else { parentBase.push(part); }
          }
    
          return parentBase.join("/");
        }
      };
    })();
    
    define("rsvp/all",
      ["./promise","exports"],
      function(__dependency1__, __exports__) {
        "use strict";
        var Promise = __dependency1__["default"];
    
        __exports__["default"] = function all(array, label) {
          return Promise.all(array, label);
        };
      });
    define("rsvp/all_settled",
      ["./promise","./utils","exports"],
      function(__dependency1__, __dependency2__, __exports__) {
        "use strict";
        var Promise = __dependency1__["default"];
        var isArray = __dependency2__.isArray;
        var isNonThenable = __dependency2__.isNonThenable;
    
        /**
          `RSVP.allSettled` is similar to `RSVP.all`, but instead of implementing
          a fail-fast method, it waits until all the promises have returned and
          shows you all the results. This is useful if you want to handle multiple
          promises' failure states together as a set.
    
          Returns a promise that is fulfilled when all the given promises have been
          settled. The return promise is fulfilled with an array of the states of
          the promises passed into the `promises` array argument.
    
          Each state object will either indicate fulfillment or rejection, and
          provide the corresponding value or reason. The states will take one of
          the following formats:
    
          ```javascript
          { state: 'fulfilled', value: value }
            or
          { state: 'rejected', reason: reason }
          ```
    
          Example:
    
          ```javascript
          var promise1 = RSVP.Promise.resolve(1);
          var promise2 = RSVP.Promise.reject(new Error('2'));
          var promise3 = RSVP.Promise.reject(new Error('3'));
          var promises = [ promise1, promise2, promise3 ];
    
          RSVP.allSettled(promises).then(function(array){
            // array == [
            //   { state: 'fulfilled', value: 1 },
            //   { state: 'rejected', reason: Error },
            //   { state: 'rejected', reason: Error }
            // ]
            // Note that for the second item, reason.message will be "2", and for the
            // third item, reason.message will be "3".
          }, function(error) {
            // Not run. (This block would only be called if allSettled had failed,
            // for instance if passed an incorrect argument type.)
          });
          ```
    
          @method @allSettled
          @for RSVP
          @param {Array} promises;
          @param {String} label - optional string that describes the promise.
          Useful for tooling.
          @return {Promise} promise that is fulfilled with an array of the settled
          states of the constituent promises.
        */
    
        __exports__["default"] = function allSettled(entries, label) {
          return new Promise(function(resolve, reject) {
            if (!isArray(entries)) {
              throw new TypeError('You must pass an array to allSettled.');
            }
    
            var remaining = entries.length;
            var entry;
    
            if (remaining === 0) {
              resolve([]);
              return;
            }
    
            var results = new Array(remaining);
    
            function fulfilledResolver(index) {
              return function(value) {
                resolveAll(index, fulfilled(value));
              };
            }
    
            function rejectedResolver(index) {
              return function(reason) {
                resolveAll(index, rejected(reason));
              };
            }
    
            function resolveAll(index, value) {
              results[index] = value;
              if (--remaining === 0) {
                resolve(results);
              }
            }
    
            for (var index = 0; index < entries.length; index++) {
              entry = entries[index];
    
              if (isNonThenable(entry)) {
                resolveAll(index, fulfilled(entry));
              } else {
                Promise.cast(entry).then(fulfilledResolver(index), rejectedResolver(index));
              }
            }
          }, label);
        };
    
        function fulfilled(value) {
          return { state: 'fulfilled', value: value };
        }
    
        function rejected(reason) {
          return { state: 'rejected', reason: reason };
        }
      });
    define("rsvp/asap",
      ["exports"],
      function(__exports__) {
        "use strict";
        __exports__["default"] = function asap(callback, arg) {
          var length = queue.push([callback, arg]);
          if (length === 1) {
            // If length is 1, that means that we need to schedule an async flush.
            // If additional callbacks are queued before the queue is flushed, they
            // will be processed by this flush that we are scheduling.
            scheduleFlush();
          }
        };
    
        var browserGlobal = (typeof window !== 'undefined') ? window : {};
        var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
    
        // node
        function useNextTick() {
          return function() {
            process.nextTick(flush);
          };
        }
    
        function useMutationObserver() {
          var iterations = 0;
          var observer = new BrowserMutationObserver(flush);
          var node = document.createTextNode('');
          observer.observe(node, { characterData: true });
    
          return function() {
            node.data = (iterations = ++iterations % 2);
          };
        }
    
        function useSetTimeout() {
          return function() {
            setTimeout(flush, 1);
          };
        }
    
        var queue = [];
        function flush() {
          for (var i = 0; i < queue.length; i++) {
            var tuple = queue[i];
            var callback = tuple[0], arg = tuple[1];
            callback(arg);
          }
          queue = [];
        }
    
        var scheduleFlush;
    
        // Decide what async method to use to triggering processing of queued callbacks:
        if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
          scheduleFlush = useNextTick();
        } else if (BrowserMutationObserver) {
          scheduleFlush = useMutationObserver();
        } else {
          scheduleFlush = useSetTimeout();
        }
      });
    define("rsvp/config",
      ["./events","exports"],
      function(__dependency1__, __exports__) {
        "use strict";
        var EventTarget = __dependency1__["default"];
    
        var config = {
          instrument: false
        };
    
        EventTarget.mixin(config);
    
        function configure(name, value) {
          if (name === 'onerror') {
            // handle for legacy users that expect the actual
            // error to be passed to their function added via
            // `RSVP.configure('onerror', someFunctionHere);`
            config.on('error', value);
            return;
          }
    
          if (arguments.length === 2) {
            config[name] = value;
          } else {
            return config[name];
          }
        }
    
        __exports__.config = config;
        __exports__.configure = configure;
      });
    define("rsvp/defer",
      ["./promise","exports"],
      function(__dependency1__, __exports__) {
        "use strict";
        var Promise = __dependency1__["default"];
    
        /**
          `RSVP.defer` returns an object similar to jQuery's `$.Deferred` objects.
          `RSVP.defer` should be used when porting over code reliant on `$.Deferred`'s
          interface. New code should use the `RSVP.Promise` constructor instead.
    
          The object returned from `RSVP.defer` is a plain object with three properties:
    
          * promise - an `RSVP.Promise`.
          * reject - a function that causes the `promise` property on this object to
            become rejected
          * resolve - a function that causes the `promise` property on this object to
            become fulfilled.
    
          Example:
    
           ```javascript
           var deferred = RSVP.defer();
    
           deferred.resolve("Success!");
    
           defered.promise.then(function(value){
             // value here is "Success!"
           });
           ```
    
          @method defer
          @for RSVP
          @param {String} label optional string for labeling the promise.
          Useful for tooling.
          @return {Object}
         */
    
        __exports__["default"] = function defer(label) {
          var deferred = { };
    
          deferred.promise = new Promise(function(resolve, reject) {
            deferred.resolve = resolve;
            deferred.reject = reject;
          }, label);
    
          return deferred;
        };
      });
    define("rsvp/events",
      ["exports"],
      function(__exports__) {
        "use strict";
        var indexOf = function(callbacks, callback) {
          for (var i=0, l=callbacks.length; i<l; i++) {
            if (callbacks[i] === callback) { return i; }
          }
    
          return -1;
        };
    
        var callbacksFor = function(object) {
          var callbacks = object._promiseCallbacks;
    
          if (!callbacks) {
            callbacks = object._promiseCallbacks = {};
          }
    
          return callbacks;
        };
    
        /**
          //@module RSVP
          //@class EventTarget
        */
        __exports__["default"] = {
    
          /**
            `RSVP.EventTarget.mixin` extends an object with EventTarget methods. For
            Example:
    
            ```javascript
            var object = {};
    
            RSVP.EventTarget.mixin(object);
    
            object.on("finished", function(event) {
              // handle event
            });
    
            object.trigger("finished", { detail: value });
            ```
    
            `EventTarget.mixin` also works with prototypes:
    
            ```javascript
            var Person = function() {};
            RSVP.EventTarget.mixin(Person.prototype);
    
            var yehuda = new Person();
            var tom = new Person();
    
            yehuda.on("poke", function(event) {
              console.log("Yehuda says OW");
            });
    
            tom.on("poke", function(event) {
              console.log("Tom says OW");
            });
    
            yehuda.trigger("poke");
            tom.trigger("poke");
            ```
    
            @method mixin
            @param {Object} object object to extend with EventTarget methods
            @private
          */
          mixin: function(object) {
            object.on = this.on;
            object.off = this.off;
            object.trigger = this.trigger;
            object._promiseCallbacks = undefined;
            return object;
          },
    
          /**
            Registers a callback to be executed when `eventName` is triggered
    
            ```javascript
            object.on('event', function(eventInfo){
              // handle the event
            });
    
            object.trigger('event');
            ```
    
            @method on
            @param {String} eventName name of the event to listen for
            @param {Function} callback function to be called when the event is triggered.
            @private
          */
          on: function(eventName, callback) {
            var allCallbacks = callbacksFor(this), callbacks;
    
            callbacks = allCallbacks[eventName];
    
            if (!callbacks) {
              callbacks = allCallbacks[eventName] = [];
            }
    
            if (indexOf(callbacks, callback) === -1) {
              callbacks.push(callback);
            }
          },
    
          /**
            You can use `off` to stop firing a particular callback for an event:
    
            ```javascript
            function doStuff() { // do stuff! }
            object.on('stuff', doStuff);
    
            object.trigger('stuff'); // doStuff will be called
    
            // Unregister ONLY the doStuff callback
            object.off('stuff', doStuff);
            object.trigger('stuff'); // doStuff will NOT be called
            ```
    
            If you don't pass a `callback` argument to `off`, ALL callbacks for the
            event will not be executed when the event fires. For example:
    
            ```javascript
            var callback1 = function(){};
            var callback2 = function(){};
    
            object.on('stuff', callback1);
            object.on('stuff', callback2);
    
            object.trigger('stuff'); // callback1 and callback2 will be executed.
    
            object.off('stuff');
            object.trigger('stuff'); // callback1 and callback2 will not be executed!
            ```
    
            @method off
            @param {String} eventName event to stop listening to
            @param {Function} callback optional argument. If given, only the function
            given will be removed from the event's callback queue. If no `callback`
            argument is given, all callbacks will be removed from the event's callback
            queue.
            @private
    
          */
          off: function(eventName, callback) {
            var allCallbacks = callbacksFor(this), callbacks, index;
    
            if (!callback) {
              allCallbacks[eventName] = [];
              return;
            }
    
            callbacks = allCallbacks[eventName];
    
            index = indexOf(callbacks, callback);
    
            if (index !== -1) { callbacks.splice(index, 1); }
          },
    
          /**
            Use `trigger` to fire custom events. For example:
    
            ```javascript
            object.on('foo', function(){
              console.log('foo event happened!');
            });
            object.trigger('foo');
            // 'foo event happened!' logged to the console
            ```
    
            You can also pass a value as a second argument to `trigger` that will be
            passed as an argument to all event listeners for the event:
    
            ```javascript
            object.on('foo', function(value){
              console.log(value.name);
            });
    
            object.trigger('foo', { name: 'bar' });
            // 'bar' logged to the console
            ```
    
            @method trigger
            @param {String} eventName name of the event to be triggered
            @param {Any} options optional value to be passed to any event handlers for
            the given `eventName`
            @private
          */
          trigger: function(eventName, options) {
            var allCallbacks = callbacksFor(this),
                callbacks, callbackTuple, callback, binding;
    
            if (callbacks = allCallbacks[eventName]) {
              // Don't cache the callbacks.length since it may grow
              for (var i=0; i<callbacks.length; i++) {
                callback = callbacks[i];
    
                callback(options);
              }
            }
          }
        };
      });
    define("rsvp/filter",
      ["./all","./map","./utils","exports"],
      function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
        "use strict";
        var all = __dependency1__["default"];
        var map = __dependency2__["default"];
        var isFunction = __dependency3__.isFunction;
        var isArray = __dependency3__.isArray;
    
        /**
         `RSVP.filter` is similar to JavaScript's native `filter` method, except that it
          waits for all promises to become fulfilled before running the `filterFn` on
          each item in given to `promises`. `RSVP.filterFn` returns a promise that will
          become fulfilled with the result of running `filterFn` on the values the
          promises become fulfilled with.
    
          For example:
    
          ```javascript
    
          var promise1 = RSVP.resolve(1);
          var promise2 = RSVP.resolve(2);
          var promise3 = RSVP.resolve(3);
    
          var filterFn = function(item){
            return item > 1;
          };
    
          RSVP.filter(promises, filterFn).then(function(result){
            // result is [ 2, 3 ]
          });
          ```
    
          If any of the `promises` given to `RSVP.filter` are rejected, the first promise
          that is rejected will be given as an argument to the returned promises's
          rejection handler. For example:
    
          ```javascript
          var promise1 = RSVP.resolve(1);
          var promise2 = RSVP.reject(new Error("2"));
          var promise3 = RSVP.reject(new Error("3"));
          var promises = [ promise1, promise2, promise3 ];
    
          var filterFn = function(item){
            return item > 1;
          };
    
          RSVP.filter(promises, filterFn).then(function(array){
            // Code here never runs because there are rejected promises!
          }, function(reason) {
            // reason.message === "2"
          });
          ```
    
          `RSVP.filter` will also wait for any promises returned from `filterFn`.
          For instance, you may want to fetch a list of users then return a subset
          of those users based on some asynchronous operation:
    
          ```javascript
    
          var alice = { name: 'alice' };
          var bob   = { name: 'bob' };
          var users = [ alice, bob ];
    
          var promises = users.map(function(user){
            return RSVP.resolve(user);
          });
    
          var filterFn = function(user){
            // Here, Alice has permissions to create a blog post, but Bob does not.
            return getPrivilegesForUser(user).then(function(privs){
              return privs.can_create_blog_post === true;
            });
          };
          RSVP.filter(promises, filterFn).then(function(users){
            // true, because the server told us only Alice can create a blog post.
            users.length === 1;
            // false, because Alice is the only user present in `users`
            users[0] === bob;
          });
          ```
    
          @method filter
          @for RSVP
          @param {Array} promises
          @param {Function} filterFn - function to be called on each resolved value to
          filter the final results.
          @param {String} label optional string describing the promise. Useful for
          tooling.
          @return {Promise}
        */
        function filter(promises, filterFn, label) {
          if (!isArray(promises)) {
            throw new TypeError('You must pass an array to filter.');
          }
    
          if (!isFunction(filterFn)){
            throw new TypeError("You must pass a function to filter's second argument.");
          }
    
          return all(promises, label).then(function(values){
            return map(promises, filterFn, label).then(function(filterResults){
               var i,
                   valuesLen = values.length,
                   filtered = [];
    
               for (i = 0; i < valuesLen; i++){
                 if(filterResults[i]) filtered.push(values[i]);
               }
               return filtered;
            });
          });
        }
    
        __exports__["default"] = filter;
      });
    define("rsvp/hash",
      ["./promise","./utils","exports"],
      function(__dependency1__, __dependency2__, __exports__) {
        "use strict";
        var Promise = __dependency1__["default"];
        var isNonThenable = __dependency2__.isNonThenable;
        var keysOf = __dependency2__.keysOf;
    
        /**
          `RSVP.hash` is similar to `RSVP.all`, but takes an object instead of an array
          for its `promises` argument.
    
          Returns a promise that is fulfilled when all the given promises have been
          fulfilled, or rejected if any of them become rejected. The returned promise
          is fulfilled with a hash that has the same key names as the `promises` object
          argument. If any of the values in the object are not promises, they will
          simply be copied over to the fulfilled object.
    
          Example:
    
          ```javascript
          var promises = {
            myPromise: RSVP.resolve(1),
            yourPromise: RSVP.resolve(2),
            theirPromise: RSVP.resolve(3),
            notAPromise: 4
          };
    
          RSVP.hash(promises).then(function(hash){
            // hash here is an object that looks like:
            // {
            //   myPromise: 1,
            //   yourPromise: 2,
            //   theirPromise: 3,
            //   notAPromise: 4
            // }
          });
          ````
    
          If any of the `promises` given to `RSVP.hash` are rejected, the first promise
          that is rejected will be given as as the first argument, or as the reason to
          the rejection handler. For example:
    
          ```javascript
          var promises = {
            myPromise: RSVP.resolve(1),
            rejectedPromise: RSVP.reject(new Error("rejectedPromise")),
            anotherRejectedPromise: RSVP.reject(new Error("anotherRejectedPromise")),
          };
    
          RSVP.hash(promises).then(function(hash){
            // Code here never runs because there are rejected promises!
          }, function(reason) {
            // reason.message === "rejectedPromise"
          });
          ```
    
          An important note: `RSVP.hash` is intended for plain JavaScript objects that
          are just a set of keys and values. `RSVP.hash` will NOT preserve prototype
          chains.
    
          Example:
    
          ```javascript
          function MyConstructor(){
            this.example = RSVP.resolve("Example");
          }
    
          MyConstructor.prototype = {
            protoProperty: RSVP.resolve("Proto Property")
          };
    
          var myObject = new MyConstructor();
    
          RSVP.hash(myObject).then(function(hash){
            // protoProperty will not be present, instead you will just have an
            // object that looks like:
            // {
            //   example: "Example"
            // }
            //
            // hash.hasOwnProperty('protoProperty'); // false
            // 'undefined' === typeof hash.protoProperty
          });
          ```
    
          @method hash
          @for RSVP
          @param {Object} promises
          @param {String} label - optional string that describes the promise.
          Useful for tooling.
          @return {Promise} promise that is fulfilled when all properties of `promises`
          have been fulfilled, or rejected if any of them become rejected.
        */
        __exports__["default"] = function hash(object, label) {
          return new Promise(function(resolve, reject){
            var results = {};
            var keys = keysOf(object);
            var remaining = keys.length;
            var entry, property;
    
            if (remaining === 0) {
              resolve(results);
              return;
            }
    
           function fulfilledTo(property) {
              return function(value) {
                results[property] = value;
                if (--remaining === 0) {
                  resolve(results);
                }
              };
            }
    
            function onRejection(reason) {
              remaining = 0;
              reject(reason);
            }
    
            for (var i = 0; i < keys.length; i++) {
              property = keys[i];
              entry = object[property];
    
              if (isNonThenable(entry)) {
                results[property] = entry;
                if (--remaining === 0) {
                  resolve(results);
                }
              } else {
                Promise.cast(entry).then(fulfilledTo(property), onRejection);
              }
            }
          });
        };
      });
    define("rsvp/instrument",
      ["./config","./utils","exports"],
      function(__dependency1__, __dependency2__, __exports__) {
        "use strict";
        var config = __dependency1__.config;
        var now = __dependency2__.now;
    
        __exports__["default"] = function instrument(eventName, promise, child) {
          // instrumentation should not disrupt normal usage.
          try {
            config.trigger(eventName, {
              guid: promise._guidKey + promise._id,
              eventName: eventName,
              detail: promise._detail,
              childGuid: child && promise._guidKey + child._id,
              label: promise._label,
              timeStamp: now(),
              stack: new Error(promise._label).stack
            });
          } catch(error) {
            setTimeout(function(){
              throw error;
            }, 0);
          }
        };
      });
    define("rsvp/map",
      ["./promise","./all","./utils","exports"],
      function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
        "use strict";
        var Promise = __dependency1__["default"];
        var all = __dependency2__["default"];
        var isArray = __dependency3__.isArray;
        var isFunction = __dependency3__.isFunction;
    
        /**
    
         `RSVP.map` is similar to JavaScript's native `map` method, except that it
          waits for all promises to become fulfilled before running the `mapFn` on
          each item in given to `promises`. `RSVP.map` returns a promise that will
          become fulfilled with the result of running `mapFn` on the values the promises
          become fulfilled with.
    
          For example:
    
          ```javascript
    
          var promise1 = RSVP.resolve(1);
          var promise2 = RSVP.resolve(2);
          var promise3 = RSVP.resolve(3);
          var promises = [ promise1, promise2, promise3 ];
    
          var mapFn = function(item){
            return item + 1;
          };
    
          RSVP.map(promises, mapFn).then(function(result){
            // result is [ 2, 3, 4 ]
          });
          ```
    
          If any of the `promises` given to `RSVP.map` are rejected, the first promise
          that is rejected will be given as an argument to the returned promises's
          rejection handler. For example:
    
          ```javascript
          var promise1 = RSVP.resolve(1);
          var promise2 = RSVP.reject(new Error("2"));
          var promise3 = RSVP.reject(new Error("3"));
          var promises = [ promise1, promise2, promise3 ];
    
          var mapFn = function(item){
            return item + 1;
          };
    
          RSVP.map(promises, mapFn).then(function(array){
            // Code here never runs because there are rejected promises!
          }, function(reason) {
            // reason.message === "2"
          });
          ```
    
          `RSVP.map` will also wait if a promise is returned from `mapFn`. For example,
          say you want to get all comments from a set of blog posts, but you need
          the blog posts first becuase they contain a url to those comments.
    
          ```javscript
    
          var mapFn = function(blogPost){
            // getComments does some ajax and returns an RSVP.Promise that is fulfilled
            // with some comments data
            return getComments(blogPost.comments_url);
          };
    
          // getBlogPosts does some ajax and returns an RSVP.Promise that is fulfilled
          // with some blog post data
          RSVP.map(getBlogPosts(), mapFn).then(function(comments){
            // comments is the result of asking the server for the comments
            // of all blog posts returned from getBlogPosts()
          });
          ```
    
          @method map
          @for RSVP
          @param {Array} promises
          @param {Function} mapFn function to be called on each fulfilled promise.
          @param {String} label optional string for labeling the promise.
          Useful for tooling.
          @return {Promise} promise that is fulfilled with the result of calling
          `mapFn` on each fulfilled promise or value when they become fulfilled.
           The promise will be rejected if any of the given `promises` become rejected.
        */
        __exports__["default"] = function map(promises, mapFn, label) {
    
          if (!isArray(promises)) {
            throw new TypeError('You must pass an array to map.');
          }
    
          if (!isFunction(mapFn)){
            throw new TypeError("You must pass a function to map's second argument.");
          }
    
          return all(promises, label).then(function(results){
            var resultLen = results.length,
                mappedResults = [],
                i;
    
            for (i = 0; i < resultLen; i++){
              mappedResults.push(mapFn(results[i]));
            }
    
            return all(mappedResults, label);
          });
        };
      });
    define("rsvp/node",
      ["./promise","exports"],
      function(__dependency1__, __exports__) {
        "use strict";
        var Promise = __dependency1__["default"];
    
        var slice = Array.prototype.slice;
    
        function makeNodeCallbackFor(resolve, reject) {
          return function (error, value) {
            if (error) {
              reject(error);
            } else if (arguments.length > 2) {
              resolve(slice.call(arguments, 1));
            } else {
              resolve(value);
            }
          };
        }
    
        /**
          `RSVP.denodeify` takes a "node-style" function and returns a function that
          will return an `RSVP.Promise`. You can use `denodeify` in Node.js or the
          browser when you'd prefer to use promises over using callbacks. For example,
          `denodeify` transforms the following:
    
          ```javascript
          var fs = require('fs');
    
          fs.readFile('myfile.txt', function(err, data){
            if (err) return handleError(err);
            handleData(data);
          });
          ```
    
          into:
    
          ```javascript
          var fs = require('fs');
    
          var readFile = RSVP.denodeify(fs.readFile);
    
          readFile('myfile.txt').then(handleData, handleError);
          ```
    
          Using `denodeify` makes it easier to compose asynchronous operations instead
          of using callbacks. For example, instead of:
    
          ```javascript
          var fs = require('fs');
          var log = require('some-async-logger');
    
          fs.readFile('myfile.txt', function(err, data){
            if (err) return handleError(err);
            fs.writeFile('myfile2.txt', data, function(err){
              if (err) throw err;
              log('success', function(err) {
                if (err) throw err;
              });
            });
          });
          ```
    
          You can chain the operations together using `then` from the returned promise:
    
          ```javascript
          var fs = require('fs');
          var denodeify = RSVP.denodeify;
          var readFile = denodeify(fs.readFile);
          var writeFile = denodeify(fs.writeFile);
          var log = denodeify(require('some-async-logger'));
    
          readFile('myfile.txt').then(function(data){
            return writeFile('myfile2.txt', data);
          }).then(function(){
            return log('SUCCESS');
          }).then(function(){
            // success handler
          }, function(reason){
            // rejection handler
          });
          ```
    
          @method denodeify
          @for RSVP
          @param {Function} nodeFunc a "node-style" function that takes a callback as
          its last argument. The callback expects an error to be passed as its first
          argument (if an error occurred, otherwise null), and the value from the
          operation as its second argument ("function(err, value){ }").
          @param {Any} binding optional argument for binding the "this" value when
          calling the `nodeFunc` function.
          @return {Function} a function that wraps `nodeFunc` to return an
          `RSVP.Promise`
        */
        __exports__["default"] = function denodeify(nodeFunc, binding) {
          return function()  {
            var nodeArgs = slice.call(arguments), resolve, reject;
            var thisArg = this || binding;
    
            return new Promise(function(resolve, reject) {
              Promise.all(nodeArgs).then(function(nodeArgs) {
                try {
                  nodeArgs.push(makeNodeCallbackFor(resolve, reject));
                  nodeFunc.apply(thisArg, nodeArgs);
                } catch(e) {
                  reject(e);
                }
              });
            });
          };
        };
      });
    define("rsvp/promise",
      ["./config","./events","./instrument","./utils","./promise/cast","./promise/all","./promise/race","./promise/resolve","./promise/reject","exports"],
      function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __dependency7__, __dependency8__, __dependency9__, __exports__) {
        "use strict";
        var config = __dependency1__.config;
        var EventTarget = __dependency2__["default"];
        var instrument = __dependency3__["default"];
        var objectOrFunction = __dependency4__.objectOrFunction;
        var isFunction = __dependency4__.isFunction;
        var now = __dependency4__.now;
        var cast = __dependency5__["default"];
        var all = __dependency6__["default"];
        var race = __dependency7__["default"];
        var Resolve = __dependency8__["default"];
        var Reject = __dependency9__["default"];
    
        var guidKey = 'rsvp_' + now() + '-';
        var counter = 0;
    
        function noop() {}
    
        __exports__["default"] = Promise;
    
    
        /**
    
          Promise objects represent the eventual result of an asynchronous operation. The
          primary way of interacting with a promise is through its `then` method, which
          registers callbacks to receive either a promiseâ€™s eventual value or the reason
          why the promise cannot be fulfilled.
    
          Terminology
          -----------
    
          - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
          - `thenable` is an object or function that defines a `then` method.
          - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
          - `exception` is a value that is thrown using the throw statement.
          - `reason` is a value that indicates why a promise was rejected.
          - `settled` the final resting state of a promise, fulfilled or rejected.
    
          A promise can be in one of three states: pending, fulfilled, or rejected.
    
    
          Basic Usage:
          ------------
    
          ```js
          var promise = new Promise(function(resolve, reject) {
            // on success
            resolve(value);
    
            // on failure
            reject(reason);
          });
    
          promise.then(function(value) {
            // on fulfillment
          }, function(reason) {
            // on rejection
          });
          ```
    
          Advanced Usage:
          ---------------
    
          Promises shine when abstracting away asynchronous interactions such as
          `XMLHttpRequest`s.
    
          ```js
          function getJSON(url) {
            return new Promise(function(resolve, reject){
              var xhr = new XMLHttpRequest();
    
              xhr.open('GET', url);
              xhr.onreadystatechange = handler;
              xhr.responseType = 'json';
              xhr.setRequestHeader('Accept', 'application/json');
              xhr.send();
    
              function handler() {
                if (this.readyState === this.DONE) {
                  if (this.status === 200) {
                    resolve(this.response);
                  } else {
                    reject(new Error("getJSON: `" + url + "` failed with status: [" + this.status + "]");
                  }
                }
              };
            });
          }
    
          getJSON('/posts.json').then(function(json) {
            // on fulfillment
          }, function(reason) {
            // on rejection
          });
          ```
    
          Unlike callbacks, promises are great composable primitives.
    
          ```js
          Promise.all([
            getJSON('/posts'),
            getJSON('/comments')
          ]).then(function(values){
            values[0] // => postsJSON
            values[1] // => commentsJSON
    
            return values;
          });
          ```
    
          @class Promise
          @param {function}
          @param {String} label optional string for labeling the promise.
          Useful for tooling.
          @constructor
        */
        function Promise(resolver, label) {
          if (!isFunction(resolver)) {
            throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
          }
    
          if (!(this instanceof Promise)) {
            throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
          }
    
          this._id = counter++;
          this._label = label;
          this._subscribers = [];
    
          if (config.instrument) {
            instrument('created', this);
          }
    
          if (noop !== resolver) {
            invokeResolver(resolver, this);
          }
        }
    
        function invokeResolver(resolver, promise) {
          function resolvePromise(value) {
            resolve(promise, value);
          }
    
          function rejectPromise(reason) {
            reject(promise, reason);
          }
    
          try {
            resolver(resolvePromise, rejectPromise);
          } catch(e) {
            rejectPromise(e);
          }
        }
    
        Promise.cast = cast;
        Promise.all = all;
        Promise.race = race;
        Promise.resolve = Resolve;
        Promise.reject = Reject;
    
        var PENDING   = void 0;
        var SEALED    = 0;
        var FULFILLED = 1;
        var REJECTED  = 2;
    
        function subscribe(parent, child, onFulfillment, onRejection) {
          var subscribers = parent._subscribers;
          var length = subscribers.length;
    
          subscribers[length] = child;
          subscribers[length + FULFILLED] = onFulfillment;
          subscribers[length + REJECTED]  = onRejection;
        }
    
        function publish(promise, settled) {
          var child, callback, subscribers = promise._subscribers, detail = promise._detail;
    
          if (config.instrument) {
            instrument(settled === FULFILLED ? 'fulfilled' : 'rejected', promise);
          }
    
          for (var i = 0; i < subscribers.length; i += 3) {
            child = subscribers[i];
            callback = subscribers[i + settled];
    
            invokeCallback(settled, child, callback, detail);
          }
    
          promise._subscribers = null;
        }
    
        Promise.prototype = {
        /**
          @property constructor
        */
          constructor: Promise,
    
          _id: undefined,
          _guidKey: guidKey,
          _label: undefined,
    
          _state: undefined,
          _detail: undefined,
          _subscribers: undefined,
    
          _onerror: function (reason) {
            config.trigger('error', reason);
          },
    
        /**
    
          A promise represents the eventual result of an asynchronous operation. The
          primary way of interacting with a promise is through its `then` method, which
          registers callbacks to receive either a promise's eventual value or the reason
          why the promise cannot be fulfilled.
    
          ```js
          findUser().then(function(user){
            // user is available
          }, function(reason){
            // user is unavailable, and you are given the reason why
          });
          ```
    
          Chaining
          --------
    
          The return value of `then` is itself a promise.  This second, "downstream"
          promise is resolved with the return value of the first promise's fulfillment
          or rejection handler, or rejected if the handler throws an exception.
    
          ```js
          findUser().then(function (user) {
            return user.name;
          }, function (reason) {
            return "default name";
          }).then(function (userName) {
            // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
            // will be `"default name"`
          });
    
          findUser().then(function (user) {
            throw "Found user, but still unhappy";
          }, function (reason) {
            throw "`findUser` rejected and we're unhappy";
          }).then(function (value) {
            // never reached
          }, function (reason) {
            // if `findUser` fulfilled, `reason` will be "Found user, but still unhappy".
            // If `findUser` rejected, `reason` will be "`findUser` rejected and we're unhappy".
          });
          ```
          If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
    
          ```js
          findUser().then(function (user) {
            throw new PedagogicalException("Upstream error");
          }).then(function (value) {
            // never reached
          }).then(function (value) {
            // never reached
          }, function (reason) {
            // The `PedgagocialException` is propagated all the way down to here
          });
          ```
    
          Assimilation
          ------------
    
          Sometimes the value you want to propagate to a downstream promise can only be
          retrieved asynchronously.  This can be achieved by returning a promise in the
          fulfillment or rejection handler.  The downstream promise will then be pending
          until the returned promise is settled.  This is called *assimilation*.
    
          ```js
          findUser().then(function (user) {
            return findCommentsByAuthor(user);
          }).then(function (comments) {
            // The user's comments are now available
          });
          ```
    
          If the assimliated promise rejects, then the downstream promise will also reject.
    
          ```js
          findUser().then(function (user) {
            return findCommentsByAuthor(user);
          }).then(function (comments) {
            // If `findCommentsByAuthor` fulfills, we'll have the value here
          }, function (reason) {
            // If `findCommentsByAuthor` rejects, we'll have the reason here
          });
          ```
    
          Simple Example
          --------------
    
          Synchronous Example
    
          ```javascript
          var result;
    
          try {
            result = findResult();
            // success
          } catch(reason) {
            // failure
          }
          ```
    
          Errback Example
    
          ```js
          findResult(function(result, err){
            if (err) {
              // failure
            } else {
              // success
            }
          });
          ```
    
          Promise Example;
    
          ```javacsript
          findResult().then(function(result){
    
          }, function(reason){
    
          });
          ```
    
          Advanced Example
          --------------
    
          Synchronous Example
    
          ```javascript
          var author, books;
    
          try {
            author = findAuthor();
            books  = findBooksByAuthor(author);
            // success
          } catch(reason) {
            // failure
          }
          ```
    
          Errback Example
    
          ```js
    
          function foundBooks(books) {
    
          }
    
          function failure(reason) {
    
          }
    
          findAuthor(function(author, err){
            if (err) {
              failure(err);
              // failure
            } else {
              try {
                findBoooksByAuthor(author, function(books, err) {
                  if (err) {
                    failure(err);
                  } else {
                    try {
                      foundBooks(books);
                    } catch(reason) {
                      failure(reason);
                    }
                  }
                });
              } catch(error) {
                failure(err);
              }
              // success
            }
          });
          ```
    
          Promise Example;
    
          ```javacsript
          findAuthor().
            then(findBooksByAuthor).
            then(function(books){
              // found books
          }).catch(function(reason){
            // something went wrong;
          });
          ```
    
          @method then
          @param {Function} onFulfillment
          @param {Function} onRejection
          @param {String} label optional string for labeling the promise.
          Useful for tooling.
          @return {Promise}
        */
          then: function(onFulfillment, onRejection, label) {
            var promise = this;
            this._onerror = null;
    
            var thenPromise = new this.constructor(noop, label);
    
            if (this._state) {
              var callbacks = arguments;
              config.async(function invokePromiseCallback() {
                invokeCallback(promise._state, thenPromise, callbacks[promise._state - 1], promise._detail);
              });
            } else {
              subscribe(this, thenPromise, onFulfillment, onRejection);
            }
    
            if (config.instrument) {
              instrument('chained', promise, thenPromise);
            }
    
            return thenPromise;
          },
    
        /**
          `catch` is simply sugar for `then(null, onRejection)` which makes it the same
          as the catch block, of a try/catch statement.
    
          ```js
          function findAuthor(){
            throw new Error("couldn't find that author");
          }
    
          // synchronous
          try {
            findAuthor();
          } catch(reason) {
    
          }
    
          // async with promises
          findAuthor().catch(function(reason){
            // something went wrong;
          });
          ```
    
          @method catch
          @param {Function} onRejection
          @param {String} label optional string for labeling the promise.
          Useful for tooling.
          @return {Promise}
        */
          'catch': function(onRejection, label) {
            return this.then(null, onRejection, label);
          },
    
        /**
          `finally` will be invoked regardless of the promise's fate just as native
          try/catch/finally behaves
    
          ```js
          findAuthor() {
            if (Math.random() > 0.5) {
              throw new Error();
            }
            return new Author();
          }
    
          try {
            return findAuthor(); // succeed or fail
          } catch(error) {
            return findOtherAuther();
          } finally {
            // always runs
            // doesn't effect the return value
          }
    
          findAuthor().finally(function(){
            // author was either found, or not
          });
          ```
    
          @method finally
          @param {Function} callback
          @param {String} label optional string for labeling the promise.
          Useful for tooling.
          @return {Promise}
        */
          'finally': function(callback, label) {
            var constructor = this.constructor;
    
            return this.then(function(value) {
              return constructor.cast(callback()).then(function(){
                return value;
              });
            }, function(reason) {
              return constructor.cast(callback()).then(function(){
                throw reason;
              });
            }, label);
          }
        };
    
        function invokeCallback(settled, promise, callback, detail) {
          var hasCallback = isFunction(callback),
              value, error, succeeded, failed;
    
          if (hasCallback) {
            try {
              value = callback(detail);
              succeeded = true;
            } catch(e) {
              failed = true;
              error = e;
            }
          } else {
            value = detail;
            succeeded = true;
          }
    
          if (handleThenable(promise, value)) {
            return;
          } else if (hasCallback && succeeded) {
            resolve(promise, value);
          } else if (failed) {
            reject(promise, error);
          } else if (settled === FULFILLED) {
            resolve(promise, value);
          } else if (settled === REJECTED) {
            reject(promise, value);
          }
        }
    
        function handleThenable(promise, value) {
          var then = null,
          resolved;
    
          try {
            if (promise === value) {
              throw new TypeError("A promises callback cannot return that same promise.");
            }
    
            if (objectOrFunction(value)) {
              then = value.then;
    
              if (isFunction(then)) {
                then.call(value, function(val) {
                  if (resolved) { return true; }
                  resolved = true;
    
                  if (value !== val) {
                    resolve(promise, val);
                  } else {
                    fulfill(promise, val);
                  }
                }, function(val) {
                  if (resolved) { return true; }
                  resolved = true;
    
                  reject(promise, val);
                }, 'derived from: ' + (promise._label || ' unknown promise'));
    
                return true;
              }
            }
          } catch (error) {
            if (resolved) { return true; }
            reject(promise, error);
            return true;
          }
    
          return false;
        }
    
        function resolve(promise, value) {
          if (promise === value) {
            fulfill(promise, value);
          } else if (!handleThenable(promise, value)) {
            fulfill(promise, value);
          }
        }
    
        function fulfill(promise, value) {
          if (promise._state !== PENDING) { return; }
          promise._state = SEALED;
          promise._detail = value;
    
          config.async(publishFulfillment, promise);
        }
    
        function reject(promise, reason) {
          if (promise._state !== PENDING) { return; }
          promise._state = SEALED;
          promise._detail = reason;
    
          config.async(publishRejection, promise);
        }
    
        function publishFulfillment(promise) {
          publish(promise, promise._state = FULFILLED);
        }
    
        function publishRejection(promise) {
          if (promise._onerror) {
            promise._onerror(promise._detail);
          }
    
          publish(promise, promise._state = REJECTED);
        }
      });
    define("rsvp/promise/all",
      ["../utils","exports"],
      function(__dependency1__, __exports__) {
        "use strict";
        var isArray = __dependency1__.isArray;
        var isNonThenable = __dependency1__.isNonThenable;
    
        /**
    
          `RSVP.Promise.all` returns a new promise which is fulfilled with an array of
          fulfillment values for the passed promises, or rejects with the reason of the
          first passed promise that rejects. It casts all elements of the passed iterable
          to promises as it runs this algorithm.
    
          Example:
    
          ```javascript
          var promise1 = RSVP.resolve(1);
          var promise2 = RSVP.resolve(2);
          var promise3 = RSVP.resolve(3);
          var promises = [ promise1, promise2, promise3 ];
    
          RSVP.Promise.all(promises).then(function(array){
            // The array here would be [ 1, 2, 3 ];
          });
          ```
    
          If any of the `promises` given to `RSVP.all` are rejected, the first promise
          that is rejected will be given as an argument to the returned promises's
          rejection handler. For example:
    
          Example:
    
          ```javascript
          var promise1 = RSVP.resolve(1);
          var promise2 = RSVP.reject(new Error("2"));
          var promise3 = RSVP.reject(new Error("3"));
          var promises = [ promise1, promise2, promise3 ];
    
          RSVP.Promise.all(promises).then(function(array){
            // Code here never runs because there are rejected promises!
          }, function(error) {
            // error.message === "2"
          });
          ```
    
          @method all
          @for RSVP.Promise
          @param {Array} promises
          @param {String} label optional string for labeling the promise.
          Useful for tooling.
          @return {Promise} promise that is fulfilled when all `promises` have been
          fulfilled, or rejected if any of them become rejected.
        */
        __exports__["default"] = function all(entries, label) {
    
          /*jshint validthis:true */
          var Constructor = this;
    
          return new Constructor(function(resolve, reject) {
            if (!isArray(entries)) {
              throw new TypeError('You must pass an array to all.');
            }
    
            var remaining = entries.length;
            var results = new Array(remaining);
            var entry, pending = true;
    
            if (remaining === 0) {
              resolve(results);
              return;
            }
    
            function fulfillmentAt(index) {
              return function(value) {
                results[index] = value;
                if (--remaining === 0) {
                  resolve(results);
                }
              };
            }
    
            function onRejection(reason) {
              remaining = 0;
              reject(reason);
            }
    
            for (var index = 0; index < entries.length; index++) {
              entry = entries[index];
              if (isNonThenable(entry)) {
                results[index] = entry;
                if (--remaining === 0) {
                  resolve(results);
                }
              } else {
                Constructor.cast(entry).then(fulfillmentAt(index), onRejection);
              }
            }
          }, label);
        };
      });
    define("rsvp/promise/cast",
      ["exports"],
      function(__exports__) {
        "use strict";
        /**
    
          `RSVP.Promise.cast` cast coerces its argument to a promise, or returns the
          argument if it is already a promise which shares a constructor with the caster;
    
          Example:
    
          ```javascript
          var promise = RSVP.Promise.resolve(1);
          var casted = RSVP.Promise.cast(promise);
    
          console.log(promise === casted); // true
          ```
    
          In the case of a promise whose constructor does not match, it is assimilated.
          The resulting promise will fulfill or reject based on the outcome of the
          promise being casted.
    
          In the case of a non-promise, a promise which will fulfill with that value is
          returned.
    
          Example:
    
          ```javascript
          var value = 1; // could be a number, boolean, string, undefined...
          var casted = RSVP.Promise.cast(value);
    
          console.log(value === casted); // false
          console.log(casted instanceof RSVP.Promise) // true
    
          casted.then(function(val) {
            val === value // => true
          });
          ```
    
          `RSVP.Promise.cast` is similar to `RSVP.Promise.resolve`, but `RSVP.Promise.cast` differs in the
          following ways:
    
          * `RSVP.Promise.cast` serves as a memory-efficient way of getting a promise, when you
          have something that could either be a promise or a value. RSVP.resolve
          will have the same effect but will create a new promise wrapper if the
          argument is a promise.
          * `RSVP.Promise.cast` is a way of casting incoming thenables or promise subclasses to
          promises of the exact class specified, so that the resulting object's `then` is
          ensured to have the behavior of the constructor you are calling cast on (i.e., RSVP.Promise).
    
          @method cast
          @for RSVP.Promise
          @param {Object} object to be casted
          @param {String} label optional string for labeling the promise.
          Useful for tooling.
          @return {Promise} promise
        */
    
        __exports__["default"] = function cast(object, label) {
          /*jshint validthis:true */
          var Constructor = this;
    
          if (object && typeof object === 'object' && object.constructor === Constructor) {
            return object;
          }
    
          return new Constructor(function(resolve) {
            resolve(object);
          }, label);
        };
      });
    define("rsvp/promise/race",
      ["../utils","exports"],
      function(__dependency1__, __exports__) {
        "use strict";
        /* global toString */
    
        var isArray = __dependency1__.isArray;
        var isFunction = __dependency1__.isFunction;
        var isNonThenable = __dependency1__.isNonThenable;
    
        /**
          `RSVP.Promise.race` returns a new promise which is settled in the same way as the
          first passed promise to settle.
    
          Example:
    
          ```javascript
          var promise1 = new RSVP.Promise(function(resolve, reject){
            setTimeout(function(){
              resolve("promise 1");
            }, 200);
          });
    
          var promise2 = new RSVP.Promise(function(resolve, reject){
            setTimeout(function(){
              resolve("promise 2");
            }, 100);
          });
    
          RSVP.Promise.race([promise1, promise2]).then(function(result){
            // result === "promise 2" because it was resolved before promise1
            // was resolved.
          });
          ```
    
          `RSVP.Promise.race` is deterministic in that only the state of the first
          completed promise matters. For example, even if other promises given to the
          `promises` array argument are resolved, but the first completed promise has
          become rejected before the other promises became fulfilled, the returned
          promise will become rejected:
    
          ```javascript
          var promise1 = new RSVP.Promise(function(resolve, reject){
            setTimeout(function(){
              resolve("promise 1");
            }, 200);
          });
    
          var promise2 = new RSVP.Promise(function(resolve, reject){
            setTimeout(function(){
              reject(new Error("promise 2"));
            }, 100);
          });
    
          RSVP.Promise.race([promise1, promise2]).then(function(result){
            // Code here never runs because there are rejected promises!
          }, function(reason){
            // reason.message === "promise2" because promise 2 became rejected before
            // promise 1 became fulfilled
          });
          ```
    
          @method race
          @for RSVP.Promise
          @param {Array} promises array of promises to observe
          @param {String} label optional string for describing the promise returned.
          Useful for tooling.
          @return {Promise} a promise which settles in the same way as the first passed
          promise to settle.
        */
        __exports__["default"] = function race(entries, label) {
          /*jshint validthis:true */
          var Constructor = this, entry;
    
          return new Constructor(function(resolve, reject) {
            if (!isArray(entries)) {
              throw new TypeError('You must pass an array to race.');
            }
    
            var pending = true;
    
            function onFulfillment(value) { if (pending) { pending = false; resolve(value); } }
            function onRejection(reason)  { if (pending) { pending = false; reject(reason); } }
    
            for (var i = 0; i < entries.length; i++) {
              entry = entries[i];
              if (isNonThenable(entry)) {
                pending = false;
                resolve(entry);
                return;
              } else {
                Constructor.cast(entry).then(onFulfillment, onRejection);
              }
            }
          }, label);
        };
      });
    define("rsvp/promise/reject",
      ["exports"],
      function(__exports__) {
        "use strict";
        /**
          `RSVP.Promise.reject` returns a promise  rejected with the passed `reason`.
          It is essentially shorthand for the following:
    
          ```javascript
          var promise = new RSVP.Promise(function(resolve, reject){
            reject(new Error('WHOOPS'));
          });
    
          promise.then(function(value){
            // Code here doesn't run because the promise is rejected!
          }, function(reason){
            // reason.message === 'WHOOPS'
          });
          ```
    
          Instead of writing the above, your code now simply becomes the following:
    
          ```javascript
          var promise = RSVP.Promise.reject(new Error('WHOOPS'));
    
          promise.then(function(value){
            // Code here doesn't run because the promise is rejected!
          }, function(reason){
            // reason.message === 'WHOOPS'
          });
          ```
    
          @method reject
          @for RSVP.Promise
          @param {Any} reason value that the returned promise will be rejected with.
          @param {String} label optional string for identifying the returned promise.
          Useful for tooling.
          @return {Promise} a promise rejected with the given `reason`.
        */
        __exports__["default"] = function reject(reason, label) {
          /*jshint validthis:true */
          var Constructor = this;
    
          return new Constructor(function (resolve, reject) {
            reject(reason);
          }, label);
        };
      });
    define("rsvp/promise/resolve",
      ["exports"],
      function(__exports__) {
        "use strict";
        /**
          `RSVP.Promise.resolve` returns a promise that will become fulfilled with the passed
          `value`. It is essentially shorthand for the following:
    
          ```javascript
          var promise = new RSVP.Promise(function(resolve, reject){
            resolve(1);
          });
    
          promise.then(function(value){
            // value === 1
          });
          ```
    
          Instead of writing the above, your code now simply becomes the following:
    
          ```javascript
          var promise = RSVP.Promise.resolve(1);
    
          promise.then(function(value){
            // value === 1
          });
          ```
    
          @method resolve
          @for RSVP.Promise
          @param {Any} value value that the returned promise will be resolved with
          @param {String} label optional string for identifying the returned promise.
          Useful for tooling.
          @return {Promise} a promise that will become fulfilled with the given
          `value`
        */
        __exports__["default"] = function resolve(value, label) {
          /*jshint validthis:true */
          var Constructor = this;
    
          return new Constructor(function(resolve, reject) {
            resolve(value);
          }, label);
        };
      });
    define("rsvp/race",
      ["./promise","exports"],
      function(__dependency1__, __exports__) {
        "use strict";
        var Promise = __dependency1__["default"];
    
        __exports__["default"] = function race(array, label) {
          return Promise.race(array, label);
        };
      });
    define("rsvp/reject",
      ["./promise","exports"],
      function(__dependency1__, __exports__) {
        "use strict";
        var Promise = __dependency1__["default"];
    
        __exports__["default"] = function reject(reason, label) {
          return Promise.reject(reason, label);
        };
      });
    define("rsvp/resolve",
      ["./promise","exports"],
      function(__dependency1__, __exports__) {
        "use strict";
        var Promise = __dependency1__["default"];
    
        __exports__["default"] = function resolve(value, label) {
          return Promise.resolve(value, label);
        };
      });
    define("rsvp/rethrow",
      ["exports"],
      function(__exports__) {
        "use strict";
        /**
          `RSVP.rethrow` will rethrow an error on the next turn of the JavaScript event
          loop in order to aid debugging.
    
          Promises A+ specifies that any exceptions that occur with a promise must be
          caught by the promises implementation and bubbled to the last handler. For
          this reason, it is recommended that you always specify a second rejection
          handler function to `then`. However, `RSVP.rethrow` will throw the exception
          outside of the promise, so it bubbles up to your console if in the browser,
          or domain/cause uncaught exception in Node. `rethrow` will throw the error
          again so the error can be handled by the promise.
    
          ```javascript
          function throws(){
            throw new Error('Whoops!');
          }
    
          var promise = new RSVP.Promise(function(resolve, reject){
            throws();
          });
    
          promise.catch(RSVP.rethrow).then(function(){
            // Code here doesn't run because the promise became rejected due to an
            // error!
          }, function (err){
            // handle the error here
          });
          ```
    
          The 'Whoops' error will be thrown on the next turn of the event loop
          and you can watch for it in your console. You can also handle it using a
          rejection handler given to `.then` or `.catch` on the returned promise.
    
          @method rethrow
          @for RSVP
          @param {Error} reason reason the promise became rejected.
          @throws Error
        */
        __exports__["default"] = function rethrow(reason) {
          setTimeout(function() {
            throw reason;
          });
          throw reason;
        };
      });
    define("rsvp/utils",
      ["exports"],
      function(__exports__) {
        "use strict";
        function objectOrFunction(x) {
          return typeof x === "function" || (typeof x === "object" && x !== null);
        }
    
        __exports__.objectOrFunction = objectOrFunction;function isFunction(x) {
          return typeof x === "function";
        }
    
        __exports__.isFunction = isFunction;function isNonThenable(x) {
          return !objectOrFunction(x);
        }
    
        __exports__.isNonThenable = isNonThenable;function isArray(x) {
          return Object.prototype.toString.call(x) === "[object Array]";
        }
    
        __exports__.isArray = isArray;// Date.now is not available in browsers < IE9
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now#Compatibility
        var now = Date.now || function() { return new Date().getTime(); };
        __exports__.now = now;
        var keysOf = Object.keys || function(object) {
          var result = [];
    
          for (var prop in object) {
            result.push(prop);
          }
    
          return result;
        };
        __exports__.keysOf = keysOf;
      });
    define("rsvp",
      ["./rsvp/promise","./rsvp/events","./rsvp/node","./rsvp/all","./rsvp/all_settled","./rsvp/race","./rsvp/hash","./rsvp/rethrow","./rsvp/defer","./rsvp/config","./rsvp/map","./rsvp/resolve","./rsvp/reject","./rsvp/asap","./rsvp/filter","exports"],
      function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __dependency7__, __dependency8__, __dependency9__, __dependency10__, __dependency11__, __dependency12__, __dependency13__, __dependency14__, __dependency15__, __exports__) {
        "use strict";
        var Promise = __dependency1__["default"];
        var EventTarget = __dependency2__["default"];
        var denodeify = __dependency3__["default"];
        var all = __dependency4__["default"];
        var allSettled = __dependency5__["default"];
        var race = __dependency6__["default"];
        var hash = __dependency7__["default"];
        var rethrow = __dependency8__["default"];
        var defer = __dependency9__["default"];
        var config = __dependency10__.config;
        var configure = __dependency10__.configure;
        var map = __dependency11__["default"];
        var resolve = __dependency12__["default"];
        var reject = __dependency13__["default"];
        var asap = __dependency14__["default"];
        var filter = __dependency15__["default"];
    
        config.async = asap; // default async is asap;
    
        function async(callback, arg) {
          config.async(callback, arg);
        }
    
        function on() {
          config.on.apply(config, arguments);
        }
    
        function off() {
          config.off.apply(config, arguments);
        }
    
        // Set up instrumentation through `window.__PROMISE_INTRUMENTATION__`
        if (typeof window !== 'undefined' && typeof window.__PROMISE_INSTRUMENTATION__ === 'object') {
          var callbacks = window.__PROMISE_INSTRUMENTATION__;
          configure('instrument', true);
          for (var eventName in callbacks) {
            if (callbacks.hasOwnProperty(eventName)) {
              on(eventName, callbacks[eventName]);
            }
          }
        }
    
        __exports__.Promise = Promise;
        __exports__.EventTarget = EventTarget;
        __exports__.all = all;
        __exports__.allSettled = allSettled;
        __exports__.race = race;
        __exports__.hash = hash;
        __exports__.rethrow = rethrow;
        __exports__.defer = defer;
        __exports__.denodeify = denodeify;
        __exports__.configure = configure;
        __exports__.on = on;
        __exports__.off = off;
        __exports__.resolve = resolve;
        __exports__.reject = reject;
        __exports__.async = async;
        __exports__.map = map;
        __exports__.filter = filter;
      });
    global.RSVP = requireModule('rsvp');
    
    }($b));
    
    $b('brink/utils/promise', 
    
        [],
    
        function () {
    
            'use strict';
    
            return function (resolve, reject) {
                return $b.RSVP.Promise(resolve, reject);
            };
        }
    
    ).attach('$b');
    

    $b('brink/utils/isBrinkObject', 
    
        function () {
    
            'use strict';
    
            return function (obj) {
                return obj.__isObject;
            };
        }
    
    ).attach('$b');

    $b('brink/utils/next', 
    
        [
        ],
    
        function () {
    
            'use strict';
    
            return function () {
    
            };
        }
    
    ).attach('$b');
    

    $b('brink/core/CoreObject', 
    
        [
        	'../utils/extend',
        	'../utils/isBrinkObject'
        ],
    
        function (extend, isBrinkObject) {
    
            'use strict';
    
    		var CoreObject,
    			Prototype;
    
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
    
    			function Obj (callInit) {
    
    				var fn;
    
    				if (callInit === true || callInit === false) {
    
    					if (callInit) {
    						fn = this.__init || this.init || this.constructor;
    						fn.call(this);
    					}
    
    					return this;
    				}
    
    				return Obj.extend.apply(Obj, arguments);
    			}
    
    			Obj.prototype = proto;
    			extend(Obj, this, proto.statics || {});
    
    			Obj.prototype.constructor = Obj;
    
    			return Obj;
    		};
    
    		CoreObject.buildPrototype = function (props) {
    			var F = function () {};
    			F.prototype = this.prototype;
    			return extend(new F(), props);
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
    
    		CoreObject.create = function (o) {
    
    			var p,
    				init,
    				instance;
    
                var start = (+new Date());
    
    			instance = new this(false);
    
    			init = instance.__init || instance.init;
    
    			if (init) {
    				instance = init.apply(instance, arguments) || instance;
    			}
    
                var time = (+new Date()) - start;
    
                if (time > 1) {
                	//console.log(time, instance);
                }
    
    			return instance;
    		};
    
            return CoreObject;
        }
    
    ).attach('$b');
    

    $b('brink/utils/bindFunction', 
    
        [],
    
        function () {
    
            'use strict';
    
            // Faster than Function.prototype.bind in V8, not sure about others.
            return function (fn, scope) {
                return function () {
                    return fn.apply(scope, arguments);
                }
            };
        }
    
    ).attach('$b');
    

    $b('brink/core/Object', 
    
        [
            '../config',
            './CoreObject',
            '../utils/bindFunction',
            '../utils/bindTo',
            '../utils/clone',
            '../utils/merge',
            '../utils/flatten',
            '../utils/intersect',
            '../utils/expandProps',
            '../utils/isFunction',
            '../utils/defineProperty'
        ],
    
        function (
            config,
            CoreObject,
            bindFunction,
            bindTo,
            clone,
            merge,
            flatten,
            intersect,
            expandProps,
            isFunction,
            defineProperty
        ) {
    
            'use strict';
    
            var Obj;
    
            Obj = CoreObject.extend({
    
                __init : function (o) {
    
                    var i,
                        p,
                        d,
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
                            this.descriptor(p, o[p]);
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
                                    this.descriptor.call(this, p, v);
                                }
                            }
                        }
                    }
    
                },
    
                __defineProperty : function (p, d) {
    
                    if (!config.DIRTY_CHECK) {
    
                        d = clone(d);
    
                        if (d.get) {
                            d.get = bindFunction(d.get, this);
    
                        }
    
                        if (d.set) {
                            d.set = bindFunction(d.set, this);
                        }
    
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
    
                        this.set(p, d.defaultValue, true, true);
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
                        return bindFunction(function (val) {
                            return $b.error('Tried to write to a read-only property `' + p + '` on ' + this);
                        }, this);
                    };
                },
    
                __writeOnly : function (p) {
    
                    if (this.__meta.pojoStyle) {
                        return bindFunction(function () {
                            return $b.error('Tried to read a write-only property `' + p + '` on ' + this);
                        }, this);
                    };
                },
    
                __defineGetter : function (p, fn) {
    
                    if (isFunction(fn)) {
                        this.__meta.getters[p] = fn;
                    }
    
                    return function () {
                        return this.get.call(this, p);
                    }
                },
    
                __defineSetter : function (p, fn) {
    
                    if (isFunction(fn)) {
                        this.__meta.setters[p] = fn;
                    }
    
                    return function (val) {
                        return this.set.call(this, p, val);
                    }
                },
    
                propertyDidChange : function () {
    
                    var props;
    
                    props = flatten([].slice.call(arguments, 0, arguments.length));
    
                    if ($b.instanceManager) {
                        $b.instanceManager.propertyDidChange(this, props);
                    }
                },
    
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
    
                getChangedProperties : function () {
                    return this.serialize.apply(this, this.__meta.changedProps);
                },
    
                descriptor : function (key, val) {
    
                    if (typeof this.__meta.properties[key] !== 'undefined') {
                        if (typeof val === 'undefined') {
                            return this.__meta.properties[key];
                        }
                    }
    
                    if (!val || !val.__isComputed) {
    
                        val = {
                            get : true,
                            set : true,
                            value : val
                        };
                    }
    
                    val = this.__meta.properties[key] = defineProperty(this, key, val);
                    val.key = key;
    
                    val.bindTo = bindFunction(function (o, p) {
                        o.descriptor(p, bindTo(this, key, true));
                    }, this);
    
                    val.didChange = bindFunction(function () {
                        this.propertyDidChange(key);
                    }, this);
    
                    if (this.__meta.isInitialized) {
                        this.__defineProperty(key, val);
                    }
    
                    return val;
                },
    
                bindProperty : function (key, obj, key2) {
                    return this.descriptor(key).bindTo(obj, key2);
                },
    
                get : function (key) {
    
                    if (this.__meta.getters[key]) {
                        return this.__meta.getters[key].call(this, key);
                    }
    
                    return this.__meta.pojoStyle ? this[key] : this.__meta.values[key];
                },
    
                set : function (key, val, quiet, skipCompare) {
    
                    var i,
                        old;
    
                    if (typeof key === 'string') {
    
                        old = this.get(key);
    
                        if (skipCompare || old !== val) {
    
                            if (this.__meta.setters[key]) {
                                val = this.__meta.setters[key].call(this, val, key);
                            }
    
                            else {
    
                                if (this.__meta.pojoStyle) {
                                    this[key] = val;
                                }
    
                                this.__meta.values[key] = val;
                            }
    
                            if (!quiet) {
                                this.propertyDidChange(key);
                            }
                        }
    
                        return val;
                    }
    
                    else if (arguments.length === 1) {
    
                        for (i in key) {
                            this.set(i, key[i], val);
                        }
    
                        return this;
                    }
    
                    $b.error('Tried to call set with unsupported arguments', arguments);
                },
    
                watch : function (fn, props) {
    
                    var fn,
                        props;
    
                    fn = arguments[1];
                    props = arguments[0];
    
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
                            props = [].concat(props);
                        }
    
                        $b.instanceManager.watch(this, props, fn);
                    }
    
                    else {
                        $b.error('InstanceManager does not exist, can\'t watch for property changes.');
                    }
                },
    
                unwatch : function (fns) {
    
                    if ($b.instanceManager) {
                        $b.instanceManager.unwatch(this, flatten(arguments));
                    }
    
                    else {
                        $b.error('InstanceManager does not exist, can\'t watch for property changes.');
                    }
    
                },
    
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
    
                destroy : function () {
    
                    this.unwatchAll();
                    this.__undefineProperties();
    
                    if ($b.instanceManager) {
                        $b.instanceManager.remove(this);
                    }
    
                    this.__meta = null;
                }
            });
    
            Obj.extend = function () {
    
                var meta,
                    proto,
                    SubObj;
    
                SubObj = CoreObject.extend.apply(this, arguments);
                proto = SubObj.prototype;
    
                proto.__parsePrototype.call(proto);
    
                return SubObj;
            };
    
            Obj.define = function () {
                $b.define(this.prototype.__dependencies, bindFunction(this.resolveDependencies.bind, this));
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
    		Notification.prototype.name = "";
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
    			this.name = "";
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
        	'../utils/clone'
        ],
    
        function (config, Obj, NotificationManager, bindFunction, clone) {
    
            'use strict';
    
            var Class,
            	superfy,
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
    		};
    
    		/*
    		If Function.toString() works as expected, return a regex that checks for `this._super`
    		otherwise return a regex that passes everything.
    		*/
    
    		doesCallSuper = (/xyz/).test(function () {
    			var xyz;
    			xyz = true;
    		}) ? (/\bthis\._super\b/) : (/.*/);
    
    		Class = Obj({
    
    			__init : superfy(function () {
    
    				var i,
    					p,
    					meta;
    
                    this._super();
    
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
    
    			subscribe : function (name, handler, priority) {
    
    				this._interestHandlers = this._interestHandlers || {};
    
    				if (handler && !this._interestHandlers[name]) {
    					handler = handler;
    					NotificationManager.subscribe(name, handler, priority);
    					this._interestHandlers[name] = handler;
    				}
    			},
    
    			unsubscribe : function (name) {
    
    				if (this._interestHandlers && this._interestHandlers[name]) {
    					NotificationManager.unsubscribe(name, this._interestHandlers[name]);
    					delete this._interestHandlers[name];
    				}
    			},
    
    			unsubscribeAll : function () {
    
    				var interest;
    
    				for (interest in this._interestHandlers) {
    					if (this._interestHandlers.hasOwnProperty(interest)) {
    						this.unsubscribe(interest);
    					}
    				}
    
    				this._interestHandlers = [];
    			},
    
    			publish : function (/*name, arg1, arg2, arg3..., callback*/) {
    				var args = Array.prototype.slice.call(arguments);
    				NotificationManager.publish.apply(NotificationManager, [].concat(args, this));
    			},
    
    			setTimeout : function (func, delay) {
    				return setTimeout(func.bind(this), delay);
    			},
    
    			setInterval : function (func, delay) {
    				return setInterval(func.bind(this), delay);
    			},
    
    			destroy : superfy(function () {
    				this.unsubscribeAll();
    				return this._super.apply(this, arguments);
    			}, Obj.prototype.destroy)
    		});
    
    		Class.buildPrototype = function (props) {
    
    			var p,
    				props,
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
    
    				var rest,
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
    				for (i = 0; i < arguments.length; i ++) {
    					this.insertAt(0, this.arguments[i]);
    				}
    
    				return this.length;
    			},
    
    			reverse : function () {
    
                    if (!this.pristineContent) {
                        this.pristineContent = this.content;
                    }
    
    				r = AP.reverse.apply(this.content, arguments)
    				this.contentDidChange();
    				return this;
    			},
    
                filter : function () {
    
                    if (!this.pristineContent) {
                        this.pristineContent = this.content;
                    }
    
                    this.content = AP.filter.apply(this.content, arguments)
                    this.contentDidChange();
                    return this.content;
                },
    
    			sort : function () {
    
                    if (!this.pristineContent) {
                        this.pristineContent = this.content;
                        this.content = this.content.concat();
                    }
    
    				AP.sort.apply(this.content, arguments)
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
    
    		return Obj({
    
                keys : null,
                values : null,
    
                init : function () {
    
                    var i,
                        a,
                        keys,
                        vals;
    
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
    
                indexOf : function () {
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
            "./CoreObject"
        ],
    
        function (CoreObject) {
    
            'use strict';
    
            return CoreObject.extend({
    
                __interval : 'raf',
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
    
                    if(this.stopTimer()) {
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
    
                    while(this.watchLoop.run()) {
    
                    }
    
                    instance.didNotifyWatchers.call(instance);
                },
    
                run : function () {
    
                    this.instances.forEach(function (meta, instance) {
    
                        config.DIRTY_CHECK && this.dirtyCheck(meta, instance);
                        meta.changedProps.length && this.notifyWatchers(meta, instance);
    
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
    
                remove : function (instance) {
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
    
                            if (~(d.watch || []).indexOf(p)) {
                                this.propertyDidChange(obj, p2);
                            }
                        }
                    }
    
                    merge(meta.changedProps, props);
    
                    this.watcher.start();
                },
    
                watch : function (obj, props, fn) {
    
                    var i,
                        p,
                        t,
                        k,
                        idx,
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
                        idx;
    
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
    
    		}).create();
    
            $b.define('instanceManager', InstanceManager).attach('$b');
    	}
    
    ).attach('$b');

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
    
            return {
    
                __propsChanged : function () {
                    this.setProps(this.__props.getChangedProperties());
                },
    
                componentWillMount : function () {
                    this.__props = this.props;
                    this.props = this.__props.getProperties();
                    this.__props.watch(this.__propsChanged);
                },
    
                componentWillUnmount : function () {
                    this.__props.unwatch(this.__propsChanged);
                }
            };
        }
    
    ).attach('$b');
    

    $b('brink/data/attr', 
    
        [
            '../utils/computed',
            '../utils/clone'
        ],
    
        function (computed, clone) {
    
            'use strict';
    
            return function (type, options) {
    
                if (typeof type === 'object') {
                    type = 'auto';
                    options = type;
                }
    
                type = type || 'auto';
    
                options = options || {};
    
                var attr = computed({
    
                    type : type,
                    options : options,
                    isAttribute : true,
    
                    value : options.defaultValue,
    
                    get : function (key) {
                        return this.__data ? this.__data[key] : null;
                    },
    
                    set : function (val, key) {
    
                        var data,
                            isDirty,
                            dirtyAttrs,
                            dirtyIndex;
    
                        data = this.__data = this.__data || {};
                        this.__originalData = this.__originalData || clone(data);
                        isDirty = this.__originalData[key] !== val;
    
                        dirtyAttrs = this.get('dirtyAttributes');
                        dirtyIndex = dirtyAttrs.indexOf(key);
    
                        if (dirtyIndex < 0 && isDirty) {
                            dirtyAttrs.push(key);
                            this.set('dirtyAttributes') = dirtyAttrs;
                        }
    
                        else if (!isDirty && dirtyIndex >= 0) {
                            dirtyAttrs.splice(dirtyIndex, 1);
                            this.set('dirtyAttributes', dirtyAttrs);
                        }
    
                        data[key] = val;
                    },
    
                    serialize : function () {
                        return this.__data ? this.__data[attr.key] : null;
                    },
    
                    deserialize : function (val) {
                        return val;
                    }
                });
    
                return attr;
            };
        }
    
    ).attach('$b');
    

    $b('brink/data/Adapter', 
    
        [
            '../core/Class'
        ],
    
        function (Class) {
    
            'use strict';
    
            return Class({
    
                find : function (model, q) {
                    return this.store.find(model, q);
                },
    
                all : function (model) {
                    return this.store.all(model);
                },
    
                saveRecord : function (model) {
    
                    if (model.get('isNew')) {
                        return this.createRecord(model);
                    }
    
                    return this.updateRecord(model);
                },
    
                fetch : $b.required('Adapters must implement the `fetch()` method'),
                fetchAll : $b.required('Adapters must implement the `fetchAll()` method'),
                createRecord : $b.required('Adapters must implement the `createRecord()` method'),
                updateRecord : $b.required('Adapters must implement the `updateRecord()` method'),
                deleteRecord : $b.required('Adapters must implement the `deleteRecord()` method')
            });
        }
    
    ).attach('$b');

    $b('brink/data/RESTAdapter', 
    
        [
            './Adapter',
            '../browser/ajax',
            '../utils/promise'
        ],
    
        function (Adapter, ajax, promise) {
    
            'use strict';
    
            return Adapter({
    
                host : '',
                prefix : '',
    
                ajaxOptions : function (url, method) {
    
                    return {
                        url : url,
                        type : method,
                        contentType : "application/json",
                        dataType : "json"
                    };
                },
    
                ajax : function (url, data, method, options) {
    
                    options = options || this.ajaxOptions(url, method);
    
                    data = data || {};
    
                    return promise(function (resolve, reject) {
    
                        if (method === "GET") {
                            options.data = data;
                        }
    
                        else {
                            options.data = JSON.stringify(data);
                        }
    
                        options.success = function (json) {
                            Ember.run(null, resolve, json);
                        };
    
                        options.error = function(jqXHR, textStatus, errorThrown) {
                            if (jqXHR) {
                                jqXHR.then = null;
                            }
    
                            Ember.run(null, reject, jqXHR);
                        };
    
    
                        ajax(options);
                    });
                },
    
                httpGet : function (url, data) {
                    return this.ajax(url, data, 'GET');
                },
    
                httpPost : function (url, data) {
                    return this.ajax(url, data, 'POST');
                },
    
                httpPut : function (url, data) {
                    return this.ajax(url, data, 'PUT');
                },
    
                httpDelete : function (url, data) {
                    return this.ajax(url, data, 'DELETE');
                },
    
                getURL : function (factory, id) {
    
                    var url;
    
                    url = [this.get('host'), this.get('prefix')];
    
                    url.push(factory.url || factory.typeKey);
    
                    if (id) {
                        url.push(id);
                    }
    
                    return url.join('/').replace(/([^:]\/)\/+/g, "$1");
                },
    
                fetch : function (factory, id) {
                    return this.httpGet(
                        this.getURL(factory, id)
                    );
                },
    
                fetchAll : function (factory) {
                    return this.httpGet(
                        this.getURL(factory)
                    );
                },
    
                createRecord : function (record) {
                    return this.httpPost(
                        this.getURL(record.constructor),
                        record.serialize()
                    );
                },
    
                updateRecord : function (record) {
                    return this.httpPut(
                        this.getURL(record.constructor, record.get('pk')),
                        record.serialize()
                    );
                },
    
                deleteRecord : function (record) {
                    return this.httpDelete(
                        this.getURL(record.constructor, record.get('pk'))
                    );
                }
            });
        }
    
    ).attach('$b');
    

    $b('brink/data/Model', 
    
        [
            './RESTAdapter',
            '../core/Class',
            '../utils/clone',
            '../utils/promise'
        ],
    
        function (RESTAdapter, Class, clone, promise) {
    
            'use strict';
    
            var Model = Class({
    
                primaryKey : 'id',
    
                url : null,
                adapter : RESTAdapter.create(),
    
                typeKey : null,
                collectionKey : null,
    
                __data : null,
                __dirtyAttributes : null,
    
                __currentPromise : null,
    
                __isDirty : false,
                __isSaving : false,
                __isLoaded : false,
                __isDeleting : false,
                __isDeleted : false,
    
                pk : $b.computed({
    
                    watch : ['primaryKey'],
    
                    get : function () {
    
                        var pk = this.get('primaryKey');
    
                        if (!pk) {
                            return null;
                        }
    
                        return this.get(pk);
                    },
    
                    set : function (val) {
    
                        var pk = this.get('primaryKey');
    
                        return this.set(pk, val);
                    }
                }),
    
                dirtyAttributes : $b.computed({
    
                    watch : ['__dirtyAttributes'],
    
                    get : function () {
                        return this.get('__dirtyAttributes') || [];
                    },
    
                    set : function (val) {
    
                        val = val || [];
    
                        this.set('__dirtyAttributes', val);
                        this.set('__isDirty', val && !!val.length);
    
                        return val;
                    }
    
                }),
    
                isValid : $b.computed(function () {
                    return this.validate();
                }),
    
                isNew : $b.computed(function () {
                    return this.primaryKey ? !this.get('pk') : false;
                }, 'pk'),
    
                isLoaded : $b.computed(function () {
                    return this.get('__isLoaded');
                }, '__isLoaded'),
    
                isLoading : $b.computed(function () {
                    return !this.get('__isLoaded');
                }, '__isLoaded'),
    
                isDeleted : $b.computed(function () {
                    return this.get('__isDeleted');
                }, '__isDeleted'),
    
                isClean : $b.computed(function () {
                    return !this.get('isDirty');
                }, 'isDirty'),
    
                descriptor : function (key, val) {
    
                    var meta = this.__meta;
    
                    val = Class.prototype.descriptor.apply(this, arguments);
    
                    if (val.isAttribute) {
                        meta.attributes.push(p);
                    }
    
                    else if (val.isRelationship) {
                        meta.relationships.push(p);
                    }
    
                    return val;
                },
    
                __parsePrototype : function () {
    
                    var meta = this.__meta = this.__meta || {};
    
                    meta.atttributes = clone(meta.attributes || []);
                    meta.relationships = clone(meta.relationships || []);
    
                    Class.prototype.__parsePrototype.apply(this, arguments);
                },
    
                getAttributes : function () {
                    return this.__meta.attributes;
                },
    
                getRelationships : function () {
                    return this.__meta.relationships;
                },
    
                serialize : function (isNested) {
    
                    var p,
                        pk,
                        key,
                        meta,
                        json,
                        nestedJson,
                        attributes,
                        properties,
                        relationships;
    
                    pk = this.get('pk');
                    json = {};
                    attributes = this.getAttributes();
                    relationships = this.getRelationships();
    
                    properties = this.getProperties(attributes.concat(relationships));
    
                    for (p in properties) {
    
                        meta = this.constructor.metaForProperty(p);
                        key = meta.options.key || p;
    
                        json[key] = meta.serialize.call(this);
                    }
    
                    if (this.primaryKey) {
                        json[this.primaryKey] = pk;
                    }
    
                    if (isNested) {
                        nestedJson = json;
                        json = {};
                        json[this.typeKey] = nestedJson;
                    }
    
                    return json;
                },
    
                deserialize : function (json) {
    
                    var p,
                        pk,
                        key,
                        meta,
                        item,
                        data,
                        jsonItem,
                        attributes,
                        properties,
                        relationships;
    
                    data = {};
                    attributes = this.getAttributes();
                    relationships = this.getRelationships();
    
                    properties = this.getProperties(attributes.concat(relationships));
    
                    pk = this.get('pk');
    
                    for (p in properties) {
    
                        meta = this.constructor.metaForProperty(p);
                        key = meta.options.key || p;
    
                        jsonItem = json[key];
    
                        if (typeof jsonItem !== 'undefined') {
                            data[meta.key] = jsonItem === null ? null : meta.deserialize.call(this, jsonItem);
                        }
                    }
    
                    if (this.primaryKey) {
                        this.set('pk', json[this.primaryKey] || pk);
                    }
    
                    this.set('__data', data);
                    this.set('__isLoaded', true);
                    this.set('dirtyAttributes', []);
                },
    
                validate : function () {
                    return true;
                },
    
                merge : function (data) {
    
                    data = data instanceof Model ? data.deserialize() : data;
                    data[this.primaryKey] = null;
    
                    this.deserialize(data);
                },
    
                save : function () {
                    return this.saveRecord();
                },
    
                fetch : function () {
                    return this.fetchRecord();
                },
    
                fetchRecord : function () {
    
                    this.set('__isLoaded', false);
    
                    if (this.__currentPromise) {
                        if (this.__currentPromise._state !== 1 && this.__currentPromise._state !== 2) {
                            return this.__currentPromise = this.__currentPromise.then(this.fetchRecord.bind(this));
                        }
                    }
    
                    return this.__currentPromise = this.adapter.fetch(this.constructor, this.get('pk')).then(function (json) {
    
                        json = json[this.typeKey] || json;
                        json = Array.isArray(json) ? json[0] : json;
    
                        this.deserialize(json);
    
                    }.bind(this));
                },
    
                saveRecord : function () {
    
                    if (this.get('isValid')) {
    
                        if (this.__currentPromise) {
                            if (this.__currentPromise._state !== 1 && this.__currentPromise._state !== 2) {
                                return this.__currentPromise = this.__currentPromise.then(this.saveRecord.bind(this));
                            }
                        }
    
                        this.set('dirtyAttributes', []);
    
                        return this.__currentPromise = this.adapter.saveRecord(this).then(function (json) {
    
                            var isNew = this.get('isNew');
    
                            json = json[this.typeKey] || json;
                            json = Array.isArray(json) ? json[0] : json;
    
                            this.deserialize(json);
    
                            if (isNew) {
                                this.store.add(this);
                            }
    
                            this.set('__isSaving', false);
    
                        }.bind(this));
                    }
    
                    else {
                        return promise(function (resolve, reject) {
                            reject(new Error('Tried to save an invalid record.'));
                        });
                    }
                },
    
                deleteRecord : function () {
    
                    this.set('__isDeleting', true);
    
                    if (this.__currentPromise) {
                        if (this.__currentPromise._state !== 1 && this.__currentPromise._state !== 2) {
                            return this.__currentPromise = this.__currentPromise.then(this.deleteRecord.bind(this));
                        }
                    }
    
                    return this.__currentPromise = this.adapter.deleteRecord(this).then(function (json) {
    
                        this.store.remove(this);
    
                        this.set('__isDeleting', false);
                        this.set('__isDeleted', true);
    
                        this.destroy();
    
                    }.bind(this));
                },
    
                clone : function () {
    
                    var copy,
                        data;
    
                    data = this.get('__data') || {};
    
                    copy = this.constructor.create();
                    copy.set('__data', clone(data));
                    copy.set('pk', null);
    
                    copy.set('__isLoaded', true);
                    copy.set('dirtyAttributes', []);
    
                    return copy;
                },
    
                revert : function () {
                    this.merge(this.__originalData);
                    this.__originalData = null;
                    this.set('dirtyAttributes', []);
                }
            });
    
            Model.extend = function () {
    
                var i,
                    p,
                    v,
                    props,
                    proto,
                    classProps,
                    SubModel;
    
                SubModel = Class.extend.apply(this, arguments);
                proto = SubModel.prototype;
    
                d = {};
                classProps = ['primaryKey', 'url', 'adapter', 'typeKey', 'collectionKey'];
    
                props = [].slice.apply(arguments, [-1])[0];
    
                for (i = 0; i < classProps.length; i ++) {
    
                    p = classProps[i];
                    v = props[p];
    
                    if (p) {
                        SubModel[p] = v;
                    }
                }
    
                /*
                    TODO : Need to re-implement this
    
                    relationships = proto.getRelationships();
                    dirtyChecks = ['__isDirty'];
    
                    for (i = 0; i < relationships.length; i ++) {
                        p = relationships[i];
                        meta = r.metaForProperty(p);
    
                        if (meta.isRelationship && meta.options.embedded) {
                            dirtyChecks.push(p + '.__isDirty');
                        }
                    }
    
                    defineProperty(r.prototype, 'isDirty', computed.or.apply(this, dirtyChecks));
                */
    
                return SubModel;
            };
    
            return Model;
        }
    
    ).attach('$b');
    

    $b('brink/data/belongsTo', 
    
        [
            './Model',
            '../utils/computed',
            '../utils/clone'
        ],
    
        function (Model, computed, clone) {
    
            'use strict';
    
            return function (factoryName, options) {
    
                var attr = computed({
    
                    type : 'belongsTo',
                    factory : null,
                    options : options,
                    isRelationship : true,
    
                    value : options.defaultValue,
    
                    get : function () {
                        return this.__data ? this.__data[attr.key] : null;
                    },
    
                    set : function (val) {
    
                        var key,
                            data,
                            factory,
                            isDirty,
                            dirtyAttrs,
                            dirtyIndex;
    
                        key = attr.key;
    
                        factory = attr.factory = attr.factory || this.store.getFactory(factoryName);
    
                        data = this.__data = this.__data || {};
                        this.__originalData = this.__originalData || clone(data);
                        isDirty = this.__originalData[key] !== val;
    
                        dirtyAttrs = this.get('dirtyAttributes');
                        dirtyIndex = dirtyAttrs.indexOf(key);
    
                        if (dirtyIndex < 0 && isDirty) {
                            dirtyAttrs.push(key);
                            this.set('dirtyAttributes') = dirtyAttrs;
                        }
    
                        else if (!isDirty && dirtyIndex >= 0) {
                            dirtyAttrs.splice(dirtyIndex, 1);
                            this.set('dirtyAttributes', dirtyAttrs);
                        }
    
                        if (typeof val === 'string' || typeof val === 'number') {
                            val = this.store.findInCacheOrCreate(factoryName, val);
                        }
    
                        if (val) {
                            $b.assert('Invalid relationship assignment. Expected value of type : ' + factoryName, val instanceof factory);
                        }
    
                        data[key] = val;
                    },
    
                    serialize : function () {
    
                        var val,
                            data;
    
                        data = this.__data = this.__data || {};
    
                        val = data ? data[attr.key] : null;
    
                        if (val && val instanceof Model) {
    
                            if (options.embedded) {
                                return val.serialize();
                            }
    
                            return val.get('pk');
                        }
    
                        return val;
                    },
    
                    deserialize : function (val) {
    
                        var record,
                            factory;
    
                        factory = attr.factory = attr.factory || this.store.getFactory(factoryName);
    
                        if (options.embedded && typeof val === 'object') {
                            record = factory.create(val);
                        }
    
                        else {
                            record = this.store.findInCacheOrCreate(factoryName, val);
                        }
    
                        return record;
                    }
    
                });
    
                return attr;
            };
        }
    
    ).attach('$b');
    

    $b('brink/data/Collection', 
    
        [
           '../core/Array'
        ],
    
        function (Arr) {
    
            'use strict';
    
            return Arr({
    
                factory : null,
                primaryKey : null,
    
                typeKey : null,
                collectionKey : null,
    
                findByPrimaryKey : function (q) {
                    return this.findBy(this.primaryKey, q);
                },
    
                removeByPrimaryKey : function (q) {
    
                    var index;
    
                    index = this.findIndexBy(this.primaryKey, q);
    
                    if (~r) {
                        return this.removeAt(index);
                    }
                },
    
                serialize : function (isEmbedded) {
    
                    var a = [];
    
                    this.forEach(function (item, index, collection) {
    
                        if (isEmbedded) {
                            a.push(item.serialize());
                        }
    
                        else {
                            a.push(item.get('pk'));
                        }
    
                    }, this);
    
                    return a;
                }
    
            });
        }
    
    ).attach('$b');

    $b('brink/data/hasMany', 
    
        [
            './Model',
            './Collection',
            '../utils/computed',
            '../utils/clone'
        ],
    
        function (Model, Collection, computed, clone) {
    
            'use strict';
    
            return function (factoryName, options) {
    
                var attr = computed({
    
                    type : 'hasMany',
                    factory : null,
                    options : options,
                    isRelationship : true,
    
                    value : options.defaultValue,
    
                    get : function () {
                        return this.__data ? this.__data[attr.key] : null;
                    },
    
                    set : function (val) {
    
                        var key,
                            data,
                            factory,
                            isDirty,
                            dirtyAttrs,
                            dirtyIndex;
    
                        key = attr.key;
    
                        factory = attr.factory = attr.factory || this.store.getFactory(factoryName);
    
                        data = this.__data = this.__data || {};
                        this.__originalData = this.__originalData || clone(data);
                        isDirty = this.__originalData[key] !== val;
    
                        dirtyAttrs = this.get('dirtyAttributes');
                        dirtyIndex = dirtyAttrs.indexOf(key);
    
                        if (dirtyIndex < 0 && isDirty) {
                            dirtyAttrs.push(key);
                            this.set('dirtyAttributes') = dirtyAttrs;
                        }
    
                        else if (!isDirty && dirtyIndex >= 0) {
                            dirtyAttrs.splice(dirtyIndex, 1);
                            this.set('dirtyAttributes', dirtyAttrs);
                        }
    
                        if (val) {
                            $b.assert('Invalid relationship assignment. Expected value of type : $b.Collection', val instanceof Collection);
                        }
    
                        data[key] = val;
                    },
    
                    serialize : function () {
    
                        var val,
                            data;
    
                        data = this.__data = this.__data || {};
    
                        val = data ? data[attr.key] : null;
    
                        return val ? val.serialize(options.embedded) : null;
                    },
    
                    deserialize : function (val) {
    
                        var i,
                            meta,
                            record,
                            records,
                            factory,
                            collection;
    
                        val = [].concat(val);
                        records = [];
    
                        factory = attr.factory = attr.factory || this.store.getFactory(factoryName);
    
                        collection = Collection.create();
    
                        for (i = 0; i < val.length; i ++) {
    
                            if (val[i]) {
    
                                if (options.embedded && typeof val[i] === 'object') {
                                    record = factory.create();
                                    record.deserialize(val[i]);
                                }
    
                                else {
                                    record = this.store.findInCacheOrCreate(factoryName, val);
                                }
    
                                records.push(record);
                            }
                        }
    
                        if (records.length) {
                            collection.set('factory', factory);
                            collection.set('primaryKey', factory.primaryKey);
                            collection.set('typeKey', factory.typeKey);
                            collection.set('collectionKey', factory.collectionKey);
    
                            collection.push.apply(collection, records);
                        }
    
                        return collection;
                    }
    
                });
    
                return attr;
            };
        }
    
    ).attach('$b');

    $b('brink/data/store', 
    
        [
            './Model',
            './Collection',
            '../core/Class',
            '../core/Array',
            '../utils/next'
        ],
    
        function (Model, Collection, Class, Arr, next) {
    
            'use strict';
    
            var Store = Class({
    
                factoryPrefix : '',
                factorySuffix : '',
    
                __cache : null,
                __registry : null,
                __store : null,
    
                init : function () {
    
                    this.__cache = {};
                    this.__registry = {};
                    this.__store = {};
                },
    
                getTypeKey : function (key) {
                    key = key.split('.');
                    key = key[key.length - 1];
                    key = key.charAt(0).toLowerCase() + key.slice(1);
                    return key;
                },
    
                addToCache : function (model, records) {
    
                    var i,
                        pk,
                        cache,
                        record,
                        factory;
    
                    factory = this.getFactory(model);
                    cache = this.__cache[factory.collectionKey] = this.__cache[factory.collectionKey] || {};
    
                    for (i = 0; i < records.length; i ++) {
    
                        record = records[i];
                        pk = record.get('pk');
    
                        cache[pk] = record;
                    }
    
                    return cache;
                },
    
                removeFromCache : function (model, records) {
    
                    var i,
                        pk,
                        cache,
                        record,
                        factory;
    
                    factory = this.getFactory(model);
                    cache = this.__cache[factory.collectionKey] = this.__cache[factory.collectionKey] || {};
    
                    for (i = 0; i < records.length; i ++) {
    
                        record = records[i];
                        pk = record.get('pk');
    
                        cache[pk] = null;
                    }
    
                    return cache;
                },
    
                findInCache : function (model, id) {
    
                    var cache,
                        factory;
    
                    factory = this.getFactory(model);
                    cache = this.__cache[factory.collectionKey] = this.__cache[factory.collectionKey] || {};
                    return cache[id];
                },
    
                findInCacheOrCreate : function (model, id) {
    
                    var record,
                        factory;
    
                    factory = this.getFactory(model);
    
                    if (id) {
                        record = this.findInCache(model, id);
                    }
    
                    if (!record) {
                        record = factory.create();
                        record.set('pk', id);
                        this.add(factory, record);
                    }
    
                    return record;
                },
    
                getCollection : function (model) {
    
                    var factory,
                        collection;
    
                    factory = this.getFactory(model);
    
                    if (!factory) {
                        $b.error('No model was found for \'' + model + '\'');
                    }
    
                    collection = this.__store[factory.collectionKey];
    
                    if (!collection) {
                        collection = this.__store[factory.collectionKey] = Collection.create({content : Arr.create()});
    
                        collection.set('factory', factory);
                        collection.set('primaryKey', factory.primaryKey);
                        collection.set('typeKey', factory.typeKey);
                        collection.set('collectionKey', factory.collectionKey);
                    }
    
                    return collection;
                },
    
                getFactory : function (key) {
    
                    var factory,
                        typeKey,
                        normalizedKey;
    
                    factory = typeof key !== 'string' ? key : null;
    
                    if (!factory) {
                        factory = this.__registry[key];
                    }
    
                    if (!factory) {
    
                        normalizedKey = this.container.normalize('model:' + key);
                        typeKey = this.getTypeKey(key);
    
                        factory = this.container.lookupFactory(normalizedKey);
    
                        if (factory) {
                            factory.typeKey = factory.typeKey || typeKey;
                            factory.collectionKey = factory.collectionKey || factory.typeKey + 's';
                        }
                    }
    
                    if (factory) {
                        factory.store = factory.prototype.store = this;
                    }
    
                    return factory;
                },
    
                registerModel : function (key) {
    
                    var factory = this.getFactory(key);
    
                    this.__registry[factory.typeKey] = factory;
                    this.__registry[factory.collectionKey] = factory;
    
                    return factory;
                },
    
                find : function (model, q) {
    
                    var collection;
    
                    collection = this.getCollection(model);
    
                    if (typeof q === 'number' || typeof q === 'string') {
                        return this.findInCache(model, q);
                    }
    
                    return collection.filter(function (item, index, collection) {
    
                        var p,
                            doesMatch;
    
                        doesMatch = true;
    
                        for (p in q) {
                            if (item.get(p) !== q[p]) {
                                doesMatch = false;
                            }
                        }
    
                        return doesMatch;
    
                    }, this);
                },
    
                all : function (model) {
                    return this.getCollection(model);
                },
    
                fetchUnloadedRecords : function () {
    
                    var p,
                        i,
                        r;
    
                    for (p in this.__cache) {
                        for (i in this.__cache[p]) {
                            r = this.__cache[p][i];
                            if (!r.get('isLoaded')) {
                                r.fetchRecord();
                            }
                        }
                    };
                },
    
                fetch : function (model, q) {
    
                    var record,
                        factory;
    
                    factory = this.getFactory(model);
    
                    return factory.adapter.fetch(factory, q).then(function (json) {
    
                        json = json[factory.typeKey] || json;
                        json = Array.isArray(json) ? json[0] : json;
    
                        record = this.findInCacheOrCreate(model, json[factory.primaryKey]);
                        record.deserialize(json);
    
                        return record;
    
                    }.bind(this));
                },
    
                fetchAll : function (model) {
    
                    var i,
                        item,
                        record,
                        records,
                        factory,
                        collection;
    
                    records = [];
                    factory = this.getFactory(model);
    
                    return factory.adapter.fetchAll(factory).then(function (json) {
    
                        json = json[factory.collectionKey] || json;
                        json = Array.isArray(json) ? json : [json];
    
                        for (i = 0; i < json.length; i ++) {
                            item = json[i];
                            record = this.findInCacheOrCreate(model, item[factory.primaryKey]);
                            record.deserialize(item);
                            records.push(record);
                        }
    
                        collection = Collection.create({content : records});
                        return collection;
    
                    }.bind(this));
                },
    
                add : function (model, records) {
    
                    if (model instanceof Model || model instanceof Collection) {
                        records = model;
                        model = model.factory || model.constructor;
                    }
    
                    records = [].concat(records);
                    this.addToCache(model, records);
                    return this.getCollection(model).pushObjects(records);
                },
    
                remove : function (model, records) {
    
                    if (model instanceof Model || model instanceof Collection) {
                        records = model;
                        model = model.factory || model.constructor;
                    }
    
                    records = [].concat(records);
                    this.removeFromCache(model, records);
                    return this.getCollection(model).removeObjects(records);
                },
    
                injectType : function (type, data) {
    
                    var i,
                        item,
                        record,
                        factory;
    
                    factory = this.getFactory(type);
                    data = Array.isArray(data) ? data : [data];
    
                    for (i = 0; i < data.length; i ++) {
                        item = data[i];
                        if (item) {
                            record = this.findInCacheOrCreate(factory, item[factory.primaryKey]);
                            record.deserialize(item);
                        }
                    }
                },
    
                inject : function (type, data) {
    
                    var p;
    
                    if (typeof type === 'object') {
                        data = type;
                        type = null;
                    }
    
                    if (type) {
                        return this.injectType(type, data);
                    }
    
                    for (p in data) {
                        if (this.__registry[p]) {
                            this.injectType(p, data[p]);
                        }
                    }
    
                    next(this.fetchUnloadedRecords);
                }
            });
    
            return Store.create();
        }
    
    ).attach('$b');

    $b('brink/node/build', 
    
        [],
    
        function () {
    
            'use strict';
    
            return function (opts) {
    
                var vm = require('vm'),
                    fs = require('fs'),
                    zlib = require('zlib'),
                    path = require('path'),
                    includer = require('includer'),
                    wrench = require('wrench'),
                    uglify = require('uglify-js'),
                    minimatch = require('minimatch'),
                    modules = [],
                    src;
    
                console.log('');
    
                function replaceAnonymousDefine (id, src) {
    
                    // Replace the first instance of '$b(' or '$b.define('
                    src = src.replace(/(\$b|\.define)(\s)?(\()/, "$1$2$3'" + id + "', ");
                    return src;
                }
    
                function replaceModules (modules, src) {
    
                    return src.replace(/([t| ]+)(\/\*{{modules}}\*\/)([\s\S]+?)(\/\*{{\/modules}}\*\/)/, '$1' + JSON.stringify(modules, null, '    ').split('\n').join('\n$1'));
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
    
                            src = ';(function () {\n' + replaceModules(modules, src) + '\n})();';
    
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
                            b.require(opts.modules, cb);
                        }
    
                        else {
                            cb();
                        }
                    }
                );
            };
        }
    
    ).attach('$b');
    

})();