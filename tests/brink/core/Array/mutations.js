describe('mutations', function () {

    it('should allow getting indices with get()', function () {

        var a;

        a = $b.Array.create([1,2,3]);

        expect(a.get(0)).to.equal(1);
        expect(a.get(1)).to.equal(2);
        expect(a.get(2)).to.equal(3);

        a.destroy();
    });

    it('should allow setting indices with set()', function () {

        var a;

        a = $b.Array.create([1,2,3]);
        expect(a.content).to.deep.equal([1,2,3]);

        a.set(2, 10);
        expect(a.get(2)).to.equal(10);

        a.destroy();
    });

    it('should allow pushing items with push()', function () {

        var a;

        a = $b.Array.create([1,2,3]);
        expect(a.content).to.deep.equal([1,2,3]);

        a.push(4,5,6);
        expect(a.content).to.deep.equal([1,2,3,4,5,6]);

        a.destroy();
    });

    it('should allow adding items with insertAt()', function () {

        var a;

        a = $b.Array.create([1,2,3]);
        expect(a.content).to.deep.equal([1,2,3]);

        a.insertAt(3, 4);
        expect(a.content).to.deep.equal([1,2,3,4]);

        a.destroy();
    });

    it('should allow removing items with remove()', function () {

        var a;

        a = $b.Array.create([1,2,3,4,5,6]);
        expect(a.content).to.deep.equal([1,2,3,4,5,6]);

        a.remove(3);
        expect(a.content).to.deep.equal([1,2,4,5,6]);

        a.destroy();
    });

    it('should allow removing items with removeAt()', function () {

        var a;

        a = $b.Array.create([1,2,3,4,5,6]);
        expect(a.content).to.deep.equal([1,2,3,4,5,6]);

        a.removeAt(0);
        expect(a.content).to.deep.equal([2,3,4,5,6]);

        a.destroy();
    });

    it('should allow removing items with pop()', function () {

        var a,
            b;

        a = $b.Array.create([1,2,3,4,5,6]);
        expect(a.content).to.deep.equal([1,2,3,4,5,6]);

        b = a.pop();

        expect(b).to.equal(6);
        expect(a.content).to.deep.equal([1,2,3,4,5]);

        a.destroy();
    });


    it('should allow removing items with shift()', function () {

        var a,
            b;

        a = $b.Array.create([1,2,3,4,5,6]);
        expect(a.content).to.deep.equal([1,2,3,4,5,6]);

        b = a.shift();

        expect(b).to.equal(1);
        expect(a.content).to.deep.equal([2,3,4,5,6]);

        a.destroy();
    });

    it('should allow adding/removing items with splice()', function () {

        var a;

        a = $b.Array.create([1,1,1]);
        expect(a.content).to.deep.equal([1,1,1]);
        a.splice(1, 2, 2, 3, 4);
        expect(a.content).to.deep.equal([1,2,3,4]);

        a.destroy();
    });

    it('should allow adding items with unshift()', function () {

        var a;

        a = $b.Array.create([4,5,6]);
        expect(a.content).to.deep.equal([4,5,6]);
        a.unshift(1,2,3);
        expect(a.content).to.deep.equal([1,2,3,4,5,6]);

        a.destroy();
    });

    it('should allow replacing items', function () {

        var a;

        a = $b.Array.create([0,2,3]);
        expect(a.content).to.deep.equal([0,2,3]);

        a.replace(0,1);
        expect(a.content).to.deep.equal([1,2,3]);

        a.destroy();
    });


    it('should allow replacing with replaceAt()', function () {

        var a;

        a = $b.Array.create([1,2,3,0]);
        expect(a.content).to.deep.equal([1,2,3,0]);

        a.replaceAt(3,4);
        expect(a.content).to.deep.equal([1,2,3,4]);

        a.destroy();
    });

    it('should call watchers on addition of items', function (done) {

        var a;

        a = $b.Array.create([1,2,3]);

        a.watch('@each', function () {
            expect(a.getChanges().added.length).to.equal(3);
            a.destroy();
            done();
        });

        a.push(4,5,6);
    });

    it('should call watchers on removal of items', function (done) {

        var a;

        a = $b.Array.create([1,2,3]);

        a.watch('@each', function () {
            expect(a.getChanges().removed[0].item).to.equal(1);
            a.destroy();
            done();
        });

        a.removeAt(0);
    });
});
