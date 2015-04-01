describe('trim', function () {

    it('should properly trim strings.', function () {

        var actual,
            expected;

        actual = $b.trim('     hello world     .   ');
        expected = 'hello world     .';

        expect(actual).to.equal(expected);
    });

});
