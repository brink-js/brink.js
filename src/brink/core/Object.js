$b(

    [
        '../config',
        './RunLoop',
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
        RunLoop,
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

        var Obj,
            watchLoop = RunLoop.create(),
            instanceManager;

        Obj = CoreObject.extend({

            __init : function (o) {

                var i,
                    p,
                    d,
                    meta;

                this.__meta = meta = clone(this.__meta || {});

                meta.watchers = [];
                meta.subWatchers = {};
                meta.allWatchedProps = [];
                meta.watchedProps = [];
                meta.changedProps = [];
                meta.values = {};

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
                        this.__defineGetter__(prop, d.get);
                        this.__defineSetter__(prop, d.set);
                    }

                    this.set(p, d.defaultValue, true);
                }

                else {
                    this[p] = d.defaultValue;
                }

                if (d.watch && d.watch.length) {
                    this.watch(d.watch, this.propertyDidChange);
                }
            },

            __undefineProperties : function () {

                var p;

                for (p in this.__meta.properties) {
                    delete this[p];
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
                    this.__meta.getters[p] = fn;
                }

                return function () {
                    return this.get.call(this, p);
                }
            },

            __defineSetter : function (p, fn) {

                if (fn && isFunction(fn)) {
                    this.__meta.setters[p] = fn;
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

                if (!this.__meta) {
                    return;
                }

                fns = watchLoop.__once;
                props = this.__meta.changedProps;

                for (i = 0; i < this.__meta.watchers.length; i ++) {

                    fn = this.__meta.watchers[i];
                    idx = fns.indexOf(fn);

                    if (this.__meta.watchedProps[i].length && !intersect(this.__meta.watchedProps[i], props).length) {
                        continue;
                    }

                    args = (this.__meta.watchedProps[i].length ? this.__meta.watchedProps[i] : props).concat();

                    if (idx < 0) {
                        watchLoop.once(fn, args);
                    }

                    else {
                        merge(args, watchLoop.__onceArgs[idx]);
                        watchLoop.__onceArgs[idx] = args;
                    }
                }

                this.__meta.changedProps = [];
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

                    this.__meta.cache[p] = this[p] = this.get(p);

                    for (p2 in this.__meta.properties) {

                        d = this.__meta.properties[p2];

                        if (~(d.watch || []).indexOf(p)) {
                            this.propertyDidChange(p2);
                        }
                    }
                }

                merge(this.__meta.changedProps,[p]);
                watchLoop.once(this.__notifyPropertyListeners, this.__meta.changedProps);
                watchLoop.start();
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
                    this.propertyDidChange(key)
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

                return this.__meta.values[key];
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

                var i,
                    k,
                    p,
                    t,
                    idx,
                    subFn,
                    subWatchers;

                subWatchers = [];

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

                for (i = 0; i < props.length; i ++) {

                    p = props[i];

                    if (~p.indexOf('.')) {

                        t = p.split('.');
                        k = t.pop();

                        subFn = function () {
                            this.propertyDidChange([t,p].join('.'));
                        }.bind(this);

                        t = this.get(t);

                        t.watch(k, subFn);

                        subWatchers.push({
                            obj : t,
                            fn : subFn
                        });
                    }
                }

                idx = this.__meta.watchers.indexOf(fn);

                if (idx < 0) {
                    this.__meta.watchers.push(fn);
                    idx = this.__meta.watchers.length - 1;
                }

                this.__meta.watchedProps[idx] = merge(this.__meta.watchedProps[idx] || [], props);
                this.__meta.subWatchers[idx] = merge(this.__meta.subWatchers[idx] || [], subWatchers);

                this.__meta.allWatchedProps = flatten(this.__meta.watchedProps);
            },

            unwatch : function (fns) {

                var i,
                    p,
                    t,
                    fn,
                    idx;

                fns = [].concat(fns);

                for (i = 0; i < fns.length; i ++) {

                    fn = fns[i];

                    idx = this.__meta.watchers.indexOf(fn);

                    if (~idx) {

                        for (p in this.__meta.subWatchers[idx]) {
                            t = this.__meta.subWatchers[idx];
                            t.obj.unwatch(t.fn);
                        }

                        this.__meta.watchers.splice(idx, 1);
                        this.__meta.watchedProps.splice(idx, 1);
                        this.__meta.subWatchers.splice(idx, 1);

                    }
               }

                this.__meta.allWatchedProps = flatten(this.__meta.watchedProps);
            },

            unwatchAll : function () {

                var i,
                    t;

                for (i = 0; i < this.__meta.watchers.length; i ++) {
                    for (p in this.__meta.subWatchers[i]) {
                        t = this.__meta.subWatchers[i];
                        t.obj.unwatch(t.fn);
                    }
                }

                this.__meta.watchers = [];
                this.__meta.watchedProps = [];
                this.__meta.allWatchedProps = [];
                this.__meta.subWatchers = [];
            },

            destroy : function () {

                if ($b.instanceManager) {
                    $b.instanceManager.remove(this);
                }

                this.unwatchAll();
                this.__undefineProperties();

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

        Obj.watchLoop = watchLoop;
        Obj.__meta = {isObject: true};

        return Obj;
    }

).attach('$b');