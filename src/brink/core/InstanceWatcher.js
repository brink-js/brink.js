$b(

    [
        '../config',
        './CoreObject',
        './Array',
        './RunLoop',
        '../utils/intersect'
    ],

    function (config, CoreObject, BrinkArray, RunLoop, intersect) {

        'use strict';

        return CoreObject.extend({

            instanceManager : null,

            init : function (instanceManager) {

                var self;

                self = this;

                this.instanceManager = instanceManager;

                this.runLoop = RunLoop.create();
                this.runLoop.loop(function () {
                    self.run();
                });

                return this;
            },

            processBindings : function (obj, props, meta, prefix, recursionLimit) {

                var i,
                    j,
                    l,
                    p,
                    p2,
                    arr,
                    key,
                    tmp,
                    changed,
                    bindings,
                    memoized,
                    prefixReset,
                    memoizedBindings;

                bindings = meta.bindings;
                memoizedBindings = meta.memoizedBindings = meta.memoizedBindings || {};

                prefix = prefix ? prefix.concat('.') : '';
                changed = [];
                recursionLimit = recursionLimit || 20;

                for (i = 0, l = prefixReset = props.length; i < l; i ++) {

                    if (prefix && i < prefixReset) {
                        p = prefix.concat(props[i]);
                        props[i] = p;
                    }

                    else {
                        p = props[i];
                    }

                    memoized = memoizedBindings[p];

                    if (memoized == null) {
                        memoized = [];

                        if (bindings[p]) {
                            memoized = bindings[p].concat();
                        }

                        if (bindings[p + '.']) {
                            Array.prototype.push.apply(memoized, bindings[p + '.']);
                        }

                        tmp = p.split('.');

                        if (tmp.length > 1) {
                            key = '.'.concat(tmp.pop());
                            p2 = tmp.join('.');
                            arr = bindings[p2];

                            if (arr && (j = arr.length)) {
                                while (j--) {
                                    memoized.push(arr[j].concat(key));
                                }
                            }
                        }
                        memoizedBindings[p] = memoized;
                    }

                    if (recursionLimit) {
                        j = memoized.length;
                        while (j--) {
                            tmp = memoized[j];
                            if (props.indexOf(tmp) === -1) {
                                props[l++] = tmp;
                            }
                        }
                        recursionLimit--;
                    }
                }
                return props;
            },

            run : function () {

                var i,
                    k,
                    fn,
                    iid,
                    key,
                    meta,
                    meta2,
                    looped,
                    watched,
                    changed,
                    chProps,
                    manager,
                    instance,
                    instances,
                    reference,
                    references,
                    chInstances,
                    intersected,
                    referenceKeys;

                manager = this.instanceManager;
                instances = manager.instances;
                chProps = manager.changedProps;
                chInstances = manager.changedInstances;

                k = 0;

                while (chInstances.length) {
                    iid = chInstances[k];
                    instance = instances[iid];
                    looped = [];

                    if (!instance) {
                        chProps.splice(k, 1);
                        chInstances.splice(k, 1);
                        continue;
                    }

                    meta = instance.__meta;
                    references = meta.references;
                    referenceKeys = meta.referenceKeys;
                    changed = chProps[k];
                    this.processBindings(instance, changed, meta);

                    // Loop through all references and notify them too...
                    if (changed.length && references.length) {

                        i = meta.references.length;

                        while (i --) {

                            reference = references[i];

                            if (looped.indexOf(reference) > -1) {
                                continue;
                            }
                            looped.push(reference);

                            key = referenceKeys[i];
                            meta2 = reference.__meta;

                            /* TODO : Move this.... */
                            if (reference.isDestroyed) {
                                instance.__removeReference(reference);
                                continue;
                            }
                            watched = this.processBindings(reference, changed.concat(), meta2, key);
                            manager.propertiesDidChange(reference, watched, instance);

                            if (reference instanceof BrinkArray) {
                                reference.itemDidChange(instance, changed.concat());
                            }
                        }
                    }

                    i = meta.watchers.fns.length;
                    instance.willNotifyWatchers.call(instance);

                    while (i--) {
                        fn = meta.watchers.fns[i];
                        watched = meta.watchers.props[i];
                        intersected = watched.length ? intersect(watched, changed) : changed.concat();

                        if (!intersected.length) {
                            continue;
                        }
                        fn.call(null, intersected);
                    }
                    instance.didNotifyWatchers.call(instance);
                    chProps.splice(k, 1);
                    chInstances.splice(k, 1);
                }

                manager.changedProps = [];
                manager.changedInstances = [];

                this.stop();
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
