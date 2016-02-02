describe('find + filter', function () {

    it('should return all records with all().', function () {

        var i,
            Model,
            store,
            record,
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

        expect(store.all('test').content).to.deep.equal(instances);

        store.destroy(true);
    });

    it('should clear all records with clear().', function () {

        var i,
            Model,
            store,
            record,
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

        expect(store.all('test').content).to.deep.equal(instances);

        store.clear();
        expect(store.all('test').content).to.deep.equal([]);

        store.destroy(true);
    });

    it('should properly find records.', function () {

        var i,
            Model,
            store,
            record,
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

        record = store.find('test', {idx : 5});

        expect(record).to.equal(instances[5]);

        store.destroy(true);
    });

    it('should properly find records by primary key.', function () {

        var i,
            Model,
            store,
            record,
            instances;

        Model = $b.Model({
            modelKey : 'test'
        });

        instances = [];

        for (i = 0; i < 10; i ++) {
            instances.push(Model.create({id : i}));
        }

        store = $b.Store.create();
        store.add('test', instances);

        record = store.find('test', 3);

        expect(record).to.equal(instances[3]);

        store.destroy(true);
    });

    it('should properly find records with a function.', function (done) {

        var i,
            Model,
            store,
            record,
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

        record = store.find('test', function (item) {
            return item.get('idx') === 4;
        });

        expect(record).to.equal(instances[4]);

        store.destroy(true);

        done();
    });

    it('should properly filter records.', function (done) {

        var i,
            Model,
            store,
            records,
            instances;

        Model = $b.Model({
            modelKey : 'test',
            idx : $b.attr(),
            hidden : $b.attr()
        });

        instances = [];

        for (i = 0; i < 10; i ++) {
            instances.push(Model.create({idx : i, hidden : i < 5}));
        }

        store = $b.Store.create();
        store.add('test', instances);

        records = store.filter('test', {hidden : false});

        expect(records.length).to.equal(5);

        expect(records.content[0]).to.equal(instances[5]);
        expect(records.content[1]).to.equal(instances[6]);
        expect(records.content[2]).to.equal(instances[7]);
        expect(records.content[3]).to.equal(instances[8]);
        expect(records.content[4]).to.equal(instances[9]);

        store.destroy(true);

        done();
    });

    it('should properly filter records with a function.', function () {

        var i,
            Model,
            store,
            records,
            instances;

        Model = $b.Model({
            modelKey : 'test',
            idx : $b.attr(),
            hidden : $b.attr()
        });

        instances = [];

        for (i = 0; i < 10; i ++) {
            instances.push(Model.create({idx : i, hidden : i < 5}));
        }

        store = $b.Store.create();
        store.add('test', instances);

        records = store.filter('test', function (item) {
            return item.get('hidden') === true;
        });

        expect(records.length).to.equal(5);

        expect(records.content[0]).to.equal(instances[0]);
        expect(records.content[1]).to.equal(instances[1]);
        expect(records.content[2]).to.equal(instances[2]);
        expect(records.content[3]).to.equal(instances[3]);
        expect(records.content[4]).to.equal(instances[4]);

        store.destroy(true);
    });
});
