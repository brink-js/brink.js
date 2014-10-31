$b(

    [
        '../core/Class',
        '../utils/trim',
        '../utils/merge',
        '../utils/computed',
        '../utils/intersect'
    ],

    function (Class, trim, merge, computed, intersect) {

        var Node = Class({

            childNodes : null,
            watchedProperties : null,
            isDynamic : false,
            tokens : null,

            context : $b.bindTo('parent.context'),

            isElement : computed({

                watch : 'node',

                get : function () {
                    var node = this.get('node');
                    return node && node.nodeType === 1;

                }
            }),

            isAttr : computed({

                watch : 'node',

                get : function () {
                    var node = this.get('node');
                    return node && node.nodeType === 2;

                }
            }),

            isText : computed({

                watch : 'node',

                get : function () {
                    var node = this.get('node');
                    return node && node.nodeType === 3;

                }
            }),

            node : computed({

                get : function () {
                    return this._node;
                },

                set : function (node) {

                    var i,
                        child,
                        childNodes;

                    this._node = node;

                    childNodes = this.set('childNodes', []);

                    if (!this.set('isDynamic', !node.childNodes.length)) {

                        this.set('watchedProperties', []);

                        for (i = 0; i < node.childNodes.length; i ++) {

                            child = Node.create({
                                node : node.childNodes[i],
                                parent : this
                            });
                            //console.log(child);
                            childNodes.push(child);

                            this.set('watchedProperties', merge(this.get('watchedProperties'), child.get('watchedProperties')));
                        }

                        this.set('childNodes', childNodes);
                    }

                    else {
                        this.set('templateString', this.get('value'));
                    }

                    if (this.get('context')) {
                        this.update(null, true);
                    }

                    return this._node;
                }
            }),

            watchedProperties : $b.computed({

                watch : ['isDynamic', 'templateString'],

                get : function () {

                    if (this.get('isDynamic')) {

                    }
                }

            }),

            valueProp : $b.computed({

                watch : 'node',

                get : function () {
                    return this.get('isElement') ? 'innerHTML' : this.get('isAttr') ? 'value' : this.get('isText') ? 'nodeValue' : null;
                }
            }),

            value : $b.computed({

                get : function () {
                    var node = this.get('node');
                    return node && node[this.get('valueProp')];

                },

                set : function (val) {

                    var node = this.get('node');

                    if (node && val) {
                        //console.log('fdsfdasf', val);
                        node[this.get('valueProp')] = val;
                    }

                    return val;
                }
            }),

            templateString : $b.computed({

                get : function () {
                    return this._templateString;
                },

                set : function (val) {

                    var re,
                        match,
                        tokens;

                    tokens = [];

                    if (val) {

                        re = /(?:\{\{\s*)([^\||}]+)(?:\|?)([\s\S]*?)(?:\s*\}\})/gi;

                        val = val.replace(re, function (token, name, filter) {

                            tokens.push({
                                string : token,
                                name : name,
                                filter : filter || null
                            });

                            return '{{$' + (tokens.length - 1) + '}}';
                        });

                        val = trim(val);
                    }

                    this.set('tokens', tokens);
                    this._templateString =  val || '';
                }
            }),

            init : function () {

                if (this.parent) {

                    this.watch('parent', function () {
                        console.log('aaa', this.context);
                    }.bind(this));

                    this.watch('context', function () {
                        console.log('bbb', this.context);
                        this.update(null, true);
                    }.bind(this));
                }

                //console.log('fdfa');
                //this.watch(['context', 'watchedProperties'], this.contextWatcher.bind(this));
            },

            contextWatcher : function () {

                var context,
                    props;

                context = this.get('context');
                props = this.get('watchedProperties');

                if (this.updateWatcher) {
                    context.unwatch(this.update);
                }

                if (context && props && props.length) {
                    context.watch(props, this.update);
                }

            },

            appendTo : function (el) {
                el.appendChild(this.node);
            },

            prependTo : function (el) {
                el.insertBefore(this.node, el.firstChild);
            },

            parseTemplateString : function () {

                var str,
                    tokens;

                this.set('templateString', this.get('value'));
                str = this.get('templateString');
                tokens = this.get('tokens');

                for (i = 0; i < tokens.length; i ++) {
                    str = str.replace('{{$' + i + '}}', this.get('context')[tokens[i].name]);
                }

                return str;
            },

            update : function (properties, forceUpdate) {

                var i,
                    childNodes;

                //console.log('zzz', properties, this.get('watchedProperties'));

                if (forceUpdate || intersect(this.get('watchedProperties'), properties).length) {
                    //console.log('zzz', this.get('node'), this.get('isDynamic'));
                    if (this.get('node') && this.get('isDynamic')) {
                        this.set('value', this.parseTemplateString());
                    }
                }
            }
        });

        return Node;
    }

).attach('$b.dom');
