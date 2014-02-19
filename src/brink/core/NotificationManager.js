$b(

    [
    	'../utils/isFunction'
    ],

    function (isFunction) {

        'use strict';

        var _interests,
        	_pendingNotifications,

        	Notification,
        	NotificationManager;

		_pendingNotifications = [];
		_interests = {};


		Notification = function (name, args, callback) {
			this.name = name;
			this.args = args;
			this.data = args && args.length === 1 ? args[0] : null;
			this.callback = callback;
			return this;
		};

		Notification.prototype.data = {};
		Notification.prototype.name = "";
		Notification.prototype.dispatcher = null;
		Notification.prototype.status = 0;
		Notification.prototype.pointer = 0;
		Notification.prototype.callback = null;

		Notification.prototype.hold = function () {
			this.status = 2;
		};

		Notification.prototype.release = function () {
			this.status = 1;
			NotificationManager.releaseNotification(this);
		};

		Notification.prototype.cancel = function () {
			this.data = {};
			this.name = "";
			this.status = 0;
			this.pointer = 0;
			this.dispatcher = null;
			this.callback = null;

			NotificationManager.cancelNotification(this);
		};

		Notification.prototype.dispatch = function (obj) {
			this.status = 1;
			this.pointer = 0;
			this.dispatcher = obj;
			NotificationManager.publishNotification(this);
		};


		Notification.prototype.respond = function () {
			if (this.callback) {
				this.callback.apply(this.dispatcher, arguments);
				this.cancel();
			}
		};


		function _publishNotification(notification) {
			_pendingNotifications.push(notification);
			_notifyObjects(notification);
		}

		function _notifyObjects(notification) {

			var name,
				subs,
				len;

			name = notification.name;

			if (_interests[name]) {

				subs = _interests[name].slice(0);
				len = subs.length;

				while (notification.pointer < len) {
					if (notification.status === 1) {
						subs[notification.pointer].apply(null, [].concat(notification, notification.args));
						notification.pointer ++;
					} else {
						return;
					}
				}

				subs = null;

				/**
				* Notified all subscribers, notification is no longer needed,
				* unless it has a callback to be called later via notification.respond()
				*/
				if (notification.status === 1 && !notification.callback) {
					notification.cancel();
				}
			}
		}

		NotificationManager = {};

		NotificationManager.subscribe = function (name, fn, priority) {

			priority = isNaN(priority) ? -1 : priority;
			_interests[name] = _interests[name] || [];

			if (priority <= -1 || priority >= _interests[name].length) {
				_interests[name].push(fn);
			} else {
				_interests[name].splice(priority, 0, fn);
			}
		};

		NotificationManager.unsubscribe = function (name, fn) {
			var fnIndex = _interests[name].indexOf(fn);
			if (fnIndex > -1) {
				_interests[name].splice(fnIndex, 1);
			}
		};

		NotificationManager.publish = function () {

			var notification,
				args = Array.prototype.slice.call(arguments),
				name = args[0],
				dispatcher = args[args.length - 1],
				callback = args[args.length - 2];

			callback = isFunction(callback) ? callback : null;

			args = args.slice(1, (callback ? args.length - 2 : args.length - 1));

			notification = new Notification(name, args, callback);
			notification.status = 1;
			notification.pointer = 0;
			notification.dispatcher = dispatcher;
			_publishNotification(notification);
		};

		NotificationManager.releaseNotification = function (notification) {
			notification.status = 1;
			if (_pendingNotifications.indexOf(notification) > -1) {
				_notifyObjects(notification);
			}
		};

		NotificationManager.cancelNotification = function (notification) {
			_pendingNotifications.splice(_pendingNotifications.indexOf(notification), 1);
			notification = null;
		};

        return NotificationManager;
    }

).attach('$b.__');