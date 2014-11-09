var Environment, Parser, TaijiModule, addPrelude, begin, compile, compileExp, compileExpNoOptimize, compileInteractive, entity, ext, extend, formatTaijiJson, initEnv, metaCompile, metaConvert, optimizeExp, rootModule, textizerOptions, transformExp, _base, _i, _len, _ref, _ref1, _ref2;

exports.VERSION = '0.1.0';

_ref = require('./utils'), extend = _ref.extend, begin = _ref.begin, formatTaijiJson = _ref.formatTaijiJson, addPrelude = _ref.addPrelude, entity = _ref.entity;

TaijiModule = require('./module');

Parser = require('./parser').Parser;

exports.Parser = Parser;

_ref1 = require('./compiler'), Environment = _ref1.Environment, metaConvert = _ref1.metaConvert, transformExp = _ref1.transformExp, optimizeExp = _ref1.optimizeExp, compileExp = _ref1.compileExp, metaCompile = _ref1.metaCompile, compileExpNoOptimize = _ref1.compileExpNoOptimize;

exports.Environment = Environment;

exports.compileExp = compileExp;

exports.builtins = extend({}, require('./builtins/core'), require('./builtins/js'));

exports.textizerOptions = textizerOptions = {
  indentWidth: 2,
  lineLength: 80
};

exports.rootModule = rootModule = new TaijiModule(__filename, null);

exports.initEnv = initEnv = function(builtins, taijiModule, options) {
  var env;
  options = extend(options, textizerOptions);
  env = new Environment(extend({}, builtins), null, new Parser, taijiModule, {}, options);
  env.parser = new Parser;
  return env;
};

exports.parse = function(code, taijiModule, builtins, options) {
  var env, exp, parser;
  env = initEnv(builtins, taijiModule, options);
  parser = env.parser;
  exp = parser.parse(code, parser.module, 0, env);
  return formatTaijiJson(entity(exp.body), 0, 0, false, 2, 70);
};

exports.convert = function(code, taijiModule, builtins, options) {
  var env, exp, parser;
  env = initEnv(builtins, taijiModule, options);
  parser = env.parser;
  exp = parser.parse(code, parser.module, 0, env);
  exp = metaConvert(addPrelude(parser, exp.body), env);
  return formatTaijiJson(entity(exp), 0, 0, false, 2, 70);
};

exports.transform = function(code, taijiModule, builtins, options) {
  var env, exp, parser;
  env = initEnv(builtins, taijiModule, options);
  parser = env.parser;
  exp = parser.parse(code, parser.module, 0, env);
  exp = transformExp(addPrelude(parser, exp.body), env);
  return formatTaijiJson(entity(exp), 0, 0, false, 2, 70);
};

exports.optimize = function(code, taijiModule, builtins, options) {
  var env, exp, parser;
  env = initEnv(builtins, taijiModule, options);
  parser = env.parser;
  exp = parser.parse(code, parser.module, 0, env);
  exp = optimizeExp(addPrelude(parser, exp.body), env);
  return formatTaijiJson(entity(exp), 0, 0, false, 2, 70);
};

exports.compileInteractive = compileInteractive = function(code, taijiModule, builtins, options) {
  var env, exp, objCode, parser;
  env = initEnv(builtins, taijiModule, options);
  parser = env.parser;
  exp = parser.parse(code, parser.moduleBody, 0, env);
  return objCode = compileExp(exp, env);
};

exports.metaCompile = function(code, taijiModule, builtins, options) {
  var env, exp, objCode, parser;
  env = initEnv(builtins, taijiModule, options);
  parser = env.parser;
  exp = parser.parse(code, parser.module, 0, env);
  return objCode = metaCompile(addPrelude(parser, exp.body), [], env);
};

exports.compile = compile = function(code, taijiModule, builtins, options) {
  var env, exp, objCode, parser;
  env = initEnv(builtins, taijiModule, options);
  parser = env.parser;
  exp = parser.parse(code, parser.module, 0, env);
  return objCode = compileExp(addPrelude(parser, exp.body), env);
};

exports.compileNoOptimize = function(code, taijiModule, builtins, options) {
  var env, exp, objCode, parser;
  env = initEnv(builtins, taijiModule, options);
  parser = env.parser;
  exp = parser.parse(code, parser.module, 0, env);
  return objCode = compileExpNoOptimize(addPrelude(parser, exp.body), env);
};

exports["eval"] = function(code, taijiModule, builtins, options) {
  var x;
  x = compile(code, taijiModule, builtins, options);
  return eval(x);
};

exports.FILE_EXTENSIONS = ['.taiji', '.tj'];

exports.register = function() {
  return require('./register');
};

if (require.extensions) {
  _ref2 = exports.FILE_EXTENSIONS;
  for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
    ext = _ref2[_i];
    if ((_base = require.extensions)[ext] == null) {
      _base[ext] = function() {
        throw new Error("Use taiji.register() or require the taiji/register module to require " + ext + " files.");
      };
    }
  }
}
