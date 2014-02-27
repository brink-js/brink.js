$b(

    [
        './isBrinkInstance'
    ],

    function (isBrinkInstance) {

        'use strict';

        return function (obj, prop, descriptor) {

            $b.assert('Object must be an instance of Brink.Object or Brink.Class', isBrinkInstance(obj));

            descriptor.configurable = true;
            descriptor.enumerable = descriptor.enumerable !== 'undefined' ? descriptor.enumerable : true;

            if (prop.indexOf('__') === 0) {
                descriptor.configurable = false;
                descriptor.enumerable = false;
            }

            descriptor.get = obj.__defineGetter(prop, descriptor.get || obj.__writeOnly(prop));
            descriptor.set = obj.__defineSetter(prop, descriptor.set || obj.__readOnly(prop));

            descriptor.defaultValue = typeof descriptor.defaultValue !== 'undefined' ? descriptor.defaultValue : descriptor.value;

            delete descriptor.value;
            delete descriptor.writable;

            return descriptor;
        };
    }

).attach('$b');