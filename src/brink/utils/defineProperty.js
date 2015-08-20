$b(

    [
        './isBrinkInstance'
    ],

    /***********************************************************************
    @class Brink
    ************************************************************************/
    function (isBrinkInstance) {

        'use strict';

        /***********************************************************************
        Used by `Brink.Object.prototype.prop()` for property descriptors.

        @method defineProperty
        @private
        ************************************************************************/
        return function (obj, prop, descriptor) {

            var d;

            d = descriptor;

            if (d.__meta && (d.__meta.isAttribute || d.__meta.isRelationship)) {
                d = d.clone();
            }

            $b.assert('Object must be an instance of Brink.Object or Brink.Class', isBrinkInstance(obj));

            d.configurable = true;
            d.enumerable = descriptor.enumerable !== 'undefined' ? descriptor.enumerable : true;

            if (prop.indexOf('__') === 0) {
                d.configurable = false;
                d.enumerable = false;
            }

            d.get = obj.__defineGetter(prop, descriptor.get || obj.__writeOnly(prop));
            d.set = obj.__defineSetter(prop, descriptor.set || obj.__readOnly(prop));

            d.defaultValue = (
                typeof descriptor.defaultValue !== 'undefined' ?
                    descriptor.defaultValue : descriptor.value
            );

            delete d.value;
            delete d.writable;

            return d;
        };
    }

).attach('$b');
