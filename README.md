# brink.js
#####A highly-modular and extendable M*C framework.

- Solves low-level problems with as little magic and opinion as possible.
- Is NOT a monolothic framework. Maintaining a large code base is just not practical.
- Is less than 10kb minified and gzipped.
- Focuses on extensibiity and granularity. Use as much or as little of it as you want.
- Plays nice with other frameworks. Easily use side-by-side with ReactJS or Angular.

---------------------

#### Core Features

- Two-way data binding
- Computed properties
- Works in the browser and node.js

#### Pluggable Features

- Dependency management & injection (with build tool)


- ###### Not yet implemented and/or documented:
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
};

b = $b.Object.create({
    color : $b.bindTo(a, 'color')
});

b.color; // 'green'
b.color = 'red';
a.color; // 'red'

```
You can bind any property of a `$b.Object` instance to any other property of a `$b.Object` instance.
The `$b.bindTo()` helper is there during object definition/creation, however you can bind properties at any time:

```javascript

var a,
    b;

a = $b.Object.create();
b = $b.Object.create();

a.property('color').bindTo(b, 'color');

a.color = 'green';

b.color; // 'green'
b.color = 'red';
a.color; // 'red'

````

You can also set up functions to watch for property changes:

```javascript

var a;

a = $b.Object.create({
    color : 'green',
    
    init : function () {
        this.watch('color', this.colorChanged);
    },
    
    colorChanged : function () {
        this.color; // red
    }
};

this.color = 'red';

````

######How it works.

Data binding works by using `Object.defineProperty()` in browsers that support it (IE9+ and evergreen browsers), and falling back to dirty-checking for browsers that don't. The dirty-checking is still highy efficient as it only checks properties that are bound or watched.

What this means though is that for browers that don't support `Object.defineProperty()` bindings are not propagated instantly.

To support instant bindings in <= IE8, you can call `get()` to get properties and `set()` to set them. 

Usually though, you don't need instantaneous bindings and you can get and set properties like any normal object in all browsers. Brink will make sure your changes get propagated on the next run looop.

Watchers are not invoked immediately when a property changes, they are called every run loop if their watched properties have changed. This means that even if you change a property multiple times in one run loop, the watcher will only be called once (in the next run loop).

#### Computed Properties

Computed properties are properties that are dependent on other values.

While you could setup watcher functions to watch for property changes, then update 
the dependent property, using computed properties is far less cumbersome:

```javascript

var A,
    b;

A = $b.Object({

    prop1 : 1,
    prop2 : 2,
    
    sum : $b.computed({

        watch : ['prop1', 'prop2'],

        get : function () {
            return this.prop1 + this.prop2;
        }

    })
};

b = A.create();

b.prop1 = 5;
b.prop2 = 10;

b.sum; // 15

````

Computed properties can have getters and setters:

```javascript

var A,
    b;

A = $b.Object({

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
};

b = A.create({
    firstName : 'Joe',
    lastName : 'Schmoe'
});

b.fullName; // Joe Schmoe

b.fullName = 'John Doe';

b.firstName; // John
b.lastName; // Doe

````

You can bind properties to computed properties.

----------------------------

#### Building

    $ npm install
    $ node tasks/build.js
        
#### Running Unit Tests

    $ npm install
    $ node tasks/test.js
