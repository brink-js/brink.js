$B.DOM.Node = $B.Class.extend({

    childNodes : null,
    domNodes : $B.alias('childNodes'),

    helperNodes : null,

    isDynamic : false,
    watchedProperties : null,
    templateString : null,

    isElement : $B.computed({

        watch : 'node',

        get : function () {
            return this.get('node.nodeType') === 1;

        }
    }),

    isAttr : $B.computed({

        watch : 'node',

        get : function () {
            return this.get('node.nodeType') === 3;

        }
    }),

    isText : $B.computed({

        watch : 'node',

        get : function () {
            return this.get('node.nodeType') === 3;

        }
    }),

    isHelperNode : $B.computed({

        watch : 'node',

        get : function () {
            return this.get('isText') && (this.get('isStartHelperNode') || this.get('isEndHelperNode'));
        }
    }),

    isStartHelperNode : $B.computed({

        watch : 'node',

        get : function () {
            return this.get('value').indexOf('{{#') > -1;
        }

    }),

    isEndHelperNode : $B.computed({

        watch : 'node',

        get : function () {
            return this.get('value').indexOf('{{/') > -1;
        }

    }),

    context : $B.computed({

        watch : 'watchedProperties',

        get : function () {
            return this._context;
        },

        set : function (val) {
            this._context = val;
            this.update(null, true);
            return val;
        }
    }),

    node : $B.computed({

        get : function () {
            return this._node;
        },

        set : function (val) {

            var i,
                child,
                childNodes,
                helperNode,
                helperNodes,
                origChildNodes,
                origHelperNodes;

            this._node = node;
            this.set('templateString', this.get('value');

            childNodes = this.set('childNodes', []);
            helperNodes = this.set('helperNodes', []);

            this.set('watchedProperties', []);

            if (!this.set('isDynamic', !node.childNodes.length)) {

                for (i = 0; i < node.childNodes.length; i ++) {

                    child = $B.DOM.Node.create({
                        node : node.childNodes[i],
                        parent : this
                    });

                    if (child.get('isHelperNode')) {

                        child = $B.DOM.HelperNode.create({
                            node : node.childNodes[i],
                            parent : this
                        });

                        helperNodes.push(child);

                        if (child.get('needsClosingHelperNode')) {

                            helperNode = child;

                            origChildNodes = childNodes;
                            origHelperNodes = helperNodes;

                            childNodes = [];
                            helperNodes = [];
                        }

                        else if (helperNode && child.get('isEndHelperNode')) {

                            helperNode.set('endNode', child);
                            helperNode.set('childNodes', childNodes);
                            helperNode.set('helpderNodes', helperNodes);

                            childNodes = origChildNodes;
                            helperNodes = origHelperNodes;
                            helperNode = null;
                        }
                    }

                    else {
                        childNodes.push(child);
                    }

                    this.set('watchedProperties', $B.merge(this.get('watchedProperties'), child.get('watchedProperties')));
                }

                if (childNodes[0].isHelperNode()) {

                    $B.assert(!childNodes[childNodes.length -1].isHelperNode(), childNodes[i].get('value') ' is not property closed.');

                }

                else {
                    this.set('childNodes', childNodes);
                }
            }

            if (this.get('context')) {
                this.update(null, true);
            }

            return this._node;
        }
    }),

    valueProp : $B.computed({

        watch : 'node',

        get : function () {
            return this.get('isElement') ? 'innerHTML' : this.get('isAttr') ? 'value' : this.get('isText') ? 'nodeValue' : null;
        }
    }),

    value : $B.computed({

        get : function () {
            return this._node && this._node[this.get('valueProp')];

        },

        set : function (val) {

            if (this._node) {
                this._node[this.get('valueProp')] = val;
            }

            return val;
        }
    });

    contextWatcher : $B.watch(function () {

        var context,
            props;

        context = this.get('context');
        props = this.get('watchedProperties');

        if (this.updateWatcher) {
            $B.unwatch(this.updateWatcher);
            this.updateWatcher = null;
        }

        if (this.context && this.props && this.props.length) {
            this.updateWatcher = $B.watch(this.update, context, props));
        }

    }, 'context', 'watchedProperties');

    appendTo : function (el) {
        el.appendChild(this.node);
    },

    prependTo : function (el) {
        el.insertBefore(this.node, el.firstChild);
    },

    parseTemplateString : function () {
        return $B.parseTemplateString(this.get('templateString'), this.get('context'), this.get('watchedProperties'));
    },

    update : function (properties, forceUpdate) {

        var i,
            childNodes;

        if (forceUpdate || $B.intersect(this.get('watchedProperties'), properties).length) {

            if (this.get('node') && this.isDynamic) {
                this.set('value', this.parseTemplateString());
            }
        }
    }

});