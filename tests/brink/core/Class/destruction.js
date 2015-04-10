describe('destruction', function () {

    it('should run the destroy method', function (done) {

        var Class,
            instance;

        Class = $b('TestClass')({

            init : function () {
                this.initialized = true;
            },

            unwatchAll : function () {
                this._super();
            },

            destroy : function () {

                var p;
                this.x = this.y = this.z = null;
                this.initialized = false;

                expect(this.x).to.not.be.ok;
                expect(this.y).to.not.be.ok;
                expect(this.z).to.not.be.ok;
                expect(this.initialized).to.not.be.ok;

                this._super();

                done();
            }
        });

        instance = Class.create();
        instance.destroy();
    });

    it('destroy()\'s super method should unsubscribe to all notifications', function (done) {

        var Class,
            instance;

        Class = $b('TestClass')({

            x : 0,

            init : function () {
                this.subscribe('test', function () {
                    this.x = 1;
                }.bind(this));
            },

            destroy : function () {

                this._super();

                this.publish('test');

                expect(this.x).to.not.be.ok;

                done();
            }
        });

        instance = Class.create();
        instance.destroy();
    });
});
