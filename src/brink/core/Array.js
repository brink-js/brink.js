$b(

    [
    	'./Object',
    	'../utils/flatten',
    	'../utils/merge'
    ],

    function (Obj, flatten, merge) {

    	var Arr,
    		AP,
    		METHODS;

    	AP = Array.prototype;

    	(function () {

    		var p;

    		function alias (p) {

    			return function (r, l) {
    				r = AP[p].apply(this.content, arguments);
    				this.length = this.content.length;
    				return r;
    			}
    		}

    		for (p in AP) {
    			if (AP.hasOwnProperty(p) && typeof AP[p] === 'function') {
    				METHODS[p] = alias(p);
    			}
    		}

    	})();

		Arr = Obj.extend(merge(METHODS, {

			content : null,
			addedItems : null,
			removedItems : null,

			__notifyPropertyListeners : function () {
				Obj.prototype.__notifyPropertyListeners.apply(this, arguments);

				Obj.watchLoop.once(function () {
					this.addedItems = [];
					this.removedItems = [];
				}.bind(this));
			},

			init : function (a) {
				this.content = a;
				this.__meta.cache = this.content.concat();
				this.__meta.addedItems = [];
				this.__meta.removedItems = [];
				this.length = this.content.length;
			},

			get : function (i) {

				if (isNaN(i)) {
					return Obj.prototype.get.apply(this, arguments);
				}

				return this.content[i];
			},

			set : function (i, val) {

				if (isNaN(i)) {
					return Obj.prototype.set.apply(this, arguments);
				}

				this.replaceAt(i, val);
				return val;
			},

			concat : function () {
				var r = AP.filter.apply(this.content, arguments);
				return this.prototype.constructor.create(r);
			},

			filter : function () {
				var r = AP.filter.apply(this.content, arguments);
				return this.prototype.constructor.create(r);
			},

			flatten : function () {
				flatten(this.content);
				this.contentDidChange(null, 'reorder');
			},

			merge : function (o) {
				merge(this.content, o);
				this.contentDidChange(null, 'reorder');
			},

			insert : function () {
				return this.push.apply(this, arguments);
			},

			insertAt : function (i, o) {
				this.splice(i, 0, o);
				return this.length;
			},

			push : function () {

				var i;

				for (i = 0; i < arguments.length; i ++) {
					this.insertAt(this.length, arguments[i]);
				}

				return this.length;
			},

			pop : function (i) {
				i = this.length - 1;
				return this.removeAt(i);
			},

			remove : function (o, i) {

				i = this.content.indexOf(o);

				if (~i) {
					return this.removeAt(i);
				}

				return false;
			},

			removeAt : function (i, r) {
				r = AP.splice.call(this.content, i, 1);
				this.contentDidChange(i, 'removed');
				return r[0];
			},

			replace : function (a, b, i) {

				i = this.content.indexOf(a);

				if (~i) {
					return this.replaceAt(i, b);
				}
			},

			replaceAt : function (i, o) {
				this.removeAt(i);
				return this.insertAt(i, o);
			},

			splice : function (i, l) {

				var rest,
					removed;

				removed = [];
				rest = AP.splice.call(arguments, 2, arguments.length);

				if (l > 0) {

					j = i;
					l = i + l;

					while (j < l) {
						removed.push(this.removeAt(i));

						j ++;
					}
				}

				for (j = 0; j < rest.length; j ++) {
					this.content.splice(i + j, 0, rest[j]);
					this.contentDidChange(i + j, 'added');
				}

				return removed;
			},

			shift : function () {
				return this.removeAt(0);
			},

			unshift : function () {
				for (i = 0; i < arguments.length; i ++) {
					this.insertAt(0, this.arguments[i]);
				}

				return this.length;
			},

			reverse : function () {
				r = AP.reverse.apply(this.content, arguments)
				this.contentDidChange(null, 'reorder');
				return this;
			},

			sort : function () {
				r = AP.sort.apply(this.content, arguments)
				this.contentDidChange(null, 'reorder');
				return this;
			},

            __resetChangedProps : function () {

            	var meta = this.__meta;

                if (meta) {
                    meta.changedProps = [];
                    meta.addedItems = [];
                    meta.removedItems = [];
                }
            },

            getChanges : function () {

            	var o,
            		meta;

            	o = {};
            	meta = this.__meta;

            	if (meta) {
            		o = {
            			added : meta.addedItems,
            			removed : meta.removedItems
            		};
            	}

            	return o;
            },

			contentDidChange : function (i, action) {

				var meta = this.__meta;

				if (action === 'reorder' || meta.invalid === true) {
					merge(meta.addedItems, this.content.concat());
					merge(meta.removedItems, meta.cache.concat());
					this.__invalid = true;
				}

				else if (action === 'added') {
					meta.addedItems.push(this.content[i]);
				}

				else if (action === 'removed') {
					meta.removedItems.push(meta.cache[i]);
				}

				this.propertyDidChange('@each');

				this.length = this.content.length;
				meta.cache = this.content.concat();
			}

		}));


		return Arr;
	}

).attach('$b');