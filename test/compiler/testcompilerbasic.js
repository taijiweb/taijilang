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

ndescribe("compiler basic: ", function() {
  describe("compile value: ", function() {
    it("compile 1", function() {
      return expect(compile('1')).to.have.string("1");
    });
    it("compile 01", function() {
      return expect(compile('01')).to.have.string('1');
    });
    it("compile 0x01", function() {
      return expect(compile('0x01')).to.have.string('1');
    });
    it("compile 0xa", function() {
      return expect(compile('0xa')).to.have.string('0xa');
    });
    return it("compile a", function() {
      return expect(compile('"a"')).to.have.string("\"a\"");
    });
  });
  describe("parenthesis: ", function() {
    it('should compile ()', function() {
      return expect(compile('()')).to.have.string('');
    });
    it('should compile (a)', function() {
      return expect(compile('var a; (a)')).to.have.string('var a;\na');
    });
    it('should compile (a,b)', function() {
      return expect(compile('var a; var b; (a,b)')).to.have.string('var a;\nvar b;\n[a, b]');
    });
    return it('should compile (1,2)', function() {
      return expect(compile('(1,2)')).to.have.string('[1, 2]');
    });
  });
  ndescribe("quote expression:", function() {
    return describe("quote expression:", function() {
      it('should compile ~ a.b', function() {
        return expect(compile('~ a.b')).to.have.string("[\"attribute!\",\"a\",\"b\"]");
      });
      it('should compile ~ print a b', function() {
        return expect(compile('~ print a b')).to.have.string("[\"print\",\"a\",\"b\"]");
      });
      it('should compile ` print a b', function() {
        return expect(compile('` print a b')).to.have.string("[\"print\", \"a\", \"b\"]");
      });
      it('should compile ~ print : min a \n abs b', function() {
        return expect(compile('~ print : min a \n abs b')).to.have.string("[\"print\",[\"min\",\"a\",[\"abs\",\"b\"]]]");
      });
      return it('should compile ` a.b', function() {
        return expect(compile('` a.b')).to.have.string("[\"attribute!\", \"a\", \"b\"]");
      });
    });
  });
  return ndescribe("unquote expression:", function() {
    describe("unquote expression: ", function() {
      it('should compile ` ^ a.b', function() {
        return expect(compile('var a; ` ^ a.b')).to.have.string('var a;\na.b');
      });
      it('should compile ` ^ [print a b]', function() {
        return expect(compile('var a, b; ` ^ [print a b]')).to.have.string("var a, b;\n[console.log(a, b)]");
      });
      it('should compile ` ^ {print a b}', function() {
        return expect(compile('var a, b; ` ^ {print a b}')).to.have.string("var a, b;\nconsole.log(a, b)");
      });
      it('should compile ` ^ print a b', function() {
        return expect(compile('var a, b; ` ^ print a b')).to.have.string("var a, b;\nconsole.log(a, b)");
      });
      return it('should compile ` ^.~print a b', function() {
        return expect(compile('` ^.~print a b')).to.have.string("[\"print\", \"a\", \"b\"]");
      });
    });
    return ndescribe("unquote-splice expression: ", function() {
      it('should compile `  ^& a.b', function() {
        return expect(compile('var a; ` ^& a.b')).to.have.string("var a;\na.b");
      });
      it('should compile `  ^&a.b', function() {
        return expect(compile('var a; ` ^&a.b')).to.have.string("var a;\na.b");
      });
      it('should compile ` ( ^&a).b', function() {
        return expect(compile('var a; ` ( ^&a).b')).to.have.string("var a;\n[\"attribute!\"].concat(a).concat([\"b\"])");
      });
      it('should compile ` ^@ [print a b]', function() {
        return expect(compile('var a, b; ` ^& [print a b]')).to.have.string("var a, b;\n[console.log(a, b)]");
      });
      it('should compile ` ^@ {print a b}', function() {
        return expect(compile('var a, b; ` ^& {print a b}')).to.have.string("var a, b;\nconsole.log(a, b)");
      });
      it('should compile ` ^ print a b', function() {
        return expect(compile('var a, b; ` ^ [print a b]')).to.have.string("var a, b;\n[console.log(a, b)]");
      });
      return it('should compile ` ^ print a b', function() {
        return expect(compile('var a, b; ` ^ {print a b}')).to.have.string("var a, b;\nconsole.log(a, b)");
      });
    });
  });
});
