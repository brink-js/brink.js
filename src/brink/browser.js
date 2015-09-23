'use strict';

include('./main.js');

/********* POLYFILLS *********/

include('./polyfills/Array.forEach.js');
include('./polyfills/Array.filter.js');
include('./polyfills/Array.indexOf.js');
include('./polyfills/Array.isArray.js');
include('./polyfills/Document.registerElement.js');
include('./polyfills/Function.bind.js');
include('./polyfills/requestAnimationFrame.js');

/********* RESOLVER *********/

include('./resolvers/async');

$b.define('$b', $b);

if (typeof module !== 'undefined' && module.exports) {
    module.exports = $b;
}
