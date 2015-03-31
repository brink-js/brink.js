describe('defaults', function () {

	it('should populate records with default values.', function (done) {

		var Model,
			instance;

		Model = $b.Model({
            a : $b.attr({defaultValue : 'a'}),
            b : $b.attr({defaultValue : 'b'}),
            c : $b.attr({defaultValue : 'c'})
		});

		instance = Model.create();

		expect(instance.a).to.equal('a');
		expect(instance.b).to.equal('b');
		expect(instance.c).to.equal('c');
		done();
	});

	it('should override defaults if values are specified.', function (done) {

		var Model,
			instance;

		Model = $b.Model({
            a : $b.attr({defaultValue : 'a'}),
            b : $b.attr({defaultValue : 'b'}),
            c : $b.attr({defaultValue : 'c'})
		});

		instance = Model.create({a : 'a2', b : 'b2'});

		expect(instance.a).to.equal('a2');
		expect(instance.b).to.equal('b2');
		expect(instance.c).to.equal('c');
		done();
	});

	it('should not dirty records when using default values.', function (done) {

		var Model,
			instance;

		Model = $b.Model({
            a : $b.attr({defaultValue : 'a'}),
            b : $b.attr({defaultValue : 'b'}),
            c : $b.attr({defaultValue : 'c'})
		});

		instance = Model.create();

		expect(instance.isDirty).to.equal(false);
		done();

	});
});
