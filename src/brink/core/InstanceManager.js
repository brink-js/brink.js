$b(

    [
        '../config',
        './CoreObject',
        './InstanceWatcher',
        '../utils/get',
        '../utils/merge',
        '../utils/flatten'
    ],

    function (config, CoreObject, InstanceWatcher, get, merge, flatten) {

        'use strict';

        var InstanceManager,
            IID = 1;

        if (typeof window !== 'undefined') {
            window.count = 0;
        }

        InstanceManager = CoreObject.extend({

            instances : null,
            changedProps : null,
            changedInstances : null,

            init : function () {

                this.instances = {};
                this.changedProps = [];
                this.changedInstances = [];

                this.watcher = InstanceWatcher.create(this);
            },

            buildMeta : function (meta) {

                meta = meta || {};
                meta.iid = IID ++;

                return meta;
            },

            add : function (instance, meta) {
                meta = this.buildMeta(meta);
                this.instances[meta.iid] = instance;
                return meta;
            },

            remove : function (instance) {
                this.instances[instance.__meta.iid] = null;
            },

            getChangedProps : function (obj) {

                var idx,
                    meta;

                meta = obj.__meta;

                idx = this.changedInstances.indexOf(meta.iid);
                if (!~idx) {
                    return [];
                }

                else {
                    return this.changedProps[idx];
                }
            },

            propertyDidChange : function (obj, p) {

                var i,
                    idx,
                    meta,
                    changed,
                    chProps,
                    chInstances;

                meta = obj.__meta;

                chInstances = this.changedInstances;
                chProps = this.changedProps;

                idx = chInstances.indexOf(meta.iid);
                if (idx === -1) {
                    chInstances.push(meta.iid);
                    changed = [];
                    chProps.push(changed);
                }

                else {
                    changed = chProps[idx];
                }

                i = changed.length;
                if (changed.indexOf(p) === -1) {
                    changed[i] = p;
                }

                this.watcher.start();
                return changed;
            },

            propertiesDidChange : function (obj, props) {

                var i,
                    j,
                    p,
                    idx,
                    meta,
                    changed,
                    chProps,
                    chInstances;

                meta = obj.__meta;

                chInstances = this.changedInstances;
                chProps = this.changedProps;

                idx = chInstances.indexOf(meta.iid);
                if (idx === -1) {
                    chInstances.push(meta.iid);
                    changed = [];
                    chProps.push(changed);
                }

                else {
                    changed = chProps[idx];
                }

                i = props.length;
                j = changed.length;
                while (i--) {
                    p = props[i];
                    if (changed.indexOf(p) === -1) {
                        changed[j++] = p;
                    }
                }

                this.watcher.start();
                return changed;
            },

            watch : function (obj, props, fn) {

                var idx,
                    meta;

                meta = obj.__meta;

                idx = meta.watchers.fns.indexOf(fn);

                if (idx === -1) {
                    meta.watchers.fns.push(fn);
                    idx = meta.watchers.fns.length - 1;
                }

                meta.watchers.props[idx] = merge(meta.watchers.props[idx] || [], props);
                meta.watchedProps = flatten(meta.watchers.props);
            },

            unwatch : function (obj, fns) {

                var i,
                    fn,
                    idx,
                    meta;

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

        });

        $b.define('instanceManager', InstanceManager.create({})).attach('$b');

        return $b('instanceManager');
    }
);