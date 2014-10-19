chai = require("chai")
expect = chai.expect
iit = it.only
idescribe = describe.only

ndescribe = ->
nit = ->

lib = '../../lib/'
{constant, isArray, str} = require lib+'parser/base'
{getOperatorExpression} = require lib+'parser/operator'
{Parser} = require lib+'parser/parser'

{IDENTIFIER, NUMBER, NEWLINE, INDENT, UNDENT, HALF_DENT, PAREN, BLOCK_COMMENT, EOI, SPACE
PAREN_OPERATOR_EXPRESSION, COMPACT_CLAUSE_EXPRESSION, SPACE_CLAUSE_EXPRESSION, OPERATOR_EXPRESSION} = constant

matchRule = (parser, rule) -> ->
  token = parser.matchToken()
  if token.type==NEWLINE then parser.matchToken()
  if token.type==SPACE then parser.matchToken()
  rule()

describe "parser basic: ",  ->
  ndescribe "parse number: ",  ->
    parser = new Parser()
    parse = (text) ->
      parser.parse(text, parser.matchToken, 0)
      parser.token().value

    describe "is number: ",  ->
      it "parse 1", ->
        expect(parse('1')).to.equal 1
      it "parse 01", ->
        expect(parse('01')).to.equal 1
      it "parse 0x01", ->
        expect(parse('0x01')).to.equal 1
      it "parse 0xa", ->
        expect(parse('0xa')).to.equal 10
      it "parse 1.", ->
        expect(parse('1.')).to.equal 1
        expect(parser.cursor()).to.equal 1
        expect(parser.endOfInput()).to.equal false
      it "parse 1.e0", ->
        expect(parse('1.e0')).to.equal 1
      it "parse 1.0e023", ->
        x = parse '1.0e023'
#        console.log x
        expect(x).to.equal 1.0e23
#        expect(1.e23).to.equal 1.e23
      it "parse 1.0e-23", ->
        expect(parse('1.0e-23')).to.equal 1.0e-23
      it "parse 1.e-23", ->
        x = parse '1.e-23'
#        console.log x
        expect(x).to.equal 1.0e-23
      it "parse 1.0e+023", ->
        expect(parse('1.0e+23')).to.equal 1.0e+23
      it "parse 1.e23", ->
        expect(parse('1.e23')).to.equal 1.0e23
      it "parse 1e23", ->
        expect(parse('1e23')).to.equal 1.0e23
      it "parse 1e023", ->
        expect(parse('1e023')).to.equal 1.0e23
      it "parse 1.e", ->
        expect(parse('1.e')).to.equal 1
      it "parse 1.ea", ->
        expect(parse('1.ea')).to.equal 1
      it "parse 1.e+", ->
        expect(parse('1.e+')).to.equal 1
      it "parse 1.e-", ->
        expect(parse('1.e-')).to.equal 1
      it "parse 1.e*", ->
        expect(parse('1.e*')).to.equal 1

    describe "is not number: ",  ->
      it "parse .1", ->
        expect(parse('.1')).to.equal undefined
      it "parse +1.", ->
        expect(parse('+1.')).to.equal undefined
      it "parse +1.e0", ->
        expect(parse('+1.e0')).to.equal undefined
      it "parse -.1", ->
        expect(parse('-.1')).to.equal undefined
      it "parse +1.e023", ->
        expect(parse('+1.e023')).to.equal undefined
      it "parse +1.e", ->
        expect(parse('+1.e')).to.equal undefined
      it "parse +.e", ->
        expect(parse('+.e')).to.equal undefined
      it "parse +.", ->
        expect(parse('+.')).to.equal undefined
      it "parse -.", ->
        expect(parse('-.')).to.equal undefined

  describe "parse identifier: ",  ->
    parser = new Parser()
    describe "parse parser.identifier: ",  ->
      parse = (text) ->
        x = parser.parse(text, parser.matchToken, 0)
        parser.token().value

      it "parse a", ->
        expect(parse('a')).to.equal 'a'
        expect(parser.token().type).to.equal IDENTIFIER
      it "parse ?", ->
        parse('?'); expect(parser.token().type).to.not.equal IDENTIFIER
      it "parse #", ->
        parse('?'); expect(parser.token().type).to.not.equal IDENTIFIER
      it "parse !ds", ->
        parse('?'); expect(parser.token().type).to.not.equal IDENTIFIER

    ndescribe "parse taijiIdentifier: ",  ->
      parse = (text) ->
        x = parser.parse(text, parser.taijiIdentifier, 0)
        #      console.log JSON.stringify x
        x and x.value

      it "parse a", ->
        expect(parse('a')).to.equal 'a'
      it "parse ?", ->
        expect(parse('?')).to.equal undefined
      it "parse #", ->
        expect(parse('#')).to.equal undefined
      it "parse !ds", ->
        expect(parse('!ds')).to.equal undefined
      it "parse a!", ->
        expect(parse('a!')).to.equal 'a!'
      # "x #= y" is defined as "## [= x y]', so '#' should not be used as identifier char
      it "parse a!#", ->
        expect(parse('a!#')).to.equal 'a!'
      it "parse $a", ->
        expect(parse('$a')).to.equal '$a'
      it "parse $a_", ->
        expect(parse('$a_')).to.equal '$a_'
      it "parse $a_1", ->
        expect(parse('$a_1')).to.equal '$a_1'
      it "parse _1", ->
        expect(parse('_1')).to.equal '_1'
      it "parse _a1", ->
        expect(parse('_a1')).to.equal '_a1'

  describe "parse escaped string symbol:",  ->
    parse = (text) ->
      parser = new Parser()
      x = parser.parse(text, matchRule(parser, parser.atom), 0).value
    it "parse \\\"x...\"", ->
      expect(str parse('\\\"x...\"')).to.equal 'x...'

  describe "parse string: ",  ->
    parse = (text) ->
      parser = new Parser()
      parser.parse(text, parser.matchToken, 0)
      x = parser.token()
      x

    describe "parse interpolate string: ",  ->
      it "parse a", ->
        expect(str parse('"a"')).to.equal '[string! "a"]'
      it "parse $a", ->
        expect(str parse('"$a"')).to.equal "[string! a]"
      it "parse $a:", ->
        expect(str parse('"$a:"')).to.equal "[string! $a: a]"
      it "parse $a\\:", ->
        expect(str parse('"$a\\:"')).to.equal "[string! a \"\\:\"]"
      it "parse $", ->
        expect(str parse('"$"')).to.equal "[string! \"$\"]"
      it "parse a\\b", ->
        expect(str parse('"a\\b"')).to.equal '[string! "a\\b"]'
      it "parse '''a\"'\\n'''", ->
        expect(str parse('"""a\\"\'\\n"""')).to.equal "[string! \"a\\\"'\\n\"]"
      it """parse "a(1)" """, ->
        expect(str parse('"a(1)"')).to.equal "[string! \"a(\" 1 \")\"]"
      it """parse "a[1]" """, ->
        expect(str parse('"a[1]"')).to.equal "[string! \"a[\" [list! 1] \"]\"]"
      it """str parse "a[1] = $a[1]" """, ->
        expect(str parse('"a[1] = $a[1]"')).to.equal "[string! \"a[\" [list! 1] \"]\" \" = \" [index! a 1]]"

    describe "parse raw string without interpolation: ",  ->
      it "parse '''a\\b'''", ->
        expect(str parse("'''a\\b'''")).to.equal '"a\\\\b"'
      it "parse '''\\\na\\b'''", ->
        expect(str parse("'''\\\na\\b'''")).to.equal '"a\\\\b"'
      it "parse '''a\\b\ncd'''", ->
        expect(str parse("'''a\\b\ncd'''")).to.equal "\"a\\\\b\\ncd\""
      it "parse '''a\\b\n\rcd'''", ->
        expect(str parse("'''a\\b\n\rcd'''")).to.equal "\"a\\\\b\\n\\rcd\""
      it "parse '''a\"'\\n'''", ->
        expect(str parse("'''a\"'\\n'''")).to.equal "\"a\"'\\\\n\""

    describe "parse escape string without interpolation: ",  ->
      it "parse 'a\\b'", ->
        expect(str parse("'a\\b'")).to.equal '"a\\b"'
      it "parse 'a\\b\ncd'", ->
        expect(str parse("'a\\b\ncd'")).to.equal '"a\\b\\ncd"'
      it "parse 'a\\b\\\ncd'", ->
        expect(str parse("'a\\b\\\ncd'")).to.equal '"a\\bcd"'
      it "parse 'a\"\\\"\'\\n'", ->
        expect(str parse("'a\"\\\"\\'\\n'")).to.equal '"a\"\\\"\'\\n"'
      it "parse 'a\"\\\"\\'\\n\n'", ->
        expect(str parse("'a\"\\\"\\'\\n\n'")).to.equal '"a\"\\\"\'\\n\\n"'
      it "parse 'a\"\\\"\n\'\\n'", ->
        expect(str parse("'a\"\\\"\n\\'\\n\n'")).to.equal '"a\"\\\"\\n\'\\n\\n"'

  describe "parse regexp: ",  ->
    describe "parse regexp: ",  ->
      parse = (text) ->
        parser = new Parser()
        parser.parse(text, parser.matchToken, 0)
        x = parser.token()
        x
      it "parse /!-h\b|-r\b|-v\b|-b\b/", ->
        expect(str parse('/!-h\b|-r\b|-v\b|-b\b/')).to.equal "[regexp! /-h\b|-r\b|-v\b|-b\b/]"

  describe "prefixOperator: ",  ->
    parse = (text) ->
      parser = new Parser()
      prefixOperator = ->
        parser.prefixOperator('opExp')
      x = parser.parse(text, matchRule(parser, prefixOperator), 0)
      if x then x.symbol                                                                        
      else return
    it 'should parse ++', ->
      expect(parse('++1')).to.equal '++x'
    it 'should parse new', ->
      expect(parse('new a')).to.equal 'new'
    it 'should parse new.a', ->
      expect(parse('new.a')).to.equal 'new'
    it 'should parse +a', ->
      expect(parse('+a')).to.equal '+x'
    it 'should parse +\n a', ->
      expect(parse('+a')).to.equal '+x'
    it 'should parse +/**/a', ->
      expect(parse('+/**/a')).to.equal '+x'
    it 'should parse +/**/)', ->
      expect(parse('+/**/)')).to.equal '+x'

  describe "suffixOperator: ",  ->
    parse = (text) ->
      parser = new Parser()
      x = parser.parse(text, (-> parser.matchToken(); parser.suffixOperator(OPERATOR_EXPRESSION, {value:0}, 0)), 0)
      if x then x.symbol
      else return
    it 'should parse ++', ->
      expect(parse('++')).to.equal 'x++'
    it 'should parse .++', ->
      # expect(parse('.++')).to.equal 'x++'
      expect(parse('.++')).to.equal undefined

  describe "binaryOperator: ",  ->
    parse = (text) ->
      parser = new Parser()
      root = ->
        parser.matchToken()
        parser.binaryOperator(OPERATOR_EXPRESSION, {value:0}, 0, true)
      x = parser.parse(text, root, 0)
      if x then x.symbol
      else return
    it 'should parse ==1', ->
      expect(parse('==1')).to.equal '=='
    it 'should parse +1', ->
      expect(parse('+1')).to.equal '+'
    it 'should parse and', ->
      expect(parse(' and 1')).to.equal '&&'

  describe "compact clause binaryOperator: ",  ->
    parse = (text) ->
      parser = new Parser()
      root = ->
        parser.matchToken()
        parser.binaryOperator(COMPACT_CLAUSE_EXPRESSION, {value:0}, 0, true)
      x = parser.parse(text, root, 0)
      if x then x.symbol
      else return
    it 'should parse ==1', ->
      expect(parse('==1')).to.equal '=='
    it 'should parse +1', ->
      expect(parse('+1')).to.equal '+'
    it 'should parse + 1', ->
      expect(parse(' + 1')).to.equal undefined
    it 'should parse and 1', ->
      expect(parse(' and 1')).to.equal undefined

  xdescribe "space clause binaryOperator: ",  ->
    parse = (text) ->
      parser = new Parser()
      root = ->
        parser.matchToken()
        parser.binaryOperator(SPACE_CLAUSE_EXPRESSION, {value:0}, 0, true)
      x = parser.parse(text, root, 0)
      if x then x.symbol
      else return
    it 'should parse ==1', ->
      expect(parse('==1')).to.equal '=='
    it 'should parse +1', ->
      expect(parse('+1')).to.equal '+'
    it 'should parse + 1', ->
      expect(parse(' + 1')).to.equal '+'
    it 'should parse and 1', ->
      expect(parse(' and 1')).to.equal '&&'

  describe "symbol: ",  ->
    parse = (text) ->
      parser = new Parser()
      parser.parse(text, parser.matchToken, 0)
      x = parser.token()
      x
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
    xit 'should parse (++', ->
      expect(str parse('(++')).to.equal undefined

  describe "matchToken: ",  ->
    parser = new Parser()
    parse = (text) ->
      parser.init(text, 0)
      parser.matchToken()
      x = parser.token()
      x

    describe "simple token: ",  ->
      it "parse toString", ->
        expect(str parse('toString')).to.equal 'toString'
      it "parse 123", ->
        expect(str parse('123')).to.equal '123'
      it "parse 123.5", ->
        expect(str parse('123.5')).to.equal '123.5'
      it "parse 123.5e4", ->
        expect(str parse('123.5e4')).to.equal "1235000"
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
      xit "parse \\/(", ->
        expect(str parse("\\/(")).to.equal '\\/'
      it "parse */*multiply*/", ->
        expect(str parse('*/*multiply*/')).to.equal '*'

    describe "space and comment: ",  ->
      it "parse inline space comment", ->
        parser = new Parser()
        parser.init('123   /*sfadl*/', 0)
        parser.matchToken()
        parser.matchToken()
        x = parser.token()
        expect(x.value).to.equal '   /*sfadl*/'
      it "parse multiple line space comment", ->
        parser = new Parser()
        parser.init('123   /*sfadl*/ \n // line comment \n something', 0)
        parser.matchToken()
        parser.matchToken()
        x = parser.token()
        expect(x.value).to.equal "   /*sfadl*/ \n "
      it "parse multiple line space comment 2", ->
        parser = new Parser()
        parser.init('123   /*sfadl*/ \n// line comment \n// line comment 2\n something', 0)
        parser.matchToken()
        parser.matchToken()
        x = parser.token()
        expect(x.value).to.equal "   /*sfadl*/ \n// line comment \n// line comment 2\n "
      it "parse multiple line space comment 3", ->
        parser = new Parser()
        parser.init('123   // line comment // line comment 2\n/*fds;j*/ something', 0)
        parser.matchToken()
        parser.matchToken()
        x = parser.token()
        expect(x.value).to.equal "   // line comment // line comment 2\n/*fds;j*/ "
      it "parse multiple line space comment 4", ->
        parser = new Parser()
        parser.init('123   // line comment \n// line comment 2\n/*fds;j*/ /*asdf\nkljl*/\n  something', 0)
        parser.matchToken()
        parser.matchToken()
        x = parser.token()
        expect(x.value).to.equal "   // line comment \n// line comment 2\n/*fds;j*/ /*asdf\nkljl*/\n  "
      it "parse c style block comment leads more space lines", ->
        parser = new Parser()
        parser.init('/*fdsafdsa*/// line comment \n// line comment 2\n/*fds;j*/ /*asdf\nkljl*/\n  something', 0)
        parser.matchToken()
        x = parser.token()
        expect(x.value).to.equal "/*fdsafdsa*/// line comment \n// line comment 2\n/*fds;j*/ /*asdf\nkljl*/\n  "

  describe "parse atom: ",  ->
    parser = new Parser()
    parse = (text) ->
      x = parser.parse(text, matchRule(parser, parser.atom), 0)
      str x

    describe "toString: ",  ->
      it "parse toString", ->
        expect(parse('toString')).to.equal "toString"

  xdescribe "parenthesis: ",  ->
    parse = (text) ->
      parser = new Parser()
      x = parser.parse(text, parser.paren, 0)
    it 'should parse ()', ->
      x = parse('()')
      expect(x.type).to.equal PAREN
      expect(x.value).to.equal undefined
    it 'should parse (a)', ->
      x = parse('(a)')
      expect(x.type).to.equal PAREN
      expect(x.value.type).to.equal IDENTIFIER
      expect(x.value.value).to.equal 'a'
    it 'should parse (a,b)', ->
      x = parse('(a,b)')
      expect(x.type).to.equal PAREN
      expect(str getOperatorExpression x).to.equal '[, a b]'

  describe "compact clause expression:", ->
    parse = (text) ->
      parser = new Parser()
      x = parser.parse(text, matchRule(parser, parser.compactClauseExpression), 0)
      getOperatorExpression x
    it 'should parse a', ->
      expect(str parse('a')).to.equal "a"
    it 'should parse a.b', ->
      expect(str parse('a.b')).to.equal "[attribute! a b]"
    it 'should parse a.b.c', ->
      expect(str parse('a.b.c')).to.equal '[attribute! [attribute! a b] c]'

    # x[i] can be used as subscript, so a&/b is deprecated.
    nit 'should parse a&/b', ->
      expect(str parse('a&/b')).to.equal  '[index! a b]'
    nit 'should parse a&/b&/c', ->
      expect(str parse('a&/b&/c')).to.equal '[index! [index! a b] c]'

    it 'should parse a(b)', ->
      expect(str parse('a(b)')).to.equal  '[call() a [b]]'
    it 'should parse a()', ->
      expect(str parse('a()')).to.equal '[call! a []]'
    it 'should parse a::b ', ->
      expect(str parse('a::b')).to.equal '[attribute! [attribute! a ::] b]'
    it 'should parse ^1', ->
      expect(str parse('`.^1')).to.equal "[quasiquote! [unquote! 1]]"
    it 'should parse `.^1', ->
      expect(str parse('`.^1')).to.equal "[quasiquote! [unquote! 1]]"
    # gotcha: prefixOperator['toString'] == Object.toString function!!!
    it 'should parse (a)', ->
      expect(str parse('(a)')).to.equal "a"
    it 'should parse Object.prototype.toString', ->
      expect(str parse('Object.prototype.toString')).to.equal "[attribute! [attribute! Object prototype] toString]"
    it 'should parse Object.prototype.toString.call', ->
      expect(str parse('Object.prototype.toString.call')).to.equal "[attribute! [attribute! [attribute! Object prototype] toString] call]"
    it 'should parse x.toString.call', ->
      expect(str parse('x.toString.call')).to.equal "[attribute! [attribute! x toString] call]"
    it 'should parse toString.call', ->
      expect(str parse('toString.call')).to.equal "[attribute! toString call]"
    it "parse 1,/-h\b|-r\b|-v\b|-b\b/", ->
      expect(str parse('1,/-h\b|-r\b|-v\b|-b\b/')).to.equal '1'
    it "parse 1+./!1/.test('1')", ->
      expect(str parse("1+./!1/.test('1')")).to.equal "[+ 1 [call() [attribute! [regexp! /1/] test] [\"1\"]]]"
    it "parse x=./!1/", ->
      expect(str parse('x=./!1/')).to.equal "[= x [regexp! /1/]]"
    it "parse x=./!1/g", ->
      expect(str parse('x=./!1/g')).to.equal "[= x [regexp! /1/g]]"

  describe "space clause expression:", ->
    parse = (text) ->
      parser = new Parser()
      x = parser.parse(text,  matchRule(parser, parser.spaceClauseExpression), 0)
      getOperatorExpression x
    it 'should parse require.extensions[".tj"] = ->', ->
      expect(str parse('require.extensions[".tj"] = ->')).to.equal "[index! [attribute! require extensions] [string! \".tj\"]]"

  describe "@ as this", ->
    parse = (text) ->
      parser = new Parser()
      x = parser.parse(text, matchRule(parser, parser.operatorExpression), 0)
      getOperatorExpression x
    it 'should parse @', ->
      expect(str parse('@')).to.equal '@'
    it 'should parse @a', ->
      expect(str parse('@a')).to.equal '[attribute! @ a]'
    it 'should parse @ a', ->
      expect(str parse('@ a')).to.equal '@'

  describe "definition parameter", ->
    parse = (text) ->
      parser = new Parser()
      x = parser.parse(text, matchRule(parser, parser.parameterList), 0)
      x
    it 'should parse (a)', ->
      expect(str parse('(a)')).to.equal "[a]"
    it 'should parse (a, b)', ->
      expect(str parse('(a, b)')).to.equal "[a b]"
    it 'should parse (a..., b)', ->
      expect(str parse('(a..., b)')).to.equal "[[x... a] b]"

  describe "definition", ->
    parse = (text) ->
      parser = new Parser()
      x = parser.parse(text,  matchRule(parser, parser.definition), 0)
      x
    iit 'should parse -> 1', ->
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
        expect(str parse('@a')).to.equal '[attribute! @ a]'
      it 'should parse @ a', ->
        expect(str parse('@ a')).to.equal '[@ a]'

    describe "expressionClause", ->
      it 'should parse 1\n2', ->
        expect(str parse('1\n2')).to.equal '1'
      it 'should parse 1 + 2', ->
        expect(str parse('1 + 2')).to.equal "[+ 1 2]"

    describe "unaryExpressionClause", ->
      it 'should parse print 1', ->
        expect(str parse('print 1\n2')).to.equal "[print 1]"
#      it 'should parse  if! x==0 0 even(x-1)\n even = (x) -> if! x==0 1 odd(x-1) \nthen odd(3)', ->
#        expect(str parse('if! x==0 0 even(x-1)\n even = (x) -> if! x==0 1 odd(x-1) \nthen odd(3)')).to.equal "undefined"

    describe "sequenceClause", ->
      it 'should parse print 1 2', ->
        expect(str parse('print 1 2')).to.equal "[print 1 2]"

    describe "colonClause", ->
      it 'should parse print: 1 + 2, 3', ->
        expect(str parse('print: 1 + 2, 3')).to.equal "[print [+ 1 2] 3]"

  xdescribe ":: as prototype", ->
    parse = (text) ->
      parser = new Parser()
      x = parser.parse(text, parser.clause, 0)
      x
    it 'should parse @:: ', ->
      expect(str parse('@::')).to.equal '[attribute! @ ::]'
    it 'should parse a:: ', ->
      expect(str parse('a::')).to.equal '[attribute! a ::]'
    it 'should parse a::b ', ->
      expect(str parse('a::b')).to.equal '[attribute! [attribute! a ::] b]'
    it 'should parse ::a', ->
      expect(str parse('::a')).to.equal '[attribute! :: a]'

  xdescribe "quote! expression: ", ->
    parse = (text) ->
      parser = new Parser()
      x = parser.parse(text, parser.clause, 0)
    describe "quote! expression: ", ->
      it 'should parse ~ a.b', ->
        expect(str parse('~ a.b')).to.equal '[quote! [attribute! a b]]'
      it 'should parse ~ print a b', ->
        expect(str parse('~ print a b')).to.equal '[quote! [print a b]]'
      it 'should parse ` print a b', ->
        expect(str parse('` print a b')).to.equal '[quasiquote! [print a b]]'
      it 'should parse ~ print : min a \n abs b', ->
        expect(str parse('~ print : min a \n abs b')).to.equal '[quote! [print [min a [abs b]]]]'
      it 'should parse ` a.b', ->
        expect(str parse('` a.b')).to.equal '[quasiquote! [attribute! a b]]'

  xdescribe "unquote! expression: ", ->
    parse = (text) ->
      parser = new Parser()
      x = parser.parse(text, parser.clause, 0)
    describe "unquote! expression: ", ->
      it 'should parse ^ a.b', ->
        expect(str parse('^ a.b')).to.equal '[unquote! [attribute! a b]]'
      it 'should parse ^ print a b', ->
        expect(str parse('^ print a b')).to.equal '[unquote! [print a b]]'
      it 'should parse `.^1', ->
        expect(str parse('`.^1')).to.equal "[quasiquote! [unquote! 1]]"

    describe "unquote-splice expression", ->
      it 'should parse ^& a.b', ->
        expect(str parse('^& a.b')).to.equal '[unquote-splice [attribute! a b]]'
      it 'should parse ^&a.b', ->
        expect(str parse('^&a.b')).to.equal '[unquote-splice [attribute! a b]]'
      it 'should parse (^&a).b', ->
        expect(str parse('(^&a).b')).to.equal "[attribute! [unquote-splice a] b]"
      it 'should parse ^@ print a b', ->
        expect(str parse('^& print a b')).to.equal '[unquote-splice [print a b]]'
      it 'should parse ^print a b', ->
        expect(str parse('^print a b')).to.equal "[[unquote! print] a b]"

  xdescribe "hash: ",  ->
    describe "hash item: ",  ->
      parse = (text) ->
        parser = new Parser()
        x = parser.parse(text, parser.hashItem, 0)
      it 'should parse 1:2', ->
        expect(str parse('1:2')).to.equal '[jshashitem! 1 2]'
      it 'should parse a:2', ->
        expect(str parse('a:2')).to.equal '[jshashitem! a 2]'
      it 'should parse a=>2', ->
        expect(str parse('a=>2')).to.equal '[pyhashitem! a 2]'

    describe "hash! expression: ",  ->
      parse = (text) ->
        parser = new Parser()
        x = parser.parse(text, parser.hash, 0)
      it 'should parse {.1:2.}', ->
        expect(str parse('{.1:2.}')).to.equal '[hash! [jshashitem! 1 2]]'
      it 'should parse {.1:2; 3:4.}', ->
        expect(str parse('{.1:2; 3:4.}')).to.equal '[hash! [jshashitem! 1 2] [jshashitem! 3 4]]'
      it 'should parse {.1:2; 3:abs\n    5.}', ->
        expect(str parse('{. 1:2; 3:abs\n    5.}')).to.equal '[hash! [jshashitem! 1 2] [jshashitem! 3 [abs 5]]]'
      it 'should parse {. 1:2; 3:4;\n 5:6.}', ->
        expect(str parse('{. 1:2; 3:4;\n 5:6.}')).to.equal '[hash! [jshashitem! 1 2] [jshashitem! 3 4] [jshashitem! 5 6]]'
      it 'should parse {. 1:2; 3:\n 5:6\n.}', ->
        expect(str parse('{. 1:2; 3:\n 5:6\n.}')).to.equal '[hash! [jshashitem! 1 2] [jshashitem! 3 [hash! [jshashitem! 5 6]]]]'
      it 'should parse {. 1:2; 3:\n 5:6;a=>8\n.}', ->
        expect(str parse('{. 1:2; 3:\n 5:6;a=>8\n.}')).to.equal "[hash! [jshashitem! 1 2] [jshashitem! 3 [hash! [jshashitem! 5 6] [pyhashitem! a 8]]]]"

  xdescribe  "line comment block",  ->
    parse = (text) ->
      parser = new Parser()
      x = parser.parse(text, parser.moduleBody, 0)
    it 'should parse // line comment\n 1', ->
      expect(str parse('// line comment\n 1')).to.equal '1'
    it 'should parse /// line comment\n 1', ->
      expect(str parse('/// line comment\n 1')).to.equal "[begin! [directLineComment! /// line comment] 1]"
    it 'should parse // line comment block\n 1 2', ->
      expect(str parse('// line comment block\n 1 2')).to.equal "[1 2]"
    it 'should parse // line comment block\n 1 2, 3 4', ->
      expect(str parse('// line comment block\n 1 2, 3 4')).to.equal '[begin! [1 2] [3 4]]'
    it 'should parse // line comment block\n 1 2, 3 4\n 5 6, 7 8', ->
      expect(str parse('// line comment block\n 1 2; 3 4\n 5 6; 7 8')).to.equal '[begin! [1 2] [3 4] [5 6] [7 8]]'
    it 'should parse // \n 1 2, 3 4\n // \n  5 6, 7 8', ->
      expect(str parse('// \n 1 2, 3 4\n // \n  5 6, 7 8')).to.equal '[begin! [1 2] [3 4] [5 6] [7 8]]'
    it 'should parse // \n 1 2, 3 4\n // \n  5 6, 7 8\n // \n  9 10, 11 12', ->
      expect(str parse('// \n 1 2, 3 4\n // \n  5 6, 7 8\n // \n  9 10, 11 12')).to.equal '[begin! [1 2] [3 4] [5 6] [7 8] [9 10] [11 12]]'

  xdescribe  "block comment ",  ->
    parse = (text) ->
      parser = new Parser()
      x = parser.parse(text, parser.line, 0)
    it 'should parse /. some comment', ->
      x = parse('/. some comment')
      expect(str x).to.equal "[]"
    it 'should parse /. some \n  embedded \n  comment', ->
      x = parse('/. some \n  embedded \n  comment')
      expect(str x).to.equal "[]"

  xdescribe  "module header",  ->
    parse = (text) ->
      parser = new Parser()
      x = parser.parse(text, parser.moduleHeader, 0)
    it 'should parse taiji language 0.1', ->
      x = parse('taiji language 0.1')
      expect(x.version).to.deep.equal {main: 0, minor:1}
      expect(x.text).to.equal 'taiji language 0.1'
    it 'should parse taiji language 0.1\n1', ->
      expect(-> parse('taiji language 3.1\n1')).to.throw /taiji 0.1 can not process taiji language/
    it 'should parse taiji language 0.1\n1', ->
      x = parse('taiji language 0.1\n header comment \n1')
      expect(x.version).to.deep.equal {main: 0, minor:1}
      expect(x.text).to.equal "taiji language 0.1\n header comment \n"
