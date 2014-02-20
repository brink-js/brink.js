# brink.js

Brink is a highly-modular and extendable MVC framework.

The web is ever-evolving and maintaining a monolithic JS framework is just not practical.

Brink's focus is on solving low-level problems with as little magic and opinion as possible.
Brink will never solve everything, nor should it. 

## Features

- Models/Collections
- Computed properties
- Two-way data binding
- Pub/sub model for loose coupling
- DOM-aware client-side templating

## Data Binding

Bindings enable you to keep two or more properties in sync.
Declare the binding and Brink makes sure that chnages are
propagated.

```javascript

var a,
    b;

a = $b.Object.create({
    color : 'green'
};

b = $b.Object.create({
    color : $b.binding(a, 'green');
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

## Computed Properties

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
            return this.prop1 + this.prop2;
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

console.log(b.firstName); // Joe
console.log(b.lastName); // Schmoe

````

You can bind computed properties to other properties or other computed properties.
