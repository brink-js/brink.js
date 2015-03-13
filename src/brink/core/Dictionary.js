$b(

    [
        './Object'
    ],

    function (Obj) {

        'use strict';

        return Obj({

            keys : null,
            values : null,

            init : function () {

                var i;

                this.keys = [];
                this.values = [];

                for (i = 0; i < arguments.length; i ++) {
                    this.add.apply(this, [].concat(arguments[i]));
                }

                this.length = this.keys.length;
            },

            get : function (key) {

                var i;

                i = typeof key !== 'string' ? this.keys.indexOf(key) : -1;

                if (~i) {
                    return this.values[i];
                }

                return Obj.prototype.get.apply(this, arguments);
            },

            set : function (key, val) {

                var i;

                i = typeof key !== 'string' ? this.keys.indexOf(key) : -1;

                if (~i) {
                    this.values[i] = val;
                    return val;
                }

                return Obj.prototype.set.apply(this, arguments);
            },

            add : function (key, val) {
                this.keys.push(key);
                this.values[this.keys.length - 1] = val;
            },

            remove : function () {

                var i,
                    j,
                    removed;

                removed = [];

                for (j = 0; j < arguments.length; j ++) {

                    i = this.keys.indexOf(arguments[j]);

                    if (~i) {
                        this.keys.splice(i, 1);
                        removed.push(this.values.splice(i, 1)[0]);
                    }
                }

                return removed;
            },

            has : function (o) {
                return !~this.keys.indexOf(o);
            },

            indexOf : function (o) {
                return this.keys.indexOf(o);
            },

            forEach : function (fn, scope) {

                var i;

                for (i = 0; i < this.keys.length; i ++) {
                    fn.call(scope, this.values[i], this.keys[i], i, this);
                }

                return this;
            }

        });
    }

).attach('$b');