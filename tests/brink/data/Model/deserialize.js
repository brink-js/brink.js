describe('deserialize', function () {

    it('should properly deserialize objects into records.', function () {

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
            {a : '4', b : '5'}
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

        instance1.destroy();
        instance2.destroy();
        instance3.destroy();
        instance4.destroy();
    });

    it('should properly deserialize nested keys.', function () {

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

        instance.destroy();
    });

    it('should properly deserialize primary keys.', function () {

        var Model,
            instance;

        Model = $b.Model({
            primaryKey : 'uuid'
        });

        instance = Model.create();
        instance.deserialize({uuid : 'xxx'});

        expect(instance.pk).to.equal('xxx');

        instance.destroy();
    });

    it('should not override dirty properties by default.', function () {

        var json,
            Model,
            instance;

        Model = $b.Model({
            a : $b.attr(),
            b : $b.attr(),
            c : $b.attr()
        });

        instance = Model.create({a : 0, b : 0, c : 0});
        instance.a = 1;
        instance.b = 2;
        instance.c = 3;

        json = {
            a : 4,
            b : 5,
            c : 6
        };

        instance.deserialize(json);

        expect(instance.a).to.equal(1);
        expect(instance.b).to.equal(2);
        expect(instance.c).to.equal(3);

        instance.destroy();
    });

    it('should override dirty properties if override === true.', function () {

        var json,
            Model,
            instance;

        Model = $b.Model({
            a : $b.attr(),
            b : $b.attr(),
            c : $b.attr()
        });

        instance = Model.create({a : 0, b : 0, c : 0});
        instance.a = 1;
        instance.b = 2;
        instance.c = 3;

        json = {
            a : 4,
            b : 5,
            c : 6
        };

        instance.deserialize(json, true);

        expect(instance.a).to.equal(4);
        expect(instance.b).to.equal(5);
        expect(instance.c).to.equal(6);

        instance.destroy();
    });

    it('should not mark properties as dirty when set via deserialize()', function () {

        var json,
            Model,
            instance;

        Model = $b.Model({
            a : $b.attr(),
            b : $b.attr(),
            c : $b.attr()
        });

        instance = Model.create({a : 0, b : 0, c : 0});
        expect(instance.dirtyAttributes.content.length).to.equal(0);

        instance.deserialize({a : 1, c: 3});
        expect(instance.dirtyAttributes.indexOf('a')).to.equal(-1);
        expect(instance.dirtyAttributes.indexOf('c')).to.equal(-1);

        instance.b = 2;
        expect(instance.dirtyAttributes.indexOf('b')).to.not.equal(-1);

        instance.destroy();
    });

    it('should apply filterers to properties', function () {
        var json,
            Model,
            instance;

        Model = $b.Model({
            a : $b.attr({key : 'a.b.c.d', readOnly: true})
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
        instance.deserialize(json, false, function (meta) {
            return !meta.options.readOnly;
        });

        expect(instance.serialize()).to.deep.equal({});

        instance.destroy();
    });

});
