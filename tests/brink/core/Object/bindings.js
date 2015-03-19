describe('bindings', function () {

    it('should two-way data bind between $b.Object instances when using $b.bindTo()', function (done) {

        var a,
            b;

        a = $b.Object.create({
            test : 1
        });

        b = $b.Object.create({
            test : $b.bindTo(a, 'test')
        });

        expect(a.test).to.equal(1);
        a.test = 2;

        expect(a.test).to.equal(2);
        expect(b.test).to.equal(2);

        b.test = 10;
        expect(b.test).to.equal(10);
        expect(a.test).to.equal(10);

        done();
    });

    it('should two-way data bind between $b.Object instances when using bindProperty()', function (done) {

        var a,
            b;

        a = $b.Object.create({
            test : 1
        });

        b = $b.Object.create({
            test : 2
        });

        a.bindProperty('test', b, 'test');

        expect(a.test).to.equal(2);
        expect(b.test).to.equal(2);

        a.test = 5;

        expect(a.test).to.equal(5);
        expect(b.test).to.equal(5);

        b.test = 10;
        expect(b.test).to.equal(10);
        expect(a.test).to.equal(10);

        done();
    });

    it('should be able to bind to nested properties', function (done) {

        var a,
            b,
            c;

        a = $b.Object.create({
            test1 : 1
        });

        b = $b.Object.create({
            a : a
        });

        c = $b.Object.create({
            b : b,
            test3 : $b.bindTo('b.a.test1')
        });

        expect(a.test1).to.equal(1);
        expect(c.test3).to.equal(a.test1);
        a.test1 = 10;
        expect(a.test1).to.equal(10);
        expect(c.test3).to.equal(a.test1);

        done();

    });
});
