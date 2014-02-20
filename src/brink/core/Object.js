$b(

    [
        '../config',
        './RunLoop',
        './CoreObject',
        './DirtyChecker',
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
        RunLoop,
        CoreObject,
        DirtyChecker,
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

        var Obj,
            bindLoop = RunLoop.create();

        Obj = CoreObject.extend({

            __init : function (o) {

                var i,
                    p,
                    d;

                this.__watchers = [];
                this.__allWatchedProps = [];
                this.__watchedProps = [];
                this.__changedProps = [];
                this.__values = {};

                if (typeof o === 'object') {
                    o = clone(o);
                }

                else {
                    o = {};
                }

                if (!this.__isExtended) {
                    merge(this, o);
                    this.__parsePrototype();
                }

                else {
                    for (p in o) {
                        this.property(p, o[p]);
                    }
                }

                for (i = 0; i < this.__methods.length; i ++) {
                    p = this.__methods[i];
                    this[p] = this[p].bind(this);
                }

                for (p in this.__properties) {
                    this.__defineProperty(p);
                }

                if (isFunction(this.init)) {
                    this.init.apply(this, arguments);
                }

                this.__isInitialized = true;

                return this;
            },

            __parsePrototype : function () {

                var p,
                    v,
                    methods,
                    dependencies;

                methods = clone(this.__methods || []);
                dependencies = clone(this.__dependencies || []);

                this.__getters = clone(this.__getters || {});
                this.__setters = clone(this.__setters || {});

                this.__properties = clone(this.__properties || {});

                for (p in this) {

                    v = this[p];

                    if (isFunction(v)) {
                        if (p !== 'constructor') {
                            methods.push(p);
                        }
                    }

                    else if (this.hasOwnProperty(p)) {

                        if (p.indexOf('__') !== 0) {

                            if (v.__isRequire) {
                                dependencies.push(p);
                            }

                            else {
                                this.property.call(this, p, v);
                            }
                        }
                    }
                }

                this.__methods = methods;
                this.__dependencies = dependencies;
            },

            __defineProperty : function (p) {

                var d;

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

                    this.set(p, d.defaultValue, true);
                }

                else {
                    this[p] = d.defaultValue;
                    DirtyChecker.addInstance(this);
                }

                if (d.watch && d.watch.length) {
                    this.watch(this.propertyDidChange, d.watch);
                }
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

                    if (!intersect(this.__watchedProps[i], props).length) {
                        continue;
                    }

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

                merge(this.__changedProps,[p]);
                bindLoop.once(this.__notifyPropertyListeners, this.__changedProps);
                bindLoop.start();
            },

            property : function (key, val) {

                if (typeof this.__properties[key] !== 'undefined') {
                    if (typeof val === 'undefined') {
                        return this.__properties[key];
                    }
                }

                if (this.__isInitialized && this.hasOwnProperty('__properties')) {
                    this.__properties = clone(this.__properties);
                }

                if (!val || !val.__isComputed) {

                    val = {
                        get : true,
                        set : true,
                        value : val
                    };
                }

                val = this.__properties[key] = defineProperty(this, key, val);

                val.bindTo = function (o, p) {
                    o.property(p, bindTo(this, key, true));
                }.bind(this);

                val.didChange = function () {
                    this.propertyDidChange(key)
                }.bind(this);

                if (this.__isInitialized) {
                    this.__defineProperty(key);
                }

                return val;
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
                props = expandProps(props.concat([].slice.call(arguments, 2)));

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


            var proto,
                SubObj;

            SubObj = CoreObject.extend.apply(this, arguments);
            proto = SubObj.prototype;

            proto.__parsePrototype.call(proto);
            proto.__isExtended = true;

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