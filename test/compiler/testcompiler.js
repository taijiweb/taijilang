var Parser, compile, expect, idescribe, iit, lib, matchRule, ndescribe, nit, noOptCompile, nonMetaCompileExpNoOptimize, parse, str, taiji, _ref;

_ref = require('../util'), expect = _ref.expect, idescribe = _ref.idescribe, ndescribe = _ref.ndescribe, iit = _ref.iit, nit = _ref.nit, matchRule = _ref.matchRule, parse = _ref.parse, compile = _ref.compile;

lib = '../../lib/';

str = require(lib + 'utils').str;

Parser = require(lib + 'parser').Parser;

taiji = require(lib + 'taiji');

nonMetaCompileExpNoOptimize = require(lib + 'compiler').nonMetaCompileExpNoOptimize;

parse = function(text) {
  var parser, x;
  parser = new Parser();
  return x = parser.parse(text, parser.module, 0);
};

compile = noOptCompile = function(text) {
  var env, exp;
  exp = parse(text);
  env = taiji.initEnv(taiji.builtins, taiji.rootModule, {});
  exp = nonMetaCompileExpNoOptimize(exp, env);
  return exp;
};

ndescribe("compile: ", function() {
  describe("if and if!: ", function() {
    return it('should compile if 1 then 2 else 3', function() {
      return expect(compile("if 1 then 2 else 3")).to.have.string("2");
    });
  });
  describe("for in: ", function() {
    it('should compile for x in [ 1, 2 ] then print x', function() {
      return expect(compile('for x in [ 1 2 ] then print x')).to.have.string('var range = [1, 2], \n    length = range.length, \n    i = 0;\n\nwhile (i < length){ \n  var x = range[i++];\n  console.log(x);\n}');
    });
    return it('should compile for x j in [ 1, 2 ] then print x', function() {
      return expect(compile('for x j in [ 1 2 ] then print x')).to.have.string('var length, range = [1, 2], \n    length22 = range.length, \n    j = 0;\n\nwhile (j < length22){ \n  var x = range[j++];\n  console.log(x);\n}');
    });
  });
  return describe("function: ", function() {
    iit('should compile -> 1', function() {
      return expect(compile('-> 1')).to.have.string("(function () {\n  return 1;\n})");
    });
    it('should compile let f = -> 1 then f()', function() {
      return expect(compile('let f = -> 1 then f()')).to.have.string("var f = function () {\n  return 1;\n};\nf()");
    });
    it('should compile {-> 1}()', function() {
      return expect(compile('{-> 1}()')).to.have.string("(function () {\n  return 1;\n})()");
    });
    return it('should compile ->', function() {
      return expect(compile('->')).to.have.string("(function () {})");
    });
  });
});
