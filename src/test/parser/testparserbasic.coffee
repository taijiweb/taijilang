{expect, ndescribe, idescribe, iit, nit, matchRule} = require '../util'

lib = '../../lib/'
{constant, isArray, str} = require lib+'utils'
{Parser} = require lib+'parser/parser'

{IDENTIFIER, NUMBER, SYMBOL, NEWLINE, INDENT, UNDENT, HALF_DENT, PAREN, BLOCK_COMMENT, EOI, SPACE
PAREN_OPERATOR_EXPRESSION, COMPACT_CLAUSE_EXPRESSION, OPERATOR_EXPRESSION} = constant

describe "parser basic: ",  ->
  describe "matchToken: ",  ->
    parser = new Parser()
    parse = (text) ->
      x = parser.parse(text, parser.matchToken, 0)

    describe "parse number: ",  ->
      describe "is number: ",  ->
        it "parse 1", ->
          expect(parse('1').value).to.equal '1'
        it "parse 01", ->
          expect(parse('01').value).to.equal '01'
        it "parse 0x01", ->
          expect(parse('0x01').value).to.equal '0x01'
        it "parse 0xa", ->
          expect(parse('0xa').value).to.equal '0xa'
        it "parse 1.", ->
          expect(parse('1.').value).to.equal '1'
          expect(parser.cursor()).to.equal 1
          expect(parser.endOfInput()).to.equal false
        it "parse 1.e0", ->
          expect(parse('1.e0').value).to.equal "1.e0"
        it "parse 1.0e023", ->
          x = parse '1.0e023'
          #        console.log x
          expect(x.value).to.equal '1.0e023'
        #        expect(1.e23).to.equal 1.e23
        it "parse 1.0e-23", ->
          expect(parse('1.0e-23').value).to.equal '1.0e-23'
        it "parse 1.e-23", ->
          x = parse '1.e-23'
          #        console.log x
          expect(x.value).to.equal '1.e-23'
        it "parse 1.0e+023", ->
          expect(parse('1.0e+23').value).to.equal '1.0e+23'
        it "parse 1.e23", ->
          expect(parse('1.e23').value).to.equal '1.e23'
        it "parse 1e23", ->
          expect(parse('1e23').value).to.equal '1e23'
        it "parse 1e023", ->
          expect(parse('1e023').value).to.equal '1e023'
        it "parse 1.e", ->
          expect(parse('1.e').value).to.equal '1'
        it "parse 1.ea", ->
          expect(parse('1.ea').value).to.equal '1'
        it "parse 1.e+", ->
          expect(parse('1.e+').value).to.equal '1'
        it "parse 1.e-", ->
          expect(parse('1.e-').value).to.equal '1'
        it "parse 1.e*", ->
          expect(parse('1.e*').value).to.equal '1'

      describe "is not number: ",  ->
        it "parse .1", ->
          expect(parse('.1').type).not.to.equal NUMBER
        it "parse +1.", ->
          expect(parse('+1.').type).not.to.equal NUMBER
        it "parse +1.e0", ->
          expect(parse('+1.e0').type).not.to.equal NUMBER
        it "parse -.1", ->
          expect(parse('-.1').type).not.to.equal NUMBER
        it "parse +1.e023", ->
          expect(parse('+1.e023').type).not.to.equal NUMBER
        it "parse +1.e", ->
          expect(parse('+1.e').type).not.to.equal NUMBER
        it "parse +.e", ->
          expect(parse('+.e').type).not.to.equal NUMBER
        it "parse +.", ->
          expect(parse('+.').type).not.to.equal NUMBER
        it "parse -.", ->
          expect(parse('-.').type).not.to.equal NUMBER

    describe "parse identifier: ",  ->
      it "parse a", ->
        expect(str parse('a')).to.equal 'a'
        expect(parser.token().type).to.equal IDENTIFIER
      it "parse ?", ->
        parse('?'); expect(parser.token().type).to.not.equal IDENTIFIER
      it "parse #", ->
        parse('?'); expect(parser.token().type).to.not.equal IDENTIFIER
      it "parse !ds", ->
        parse('?'); expect(parser.token().type).to.not.equal IDENTIFIER

    describe "parse taijiIdentifier: ",  ->
      it "parse a", ->
        expect(str parse('a')).to.equal 'a'
      it "parse ?", ->
        expect(str parse('?')).to.equal '?'
        expect(parser.token().type).to.equal SYMBOL
      it "parse #", ->
        expect(str parse('#')).to.equal '#'
        expect(parser.token().type).to.equal SYMBOL
      it "parse !ds", ->
        expect(str parse('!ds')).to.equal '!'
        expect(parser.token().type).to.equal SYMBOL
      it "parse a!", ->
        expect(str parse('a!')).to.equal 'a!'
        expect(parser.token().type).to.equal IDENTIFIER
      it "parse a!#", ->
        expect(str parse('a!#')).to.equal 'a!'
      it "parse $a", ->
        expect(str parse('$a')).to.equal '$a'
      it "parse $a_", ->
        expect(str parse('$a_')).to.equal '$a_'
      it "parse $a_1", ->
        expect(str parse('$a_1')).to.equal '$a_1'
      it "parse _1", ->
        expect(str parse('_1')).to.equal '_1'
      it "parse _a1", ->
        expect(str parse('_a1')).to.equal '_a1'

    ndescribe "parse escaped string symbol:",  ->
      it "parse \\'x...'", ->
        expect(str parse("\\'x...'")).to.equal "\"x...\""

    describe "parse string: ",  ->
      it "parse a", ->
        expect(str parse('"a"')).to.equal '"a"'
      it "parse a\\b", ->
        expect(str parse('"a\\b"')).to.equal '"a\\b"'

      it "parse 'a\\b'", ->
        expect(str parse("'a\\b'")).to.equal "'a\\b'"
      it "parse 'a\\b\ncd'", ->
        expect(-> parse("'a\\b\ncd'")).to.throw /unexpected new line while parsing string/
      it "parse 'a\\b\\\ncd'", ->
        expect(-> parse("'a\\b\\\ncd'")).to.throw  /unexpected new line while parsing string/
      it "parse 'a\"\\\"\'\\n'", ->
        expect(str parse("'a\"\\\"\\'\\n'")).to.equal '\'a"\\"\\\'\\n\''
      it "parse 'a\"\\\"\\'\\n\n'", ->
        expect(-> parse("'a\"\\\"\\'\\n\n'")).to.throw  /unexpected new line while parsing string/
      it "parse 'a\"\\\"\n\'\\n'", ->
        expect(-> parse("'a\"\\\"\n\\'\\n\n'")).to.throw  /unexpected new line while parsing string/

    describe "parse regexp: ",  ->
      it "parse /!-h\b|-r\b|-v\b|-b\b/", ->
        expect(str parse('/!-h\b|-r\b|-v\b|-b\b/')).to.equal "[regexp! /-h\b|-r\b|-v\b|-b\b/]"

    describe "symbol: ",  ->
      it 'should parse ==1', ->
        expect(str parse('==1')).to.equal '=='
      it 'should parse @@@1', ->
        expect(str parse('@@@1')).to.equal '@@@'
      it 'should parse +.1', ->
        expect(str parse('+.1')).to.equal '+'
      it 'should parse .1', ->
        expect(str parse('.1')).to.equal '.'
      it 'should parse ../', ->
        expect(str parse('../')).to.equal '..'
      it 'should parse :::1', ->
        expect(str parse(':::1')).to.equal ':::'
      it 'should parse (++', ->
        expect(-> parse('(++')).to.throw /expect \)/

    describe "simple token: ",  ->
      it "parse toString", ->
        expect(str parse('toString')).to.equal 'toString'
      it "parse 123", ->
        expect(str parse('123')).to.equal '123'
      it "parse 123.5", ->
        expect(str parse('123.5')).to.equal '123.5'
      it "parse 123.5e4", ->
        expect(str parse('123.5e4')).to.equal "123.5e4"
      it "parse @@@", ->
        expect(str parse('@@@')).to.equal '@@@'
      it "parse :::", ->
        expect(str parse(':::')).to.equal ':::'
      it "parse ...", ->
        expect(str parse('...')).to.equal '...'
      it "parse #==", ->
        expect(str parse('#==')).to.equal '#=='
      it "parse *//stop at line comment", ->
        expect(str parse('*//stop at line comment')).to.equal '*'
      it "parse */!stop at regexp", ->
        expect(str parse('*/!stop at regexp/')).to.equal '*'
      it "parse +/+", ->
        expect(str parse('+/+')).to.equal '+/+'
      it "parse +/(", ->
        expect(str parse('+/(')).to.equal '+/'
      it "parse \\/(", ->
        expect(str parse("\\/(")).to.equal '\\/'
      it "parse */*multiply*/", ->
        expect(str parse('*/*multiply*/')).to.equal "*/*"

  describe "prefixOperator: ",  ->
    parse = (text) ->
      parser = new Parser()
      prefixOperator = ->
        parser.prefixOperator('opExp')
      x = parser.parse(text, matchRule(parser, prefixOperator), 0)
      if x then x.value
    it 'should parse ++1', ->
      expect(parse('++1')).to.equal '++'
    it 'should parse new', ->
      expect(parse('new a')).to.equal 'new'
    it 'should parse new.a', ->
      expect(parse('new.a')).to.equal 'new'
    it 'should parse +a', ->
      expect(parse('+a')).to.equal '+'
    it 'should parse +\n a', ->
      expect(parse('+a')).to.equal '+'
    it 'should parse +/**/a', ->
      expect(parse('+/**/a')).to.equal undefined
    it 'should parse +/**/)', ->
      expect(parse('+/**/)')).to.equal undefined

  describe "binaryOperator: ",  ->
    parse = (text) ->
      parser = new Parser()
      root = ->
        parser.matchToken()
        parser.binaryOperator(OPERATOR_EXPRESSION, {value:0}, 0, true)
      x = parser.parse(text, root, 0)
      if x then x.value
      else return
    it 'should parse ==1', ->
      expect(parse('==1')).to.equal '=='
    it 'should parse +1', ->
      expect(parse('+1')).to.equal '+'
    it 'should parse and', ->
      expect(parse(' and 1')).to.equal 'and'

  describe "compact clause binaryOperator: ",  ->
    parse = (text) ->
      parser = new Parser()
      root = ->
        parser.matchToken()
        parser.binaryOperator(COMPACT_CLAUSE_EXPRESSION)
      x = parser.parse(text, root, 0)
      if x then x.value
      else return
    it 'should parse ==1', ->
      expect(parse('==1')).to.equal '=='
    it 'should parse +1', ->
      expect(parse('+1')).to.equal '+'
    it 'should parse + 1', ->
      expect(parse(' + 1')).to.equal undefined
    it 'should parse  and 1', ->
      expect(parse(' and 1')).to.equal undefined

  describe "space and comment: ",  ->
    it "parse multiple line space comment 3", ->
      parser = new Parser()
      parser.init('123   // line comment // line comment 2\n/*fds;j*/ something', 0)
      parser.matchToken()
      parser.matchToken()
      x = parser.token()
      expect(x.value).to.equal "   // line comment // line comment 2\n"
    it "parse multiple line space comment 4", ->
      parser = new Parser()
      parser.init('123   // line comment \n// line comment 2\n/*fds;j*/ /*asdf\nkljl*/\n  something', 0)
      parser.matchToken()
      parser.matchToken()
      x = parser.token()
      expect(x.value).to.equal "   // line comment \n"
      parser.matchToken()
      x = parser.token()
      expect(x.value).to.equal "// line comment 2\n"

  describe "compact clause expression:", ->
    parse = (text) ->
      parser = new Parser()
      x = parser.parse(text, matchRule(parser, parser.compactClauseExpression), 0)
    describe "group1:", ->
      it 'should parse a', ->
        expect(str parse('a')).to.equal "a"
      it 'should parse a.b', ->
        expect(str parse('a.b')).to.equal "[binary! . a b]"
      it 'should parse a.b.c', ->
        expect(str parse('a.b.c')).to.equal "[binary! . [binary! . a b] c]"

      it 'should parse a(b)', ->
        expect(str parse('a(b)')).to.equal  "[binary! concat() a [() b]]"
      it 'should parse a()', ->
        expect(str parse('a()')).to.equal "[binary! concat() a [()]]"
      it 'should parse a::b ', ->
        expect(str parse('a::b')).to.equal "[binary! :: a b]"
      it 'should parse ^1', ->
        expect(str parse('^1')).to.equal "[prefix! ^ 1]"
    describe "group2:", ->
      it 'should parse `(^1)', ->
        expect(str parse('`(^1)')).to.equal "[prefix! ` [() [prefix! ^ 1]]]"
      # gotcha: prefixOperator['toString'] == Object.toString function!!!
      it 'should parse (a)', ->
        expect(str parse('(a)')).to.equal "[() a]"
      it 'should parse Object.prototype.toString', ->
        expect(str parse('Object.prototype.toString')).to.equal "[binary! . [binary! . Object prototype] toString]"
      it 'should parse Object.prototype.toString.call', ->
        expect(str parse('Object.prototype.toString.call')).to.equal "[binary! . [binary! . [binary! . Object prototype] toString] call]"
      it 'should parse x.toString.call', ->
        expect(str parse('x.toString.call')).to.equal "[binary! . [binary! . x toString] call]"
      it 'should parse toString.call', ->
        expect(str parse('toString.call')).to.equal "[binary! . toString call]"
      it "parse 1,/-h\b|-r\b|-v\b|-b\b/", ->
        expect(str parse('1,/-h\b|-r\b|-v\b|-b\b/')).to.equal '1'
      it "parse 1+/!1/.test('1')", ->
        expect(str parse("1+/!1/.test('1')")).to.equal "[binary! + 1 [binary! concat() [binary! . [regexp! /1/] test] [() '1']]]"
      it "parse x=/!1/", ->
        expect(str parse('x=/!1/')).to.equal "[binary! = x [regexp! /1/]]"
      it "parse x=/!1/g", ->
        expect(str parse('x=/!1/g')).to.equal "[binary! = x [regexp! /1/g]]"

  describe "parenthesis: ",  ->
    parse = (text) ->
      parser = new Parser()
      parser.init(text, 0)
      x = parser.tokenFnMap['(']()
    it 'should parse ()', ->
      x = parse('()')
      expect(x.type).to.equal PAREN
      expect(str x).to.equal "[()]"
    it 'should parse (a)', ->
      x = parse('(a)')
      expect(x.type).to.equal PAREN
      expect(str x).to.equal "[() a]"
    it 'should parse (a,b)', ->
      x = parse('(a,b)')
      expect(x.type).to.equal PAREN
      expect(str x).to.equal "[() [binary! , a b]]"

  describe "definition", ->
    parse = (text) ->
      parser = new Parser()
      x = parser.parse(text,  matchRule(parser, parser.definitionSymbolBody), 0)
      x
    it 'should parse -> 1', ->
      expect(str parse('-> 1')).to.equal "[-> [] 1]"

  describe "clause: ", ->
    parse = (text) ->
      parser = new Parser()
      x = parser.parse(text, matchRule(parser, parser.clause), 0)
      x
    describe "@ as this clause", ->
      it 'should parse @', ->
        expect(str parse('@')).to.equal '@'
      it 'should parse @a', ->
        expect(str parse('@a')).to.equal "[prefix! @ a]"
      it 'should parse @ a', ->
        expect(str parse('@ a')).to.equal '[@ a]'
      it 'should parse 1\n2', ->
        expect(str parse('1\n2')).to.equal '1'

    describe "caller expression clause", ->
      it 'should parse print 1', ->
        expect(str parse('print 1\n2')).to.equal "[print 1]"

    describe "sequence clause", ->
      it 'should parse print 1 2', ->
        expect(str parse('print 1 2')).to.equal "[print 1 2]"

    describe ":: as prototype", ->
      it 'should parse @:: ', ->
        expect(str parse('@::')).to.equal "[prefix! @ ::]"
      it 'should parse a::b ', ->
        expect(str parse('a::b')).to.equal "[binary! :: a b]"
      it 'should parse ::a', ->
        expect(str parse('::a')).to.equal "[prefix! :: a]"

    describe "quote! expression: ", ->
      it 'should parse ~ a.b', ->
        expect(str parse('~ a.b')).to.equal "[~ [binary! . a b]]"
      it 'should parse ~ print a b', ->
        expect(str parse('~ print a b')).to.equal "[~ [print a b]]"
      it 'should parse ` print a b', ->
        expect(str parse('` print a b')).to.equal "[` [print a b]]"
      it 'should parse ~ print : min a \n abs b', ->
        expect(str parse('~ print : min a \n abs b')).to.equal "[~ [print [min a [abs b]]]]"
      it 'should parse ` a.b', ->
        expect(str parse('` a.b')).to.equal "[` [binary! . a b]]"

    describe "unquote! expression: ", ->
      it 'should parse ^ a.b', ->
        expect(str parse('^ a.b')).to.equal "[^ [binary! . a b]]"
      it 'should parse ^ print a b', ->
        expect(str parse('^ print a b')).to.equal "[^ [print a b]]"
      it 'should parse `(^1)', ->
        expect(str parse('`(^1)')).to.equal  "[prefix! ` [() [prefix! ^ 1]]]"

    describe "unquote-splice expression", ->
      it 'should parse ^& a.b', ->
        expect(str parse('^& a.b')).to.equal "[^& [binary! . a b]]"
      it 'should parse ^&a.b', ->
        expect(str parse('^&a.b')).to.equal "[prefix! ^& [binary! . a b]]"
      it 'should parse (^&a).b', ->
        expect(str parse('(^&a).b')).to.equal "[binary! . [() [prefix! ^& a]] b]"
      it 'should parse ^@ print a b', ->
        expect(str parse('^& print a b')).to.equal "[^& [print a b]]"
      it 'should parse ^print a b', ->
        expect(str parse('^print a b')).to.equal "[[prefix! ^ print] a b]"

  describe  "line comment block",  ->
    parse = (text) ->
      parser = new Parser()
      x = parser.parse(text, parser.module, 0)
    it 'should parse // line comment\n 1', ->
      expect(str parse('// line comment\n 1')).to.equal "1"
    it 'should parse // line comment block\n 1 2', ->
      expect(str parse('// line comment block\n 1 2')).to.equal "[1 2]"
    it 'should parse // line comment block\n 1 2, 3 4', ->
      expect(str parse('// line comment block\n 1 2, 3 4')).to.equal "[begin! [1 2] [3 4]]"
    it 'should parse // line comment block\n 1 2, 3 4\n 5 6, 7 8', ->
      expect(str parse('// line comment block\n 1 2; 3 4\n 5 6; 7 8')).to.equal "[begin! [1 2] [3 4] [5 6] [7 8]]"
    it 'should parse // \n 1 2, 3 4\n // \n  5 6, 7 8', ->
      expect(str parse('// \n 1 2, 3 4\n // \n  5 6, 7 8')).to.equal "[begin! [1 2] [3 4] [5 6] [7 8]]"
    it 'should parse // \n 1 2, 3 4\n // \n  5 6, 7 8\n // \n  9 10, 11 12', ->
      expect(str parse('// \n 1 2, 3 4\n // \n  5 6, 7 8\n // \n  9 10, 11 12')).to.equal "[begin! [1 2] [3 4] [5 6] [7 8] [9 10] [11 12]]"


