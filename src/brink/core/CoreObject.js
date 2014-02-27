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

		CoreObject.extend = function (props) {

			var C,
				i,
				proto;

			if (arguments.length > 1) {

				i = 0;
				C = this;

				while (i < arguments.length - 1) {
					C = C.extend(arguments[i]);
					i ++;
				}

				return C;
			}

			proto = this.buildPrototype.call(this, props);

			function Obj (callInit) {

				var fn;

				if (callInit === true || callInit === false) {

					if (callInit) {
						fn = this.__init || this.init || this.constructor;
						fn.apply(this, arguments);
					}

					return this;
				}

				return Obj.extend.apply(Obj, arguments);
			}

			Obj.prototype = proto;
			extend(Obj, this, proto.statics || {});

			Obj.prototype.constructor = Obj;

			return Obj;
		};

		CoreObject.buildPrototype = function (props) {
			var F = function () {};
			F.prototype = this.prototype;
			return extend(new F(), props);
		};

		CoreObject.inject = function (p, v) {

			if (typeof p === 'object') {
				extend(this.prototype, p);
			}

			else {
				this.prototype[p] = v;
			}

			return this;
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
				return init.apply(instance, args) || instance;
			}

			return instance;
		};

        return CoreObject;
    }

).attach('$b');
