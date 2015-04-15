describe('destruction', function () {

    it('should run the destroy method', function (done) {

        var Obj,
            instance;

        Obj = $b('TestObj')({

            init : function () {
                this.initialized = true;
            },

            destroy : function () {

                var p;
                this.x = this.y = this.z = null;
                this.initialized = false;

                expect(this.x).to.not.be.ok;
                expect(this.y).to.not.be.ok;
                expect(this.z).to.not.be.ok;
                expect(this.initialized).to.not.be.ok;

                done();

                $b('TestObj').prototype.destroy.call(this);
            }
        });

        instance = Obj.create();
        expect(instance.initialized).to.equal(true);
        instance.destroy();
        expect(instance.initialized).to.equal(false);
        expect(instance.isDestroyed).to.equal(true);
        expect(instance.__meta).to.equal(null);

    });

    it('should not error on subsequent calls to destroy', function () {

        var Obj,
            instance;

        Obj = $b('TestObj')({

        });

        instance = Obj.create();
        instance.destroy();
        instance.destroy();
        instance.destroy();
        instance.destroy();

        expect(instance.isDestroyed).to.equal(true);
        expect(instance.__meta).to.equal(null);

    });
});
