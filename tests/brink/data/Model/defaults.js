describe('defaults', function () {

    it('should populate records with default values.', function () {

        var Model,
            instance;

        Model = $b.Model({
            schema : $b.Schema.create({
                a : $b.attr({defaultValue : 'a'}),
                b : $b.attr({defaultValue : 'b'}),
                c : $b.attr({defaultValue : 'c'})
            })
        });

        instance = Model.create();

        expect(instance.a).to.equal('a');
        expect(instance.b).to.equal('b');
        expect(instance.c).to.equal('c');

        instance.destroy();
    });

    it('should override defaults if values are specified.', function () {

        var Model,
            instance;

        Model = $b.Model({

            schema : $b.Schema.create({
                a : $b.attr({defaultValue : 'a'}),
                b : $b.attr({defaultValue : 'b'}),
                c : $b.attr({defaultValue : 'c'})
            })
        });

        instance = Model.create({a : 'a2', b : 'b2'});

        expect(instance.a).to.equal('a2');
        expect(instance.b).to.equal('b2');
        expect(instance.c).to.equal('c');

        instance.destroy();
    });

    it('should not dirty records when using default values.', function () {

        var Model,
            instance;

        Model = $b.Model({
            schema : $b.Schema.create({
                a : $b.attr({defaultValue : 'a'}),
                b : $b.attr({defaultValue : 'b'}),
                c : $b.attr({defaultValue : 'c'})
            })
        });

        instance = Model.create();

        expect(instance.isDirty).to.equal(false);

        instance.destroy();
    });
});
