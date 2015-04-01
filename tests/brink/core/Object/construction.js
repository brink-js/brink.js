describe('construction', function () {

	it('should run the init method', function () {

		var Obj,
			instance;

		Obj = $b('TestObj')({

			a : 'test',

			init : function () {
				this.initialized = true;
			}
		});

		instance = Obj().create();

		expect(instance.initialized).to.be.ok;

		instance.destroy();
	});

	it('should be an instance of it\'s parent Classes', function () {

		var Obj,
			instance;

		Obj = $b('TestObj')({});

		instance = Obj().create();

		expect(instance).to.be.an.instanceof(Obj);
		expect(instance).to.be.an.instanceof($b('TestObj'));
		expect(instance).to.be.an.instanceof($b.Object);

        instance.destroy();
	});

});
