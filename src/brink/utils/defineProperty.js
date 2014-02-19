$b.define(

    [
        './assert',
        './isBrinkInstance'
    ],

    function (assert, isBrinkInstance) {

        'use strict';

        return function (obj, prop, descriptor) {

            assert('Object must be an instance of Brink.Object or Brink.Class', isBrinkInstance(obj));

            descriptor.configurable = descriptor.configurable !== 'undefined' ? descriptor.configurable : false;
            descriptor.enumerable = descriptor.enumerable !== 'undefined' ? descriptor.enumerable : true;

            if (prop.indexOf('__') === 0) {
                descriptor.configurable = false;
                descriptor.enumerable = false;
            }

            obj.__defaults[prop] = typeof descriptor.value === 'undefined' ? descriptor.defaultValue : descriptor.value;

            descriptor.get = obj.__defineGetter(prop, descriptor.get || obj.__writeOnly(prop));
            descriptor.set = obj.__defineSetter(prop, descriptor.set || obj.__readOnly(prop));

            delete descriptor.value;
            delete descriptor.writable;

            return descriptor;
        };
    }

).attach('$b');