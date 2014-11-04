var BLOCK_COMMENT, COMPACT_CLAUSE_EXPRESSION, EOI, HALF_DENT, IDENTIFIER, INDENT, NEWLINE, NUMBER, OPERATOR_EXPRESSION, PAREN, PAREN_OPERATOR_EXPRESSION, Parser, SPACE, SPACE_CLAUSE_EXPRESSION, UNDENT, chai, constant, expect, idescribe, iit, isArray, lib, matchRule, ndescribe, nit, str, _ref;

chai = require("chai");

expect = chai.expect;

iit = it.only;

idescribe = describe.only;

ndescribe = function() {};

nit = function() {};

lib = '../../lib/';

_ref = require(lib + 'parser/base'), constant = _ref.constant, isArray = _ref.isArray;

str = require(lib + 'utils').str;

Parser = require(lib + 'parser/parser').Parser;

matchRule = require('../utils').matchRule;

IDENTIFIER = constant.IDENTIFIER, NUMBER = constant.NUMBER, NEWLINE = constant.NEWLINE, INDENT = constant.INDENT, UNDENT = constant.UNDENT, HALF_DENT = constant.HALF_DENT, PAREN = constant.PAREN, BLOCK_COMMENT = constant.BLOCK_COMMENT, EOI = constant.EOI, SPACE = constant.SPACE, PAREN_OPERATOR_EXPRESSION = constant.PAREN_OPERATOR_EXPRESSION, COMPACT_CLAUSE_EXPRESSION = constant.COMPACT_CLAUSE_EXPRESSION, SPACE_CLAUSE_EXPRESSION = constant.SPACE_CLAUSE_EXPRESSION, OPERATOR_EXPRESSION = constant.OPERATOR_EXPRESSION;

ndescribe("parser basic: ", function() {
  describe("matchToken: ", function() {
    var parse, parser;
    parser = new Parser();
    parse = function(text) {
      var x;
      return x = parser.parse(text, parser.matchToken, 0);
    };
    describe("parse number: ", function() {
      describe("is number: ", function() {
        it("parse 1", function() {
          return expect(parse('1').value).to.equal(1);
        });
        it("parse 01", function() {
          return expect(parse('01').value).to.equal(1);
        });
        it("parse 0x01", function() {
          return expect(parse('0x01').value).to.equal(1);
        });
        it("parse 0xa", function() {
          return expect(parse('0xa').value).to.equal(10);
        });
        it("parse 1.", function() {
          expect(parse('1.').value).to.equal(1);
          expect(parser.cursor()).to.equal(1);
          return expect(parser.endOfInput()).to.equal(false);
        });
        it("parse 1.e0", function() {
          return expect(parse('1.e0').value).to.equal(1);
        });
        it("parse 1.0e023", function() {
          var x;
          x = parse('1.0e023');
          return expect(x.value).to.equal(1.0e23);
        });
        it("parse 1.0e-23", function() {
          return expect(parse('1.0e-23').value).to.equal(1.0e-23);
        });
        it("parse 1.e-23", function() {
          var x;
          x = parse('1.e-23');
          return expect(x.value).to.equal(1.0e-23);
        });
        it("parse 1.0e+023", function() {
          return expect(parse('1.0e+23').value).to.equal(1.0e+23);
        });
        it("parse 1.e23", function() {
          return expect(parse('1.e23').value).to.equal(1.0e23);
        });
        it("parse 1e23", function() {
          return expect(parse('1e23').value).to.equal(1.0e23);
        });
        it("parse 1e023", function() {
          return expect(parse('1e023').value).to.equal(1.0e23);
        });
        it("parse 1.e", function() {
          return expect(parse('1.e').value).to.equal(1);
        });
        it("parse 1.ea", function() {
          return expect(parse('1.ea').value).to.equal(1);
        });
        it("parse 1.e+", function() {
          return expect(parse('1.e+').value).to.equal(1);
        });
        it("parse 1.e-", function() {
          return expect(parse('1.e-').value).to.equal(1);
        });
        return it("parse 1.e*", function() {
          return expect(parse('1.e*').value).to.equal(1);
        });
      });
      return describe("is not number: ", function() {
        it("parse .1", function() {
          return expect(parse('.1').type).not.to.equal(NUMBER);
        });
        it("parse +1.", function() {
          return expect(parse('+1.').type).not.to.equal(NUMBER);
        });
        it("parse +1.e0", function() {
          return expect(parse('+1.e0').type).not.to.equal(NUMBER);
        });
        it("parse -.1", function() {
          return expect(parse('-.1').type).not.to.equal(NUMBER);
        });
        it("parse +1.e023", function() {
          return expect(parse('+1.e023').type).not.to.equal(NUMBER);
        });
        it("parse +1.e", function() {
          return expect(parse('+1.e').type).not.to.equal(NUMBER);
        });
        it("parse +.e", function() {
          return expect(parse('+.e').type).not.to.equal(NUMBER);
        });
        it("parse +.", function() {
          return expect(parse('+.').type).not.to.equal(NUMBER);
        });
        return it("parse -.", function() {
          return expect(parse('-.').type).not.to.equal(NUMBER);
        });
      });
    });
    describe("parse identifier: ", function() {
      it("parse a", function() {
        expect(str(parse('a'))).to.equal('a');
        return expect(parser.token().type).to.equal(IDENTIFIER);
      });
      it("parse ?", function() {
        parse('?');
        return expect(parser.token().type).to.not.equal(IDENTIFIER);
      });
      it("parse #", function() {
        parse('?');
        return expect(parser.token().type).to.not.equal(IDENTIFIER);
      });
      return it("parse !ds", function() {
        parse('?');
        return expect(parser.token().type).to.not.equal(IDENTIFIER);
      });
    });
    ndescribe("parse taijiIdentifier: ", function() {
      it("parse a", function() {
        return expect(parse('a')).to.equal('a');
      });
      it("parse ?", function() {
        return expect(parse('?')).to.equal(void 0);
      });
      it("parse #", function() {
        return expect(parse('#')).to.equal(void 0);
      });
      it("parse !ds", function() {
        return expect(parse('!ds')).to.equal(void 0);
      });
      it("parse a!", function() {
        return expect(parse('a!')).to.equal('a!');
      });
      it("parse a!#", function() {
        return expect(parse('a!#')).to.equal('a!');
      });
      it("parse $a", function() {
        return expect(parse('$a')).to.equal('$a');
      });
      it("parse $a_", function() {
        return expect(parse('$a_')).to.equal('$a_');
      });
      it("parse $a_1", function() {
        return expect(parse('$a_1')).to.equal('$a_1');
      });
      it("parse _1", function() {
        return expect(parse('_1')).to.equal('_1');
      });
      return it("parse _a1", function() {
        return expect(parse('_a1')).to.equal('_a1');
      });
    });
    describe("parse escaped string symbol:", function() {
      return it("parse \\'x...'", function() {
        return expect(str(parse("\\'x...'"))).to.equal("\"x...\"");
      });
    });
    describe("parse interpolate string: ", function() {
      it("parse a", function() {
        return expect(str(parse('"a"'))).to.equal('[string! "a"]');
      });
      it("parse $a", function() {
        return expect(str(parse('"$a"'))).to.equal("[string! a]");
      });
      it("parse $a:", function() {
        return expect(str(parse('"$a:"'))).to.equal("[string! \"a:\" a]");
      });
      it("parse $a\\:", function() {
        return expect(str(parse('"$a\\:"'))).to.equal("[string! a \"\\:\"]");
      });
      it("parse $", function() {
        return expect(str(parse('"$"'))).to.equal("[string! \"$\"]");
      });
      it("parse a\\b", function() {
        return expect(str(parse('"a\\b"'))).to.equal('[string! "a\\b"]');
      });
      it("parse '''a\"'\\n'''", function() {
        return expect(str(parse('"""a\\"\'\\n"""'))).to.equal("[string! \"a\\\\\"'\\\\n\"]");
      });
      it("parse \"a(1)\" ", function() {
        return expect(str(parse('"a(1)"'))).to.equal("[string! \"a\" 1]");
      });
      it("parse \"a[1]\" ", function() {
        return expect(str(parse('"a[1]"'))).to.equal("[string! \"a\" [list! 1]]");
      });
      return it("str parse \"a[1] = $a[1]\" ", function() {
        return expect(str(parse('"a[1] = $a[1]"'))).to.equal("[string! \"a\" [list! 1] \" = \" [index! a [list! 1]]]");
      });
    });
    describe("parse raw string without interpolation: ", function() {
      it("parse '''a\\b'''", function() {
        return expect(str(parse("'''a\\b'''"))).to.equal('"a\\\\b"');
      });
      it("parse '''\\\na\\b'''", function() {
        return expect(str(parse("'''\\\na\\b'''"))).to.equal('"a\\\\b"');
      });
      it("parse '''a\\b\ncd'''", function() {
        return expect(str(parse("'''a\\b\ncd'''"))).to.equal("\"a\\\\b\\ncd\"");
      });
      it("parse '''a\\b\n\rcd'''", function() {
        return expect(str(parse("'''a\\b\n\rcd'''"))).to.equal("\"a\\\\b\\n\\rcd\"");
      });
      return it("parse '''a\"'\\n'''", function() {
        return expect(str(parse("'''a\"'\\n'''"))).to.equal("\"a\"'\\\\n\"");
      });
    });
    describe("parse escape string without interpolation: ", function() {
      it("parse 'a\\b'", function() {
        return expect(str(parse("'a\\b'"))).to.equal('"a\\b"');
      });
      it("parse 'a\\b\ncd'", function() {
        return expect(str(parse("'a\\b\ncd'"))).to.equal('"a\\b\\ncd"');
      });
      it("parse 'a\\b\\\ncd'", function() {
        return expect(str(parse("'a\\b\\\ncd'"))).to.equal('"a\\bcd"');
      });
      it("parse 'a\"\\\"\'\\n'", function() {
        return expect(str(parse("'a\"\\\"\\'\\n'"))).to.equal('"a\"\\\"\'\\n"');
      });
      it("parse 'a\"\\\"\\'\\n\n'", function() {
        return expect(str(parse("'a\"\\\"\\'\\n\n'"))).to.equal('"a\"\\\"\'\\n\\n"');
      });
      return it("parse 'a\"\\\"\n\'\\n'", function() {
        return expect(str(parse("'a\"\\\"\n\\'\\n\n'"))).to.equal('"a\"\\\"\\n\'\\n\\n"');
      });
    });
    describe("parse regexp: ", function() {
      return it("parse /!-h\b|-r\b|-v\b|-b\b/", function() {
        return expect(str(parse('/!-h\b|-r\b|-v\b|-b\b/'))).to.equal("[regexp! /-h\b|-r\b|-v\b|-b\b/]");
      });
    });
    describe("symbol: ", function() {
      it('should parse ==1', function() {
        return expect(str(parse('==1'))).to.equal('==');
      });
      it('should parse @@@1', function() {
        return expect(str(parse('@@@1'))).to.equal('@@@');
      });
      it('should parse +.1', function() {
        return expect(str(parse('+.1'))).to.equal('+');
      });
      it('should parse .1', function() {
        return expect(str(parse('.1'))).to.equal('.');
      });
      it('should parse ../', function() {
        return expect(str(parse('../'))).to.equal('..');
      });
      it('should parse :::1', function() {
        return expect(str(parse(':::1'))).to.equal(':::');
      });
      return it('should parse (++', function() {
        return expect(function() {
          return parse('(++');
        }).to["throw"](/expect \)/);
      });
    });
    return describe("simple token: ", function() {
      it("parse toString", function() {
        return expect(str(parse('toString'))).to.equal('toString');
      });
      it("parse 123", function() {
        return expect(str(parse('123'))).to.equal('123');
      });
      it("parse 123.5", function() {
        return expect(str(parse('123.5'))).to.equal('123.5');
      });
      it("parse 123.5e4", function() {
        return expect(str(parse('123.5e4'))).to.equal("1235000");
      });
      it("parse @@@", function() {
        return expect(str(parse('@@@'))).to.equal('@@@');
      });
      it("parse :::", function() {
        return expect(str(parse(':::'))).to.equal(':::');
      });
      it("parse ...", function() {
        return expect(str(parse('...'))).to.equal('...');
      });
      it("parse #==", function() {
        return expect(str(parse('#=='))).to.equal('#==');
      });
      it("parse *//stop at line comment", function() {
        return expect(str(parse('*//stop at line comment'))).to.equal('*');
      });
      it("parse */!stop at regexp", function() {
        return expect(str(parse('*/!stop at regexp/'))).to.equal('*');
      });
      it("parse +/+", function() {
        return expect(str(parse('+/+'))).to.equal('+/+');
      });
      it("parse +/(", function() {
        return expect(str(parse('+/('))).to.equal('+/');
      });
      it("parse \\/(", function() {
        return expect(str(parse("\\/("))).to.equal('\\/');
      });
      return it("parse */*multiply*/", function() {
        return expect(str(parse('*/*multiply*/'))).to.equal('*');
      });
    });
  });
  describe("prefixOperator: ", function() {
    var parse;
    parse = function(text) {
      var parser, prefixOperator, x;
      parser = new Parser();
      prefixOperator = function() {
        return parser.prefixOperator('opExp');
      };
      x = parser.parse(text, matchRule(parser, prefixOperator), 0);
      if (x) {
        return x.value;
      } else {

      }
    };
    it('should parse ++1', function() {
      return expect(parse('++1')).to.equal('++x');
    });
    it('should parse new', function() {
      return expect(parse('new a')).to.equal('new');
    });
    it('should parse new.a', function() {
      return expect(parse('new.a')).to.equal('new');
    });
    it('should parse +a', function() {
      return expect(parse('+a')).to.equal('+x');
    });
    it('should parse +\n a', function() {
      return expect(parse('+a')).to.equal('+x');
    });
    it('should parse +/**/a', function() {
      return expect(parse('+/**/a')).to.equal('+x');
    });
    return it('should parse +/**/)', function() {
      return expect(parse('+/**/)')).to.equal('+x');
    });
  });
  describe("suffixOperator: ", function() {
    var parse;
    parse = function(text) {
      var parser, x;
      parser = new Parser();
      x = parser.parse(text, (function() {
        parser.matchToken();
        return parser.suffixOperator(OPERATOR_EXPRESSION, {
          value: 0
        }, 0);
      }), 0);
      if (x) {
        return x.value;
      } else {

      }
    };
    it('should parse ++', function() {
      return expect(parse('++')).to.equal('x++');
    });
    return it('should parse .++', function() {
      return expect(parse('.++')).to.equal(void 0);
    });
  });
  describe("binaryOperator: ", function() {
    var parse;
    parse = function(text) {
      var parser, root, x;
      parser = new Parser();
      root = function() {
        parser.matchToken();
        return parser.binaryOperator(OPERATOR_EXPRESSION, {
          value: 0
        }, 0, true);
      };
      x = parser.parse(text, root, 0);
      if (x) {
        return x.value;
      } else {

      }
    };
    it('should parse ==1', function() {
      return expect(parse('==1')).to.equal('==');
    });
    it('should parse +1', function() {
      return expect(parse('+1')).to.equal('+');
    });
    return it('should parse and', function() {
      return expect(parse(' and 1')).to.equal('&&');
    });
  });
  describe("compact clause binaryOperator: ", function() {
    var parse;
    parse = function(text) {
      var parser, root, x;
      parser = new Parser();
      root = function() {
        parser.matchToken();
        return parser.binaryOperator(COMPACT_CLAUSE_EXPRESSION, {
          value: 0
        }, 0, true);
      };
      x = parser.parse(text, root, 0);
      if (x) {
        return x.value;
      } else {

      }
    };
    it('should parse ==1', function() {
      return expect(parse('==1')).to.equal('==');
    });
    it('should parse +1', function() {
      return expect(parse('+1')).to.equal('+');
    });
    it('should parse + 1', function() {
      return expect(parse(' + 1')).to.equal(void 0);
    });
    return it('should parse and 1', function() {
      return expect(parse(' and 1')).to.equal(void 0);
    });
  });
  describe("space clause binaryOperator: ", function() {
    var parse;
    parse = function(text) {
      var parser, root, x;
      parser = new Parser();
      root = function() {
        parser.matchToken();
        return parser.binaryOperator(SPACE_CLAUSE_EXPRESSION, {
          value: 0
        }, 0, true);
      };
      x = parser.parse(text, root, 0);
      if (x) {
        return x.value;
      } else {

      }
    };
    it('should parse ==1', function() {
      return expect(parse('==1')).to.equal('==');
    });
    it('should parse +1', function() {
      return expect(parse('+1')).to.equal('+');
    });
    it('should parse + 1', function() {
      return expect(parse(' + 1')).to.equal('+');
    });
    it('should parse and 1', function() {
      return expect(parse(' and 1')).to.equal('&&');
    });
    return describe("space and comment: ", function() {
      it("parse inline space comment", function() {
        var parser, x;
        parser = new Parser();
        parser.init('123   /*sfadl*/', 0);
        parser.matchToken();
        parser.matchToken();
        x = parser.token();
        return expect(x.value).to.equal('   /*sfadl*/');
      });
      it("parse multiple line space comment", function() {
        var parser, x;
        parser = new Parser();
        parser.init('123   /*sfadl*/ \n // line comment \n something', 0);
        parser.matchToken();
        parser.matchToken();
        x = parser.token();
        return expect(x.value).to.equal("   /*sfadl*/ \n ");
      });
      it("parse multiple line space comment 2", function() {
        var parser, x;
        parser = new Parser();
        parser.init('123   /*sfadl*/ \n// line comment \n// line comment 2\n something', 0);
        parser.matchToken();
        parser.matchToken();
        x = parser.token();
        return expect(x.value).to.equal("   /*sfadl*/ \n");
      });
      it("parse multiple line space comment 3", function() {
        var parser, x;
        parser = new Parser();
        parser.init('123   // line comment // line comment 2\n/*fds;j*/ something', 0);
        parser.matchToken();
        parser.matchToken();
        x = parser.token();
        return expect(x.value).to.equal("   // line comment // line comment 2\n");
      });
      it("parse multiple line space comment 4", function() {
        var parser, x;
        parser = new Parser();
        parser.init('123   // line comment \n// line comment 2\n/*fds;j*/ /*asdf\nkljl*/\n  something', 0);
        parser.matchToken();
        parser.matchToken();
        x = parser.token();
        expect(x.value).to.equal("   // line comment \n");
        parser.matchToken();
        x = parser.token();
        return expect(x.value).to.equal("// line comment 2\n");
      });
      return it("parse c style block comment leads more space lines", function() {
        var parser, x;
        parser = new Parser();
        parser.init('/*fdsafdsa*/// line comment \n// line comment 2\n/*fds;j*/ /*asdf\nkljl*/\n  something', 0);
        parser.matchToken();
        x = parser.token();
        return expect(x.value).to.equal("/*fdsafdsa*/// line comment \n");
      });
    });
  });
  describe("compact clause expression:", function() {
    var parse;
    parse = function(text) {
      var parser, x;
      parser = new Parser();
      return x = parser.parse(text, matchRule(parser, parser.compactClauseExpression), 0);
    };
    it('should parse a', function() {
      return expect(str(parse('a'))).to.equal("a");
    });
    it('should parse a.b', function() {
      return expect(str(parse('a.b'))).to.equal("[attribute! a b]");
    });
    it('should parse a.b.c', function() {
      return expect(str(parse('a.b.c'))).to.equal('[attribute! [attribute! a b] c]');
    });
    nit('should parse a&/b', function() {
      return expect(str(parse('a&/b'))).to.equal('[index! a b]');
    });
    nit('should parse a&/b&/c', function() {
      return expect(str(parse('a&/b&/c'))).to.equal('[index! [index! a b] c]');
    });
    it('should parse a(b)', function() {
      return expect(str(parse('a(b)'))).to.equal('[call! a [b]]');
    });
    it('should parse a()', function() {
      return expect(str(parse('a()'))).to.equal('[call! a []]');
    });
    it('should parse a::b ', function() {
      return expect(str(parse('a::b'))).to.equal('[attribute! [attribute! a ::] b]');
    });
    it('should parse ^1', function() {
      return expect(str(parse('^1'))).to.equal("[unquote! 1]");
    });
    it('should parse `.^1', function() {
      return expect(str(parse('`.^1'))).to.equal("[quasiquote! [unquote! 1]]");
    });
    it('should parse (a)', function() {
      return expect(str(parse('(a)'))).to.equal("a");
    });
    it('should parse Object.prototype.toString', function() {
      return expect(str(parse('Object.prototype.toString'))).to.equal("[attribute! [attribute! Object prototype] toString]");
    });
    it('should parse Object.prototype.toString.call', function() {
      return expect(str(parse('Object.prototype.toString.call'))).to.equal("[attribute! [attribute! [attribute! Object prototype] toString] call]");
    });
    it('should parse x.toString.call', function() {
      return expect(str(parse('x.toString.call'))).to.equal("[attribute! [attribute! x toString] call]");
    });
    it('should parse toString.call', function() {
      return expect(str(parse('toString.call'))).to.equal("[attribute! toString call]");
    });
    it("parse 1,/-h\b|-r\b|-v\b|-b\b/", function() {
      return expect(str(parse('1,/-h\b|-r\b|-v\b|-b\b/'))).to.equal('1');
    });
    it("parse 1+./!1/.test('1')", function() {
      return expect(str(parse("1+./!1/.test('1')"))).to.equal("[+ 1 [call! [attribute! [regexp! /1/] test] [\"1\"]]]");
    });
    it("parse x=./!1/", function() {
      return expect(str(parse('x=./!1/'))).to.equal("[= x [regexp! /1/]]");
    });
    return it("parse x=./!1/g", function() {
      return expect(str(parse('x=./!1/g'))).to.equal("[= x [regexp! /1/g]]");
    });
  });
  describe("parenthesis: ", function() {
    var parse;
    parse = function(text) {
      var parser, x;
      parser = new Parser();
      parser.init(text, 0);
      return x = parser.tokenFnMap['(']();
    };
    it('should parse ()', function() {
      var x;
      x = parse('()');
      expect(x.type).to.equal(PAREN);
      return expect(x.value).to.deep.equal([]);
    });
    it('should parse (a)', function() {
      var x;
      x = parse('(a)');
      expect(x.type).to.equal(PAREN);
      return expect(str(x.value)).to.equal('a');
    });
    return it('should parse (a,b)', function() {
      var x;
      x = parse('(a,b)');
      expect(x.type).to.equal(PAREN);
      return expect(str(x)).to.equal('[, a b]');
    });
  });
  describe("space clause expression:", function() {
    var parse;
    parse = function(text) {
      var parser, x;
      parser = new Parser();
      return x = parser.parse(text, matchRule(parser, parser.spaceClauseExpression), 0);
    };
    return it('should parse require.extensions[".tj"] = ->', function() {
      return expect(str(parse('require.extensions[".tj"] = ->'))).to.equal("[index! [attribute! require extensions] [string! \".tj\"]]");
    });
  });
  describe("@ as this", function() {
    var parse;
    parse = function(text) {
      var parser, x;
      parser = new Parser();
      return x = parser.parse(text, matchRule(parser, parser.operatorExpression), 0);
    };
    it('should parse @', function() {
      return expect(str(parse('@'))).to.equal('@');
    });
    it('should parse @a', function() {
      return expect(str(parse('@a'))).to.equal('[attribute! @ a]');
    });
    return it('should parse @ a', function() {
      return expect(str(parse('@ a'))).to.equal('@');
    });
  });
  ndescribe("definition parameter", function() {
    var parse;
    parse = function(text) {
      var parser, x;
      parser = new Parser();
      x = parser.parse(text, matchRule(parser, parser.parameterList), 0);
      return x;
    };
    it('should parse (a)', function() {
      return expect(str(parse('(a)'))).to.equal("[a]");
    });
    it('should parse (a, b)', function() {
      return expect(str(parse('(a, b)'))).to.equal("[a b]");
    });
    return it('should parse (a..., b)', function() {
      return expect(str(parse('(a..., b)'))).to.equal("[[x... a] b]");
    });
  });
  describe("definition", function() {
    var parse;
    parse = function(text) {
      var parser, x;
      parser = new Parser();
      x = parser.parse(text, matchRule(parser, parser.definitionSymbolBody), 0);
      return x;
    };
    return it('should parse -> 1', function() {
      return expect(str(parse('-> 1'))).to.equal("[-> [] 1]");
    });
  });
  describe("clause: ", function() {
    var parse;
    parse = function(text) {
      var parser, x;
      parser = new Parser();
      x = parser.parse(text, matchRule(parser, parser.clause), 0);
      return x;
    };
    describe("@ as this clause", function() {
      it('should parse @', function() {
        return expect(str(parse('@'))).to.equal('@');
      });
      it('should parse @a', function() {
        return expect(str(parse('@a'))).to.equal('[attribute! @ a]');
      });
      return it('should parse @ a', function() {
        return expect(str(parse('@ a'))).to.equal('[@ a]');
      });
    });
    describe("expression clause", function() {
      it('should parse 1\n2', function() {
        return expect(str(parse('1\n2'))).to.equal('1');
      });
      return it('should parse 1 + 2', function() {
        return expect(str(parse('1 + 2'))).to.equal("[+ 1 2]");
      });
    });
    describe("caller expression clause", function() {
      return it('should parse print 1', function() {
        return expect(str(parse('print 1\n2'))).to.equal("[print 1]");
      });
    });
    describe("sequence clause", function() {
      return it('should parse print 1 2', function() {
        return expect(str(parse('print 1 2'))).to.equal("[print 1 2]");
      });
    });
    describe("colon clause: ", function() {
      return it('should parse print: 1 + 2, 3', function() {
        return expect(str(parse('print: 1 + 2, 3'))).to.equal("[print [+ 1 2] 3]");
      });
    });
    describe(":: as prototype", function() {
      it('should parse @:: ', function() {
        return expect(str(parse('@::'))).to.equal('[attribute! @ ::]');
      });
      it('should parse a:: ', function() {
        return expect(str(parse('a::'))).to.equal('[attribute! a ::]');
      });
      it('should parse a::b ', function() {
        return expect(str(parse('a::b'))).to.equal('[attribute! [attribute! a ::] b]');
      });
      return it('should parse ::a', function() {
        return expect(str(parse('::a'))).to.equal('[attribute! :: a]');
      });
    });
    describe("quote! expression: ", function() {
      it('should parse ~ a.b', function() {
        return expect(str(parse('~ a.b'))).to.equal('[quote! [attribute! a b]]');
      });
      it('should parse ~ print a b', function() {
        return expect(str(parse('~ print a b'))).to.equal('[quote! [print a b]]');
      });
      it('should parse ` print a b', function() {
        return expect(str(parse('` print a b'))).to.equal('[quasiquote! [print a b]]');
      });
      it('should parse ~ print : min a \n abs b', function() {
        return expect(str(parse('~ print : min a \n abs b'))).to.equal('[quote! [print [min a [abs b]]]]');
      });
      return it('should parse ` a.b', function() {
        return expect(str(parse('` a.b'))).to.equal('[quasiquote! [attribute! a b]]');
      });
    });
    describe("unquote! expression: ", function() {
      it('should parse ^ a.b', function() {
        return expect(str(parse('^ a.b'))).to.equal('[unquote! [attribute! a b]]');
      });
      it('should parse ^ print a b', function() {
        return expect(str(parse('^ print a b'))).to.equal('[unquote! [print a b]]');
      });
      return it('should parse `.^1', function() {
        return expect(str(parse('`.^1'))).to.equal("[quasiquote! [unquote! 1]]");
      });
    });
    return describe("unquote-splice expression", function() {
      it('should parse ^& a.b', function() {
        return expect(str(parse('^& a.b'))).to.equal('[unquote-splice [attribute! a b]]');
      });
      it('should parse ^&a.b', function() {
        return expect(str(parse('^&a.b'))).to.equal('[unquote-splice [attribute! a b]]');
      });
      it('should parse (^&a).b', function() {
        return expect(str(parse('(^&a).b'))).to.equal("[attribute! [unquote-splice a] b]");
      });
      it('should parse ^@ print a b', function() {
        return expect(str(parse('^& print a b'))).to.equal('[unquote-splice [print a b]]');
      });
      return it('should parse ^print a b', function() {
        return expect(str(parse('^print a b'))).to.equal("[[unquote! print] a b]");
      });
    });
  });
  describe("hash: ", function() {
    describe("hash item: ", function() {
      var parse;
      parse = function(text) {
        var parser, x;
        parser = new Parser();
        return x = parser.parse(text, matchRule(parser, parser.hashItem), 0);
      };
      it('should parse 1:2', function() {
        return expect(str(parse('1:2'))).to.equal('[jshashitem! 1 2]');
      });
      it('should parse a:2', function() {
        return expect(str(parse('a:2'))).to.equal('[jshashitem! a 2]');
      });
      return it('should parse a->2', function() {
        return expect(str(parse('a->2'))).to.equal('[pyhashitem! a 2]');
      });
    });
    return describe("hash expression: ", function() {
      var parse;
      parse = function(text) {
        var parser, x;
        parser = new Parser();
        return x = parser.parse(text, parser.matchToken, 0);
      };
      it('should parse {. 1:2 }', function() {
        return expect(str(parse('{. 1:2 }'))).to.equal('[hash! [jshashitem! 1 2]]');
      });
      it('should parse {.1:2; 3:4}', function() {
        return expect(str(parse('{.1:2; 3:4}'))).to.equal('[hash! [jshashitem! 1 2] [jshashitem! 3 4]]');
      });
      it('should parse {.1:2; 3:abs\n    5}', function() {
        return expect(str(parse('{. 1:2; 3:abs\n    5}'))).to.equal('[hash! [jshashitem! 1 2] [jshashitem! 3 [abs 5]]]');
      });
      it('should parse {. 1:2; 3:4;\n 5:6}', function() {
        return expect(str(parse('{. 1:2; 3:4;\n 5:6}'))).to.equal('[hash! [jshashitem! 1 2] [jshashitem! 3 4] [jshashitem! 5 6]]');
      });
      it('should parse {. 1:2; 3:\n 5:6\n}', function() {
        return expect(str(parse('{. 1:2; 3:\n 5:6\n}'))).to.equal('[hash! [jshashitem! 1 2] [jshashitem! 3 [hash! [jshashitem! 5 6]]]]');
      });
      return it('should parse {. 1:2; 3:\n 5:6;a->8\n}', function() {
        return expect(str(parse('{. 1:2; 3:\n 5:6;a->8\n}'))).to.equal("[hash! [jshashitem! 1 2] [jshashitem! 3 [hash! [jshashitem! 5 6] [pyhashitem! a 8]]]]");
      });
    });
  });
  describe("line comment block", function() {
    var parse;
    parse = function(text) {
      var parser, x;
      parser = new Parser();
      return x = parser.parse(text, parser.moduleBody, 0);
    };
    it('should parse // line comment\n 1', function() {
      return expect(str(parse('// line comment\n 1'))).to.equal('1');
    });
    nit('should parse /// line comment\n 1', function() {
      return expect(str(parse('/// line comment\n 1'))).to.equal("[begin! [directLineComment! /// line comment] 1]");
    });
    it('should parse // line comment block\n 1 2', function() {
      return expect(str(parse('// line comment block\n 1 2'))).to.equal("[1 2]");
    });
    it('should parse // line comment block\n 1 2, 3 4', function() {
      return expect(str(parse('// line comment block\n 1 2, 3 4'))).to.equal('[begin! [1 2] [3 4]]');
    });
    it('should parse // line comment block\n 1 2, 3 4\n 5 6, 7 8', function() {
      return expect(str(parse('// line comment block\n 1 2; 3 4\n 5 6; 7 8'))).to.equal('[begin! [1 2] [3 4] [5 6] [7 8]]');
    });
    it('should parse // \n 1 2, 3 4\n // \n  5 6, 7 8', function() {
      return expect(str(parse('// \n 1 2, 3 4\n // \n  5 6, 7 8'))).to.equal('[begin! [1 2] [3 4] [5 6] [7 8]]');
    });
    return it('should parse // \n 1 2, 3 4\n // \n  5 6, 7 8\n // \n  9 10, 11 12', function() {
      return expect(str(parse('// \n 1 2, 3 4\n // \n  5 6, 7 8\n // \n  9 10, 11 12'))).to.equal('[begin! [1 2] [3 4] [5 6] [7 8] [9 10] [11 12]]');
    });
  });
  describe("block comment ", function() {
    var parse;
    parse = function(text) {
      var parser, x;
      parser = new Parser();
      return x = parser.parse(text, matchRule(parser, parser.line), 0);
    };
    it('should parse /. some comment', function() {
      var x;
      x = parse('/. some comment');
      return expect(str(x)).to.equal("undefined");
    });
    return it('should parse /. some \n  embedded \n  comment', function() {
      var x;
      x = parse('/. some \n  embedded \n  comment');
      return expect(str(x)).to.equal("undefined");
    });
  });
  return describe("module header", function() {
    var parse;
    parse = function(text) {
      var parser, x;
      parser = new Parser();
      return x = parser.parse(text, parser.moduleHeader, 0);
    };
    it('should parse taiji language 0.1', function() {
      var x;
      x = parse('taiji language 0.1');
      expect(x.version).to.deep.equal({
        main: '0',
        minor: '1'
      });
      return expect(x.value).to.equal('taiji language 0.1');
    });
    it('taiji language 3.1\n1 should throw', function() {
      return expect(function() {
        return parse('taiji language 3.1\n1');
      }).to["throw"](/taiji 0.1 can not process taiji language/);
    });
    return it('should parse taiji language 0.1\n1', function() {
      var x;
      x = parse('taiji language 0.1\n header comment \n1');
      expect(x.version).to.deep.equal({
        main: "0",
        minor: "1"
      });
      return expect(x.value).to.equal("taiji language 0.1\n header comment \n");
    });
  });
});
