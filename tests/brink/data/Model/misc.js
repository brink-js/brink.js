describe('misc', function () {

    it('should return null for `pk` when `primaryKey` === null.', function () {

        var json,
            Model,
            expected,
            instance;

        Model = $b.Model({
            primaryKey : null,
            a : $b.attr({defaultValue : 'a'}),
            b : $b.attr({defaultValue : 'b'}),
            c : $b.attr({defaultValue : 'c'})
        });

        instance = Model.create();
        expect(instance.pk).to.equal(null);
    });
});
