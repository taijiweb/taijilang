var Environment, builtins, chai, compile, compileExp, compileExpNoOptimize, compileNoOptimize, compiler, expect, extend, idescribe, iit, initEnv, lib, ndescribe, nit, rootModule, textizerOptions, transform, _ref, _ref1;

chai = require("chai");

expect = chai.expect;

iit = it.only;

idescribe = describe.only;

nit = ndescribe = function() {};

lib = '../../lib/';

_ref = require(lib + 'taiji'), Environment = _ref.Environment, textizerOptions = _ref.textizerOptions, builtins = _ref.builtins, initEnv = _ref.initEnv, rootModule = _ref.rootModule;

_ref1 = compiler = require(lib + 'compiler'), compileExp = _ref1.compileExp, compileExpNoOptimize = _ref1.compileExpNoOptimize;

extend = require(lib + 'utils').extend;

compile = function(exp) {
  return compileExp(exp, initEnv(builtins, rootModule, {}));
};

compileNoOptimize = function(code) {
  return compileExpNoOptimize(exp, initEnv(builtins, rootModule, {}));
};

transform = function(exp) {
  return compiler.transform(exp, initEnv(builtins, rootModule, {}));
};

describe("compile expression: ", function() {
  return describe("simple: ", function() {
    it('should compile 1', function() {
      return expect(compile(1)).to.equal('1');
    });
    it('should compile [\',\', [\'=\', \'x\',1], []]]', function() {
      return expect(compile(['binary,', ['=', 'x', 1], []])).to.equal("var x = 1;\nx, [];");
    });
    return it('should compile [\'binary,\', 1, []]', function() {
      return expect(compile(['binary,', 1, []])).to.equal("1, []");
    });
  });
});
