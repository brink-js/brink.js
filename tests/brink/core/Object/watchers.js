describe('watchers', function () {

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

    it('should trigger watchers on nested properties', function (done) {

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

        c.watch('test3', function () {

            expect(c.test3).to.equal(a.test1);

            a.destroy();
            b.destroy();
            c.destroy();

            done();

        });

        a.test1 = 10;
    });

});
