var Parser, chai, compile, compileNoOptimize, constant, expect, idescribe, iit, isArray, lib, str, taiji, _ref;

chai = require("chai");

expect = chai.expect;

iit = it.only;

idescribe = describe.only;

lib = '../../lib/';

Parser = require(lib + 'parser').Parser;

_ref = require(lib + 'parser/base'), constant = _ref.constant, isArray = _ref.isArray, str = _ref.str;

taiji = require(lib + 'taiji');

compile = function(code) {
  var head;
  head = 'taiji language 0.1\n';
  return taiji.compile(head + code, taiji.rootModule, taiji.builtins, {});
};

compileNoOptimize = function(code) {
  var head;
  head = 'taiji language 0.1\n';
  return taiji.compileNoOptimize(head + code, taiji.rootModule, taiji.builtins, {});
};

describe("compile dyanmic syntax: ", function() {
  describe("compile parser attribute: ", function() {
    it('should compile ?xyz[0]()', function() {
      return expect(compile('?xyz[0]()')).to.equal("__$taiji_$_$parser__.xyz[0]()");
    });
    it('should compile ?cursor', function() {
      return expect(compile('?cursor')).to.equal("__$taiji_$_$parser__.cursor");
    });
    return it('should compile ?char()', function() {
      return expect(compile('?char()')).to.equal("__$taiji_$_$parser__.char()");
    });
  });
  describe("parsing time evaluation: ", function() {
    it('should compile ?? 1', function() {
      return expect(compile('?? 1')).to.equal("1");
    });
    it('should compile ?? ?cursor()', function() {
      return expect(compile('?? ?cursor()')).to.equal("31");
    });
    return it('should compile ?? ?clause()', function() {
      return expect(compile('?? ?clause(), 1')).to.equal("1");
    });
  });
  describe("parsing time evaluation macro ?/: ", function() {
    it('should compile ?/ cursor', function() {
      return expect(compile('?/ cursor')).to.equal("function () {\n    return cursor;\n  }");
    });
    it('should compile ?/ cursor', function() {
      return expect(compile('?/ cursor()')).to.equal("30");
    });
    it('should compile ?/ clause(), 1', function() {
      return expect(compile('?/ clause(), 1')).to.equal("1");
    });
    return it('should compile ?/ clause(), 1', function() {
      return expect(compile('?/ clause(), print 1')).to.equal("console.log(1)");
    });
  });
  describe("macro ?! used by ?!: ", function() {
    it('should compile ?! cursor()', function() {
      return expect(compile('?! cursor()')).to.equal("30");
    });
    return it('should compile ?! char()', function() {
      return expect(compile('?! char()')).to.equal("true");
    });
  });
  return describe("?-then statement: ", function() {
    return xit('should compile ? xyz then x = abc', function() {
      return expect(compile('? xyz then x = abc')).to.equal("[? [xyz] [then \"= x abc\"]]");
    });
  });
});
