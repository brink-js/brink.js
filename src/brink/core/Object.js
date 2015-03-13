$b(

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

            /* @doc Object.propertyDidChange */
            propertyDidChange : function () {

                var props;

                props = flatten([].slice.call(arguments, 0, arguments.length));

                if ($b.instanceManager) {
                    $b.instanceManager.propertyDidChange(this, props);
                }
            },

            /* @doc Object.getProperties */
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

            /* @doc Object.getChangedProperties */
            getChangedProperties : function () {
                return this.getProperties.apply(this, this.__meta.changedProps);
            },

            /* @doc Object.descriptor */
            descriptor : function (key, val) {

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
                    o.descriptor(p, bindTo(obj, key, true));
                }, obj);

                val.didChange = bindFunction(function () {
                    obj.propertyDidChange(key);
                }, obj);

                if (obj.__meta.isInitialized) {
                    obj.__defineProperty(key, val);
                }

                return val;
            },

            /* @doc Object.bindProperty */
            bindProperty : function (key, obj, key2) {
                return this.descriptor(key).bindTo(obj, key2);
            },

            /* @doc Object.get */
            get : function (key) {
                return get(this, key);
            },

            /* @doc Object.set */
            set : function (key, val, quiet, skipCompare) {
                return set(this, key, val, quiet, skipCompare);
            },

            /* @doc Object.watch */
            watch : function (fn, props) {

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
                        props = expandProps([].concat(props));
                    }

                    $b.instanceManager.watch(this, props, fn);
                }

                else {
                    $b.error('InstanceManager does not exist, can\'t watch for property changes.');
                }
            },

            /* @doc Object.unwatch */
            unwatch : function () {

                if ($b.instanceManager) {
                    $b.instanceManager.unwatch(this, flatten(arguments));
                }

                else {
                    $b.error('InstanceManager does not exist, can\'t watch for property changes.');
                }

            },

            /* @doc Object.unwatchAll */
            unwatchAll : function () {

                if ($b.instanceManager) {
                    $b.instanceManager.unwatchAll(this);
                }

                else {
                    $b.error('InstanceManager does not exist, can\'t watch for property changes.');
                }
            },

            /* @doc Object.willNotifyWatchers */
            willNotifyWatchers : function () {

            },

            /* @doc Object.didNotifyWatchers */
            didNotifyWatchers : function () {
                if (this.__meta) {
                    this.__meta.changedProps = [];
                }
            },

            /* @doc Object.destroy */
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