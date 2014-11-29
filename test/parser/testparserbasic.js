var BLOCK_COMMENT, COMPACT_CLAUSE_EXPRESSION, EOI, HALF_DENT, IDENTIFIER, INDENT, NEWLINE, NUMBER, OPERATOR_EXPRESSION, PAREN, PAREN_OPERATOR_EXPRESSION, Parser, SPACE, SYMBOL, UNDENT, expect, idescribe, iit, lib, matchRule, ndescribe, nit, str, _ref, _ref1;

_ref = require('../util'), expect = _ref.expect, ndescribe = _ref.ndescribe, idescribe = _ref.idescribe, iit = _ref.iit, nit = _ref.nit, matchRule = _ref.matchRule;

lib = '../../lib/';

str = require(lib + 'utils').str;

Parser = require(lib + 'parser/parser').Parser;

_ref1 = require(lib + 'constant'), IDENTIFIER = _ref1.IDENTIFIER, NUMBER = _ref1.NUMBER, SYMBOL = _ref1.SYMBOL, NEWLINE = _ref1.NEWLINE, INDENT = _ref1.INDENT, UNDENT = _ref1.UNDENT, HALF_DENT = _ref1.HALF_DENT, PAREN = _ref1.PAREN, BLOCK_COMMENT = _ref1.BLOCK_COMMENT, EOI = _ref1.EOI, SPACE = _ref1.SPACE, PAREN_OPERATOR_EXPRESSION = _ref1.PAREN_OPERATOR_EXPRESSION, COMPACT_CLAUSE_EXPRESSION = _ref1.COMPACT_CLAUSE_EXPRESSION, OPERATOR_EXPRESSION = _ref1.OPERATOR_EXPRESSION;

describe("parser basic: ", function() {
  describe("nextToken: ", function() {
    var parse, parser;
    parser = new Parser();
    parse = function(text) {
      var x;
      return x = parser.parse(text, parser.nextToken, 0);
    };
    describe("parse number: ", function() {
      describe("is number: ", function() {
        it("parse 1", function() {
          return expect(parse('1').value).to.equal('1');
        });
        it("parse 01", function() {
          return expect(parse('01').value).to.equal('01');
        });
        it("parse 0x01", function() {
          return expect(parse('0x01').value).to.equal('0x01');
        });
        it("parse 0xa", function() {
          return expect(parse('0xa').value).to.equal('0xa');
        });
        it("parse 1.", function() {
          expect(parse('1.').value).to.equal('1');
          expect(parser.cursor()).to.equal(1);
          return expect(parser.endOfInput()).to.equal(false);
        });
        it("parse 1.e0", function() {
          return expect(parse('1.e0').value).to.equal("1.e0");
        });
        it("parse 1.0e023", function() {
          var x;
          x = parse('1.0e023');
          return expect(x.value).to.equal('1.0e023');
        });
        it("parse 1.0e-23", function() {
          return expect(parse('1.0e-23').value).to.equal('1.0e-23');
        });
        it("parse 1.e-23", function() {
          var x;
          x = parse('1.e-23');
          return expect(x.value).to.equal('1.e-23');
        });
        it("parse 1.0e+023", function() {
          return expect(parse('1.0e+23').value).to.equal('1.0e+23');
        });
        it("parse 1.e23", function() {
          return expect(parse('1.e23').value).to.equal('1.e23');
        });
        it("parse 1e23", function() {
          return expect(parse('1e23').value).to.equal('1e23');
        });
        it("parse 1e023", function() {
          return expect(parse('1e023').value).to.equal('1e023');
        });
        it("parse 1.e", function() {
          return expect(parse('1.e').value).to.equal('1');
        });
        it("parse 1.ea", function() {
          return expect(parse('1.ea').value).to.equal('1');
        });
        it("parse 1.e+", function() {
          return expect(parse('1.e+').value).to.equal('1');
        });
        it("parse 1.e-", function() {
          return expect(parse('1.e-').value).to.equal('1');
        });
        return it("parse 1.e*", function() {
          return expect(parse('1.e*').value).to.equal('1');
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
    describe("parse taijiIdentifier: ", function() {
      it("parse a", function() {
        return expect(str(parse('a'))).to.equal('a');
      });
      it("parse ?", function() {
        expect(str(parse('?'))).to.equal('?');
        return expect(parser.token().type).to.equal(SYMBOL);
      });
      it("parse #", function() {
        expect(str(parse('#'))).to.equal('#');
        return expect(parser.token().type).to.equal(SYMBOL);
      });
      it("parse !ds", function() {
        expect(str(parse('!ds'))).to.equal('!');
        return expect(parser.token().type).to.equal(SYMBOL);
      });
      it("parse a!", function() {
        expect(str(parse('a!'))).to.equal('a!');
        return expect(parser.token().type).to.equal(IDENTIFIER);
      });
      it("parse a!#", function() {
        return expect(str(parse('a!#'))).to.equal('a!');
      });
      it("parse $a", function() {
        return expect(str(parse('$a'))).to.equal('$a');
      });
      it("parse $a_", function() {
        return expect(str(parse('$a_'))).to.equal('$a_');
      });
      it("parse $a_1", function() {
        return expect(str(parse('$a_1'))).to.equal('$a_1');
      });
      it("parse _1", function() {
        return expect(str(parse('_1'))).to.equal('_1');
      });
      return it("parse _a1", function() {
        return expect(str(parse('_a1'))).to.equal('_a1');
      });
    });
    ndescribe("parse escaped string symbol:", function() {
      return it("parse \\'x...'", function() {
        return expect(str(parse("\\'x...'"))).to.equal("\"x...\"");
      });
    });
    describe("parse string: ", function() {
      it("parse a", function() {
        return expect(str(parse('"a"'))).to.equal('"a"');
      });
      it("parse a\\b", function() {
        return expect(str(parse('"a\\b"'))).to.equal('"a\\b"');
      });
      it("parse 'a\\b'", function() {
        return expect(str(parse("'a\\b'"))).to.equal("'a\\b'");
      });
      it("parse 'a\\b\ncd'", function() {
        return expect(function() {
          return parse("'a\\b\ncd'");
        }).to["throw"](/unexpected new line while parsing string/);
      });
      it("parse 'a\\b\\\ncd'", function() {
        return expect(function() {
          return parse("'a\\b\\\ncd'");
        }).to["throw"](/unexpected new line while parsing string/);
      });
      it("parse 'a\"\\\"\'\\n'", function() {
        return expect(str(parse("'a\"\\\"\\'\\n'"))).to.equal('\'a"\\"\\\'\\n\'');
      });
      it("parse 'a\"\\\"\\'\\n\n'", function() {
        return expect(function() {
          return parse("'a\"\\\"\\'\\n\n'");
        }).to["throw"](/unexpected new line while parsing string/);
      });
      return it("parse 'a\"\\\"\n\'\\n'", function() {
        return expect(function() {
          return parse("'a\"\\\"\n\\'\\n\n'");
        }).to["throw"](/unexpected new line while parsing string/);
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
        return expect(str(parse('123.5e4'))).to.equal("123.5e4");
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
        return expect(str(parse('*/*multiply*/'))).to.equal("*/*");
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
      }
    };
    it('should parse ++1', function() {
      return expect(parse('++1')).to.equal('++');
    });
    it('should parse new', function() {
      return expect(parse('new a')).to.equal('new');
    });
    it('should parse new.a', function() {
      return expect(parse('new.a')).to.equal('new');
    });
    it('should parse +a', function() {
      return expect(parse('+a')).to.equal('+');
    });
    it('should parse +\n a', function() {
      return expect(parse('+a')).to.equal('+');
    });
    it('should parse +/**/a', function() {
      return expect(parse('+/**/a')).to.equal(void 0);
    });
    return it('should parse +/**/)', function() {
      return expect(parse('+/**/)')).to.equal(void 0);
    });
  });
  describe("binaryOperator: ", function() {
    var parse;
    parse = function(text) {
      var parser, root, x;
      parser = new Parser();
      root = function() {
        parser.nextToken();
        return parser.binaryOperator(OPERATOR_EXPRESSION);
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
      return expect(parse(' and 1')).to.equal('and');
    });
  });
  describe("compact clause binaryOperator: ", function() {
    var parse;
    parse = function(text) {
      var parser, root, x;
      parser = new Parser();
      root = function() {
        parser.nextToken();
        return parser.binaryOperator(COMPACT_CLAUSE_EXPRESSION);
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
    return it('should parse  and 1', function() {
      return expect(parse(' and 1')).to.equal(void 0);
    });
  });
  describe("space and comment: ", function() {
    it("parse multiple line space comment 3", function() {
      var parser, x;
      parser = new Parser();
      parser.init('123   // line comment // line comment 2\n/*fds;j*/ something', 0);
      parser.nextToken();
      parser.nextToken();
      x = parser.token();
      return expect(x.value).to.equal("   // line comment // line comment 2\n");
    });
    return it("parse multiple line space comment 4", function() {
      var parser, x;
      parser = new Parser();
      parser.init('123   // line comment \n// line comment 2\n/*fds;j*/ /*asdf\nkljl*/\n  something', 0);
      parser.nextToken();
      parser.nextToken();
      x = parser.token();
      expect(x.value).to.equal("   // line comment \n");
      parser.nextToken();
      x = parser.token();
      return expect(x.value).to.equal("// line comment 2\n");
    });
  });
  describe("compact clause expression:", function() {
    var parse;
    parse = function(text) {
      var parser, x;
      parser = new Parser();
      return x = parser.parse(text, matchRule(parser, parser.compactClauseExpression), 0);
    };
    describe("group1:", function() {
      it('should parse a', function() {
        return expect(str(parse('a'))).to.equal("a");
      });
      it('should parse a.b', function() {
        return expect(str(parse('a.b'))).to.equal("[binary! . a b]");
      });
      it('should parse a.b.c', function() {
        return expect(str(parse('a.b.c'))).to.equal("[binary! . [binary! . a b] c]");
      });
      it('should parse a(b)', function() {
        return expect(str(parse('a(b)'))).to.equal("[binary! concat() a [() b]]");
      });
      it('should parse a()', function() {
        return expect(str(parse('a()'))).to.equal("[binary! concat() a [()]]");
      });
      it('should parse a::b ', function() {
        return expect(str(parse('a::b'))).to.equal("[binary! :: a b]");
      });
      return it('should parse ^1', function() {
        return expect(str(parse('^1'))).to.equal("[prefix! ^ 1]");
      });
    });
    return describe("group2:", function() {
      it('should parse `(^1)', function() {
        return expect(str(parse('`(^1)'))).to.equal("[prefix! ` [() [prefix! ^ 1]]]");
      });
      it('should parse (a)', function() {
        return expect(str(parse('(a)'))).to.equal("[() a]");
      });
      it('should parse Object.prototype.toString', function() {
        return expect(str(parse('Object.prototype.toString'))).to.equal("[binary! . [binary! . Object prototype] toString]");
      });
      it('should parse Object.prototype.toString.call', function() {
        return expect(str(parse('Object.prototype.toString.call'))).to.equal("[binary! . [binary! . [binary! . Object prototype] toString] call]");
      });
      it('should parse x.toString.call', function() {
        return expect(str(parse('x.toString.call'))).to.equal("[binary! . [binary! . x toString] call]");
      });
      it('should parse toString.call', function() {
        return expect(str(parse('toString.call'))).to.equal("[binary! . toString call]");
      });
      it("parse 1,/-h\b|-r\b|-v\b|-b\b/", function() {
        return expect(str(parse('1,/-h\b|-r\b|-v\b|-b\b/'))).to.equal('1');
      });
      it("parse 1+/!1/.test('1')", function() {
        return expect(str(parse("1+/!1/.test('1')"))).to.equal("[binary! + 1 [binary! concat() [binary! . [regexp! /1/] test] [() '1']]]");
      });
      it("parse x=/!1/", function() {
        return expect(str(parse('x=/!1/'))).to.equal("[binary! = x [regexp! /1/]]");
      });
      return it("parse x=/!1/g", function() {
        return expect(str(parse('x=/!1/g'))).to.equal("[binary! = x [regexp! /1/g]]");
      });
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
      return expect(str(x)).to.equal("[()]");
    });
    it('should parse (a)', function() {
      var x;
      x = parse('(a)');
      expect(x.type).to.equal(PAREN);
      return expect(str(x)).to.equal("[() a]");
    });
    return it('should parse (a,b)', function() {
      var x;
      x = parse('(a,b)');
      expect(x.type).to.equal(PAREN);
      return expect(str(x)).to.equal("[() [binary! , a b]]");
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
        return expect(str(parse('@a'))).to.equal("[prefix! @ a]");
      });
      it('should parse @ a', function() {
        return expect(str(parse('@ a'))).to.equal('[@ a]');
      });
      return it('should parse 1\n2', function() {
        return expect(str(parse('1\n2'))).to.equal('1');
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
    describe(":: as prototype", function() {
      it('should parse @:: ', function() {
        return expect(str(parse('@::'))).to.equal("[prefix! @ ::]");
      });
      it('should parse a::b ', function() {
        return expect(str(parse('a::b'))).to.equal("[binary! :: a b]");
      });
      return it('should parse ::a', function() {
        return expect(str(parse('::a'))).to.equal("[prefix! :: a]");
      });
    });
    describe("quote! expression: ", function() {
      it('should parse ~ a.b', function() {
        return expect(str(parse('~ a.b'))).to.equal("[~ [binary! . a b]]");
      });
      it('should parse ~ print a b', function() {
        return expect(str(parse('~ print a b'))).to.equal("[~ [print a b]]");
      });
      it('should parse ` print a b', function() {
        return expect(str(parse('` print a b'))).to.equal("[` [print a b]]");
      });
      it('should parse min a \n b', function() {
        return expect(str(parse('min a \n b'))).to.equal("[min a b]");
      });
      it('should parse ~ print : min a \n abs b', function() {
        return expect(str(parse('~ print : min a \n abs b'))).to.equal("[~ [print [min a [abs b]]]]");
      });
      return it('should parse ` a.b', function() {
        return expect(str(parse('` a.b'))).to.equal("[` [binary! . a b]]");
      });
    });
    describe("unquote! expression: ", function() {
      it('should parse ^ a.b', function() {
        return expect(str(parse('^ a.b'))).to.equal("[^ [binary! . a b]]");
      });
      it('should parse ^ print a b', function() {
        return expect(str(parse('^ print a b'))).to.equal("[^ [print a b]]");
      });
      return it('should parse `(^1)', function() {
        return expect(str(parse('`(^1)'))).to.equal("[prefix! ` [() [prefix! ^ 1]]]");
      });
    });
    return describe("unquote-splice expression", function() {
      it('should parse ^& a.b', function() {
        return expect(str(parse('^& a.b'))).to.equal("[^& [binary! . a b]]");
      });
      it('should parse ^&a.b', function() {
        return expect(str(parse('^&a.b'))).to.equal("[prefix! ^& [binary! . a b]]");
      });
      it('should parse (^&a).b', function() {
        return expect(str(parse('(^&a).b'))).to.equal("[binary! . [() [prefix! ^& a]] b]");
      });
      it('should parse ^@ print a b', function() {
        return expect(str(parse('^& print a b'))).to.equal("[^& [print a b]]");
      });
      return it('should parse ^print a b', function() {
        return expect(str(parse('^print a b'))).to.equal("[[prefix! ^ print] a b]");
      });
    });
  });
  return describe("line comment block", function() {
    var parse;
    parse = function(text) {
      var parser, x;
      parser = new Parser();
      return x = parser.parse(text, parser.module, 0);
    };
    it('should parse // line comment\n 1', function() {
      return expect(str(parse('// line comment\n 1'))).to.equal("1");
    });
    it('should parse // line comment block\n 1 2', function() {
      return expect(str(parse('// line comment block\n 1 2'))).to.equal("[1 2]");
    });
    it('should parse // line comment block\n 1 2, 3 4', function() {
      return expect(str(parse('// line comment block\n 1 2, 3 4'))).to.equal("[begin! [1 2] [3 4]]");
    });
    it('should parse // line comment block\n 1 2, 3 4\n 5 6, 7 8', function() {
      return expect(str(parse('// line comment block\n 1 2; 3 4\n 5 6; 7 8'))).to.equal("[begin! [1 2] [3 4] [5 6] [7 8]]");
    });
    it('should parse // \n 1 2, 3 4\n // \n  5 6, 7 8', function() {
      return expect(str(parse('// \n 1 2, 3 4\n // \n  5 6, 7 8'))).to.equal("[begin! [1 2] [3 4] [5 6] [7 8]]");
    });
    return it('should parse // \n 1 2, 3 4\n // \n  5 6, 7 8\n // \n  9 10, 11 12', function() {
      return expect(str(parse('// \n 1 2, 3 4\n // \n  5 6, 7 8\n // \n  9 10, 11 12'))).to.equal("[begin! [1 2] [3 4] [5 6] [7 8] [9 10] [11 12]]");
    });
  });
});
