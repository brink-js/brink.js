$b(

    [
    	'./Object'
    ],

    function (Obj) {

		return Obj.extend({

            keys : null,
            values : null,

            // Not inherited
            flatten : null,
            merge : null,

            init : function () {

                var a,
                    keys,
                    vals;

                this.keys = [];
                this.values = [];

                for (i = 0; i < arguments.length; i ++) {
                    this.add.apply(this, [].concat(arguments[i]));
                }

                this.__cache = this.keys.concat();
                this.__valuesCache = this.values.concat();

                this.addedItems = [];
                this.removedItems = [];

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

            add : function () {

                var i,
                    args;

                args = [].concat(arguments);

                if (args.length === 2 && !Array.isArray(args[0])) {
                    args = [args[0], args[1]];
                }

                for (i = 0; i < args.length; i ++) {
                    this.keys.push(args[0]);
                    this.values[this.keys.length - 1] = args[1];
                }

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

            indexOf : function () {
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