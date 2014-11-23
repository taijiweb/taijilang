var LIST, SYMBOL, ShiftStatementInfo, SymbolLookupError, VALUE, constant, convert, expect, idescribe, iit, lib, metaConvert, ndescribe, nit, nonMetaCompileExpNoOptimize, norm, parse, str, strConvert, strMetaConvert, strNonOptCompile, taiji, tokenize, trace, transform, transformExpression, _ref, _ref1, _ref2, _ref3;

_ref = require('../util'), expect = _ref.expect, idescribe = _ref.idescribe, ndescribe = _ref.ndescribe, iit = _ref.iit, nit = _ref.nit, strConvert = _ref.strConvert, str = _ref.str, parse = _ref.parse;

lib = '../../lib/';

_ref1 = require(lib + 'compiler/transform'), transformExpression = _ref1.transformExpression, transform = _ref1.transform, ShiftStatementInfo = _ref1.ShiftStatementInfo;

tokenize = require(lib + 'compiler/textize').tokenize;

_ref2 = require(lib + 'utils'), constant = _ref2.constant, norm = _ref2.norm, trace = _ref2.trace;

VALUE = constant.VALUE, SYMBOL = constant.SYMBOL, LIST = constant.LIST;

_ref3 = require(lib + 'compiler'), convert = _ref3.convert, metaConvert = _ref3.metaConvert, nonMetaCompileExpNoOptimize = _ref3.nonMetaCompileExpNoOptimize;

SymbolLookupError = require(lib + 'compiler/env').SymbolLookupError;

taiji = require(lib + 'taiji');

strConvert = function(exp) {
  var env;
  exp = norm(exp);
  env = taiji.initEnv(taiji.builtins, taiji.rootModule, {});
  env.metaIndex = 0;
  exp = convert(exp, env);
  return str(exp);
};

strMetaConvert = function(exp) {
  var env, metaExpList;
  exp = norm(exp);
  env = taiji.initEnv(taiji.builtins, taiji.rootModule, {});
  env.metaIndex = 0;
  exp = metaConvert(exp, metaExpList = [], env);
  return str(exp);
};

strNonOptCompile = function(exp) {
  var env;
  exp = norm(exp);
  env = taiji.initEnv(taiji.builtins, taiji.rootModule, {});
  exp = nonMetaCompileExpNoOptimize(exp, env);
  return str(exp);
};

ndescribe("test phases: ", function() {
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
      it("convert [if, 1, 1]", function() {
        return expect(strConvert(['if', 1, 1])).to.equal("[if 1 1 undefined]");
      });
      return it("convert [if, 1, 1, 2]", function() {
        return expect(strConvert(['if', 1, 1, 2])).to.equal("[if 1 1 2]");
      });
    });
    describe("convert binary!", function() {
      return it("convert ['binary!', '+', 1, 2]", function() {
        return expect(strConvert(['binary!', '+', 1, 2])).to.equal('[binary! + 1 2]');
      });
    });
    return describe("convert clause", function() {
      return it("convert ['@', 'a']", function() {
        return expect(strConvert(['begin!', ['var', 'a'], ['@', 'a']])).to.equal("[begin! [var a] [call! [jsvar! this] [a]]]");
      });
    });
  });
  describe("meta convert: ", function() {
    return describe("convert simple: ", function() {
      return it("convert 1", function() {
        return expect(strMetaConvert(1)).to.equal("[index! [jsvar! __tjExp] 0]");
      });
    });
  });
  describe("nonMetaCompileExpNoOptimize: ", function() {
    return describe("copmile simple: ", function() {
      it("copmile 1", function() {
        return expect(strNonOptCompile(1)).to.equal("1");
      });
      it("copmile '\"1\"' ", function() {
        return expect(strNonOptCompile('"1"')).to.equal("\"1\"");
      });
      return it("copmile ['binary!', '+', 1, 2] ", function() {
        return expect(strNonOptCompile(['binary!', '+', 1, 2])).to.equal("1 + 2");
      });
    });
  });
  describe("transformExpression: ", function() {
    var transformExp;
    transformExp = function(exp) {
      var env, info, result;
      env = taiji.initEnv(taiji.builtins, taiji.rootModule, {});
      info = new ShiftStatementInfo({}, {});
      return result = transformExpression(norm(exp), env, info);
    };
    it("[string! 'a']", function() {
      var result;
      result = transformExp(['string!', 'a']);
      return expect(str(result[1])).to.equal('[call! [attribute! [jsvar! JSON] stringify] [a]]');
    });
    it("[return 'a']", function() {
      var result;
      result = transformExp(['return', 'a']);
      return expect(str(result[0])).to.equal("[return a]");
    });
    it("['binary!', '+', 1, ['return', 'a']]", function() {
      var env, info, result;
      env = taiji.initEnv(taiji.builtins, taiji.rootModule, {});
      info = new ShiftStatementInfo({}, {});
      result = transformExp(['binary!', '+', 1, ['return', 'a']]);
      expect(str(result[0])).to.equal("[return a]");
      return expect(str(result[1])).to.equal("[binary! + 1 undefined]");
    });
    it("['binary!', '+', 'a', ['return', ['=', 'a', 1]]]", function() {
      var result;
      result = transformExp(['binary!', '+', 'a', ['return', ['=', 'a', 1]]]);
      expect(str(result[0])).to.equal("[begin! [var t] [= t a] [return [= a 1]]]");
      return expect(str(result[1])).to.equal("[binary! + t undefined]");
    });
    it("['binary!', '+', 'a', ['return', ['=', 'b', 1]]]", function() {
      var result;
      result = transformExp(['binary!', '+', 'a', ['return', ['=', 'b', 1]]]);
      expect(str(result[0])).to.equal("[begin! [var t] [= t a] [return [= b 1]]]");
      return expect(str(result[1])).to.equal("[binary! + t undefined]");
    });
    return it("['binary!', '+', ['=', 'a', 1], ['return', 'a']]", function() {
      var result;
      result = transformExp(['binary!', '+', ['=', 'a', 1], ['return', 'a']]);
      expect(str(result[0])).to.equal("[begin! [var t] [= t [= a 1]] [return a]]");
      return expect(str(result[1])).to.equal("[binary! + t undefined]");
    });
  });
  describe("parse, convert and transform: ", function() {
    var parseTransform;
    parseTransform = function(text) {
      var env, exp;
      trace('\r\n\r\nparseTransform: ', text);
      exp = parse(text);
      exp = exp.value[3].value[1];
      env = taiji.initEnv(taiji.builtins, taiji.rootModule, {});
      exp = convert(exp, env);
      return exp = transform(exp, env);
    };
    it("var a", function() {
      return expect(str(parseTransform("var a"))).to.equal('[begin! [var a] undefined]');
    });
    it('"a(1)"', function() {
      return expect(str(parseTransform('"a(1)"'))).to.equal("[binary! + \"a\" 1]");
    });
    it("var a; a+{return a}", function() {
      return expect(str(parseTransform("var a; a+{return a}"))).to.equal("[begin! [var a] [var t] [= t a] [return a]]");
    });
    it("var a, b; (b=a)+{return a}", function() {
      return expect(str(parseTransform("var a, b; (b=a)+{return a}"))).to.equal("[begin! [var a] [var b] [var t] [= t [= b a]] [return a]]");
    });
    it("-> 1", function() {
      return expect(str(parseTransform("-> 1"))).to.equal("[function [] [return 1]]");
    });
    it("var a; a = -> 1", function() {
      return expect(str(parseTransform("var a; a = -> 1"))).to.equal("[begin! [var a] [= a [function [] [return 1]]]]");
    });
    return it("var a; a[1] = -> 1", function() {
      return expect(str(parseTransform("var a; a[1] = -> 1"))).to.equal("[begin! [var a] [var t] [= t [function [] [return 1]]] [= [index! a 1] t] t]");
    });
  });
  return describe("tokenize: ", function() {
    var token;
    token = function(exp) {
      exp = tokenize(norm(exp), env);
      return str(exp);
    };
    return it("['begin!', ['var', 'a'], ['var', 'b']]", function() {
      return expect(str(token(['begin!', ['var', 'a'], ['var', 'b']]))).to.equal("[var a , b]");
    });
  });
});
