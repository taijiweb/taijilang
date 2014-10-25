var BLOCK_COMMENT, COMPACT_CLAUSE_EXPRESSION, EOI, HALF_DENT, IDENTIFIER, INDENT, NEWLINE, NUMBER, OPERATOR_EXPRESSION, PAREN, PAREN_OPERATOR_EXPRESSION, Parser, SPACE, SPACE_CLAUSE_EXPRESSION, UNDENT, chai, constant, expect, idescribe, iit, isArray, lib, matchRule, ndescribe, nit, str, _ref;

chai = require("chai");

expect = chai.expect;

iit = it.only;

idescribe = describe.only;

ndescribe = function() {};

nit = function() {};

lib = '../../lib/';

_ref = require(lib + 'parser/base'), constant = _ref.constant, isArray = _ref.isArray, str = _ref.str;

Parser = require(lib + 'parser').Parser;

IDENTIFIER = constant.IDENTIFIER, NUMBER = constant.NUMBER, NEWLINE = constant.NEWLINE, INDENT = constant.INDENT, UNDENT = constant.UNDENT, HALF_DENT = constant.HALF_DENT, PAREN = constant.PAREN, BLOCK_COMMENT = constant.BLOCK_COMMENT, EOI = constant.EOI, SPACE = constant.SPACE, PAREN_OPERATOR_EXPRESSION = constant.PAREN_OPERATOR_EXPRESSION, COMPACT_CLAUSE_EXPRESSION = constant.COMPACT_CLAUSE_EXPRESSION, SPACE_CLAUSE_EXPRESSION = constant.SPACE_CLAUSE_EXPRESSION, OPERATOR_EXPRESSION = constant.OPERATOR_EXPRESSION;

matchRule = function(parser, rule) {
  return function() {
    var token;
    token = parser.matchToken();
    if (token.type === NEWLINE) {
      parser.matchToken();
    }
    if (token.type === SPACE) {
      parser.matchToken();
    }
    return rule();
  };
};

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
      return expect(str(parse('+1 '))).to.deep.equal("[+x 1]");
    });
    it('should parse !1', function() {
      return expect(str(parse('!1 '))).to.deep.equal("[!x 1]");
    });
    it('should parse + 1', function() {
      return expect(str(parse('+ 1 '))).to.deep.equal("[+x 1]");
    });
    it('should parse + + 1', function() {
      return expect(str(parse('+ + 1 '))).to.deep.equal("[+x [+x 1]]");
    });
    it('should parse %lineno', function() {
      return expect(str(parse('%lineno'))).to.deep.equal("[%x lineno]");
    });
    return it('should parse %lineno()', function() {
      return expect(str(parse('%lineno()'))).to.deep.equal("[call! [%x lineno] []]");
    });
  });
  describe("add and multiply: ", function() {
    it("parse 1+2", function() {
      return expect(str(parse('1+2'))).to.deep.equal('[+ 1 2]');
    });
    it("parse 1+.!2", function() {
      return expect(str(parse('1+.!2'))).to.deep.equal("[+ 1 [!x 2]]");
    });
    it("parse 1 + 2", function() {
      return expect(str(parse('1 + 2'))).to.deep.equal('[+ 1 2]');
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
      return expect(str(parse('(1, 2)'))).to.deep.equal('[, 1 2]');
    });
    it("parse (1, 2+3)", function() {
      return expect(str(parse('(1, 2+3)'))).to.deep.equal('[, 1 [+ 2 3]]');
    });
    it("parse (1,2 + 3)", function() {
      return expect(str(parse('(1,2 + 3)'))).to.deep.equal("[+ [, 1 2] 3]");
    });
    it("parse (1 +2)", function() {
      return expect(function() {
        return parse('(1 +2)');
      }).to["throw"](/should have spaces at its right side/);
    });
    it("parse 1+2 * 3", function() {
      return expect(str(parse('1+2 * 3'))).to.deep.equal('[* [+ 1 2] 3]');
    });
    it("parse 1 + 2*3", function() {
      return expect(str(parse('1 + 2*3'))).to.deep.equal('[+ 1 [* 2 3]]');
    });
    it("parse 1+2+3", function() {
      return expect(str(parse('1+2+3'))).to.deep.equal("[+ [+ 1 2] 3]");
    });
    it("parse 1+2+3+4+5+6", function() {
      return expect(str(parse('1+2+3+4+5+6'))).to.deep.equal("[+ [+ [+ [+ [+ 1 2] 3] 4] 5] 6]");
    });
    it("parse 1*2+3+4+5+6", function() {
      return expect(str(parse('1*2+3+4+5+6'))).to.deep.equal("[+ [+ [+ [+ [* 1 2] 3] 4] 5] 6]");
    });
    it("parse 1*2+3+4*5+6", function() {
      return expect(str(parse('1*2+3+4*5+6'))).to.deep.equal("[+ [+ [+ [* 1 2] 3] [* 4 5]] 6]");
    });
    it("parse 1 + 2+3", function() {
      return expect(str(parse('1 + 2+3'))).to.deep.equal("[+ 1 [+ 2 3]]");
    });
    it("parse 1+2*3", function() {
      return expect(str(parse('1+2*3'))).to.deep.equal('[+ 1 [* 2 3]]');
    });
    it("parse 1+2/3", function() {
      return expect(str(parse('1+2/3'))).to.deep.equal('[+ 1 [/ 2 3]]');
    });
    it("parse 1*2+3", function() {
      return expect(str(parse('1*2+3'))).to.deep.equal("[+ [* 1 2] 3]");
    });
    it("parse 1*(2+3)", function() {
      return expect(str(parse('1*(2+3)'))).to.deep.equal('[* 1 [+ 2 3]]');
    });
    it("parse (1)", function() {
      return expect(str(parse('(1)'))).to.deep.equal('1');
    });
    return it("parse (1+2)*(3+4)", function() {
      return expect(str(parse('(1+2)*(3+4)'))).to.deep.equal('[* [+ 1 2] [+ 3 4]]');
    });
  });
  describe("multi lines expression: ", function() {
    it("parse 1+2\n*3", function() {
      return expect(str(parse('1+2\n*3'))).to.deep.equal('[* [+ 1 2] 3]');
    });
    it("parse 1+2\n* 3", function() {
      return expect(str(parse('1+2\n* 3'))).to.deep.equal('[* [+ 1 2] 3]');
    });
    it("parse 1+2\n+4\n*3", function() {
      return expect(str(parse('1+2\n+4\n*3'))).to.deep.equal('[* [+ [+ 1 2] 4] 3]');
    });
    it("parse 1+2\n+4*3", function() {
      return expect(str(parse('1+2\n+4\n*3'))).to.deep.equal('[* [+ [+ 1 2] 4] 3]');
    });
    it("parse 1+2\n+4\n*3\n/6", function() {
      return expect(str(parse('1+2\n+4\n*3\n/6'))).to.deep.equal('[/ [* [+ [+ 1 2] 4] 3] 6]');
    });
    it("parse 1+2\n+4\n*3\n&6", function() {
      return expect(str(parse('1+2\n+4\n*3\n&6'))).to.deep.equal("[& [* [+ [+ 1 2] 4] 3] 6]");
    });
    it("parse 1+2\n+4\n*.!3\n&6+8*(9-3)", function() {
      return expect(str(parse('1+2\n+4\n*.!3\n&6+8*(9-3)'))).to.deep.equal("[& [* [+ [+ 1 2] 4] [!x 3]] [+ 6 [* 8 [- 9 3]]]]");
    });
    it("parse 1+2\n+4\n/5\n*3==7", function() {
      return expect(str(parse('1+2\n+4\n/5\n*3==7'))).to.deep.equal("[* [/ [+ [+ 1 2] 4] 5] [== 3 7]]");
    });
    it("parse 1+2\n+4\n*5\n*3==7", function() {
      return expect(str(parse('1+2\n+4\n*5\n*3==7'))).to.deep.equal("[* [* [+ [+ 1 2] 4] 5] [== 3 7]]");
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
      return expect(str(parse('1\n *3'))).to.deep.equal('[* 1 3]');
    });
    it("parse (1\n *3\n)", function() {
      return expect(str(parse('(1\n *3\n)'))).to.deep.equal('[* 1 3]');
    });
    it("parse 1\n *3\n/ 5", function() {
      return expect(str(parse('1\n *3\n/ 5'))).to.deep.equal('[/ [* 1 3] 5]');
    });
    it("parse 1+2\n* 3+6", function() {
      return expect(str(parse('1+2\n* 3+6'))).to.deep.equal('[* [+ 1 2] [+ 3 6]]');
    });
    it("parse 1+2\n * 3", function() {
      return expect(str(parse('1+2\n * 3'))).to.deep.equal('[* [+ 1 2] 3]');
    });
    it("parse 1+2\n * 3+6", function() {
      return expect(str(parse('1+2\n * 3+6'))).to.deep.equal('[* [+ 1 2] [+ 3 6]]');
    });
    return it("parse 1+2\n * 3+6\n + 5+8", function() {
      return expect(str(parse('1+2\n * 3+6\n + 5+8'))).to.deep.equal("[* [+ 1 2] [+ [+ 3 6] [+ 5 8]]]");
    });
  });
  describe("attribute!, index!: ", function() {
    it("parse a.b", function() {
      return expect(str(parse('a.b'))).to.deep.equal('[attribute! a b]');
    });
    it("parse %a.b", function() {
      return expect(str(parse('%a.b'))).to.deep.equal("[attribute! [%x a] b]");
    });
    it("parse %a()", function() {
      return expect(str(parse('%a()'))).to.deep.equal("[call! [%x a] []]");
    });
    it("parse a.b.c", function() {
      return expect(str(parse('a.b.c'))).to.deep.equal("[attribute! [attribute! a b] c]");
    });
    it("parse a.b()", function() {
      return expect(str(parse('a.b()'))).to.deep.equal('[call! [attribute! a b] []]');
    });
    it("parse @b.c", function() {
      return expect(str(parse('@b.c'))).to.deep.equal("[attribute! [attribute! @ b] c]");
    });
    it("parse @b()", function() {
      return expect(str(parse('@b()'))).to.deep.equal("[call! [attribute! @ b] []]");
    });
    it("parse a . b", function() {
      return expect(str(parse('a . b'))).to.deep.equal('[attribute! a b]');
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
    nit("parse '1'&/(1,2)", function() {
      return expect(str(parse("'1'&/(1,2)"))).to.deep.equal("[index! \"1\" [, 1 2]]");
    });
    it("parse a[1]", function() {
      return expect(str(parse('a[1]'))).to.deep.equal('[index! a 1]');
    });
    it("parse a (1)", function() {
      return expect(str(parse('a (1)'))).to.equal('a');
    });
    it("parse a [1]", function() {
      return expect(str(parse('a [1]'))).to.equal('a');
    });
    return it("parse a[1][2]", function() {
      return expect(str(parse('a[1][2]'))).to.deep.equal('[index! [index! a 1] 2]');
    });
  });
  describe("call: ", function() {
    it("parse a(1)", function() {
      return expect(str(parse('a(1)'))).to.deep.equal('[call! a [1]]');
    });
    it("parse a(1 , 2)", function() {
      return expect(str(parse('a(1 , 2)'))).to.deep.equal("[call! a [1 2]]");
    });
    return it("parse a(1 , 2 , 3)", function() {
      return expect(str(parse('a(1 , 2 , 3)'))).to.deep.equal('[call! a [1 2 3]]');
    });
  });
  describe("ellipsis: ", function() {
    return it("parse 1...5", function() {
      return expect(str(parse('1...5'))).to.deep.equal("[... 1 5]");
    });
  });
  describe("unquote: ", function() {
    it("parse ^a", function() {
      return expect(str(parse('^a'))).to.deep.equal('[unquote! a]');
    });
    it("parse ^&a", function() {
      return expect(str(parse('^&a'))).to.deep.equal("[unquote-splice a]");
    });
    return it("parse ^& a", function() {
      return expect(str(parse('^& a'))).to.deep.equal("[unquote-splice a]");
    });
  });
  describe("comma expression: ", function() {
    it("parse 1 , 2", function() {
      return expect(str(parse('1 , 2'))).to.deep.equal('[, 1 2]');
    });
    it("parse (1 , 2)", function() {
      return expect(str(parse('(1 , 2)'))).to.deep.equal('[, 1 2]');
    });
    it("parse 1 , 2 , 3", function() {
      return expect(str(parse('1 , 2 , 3'))).to.deep.equal('[, 1 2 3]');
    });
    return it("parse (1 , 2 , 3)", function() {
      return expect(str(parse('(1 , 2 , 3)'))).to.deep.equal('[, 1 2 3]');
    });
  });
  describe("assign and right assocciation: ", function() {
    it("parse a=1", function() {
      return expect(str(parse('a=1'))).to.deep.equal('[= a 1]');
    });
    it("parse a = 1", function() {
      return expect(str(parse('a = 1'))).to.deep.equal('[= a 1]');
    });
    it("parse a = b = 1", function() {
      return expect(str(parse('a = b = 1'))).to.deep.equal('[= a [= b 1]]');
    });
    return it("parse a += b = 1", function() {
      return expect(str(parse('a += b = 1'))).to.deep.equal('[+= a [= b 1]]');
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
