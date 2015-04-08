$b(

    [
        './Template',
        '../core/Class',
        '../utils/get',
        '../utils/set',
        '../utils/extend'
    ],

    function (Template, Class, get, set, extend) {

        'use strict';

        function unshadowCSS (s, tag) {

            var m,
                re;

            re = /(\:host)([\s]*)([^{]*)/i;

            while ((m = re.exec(s))) {
                s = s.replace(re, tag + '$2' + (m[3] ? '$3' : ''));
            }

            return s;
        }

        var Component = Class({

            dom : null,
            tagName : '',

            useShadow : true,

            __init : function () {

                this.attrs = (this.attrs || []).concat();
                this._super.apply(this, arguments);
            },

            __attributeUpdated : function (attr, val) {

                var meta = this.__meta;

                if (this.attrs && ~this.attrs.indexOf(attr)) {
                    this.attrs.push(attr);
                }

                if (!meta.properties[attr]) {
                    this.prop(attr, val);
                    return;
                }

                set(this, attr, val);
            },

            __onCreated : function () {

                var css,
                    dom,
                    style,
                    content,
                    styleFragment;

                css = this.css;
                styleFragment = this.styleFragment;

                if (
                    this.useShadow &&
                    typeof document !== 'undefined' &&
                    document.body.createShadowRoot
                ) {
                    this.shadow = dom = this.dom.createShadowRoot();
                }

                else {
                    this.useShadow = false;
                    dom = this.dom;

                    if (typeof css === 'string' && !styleFragment) {
                        css = unshadowCSS(css, this.tagName);
                    }
                }

                if (css && !styleFragment) {
                    styleFragment = document.createDocumentFragment();
                    style = document.createElement('style');
                    style.appendChild(document.createTextNode(css));
                    style.setAttribute('scoped', 'scoped');
                    styleFragment.appendChild(style);
                    this.styleFragment = styleFragment;
                }

                if (this.template) {

                    if (this.useShadow) {
                        content = this.template.render(this);
                    }

                    else {
                        content = this.template.renderWithContentReplace(this, dom);
                    }
                }


                if (styleFragment) {
                    dom.appendChild(styleFragment);
                }

                if (content) {
                    dom.appendChild(content);
                }

            },

            /* Nicer names */
            onCreated : $b.F,
            onAttached : $b.F,
            onDetached : $b.F,
            onAttributeChanged : $b.F,

            set : function (key, val) {
                val = this._super.apply(this, arguments);

                if (val !== false && ~this.attrs.indexOf(key)) {
                    this.dom.setAttribute(key, val);
                }

                return val;
            },

            querySelector : function (q) {
                if (this.useShadow) {
                    return this.shadow.querySelector(q);
                }
                return this.dom.querySelector(q);
            }
        });

        Component.extend = function () {

            var i,
                is,
                arg,
                args,
                proto,
                props,
                tagName,
                SubComponent;

            args = Array.prototype.slice.call(arguments, 0);

            is = this.prototype['extends'];

            for (i = 0; i < args.length; i ++) {
                arg = args[i];
                is = arg.extends || is;
                tagName = arg.tagName || tagName;

                if (typeof arg.template === 'string') {
                    arg.template = Template.create(arg.template);
                }
            }

            if (is) {
                proto = document.createElement(is).constructor.prototype;
            }

            else {
                proto = window.HTMLElement.prototype;
            }

            SubComponent = Class.extend.apply(this, args);

            proto = Object.create(proto);

            props = {
                prototype : proto
            };

            if (is) {
                props.extends = is;
            }

            extend(proto, {
                createdCallback : function () {

                    var i,
                        attr,
                        attrs;

                    if (!this.wrapper) {
                        this.wrapper = SubComponent.create({dom : this});
                    }

                    else {
                        set(this.wrapper, 'dom', this);
                    }

                    attrs = this.attributes;

                    i = attrs.length;

                    while (i --) {
                        attr = attrs[i];
                        this.wrapper.__attributeUpdated(attr.name, attr.value);
                    }

                    this.wrapper.__onCreated.apply(this.wrapper, arguments);
                    this.wrapper.onCreated.apply(this.wrapper, arguments);
                },

                attachedCallback : function () {
                    this.wrapper.onAttached.apply(this.wrapper, arguments);
                },

                detachedCallback : function () {
                    this.wrapper.onDetached.apply(this.wrapper, arguments);
                },

                attributeChangedCallback : function (attr, oldVal, newVal) {
                    this.wrapper.__attributeUpdated(attr, newVal);
                    this.wrapper.onAttributeChanged.apply(this.wrapper, arguments);
                }
            });

            SubComponent.__meta.DOMElement = document.registerElement(tagName, props);

            return SubComponent;
        };

        Component.create = function (props) {

            var dom,
                instance;

            props = props || {};

            if (!props.dom) {
                dom = new this.__meta.DOMElement();
                instance = dom.wrapper;
                instance.__init.apply(instance, arguments);
                set(instance, 'dom', dom);
            }

            else {
                instance = Class.create.apply(this, arguments);
            }

            return instance;
        };

        return Component;
    }

).attach('$b');
