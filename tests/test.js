var Brink = require("../brink");


var Class1 = Brink.Class.extend({

	init : function () {
		this.subscribe("test", this.handleTestNotification);
	},

	watcher : function () {
		console.log("watcher!", this.get("testProp"));
		return "fdfdsafsdf";
	}.watches("testProp"),

	handleTestNotification : function (n) {
		this.set("testProp", "wooohooo");
	}

});

var Class2 = Brink.Class.extend({
	init : function () {

		this.class1 = new Class1();

		this.class1.watch("testProp", function (key, val) {
			console.log(key, val);
		});

		this.class1.on("change:watcher", function (key, val) {
			console.log(key);
		});

		this.setTimeout(function () {
			this.publish("test", "fdfsadf");
		}, 0);
	}
});


var b = new Class2();