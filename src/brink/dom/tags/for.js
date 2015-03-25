$b(

    [
        '../Tag',
        '../Template',
        '../../core/ObjectProxy',
        '../../core/Dictionary',
        '../../utils/get'
    ],

    function (Tag, Template, ObjectProxy, Dictionary, get) {

        'use strict';

        return Tag.extend({

            loopKey : null,
            loopEnum : null,
            template : null,

            parseOptions : function (s) {

                var m,
                    re;

                re = /(\S*)\s*(?:\S*)\s*(\S*)/gi;
                m = re.exec(s);

                $b.assert('Improperly formatted "for" tag. ' + s, !!m);

                this.set('loopKey', m[1]);
                this.set('loopEnum', m[2]);

                this.set('tokens', [{
                    string : m[0],
                    name : m[2] + '.@each',
                    filter : null
                }]);
            },

            compile : function () {

                var dom,
                    domNew;

                this.parseOptions(this.get('dom').getAttribute('options'));

                // Replace the dom element with an empty text node.
                dom = this.get('dom');
                domNew = document.createTextNode('');

                dom.parentNode.insertBefore(domNew, dom);
                dom.parentNode.removeChild(dom);

                this.set('template', Template.create(dom));
                this.set('dom', domNew);
            },

            addTemplateToDOM : function (tmpl, index) {

                var dom,
                    fragment,
                    children,
                    domParent;

                dom = this.get('dom');
                domParent = dom.parentNode;

                if (domParent) {

                    children = tmpl.get('domObj.children');
                    fragment = document.createDocumentFragment();

                    children.forEach(function (child) {
                        fragment.appendChild(child.get('dom'));
                    });

                    domParent.insertBefore(
                        fragment,
                        (index ?
                            dom.childNodes[index * get(children, 'length')] :
                            dom.nextSibling
                        )
                    );
                }
            },

            removeTemplateFromDOM : function (tmpl) {

                var dom,
                    children,
                    domParent;

                dom = this.get('dom');
                domParent = dom.parentNode;

                if (domParent) {
                    children = tmpl.get('domObj.children');

                    children.forEach(function (child) {
                        domParent.removeChild(child.get('dom'));
                    });
                }
            },

            addItem : function (item, index) {

                var tmpl,
                    lKey,
                    lDict,
                    itemTmpl,
                    itemContext;

                lDict = this.get('loopDict');

                $b.assert('Item already exists in list...', !lDict.has(item));

                tmpl = this.get('template');

                lKey = this.get('loopKey');

                lDict.add(item, itemTmpl);
                itemTmpl = tmpl.clone();

                itemContext = {proxy : this.get('context')};
                itemContext[lKey] = item;
                itemContext = ObjectProxy.create(itemContext);

                lDict.add(item, itemTmpl);
                this.addTemplateToDOM(itemTmpl, index);
                itemTmpl.render(itemContext);

            },

            removeItem : function (item) {

                var lDict;

                lDict = this.get('loopDict');

                $b.assert('Item does not exist in list...', lDict.has(item));

                this.removeTemplateFromDOM(lDict.remove(item)[0]);
            },

            moveItem : function (item, newIndex) {

                $b.assert('Item does not exist in list...', lDict.has(item));

            },

            updateDOM : function () {

                var tmpl,
                    lDict,
                    lEnum,
                    changes;

                lDict = this.get('loopDict');
                lEnum = this.get('context.' + this.get('loopEnum'));

                if (lEnum && get(lEnum, 'length')) {

                    if (!lDict) {
                        this.set('loopDict', (lDict = Dictionary.create()));

                        lEnum.forEach(function (item, index) {
                            this.addItem(item, index);
                        }.bind(this));
                    }

                    changes = lEnum.getChanges();
                }
            },

            render : function () {
                this.updateDOM();
            }

        });
    }

).attach('$b.dom.tags');
