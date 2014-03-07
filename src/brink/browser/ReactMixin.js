$b(

    function () {

        'use strict';

        if (typeof window !== 'undefined' && window.React) {

            var origCreateClass = window.React.createClass;

            React.createClass = function () {

                var Constructor = origCreateClass.apply(this, arguments);

                return function (props, children) {

                    var instance,
                        __props;

                    if (props instanceof $b.Object) {
                        __props = props;
                        props = props.getProperties();
                    }

                    instance = Constructor.call(this, props, children);

                    if (__props) {
                        instance.__props = __props;
                    }

                    return instance;
                };
            };
        }

        return {

            componentWillMount : function () {
                if (this.__props) {
                    this.__props.watch(this.__propsChanged);
                }
            },

            __propsChanged : function () {
                this.setProps(this.__props.getChangedProperties());
            },

            componentWillUnmount : function () {
                if (this.__props) {
                    this.__props.unwatch(this.__propsChanged);
                }
            }
        };
    }

).attach('$b');
