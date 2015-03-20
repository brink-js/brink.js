$b(

    [
        './Element',
        '../core/Class',
        '../utils/get'
    ],

    function (BrinkElement, Class, get) {

        'use strict';

        var Element;

        if (typeof window !== 'undefined') {
            Element = window.Element;
        }

        function replaceTags (s) {

            var m,
                re,
                domTag;

            re = /\{\s*\%\s*(\S*)\s([^%}]*?)\s*\%\s*\}([\s\S]*)\{\s*\%\s*(end\1)\s*\%\s*\}/gi;

            while ((m = re.exec(s))) {

                domTag = get($b, 'dom.tags.' + m[1] + '.domTag');

                $b.assert(
                    'No "' + m[1] + '" tag found. ' + m[0],
                    !!domTag
                );

                s = s.replace(
                    re,
                    '<' + domTag +
                    (domTag === 'brink-tag' ? ' tag="$1"' : '') +
                    ' options="$2">$3</' + domTag + '>'
                );
            }

            return s;
        }

        return Class({

            domObj : null,
            isEmpty : false,
            context : null,
            template : null,

            dom : $b.bindTo('domObj.dom'),

            init : function (tmpl) {

                $b.assert('Must pass a string or HTMLElement when constructing a Template', !!tmpl);

                this.template = tmpl;
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

                var tmpl,
                    children,
                    fragment;

                tmpl = this.template;

                if (!(tmpl instanceof Element)) {
                    tmpl = replaceTags(tmpl);
                    children = this.parseHTML(tmpl);
                }

                fragment = document.createDocumentFragment();

                while (children.length) {
                    fragment.appendChild(children[0]);
                }

                this.set('domObj', BrinkElement.create({
                    dom : fragment,
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

                return this.get('dom');
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