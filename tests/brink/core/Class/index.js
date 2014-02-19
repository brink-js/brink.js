describe("Brink.Class", function () {

    $b.define('tests/TestClass', $b.Class({

        x : 1,
        y : 2,
        z : 3,

        init : function () {

        }

    }));

	require("./construction");
	require("./destruction");
	require("./publish-subscribe");

});
