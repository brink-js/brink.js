;(function () {

    'use strict';
    
        'use strict';
        
        var $b,
            _global,
            CONFIG,
            IS_NODE,
            EMPTY_FN;
        
        /*jshint ignore : start */
        IS_NODE = typeof module !== 'undefined' && module.exports;
        /*jshint ignore : end */
        
        EMPTY_FN = function () {};
        
        _global = IS_NODE ? global : window;
        
        CONFIG = _global.Brink || _global.$b || {};
        
        $b = _global.$b = _global.Brink = function () {
        
            var args;
        
            args = Array.prototype.slice.call(arguments, 0);
        
            if (args.length) {
        
                if (args.length === 1 && typeof args[0] === 'string') {
                    if ($b.require) {
                        return $b.require.apply(_global, args);
                    }
                }
        
                if ($b.define) {
        
                    if (!Array.isArray(args[0]) && !Array.isArray(args[1])) {
                        args.splice(args.length - 1, 0, []);
                    }
        
                    return $b.define.apply(_global, args);
                }
            }
        
            return $b;
        };
        
        $b.F = EMPTY_FN;
        
        /*
            These are empty functions for production builds,
            only the dev version actually implements these, but
            we don't want code that uses them to Error.
        */
        
        $b.assert = $b.error = EMPTY_FN;
        
        $b.configure = function (o) {
        
            var p;
        
            for (p in o) {
                CONFIG[p] = o[p];
            }
        
            $b.require.config(CONFIG);
        
            return $b;
        };
        
        $b.init = function (deps, cb) {
        
            $b.require(
        
                /* jscs : disable requireCommaBeforeLineBreak */
        
                [
                    "brink/config",
                    "brink/dev/error",
                    "brink/dev/assert",
                    "brink/dev/warn",
                    "brink/utils/isFunction",
                    "brink/utils/computed",
                    "brink/utils/alias",
                    "brink/utils/get",
                    "brink/utils/getObjKeyPair",
                    "brink/utils/isBrinkInstance",
                    "brink/utils/bindTo",
                    "brink/utils/isObject",
                    "brink/utils/merge",
                    "brink/utils/clone",
                    "brink/utils/configure",
                    "brink/utils/defineProperty",
                    "brink/utils/extend",
                    "brink/utils/expandProps",
                    "brink/utils/flatten",
                    "brink/utils/intersect",
                    "brink/utils/params",
                    "brink/utils/Q",
                    "brink/utils/xhr",
                    "brink/utils/ready",
                    "brink/utils/set",
                    "brink/utils/trim",
                    "brink/utils/unbound",
                    "brink/utils/registerModel",
                    "brink/utils/unregisterModel",
                    "brink/core/CoreObject",
                    "brink/utils/bindFunction",
                    "brink/core/Object",
                    "brink/core/NotificationManager",
                    "brink/core/Class",
                    "brink/utils/isBrinkObject",
                    "brink/core/Array",
                    "brink/core/Dictionary",
                    "brink/core/ObjectProxy",
                    "brink/core/RunLoop",
                    "brink/core/InstanceWatcher",
                    "brink/core/InstanceManager",
                    "brink/data/Adapter",
                    "brink/data/RESTAdapter",
                    "brink/data/attr",
                    "brink/data/belongsTo",
                    "brink/data/Collection",
                    "brink/data/hasMany",
                    "brink/data/Model",
                    "brink/data/Schema",
                    "brink/data/Store"
                ]
        
                , function () {
        
                    /* jscs : enable */
        
                    /********* ALIASES *********/
        
                    $b.merge($b.config, CONFIG);
        
                    if ($b.isFunction(deps)) {
                        cb = deps;
                        cb($b);
                    }
        
                    else {
                        deps = deps || [];
                        if (deps.length) {
                            $b.require(deps, cb);
                        }
        
                        else {
                            if (cb) {
                                cb();
                            }
                        }
                    }
        
                }
            );
        };
        
        if (IS_NODE) {
            module.exports = $b;
        }
    
    /********* POLYFILLS *********/
    
        ;(function () {
        
            'use strict';
        
            if (!Array.prototype.forEach) {
        
                Array.prototype.forEach = function (fn, scope) {
        
                    var i,
                        l;
        
                    l = this.length || 0;
        
                    for (i = 0; i < l; i ++) {
                        fn.call(scope, this[i], i, this);
                    }
                };
            }
        
        })();
    
    
        ;(function () {
        
            'use strict';
        
            if (!Array.prototype.filter) {
        
                Array.prototype.filter = function (fn, scope) {
        
                    var result = [];
        
                    this.forEach(function (val, i) {
                        if (fn.call(scope, val, i, this)) {
                            result.push(val);
                        }
                    });
        
                    return result;
        
                };
            }
        
        })();
    
    
        ;(function () {
        
            'use strict';
        
            if (!Array.prototype.indexOf) {
        
                Array.prototype.indexOf = function (a, b) {
        
                    if (!this.length || !(this instanceof Array) || arguments.length < 1) {
                        return -1;
                    }
        
                    b = b || 0;
        
                    if (b >= this.length) {
                        return -1;
                    }
        
                    while (b < this.length) {
                        if (this[b] === a) {
                            return b;
                        }
                        b += 1;
                    }
                    return -1;
                };
            }
        
        })();
    
    
        ;(function () {
        
            'use strict';
        
            if (!Array.isArray) {
        
                Array.isArray = function (vArg) {
                    return Object.prototype.toString.call(vArg) === '[object Array]';
                };
            }
        
        })();
    
    
        /*!
        Copyright (C) 2014 by WebReflection
        
        Permission is hereby granted, free of charge, to any person obtaining a copy
        of this software and associated documentation files (the "Software"), to deal
        in the Software without restriction, including without limitation the rights
        to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
        copies of the Software, and to permit persons to whom the Software is
        furnished to do so, subject to the following conditions:
        
        The above copyright notice and this permission notice shall be included in
        all copies or substantial portions of the Software.
        
        THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
        IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
        FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
        AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
        LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
        OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
        THE SOFTWARE.
        
        */
        
        /* jscs : disable */
        /*jshint ignore : start */
        
        (function(window, document, Object, REGISTER_ELEMENT){'use strict';
        
        // in case it's there or already patched
        if (!window || REGISTER_ELEMENT in document) return;
        
        // DO NOT USE THIS FILE DIRECTLY, IT WON'T WORK
        // THIS IS A PROJECT BASED ON A BUILD SYSTEM
        // THIS FILE IS JUST WRAPPED UP RESULTING IN
        // build/document-register-element.js
        // and its .max.js counter part
        
        var
          // IE < 11 only + old WebKit for attributes + feature detection
          EXPANDO_UID = '__' + REGISTER_ELEMENT + (Math.random() * 10e4 >> 0),
        
          // shortcuts and costants
          ATTACHED = 'attached',
          DETACHED = 'detached',
          EXTENDS = 'extends',
          ADDITION = 'ADDITION',
          MODIFICATION = 'MODIFICATION',
          REMOVAL = 'REMOVAL',
          DOM_ATTR_MODIFIED = 'DOMAttrModified',
          DOM_CONTENT_LOADED = 'DOMContentLoaded',
          DOM_SUBTREE_MODIFIED = 'DOMSubtreeModified',
          PREFIX_TAG = '<',
          PREFIX_IS = '=',
        
          // valid and invalid node names
          validName = /^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+$/,
          invalidNames = [
            'ANNOTATION-XML',
            'COLOR-PROFILE',
            'FONT-FACE',
            'FONT-FACE-SRC',
            'FONT-FACE-URI',
            'FONT-FACE-FORMAT',
            'FONT-FACE-NAME',
            'MISSING-GLYPH'
          ],
        
          // registered types and their prototypes
          types = [],
          protos = [],
        
          // to query subnodes
          query = '',
        
          // html shortcut used to feature detect
          documentElement = document.documentElement,
        
          // ES5 inline helpers || basic patches
          indexOf = types.indexOf || function (v) {
            for(var i = this.length; i-- && this[i] !== v;){}
            return i;
          },
        
          // other helpers / shortcuts
          OP = Object.prototype,
          hOP = OP.hasOwnProperty,
          iPO = OP.isPrototypeOf,
        
          defineProperty = Object.defineProperty,
          gOPD = Object.getOwnPropertyDescriptor,
          gOPN = Object.getOwnPropertyNames,
          gPO = Object.getPrototypeOf,
          sPO = Object.setPrototypeOf,
        
          // jshint proto: true
          hasProto = !!Object.__proto__,
        
          // used to create unique instances
          create = Object.create || function Bridge(proto) {
            // silly broken polyfill probably ever used but short enough to work
            return proto ? ((Bridge.prototype = proto), new Bridge()) : this;
          },
        
          // will set the prototype if possible
          // or copy over all properties
          setPrototype = sPO || (
            hasProto ?
              function (o, p) {
                o.__proto__ = p;
                return o;
              } : (
            (gOPN && gOPD) ?
              (function(){
                function setProperties(o, p) {
                  for (var
                    key,
                    names = gOPN(p),
                    i = 0, length = names.length;
                    i < length; i++
                  ) {
                    key = names[i];
                    if (!hOP.call(o, key)) {
                      defineProperty(o, key, gOPD(p, key));
                    }
                  }
                }
                return function (o, p) {
                  do {
                    setProperties(o, p);
                  } while ((p = gPO(p)));
                  return o;
                };
              }()) :
              function (o, p) {
                for (var key in p) {
                  o[key] = p[key];
                }
                return o;
              }
          )),
        
          // DOM shortcuts and helpers, if any
        
          MutationObserver = window.MutationObserver ||
                             window.WebKitMutationObserver,
        
          HTMLElementPrototype = (
            window.HTMLElement ||
            window.Element ||
            window.Node
          ).prototype,
        
          IE8 = !iPO.call(HTMLElementPrototype, documentElement),
        
          isValidNode = IE8 ?
            function (node) {
              return node.nodeType === 1;
            } :
            function (node) {
              return iPO.call(HTMLElementPrototype, node);
            },
        
          targets = IE8 && [],
        
          cloneNode = HTMLElementPrototype.cloneNode,
          setAttribute = HTMLElementPrototype.setAttribute,
          removeAttribute = HTMLElementPrototype.removeAttribute,
        
          // replaced later on
          createElement = document.createElement,
        
          // shared observer for all attributes
          attributesObserver = MutationObserver && {
            attributes: true,
            characterData: true,
            attributeOldValue: true
          },
        
          // useful to detect only if there's no MutationObserver
          DOMAttrModified = MutationObserver || function(e) {
            doesNotSupportDOMAttrModified = false;
            documentElement.removeEventListener(
              DOM_ATTR_MODIFIED,
              DOMAttrModified
            );
          },
        
          // internal flags
          setListener = false,
          doesNotSupportDOMAttrModified = true,
          dropDomContentLoaded = true,
        
          // optionally defined later on
          onSubtreeModified,
          callDOMAttrModified,
          getAttributesMirror,
          observer,
        
          // based on setting prototype capability
          // will check proto or the expando attribute
          // in order to setup the node once
          patchIfNotAlready,
          patch
        ;
        
        if (sPO || hasProto) {
            patchIfNotAlready = function (node, proto) {
              if (!iPO.call(proto, node)) {
                setupNode(node, proto);
              }
            };
            patch = setupNode;
        } else {
            patchIfNotAlready = function (node, proto) {
              if (!node[EXPANDO_UID]) {
                node[EXPANDO_UID] = Object(true);
                setupNode(node, proto);
              }
            };
            patch = patchIfNotAlready;
        }
        if (IE8) {
          doesNotSupportDOMAttrModified = false;
          (function (){
            var
              descriptor = gOPD(HTMLElementPrototype, 'addEventListener'),
              addEventListener = descriptor.value,
              patchedRemoveAttribute = function (name) {
                var e = new CustomEvent(DOM_ATTR_MODIFIED, {bubbles: true});
                e.attrName = name;
                e.prevValue = this.getAttribute(name);
                e.newValue = null;
                e[REMOVAL] = e.attrChange = 2;
                removeAttribute.call(this, name);
                this.dispatchEvent(e);
              },
              patchedSetAttribute = function (name, value) {
                var
                  had = this.hasAttribute(name),
                  old = had && this.getAttribute(name),
                  e = new CustomEvent(DOM_ATTR_MODIFIED, {bubbles: true})
                ;
                setAttribute.call(this, name, value);
                e.attrName = name;
                e.prevValue = had ? old : null;
                e.newValue = value;
                if (had) {
                  e[MODIFICATION] = e.attrChange = 1;
                } else {
                  e[ADDITION] = e.attrChange = 0;
                }
                this.dispatchEvent(e);
              },
              onPropertyChange = function (e) {
                // jshint eqnull:true
                var
                  node = e.currentTarget,
                  superSecret = node[EXPANDO_UID],
                  propertyName = e.propertyName,
                  event
                ;
                if (superSecret.hasOwnProperty(propertyName)) {
                  superSecret = superSecret[propertyName];
                  event = new CustomEvent(DOM_ATTR_MODIFIED, {bubbles: true});
                  event.attrName = superSecret.name;
                  event.prevValue = superSecret.value || null;
                  event.newValue = (superSecret.value = node[propertyName] || null);
                  if (event.prevValue == null) {
                    event[ADDITION] = event.attrChange = 0;
                  } else {
                    event[MODIFICATION] = event.attrChange = 1;
                  }
                  node.dispatchEvent(event);
                }
              }
            ;
            descriptor.value = function (type, handler, capture) {
              if (
                type === DOM_ATTR_MODIFIED &&
                this.attributeChangedCallback &&
                this.setAttribute !== patchedSetAttribute
              ) {
                this[EXPANDO_UID] = {
                  className: {
                    name: 'class',
                    value: this.className
                  }
                };
                this.setAttribute = patchedSetAttribute;
                this.removeAttribute = patchedRemoveAttribute;
                addEventListener.call(this, 'propertychange', onPropertyChange);
              }
              addEventListener.call(this, type, handler, capture);
            };
            defineProperty(HTMLElementPrototype, 'addEventListener', descriptor);
          }());
        } else if (!MutationObserver) {
          documentElement.addEventListener(DOM_ATTR_MODIFIED, DOMAttrModified);
          documentElement.setAttribute(EXPANDO_UID, 1);
          documentElement.removeAttribute(EXPANDO_UID);
          if (doesNotSupportDOMAttrModified) {
            onSubtreeModified = function (e) {
              var
                node = this,
                oldAttributes,
                newAttributes,
                key
              ;
              if (node === e.target) {
                oldAttributes = node[EXPANDO_UID];
                node[EXPANDO_UID] = (newAttributes = getAttributesMirror(node));
                for (key in newAttributes) {
                  if (!(key in oldAttributes)) {
                    // attribute was added
                    return callDOMAttrModified(
                      0,
                      node,
                      key,
                      oldAttributes[key],
                      newAttributes[key],
                      ADDITION
                    );
                  } else if (newAttributes[key] !== oldAttributes[key]) {
                    // attribute was changed
                    return callDOMAttrModified(
                      1,
                      node,
                      key,
                      oldAttributes[key],
                      newAttributes[key],
                      MODIFICATION
                    );
                  }
                }
                // checking if it has been removed
                for (key in oldAttributes) {
                  if (!(key in newAttributes)) {
                    // attribute removed
                    return callDOMAttrModified(
                      2,
                      node,
                      key,
                      oldAttributes[key],
                      newAttributes[key],
                      REMOVAL
                    );
                  }
                }
              }
            };
            callDOMAttrModified = function (
              attrChange,
              currentTarget,
              attrName,
              prevValue,
              newValue,
              action
            ) {
              var e = {
                attrChange: attrChange,
                currentTarget: currentTarget,
                attrName: attrName,
                prevValue: prevValue,
                newValue: newValue
              };
              e[action] = attrChange;
              onDOMAttrModified(e);
            };
            getAttributesMirror = function (node) {
              for (var
                attr, name,
                result = {},
                attributes = node.attributes,
                i = 0, length = attributes.length;
                i < length; i++
              ) {
                attr = attributes[i];
                name = attr.name;
                if (name !== 'setAttribute') {
                  result[name] = attr.value;
                }
              }
              return result;
            };
          }
        }
        
        function loopAndVerify(list, action) {
          for (var i = 0, length = list.length; i < length; i++) {
            verifyAndSetupAndAction(list[i], action);
          }
        }
        
        function loopAndSetup(list) {
          for (var i = 0, length = list.length, node; i < length; i++) {
            node = list[i];
            patch(node, protos[getTypeIndex(node)]);
          }
        }
        
        function executeAction(action) {
          return function (node) {
            if (isValidNode(node)) {
              verifyAndSetupAndAction(node, action);
              loopAndVerify(
                node.querySelectorAll(query),
                action
              );
            }
          };
        }
        
        function getTypeIndex(target) {
          var
            is = target.getAttribute('is'),
            nodeName = target.nodeName.toUpperCase(),
            i = indexOf.call(
              types,
              is ?
                  PREFIX_IS + is.toUpperCase() :
                  PREFIX_TAG + nodeName
            )
          ;
          return is && -1 < i && !isInQSA(nodeName, is) ? -1 : i;
        }
        
        function isInQSA(name, type) {
          return -1 < query.indexOf(name + '[is="' + type + '"]');
        }
        
        function onDOMAttrModified(e) {
          var
            node = e.currentTarget,
            attrChange = e.attrChange,
            prevValue = e.prevValue,
            newValue = e.newValue
          ;
          if (node.attributeChangedCallback &&
              e.attrName !== 'style') {
            node.attributeChangedCallback(
              e.attrName,
              attrChange === e[ADDITION] ? null : prevValue,
              attrChange === e[REMOVAL] ? null : newValue
            );
          }
        }
        
        function onDOMNode(action) {
          var executor = executeAction(action);
          return function (e) {
            executor(e.target);
          };
        }
        
        function onReadyStateChange(e) {
          if (dropDomContentLoaded) {
            dropDomContentLoaded = false;
            e.currentTarget.removeEventListener(DOM_CONTENT_LOADED, onReadyStateChange);
          }
          loopAndVerify(
            (e.target || document).querySelectorAll(query),
            e.detail === DETACHED ? DETACHED : ATTACHED
          );
          if (IE8) purge();
        }
        
        function patchedSetAttribute(name, value) {
          var self = this;
          setAttribute.call(self, name, value);
          onSubtreeModified.call(self, {target: self});
        }
        
        function setupNode(node, proto) {
          setPrototype(node, proto);
          if (observer) {
            observer.observe(node, attributesObserver);
          } else {
            if (doesNotSupportDOMAttrModified) {
              node.setAttribute = patchedSetAttribute;
              node[EXPANDO_UID] = getAttributesMirror(node);
              node.addEventListener(DOM_SUBTREE_MODIFIED, onSubtreeModified);
            }
            node.addEventListener(DOM_ATTR_MODIFIED, onDOMAttrModified);
          }
          if (node.createdCallback) {
            node.created = true;
            node.createdCallback();
            node.created = false;
          }
        }
        
        function purge() {
          for (var
            node,
            i = 0,
            length = targets.length;
            i < length; i++
          ) {
            node = targets[i];
            if (!documentElement.contains(node)) {
              targets.splice(i, 1);
              verifyAndSetupAndAction(node, DETACHED);
            }
          }
        }
        
        function verifyAndSetupAndAction(node, action) {
          var
            fn,
            i = getTypeIndex(node)
          ;
          if (-1 < i) {
            patchIfNotAlready(node, protos[i]);
            i = 0;
            if (action === ATTACHED && !node[ATTACHED]) {
              node[DETACHED] = false;
              node[ATTACHED] = true;
              i = 1;
              if (IE8 && indexOf.call(targets, node) < 0) {
                targets.push(node);
              }
            } else if (action === DETACHED && !node[DETACHED]) {
              node[ATTACHED] = false;
              node[DETACHED] = true;
              i = 1;
            }
            if (i && (fn = node[action + 'Callback'])) fn.call(node);
          }
        }
        
        // set as enumerable, writable and configurable
        document[REGISTER_ELEMENT] = function registerElement(type, options) {
          upperType = type.toUpperCase();
          if (!setListener) {
            // only first time document.registerElement is used
            // we need to set this listener
            // setting it by default might slow down for no reason
            setListener = true;
            if (MutationObserver) {
              observer = (function(attached, detached){
                function checkEmAll(list, callback) {
                  for (var i = 0, length = list.length; i < length; callback(list[i++])){}
                }
                return new MutationObserver(function (records) {
                  for (var
                    current, node,
                    i = 0, length = records.length; i < length; i++
                  ) {
                    current = records[i];
                    if (current.type === 'childList') {
                      checkEmAll(current.addedNodes, attached);
                      checkEmAll(current.removedNodes, detached);
                    } else {
                      node = current.target;
                      if (node.attributeChangedCallback &&
                          current.attributeName !== 'style') {
                        node.attributeChangedCallback(
                          current.attributeName,
                          current.oldValue,
                          node.getAttribute(current.attributeName)
                        );
                      }
                    }
                  }
                });
              }(executeAction(ATTACHED), executeAction(DETACHED)));
              observer.observe(
                document,
                {
                  childList: true,
                  subtree: true
                }
              );
            } else {
              document.addEventListener('DOMNodeInserted', onDOMNode(ATTACHED));
              document.addEventListener('DOMNodeRemoved', onDOMNode(DETACHED));
            }
        
            document.addEventListener(DOM_CONTENT_LOADED, onReadyStateChange);
            document.addEventListener('readystatechange', onReadyStateChange);
        
            document.createElement = function (localName, typeExtension) {
              var
                node = createElement.apply(document, arguments),
                name = '' + localName,
                i = indexOf.call(
                  types,
                  (typeExtension ? PREFIX_IS : PREFIX_TAG) +
                  (typeExtension || name).toUpperCase()
                ),
                setup = -1 < i
              ;
              if (typeExtension) {
                node.setAttribute('is', typeExtension = typeExtension.toLowerCase());
                if (setup) {
                  setup = isInQSA(name.toUpperCase(), typeExtension);
                }
              }
              if (setup) patch(node, protos[i]);
              return node;
            };
        
            HTMLElementPrototype.cloneNode = function (deep) {
              var
                node = cloneNode.call(this, !!deep),
                i = getTypeIndex(node)
              ;
              if (-1 < i) patch(node, protos[i]);
              if (deep) loopAndSetup(node.querySelectorAll(query));
              return node;
            };
          }
        
          if (-2 < (
            indexOf.call(types, PREFIX_IS + upperType) +
            indexOf.call(types, PREFIX_TAG + upperType)
          )) {
            throw new Error('A ' + type + ' type is already registered');
          }
        
          if (!validName.test(upperType) || -1 < indexOf.call(invalidNames, upperType)) {
            throw new Error('The type ' + type + ' is invalid');
          }
        
          var
            constructor = function () {
              return document.createElement(nodeName, extending && upperType);
            },
            opt = options || OP,
            extending = hOP.call(opt, EXTENDS),
            nodeName = extending ? options[EXTENDS].toUpperCase() : upperType,
            i = types.push((extending ? PREFIX_IS : PREFIX_TAG) + upperType) - 1,
            upperType
          ;
        
          query = query.concat(
            query.length ? ',' : '',
            extending ? nodeName + '[is="' + type.toLowerCase() + '"]' : nodeName
          );
        
          constructor.prototype = (
            protos[i] = hOP.call(opt, 'prototype') ?
              opt.prototype :
              create(HTMLElementPrototype)
          );
        
          loopAndVerify(
            document.querySelectorAll(query),
            ATTACHED
          );
        
          return constructor;
        };
        
        }(
          typeof window === 'undefined' ? false : window,
          typeof document === 'undefined' ? false : document,
          Object,
          'registerElement'
        ));
        
        /* jscs : enable */
        /*jshint ignore : end */
    
    
        ;(function () {
        
            'use strict';
        
            if (!Function.prototype.bind) {
        
                Function.prototype.bind = function (oThis) {
        
                    if (typeof this !== 'function') {
                        // closest thing possible to the ECMAScript 5 internal IsCallable function
                        throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
                    }
        
                    var aArgs = Array.prototype.slice.call(arguments, 1),
                        fToBind = this,
                        FNOP = function () {},
                        fBound = function () {
                            return fToBind.apply(this instanceof FNOP ? this : oThis || window,
                            aArgs.concat(Array.prototype.slice.call(arguments)));
                        };
        
                    FNOP.prototype = this.prototype;
                    fBound.prototype = new FNOP();
                    return fBound;
                };
            }
        
        })();
    
    
        ;(function () {
        
            'use strict';
        
            var _global = typeof window !== 'undefined' ? window : global;
        
            if (typeof _global !== 'undefined' && (!_global.requestAnimationFrame || !_global.cancelAnimationFrame)) {
        
                var lastTime = 0;
                var vendors = ['ms', 'moz', 'webkit', 'o'];
                for (var x = 0; x < vendors.length && !_global.requestAnimationFrame; x ++) {
                    _global.requestAnimationFrame = _global[vendors[x] + 'RequestAnimationFrame'];
                    _global.cancelAnimationFrame = _global[vendors[x] + 'CancelAnimationFrame'] ||
                        _global[vendors[x] + 'CancelRequestAnimationFrame'];
                }
        
                if (!_global.requestAnimationFrame) {
                    _global.requestAnimationFrame = function (callback) {
                        var currTime = new Date().getTime();
                        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                        var id = _global.setTimeout(function () {
                            callback(currTime + timeToCall);
                        }, timeToCall);
                        lastTime = currTime + timeToCall;
                        return id;
                    };
                }
        
                if (!_global.cancelAnimationFrame) {
                    _global.cancelAnimationFrame = function (id) {
                        clearTimeout(id);
                    };
                }
        
                return _global.requestAnimationFrame;
            }
        
        })();
    
    /********* RESOLVER *********/
    
        (function () {
        
            'use strict';
        
            var IS_NODE,
                _global,
                origRequire,
                resolver,
                moduleIndex;
        
            moduleIndex = 0;
        
            IS_NODE = typeof module !== 'undefined' && module.exports;
        
            _global = IS_NODE ? global : window;
            origRequire = typeof require !== 'undefined' ? require : null;
        
            resolver = (function () {
        
                var  _loadQ = [],
                    _defineQ = [],
                    _loadedFiles = {},
                    _modules = $b.__registry = {},
                    _metas = {},
                    _head,
                    // Used for checking circular dependencies.
                    _dependencies = {},
                    // Used in various places, defined here for smaller file size
                    _rem = ['require', 'exports', 'module'],
        
                    // Configurable properties...
                    _config = {},
                    _baseUrl = '',
                    _urlArgs = '',
                    _waitSeconds = 10,
                    _paths = {};
        
                /**
                * Normalizes a path/url, cleaning up duplicate slashes,
                * takes care of `../` and `./` parts
                */
                function _normalize (path, prevPath) {
                    // Replace any matches of './'  with '/'
                    path = path.replace(/(^|[^\.])(\.\/)/g, '$1');
        
                    // Replace any matches of 'some/path/../' with 'some/'
                    while (prevPath !== path) {
                        prevPath = path;
                        path = path.replace(/([\w,\-]*[\/]{1,})([\.]{2,}\/)/g, '');
                    }
        
                    // Replace any matches of multiple '/' with a single '/'
                    return path.replace(/(\/{2,})/g, '/');
                }
        
                function _meta () {
        
                    return {
        
                        id : null,
                        module : null,
                        url : null,
                        attachTo : null,
                        attachPath : null,
        
                        attach : function (s) {
        
                            var i;
        
                            this.attachPath = s;
        
                            s = s.split('.');
        
                            this.attachTo = require(s[0]);
        
                            for (i = 1; i < s.length; i ++) {
                                this.attachTo = this.attachTo[s[i]] = this.attachTo[s[i]] || {};
                            }
        
                            if (this.module) {
                                this.resolve();
                            }
                        },
        
                        resolve : function (id, module) {
        
                            var meta,
                                idPart;
        
                            if (id) {
                                this.id = id;
                            }
        
                            if (module) {
                                this.module = module;
                            }
        
                            meta = _metas[id] || {id : this.id};
                            meta.module = this.module;
                            meta.url = this.url || meta.url;
                            meta.attachPath = this.attachPath || meta.attachPath;
                            meta.order = meta.order || moduleIndex ++;
        
                            _metas[id] = meta;
        
                            module = this.module.exports || this.module;
        
                            if (this.attachTo) {
                                idPart = this.id.split('/').pop();
        
                                if (this.attachPath === '$b') {
                                    _module(idPart, this.module);
        
                                    if ($b.CoreObject && module.prototype instanceof $b.CoreObject) {
                                        module.__meta = module.__meta || {};
                                        module.__meta.name = 'Brink.' + idPart;
                                    }
                                }
        
                                this.attachTo[idPart] = this.module.exports || this.module;
                                return;
                            }
        
                            if (this.id && module && module.__meta) {
                                module.__meta.name = this.id;
                            }
                        }
                    };
                }
        
                /**
                * Similar to UNIX dirname, returns the parent path of another path.
                */
                function _getContext (path) {
                    return path.substr(0, path.lastIndexOf('/'));
                }
        
                /**
                * Given a path and context (optional), will normalize the url
                * and convert a relative path to an absolute path.
                */
                function _resolve (path, context) {
        
                    /**
                    * If the path does not start with a '.', it's relative
                    * to the base URL.
                    */
                    context = (path && path.indexOf('.') < 0) ? '' : context;
        
                    /**
                    * Never resolve 'require', 'module' and 'exports' to absolute paths
                    * For plugins, only resolve the plugin path, not anything after the first '!'
                    */
                    if (path && (~_rem.indexOf(path) || ~path.indexOf('!'))) {
                        return path.replace(/([\d,\w,\s,\.\/]*)(?=\!)/, function ($0, $1) {
                            return _resolve($1, context);
                        });
                    }
        
                    return _normalize((context ? context + '/' : '') + path);
                }
        
                /**
                * Loop through all of the items in _loadQ and if all modules in a given
                * queue are defined, call the callback function associated with the queue.
                */
                function _checkLoadQ (i, j, q, ready) {
        
                    for (i = _loadQ.length - 1; ~i && (q = _loadQ[i]); i --) {
        
                        ready = 1;
                        for (j = q.m.length - 1; ~j && ready; j --) {
                            ready = _module(q.m[j]);
                        }
                        if (ready) {
                            _loadQ.splice(i, 1);
                            require(q.m, q.cb);
                        }
                    }
                }
        
                /**
                * Invokes the first anonymous item in _defineQ.
                * Called from script.onLoad, and loader plugins .fromText() method.
                */
                function _invokeAnonymousDefine (id, url, q) {
        
                    if (_defineQ.length) {
        
                        q = _defineQ.splice(0, 1)[0];
        
                        if (q) {
                            /**
                            * If the q is not null, it's an anonymous module and we have to invoke define()
                            * But first we need to tell the q which id to use, and set alreadyQed to true.
                            */
                            q.splice(0, 0, id); // set the module id
                            q.splice(3, 0, 1); // set alreadyQed to true
                            q.splice(4, 0, 0); // set depsLoaded to false
        
                            if (url) {
                                q[5].url = url;
                            }
        
                            define.apply($b, q);
                        }
                    }
                }
        
                /**
                * Injects a script tag into the DOM
                */
                function _inject (f, m, script, q, isReady, timeoutID) {
        
                    // If in a CJS environment, resolve immediately.
                    if (IS_NODE) {
                        origRequire(f);
                        _invokeAnonymousDefine(m, f);
                        return 1;
                    }
        
                    _head = _head || document.getElementsByTagName('head')[0];
        
                    script = document.createElement('script');
                    script.src = f;
        
                    /**
                    * Bind to load events, we do it this way vs. addEventListener for IE support.
                    * No reason to use addEventListener() then fallback to script.onload, just always use script.onload;
                    */
                    script.onreadystatechange = script.onload = function () {
        
                        if (!script.readyState || script.readyState === 'complete' || script.readyState === 'loaded') {
        
                            clearTimeout(timeoutID);
                            script.onload = script.onreadystatechange = script.onerror = null;
        
                            _invokeAnonymousDefine(m, f);
                        }
                    };
        
                    /**
                    * script.onerror gets called in two ways.
                    * The first, if a script request actually errors (i.e. a 404)
                    * The second, if a script takes more than X seconds to respond. Where X = _waitSeconds
                    */
                    script.onerror = function () {
        
                        clearTimeout(timeoutID);
                        script.onload = script.onreadystatechange = script.onerror = null;
        
                        throw new Error(f + ' failed to load.');
                    };
        
                    timeoutID = setTimeout(script.onerror, _waitSeconds * 1000);
        
                    // Prepend the script to document.head
                    _head.insertBefore(script, _head.firstChild);
        
                    return 1;
                }
        
                /**
                * Does all the loading of modules and plugins.
                */
                function _load (modules, callback, context, i, q, m, f) {
        
                    q = {m: modules, cb: callback};
                    _loadQ.push(q);
        
                    for (i = 0; i < modules.length; i ++) {
                        m = modules[i];
                        if (~m.indexOf('!')) {
                            /**
                            * If the module id has a '!' in it, it's a plugin...
                            */
                            _loadPluginModule(m, context, q, i);
                            continue;
                        }
        
                        /**
                        * Otherwise, it's normal module, not a plugin. Inject the file into the DOM if
                        * the file has not been loaded yet and if the module is not yet defined.
                        */
                        f = _getURL(m);
                        _loadedFiles[f] = (!_module(m) && !_loadedFiles[f]) ? _inject(f, m) : 1;
                    }
                }
        
                /**
                * Called by _load() and require() used for loading and getting plugin-type modules
                */
                function _loadPluginModule (module, context, q, moduleIndex, definition, plugin, pluginPath) {
        
                    /**
                    * Set the plugin path. Plugins are stored differently than normal modules
                    * Essentially they are stored along with the context in a special 'plugins'
                    * subpath. This allows modules to lookup plugins with the sync require('index!./foo:./bar') method
                    */
        
                    pluginPath = (context ? context + '/' : '') + 'plugins/' + module.replace(/\//g, '_');
        
                    /*
                    * Update the path to this plugin in the queue
                    */
                    if (q) {
                        q.m[moduleIndex] = pluginPath;
                    }
        
                    module = module.split('!');
                    plugin = module.splice(0, 1)[0];
                    module = module.join('!');
        
                    /*
                    * Let's check to see if the module is already defined.
                    */
                    definition = _module(pluginPath);
        
                    /*
                    * If the plugin is defined, no need to do anything else, so return.
                    * If q is null, return no matter what.
                    */
                    if (!q || definition) {
                        return definition;
                    }
        
                    /**
                    * Let's make sure the plugin is loaded before we do anything else.
                    */
                    require(plugin, function (pluginModule) {
        
                        /**
                        * If the plugin module has a normalize() method defined, use it
                        */
                        module = pluginModule.normalize ?
                            pluginModule.normalize(module, function (path) {
                                return _resolve(path, context);
                            }) :
                            _resolve(_normalize(module), context);
        
                        function load (definition) {
                            _module(pluginPath, {exports: definition});
                            _checkLoadQ();
                        }
        
                        load.fromText = function (name, definition, dqL) {
        
                            /**
                            * Update the module path in the load queue with the newly computed module id
                            */
                            q.m[moduleIndex] = pluginPath = name;
        
                            /**
                            * Store the length of the define queue, to check against after the eval().
                            */
                            dqL = _defineQ.length;
        
                            /**
                            * Yes, eval/Function is bad, evil. I hate it, you hate it, but some plugins need it.
                            * If you don't have any plugins using fromText(), feel free to comment
                            * the entire load.fromText() out and re-minify the source.
                            * I use Function vs eval() because nothing executing through fromText() should need access
                            * to local vars, and Uglify does not mangle variables if it finds 'eval()' in your code.
                            */
        
                            /*jslint evil: true */
                            new Function(definition)();
        
                            if (_defineQ.length - dqL) {
                                // Looks like there was a define call in the eval'ed text.
                                _invokeAnonymousDefine(pluginPath);
                            }
                        };
        
                        return pluginModule.load(
                            module,
                            require.localize(_getContext(plugin)),
                            load,
                            _config[plugin] || {}
                        );
                    });
                }
        
                /**
                * Gets the module by `id`, otherwise if `def` is specified, define a new module.
                */
                function _module (id, def, noExports, module) {
        
                    /**
                    * Always return back the id for 'require', 'module' and 'exports',
                    * these are replaced by calling _swapValues
                    */
                    if (~_rem.indexOf(id)) {
                        return id;
                    }
        
                    /**
                    * If a definition was specified, set the module definition
                    */
                    module = _modules[id] = def || _modules[id];
        
                    /**
                    * noExports is set to true from within define, to get back the full module object.
                    * If noExports != true, then we return the exports property of the module.
                    * If the module is not defined, return false
                    */
                    return (module && module.exports) ? (noExports ? module : module.exports) : 0;
                }
        
                /**
                * Gets the URL for a module by `id`. Paths passed to _getURL must be absolute.
                * To get URLs for relative paths use require.toUrl(id, context)
                */
                function _getURL (id, prefix) {
        
                    /**
                    * If the path starts with a '/', or 'http', it's an absolute URL
                    * If it's not an absolute URL, prefix the request with baseUrl
                    */
        
                    prefix = (!id.indexOf('/') || !id.indexOf('http')) ? '' : _baseUrl;
        
                    for (var p in _paths) {
                        id = id.replace(new RegExp('(^' + p + ')', 'g'), _paths[p]);
                    }
        
                    return prefix + id + (id.indexOf('.') < 0 ? '.js' : '') + _urlArgs;
                }
        
                /**
                * Takes an array as the first argument, and an object as the second.
                * Replaces any values found in the array, with values in the object.
                */
                function _swapValues (a, s, j) {
                    for (var i in s) {
                        j = a.indexOf(i);
                        if (~j) {
                            a[j] = s[i];
                        }
                    }
                    return a;
                }
        
                /**
                * Stores dependencies for this module id.
                * Also checks for any circular dependencies, if found, it defines those modules as empty objects temporarily
                */
                function _resolveCircularReferences (id, dependencies, circulars, i, j, d, subDeps, sd) {
        
                    _dependencies[id] = dependencies;
        
                    /**
                    * Check for any dependencies that have circular references back to this module
                    */
                    for (i = 0; i < dependencies.length; i ++) {
                        d = dependencies[i];
                        subDeps = _dependencies[d];
                        if (subDeps) {
                            for (j = 0; j < subDeps.length; j ++) {
                                sd = subDeps[j];
                                if (dependencies.indexOf(sd) < 0) {
                                    if (sd !== id) {
                                        dependencies.push(sd);
                                    }
                                    else {
                                        /**
                                        * Circular reference detected, define circular
                                        * references as empty modules to be defined later
                                        */
                                        _module(d, {exports : {}});
                                    }
                                }
                            }
                        }
                    }
                }
        
                /**
                * Define modules. AMD-spec compliant.
                */
                function define (
                    id,
                    dependencies,
                    factory,
                    alreadyQed,
                    depsLoaded,
                    meta,
                    module,
                    facArgs,
                    context,
                    ri,
                    localRequire
                ) {
        
                    if (!meta) {
                        meta = _meta();
                    }
        
                    if (typeof id !== 'string') {
        
                        /**
                        * No id means that this is an anonymous module,
                        * push it to a queue, to be defined upon onLoad
                        */
        
                        factory = dependencies;
                        dependencies = id;
                        id = 0;
                        _defineQ.push([dependencies, factory, meta]);
        
                        return meta;
                    }
        
                    if (!Array.isArray(dependencies)) {
                        factory = dependencies;
                        dependencies = [];
                    }
        
                    if (!alreadyQed) {
                        /**
                        * ID was specified, so this is not an anonymous module,
                        * However, we still need to add an empty queue here to be cleaned up by onLoad
                        */
                        // TODO : REVISIT
                        // _defineQ.push(0);
                    }
        
                    context = _getContext(id);
                    localRequire = require.localize(context);
        
                    /**
                    * No dependencies, but the factory function is expecting arguments?
                    * This means that this is a CommonJS-type module...
                    */
        
                    if (!dependencies.length && factory.length && typeof factory === 'function' && !factory.__meta) {
        
                        /**
                        * Let's check for any references of sync-type require('moduleID')
                        */
                        factory.toString()
                            // Remove any comments first
                            .replace(/(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg, '')
                            // Now let's check for any sync style require('module') calls
                            .replace(/(?:require)\(\s*['']([^''\s]+)['']\s*\)/g,
        
                                function ($0, $1) {
                                    if (dependencies.indexOf($1) < 0) {
                                        /**
                                        * We're not actually replacing anyting inside factory.toString(),
                                        * but this is a nice, clean, convenient way to add any
                                        * sync-type require() matches to the dependencies array.
                                        */
                                        dependencies.push($1);
                                    }
                                }
                            );
        
                        dependencies = (_rem.slice(0, factory.length)).concat(dependencies);
                    }
        
                    if (dependencies.length && !depsLoaded) {
        
                        /**
                        * Dependencies have not been loaded yet, so let's call require() to load them
                        * After the dependencies are loaded, reinvoke define() with depsLoaded set to true.
                        */
                        _resolveCircularReferences(id, dependencies.slice(0));
        
                        localRequire(dependencies, function () {
                            define(id, Array.prototype.slice.call(arguments, 0), factory, 1, 1, meta);
                        });
        
                        return meta;
                    }
        
                    /**
                    * At this point, we know all dependencies have been loaded,
                    * and `dependencies` is an actually array of modules, not their ids
                    * Get the module if it has already been defined, otherwise let's create it
                    */
        
                    module = _module(id, 0, 1);
                    module = module || {exports: {}};
        
                    if (typeof factory === 'function' && !factory.__meta) {
        
                        /**
                        * If the factory is a function, we need to invoke it.
                        * First let's swap 'require', 'module' and 'exports' with actual objects
                        */
                        facArgs = _swapValues(
                            dependencies.length ? dependencies : (_rem.slice(0, factory.length)),
                            {
                                'require' : localRequire,
                                'module' : module,
                                'exports' : module.exports
                            }
                        );
        
                        /**
                        * In some scenarios, the global require object might have slipped through,
                        * If so, replace it with a localized require.
                        */
                        ri = facArgs.indexOf(require);
                        if (~ri) {
                            facArgs[ri] = localRequire;
                        }
        
                        /**
                        * If the function returns a value, then use that as the module definition
                        * Otherwise, assume the function modifies the exports object.
                        */
                        module.exports = factory.apply(factory, facArgs) || module.exports;
                    }
        
                    else {
                        /**
                        * If the factory is not a function, set module.exports to whatever factory is
                        */
                        module.exports = factory;
                    }
        
                    /**
                    * Make the call to define the module.
                    */
                    _module(id, module);
                    meta.resolve(id, module);
        
                    /**
                    * Clear the dependencies from the _dependencies object.
                    * _dependencies gets checked regularly to resolve circular dependencies
                    * and if this module had any circulars, they have already been resolved.
                    */
                    delete _dependencies[id];
        
                    /**
                    * Now let's check the _loadQ
                    */
                    _checkLoadQ();
        
                    return meta;
                }
        
                /**
                * Our define() function is an AMD implementation
                */
                define.amd = {};
        
                function undefine (id) {
                    _modules[id] = _metas[id] = null;
                    delete _modules[id];
                    delete _metas[id];
                }
        
                /**
                * Asynchronously loads in js files for the modules specified.
                * If all modules are already defined, the callback function is invoked immediately.
                * If id(s) is specified but no callback function, attempt to get the module and
                * return the module if it is defined, otherwise throw an Error.
                */
                function require (ids, callback, context, plugins, i, modules, plugin) {
        
                    if (!callback && typeof ids === 'string') {
                        /**
                        * If no callback is specified, then try to get the module by it's ID
                        */
        
                        ids = _resolve(ids, context);
                        callback = _module(ids);
        
                        if (!callback) {
        
                            plugin = _loadPluginModule(ids, context);
        
                            if (plugin) {
                                return plugin;
                            }
        
                            return {
                                id : ids,
                                __isRequire : true,
                                resolve : function (cb) {
                                    return require(ids, cb);
                                }
                            };
                        }
        
                        /**
                        * Otherwise return the module's definition.
                        */
                        return callback;
                    }
        
                    if (!callback) {
                        callback = function () {};
                    }
        
                    ids = (!Array.isArray(ids)) ? [ids] : ids;
                    modules = [];
        
                    for (i = 0; i < ids.length; i ++) {
                        /**
                        * Convert all relative paths to absolute paths,
                        * Then check to see if the modules are already defined.
                        */
                        ids[i] = _resolve(ids[i], context);
                        modules.push(_module(ids[i]));
                    }
        
                    if (~modules.indexOf(0)) {
                        /**
                        * If any one of the modules is not yet defined, we need to
                        * wait until the undefined module(s) are loaded, so call load() and return.
                        */
                        _load(ids, callback, context);
                        return;
                    }
        
                    /**
                    * Otherwise, we know all modules are already defined.
                    * Invoke the callback immediately, swapping 'require' with the actual require function
                    */
                    return callback.apply($b, _swapValues(modules, {'require' : require}));
                }
        
                /**
                * Configure, possible configuration properties are:
                *
                *    - baseUrl
                *    - urlArgs
                *    - waitSeconds
                */
                require.config = function (obj) {
        
                    _config = obj || {};
        
                    _baseUrl = _config.baseUrl ? _config.baseUrl : _baseUrl;
        
                    // Add a trailing slash to baseUrl if needed.
                    _baseUrl += (_baseUrl && _baseUrl.charAt(_baseUrl.length - 1) !== '/') ? '/' : '';
                    _baseUrl = _normalize(_baseUrl);
        
                    _urlArgs = _config.urlArgs ? '?' + _config.urlArgs : _urlArgs;
        
                    _waitSeconds = _config.waitSeconds || _waitSeconds;
        
                    for (var p in _config.paths) {
                        _paths[p] = _config.paths[p];
                    }
                };
        
                /**
                * Get a url for a relative id.
                * You do not need to specify `context` if calling this from within a define() call,
                * or a localized version of require();
                */
                require.toUrl = function (id, context) {
                    return _getURL(_resolve(id, context));
                };
        
                require.metas = function () {
        
                    var p,
                        metasArray;
        
                    metasArray = [];
        
                    for (p in _metas) {
                        metasArray.push(_metas[p]);
                    }
        
                    return metasArray.sort(function (a, b) {
                        return a.order - b.order;
                    });
                };
        
                /**
                * Returns a localized version of require, so that modules do not need
                * to specify their own id, when requiring relative modules, or resolving relative urls.
                */
                require.localize = function (context) {
        
                    function localRequire (ids, callback) {
                        return require(ids, callback, context);
                    }
        
                    localRequire.toUrl = function (id) {
                        return require.toUrl(id, context);
                    };
        
                    return localRequire;
                };
        
                return {
                    require : require,
                    define  : define,
                    undefine : undefine
                };
        
            })();
        
            $b.require = resolver.require;
            $b.define = resolver.define;
            $b.undefine = resolver.undefine;
        
            /* jshint ignore : start */
            if (origRequire) {
                require = origRequire;
            }
            /* jshint ignore : end */
        
        }).call(this);
    
    $b.define('$b', $b);
    
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = $b;
    }

    $b.define('brink/config', 
    
        function () {
    
            'use strict';
    
            return {};
        }
    
    ).attach('$b');

    $b('brink/dev/error', 
    
        function () {
    
            'use strict';
    
            return function (msg) {
                throw new Error(msg);
            };
        }
    
    ).attach('$b');

    $b('brink/dev/assert', 
    
        [
            './error'
        ],
    
        function (error) {
    
            'use strict';
    
            return function (msg, test) {
    
                if (!test) {
                    error(msg);
                }
            };
        }
    
    ).attach('$b');
    

    $b('brink/dev/warn', 
    
        function () {
    
            'use strict';
    
            return function (msg) {
                console.warn(msg);
            };
        }
    
    ).attach('$b');

    $b('brink/utils/isFunction', 
    
        /***********************************************************************
        @class Brink
        ************************************************************************/
        function () {
    
            'use strict';
    
            /***********************************************************************
            Test whether or not a value is a `Function`.
    
            @method isFunction
            @param {Any} fn The value to check.
            @return {Boolean} Whether or not the value is a `Function`.
            ************************************************************************/
            return function (obj) {
                return typeof obj === 'function';
            };
        }
    
    ).attach('$b');

    $b('brink/utils/computed', 
    
        [
            './isFunction'
        ],
    
        /***********************************************************************
        @class Brink
        ************************************************************************/
        function (isFunction) {
    
            'use strict';
    
            /***********************************************************************
            Create a computed property on a {{#crossLink "Brink.Object"}}{{/crossLink}}
            instance or subclass.
    
            There are two ways to define computed properties, both methods are given below.
    
            **METHOD 1:**
            ```javascript
    
            var Person = $b.Object.extend({
                firstName : '',
                lastLame : '',
                fullName : $b.computed(function () {
                    return this.firstName + ' ' + this.lastName;
                }, 'firstName', 'lastName')
            });
    
            personInstance = Person.create({firstName : 'Jane', lastName : 'Doe'});
            console.log(personInstance.fullName); // 'Jane Doe';
    
            personInstance.lastName = 'Smith';
            console.log(personInstance.fullName); // 'Jane Smith';
    
            ```
            **METHOD 2:**
            ```javascript
            var personInstance = $b.Object.create({
                firstName : 'Jane',
                lastName : 'Smith',
                fullName : $b.computed({
    
                    watch : ['firstName', 'lastName'],
    
                    get : function () {
                        return [this.firstName, this.lastName].join(' ');
                    },
    
                    set : function (val) {
                        val = val.split(' ');
                        this.firstName = val[0];
                        this.lastName = val[1] || '';
                        return val.join(' ');
                    }
                })
            });
    
            console.log(personInstance.fullName); // 'Jane Smith';
            personInstance.fullName = 'John Doe';
            console.log(personInstance.firstName, personInstance.lastName); // 'John', 'Doe';
    
            ```
    
            You can use the second method with a getter AND setter, only a getter or only a setter.
            The first method only allows supplying a getter.
    
            The `watch` property is an array of properties that will cause this computed
            property to return a new value. In the first method, these properties
            can be specified after the getter.
    
            If you just want getter/setter support for a property you can specify an
            empty array for the `watch` property or not define it at all.
    
            @method computed
            @param {Function} fn The getter for the computed property.
            @param {String} ...watch The properties to watch.
            @return {ComputedProperty}
            ************************************************************************/
            return function (o) {
    
                if (isFunction(o)) {
                    o = {
                        watch : arguments[1],
                        get : o
                    };
                }
    
                if (typeof o.value === 'undefined') {
                    o.value = o.defaultValue;
                }
    
                o.watch = o.hasOwnProperty('watch') ? [].concat(o.watch) : [];
                o.__meta = {};
                o.__isComputed = true;
    
                o.meta = function (m) {
    
                    var p;
    
                    if (typeof m !== 'undefined') {
                        for (p in m) {
                            o.__meta[p] = m[p];
                        }
                    }
    
                    return o.__meta;
    
                }.bind(o);
    
                return o;
            };
        }
    
    ).attach('$b');

    $b('brink/utils/alias', 
    
        [
            './computed'
        ],
    
        /***********************************************************************
        @class Brink
        ************************************************************************/
        function (computed) {
    
            'use strict';
            /***********************************************************************
            Alias a property to another property on the object.
    
            ```javascript
    
            var obj = $b.Object.create({
                a : 'test',
                b : $b.alias('a')
            });
    
            console.log(obj.a, obj.b); //test, test
            this.b = 'test2';
            console.log(obj.a, obj.b); // test2, test2
    
            ```
    
            ```javascript
    
            var obj = $b.Object.create({a : 'test'});
            obj.prop('b', $b.alias('a'));
    
            console.log(obj.a, obj.b); // test, test
    
            obj.b = 'test2';
    
            console.log(obj.a, obj.b); // test2, test2
    
            ```
    
            @method alias
            @param {String} key The property to alias.
            @return {ComputedProperty} A computed property with a getter/setter that references the alias.
            ************************************************************************/
            return function (s) {
    
                return computed({
    
                    watch : [s],
    
                    get : function () {
                        return this.get(s);
                    },
    
                    set : function (val) {
                        return this.set(s, val);
                    }
                });
            };
        }
    
    ).attach('$b');
    

    $b('brink/utils/get', 
    
        [
        ],
    
        /***********************************************************************
        @class Brink
        ************************************************************************/
        function () {
    
            'use strict';
            /***********************************************************************
            Get a property or nested property on an object. Works on POJOs as well
            as `Brink.Object` instances.
    
            ```javascript
            var obj = {
                test : 'test',
                some : {
                    nested : {
                        key : 'test2'
                    }
                }
            };
    
            console.log($b.get(obj, 'test')); // 'test';
            console.log($b.get(obj, 'some.nested.key')); // 'test2';
            ```
    
            @method get
            @param {Object} The object containing the property.
            @param {String} key The property or nested property to get.
            @return {Any} The value of the property.
            ************************************************************************/
            return function (obj, key) {
    
                var i,
                    k;
                key = key.split('.');
    
                for (i = 0; i < key.length; i ++) {
                    k = key[i];
    
                    if (!obj) {
                        return null;
                    }
    
                    if (obj instanceof $b.Object) {
    
                        if (obj.isDestroyed) {
                            return null;
                        }
    
                        if (obj.__meta.getters[k]) {
                            obj = obj.__meta.getters[k].call(obj, k);
                        }
    
                        else {
                            obj = obj.__meta.pojoStyle ? obj[k] : obj.__meta.values[k];
                        }
                    }
    
                    else {
                        obj = obj[k];
                    }
                }
    
                return obj;
            };
        }
    
    ).attach('$b');
    

    $b('brink/utils/getObjKeyPair', 
    
        [
            './get'
        ],
    
        /***********************************************************************
        @class Brink
        ************************************************************************/
        function (get) {
    
            'use strict';
    
            /***********************************************************************
            Given an object and a 'nested property', return the sub-object and key name.
    
            ```javascript
            var obj = {
                some : {
                    nested : {
                        key : 'test'
                    }
                }
            };
    
            console.log($b.getObjKeyPair(obj, 'some.nested.key')) // [ { key: 'test' }, 'key' ]
            ```
    
            @method getObjKeyPair
            @param {Object} The object containing the nested key.
            @param {String} key The nested key.
            @param {Boolean} [createIfNull=false] Whether to create objects for nested keys if the path would be invalid.
            @return {Array} An `Array` of `[obj, unNestedKeyName]`
            ************************************************************************/
            return function (obj, key, createIfNull) {
    
                var i,
                    val;
    
                key = key.split('.');
    
                for (i = 0; i < key.length - 1; i ++) {
                    val = get(obj, key[i]);
                    if (val == null && createIfNull) {
                        val = obj[key[i]] = {};
                    }
                    obj = val;
                }
    
                key = key.pop();
    
                return [obj, key];
            };
        }
    
    ).attach('$b');
    

    $b('brink/utils/isBrinkInstance', 
    
        [
    
        ],
    
        /***********************************************************************
        @class Brink
        ************************************************************************/
        function () {
    
            'use strict';
    
            /***********************************************************************
            Test whether or not a value is an instance of `Brink.Object` or `Brink.Object` subclass.
    
            @method isBrinkInstance
            @param {Any} obj The value to check.
            @return {Boolean} Whether or not the value is an instance of `Brink.Object`.
            ************************************************************************/
            return function (obj) {
                return obj.constructor.__meta.isObject;
            };
        }
    
    ).attach('$b');

    $b('brink/utils/bindTo', 
    
        [
            './alias',
            './computed',
            './getObjKeyPair',
            './isBrinkInstance'
        ],
    
        /***********************************************************************
        @class Brink
        ************************************************************************/
        function (alias, computed, getObjKeyPair, isBrinkInstance) {
    
            'use strict';
            /***********************************************************************
            Two-way bind a property on `A` to a property on `B`
    
            ```javascript
    
            var a = $b.Object.create({
                test : 'test'
            });
    
            var b = $b.Object.create({
                test : $b.bindTo(a, 'test')
            });
    
            console.log(a.test, b.test); // test, test
            b.test = 'test2';
            console.log(a.test, b.test); // test2, test2
    
            ```
    
            @method bindTo
            @param {Brink.Object} obj The object that contains the property to alias.
            @param {String} key The property to alias.
            ************************************************************************/
            return function (a, prop, isDefined) {
    
                var b;
    
                if (arguments.length > 1) {
    
                    $b.assert('Object must be an instance of Brink.Object or Brink.Class', isBrinkInstance(a));
    
                    if (!isDefined) {
                        a.prop(prop);
                    }
    
                    b = computed({
    
                        boundTo : [a, prop],
    
                        get : function () {
                            return a.get(prop);
                        },
    
                        set : function (val) {
                            return a.set(prop, val);
                        }
                    });
                }
    
                else {
                    b = alias(a);
                }
    
                return b;
            };
        }
    
    ).attach('$b');

    $b('brink/utils/isObject', 
    
        /***********************************************************************
        @class Brink
        ************************************************************************/
        function () {
    
            'use strict';
    
            var objectTypes = {
                'function' : true,
                'object' : true,
                'unknown' : true
            };
    
            /***********************************************************************
            Test whether or not a value is an `Object`.
    
            @method isObject
            @param {Any} obj The value to check.
            @return {Boolean} Whether or not the value is an `Object`.
            ************************************************************************/
            return function (obj) {
                return obj ? !!objectTypes[typeof obj] : false;
            };
        }
    
    ).attach('$b');

    $b('brink/utils/merge', 
    
        [
            './isObject'
        ],
    
        /***********************************************************************
        @class Brink
        ************************************************************************/
        function (isObject) {
    
            'use strict';
    
            /***********************************************************************
            Merge one `Array` or `Object` into another `Array` or `Object`.
            Modifies the first `Object` or `Array` passed in as an argument.
    
            @method merge
            @param {Object|Array} obj1 The `Object` or `Array` to merge into.
            @param {Object|Array} obj2 The `Object` or `Array` containing values to merge.
            @param {Boolean} [deep=false] Whether or not to deep copy objects when merging
            (`true`) or shallow copy (`false`)
            @return {Object|Array} The merged `Object` or `Array`.
            ************************************************************************/
            return function merge (a, b, deep) {
    
                var p,
                    o,
                    d;
    
                function arrayOrObject (o) {
                    return Array.isArray(o) ? [] : isObject(o) ? {} : false;
                }
    
                if (Array.isArray(a) || Array.isArray(b)) {
    
                    a = a || [];
                    b = b || [];
    
                    for (p = 0; p < b.length; p ++) {
    
                        o = b[p];
    
                        if (!~a.indexOf(o)) {
                            d = deep ? arrayOrObject(o) : null;
                            a.push(d ? merge(d, o, true) : o);
                        }
                    }
                    return a;
                }
    
                else if (isObject(a) || isObject(b)) {
    
                    a = a || {};
                    b = b || {};
    
                    for (p in b) {
    
                        o = b[p];
    
                        if (!b.hasOwnProperty(p)) {
                            continue;
                        }
    
                        d = deep ? arrayOrObject(o) : null;
                        a[p] = d ? merge(d, o, true) : o;
                    }
    
                    return a;
                }
    
                return null;
    
            };
        }
    
    ).attach('$b');

    $b('brink/utils/clone', 
    
        [
            './merge',
            './isObject'
        ],
    
        /***********************************************************************
        @class Brink
        ************************************************************************/
        function (merge, isObject) {
    
            'use strict';
    
            /***********************************************************************
            Creates a copy of a plain Object or Array. (Do not use on Brink.Object/Array instances).
    
            @method clone
            @param {Object|Array} obj The object or array to clone.
            @param {Boolean} [deep=false] Whether or not to deep copy (`true`) or shallow copy (`false`)
            ************************************************************************/
            return function (o, deep, a) {
    
                function arrayOrObject (o) {
                    return Array.isArray(o) ? [] : isObject(o) ? {} : null;
                }
    
                a = arrayOrObject(o);
    
                return a ? merge(a, o, deep) : null;
            };
        }
    
    ).attach('$b');

    $b('brink/utils/configure', 
    
        [
            './merge',
            '../config'
        ],
    
        /***********************************************************************
        @class Brink
        ************************************************************************/
        function (merge, config) {
    
            'use strict';
    
            /***********************************************************************
            Set Brink configuration properties at runtime.
    
            @method configure
            @param {Object} obj Object of configuration properties.
            ************************************************************************/
            return function (o) {
                $b.merge(config, o);
                return config;
            };
        }
    
    ).attach('$b');
    

    $b('brink/utils/defineProperty', 
    
        [
            './isBrinkInstance'
        ],
    
        /***********************************************************************
        @class Brink
        ************************************************************************/
        function (isBrinkInstance) {
    
            'use strict';
    
            /***********************************************************************
            Used by `Brink.Object.prototype.prop()` for property descriptors.
    
            @method defineProperty
            @private
            ************************************************************************/
            return function (obj, prop, descriptor) {
    
                var d;
    
                d = descriptor;
    
                if (d.__meta && (d.__meta.isAttribute || d.__meta.isRelationship)) {
                    d = d.clone();
                }
    
                $b.assert('Object must be an instance of Brink.Object or Brink.Class', isBrinkInstance(obj));
    
                d.configurable = true;
                d.enumerable = descriptor.enumerable !== 'undefined' ? descriptor.enumerable : true;
    
                if (prop.indexOf('__') === 0) {
                    d.configurable = false;
                    d.enumerable = false;
                }
    
                d.get = obj.__defineGetter(prop, descriptor.get || obj.__writeOnly(prop));
                d.set = obj.__defineSetter(prop, descriptor.set || obj.__readOnly(prop));
    
                d.defaultValue = (
                    typeof descriptor.defaultValue !== 'undefined' ?
                        descriptor.defaultValue : descriptor.value
                );
    
                delete d.value;
                delete d.writable;
    
                return d;
            };
        }
    
    ).attach('$b');
    

    $b('brink/utils/extend', 
    
        [
            './isObject',
            './isFunction'
        ],
    
        /***********************************************************************
        @class Brink
        ************************************************************************/
    
        /***********************************************************************
        Used by `Brink.CoreObject` for inheritance and mixins.
    
        @method extend
        @private
        ************************************************************************/
        function (isObject, isFunction) {
    
            'use strict';
    
            function isPlainObject (o) {
                return isObject(o) && o.constructor === Object;
            }
    
            function isArray (a) {
                return Array.isArray(a);
            }
    
            function extend (target) {
    
                var i,
                    l,
                    src,
                    clone,
                    copy,
                    deep,
                    name,
                    options,
                    copyIsArray;
    
                // Handle case when target is a string or something (possible in deep copy)
                if (typeof target !== 'object' && !isFunction(target)) {
                    target = {};
                }
    
                i = isObject(arguments[1]) ? 1 : 2;
                deep = (arguments[1] === true);
    
                for (l = arguments.length; i < l; i ++) {
    
                    // Only deal with non-null/undefined values
                    if ((options = arguments[i]) != null) {
    
                        // Extend the base object
                        for (name in options) {
    
                            src = target[name];
                            copy = options[name];
    
                            // Prevent never-ending loop
                            if (target === copy) {
                                continue;
                            }
    
                            // Recurse if we're merging plain objects or arrays
                            if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
    
                                if (copyIsArray) {
                                    copyIsArray = false;
                                    clone = src && isArray(src) ? src : [];
    
                                }
    
                                else {
                                    clone = src && isPlainObject(src) ? src : {};
                                }
    
                                // Never move original objects, clone them
                                target[name] = extend(clone, deep, copy);
                            }
    
                            // Don't bring in undefined values
                            else if (copy !== undefined) {
                                target[name] = copy;
                            }
                        }
                    }
                }
    
                return target;
            }
    
            return extend;
        }
    
    ).attach('$b');

    $b('brink/utils/expandProps', 
    
        /***********************************************************************
        @class Brink
        ************************************************************************/
        function () {
    
            'use strict';
    
            return function (a, skipRoot) {
    
                var b,
                    i,
                    j,
                    p,
                    n,
                    s;
    
                a = [].concat(a);
    
                s = [];
    
                for (i = 0; i < a.length; i ++) {
    
                    p = a[i];
    
                    if (!skipRoot && ~p.indexOf('.')) {
    
                        b = p.split('.');
                        b.splice(b.length - 1, 1);
                        n = null;
    
                        while (b.length) {
                            n = n ? n + '.' : '';
                            n += b.splice(0, 1)[0];
                            s.push(n);
                        }
                    }
    
                    if (~p.indexOf(',')) {
                        p = p.split('.');
                        n = p.splice(0, p.length - 1).join('.');
                        b = p[0].split(',');
                        p = [];
    
                        for (j = 0; j < b.length; j ++) {
                            p.push([n, b[j]].join(n ? '.' : ''));
                        }
                    }
    
                    s = s.concat(p);
                }
    
                return s;
            };
        }
    
    ).attach('$b');

    $b('brink/utils/flatten', 
    
        [
            './merge'
        ],
    
        /***********************************************************************
        @class Brink
        ************************************************************************/
        function (merge) {
    
            'use strict';
    
            /***********************************************************************
            Flatten an array.
    
            This will go through each item in the array and if the value
            is also an array, will merge it into the parent array.
    
            Does not modify the original array.
    
            @method flatten
            @param {Array} arr The array to flatten.
            @param {Boolean} [keepDuplicates=false] Whether or not to keep duplicate values when flattening.
            @return {Array} The flattened array.
            ************************************************************************/
            return function flatten (a, keepDuplicates) {
    
                var i,
                    b,
                    c;
    
                b = [];
    
                for (i = 0; i < a.length; i ++) {
    
                    c = a[i];
    
                    if (Array.isArray(c)) {
                        c = flatten(c);
                    }
    
                    b = b.concat(c);
                }
    
                if (!keepDuplicates) {
                    merge([], b);
                }
    
                return b;
            };
        }
    
    ).attach('$b');

    $b('brink/utils/intersect', 
    
        [
        ],
    
        /***********************************************************************
        @class Brink
        ************************************************************************/
        function () {
    
            'use strict';
    
            /***********************************************************************
            Compare two arrays and return an `Array` with items that exist
            in both arrays.
    
            @method intersect
            @param {Array} arr1 The first `Array` to compare.
            @param {Array} arr2 The second `Array` to compare.
            @return {Array} `Array` of items that exist in both arrays.
            ************************************************************************/
            return function (a, b) {
    
                var i,
                    c,
                    d;
    
                c = [];
                i = b.length;
    
                if (!a.length || !i) {
                    return c;
                }
    
                while (i--) {
                    d = b[i];
                    if (~a.indexOf(d)) {
                        c.push(d);
                    }
                }
    
                return c;
            };
        }
    
    ).attach('$b');
    

    $b('brink/utils/params', 
    
        /***********************************************************************
        @class Brink
        ************************************************************************/
        function () {
    
            'use strict';
    
            function bodyEncode (s) {
                return encodeURIComponent(s).replace(/[!'()*]/g, function (c) {
                    return '%' + c.charCodeAt(0).toString(16);
                });
            }
    
            /***********************************************************************
            Serializes an object into URL params (or request body)
    
            @method params
            @param {Object} obj The `Object` to serialize.
            @return {String} The serialized Object.
            ************************************************************************/
            return function (o, isBody) {
    
                var p,
                    result,
                    encode = isBody ? bodyEncode : encodeURIComponent;
    
                result = '';
    
                for (p in o) {
                    result += (result ? '&' : '') + encode(p) + '=' + encode(o[p]);
                }
    
                return result;
            };
        }
    
    ).attach('$b');

    // vim:ts=4:sts=4:sw=4:
    /*!
     *
     * Copyright 2009-2012 Kris Kowal under the terms of the MIT
     * license found at http://github.com/kriskowal/q/raw/master/LICENSE
     *
     * With parts by Tyler Close
     * Copyright 2007-2009 Tyler Close under the terms of the MIT X license found
     * at http://www.opensource.org/licenses/mit-license.html
     * Forked at ref_send.js version: 2009-05-11
     *
     * With parts by Mark Miller
     * Copyright (C) 2011 Google Inc.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     * http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     *
     */
    $b('brink/utils/Q', function () {
    
        "use strict";
    
        var hasStacks = false;
        try {
            throw new Error();
        } catch (e) {
            hasStacks = !!e.stack;
        }
    
        // All code after this point will be filtered from stack traces reported
        // by Q.
        var qStartingLine = captureLine();
        var qFileName;
    
        // shims
    
        // used for fallback in "allResolved"
        var noop = function () {};
    
        // Use the fastest possible means to execute a task in a future turn
        // of the event loop.
        var nextTick =(function () {
            // linked list of tasks (single, with head node)
            var head = {task: void 0, next: null};
            var tail = head;
            var flushing = false;
            var requestTick = void 0;
            var isNodeJS = false;
    
            function flush() {
                /* jshint loopfunc: true */
    
                while (head.next) {
                    head = head.next;
                    var task = head.task;
                    head.task = void 0;
                    var domain = head.domain;
    
                    if (domain) {
                        head.domain = void 0;
                        domain.enter();
                    }
    
                    try {
                        task();
    
                    } catch (e) {
                        if (isNodeJS) {
                            // In node, uncaught exceptions are considered fatal errors.
                            // Re-throw them synchronously to interrupt flushing!
    
                            // Ensure continuation if the uncaught exception is suppressed
                            // listening "uncaughtException" events (as domains does).
                            // Continue in next event to avoid tick recursion.
                            if (domain) {
                                domain.exit();
                            }
                            setTimeout(flush, 0);
                            if (domain) {
                                domain.enter();
                            }
    
                            throw e;
    
                        } else {
                            // In browsers, uncaught exceptions are not fatal.
                            // Re-throw them asynchronously to avoid slow-downs.
                            setTimeout(function() {
                               throw e;
                            }, 0);
                        }
                    }
    
                    if (domain) {
                        domain.exit();
                    }
                }
    
                flushing = false;
            }
    
            nextTick = function (task) {
                tail = tail.next = {
                    task: task,
                    domain: isNodeJS && process.domain,
                    next: null
                };
    
                if (!flushing) {
                    flushing = true;
                    requestTick();
                }
            };
    
            if (typeof process !== "undefined" && process.nextTick) {
                // Node.js before 0.9. Note that some fake-Node environments, like the
                // Mocha test runner, introduce a `process` global without a `nextTick`.
                isNodeJS = true;
    
                requestTick = function () {
                    process.nextTick(flush);
                };
    
            } else if (typeof setImmediate === "function") {
                // In IE10, Node.js 0.9+, or https://github.com/NobleJS/setImmediate
                if (typeof window !== "undefined") {
                    requestTick = setImmediate.bind(window, flush);
                } else {
                    requestTick = function () {
                        setImmediate(flush);
                    };
                }
    
            } else if (typeof MessageChannel !== "undefined") {
                // modern browsers
                // http://www.nonblocking.io/2011/06/windownexttick.html
                var channel = new MessageChannel();
                // At least Safari Version 6.0.5 (8536.30.1) intermittently cannot create
                // working message ports the first time a page loads.
                channel.port1.onmessage = function () {
                    requestTick = requestPortTick;
                    channel.port1.onmessage = flush;
                    flush();
                };
                var requestPortTick = function () {
                    // Opera requires us to provide a message payload, regardless of
                    // whether we use it.
                    channel.port2.postMessage(0);
                };
                requestTick = function () {
                    setTimeout(flush, 0);
                    requestPortTick();
                };
    
            } else {
                // old browsers
                requestTick = function () {
                    setTimeout(flush, 0);
                };
            }
    
            return nextTick;
        })();
    
        // Attempt to make generics safe in the face of downstream
        // modifications.
        // There is no situation where this is necessary.
        // If you need a security guarantee, these primordials need to be
        // deeply frozen anyway, and if you don’t need a security guarantee,
        // this is just plain paranoid.
        // However, this **might** have the nice side-effect of reducing the size of
        // the minified code by reducing x.call() to merely x()
        // See Mark Miller’s explanation of what this does.
        // http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
        var call = Function.call;
        function uncurryThis(f) {
            return function () {
                return call.apply(f, arguments);
            };
        }
        // This is equivalent, but slower:
        // uncurryThis = Function_bind.bind(Function_bind.call);
        // http://jsperf.com/uncurrythis
    
        var array_slice = uncurryThis(Array.prototype.slice);
    
        var array_reduce = uncurryThis(
            Array.prototype.reduce || function (callback, basis) {
                var index = 0,
                    length = this.length;
                // concerning the initial value, if one is not provided
                if (arguments.length === 1) {
                    // seek to the first value in the array, accounting
                    // for the possibility that is is a sparse array
                    do {
                        if (index in this) {
                            basis = this[index++];
                            break;
                        }
                        if (++index >= length) {
                            throw new TypeError();
                        }
                    } while (1);
                }
                // reduce
                for (; index < length; index++) {
                    // account for the possibility that the array is sparse
                    if (index in this) {
                        basis = callback(basis, this[index], index);
                    }
                }
                return basis;
            }
        );
    
        var array_indexOf = uncurryThis(
            Array.prototype.indexOf || function (value) {
                // not a very good shim, but good enough for our one use of it
                for (var i = 0; i < this.length; i++) {
                    if (this[i] === value) {
                        return i;
                    }
                }
                return -1;
            }
        );
    
        var array_map = uncurryThis(
            Array.prototype.map || function (callback, thisp) {
                var self = this;
                var collect = [];
                array_reduce(self, function (undefined, value, index) {
                    collect.push(callback.call(thisp, value, index, self));
                }, void 0);
                return collect;
            }
        );
    
        var object_create = Object.create || function (prototype) {
            function Type() { }
            Type.prototype = prototype;
            return new Type();
        };
    
        var object_hasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);
    
        var object_keys = Object.keys || function (object) {
            var keys = [];
            for (var key in object) {
                if (object_hasOwnProperty(object, key)) {
                    keys.push(key);
                }
            }
            return keys;
        };
    
        var object_toString = uncurryThis(Object.prototype.toString);
    
        function isObject(value) {
            return value === Object(value);
        }
    
        // generator related shims
    
        // FIXME: Remove this function once ES6 generators are in SpiderMonkey.
        function isStopIteration(exception) {
            return (
                object_toString(exception) === "[object StopIteration]" ||
                exception instanceof QReturnValue
            );
        }
    
        // FIXME: Remove this helper and Q.return once ES6 generators are in
        // SpiderMonkey.
        var QReturnValue;
        if (typeof ReturnValue !== "undefined") {
            QReturnValue = ReturnValue;
        } else {
            QReturnValue = function (value) {
                this.value = value;
            };
        }
    
        // long stack traces
    
        var STACK_JUMP_SEPARATOR = "From previous event:";
    
        function makeStackTraceLong(error, promise) {
            // If possible, transform the error stack trace by removing Node and Q
            // cruft, then concatenating with the stack trace of `promise`. See #57.
            if (hasStacks &&
                promise.stack &&
                typeof error === "object" &&
                error !== null &&
                error.stack &&
                error.stack.indexOf(STACK_JUMP_SEPARATOR) === -1
            ) {
                var stacks = [];
                for (var p = promise; !!p; p = p.source) {
                    if (p.stack) {
                        stacks.unshift(p.stack);
                    }
                }
                stacks.unshift(error.stack);
    
                var concatedStacks = stacks.join("\n" + STACK_JUMP_SEPARATOR + "\n");
                error.stack = filterStackString(concatedStacks);
            }
        }
    
        function filterStackString(stackString) {
            var lines = stackString.split("\n");
            var desiredLines = [];
            for (var i = 0; i < lines.length; ++i) {
                var line = lines[i];
    
                if (!isInternalFrame(line) && !isNodeFrame(line) && line) {
                    desiredLines.push(line);
                }
            }
            return desiredLines.join("\n");
        }
    
        function isNodeFrame(stackLine) {
            return stackLine.indexOf("(module.js:") !== -1 ||
                   stackLine.indexOf("(node.js:") !== -1;
        }
    
        function getFileNameAndLineNumber(stackLine) {
            // Named functions: "at functionName (filename:lineNumber:columnNumber)"
            // In IE10 function name can have spaces ("Anonymous function") O_o
            var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);
            if (attempt1) {
                return [attempt1[1], Number(attempt1[2])];
            }
    
            // Anonymous functions: "at filename:lineNumber:columnNumber"
            var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);
            if (attempt2) {
                return [attempt2[1], Number(attempt2[2])];
            }
    
            // Firefox style: "function@filename:lineNumber or @filename:lineNumber"
            var attempt3 = /.*@(.+):(\d+)$/.exec(stackLine);
            if (attempt3) {
                return [attempt3[1], Number(attempt3[2])];
            }
        }
    
        function isInternalFrame(stackLine) {
            var fileNameAndLineNumber = getFileNameAndLineNumber(stackLine);
    
            if (!fileNameAndLineNumber) {
                return false;
            }
    
            var fileName = fileNameAndLineNumber[0];
            var lineNumber = fileNameAndLineNumber[1];
    
            return fileName === qFileName &&
                lineNumber >= qStartingLine &&
                lineNumber <= qEndingLine;
        }
    
        // discover own file name and line number range for filtering stack
        // traces
        function captureLine() {
            if (!hasStacks) {
                return;
            }
    
            try {
                throw new Error();
            } catch (e) {
                var lines = e.stack.split("\n");
                var firstLine = lines[0].indexOf("@") > 0 ? lines[1] : lines[2];
                var fileNameAndLineNumber = getFileNameAndLineNumber(firstLine);
                if (!fileNameAndLineNumber) {
                    return;
                }
    
                qFileName = fileNameAndLineNumber[0];
                return fileNameAndLineNumber[1];
            }
        }
    
        function deprecate(callback, name, alternative) {
            return function () {
                if (typeof console !== "undefined" &&
                    typeof console.warn === "function") {
                    console.warn(name + " is deprecated, use " + alternative +
                                 " instead.", new Error("").stack);
                }
                return callback.apply(callback, arguments);
            };
        }
    
        // end of shims
        // beginning of real work
    
        /**
         * Constructs a promise for an immediate reference, passes promises through, or
         * coerces promises from different systems.
         * @param value immediate reference or promise
         */
        function Q(value) {
            // If the object is already a Promise, return it directly.  This enables
            // the resolve function to both be used to created references from objects,
            // but to tolerably coerce non-promises to promises.
            if (value instanceof Promise) {
                return value;
            }
    
            // assimilate thenables
            if (isPromiseAlike(value)) {
                return coerce(value);
            } else {
                return fulfill(value);
            }
        }
        Q.resolve = Q;
    
        /**
         * Performs a task in a future turn of the event loop.
         * @param {Function} task
         */
        Q.nextTick = nextTick;
    
        /**
         * Controls whether or not long stack traces will be on
         */
        Q.longStackSupport = false;
    
        // enable long stacks if Q_DEBUG is set
        if (typeof process === "object" && process && process.env && process.env.Q_DEBUG) {
            Q.longStackSupport = true;
        }
    
        /**
         * Constructs a {promise, resolve, reject} object.
         *
         * `resolve` is a callback to invoke with a more resolved value for the
         * promise. To fulfill the promise, invoke `resolve` with any value that is
         * not a thenable. To reject the promise, invoke `resolve` with a rejected
         * thenable, or invoke `reject` with the reason directly. To resolve the
         * promise to another thenable, thus putting it in the same state, invoke
         * `resolve` with that other thenable.
         */
        Q.defer = defer;
        function defer() {
            // if "messages" is an "Array", that indicates that the promise has not yet
            // been resolved.  If it is "undefined", it has been resolved.  Each
            // element of the messages array is itself an array of complete arguments to
            // forward to the resolved promise.  We coerce the resolution value to a
            // promise using the `resolve` function because it handles both fully
            // non-thenable values and other thenables gracefully.
            var messages = [], progressListeners = [], resolvedPromise;
    
            var deferred = object_create(defer.prototype);
            var promise = object_create(Promise.prototype);
    
            promise.promiseDispatch = function (resolve, op, operands) {
                var args = array_slice(arguments);
                if (messages) {
                    messages.push(args);
                    if (op === "when" && operands[1]) { // progress operand
                        progressListeners.push(operands[1]);
                    }
                } else {
                    Q.nextTick(function () {
                        resolvedPromise.promiseDispatch.apply(resolvedPromise, args);
                    });
                }
            };
    
            // XXX deprecated
            promise.valueOf = function () {
                if (messages) {
                    return promise;
                }
                var nearerValue = nearer(resolvedPromise);
                if (isPromise(nearerValue)) {
                    resolvedPromise = nearerValue; // shorten chain
                }
                return nearerValue;
            };
    
            promise.inspect = function () {
                if (!resolvedPromise) {
                    return { state: "pending" };
                }
                return resolvedPromise.inspect();
            };
    
            if (Q.longStackSupport && hasStacks) {
                try {
                    throw new Error();
                } catch (e) {
                    // NOTE: don't try to use `Error.captureStackTrace` or transfer the
                    // accessor around; that causes memory leaks as per GH-111. Just
                    // reify the stack trace as a string ASAP.
                    //
                    // At the same time, cut off the first line; it's always just
                    // "[object Promise]\n", as per the `toString`.
                    promise.stack = e.stack.substring(e.stack.indexOf("\n") + 1);
                }
            }
    
            // NOTE: we do the checks for `resolvedPromise` in each method, instead of
            // consolidating them into `become`, since otherwise we'd create new
            // promises with the lines `become(whatever(value))`. See e.g. GH-252.
    
            function become(newPromise) {
                resolvedPromise = newPromise;
                promise.source = newPromise;
    
                array_reduce(messages, function (undefined, message) {
                    Q.nextTick(function () {
                        newPromise.promiseDispatch.apply(newPromise, message);
                    });
                }, void 0);
    
                messages = void 0;
                progressListeners = void 0;
            }
    
            deferred.promise = promise;
            deferred.resolve = function (value) {
                if (resolvedPromise) {
                    return;
                }
    
                become(Q(value));
            };
    
            deferred.fulfill = function (value) {
                if (resolvedPromise) {
                    return;
                }
    
                become(fulfill(value));
            };
            deferred.reject = function (reason) {
                if (resolvedPromise) {
                    return;
                }
    
                become(reject(reason));
            };
            deferred.notify = function (progress) {
                if (resolvedPromise) {
                    return;
                }
    
                array_reduce(progressListeners, function (undefined, progressListener) {
                    Q.nextTick(function () {
                        progressListener(progress);
                    });
                }, void 0);
            };
    
            return deferred;
        }
    
        /**
         * Creates a Node-style callback that will resolve or reject the deferred
         * promise.
         * @returns a nodeback
         */
        defer.prototype.makeNodeResolver = function () {
            var self = this;
            return function (error, value) {
                if (error) {
                    self.reject(error);
                } else if (arguments.length > 2) {
                    self.resolve(array_slice(arguments, 1));
                } else {
                    self.resolve(value);
                }
            };
        };
    
        /**
         * @param resolver {Function} a function that returns nothing and accepts
         * the resolve, reject, and notify functions for a deferred.
         * @returns a promise that may be resolved with the given resolve and reject
         * functions, or rejected by a thrown exception in resolver
         */
        Q.Promise = promise; // ES6
        Q.promise = promise;
        function promise(resolver) {
            if (typeof resolver !== "function") {
                throw new TypeError("resolver must be a function.");
            }
            var deferred = defer();
            try {
                resolver(deferred.resolve, deferred.reject, deferred.notify);
            } catch (reason) {
                deferred.reject(reason);
            }
            return deferred.promise;
        }
    
        promise.race = race; // ES6
        promise.all = all; // ES6
        promise.reject = reject; // ES6
        promise.resolve = Q; // ES6
    
        // XXX experimental.  This method is a way to denote that a local value is
        // serializable and should be immediately dispatched to a remote upon request,
        // instead of passing a reference.
        Q.passByCopy = function (object) {
            //freeze(object);
            //passByCopies.set(object, true);
            return object;
        };
    
        Promise.prototype.passByCopy = function () {
            //freeze(object);
            //passByCopies.set(object, true);
            return this;
        };
    
        /**
         * If two promises eventually fulfill to the same value, promises that value,
         * but otherwise rejects.
         * @param x {Any*}
         * @param y {Any*}
         * @returns {Any*} a promise for x and y if they are the same, but a rejection
         * otherwise.
         *
         */
        Q.join = function (x, y) {
            return Q(x).join(y);
        };
    
        Promise.prototype.join = function (that) {
            return Q([this, that]).spread(function (x, y) {
                if (x === y) {
                    // TODO: "===" should be Object.is or equiv
                    return x;
                } else {
                    throw new Error("Can't join: not the same: " + x + " " + y);
                }
            });
        };
    
        /**
         * Returns a promise for the first of an array of promises to become settled.
         * @param answers {Array[Any*]} promises to race
         * @returns {Any*} the first promise to be settled
         */
        Q.race = race;
        function race(answerPs) {
            return promise(function(resolve, reject) {
                // Switch to this once we can assume at least ES5
                // answerPs.forEach(function(answerP) {
                //     Q(answerP).then(resolve, reject);
                // });
                // Use this in the meantime
                for (var i = 0, len = answerPs.length; i < len; i++) {
                    Q(answerPs[i]).then(resolve, reject);
                }
            });
        }
    
        Promise.prototype.race = function () {
            return this.then(Q.race);
        };
    
        /**
         * Constructs a Promise with a promise descriptor object and optional fallback
         * function.  The descriptor contains methods like when(rejected), get(name),
         * set(name, value), post(name, args), and delete(name), which all
         * return either a value, a promise for a value, or a rejection.  The fallback
         * accepts the operation name, a resolver, and any further arguments that would
         * have been forwarded to the appropriate method above had a method been
         * provided with the proper name.  The API makes no guarantees about the nature
         * of the returned object, apart from that it is usable whereever promises are
         * bought and sold.
         */
        Q.makePromise = Promise;
        function Promise(descriptor, fallback, inspect) {
            if (fallback === void 0) {
                fallback = function (op) {
                    return reject(new Error(
                        "Promise does not support operation: " + op
                    ));
                };
            }
            if (inspect === void 0) {
                inspect = function () {
                    return {state: "unknown"};
                };
            }
    
            var promise = object_create(Promise.prototype);
    
            promise.promiseDispatch = function (resolve, op, args) {
                var result;
                try {
                    if (descriptor[op]) {
                        result = descriptor[op].apply(promise, args);
                    } else {
                        result = fallback.call(promise, op, args);
                    }
                } catch (exception) {
                    result = reject(exception);
                }
                if (resolve) {
                    resolve(result);
                }
            };
    
            promise.inspect = inspect;
    
            // XXX deprecated `valueOf` and `exception` support
            if (inspect) {
                var inspected = inspect();
                if (inspected.state === "rejected") {
                    promise.exception = inspected.reason;
                }
    
                promise.valueOf = function () {
                    var inspected = inspect();
                    if (inspected.state === "pending" ||
                        inspected.state === "rejected") {
                        return promise;
                    }
                    return inspected.value;
                };
            }
    
            return promise;
        }
    
        Promise.prototype.toString = function () {
            return "[object Promise]";
        };
    
        Promise.prototype.then = function (fulfilled, rejected, progressed) {
            var self = this;
            var deferred = defer();
            var done = false;   // ensure the untrusted promise makes at most a
                                // single call to one of the callbacks
    
            function _fulfilled(value) {
                try {
                    return typeof fulfilled === "function" ? fulfilled(value) : value;
                } catch (exception) {
                    return reject(exception);
                }
            }
    
            function _rejected(exception) {
                if (typeof rejected === "function") {
                    makeStackTraceLong(exception, self);
                    try {
                        return rejected(exception);
                    } catch (newException) {
                        return reject(newException);
                    }
                }
                return reject(exception);
            }
    
            function _progressed(value) {
                return typeof progressed === "function" ? progressed(value) : value;
            }
    
            Q.nextTick(function () {
                self.promiseDispatch(function (value) {
                    if (done) {
                        return;
                    }
                    done = true;
    
                    deferred.resolve(_fulfilled(value));
                }, "when", [function (exception) {
                    if (done) {
                        return;
                    }
                    done = true;
    
                    deferred.resolve(_rejected(exception));
                }]);
            });
    
            // Progress propagator need to be attached in the current tick.
            self.promiseDispatch(void 0, "when", [void 0, function (value) {
                var newValue;
                var threw = false;
                try {
                    newValue = _progressed(value);
                } catch (e) {
                    threw = true;
                    if (Q.onerror) {
                        Q.onerror(e);
                    } else {
                        throw e;
                    }
                }
    
                if (!threw) {
                    deferred.notify(newValue);
                }
            }]);
    
            return deferred.promise;
        };
    
        Q.tap = function (promise, callback) {
            return Q(promise).tap(callback);
        };
    
        /**
         * Works almost like "finally", but not called for rejections.
         * Original resolution value is passed through callback unaffected.
         * Callback may return a promise that will be awaited for.
         * @param {Function} callback
         * @returns {Q.Promise}
         * @example
         * doSomething()
         *   .then(...)
         *   .tap(console.log)
         *   .then(...);
         */
        Promise.prototype.tap = function (callback) {
            callback = Q(callback);
    
            return this.then(function (value) {
                return callback.fcall(value).thenResolve(value);
            });
        };
    
        /**
         * Registers an observer on a promise.
         *
         * Guarantees:
         *
         * 1. that fulfilled and rejected will be called only once.
         * 2. that either the fulfilled callback or the rejected callback will be
         *    called, but not both.
         * 3. that fulfilled and rejected will not be called in this turn.
         *
         * @param value      promise or immediate reference to observe
         * @param fulfilled  function to be called with the fulfilled value
         * @param rejected   function to be called with the rejection exception
         * @param progressed function to be called on any progress notifications
         * @return promise for the return value from the invoked callback
         */
        Q.when = when;
        function when(value, fulfilled, rejected, progressed) {
            return Q(value).then(fulfilled, rejected, progressed);
        }
    
        Promise.prototype.thenResolve = function (value) {
            return this.then(function () { return value; });
        };
    
        Q.thenResolve = function (promise, value) {
            return Q(promise).thenResolve(value);
        };
    
        Promise.prototype.thenReject = function (reason) {
            return this.then(function () { throw reason; });
        };
    
        Q.thenReject = function (promise, reason) {
            return Q(promise).thenReject(reason);
        };
    
        /**
         * If an object is not a promise, it is as "near" as possible.
         * If a promise is rejected, it is as "near" as possible too.
         * If it’s a fulfilled promise, the fulfillment value is nearer.
         * If it’s a deferred promise and the deferred has been resolved, the
         * resolution is "nearer".
         * @param object
         * @returns most resolved (nearest) form of the object
         */
    
        // XXX should we re-do this?
        Q.nearer = nearer;
        function nearer(value) {
            if (isPromise(value)) {
                var inspected = value.inspect();
                if (inspected.state === "fulfilled") {
                    return inspected.value;
                }
            }
            return value;
        }
    
        /**
         * @returns whether the given object is a promise.
         * Otherwise it is a fulfilled value.
         */
        Q.isPromise = isPromise;
        function isPromise(object) {
            return object instanceof Promise;
        }
    
        Q.isPromiseAlike = isPromiseAlike;
        function isPromiseAlike(object) {
            return isObject(object) && typeof object.then === "function";
        }
    
        /**
         * @returns whether the given object is a pending promise, meaning not
         * fulfilled or rejected.
         */
        Q.isPending = isPending;
        function isPending(object) {
            return isPromise(object) && object.inspect().state === "pending";
        }
    
        Promise.prototype.isPending = function () {
            return this.inspect().state === "pending";
        };
    
        /**
         * @returns whether the given object is a value or fulfilled
         * promise.
         */
        Q.isFulfilled = isFulfilled;
        function isFulfilled(object) {
            return !isPromise(object) || object.inspect().state === "fulfilled";
        }
    
        Promise.prototype.isFulfilled = function () {
            return this.inspect().state === "fulfilled";
        };
    
        /**
         * @returns whether the given object is a rejected promise.
         */
        Q.isRejected = isRejected;
        function isRejected(object) {
            return isPromise(object) && object.inspect().state === "rejected";
        }
    
        Promise.prototype.isRejected = function () {
            return this.inspect().state === "rejected";
        };
    
        //// BEGIN UNHANDLED REJECTION TRACKING
    
        // This promise library consumes exceptions thrown in handlers so they can be
        // handled by a subsequent promise.  The exceptions get added to this array when
        // they are created, and removed when they are handled.  Note that in ES6 or
        // shimmed environments, this would naturally be a `Set`.
        var unhandledReasons = [];
        var unhandledRejections = [];
        var trackUnhandledRejections = true;
    
        function resetUnhandledRejections() {
            unhandledReasons.length = 0;
            unhandledRejections.length = 0;
    
            if (!trackUnhandledRejections) {
                trackUnhandledRejections = true;
            }
        }
    
        function trackRejection(promise, reason) {
            if (!trackUnhandledRejections) {
                return;
            }
    
            unhandledRejections.push(promise);
            if (reason && typeof reason.stack !== "undefined") {
                unhandledReasons.push(reason.stack);
            } else {
                unhandledReasons.push("(no stack) " + reason);
            }
        }
    
        function untrackRejection(promise) {
            if (!trackUnhandledRejections) {
                return;
            }
    
            var at = array_indexOf(unhandledRejections, promise);
            if (at !== -1) {
                unhandledRejections.splice(at, 1);
                unhandledReasons.splice(at, 1);
            }
        }
    
        Q.resetUnhandledRejections = resetUnhandledRejections;
    
        Q.getUnhandledReasons = function () {
            // Make a copy so that consumers can't interfere with our internal state.
            return unhandledReasons.slice();
        };
    
        Q.stopUnhandledRejectionTracking = function () {
            resetUnhandledRejections();
            trackUnhandledRejections = false;
        };
    
        resetUnhandledRejections();
    
        //// END UNHANDLED REJECTION TRACKING
    
        /**
         * Constructs a rejected promise.
         * @param reason value describing the failure
         */
        Q.reject = reject;
        function reject(reason) {
            var rejection = Promise({
                "when": function (rejected) {
                    // note that the error has been handled
                    if (rejected) {
                        untrackRejection(this);
                    }
                    return rejected ? rejected(reason) : this;
                }
            }, function fallback() {
                return this;
            }, function inspect() {
                return { state: "rejected", reason: reason };
            });
    
            // Note that the reason has not been handled.
            trackRejection(rejection, reason);
    
            return rejection;
        }
    
        /**
         * Constructs a fulfilled promise for an immediate reference.
         * @param value immediate reference
         */
        Q.fulfill = fulfill;
        function fulfill(value) {
            return Promise({
                "when": function () {
                    return value;
                },
                "get": function (name) {
                    return value[name];
                },
                "set": function (name, rhs) {
                    value[name] = rhs;
                },
                "delete": function (name) {
                    delete value[name];
                },
                "post": function (name, args) {
                    // Mark Miller proposes that post with no name should apply a
                    // promised function.
                    if (name === null || name === void 0) {
                        return value.apply(void 0, args);
                    } else {
                        return value[name].apply(value, args);
                    }
                },
                "apply": function (thisp, args) {
                    return value.apply(thisp, args);
                },
                "keys": function () {
                    return object_keys(value);
                }
            }, void 0, function inspect() {
                return { state: "fulfilled", value: value };
            });
        }
    
        /**
         * Converts thenables to Q promises.
         * @param promise thenable promise
         * @returns a Q promise
         */
        function coerce(promise) {
            var deferred = defer();
            Q.nextTick(function () {
                try {
                    promise.then(deferred.resolve, deferred.reject, deferred.notify);
                } catch (exception) {
                    deferred.reject(exception);
                }
            });
            return deferred.promise;
        }
    
        /**
         * Annotates an object such that it will never be
         * transferred away from this process over any promise
         * communication channel.
         * @param object
         * @returns promise a wrapping of that object that
         * additionally responds to the "isDef" message
         * without a rejection.
         */
        Q.master = master;
        function master(object) {
            return Promise({
                "isDef": function () {}
            }, function fallback(op, args) {
                return dispatch(object, op, args);
            }, function () {
                return Q(object).inspect();
            });
        }
    
        /**
         * Spreads the values of a promised array of arguments into the
         * fulfillment callback.
         * @param fulfilled callback that receives variadic arguments from the
         * promised array
         * @param rejected callback that receives the exception if the promise
         * is rejected.
         * @returns a promise for the return value or thrown exception of
         * either callback.
         */
        Q.spread = spread;
        function spread(value, fulfilled, rejected) {
            return Q(value).spread(fulfilled, rejected);
        }
    
        Promise.prototype.spread = function (fulfilled, rejected) {
            return this.all().then(function (array) {
                return fulfilled.apply(void 0, array);
            }, rejected);
        };
    
        /**
         * The async function is a decorator for generator functions, turning
         * them into asynchronous generators.  Although generators are only part
         * of the newest ECMAScript 6 drafts, this code does not cause syntax
         * errors in older engines.  This code should continue to work and will
         * in fact improve over time as the language improves.
         *
         * ES6 generators are currently part of V8 version 3.19 with the
         * --harmony-generators runtime flag enabled.  SpiderMonkey has had them
         * for longer, but under an older Python-inspired form.  This function
         * works on both kinds of generators.
         *
         * Decorates a generator function such that:
         *  - it may yield promises
         *  - execution will continue when that promise is fulfilled
         *  - the value of the yield expression will be the fulfilled value
         *  - it returns a promise for the return value (when the generator
         *    stops iterating)
         *  - the decorated function returns a promise for the return value
         *    of the generator or the first rejected promise among those
         *    yielded.
         *  - if an error is thrown in the generator, it propagates through
         *    every following yield until it is caught, or until it escapes
         *    the generator function altogether, and is translated into a
         *    rejection for the promise returned by the decorated generator.
         */
        Q.async = async;
        function async(makeGenerator) {
            return function () {
                // when verb is "send", arg is a value
                // when verb is "throw", arg is an exception
                function continuer(verb, arg) {
                    var result;
    
                    // Until V8 3.19 / Chromium 29 is released, SpiderMonkey is the only
                    // engine that has a deployed base of browsers that support generators.
                    // However, SM's generators use the Python-inspired semantics of
                    // outdated ES6 drafts.  We would like to support ES6, but we'd also
                    // like to make it possible to use generators in deployed browsers, so
                    // we also support Python-style generators.  At some point we can remove
                    // this block.
    
                    if (typeof StopIteration === "undefined") {
                        // ES6 Generators
                        try {
                            result = generator[verb](arg);
                        } catch (exception) {
                            return reject(exception);
                        }
                        if (result.done) {
                            return Q(result.value);
                        } else {
                            return when(result.value, callback, errback);
                        }
                    } else {
                        // SpiderMonkey Generators
                        // FIXME: Remove this case when SM does ES6 generators.
                        try {
                            result = generator[verb](arg);
                        } catch (exception) {
                            if (isStopIteration(exception)) {
                                return Q(exception.value);
                            } else {
                                return reject(exception);
                            }
                        }
                        return when(result, callback, errback);
                    }
                }
                var generator = makeGenerator.apply(this, arguments);
                var callback = continuer.bind(continuer, "next");
                var errback = continuer.bind(continuer, "throw");
                return callback();
            };
        }
    
        /**
         * The spawn function is a small wrapper around async that immediately
         * calls the generator and also ends the promise chain, so that any
         * unhandled errors are thrown instead of forwarded to the error
         * handler. This is useful because it's extremely common to run
         * generators at the top-level to work with libraries.
         */
        Q.spawn = spawn;
        function spawn(makeGenerator) {
            Q.done(Q.async(makeGenerator)());
        }
    
        // FIXME: Remove this interface once ES6 generators are in SpiderMonkey.
        /**
         * Throws a ReturnValue exception to stop an asynchronous generator.
         *
         * This interface is a stop-gap measure to support generator return
         * values in older Firefox/SpiderMonkey.  In browsers that support ES6
         * generators like Chromium 29, just use "return" in your generator
         * functions.
         *
         * @param value the return value for the surrounding generator
         * @throws ReturnValue exception with the value.
         * @example
         * // ES6 style
         * Q.async(function* () {
         *      var foo = yield getFooPromise();
         *      var bar = yield getBarPromise();
         *      return foo + bar;
         * })
         * // Older SpiderMonkey style
         * Q.async(function () {
         *      var foo = yield getFooPromise();
         *      var bar = yield getBarPromise();
         *      Q.return(foo + bar);
         * })
         */
        Q["return"] = _return;
        function _return(value) {
            throw new QReturnValue(value);
        }
    
        /**
         * The promised function decorator ensures that any promise arguments
         * are settled and passed as values (`this` is also settled and passed
         * as a value).  It will also ensure that the result of a function is
         * always a promise.
         *
         * @example
         * var add = Q.promised(function (a, b) {
         *     return a + b;
         * });
         * add(Q(a), Q(B));
         *
         * @param {function} callback The function to decorate
         * @returns {function} a function that has been decorated.
         */
        Q.promised = promised;
        function promised(callback) {
            return function () {
                return spread([this, all(arguments)], function (self, args) {
                    return callback.apply(self, args);
                });
            };
        }
    
        /**
         * sends a message to a value in a future turn
         * @param object* the recipient
         * @param op the name of the message operation, e.g., "when",
         * @param args further arguments to be forwarded to the operation
         * @returns result {Promise} a promise for the result of the operation
         */
        Q.dispatch = dispatch;
        function dispatch(object, op, args) {
            return Q(object).dispatch(op, args);
        }
    
        Promise.prototype.dispatch = function (op, args) {
            var self = this;
            var deferred = defer();
            Q.nextTick(function () {
                self.promiseDispatch(deferred.resolve, op, args);
            });
            return deferred.promise;
        };
    
        /**
         * Gets the value of a property in a future turn.
         * @param object    promise or immediate reference for target object
         * @param name      name of property to get
         * @return promise for the property value
         */
        Q.get = function (object, key) {
            return Q(object).dispatch("get", [key]);
        };
    
        Promise.prototype.get = function (key) {
            return this.dispatch("get", [key]);
        };
    
        /**
         * Sets the value of a property in a future turn.
         * @param object    promise or immediate reference for object object
         * @param name      name of property to set
         * @param value     new value of property
         * @return promise for the return value
         */
        Q.set = function (object, key, value) {
            return Q(object).dispatch("set", [key, value]);
        };
    
        Promise.prototype.set = function (key, value) {
            return this.dispatch("set", [key, value]);
        };
    
        /**
         * Deletes a property in a future turn.
         * @param object    promise or immediate reference for target object
         * @param name      name of property to delete
         * @return promise for the return value
         */
        Q.del = // XXX legacy
        Q["delete"] = function (object, key) {
            return Q(object).dispatch("delete", [key]);
        };
    
        Promise.prototype.del = // XXX legacy
        Promise.prototype["delete"] = function (key) {
            return this.dispatch("delete", [key]);
        };
    
        /**
         * Invokes a method in a future turn.
         * @param object    promise or immediate reference for target object
         * @param name      name of method to invoke
         * @param value     a value to post, typically an array of
         *                  invocation arguments for promises that
         *                  are ultimately backed with `resolve` values,
         *                  as opposed to those backed with URLs
         *                  wherein the posted value can be any
         *                  JSON serializable object.
         * @return promise for the return value
         */
        // bound locally because it is used by other methods
        Q.mapply = // XXX As proposed by "Redsandro"
        Q.post = function (object, name, args) {
            return Q(object).dispatch("post", [name, args]);
        };
    
        Promise.prototype.mapply = // XXX As proposed by "Redsandro"
        Promise.prototype.post = function (name, args) {
            return this.dispatch("post", [name, args]);
        };
    
        /**
         * Invokes a method in a future turn.
         * @param object    promise or immediate reference for target object
         * @param name      name of method to invoke
         * @param ...args   array of invocation arguments
         * @return promise for the return value
         */
        Q.send = // XXX Mark Miller's proposed parlance
        Q.mcall = // XXX As proposed by "Redsandro"
        Q.invoke = function (object, name /*...args*/) {
            return Q(object).dispatch("post", [name, array_slice(arguments, 2)]);
        };
    
        Promise.prototype.send = // XXX Mark Miller's proposed parlance
        Promise.prototype.mcall = // XXX As proposed by "Redsandro"
        Promise.prototype.invoke = function (name /*...args*/) {
            return this.dispatch("post", [name, array_slice(arguments, 1)]);
        };
    
        /**
         * Applies the promised function in a future turn.
         * @param object    promise or immediate reference for target function
         * @param args      array of application arguments
         */
        Q.fapply = function (object, args) {
            return Q(object).dispatch("apply", [void 0, args]);
        };
    
        Promise.prototype.fapply = function (args) {
            return this.dispatch("apply", [void 0, args]);
        };
    
        /**
         * Calls the promised function in a future turn.
         * @param object    promise or immediate reference for target function
         * @param ...args   array of application arguments
         */
        Q["try"] =
        Q.fcall = function (object /* ...args*/) {
            return Q(object).dispatch("apply", [void 0, array_slice(arguments, 1)]);
        };
    
        Promise.prototype.fcall = function (/*...args*/) {
            return this.dispatch("apply", [void 0, array_slice(arguments)]);
        };
    
        /**
         * Binds the promised function, transforming return values into a fulfilled
         * promise and thrown errors into a rejected one.
         * @param object    promise or immediate reference for target function
         * @param ...args   array of application arguments
         */
        Q.fbind = function (object /*...args*/) {
            var promise = Q(object);
            var args = array_slice(arguments, 1);
            return function fbound() {
                return promise.dispatch("apply", [
                    this,
                    args.concat(array_slice(arguments))
                ]);
            };
        };
        Promise.prototype.fbind = function (/*...args*/) {
            var promise = this;
            var args = array_slice(arguments);
            return function fbound() {
                return promise.dispatch("apply", [
                    this,
                    args.concat(array_slice(arguments))
                ]);
            };
        };
    
        /**
         * Requests the names of the owned properties of a promised
         * object in a future turn.
         * @param object    promise or immediate reference for target object
         * @return promise for the keys of the eventually settled object
         */
        Q.keys = function (object) {
            return Q(object).dispatch("keys", []);
        };
    
        Promise.prototype.keys = function () {
            return this.dispatch("keys", []);
        };
    
        /**
         * Turns an array of promises into a promise for an array.  If any of
         * the promises gets rejected, the whole array is rejected immediately.
         * @param {Array*} an array (or promise for an array) of values (or
         * promises for values)
         * @returns a promise for an array of the corresponding values
         */
        // By Mark Miller
        // http://wiki.ecmascript.org/doku.php?id=strawman:concurrency&rev=1308776521#allfulfilled
        Q.all = all;
        function all(promises) {
            return when(promises, function (promises) {
                var pendingCount = 0;
                var deferred = defer();
                array_reduce(promises, function (undefined, promise, index) {
                    var snapshot;
                    if (
                        isPromise(promise) &&
                        (snapshot = promise.inspect()).state === "fulfilled"
                    ) {
                        promises[index] = snapshot.value;
                    } else {
                        ++pendingCount;
                        when(
                            promise,
                            function (value) {
                                promises[index] = value;
                                if (--pendingCount === 0) {
                                    deferred.resolve(promises);
                                }
                            },
                            deferred.reject,
                            function (progress) {
                                deferred.notify({ index: index, value: progress });
                            }
                        );
                    }
                }, void 0);
                if (pendingCount === 0) {
                    deferred.resolve(promises);
                }
                return deferred.promise;
            });
        }
    
        Promise.prototype.all = function () {
            return all(this);
        };
    
        /**
         * Returns the first resolved promise of an array. Prior rejected promises are
         * ignored.  Rejects only if all promises are rejected.
         * @param {Array*} an array containing values or promises for values
         * @returns a promise fulfilled with the value of the first resolved promise,
         * or a rejected promise if all promises are rejected.
         */
        Q.any = any;
    
        function any(promises) {
            if (promises.length === 0) {
                return Q.resolve();
            }
    
            var deferred = Q.defer();
            var pendingCount = 0;
            array_reduce(promises, function(prev, current, index) {
                var promise = promises[index];
    
                pendingCount++;
    
                when(promise, onFulfilled, onRejected, onProgress);
                function onFulfilled(result) {
                    deferred.resolve(result);
                }
                function onRejected() {
                    pendingCount--;
                    if (pendingCount === 0) {
                        deferred.reject(new Error(
                            "Can't get fulfillment value from any promise, all " +
                            "promises were rejected."
                        ));
                    }
                }
                function onProgress(progress) {
                    deferred.notify({
                        index: index,
                        value: progress
                    });
                }
            }, undefined);
    
            return deferred.promise;
        }
    
        Promise.prototype.any = function() {
            return any(this);
        };
    
        /**
         * Waits for all promises to be settled, either fulfilled or
         * rejected.  This is distinct from `all` since that would stop
         * waiting at the first rejection.  The promise returned by
         * `allResolved` will never be rejected.
         * @param promises a promise for an array (or an array) of promises
         * (or values)
         * @return a promise for an array of promises
         */
        Q.allResolved = deprecate(allResolved, "allResolved", "allSettled");
        function allResolved(promises) {
            return when(promises, function (promises) {
                promises = array_map(promises, Q);
                return when(all(array_map(promises, function (promise) {
                    return when(promise, noop, noop);
                })), function () {
                    return promises;
                });
            });
        }
    
        Promise.prototype.allResolved = function () {
            return allResolved(this);
        };
    
        /**
         * @see Promise#allSettled
         */
        Q.allSettled = allSettled;
        function allSettled(promises) {
            return Q(promises).allSettled();
        }
    
        /**
         * Turns an array of promises into a promise for an array of their states (as
         * returned by `inspect`) when they have all settled.
         * @param {Array[Any*]} values an array (or promise for an array) of values (or
         * promises for values)
         * @returns {Array[State]} an array of states for the respective values.
         */
        Promise.prototype.allSettled = function () {
            return this.then(function (promises) {
                return all(array_map(promises, function (promise) {
                    promise = Q(promise);
                    function regardless() {
                        return promise.inspect();
                    }
                    return promise.then(regardless, regardless);
                }));
            });
        };
    
        /**
         * Captures the failure of a promise, giving an oportunity to recover
         * with a callback.  If the given promise is fulfilled, the returned
         * promise is fulfilled.
         * @param {Any*} promise for something
         * @param {Function} callback to fulfill the returned promise if the
         * given promise is rejected
         * @returns a promise for the return value of the callback
         */
        Q.fail = // XXX legacy
        Q["catch"] = function (object, rejected) {
            return Q(object).then(void 0, rejected);
        };
    
        Promise.prototype.fail = // XXX legacy
        Promise.prototype["catch"] = function (rejected) {
            return this.then(void 0, rejected);
        };
    
        /**
         * Attaches a listener that can respond to progress notifications from a
         * promise's originating deferred. This listener receives the exact arguments
         * passed to ``deferred.notify``.
         * @param {Any*} promise for something
         * @param {Function} callback to receive any progress notifications
         * @returns the given promise, unchanged
         */
        Q.progress = progress;
        function progress(object, progressed) {
            return Q(object).then(void 0, void 0, progressed);
        }
    
        Promise.prototype.progress = function (progressed) {
            return this.then(void 0, void 0, progressed);
        };
    
        /**
         * Provides an opportunity to observe the settling of a promise,
         * regardless of whether the promise is fulfilled or rejected.  Forwards
         * the resolution to the returned promise when the callback is done.
         * The callback can return a promise to defer completion.
         * @param {Any*} promise
         * @param {Function} callback to observe the resolution of the given
         * promise, takes no arguments.
         * @returns a promise for the resolution of the given promise when
         * ``fin`` is done.
         */
        Q.fin = // XXX legacy
        Q["finally"] = function (object, callback) {
            return Q(object)["finally"](callback);
        };
    
        Promise.prototype.fin = // XXX legacy
        Promise.prototype["finally"] = function (callback) {
            callback = Q(callback);
            return this.then(function (value) {
                return callback.fcall().then(function () {
                    return value;
                });
            }, function (reason) {
                // TODO attempt to recycle the rejection with "this".
                return callback.fcall().then(function () {
                    throw reason;
                });
            });
        };
    
        /**
         * Terminates a chain of promises, forcing rejections to be
         * thrown as exceptions.
         * @param {Any*} promise at the end of a chain of promises
         * @returns nothing
         */
        Q.done = function (object, fulfilled, rejected, progress) {
            return Q(object).done(fulfilled, rejected, progress);
        };
    
        Promise.prototype.done = function (fulfilled, rejected, progress) {
            var onUnhandledError = function (error) {
                // forward to a future turn so that ``when``
                // does not catch it and turn it into a rejection.
                Q.nextTick(function () {
                    makeStackTraceLong(error, promise);
                    if (Q.onerror) {
                        Q.onerror(error);
                    } else {
                        throw error;
                    }
                });
            };
    
            // Avoid unnecessary `nextTick`ing via an unnecessary `when`.
            var promise = fulfilled || rejected || progress ?
                this.then(fulfilled, rejected, progress) :
                this;
    
            if (typeof process === "object" && process && process.domain) {
                onUnhandledError = process.domain.bind(onUnhandledError);
            }
    
            promise.then(void 0, onUnhandledError);
        };
    
        /**
         * Causes a promise to be rejected if it does not get fulfilled before
         * some milliseconds time out.
         * @param {Any*} promise
         * @param {Number} milliseconds timeout
         * @param {Any*} custom error message or Error object (optional)
         * @returns a promise for the resolution of the given promise if it is
         * fulfilled before the timeout, otherwise rejected.
         */
        Q.timeout = function (object, ms, error) {
            return Q(object).timeout(ms, error);
        };
    
        Promise.prototype.timeout = function (ms, error) {
            var deferred = defer();
            var timeoutId = setTimeout(function () {
                if (!error || "string" === typeof error) {
                    error = new Error(error || "Timed out after " + ms + " ms");
                    error.code = "ETIMEDOUT";
                }
                deferred.reject(error);
            }, ms);
    
            this.then(function (value) {
                clearTimeout(timeoutId);
                deferred.resolve(value);
            }, function (exception) {
                clearTimeout(timeoutId);
                deferred.reject(exception);
            }, deferred.notify);
    
            return deferred.promise;
        };
    
        /**
         * Returns a promise for the given value (or promised value), some
         * milliseconds after it resolved. Passes rejections immediately.
         * @param {Any*} promise
         * @param {Number} milliseconds
         * @returns a promise for the resolution of the given promise after milliseconds
         * time has elapsed since the resolution of the given promise.
         * If the given promise rejects, that is passed immediately.
         */
        Q.delay = function (object, timeout) {
            if (timeout === void 0) {
                timeout = object;
                object = void 0;
            }
            return Q(object).delay(timeout);
        };
    
        Promise.prototype.delay = function (timeout) {
            return this.then(function (value) {
                var deferred = defer();
                setTimeout(function () {
                    deferred.resolve(value);
                }, timeout);
                return deferred.promise;
            });
        };
    
        /**
         * Passes a continuation to a Node function, which is called with the given
         * arguments provided as an array, and returns a promise.
         *
         *      Q.nfapply(FS.readFile, [__filename])
         *      .then(function (content) {
         *      })
         *
         */
        Q.nfapply = function (callback, args) {
            return Q(callback).nfapply(args);
        };
    
        Promise.prototype.nfapply = function (args) {
            var deferred = defer();
            var nodeArgs = array_slice(args);
            nodeArgs.push(deferred.makeNodeResolver());
            this.fapply(nodeArgs).fail(deferred.reject);
            return deferred.promise;
        };
    
        /**
         * Passes a continuation to a Node function, which is called with the given
         * arguments provided individually, and returns a promise.
         * @example
         * Q.nfcall(FS.readFile, __filename)
         * .then(function (content) {
         * })
         *
         */
        Q.nfcall = function (callback /*...args*/) {
            var args = array_slice(arguments, 1);
            return Q(callback).nfapply(args);
        };
    
        Promise.prototype.nfcall = function (/*...args*/) {
            var nodeArgs = array_slice(arguments);
            var deferred = defer();
            nodeArgs.push(deferred.makeNodeResolver());
            this.fapply(nodeArgs).fail(deferred.reject);
            return deferred.promise;
        };
    
        /**
         * Wraps a NodeJS continuation passing function and returns an equivalent
         * version that returns a promise.
         * @example
         * Q.nfbind(FS.readFile, __filename)("utf-8")
         * .then(console.log)
         * .done()
         */
        Q.nfbind =
        Q.denodeify = function (callback /*...args*/) {
            var baseArgs = array_slice(arguments, 1);
            return function () {
                var nodeArgs = baseArgs.concat(array_slice(arguments));
                var deferred = defer();
                nodeArgs.push(deferred.makeNodeResolver());
                Q(callback).fapply(nodeArgs).fail(deferred.reject);
                return deferred.promise;
            };
        };
    
        Promise.prototype.nfbind =
        Promise.prototype.denodeify = function (/*...args*/) {
            var args = array_slice(arguments);
            args.unshift(this);
            return Q.denodeify.apply(void 0, args);
        };
    
        Q.nbind = function (callback, thisp /*...args*/) {
            var baseArgs = array_slice(arguments, 2);
            return function () {
                var nodeArgs = baseArgs.concat(array_slice(arguments));
                var deferred = defer();
                nodeArgs.push(deferred.makeNodeResolver());
                function bound() {
                    return callback.apply(thisp, arguments);
                }
                Q(bound).fapply(nodeArgs).fail(deferred.reject);
                return deferred.promise;
            };
        };
    
        Promise.prototype.nbind = function (/*thisp, ...args*/) {
            var args = array_slice(arguments, 0);
            args.unshift(this);
            return Q.nbind.apply(void 0, args);
        };
    
        /**
         * Calls a method of a Node-style object that accepts a Node-style
         * callback with a given array of arguments, plus a provided callback.
         * @param object an object that has the named method
         * @param {String} name name of the method of object
         * @param {Array} args arguments to pass to the method; the callback
         * will be provided by Q and appended to these arguments.
         * @returns a promise for the value or error
         */
        Q.nmapply = // XXX As proposed by "Redsandro"
        Q.npost = function (object, name, args) {
            return Q(object).npost(name, args);
        };
    
        Promise.prototype.nmapply = // XXX As proposed by "Redsandro"
        Promise.prototype.npost = function (name, args) {
            var nodeArgs = array_slice(args || []);
            var deferred = defer();
            nodeArgs.push(deferred.makeNodeResolver());
            this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
            return deferred.promise;
        };
    
        /**
         * Calls a method of a Node-style object that accepts a Node-style
         * callback, forwarding the given variadic arguments, plus a provided
         * callback argument.
         * @param object an object that has the named method
         * @param {String} name name of the method of object
         * @param ...args arguments to pass to the method; the callback will
         * be provided by Q and appended to these arguments.
         * @returns a promise for the value or error
         */
        Q.nsend = // XXX Based on Mark Miller's proposed "send"
        Q.nmcall = // XXX Based on "Redsandro's" proposal
        Q.ninvoke = function (object, name /*...args*/) {
            var nodeArgs = array_slice(arguments, 2);
            var deferred = defer();
            nodeArgs.push(deferred.makeNodeResolver());
            Q(object).dispatch("post", [name, nodeArgs]).fail(deferred.reject);
            return deferred.promise;
        };
    
        Promise.prototype.nsend = // XXX Based on Mark Miller's proposed "send"
        Promise.prototype.nmcall = // XXX Based on "Redsandro's" proposal
        Promise.prototype.ninvoke = function (name /*...args*/) {
            var nodeArgs = array_slice(arguments, 1);
            var deferred = defer();
            nodeArgs.push(deferred.makeNodeResolver());
            this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
            return deferred.promise;
        };
    
        /**
         * If a function would like to support both Node continuation-passing-style and
         * promise-returning-style, it can end its internal promise chain with
         * `nodeify(nodeback)`, forwarding the optional nodeback argument.  If the user
         * elects to use a nodeback, the result will be sent there.  If they do not
         * pass a nodeback, they will receive the result promise.
         * @param object a result (or a promise for a result)
         * @param {Function} nodeback a Node.js-style callback
         * @returns either the promise or nothing
         */
        Q.nodeify = nodeify;
        function nodeify(object, nodeback) {
            return Q(object).nodeify(nodeback);
        }
    
        Promise.prototype.nodeify = function (nodeback) {
            if (nodeback) {
                this.then(function (value) {
                    Q.nextTick(function () {
                        nodeback(null, value);
                    });
                }, function (error) {
                    Q.nextTick(function () {
                        nodeback(error);
                    });
                });
            } else {
                return this;
            }
        };
    
        // All code before this point will be filtered from stack traces.
        var qEndingLine = captureLine();
    
        return Q;
    
    }).attach('$b');

    $b('brink/utils/xhr', 
    
        [
            './params',
            './Q'
        ],
    
        function (params, Q) {
    
            'use strict';
    
            var XHR,
                DEFAULT_CONTENT_TYPE = 'application/x-www-form-urlencoded';
    
            XHR = function (url, data, method, options) {
                return XHR.send(XHR.prep(url, data, method, options));
            };
    
            XHR.send = function (xhr) {
    
                var deferred = Q.defer();
    
                xhr.onreadystatechange = function () {
    
                    var response;
    
                    if (xhr.readyState === 4) {
    
                        if (xhr.mimeType === 'json' && xhr.responseType !== 'json') {
                            response = JSON.parse(xhr.responseText);
                        }
    
                        else if (
                            xhr.responseType === 'json' ||
                            xhr.responseType === 'blob' ||
                            xhr.responseType === 'document' ||
                            xhr.responseType === 'arraybuffer'
                        ) {
                            response = xhr.response;
                        }
    
                        else {
                            response = xhr.responseText;
                        }
    
                        if (xhr.status === 200) {
                            deferred.resolve(response);
                        }
    
                        else {
                            deferred.reject(xhr);
                        }
                    }
                };
    
                xhr.send();
    
                return deferred.promise;
            };
    
            XHR.prep = function (url, data, method, options) {
    
                var xhr,
                    body,
                    contentType;
    
                options = options || {};
                method = (method || 'GET').toUpperCase();
    
                xhr = new XMLHttpRequest();
    
                if (options.withCredentials) {
                    xhr.withCredentials = true;
                }
    
                if (options.timeout) {
                    xhr.timeout = options.timeout;
                }
    
                if (options.mimeType) {
                    xhr.overrideMimeType(options.mimeType);
                    xhr.mimeType = options.mimeType;
                }
    
                if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
                    contentType = options.contentType || DEFAULT_CONTENT_TYPE;
                    xhr.open(method, url, true, options.user || '', options.password || '');
                    xhr.setRequestHeader('Content-Type', contentType);
    
                    if (contentType === 'application/x-www-form-urlencoded') {
                        body = params(data, true);
                    }
    
                    else if (contentType === 'application/json') {
                        body = JSON.stringify(data);
                    }
    
                    else {
                        body = data;
                    }
                }
    
                else {
    
                    body = params(data);
    
                    xhr.open(
                        method,
                        url + (body ? '?' + body : ''),
                        true,
                        options.user || '',
                        options.password || ''
                    );
                }
    
                return xhr;
            };
    
            return XHR;
        }
    
    ).attach('$b');

    $b('brink/utils/ready', 
    
        [],
    
        function () {
    
            'use strict';
    
            return function (fn) {
    
                function ready () {
    
                    if (fn) {
                        fn();
                    }
                }
    
                if (typeof document !== 'undefined') {
    
                    if (document.readyState === 'complete') {
                        ready();
                        return;
                    }
    
                    document.addEventListener('DOMContentLoaded', ready);
    
                    return;
                }
    
                fn();
    
            };
        }
    
    ).attach('$b');

    $b('brink/utils/set', 
    
        [
            './get',
            './getObjKeyPair'
        ],
    
        /***********************************************************************
        @class Brink
        ************************************************************************/
        function (get, getObjKeyPair) {
    
            'use strict';
    
            /***********************************************************************
            Set property/properties or a nested property on an `Object`. Works on POJOs as well
            as `Brink.Object` instances.
    
            **Setting single properties:**
    
            ```javascript
            var obj = {};
    
            $b.set(obj, 'test', 'test');
            $b.set(obj, 'some.nested.key', 'test2');
    
            console.log(obj); // { test: 'test', some: { nested: { key: 'test2' } } }
    
            ```
    
            **Setting multiple properties:**
    
            ```javascript
            var obj = {};
    
            $b.set(obj, {test : 'test', test2 : 'test2'});
    
            console.log(obj); // { test: 'test', test2: 'test2' }
    
            ```
    
            @method set
            @param {Object} obj The object containing the property/properties to set.
            @param {String|Object} key The name of the property to set.
            If setting multiple properties, an `Object` containing key : value pairs.
            @param {Any} [val] The value of the property.
            @return {Object} The Object passed in as the first argument.
            ************************************************************************/
            var set = function (obj, key, val, quiet, skipCompare) {
    
                var i,
                    old,
                    isDiff;
    
                if (typeof key === 'string') {
    
                    if (key.indexOf('.') > -1) {
                        obj = getObjKeyPair(obj, key, true);
                        key = obj[1];
                        obj = obj[0];
                    }
    
                    old = get(obj, key);
    
                    isDiff = old !== val;
    
                    if (!skipCompare && !isDiff) {
                        return false;
                    }
    
                    if (obj instanceof $b.Object) {
    
                        if (isDiff) {
                            if (old instanceof $b.Object) {
                                old.__removeReference(obj);
                            }
    
                            if (val instanceof $b.Object) {
                                val.__addReference(
                                    obj,
                                    (
                                        key === 'proxy' &&
                                        val instanceof $b.ObjectProxy ?
                                        '' :
                                        key
                                    )
                                );
                            }
                        }
    
                        if (val && val.__isUnbound) {
                            val = val.value;
                        }
    
                        if (obj.__meta.setters[key]) {
                            obj.__meta.setters[key].call(obj, val, key);
                        }
    
                        else {
                            if (obj.__meta.pojoStyle) {
                                obj[key] = val;
                            }
    
                            obj.__meta.values[key] = val;
                        }
    
                        if (!quiet) {
                            obj.propertyDidChange(key);
                        }
                    }
    
                    else {
                        obj[key] = val;
                    }
    
                    return obj;
                }
    
                else if (arguments.length === 2) {
    
                    for (i in key) {
                        set(obj, i, key[i], val, quiet);
                    }
    
                    return obj;
                }
    
                $b.error('Tried to call `set` with unsupported arguments', arguments);
            };
    
            return set;
        }
    
    ).attach('$b');
    

    $b('brink/utils/trim', 
    
        /***********************************************************************
        @class Brink
        ************************************************************************/
        function () {
    
            'use strict';
    
            /***********************************************************************
            Replaces all whitespace at the beginning and end of a `String`.
    
            @method trim
            @param {String} str The `String` to trim.
            @return {String} The trimmed string.
            ************************************************************************/
            return function (s) {
                return typeof s === 'string' ? s.replace(/^\s+|\s+$/gm, '') : s;
            };
        }
    
    ).attach('$b');

    $b('brink/utils/unbound', 
    
        [],
    
        /***********************************************************************
        @class Brink
        ************************************************************************/
        function () {
    
            'use strict';
            /***********************************************************************
            @method unbound
            @param {Any} value
            ************************************************************************/
            return function (val) {
    
                return {
                    value : val,
                    __isUnbound : true
                };
            };
        }
    
    ).attach('$b');
    

    $b('brink/utils/registerModel', 
    
        [],
    
        /***********************************************************************
        @class Brink
        ************************************************************************/
        function () {
    
            'use strict';
    
            $b.__models = {};
    
            /***********************************************************************
            @method registerModel
            @param {Brink.Model} Model
            ************************************************************************/
            return function (model) {
    
                var mKey,
                    cKey;
    
                mKey = model.modelKey;
                cKey = model.collectionKey;
    
                if ($b.__models[mKey]) {
                    throw new Error('`modelKey` already registered : "' + mKey +  '".');
                }
    
                else if ($b.__models[cKey]) {
                    throw new Error('`collectionKey` already registered : "' + cKey +  '".');
                }
    
                $b.__models[mKey] = model;
                $b.__models[cKey] = model;
            };
        }
    
    ).attach('$b');
    

    $b('brink/utils/unregisterModel', 
    
        [],
    
        /***********************************************************************
        @class Brink
        ************************************************************************/
        function () {
    
            'use strict';
    
            $b.__models = {};
    
            /***********************************************************************
            @method unregisterModel
            @param {Brink.Model} Model
            ************************************************************************/
            return function (model) {
    
                var mKey,
                    cKey;
    
                mKey = model.modelKey;
                cKey = model.collectionKey;
    
                if (!$b.__models[mKey]) {
                    throw new Error('`modelKey` not registered : "' + mKey +  '".');
                }
    
                else if (!$b.__models[cKey]) {
                    throw new Error('`collectionKey` not registered : "' + cKey +  '".');
                }
    
                $b.__models[mKey] = null;
                $b.__models[cKey] = null;
            };
        }
    
    ).attach('$b');
    

    $b('brink/core/CoreObject', 
    
        [
            '../utils/merge',
            '../utils/extend'
        ],
    
        function (merge, extend) {
    
            'use strict';
    
            var CoreObject;
    
            /***********************************************************************
    
            `Brink.CoreObject` is not meant to be used directly.
            Instead, use {{#crossLink "Brink.Object"}}{{/crossLink}} or {{#crossLink "Brink.Class"}}{{/crossLink}}.
    
            @class Brink.CoreObject
            @constructor
            ************************************************************************/
            CoreObject = function () {};
    
            CoreObject.extend = function (props) {
    
                var C,
                    i,
                    proto;
    
                if (arguments.length > 1) {
    
                    i = 0;
                    C = this;
    
                    while (i < arguments.length - 1) {
                        C = C.extend(arguments[i]);
                        i ++;
                    }
    
                    return C;
                }
    
                proto = this.buildPrototype.call(this, props);
    
                function BrinkObject (callInit) {
    
                    var fn;
    
                    if (callInit === true || callInit === false) {
    
                        if (callInit) {
                            fn = this.__init || this.init || this.constructor;
                            fn.call(this);
                        }
    
                        return this;
                    }
    
                    return BrinkObject.extend.apply(BrinkObject, arguments);
                }
    
                BrinkObject.prototype = proto;
                extend(BrinkObject, this, proto.statics || {});
    
                BrinkObject.prototype.constructor = BrinkObject;
    
                BrinkObject.__meta = merge({isObject : true}, BrinkObject.__meta);
    
                return BrinkObject;
            };
    
            CoreObject.buildPrototype = function (props) {
                var BrinkPrototype = function () {};
                BrinkPrototype.prototype = this.prototype;
                return extend(new BrinkPrototype(), props);
            };
    
            CoreObject.inject = function (p, v) {
    
                if (typeof p === 'object') {
                    extend(this.prototype, p);
                }
    
                else {
                    this.prototype[p] = v;
                }
    
                return this;
            };
    
            CoreObject.create = function () {
    
                var init,
                    instance;
    
                instance = new this(false);
    
                init = instance.__init || instance.init;
    
                if (init) {
                    instance = init.apply(instance, arguments) || instance;
                }
    
                return instance;
            };
    
            CoreObject.toString = function () {
                return this.__meta.name;
            };
    
            return CoreObject;
        }
    
    ).attach('$b');
    

    $b('brink/utils/bindFunction', 
    
        [],
    
        /***********************************************************************
        @class Brink
        ************************************************************************/
        function () {
    
            'use strict';
            /***********************************************************************
            Bind a function to a specific scope. Like `Function.prototype.bind()`. Does
            not modify the original function.
    
            ```javascript
    
            var obj = $b.Object.create({
                a : 'test'
            });
    
            function test () {
                console.log(this.a);
            }
    
            var boundTest = $b.bindFunction(test, obj);
            boundTest(); // test
    
            ```
    
            @method bindFunction
            @param {Function} fn The function to bind.
            @param {Brink.Object|Brink.Class} The scope to bind to.
            @return {Function} The bound version of the function.
            ************************************************************************/
            // Faster than Function.prototype.bind in V8, not sure about others.
            return function (fn, scope) {
                return function () {
                    return fn.apply(scope, arguments);
                };
            };
        }
    
    ).attach('$b');
    

    $b('brink/core/Object', 
    
        [
            '../config',
            './CoreObject',
            '../utils/get',
            '../utils/set',
            '../utils/clone',
            '../utils/extend',
            '../utils/merge',
            '../utils/bindTo',
            '../utils/flatten',
            '../utils/intersect',
            '../utils/isFunction',
            '../utils/expandProps',
            '../utils/bindFunction',
            '../utils/getObjKeyPair',
            '../utils/defineProperty'
    
        ],
    
        function (
            config,
            CoreObject,
            get,
            set,
            clone,
            extend,
            merge,
            bindTo,
            flatten,
            intersect,
            isFunction,
            expandProps,
            bindFunction,
            getObjKeyPair,
            defineProperty
        ) {
    
            'use strict';
    
            var Obj;
    
            Obj = CoreObject.extend({
    
                /***********************************************************************
    
                `Brink.Object` is the primary base Class. Most of your Objects will
                extend this Class, unless you need the added functionality of Brink.Class.
    
                @class Brink.Object
                @extends Brink.CoreObject
                @constructor
                ************************************************************************/
                __init : function (o) {
    
                    var i,
                        p,
                        meta;
    
                    if (!this.__meta) {
                        this.__parsePrototype.call(this);
                        meta = this.__meta;
                    }
    
                    else {
                        meta = this.__buildMeta();
                    }
    
                    meta.references = [];
                    meta.referenceKeys = [];
    
                    if (o && typeof o === 'object' && !Array.isArray(o)) {
    
                        o = clone(o);
    
                        this.__appendToMeta(o, meta);
                    }
    
                    for (p in meta.properties) {
                        this.__defineProperty.call(this, p, meta.properties[p]);
                    }
    
                    /*
                        Auto-binding methods is very expensive as we have to do
                        it every time an instance is created. It roughly doubles
                        the time it takes to instantiate
    
                        Still, it's not really an issue unless you are creating thousands
                        of instances at once. Creating 10,000 instances with auto-bound
                        methods should still take < 500ms.
    
                        We auto-bind by default on $b.Class and not on $b.Object because it's
                        far more likely you'd be creating a lot of Object instances at once
                        and shouldn't need the overhead of this.
                    */
                    if (this.__autoBindMethods) {
                        for (i = 0; i < meta.methods.length; i ++) {
                            p = meta.methods[i];
                            if (!~p.indexOf('__')) {
                                this[p] = bindFunction(this[p], this);
                            }
                        }
                    }
    
                    if (this.init && this.__callInit !== false) {
                        this.init.apply(this, arguments);
                    }
    
                    meta.isInitialized = true;
    
                    if ($b.instanceManager) {
                        $b.instanceManager.add(this, meta);
                    }
    
                    return this;
                },
    
                init : function () {
    
                },
    
                __buildMeta : function () {
    
                    var meta;
    
                    meta = this.__meta = clone(this.__meta || {});
    
                    meta.getters = clone(meta.getters || {});
                    meta.setters = clone(meta.setters || {});
    
                    meta.properties = clone(meta.properties || {});
                    meta.methods = clone(meta.methods || []);
                    meta.dependencies = clone(meta.dependencies || []);
    
                    meta.values = {};
                    meta.watchers = {
                        fns : [],
                        props : []
                    };
    
                    meta.memoizedBindings = {};
                    meta.isBrinkObject = true;
    
                    return meta;
                },
    
                __parsePrototype : function () {
                    this.__appendToMeta(this, this.__buildMeta(), true);
                },
    
                __appendToMeta : function (o, meta, isThis, deep) {
    
                    var p,
                        v;
    
                    for (p in o) {
    
                        v = o[p];
    
                        if (isFunction(v)) {
                            if (p !== 'constructor' && !~meta.methods.indexOf(p)) {
                                meta.methods.push(p);
                                if (!isThis) {
                                    this[p] = o[p];
                                }
                            }
                        }
    
                        else if (deep || o.hasOwnProperty(p)) {
    
                            if (p !== '__meta') {
    
                                if (v && v.__isRequire && ~!meta.dependencies.indexOf(p)) {
                                    meta.dependencies.push(p);
                                }
    
                                else {
    
                                    if (v && v.__meta && v.__meta.isSchema) {
                                        this.__appendToMeta(v, meta, isThis, true);
                                    }
    
                                    this.prop.call(this, p, v);
                                }
                            }
                        }
                    }
                },
    
                __defineProperty : function (p, d) {
    
                    d = clone(d);
    
                    // Modern browsers, IE9 +
                    if (Object.defineProperty) {
                        Object.defineProperty(this, p, d);
                    }
    
                    // Old FF
                    else if (this.__defineGetter__) {
                        this.__defineGetter__(p, d.get);
                        this.__defineSetter__(p, d.set);
                    }
    
                    else {
                        this.__meta.pojoStyle = true;
                    }
    
                    if (typeof d.defaultValue !== 'undefined') {
                        this.set(p, d.defaultValue, true, true);
                    }
                },
    
                __undefineProperties : function () {
    
                    var b,
                        p,
                        i,
                        meta,
                        bindings;
    
                    meta = this.__meta;
                    bindings = meta.externalBindings;
    
                    // Cleanup external bindings
                    for (p in bindings) {
    
                        for (i = 0; i < bindings[p].length; i ++) {
                            b = bindings[p][i];
                            if (!b.obj.isDestroyed) {
                                b.obj.unwatch(b.localProp.didChange);
                            }
                        }
                    }
    
                    for (p in this.__meta.properties) {
                        delete this[p];
                    }
                },
    
                __readOnly : function (p) {
    
                    if (this.__meta.pojoStyle) {
                        return $b.error('Tried to write to a read-only property `' + p + '` on ' + this);
                    }
                },
    
                __writeOnly : function (p) {
    
                    if (this.__meta.pojoStyle) {
                        return $b.error('Tried to read a write-only property `' + p + '` on ' + this);
                    }
                },
    
                __defineGetter : function (p, fn) {
    
                    if (isFunction(fn)) {
                        this.__meta.getters[p] = fn;
                    }
    
                    return function () {
                        return this.get(p);
                    };
                },
    
                __defineSetter : function (p, fn) {
    
                    if (isFunction(fn)) {
                        this.__meta.setters[p] = fn;
                    }
    
                    return function (val) {
                        return this.set(p, val);
                    };
                },
    
                __hasReference : function (obj) {
                    var meta = this.__meta;
                    return !!~meta.references.indexOf(obj);
                },
    
                __addReference : function (obj, key) {
                    var meta = this.__meta;
                    meta.references.push(obj);
                    meta.referenceKeys.push(key);
                },
    
                __removeReference : function (obj) {
    
                    var idx,
                        meta;
    
                    meta = this.__meta;
                    idx = meta.references.indexOf(obj);
    
                    if (~idx) {
                        meta.references.splice(idx, 1);
                        meta.referenceKeys.splice(idx, 1);
                    }
                },
    
                /***********************************************************************
                Invalidate one or more properties. This will trigger any bound and computed properties
                depending on these properties to also get updated.
    
                There is almost no need to ever call this manually, as Brink will call it for you
                when setting a property.
    
                This will also trigger any watchers of this property in the next Run Loop.
    
                @method propertyDidChange
                @param  {String} prop The property that changed.
                ************************************************************************/
                propertyDidChange : function (prop) {
                    $b.instanceManager.propertyDidChange(this, prop);
                },
    
                /***********************************************************************
                Gets a subset of properties on this object.
    
                @method getProperties
                @param {Array} keys A listof keys you want to get
                @return {Object} Object of key : value pairs for properties in `keys`.
                ************************************************************************/
                getProperties : function () {
    
                    var i,
                        p,
                        o,
                        props;
    
                    props = flatten([].slice.call(arguments, 0, arguments.length));
                    o = {};
    
                    if (arguments.length) {
    
                        for (i = 0; i < props.length; i ++) {
                            o[props[i]] = this.get(props[i]);
                        }
    
                        return o;
                    }
    
                    for (p in this.__meta.properties) {
                        o[p] = this.get(p);
                    }
    
                    return o;
                },
    
                /***********************************************************************
                Gets all properties that have changed since the last Run Loop.
    
                @method getChangedProperties
                @return {Object} Object of key : value pairs for all changed properties.
                ************************************************************************/
                getChangedProperties : function () {
                    return this.getProperties($b.instanceManager.getChangedProps(this));
                },
    
                /***********************************************************************
                Get or create a property descriptor.
    
                @method prop
                @param {String} key Poperty name.
                @param [val] Default value to use for the property.
                @return {PropertyDescriptor}
                ************************************************************************/
                prop : function (key, val) {
    
                    var a,
                        i,
                        p,
                        obj,
                        tmp,
                        meta,
                        watched;
    
                    obj = getObjKeyPair(this, key);
                    key = obj[1];
                    obj = obj[0] || this;
    
                    meta = obj.__meta;
    
                    meta.bindings = meta.bindings || {};
                    meta.externalBindings = meta.externalBindings || {};
    
                    if (!val && typeof meta.properties[key] !== 'undefined') {
                        if (typeof val === 'undefined') {
                            return meta.properties[key];
                        }
                    }
    
                    if (!val || !val.__isComputed) {
    
                        val = {
                            get : true,
                            set : true,
                            value : val,
                            watch : null
                        };
                    }
    
                    val = meta.properties[key] = defineProperty(obj, key, val);
    
                    if (val.__isComputed) {
                        val.__meta.key = key;
                    }
    
                    val.key = key;
    
                    watched = val.watch;
    
                    if (watched && (i = watched.length)) {
                        tmp = [];
    
                        while (i--) {
    
                            a = watched[i].split('.');
                            p = null;
                            while (a.length) {
                                p = (p ? p.concat('.') : '').concat(a.splice(0, 1)[0]);
                                tmp.push(a.length ? p.concat('.') : p);
                            }
                        }
    
                        i = tmp.length;
    
                        if (i) {
                            meta.memoizedBindings = {};
                        }
    
                        while (i--) {
                            a = meta.bindings[tmp[i]] = meta.bindings[tmp[i]] || [];
                            if (!~a.indexOf(key)) {
                                a.push(key);
                            }
                        }
                    }
    
                    val.bindTo = function (o, p) {
                        this.prop(p, bindTo(o, p));
                    }.bind(obj);
    
                    val.didChange = function () {
                        obj.propertyDidChange(key);
                    }.bind(obj);
    
                    if (val.boundTo) {
                        a = meta.externalBindings[key] = meta.externalBindings[key] || [];
                        a.push({
                            obj : val.boundTo[0],
                            key : val.boundTo[1],
                            localProp : val
                        });
                        val.boundTo[0].watch(val.boundTo[1], val.didChange);
                    }
    
                    if (meta.isInitialized) {
                        obj.__defineProperty(key, val);
                    }
    
                    return val;
                },
    
                /***********************************************************************
                Bind a property to a property on another object.
    
                This can also be achieved with : `a.prop('name').bindTo(b, 'name');`
    
                @method bindProperty
                @param {String} key Poperty name on ObjectA.
                @param {Brink.Object} obj ObjectB, whose property you want to bind to.
                @param {String} key2 Property name on ObjectB.
                ***********************************************************************/
                bindProperty : function (key, obj, key2) {
                    return this.prop(key).bindTo(obj, key2);
                },
    
                /***********************************************************************
                Get the value of a property.
    
                This is identical to doing `obj.key` or `obj[key]`,
                unless you are supporting <= IE8.
    
                @method get
                @param {String} key The property to get.
                @return The value of the property or `undefined`.
                ***********************************************************************/
                get : function (key) {
                    return get(this, key);
                },
    
                /***********************************************************************
                Set the value of a property.
    
                This is identical to doing `obj.key = val` or `obj[key] = val`,
                unless you are supporting <= IE8.
    
                You can also use this to set nested properties.
                I.e. `obj.set('some.nested.key', val)`
    
                @method set
                @param {String} key The property to set.
                @param val The value to set.
                @return The value returned from the property's setter.
                ***********************************************************************/
                set : function () {
                    var args = Array.prototype.slice.call(arguments);
                    args.unshift(this);
                    return set.apply(null, args);
                },
    
                /***********************************************************************
                Watch a property or properties for changes.
    
                ```javascript
    
                var obj = $b.Object.create({
    
                    color : 'green',
                    firstName : 'Joe',
                    lastName : 'Schmoe',
    
                    init : function () {
                        this.watch('color', this.colorChanged.bind(this));
                        this.watch(['firstName', 'lastName'], this.nameChanged.bind(this));
                    },
    
                    colorChanged : function () {
                        console.log(this.color);
                    },
    
                    nameChanged : function () {
                        console.log(this.firstName + ' ' + this.lastName);
                    }
                });
    
                obj.color = 'red';
                obj.firstName = 'John';
                obj.lastName = 'Doe';
    
                ```
    
                Watcher functions are only invoked once per Run Loop, this means that the `nameChanged`
                method above will only be called once, even though we changed two properties that
                `nameChanged` watches.
    
                You can skip the `props` argument to watch all properties on the Object.
    
                @method watch
                @param {null|String|Array} props The property or properties to watch.
                @param {Function} fn The function to call upon property changes.
                ***********************************************************************/
                watch : function () {
    
                    var fn,
                        props;
    
                    props = arguments[0];
                    fn = arguments[1];
    
                    if ($b.instanceManager) {
    
                        if (typeof fn !== 'function') {
    
                            fn = [].slice.call(arguments, arguments.length - 1, arguments.length)[0];
    
                            if (arguments.length === 1) {
                                props = [];
                            }
    
                            else {
                                props = expandProps(flatten([].slice.call(arguments, 0, arguments.length - 1)));
                            }
                        }
    
                        else {
                            props = expandProps([].concat(props));
                        }
    
                        $b.instanceManager.watch(this, props, fn);
                    }
    
                    else {
                        $b.error('InstanceManager does not exist, can\'t watch for property changes.');
                    }
                },
    
                /***********************************************************************
                Remove a watcher.
    
                @method unwatch
                @param {Function|Array} fns The function(s) you no longer want to trigger on property changes.
                ***********************************************************************/
                unwatch : function () {
    
                    if ($b.instanceManager) {
                        $b.instanceManager.unwatch(this, flatten(arguments));
                    }
    
                    else {
                        $b.error('InstanceManager does not exist, can\'t watch for property changes.');
                    }
    
                },
    
                /***********************************************************************
                Remove all watchers watching properties this object.
    
                USE WITH CAUTION.
    
                This gets called automatically during `destroy()`, it's not very common
                you would want to call this directly.
    
                Any and all other objects that have bound properties,
                watchers or computed properties dependent on this Object instance will
                stop working.
    
                @method unwatchAll
                ***********************************************************************/
                unwatchAll : function () {
    
                    if ($b.instanceManager) {
                        $b.instanceManager.unwatchAll(this);
                    }
    
                    else {
                        $b.error('InstanceManager does not exist, can\'t watch for property changes.');
                    }
                },
    
                willNotifyWatchers : function () {
    
                },
    
                didNotifyWatchers : function () {
    
                },
    
                toString : function () {
                    return '[instance ' + this.constructor.__meta.name + ']';
                },
    
                /***********************************************************************
                Destroys an object, removes all bindings and watchers and clears all metadata.
    
                In addition to calling `destroy()` be sure to remove all
                references to the object so that it gets Garbage Collected.
    
                @method destroy
                ***********************************************************************/
                destroy : function () {
    
                    if (this.isDestroyed) {
                        return;
                    }
    
                    this.unwatchAll();
                    this.__undefineProperties();
    
                    if ($b.instanceManager) {
                        $b.instanceManager.remove(this);
                    }
    
                    this.__meta = null;
                    this.isDestroyed = true;
                }
            });
    
            /***********************************************************************
            Extends an object's prototype and creates a new subclass.
    
            The new subclass will inherit all properties and methods of the Object being
            extended.
    
            ```javascript
    
            var Animal = $b.Object.extend({
    
                numLegs : 4,
    
                walk : function () {
                    for (var i = 1; i <= this.numLegs; i ++) {
                        console.log('moving leg #' + i);
                    }
                }
            });
    
            var Dog = Animal.extend({
    
                bark : function () {
                    console.log('woof!!');
                },
    
                walkAndBark : function () {
                    this.bark();
                    this.walk();
                }
            });
    
            var doggy = Dog.create();
            doggy.walkAndBark();
    
            ```
    
            If you want `super()` method support, use {{#crossLink "Brink.Class"}}{{/crossLink}}
    
            ```javascript
    
            var Animal = $b.Class.extend({
    
                numLegs : 4,
    
                walk : function () {
                    for (var i = 1; i <= this.numLegs; i ++) {
                        console.log('moving leg #' + i);
                    }
                }
            });
    
            var Dog = Animal.extend({
    
                bark : function () {
                    console.log('woof!!');
                },
    
                walk : function () {
                    this._super();
                    console.log('all ' + this.numLegs + ' legs moved successfully.');
                },
    
                walkAndBark : function () {
                    this.bark();
                    this.walk();
                }
            });
    
            var doggy = Dog.create();
            doggy.walkAndBark();
    
            ```
    
            @method extend
            ***********************************************************************/
            Obj.extend = function () {
    
                var proto,
                    SubObj;
    
                SubObj = CoreObject.extend.apply(this, arguments);
    
                proto = SubObj.prototype;
                proto.__parsePrototype.call(proto);
                proto.constructor = SubObj;
    
                return SubObj;
            };
    
            return Obj;
        }
    
    ).attach('$b');
    

    $b('brink/core/NotificationManager', 
    
        [
            '../utils/Q'
        ],
    
        function (Q) {
    
            'use strict';
    
            var _interests,
                _pendingNotifications,
    
                Notification,
                NotificationManager;
    
            _pendingNotifications = [];
            _interests = {};
    
            Notification = function (name, args) {
                this.name = name;
                this.args = args;
                return this;
            };
    
            Notification.prototype.name = '';
            Notification.prototype.dispatcher = null;
            Notification.prototype.status = 0;
            Notification.prototype.pointer = 0;
    
            Notification.prototype.cancel = function () {
                this.name = '';
                this.status = 0;
                this.pointer = 0;
                this.dispatcher = null;
                NotificationManager.cancelNotification(this);
            };
    
            Notification.prototype.dispatch = function (obj) {
                this.status = 1;
                this.pointer = 0;
                this.dispatcher = obj;
                NotificationManager.publishNotification(this);
            };
    
            function _publishNotification (notification) {
                _pendingNotifications.push(notification);
                return _notifyObjects(notification);
            }
    
            function _notifyObjects (n) {
    
                var fn,
                    name,
                    subs;
    
                function next () {
    
                    if (n.status === 1 && n.pointer < subs.length) {
    
                        fn = subs[n.pointer];
                        n.pointer ++;
    
                        return (
                            Q(fn.apply(null, [].concat(n, n.args)))
                            .then(function (response) {
                                n.response = response;
                                return next();
                            })
                            .catch(function (err) {
                                return Q.reject(err);
                            })
                        );
                    }
    
                    else {
                        subs = null;
                        if (n.status === 1) {
                            n.cancel();
                        }
    
                        return Q(n.response);
                    }
                }
    
                name = n.name;
    
                if (_interests[name]) {
                    subs = _interests[name].slice(0);
                    return next();
                }
            }
    
            NotificationManager = {};
    
            NotificationManager.subscribe = function (name, fn, priority) {
    
                priority = isNaN(priority) ? -1 : priority;
                _interests[name] = _interests[name] || [];
    
                if (priority <= -1 || priority >= _interests[name].length) {
                    _interests[name].push(fn);
                } else {
                    _interests[name].splice(priority, 0, fn);
                }
            };
    
            NotificationManager.unsubscribe = function (name, fn) {
                var fnIndex = _interests[name].indexOf(fn);
                if (fnIndex > -1) {
                    _interests[name].splice(fnIndex, 1);
                }
            };
    
            NotificationManager.publish = function () {
    
                var notification,
                    args = Array.prototype.slice.call(arguments),
                    name = args[0],
                    dispatcher = args[args.length - 1];
    
                args = args.slice(1, args.length - 1);
    
                notification = new Notification(name, args);
                notification.status = 1;
                notification.pointer = 0;
                notification.dispatcher = dispatcher;
    
                return _publishNotification(notification);
            };
    
            NotificationManager.cancelNotification = function (notification) {
                _pendingNotifications.splice(_pendingNotifications.indexOf(notification), 1);
                notification = null;
            };
    
            $b.define('notificationManager', NotificationManager).attach('$b');
    
            return NotificationManager;
        }
    
    ).attach('$b.__');

    $b('brink/core/Class', 
    
        [
            '../config',
            './Object',
            './NotificationManager',
            '../utils/bindFunction',
            '../utils/merge'
        ],
    
        function (config, Obj, NotificationManager, bindFunction, merge) {
    
            'use strict';
    
            var Class,
                doesCallSuper;
    
            function superfy (fn, superFn) {
    
                return function () {
    
                    var r, tmp = this._super || null;
    
                    // Reference the prototypes method, as super temporarily
                    this._super = superFn;
    
                    r = fn.apply(this, arguments);
    
                    // Reset _super
                    this._super = tmp;
                    return r;
                };
            }
    
            /*
            If Function.toString() works as expected, return a regex that checks for `this._super`
            otherwise return a regex that passes everything.
            */
    
            doesCallSuper = (/xyz/).test(function () {
                var xyz;
                xyz = true;
            }) ? (/\bthis\._super\b/) : (/.*/);
    
            Class = Obj({
    
                /***********************************************************************
                `Brink.Class` provides several useful inheritance helpers
                and other utilities not found on `Brink.Object`:
    
                - `super()` method support.
    
                - Automatically bound methods.
    
                - Publish/Subscribe system.
    
                @class Brink.Class
                @extends Brink.Object
                @constructor
                ************************************************************************/
                __init : superfy(function () {
    
                    this.__autoBindMethods = true;
                    return this._super.apply(this, arguments);
    
                }, Obj.prototype.__init),
    
                /***********************************************************************
                Subscribe to notifications of type `name`.
    
                @method subscribe
                @param {String} name The name of the notifications to subscribe to.
                @param {Function} handler A function to handle the notifications.
                @param {Number} [priority] Lower is higher priority
                (priority of 0 will hear about the notifications before any other handler)
                ************************************************************************/
                subscribe : function (name, handler, priority) {
    
                    this._interestHandlers = this._interestHandlers || {};
    
                    if (handler && !this._interestHandlers[name]) {
                        handler = handler;
                        NotificationManager.subscribe(name, handler, priority);
                        this._interestHandlers[name] = handler;
                    }
                },
    
                /***********************************************************************
                Unsubscribe from notifications of type `name`.
    
                @method unsubscribe
                @param {String} name The name of the notifications to unsubscrube from.
                ************************************************************************/
                unsubscribe : function (name) {
    
                    if (this._interestHandlers && this._interestHandlers[name]) {
                        NotificationManager.unsubscribe(name, this._interestHandlers[name]);
                        delete this._interestHandlers[name];
                    }
                },
    
                /***********************************************************************
                Unsubscribe from all notifications.
    
                This gets called automatically during `destroy()`, it's not very common
                you would want to call this directly.
    
                @method unsubscribeAll
                ************************************************************************/
                unsubscribeAll : function () {
    
                    var interest;
    
                    for (interest in this._interestHandlers) {
                        if (this._interestHandlers.hasOwnProperty(interest)) {
                            this.unsubscribe(interest);
                        }
                    }
    
                    this._interestHandlers = [];
                },
    
                /***********************************************************************
                Publish a notification.
    
                @method publish
                @param {String} name The name of the notification to publish.
                @param {Function} handler A function to handle the notifications.
                @param {Any} [...args] The arguments you want to send to the notification handlers.
                ************************************************************************/
                publish : function (/*name, arg1, arg2, arg3..., callback*/) {
                    var args = Array.prototype.slice.call(arguments);
                    return NotificationManager.publish.apply(NotificationManager, [].concat(args, this));
                },
    
                destroy : superfy(function () {
                    this.unsubscribeAll();
                    return this._super.apply(this, arguments);
                }, Obj.prototype.destroy)
            });
    
            Class.buildPrototype = function (props) {
    
                var p,
                    proto;
    
                proto = Obj.buildPrototype.call(this, props);
    
                for (p in props) {
    
                    if (
                        typeof props[p] === 'function' &&
                        typeof this.prototype[p] === 'function' &&
                        doesCallSuper.test(props[p])
                    ) {
                        // this._super() magic, as-needed
                        proto[p] = superfy(props[p], this.prototype[p]);
                    }
    
                    else if (
                        typeof props[p] === 'object' && (
                            p === 'concatProps' ||
                            ~(props.concatProps || []).indexOf(p) ||
                            ~(this.prototype.concatProps || []).indexOf(p)
                        )
                    ) {
                        proto[p] = merge(this.prototype[p], props[p]);
                    }
                }
    
                return proto;
            };
    
            return Class;
        }
    
    ).attach('$b');

    $b('brink/utils/isBrinkObject', 
    
        /***********************************************************************
        @class Brink
        ************************************************************************/
        function () {
    
            'use strict';
    
            /***********************************************************************
            Test whether or not a value is a `Brink.Object` subclass.
    
            @method isBrinkObject
            @param {Any} obj The value to check.
            @return {Boolean} Whether or not the value is a `Brink.Object` subclass.
            ************************************************************************/
            return function (obj) {
                return obj.__meta && obj.__meta.isBrinkObject;
            };
        }
    
    ).attach('$b');

    $b('brink/core/Array', 
    
        [
            './Object',
            '../utils/get',
            '../utils/computed',
            '../utils/isBrinkObject'
        ],
    
        function (Obj, get, computed, isBrinkObject) {
    
            'use strict';
    
            var Arr,
                AP;
    
            AP = Array.prototype;
    
            Arr = Obj({
    
                changes : computed(function () {
                    return this.getChanges();
                }, ''),
    
                length : computed(function () {
                    return this.content.length;
                }, 'content'),
    
                content : null,
    
                oldContent : null,
                pristineContent : null,
    
                getChanges : function () {
                    return {
                        added : [],
                        removed : [],
                        moved : [],
                        updated : this.updatedItems
                    };
                },
    
                init : function (content) {
    
                    var self = this;
    
                    content = content || [];
                    this.updatedItems = [];
    
                    content.forEach(function (item) {
                        if (isBrinkObject(item)) {
                            item.__addReference(self, '@item.' + item.__meta.iid);
                        }
                    });
    
                    this.set('content', content);
                    this.set('oldContent', content.concat());
                    this.set('length', this.content.length);
    
                    this.contentDidChange = this.contentDidChange.bind(this);
                    this.watch('content', this.contentDidChange);
                },
    
                get : function (i) {
    
                    if (isNaN(i)) {
                        return Obj.prototype.get.apply(this, arguments);
                    }
    
                    return this.content[i];
                },
    
                set : function (i, val) {
    
                    if (isNaN(i)) {
                        return Obj.prototype.set.apply(this, arguments);
                    }
    
                    this.replaceAt(i, val);
                    return val;
                },
    
                find : function (fn, scope) {
    
                    var i,
                        l,
                        r,
                        t;
    
                    r = [];
    
                    for (i = 0, l = this.content.length; i < l; i ++) {
                        t = this.content[i];
                        if (fn.call(scope, t, i, this)) {
                            return t;
                        }
                    }
    
                    return null;
                },
    
                findBy : function (key, val) {
    
                    return this.find(function (item) {
                        return get(item, key) === val;
                    });
                },
    
                filter : function () {
    
                    var filtered = [];
    
                    filtered = AP.filter.apply(this.content, arguments);
                    return Arr.create(filtered);
                },
    
                filterBy : function (key, val) {
    
                    return this.filter(function (item) {
                        return get(item, key) === val;
                    });
                },
    
                forEach : function (fn, scope) {
    
                    var i,
                        l;
    
                    for (i = 0, l = this.content.length; i < l; i ++) {
                        fn.call(scope, this.content[i], i, this);
                    }
    
                },
    
                concat : function () {
                    return Arr.create(this.content.concat());
                },
    
                insertAt : function (i, o) {
                    this.splice(i, 0, o);
                    return this.get('length');
                },
    
                indexOf : function (o) {
                    return this.content.indexOf(o);
                },
    
                push : function () {
    
                    var i;
    
                    for (i = 0; i < arguments.length; i ++) {
                        this.insertAt(get(this, 'length'), arguments[i]);
                    }
    
                    return get(this, 'length');
                },
    
                pop : function (i) {
                    i = get(this, 'length') - 1;
                    return this.removeAt(i);
                },
    
                remove : function (o, i) {
    
                    i = this.content.indexOf(o);
    
                    if (~i) {
                        return this.removeAt(i);
                    }
    
                    return false;
                },
    
                removeAt : function (i, r) {
                    r = AP.splice.call(this.content, i, 1);
                    this.contentDidChange();
                    return r[0];
                },
    
                replace : function (a, b, i) {
    
                    i = this.content.indexOf(a);
    
                    if (~i) {
                        return this.replaceAt(i, b);
                    }
                },
    
                replaceAt : function (i, o) {
                    this.removeAt(i);
                    return this.insertAt(i, o);
                },
    
                splice : function (i, l) {
    
                    var j,
                        rest,
                        removed;
    
                    removed = [];
                    rest = AP.splice.call(arguments, 2, arguments.length);
    
                    if (l > 0) {
    
                        j = i;
                        l = i + l;
    
                        while (j < l) {
                            removed.push(this.removeAt(i));
    
                            j ++;
                        }
                    }
    
                    for (j = 0; j < rest.length; j ++) {
                        this.content.splice(i + j, 0, rest[j]);
                        this.contentDidChange();
                    }
    
                    return removed;
                },
    
                shift : function () {
                    return this.removeAt(0);
                },
    
                unshift : function () {
                    var i = arguments.length;
                    while (i--) {
                        this.insertAt(0, arguments[i]);
                    }
    
                    return get(this, 'length');
                },
    
                reverse : function () {
                    var r;
                    if (!this.pristineContent) {
                        this.pristineContent = this.content.concat();
                    }
    
                    r = AP.reverse.apply(this.content, arguments);
                    this.contentDidChange();
                    return this;
                },
    
                sort : function () {
    
                    if (!this.pristineContent) {
                        this.pristineContent = this.content.concat();
                    }
    
                    AP.sort.apply(this.content, arguments);
                    this.contentDidChange();
                    return this;
                },
    
                reset : function () {
                    this.content = this.pristineContent;
                    this.pristineContent = null;
                },
    
                willNotifyWatchers : function () {
    
                    this.getChanges = function () {
    
                        var i,
                            self,
                            changes,
                            newItem,
                            oldItem,
                            newIndex,
                            oldIndex,
                            oldContent,
                            newContent;
    
                        self = this;
    
                        oldContent = this.oldContent;
                        newContent = this.content;
    
                        changes = {
                            added : [],
                            removed : [],
                            moved : [],
                            updated : this.updatedItems
                        };
    
                        for (i = 0; i < Math.max(oldContent.length, newContent.length); i ++) {
    
                            newItem = newContent[i];
                            oldItem = oldContent[i];
    
                            if (newItem === oldItem) {
                                continue;
                            }
    
                            if (oldItem) {
    
                                newIndex = newContent.indexOf(oldItem);
    
                                // Has it been moved?
                                if (~newIndex) {
                                    changes.moved.push({
                                        oldIndex : i,
                                        newIndex : newIndex,
                                        item : oldItem
                                    });
                                }
    
                                // Nope, it's been removed
                                else {
                                    changes.removed.push({
                                        index : i,
                                        item : oldItem
                                    });
                                }
                            }
    
                            else {
    
                                oldIndex = oldContent.indexOf(newItem);
    
                                // Has it been moved?
                                if (~oldIndex) {
                                    changes.moved.push({
                                        oldIndex : oldIndex,
                                        newIndex : i,
                                        item : newItem
                                    });
                                }
    
                                // Nope, it's been added
                                else {
                                    changes.added.push({
                                        index : i,
                                        item : newItem
                                    });
                                }
                            }
                        }
    
                        this.getChanges = function () {
                            return changes;
                        };
    
                        changes.added.forEach(function (tmp) {
                            if (isBrinkObject(tmp.item)) {
                                tmp.item.__addReference(self, '@item.' + tmp.item.__meta.iid);
                            }
                        });
    
                        changes.removed.forEach(function (tmp) {
                            if (isBrinkObject(tmp.item)) {
                                tmp.item.__removeReference(self);
                            }
                        });
    
                        return changes;
    
                    }.bind(this);
                },
    
                didNotifyWatchers : function () {
    
                    this.oldContent = this.content.concat();
                    this.updatedItems = [];
    
                    if (this.__meta) {
                        this.__meta.contentChanges = {};
                    }
                },
    
                itemDidChange : function (item, props) {
    
                    var self = this;
    
                    this.updatedItems.push({
                        item : item,
                        changes : props
                    });
    
                    props.forEach(function (p) {
                        self.propertyDidChange('@each.' + p);
                    });
                },
    
                contentDidChange : function () {
                    this.propertyDidChange('length');
                    this.propertyDidChange('@each');
                }
            });
    
            return Arr;
        }
    
    ).attach('$b');

    $b('brink/core/Dictionary', 
    
        [
            './Object'
        ],
    
        function (Obj) {
    
            'use strict';
    
            return Obj({
    
                keys : null,
                values : null,
    
                init : function () {
    
                    var i;
    
                    this.keys = [];
                    this.values = [];
    
                    for (i = 0; i < arguments.length; i ++) {
                        this.add.apply(this, [].concat(arguments[i]));
                    }
    
                    this.length = this.keys.length;
                },
    
                get : function (key) {
    
                    var i;
    
                    i = typeof key !== 'string' ? this.keys.indexOf(key) : -1;
    
                    if (~i) {
                        return this.values[i];
                    }
    
                    return Obj.prototype.get.apply(this, arguments);
                },
    
                set : function (key, val) {
    
                    var i;
    
                    i = typeof key !== 'string' ? this.keys.indexOf(key) : -1;
    
                    if (~i) {
                        this.values[i] = val;
                        return val;
                    }
    
                    return Obj.prototype.set.apply(this, arguments);
                },
    
                add : function (key, val) {
                    this.keys.push(key);
                    this.values[this.keys.length - 1] = val;
                },
    
                remove : function () {
    
                    var i,
                        j,
                        removed;
    
                    removed = [];
    
                    for (j = 0; j < arguments.length; j ++) {
    
                        i = this.keys.indexOf(arguments[j]);
    
                        if (~i) {
                            this.keys.splice(i, 1);
                            removed.push(this.values.splice(i, 1)[0]);
                        }
                    }
    
                    return removed;
                },
    
                has : function (o) {
                    return !!~this.keys.indexOf(o);
                },
    
                indexOf : function (o) {
                    return this.keys.indexOf(o);
                },
    
                forEach : function (fn, scope) {
    
                    var i;
    
                    for (i = 0; i < this.keys.length; i ++) {
                        fn.call(scope, this.values[i], this.keys[i], i, this);
                    }
    
                    return this;
                }
    
            });
        }
    
    ).attach('$b');

    $b('brink/core/ObjectProxy', 
    
        [
            './Object',
            '../utils/get',
            '../utils/set',
            '../utils/getObjKeyPair'
        ],
    
        function (Obj, get, set, getObjKeyPair) {
    
            'use strict';
    
            return Obj({
    
                proxy : null,
    
                __hasProp : function (key) {
    
                    var obj,
                        meta;
    
                    obj = getObjKeyPair(this, key);
                    key = obj[1];
                    obj = obj[0] || this;
    
                    meta = obj.__meta;
    
                    return typeof meta.properties[key] !== 'undefined';
                },
    
                get : function (key) {
                    return get(
                        this.__hasProp(key) ? this : this.get('proxy'),
                        key
                    );
                },
    
                set : function (key, val, quiet, skipCompare) {
                    return set(
                        this.__hasProp(key) ? this : this.get('proxy'),
                        key,
                        val,
                        quiet,
                        skipCompare
                    );
                }
            });
        }
    
    ).attach('$b');

    $b('brink/core/RunLoop', 
    
        [
            './CoreObject'
        ],
    
        function (CoreObject) {
    
            'use strict';
    
            return CoreObject.extend({
    
                __interval : 'raf',
                __timerID : null,
                __started : false,
    
                init : function (interval) {
    
                    this.clear();
    
                    if (typeof interval !== 'undefined') {
                        this.setInterval.call(this, interval);
                    }
    
                    return this;
                },
    
                setInterval : function (val) {
    
                    val = isNaN(val) ? val.toLowerCase() : val;
                    this.__interval = (val === 'raf' || val === 'requestanimationframe') ? 'raf' : val;
    
                    if (this.stopTimer()) {
                        this.start();
                    }
                },
    
                startTimer : function (fn) {
    
                    fn = fn.bind(this);
    
                    if (this.__interval === 'raf') {
                        return requestAnimationFrame(fn);
                    }
    
                    return setTimeout(fn, this.__interval);
                },
    
                stopTimer : function () {
    
                    if (!this.__timerID) {
                        return false;
                    }
    
                    if (this.__interval === 'raf') {
                        cancelAnimationFrame(this.__timerID);
                    }
    
                    else {
                        clearTimeout(this.__timerID);
                    }
    
                    this.__timerID = null;
    
                    return true;
                },
    
                start : function (restart) {
                    this.__started = true;
                    if (!this.__timerID || restart) {
                        this.stopTimer();
                        /* jshint boss : true */
                        return this.__timerID = this.startTimer(function () {
                            this.start(true);
                            this.run();
                        });
                    }
                },
    
                restart : function () {
                    this.start(true);
                },
    
                stop : function () {
                    this.__started = false;
                    return this.stopTimer();
                },
    
                defer : function () {
                    return this.start();
                },
    
                deferOnce : function () {
                    this.stopTimer();
                    /* jshint boss : true */
                    return this.__timerID = this.startTimer(function () {
                        this.stopTimer();
                        this.run();
                    }.bind(this));
                },
    
                run : function () {
    
                    var i,
                        fn,
                        args,
                        scope;
    
                    if (!this.__once.length && !this.__loop.length) {
                        return false;
                    }
    
                    for (i = 0; i < this.__once.length; i ++) {
    
                        fn = this.__once[i];
                        args = this.__onceArgs[i][0];
                        scope = this.__onceArgs[i][1];
    
                        fn.call(scope, args);
                    }
    
                    for (i = 0; i < this.__loop.length; i ++) {
    
                        fn = this.__loop[i];
                        args = this.__loopArgs[i][0];
                        scope = this.__loopArgs[i][1];
    
                        fn.call(scope, args);
                    }
    
                    this.__once = [];
                    this.__onceArgs = [];
    
                    return true;
                },
    
                once : function (fn, args, scope) {
    
                    var idx = this.__once.indexOf(fn);
    
                    if (idx < 0) {
    
                        this.__once.push(fn);
                        idx = this.__once.length - 1;
                    }
    
                    else {
                        args = args || this.__onceArgs[idx][0];
                        scope = scope || this.__onceArgs[idx][0];
                    }
    
                    this.__onceArgs[idx] = [args || null, scope || null];
                },
    
                loop : function (fn, args, scope) {
    
                    var idx = this.__loop.indexOf(fn);
    
                    if (idx < 0) {
    
                        this.__loop.push(fn);
                        idx = this.__loop.length - 1;
                    }
    
                    this.__loopArgs[idx] = [args || null, scope || null];
                },
    
                remove : function (fn) {
    
                    var i;
    
                    i = this.__once.indexOf(fn);
    
                    if (i >= 0) {
                        this.__once.splice(i, 1);
                    }
    
                    i = this.__loop.indexOf(fn);
    
                    if (i >= 0) {
                        this.__loop.splice(i, 1);
                    }
                },
    
                clear : function () {
                    this.__loop = [];
                    this.__once = [];
    
                    this.__loopArgs = [];
                    this.__onceArgs = [];
                }
    
            });
        }
    
    ).attach('$b.__');

    $b('brink/core/InstanceWatcher', 
    
        [
            '../config',
            './CoreObject',
            './Array',
            './RunLoop',
            '../utils/intersect'
        ],
    
        function (config, CoreObject, BrinkArray, RunLoop, intersect) {
    
            'use strict';
    
            return CoreObject.extend({
    
                instanceManager : null,
    
                init : function (instanceManager) {
    
                    var self;
    
                    self = this;
    
                    this.instanceManager = instanceManager;
    
                    this.runLoop = RunLoop.create();
                    this.runLoop.loop(function () {
                        self.run();
                    });
    
                    return this;
                },
    
                processBindings : function (obj, props, meta, prefix, recursionLimit) {
    
                    var i,
                        j,
                        l,
                        p,
                        p2,
                        arr,
                        key,
                        tmp,
                        changed,
                        bindings,
                        memoized,
                        prefixReset,
                        memoizedBindings;
    
                    bindings = meta.bindings;
                    memoizedBindings = meta.memoizedBindings = meta.memoizedBindings || {};
    
                    prefix = prefix ? prefix.concat('.') : '';
                    changed = [];
                    recursionLimit = recursionLimit || 20;
    
                    for (i = 0, l = prefixReset = props.length; i < l; i ++) {
    
                        if (prefix && i < prefixReset) {
                            p = prefix.concat(props[i]);
                            props[i] = p;
                        }
    
                        else {
                            p = props[i];
                        }
    
                        memoized = memoizedBindings[p];
    
                        if (memoized == null) {
                            memoized = [];
    
                            if (bindings[p]) {
                                memoized = bindings[p].concat();
                            }
    
                            if (bindings[p + '.']) {
                                Array.prototype.push.apply(memoized, bindings[p + '.']);
                            }
    
                            tmp = p.split('.');
    
                            if (tmp.length > 1) {
                                key = '.'.concat(tmp.pop());
                                p2 = tmp.join('.');
                                arr = bindings[p2];
    
                                if (arr && (j = arr.length)) {
                                    while (j--) {
                                        memoized.push(arr[j].concat(key));
                                    }
                                }
                            }
                            memoizedBindings[p] = memoized;
                        }
    
                        if (recursionLimit) {
                            j = memoized.length;
                            while (j--) {
                                tmp = memoized[j];
                                if (props.indexOf(tmp) === -1) {
                                    props[l++] = tmp;
                                }
                            }
                            recursionLimit--;
                        }
                    }
                    return props;
                },
    
                run : function () {
    
                    var i,
                        k,
                        fn,
                        iid,
                        key,
                        meta,
                        meta2,
                        looped,
                        watched,
                        changed,
                        chProps,
                        manager,
                        instance,
                        instances,
                        reference,
                        references,
                        chInstances,
                        intersected,
                        referenceKeys;
    
                    manager = this.instanceManager;
                    instances = manager.instances;
                    chProps = manager.changedProps;
                    chInstances = manager.changedInstances;
    
                    k = 0;
    
                    while (chInstances.length) {
                        iid = chInstances[k];
                        instance = instances[iid];
                        looped = [];
    
                        if (!instance) {
                            chProps.splice(k, 1);
                            chInstances.splice(k, 1);
                            continue;
                        }
    
                        meta = instance.__meta;
                        references = meta.references;
                        referenceKeys = meta.referenceKeys;
                        changed = chProps[k];
                        this.processBindings(instance, changed, meta);
    
                        // Loop through all references and notify them too...
                        if (changed.length && references.length) {
    
                            i = meta.references.length;
    
                            while (i --) {
    
                                reference = references[i];
    
                                if (looped.indexOf(reference) > -1) {
                                    continue;
                                }
                                looped.push(reference);
    
                                key = referenceKeys[i];
                                meta2 = reference.__meta;
    
                                /* TODO : Move this.... */
                                if (reference.isDestroyed) {
                                    instance.__removeReference(reference);
                                    continue;
                                }
                                watched = this.processBindings(reference, changed.concat(), meta2, key);
                                manager.propertiesDidChange(reference, watched, instance);
    
                                if (reference instanceof BrinkArray) {
                                    reference.itemDidChange(instance, changed.concat());
                                }
                            }
                        }
    
                        i = meta.watchers.fns.length;
                        instance.willNotifyWatchers.call(instance);
    
                        while (i--) {
                            fn = meta.watchers.fns[i];
                            watched = meta.watchers.props[i];
                            intersected = watched.length ? intersect(watched, changed) : changed.concat();
    
                            if (!intersected.length) {
                                continue;
                            }
                            fn.call(null, intersected);
                        }
                        instance.didNotifyWatchers.call(instance);
                        chProps.splice(k, 1);
                        chInstances.splice(k, 1);
                    }
    
                    manager.changedProps = [];
                    manager.changedInstances = [];
    
                    this.stop();
                },
    
                start : function () {
                    this.runLoop.start();
                },
    
                stop : function () {
                    this.runLoop.stop();
                }
    
            });
        }
    
    ).attach('$b.__');
    

    $b('brink/core/InstanceManager', 
    
        [
            '../config',
            './CoreObject',
            './InstanceWatcher',
            '../utils/get',
            '../utils/merge',
            '../utils/flatten'
        ],
    
        function (config, CoreObject, InstanceWatcher, get, merge, flatten) {
    
            'use strict';
    
            var InstanceManager,
                IID = 1;
    
            if (typeof window !== 'undefined') {
                window.count = 0;
            }
    
            InstanceManager = CoreObject.extend({
    
                instances : null,
                changedProps : null,
                changedInstances : null,
    
                init : function () {
    
                    this.instances = {};
                    this.changedProps = [];
                    this.changedInstances = [];
    
                    this.watcher = InstanceWatcher.create(this);
                },
    
                buildMeta : function (meta) {
    
                    meta = meta || {};
                    meta.iid = IID ++;
    
                    return meta;
                },
    
                add : function (instance, meta) {
                    meta = this.buildMeta(meta);
                    this.instances[meta.iid] = instance;
                    return meta;
                },
    
                remove : function (instance) {
                    this.instances[instance.__meta.iid] = null;
                },
    
                getChangedProps : function (obj) {
    
                    var idx,
                        meta;
    
                    meta = obj.__meta;
    
                    idx = this.changedInstances.indexOf(meta.iid);
                    if (!~idx) {
                        return [];
                    }
    
                    else {
                        return this.changedProps[idx];
                    }
                },
    
                propertyDidChange : function (obj, p) {
    
                    var i,
                        idx,
                        meta,
                        changed,
                        chProps,
                        chInstances;
    
                    meta = obj.__meta;
    
                    if (!meta.isInitialized) {
                        return;
                    }
    
                    chInstances = this.changedInstances;
                    chProps = this.changedProps;
    
                    idx = chInstances.indexOf(meta.iid);
                    if (idx === -1) {
                        chInstances.push(meta.iid);
                        changed = [];
                        chProps.push(changed);
                    }
    
                    else {
                        changed = chProps[idx];
                    }
    
                    i = changed.length;
                    if (changed.indexOf(p) === -1) {
                        changed[i] = p;
                    }
    
                    this.watcher.start();
                    return changed;
                },
    
                propertiesDidChange : function (obj, props) {
    
                    var i,
                        j,
                        p,
                        idx,
                        meta,
                        changed,
                        chProps,
                        chInstances;
    
                    meta = obj.__meta;
    
                    chInstances = this.changedInstances;
                    chProps = this.changedProps;
    
                    idx = chInstances.indexOf(meta.iid);
                    if (idx === -1) {
                        chInstances.push(meta.iid);
                        changed = [];
                        chProps.push(changed);
                    }
    
                    else {
                        changed = chProps[idx];
                    }
    
                    i = props.length;
                    j = changed.length;
                    while (i--) {
                        p = props[i];
                        if (changed.indexOf(p) === -1) {
                            changed[j++] = p;
                        }
                    }
    
                    this.watcher.start();
                    return changed;
                },
    
                watch : function (obj, props, fn) {
    
                    var idx,
                        meta;
    
                    meta = obj.__meta;
    
                    idx = meta.watchers.fns.indexOf(fn);
    
                    if (idx === -1) {
                        meta.watchers.fns.push(fn);
                        idx = meta.watchers.fns.length - 1;
                    }
    
                    meta.watchers.props[idx] = merge(meta.watchers.props[idx] || [], props);
                    meta.watchedProps = flatten(meta.watchers.props);
                },
    
                unwatch : function (obj, fns) {
    
                    var i,
                        fn,
                        idx,
                        meta;
    
                    meta = obj.__meta;
    
                    for (i = 0; i < fns.length; i ++) {
    
                        fn = fns[i];
    
                        idx = meta.watchers.fns.indexOf(fn);
    
                        if (~idx) {
                            meta.watchers.fns.splice(idx, 1);
                            meta.watchers.props.splice(idx, 1);
                        }
                    }
    
                    meta.watchedProps = flatten(meta.watchers.props);
                },
    
                unwatchAll : function (obj) {
    
                    var meta;
    
                    meta = obj.__meta;
    
                    if (!meta) {
                        return;
                    }
    
                    meta.watchers = {
                        fns : [],
                        props : []
                    };
    
                    meta.watchedProps = [];
                }
    
            });
    
            $b.define('instanceManager', InstanceManager.create({})).attach('$b');
    
            return $b('instanceManager');
        }
    );

    $b('brink/data/Adapter', 
    
        [
            '../core/Class'
        ],
    
        function (Class) {
    
            'use strict';
    
            var Adapter = Class({
    
                /***********************************************************************
    
                Adapters are how you interface with your persistence layer.
                Adapters receive requests from the store and perform the necessary actions,
                returning promises that get resolved when operations are complete.
    
    
    
                Generally, you will not interact with Adapters directly, the Store and Models will proxy
                requests to your adapters. This allows you to easily swap out Adapters
                if you want to change your persistence layer, and even mix and match adapters
                for different models.
    
    
    
                For help with writing your own Adapter, {{#crossLink "Brink.RESTAdapter"}}{{/crossLink}}
                can be used as a good reference implementation.
    
                @class Brink.Adapter
                @constructor
    
                @module Brink
                @submodule data
                ************************************************************************/
    
                __init : function () {
    
                    var meta;
    
                    meta = this.constructor.__meta;
    
                    if (this.fetch === Adapter.prototype.fetch) {
                        $b.warn('`' + meta.name + '` must implement the `fetch()` method');
                    }
    
                    if (this.fetchAll === Adapter.prototype.fetchAll) {
                        $b.warn('`' + meta.name + '` must implement the `fetchAll()` method');
                    }
    
                    if (this.createRecord === Adapter.prototype.createRecord) {
                        $b.warn('`' + meta.name + '` must implement the `createRecord()` method');
                    }
    
                    if (this.updateRecord === Adapter.prototype.updateRecord) {
                        $b.warn('`' + meta.name + '` must implement the `updateRecord()` method');
                    }
    
                    if (this.deleteRecord === Adapter.prototype.deleteRecord) {
                        $b.warn('`' + meta.name + '` must implement the `deleteRecord()` method');
                    }
    
                    return this._super.apply(this, arguments);
                },
    
                /***********************************************************************
                Fetches a record from the persistence layer.
    
                @method fetch
                @param  {Model} record The record you want to fetch.
                @return {Promise}
                ************************************************************************/
                fetch : $b.F,
    
                /***********************************************************************
                Fetches all records of a Model from the persistence layer.
    
                @method fetchAll
                @param  {ModelClass} Model The Class you want to fetch records of.
                @return {Promise}
                ************************************************************************/
                fetchAll : $b.F,
    
                /***********************************************************************
                Saves a new record to your persistence layer.
    
                @method createRecord
                @param  {Model} record The record you want to create.
                @return {Promise}
                ************************************************************************/
    
                createRecord : $b.F,
    
                /***********************************************************************
                Updates a record in your persistence layer.
    
                @method updateRecord
                @param  {Model} record The record you want to update.
                @return {Promise}
                ************************************************************************/
    
                updateRecord : $b.F,
    
                /***********************************************************************
                Deletes a record in your persistence layer.
    
                @method deleteRecord
                @param  {Model} record The record you want to delete.
                @return {Promise}
                ************************************************************************/
    
                deleteRecord : $b.F,
    
                /***********************************************************************
                Saves a record in your persistence layer.
    
                @method saveRecord
                @param  {Model} record The record you want to save. This will call createRecord()
                or updateRecord(), depending on whether or not the record is new.
                @return {Promise}
                ************************************************************************/
    
                saveRecord : function (record) {
    
                    if (record.get('isNew')) {
                        return this.createRecord(record);
                    }
    
                    return this.updateRecord(record);
                },
    
                /***********************************************************************
                Hook for doing anything you need to based on a new Model definition.
    
                @method registerModel
                @param  {Model} Model
                ************************************************************************/
    
                registerModel : function () {
                    // Hook for if you need to do any fancy pants stuff...
                }
    
            });
    
            return Adapter;
        }
    
    ).attach('$b');
    

    $b('brink/data/RESTAdapter', 
    
        [
            './Adapter',
            '../utils/xhr'
        ],
    
        function (Adapter, xhr) {
    
            'use strict';
    
            return Adapter({
    
                /***********************************************************************
    
                A basic RESTAdapter implementation, this can be used as a good reference point
                for implementing your own adapters or extended to modify the default behavior.
    
                @class Brink.RESTAdapter
                @extends Brink.Adapter
                @constructor
    
                @module Brink
                @submodule data
                ************************************************************************/
    
                host : '',
                prefix : '',
                pluralizeURLs : false,
    
                getURL : function (model, usePK) {
    
                    var url;
    
                    url = [this.get('host'), this.get('prefix')];
                    url.push(model.url || (this.pluralizeURLs ? model.collectionKey : model.modelKey));
    
                    if (usePK) {
                        url.push(model.get('pk'));
                    }
    
                    return url.join('/').replace(/([^:]\/)\/+/g, '$1');
                },
    
                fetch : function (record) {
                    return xhr(this.getURL(record, true), null, 'GET');
                },
    
                fetchAll : function (model) {
                    return xhr(this.getURL(model, false), null, 'GET');
                },
    
                createRecord : function (record) {
                    return xhr(this.getURL(record, false), record.serialize(), 'POST');
                },
    
                updateRecord : function (record) {
                    return xhr(this.getURL(record, true), record.serialize(), 'PUT');
                },
    
                deleteRecord : function (record) {
                    return xhr(this.getURL(record, true), null, 'DELETE');
                }
            });
        }
    
    ).attach('$b');
    

    $b('brink/data/attr', 
        [
            '../utils/get',
            '../utils/set',
            '../utils/computed'
        ],
    
        function (get, set, computed) {
    
            'use strict';
    
            /***********************************************************************
            Define a Schema attribute.
    
            @method attr
            @param  {Type} type The value type of the attribute.
            @param  {Object} options Options for the attribute
            @return {ComputedProperty}
            ************************************************************************/
    
            return (function make (type, options) {
    
                if (typeof type === 'object') {
                    options = type;
                    type = 'string';
                }
    
                type = type || 'string';
    
                options = options || {};
    
                var attr = computed({
    
                    get : function (key) {
    
                        if (typeof this.__meta.data[key] === 'undefined') {
                            return options.defaultValue;
                        }
    
                        return this.__meta.data[key];
                    },
    
                    set : function (val, key) {
    
                        var meta,
                            data,
                            dirty,
                            dirtyIdx,
                            pristine;
    
                        meta = this.__meta;
                        dirty = get(this, 'dirtyAttributes');
                        data = meta.data;
                        pristine = meta.pristineData;
    
                        if (dirty) {
    
                            if (typeof pristine[key] === 'undefined') {
    
                                if (typeof data[key] === 'undefined') {
                                    pristine[key] = options.defaultValue;
                                }
    
                                else {
                                    pristine[key] = data[key];
                                }
    
                                dirty.push(key);
                            }
    
                            else {
    
                                dirtyIdx = dirty.indexOf(key);
    
                                if (pristine[key] === val && ~dirtyIdx) {
                                    dirty.remove(key);
                                }
    
                                else if (!~dirtyIdx) {
                                    dirty.push(key);
                                }
                            }
                        }
    
                        data[key] = val;
                    }
    
                });
    
                attr.meta({
    
                    type : type,
                    isAttribute : true,
                    options : options,
    
                    serialize : function (filter) {
                        var meta = attr.meta(),
                            k = meta.key,
                            v = get(this, k);
                        if (!filter || filter(meta, k, v)) {
                            return v;
                        }
                    },
    
                    deserialize : function (val) {
                        set(this, attr.meta().key, val);
                        return val;
                    },
    
                    revert : function () {
    
                        var key,
                            meta,
                            pristine;
    
                        meta = attr.meta();
                        key = meta.key;
    
                        pristine = this.__meta.pristineData;
    
                        if (pristine[key]) {
                            set(this, key, pristine[key]);
                        }
                    }
                });
    
                attr.clone = function () {
                    return make(type, options);
                };
    
                return attr;
            });
        }
    
    ).attach('$b');
    

    $b('brink/data/belongsTo', 
        [
            '../utils/get',
            '../utils/set',
            '../utils/computed'
        ],
    
        function (get, set, computed) {
    
            'use strict';
    
            /***********************************************************************
            Define a Schema belongsTo relationship (many to one).
    
            @method belongsTo
            @param  {String} modelKey The modelKey of the relationship.
            @param  {Object} options Options for the relationship.
            @return {ComputedProperty}
            ************************************************************************/
    
            return (function make (mKey, options) {
    
                options = options || {};
    
                var belongsTo = computed({
    
                    get : function (key) {
    
                        var val;
    
                        if (typeof this.__meta.data[key] === 'undefined') {
    
                            if (typeof options.defaultValue !== 'undefined') {
                                val = options.defaultValue;
                            }
    
                            else if (options.embedded) {
                                val = $b.__models[mKey].create();
                            }
    
                            if (typeof val !== 'undefined') {
                                this.__meta.data[key] = val;
                            }
                        }
    
                        return this.__meta.data[key];
                    },
    
                    set : function (val, key) {
    
                        var meta,
                            data,
                            store,
                            dirty,
                            dirtyIdx,
                            pristine;
    
                        meta = this.__meta;
                        store = this.store;
                        dirty = get(this, 'dirtyAttributes');
                        data = meta.data;
                        pristine = meta.pristineData;
    
                        if (dirty) {
    
                            if (typeof pristine[key] === 'undefined') {
    
                                if (typeof data[key] === 'undefined') {
                                    pristine[key] = options.defaultValue;
                                }
    
                                else {
                                    pristine[key] = data[key];
                                }
    
                                dirty.push(key);
                            }
    
                            else {
    
                                dirtyIdx = dirty.indexOf(key);
    
                                if (pristine[key] === val && ~dirtyIdx) {
                                    dirty.remove(key);
                                }
    
                                else if (!~dirtyIdx) {
                                    dirty.push(key);
                                }
                            }
                        }
    
                        if (store && val && !(val instanceof $b.__models[mKey])) {
    
                            if (typeof val !== 'string' && typeof val !== 'number') {
                                val = String(val);
                            }
    
                            val = store.findOrCreate(mKey, val);
                        }
    
                        else if (val) {
                            $b.assert(
                                'Must be a model of type "' + mKey + '".',
                                val instanceof $b.__models[mKey]
                            );
                        }
    
                        data[key] = val;
                    }
                });
    
                belongsTo.meta({
    
                    type : 'belongsTo',
                    isRelationship : true,
                    options : options,
                    relationshipKey : mKey,
    
                    serialize : function (filter) {
    
                        var key,
                            val,
                            meta;
    
                        meta = belongsTo.meta();
                        key = meta.key;
    
                        val = get(this, key);
    
                        if (val && val instanceof $b.__models[mKey]) {
    
                            if (options.embedded) {
                                val = val.serialize(filter);
                            }
    
                            else {
                                val = get(val, 'pk');
                            }
    
                        }
    
                        if (!filter || filter(meta, key, val)) {
                            return val;
                        }
                    },
    
                    deserialize : function (val, override, filter) {
    
                        var key,
                            meta,
                            record;
    
                        meta = belongsTo.meta();
                        key = meta.key;
    
                        if (options.embedded) {
    
                            record = get(this, key) || $b.__models[mKey].create();
    
                            if (val && typeof val === 'object') {
                                val = record.deserialize(val, override, filter);
                            }
                        }
    
                        set(this, key, val);
    
                        return val;
                    },
    
                    revert : function (revertRelationships) {
    
                        var key,
                            val,
                            meta;
    
                        meta = belongsTo.meta();
                        key = meta.key;
    
                        val = get(this, key);
    
                        if (val) {
                            val.revert(revertRelationships);
                        }
                    }
                });
    
                belongsTo.clone = function () {
                    return make(mKey, options);
                };
    
                return belongsTo;
            });
        }
    
    ).attach('$b');
    

    $b('brink/data/Collection', 
    
        [
            '../core/Array',
            '../utils/get',
            '../utils/set',
            '../utils/computed'
        ],
    
        function (BrinkArray, get, set, computed) {
    
            'use strict';
    
            var Collection = BrinkArray({
    
                modelKey : null,
                collectionKey : null,
    
                modelClass : computed({
    
                    get : function () {
                        return this._modelClass;
                    },
    
                    set : function (val) {
                        this._modelClass = val;
                        if (val) {
                            set(this, 'modelKey', val.modelKey);
                            set(this, 'collectionKey', val.collectionKey);
                        }
                    }
                }),
    
                __init : function () {
                    this.__recordsByPK = {};
                    BrinkArray.prototype.__init.apply(this, arguments);
                },
    
                findBy : function (key, val) {
    
                    var isPK,
                        record;
    
                    isPK = key === 'pk';
    
                    if (isPK) {
                        record = this.__recordsByPK[val];
    
                        if (record) {
                            return record;
                        }
                    }
    
                    record = BrinkArray.prototype.findBy.call(this, key, val);
    
                    if (isPK && record) {
                        this.__recordsByPK[val] = record;
                    }
    
                    return record;
                },
    
                push : function () {
    
                    var i,
                        l,
                        pk,
                        record;
    
                    for (i = 0, l = arguments.length; i < l; i ++) {
                        record = arguments[i];
                        pk = get(record, 'pk');
                        this.insertAt(this.length, record);
    
                        if (pk) {
                            this.__recordsByPK[pk] = record;
                        }
                    }
    
                    return this.length;
                },
    
                serialize : function (isEmbedded, filter) {
    
                    var a = [];
    
                    this.forEach(function (item) {
    
                        if (isEmbedded) {
                            a.push(item.serialize(filter));
                        }
    
                        else {
                            a.push(item.get('pk'));
                        }
    
                    });
    
                    return a;
                },
    
                revertAll : function (revertRelationships) {
                    this.forEach(function (item) {
                        item.revert(revertRelationships);
                    });
                },
    
                destroy : function (destroyRecords) {
    
                    var i;
    
                    if (destroyRecords) {
                        i = this.content.length;
                        while (i--) {
                            this.content[i].destroy(true);
                        }
                    }
                    BrinkArray.prototype.destroy.call(this);
                }
    
            });
    
            return Collection;
        }
    
    ).attach('$b');
    

    $b('brink/data/hasMany', 
        [
            './Collection',
            '../utils/get',
            '../utils/set',
            '../utils/computed'
        ],
    
        function (Collection, get, set, computed) {
    
            'use strict';
    
            /***********************************************************************
            Define a Schema hasMany relationship (one to many).
    
            @method hasMany
            @param  {String} modelKey The modelKey of the relationship.
            @param  {Object} options Options for the relationship.
            @return {ComputedProperty}
            ************************************************************************/
    
            return (function make (mKey, options) {
    
                options = options || {};
    
                if (options.map) {
                    options.embedded = true;
                }
    
                var hasMany = computed({
    
                    get : function (key) {
    
                        if (!this.__meta.data[key]) {
                            this.__meta.data[key] = Collection.create();
                        }
    
                        return this.__meta.data[key];
                    },
    
                    set : function (val, key) {
    
                        var meta,
                            data,
                            store,
                            dirty,
                            dirtyIdx,
                            pristine;
    
                        meta = this.__meta;
                        store = this.store;
                        dirty = get(this, 'dirtyAttributes');
                        data = meta.data;
                        pristine = meta.pristineData;
    
                        if (dirty) {
    
                            if (typeof pristine[key] === 'undefined') {
    
                                if (typeof data[key] === 'undefined') {
                                    pristine[key] = options.defaultValue;
                                }
    
                                else {
                                    pristine[key] = data[key];
                                }
    
                                dirty.push(key);
                            }
    
                            else {
    
                                dirtyIdx = dirty.indexOf(key);
    
                                if (pristine[key] === val && ~dirtyIdx) {
                                    dirty.remove(key);
                                }
    
                                else if (!~dirtyIdx) {
                                    dirty.push(key);
                                }
                            }
                        }
    
                        if (val) {
                            $b.assert(
                                'Must be a collection.',
                                val instanceof Collection
                            );
                        }
    
                        data[key] = val;
                    }
                });
    
                hasMany.meta({
    
                    type : 'hasMany',
                    isRelationship : true,
                    options : options,
                    relationshipKey : mKey,
    
                    serialize : function (filter) {
    
                        var i,
                            val,
                            map,
                            key,
                            val2,
                            meta;
    
                        meta = hasMany.meta();
                        key = meta.key;
                        map = options.map || {};
    
                        val = get(this, key);
    
                        if (val) {
                            val = val.serialize(options.embedded, filter);
                        }
    
                        if (val && options.map) {
    
                            val2 = {};
    
                            for (i = 0; i < val.length; i ++) {
    
                                if (map.value) {
                                    val2[val[i][map.key]] = val[i][map.value];
                                }
    
                                else {
                                    val2[val[i][map.key]] = val[i];
                                    delete val[i][map.key];
                                }
                            }
    
                            val = val2;
                        }
    
                        if (!filter || filter(meta, key, val)) {
                            return val;
                        }
    
                    },
    
                    deserialize : function (val, override, filter) {
    
                        var i,
                            j,
                            obj,
                            key,
                            map,
                            obj2,
                            val2,
                            meta,
                            store,
                            record,
                            records,
                            collection;
    
                        meta = hasMany.meta();
                        key = meta.key;
                        map = options.map || {};
                        store = this.store;
    
                        val = val || [];
    
                        if (options.map) {
                            val2 = [];
    
                            for (i in val) {
    
                                if (val[i] && !Array.isArray(val[i]) && typeof val[i] === 'object') {
                                    obj = val[i];
                                }
    
                                else {
                                    obj = {value : val[i]};
                                }
    
                                obj.key = i;
                                obj2 = {};
    
                                for (j in obj) {
                                    obj2[map[j] || j] = obj[j];
                                }
    
                                val2.push(obj2);
                            }
    
                            val = val2;
                        }
    
                        records = [];
                        collection = get(this, key) || Collection.create();
    
                        for (i = 0; i < val.length; i ++) {
    
                            if (val && val[i]) {
    
                                if (options.embedded && typeof val[i] === 'object') {
    
                                    record = $b.__models[mKey].create();
    
                                    if (store) {
                                        store.add(mKey, record);
                                    }
    
                                    record.deserialize(val[i], override, filter);
                                }
    
                                else {
    
                                    if (!store) {
                                        record = $b.__models[mKey].create({pk : val[i]});
                                    }
    
                                    else {
                                        record = store.findOrCreate(mKey, val[i]);
                                    }
                                }
    
                                records.push(record);
                            }
                        }
    
                        collection.set('content', records);
                        set(this, key, collection);
    
                        return collection;
                    },
    
                    revert : function (revertRelationships) {
    
                        var key,
                            val,
                            meta,
                            pristine;
    
                        meta = hasMany.meta();
                        key = meta.key;
                        pristine = this.__meta.pristineData;
    
                        if (options.embedded) {
                            val = get(this, key);
                            if (val) {
                                pristine[key] = undefined;
                                val.revertAll(revertRelationships);
                            }
                        }
    
                        else if (pristine[key]) {
                            set(this, key, pristine[key]);
                        }
                    }
                });
    
                hasMany.clone = function () {
                    return make(mKey, options);
                };
    
                return hasMany;
            });
        }
    
    ).attach('$b');
    

    /***********************************************************************
    
    Brink's Model, Store and Adapter Classes offers you flexible and easy way to work with your data layer.
    
    Using Brink.attr(), Brink.belongsTo() and Brink.hasMany() you can define simple or complex model
    structures.
    
    ```javascript
    
    var MyStore = $b.Store.create();
    
    var Person = $b.Model.extend({
    
        primaryKey : 'id',
        modelKey : 'person',
    
        adapter : $b.RESTAdapter.create(),
        store : MyStore,
    
        schema : $b.Schema.create({
            firstName : $b.attr(String),
            lastName : $b.attr(String),
    
            children : $b.hasMany('person'),
            spouse : $b.belongsTo('person')
        })
    });
    
    var dad = Person.create({
        firstName : 'John',
        lastName : 'Doe'
    });
    
    var mom = Person.create({
        firstName : 'Jane',
        lastName : 'Doe'
    });
    
    var child1 = Person.create({
        firstName : 'Mary',
        lastName  : 'Doe'
    });
    
    var child2 = Person.create({
        firstName : 'Bob',
        lastName  : 'Doe'
    });
    
    dad.spouse = mom;
    dad.children.push(child1, child2);
    
    $b.Q.all([
        mom.save(),
        child1.save(),
        child2.save()
    ]).then(function () {
        dad.save();
    });
    
    ```
    
    Looking at the example above, it might be a bit confusing why we are saving the mom and children
    before we save the `dad` record.
    
    The reason for this is that the mom and children do not yet exist, thus if we tried to `serialize()` the `dad`
    record they would come back with null primary key values.
    
    @module Brink
    @submodule data
    
    ************************************************************************/
    
    $b('brink/data/Model', 
    
        [
            '../core/Class',
            '../core/Array',
            '../utils/get',
            '../utils/set',
            '../utils/bindTo',
            '../utils/computed'
        ],
    
        function (Class, BrinkArray, get, set, bindTo, computed) {
    
            'use strict';
    
            var Model = Class({
    
                /***********************************************************************
    
                The Model Class is what all records are created from. Models provide
                a uniform way to work with your records no matter what your backend
                or persistence layer is, even if you mix and match across a project.
    
                @module Brink
                @submodule data
    
                @class Brink.Model
                @constructor
                ************************************************************************/
    
                /***********************************************************************
                The Store instance this model uses. You should only have one Store instance used
                across your entire project and models.
    
                @property store
                @type Brink.Store
                @default null
                ************************************************************************/
    
                store : null,
    
                /***********************************************************************
                The Adapter instance you want to use for this model.
    
                @property adapter
                @type Brink.Adapter
                @default null
                ************************************************************************/
                adapter : null,
    
                /***********************************************************************
                The modelKey you want to use for the model. This will likely influence your adapter.
                i.e. for a RESTAdapter your modelKey would be used in the url for all requests
                made for instances of this model. For a MongooseAdapter,
                this would likely dictate the name of your tables.
    
                @property modelKey
                @type String
                @default null
                ************************************************************************/
    
                modelKey : null,
    
                /***********************************************************************
                The collectionKey you want to use for the model. Much like modelKey this is the
                pluralized form of modelKey. This will be auto-defined as your modelKey + 's' unless
                you explicity define it.
    
                @property collectionKey
                @type String
                @default null
                ************************************************************************/
    
                collectionKey : null,
    
                /***********************************************************************
                The property name of the primaryKey you are using for this Model.
    
                @property primaryKey
                @type String
                @default 'id'
                ************************************************************************/
                primaryKey : 'id',
    
                /***********************************************************************
                A Brink.Array of all the property names that have been changed since the
                last save() or fetch().
    
                @property dirtyAttributes
                @type Brink.Array
                @default null
                ************************************************************************/
                dirtyAttributes : null,
    
                /***********************************************************************
                Whether or not the record is currently saving.
    
                @property isSaving
                @type Boolean
                @default false
                ************************************************************************/
    
                isSaving : false,
    
                /***********************************************************************
                Whether or not the record is currently being fetched.
    
                @property isFetching
                @type Boolean
                @default false
                ************************************************************************/
    
                isFetching : false,
    
                /***********************************************************************
                Whether or not the record has been fetched/loaded.
    
                @property isLoaded
                @type Boolean
                @default false
                ************************************************************************/
                isLoaded : false,
    
                /***********************************************************************
                Whether or not the record is currently being deleted.
    
                @property isDeleting
                @type Boolean
                @default false
                ************************************************************************/
    
                isDeleting : false,
    
                /***********************************************************************
                Whether or not the record has one or more changed properties since the
                last save() or fetch().
    
                @property isDirty
                @type Boolean
                @default false
                ************************************************************************/
    
                isDirty : computed(function () {
                    return !!get(this, 'dirtyAttributes.length');
                }, 'dirtyAttributes.length'),
    
                /***********************************************************************
                Opposite of isDirty.
    
                @property isClean
                @type Boolean
                @default true
                ************************************************************************/
    
                isClean : computed(function () {
                    return !get(this, 'isDirty');
                }, 'isDirty'),
    
                /***********************************************************************
                Is the record new? Determined by the existence of a primary key value.
    
                @property isNew
                @type Boolean
                @default false
                ************************************************************************/
    
                isNew : computed(function () {
                    return !get(this, 'pk');
                }, 'pk'),
    
                /***********************************************************************
                Get the primary key value of the record.
    
                @property pk
                @type String|Number
                ************************************************************************/
                pk : computed({
    
                    get : function () {
                        return this.primaryKey ? get(this, this.primaryKey) : null;
                    },
    
                    set : function (val) {
                        return this.primaryKey ? set(this, this.primaryKey, val) : null;
                    }
                }),
    
                __init : function (o) {
    
                    var p,
                        desc,
                        meta,
                        pMeta,
                        cMeta,
                        attributes,
                        relationships;
    
                    this.__callInit = false;
    
                    this._super.call(this);
    
                    meta = this.__meta;
                    cMeta = this.constructor.__meta;
                    meta.data = {};
    
                    meta.isInitialized = false;
    
                    if (cMeta.attributes) {
                        meta.attributes = cMeta.attributes;
                        meta.relationships = cMeta.relationships;
                    }
    
                    else {
    
                        attributes = [];
                        relationships = [];
    
                        for (p in meta.properties) {
                            desc = meta.properties[p];
                            pMeta = desc.meta && desc.meta();
    
                            if (pMeta) {
                                if (pMeta.isAttribute) {
                                    attributes.push(p);
                                }
    
                                else if (pMeta.isRelationship) {
                                    relationships.push(p);
                                }
                            }
                        }
    
                        meta.attributes = cMeta.attributes = attributes;
                        meta.relationships = cMeta.relationships = relationships;
                    }
    
                    meta.pristineData = {};
                    meta.pristineContent = {};
    
                    if (typeof o === 'object') {
                        this.deserialize(o);
                    }
    
                    set(this, 'dirtyAttributes', BrinkArray.create());
    
                    meta.isInitialized = true;
    
                    if (this.init) {
                        this.__callInit = true;
                        this.init.apply(this, arguments);
                    }
    
                    return this;
                },
    
                /***********************************************************************
                Serialize a record.
    
                @method serialize
                @param {Function} filter A custom function to filter out attributes as you see fit.
                @return {Object}
                ************************************************************************/
    
                serialize : function (filter) {
    
                    var i,
                        l,
                        p,
                        pk,
                        key,
                        val,
                        desc,
                        json,
                        meta,
                        pMeta,
                        props,
                        attributes,
                        relationships;
    
                    meta = this.__meta;
    
                    attributes = meta.attributes;
                    relationships = meta.relationships;
    
                    props = attributes.concat(relationships);
    
                    json = {};
    
                    for (i = 0, l = props.length; i < l; i ++) {
                        p = props[i];
                        desc = this.prop(p);
                        pMeta = desc.meta();
                        key = pMeta.options.key || p;
    
                        val = pMeta.serialize.call(this, filter);
                        if (typeof val !== 'undefined') {
                            set(json, key, val);
                        }
                    }
    
                    if (this.primaryKey) {
                        pk = get(this, 'pk');
                        if (typeof pk !== 'undefined') {
                            set(json, this.primaryKey, pk);
                        }
                    }
    
                    return json;
                },
    
                /***********************************************************************
                De-serialize a record.
    
                @method deserialize
                @param  {Object} json The object containing the properties you want to deserialize.
                @param  {Boolean} override Whether or not you want to update properties that have already been dirtied.
                @param {Function} filter A custom function to filter out attributes as you see fit.
                @return {Model}
                ************************************************************************/
    
                deserialize : function (json, override, filter) {
    
                    var i,
                        p,
                        key,
                        val,
                        desc,
                        meta,
                        pMeta,
                        props,
                        dirty,
                        attributes,
                        relationships;
    
                    meta = this.__meta;
    
                    if (!json) {
                        return this;
                    }
    
                    dirty = get(this, 'dirtyAttributes') || [];
                    attributes = meta.attributes;
                    relationships = meta.relationships;
    
                    props = attributes.concat(relationships);
    
                    i = props.length;
                    while (i--) {
                        p = props[i];
                        desc = this.prop(p);
                        pMeta = desc.meta();
    
                        if (!override && ~dirty.indexOf(p)) {
                            continue;
                        }
    
                        key = pMeta.options.key || p;
                        val = get(json, key);
    
                        if (typeof val !== 'undefined' && (!filter || filter(pMeta, key, val))) {
                            val = pMeta.deserialize.call(this, val, override, filter);
                            meta.pristineData[p] = val;
                        }
                    }
    
                    if (this.primaryKey && json[this.primaryKey]) {
                        set(this, 'pk', json[this.primaryKey]);
                    }
    
                    set(this, 'isLoaded', true);
    
                    return this;
                },
    
                /***********************************************************************
                Saves any changes to this record to the persistence layer (via the adapter).
                Also adds this record to the store.
    
                @method save
                @return {Promise}
                ************************************************************************/
    
                save : function () {
    
                    var self,
                        isNew;
    
                    self = this;
                    isNew = get(this, 'isNew');
                    set(this, 'isSaving', true);
    
                    if (isNew && self.store) {
                        self.store.add(self);
                    }
    
                    return this.adapter.saveRecord(this).then(function (json) {
                        self.deserialize(json, true);
                        set(self, 'dirtyAttributes.content', []);
                        set(self, 'isSaving', false);
                        set(self, 'isLoaded', true);
                        return self;
                    });
                },
    
                /***********************************************************************
                Fetches and populates this record (via the adapter).
    
                @method fetch
                @return {Promise}
                ************************************************************************/
    
                fetch : function (override) {
    
                    var self,
                        isNew;
    
                    self = this;
                    isNew = get(this, 'isNew');
    
                    $b.assert('Can\'t fetch records without a primary key.', !isNew);
    
                    set(this, 'isFetching', true);
    
                    return this.adapter.fetchRecord(this).then(function (json) {
    
                        self.deserialize(json, !!override);
                        if (!!override) {
                            set(self, 'dirtyAttributes.content', []);
                        }
                        set(self, 'isFetching', false);
                        set(self, 'isLoaded', true);
                        return self;
                    });
                },
    
                /***********************************************************************
                Deletes this record (via the adapter). Also removes it from the store.
    
                @method delete
                @return {Promise}
                ************************************************************************/
    
                delete : function () {
    
                    var self,
                        isNew;
    
                    self = this;
                    isNew = get(this, 'isNew');
    
                    set(this, 'isDeleting', true);
    
                    return this.adapter.deleteRecord(this).then(function () {
    
                        if (self.store) {
                            self.store.remove(self);
                        }
    
                        self.destroy();
                        return self;
                    });
                },
    
                /***********************************************************************
                Creates and returns a copy of this record, with a null primary key.
    
                @method clone
                @return {Model}
                ************************************************************************/
    
                clone : function () {
    
                    var json = this.serialize();
    
                    if (typeof json[this.primaryKey] !== 'undefined') {
                        delete json[this.primaryKey];
                    }
    
                    return this.constructor.create(json);
                },
    
                /***********************************************************************
                Reverts all changes made to this record since the last save() or fetch().
    
                @method revert
                @return {Model}
                ************************************************************************/
    
                revert : function (revertRelationships) {
    
                    var i,
                        p,
                        key,
                        desc,
                        meta,
                        pMeta,
                        props,
                        dirty,
                        attributes,
                        relationships;
    
                    meta = this.__meta;
    
                    dirty = get(this, 'dirtyAttributes');
                    attributes = meta.attributes;
                    relationships = meta.relationships;
    
                    props = attributes.concat(relationships);
    
                    i = props.length;
                    while (i--) {
                        p = props[i];
                        desc = this.prop(p);
                        pMeta = desc.meta();
    
                        key = pMeta.options.key || p;
    
                        if (
                            pMeta.isAttribute ||
                            (pMeta.isRelationship &&
                            (revertRelationships || pMeta.options.embedded))
                        ) {
                            pMeta.revert.call(this, revertRelationships);
                        }
                    }
    
                    return this;
                }
            });
    
            Model.extend = function () {
    
                var meta,
                    proto,
                    SubClass;
    
                SubClass = Class.extend.apply(this, arguments);
                proto = SubClass.prototype;
    
                if (proto.url) {
                    SubClass.url = proto.url;
                }
    
                if (proto.primaryKey) {
                    SubClass.primaryKey = proto.primaryKey;
                }
    
                if (proto.modelKey) {
                    meta = SubClass.__meta;
    
                    if (!proto.collectionKey) {
                        proto.collectionKey = proto.modelKey.concat('s');
                    }
    
                    SubClass.modelKey = proto.modelKey;
                    SubClass.collectionKey = proto.collectionKey;
    
                    $b.registerModel(SubClass);
                }
    
                if (proto.adapter) {
                    SubClass.adapter = proto.adapter;
                    proto.adapter.registerModel(SubClass);
                }
    
                return SubClass;
            };
    
            Model.unregister = function () {
                $b.unregisterModel(this);
            };
    
            return Model;
        }
    
    ).attach('$b');
    

    $b('brink/data/Schema', 
    
        [
            '../core/CoreObject',
            '../utils/extend'
        ],
    
        function (CoreObject, extend) {
    
            'use strict';
    
            var Schema = CoreObject.extend({
    
                /***********************************************************************
    
                Schemas allow you to define your models properties and relationships.
    
                @module Brink
                @submodule data
    
                @class Brink.Schema
                @constructor
                ************************************************************************/
    
                __init : function (o) {
    
                    this.__meta = this.__meta || {};
                    this.__meta.isSchema = true;
    
                    extend(this, o);
                    return this;
                }
    
            });
    
            return Schema;
        }
    
    ).attach('$b');
    

    $b('brink/data/Store', 
    
        [
            './Model',
            './Collection',
            '../core/Class',
            '../utils/get',
            '../utils/set'
        ],
    
        function (Model, Collection, Class, get, set) {
    
            'use strict';
    
            var Store = Class({
    
                /***********************************************************************
    
                The store is a glorified cache, with convenience methods to work with your
                Adapters to update or query your persistence layer as needed.
    
                By having a Store, you will need to access your persistence layer
                much less frequently and you will be able to return records from the
                store instantly.
    
                @module Brink
                @submodule data
    
                @class Brink.Store
                @constructor
                ************************************************************************/
    
                init : function () {
                    this.__registry = $b.__models;
                    this.__store = {};
                },
    
                /***********************************************************************
                Clear the store. Removes all record instances in the store.
                This does not in any way affect the persistence layer or call any methods
                on the models' adapters.
    
                @method clear
                @param  {Brink.Model} Model
                ************************************************************************/
    
                clear : function () {
                    this.__store = {};
                },
    
                /***********************************************************************
                Adds new record(s) to the store.
                This does not in any way affect the persistence layer or call any methods
                on the models' adapters.
    
                @method add
                @param  {String|Model} model The modelKey or Model class to add records for.
                @param  {Model|Array} records The record or records you want to add to the store.
                @return {Brink.Collection}
                ************************************************************************/
    
                add : function (mKey, records) {
    
                    var i,
                        l,
                        record,
                        collection;
    
                    if (arguments.length === 1) {
                        records = mKey;
                        records = Array.isArray(records) ? records : [records];
                        mKey = records[0].modelKey;
                    }
    
                    else {
                        records = Array.isArray(records) ? records : [records];
                    }
    
                    collection = this.getCollection(mKey);
    
                    for (i = 0, l = records.length; i < l; i ++) {
    
                        record = records[i];
    
                        if (!~collection.indexOf(record)) {
                            set(record, 'store', this);
                            collection.push(record);
                        }
                    }
    
                    return collection;
                },
    
                /***********************************************************************
                Removes record(s) from the store.
                This does not in any way affect the persistence layer or call any methods
                on the models' adapters.
    
                @method remove
                @param  {String|Model} model The modelKey or Model class to remove records for.
                @param  {Model|Array} The record or records you want to remove from the store.
                @return {Brink.Collection}
                ************************************************************************/
    
                remove : function (mKey, records) {
    
                    var i,
                        l,
                        record,
                        collection;
    
                    if (arguments.length === 1) {
                        records = mKey;
                        records = Array.isArray(records) ? records : [records];
                        mKey = records[0].modelKey;
                    }
    
                    else {
                        records = Array.isArray(records) ? records : [records];
                    }
    
                    collection = this.getCollection(mKey);
    
                    for (i = 0, l = records.length; i < l; i ++) {
                        record = records[i];
                        collection.remove(records[i]);
                    }
    
                    return collection;
                },
    
                /***********************************************************************
                Returns all the records of a specific type in the store.
    
                @method all
                @param  {String|Model} model The modelKey or Model class of the records you want to get.
                @return {Brink.Collection}
                ************************************************************************/
    
                all : function (mKey) {
                    return this.getCollection(mKey);
                },
    
                /***********************************************************************
                Returns all the records of a specific type from the persistence layer
                and adds them to the store.
    
                @method fetchAll
                @param  {String|Model} model The modelKey or Model class of the records you want to get.
                @return {Brink.Collection}
                ************************************************************************/
    
                fetchAll : function (mKey) {
    
                    var i,
                        item,
                        model,
                        record,
                        primaryKey;
    
                    model = this.modelFor(mKey);
                    primaryKey = model.primaryKey;
    
                    return model.adapter.fetchAll(model).then(function (json) {
    
                        json = Array.isArray(json) ? json : [json];
    
                        for (i = 0; i < json.length; i ++) {
                            item = json[i];
                            record = this.findOrCreate(model, item[model.primaryKey]);
                            record.deserialize(item);
                        }
    
                        return this.all(model);
    
                    }.bind(this));
                },
    
                /***********************************************************************
                Find a record in the store.
    
                @method find
                @param  {String|Model} model The modelKey or Model class of the record you want to find.
                @param  {String|Number|Object} q The primary key or an object of parameters you want to match.
                @return {Brink.Model}
                ************************************************************************/
    
                find : function (mKey, q) {
    
                    var collection;
    
                    collection = this.getCollection(mKey);
    
                    if (typeof q === 'number' || typeof q === 'string') {
                        return collection.findBy('pk', q);
                    }
    
                    if (typeof q === 'function') {
                        return collection.find(q);
                    }
    
                    return collection.find(function (item) {
    
                        var p;
    
                        for (p in q) {
                            if (get(item, p) !== q[p]) {
                                return false;
                            }
                        }
    
                        return true;
    
                    }, this);
                },
    
                /***********************************************************************
                Find a record in the store by primary key or create one.
    
                @method findOrCreate
                @param  {String|Model} model The modelKey or Model class of the record you want to find.
                @param  {String|Number} pk The primary key of the record.
                @return {Brink.Model}
                ************************************************************************/
    
                findOrCreate : function (mKey, pk) {
    
                    var record;
    
                    if (pk) {
                        record = this.find(mKey, pk);
                    }
    
                    if (!record) {
                        record = this.modelFor(mKey).create();
                        set(record, 'pk', pk);
                        this.add(mKey, record);
                    }
    
                    return record;
                },
    
                /***********************************************************************
                Creates a new record and adds it to the store.
    
                @method createRecord
                @param  {String|Model} model The modelKey or Model class of the record you want to find.
                @param  {Object} data The data you want to populate the record with.
                @return {Brink.Model}
                ************************************************************************/
    
                createRecord : function (mKey, data) {
    
                    var record;
    
                    record = this.modelFor(mKey).create(data);
                    this.add(mKey, record);
    
                    return record;
                },
    
                /***********************************************************************
                Filters through all records in the store of a specific type and returns matches.
    
                @method filter
                @param  {String|Model} model The modelKey or Model class of the record you want to find.
                @param  {Function|Object} q An object of parameters you want to match or a filter function.
                @return {Brink.Array}
                ************************************************************************/
    
                filter : function (mKey, q) {
    
                    var collection;
    
                    collection = this.getCollection(mKey);
    
                    if (typeof q === 'function') {
                        return collection.filter(q);
                    }
    
                    return collection.filter(function (item) {
    
                        var p,
                            doesMatch;
    
                        doesMatch = true;
    
                        for (p in q) {
                            if (get(item, p) !== q[p]) {
                                doesMatch = false;
                            }
                        }
    
                        return doesMatch;
    
                    }, this);
                },
    
                getCollection : function (mKey) {
    
                    var Class,
                        collection;
    
                    Class = this.modelFor(mKey);
    
                    if (!Class) {
                        throw new Error('No model was found with a modelKey of "' + mKey + '"');
                    }
    
                    collection = this.__store[Class.collectionKey];
    
                    if (!collection) {
                        collection = this.__store[Class.collectionKey] = this.createCollection(Class);
                    }
    
                    return collection;
                },
    
                createCollection : function (mKey) {
    
                    var Class,
                        collection;
    
                    Class = this.modelFor(mKey);
    
                    if (!Class) {
                        throw new Error('No model was found with a modelKey of "' + mKey + '"');
                    }
    
                    collection = Collection.create();
    
                    set(collection, 'modelClass', Class);
    
                    return collection;
                },
    
                /***********************************************************************
                Given a modelKey or collectionKey returns the corresponding Model Class.
    
                @method modelFor
                @param  {String} model The modelKey or collectionKey to get the Class for.
                @return {Brink.Model}
                ************************************************************************/
    
                modelFor : function (mKey) {
    
                    return (
                        typeof mKey !== 'string' ? mKey : this.__registry[mKey]
                    );
                },
    
                destroy : function (destroyRecords) {
    
                    var p;
    
                    if (destroyRecords) {
                        for (p in this.__store) {
                            this.__store[p].destroy(true);
                        }
                    }
    
                    this.__registry = null;
                    this.__store = {};
    
                    this._super.apply(this, arguments);
                }
            });
    
            return Store;
        }
    
    ).attach('$b');
    

}).call(this);