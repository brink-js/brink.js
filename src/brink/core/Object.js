$b(

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