$b(

    [
    	'../utils/extend',
    	'../utils/isBrinkObject'
    ],

    function (extend, isBrinkObject) {

        'use strict';

		var CoreObject,
			Prototype;

		CoreObject = function () {};

		CoreObject.extend = function () {

			var A,
				i,
				o,
				props,
				proto;

			if (arguments.length > 1) {

				i = 0;

				while (i < arguments.length - 1) {
					o = arguments[i];
					A = A || (isBrinkObject(o) ? o : this);
					A = A.extend(arguments[++ i]);
				}

				return A;
			}

			proto = this.buildPrototype.apply(this, arguments);

			function Obj (callInit) {

				var fn;

				if (callInit === true || callInit === false) {

					this.__iid = CoreObject.IID ++;

					if (callInit) {
						fn = this.__init || this.init || this.constructor;
						fn.apply(this, arguments);
					}

					return this;
				}

				return Obj.extend.apply(Obj, arguments);
			}

			Obj.prototype = proto;
			extend(Obj, this, proto.classProps || {});

			Obj.__isObject = true;
			Obj.prototype.constructor = Obj;

			return Obj;
		};

		CoreObject.buildPrototype = function (props) {
			var F = function () {};
			F.prototype = this.prototype;
			return extend(new F(), props);
		};

		CoreObject.reopen = function (o) {
			extend(this.prototype, o);
			return Obj;
		};

		CoreObject.reopenObject = function (o) {
			extend(this, o);
			return Obj;
		};

		CoreObject.create = function (o) {

			var p,
				args,
				init,
				instance;

			args = arguments;

			if (typeof o === 'function') {
				instance = new this(true);
				o.call(instance);
				args = [];
			}

			instance = instance || new this(false);

			init = instance.__init || instance.init;

			if (init) {
				init.apply(instance, args);
			}

			return instance;
		};

		CoreObject.IID = 1;

        return CoreObject;
    }

).attach('$b');
