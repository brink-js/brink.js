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

            /***********************************************************************

            `Brink.Object` is the primary base Class. Most of your Objects will
            extend this Class, unless you need the added functionality of Brink.Class.

            @class Brink.Object
            @extends Brink.CoreObject
            @constructor
            ************************************************************************/
            __init : function (o) {

                var i,
                    p,
                    meta;

                if (!this.__meta) {
                    this.__parsePrototype.call(this);
                    meta = this.__meta;
                }

                else {
                    meta = this.__buildMeta();
                }

                meta.references = [];
                meta.referenceKeys = [];

                if (o && typeof o === 'object' && !Array.isArray(o)) {

                    o = clone(o);

                    this.__appendToMeta(o, meta);
                }

                for (p in meta.properties) {
                    this.__defineProperty.call(this, p, meta.properties[p]);
                }

                /*
                    Auto-binding methods is very expensive as we have to do
                    it every time an instance is created. It roughly doubles
                    the time it takes to instantiate

                    Still, it's not really an issue unless you are creating thousands
                    of instances at once. Creating 10,000 instances with auto-bound
                    methods should still take < 500ms.

                    We auto-bind by default on $b.Class and not on $b.Object because it's
                    far more likely you'd be creating a lot of Object instances at once
                    and shouldn't need the overhead of this.
                */
                if (this.__autoBindMethods) {
                    for (i = 0; i < meta.methods.length; i ++) {
                        p = meta.methods[i];
                        if (!~p.indexOf('__')) {
                            this[p] = bindFunction(this[p], this);
                        }
                    }
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

            init : function () {

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
                this.__appendToMeta(this, this.__buildMeta(), true);
            },

            __appendToMeta : function (o, meta, isThis) {

                var p,
                    v;

                for (p in o) {

                    v = o[p];

                    if (isFunction(v)) {
                        if (p !== 'constructor' && !~meta.methods.indexOf(p)) {
                            meta.methods.push(p);
                            if (!isThis) {
                                this[p] = o[p];
                            }
                        }
                    }

                    else if (o.hasOwnProperty(p)) {

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
            },

            __undefineProperties : function () {

                var b,
                    p,
                    i,
                    meta,
                    bindings;

                meta = this.__meta;
                bindings = meta.externalBindings;

                // Cleanup external bindings
                for (p in bindings) {

                    for (i = 0; i < bindings[p].length; i ++) {
                        b = bindings[p][i];
                        if (!b.obj.isDestroyed) {
                            b.obj.unwatch(b.localProp.didChange);
                        }
                    }
                }

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

            __hasReference : function (obj) {
                var meta = this.__meta;
                return !!~meta.references.indexOf(obj);
            },

            __addReference : function (obj, key) {
                var meta = this.__meta;
                meta.references.push(obj);
                meta.referenceKeys.push(key);
            },

            __removeReference : function (obj) {

                var idx,
                    meta;

                meta = this.__meta;
                idx = meta.references.indexOf(obj);

                if (~idx) {
                    meta.references.splice(idx, 1);
                    meta.referenceKeys.splice(idx, 1);
                }
            },

            /***********************************************************************
            Invalidate one or more properties. This will trigger any bound and computed properties
            depending on these properties to also get updated.

            This will also trigger any watchers of this property in the next Run Loop.

            @method propertyDidChange
            @param  {Array|String} props A single property or an array of properties.
            ************************************************************************/
            propertyDidChange : function (prop) {
                $b.instanceManager.propertyDidChange(this, prop);
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

                if (arguments.length) {

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
                return this.getProperties($b.instanceManager.getChangedProps(this));
            },

            /***********************************************************************
            Get or create a property descriptor.

            @method prop
            @param {String} key Poperty name.
            @param [val] Default value to use for the property.
            @return {PropertyDescriptor}
            ************************************************************************/
            prop : function (key, val) {

                var a,
                    i,
                    p,
                    obj,
                    tmp,
                    meta,
                    watched;

                obj = getObjKeyPair(this, key);
                key = obj[1];
                obj = obj[0] || this;

                meta = obj.__meta;

                meta.bindings = meta.bindings || {};
                meta.externalBindings = meta.externalBindings || {};
                meta.memoizedBindings = meta.memoizedBindings || {};

                if (typeof meta.properties[key] !== 'undefined') {
                    if (typeof val === 'undefined') {
                        return meta.properties[key];
                    }
                }

                if (!val || !val.__isComputed) {

                    val = {
                        get : true,
                        set : true,
                        value : val
                    };
                }

                val = meta.properties[key] = defineProperty(obj, key, val);
                val.key = key;

                watched = val.watch;

                if (watched && (i = watched.length)) {
                    tmp = [];
                    while (i--) {
                        a = watched[i].split('.');
                        p = null;
                        while (a.length) {
                            p = (p ? p.concat('.') : '').concat(a.splice(0, 1)[0]);
                            tmp.push(p);
                        }
                    }

                    i = tmp.length;

                    if (i) {
                        meta.memoizedBindings = {};
                    }

                    while (i--) {
                        a = meta.bindings[tmp[i]] = meta.bindings[tmp[i]] || [];
                        if (!~a.indexOf(key)) {
                            a.push(key);
                        }
                    }
                }

                val.bindTo = function (o, p) {
                    this.prop(p, bindTo(o, p));
                }.bind(obj);

                val.didChange = function () {
                    obj.propertyDidChange(key);
                }.bind(obj);

                if (val.boundTo) {
                    a = meta.externalBindings[key] = meta.externalBindings[key] || [];
                    a.push({
                        obj : val.boundTo[0],
                        key : val.boundTo[1],
                        localProp : val
                    });
                    val.boundTo[0].watch(val.boundTo[1], val.didChange);
                }

                if (meta.isInitialized) {
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
                this.isDestroyed = true;
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