describe("$b.Object", function () {

    before (function () {

        $b.define('TestObj', $b.Object({

            x : 1,
            y : 2,
            z : 3,

            init : function () {

            }

        }));

    });

	require("./construction");
	require("./destruction");
	require("./bindings");

    after (function () {

        $b.undefine('TestObject');

    });
});

