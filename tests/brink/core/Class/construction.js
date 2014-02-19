describe("construction", function () {

	it("should run the init method", function (done) {

		var TestClass = $b('tests/TestClass')({

			init : function () {
				this.initialized = true;
			}
		});

		var testInstance = TestClass().create();

		expect(testInstance.initialized).to.be.ok;

		done();

	});

	it("should run the `__init` method before `init`", function (done) {

		var TestClass = $b('tests/TestClass')({

			__init : function () {
				this.y = 5;
				this._super();
			},

			init : function () {
				expect(this.y).to.equal(5);
				done();
			}
		});

		TestClass().create();

	});

});
