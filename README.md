# brink.js

##### Data-binding, observers and computed properties in Node and the browser.

- [Two-way Data Binding](#dataBinding)
- [Observers](#observers)
- [Computed Properties](#computedProps)
- [Inheritance](#inheritance)
- [Publish/Subscribe](#pubsub) (promise-based)
- [Data Layer][#data]
- No `get()` or `set()`, uses ES5 property descriptors
- IE9 + support
- 20kb (minified and gzipped)
- Works in the browser and node.js.

-----------------------------

###### How it works.

Data binding works by using `Object.defineProperty()` to define getters and setters for your properties behind the scenes.

Watchers are not invoked immediately when a property changes, they are automatically debounced. So even if you change a property multiple times in one run loop, the watcher will only be called once (in the next run loop).

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

-----------------------------
<a name="observers"></a>
#### Observers

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

-----------------------------
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

<a name="dataBinding"></a>
#### Data Layer

Brink's Model, Store and Adapter Classes offer you a flexible and easy way to work with your data layer.

Using Brink.attr(), Brink.belongsTo() and Brink.hasMany() you can define simple or complex model
structures.


```javascript

var MyStore = $b.Store.create();

var Person = $b.Model.extend({

    primaryKey : 'id',
    modelKey : 'person',

    adapter : $b.RESTAdapter.create(),
    store : MyStore,

    schema : $b.Schema.create({
        firstName : $b.attr(String),
        lastName : $b.attr(String),

        children : $b.hasMany('person'),
        spouse : $b.belongsTo('person')
    })
});

var dad = Person.create({
    firstName : 'John',
    lastName : 'Doe'
});

var mom = Person.create({
    firstName : 'Jane',
    lastName : 'Doe'
});

var child1 = Person.create({
    firstName : 'Mary',
    lastName  : 'Doe'
});

var child2 = Person.create({
    firstName : 'Bob',
    lastName  : 'Doe'
});

dad.spouse = mom;
dad.children.push(child1, child2);

$b.Q.all([
    mom.save(),
    child1.save(),
    child2.save()
]).then(function () {
    dad.save();
});

```

Both `hasMany()` and `belongsTo()` relationships serialize as the primary key values of the records they represent.

This is why we call `save()` on the mom and children before we save the `dad` record, otherwise they would not have primary keys.

The reverse happens when we de-serialize. This means that if we were to do :

```javascript

var dad = Person.create();
dad.deserialize({spouse : '123'});

console.log(dad.spouse);

```
`dad.spouse` would be a Person instance, not the String value we gave it when we deserialized.

If there is a record with that primary key value in the Store, it will be used, however if there is no
corresponding record in the store, then a new record will be created with it's primary key set to the correct value.

Thus, expanding on the above, if we wanted to get the name of the spouse we could do :

```javascript

var dad = Person.create();
dad.deserialize({spouse : '123'});

function logSpouseName () {
    console.log(dad.spouse.firstName + ' ' + dad.spouse.lastName);    
}

if (dad.spouse.isLoaded) {
    logSpouseName();
}

else {
    dad.spouse.fetch().then(logSpouseName);
}

```

`Brink.attr()`, `Brink.hasMany()` and Brink.belongsTo()` all take a second argument of `options` when you
are declaring them.

```javascript

var MyStore = $b.Store.create();

var Name = $b.Model.extend({
    primaryKey : null,
    schema : $b.Schema.create({
        firstName  : $b.attr(String, {key : 'first_name', defaultValue : 'John'}),
        lastName  : $b.attr(String, {key : 'last_name', defaultValue : 'Doe'})
    })    
});

var Person = $b.Model.extend({

    primaryKey : 'id',
    modelKey : 'person',

    adapter : $b.RESTAdapter.create(),
    store : MyStore,

    schema : $b.Schema.create({
        name  : $b.belongsTo('name', {embedded : true})
    })
});

```

`options` which apply to all `attr()`, `belongsTo()` and `hasMany()` are `key` and `defaultValue`. 

`defaultValue` allows you to specify exactly that, a default value to use for all records created.

`key` allows you to specify a different 
property name to use in your model, without affecting the serialization or deserialization of your models.

```javascript

var name = Name.create();
name.deserialize({first_name : 'Bob', last_name : 'Smith'})l

console.log(name.firstName); // Bob
console.log(name.lastName); // Smith

console.log(name.serialize()); // {first_name : 'Bob', last_name : 'Smith'}

```

`hasMany()` and `belongsTo()` relationships have another option they can use, `embedded`.

Setting `embedded` to true overrides the default behavior of relationships in that they won't serialize
and deserialize as primary keys, instead they will `serialize()` the whole record nested.

```javascript

var MyStore = $b.Store.create();

var Name = $b.Model.extend({
    primaryKey : null,
    schema : $b.Schema.create({
        firstName  : $b.attr(String, {key : 'first_name', defaultValue : 'John'}),
        lastName  : $b.attr(String, {key : 'last_name', defaultValue : 'Doe'})
    })    
});

var Person = $b.Model.extend({

    primaryKey : 'id',
    modelKey : 'person',

    adapter : $b.RESTAdapter.create(),
    store : MyStore,

    schema : $b.Schema.create({
        name  : $b.belongsTo('name', {embedded : true})
    })
});

var person = Person.create();
person.deserialize({name : {
    first_name : 'Bob',
    last_name : 'Smith'  
}});

console.log(person.serialize()); // {name : {first_name : 'Bob', last_name : 'Smith'}}

```

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

#### Contributors

- [Taka Kojima][gigafied]
- [Patrick Weygand][derduher]

[gigafied]: https://github.com/gigafied
[derduher]: https://github.com/derduher

#### License

	This software is released under the terms of the MIT License.

	(c) 2015 Taka Kojima (the "Author").
	All Rights Reserved.

	Permission is hereby granted, free of charge, to any person
	obtaining a copy of this software and associated documentation
	files (the "Software"), to deal in the Software without
	restriction, including without limitation the rights to use,
	copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the
	Software is furnished to do so, subject to the following
	conditions:

	The above copyright notice and this permission notice shall be
	included in all copies or substantial portions of the Software.

	Distributions of all or part of the Software intended to be used
	by the recipients as they would use the unmodified Software,
	containing modifications that substantially alter, remove, or
	disable functionality of the Software, outside of the documented
	configuration mechanisms provided by the Software, shall be
	modified such that the Author's bug reporting email addresses and
	urls are either replaced with the contact information of the
	parties responsible for the changes, or removed entirely.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
	OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
	NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
	HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
	WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
	FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
	OTHER DEALINGS IN THE SOFTWARE.

	Except where noted, this license applies to any and all software
	programs and associated documentation files created by the
	Author, when distributed with the Software.
