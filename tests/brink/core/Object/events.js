describe('events', function () {

    it('should be able to listen for events with on()', function () {

        var a,
            count = 0;

        a = $b.Object.create({});

        a.on('test', function (e) {
            count ++;
        });

        a.trigger('test');
        a.trigger('test');

        expect(count).to.equal(2);
        a.destroy();
    });

    it('should be able to unlisten for events by name and function', function () {

        var a,
            fn,
            count = 0;

        a = $b.Object.create({});

        fn = function (e) {count ++;};

        a.on('test', fn);
        a.off('test', fn);

        a.trigger('test');
        a.trigger('test');

        expect(count).to.equal(0);
        a.destroy();
    });

    it('should be able to unlisten for all events by name only', function () {

        var a,
            fn,
            fn2,
            count = 0;

        a = $b.Object.create({});

        fn = function (e) {count ++;};
        fn2 = function (e) {count ++;};

        a.on('test', fn);
        a.on('test', fn2);

        a.off('test');

        a.trigger('test');
        a.trigger('test');

        expect(count).to.equal(0);
        a.destroy();
    });

    it('should be able to listen for events only one time with once()', function () {

        var a,
            count = 0;

        a = $b.Object.create({});

        a.once('test', function (e) {
            if (++count === 2) {
                a.destroy();
                done();
            }
        });

        a.trigger('test');
        a.trigger('test');

        expect(count).to.equal(1);
        a.destroy();
    });
});
