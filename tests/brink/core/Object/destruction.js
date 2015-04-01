describe('destruction', function () {

	it('should run the destroy method', function (done) {

		var Obj,
			instance;

		Obj = $b('TestObj')({

			init : function () {
				this.initialized = true;
			},

			destroy : function () {

				var p;
				this.x = this.y = this.z = null;
				this.initialized = false;

				expect(this.x).to.not.be.ok;
				expect(this.y).to.not.be.ok;
				expect(this.z).to.not.be.ok;
				expect(this.initialized).to.not.be.ok;

				done();

				$b('TestObj').prototype.destroy.call(this);
			}
		});

		instance = Obj.create();
		instance.destroy();
	});
});
