$b(

    [
        '../core/Class',
        '../utils/get',
        '../utils/trim',
        '../utils/merge',
        '../utils/computed'
    ],

    function (Class, get, trim, merge, computed) {

        'use strict';

        var DOMObject = Class({

            dom : null,

            isAttr : false,
            isText : false,
            isElement : false,
            isDynamic : false,
            isLocked : false,

            tokens : null,
            parent : null,
            context : null,

            templateString : '',
            processedTemplate : '',
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
                this.set('processedTemplate', trim(str) || '');
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
                    this.watch(props.concat('isLocked'), this.contextUpdated);
                    this.contextUpdated();
                }
            },

            replaceTokens : function (str, tokens) {

                var i;

                for (i = 0; i < tokens.length; i ++) {
                    str = str.replace('{{$' + i + '}}', this.get('context.' + tokens[i].name) || '');
                }

                return str;
            },

            updateDOM : function () {

                var val = this.replaceTokens(
                    this.get('processedTemplate'),
                    this.get('tokens')
                );

                if (val !== this.get('cachedValue')) {
                    this.set('cachedValue', val);
                    this.get('dom')[this.get('updateProp')] = val;
                }
            },

            render : function (context) {
                this.set('context', context);
            },

            rerender : function () {
                this.updateDOM();
            },

            contextUpdated : function () {

                if (
                    this.get('isLocked') ||
                    !this.get('dom') ||
                    !this.get('isDynamic') ||
                    !this.get('context') ||
                    (!this.get('isAttr') && !this.get('dom').parentNode)
                ) {return;}

                this.rerender();
            }
        });

        return DOMObject;
    }

).attach('$b.dom');
