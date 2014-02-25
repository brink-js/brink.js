describe('mutations', function () {

    it('should allow getting indices with get()', function () {

        var a;

        a = $b.Array.create([1,2,3]);

        expect(a.get(0)).to.equal(1);
        expect(a.get(1)).to.equal(2);
        expect(a.get(2)).to.equal(3);

    });


    it('should allow setting indices with set()', function () {

        var a;

        a = $b.Array.create([1,2,3]);

        a.set(2, 10);

        expect(a.get(2)).to.equal(10);
    });

    it('should call watchers on addition of items', function (done) {

        var c;

        c = $b.Array.create([1,2,3]);

        c.watch(function () {
            expect(c.getChanges().added.length).to.equal(3);
            done();
        });

        c.push(4,5,6);

    });

    it('should call watchers on removal of items', function (done) {

        var a;

        a = $b.Array.create([1,2,3]);

        a.watch('@each', function () {

            expect(a.getChanges().removed[0]).to.equal(1);
            done();
        });

        a.removeAt(0);

    });


});
