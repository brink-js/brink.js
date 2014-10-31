$b(

    [
        './Class',
        '../dom/Node'
    ],

    function (Class, Node) {

        var HTMLNode;

        if (typeof window !== 'undefined') {

            HTMLNode = window.Node;
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

        function fixWhitespace (s) {
            str.replace(/\s{2,}/g,' ');
        }

        return Class({

            el : null,
            _context : null,
            node : null,
            isEmpty : false,

            context : $b.computed({

                get : function () {
                    return this._context;
                },

                set : function (val) {

                    this._context = val;

                    return val;
                }
            }),

            dom : $b.computed({

                watch : 'node',

                get : function () {

                    var node = this.get('node');
                    return node && node.get('node');
                }

            }),

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
                }

                return $(s);
            },

            compile : function () {

                var el;

                el = this.el;

                if (!(el instanceof HTMLNode)) {
                    el = replaceTags(el);
                    el = this.parseHTML(el);
                    $b.assert('Templates must specify a root node.', el.length === 1);
                    el = el[0];
                }

                this.set('node', Node.create({
                    node : el,
                    parent : this
                }));

                return this.render;
            },

            precompile : function () {
                return this.compile();
            },

            render : function (context) {
                this.set('context', context);

                //this.node.propertyDidChange('context');
                //this.get('node').set('context', context);
                return this;
            },

            destroy : function () {
                this.node.destroy();
                this.set('context', null);
                return this._super();
            }

        });
    }

).attach('$b');