$b(

    [
        '../utils/Q'
    ],

    function (Q) {

        'use strict';

        var _interests,
            _pendingNotifications,

            Notification,
            NotificationManager;

        _pendingNotifications = [];
        _interests = {};

        Notification = function (name, args) {
            this.name = name;
            this.args = args;
            return this;
        };

        Notification.prototype.name = '';
        Notification.prototype.dispatcher = null;
        Notification.prototype.status = 0;
        Notification.prototype.pointer = 0;

        Notification.prototype.cancel = function () {
            this.name = '';
            this.status = 0;
            this.pointer = 0;
            this.dispatcher = null;
            NotificationManager.cancelNotification(this);
        };

        Notification.prototype.dispatch = function (obj) {
            this.status = 1;
            this.pointer = 0;
            this.dispatcher = obj;
            NotificationManager.publishNotification(this);
        };

        function _publishNotification (notification) {
            _pendingNotifications.push(notification);
            return _notifyObjects(notification);
        }

        function _notifyObjects (n) {

            var fn,
                name,
                subs;

            function next () {

                if (n.status === 1 && n.pointer < subs.length) {

                    fn = subs[n.pointer];
                    n.pointer ++;

                    return (
                        Q(fn.apply(null, [].concat(n, n.args)))
                        .then(function (response) {
                            n.response = response;
                            return next();
                        })
                        .catch(function (err) {
                            return Q.reject(err);
                        })
                    );
                }

                else {
                    subs = null;
                    if (n.status === 1) {
                        n.cancel();
                    }

                    return Q(n.response);
                }
            }

            name = n.name;

            if (_interests[name]) {
                subs = _interests[name].slice(0);
                return next();
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
                dispatcher = args[args.length - 1];

            args = args.slice(1, args.length - 1);

            notification = new Notification(name, args);
            notification.status = 1;
            notification.pointer = 0;
            notification.dispatcher = dispatcher;

            return _publishNotification(notification);
        };

        NotificationManager.cancelNotification = function (notification) {
            _pendingNotifications.splice(_pendingNotifications.indexOf(notification), 1);
            notification = null;
        };

        $b.define('notificationManager', NotificationManager).attach('$b');

        return NotificationManager;
    }

).attach('$b.__');