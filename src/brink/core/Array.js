$b(

    [
        './Object'
    ],

    function (Obj) {

        'use strict';

        var Arr,
            AP;

        AP = Array.prototype;

        Arr = Obj({

            content : null,
            length : 0,

            oldContent : null,
            pristineContent : null,

            init : function (content) {

                this.set('content', content);
                this.set('oldContent', content.concat());
                this.set('length', this.content.length);

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

            findBy : function (q, v) {

                var i,
                    item;

                for (i = 0; i < this.content.length; i ++) {
                    item = this.content[i];
                    if (item[q] === v) {
                        return item;
                    }
                }

                return null;
            },

            findIndexBy : function (q, v) {

                var i,
                    item;

                for (i = 0; i < this.content.length; i ++) {
                    item = this.content[i];
                    if (item[q] === v) {
                        return i;
                    }
                }

                return -1;
            },

            forEach : function (fn, scope) {

                var i;

                for (i = 0; i < this.content.length; i ++) {
                    fn.call(scope, this.content[i], i, this);
                }

            },

            concat : function () {
                var r = AP.concat.apply(this.content, arguments);
                return this.prototype.constructor.create(r);
            },

            insert : function () {
                return this.push.apply(this, arguments);
            },

            insertAt : function (i, o) {
                this.splice(i, 0, o);
                return this.get('length');
            },

            push : function () {

                var i;

                for (i = 0; i < arguments.length; i ++) {
                    this.insertAt(this.length, arguments[i]);
                }

                return this.length;
            },

            pop : function (i) {
                i = this.length - 1;
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
                var i;
                for (i = 0; i < arguments.length; i ++) {
                    this.insertAt(0, this.arguments[i]);
                }

                return this.length;
            },

            reverse : function () {
                var r;
                if (!this.pristineContent) {
                    this.pristineContent = this.content;
                }

                r = AP.reverse.apply(this.content, arguments);
                this.contentDidChange();
                return this;
            },

            filter : function () {

                if (!this.pristineContent) {
                    this.pristineContent = this.content;
                }

                this.content = AP.filter.apply(this.content, arguments);
                this.contentDidChange();
                return this.content;
            },

            sort : function () {

                if (!this.pristineContent) {
                    this.pristineContent = this.content;
                    this.content = this.content.concat();
                }

                AP.sort.apply(this.content, arguments);
                this.contentDidChange();
                return this.content;
            },

            reset : function () {
                this.content = this.pristineContent;
                this.pristineContent = null;
            },

            willNotifyWatchers : function () {

                this.getChanges = function () {

                    var i,
                        changes,
                        newItem,
                        oldItem,
                        newIndex,
                        oldIndex,
                        oldContent,
                        newContent;

                    oldContent = this.oldContent;
                    newContent = this.content;

                    changes = {
                        added : [],
                        removed : [],
                        moved : []
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

                    return changes;

                }.bind(this);
            },

            didNotifyWatchers : function () {

                this.oldContent = this.content.concat();

                if (this.__meta) {
                    this.__meta.changedProps = [];
                    this.__meta.contentChanges = {};
                }

            },

            contentDidChange : function () {
                this.set('length', this.content.length);
                this.propertyDidChange('@each');
            }

        });

        return Arr;
    }

).attach('$b');