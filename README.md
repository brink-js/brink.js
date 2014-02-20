# brink.js
#####A highly-modular and extendable M*C framework.

- Solves low-level problems with as little magic and opinion as possible.
- Is NOT a monolothic framework. The web is ever-evolving and maintaining a large code base is just not practical.
- Is less than 10kb minified and gzipped.
- Focuses on extensibiity and granularity. Use as much or as little of it as you want.
- Plays nice with other frameworks. Easily use side-by-side with ReactJS or Angular.

#### Features

- Models/Collections
- Computed properties
- Two-way data binding
- Pub/sub for loose coupling
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
    color : $b.bindTo(a, 'green')
});

console.log(b.color); // 'green'

b.color = 'red';

console.log(a.color); // 'red'

```
You can also set up watcher functions:

```javascript

var a;

a = $b.Object.create({
    color : 'green',
    
    init : function () {
        this.watch(this.colorChanged, 'color');
    },
    
    colorChanged : function () {
        console.log('The color has changed to ' + this.color + '!');
    }
};

````

######How it works.

Data binding works by using `Object.defineProperty()` in browsers that support it (IE9+ and evergreen browsers), and falling back to dirty-checking for browsers that don't. The dirty-checking is still highy efficient as it only checks properties that are bound or watched.

What this means though is that for browers that don't support `Object.defineProperty()` bindings are not propagated instantly.

To work around this in older browers, you can call `a.set('color', 'blue')`. Or, if you don't need instantaneous bindings (usually you don't) and don't mind the fallback to dirty-checking you can just set values like you normally would and bindings will update on the next run loop.

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

console.log(b.sum); // 15

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

console.log(b.fullName); // Joe Schmoe

b.fullName = 'John Doe';

console.log(b.firstName); // John
console.log(b.lastName); // Doe

````

You can bind computed properties to other properties or other computed properties.
