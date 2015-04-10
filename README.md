# brink.js
####A Modular JavaScript Framework

---------------------
- Works in the browser and node.js.
- No external dependencies.
- Stays out of your way.
- 20kb (minified and gzipped)
- Use as much or as little of it as you want.
- Easily use side-by-side with React or Angular.

---------------------

#### Core Features

- [Two-way Data Binding](#dataBinding)
- [Computed Properties](#computedProps)
- [Inheritance](#inheritance)
- [Publish/Subscribe](#pubsub) (promise-based)
- Models + Collections
- No `get()` or `set()`, uses ES5 property descriptors
- IE9 + support

-----------------------------

<a name="dataBinding"></a>
#### Data Binding

Bindings enable you to keep two or more properties in sync.
Declare the binding and Brink makes sure that changes get propagated.

```javascript

var a,
    b;

a = $b.Object.create({
    color : 'green'
});

b = $b.Object.create({
    color : $b.bindTo(a, 'color')
});

console.log(b.color); // 'green'
b.color = 'red';
console.log(a.color); // 'red'

a.color = 'blue';
console.log(b.color); // 'blue'

```
You can bind any property of a `$b.Object` instance to any other property of a `$b.Object` instance.
The `$b.bindTo()` helper is there during object definition/creation, however you can bind properties at any time:

```javascript

var a,
    b;

a = $b.Object.create();
b = $b.Object.create();

a.prop('color').bindTo(b, 'color');

a.color = 'green';

console.log(b.color); // 'green'
b.color = 'red';
console.log(a.color); // 'red'

````

You can also set up functions to watch for property changes:

```javascript

var a;

a = $b.Object.create({
    color : 'green',

    init : function () {
        this.watch('color', this.colorChanged.bind(this));
    },

    colorChanged : function () {
        console.log(this.color); // red
    }
});

a.color = 'red';

````

######How it works.

Data binding works by using `Object.defineProperty()` to define getters and setters for your properties behind the scenes.

Watchers are not invoked immediately when a property changes, they are automatically debounced. So even if you change a property multiple times in one run loop, the watcher will only be called once (in the next run loop).

<a name="computedProps"></a>
#### Computed Properties

Computed properties let you define your own getters and setters for a property:

```javascript

var Person = $b.Object.extend({

    firstName : '',
    lastName : '',
    fullName : $b.computed({

        watch : ['firstName', 'lastName'],

        get : function () {
            return [this.firstName, this.lastName].join(' ');
        },

        set : function (val) {
            val = val.split(' ');
            this.firstName = val[0];
            this.lastName = val[1] || '';
            return val.join(' ');
        }
    })
});

var person = Person.create({firstName : 'Jane', lastName : 'Smith'});

console.log(person.fullName); // 'Jane Smith';
person.fullName = 'John Doe';
console.log(person.firstName, person.lastName); // 'John', 'Doe';

````

An added benefit of computed properties is automatically specifying dependencies on other properties. This means you don't need
to write custom watchers to notify Brink a computed property has a new value.

You specify property dependencies by defining a `watch` property:

```javascript

var A,
    b;

A = $b.Object.extend({

    prop1 : 1,
    prop2 : 2,

    sum : $b.computed({

        watch : ['prop1', 'prop2'],

        get : function () {
            return this.prop1 + this.prop2;
        }

    })
});

b = A.create();

b.prop1 = 5;
b.prop2 = 10;

b.watch('sum', function () {
    console.log(b.sum); // 15
});

````

By specifying the `watch` array, anytime `prop1` or `prop2` changes, `sum` will also be marked as dirty and any watchers watching `sum` will be invoked.

-----------------------------
<a name="inheritance"></a>
#### Inheritance

To define a Class, call the `extend()` method on `$b.Class` :

```javascript

var Animal = $b.Class.extend({

    name : '',
    sound : '???',

    say : function (thing) {
        console.log(this.name + ' : ' + thing);
    },

    greet : function () {
        this.say(this.sound);
    }
});

````

You can then extend Animal, by using its `extend()` method :

```javascript

var Dog = Animal.extend({

    sound : 'woof',

    init : function () {
        console.log(this.name + ' created...');
    },

    say : function (thing) {
        this._super(thing + '!');
    }
});

````

You can call `this._super()` within a method to invoke the Parent class' method.

To create an instance of your Class, call the `create()` method of your Class. You can pass
in property values with an optional object.

If you define an `init` method on your Class, that method will be invoked during creation.

```javascript

var fido = Dog.create({name : 'Fido'}); // 'Fido created...'

fido.greet(); // 'Fido : woof!'

````

To

-----------------------------
<a name="pubsub"></a>
#### Publish/Subscribe

Publish/Subscribe is a very good model for loose-coupling your components.
Brink takes it a step further by making it's pub/sub system promise-based.

```javascript

var Publisher = $b.Class.extend({

    doSomething : function (someValue){

        this.publish('something', 'hello!').then(function (response) {
            console.log(response);
        });
    }
});

var Subscriber = $b.Class.extend({

    init : function() {
        this.subscribe('something', this.handleSomething);
    },

    handleSomething : function (n, message) {
        console.log(message);
        return 'received!';
    }
});

var subscriberInstance = Subscriber.create();
var publisherInstance = Publisher.create();

publisherInstance.doSomething(); // 'hello!', 'received!'

````

`subscribe()` takes three arguments. The first two are mandatory, the third is optional. The first, a String, for name of the notification you want to listen for. The second, a function that handles the notification.

The third argument is `priority`. If you have multiple instances listening for a notification, the lower the `priority` the sooner an instance will receive the notification.

`publish()` takes at least one argument. The first argument is the `name` of the notification you are sending. Subsequent arguments will be passed to all subscribers in order (see `message` above).

So, where do promises come in? Subscibers can return values or promises, the publisher's
`then()` method will be invoked at the end of the subscriber chain.

If you replace the `Subscriber` above with the follwing Class, you will see the publishers `then()` invoked 1 second later.

````javascript

var Subscriber = $b.Class.extend({

    init : function() {
        this.subscribe('something', this.handleSomething);
    },

    handleSomething : function (n, message) {

        console.log(message);

        return $b.Q.Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve('received!');
            }, 1000);
        });
    }
});

````

##### Notifications

Each time a subsciber's listener is invoked it receives a `Notification` instance as the first argument. You can think of this much like an `Event` object.

Notifications have two properties that might be of interest to you, `name` and `dispatcher`. Use `name` to get the name of the notification that was sent; this is useful if you have the same method handling multiple notification types. You can use `dispatcher` to see which instance fired the notification.

Notifications also have a very useful `cancel()` method. This is much like `stopPropagation()` for events. When you call `cancel()` any subscribers later in the chain will not hear about that notification, and the publishers `then()` will be invoked when the current method returns. If the method returns a promise, the publishers `then()` will be invoked once the promise is resolved.

````javascript

var Subscriber = $b.Class.extend({

    init : function() {
        this.subscribe('something', this.handleSomething);
    },

    handleSomething : function (n, message) {

        console.log(message);

        n.cancel(); // No other subscribers will hear about this notification.

        return $b.Q.Promise(function (resolve, reject) {

            setTimeout(function () {
                resolve('received!'); // Publisher's `then()` method will be invoked now.
            }, 1000);

        });
    }
});

````

----------------------------

#### Documentation

- [API Docs](http://brinkjs.com/ "Brink.js API Docs")
- [Unit Tests](https://github.com/brink-js/brink.js/tree/master/tests/brink "Unit Tests")

#### Building

Clone this repo, then :

    $ cd brink.js
    $ npm install
    $ node tasks/build

#### Running Unit Tests

    $ npm install
    $ node tasks/test
