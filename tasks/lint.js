var cp = require('child_process');
var child = cp.fork('./node_modules/jshint/bin/jshint', ['--reporter', './tasks/lint-reporter.js', 'src/brink']);

