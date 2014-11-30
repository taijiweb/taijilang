var INDENT, NEWLINE, Parser, SPACE, SYMBOL, VALUE, assert, chai, head, lib, norm, realCode, str, taiji, _ref, _ref1;

chai = require("chai");

exports.expect = chai.expect;

exports.iit = it.only;

exports.idescribe = describe.only;

exports.ndescribe = function() {};

exports.nit = function() {};

lib = '../lib/';

_ref = require(lib + 'utils'), str = _ref.str, assert = _ref.assert;

Parser = require(lib + 'parser').Parser;

taiji = require(lib + 'taiji');

realCode = require(lib + 'utils').realCode;

exports.str = str;

_ref1 = require(lib + 'constant'), NEWLINE = _ref1.NEWLINE, INDENT = _ref1.INDENT, SPACE = _ref1.SPACE, VALUE = _ref1.VALUE, SYMBOL = _ref1.SYMBOL;

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

exports.norm = norm = function(exp) {
  var e, _i, _len, _results;
  assert(exp !== void 0, 'norm(exp) meet undefined');
  if (exp.kind) {
    return exp;
  }
  if (exp instanceof Array) {
    _results = [];
    for (_i = 0, _len = exp.length; _i < _len; _i++) {
      e = exp[_i];
      _results.push(norm(e));
    }
    return _results;
  } else if (typeof exp === 'string') {
    if (exp[0] === '"') {
      return {
        value: exp,
        kind: VALUE
      };
    } else {
      return {
        value: exp,
        kind: SYMBOL
      };
    }
  } else if (typeof exp === 'object' && (exp.kind == null)) {
    exp.kind = SYMBOL;
    return exp;
  } else {
    return {
      value: exp,
      kind: VALUE
    };
  }
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
