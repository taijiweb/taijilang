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

describe("compile operator expression: ", function() {
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
    it('should compile +1', function() {
      return expect(compile('+1 ')).to.have.string("1");
    });
    it('should compile print', function() {
      return expect(compile('print()')).to.have.string("console.log(1)");
    });
    return it('should compile print +1', function() {
      return expect(compile('print +1 ')).to.have.string("console.log(1)");
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
      return expect(compile('(1,2)')).to.have.string('1 + 2');
    });
    it("compile (1+2)", function() {
      return expect(compile('(1+2)')).to.have.string("3");
    });
    it("compile 1+ 2", function() {
      return expect(function() {
        return compile('(1+ 2)');
      }).to["throw"](/unexpected spaces or new lines after binary operator/);
    });
    it("compile 1+ 2*3", function() {
      return expect(function() {
        return compile('(1+ 2*3)');
      }).to["throw"](/unexpected spaces or new lines after binary operator/);
    });
    it("compile (1, 2)", function() {
      return expect(compile('(1, 2)')).to.have.string("[1, 2]");
    });
    it("compile (1, 2+3)", function() {
      return expect(compile('(1, 2+3)')).to.have.string("[1, 5]");
    });
    it("compile (1,2 + 3)", function() {
      return expect(compile('(1,2 + 3)')).to.have.string("[1, 2] + 3");
    });
    it("compile (1 +2)", function() {
      return expect(function() {
        return compile('(1 +2)');
      }).to["throw"](/should have spaces at its right side/);
    });
    it("compile (1+2 * 3)", function() {
      return expect(compile('(1+2 * 3)')).to.have.string('9');
    });
    it("compile (1 + 2*3)", function() {
      return expect(compile('(1 + 2*3)')).to.have.string('7');
    });
    it("compile (1+2+3)", function() {
      return expect(compile('1+2+3')).to.have.string("6");
    });
    it("compile (1 + 2+3)", function() {
      return expect(compile('(1 + 2+3)')).to.have.string("6");
    });
    it("compile (1+2*3)", function() {
      return expect(compile('1+2*3')).to.have.string("7");
    });
    it("compile 1*2+3", function() {
      return expect(compile('1*2+3')).to.have.string("5");
    });
    it("compile 1*(2+3)", function() {
      return expect(compile('1*(2+3)')).to.have.string("5");
    });
    it("compile (1)", function() {
      return expect(compile('(1)')).to.have.string('1');
    });
    return it("compile (1+2)*(3+4)", function() {
      return expect(compile('(1+2)*(3+4)')).to.have.string("21");
    });
  });
  describe("attribute, index", function() {
    it("compile a.b", function() {
      return expect(compile('var a; a.b')).to.have.string("var a;\na.b");
    });
    it("compile a . b", function() {
      return expect(compile('var a; (a . b)')).to.have.string("var a;\na.b");
    });
    nit("compile a&/b", function() {
      return expect(compile('var a, b; a&/b')).to.have.string("var a, b;\na[b]");
    });
    nit("compile a&/1", function() {
      return expect(compile('var a; a&/1')).to.have.string("var a;\na[1]");
    });
    nit("compile a&/(1)", function() {
      return expect(compile('var a; a&/(1)')).to.have.string("var a;\na[1]");
    });
    nit("compile a&/(1,2)", function() {
      return expect(compile('var a; a&/(1,2)')).to.have.string("var a;\na[[1, 2]]");
    });
    nit("compile '1'&/1", function() {
      return expect(compile("'1'&/1")).to.have.string("\"1\"[1]");
    });
    nit("compile '1'&/(1,2)", function() {
      return expect(compile("'1'&/(1,2)")).to.have.string("\"1\"[[1, 2]]");
    });
    it("compile a[1]", function() {
      return expect(compile('var a; a[1]')).to.have.string("var a;\na[1]");
    });
    it("compile a [1]", function() {
      return expect(function() {
        return compile('(a [1])');
      }).to["throw"](/subscript should tightly close to left operand/);
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
      return expect(str(parse('a(1 , 2)'))).to.have.string('[binary! concat() a [() [binary! , 1 2]]]');
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
    it("compile a['b'](1)", function() {
      return expect(compile("var a; a['b'](1)")).to.have.string("var a;\na[\"b\"](1)");
    });
    it("compile a(1, x..., 2, y..., z)", function() {
      return expect(compile('var a, x, y, z; a(1, x..., 2, y..., z)')).to.have.string("var a, x, y, z;\na.apply(null, [1].concat(x).concat([2]).concat(y).concat([z]))");
    });
    it("compile a.f(1, x..., 2, y..., z)", function() {
      return expect(compile('var f, a, x, y, z; a.f(1, x..., 2, y..., z)')).to.have.string("var f, a, x, y, z;\na.f.apply(a, [1].concat(x).concat([2]).concat(y).concat([z]))");
    });
    it("compile a.f(1, arguments...)", function() {
      return expect(compile('var f, a, x, y, z; a.f(1, arguments...)')).to.have.string("var f, a, x, y, z;\na.f.apply(a, [1].concat([].slice(arguments)))");
    });
    return it("compile a(1 , 2 , 3)", function() {
      return expect(compile('var a; a(1 , 2 , 3)')).to.have.string("var a;\na(1, 2, 3)");
    });
  });
  describe("unquote: ", function() {
    it("compile ^a", function() {
      return expect(function() {
        return compile('^a');
      }).to["throw"](/unexpected unquote/);
    });
    it("compile ^&a", function() {
      return expect(function() {
        return compile('^&a');
      }).to["throw"](/unexpected unquote-splice/);
    });
    return it("compile ^& a", function() {
      return expect(function() {
        return compile('^& a');
      }).to["throw"](/unexpected unquote-splice/);
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
  describe("assign and right assocciation ", function() {
    it("compile a=1", function() {
      return expect(compile('a=1')).to.have.string('var a;\na = 1;\na');
    });
    it("compile a = 1", function() {
      expect(str(parse('a = 1'))).to.have.string('[= a 1]');
      return expect(compile('a = 1')).to.have.string('var a;\na = 1;\na');
    });
    iit("compile a = b = 1", function() {
      return expect(compile('a = b = 1')).to.have.string('var a;\nvar b;\nb = 1;\na = b;\na');
    });
    return it("compile a += b = 1", function() {
      return expect(compile('var a; a += b = 1')).to.have.string("var a, b = 1;\na += b");
    });
  });
  return ndescribe("ternary, i.e. condition expression", function() {
    it("compile 1 ?  2 :  3", function() {
      return expect(compile('(1 ?  2 :  3)')).to.have.string("1? 2: 3");
    });
    it("compile 1 ?  (a = 3) :  (b = 4)", function() {
      return expect(compile('(1 ?  (a = 3) :  (b = 4))')).to.have.string("var t, a = 3;\nt = a;\nt");
    });
    it("compile 1 ?  (a = 3) :  (b = 4)", function() {
      return expect(compile('var x; (x ?  (a = 3) :  (b = 4))')).to.have.string("var x, t;\n\nif (x){ \n  var a = 3;\n  t = a;\n}\nelse { \n  var b = 4;\n  t = b;\n};\nt");
    });
    it("compile a = (1 ?  2 :  3)", function() {
      return expect(compile('a = (1 ?  2 :  3)')).to.have.string("var a = 1? 2: 3;\na");
    });
    return it("compile (a = (1 ?  2 :  3))", function() {
      return expect(compile('(a = (1 ?  2 :  3))')).to.have.string("var a = 1? 2: 3;\na");
    });
  });
});
