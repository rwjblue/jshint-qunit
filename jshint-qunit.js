// We should figure out a better way to grab the .jshintrc file from the project
var JSHINTRC = require('pipeline/tests/jshintrc')['default'];

function jsHintReporter(file, errors) {
  if (!errors) { return ''; }

  var len = errors.length,
  str = '',
  error, idx;

  if (len === 0) { return ''; }

  for (idx=0; idx<len; idx++) {
    error = errors[idx];
    str += file  + ': line ' + error.line + ', col ' +
      error.character + ', ' + error.reason + '\n';
  }

  return str + "\n" + len + ' error' + ((len === 1) ? '' : 's');
};

function JSHintQunit(options) {
  if (!(this instanceof JSHintQunit)) return new JSHintQunit(options);

  var defaultGlobals = [
    '__exports__',
    'JSHintQunit'
  ];

  options = options || {};


  JSHINTRC.predef = JSHINTRC.predef.concat(defaultGlobals);

  this._jshintrc = JSHINTRC;
  this.registry  = options.registry || requirejs.entries;
  this.qunit     = options.qunit || QUnit;
  this.matcher   = options.matcher;

  this.qunit.config.urlConfig.push('nojshint');
  this.enabled   = !this.qunit.urlParams.nojshint;
};

JSHintQunit.prototype.generateTests = function () {
  var _this = this;

  if (!_this.enabled) { return; }

  // Create test module for all jsHint tests.
  // This should be refactored to split up test modules logically.
  module('jsHint');

  for (var moduleName in _this.registry) {
    if (!_this.registry.hasOwnProperty(moduleName)) { continue; }
    if (_this.matcher && !_this.matcher.test(moduleName)) { continue; }

    _this.addTest(moduleName, _this.registry[moduleName].callback.toString());
  }
};

JSHintQunit.prototype.addTest = function(moduleName, contents) {
  var _this = this;

  test(moduleName + ' should pass jshint', function() {
    var es6EscapedContents = contents.split('\n')

    // Supress missing name in function declaration error
    es6EscapedContents.splice(0, 0, '/* jshint -W025 */');
    es6EscapedContents.splice(2, 0, '/* jshint +W025 */');

    cleanedContents = es6EscapedContents.join('\n');

    var passed = JSHINT(cleanedContents, _this._jshintrc),
    errors = jsHintReporter(moduleName, JSHINT.errors);

    ok(passed, moduleName+" should pass jshint."+(errors ? "\n"+errors : ''));
  });
};

window.JSHintQunit = JSHintQunit;
