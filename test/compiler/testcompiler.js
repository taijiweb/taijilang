var Parser, chai, compile, compileNoOptimize, constant, expect, head, idescribe, iit, isArray, lib, metaCompile, ndescribe, nit, parse, realCode, run, str, taiji, _ref;

chai = require("chai");

expect = chai.expect;

iit = it.only;

idescribe = describe.only;

nit = ndescribe = function() {};

lib = '../../lib/';

Parser = require(lib + 'parser').Parser;

_ref = require(lib + 'parser/base'), constant = _ref.constant, isArray = _ref.isArray, str = _ref.str;

require(lib + 'compiler/compile');

taiji = require(lib + 'taiji');

realCode = require(lib + 'utils').realCode;

head = 'taiji language 0.1\n';

parse = function(text) {
  var parser, x;
  parser = new Parser();
  x = parser.parse(head + text, parser.module, 0);
  return str(x.body);
};

compile = function(code) {
  head = 'taiji language 0.1\n';
  code = taiji.compile(head + code, taiji.rootModule, taiji.builtins, {});
  return realCode(code);
};

metaCompile = function(code) {
  head = 'taiji language 0.1\n';
  return realCode(taiji.metaCompile(head + code, taiji.rootModule, taiji.builtins, {}));
};

compileNoOptimize = function(code) {
  head = 'taiji language 0.1\n';
  return realCode(taiji.compileNoOptimize(head + code, taiji.rootModule, taiji.builtins, {}));
};

run = function(code) {
  code = compile(code);
  return str(eval(code));
};

describe("compile: ", function() {
  describe("simple: ", function() {
    it('should compile var a', function() {
      return expect(compile('var a')).to.have.string("var a;\na");
    });
    it('should compile 1', function() {
      return expect(compile('1')).to.have.string('1');
    });
    it('should compile begin! 1 2', function() {
      return expect(compile('begin! 1 2')).to.have.string('2');
    });
    it('should parse [1, 2]', function() {
      return expect(parse('[1, 2]')).to.have.string("[list! 1 2]");
    });
    it('should compile [1, 2]', function() {
      return expect(compile('[1, 2]')).to.have.string("[1, 2]");
    });
    it('should parse [1 2]', function() {
      return expect(parse('[1 2]')).to.have.string("[list! [1 2]]");
    });
    it('should compile [1 2]', function() {
      return expect(compile('[1 2]')).to.have.string("[1, 2]");
    });
    it('should compile print', function() {
      return expect(compile('print 1')).to.have.string('console.log(1)');
    });
    return it('should compile 1+1', function() {
      return expect(compile('1+1')).to.have.string('2');
    });
  });
  describe("assign: ", function() {
    it("should compile \do=1", function() {
      return expect(compile('\\do=1')).to.have.string("var do1 = 1;\ndo1");
    });
    it("should compile a=1", function() {
      return expect(compile('a=1')).to.have.string("var a = 1;\na");
    });
    it("should compile var a; not a", function() {
      return expect(compile('var a; not a')).to.have.string("var a;\n!a");
    });
    it("should compile var a=1, b=2", function() {
      return expect(compile('var a=1, b=2')).to.have.string("var a = 1, \n    b = 2;\nb");
    });
    it("should comile a=1; -> a=1", function() {
      return expect(compile('a=1; -> a=1')).to.have.string("var a = 1;\n\n(function () {\n  var a = 1;\n  return a;\n})");
    });
    it("should comile a=1; -> @@a=1", function() {
      return expect(compile('a=1; -> @@a=1')).to.have.string("var a = 1;\n\n(function () {\n  return a = 1;\n})");
    });
    it("should comile a=1; -> a = 1; @@a=1", function() {
      return expect(function() {
        return compile('a=1; -> a = 1; @@a=1');
      }).to["throw"](/local variable/);
    });
    it("should comile a=1; -> b = @@a", function() {
      return expect(compile('a=1; -> b = @@a')).to.have.string('var a = 1;\n\n(function () {\n  var b = a;\n  return b;\n})');
    });
    it("should comile a=1; -> a = @@a", function() {
      return expect(function() {
        return compile('a=1; -> a = @@a');
      }).to["throw"](/local variable, can not access outer/);
    });
    it("should parse [x, y] = [1, 2]", function() {
      return expect(parse('[x, y] = [1, 2]')).to.have.string("[= [list! x y] [list! 1 2]]");
    });
    it("should comile [x, y] = [1, 2]", function() {
      return expect(compile('[x, y] = [1, 2]')).to.have.string("var x = 1, \n    y = 2;\ny");
    });
    it("should comile var a = [1, 2]; [x, y] = a", function() {
      return expect(compile('var a = [1, 2]; [x, y] = a')).to.have.string("var a = [1, 2], \n    lst = a, \n    x = lst[0], \n    y = lst[1];\ny");
    });
    it("should comile var a = [[1, 2]]; [[x, y]] = a", function() {
      return expect(compile('var a = [[1, 2]]; [[x, y]] = a')).to.have.string("var a = [[1, 2]], \n    lst = a, \n    lst2 = lst[0], \n    x = lst2[0], \n    y = lst2[1];\ny");
    });
    it("should compile [x, [y, z]] = [1, [2, 3]]", function() {
      return expect(compile('[x, [y, z]] = [1, [2, 3]]')).to.have.string("var x = 1, \n    y = 2, \n    z = 3;\nz");
    });
    it("should parse [x..., y] = [1, 2]", function() {
      return expect(parse('[x..., y] = [1, 2]')).to.have.string("[= [list! [x... x] y] [list! 1 2]]");
    });
    it("should compile [x..., y] = [1, 2]", function() {
      return expect(compile('[x..., y] = [1, 2]')).to.have.string("var x = [1], \n    y = 2;\ny");
    });
    it("should compile [x..., y] = [1, 2]", function() {
      return expect(compile('[x, y...] = [1, 2]')).to.have.string("var x = 1, \n    y = [2];\ny");
    });
    it("should compile [x, y...] = [1, 2, 3]", function() {
      return expect(compile('[x, y...] = [1, 2, 3]')).to.have.string("var x = 1, \n    y = [2, 3];\ny");
    });
    it("should compile [x..., y] = [1, 2, 3]", function() {
      return expect(compile('[x..., y] = [1, 2, 3]')).to.have.string("var x = [1, 2], \n    y = 3;\ny");
    });
    it("should compile [x, y..., z] = [1, 2, 3, 4]", function() {
      return expect(compile('[x, y..., z] = [1, 2, 3, 4]')).to.have.string("var x = 1, \n    y = [2, 3], \n    z = 4;\nz");
    });
    it("should compile [x, y..., z] = [1, 2, 3, 4]", function() {
      return expect(compile('a = [1, 2, 3, 4]; [x, y..., z] = a')).to.have.string("var i, a = [1, 2, 3, 4], \n    lst = a, \n    x = lst[0];\ny = lst.length >= 3? __slice.call(lst, 2, i = lst.length - 1): (i = 1, []);\nz = lst[i++]");
    });
    it("should parse var x, y, z; a = [x, y..., z]", function() {
      return expect(parse('var x, y, z; a = [x, y..., z]')).to.have.string("[begin! [var x y z] [= a [list! x [x... y] z]]]");
    });
    it("should compile var x, y, z; a = [x, y..., z]", function() {
      return expect(compile('var x, y, z; a = [x, y..., z]')).to.have.string("var x, y, z, a = [x].concat(y).concat([z]);\na");
    });
    it("should compile var x, y, z, a = [x, y..., z..., 1]", function() {
      return expect(compile('var x, y, z; a = [x, y..., z..., 1]')).to.have.string("var x, y, z, a = [x].concat(y).concat(z).concat([1]);\na");
    });
    it("should compile var x, y, z; a = [x, [1,2]..., z]", function() {
      return expect(compile('var x, y, z; a = [x, [1,2]..., z]')).to.have.string("var x, y, z, a = [x, 1, 2, z];\na");
    });
    it("should parse x #= -=> a=1", function() {
      return expect(parse('x #= -=> a=1')).to.have.string("[#= x [-=> [] [[= a 1]]]]");
    });
    return it("should comile {x #= -> a=1}; 1", function() {
      return expect(compile('{x #= -> a=1}; 1')).to.have.string("1");
    });
  });
  describe("attribute and index: ", function() {
    it('should compile print : and 1 2', function() {
      var x;
      x = compile('print : and 1 2');
      return expect(x).to.have.string("console.log(2)");
    });
    it('should compile and 1 2', function() {
      var x;
      x = compile('and 1 2');
      return expect(x).to.have.string('2');
    });
    it('should compile console.log : and 1 2', function() {
      var x;
      x = compile('console.log : and 1 2');
      return expect(x).to.have.string("console.log(2)");
    });
    it('should compile let a=[\ 1 \]then a[1]', function() {
      var x;
      x = compile('let a=[\ 1 \] then a[1]');
      return expect(x).to.have.string("var a = [1];\na[1]");
    });
    return it('should compile let a=[\\ 1 \\] then a[1]', function() {
      var x;
      x = compile('let a=[\\ 1 \\] then a[1]');
      return expect(x).to.have.string("var a = [1];\na[1]");
    });
  });
  describe("quote and eval: ", function() {
    it('should compile ~ print 1', function() {
      return expect(compile('~ print 1')).to.have.string("[\"print\",1]");
    });
    it('should compile eval! ~ print 1', function() {
      return expect(compile('eval!: ~ print 1')).to.have.string("console.log(1)");
    });
    return it('should compile eval! print 1', function() {
      return expect(compile('eval!: print 1')).to.have.string("eval(console.log(1))");
    });
  });
  describe("if and if!: ", function() {
    it('should compile if! 1 2', function() {
      return expect(compile("if! 1 2")).to.have.string("2");
    });
    it('should compile if! 1 2 3', function() {
      return expect(compile("if! 1 2 3")).to.have.string("2");
    });
    it('should compile if! 1 {break} {continue}', function() {
      return expect(compile("if! 1 {break} {continue}")).to.have.string("break ");
    });
    it('should compile if! 0 {break} {continue}', function() {
      return expect(compile("if! 0 {break} {continue}")).to.have.string("continue ");
    });
    it('should compile if! 0 2 3', function() {
      return expect(compile("if! 0 2 3")).to.have.string("3");
    });
    return it('should compile if 1 then 2 else 3', function() {
      return expect(compile("if 1 then 2 else 3")).to.have.string("2");
    });
  });
  describe("while!", function() {
    it('should compile while! 1 {print 1} ', function() {
      return expect(compile('while! 1 {print 1}')).to.have.string("while (1)\n  console.log(1)");
    });
    it('should compile while! 0 {print 1} ', function() {
      return expect(compile('while! 0 {print 1}')).to.have.string('');
    });
    it('should compile doWhile! {print 1} 1', function() {
      return expect(compile('doWhile! {print 1} 1')).to.have.string("do {\n  console.log(1);\n} while (1)");
    });
    it('should compile doWhile! {print 1} 0', function() {
      return expect(compile('doWhile! {print 1} 0')).to.have.string("console.log(1)");
    });
    it('should compile label# while! 1 {print 1} ', function() {
      return expect(compile('label# while! 1 {print 1}')).to.have.string("label: while (1)\n  console.log(1)");
    });
    return it('should compile while! 1 { print 1; print 2 } ', function() {
      return expect(compile('while! 1 { print 1; print 2 }')).to.have.string("while (1){ \n  console.log(1);\n  console.log(2);\n}");
    });
  });
  describe("switch!: ", function() {
    it('should parse switch! 1 [{[2] 3}] 4', function() {
      return expect(parse("switch! 1 [ {[2] 3} ] 4")).to.have.string("[switch! 1 [list! [[list! 2] 3]] 4]");
    });
    it('should compile switch! 1 [{[2] 3}] 4', function() {
      return expect(compile("switch! 1 [ {[2] 3} ]4")).to.have.string("switch (1){\n  case 2: t = 3;\n  break ; ;\n  default: t = 4;\n};\nt");
    });
    it('should parse switch! 1 [{[2, 5] 3}, {[7, 8+9] 10}] 4', function() {
      return expect(parse("switch! 1 [{[2, 5] 3}, {[7, 8+9] 10}] 4")).to.have.string("[switch! 1 [list! [[list! 2 5] 3] [[list! 7 [+ 8 9]] 10]] 4]");
    });
    return it('should compile switch! 1 [{[2, 5] 3}, {[7, 8+9] 10}] 4', function() {
      return expect(compile("switch! 1 [{[2, 5] 3}, {[7, 8+9] 10}] 4")).to.have.string("switch (1){\n  case 2: case 5: t = 3;\n  break ; ; case 7: case 17: t = 10;\n  break ; ;\n  default: t = 4;\n};\nt");
    });
  });
  describe("try!: ", function() {
    return it('should compile try! {throw 3} {e {print 1}} {print \'finally here\'}', function() {
      return expect(compile("var e;\ntry! {throw 3} e {print 1} {print 'finally here'}")).to.have.string("var e;\n\ntry {\n  throw 3;\n}\ncatch (e){\n  console.log(1);\n}\nfinally {\n  console.log(\"finally here\");\n}");
    });
  });
  describe("let: ", function() {
    return it('should compile let a=1 then let a = 2 then a+a', function() {
      return expect(compile("let a=1 then let a = 2 then a+a")).to.have.string("var a = 1, \n    a2 = 2;\na2 + a2");
    });
  });
  describe("for in: ", function() {
    return xit('should compile for x in [\ 1, 2 \] then print x', function() {
      return expect(compile('for x in [\ 1 2 \] then print x')).to.have.string("var a;\na=1;\nvar a2;\na2=2;\na2+a2");
    });
  });
  describe("function: ", function() {
    it('should compile -> 1', function() {
      return expect(compile('-> 1')).to.have.string("(function () {\n  return 1;\n})");
    });
    it('should compile let f = -> 1 then f()', function() {
      return expect(compile('let f = -> 1 then f()')).to.have.string("var f = function () {\n  return 1;\n};\nf()");
    });
    it('should compile {-> 1}()', function() {
      return expect(compile('{-> 1}()')).to.have.string("(function () {\n  return 1;\n})()");
    });
    it('should compile ->', function() {
      return expect(compile('->')).to.have.string("(function () {})");
    });
    it('should compile ->1,2', function() {
      return expect(compile('->1,2')).to.have.string("(function () {\n  return 2;\n})");
    });
    it('should compile |->1,2', function() {
      return expect(compile('|->1,2')).to.have.string("(function () {\n  2;\n})");
    });
    xit('should compile \\|-> [] {1, 2}', function() {
      return expect(compile('\\|-> [] {1, 2}')).to.have.string("(function () {\n  2;\n})");
    });
    xit('should parse \\|-> [] {1, 2}', function() {
      return expect(parse('\\|-> [] {1, 2}')).to.have.string("(function () {\n  2;\n})");
    });
    it('should parse => @a', function() {
      return expect(parse('=> @a')).to.have.string("[=> [] [[attribute! @ a]]]");
    });
    it('should compile => @a; @, @x([]+@)', function() {
      return expect(compile('=> @a; @, @x([]+@)')).to.have.string("var _this = this;\n\n(function () {\n  _this.a;\n  return _this.x([] + _this);\n})");
    });
    it('should parse |=> @a; @, @x([]+@)', function() {
      return expect(parse('|=> @a; @, @x([]+@)')).to.have.string("[|=> [] [[attribute! @ a] @ [call! [attribute! @ x] [[+ [] @]]]]]");
    });
    it('should compile |=> @a; @, @x([]+@)', function() {
      return expect(compile('|=> @a; @, @x([]+@)')).to.have.string("var _this = this;\n\n(function () {\n  _this.a;\n  _this.x([] + _this);\n})");
    });
    it('should compile => @a; @, @x([]+@), -> @a; @, @x([]+@)', function() {
      return expect(compile('=> @a; @, @x([]+@), -> @a; @, @x([]+@)')).to.have.string("var _this = this;\n\n(function () {\n  _this.a;\n  _this.x([] + _this);\n  return function () {\n    this.a;\n    return this.x([] + this);\n  };\n})");
    });
    it('should parse (@a) -> 1', function() {
      return expect(parse('(@a) -> 1')).to.have.string("[-> [[attribute! @ a]] [1]]");
    });
    it('should compile (@a) -> 1', function() {
      return expect(compile('(@a) -> 1')).to.have.string("(function (a) {\n  this.a = a;\n  return 1;\n})");
    });
    it('should parse (@a=1) -> 1', function() {
      return expect(parse('(@a=1) -> 1')).to.have.string("[-> [[= [attribute! @ a] 1]] [1]]");
    });
    it('should compile (@a=1) -> 1', function() {
      return expect(compile('(@a=1) -> 1')).to.have.string("(function (a) {\n  if (a === void 0)\n    a = 1;\n  this.a = a;\n  return 1;\n})");
    });
    it('should parse (@a...) -> 1', function() {
      return expect(parse('(@a...) -> 1')).to.have.string("[-> [[x... [attribute! @ a]]] [1]]");
    });
    it('should compile (@a...) -> 1', function() {
      return expect(compile('(@a...) -> 1')).to.have.string("(function () {\n  var a = arguments.length >= 1? __slice.call(arguments, 0): [];\n  this.a = a;\n  return 1;\n})");
    });
    it('should parse (a=1) -> 1', function() {
      return expect(parse('(a=1) -> 1')).to.have.string("[-> [[= a 1]] [1]]");
    });
    it('should compile (a=1) -> 1,2', function() {
      return expect(compile('(a=1) -> 1')).to.have.string("(function (a) {\n  if (a === void 0)\n    a = 1;\n  return 1;\n})");
    });
    it('should compile (a=1, b=a, c={. .}) ->1,2', function() {
      return expect(compile('(a=1, b=a, c={. .}) -> 1')).to.have.string("(function (a, b, c) {\n  if (a === void 0)\n    a = 1;\n  \n  if (b === void 0)\n    b = a;\n  \n  if (c === void 0)\n    c = { };\n  return 1;\n})");
    });
    it('should run {(a=1, b=a, c={. .}) -> [a,b, c]}(1,2,3)', function() {
      return expect(run('{(a=1, b=a, c={. .}) -> [a,b, c]}(1,2,3)')).to.have.string("[1 2 3]");
    });
    it('should run {(a=1, b=a, c={. .}) -> [a,b, c]', function() {
      return expect(run('{(a=1, b=a, c={. .}) -> [a,b, c]}(1,2)')).to.have.string("[1 2 [object Object]]");
    });
    it('should run {(a=1, x..., b=a, c={. .}) -> [a, b] }(1, 2, 3)', function() {
      return expect(run('{(a=1, x..., b=a, c={. .}) -> [a, b] }(1, 2, 3)')).to.deep.have.string("[1 2]");
    });
    it('should run {(a=1, x..., b, c) -> [a, x, b, c] }(1, 2, 3, 4, 5, 6)', function() {
      return expect(run('{(a=1, x..., b, c) -> [a, x, b, c] }(1, 2, 3, 4, 5, 6)')).to.deep.have.string('[1 [2 3 4] 5 6]');
    });
    return it('should run {(a=1, x..., b=a, c={. .}) -> [a, x, b, c] }(1, 2, 3, 4, 5, 6)', function() {
      return expect(run('{(a=1, x..., b=a, c={. .}) -> [a, x, b, c] }(1, 2, 3, 4, 5, 6)')).to.deep.have.string('[1 [2 3 4] 5 6]');
    });
  });
  describe("letrec: ", function() {
    return it('should compile letrec! f = (x) -> if! x==1 1 f(x-1)', function() {
      var code;
      code = compile('letrec! f = (x) -> if! x==1 1 f(x-1) then f(3)');
      return expect(eval(code)).to.equal(1);
    });
  });
  describe("letloop!: ", function() {
    it('should compile letloop! f = (x, acc) -> if! x===0 acc f(x-1, x+acc) then f(3, 0)', function() {
      var code;
      code = compile('letloop! f = (x, acc) -> if! x===0 acc f(x-1, x+acc) then f(4, 0)');
      return expect(eval(code + ';t')).to.equal(10);
    });
    it('should compile letloop! f = (x) -> if! x==1 1 f(x-1) then f(3)', function() {
      var code;
      code = compile('letloop! f = (x) -> if! x==1 1 f(x-1) then f(3)');
      return expect(eval(code + ';t')).to.equal(1);
    });
    it('should compile letloop! f = (x) -> if! x==1 1 x+f(x-1) then f(3)', function() {
      var code;
      code = compile('letloop! f = (x) -> if! x==1 1 x+f(x-1) then f(3)');
      return expect(eval(code + ';t')).to.equal(6);
    });
    it('should compile letloop! gcd = (a, b) -> if! a>b {gcd a-b b} {if! b>a {gcd a b-a} a} then gcd 9 12', function() {
      var code;
      code = compile('letloop! gcd = (a, b) -> if! a>b {gcd a-b b} {if! b>a {gcd a b-a} a} then gcd 9 12');
      return expect(eval(code + ';t')).to.equal(3);
    });
    it('should compile letloop! \n  odd = (x) -> if! x==0 0 even(x-1)\n  even = (x) -> if! x==0 1 odd(x-1) \nthen odd(3)', function() {
      var code;
      code = compile('letloop! \n  odd = (x) -> if! x==0 0 even(x-1)\n  even = (x) -> if! x==0 1 odd(x-1) \nthen odd(3)');
      return expect(eval(code + ';t')).to.equal(1);
    });
    return it('should compile letloop! \n  odd = (x) -> if! x==0 0 x+even(x-1)\n  even = (x) -> if! x==0 0 x+odd(x-1) \nthen odd(3)', function() {
      var code;
      code = compile('letloop! \n  odd = (x) -> if! x==0 0 x+even(x-1)\n  even = (x) -> if! x==0 0 x+odd(x-1) \nthen odd(3)');
      return expect(eval(code + ';t')).to.equal(6);
    });
  });
  describe("quasiquote: ", function() {
    it('should compile ` ^1', function() {
      return expect(compile('` ^1')).to.have.string("1");
    });
    it('should compile `{^1 ^2 ^&{3 4}}', function() {
      return expect(compile('`{^1 ^2 ^&{3 4}}')).to.have.string("[1, 2].concat([3, 4])");
    });
    it('should parse `[^1 ^2 ^&[3, 4]]', function() {
      return expect(parse('`[ ^1 ^2 ^&[3, 4]]')).to.have.string("[quasiquote! [list! [[unquote! 1] [unquote! 2] [unquote-splice [list! 3 4]]]]]");
    });
    it('should compile `[^1 ^2 ^&[3, 4]]', function() {
      return expect(compile('`[ ^1 ^2 ^&[3, 4]]')).to.have.string("[\"list!\", [1, 2].concat([3, 4])]");
    });
    it('should compile `{ ^1 { ^2 ^&{3 4}}}', function() {
      return expect(compile('`{ ^1 { ^2 ^&{3 4}}}')).to.have.string("[1, [2].concat([3, 4])]");
    });
    return it('should compile `[ ^1 [ ^2 ^&[3, 4]]]', function() {
      return expect(compile('`[ ^1 [ ^2 ^&[3, 4]]]')).to.have.string("[\"list!\", [1, [\"list!\", [2].concat([3, 4])]]]");
    });
  });
  describe("meta: ", function() {
    it('should compile var a, b; a+b', function() {
      return expect(compile('var a, b; a+b')).to.have.string("var a, b;\na + b");
    });
    it('should compile #(1+1)', function() {
      return expect(compile('#(1+1)')).to.have.string('2');
    });
    it('should compile # (#(1+2) + #(3+4))', function() {
      return expect(compile('# ( #(1+2) + #(3+4))')).to.have.string('10');
    });
    it('should compile #(1+2) + #(3+4)', function() {
      return expect(compile('#(1+2) + #(3+4)')).to.have.string('10');
    });
    it('should compile 3+.#(1+1)', function() {
      return expect(compile('3+.#(1+1)')).to.have.string('5');
    });
    it('should compile ~ 1+1', function() {
      return expect(compile('~ 1+1')).to.have.string("[\"+\",1,1]");
    });
    it('should compile # ~ 1+1', function() {
      return expect(compile('# ~ 1+1')).to.have.string("2");
    });
    it('should compile ##a=1', function() {
      return expect(compile('##a=1')).to.have.string('1');
    });
    it('should compile a#=1', function() {
      return expect(compile('a#=1')).to.have.string('1');
    });
    it('should compile #(a=1)', function() {
      return expect(compile('#(a=1)')).to.have.string('1');
    });
    it('should compile \'a#=1;# ` ^a', function() {
      return expect(compile('a#=1;# ` ^a')).to.have.string("1");
    });
    it('should compile \'#(a=1);# ` ^a', function() {
      return expect(compile('#(a=1);# ` ^a')).to.have.string("1");
    });
    it('should compile \'##a=1;# ` ^a', function() {
      return expect(compile('##a=1;# ` ^a')).to.have.string("1");
    });
    it('should compile \'#a=1;a', function() {
      return expect(function() {
        return compile('#a=1;a');
      }).to["throw"](Error);
    });
    it('should compile if 1 then 1+2 else 3+4', function() {
      return expect(compile('if 1 then 1+2 else 3+4')).to.have.string("3");
    });
    it('should compile ## if 1 then 1 else 2', function() {
      return expect(compile('## if 1 then 1 else 2')).to.have.string("1");
    });
    it('should compile if 1 then #1+2 else #3+4', function() {
      return expect(compile('if 1 then #1+2 else #3+4')).to.have.string("3");
    });
    it('should compile var a; if 1 then #1+2 else #3+4', function() {
      return expect(compile('var a; if 1 then #1+2 else #3+4')).to.have.string("var a;\n3");
    });
    it('should compile if 1 then ##1+2 else ##3+4', function() {
      return expect(compile('if 1 then #1+2 else #3+4')).to.have.string("3");
    });
    it('should compileNoOptimize if 1 then ##1+2 else ##3+4', function() {
      return expect(compileNoOptimize('if 1 then ##1+2 else ##3+4')).to.have.string("if (1)\n  3;\nelse 7");
    });
    it('should compileNoOptimize 1+2', function() {
      return expect(compileNoOptimize('1+2')).to.have.string("1 + 2");
    });
    it('should compile # if 1 then 1+2 else 3+4', function() {
      return expect(compile('# if 1 then 1+2 else 3+4')).to.have.string('3');
    });
    it('should compileNoOptimize # if 1 then 1+2 else 3+4', function() {
      return expect(compileNoOptimize('# if 1 then 1+2 else 3+4')).to.have.string("1 + 2");
    });
    it('should compileNoOptimize a#=0; # if a then 1+2 else 3+4', function() {
      return expect(compileNoOptimize('a#=0; # if a then 1+2 else 3+4')).to.have.string("3 + 4");
    });
    it('should compile var a, b; # if 1 then a else b', function() {
      return expect(compile('var a, b; # if 1 then a else b')).to.have.string("var a, b;\na");
    });
    it('should compile ## if 1 then a else b', function() {
      return expect(function() {
        return compile('## if 1 then a else b');
      }).to["throw"](/fail to look up symbol from environment:a/);
    });
    it('should compile ## var a, b; ## if 1 then a else b', function() {
      return expect(compile('## var a, b; ## if 1 then a else b')).to.have.string('');
    });
    it('should compile # if 0 then 1+2 else 3+4', function() {
      return expect(compile('# if 0 then 1+2 else 3+4')).to.have.string('7');
    });
    it('should compile ## if 1 then 1+2 else 3+4', function() {
      return expect(compile('## if 1 then 1+2 else 3+4')).to.have.string('3');
    });
    return it('should compile ## if 0 then 1+2 else 3+4', function() {
      return expect(compile('## if 0 then 1+2 else 3+4')).to.have.string('7');
    });
  });
  describe("macro is just meta operation: ", function() {
    it('should compile ##{->} 1', function() {
      return expect(compile('##{-> 1}()')).to.have.string("1");
    });
    it('should compile ##{-> ~(1+2)}()', function() {
      return expect(compile('##{-> ~(1+2)}()')).to.have.string("3");
    });
    it('should compile {-> ~(1+2)}#()', function() {
      return expect(compile('{-> ~(1+2)}#()')).to.have.string("3");
    });
    it('should compileNoOptimize ##{-> ~(1+2)}()', function() {
      return expect(compileNoOptimize('##{-> ~(1+2)}()')).to.have.string("1 + 2");
    });
    it('should compileNoOptimize ##{(a,b) -> `( ^a + ^b)}(1,2)', function() {
      return expect(compileNoOptimize('##{(a,b) -> `( ^a + ^b)}(1,2)')).to.have.string("1 + 2");
    });
    it('should compileNoOptimize m #= {(a,b) -> `( ^a + ^b)}; ##m(1,2)', function() {
      return expect(compileNoOptimize('m #= {(a,b) -> `( ^a + ^b)}; ##m(1,2)')).to.have.string("1 + 2");
    });
    it('should compileNoOptimize m #= {(a,b) -> `( ^a + ^b)}; ##m(1+2, 3+4)', function() {
      return expect(compileNoOptimize('m #= {(a,b) -> `( ^a + ^b)}; ##m(1+2,3+4)')).to.have.string("3 + 7");
    });
    it('should compileNoOptimize m #= {(a,b) -> `( ^a + ^b)}; #m(1+2, 3+4)', function() {
      return expect(compileNoOptimize('m #= {(a,b) -> `( ^a + ^b)}; #m(1+2,3+4)')).to.have.string("[+, [[+, 1, 2], [+, 3, 4]], ]");
    });
    it('should compileNoOptimize m #= {(a,b) -> `( ^a + ^b)}; var x, y, z; #m(x+y,y+z)', function() {
      return expect(compileNoOptimize('m #= {(a,b) -> `( ^a + ^b)}; var x, y, z; #m(x+y,y+z)')).to.have.string("var x, y, z;\n[+, [[+, x, y], [+, y, z]], ]");
    });
    it('should compileNoOptimize m #= {(a,b) -> `( ^a + ^b)}; var x, y, z; ##m(x+y,y+z)', function() {
      return expect(function() {
        return compileNoOptimize('m #= {(a,b) -> `( ^a + ^b)}; var x, y, z; ##m(x+y,y+z)');
      }).to["throw"](/fail to look up symbol from environment:x/);
    });
    it('should parse m #= {(a,b) -> `( ^a + ^b)}; var x, y, z; m#(x+y,y+z)', function() {
      return expect(parse('m #= {(a,b) -> `( ^a + ^b)}; var x, y, z; m#(x+y,y+z)')).to.have.string("[begin! [#= m [-> [a b] [[quasiquote! [+ [unquote! a] [unquote! b]]]]]] [var x y z] [#call! m [[+ x y] [+ y z]]]]");
    });
    it('should compileNoOptimize m #= {(a,b) -> `( ^a + ^b)}; var x, y, z; m#(x+y,y+z)', function() {
      return expect(compileNoOptimize('m #= {(a,b) -> `( ^a + ^b)}; var x, y, z; m#(x+y,y+z)')).to.have.string('var x, y, z;\nx + y + y + z');
    });
    it('should compileNoOptimize m #= {(a,b) -> `( ^a * ^b)}; var x, y, z; m#(x+y,y*z)', function() {
      return expect(compileNoOptimize('m #= {(a,b) -> `( ^a * ^b)}; var x, y, z; m#(x+y,y*z)')).to.have.string("var x, y, z;\n(x + y) * y * z");
    });
    it('should compileNoOptimize m #= {(a,b) -> `( ^a * ^b)}; var x, y, z; m#(x+y,y+z)', function() {
      return expect(compileNoOptimize('m #= {(a,b) -> `( ^a * ^b)}; var x, y, z; m#(x+y,y+z)')).to.have.string("var x, y, z;\n(x + y) * (y + z)");
    });
    it('should parse m #= {(a,b) -> `( ^a + ^b)}; var x, y, z; (#m)(x+y,y+z)', function() {
      return expect(parse('m #= {(a,b) -> `( ^a + ^b)}; var x, y, z; (#m)(x+y,y+z)')).to.have.string("[begin! [#= m [-> [a b] [[quasiquote! [+ [unquote! a] [unquote! b]]]]]] [var x y z] [call! [# m] [[+ x y] [+ y z]]]]");
    });
    return it('should compileNoOptimize m #= {(a,b) -> `( ^a + ^b)}; var x, y, z; (#m)(x+y,y+z)', function() {
      return expect(compileNoOptimize('m #= {(a,b) -> `( ^a + ^b)}; var x, y, z; (#m)(x+y,y+z)')).to.have.string("var x, y, z;\n[+, [[+, x, y], [+, y, z]], ]");
    });
  });
  describe("more meta: ", function() {
    it('parse a = # #-{ print 1 } ', function() {
      return expect(parse('a = #  #-{ print 1 }')).to.have.string("[= a [# [#- [print 1]]]]");
    });
    it('compile a = #-{ print 1 } ', function() {
      return expect(function() {
        return compile('a = #-{ print 1 }');
      }).to["throw"](/fail to look up symbol from environment:#-/);
    });
    it('parse #( #-{ print 1 }) ', function() {
      return expect(parse('#(  #-{ print 1 })')).to.have.string("[# [#- [print 1]]]");
    });
    it('compile # #-{ print 1 } ', function() {
      return expect(compile('#  #-{ print 1 }')).to.have.string("console.log(1)");
    });
    it('compile a = # #-{ print 1 } ', function() {
      return expect(compile('a = #  #-{ print 1 }')).to.have.string("var a = console.log(1);\na");
    });
    it('compile (#{ -> #- { print 1 }}) ', function() {
      return expect(compile('(#{ -> #- { print 1 }})()')).to.equal('[print, 1]');
    });
    it('run (#{ -> #- { print 1 }}) ', function() {
      return expect(function() {
        return run('(#{ -> #- { print 1 }})()');
      }).to["throw"](/print is not defined/);
    });
    it('compile (#{ -> #- { print 1 }}); 1 ', function() {
      return expect(compile('(#{ -> #- { print 1 }}); 1')).to.have.string("1");
    });
    it('compile (#{ -> #- { print 1 }})() ', function() {
      return expect(compile('(#{ -> #- { print 1 }})()')).to.have.string('[print, 1]');
    });
    it('compile #({ -> #- { print 1 }}()) ', function() {
      return expect(compile('#({ -> #- { print 1 }}())')).to.have.string("console.log(1)");
    });
    it('compile #( { -> a #= 1; #-({ -> b = 1; }()); #a;} ) ', function() {
      return expect(compile('#{ { -> a #= 1; #-({ -> b = 1; }()); #a;}() }')).to.have.string("1");
    });
    it('compile #{ #var fnCall; { -> a #= 1; @@fnCall #= #-({ -> b = 1; }()); #a;}(); ##fnCall }', function() {
      return expect(compile('#{ #var fnCall; { -> a #= 1; @@fnCall #= #-({ -> b = 1; }()); #a;}(); ##fnCall }')).to.have.string("(function () {\n  var b = 1;\n  return b;\n})()");
    });
    nit('metaCompile #{ #var fnCall; { -> a #= 1; @@fnCall #= #-({ -> b = 1; }()); #a;}(); ##fnCall }', function() {
      return expect(metaCompile('#{ #var fnCall; { -> a #= 1; @@fnCall #= #-({ -> b = 1; }()); #a;}(); ##fnCall }')).to.equal("1");
    });
    it('compile (#{ -> #- { print 1 }})()() ', function() {
      return expect(compile('(#{ -> #- { print 1 }})()()')).to.have.string("[print, 1]()");
    });
    it('compile #{ -> #-{ print 1 }; #-{ print 2}} ', function() {
      return expect(compile('(#{ -> #-{ print 1 }; #-{ print 2}})()')).to.have.string("[print, 2]");
    });
    nit('metaCompile #{ -> #-{ print 1 }; #-{ print 2}} ', function() {
      return expect(metaCompile('(#{ -> #-{ print 1 }; #-{ print 2}})()')).to.equal("1");
    });
    return nit('metaCompile #{ -> { print 1 }; #-{ print 2}} ', function() {
      return expect(metaCompile('(#{ -> { print 1 }; #-{ print 2}})()')).to.equal("1");
    });
  });
  describe("class : ", function() {
    it('should parse class A extends B\n  :: = (a, @b) -> super\n  ::f = (x) -> super(x)', function() {
      return expect(parse('class A extends B\n  :: = (a, @b) -> super\n  ::f = (x) -> super(x)')).to.have.string('[#call! class [A B [[= :: [-> [a [attribute! @ b]] [super]]] [= [attribute! :: f] [-> [x] [[call! super [x]]]]]]]]');
    });
    return xit('should compile A = class extends B\n  :: = (a, @b) -> super\n  ::f = (x) -> super(x)', function() {
      return expect(compile('A = class extends B\n  :: = (a, @b) -> super\n  ::f = (x) -> super(x)')).to.have.string('7');
    });
  });
  return describe("snipets from samples: ", function() {
    return it('should compile extern! node outfile\nnode.spawn outfile() {.stdio: "inherit".}', function() {
      return expect(compile('extern! node outfile\nnode.spawn outfile() {.stdio: "inherit".}')).to.have.string("node.spawn(outfile(), { stdio: \"inherit\"})");
    });
  });
});
