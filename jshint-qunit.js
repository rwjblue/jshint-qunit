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
}

function JSHintQunit(options) {
  if (!(this instanceof JSHintQunit)) return new JSHintQunit(options);

  options = options || {};

  this._jshintrc = options.jshintrc;
  this.registry  = options.registry || requirejs.entries;
  this.qunit     = options.qunit || QUnit;
  this.matcher   = options.matcher;

  this.qunit.config.urlConfig.push('nojshint');
  this.enabled   = !this.qunit.urlParams.nojshint;
}

JSHintQunit.prototype.generateTests = function () {
  var _this = this;

  if (!_this.enabled) { return; }

  for (var moduleName in _this.registry) {
    if (!_this.registry.hasOwnProperty(moduleName)) { continue; }
    if (_this.matcher && !_this.matcher.test(moduleName)) { continue; }

    _this.addTest(moduleName, _this.registry[moduleName].callback.toString());
  }
};

JSHintQunit.prototype.addTest = function(moduleName, contents) {
  var _this = this;

  module(moduleName);
  test('should pass jshint', function() {
    var passed = JSHINT(contents, _this.jshintrc),
    errors = jsHintReporter(moduleName, JSHINT.errors);
    ok(passed, moduleName+" should pass jshint."+(errors ? "\n"+errors : ''));
  });
};

window.JSHintQunit = JSHintQunit;
