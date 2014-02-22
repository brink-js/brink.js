describe("$b.Array", function () {

    before (function () {



    });

    it('should populate the content property on init', function (done) {

        var a;

        a = $b.Array.create([1,2,3]);

        expect(a.content[0]).to.equal(1);
        expect(a.content[1]).to.equal(2);
        expect(a.content[2]).to.equal(3);

        done();
    });

	require("./mutations");

    after (function () {

    });
});

