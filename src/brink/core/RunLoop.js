$b(

    [
        "./CoreObject"
    ],

    function (CoreObject) {

        'use strict';

        return CoreObject.extend({

            __interval : 'raf',
            __timerID : null,
            __started : false,

            init : function (interval) {

                this.clear();

                if (typeof interval !== 'undefined') {
                    this.setInterval.call(this, interval);
                }

                return this;
            },

            setInterval : function (val) {

                val = isNaN(val) ? val.toLowerCase() : val;
                this.__interval = (val === 'raf' || val === 'requestanimationframe') ? 'raf' : val;

                if(this.stopTimer()) {
                    this.start();
                }
            },

            startTimer : function (fn) {

                fn = fn.bind(this);

                if (this.__interval === 'raf') {
                    return requestAnimationFrame(fn);
                }

                return setTimeout(fn, this.__interval);
            },

            stopTimer : function () {

                if (!this.__timerID) {
                    return false;
                }

                if (this.__interval === 'raf') {
                    cancelAnimationFrame(this.__timerID);
                }

                else {
                    clearTimeout(this.__timerID);
                }

                this.__timerID = null;

                return true;
            },

            start : function (restart) {
                this.__started = true;
                if (!this.__timerID || restart) {
                    this.stopTimer();
                    return this.__timerID = this.startTimer(this.run);
                }
            },

            restart : function () {
                this.start(true);
            },

            stop : function () {
                this.__started = false;
                return this.stopTimer();
            },

            defer : function () {
                return this.start();
            },

            deferOnce : function () {
                this.stopTimer();
                return this.__timerID = this.startTimer(function () {
                    this.stopTimer();
                    this.run(false);
                }.bind(this));
            },

            run : function (repeat) {

                var i,
                    fn,
                    args,
                    scope;

                if (!this.__once.length && !this.__loop.length) {
                    return;
                }

                if (repeat !== false) {
                    this.start(true);
                }

                for (i = 0; i < this.__once.length; i ++) {

                    fn = this.__once[i];
                    args = this.__onceArgs[i][0];
                    scope = this.__onceArgs[i][1];

                    fn.call(scope, args);
                }

                for (i = 0; i < this.__loop.length; i ++) {

                    fn = this.__loop[i];
                    args = this.__loopArgs[i][0];
                    scope = this.__loopArgs[i][1];

                    fn.call(scope, args);
                }

                this.__once = [];
                this.__onceArgs = [];
            },

            once : function (fn, args, scope) {

                var idx = this.__once.indexOf(fn);

                if (idx < 0) {

                    this.__once.push(fn);
                    idx = this.__once.length - 1;
                }

                this.__onceArgs[idx] = [args || null, scope || null];

                if (this.__started) {
                    this.start();
                }
            },

            loop : function (fn, args, scope) {

                var idx = this.__loop.indexOf(fn);

                if (idx < 0) {

                    this.__loop.push(fn);
                    idx = this.__loop.length - 1;
                }

                this.__loopArgs[idx] = [args || null, scope || null];

                if (this.__started) {
                    this.start();
                }
            },

            remove : function (fn) {

                var i;

                i = this.__once.indexOf(fn);

                if (i >= 0) {
                    this.__once.splice(i, 1);
                }

                i = this.__loop.indexOf(fn);

                if (i >= 0) {
                    this.__loop.splice(i, 1);
                }
            },

            clear : function () {
                this.__loop = [];
                this.__once = [];

                this.__loopArgs = [];
                this.__onceArgs = [];
            }

        });
    }

).attach('$b.__');