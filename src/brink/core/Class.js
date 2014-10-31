$b(

    [
    	'../config',
    	'./Object',
    	'./NotificationManager',
    	'../utils/bindFunction',
    	'../utils/clone'
    ],

    function (config, Obj, NotificationManager, bindFunction, clone) {

        'use strict';

        var Class,
        	superfy,
        	doesCallSuper;

		function superfy (fn, superFn) {

			return function () {

				var r, tmp = this._super || null;

				// Reference the prototypes method, as super temporarily
				this._super = superFn;

				r = fn.apply(this, arguments);

				// Reset _super
				this._super = tmp;
				return r;
			};
		};

		/*
		If Function.toString() works as expected, return a regex that checks for `this._super`
		otherwise return a regex that passes everything.
		*/

		doesCallSuper = (/xyz/).test(function () {
			var xyz;
			xyz = true;
		}) ? (/\bthis\._super\b/) : (/.*/);

		Class = Obj({

			__init : superfy(function () {

				var i,
					p,
					meta;

                this._super.apply(this, arguments);

                meta = this.__meta;

                /*
                    Auto-binding methods is very expensive as we have to do
                    it every time an instance is created. It roughly doubles
                    the time it takes to instantiate

                    Still, it's not really an issue unless you are creating thousands
                    of instances at once. Creating 10,000 instances with auto-bound
                    methods should still take < 500ms.

                    We auto-bind on $b.Class and not on $b.Object because it's
                    far more likely you'd be creating a lot of Object instances at once
                    and shouldn't need the overhead of this.
                */
                if (config.AUTO_BIND_METHODS || 1) {
                    for (i = 0; i < meta.methods.length; i ++) {
                        p = meta.methods[i];
                    	if (!~p.indexOf('__')) {
	                        this[p] = bindFunction(this[p], this);
	                    }
	                }
                }

                return this;

			}, Obj.prototype.__init),

			subscribe : function (name, handler, priority) {

				this._interestHandlers = this._interestHandlers || {};

				if (handler && !this._interestHandlers[name]) {
					handler = handler;
					NotificationManager.subscribe(name, handler, priority);
					this._interestHandlers[name] = handler;
				}
			},

			unsubscribe : function (name) {

				if (this._interestHandlers && this._interestHandlers[name]) {
					NotificationManager.unsubscribe(name, this._interestHandlers[name]);
					delete this._interestHandlers[name];
				}
			},

			unsubscribeAll : function () {

				var interest;

				for (interest in this._interestHandlers) {
					if (this._interestHandlers.hasOwnProperty(interest)) {
						this.unsubscribe(interest);
					}
				}

				this._interestHandlers = [];
			},

			publish : function (/*name, arg1, arg2, arg3..., callback*/) {
				var args = Array.prototype.slice.call(arguments);
				NotificationManager.publish.apply(NotificationManager, [].concat(args, this));
			},

			setTimeout : function (func, delay) {
				return setTimeout(func.bind(this), delay);
			},

			setInterval : function (func, delay) {
				return setInterval(func.bind(this), delay);
			},

			destroy : superfy(function () {
				this.unsubscribeAll();
				return this._super.apply(this, arguments);
			}, Obj.prototype.destroy)
		});

		Class.buildPrototype = function (props) {

			var p,
				props,
				proto;

			proto = Obj.buildPrototype.call(this, props);

			for (p in props) {

				if (
					typeof props[p] === 'function' &&
					typeof this.prototype[p] === 'function' &&
					doesCallSuper.test(props[p])
				) {
					// this._super() magic, as-needed
					proto[p] = superfy(props[p], this.prototype[p]);
				}


				else if (
					typeof props[p] === 'object' && (
						p === 'concatProps' ||
						~(props.concatProps || []).indexOf(p) ||
						~(this.prototype.concatProps || []).indexOf(p)
					)
				) {
					proto[p] = merge(this.prototype[p], props[p]);
				}
			}

			return proto;
		};

        return Class;
    }

).attach('$b');