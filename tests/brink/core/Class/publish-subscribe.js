describe('pub/sub', function () {

    it('should publish/subscribe and unsubscribe to a notification successfully', function (done) {

        var a = 0,
            instance = $b('TestClass').create();

        instance.subscribe('sub-test', function () {
            a ++;
        });

        instance.publish('sub-test');
        instance.unsubscribe('sub-test');
        instance.publish('sub-test');

        expect(a).to.equal(1);

        instance.destroy();
        done();

    });

    it('should publish a notification with data', function (done) {

        var instance = $b('TestClass').create();

        instance.subscribe('pub-data-test', function (n, data) {
            expect(data).to.deep.equal({
                x : 1,
                y : 2
            });

            instance.destroy();
            done();
        });

        instance.publish('pub-data-test', {
            x : 1,
            y : 2
        });
    });

    it('should publish a notification with multiple arguments', function (done) {

        var instance = $b('TestClass').create();

        instance.subscribe('pub-args-test', function (n, arg1, arg2, arg3) {
            expect(arg1).to.eql(1);
            expect(arg2).to.eql(2);
            expect(arg3).to.eql('z');
            expect(n.dispatcher).to.eql(instance);
            instance.destroy();
            done();
        });

        instance.publish('pub-args-test', 1, 2, 'z');
    });


    describe('notifications', function () {

        it('should support subscribers that return promises', function (done) {

            var instance = $b('TestClass').create(),
                instance2 = $b('TestClass').create(),
                didHold = false;

            instance.subscribe('hold-test-2', function (n) {

                var deferred = $b.Q.defer();

                setTimeout(function () {
                    didHold = true;
                    deferred.resolve();
                }, 10);

                return deferred.promise;
            });

            instance2.subscribe('hold-test-2', function (n) {
                if (didHold) {
                    instance.destroy();
                    instance2.destroy();
                    done();
                }
            });

            instance.publish('hold-test-2');
        });

        it('should support subscribers that return values', function (done) {

            var instance = $b('TestClass').create();

            instance.subscribe('respond-test-2', function (n) {
                expect(n).to.be.an('object');
                return {x : 1, y : 2};
            });

            instance.publish('respond-test-2', {}).then(function (obj) {
                expect(obj).to.eql({
                    x : 1,
                    y : 2
                });

                instance.destroy();
                done();
            });
        });

        it('should be able to cancel notifications', function (done) {

            var instance = $b('TestClass').create(),
                instance2 = $b('TestClass').create();

            instance.subscribe('cancel-test-2', function (n) {
                n.cancel();

                setTimeout(function () {
                    instance.destroy();
                    instance2.destroy();
                    done();
                }, 10);
            });

            instance2.subscribe('cancel-test-2', function (n) {
                instance.destroy();
                instance2.destroy();
                done(false);
            });

            instance.publish('cancel-test-2');
        });
    });
});
