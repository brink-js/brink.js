require('./dist/brink.js');

$b.init(function () {


    var Test = $b.Class({

        prop1 : 'test',
        prop2 : 'test2',

        computed : $b.computed(function () {
            return this.prop1 + this.prop2;
        }, 'prop1', 'prop2'),

        classProps : {
            __name : "fdfadsf"
        }
    });

    console.dir(Test);

    var a,
        i,
        t;

    i = 0;

    a = function (changedProps) {

        console.log('zzz', t.computed);
        //console.log(t.prop1, t.prop2, t.computed);
    }

    while (i < 10000) {
        t = Test.create({
            prop1 : 1,
            prop2 : 2
        });
        i ++;
        t.watch(a, 'computed');
    }


    setInterval(function(){

        t.prop1 ++;
        t.prop2 ++;

        //console.log('a', t.prop1, t.prop2);
        //console.log(t.get('prop1'));

        //t.unwatch(a);

    }, 10);
});


/*

var PostController = $b.Controller.extend({

    prop1 : 'aaa',

    computed : $b.computed({

        watch : 'prop1',

        get : function () {
            return this.prop1;
        },

        set : function (val) {
            this.prop1 = val;
        }
    })

});



var PostController = Ember.Controller.extend({

    prop1 : 'aaa',

    computed : function (key, val) {

        if (val.length === 2) {
            this.set('prop1', val);
        }

        return this.get('prop1');

    }.property('prop1')
})*/