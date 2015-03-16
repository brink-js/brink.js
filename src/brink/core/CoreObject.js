$b(

    [
        '../utils/extend'
    ],

    function (extend) {

        'use strict';

        var CoreObject;

        /***********************************************************************

        `Brink.CoreObject` is not meant to be used directly.
        Instead, use {{#crossLink "Brink.Object"}}{{/crossLink}} or {{#crossLink "Brink.Class"}}{{/crossLink}}.

        @class Brink.CoreObject
        @constructor
        ************************************************************************/
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

            function BrinkObject (callInit) {

                var fn;

                if (callInit === true || callInit === false) {

                    if (callInit) {
                        fn = this.__init || this.init || this.constructor;
                        fn.call(this);
                    }

                    return this;
                }

                return BrinkObject.extend.apply(BrinkObject, arguments);
            }

            BrinkObject.prototype = proto;
            extend(BrinkObject, this, proto.statics || {});

            BrinkObject.prototype.constructor = BrinkObject;

            return BrinkObject;
        };

        CoreObject.buildPrototype = function (props) {
            var BrinkPrototype = function () {};
            BrinkPrototype.prototype = this.prototype;
            return extend(new BrinkPrototype(), props);
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

        CoreObject.create = function () {

            var init,
                instance;

            instance = new this(false);

            init = instance.__init || instance.init;

            if (init) {
                instance = init.apply(instance, arguments) || instance;
            }

            return instance;
        };

        return CoreObject;
    }

).attach('$b');
