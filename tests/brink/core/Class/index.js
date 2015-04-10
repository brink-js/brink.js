describe('Brink.Class', function () {

    before(function () {

        $b.define('TestClass', $b.Class({

            x : 1,
            y : 2,
            z : 3,

            init : function () {

            }

        }));

    });

    require('./construction');
    require('./destruction');
    require('./publish-subscribe');

    after(function () {

        $b.undefine('TestClass');

    });
});

