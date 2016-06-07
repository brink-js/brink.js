$b(

    [
        '../core/Array',
        '../utils/get',
        '../utils/set',
        '../utils/computed'
    ],

    function (BrinkArray, get, set, computed) {

        'use strict';

        var Collection = BrinkArray({

            modelKey : null,
            collectionKey : null,

            modelClass : computed({

                get : function () {
                    return this._modelClass;
                },

                set : function (val) {
                    this._modelClass = val;
                    if (val) {
                        set(this, 'modelKey', val.modelKey);
                        set(this, 'collectionKey', val.collectionKey);
                    }
                }
            }),

            __init : function () {
                this.__recordsByPK = {};
                BrinkArray.prototype.__init.apply(this, arguments);
            },

            findBy : function (key, val) {

                var isPK,
                    record;

                isPK = key === 'pk';

                if (isPK) {
                    record = this.__recordsByPK[val];

                    if (record) {
                        return record;
                    }
                }

                record = BrinkArray.prototype.findBy.call(this, key, val);

                if (isPK && record) {
                    this.__recordsByPK[val] = record;
                }

                return record;
            },

            push : function () {

                var i,
                    l,
                    pk,
                    record;

                for (i = 0, l = arguments.length; i < l; i ++) {
                    record = arguments[i];
                    pk = get(record, 'pk');
                    this.insertAt(this.length, record);

                    if (pk) {
                        this.__recordsByPK[pk] = record;
                    }
                }

                return this.length;
            },

            remove : function (record) {
                if (record.pk) {
                    delete this.__recordsByPK[record.pk];
                }
                return BrinkArray.prototype.remove.apply(this, arguments);
            },

            serialize : function (isEmbedded, filter, dirty) {

                var a = [],
                    hasChanges;

                this.forEach(function (item) {

                    if (isEmbedded) {
                        a.push(dirty ? item.serializeDirty(filter) : item.serialize(filter));
                    }

                    else {
                        a.push(item.get('pk'));
                    }

                });

                if (isEmbedded && dirty) {
                    a.forEach(item => {
                        if (Object.keys(item).length) {hasChanges = true;}
                    });
                    if (!hasChanges) {return;}
                }

                return a;
            },

            revertAll : function (revertRelationships) {
                this.forEach(function (item) {
                    item.revert(revertRelationships);
                });
            },

            undirty : function (recursive) {
                this.forEach(function (item) {
                    item.undirty(recursive);
                });
            },

            destroy : function (destroyRecords) {

                var i;

                if (destroyRecords) {
                    i = this.content.length;
                    while (i--) {
                        this.content[i].destroy(true);
                    }
                }
                BrinkArray.prototype.destroy.call(this);
            }

        });

        return Collection;
    }

).attach('$b');
