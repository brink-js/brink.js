$b(

    [
        '../Tag',
        './else',
        '../../utils/trim'
    ],

    function (Tag, ElseTag, trim) {

        'use strict';

        return Tag.extend({

            ifChildren : null,
            elseChildren : null,

            subTags : {
                'else' : ElseTag
            },

            parseOptions : function (s) {
                this.set('tokens', [{
                    string : s,
                    name : trim(s),
                    filter : null
                }]);
            },

            compile : function () {

                var dom,
                    domNew;

                this._super.apply(this, arguments);
                this.separateChildren();

                // Replace the dom element with an empty text node.
                dom = this.get('dom');
                domNew = document.createTextNode('');

                dom.parentNode.insertBefore(domNew, dom);
                dom.parentNode.removeChild(dom);

                this.set('dom', domNew);
            },

            separateChildren : function () {

                var active,
                    children,
                    elseTag,
                    ifChildren,
                    elseChildren;

                children = this.get('children') || [];

                ifChildren = [];
                elseChildren = [];

                active = ifChildren;

                children.forEach(function (child) {

                    if (child.get('isTag')) {
                        child.set('isLocked', true);
                    }

                    if (child instanceof ElseTag) {
                        elseTag = child;
                        active = elseChildren;
                        return;
                    }

                    active.push(child);
                });

                if (elseTag) {
                    children.splice(children.indexOf(elseTag), 1);
                    elseTag.set('children', null);
                    elseTag.destroy();
                }

                this.set('children', children);
                this.set('ifChildren', ifChildren);
                this.set('elseChildren', elseChildren);
            },

            parentHasChild : function (parent, child) {
                return (
                    Array.prototype.indexOf.call(
                        parent.childNodes,
                        child
                    ) > -1
                );
            },

            addChildrenToDOM : function (children) {

                var dom,
                    fragment,
                    domParent;

                dom = this.get('dom');
                domParent = dom.parentNode;

                if (domParent && children && children.length) {

                    fragment = document.createDocumentFragment();

                    children.forEach(function (child) {
                        fragment.appendChild(child.get('dom'));
                        if (child.get('isTag')) {
                            child.set('isLocked', false);
                            child.contextUpdated();
                        }
                    });

                    domParent.insertBefore(fragment, dom.nextSibling);
                }
            },

            removeChildrenFromDOM : function (children) {

                var dom,
                    domParent;

                dom = this.get('dom');
                domParent = dom.parentNode;

                if (domParent && children && children.length) {

                    children.forEach(function (child) {

                        var dom = child.get('dom');

                        if (child.get('isTag')) {
                            child.set('isLocked', true);
                        }

                        if (this.parentHasChild(domParent, dom)) {
                            domParent.removeChild(dom);
                        }

                    }.bind(this));
                }
            },

            updateDOM : function () {

                var val = this.replaceTokens(
                    '{{$0}}',
                    this.get('tokens')
                );

                if (val !== this.get('cachedValue')) {

                    this.set('cachedValue', val);

                    if (val) {
                        this.removeChildrenFromDOM(this.get('elseChildren'));
                        this.addChildrenToDOM(this.get('ifChildren'));
                    }

                    else {
                        this.removeChildrenFromDOM(this.get('ifChildren'));
                        this.addChildrenToDOM(this.get('elseChildren'));
                    }
                }
            },

            render : function () {
                this.updateDOM();
            }
        });
    }

).attach('$b.dom.tags');
