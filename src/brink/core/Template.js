$B.Template = $B.Class.extend({

    node : null,
    isEmpty : false,

    context : $B.computed({

        get : function () {
            return this._context;
        },

        set : function (val) {

            this._context = val;

            if (this.node) {
                this.node.set('context', val);
            }

            return val;
        }
    }),

    parseHTML : function (s) {

        var $ = this.parseHTML = window.$ || window.jQuery || function (s, el) {
            el = document.createElement('div');
            el.innerHTML = str;
            return el.children;
        }

        return $(s);
    },

    compile : function () {

        var el;

        el = this.el;

        if (!el instanceof HTMLElement && !el instanceof Text && !el instanceof Attr) {
            el = this.parseHTML(el);
            $B.assert(el.length > 1, 'Templates must specify a root node.');
            this.isEmpty(el.length === 0);
            el = el[0];
        }

        this.set('node', $B.DOM.Node.create({
            node : el
        }));

        return this.render;
    },

    precompile : function () {
        return this.compile();
    },

    render : function (context) {
        this.set('context', context);
        return this;
    },

    destroy : function () {
        this.set('context', null);
        this.node.destroy();
        return this._super();
    }
});

$B.compileTemplate = $B.Template.compile = function (el) {
    var tmpl = $B.Template.create({el: el});
    return tmpl.compile();
};

$B.precompileTemplate = $B.Template.precompile = function (el) {
    var tmpl = $B.Template.create({el: el});
    return tmpl.precompile();
};