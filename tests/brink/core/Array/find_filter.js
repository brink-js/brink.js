describe('sorting', function () {

    it('should find an item in an array', function () {

        var a,
            b;

        a = $b.Array.create([
            {val : 5},
            {val : 3},
            {val : 1},
            {val : 4},
            {val : 2}
        ]);

        b = a.find(function (item) {
            return item.val === 1;
        });

        expect(b).to.deep.equal({val : 1});
        a.destroy();
    });


    it('should find an item in an array with findBy', function () {

        var a,
            b;

        a = $b.Array.create([
            {val : 5},
            {val : 3},
            {val : 1},
            {val : 4},
            {val : 2}
        ]);

        b = a.findBy('val', 3);
        expect(b).to.deep.equal({val : 3});
        a.destroy();
    });


    it('should filter an array properly', function () {

        var a,
            b;

        a = $b.Array.create([
            {val : 1, hidden : true},
            {val : 2, hidden : false},
            {val : 3, hidden : true},
            {val : 4, hidden : false},
            {val : 5, hidden : true}
        ]);

        b = a.filter(function (item) {
            return !item.hidden;
        });

        expect(b.content).to.deep.equal([
            {val : 2, hidden : false},
            {val : 4, hidden : false},
        ]);
        a.destroy();
    });

    it('should filter an array with filterBy', function () {

        var a,
            b;

        a = $b.Array.create([
            {val : 1, hidden : true},
            {val : 2, hidden : false},
            {val : 3, hidden : true},
            {val : 4, hidden : false},
            {val : 5, hidden : true}
        ]);

        b = a.filterBy('hidden', true);

        expect(b.content).to.deep.equal([
            {val : 1, hidden : true},
            {val : 3, hidden : true},
            {val : 5, hidden : true}
        ]);
        a.destroy();
    });

});
