$b(

    [
        './Attr',
        './Text',
        './DOMObject'
    ],

    function (BrinkAttr, BrinkText, DOMObject) {

        'use strict';

        var BrinkElement = DOMObject({

            isElement : true,
            isDynamic : false,

            tokens : null,
            watchedProperties : null,

            init : function () {
                this.compile();
            },

            compile : function () {

                var i,
                    dom,
                    attr,
                    child,
                    children,
                    attributes;

                dom = this.dom;

                children = [];
                attributes = [];

                if (dom.childNodes && dom.childNodes.length) {

                    for (i = 0; i < dom.childNodes.length; i ++) {

                        child = dom.childNodes[i];

                        children.push(
                            (child.nodeType === 3 ? BrinkText : BrinkElement).create({
                                dom : child,
                                parent : this
                            })
                        );
                    }
                }

                if (dom.attributes && dom.attributes.length) {

                    for (i = 0; i < dom.attributes.length; i ++) {

                        attr = dom.attributes[i];

                        attributes.push(BrinkAttr.create({
                            dom : attr,
                            parent : this
                        }));
                    }
                }

                this.set('children', children);
                this.set('attributes', attributes);
            },

            updateDOM : function () {
                return;
            },

            render : function () {

                this.get('children').forEach(function (child) {
                    child.rerender();
                });

                this.get('attributes').forEach(function (attr) {
                    attr.rerender();
                });
            },

            rerender : function () {
                this.render();
            }
        });

        return BrinkElement;
    }

).attach('$b.dom');
