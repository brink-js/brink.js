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

            run : function () {

                if ($b.instanceManager) {

                    this.run = function () {

                        $b.instanceManager.forEach(function (meta, instance) {

                            var i,
                                p;

                           for (i = 0; i < meta.allWatchedProps.length; i ++) {

                                p = meta.allWatchedProps[i];

                                if (meta.cache[p] !== instance[p]) {
                                    instance.set(p, instance[p], false, true);
                                }

                           }

                        });
                    }

                    this.run();
                }
            },

            start : function () {
                RunLoop.start();
            }

        });

        return DirtyChecker.create();
    }

).attach('$b.__');
