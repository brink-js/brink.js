describe('Brink.Array', function () {

    before (function () {

    });

    it('should populate the content property on init', function () {

        var a;

        a = $b.Array.create([1,2,3]);

        expect(a.content[0]).to.equal(1);
        expect(a.content[1]).to.equal(2);
        expect(a.content[2]).to.equal(3);
    });

    it('should properly concat', function () {

        var a,
            b;

        a = $b.Array.create([1,2,3]);
        b = a.concat();

        expect(a.content).to.deep.equal(b.content);
    });

    it('should iterate with forEach', function () {

        var a,
            b;

        a = $b.Array.create([1,2,3]);
        b = [];

        a.forEach(function (item) {
            b.push(item);
        });

        expect(a.content).to.deep.equal(b);
    });

	require('./mutations');
    require('./sorting');
    require('./find_filter');

    after (function () {

    });
});

