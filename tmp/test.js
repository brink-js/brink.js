var fs = require('fs');

global.document = require('jsdom').jsdom('<html><body></body></html>');
global.window = global.document.parentWindow;
global.$ = require('jquery');

require('../src/brink/brink.js');

$b.configure({
    baseUrl : __dirname + '/../src'
});

$b.init(function () {

    var tmplStr = fs.readFileSync('./test.tmpl', 'utf8');

    var template = $b.Template.create(tmplStr);

    var dom = $('<div></div>');

    var person = $b.Object.create({
        firstName : 'Taka',
        lastName : 'Kojima'
    });

    template.render(person);

    dom.append(template.dom);

    setInterval(function () {
        console.dir(dom.html());
    }, 250);

});
