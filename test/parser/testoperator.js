var BLOCK_COMMENT, COMPACT_CLAUSE_EXPRESSION, EOI, HALF_DENT, IDENTIFIER, INDENT, NEWLINE, NUMBER, OPERATOR_EXPRESSION, PAREN, PAREN_OPERATOR_EXPRESSION, Parser, SPACE, SPACE_CLAUSE_EXPRESSION, UNDENT, constant, expect, iit, isArray, lib, matchRule, ndescribe, nit, str, _ref, _ref1;

_ref = require('../utils'), expect = _ref.expect, ndescribe = _ref.ndescribe, iit = _ref.iit, nit = _ref.nit, matchRule = _ref.matchRule;

lib = '../../lib/';

_ref1 = require(lib + 'parser/base'), constant = _ref1.constant, isArray = _ref1.isArray, str = _ref1.str;

Parser = require(lib + 'parser').Parser;

IDENTIFIER = constant.IDENTIFIER, NUMBER = constant.NUMBER, NEWLINE = constant.NEWLINE, INDENT = constant.INDENT, UNDENT = constant.UNDENT, HALF_DENT = constant.HALF_DENT, PAREN = constant.PAREN, BLOCK_COMMENT = constant.BLOCK_COMMENT, EOI = constant.EOI, SPACE = constant.SPACE, PAREN_OPERATOR_EXPRESSION = constant.PAREN_OPERATOR_EXPRESSION, COMPACT_CLAUSE_EXPRESSION = constant.COMPACT_CLAUSE_EXPRESSION, SPACE_CLAUSE_EXPRESSION = constant.SPACE_CLAUSE_EXPRESSION, OPERATOR_EXPRESSION = constant.OPERATOR_EXPRESSION;

describe("parse operator expression: ", function() {
  var parse;
  parse = function(text) {
    var parser, x;
    parser = new Parser();
    return x = parser.parse(text, matchRule(parser, parser.operatorExpression), 0);
  };
  describe("atom: ", function() {
    it("parse 1", function() {
      return expect(str(parse('1'))).to.deep.equal('1');
    });
    it("parse a", function() {
      return expect(str(parse('a'))).to.deep.equal('a');
    });
    it("parse 'a'", function() {
      return expect(str(parse("'a'"))).to.deep.equal("\"a\"");
    });
    return it('parse "a"', function() {
      return expect(str(parse('"a"'))).to.deep.equal("[string! \"a\"]");
    });
  });
  describe("prefix: ", function() {
    it('should parse +1', function() {
      return expect(str(parse('+1 '))).to.deep.equal("[prefix! + 1]");
    });
    it('should parse !1', function() {
      return expect(str(parse('!1 '))).to.deep.equal("[prefix! ! 1]");
    });
    it('should parse + 1', function() {
      return expect(str(parse('+ 1 '))).to.deep.equal("[prefix! + 1]");
    });
    it('should parse + + 1', function() {
      return expect(str(parse('+ + 1 '))).to.deep.equal("[prefix! + [prefix! + 1]]");
    });
    it('should parse %lineno', function() {
      return expect(str(parse('%lineno'))).to.deep.equal("[prefix! % lineno]");
    });
    return it('should parse %lineno()', function() {
      return expect(str(parse('%lineno()'))).to.deep.equal("[binary! concat() [prefix! % lineno] [()]]");
    });
  });
  describe("add and multiply: ", function() {
    it("parse 1+2", function() {
      return expect(str(parse('1+2'))).to.deep.equal('[binary! + 1 2]');
    });
    it("parse 1+.!2", function() {
      return expect(str(parse('1+.!2'))).to.deep.equal("[binary! + 1 [prefix! ! 2]]");
    });
    it("parse 1 + 2", function() {
      return expect(str(parse('1 + 2'))).to.deep.equal('[binary! + 1 2]');
    });
    it("parse 1+ 2", function() {
      return expect(function() {
        return parse('1+ 2');
      }).to["throw"](/unexpected spaces or new lines after binary operator/);
    });
    it("parse 1+ 2*3", function() {
      return expect(function() {
        return parse('1+ 2*3');
      }).to["throw"](/unexpected spaces or new lines after binary operator/);
    });
    it("parse (1, 2)", function() {
      return expect(str(parse('(1, 2)'))).to.deep.equal("[() [binary! , 1 2]]");
    });
    it("parse (1, 2+3)", function() {
      return expect(str(parse('(1, 2+3)'))).to.deep.equal("[() [binary! , 1 [binary! + 2 3]]]");
    });
    it("parse (1,2 + 3)", function() {
      return expect(str(parse('(1,2 + 3)'))).to.deep.equal("[() [binary! + [binary! , 1 2] 3]]");
    });
    it("parse (1 +2)", function() {
      return expect(function() {
        return parse('(1 +2)');
      }).to["throw"](/should have spaces at its right side/);
    });
    it("parse 1+2 * 3", function() {
      return expect(str(parse('1+2 * 3'))).to.deep.equal('[binary! * [binary! + 1 2] 3]');
    });
    it("parse 1 + 2*3", function() {
      return expect(str(parse('1 + 2*3'))).to.deep.equal('[binary! + 1 [binary! * 2 3]]');
    });
    it("parse 1+2+3", function() {
      return expect(str(parse('1+2+3'))).to.deep.equal("[binary! + [binary! + 1 2] 3]");
    });
    it("parse 1+2+3+4+5+6", function() {
      return expect(str(parse('1+2+3+4+5+6'))).to.deep.equal("[binary! + [binary! + [binary! + [binary! + [binary! + 1 2] 3] 4] 5] 6]");
    });
    it("parse 1*2+3+4+5+6", function() {
      return expect(str(parse('1*2+3+4+5+6'))).to.deep.equal("[binary! + [binary! + [binary! + [binary! + [binary! * 1 2] 3] 4] 5] 6]");
    });
    it("parse 1*2+3+4*5+6", function() {
      return expect(str(parse('1*2+3+4*5+6'))).to.deep.equal("[binary! + [binary! + [binary! + [binary! * 1 2] 3] [binary! * 4 5]] 6]");
    });
    it("parse 1 + 2+3", function() {
      return expect(str(parse('1 + 2+3'))).to.deep.equal("[binary! + 1 [binary! + 2 3]]");
    });
    it("parse 1+2*3", function() {
      return expect(str(parse('1+2*3'))).to.deep.equal('[binary! + 1 [binary! * 2 3]]');
    });
    it("parse 1+2/3", function() {
      return expect(str(parse('1+2/3'))).to.deep.equal('[binary! + 1 [binary! / 2 3]]');
    });
    it("parse 1*2+3", function() {
      return expect(str(parse('1*2+3'))).to.deep.equal("[binary! + [binary! * 1 2] 3]");
    });
    it("parse 1*(2+3)", function() {
      return expect(str(parse('1*(2+3)'))).to.deep.equal("[binary! * 1 [() [binary! + 2 3]]]");
    });
    it("parse (1)", function() {
      return expect(str(parse('(1)'))).to.deep.equal("[() 1]");
    });
    return it("parse (1+2)*(3+4)", function() {
      return expect(str(parse('(1+2)*(3+4)'))).to.deep.equal("[binary! * [() [binary! + 1 2]] [() [binary! + 3 4]]]");
    });
  });
  describe("multi lines expression: ", function() {
    it("parse 1+2\n*3", function() {
      return expect(str(parse('1+2\n*3'))).to.deep.equal('[binary! * [binary! + 1 2] 3]');
    });
    it("parse 1+2\n* 3", function() {
      return expect(str(parse('1+2\n* 3'))).to.deep.equal('[binary! * [binary! + 1 2] 3]');
    });
    it("parse 1+2\n+4\n*3", function() {
      return expect(str(parse('1+2\n+4\n*3'))).to.deep.equal('[binary! * [binary! + [binary! + 1 2] 4] 3]');
    });
    it("parse 1+2\n+4*3", function() {
      return expect(str(parse('1+2\n+4\n*3'))).to.deep.equal('[binary! * [binary! + [binary! + 1 2] 4] 3]');
    });
    it("parse 1+2\n+4\n*3\n/6", function() {
      return expect(str(parse('1+2\n+4\n*3\n/6'))).to.deep.equal('[binary! / [binary! * [binary! + [binary! + 1 2] 4] 3] 6]');
    });
    it("parse 1+2\n+4\n*3\n&6", function() {
      return expect(str(parse('1+2\n+4\n*3\n&6'))).to.deep.equal("[binary! & [binary! * [binary! + [binary! + 1 2] 4] 3] 6]");
    });
    it("parse 1+2\n+4\n*.!3\n&6+8*(9-3)", function() {
      return expect(str(parse('1+2\n+4\n*.!3\n&6+8*(9-3)'))).to.deep.equal("[binary! & [binary! * [binary! + [binary! + 1 2] 4] [prefix! ! 3]] [binary! + 6 [binary! * 8 [() [binary! - 9 3]]]]]");
    });
    it("parse 1+2\n+4\n/5\n*3==7", function() {
      return expect(str(parse('1+2\n+4\n/5\n*3==7'))).to.deep.equal("[binary! * [binary! / [binary! + [binary! + 1 2] 4] 5] [binary! == 3 7]]");
    });
    it("parse 1+2\n+4\n*5\n*3==7", function() {
      return expect(str(parse('1+2\n+4\n*5\n*3==7'))).to.deep.equal("[binary! * [binary! * [binary! + [binary! + 1 2] 4] 5] [binary! == 3 7]]");
    });
    it("parse 1/\n2", function() {
      return expect(function() {
        return parse('1/\n2');
      }).to["throw"](/unexpected new line/);
    });
    return it("parse 1+2\n+4/\n*5\n*3==7", function() {
      return expect(function() {
        return parse('1+2\n+4/\n*5\n*3==7');
      }).to["throw"](/unexpected new line/);
    });
  });
  describe("indent expression: ", function() {
    it("parse 1\n *3", function() {
      return expect(str(parse('1\n *3'))).to.deep.equal("[binary! * 1 [indentExpression! 3]]");
    });
    it("parse (1\n *3\n)", function() {
      return expect(str(parse('(1\n *3\n)'))).to.deep.equal("[() [binary! * 1 [indentExpression! 3]]]");
    });
    it("parse 1\n *3\n/ 5", function() {
      return expect(str(parse('1\n *3\n/ 5'))).to.deep.equal("[binary! / [binary! * 1 [indentExpression! 3]] 5]");
    });
    it("parse 1+2\n* 3+6", function() {
      return expect(str(parse('1+2\n* 3+6'))).to.deep.equal('[binary! * [binary! + 1 2] [binary! + 3 6]]');
    });
    it("parse 1+2\n * 3", function() {
      return expect(str(parse('1+2\n * 3'))).to.deep.equal("[binary! * [binary! + 1 2] [indentExpression! 3]]");
    });
    it("parse 1+2\n * 3+6", function() {
      return expect(str(parse('1+2\n * 3+6'))).to.deep.equal("[binary! * [binary! + 1 2] [indentExpression! [binary! + 3 6]]]");
    });
    return it("parse 1+2\n * 3+6\n + 5+8", function() {
      return expect(str(parse('1+2\n * 3+6\n + 5+8'))).to.deep.equal("[binary! * [binary! + 1 2] [indentExpression! [binary! + [binary! + 3 6] [binary! + 5 8]]]]");
    });
  });
  describe("attribute!, index!: ", function() {
    it("parse a.b", function() {
      return expect(str(parse('a.b'))).to.deep.equal('[binary! . a b]');
    });
    it("parse %a.b", function() {
      return expect(str(parse('%a.b'))).to.deep.equal("[binary! . [prefix! % a] b]");
    });
    it("parse %a()", function() {
      return expect(str(parse('%a()'))).to.deep.equal("[binary! concat() [prefix! % a] [()]]");
    });
    it("parse a.b.c", function() {
      return expect(str(parse('a.b.c'))).to.deep.equal("[binary! . [binary! . a b] c]");
    });
    it("parse a.b()", function() {
      return expect(str(parse('a.b()'))).to.deep.equal("[binary! concat() [binary! . a b] [()]]");
    });
    it("parse @b.c", function() {
      return expect(str(parse('@b.c'))).to.deep.equal("[binary! . [prefix! @ b] c]");
    });
    it("parse @b()", function() {
      return expect(str(parse('@b()'))).to.deep.equal("[binary! concat() [prefix! @ b] [()]]");
    });
    it("parse a . b", function() {
      return expect(str(parse('a . b'))).to.deep.equal("[binary! . a b]");
    });
    it("parse a[1]", function() {
      return expect(str(parse('a[1]'))).to.deep.equal("[binary! concat[] a [[] [line! [1]]]]");
    });
    it("parse a (1)", function() {
      return expect(str(parse('a (1)'))).to.equal('a');
    });
    it("parse a [1]", function() {
      return expect(str(parse('a [1]'))).to.equal('a');
    });
    it("parse a[1][2]", function() {
      return expect(str(parse('a[1][2]'))).to.deep.equal("[binary! concat[] [binary! concat[] a [[] [line! [1]]]] [[] [line! [2]]]]");
    });
    nit("parse a&/b", function() {
      return expect(str(parse('a&/b'))).to.deep.equal('[index! a b]');
    });
    nit("parse a&/(1,2)", function() {
      return expect(str(parse('a&/(1,2)'))).to.deep.equal('[index! a [, 1 2]]');
    });
    nit("parse '1'&/1", function() {
      return expect(str(parse("'1'&/1"))).to.deep.equal("[index! \"1\" 1]");
    });
    return nit("parse '1'&/(1,2)", function() {
      return expect(str(parse("'1'&/(1,2)"))).to.deep.equal("[index! \"1\" [, 1 2]]");
    });
  });
  describe("call: ", function() {
    it("parse a(1)", function() {
      return expect(str(parse('a(1)'))).to.deep.equal("[binary! concat() a [() 1]]");
    });
    it("parse a(1)(2)", function() {
      return expect(str(parse('a(1)(2)'))).to.deep.equal("[binary! concat() [binary! concat() a [() 1]] [() 2]]");
    });
    it("parse a(1 , 2)", function() {
      return expect(str(parse('a(1 , 2)'))).to.deep.equal("[binary! concat() a [() [binary! , 1 2]]]");
    });
    return it("parse a(1 , 2 , 3)", function() {
      return expect(str(parse('a(1 , 2 , 3)'))).to.deep.equal("[binary! concat() a [() [binary! , [binary! , 1 2] 3]]]");
    });
  });
  describe("ellipsis: ", function() {
    return it("parse 1...5", function() {
      return expect(str(parse('1...5'))).to.deep.equal("[binary! ... 1 5]");
    });
  });
  describe("unquote: ", function() {
    it("parse ^a", function() {
      return expect(str(parse('^a'))).to.deep.equal('[prefix! ^ a]');
    });
    it("parse ^&a", function() {
      return expect(str(parse('^&a'))).to.deep.equal("[prefix! ^& a]");
    });
    return it("parse ^& a", function() {
      return expect(str(parse('^& a'))).to.deep.equal("[prefix! ^& a]");
    });
  });
  describe("comma expression: ", function() {
    it("parse 1 , 2", function() {
      return expect(str(parse('1 , 2'))).to.deep.equal('[binary! , 1 2]');
    });
    it("parse (1 , 2)", function() {
      return expect(str(parse('(1 , 2)'))).to.deep.equal("[() [binary! , 1 2]]");
    });
    it("parse 1 , 2 , 3", function() {
      return expect(str(parse('1 , 2 , 3'))).to.deep.equal("[binary! , [binary! , 1 2] 3]");
    });
    return it("parse (1 , 2 , 3)", function() {
      return expect(str(parse('(1 , 2 , 3)'))).to.deep.equal("[() [binary! , [binary! , 1 2] 3]]");
    });
  });
  describe("assign and right assocciation: ", function() {
    it("parse a=1", function() {
      return expect(str(parse('a=1'))).to.deep.equal('[binary! = a 1]');
    });
    it("parse a = 1", function() {
      return expect(str(parse('a = 1'))).to.deep.equal('[binary! = a 1]');
    });
    it("parse a = b = 1", function() {
      return expect(str(parse('a = b = 1'))).to.deep.equal('[binary! = a [binary! = b 1]]');
    });
    return it("parse a += b = 1", function() {
      return expect(str(parse('a += b = 1'))).to.deep.equal('[binary! += a [binary! = b 1]]');
    });
  });
  return ndescribe("ternary, i.e. condition expression: ", function() {
    it("parse 1 ?  2 :  3", function() {
      return expect(str(parse('1 ?  2 :  3'))).to.deep.equal('[?: 1 2 3]');
    });
    it("parse 1 ?  (a = 3) :  (b = 4)", function() {
      return expect(str(parse('1 ?  (a = 3) :  (b = 4)'))).to.deep.equal('[?: 1 [= a 3] [= b 4]]');
    });
    return it("parse a = 1 ?  2 :  3", function() {
      return expect(str(parse('a = 1 ?  2 :  3'))).to.deep.equal('[= a [?: 1 2 3]]');
    });
  });
});
