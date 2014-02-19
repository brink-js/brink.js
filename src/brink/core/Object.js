$b.define(

    [
        '../config',
        './RunLoop',
        './CoreObject',
        './DirtyChecker',
        '../utils/clone',
        '../utils/error',
        '../utils/merge',
        '../utils/flatten',
        '../utils/isFunction',
        '../utils/defineProperty'
    ],

    function (
        config,
        RunLoop,
        CoreObject,
        DirtyChecker,
        clone,
        error,
        merge,
        flatten,
        isFunction,
        defineProperty
    ) {

        'use strict';

        var Obj,
            bindLoop = new RunLoop();

        Obj = CoreObject.extend({

            __init : function () {

                var i,
                    p,
                    d;

                this.__watchers = [];
                this.__allWatchedProps = [];
                this.__watchedProps = [];
                this.__changedProps = [];
                this.__values = {};

                for (i = 0; i < this.__methods.length; i ++) {
                    p = this.__methods[i];
                    this[p] = this[p].bind(this);
                }

                for (p in this.__properties) {

                    d = this.__properties[p];

                    if (!config.DIRTY_CHECK) {
                        d = clone(d);
                        d.get = d.get.bind(this);
                        d.set = d.set.bind(this);

                       // Modern browsers, IE9 +
                        if (Object.defineProperty) {
                            Object.defineProperty(this, p, d);
                        }

                        // Old FF
                        else if (this.__defineGetter__) {
                            this.__defineGetter__(prop, d.get);
                            this.__defineSetter__(prop, d.set);
                        }

                        if (typeof this.__defaults[p] !== 'undefined') {
                            this.set(p, this.__defaults[p], true);
                        }
                    }

                    else {
                        this[p] = this.__defaults[p];
                        DirtyChecker.addInstance(this);
                    }

                    if (d.watch && d.watch.length) {
                        this.watch(this.propertyDidChange, d.watch);
                    }
                }

                if (isFunction(this.init)) {
                    this.init.apply(this, arguments);
                }

                return this;
            },

            __readOnly : function (p) {

                return function (val) {

                    if (!config.DIRTY_CHECK) {
                        return error('Tried to write to a read-only property `' + p + '` on ' + this);
                    }

                    return this[p] = val;
                };
            },

            __writeOnly : function (p) {

                return function () {

                    if (!config.DIRTY_CHECK) {
                        return error('Tried to read a write-only property `' + p + '` on ' + this);
                    }

                    return this[p];
                };
            },

            __defineGetter : function (p, fn) {

                if (fn && isFunction(fn)) {
                    this.__getters[p] = fn;
                }

                return function () {
                    return this.get.call(this, p);
                }
            },

            __defineSetter : function (p, fn) {

                if (fn && isFunction(fn)) {
                    this.__setters[p] = fn;
                }

                return function (val) {
                    return this.set.call(this, p, val);
                }
            },

            __notifyPropertyListeners : function () {

                var i,
                    j,
                    p,
                    fn,
                    fns,
                    idx,
                    args,
                    props,
                    watchers;

                fns = bindLoop.__once;
                props = this.__changedProps;

                for (i = 0; i < this.__watchers.length; i ++) {

                    fn = this.__watchers[i];
                    idx = fns.indexOf(fn);

                    if (idx < 0) {
                        bindLoop.once(fn, this.__watchedProps[i]);
                    }

                    else {
                        args = bindLoop.__onceArgs[idx];
                        bindLoop.__onceArgs[idx] = [merge(args[0], this.__watchedProps[i]), args[1]];
                    }
                }

                this.__changedProps = [];
            },

            propertyDidChange : function (p) {

                var i,
                    p,
                    d,
                    p2,
                    watchers;

                if (Array.isArray(p)) {

                    for (i = 0; i < p.length; i ++) {
                        this.propertyDidChange(p[i]);
                    }

                    return;
                }

                if (config.DIRTY_CHECK) {

                    this[p] = this.get(p);
                    DirtyChecker.updateCache(this, p);

                    for (p2 in this.__properties) {

                        d = this.__properties[p2];

                        if (~(d.watch || []).indexOf(p)) {
                            this.propertyDidChange(p2);
                        }
                    }
                }

                this.__changedProps = merge(this.__changedProps, [p]);
                bindLoop.once(this.__notifyPropertyListeners);
                bindLoop.start();
            },

            get : function (key) {

                if (this.__getters[key]) {
                    return this.__getters[key].call(this, key);
                }

                return this.__values[key];
            },

            set : function (key, val, quiet, skipCompare) {

                var i,
                    old;

                if (typeof key === 'string') {

                    old = this.get(key);

                    if (skipCompare || old !== val) {

                        if (this.__setters[key]) {
                            val = this.__setters[key].call(this, val, key);
                        }

                        else {
                            this.__values[key] = val;
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

                var idx;

                props = [].concat(props);
                props = props.concat(Array.prototype.slice.call(arguments, 2));

                idx = this.__watchers.indexOf(fn);

                if (idx < 0) {
                    this.__watchers.push(fn);
                    this.__watchedProps[this.__watchers.length - 1] = props;
                }

                else {
                    this.__watchedProps[idx] = merge(this.__watchedProps[idx], props);
                }

                this.__allWatchedProps = flatten(this.__watchedProps);
            },

            unwatch : function (fns) {

                var i,
                    fn,
                    idx;

                fns = [].concat(fns);

                for (i = 0; i < fns.length; i ++) {

                    fn = fns[i];

                    idx = this.__watchers.indexOf(fn);

                    if (idx > -1) {
                        this.__watchers.splice(idx, 1);
                        this.__watchedProps.splice(idx, 1);
                    }
                }

                this.__allWatchedProps = flatten(this.__watchedProps);
            },

            unwatchAll : function () {
                this.__watchers = [];
                this.__watchedProps = [];
                this.__allWatchedProps = [];
            },

            destroy : function () {

                var i;

                if (config.DIRTY_CHECK) {
                    DirtyChecker.removeInstance(this);
                }

                this.unwatchAll();
            }
        });

        Obj.extend = function () {

            var p,
                v,
                d,
                c,
                proto,
                SubObj,
                methods,
                properties,
                dependencies;

            SubObj = CoreObject.extend.apply(this, arguments);
            proto = SubObj.prototype;

            proto.__getters = {};
            proto.__setters = {};
            proto.__dependencies = [];
            proto.__properties = {};
            proto.__defaults = {};
            proto.__methods = [];

            methods = [];
            dependencies = [];
            properties = clone(proto.__properties || {});

            for (p in proto) {

                v = proto[p];

                if (isFunction(v) && p !== 'constructor') {
                    methods.push(p);
                }

                else if (proto.hasOwnProperty(p)) {

                    if (p.indexOf('__') !== 0) {

                        if (v.__isRequire) {
                            dependencies.push(p);
                        }

                        else if (v.__isComputed) {
                            d = v;
                        }

                        else {
                            d = {
                                get : true,
                                set : true,
                                value : v
                            };
                        }

                        properties[p] = defineProperty(proto, p, d);
                    }
                }
            }

            proto.__properties = properties;
            proto.__methods = merge((proto.__methods || []).concat(), methods);
            proto.__dependencies = merge((proto.__dependencies || []).concat(), dependencies);

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

            this.__dependenciesResolved = true;

            return this;
        };

        Obj.load = function (cb) {

            cb = typeof cb === 'function' ? cb : function () {};

            if (this.__dependenciesResolved) {
                cb(this);
            }

            $b.require(this.prototype.__dependencies, function () {
                this.resolveDependencies.call(this);
                cb(this);
            }.bind(this));

            return this;
        };

        return Obj;
    }

).attach('$b');