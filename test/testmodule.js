var Parser, TaijiModule, chai, compile, constant, expect, idescribe, iit, isArray, lib, ndescribe, nit, path, realCode, str, taiji, _ref;

chai = require("chai");

expect = chai.expect;

iit = it.only;

idescribe = describe.only;

ndescribe = function() {};

nit = function() {};

path = require('path');

lib = '../lib/';

Parser = require(lib + 'parser').Parser;

_ref = require(lib + 'parser/base'), constant = _ref.constant, isArray = _ref.isArray, str = _ref.str;

require(lib + 'compiler/compile');

taiji = require(lib + 'taiji');

TaijiModule = require(lib + 'module');

realCode = require(lib + 'utils').realCode;

compile = function(code) {
  var head;
  head = 'taiji language 0.1\n';
  return realCode(taiji.compile(head + code, taiji.rootModule, taiji.builtins, {}));
};

describe("taiji module: ", function() {
  describe("path: ", function() {
    it('__dirname', function() {
      return expect(__dirname).to.match(/test/);
    });
    it('__filename', function() {
      return expect(__filename).to.match(/test\\testmodule.js/);
    });
    it('process.cwd', function() {
      return expect(process.cwd()).to.match(/taijilang/);
    });
    it('process.execPath', function() {
      return expect(process.execPath).to.match(/nodejs\\node/);
    });
    it('process.execArgv', function() {
      return expect(process.execArgv).to.deep.equal([]);
    });
    return it('process.env', function() {
      expect(process.env['TAIJILANG_PATH']).to.match(/taijilang/);
      return expect(process.env['taijilang_path']).to.match(/taijilang/);
    });
  });
  describe('new module: ', function() {
    var taijiModule;
    taijiModule = new TaijiModule('f:\\taijilang\\lib\\taiji.tj', null);
    it('new TaijiModule', function() {
      expect(taijiModule.basePath).to.match(/lib/);
      return expect(str(taijiModule.modulePaths)).to.match(/taiji-libraries/);
    });
    return it('should findPath', function() {
      var childModule;
      childModule = new TaijiModule('f:\\taijilang\\samples\\hello.tj', taijiModule);
      expect(childModule.basePath).to.equal('f:\\taijilang\\samples');
      expect(childModule.findPath('.\\sample.tj')).to.equal('f:\\taijilang\\samples\\sample.tj');
      return expect(childModule.findPath('html.tj')).to.equal('f:\\taijilang\\taiji-libraries\\html.tj');
    });
  });
  return describe('include!', function() {
    return it('include! "./hello.tj"', function() {
      return expect(compile("include! '../samples/hello.tj'")).to.have.string("var name, module = function () {\n  var exports = { };\n  console.log(\"hello taiji\");\n  return exports;\n}();\n\nfor (name in module)\n  if (__hasProp.call(module, name))\n    name = module[name]");
    });
  });
});
