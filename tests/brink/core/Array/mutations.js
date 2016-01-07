describe('mutations', function () {

    it('should allow getting indices with get()', function () {

        var a;

        a = $b.Array.create([1, 2, 3]);

        expect(a.get(0)).to.equal(1);
        expect(a.get(1)).to.equal(2);
        expect(a.get(2)).to.equal(3);

        a.destroy();
    });

    it('should allow setting indices with set()', function () {

        var a;

        a = $b.Array.create([1, 2, 3]);
        expect(a.content).to.deep.equal([1, 2, 3]);

        a.set(2, 10);
        expect(a.get(2)).to.equal(10);

        a.destroy();
    });

    it('should allow pushing items with push()', function () {

        var a;

        a = $b.Array.create([1, 2, 3]);
        expect(a.content).to.deep.equal([1, 2, 3]);

        a.push(4, 5, 6);
        expect(a.content).to.deep.equal([1, 2, 3, 4, 5, 6]);

        a.destroy();
    });

    it('should allow adding items with insertAt()', function () {

        var a;

        a = $b.Array.create([1, 2, 3]);
        expect(a.content).to.deep.equal([1, 2, 3]);

        a.insertAt(3, 4);
        expect(a.content).to.deep.equal([1, 2, 3, 4]);

        a.destroy();
    });

    it('should allow removing items with remove()', function () {

        var a;

        a = $b.Array.create([1, 2, 3, 4, 5, 6]);
        expect(a.content).to.deep.equal([1, 2, 3, 4, 5, 6]);

        a.remove(3);
        expect(a.content).to.deep.equal([1, 2, 4, 5, 6]);

        a.destroy();
    });

    it('should allow removing items with removeAt()', function () {

        var a;

        a = $b.Array.create([1, 2, 3, 4, 5, 6]);
        expect(a.content).to.deep.equal([1, 2, 3, 4, 5, 6]);

        a.removeAt(0);
        expect(a.content).to.deep.equal([2, 3, 4, 5, 6]);

        a.destroy();
    });

    it('should allow removing items with pop()', function () {

        var a,
            b;

        a = $b.Array.create([1, 2, 3, 4, 5, 6]);
        expect(a.content).to.deep.equal([1, 2, 3, 4, 5, 6]);

        b = a.pop();

        expect(b).to.equal(6);
        expect(a.content).to.deep.equal([1, 2, 3, 4, 5]);

        a.destroy();
    });

    it('should allow removing items with shift()', function () {

        var a,
            b;

        a = $b.Array.create([1, 2, 3, 4, 5, 6]);
        expect(a.content).to.deep.equal([1, 2, 3, 4, 5, 6]);

        b = a.shift();

        expect(b).to.equal(1);
        expect(a.content).to.deep.equal([2, 3, 4, 5, 6]);

        a.destroy();
    });

    it('should allow adding/removing items with splice()', function () {

        var a;

        a = $b.Array.create([1, 1, 1]);
        expect(a.content).to.deep.equal([1, 1, 1]);
        a.splice(1, 2, 2, 3, 4);
        expect(a.content).to.deep.equal([1, 2, 3, 4]);

        a.destroy();
    });

    it('should allow adding items with unshift()', function () {

        var a;

        a = $b.Array.create([4, 5, 6]);
        expect(a.content).to.deep.equal([4, 5, 6]);
        a.unshift(1, 2, 3);
        expect(a.content).to.deep.equal([1, 2, 3, 4, 5, 6]);

        a.destroy();
    });

    it('should allow replacing items', function () {

        var a;

        a = $b.Array.create([0, 2, 3]);
        expect(a.content).to.deep.equal([0, 2, 3]);

        a.replace(0, 1);
        expect(a.content).to.deep.equal([1, 2, 3]);

        a.destroy();
    });

    it('should allow replacing with replaceAt()', function () {

        var a;

        a = $b.Array.create([1, 2, 3, 0]);
        expect(a.content).to.deep.equal([1, 2, 3, 0]);

        a.replaceAt(3, 4);
        expect(a.content).to.deep.equal([1, 2, 3, 4]);

        a.destroy();
    });

    it('should call watchers on addition of items', function (done) {

        var a;

        a = $b.Array.create([1, 2, 3]);

        a.watch('@each', function () {
            expect(a.changes.added.length).to.equal(3);
            a.destroy();
            done();
        });

        a.push(4, 5, 6);
    });

    it('should trigger added event on addition of items', function (done) {

        var a,
            changes;

        a = $b.Array.create([1, 2, 3]);
        changes = [];

        a.on('added', function (e) {
            expect(e.data.item).to.equal(4);
            done();
        });

        a.push(4);
    });

    it('should call watchers on removal of items', function (done) {

        var a;

        a = $b.Array.create([1, 2, 3]);

        a.watch('@each', function () {
            expect(a.changes.removed[0].item).to.equal(1);
            a.destroy();
            done();
        });

        a.removeAt(0);
    });

    it('should trigger removed event on removal of items', function (done) {

        var a,
            changes;

        a = $b.Array.create([1, 2, 3]);
        changes = [];

        a.on('removed', function (e) {
            expect(e.data.item).to.equal(2);
            done();
        });

        a.removeAt(1);
    });

    it('should call watchers on moving of items', function (done) {

        var a,
            moved;

        a = $b.Array.create([1, 2, 3]);
        moved = [];

        a.watch('@each', function () {
            a.changes.moved.forEach(function (tmp) {
                moved.push(tmp.item);
            });
            expect(moved).to.have.members([3, 1]);
            a.destroy();
            done();
        });

        a.reverse();
    });

    it('should trigger moved event on moving of items', function (done) {

        var a,
            moved,
            count;

        a = $b.Array.create([1, 2, 3]);
        moved = [];
        count = 0;

        a.on('moved', function (e) {

            moved.push(e.data.item);

            if (++count === 2) {
                expect(moved).to.have.members([3, 1]);
                a.destroy();
                done();
            }
        });

        a.reverse();
    });

    it('should call watchers when @each.* properties change', function (done) {

        var a,
            o1,
            o2,
            o3;

        o1 = $b.Object.create({
            test : 'test1'
        });

        o2 = $b.Object.create({
            test : 'test2'
        });

        o3 = $b.Object.create({
            test : 'test3'
        });

        a = $b.Array.create([o1, o2, o3]);

        a.watch('@each.test', function () {

            var updates = a.changes.updated.map(function (tmp) {
                if (tmp.changes.indexOf('test') > -1) {
                    return tmp.item.test;
                }
            });

            expect(updates).to.have.members(['zzz', 'yyy']);
            done();
        });

        o3.test = 'zzz';
        o2.test = 'yyy';
    });
});
