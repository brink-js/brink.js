$b(

    [
        '../core/Class',
        '../utils/trim',
        '../utils/merge',
        '../utils/computed'
    ],

    function (Class, trim, merge, computed) {

        'use strict';

        return Class({

            dom : null,

            isAttr : false,
            isText : false,
            isElement : false,
            isDynamic : false,

            tokens : null,
            parent : null,
            context : $b.bindTo('parent.context'),
            templateString : '',
            processedTemplateString : '',
            cachedValue : null,

            watchedProperties : computed(function () {

                var props,
                    tokens;

                props = [];
                tokens = this.get('tokens') || [];

                tokens.forEach(function (token) {
                    props.push('context.' + token.name);
                });

                return props;

            }, 'tokens'),

            compile : function (str) {

                var re,
                    tokens;

                tokens = [];

                re = /(?:\{\{\s*)([^\||}]+)(?:\|?)([\s\S]*?)(?:\s*\}\})/gi;

                str = str.replace(re, function (token, name, filter) {

                    tokens.push({
                        string : token,
                        name : name,
                        filter : filter || null
                    });

                    return '{{$' + (tokens.length - 1) + '}}';
                });

                this.set('tokens', tokens);
                this.set('processedTemplateString', trim(str) || '');
            },

            init : function () {
                this.watch('watchedProperties', this.contextWatcher);

                this.set(
                    'templateString',
                    this.get('dom.' + this.get('updateProp'))
                );

                this.compile(this.get('templateString'));
                this.contextWatcher();
            },

            contextWatcher : function () {

                var props;
                props = this.get('watchedProperties');

                this.unwatch(this.contextUpdated);

                if (props && props.length) {
                    this.watch(props, this.contextUpdated);
                    setTimeout(function () {
                        this.propertyDidChange(props);
                    }.bind(this), 0);
                }
            },

            replaceTokens : function (str, tokens) {

                var i;

                for (i = 0; i < tokens.length; i ++) {
                    str = str.replace('{{$' + i + '}}', this.get('context.' + tokens[i].name));
                }

                return str;
            },

            updateDOM : function () {

                var val = this.replaceTokens(
                    this.get('processedTemplateString'),
                    this.get('tokens')
                );

                if (val !== this.get('cachedValue')) {
                    this.set('cachedValue', val);
                    this.get('dom')[this.get('updateProp')] = val;
                }
            },

            render : function () {
                this.updateDOM();
            },

            rerender : function () {
                this.render();
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

).attach('$b.dom');
