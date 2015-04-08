$b(

    [
        './Element',
        '../core/Class',
        '../utils/get',
        '../utils/ready',
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
                    this.compile(tmpl);
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

            compile : function (tmpl) {

                var el,
                    children,
                    fragment;

                if ((tmpl instanceof Node)) {
                    el = document.createElement('div');
                    el.appendChild(tmpl);
                    tmpl = el.innerHTML;
                }

                this.template = tmpl = this.parseHTML(replaceTags(tmpl));

                children = tmpl.childNodes;

                fragment = document.createDocumentFragment();

                while (children.length) {
                    fragment.appendChild(children[0]);
                }

                this.set('domObj', BrinkElement.create({
                    dom : fragment,
                    parent : unbound(this)
                }));

                return this;
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
                var clone = this.clone();
                clone.set('context', context);
                clone.get('domObj').render(context);
                return clone.get('dom');
            },

            renderWithContentReplace : function (context, content) {

                var q,
                    m,
                    frag,
                    clone,
                    child,
                    matched,
                    children;

                clone = this.clone();
                children = clone.get('domObj.dom').querySelectorAll('content');

                while (children.length) {
                    child = children[0];
                    q = child.getAttribute('select');

                    frag = document.createDocumentFragment();

                    if (q) {
                        matched = content.querySelectorAll(q);
                    }

                    else {
                        matched = content.childNodes;
                    }

                    while (matched.length) {
                        m = matched[0];
                        frag.appendChild(m);
                    }

                    child.parentNode.replaceChild(frag, child);

                    if (!q) {
                        break;
                    }
                }

                matched = content.childNodes;

                while (matched.length) {
                    content.removeChild(matched[0]);
                }

                clone.set('context', context);
                clone.get('domObj').render(context);
                return clone.get('dom');
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

            // Load any templates in the DOM...
            ready(function () {

                var i,
                    tmpl,
                    name,
                    templates;

                function polyfill () {

                    var i,
                        el,
                        frag,
                        style,
                        content,
                        templates;

                    style = document.createElement('style');
                    style.appendChild(document.createTextNode(''));
                    document.head.appendChild(style);
                    style.sheet.insertRule('template {display : none;}', 0);

                    templates = document.getElementsByTagName('template');
                    i = templates.length;

                    while (i --) {
                        el = templates[i];
                        content = el.childNodes;
                        frag = document.createDocumentFragment();

                        while (content[0]) {
                            frag.appendChild(content[0]);
                        }

                        el.content = frag;
                    }
                }

                templates = document.getElementsByTagName('template');

                if (templates.length && !('content' in templates[0])) {
                    polyfill();
                }

                for (i = 0; i < templates.length; i ++) {
                    tmpl = templates[i];
                    name = tmpl.getAttribute('name');

                    if (name) {
                        $b('templates/' + name, Template.create(tmpl.content));
                    }
                }
            });
        }

        return Template;
    }

).attach('$b');