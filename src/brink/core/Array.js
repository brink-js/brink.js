$b(

    [
        './Object',
        '../utils/get',
        '../utils/computed',
        '../utils/isBrinkObject'
    ],

    function (Obj, get, computed, isBrinkObject) {

        'use strict';

        var Arr,
            AP;

        AP = Array.prototype;

        Arr = Obj({

            changes : computed(function () {
                return this.getChanges();
            }, ''),

            length : computed(function () {
                return this.content.length;
            }, 'content'),

            content : null,

            oldContent : null,
            pristineContent : null,

            getChanges : function () {
                return {
                    added : [],
                    removed : [],
                    moved : [],
                    updated : this.updatedItems
                };
            },

            init : function (content) {

                var self = this;

                content = content || [];
                this.updatedItems = [];

                content.forEach(function (item) {
                    if (isBrinkObject(item)) {
                        item.__addReference(self, '@item.' + item.__meta.iid, true);
                    }
                });

                this.set('content', content);
                this.set('oldContent', content.concat());
                this.set('length', this.content.length);

                this.contentDidChange = this.contentDidChange.bind(this);
                this.watch('content', this.contentDidChange);
            },

            get : function (i) {

                if (isNaN(i)) {
                    return Obj.prototype.get.apply(this, arguments);
                }

                return this.content[i];
            },

            set : function (i, val) {

                if (isNaN(i)) {
                    return Obj.prototype.set.apply(this, arguments);
                }

                this.replaceAt(i, val);
                return val;
            },

            find : function (fn, scope) {

                var i,
                    l,
                    r,
                    t;

                r = [];

                for (i = 0, l = this.content.length; i < l; i ++) {
                    t = this.content[i];
                    if (fn.call(scope, t, i, this)) {
                        return t;
                    }
                }

                return null;
            },

            findBy : function (key, val) {

                return this.find(function (item) {
                    return get(item, key) === val;
                });
            },

            filter : function () {

                var filtered = [];

                filtered = AP.filter.apply(this.content, arguments);
                return Arr.create(filtered);
            },

            filterBy : function (key, val) {

                return this.filter(function (item) {
                    return get(item, key) === val;
                });
            },

            forEach : function (fn, scope) {

                var i,
                    l;

                for (i = 0, l = this.content.length; i < l; i ++) {
                    fn.call(scope, this.content[i], i, this);
                }

            },

            concat : function () {
                return Arr.create(this.content.concat());
            },

            insertAt : function (i, o) {
                this.splice(i, 0, o);
                return this.get('length');
            },

            indexOf : function (o) {
                return this.content.indexOf(o);
            },

            push : function () {

                var i;

                for (i = 0; i < arguments.length; i ++) {
                    this.insertAt(get(this, 'length'), arguments[i]);
                }

                return get(this, 'length');
            },

            pop : function (i) {
                i = get(this, 'length') - 1;
                return this.removeAt(i);
            },

            remove : function (o, i) {

                i = this.content.indexOf(o);

                if (~i) {
                    return this.removeAt(i);
                }

                return false;
            },

            removeAt : function (i, r) {
                r = AP.splice.call(this.content, i, 1);
                this.contentDidChange();
                return r[0];
            },

            replace : function (a, b, i) {

                i = this.content.indexOf(a);

                if (~i) {
                    return this.replaceAt(i, b);
                }
            },

            replaceAt : function (i, o) {
                this.removeAt(i);
                return this.insertAt(i, o);
            },

            splice : function (i, l) {

                var j,
                    rest,
                    removed;

                removed = [];
                rest = AP.splice.call(arguments, 2, arguments.length);

                if (l > 0) {

                    j = i;
                    l = i + l;

                    while (j < l) {
                        removed.push(this.removeAt(i));

                        j ++;
                    }
                }

                for (j = 0; j < rest.length; j ++) {
                    this.content.splice(i + j, 0, rest[j]);
                    this.contentDidChange();
                }

                return removed;
            },

            shift : function () {
                return this.removeAt(0);
            },

            unshift : function () {
                var i = arguments.length;
                while (i--) {
                    this.insertAt(0, arguments[i]);
                }

                return get(this, 'length');
            },

            reverse : function () {
                var r;
                if (!this.pristineContent) {
                    this.pristineContent = this.content.concat();
                }

                r = AP.reverse.apply(this.content, arguments);
                this.contentDidChange();
                return this;
            },

            sort : function () {

                if (!this.pristineContent) {
                    this.pristineContent = this.content.concat();
                }

                AP.sort.apply(this.content, arguments);
                this.contentDidChange();
                return this;
            },

            reset : function () {
                this.content = this.pristineContent;
                this.pristineContent = null;
            },

            willNotifyWatchers : function () {

                var addedListeners,
                    movedListeners,
                    removedListeners;

                this.getChanges = function () {

                    var i,
                        self,
                        changes,
                        newItem,
                        oldItem,
                        newIndex,
                        oldIndex,
                        oldContent,
                        newContent;

                    self = this;

                    oldContent = this.oldContent;
                    newContent = this.content;

                    changes = {
                        added : [],
                        removed : [],
                        moved : [],
                        updated : this.updatedItems
                    };

                    for (i = 0; i < Math.max(oldContent.length, newContent.length); i ++) {

                        newItem = newContent[i];
                        oldItem = oldContent[i];

                        if (newItem === oldItem) {
                            continue;
                        }

                        if (oldItem) {

                            newIndex = newContent.indexOf(oldItem);

                            // Has it been moved?
                            if (~newIndex) {
                                changes.moved.push({
                                    oldIndex : i,
                                    newIndex : newIndex,
                                    item : oldItem
                                });
                            }

                            // Nope, it's been removed
                            else {
                                changes.removed.push({
                                    index : i,
                                    item : oldItem
                                });
                            }
                        }

                        else {

                            oldIndex = oldContent.indexOf(newItem);

                            // Has it been moved?
                            if (~oldIndex) {
                                changes.moved.push({
                                    oldIndex : oldIndex,
                                    newIndex : i,
                                    item : newItem
                                });
                            }

                            // Nope, it's been added
                            else {
                                changes.added.push({
                                    index : i,
                                    item : newItem
                                });
                            }
                        }
                    }

                    this.getChanges = function () {
                        return changes;
                    };

                    changes.added.forEach(function (tmp) {
                        self.trigger('added', tmp);
                        if (isBrinkObject(tmp.item)) {
                            tmp.item.__addReference(self, '@item.' + tmp.item.__meta.iid, true);
                        }
                    });

                    changes.removed.forEach(function (tmp) {
                        self.trigger('removed', tmp);
                        if (isBrinkObject(tmp.item)) {
                            tmp.item.__removeReference(self);
                        }
                    });

                    changes.moved.forEach(function (tmp) {
                        self.trigger('moved', tmp);
                    });

                    return changes;

                }.bind(this);

                this.__meta.listeners = this.__meta.listeners || {};

                addedListeners = this.__meta.listeners.added || [];
                movedListeners = this.__meta.listeners.moved || [];
                removedListeners = this.__meta.listeners.removed || [];

                if (addedListeners.length || movedListeners.length || removedListeners.length) {
                    this.getChanges();
                }
            },

            didNotifyWatchers : function () {

                this.oldContent = this.content.concat();
                this.updatedItems = [];

                if (this.__meta) {
                    this.__meta.contentChanges = {};
                }
            },

            itemDidChange : function (item, props) {

                var self = this;

                this.updatedItems.push({
                    item : item,
                    changes : props
                });

                props.forEach(function (p) {
                    self.propertyDidChange('@each.' + p);
                });
            },

            contentDidChange : function () {
                this.propertyDidChange('length');
                this.propertyDidChange('@each');
            }
        });

        return Arr;
    }

).attach('$b');