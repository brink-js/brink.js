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

- Inheritance
- Two-way Data Binding
- Computed Properties
- Promise-based Publish/Subscribe
- Models + Collections
- No `get()` or `set()`, uses ES5 property descriptors
- IE9 + support

-----------------------------

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

By specifying the `watch` array, anytime `prop1` or `prop2` changes, `sum` will also be marked as dirty and any watchers
watching `sum` will be invoked.

----------------------------

#### Documentation

- [API Docs](http://brinkjs.com/ "Brink.js API Docs")
- [Unit Tests](https://github.com/brink-js/brink.js/tree/master/tests/brink "Unit Tests")

#### Building

Clone this repo, then :

    $ cd brink.js
    $ npm install
    $ node tasks/build

Files are be written to the `dist` dir.

#### Running Unit Tests

    $ npm install
    $ node tasks/test
