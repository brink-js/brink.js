$b(

    [
        '../config',
        './CoreObject',
        './RunLoop',
        '../utils/intersect'
    ],

    function (config, CoreObject, RunLoop, intersect) {

        'use strict';

        return CoreObject.extend({

            init : function (instances) {

                this.instances = instances;

                this.runLoop = RunLoop.create();
                this.runLoop.loop(this.run.bind(this));

                this.watchLoop = RunLoop.create();
                this.watchLoop.name = 'watchLoop';

                if (config.DIRTY_CHECK) {
                    this.start();
                }

                return this;
            },

            dirtyCheck : function (meta, instance) {

                var i,
                    p;

                for (i = 0; i < meta.watchedProps.length; i ++) {

                    p = meta.watchedProps[i];

                    if (meta.values[p] !== instance[p]) {
                        instance.set(p, instance[p], false, true);
                    }
                }
            },

            notifyWatchers : function (meta, instance) {

                var i,
                    fn,
                    props,
                    intersected;

                for (i = 0; i < meta.watchers.fns.length; i ++) {

                    fn = meta.watchers.fns[i];
                    props = meta.watchers.props[i];
                    intersected = props.length ? intersect(props, meta.changedProps) : meta.changedProps.concat();

                    if (!intersected.length) {
                        continue;
                    }

                    this.watchLoop.once(fn, intersected);
                }

                this.watchLoop.once(instance.__resetChangedProps);
                this.watchLoop.run();
            },

            run : function () {

                this.instances.forEach(function (meta, instance) {

                    config.DIRTY_CHECK && this.dirtyCheck(meta, instance);
                    meta.changedProps.length && this.notifyWatchers(meta, instance);

                }, this);

                if (!config.DIRTY_CHECK) {
                    this.stop();
                }
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
