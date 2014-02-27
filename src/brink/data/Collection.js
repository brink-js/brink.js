$b(

    [
       '../core/Array'
    ],

    function (Arr) {

        'use strict';

        return Arr({

            factory : null,
            primaryKey : null,

            typeKey : null,
            collectionKey : null,

            findByPrimaryKey : function (q) {
                return this.findBy(this.primaryKey, q);
            },

            removeByPrimaryKey : function (q) {

                var index;

                index = this.findIndexBy(this.primaryKey, q);

                if (~r) {
                    return this.removeAt(index);
                }
            },

            serialize : function (isEmbedded) {

                var a = [];

                this.forEach(function (item, index, collection) {

                    if (isEmbedded) {
                        a.push(item.serialize());
                    }

                    else {
                        a.push(item.get('pk'));
                    }

                }, this);

                return a;
            }

        });
    }

).attach('$b');