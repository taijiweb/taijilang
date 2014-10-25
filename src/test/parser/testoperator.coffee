chai = require("chai")
expect = chai.expect
iit = it.only
idescribe = describe.only
ndescribe = ->
nit = ->

lib = '../../lib/'
{constant, isArray, str} = require lib+'parser/base'
{Parser} = require lib+'parser'

{IDENTIFIER, NUMBER, NEWLINE, INDENT, UNDENT, HALF_DENT, PAREN, BLOCK_COMMENT, EOI, SPACE
PAREN_OPERATOR_EXPRESSION, COMPACT_CLAUSE_EXPRESSION, SPACE_CLAUSE_EXPRESSION, OPERATOR_EXPRESSION} = constant

matchRule = (parser, rule) -> ->
  token = parser.matchToken()
  if token.type==NEWLINE then parser.matchToken()
  if token.type==SPACE then parser.matchToken()
  rule()

describe "parse operator expression: ", ->
  parse = (text) ->
    parser = new Parser()
    x = parser.parse(text, matchRule(parser, parser.operatorExpression), 0)
  describe "atom: ", ->
    it "parse 1", ->
      expect(str parse('1')).to.deep.equal '1'
    it "parse a", ->
      expect(str parse('a')).to.deep.equal 'a'
    it "parse 'a'", ->
      expect(str parse("'a'")).to.deep.equal "\"a\""
    it 'parse "a"', ->
      expect(str parse('"a"')).to.deep.equal "[string! \"a\"]"

  describe "prefix: ",  ->
    it 'should parse +1', ->
      expect(str parse('+1 ')).to.deep.equal "[+x 1]"
    it 'should parse !1', ->
      expect(str parse('!1 ')).to.deep.equal "[!x 1]"
    it 'should parse + 1', ->
      expect(str parse('+ 1 ')).to.deep.equal "[+x 1]"
    it 'should parse + + 1', ->
      expect(str parse('+ + 1 ')).to.deep.equal "[+x [+x 1]]"
    it 'should parse %lineno', ->
      expect(str parse('%lineno')).to.deep.equal "[%x lineno]"
    it 'should parse %lineno()', ->
      expect(str parse('%lineno()')).to.deep.equal "[call! [%x lineno] []]"

  describe "add and multiply: ", ->
    it "parse 1+2", ->
      expect(str parse('1+2')).to.deep.equal '[+ 1 2]'

    it "parse 1+.!2", ->
      expect(str parse('1+.!2')).to.deep.equal "[+ 1 [!x 2]]"

    it "parse 1 + 2", ->
      expect(str parse('1 + 2')).to.deep.equal '[+ 1 2]'

    it "parse 1+ 2", ->
      expect(-> parse('1+ 2')).to.throw /unexpected spaces or new lines after binary operator/

    it "parse 1+ 2*3", ->
      expect(-> parse('1+ 2*3')).to.throw /unexpected spaces or new lines after binary operator/

    it "parse (1, 2)", ->
      expect(str parse('(1, 2)')).to.deep.equal '[, 1 2]'
    it "parse (1, 2+3)", ->
      expect(str parse('(1, 2+3)')).to.deep.equal '[, 1 [+ 2 3]]'
    it "parse (1,2 + 3)", ->
      expect(str parse('(1,2 + 3)')).to.deep.equal "[+ [, 1 2] 3]"

    it "parse (1 +2)", ->
      expect(-> parse('(1 +2)')).to.throw /should have spaces at its right side/

    it "parse 1+2 * 3", ->
      expect(str parse('1+2 * 3')).to.deep.equal '[* [+ 1 2] 3]'

    it "parse 1 + 2*3", ->
      expect(str parse('1 + 2*3')).to.deep.equal '[+ 1 [* 2 3]]'

    it "parse 1+2+3", ->
      expect(str parse('1+2+3')).to.deep.equal "[+ [+ 1 2] 3]"

    it "parse 1+2+3+4+5+6", ->
      expect(str parse('1+2+3+4+5+6')).to.deep.equal "[+ [+ [+ [+ [+ 1 2] 3] 4] 5] 6]"

    it "parse 1*2+3+4+5+6", ->
      expect(str parse('1*2+3+4+5+6')).to.deep.equal "[+ [+ [+ [+ [* 1 2] 3] 4] 5] 6]"

    it "parse 1*2+3+4*5+6", ->
      expect(str parse('1*2+3+4*5+6')).to.deep.equal "[+ [+ [+ [* 1 2] 3] [* 4 5]] 6]"

    it "parse 1 + 2+3", ->
      expect(str parse('1 + 2+3')).to.deep.equal "[+ 1 [+ 2 3]]"

    it "parse 1+2*3", ->
      expect(str parse('1+2*3')).to.deep.equal '[+ 1 [* 2 3]]'

    it "parse 1+2/3", ->
      expect(str parse('1+2/3')).to.deep.equal '[+ 1 [/ 2 3]]'

    it "parse 1*2+3", ->
      expect(str parse('1*2+3')).to.deep.equal "[+ [* 1 2] 3]"

    it "parse 1*(2+3)", ->
      expect(str parse('1*(2+3)')).to.deep.equal  '[* 1 [+ 2 3]]'

    it "parse (1)", ->
      expect(str parse('(1)')).to.deep.equal '1'

    it "parse (1+2)*(3+4)", ->
      expect(str parse('(1+2)*(3+4)')).to.deep.equal '[* [+ 1 2] [+ 3 4]]'

  describe "multi lines expression: ", ->
    it "parse 1+2\n*3", ->
      expect(str parse('1+2\n*3')).to.deep.equal '[* [+ 1 2] 3]'

    it "parse 1+2\n* 3", ->
      expect(str parse('1+2\n* 3')).to.deep.equal '[* [+ 1 2] 3]'

    it "parse 1+2\n+4\n*3", ->
      expect(str parse('1+2\n+4\n*3')).to.deep.equal '[* [+ [+ 1 2] 4] 3]'

    it "parse 1+2\n+4*3", ->
      expect(str parse('1+2\n+4\n*3')).to.deep.equal '[* [+ [+ 1 2] 4] 3]'

    it "parse 1+2\n+4\n*3\n/6", ->
      expect(str parse('1+2\n+4\n*3\n/6')).to.deep.equal '[/ [* [+ [+ 1 2] 4] 3] 6]'

    it "parse 1+2\n+4\n*3\n&6", ->
      expect(str parse('1+2\n+4\n*3\n&6')).to.deep.equal "[& [* [+ [+ 1 2] 4] 3] 6]"

    it "parse 1+2\n+4\n*.!3\n&6+8*(9-3)", ->
      expect(str parse('1+2\n+4\n*.!3\n&6+8*(9-3)')).to.deep.equal "[& [* [+ [+ 1 2] 4] [!x 3]] [+ 6 [* 8 [- 9 3]]]]"

    it "parse 1+2\n+4\n/5\n*3==7", ->
      expect(str parse('1+2\n+4\n/5\n*3==7')).to.deep.equal "[* [/ [+ [+ 1 2] 4] 5] [== 3 7]]"

    it "parse 1+2\n+4\n*5\n*3==7", ->
      expect(str parse('1+2\n+4\n*5\n*3==7')).to.deep.equal "[* [* [+ [+ 1 2] 4] 5] [== 3 7]]"

    it "parse 1/\n2", ->
      expect(-> parse('1/\n2')).to.throw /unexpected new line/

    it "parse 1+2\n+4/\n*5\n*3==7", ->
      expect(-> parse('1+2\n+4/\n*5\n*3==7')).to.throw /unexpected new line/

  describe "indent expression: ", ->
    it "parse 1\n *3", ->
      expect(str parse('1\n *3')).to.deep.equal '[* 1 3]'

    it "parse (1\n *3\n)", ->
      expect(str parse('(1\n *3\n)')).to.deep.equal '[* 1 3]'

    it "parse 1\n *3\n/ 5", ->
      expect(str parse('1\n *3\n/ 5')).to.deep.equal '[/ [* 1 3] 5]'

    it "parse 1+2\n* 3+6", ->
      expect(str parse('1+2\n* 3+6')).to.deep.equal '[* [+ 1 2] [+ 3 6]]'

    it "parse 1+2\n * 3", ->
      expect(str parse('1+2\n * 3')).to.deep.equal '[* [+ 1 2] 3]'

    it "parse 1+2\n * 3+6", ->
      expect(str parse('1+2\n * 3+6')).to.deep.equal '[* [+ 1 2] [+ 3 6]]'

    it "parse 1+2\n * 3+6\n + 5+8", ->
      expect(str parse('1+2\n * 3+6\n + 5+8')).to.deep.equal "[* [+ 1 2] [+ [+ 3 6] [+ 5 8]]]"

  describe "attribute!, index!: ", ->
    it "parse a.b", ->
      expect(str parse('a.b')).to.deep.equal '[attribute! a b]'
    it "parse %a.b", ->
      expect(str parse('%a.b')).to.deep.equal "[attribute! [%x a] b]"
    it "parse %a()", ->
      expect(str parse('%a()')).to.deep.equal "[call! [%x a] []]"
    it "parse a.b.c", ->
      expect(str parse('a.b.c')).to.deep.equal "[attribute! [attribute! a b] c]"
    it "parse a.b()", ->
      expect(str parse('a.b()')).to.deep.equal '[call! [attribute! a b] []]'
    it "parse @b.c", ->
      expect(str parse('@b.c')).to.deep.equal "[attribute! [attribute! @ b] c]"
    it "parse @b()", ->
      expect(str parse('@b()')).to.deep.equal "[call! [attribute! @ b] []]"
    it "parse a . b", ->
      expect(str parse('a . b')).to.deep.equal '[attribute! a b]'

    nit "parse a&/b", ->
      expect(str parse('a&/b')).to.deep.equal '[index! a b]'
    nit "parse a&/(1,2)", ->
      expect(str parse('a&/(1,2)')).to.deep.equal '[index! a [, 1 2]]'
    nit "parse '1'&/1", ->
      expect(str parse("'1'&/1")).to.deep.equal "[index! \"1\" 1]"
    nit "parse '1'&/(1,2)", ->
      expect(str parse("'1'&/(1,2)")).to.deep.equal "[index! \"1\" [, 1 2]]"

    it "parse a[1]", ->
      expect(str parse('a[1]')).to.deep.equal '[index! a 1]'
    it "parse a (1)", ->
      expect(str parse('a (1)')).to.equal 'a'
    it "parse a [1]", ->
      expect(str parse('a [1]')).to.equal 'a'
    it "parse a[1][2]", ->
      expect(str parse('a[1][2]')).to.deep.equal '[index! [index! a 1] 2]'

  describe "call: ", ->
    it "parse a(1)", ->
      expect(str parse('a(1)')).to.deep.equal '[call! a [1]]'
    it "parse a(1 , 2)", ->
      expect(str parse('a(1 , 2)')).to.deep.equal "[call! a [1 2]]"
    it "parse a(1 , 2 , 3)", ->
      expect(str parse('a(1 , 2 , 3)')).to.deep.equal  '[call! a [1 2 3]]'

  describe "ellipsis: ", ->
    it "parse 1...5", ->
      expect(str parse('1...5')).to.deep.equal "[... 1 5]"

  describe "unquote: ", ->
    it "parse ^a", ->
      expect(str parse('^a')).to.deep.equal '[unquote! a]'
    it "parse ^&a", ->
      expect(str parse('^&a')).to.deep.equal "[unquote-splice a]"
    it "parse ^& a", ->
      expect(str parse('^& a')).to.deep.equal "[unquote-splice a]"

  describe "comma expression: ", ->
    it "parse 1 , 2", ->
      expect(str parse('1 , 2')).to.deep.equal '[, 1 2]'
    it "parse (1 , 2)", ->
      expect(str parse('(1 , 2)')).to.deep.equal '[, 1 2]'
    it "parse 1 , 2 , 3", ->
      expect(str parse('1 , 2 , 3')).to.deep.equal '[, 1 2 3]'
    it "parse (1 , 2 , 3)", ->
      expect(str parse('(1 , 2 , 3)')).to.deep.equal '[, 1 2 3]'

  describe "assign and right assocciation: ", ->
    it "parse a=1", ->
      expect(str parse('a=1')).to.deep.equal '[= a 1]'

    it "parse a = 1", ->
      expect(str parse('a = 1')).to.deep.equal '[= a 1]'

    it "parse a = b = 1", ->
      expect(str parse('a = b = 1')).to.deep.equal '[= a [= b 1]]'

    it "parse a += b = 1", ->
      expect(str parse('a += b = 1')).to.deep.equal '[+= a [= b 1]]'

  # ? should be identifier character, : should lead clauses.
  # {if! x y z} can be expression, so {x? y: z} is deprecated.
  ndescribe "ternary, i.e. condition expression: ", ->
    it "parse 1 ?  2 :  3", ->
      expect(str parse('1 ?  2 :  3')).to.deep.equal '[?: 1 2 3]'

    it "parse 1 ?  (a = 3) :  (b = 4)", ->
      expect(str parse('1 ?  (a = 3) :  (b = 4)')).to.deep.equal '[?: 1 [= a 3] [= b 4]]'

    it "parse a = 1 ?  2 :  3", ->
      expect(str parse('a = 1 ?  2 :  3')).to.deep.equal '[= a [?: 1 2 3]]'
