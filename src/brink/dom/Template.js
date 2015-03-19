$b(

    [
        '../core/Class',
        './Element'
    ],

    function (Class, BrinkElement) {

        'use strict';

        var Element;

        if (typeof window !== 'undefined') {

            Element = window.Element;
        }

        function replaceTags (s) {

            var s2,
                re;

            re = /\{\s*\%\s*(\S*)\s([^%}]*?)\s*\%\s*\}([\s\S]*)\{\s*\%\s*(end\1)\s*\%\s*\}/gi;

            while (s2 !== s) {

                if (s2) {
                    s = s2;
                }

                s2 = s.replace(re, '<br-tag $1="$2">$3</br-tag>');
            }

            return s;
        }

        return Class({

            el : null,
            domObj : null,
            isEmpty : false,
            context : null,

            dom : $b.bindTo('domObj.dom'),

            init : function (el) {

                $b.assert(!!el, 'Must pass a string or HTMLElement when constructing a Template');

                this.el = el;
                this.compile();
            },

            parseHTML : function (s) {

                var $ = this.parseHTML = window.$ || window.jQuery || function (s, el) {
                    el = document.createElement('div');
                    el.innerHTML = s;
                    return el.childNodes;
                };

                return $(s);
            },

            compile : function () {

                var el;

                el = this.el;

                if (!(el instanceof Element)) {
                    el = replaceTags(el);
                    el = this.parseHTML(el);
                    $b.assert('Templates must specify a root node.', el.length === 1);
                    el = el[0];
                }

                this.set('domObj', BrinkElement.create({
                    dom : el,
                    parent : this
                }));

                return this;
            },

            precompile : function () {
                return this.compile();
            },

            render : function (context) {
                this.set('context', context);
                this.get('domObj').render(true);
                return this;
            },

            destroy : function () {

                var domObj = this.get('domObj');

                if (domObj) {
                    domObj.destroy();
                }

                this.set('context', null);
                return this._super();
            }

        });
    }

).attach('$b');