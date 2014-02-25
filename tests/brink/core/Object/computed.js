describe('computed properties', function () {

    it('should be able to watch computed properties for changes', function (done) {

        var a;

        a = $b.Object.create({

            num1 : 1,
            num2 : 2,
            sum : $b.computed({

                watch : ['num1', 'num2'],

                get : function () {
                    return this.num1 + this.num2;
                }
            })
        });

        a.num1 = 5;
        a.num2 = 10;

        a.watch('sum', function () {
            expect(a.sum).to.equal(15);
            done();
        });

    });


});
