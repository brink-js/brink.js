$b(

    [
        './Element',
        '../core/Class',
        '../utils/get',
        '../browser/ready',
        '../utils/unbound'
    ],

    function (BrinkElement, Class, get, ready, unbound) {

        'use strict';

        var Node;

        if (typeof window !== 'undefined') {
            Node = window.Node;
        }

        function replaceTags (s) {

            var m,
                re,
                domTag;

            re = /\{\s*\%\s*(\S*)\s([^%}]*?)\s*\%\s*\}([\s\S]*?)\{\s*\%\s*(end\1)\s*\%\s*\}/gi;

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

        var Template = Class({

            domObj : null,
            isEmpty : false,
            context : null,
            template : null,

            dom : $b.bindTo('domObj.dom'),
            dom2 : $b.bindTo('domObj.dom'),

            init : function (tmpl, isClone) {

                if (!isClone) {
                    $b.assert('Must pass a string or Node when constructing a Template', !!tmpl);

                    this.template = tmpl;
                    this.compile();
                }
            },

            parseHTML : function (s) {

                var $ = this.parseHTML = window.$ || window.jQuery || function (s, el) {
                    el = document.createElement('div');
                    el.innerHTML = s;
                    return el;
                };

                return $(s);
            },

            compile : function () {

                var tmpl,
                    children,
                    fragment;

                tmpl = this.template;

                if (!(tmpl instanceof Node)) {
                    tmpl = this.parseHTML(replaceTags(tmpl));
                }

                children = tmpl.childNodes;

                fragment = document.createDocumentFragment();

                while (children.length) {
                    fragment.appendChild(children[0]);
                }

                this.set('domObj', BrinkElement.create({
                    dom : fragment,
                    parent : unbound(this)
                }));

                return this.clone();
            },

            clone : function () {

                var tmpl = Template.create(null, true);

                tmpl.set('domObj', BrinkElement.create({
                    dom : this.get('dom').cloneNode(true),
                    parent : unbound(tmpl)
                }));

                return tmpl;
            },

            precompile : function () {
                return this.compile();
            },

            render : function (context) {
                this.set('context', context);
                this.get('domObj').render(context);
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

        if (typeof document !== 'undefined') {

            var style;

            style = document.createElement('style');
            style.appendChild(document.createTextNode(''));
            document.head.appendChild(style);
            style.sheet.insertRule('brink-template {display : none;}', 0);

            if (document.registerElement) {
                document.registerElement('brink-template');
            }

            // IE...
            else {
                document.createElement('brink-template');
            }

            // Load any templates in the DOM...
            ready(function () {

                var i,
                    tmpl,
                    name,
                    templates;

                templates = document.getElementsByTagName('brink-template');

                for (i = 0; i < templates.length; i ++) {
                    tmpl = templates[i];
                    name = tmpl.getAttribute('name');
                    $b.assert('Embedded templates must specify a name... ' + tmpl.innerHTML, !!name);

                    $b('templates/' + name, Template.create(tmpl.innerHTML));
                }
            });
        }

        return Template;
    }

).attach('$b');