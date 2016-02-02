describe('add + remove', function () {

    it('should properly add records.', function () {

        var i,
            Model,
            store,
            instances;

        Model = $b.Model({
            modelKey : 'test',
            idx : $b.attr()
        });

        instances = [];

        for (i = 0; i < 10; i ++) {
            instances.push(Model.create({idx : i}));
        }

        store = $b.Store.create();
        store.add('test', instances);

        expect(store.__store.tests.content).to.deep.equal(instances);
    });

    it('should properly remove records.', function () {

        var i,
            Model,
            store,
            instances;

        Model = $b.Model({
            modelKey : 'test',
            idx : $b.attr()
        });

        instances = [];

        for (i = 0; i < 10; i ++) {
            instances.push(Model.create({idx : i}));
        }

        store = $b.Store.create();
        store.add('test', instances);

        expect(store.__store.tests.content).to.deep.equal(instances);

        store.remove('test', instances.splice(0, 5));
        expect(store.__store.tests.content.length).to.equal(5);

        store.remove('test', instances);
        expect(store.__store.tests.content).to.not.deep.equal(instances);
    });
});
