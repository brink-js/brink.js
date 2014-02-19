$b(

    [
        './RunLoop',
        './CoreObject'
    ],

    function (RunLoop, CoreObject) {

        'use strict';

        RunLoop = RunLoop.create();

        var DirtyChecker = CoreObject.extend({

            init : function () {
                RunLoop.loop(this.run.bind(this));
                return this;
            },

            addInstance : function (obj) {

                var p,
                    cache;

                INSTANCES[obj.__iid] = obj;
                cache = CACHED[obj.__iid] = CACHED[obj.__iid] || {};

                for (p in obj.__properties) {
                    cache[p] = obj[p];
                }
            },

            removeInstance : function (obj) {
                delete INSTANCES[obj.__iid];
                delete CACHED[obj.__iid];
            },

            updateCache : function (obj, prop) {
                CACHED[obj.__iid][prop] = obj[prop];
            },

            run : function () {

                var i,
                    j,
                    p,
                    obj,
                    cache;

                for (i in INSTANCES) {

                    obj = INSTANCES[i];
                    cache = CACHED[i];

                    for (j = 0; j < obj.__allWatchedProps.length; j ++) {

                        p = obj.__allWatchedProps[j];
                        if (cache[p] !== obj[p]) {
                            obj.set(p, obj[p], false, true);
                        }
                    }
                }
            },

            start : function () {
                RunLoop.start();
            }

        });

        return DirtyChecker.create();
    }

).attach('$b.__');
