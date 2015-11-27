var baseFileName, chai, expect, idescribe, iit, isTaiji, lib, ndescribe, utils, _ref;

chai = require("chai");

expect = chai.expect;

iit = it.only;

idescribe = describe.only;

ndescribe = function() {};

lib = '../lib/';

_ref = utils = require(lib + 'utils'), isTaiji = _ref.isTaiji, baseFileName = _ref.baseFileName;

describe("utils.coffee: ", function() {
  describe("isTaiji filename: ", function() {
    it(' 1.tj', function() {
      return expect(isTaiji('1.tj')).to.equal(true);
    });
    it(' 1.taiji', function() {
      return expect(isTaiji('1.taiji')).to.equal(true);
    });
    it(' 1.TAIJI', function() {
      return expect(isTaiji('1.TAIJI')).to.equal(false);
    });
    it(' 1.taiji.json', function() {
      return expect(isTaiji('1.taiji.json')).to.equal(true);
    });
    return it(' 1.tj.json', function() {
      return expect(isTaiji('1.tj.json')).to.equal(true);
    });
  });
  return describe(" baseFileName: ", function() {
    it(' 1.tj', function() {
      return expect(baseFileName('1.tj', true)).to.equal('1');
    });
    it(' x\\1.tj', function() {
      return expect(baseFileName('x\\1.tj', true, true)).to.equal('1');
    });
    it(' 1.taiji', function() {
      return expect(baseFileName('1.taiji', true)).to.equal('1');
    });
    it(' x\\1.taiji', function() {
      return expect(baseFileName('x\\1.taiji', true, true)).to.equal('1');
    });
    it(' x//1.taiji', function() {
      return expect(baseFileName('x//1.taiji', true)).to.equal('1');
    });
    it(' 1.taiji.json', function() {
      return expect(baseFileName('1.taiji.json', true)).to.equal('1');
    });
    return it(' 1.tj.json', function() {
      return expect(baseFileName('1.tj.json', true)).to.equal('1');
    });
  });
});
