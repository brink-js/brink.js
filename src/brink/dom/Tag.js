$b(

    [
        './Element',
        '../utils/set'
    ],

    function (BrinkElement, set) {

        'use strict';

        var AbstractTag,
            REGISTERED_TAGS;

        REGISTERED_TAGS = [];

        AbstractTag = BrinkElement({

            domTag : null,
            isTag : true,
            isDynamic : true,

            init : function () {
                this.watch('watchedProperties', this.contextWatcher);
                this.compile();
                this.contextWatcher();
            },

            compile : function () {
                this._super.apply(this, arguments);
                this.parseOptions(this.get('dom').getAttribute('options'));
            },

            parseOptions : function (s) {
                console.log('options....', s);
            }
        });

        AbstractTag.extend = function () {

            var proto,
                domTag,
                SubClass;

            SubClass = BrinkElement.extend.apply(this, arguments);

            proto = SubClass.prototype;
            domTag = proto.domTag;

            if (domTag && domTag.indexOf('-') < 0) {
                set(proto, 'domTag', (domTag = 'brink-' + domTag));
            }

            if (domTag && REGISTERED_TAGS.indexOf(domTag) < 0) {

                $b('dom/elements/' + domTag, SubClass).attach('$b.dom.elements');

                REGISTERED_TAGS.push(domTag);

                if (typeof document !== 'undefined' && document.registerElement) {
                    document.registerElement(domTag);
                }

                // IE...
                else if (typeof document !== 'undefined' && document.createElement) {
                    document.createElement(domTag);
                }
            }

            SubClass.domTag = domTag;

            return SubClass;
        };

        return AbstractTag.extend({domTag : 'brink-tag'});
    }

).attach('$b.dom');
