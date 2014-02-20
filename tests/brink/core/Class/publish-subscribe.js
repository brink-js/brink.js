describe('pub/sub', function () {

    var instance,
        instance2,
        delay,
        doneCalled;

    beforeEach(function () {
        instance = $b('TestClass').create();
        instance2 = $b('TestClass').create();
        doneCalled = false;
        delay = 0;
    });

    afterEach(function () {
        instance.destroy();
        instance = null;
    });


    it('should publish/subscribe and unsubscribe to a notification successfully', function (done) {

        var a = 0;

        instance.subscribe('sub-test', function () {
            a ++;
        });

        instance.publish('sub-test');
        instance.unsubscribe('sub-test');
        instance.publish('sub-test');

        expect(a).to.equal(1);

        done();

    });

    it('should publish a notification with data', function (done) {

        instance.subscribe('pub-data-test', function (n) {
            expect(n.data).to.eql({
                x : 1,
                y : 2
            });

            done();
        });

        instance.publish('pub-data-test', {
            x : 1,
            y : 2
        });
    });

    it('should publish a notification with multiple arguments', function (done) {

        instance.subscribe('pub-args-test', function (n, arg1, arg2, arg3) {
            expect(arg1).to.eql(1);
            expect(arg2).to.eql(2);
            expect(arg3).to.eql('z');
            expect(n.dispatcher).to.eql(instance);
            done();
        });

        instance.publish('pub-args-test', 1, 2, 'z');
    });


    describe('notifications', function () {

        it('should hold a notification', function (done) {

            instance.subscribe('hold-test-2', function (n) {

                n.hold();

                setTimeout(function () {
                    n.release();
                }, delay);

                doneCalled = true;
                done();
            });

            instance2.subscribe('hold-test-2', function (n) {
                if (!doneCalled) {
                    done(false);
                }
            });

            instance.publish('hold-test-2');
        });


        it('should release a notification', function (done) {

            instance.subscribe('release-test-2', function (n) {
                n.hold();

                setTimeout(function () {
                    n.release();

                    if (!doneCalled) {
                        done(false);
                    }
                }, delay);
            });

            instance2.subscribe('release-test-2', function (n) {
                doneCalled = true;
                done();
            });

            instance.publish('release-test-2');
        });


        it('should cancel a notification', function (done) {

            instance.subscribe('cancel-test-2', function (n) {
                n.cancel();

                setTimeout(function () {
                    done();
                }, delay);
            });

            instance2.subscribe('cancel-test-2', function (n) {
                done(false);
            });

            instance.publish('cancel-test-2');
        });

        it('should respond to a notification with a callback', function (done) {

            instance.subscribe('respond-test-2', function (n) {
                expect(n).to.be.an('object');

                n.respond({
                    x : 1,
                    y : 2
                });
            });

            instance.publish('respond-test-2', {}, function (obj) {
                expect(obj).to.eql({
                    x : 1,
                    y : 2
                });

                done();
            });
        });
    });
});
