"use strict";

var Class = require("../core/Class");

module.exports = Class.extend({

	validateOnSet : false,

	/*
	computed : this.watch("property", function () {

	}),
	*/

	__someProp : function (key, val) {

	},

	get_someProp : function (key) {

	},

	set_someProp : function (key, val) {
		this[key] = val;
	}

});

