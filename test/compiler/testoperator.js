var Parser, compile, compileNoOptimize, constant, expect, idescribe, iit, isArray, lib, ndescribe, nit, realCode, str, taiji, _ref, _ref1;

_ref = require('../utils'), expect = _ref.expect, idescribe = _ref.idescribe, ndescribe = _ref.ndescribe, iit = _ref.iit, nit = _ref.nit;

lib = '../../lib/';

_ref1 = require(lib + 'utils'), constant = _ref1.constant, isArray = _ref1.isArray, str = _ref1.str, realCode = _ref1.realCode;

Parser = require(lib + 'parser').Parser;

taiji = require(lib + 'taiji');

compile = function(code) {
  var head;
  head = 'taiji language 0.1\n';
  return realCode(taiji.compile(head + code, taiji.rootModule, taiji.builtins, {}));
};

compileNoOptimize = function(code) {
  var head;
  head = 'taiji language 0.1\n';
  return realCode(taiji.compileNoOptimize(head + code, taiji.rootModule, taiji.builtins, {}));
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
      return expect(compile("'a'")).to.have.string("\"a\"");
    });
    return it('compile "a"', function() {
      return expect(compile('"a"')).to.have.string("\"a\"");
    });
  });
  describe("prefix: ", function() {
    it('should compile + 1', function() {
      return expect(compile('+ 1 ')).to.have.string("1");
    });
    it('should compile ( + + 1)', function() {
      return expect(compile('( + + 1) ')).to.have.string("1");
    });
    it('should compile console.log', function() {
      return expect(compile('console.log')).to.have.string("console.log");
    });
    it('should compile print 1', function() {
      return expect(compile('print 1 ')).to.have.string("console.log(1)");
    });
    return it('should compile print +1', function() {
      return expect(compile('print +1 ')).to.have.string("console.log(1)");
    });
  });
  describe("multi lines and indent expression", function() {
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
    it("compile a(1)", function() {
      return expect(compile('var a; a(1)')).to.have.string("var a;\na(1)");
    });
    it("compile a.b(1)", function() {
      return expect(compile('var a; a.b(1)')).to.have.string("var a;\na.b(1)");
    });
    it("compile a['b'](1)", function() {
      return expect(compile("var a; a['b'](1)")).to.have.string("var a;\na[\"b\"](1)");
    });
    it("compile a(1 , 2)", function() {
      return expect(compile('var a; a(1 , 2)')).to.have.string("var a;\na(1, 2)");
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
      return expect(compile('a=1')).to.have.string("var a = 1;\na");
    });
    it("compile a = 1", function() {
      return expect(compile('a = 1')).to.have.string("var a = 1;\na");
    });
    it("compile a = b = 1", function() {
      return expect(compile('a = b = 1')).to.have.string("var a, b = 1;\na = b;\na");
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
