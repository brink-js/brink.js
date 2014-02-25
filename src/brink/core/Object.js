$b(

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

                meta.watchers = meta.watchers || {};

                meta.watchers.fns = meta.watchers.fns || [];
                meta.watchers.props = meta.watchers.props || [];

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

                    if (this.__meta.pojoStyle) {
                        return error('Tried to write to a read-only property `' + p + '` on ' + this);
                    }

                    return this[p] = val;
                };
            },

            __writeOnly : function (p) {

                return function () {

                    if (this.__meta.pojoStyle) {
                        return error('Tried to read a write-only property `' + p + '` on ' + this);
                    }

                    return this[p];
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

                if ($b.instanceManager) {
                    $b.instanceManager.propertyDidChange(this, flatten(arguments));
                }
            },

            serialize : function () {

                var i,
                    p,
                    o,
                    props;

                props = arguments.length ? [].concat.call(arguments) : [];
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

                fn = arguments[0];
                props = arguments[1];

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