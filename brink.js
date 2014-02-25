;(function () {

    'use strict';
    
    var $b,
    	_global,
    	include,
    	CONFIG;
    
    _global = typeof window !== 'undefined' ? window : global;
    CONFIG = _global.Brink || _global.$b || {};
    
    include = _global.include ? _global.include : typeof require !== 'undefined' ? require : null;
    
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
    
    /********* RESOLVER *********/
    
        (function () {
        
            'use strict';
        
            var _global,
                origRequire,
                resolver;
        
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
                                attachPath : this.attachPath
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
        
                        setTimeout(function () {
                            _invokeAnonymousDefine(m, f);
                        }, 0);
        
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
                    return _metas;
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
                "brink/utils/error",
                "brink/utils/assert",
                "brink/utils/expandProps",
                "brink/utils/isBrinkInstance",
                "brink/utils/defineProperty",
                "brink/utils/isBrinkObject",
                "brink/utils/isFunction",
                "brink/utils/isObject",
                "brink/utils/extend",
                "brink/utils/merge",
                "brink/utils/flatten",
                "brink/utils/intersect",
                "brink/utils/configure",
                "brink/utils/computed",
                "brink/utils/clone",
                "brink/utils/bindTo",
                "brink/utils/alias",
                "brink/react/ReactMixin",
                "brink/node/build",
                "brink/core/CoreObject",
                "brink/core/Object",
                "brink/core/Dictionary",
                "brink/core/Array",
                "brink/core/NotificationManager",
                "brink/core/Class",
                "brink/core/RunLoop",
                "brink/core/InstanceWatcher",
                "brink/core/InstanceManager"
            ]
    
    		, function () {
    
    
    			/********* ALIASES *********/
    
    			$b.merge($b, {
    				F : function () {}
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

    $b('brink/utils/error', 
    
        function () {
    
            'use strict';
    
            return function (msg) {
                throw new Error(msg);
            };
        }
    
    ).attach('$b');

    $b('brink/utils/assert', 
    
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

    $b('brink/utils/defineProperty', 
    
        [
            './assert',
            './isBrinkInstance'
        ],
    
        function (assert, isBrinkInstance) {
    
            'use strict';
    
            return function (obj, prop, descriptor) {
    
                assert('Object must be an instance of Brink.Object or Brink.Class', isBrinkInstance(obj));
    
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

    $b('brink/utils/isBrinkObject', 
    
        function () {
    
            'use strict';
    
            return function (obj) {
                return obj.__isObject;
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

    $b('brink/utils/merge', 
    
        [
            './assert',
            './isObject'
        ],
    
        function (assert, isObject) {
    
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
    

    $b('brink/utils/computed', 
    
        [
            './flatten',
            './isFunction',
            './expandProps'
        ],
    
        function (flatten, isFunction, expandProps) {
    
            'use strict';
    
            return function (o, v) {
    
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

    $b('brink/utils/bindTo', 
    
        [
            './assert',
            './computed',
            './isBrinkInstance'
        ],
    
        function (assert, computed, isBrinkInstance) {
    
            'use strict';
    
            return function (a, prop, isDefined) {
    
                var b,
                    val;
    
                assert('Object must be an instance of Brink.Object or Brink.Class', isBrinkInstance(a));
    
                val = a.get(prop);
    
                if (!isDefined) {
                    a.property(prop);
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
    

    $b('brink/react/ReactMixin', 
    
        function () {
    
            'use strict';
    
            return {
    
                __propsChanged : function () {
                    this.setProps(this.__props.getChangedProperties());
                },
    
                componentWillMount : function () {
                    this.__props = this.props;
                    this.props = this.__props.serialize();
                    this.__props.watch(this.__propsChanged);
                },
    
                componentWillUnmount : function () {
                    this.__props.unwatch(this.__propsChanged);
                }
            };
        }
    
    ).attach('$b');
    

    $b('brink/node/build', 
    
        [
            '../utils/error'
        ],
    
        function (error) {
    
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
                    src = src.replace(/(\$b|\.define)?(\s)?(\()/, "$1$2$3'" + id + "', ");
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
                    error('No output file specified.');
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
    
    		CoreObject.extend = function () {
    
    			var A,
    				i,
    				o,
    				props,
    				proto;
    
    			if (arguments.length > 1) {
    
    				i = 0;
    
    				while (i < arguments.length - 1) {
    					o = arguments[i];
    					A = A || (isBrinkObject(o) ? o : this);
    					A = A.extend(arguments[++ i]);
    				}
    
    				return A;
    			}
    
    			proto = this.buildPrototype.apply(this, arguments);
    
    			function Obj (callInit) {
    
    				var fn;
    
    				if (callInit === true || callInit === false) {
    
    					if (callInit) {
    						fn = this.__init || this.init || this.constructor;
    						fn.apply(this, arguments);
    					}
    
    					return this;
    				}
    
    				return Obj.extend.apply(Obj, arguments);
    			}
    
    			Obj.prototype = proto;
    			extend(Obj, this, proto.classProps || {});
    
    			Obj.prototype.constructor = Obj;
    
    			return Obj;
    		};
    
    		CoreObject.buildPrototype = function (props) {
    			var F = function () {};
    			F.prototype = this.prototype;
    			return extend(new F(), props);
    		};
    
    		CoreObject.reopen = function (o) {
    			extend(this.prototype, o);
    			return Obj;
    		};
    
    		CoreObject.reopenObject = function (o) {
    			extend(this, o);
    			return Obj;
    		};
    
    		CoreObject.create = function (o) {
    
    			var p,
    				args,
    				init,
    				instance;
    
    			args = arguments;
    
    			if (typeof o === 'function') {
    				instance = new this(true);
    				o.call(instance);
    				args = [];
    			}
    
    			instance = instance || new this(false);
    
    			init = instance.__init || instance.init;
    
    			if (init) {
    				init.apply(instance, args);
    			}
    
    			return instance;
    		};
    
            return CoreObject;
        }
    
    ).attach('$b');
    

    $b('brink/core/Object', 
    
        [
            '../config',
            './CoreObject',
            '../utils/bindTo',
            '../utils/clone',
            '../utils/error',
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
            bindTo,
            clone,
            error,
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
    
                    this.__meta = meta = clone(this.__meta || {});
                    meta.values = {};
    
                    meta.watchers = {
                        fns : [],
                        props : []
                    };
    
                    if (typeof o === 'object' && !Array.isArray(o)) {
                        o = clone(o);
                    }
    
                    else {
                        o = {};
                    }
    
                    if (!meta.isExtended) {
                        merge(this, o);
                        this.__parsePrototype();
                    }
    
                    else {
                        for (p in o) {
                            this.property(p, o[p]);
                        }
                    }
    
                    for (i = 0; i < meta.methods.length; i ++) {
                        p = meta.methods[i];
                        this[p] = this[p].bind(this);
                    }
    
                    for (p in meta.properties) {
                        this.__defineProperty(p);
                    }
    
                    if (isFunction(this.init)) {
                        this.init.apply(this, arguments);
                    }
    
                    meta.isInitialized = true;
                    meta.isExtended = true;
    
                    if ($b.instanceManager) {
                        $b.instanceManager.add(this, meta);
                    }
    
                    return this;
                },
    
                __parsePrototype : function () {
    
                    var p,
                        v,
                        meta,
                        methods,
                        dependencies;
    
                    meta = this.__meta = this.__meta || {};
    
                    methods = clone(meta.methods || []);
                    dependencies = clone(meta.dependencies || []);
    
                    meta.getters = clone(meta.getters || {});
                    meta.setters = clone(meta.setters || {});
    
                    meta.properties = clone(meta.properties || {});
    
                    for (p in this) {
    
                        v = this[p];
    
                        if (isFunction(v)) {
                            if (p !== 'constructor') {
                                methods.push(p);
                            }
                        }
    
                        else if (this.hasOwnProperty(p)) {
    
                            if (p.indexOf('__') !== 0) {
    
                                if (v && v.__isRequire) {
                                    dependencies.push(p);
                                }
    
                                else {
                                    this.property.call(this, p, v);
                                }
                            }
                        }
                    }
    
                    meta.methods = methods;
                    meta.dependencies = dependencies;
                },
    
                __defineProperty : function (p) {
    
                    var d;
    
                    d = this.__meta.properties[p];
    
                    if (!config.DIRTY_CHECK) {
    
                        d = clone(d);
    
                        if (d.get) {
                            d.get = d.get.bind(this);
    
                        }
    
                        if (d.set) {
                            d.set = d.set.bind(this);
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
                        return function (val) {
                            return error('Tried to write to a read-only property `' + p + '` on ' + this);
                        }.bind(this);
                    };
                },
    
                __writeOnly : function (p) {
    
                    if (this.__meta.pojoStyle) {
                        return function () {
                            return error('Tried to read a write-only property `' + p + '` on ' + this);
                        }.bind(this);
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
    
                __resetChangedProps : function () {
                    if (this.__meta) {
                        this.__meta.changedProps = [];
                    }
                },
    
                propertyDidChange : function () {
    
                    var props;
    
                    props = flatten([].slice.call(arguments, 0, arguments.length));
    
                    if ($b.instanceManager) {
                        $b.instanceManager.propertyDidChange(this, props);
                    }
                },
    
                serialize : function () {
    
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
    
                property : function (key, val) {
    
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
    
                    val.bindTo = function (o, p) {
                        o.property(p, bindTo(this, key, true));
                    }.bind(this);
    
                    val.didChange = function () {
                        this.propertyDidChange(key);
                    }.bind(this);
    
                    if (this.__meta.isInitialized) {
                        this.__defineProperty(key);
                    }
    
                    return val;
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
    
                    error('Tried to call set with unsupported arguments', arguments);
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
                        error('InstanceManager does not exist, can\'t watch for property changes.');
                    }
                },
    
                unwatch : function (fns) {
    
                    if ($b.instanceManager) {
                        $b.instanceManager.unwatch(this, flatten(arguments));
                    }
    
                    else {
                        error('InstanceManager does not exist, can\'t watch for property changes.');
                    }
    
                },
    
                unwatchAll : function () {
    
                    if ($b.instanceManager) {
                        $b.instanceManager.unwatchAll(this);
                    }
    
                    else {
                        error('InstanceManager does not exist, can\'t watch for property changes.');
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
    
                var proto,
                    SubObj;
    
                SubObj = CoreObject.extend.apply(this, arguments);
                proto = SubObj.prototype;
    
                proto.__parsePrototype.call(proto);
                proto.__meta.isExtended = true;
    
                return SubObj;
            };
    
            Obj.define = function () {
                $b.define(this.prototype.__dependencies, this.resolveDependencies.bind(this));
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
    
                $b.require(this.prototype.__dependencies, function () {
                    this.resolveDependencies.call(this);
                    cb(this);
                }.bind(this));
    
                return this;
            };
    
            Obj.__meta = merge(Obj.__meta || {}, {isObject: true});
    
            return Obj;
        }
    
    ).attach('$b');

    $b('brink/core/Dictionary', 
    
        [
        	'./Object'
        ],
    
        function (Obj) {
    
    		return Obj.extend({
    
                keys : null,
                values : null,
    
                // Not inherited
                flatten : null,
                merge : null,
    
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
    
                    this.addedItems = [];
                    this.removedItems = [];
    
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

    $b('brink/core/Array', 
    
        [
        	'./Object',
        	'../utils/flatten',
        	'../utils/merge'
        ],
    
        function (Obj, flatten, merge) {
    
        	var Arr,
        		AP,
        		METHODS;
    
        	AP = Array.prototype;
    
        	(function () {
    
        		var p;
    
        		function alias (p) {
    
        			return function (r, l) {
        				r = AP[p].apply(this.content, arguments);
        				this.length = this.content.length;
        				return r;
        			}
        		}
    
        		for (p in AP) {
        			if (AP.hasOwnProperty(p) && typeof AP[p] === 'function') {
        				METHODS[p] = alias(p);
        			}
        		}
    
        	})();
    
    		Arr = Obj.extend(merge(METHODS, {
    
    			content : null,
    			addedItems : null,
    			removedItems : null,
    
    			__notifyPropertyListeners : function () {
    				Obj.prototype.__notifyPropertyListeners.apply(this, arguments);
    
    				Obj.watchLoop.once(function () {
    					this.addedItems = [];
    					this.removedItems = [];
    				}.bind(this));
    			},
    
    			init : function (a) {
    				this.content = a;
    				this.__meta.cache = this.content.concat();
    				this.__meta.addedItems = [];
    				this.__meta.removedItems = [];
    				this.length = this.content.length;
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
    
    			concat : function () {
    				var r = AP.filter.apply(this.content, arguments);
    				return this.prototype.constructor.create(r);
    			},
    
    			filter : function () {
    				var r = AP.filter.apply(this.content, arguments);
    				return this.prototype.constructor.create(r);
    			},
    
    			flatten : function () {
    				flatten(this.content);
    				this.contentDidChange(null, 'reorder');
    			},
    
    			merge : function (o) {
    				merge(this.content, o);
    				this.contentDidChange(null, 'reorder');
    			},
    
    			insert : function () {
    				return this.push.apply(this, arguments);
    			},
    
    			insertAt : function (i, o) {
    				this.splice(i, 0, o);
    				return this.length;
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
    				this.contentDidChange(i, 'removed');
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
    					this.contentDidChange(i + j, 'added');
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
    				r = AP.reverse.apply(this.content, arguments)
    				this.contentDidChange(null, 'reorder');
    				return this;
    			},
    
    			sort : function () {
    				r = AP.sort.apply(this.content, arguments)
    				this.contentDidChange(null, 'reorder');
    				return this;
    			},
    
                __resetChangedProps : function () {
    
                	var meta = this.__meta;
    
                    if (meta) {
                        meta.changedProps = [];
                        meta.addedItems = [];
                        meta.removedItems = [];
                    }
                },
    
                getChanges : function () {
    
                	var o,
                		meta;
    
                	o = {};
                	meta = this.__meta;
    
                	if (meta) {
                		o = {
                			added : meta.addedItems,
                			removed : meta.removedItems
                		};
                	}
    
                	return o;
                },
    
    			contentDidChange : function (i, action) {
    
    				var meta = this.__meta;
    
    				if (action === 'reorder' || meta.invalid === true) {
    					merge(meta.addedItems, this.content.concat());
    					merge(meta.removedItems, meta.cache.concat());
    					this.__invalid = true;
    				}
    
    				else if (action === 'added') {
    					meta.addedItems.push(this.content[i]);
    				}
    
    				else if (action === 'removed') {
    					meta.removedItems.push(meta.cache[i]);
    				}
    
    				this.propertyDidChange('@each');
    
    				this.length = this.content.length;
    				meta.cache = this.content.concat();
    			}
    
    		}));
    
    
    		return Arr;
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
        	'./Object',
        	'./NotificationManager'
        ],
    
        function (Obj, NotificationManager) {
    
            'use strict';
    
            var Class,
            	superfy,
            	doesCallSuper;
    
    		superfy = function (fn, superFn) {
    			return function () {
    				var r, tmp = this._super || null;
    
    				// Reference the prototypes method, as super temporarily
    				this._super = superFn;
    
    				r = fn.apply(this, arguments);
    
    				// Reset this._super
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
    
    		Class = Obj.extend({
    
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
                        return;
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
                        intersected;
    
                    for (i = 0; i < meta.watchers.fns.length; i ++) {
    
                        fn = meta.watchers.fns[i];
                        props = meta.watchers.props[i];
                        intersected = props.length ? intersect(props, meta.changedProps) : meta.changedProps.concat();
    
                        if (!intersected.length) {
                            continue;
                        }
    
                        this.watchLoop.once(fn, intersected);
                    }
    
                    this.watchLoop.once(instance.__resetChangedProps);
                    this.watchLoop.run();
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

})();