var chai, evaltj, expect, idescribe, iit, lib, ndescribe, taiji;

chai = require("chai");

expect = chai.expect;

iit = it.only;

idescribe = describe.only;

ndescribe = function() {};

lib = '../lib/';

taiji = require(lib + 'taiji');

evaltj = function(code) {
  var head;
  head = 'taiji language 0.1\n';
  return taiji["eval"](head + code, taiji.rootModule, taiji.builtins, {});
};

ndescribe("eval: ", function() {
  describe("eval simple: ", function() {
    it('should eval 1', function() {
      return expect(evaltj('1')).to.equal(1);
    });
    it('should eval \'a\'', function() {
      return expect(evaltj("'a'")).to.equal('a');
    });
    it('should eval if 1 then 2', function() {
      return expect(evaltj("if 1 then 2")).to.equal(2);
    });
    it('should eval ~ 2', function() {
      return expect(evaltj("~ 2")).to.equal(2);
    });
    return it('should eval 1+1', function() {
      return expect(evaltj("1+1")).to.equal(2);
    });
  });
  describe("statement: ", function() {
    it('should eval a=1', function() {
      return expect(evaltj("a=1")).to.equal(1);
    });
    it('should eval a=1; a+a', function() {
      return expect(evaltj("a=1; a+a")).to.equal(2);
    });
    return it('should eval let a=1 then let a = 2 then a+a', function() {
      return expect(evaltj("let a=1 then let a = 2 then a+a")).to.equal(4);
    });
  });
  return describe("eval 2", function() {
    return it('should eval "a"', function() {
      return expect(evaltj('"a"')).to.equal('a');
    });
  });
});
