var Parser, chai, constant, expect, getOperatorExpression, idescribe, iit, isArray, lib, ndescribe, str, _ref;

chai = require("chai");

expect = chai.expect;

iit = it.only;

idescribe = describe.only;

ndescribe = function() {};

lib = '../../lib/';

_ref = require(lib + 'parser/base'), constant = _ref.constant, isArray = _ref.isArray, str = _ref.str;

getOperatorExpression = require(lib + 'parser/operator').getOperatorExpression;

Parser = require(lib + 'parser').Parser;

describe("parse operator expression: ", function() {
  var parse;
  parse = function(text) {
    var parser, x;
    parser = new Parser();
    return x = getOperatorExpression(parser.parse(text, parser.operatorExpression, 0));
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
      return expect(str(parse('%lineno'))).to.deep.equal("[% lineno]");
    });
    return it('should parse %lineno()', function() {
      return expect(str(parse('%lineno()'))).to.deep.equal("[call! [% lineno] []]");
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
      }).to["throw"](/unexpected spaces or new lines after binary operator/);
    });
    return it("parse 1+2\n+4/\n*5\n*3==7", function() {
      return expect(function() {
        return parse('1+2\n+4/\n*5\n*3==7');
      }).to["throw"](/unexpected spaces or new lines after binary operator/);
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
      return expect(str(parse('%a.b'))).to.deep.equal("[attribute! [% a] b]");
    });
    it("parse %a()", function() {
      return expect(str(parse('%a()'))).to.deep.equal("[call! [% a] []]");
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
    it("parse a&/b", function() {
      return expect(str(parse('a&/b'))).to.deep.equal('[index! a b]');
    });
    it("parse a&/(1,2)", function() {
      return expect(str(parse('a&/(1,2)'))).to.deep.equal('[index! a [, 1 2]]');
    });
    it("parse '1'&/1", function() {
      return expect(str(parse("'1'&/1"))).to.deep.equal("[index! \"1\" 1]");
    });
    it("parse '1'&/(1,2)", function() {
      return expect(str(parse("'1'&/(1,2)"))).to.deep.equal("[index! \"1\" [, 1 2]]");
    });
    it("parse a[1]", function() {
      return expect(str(parse('a[1]'))).to.deep.equal('[index! a 1]');
    });
    it("parse a (1)", function() {
      return expect(function() {
        return parse('a (1)');
      }).to["throw"](/() as call operator should tightly close to the left caller/);
    });
    it("parse a [1]", function() {
      return expect(function() {
        return parse('a [1]');
      }).to["throw"](/subscript should tightly close to left operand/);
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
  return describe("ternary, i.e. condition expression: ", function() {
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
