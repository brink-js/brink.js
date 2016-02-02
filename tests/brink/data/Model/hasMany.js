describe('hasMany', function () {

    var store,
        Post,
        User,
        Comment,
        Permission,
        emptyPostJSON,
        emptyCommentJSON;

    before(function () {

        User = $b.Model({
            modelKey : 'user',
            name : $b.attr()
        });

        Comment = $b.Model({
            modelKey : 'comment',
            content : $b.attr(),
            author : $b.belongsTo('user'),
            views: $b.hasMany('user', {internal: true}),
            likes : $b.hasMany('user'),
            showTo : $b.hasMany('user', {embedded: true, readOnly: true})
        });

        Permission = $b.Model({
            modelKey : 'permission',
            user : $b.belongsTo('user'),
            value : $b.attr(),

            canRead : $b.computed(function () {
                return this.get('value') >= 1;
            }, 'value'),

            canWrite : $b.computed(function () {
                return this.get('value') >= 2;
            }, 'value'),

            canDelete : $b.computed(function () {
                return this.get('value') >= 3;
            }, 'value')
        });

        Post = $b.Model({
            modelKey : 'post',
            content : $b.attr(),
            author : $b.belongsTo('user'),
            comments : $b.hasMany('comment', {embedded : true}),
            likes : $b.hasMany('user'),
            views: $b.hasMany('user', {internal: true}),
            showTo : $b.hasMany('user', {readOnly: true}),
            permissions : $b.hasMany('permission', {
                map : {key : 'user', value : 'value'},
                internal: true
            })
        });

    });

    beforeEach(function () {
        store = $b.Store.create();
        emptyPostJSON = {
            comments: [],
            likes: [],
            views: [],
            permissions: {},
            showTo: []
        };

        emptyCommentJSON = {
            likes: [],
            showTo: [],
            views: []
        };
        store.addModels(Post, User, Comment, Permission);
    });

    afterEach(function () {
        store.destroy(true);
    });

    after(function () {
    });

    it('should properly deserialize and serialize hasManys.', function () {

        var i,
            json,
            user,
            post,
            users;

        users = [];

        for (i = 1; i <= 5; i ++) {
            user = User.create({id : i, name : 'User #' + i});
            store.add('user', user);
            users.push(user);
        }

        json = {
            content : 'post....',
            likes : [3, 2, 5]
        };

        post = Post.create();
        store.add('post', post);
        post.deserialize(json);

        expect(post.likes.length).to.equal(3);

        expect(post.likes.get(0)).to.equal(users[2]);
        expect(post.likes.get(1)).to.equal(users[1]);
        expect(post.likes.get(2)).to.equal(users[4]);

        expect(post.serialize()).to.deep.equal($b.extend(emptyPostJSON, json));
    });

    it('should properly deserialize and serialize embedded hasManys.', function () {

        var json,
            post,
            expectation;

        json = {
            comments : [
                {content : 'comment 1'},
                {content : 'comment 2'},
                {content : 'comment 3'},
                {content : 'comment 4'},
                {content : 'comment 5'}
            ]
        };

        post = Post.create();
        store.add('post', post);
        post.deserialize(json);

        expect(post.comments.length).to.equal(5);
        expect(post.comments.get(0).content).to.equal('comment 1');
        expect(post.comments.get(1).content).to.equal('comment 2');
        expect(post.comments.get(2).content).to.equal('comment 3');
        expect(post.comments.get(3).content).to.equal('comment 4');
        expect(post.comments.get(4).content).to.equal('comment 5');

        expectation = $b.extend(emptyPostJSON, json);
        expectation.comments.forEach(function (v, k, a) {
            a[k] = $b.extend({}, emptyCommentJSON, v);
        });

        expect(post.serialize()).to.deep.equal(expectation);
    });

    it('should properly deserialize and serialize mapped hasManys.', function () {

        var i,
            json,
            post,
            user,
            users;

        users = [];

        for (i = 1; i <= 5; i ++) {
            user = User.create({id : 'user' + i, name : 'User #' + i});
            store.add('user', user);
            users.push(user);
        }
        // Simple permissions. 0 = none, 1 = read, 2 = write, 3 = delete

        json = {
            permissions : {
                'user1' : 0,
                'user2' : 1,
                'user3' : 2,
                'user4' : 3
            }
        };

        post = Post.create();
        store.add('post', post);
        post.deserialize(json);

        expect(post.permissions.length).to.equal(4);
        expect(post.permissions.get(1).user).to.equal(users[1]);

        expect(post.permissions.get(0).canRead).to.equal(false);
        expect(post.permissions.get(0).canWrite).to.equal(false);
        expect(post.permissions.get(0).canDelete).to.equal(false);

        expect(post.permissions.get(3).canRead).to.equal(true);
        expect(post.permissions.get(3).canWrite).to.equal(true);
        expect(post.permissions.get(3).canDelete).to.equal(true);

        expect(post.serialize()).to.deep.equal($b.extend(emptyPostJSON, json));
    });

    it('should properly deserialize and serialize complex relationships.', function () {

        var i,
            json,
            post,
            expectation;

        for (i = 1; i <= 5; i ++) {
            store.add('user', User.create({id : i, name : 'User #' + i}));
        }

        json = {
            author : 1,
            content : 'post...',
            comments : [
                {content : 'comment 1', author : 1, likes : [3, 2, 5]},
                {content : 'comment 2', author : 2},
                {content : 'comment 3', author : 3, likes : [2]},
                {content : 'comment 4', author : 4},
                {content : 'comment 5', author : 5, likes : [1, 5]}
            ],
            likes : [1, 3]
        };

        post = Post.create();
        store.add('post', post);
        post.deserialize(json);

        expect(post.comments.get(2)).to.be.an.instanceOf(Comment);
        expect(post.comments.get(2).author).to.be.an.instanceOf(User);
        expect(post.comments.get(0).likes.get(0)).to.be.an.instanceOf(User);

        expectation = $b.extend(emptyPostJSON, json);
        expectation.comments.forEach(function (v, k, a) {
            a[k] = $b.extend({}, emptyCommentJSON, v);
        });

        expect(post.serialize()).to.deep.equal(expectation);
    });

    it('should properly deserialize and serialize complex relationships with filters.', function () {

        var i,
            json,
            post;

        for (i = 1; i <= 5; i ++) {
            store.add('user', User.create({id : i, name : 'User #' + i}));
        }

        json = {
            author : 1,
            content : 'post...',
            comments : [
                {content : 'comment 1', author : 1, likes : [3, 2, 5]},
                {content : 'comment 2', author : 2},
                {content : 'comment 3', author : 3, likes : [2]},
                {content : 'comment 4', author : 4, showTo: [{name: 'ralph'}]},
                {content : 'comment 5', author : 5, likes : [1, 5], views: [1, 5]}
            ],
            likes : [1, 3],
            views: [1, 5],
            showTo: [],
            permissions : {
                'user1' : 0,
                'user2' : 1,
                'user3' : 2,
                'user4' : 3
            }

        };

        Post.likes = $b.hasMany('user', {internal: true});

        post = Post.create();
        store.add('post', post);
        post.deserialize(json, false, function (meta) {
            return !meta.options.readOnly;
        });

        post.comments.content[3].showTo.content.push(User.create({name: 'bart'}));

        expect(post.serialize(function (meta) {
            return !meta.options.internal;
        })).to.deep.equal({
            author : 1,
            content : 'post...',
            comments : [
                {content : 'comment 1', author : 1, likes : [3, 2, 5], showTo: []},
                {content : 'comment 2', author : 2, likes : [], showTo: []},
                {content : 'comment 3', author : 3, likes : [2], showTo: []},
                {content : 'comment 4', author : 4, likes : [], showTo: [{name: 'bart'}]},
                {content : 'comment 5', author : 5, likes : [1, 5], showTo: []}
            ],
            likes : [1, 3],
            showTo: []
        });
    });

    it('should properly revert hasManys.', function () {

        var i,
            json,
            originalSerialized,
            post;

        for (i = 1; i <= 5; i ++) {
            store.add('user', User.create({id : i, name : 'User #' + i}));
        }

        json = {
            author : 1,
            content : 'post...',
            comments : [
                {content : 'comment 1', author : 1, likes : [3, 2, 5]},
                {content : 'comment 2', author : 2},
                {content : 'comment 3', author : 3, likes : [2]},
                {content : 'comment 4', author : 4},
                {content : 'comment 5', author : 5, likes : [1, 5]}
            ],
            likes : [1, 3]
        };

        post = Post.create();
        store.add('post', post);
        post.deserialize(json);

        post.comments.get(0).content = 'dasfsafsdafa';

        originalSerialized = $b.extend(emptyPostJSON, json);
        originalSerialized.comments.forEach(function (v, k, a) {
            a[k] = $b.extend({}, emptyCommentJSON, v);
        });

        expect(post.serialize()).to.not.deep.equal(originalSerialized);

        post.revert();
        expect(post.serialize()).to.deep.equal(originalSerialized);
    });
});
