describe('deserialize', function () {

	it('should properly deserialize objects into records.', function (done) {

		var Model,
			json,
			deserialized,
			instance1,
			instance2,
			instance3,
			instance4;

		Model = $b.Model({
			a : $b.attr(),
			b : $b.attr()
		});

		json = [
			{a : '1', b : '2'},
			{a : '2', b : '3'},
			{a : '3', b : '4'},
			{a : '4', b : '5'},
		];

		instance1 = Model.create();
		instance2 = Model.create();
		instance3 = Model.create();
		instance4 = Model.create();

		instance1.deserialize(json[0]);
		instance2.deserialize(json[1]);
		instance3.deserialize(json[2]);
		instance4.deserialize(json[3]);

		expect(instance1.a).to.equal('1');
		expect(instance1.b).to.equal('2');

		expect(instance2.a).to.equal('2');
		expect(instance2.b).to.equal('3');

		expect(instance3.a).to.equal('3');
		expect(instance3.b).to.equal('4');

		expect(instance4.a).to.equal('4');
		expect(instance4.b).to.equal('5');

		deserialized = [
			instance1.getProperties(['a', 'b']),
			instance2.getProperties(['a', 'b']),
			instance3.getProperties(['a', 'b']),
			instance4.getProperties(['a', 'b'])
		];

		expect(deserialized).to.deep.equal(json);

		done();
	});

	it('should properly deserialize nested keys.', function (done) {

		var json,
			Model,
			instance;

		Model = $b.Model({
            a : $b.attr({key : 'a.b.c.d'})
		});

		json = {
			a : {
				b : {
					c : {
						d : 'test'
					}
				}
			}
		};

		instance = Model.create();
		instance.deserialize(json);

		expect(instance.a).to.equal('test');
		expect(instance.serialize()).to.deep.equal(json);

		done();
	});
});
