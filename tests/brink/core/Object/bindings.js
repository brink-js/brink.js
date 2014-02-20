describe('bindings', function () {

    it('should property bind properties', function (done) {

        var Obj,
            Obj2,
            instance,
            instance2;

        Obj = $b('TestObj')({
            test : 1
        });

        instance = Obj().create();

        Obj2 = $b('TestObj')({
            test : $b.bindTo(instance, 'test')
        });

        instance2 = Obj2().create();

        expect(instance.test).to.equal(1);
        instance.test = 2;

        expect(instance.test).to.equal(2);
        expect(instance2.test).to.equal(2);

        instance2.test = 10;
        expect(instance2.test).to.equal(10);
        expect(instance.test).to.equal(10);

        done();

        //instance.destroy();
    });
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
