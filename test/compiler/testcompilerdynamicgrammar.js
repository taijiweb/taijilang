var Parser, chai, compile, compileNoOptimize, constant, expect, idescribe, iit, isArray, lib, nit, realCode, str, taiji, _ref;

chai = require("chai");

expect = chai.expect;

iit = it.only;

idescribe = describe.only;

nit = function() {};

lib = '../../lib/';

Parser = require(lib + 'parser').Parser;

_ref = require(lib + 'parser/base'), constant = _ref.constant, isArray = _ref.isArray, str = _ref.str;

taiji = require(lib + 'taiji');

realCode = require(lib + 'utils').realCode;

compile = function(code) {
  var head;
  head = 'taiji language 0.1\n';
  return realCode(taiji.compile(head + code, taiji.rootModule, taiji.builtins, {}));
};

compileNoOptimize = function(code) {
  var head;
  head = 'taiji language 0.1\n';
  return realCode(taiji.compileNoOptimize(head + code, taiji.rootModule, taiji.builtins, {}));
};

describe("compile dyanmic syntax: ", function() {
  describe("compile parser attribute: ", function() {
    it('should compile ?xyz[0]()', function() {
      return expect(compile('?xyz[0]()')).to.have.string("__$taiji_$_$parser__.xyz[0]()");
    });
    it('should compile ?cursor', function() {
      return expect(compile('?cursor')).to.have.string("__$taiji_$_$parser__.cursor");
    });
    return it('should compile ?char()', function() {
      return expect(compile('?char()')).to.have.string("__$taiji_$_$parser__.char()");
    });
  });
  describe("parsing time evaluation: ", function() {
    it('should compile ?? 1', function() {
      return expect(compile('?? 1')).to.have.string("1");
    });
    it('should compile ?? ?cursor()', function() {
      return expect(compile('?? ?cursor()')).to.have.string("31");
    });
    return it('should compile ?? ?clause()', function() {
      return expect(compile('?? ?clause(), 1')).to.have.string("1");
    });
  });
  describe("parsing time evaluation macro ?/: ", function() {
    it('should compile ?/ cursor', function() {
      return expect(compile('?/ cursor')).to.have.string("function () {\n    return cursor;\n  }");
    });
    it('should compile ?/ cursor', function() {
      return expect(compile('?/ cursor()')).to.have.string("30");
    });
    it('should compile ?/ clause(), 1', function() {
      return expect(compile('?/ clause(), 1')).to.have.string("1");
    });
    return it('should compile ?/ clause(), 1', function() {
      return expect(compile('?/ clause(), print 1')).to.have.string("console.log(1)");
    });
  });
  describe("macro ?! used by ?!: ", function() {
    it('should compile ?! cursor()', function() {
      return expect(compile('?! cursor()')).to.have.string("30");
    });
    return it('should compile ?! char()', function() {
      return expect(compile('?! char()')).to.have.string("true");
    });
  });
  return describe("?-then statement: ", function() {
    return nit('should compile ? xyz then x = abc', function() {
      return expect(compile('? xyz then x = abc')).to.have.string("[? [xyz] [then \"= x abc\"]]");
    });
  });
});
