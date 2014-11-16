var Environment, builtins, compile, compileExp, compileExpNoOptimize, compileNoOptimize, compiler, expect, extend, idescribe, iit, initEnv, lib, ndescribe, nit, rootModule, textizerOptions, transform, _ref, _ref1, _ref2;

_ref = require('../util'), expect = _ref.expect, idescribe = _ref.idescribe, ndescribe = _ref.ndescribe, iit = _ref.iit, nit = _ref.nit;

lib = '../../lib/';

_ref1 = require(lib + 'taiji'), Environment = _ref1.Environment, textizerOptions = _ref1.textizerOptions, builtins = _ref1.builtins, initEnv = _ref1.initEnv, rootModule = _ref1.rootModule;

_ref2 = compiler = require(lib + 'compiler'), compileExp = _ref2.compileExp, compileExpNoOptimize = _ref2.compileExpNoOptimize;

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

ndescribe("compile expression: ", function() {
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
