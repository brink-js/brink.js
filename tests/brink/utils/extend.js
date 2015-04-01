describe('extend', function () {

    it('should properly shallow extend objects.', function () {

        var c,
            a,
            test,
            test2;

        c = {c : 'test'};
        a = {b : c};

        test = {
            a : a
        };

        test2 = $b.extend({}, test);

        expect(test2).to.not.equal(test);
        expect(test2.a).to.equal(a);
        expect(test2.a.b).to.equal(c);

        expect(test2).to.deep.equal(test);
        expect(test2.a).to.deep.equal(a);
        expect(test2.a.b).to.deep.equal(c);
    });

    it('should properly deep extend objects.', function () {

        var c,
            a,
            test,
            test2;

        c = {c : 'test'};
        a = {b : c};

        test = {
            a : a
        };

        test2 = $b.extend('', true, test);

        expect(test2).to.not.equal(test);
        expect(test2.a).to.not.equal(a);
        expect(test2.a.b).to.not.equal(c);

        expect(test2).to.deep.equal(test);
        expect(test2.a).to.deep.equal(a);
        expect(test2.a.b).to.deep.equal(c);
    });

    it('should properly deep extend arrays.', function () {

        var c,
            a,
            test,
            test2;

        c = {c : 'test'};
        a = {b : c};

        test = [
            {a : a},
            {a : a},
            {a : a},
            [
                {a : a},
                {a : a}
            ]
        ];

        test2 = $b.extend([], true, test);

        expect(test2).to.not.equal(test);
        expect(test2[0].a).to.not.equal(a);
        expect(test2[1].a.b).to.not.equal(c);
        expect(test2[0]).to.not.equal(test2[1]);
        expect(test2[3][0]).to.not.equal(test2[3][1]);

        expect(test2).to.deep.equal(test);
        expect(test2[0].a).to.deep.equal(a);
        expect(test2[1].a.b).to.deep.equal(c);
        expect(test2[0]).to.deep.equal(test2[1]);

        expect(test2[3][0]).to.deep.equal(test[0]);

    });
});
