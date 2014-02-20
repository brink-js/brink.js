describe('bindings', function () {

    it('should watch for property changes', function (done) {

        var Obj,
            instance;

        Obj = $b('TestObj')({

            prop1 : 1,
            prop2: 2,

            init : function () {
                this.watch(this.prop1Changed, 'prop1');
            },

            prop1Changed : function () {
                expect(instance.prop1).to.not.equal(1);
                done();
            }
        });

        instance = Obj().create();

        expect(instance.prop1).to.equal(1);
        instance.prop1 = 2;
        expect(instance.prop1).to.equal(2);

        //instance.destroy();
    });
});
