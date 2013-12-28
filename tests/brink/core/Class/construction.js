describe("construction", function () {

	it("should run the init method", function (done) {

		var TestClass = SubClass.extend({

			init : function () {
				this.initialized = true;
			}
		});

		var testInstance = new TestClass();

		expect(testInstance.initialized).to.be.ok;

		done();

	});
	
	it("should run the `__init__` method before `init`", function (done) {

		var TestClass = SubClass.extend({

			__init__ : function () {
				this.y = 5;
				this._super();
			},

			init : function () {
				expect(this.y).to.equal(5);
				done();
			}
		});

		new TestClass();

	});

});
