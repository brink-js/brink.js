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

        expect(a.test).to.equal(1);
        expect(b.test).to.equal(1);

        a.test = 5;

        expect(a.test).to.equal(5);
        expect(b.test).to.equal(5);

        b.test = 10;
        expect(b.test).to.equal(10);
        expect(a.test).to.equal(10);

        done();
    });

    it('should be able to add watchers to $b.Object instances', function (done) {

        var a;

        a = $b.Object.create({
            test : 1
        });


        a.watch('test', function () {
            expect(a.test).to.equal(10);
            a.test = 20;
            a.destroy();
            done();
        });

        expect(a.test).to.equal(1);
        a.test = 10;
        expect(a.test).to.equal(10);

    });

    it('should be able to add watchers to bound properties', function (done) {

        var a,
            b,
            c;

        a = $b.Object.create({
            test1 : 1
        });

        b = $b.Object.create({
            test2 : $b.bindTo(a, 'test1')
        });

        c = $b.Object.create({
            test3 : $b.bindTo(b, 'test2')
        });

        c.watch('test3', function () {

            expect(a.test1).to.equal(b.test2);
            expect(c.test3).to.equal(b.test2);
            expect(c.test3).to.equal(10);

            a.destroy();
            b.destroy();
            c.destroy();

            done();

        });

        a.test1 = 10;
    });
});
