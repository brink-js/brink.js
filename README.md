# brink.js
####The modular MVC framework

---------------------
#####[API Docs](http://brinkjs.com/ "Brink.js API Docs")

- Works in the browser and node.js.
- No external dependencies.
- Stays out of your way.
- < 10kb (minified and gzipped)
- Solves low-level problems with as little magic and opinion as possible.
- Use as much or as little of it as you want.
- Easily use side-by-side with <a href="http://jsfiddle.net/gigafied/VkebS/233/" target="_blank">ReactJS</a> or Angular.

---------------------

#### Core Features

- Inheritance
- Two-way data binding
- Computed properties

#### Opt-In Features

- Dependency management & injection
- Build tool

###### Not yet implemented and/or documented:
- Models & Collections
- Promise based publish/subscribe
- DOM-aware client-side templating

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

Data binding works by using `Object.defineProperty()` in browsers that support it (IE9+ and evergreen browsers), and falling back to dirty-checking for browsers that don't. The dirty-checking is still highy efficient as it only checks properties that are bound or watched.

What this means though is that for browers that don't support `Object.defineProperty()` bindings are not propagated instantly.

To support instant bindings in <= IE8, you can call `get()` to get properties and `set()` to set them.

Usually though, you don't need instantaneous bindings and you can get and set properties like any normal object in all browsers. Brink will make sure your changes get propagated on the next run loop.

Watchers are not invoked immediately when a property changes, they are called every run loop if their watched properties have changed. This means that even if you change a property multiple times in one run loop, the watcher will only be called once (in the next run loop).

#### Computed Properties

Computed properties are properties that are dependent on other values.

While you could setup watcher functions to watch for property changes, then update
the dependent property, using computed properties is far less cumbersome:

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

console.log(b.sum); // 15

````

Computed properties can have getters and setters:

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

You can bind properties to computed properties.

----------------------------

#### Building

    $ npm install
    $ node tasks/build

#### Running Unit Tests

    $ npm install
    $ node tasks/test
