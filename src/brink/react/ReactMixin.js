$b(

    function () {

        'use strict';

        return {

            __propsChanged : function () {
                this.setProps(this.__props.getChangedProperties());
            },

            componentWillMount : function () {
                this.__props = this.props;
                this.props = this.__props.serialize();
                this.__props.watch(this.__propsChanged);
            },

            componentWillUnmount : function () {
                this.__props.unwatch(this.__propsChanged);
            }
        };
    }

).attach('$b');
