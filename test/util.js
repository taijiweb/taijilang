var INDENT, NEWLINE, Parser, SPACE, chai, head, lib, realCode, str, taiji, _ref;

chai = require("chai");

exports.expect = chai.expect;

exports.iit = it.only;

exports.idescribe = describe.only;

exports.ndescribe = function() {};

exports.nit = function() {};

lib = '../lib/';

str = require(lib + 'utils').str;

Parser = require(lib + 'parser').Parser;

taiji = require(lib + 'taiji');

realCode = require(lib + 'utils').realCode;

exports.str = str;

_ref = require(lib + 'constant'), NEWLINE = _ref.NEWLINE, INDENT = _ref.INDENT, SPACE = _ref.SPACE;

exports.matchRule = function(parser, rule) {
  return function() {
    var token;
    token = parser.nextToken();
    if (token.type === NEWLINE) {
      parser.nextToken();
    }
    if (token.type === SPACE) {
      parser.nextToken();
    }
    return rule();
  };
};

head = 'taiji language 0.1\n';

exports.parse = function(text) {
  var parser, x;
  parser = new Parser();
  return x = parser.parse(head + text, parser.module, 0);
};

exports.compile = function(code) {
  head = 'taiji language 0.1\n';
  return realCode(taiji.compile(head + code, taiji.rootModule, taiji.builtins, {}));
};

exports.compileNoOptimize = function(code) {
  head = 'taiji language 0.1\n';
  return realCode(taiji.compileNoOptimize(head + code, taiji.rootModule, taiji.builtins, {}));
};

exports.expectCompile = function(srcCode, result) {
  return expect(compile(srcCode)).to.have.string(result);
};

exports.itCompile = function(srcCode, result) {
  return it('should compile' + srcCode, function() {
    return expectCompile(srcCode, result);
  });
};

exports.iitCompile = function(srcCode, result) {
  return iit('should compile ' + srcCode, function() {
    return expectCompile(srcCode, result);
  });
};

exports.expectParse = function(srcCode, result) {
  return expect(parse(srcCode)).to.have.string(result);
};

exports.itParse = function(srcCode, result) {
  return it('should parse' + srcCode, function() {
    return expectParse(srcCode, result);
  });
};

exports.iitParse = function(srcCode, result) {
  return iit('should parse ' + srcCode, function() {
    return expectParse(srcCode, result);
  });
};
