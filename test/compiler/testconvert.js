var LIST, SYMBOL, SymbolLookupError, VALUE, constant, convert, env, expect, idescribe, iit, isMetaOperation, lib, makeExpression, metaConvert, ndescribe, nit, str, strConvert, strMetaConvert, taiji, _ref, _ref1;

_ref = require('../utils'), expect = _ref.expect, idescribe = _ref.idescribe, ndescribe = _ref.ndescribe, iit = _ref.iit, nit = _ref.nit, strConvert = _ref.strConvert, str = _ref.str;

lib = '../../lib/';

constant = require(lib + 'utils').constant;

VALUE = constant.VALUE, SYMBOL = constant.SYMBOL, LIST = constant.LIST;

_ref1 = require(lib + 'compiler'), convert = _ref1.convert, metaConvert = _ref1.metaConvert;

SymbolLookupError = require(lib + 'compiler/env').SymbolLookupError;

taiji = require(lib + 'taiji');

env = taiji.initEnv(taiji.builtins, taiji.rootModule, {});

isMetaOperation = isMetaOperation = function(head) {
  return (head[0] === '#' && head[1] !== '-') || head === 'include!' || head === 'import!' || head === 'export!';
};

makeExpression = function(exp) {
  var e;
  if (exp instanceof Array) {
    exp = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = exp.length; _i < _len; _i++) {
        e = exp[_i];
        _results.push(makeExpression(e));
      }
      return _results;
    })();
    exp.kind = LIST;
    return exp;
  } else if (typeof exp === 'string') {
    if (exp[0] === '"') {
      return {
        value: exp,
        kind: VALUE
      };
    } else {
      if (isMetaOperation(exp)) {
        return {
          value: exp,
          kind: SYMBOL,
          meta: true
        };
      } else {
        return {
          value: exp,
          kind: SYMBOL
        };
      }
    }
  } else if (typeof exp === 'object') {
    return exp;
  } else {
    return {
      value: exp,
      kind: VALUE
    };
  }
};

strConvert = function(exp) {
  exp = makeExpression(exp);
  exp = convert(exp, env);
  return str(exp);
};

strMetaConvert = function(exp) {
  var metaExpList;
  exp = makeExpression(exp);
  exp = metaConvert(exp, metaExpList = [], env);
  return str(exp);
};

describe("convert: ", function() {
  describe("convert simple: ", function() {
    it("convert 1", function() {
      return expect(strConvert(1)).to.equal('1');
    });
    it('convert \'"hello"\' ', function() {
      return expect(strConvert('"hello"')).to.equal("\"hello\"");
    });
    return it('convert \'x\' ', function() {
      return expect(function() {
        return strConvert('x');
      }).to["throw"](SymbolLookupError);
    });
  });
  describe("convert if: ", function() {
    it("convert [if, 1, [1]]", function() {
      return expect(strConvert(['if', 1, [1]])).to.equal("[if 1 [1]]");
    });
    return it("convert [if, 1, [1], [2]]", function() {
      return expect(strConvert(['if', 1, [1], [2]])).to.equal("[if 1 [1] [2]]");
    });
  });
  return describe("convert binary!", function() {
    return it("convert ['binary!', '+', 1, 2]", function() {
      return expect(strConvert(['binary!', '+', 1, 2])).to.equal('[binary! + 1 2]');
    });
  });
});

describe("meta convert: ", function() {
  return describe("convert simple: ", function() {
    return it("convert 1", function() {
      return expect(strMetaConvert(1)).to.equal('1');
    });
  });
});
