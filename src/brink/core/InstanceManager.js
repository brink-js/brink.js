$b(

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