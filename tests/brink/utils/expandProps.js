describe('expandProps', function () {

    it('should properly expand properties.', function () {

        var actual,
            expected;

        actual = $b.expandProps('nested.prop1,prop2,prop3');
        expected = ['nested', 'nested.prop1', 'nested.prop2', 'nested.prop3'];

        expect(actual).to.deep.equal(expected);
    });

});
