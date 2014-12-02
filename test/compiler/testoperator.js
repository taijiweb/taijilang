var Parser, compile, expect, idescribe, iit, lib, matchRule, ndescribe, nit, noOptCompile, nonMetaCompileExpNoOptimize, parse, parseClause, str, taiji, _ref;

_ref = require('../util'), expect = _ref.expect, idescribe = _ref.idescribe, ndescribe = _ref.ndescribe, iit = _ref.iit, nit = _ref.nit, matchRule = _ref.matchRule, parse = _ref.parse, compile = _ref.compile;

lib = '../../lib/';

str = require(lib + 'utils').str;

Parser = require(lib + 'parser').Parser;

taiji = require(lib + 'taiji');

nonMetaCompileExpNoOptimize = require(lib + 'compiler').nonMetaCompileExpNoOptimize;

parse = function(text) {
  var parser, x;
  parser = new Parser();
  return x = parser.parse(text, parser.module, 0);
};

parseClause = function(text) {
  var parser, x;
  parser = new Parser();
  x = parser.parse(text, matchRule(parser, parser.clause), 0);
  return str(x);
};

compile = noOptCompile = function(text) {
  var env, exp;
  exp = parse(text);
  env = taiji.initEnv(taiji.builtins, taiji.rootModule, {});
  exp = nonMetaCompileExpNoOptimize(exp, env);
  return exp;
};

ndescribe("compile operator expression: ", function() {
  describe("atom: ", function() {
    it("compile 1", function() {
      return expect(compile('1')).to.have.string('1');
    });
    it("compile var a; a", function() {
      return expect(compile('var a; a')).to.have.string("var a;\na");
    });
    it("compile extern! a; a", function() {
      return expect(compile('extern! a; a')).to.have.string("a");
    });
    it("compile 'a'", function() {
      return expect(compile("'a'")).to.have.string('\'a\'');
    });
    return it('compile "a"', function() {
      return expect(compile('"a"')).to.have.string('"a"');
    });
  });
  describe("prefix: ", function() {
    return it('should compile +1', function() {
      return expect(compile('+1 ')).to.have.string("1");
    });
  });
  describe("attribute: ", function() {
    return it('should compile console.log', function() {
      return expect(compile('console.log')).to.have.string("console.log");
    });
  });
  ndescribe("multi lines and indent expression", function() {
    it("compile 1+2\n*3", function() {
      return expect(compile('(1+2\n*3)')).to.have.string('9');
    });
    it("compile 1+2\n* 3", function() {
      return expect(compile('(1+2\n* 3)')).to.have.string('9');
    });
    it("compile 1+2\n* 3+6", function() {
      return expect(compile('(1+2\n* 3+6)')).to.have.string('27');
    });
    it("compile 1+2\n * 3+6", function() {
      return expect(compile('(1+2\n * 3+6)')).to.have.string('27');
    });
    it("compile 1+2\n * 3+6\n + 5+8", function() {
      return expect(compile('(1+2\n * 3+6\n + 5+8)')).to.have.string("66");
    });
    return it("compile 1+2\n+4\n*3", function() {
      return expect(compile('(1+2\n+4\n*3)')).to.have.string('21');
    });
  });
  describe("add and multiply", function() {
    it("compile 1+2", function() {
      return expect(compile('1+2')).to.have.string('1 + 2');
    });
    it("compile (1,2)", function() {
      return expect(compile('(1,2)')).to.have.string('[1, 2]');
    });
    it("compile (1+2)", function() {
      return expect(compile('(1+2)')).to.have.string('1 + 2');
    });
    it("compile (1, 2+3)", function() {
      return expect(compile('(1, 2+3)')).to.have.string('[1, 2 + 3]');
    });
    return it("compile (1)", function() {
      return expect(compile('(1)')).to.have.string('1');
    });
  });
  describe("attribute, index", function() {
    it("compile a.b", function() {
      return expect(compile('var a; a.b')).to.have.string("var a;\na.b");
    });
    it("compile a . b", function() {
      return expect(compile('var a; (a . b)')).to.have.string("var a;\na.b");
    });
    it("compile a[1]", function() {
      return expect(compile('var a; a[1]')).to.have.string("var a;\na[1]");
    });
    it("compile (a [1])", function() {
      return expect(function() {
        return compile('(a [1])');
      }).to["throw"](/expect /);
    });
    it("compile a[1][2]", function() {
      return expect(compile('var a; a[1][2]')).to.have.string("var a;\na[1][2]");
    });
    return it("compile require.extensions[\".tj\"]", function() {
      return expect(compile('require.extensions[".tj"]')).to.have.string("require.extensions[\".tj\"]");
    });
  });
  describe("call: ", function() {
    it("compile a()", function() {
      return expect(compile('var a; a()')).to.have.string("var a;\na()");
    });
    it("compile a(1)", function() {
      return expect(compile('var a; a(1)')).to.have.string("var a;\na(1)");
    });
    it("parse a(1 , 2)", function() {
      return expect(str(parse('a(1 , 2)'))).to.have.string('[binary! concat() a [() [1 2]]]');
    });
    it("compile a(1 , 2, 3)", function() {
      return expect(compile('var a; a(1 , 2, 3)')).to.have.string('var a;\na(1, 2, 3)');
    });
    it("compile a(1 , 2)", function() {
      return expect(compile('var a; a(1 , 2)')).to.have.string("var a;\na(1, 2)");
    });
    it("compile a.b(1)", function() {
      return expect(compile('var a; a.b(1)')).to.have.string("var a;\na.b(1)");
    });
    return it("compile a['b'](1)", function() {
      return expect(compile("var a; a['b'](1)")).to.have.string('var a;\na[\'b\'](1)');
    });
  });
  describe("unquote: ", function() {
    it("compile ^a", function() {
      return expect(function() {
        return compile('^a');
      }).to["throw"](/unexpected /);
    });
    it("compile ^&a", function() {
      return expect(function() {
        return compile('^&a');
      }).to["throw"](/unexpected /);
    });
    return it("compile ^& a", function() {
      return expect(function() {
        return compile('^& a');
      }).to["throw"](/unexpected /);
    });
  });
  describe("comma expression", function() {
    it("compile 1 , 2", function() {
      return expect(compile('1 , 2')).to.have.string("2");
    });
    return it("compile 1 , 2 , 3", function() {
      return expect(compile('1 , 2 , 3')).to.have.string("3");
    });
  });
  return describe("assign and right assocciation ", function() {
    it("compile a=1", function() {
      return expect(compile('a=1')).to.have.string('var a;\na = 1;\na');
    });
    it("compile a = 1", function() {
      expect(str(parse('a = 1'))).to.have.string('[= a 1]');
      return expect(compile('a = 1')).to.have.string('var a;\na = 1;\na');
    });
    return it("compile a = b = 1", function() {
      return expect(compile('a = b = 1')).to.have.string('var a;\nvar b;\nb = 1;\na = b;\na');
    });
  });
});
