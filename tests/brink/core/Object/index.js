describe('Brink.Object', function () {

    before(function () {

        $b.define('TestObj', $b.Object({

            x : 1,
            y : 2,
            z : 3,

            init : function () {

            }

        }));

    });

    require('./construction');
    require('./destruction');
    require('./bindings');
    require('./watchers');
    require('./computed');

    after(function () {

        $b.undefine('TestObject');

    });
});

