"use strict";

var NotificationManager = require("./NotificationManager"),
	AbstractClass;

AbstractClass = require("./AbstractClass");


module.exports = AbstractClass.extend({

	__init__ : function () {

		var i,
			p,
			f,
			c,
			r;

		for (p in this) {

			f = this[p];

			if (typeof f === "function") {
				if (f.__watches__ && f.__watches__.length) {

					c = this.proxy(function (p, f, a) {
						a = function (key, val) {
							r = f();
							this.trigger("change:" + p, p, val);
						}
						return a;
					}(p, f));

					f.__watcherFunction__ = c;
					this.watch.apply(this, f.__watches__.concat(c));
				}
			}
		}

		this.init();
	},

	init : function () {},

	/**
	* Subscribes to a notification.
	*/
	subscribe : function (name, handler, priority) {
		this._interestHandlers = this._interestHandlers || {};

		if (handler && !this._interestHandlers[name]) {
			handler = handler;
			NotificationManager.subscribe(name, handler, priority);
			this._interestHandlers[name] = handler;
		}
	},

	/**
	* Unsubscribes from a notification.
	*/
	unsubscribe : function (name) {
		if (!name) {
			return this.unsubscribeAll();
		}

		if (this._interestHandlers && this._interestHandlers[name]) {
			var handler = this._interestHandlers[name];
			this._interestHandlers[name] = null;
			delete this._interestHandlers[name];
			NotificationManager.unsubscribe(name, handler);
		}
	},

	/**
	* Unsubscribes from all notifications registered via this.subscribe();
	*/
	unsubscribeAll : function () {
		for (var interest in this._interestHandlers) {
			if (this._interestHandlers.hasOwnProperty(interest)) {
				this.unsubscribe(interest);
			}
		}
		this._interestHandlers = [];
	},

	/**
	* Publishes a notification with the specified data.
	*/
	publish : function (/*name, arg1, arg2, arg3..., callback*/) {
		var args = Array.prototype.slice.call(arguments);
		NotificationManager.publish.apply(NotificationManager, [].concat(args, this));
	},

	/**
	* Shorthand for func.bind(this)
	*/
	proxy : function (fn) {
		return fn ? fn.bind(this) : fn;
	},

	/**
	* Middleware setTimeout method. Allows for scope retention inside timers.
	*/
	setTimeout : function (func, delay) {
		return setTimeout(this.proxy(func), delay);
	},

	/**
	* Middleware setInterval method. Allows for scope retention inside timers.
	*/
	setInterval : function (func, delay) {
		return setInterval(this.proxy(func), delay);
	},

	set : function (key, val) {

		var i,
			old;

		if (typeof key === "string") {

			old = this[key];

			if (old !== val) {

				if (this["set_" + key]) {
					this["set_" + key](val);
					if (old === this[key]) {
						return val;
					}
				}

				else {
					this[key] = val;
				}

				this.trigger("change:" + key, key, val);
			}

			return val;
		}

		else {
			for (i in key) {
				this.set(i, key[i], val);
			}
		}
	},

	get : function (key) {

		var i,
			output;

		if (this["get_" + key]) {
			return this["get_" + key]();
		}

		return this[key];
	},

	/**
	* Add pseudo event listener
	*/
	on : function (name, fn) {
		var listeners = this["__watchers__" + name] = (this["__watchers__" + name] || []);
		listeners.push(fn);
	},

	watch : function (i, p, fn) {

		p = [];

		for (i = 0; i < arguments.length; i ++) {

			if (typeof arguments[i] === "function") {
				fn = arguments[i];
				break;
			}

			p.push(arguments[i]);
		}

		for (i = 0; i < p.length; i ++) {

			if (p[i] === "all") {
				this.on("change", fn);
			}

			else {
				this.on("change:" + p[i], fn);
			}
		}

	},

	unwatch : function (fn) {
		fn.__watches__ = false;
	},

	/**
	* Remove pseudo event listener
	*/
	off : function (name, fn) {

		var listeners = this["__watchers__" + name],
			i;

		if (listeners) {

			if (!fn) {
				this["__watchers__" + name] = [];
				return true;
			}

			i = listeners.indexOf(fn);
			while (i > -1) {
				listeners.splice(i, 1);
				i = listeners.indexOf(fn);
			}
		}
	},

	/**
	* Trigger pseudo event
	*/
	trigger : function () {

		var listeners,
			evt,
			i,
			args = Array.prototype.slice.call(arguments),
			name = args.splice(0, 1)[0].split(":");

		while (name.length) {

			evt = name.join(":");
			listeners = this["__watchers__" + evt];

			if (listeners && listeners.length) {

				args = [].concat(args || [], this);

				for (i = 0; i < listeners.length; i ++) {

					if (listeners[i].__watches__ === false) {
						listeners.splice(i, 1);
						i --;
					}

					else {
						listeners[i].apply(null, args);
					}
				}
			}

			name.pop();
		}
	},

	destroy : function () {

		var p;

		for (p in this) {
			if (p.indexOf("__watchers__") >= 0) {
				this.off(p.replace("__watchers__"));
			}
		}

		this.unsubscribe();
	}
});