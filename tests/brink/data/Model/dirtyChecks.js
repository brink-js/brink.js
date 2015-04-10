describe('isDirty/isClean', function () {

    it('should return isDirty === true and isClean === false on dirty properties.', function (done) {

        var Model,
            instance;

        Model = $b.Model({
            a : $b.attr({defaultValue : 1})
        });

        instance = Model.create();

        instance.a = 3;

        expect(instance.isDirty).to.equal(true);
        expect(instance.isClean).to.equal(false);
        done();
    });

    it('should list all dirty properties in dirtyAttributes.', function (done) {

        var Model,
            instance;

        Model = $b.Model({
            a : $b.attr({defaultValue : 1}),
            b : $b.attr({defaultValue : 2}),
            c : $b.attr({defaultValue : 3})
        });

        instance = Model.create();

        instance.a = 3;
        instance.b = 2;
        instance.c = 1;

        expect(instance.dirtyAttributes.content).to.deep.equal(['a', 'c']);
        done();
    });

    it('should unflag dirty properties if they are no longer dirty.', function (done) {

        var Model,
            instance;

        Model = $b.Model({
            a : $b.attr({defaultValue : 1}),
            b : $b.attr({defaultValue : 2}),
            c : $b.attr({defaultValue : 3})
        });

        instance = Model.create();

        instance.a = 3;
        instance.b = 2;
        instance.c = 1;

        expect(instance.isDirty).to.equal(true);
        expect(instance.isClean).to.equal(false);
        expect(instance.dirtyAttributes.content).to.deep.equal(['a', 'c']);

        instance.a = 1;
        instance.b = 2;
        instance.c = 3;

        expect(instance.dirtyAttributes.content).to.deep.equal([]);
        expect(instance.isDirty).to.equal(false);
        expect(instance.isClean).to.equal(true);

        instance.a = 5;
        expect(instance.dirtyAttributes.content).to.deep.equal(['a']);
        expect(instance.isDirty).to.equal(true);
        expect(instance.isClean).to.equal(false);

        done();
    });
});
