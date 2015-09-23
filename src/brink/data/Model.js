/***********************************************************************

Brink's Model, Store and Adapter Classes offers you flexible and easy way to work with your data layer.

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

Looking at the example above, it might be a bit confusing why we are saving the mom and children
before we save the `dad` record.

The reason for this is that the mom and children do not yet exist, thus if we tried to `serialize()` the `dad`
record they would come back with null primary key values.

@module Brink
@submodule data

************************************************************************/

$b(

    [
        '../core/Class',
        '../core/Array',
        '../utils/get',
        '../utils/set',
        '../utils/bindTo',
        '../utils/computed'
    ],

    function (Class, BrinkArray, get, set, bindTo, computed) {

        'use strict';

        var Model = Class({

            /***********************************************************************

            The Model Class is what all records are created from. Models provide
            a uniform way to work with your records no matter what your backend
            or persistence layer is, even if you mix and match across a project.

            @module Brink
            @submodule data

            @class Brink.Model
            @constructor
            ************************************************************************/

            /***********************************************************************
            The Store instance this model uses. You should only have one Store instance used
            across your entire project and models.

            @property store
            @type Brink.Store
            @default null
            ************************************************************************/

            store : null,

            /***********************************************************************
            The Adapter instance you want to use for this model.

            @property adapter
            @type Brink.Adapter
            @default null
            ************************************************************************/
            adapter : null,

            /***********************************************************************
            The modelKey you want to use for the model. This will likely influence your adapter.
            i.e. for a RESTAdapter your modelKey would be used in the url for all requests
            made for instances of this model. For a MongooseAdapter,
            this would likely dictate the name of your tables.

            @property modelKey
            @type String
            @default null
            ************************************************************************/

            modelKey : null,

            /***********************************************************************
            The collectionKey you want to use for the model. Much like modelKey this is the
            pluralized form of modelKey. This will be auto-defined as your modelKey + 's' unless
            you explicity define it.

            @property collectionKey
            @type String
            @default null
            ************************************************************************/

            collectionKey : null,

            /***********************************************************************
            The property name of the primaryKey you are using for this Model.

            @property primaryKey
            @type String
            @default 'id'
            ************************************************************************/
            primaryKey : 'id',

            /***********************************************************************
            A Brink.Array of all the property names that have been changed since the
            last save() or fetch().

            @property dirtyAttributes
            @type Brink.Array
            @default null
            ************************************************************************/
            dirtyAttributes : null,

            /***********************************************************************
            Whether or not the record is currently saving.

            @property isSaving
            @type Boolean
            @default false
            ************************************************************************/

            isSaving : false,

            /***********************************************************************
            Whether or not the record is currently being fetched.

            @property isFetching
            @type Boolean
            @default false
            ************************************************************************/

            isFetching : false,

            /***********************************************************************
            Whether or not the record has been fetched/loaded.

            @property isLoaded
            @type Boolean
            @default false
            ************************************************************************/
            isLoaded : false,

            /***********************************************************************
            Whether or not the record is currently being deleted.

            @property isDeleting
            @type Boolean
            @default false
            ************************************************************************/

            isDeleting : false,

            /***********************************************************************
            Whether or not the record has one or more changed properties since the
            last save() or fetch().

            @property isDirty
            @type Boolean
            @default false
            ************************************************************************/

            isDirty : computed(function () {
                return !!get(this, 'dirtyAttributes.length');
            }, 'dirtyAttributes.length'),

            /***********************************************************************
            Opposite of isDirty.

            @property isClean
            @type Boolean
            @default true
            ************************************************************************/

            isClean : computed(function () {
                return !get(this, 'isDirty');
            }, 'isDirty'),

            /***********************************************************************
            Is the record new? Determined by the existence of a primary key value.

            @property isNew
            @type Boolean
            @default false
            ************************************************************************/

            isNew : computed(function () {
                return !get(this, 'pk');
            }, 'pk'),

            /***********************************************************************
            Get the primary key value of the record.

            @property pk
            @type String|Number
            ************************************************************************/
            pk : computed({

                get : function () {
                    return this.primaryKey ? get(this, this.primaryKey) : null;
                },

                set : function (val) {
                    return this.primaryKey ? set(this, this.primaryKey, val) : null;
                }
            }),

            __init : function (o) {

                var p,
                    desc,
                    meta,
                    pMeta,
                    cMeta,
                    attributes,
                    relationships;

                this.__callInit = false;

                this._super.call(this);

                meta = this.__meta;
                cMeta = this.constructor.__meta;
                meta.data = {};

                meta.isInitialized = false;

                if (cMeta.attributes) {
                    meta.attributes = cMeta.attributes;
                    meta.relationships = cMeta.relationships;
                }

                else {

                    attributes = [];
                    relationships = [];

                    for (p in meta.properties) {
                        desc = meta.properties[p];
                        pMeta = desc.meta && desc.meta();

                        if (pMeta) {
                            if (pMeta.isAttribute) {
                                attributes.push(p);
                            }

                            else if (pMeta.isRelationship) {
                                relationships.push(p);
                            }
                        }
                    }

                    meta.attributes = cMeta.attributes = attributes;
                    meta.relationships = cMeta.relationships = relationships;
                }

                meta.pristineData = {};
                meta.pristineContent = {};

                if (typeof o === 'object') {
                    this.deserialize(o);
                }

                set(this, 'dirtyAttributes', BrinkArray.create());

                meta.isInitialized = true;

                if (this.init) {
                    this.__callInit = true;
                    this.init.apply(this, arguments);
                }

                return this;
            },

            /***********************************************************************
            Serialize a record.

            @method serialize
            @param {Function} filter A custom function to filter out attributes as you see fit.
            @return {Object}
            ************************************************************************/

            serialize : function (filter) {

                var i,
                    l,
                    p,
                    pk,
                    key,
                    val,
                    desc,
                    json,
                    meta,
                    pMeta,
                    props,
                    attributes,
                    relationships;

                meta = this.__meta;

                attributes = meta.attributes;
                relationships = meta.relationships;

                props = attributes.concat(relationships);

                json = {};

                for (i = 0, l = props.length; i < l; i ++) {
                    p = props[i];
                    desc = this.prop(p);
                    pMeta = desc.meta();
                    key = pMeta.options.key || p;

                    val = pMeta.serialize.call(this, filter);
                    if (typeof val !== 'undefined') {
                        set(json, key, val);
                    }
                }

                if (this.primaryKey) {
                    pk = get(this, 'pk');
                    if (typeof pk !== 'undefined') {
                        set(json, this.primaryKey, pk);
                    }
                }

                return json;
            },

            /***********************************************************************
            De-serialize a record.

            @method deserialize
            @param  {Object} json The object containing the properties you want to deserialize.
            @param  {Boolean} override Whether or not you want to update properties that have already been dirtied.
            @param {Function} filter A custom function to filter out attributes as you see fit.
            @return {Model}
            ************************************************************************/

            deserialize : function (json, override, filter) {

                var i,
                    p,
                    key,
                    val,
                    desc,
                    meta,
                    pMeta,
                    props,
                    dirty,
                    attributes,
                    relationships;

                meta = this.__meta;

                if (!json) {
                    return this;
                }

                dirty = get(this, 'dirtyAttributes') || [];
                attributes = meta.attributes;
                relationships = meta.relationships;

                props = attributes.concat(relationships);

                i = props.length;
                while (i--) {
                    p = props[i];
                    desc = this.prop(p);
                    pMeta = desc.meta();

                    if (!override && ~dirty.indexOf(p)) {
                        continue;
                    }

                    key = pMeta.options.key || p;
                    val = get(json, key);

                    if (typeof val !== 'undefined' && (!filter || filter(pMeta, key, val))) {
                        val = pMeta.deserialize.call(this, val, override, filter);
                        meta.pristineData[p] = val;
                    }
                }

                if (this.primaryKey && json[this.primaryKey]) {
                    set(this, 'pk', json[this.primaryKey]);
                }

                if (override) {
                    set(this, 'dirtyAttributes.content', []);
                }

                set(this, 'isLoaded', true);

                return this;
            },

            /***********************************************************************
            Saves any changes to this record to the persistence layer (via the adapter).
            Also adds this record to the store.

            @method save
            @return {Promise}
            ************************************************************************/

            save : function () {

                var self,
                    isNew;

                self = this;
                isNew = get(this, 'isNew');
                set(this, 'isSaving', true);

                if (isNew && self.store) {
                    self.store.add(self);
                }

                return this.adapter.saveRecord(this).then(function (json) {
                    self.deserialize(json, true);
                    set(self, 'isSaving', false);
                    set(self, 'isLoaded', true);
                });
            },

            /***********************************************************************
            Fetches and populates this record (via the adapter).

            @method fetch
            @return {Promise}
            ************************************************************************/

            fetch : function (override) {

                var self,
                    isNew;

                self = this;
                isNew = get(this, 'isNew');

                $b.assert('Can\'t fetch records without a primary key.', !isNew);

                set(this, 'isFetching', true);

                return this.adapter.fetchRecord(this).then(function (json) {

                    self.deserialize(json, !!override);
                    set(self, 'isFetching', false);
                    set(self, 'isLoaded', true);
                });
            },

            /***********************************************************************
            Deletes this record (via the adapter). Also removes it from the store.

            @method delete
            @return {Promise}
            ************************************************************************/

            delete : function () {

                var self,
                    isNew;

                self = this;
                isNew = get(this, 'isNew');

                set(this, 'isDeleting', true);

                return this.adapter.deleteRecord(this).then(function () {

                    if (self.store) {
                        self.store.remove(this);
                    }

                    self.destroy();
                });
            },

            /***********************************************************************
            Creates and returns a copy of this record, with a null primary key.

            @method clone
            @return {Model}
            ************************************************************************/

            clone : function () {

                var json = this.serialize();

                if (typeof json[this.primaryKey] !== 'undefined') {
                    delete json[this.primaryKey];
                }

                return this.constructor.create(json);
            },

            /***********************************************************************
            Reverts all changes made to this record since the last save() or fetch().

            @method revert
            @return {Model}
            ************************************************************************/

            revert : function (revertRelationships) {

                var i,
                    p,
                    key,
                    desc,
                    meta,
                    pMeta,
                    props,
                    dirty,
                    attributes,
                    relationships;

                meta = this.__meta;

                dirty = get(this, 'dirtyAttributes');
                attributes = meta.attributes;
                relationships = meta.relationships;

                props = attributes.concat(relationships);

                i = props.length;
                while (i--) {
                    p = props[i];
                    desc = this.prop(p);
                    pMeta = desc.meta();

                    key = pMeta.options.key || p;

                    if (
                        pMeta.isAttribute ||
                        (pMeta.isRelationship &&
                        (revertRelationships || pMeta.options.embedded))
                    ) {
                        pMeta.revert.call(this, revertRelationships);
                    }
                }

                return this;
            }
        });

        Model.extend = function () {

            var meta,
                proto,
                SubClass;

            SubClass = Class.extend.apply(this, arguments);
            proto = SubClass.prototype;

            if (proto.url) {
                SubClass.url = proto.url;
            }

            if (proto.primaryKey) {
                SubClass.primaryKey = proto.primaryKey;
            }

            if (proto.modelKey) {
                meta = SubClass.__meta;

                if (!proto.collectionKey) {
                    proto.collectionKey = proto.modelKey.concat('s');
                }

                SubClass.modelKey = proto.modelKey;
                SubClass.collectionKey = proto.collectionKey;

                $b.registerModel(SubClass);
            }

            if (proto.adapter) {
                SubClass.adapter = proto.adapter;
                proto.adapter.registerModel(SubClass);
            }

            return SubClass;
        };

        Model.unregister = function () {
            $b.unregisterModel(this);
        };

        return Model;
    }

).attach('$b');
