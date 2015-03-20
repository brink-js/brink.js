$b(

    [
        '../Tag',
        './else',
        '../../utils/trim'
    ],

    function (Tag, ElseTag, trim) {

        'use strict';

        return Tag.extend({

            domTag : 'if-tag',
            domNext : null,

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
                    domNext;

                this._super.apply(this, arguments);
                this.parseOptions(this.get('dom').getAttribute('options'));
                this.separateChildren();

                dom = this.get('dom');
                this.set('domNext', (domNext = document.createTextNode('')));

                dom.parentNode.insertBefore(domNext, dom);
                dom.parentNode.removeChild(dom);
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

                var domNext,
                    fragment,
                    domParent;

                domNext = this.get('domNext');
                domParent = domNext.parentNode;

                if (domParent && children && children.length) {

                    fragment = document.createDocumentFragment();

                    children.forEach(function (child) {
                        fragment.appendChild(child.get('dom'));
                    });

                    domParent.insertBefore(fragment, domNext);
                }
            },

            removeChildrenFromDOM : function (children) {

                var domNext,
                    domParent;

                domNext = this.get('domNext');
                domParent = domNext.parentNode;

                if (domParent && children && children.length) {

                    children.forEach(function (child) {

                        var dom = child.get('dom');

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
            },

            contextUpdated : function () {

                if (
                    !this.get('dom') ||
                    !this.get('isDynamic') ||
                    !this.get('context')
                ) {return;}

                this.rerender();
            }
        });
    }

).attach('$b.dom.tags');
