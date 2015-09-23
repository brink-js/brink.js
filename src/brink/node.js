'use strict';

var $b = require('./main.js');

/********* POLYFILLS *********/

require('./polyfills/Array.forEach.js');
require('./polyfills/Array.filter.js');
require('./polyfills/Array.indexOf.js');
require('./polyfills/Array.isArray.js');
require('./polyfills/Document.registerElement.js');
require('./polyfills/Function.bind.js');
require('./polyfills/requestAnimationFrame.js');

/********* RESOLVER *********/

require('./resolvers/async');

$b.define('$b', $b);

$b.build = function () {

    var args = arguments;

    $b.init(function () {
        $b.build.apply(null, args);
    });
};

$b.configure({paths : {brink : __dirname, plugins : __dirname + '/amd'}});
$b.init();
$b.configure({paths : null});

module.exports = $b;
