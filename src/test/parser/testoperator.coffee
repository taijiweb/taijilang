{expect, ndescribe, idescribe, iit, nit, matchRule} = require '../util'

lib = '../../lib/'
{str} = require lib+'utils'
{Parser} = require lib+'parser'

{IDENTIFIER, NUMBER, NEWLINE, INDENT, UNDENT, HALF_DENT, PAREN, BLOCK_COMMENT, EOI, SPACE
PAREN_OPERATOR_EXPRESSION, COMPACT_CLAUSE_EXPRESSION, SPACE_CLAUSE_EXPRESSION, OPERATOR_EXPRESSION} = require lib+'constant'

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
      expect(str parse("'a'")).to.deep.equal "'a'"
    it 'parse "a"', ->
      expect(str parse('"a"')).to.deep.equal "\"a\""

  describe "prefix: ",  ->
    it 'should parse +1', ->
      expect(str parse('+1 ')).to.deep.equal "[prefix! + 1]"
    it 'should parse !1', ->
      expect(str parse('!1 ')).to.deep.equal "[prefix! ! 1]"
    it 'should parse + 1', ->
      expect(str parse('+ 1 ')).to.deep.equal "[prefix! + 1]"
    it 'should parse + + 1', ->
      expect(str parse('+ + 1 ')).to.deep.equal "[prefix! + [prefix! + 1]]"
    it 'should parse %lineno', ->
      expect(str parse('%lineno')).to.deep.equal "[prefix! % lineno]"
    it 'should parse %lineno()', ->
      expect(str parse('%lineno()')).to.deep.equal "[binary! concat() [prefix! % lineno] [()]]"

  describe "add and multiply: ", ->
    it "parse 1+2", ->
      expect(str parse('1+2')).to.deep.equal '[binary! + 1 2]'

    it "parse 1+(!2)", ->
      expect(str parse('1+(!2)')).to.deep.equal "[binary! + 1 [() [prefix! ! 2]]]"

    it "parse 1 + 2", ->
      expect(str parse('1 + 2')).to.deep.equal '[binary! + 1 2]'

    it "parse 1+ 2", ->
      expect(str parse('1+ 2')).to.equal '[binary! + 1 2]'

    it "parse 1+ 2*3", ->
      expect(str parse('1+ 2*3')).to.equal '[binary! + 1 [binary! * 2 3]]'

    it "parse (1, 2)", ->
      expect(str parse('(1, 2)')).to.deep.equal "[() [binary! , 1 2]]"
    it "parse (1, 2+3)", ->
      expect(str parse('(1, 2+3)')).to.deep.equal "[() [binary! , 1 [binary! + 2 3]]]"
    it "parse (1,2 + 3)", ->
      expect(str parse('(1,2 + 3)')).to.deep.equal "[() [binary! , 1 [binary! + 2 3]]]"

    it "parse (1 +2)", ->
      expect(str parse('(1 +2)')).to.equal '[() [binary! + 1 2]]'

    it "parse 1+2 * 3", ->
      expect(str parse('1+2 * 3')).to.deep.equal "[binary! + 1 [binary! * 2 3]]"

    it "parse 1 + 2*3", ->
      expect(str parse('1 + 2*3')).to.deep.equal '[binary! + 1 [binary! * 2 3]]'

    it "parse 1+2+3", ->
      expect(str parse('1+2+3')).to.deep.equal "[binary! + [binary! + 1 2] 3]"

    it "parse 1+2+3+4+5+6", ->
      expect(str parse('1+2+3+4+5+6')).to.deep.equal "[binary! + [binary! + [binary! + [binary! + [binary! + 1 2] 3] 4] 5] 6]"

    it "parse 1*2+3+4+5+6", ->
      expect(str parse('1*2+3+4+5+6')).to.deep.equal "[binary! + [binary! + [binary! + [binary! + [binary! * 1 2] 3] 4] 5] 6]"

    it "parse 1*2+3+4*5+6", ->
      expect(str parse('1*2+3+4*5+6')).to.deep.equal "[binary! + [binary! + [binary! + [binary! * 1 2] 3] [binary! * 4 5]] 6]"

    it "parse 1 + 2+3", ->
      expect(str parse('1 + 2+3')).to.deep.equal "[binary! + [binary! + 1 2] 3]"

    it "parse 1+2*3", ->
      expect(str parse('1+2*3')).to.deep.equal '[binary! + 1 [binary! * 2 3]]'

    it "parse 1/2", ->
      expect(str parse('1/2')).to.deep.equal "[binary! / 1 2]"

    it "parse 1+2/3", ->
      expect(str parse('1+2/3')).to.deep.equal '[binary! + 1 [binary! / 2 3]]'

    it "parse 1*2+3", ->
      expect(str parse('1*2+3')).to.deep.equal "[binary! + [binary! * 1 2] 3]"

    it "parse 1*(2+3)", ->
      expect(str parse('1*(2+3)')).to.deep.equal "[binary! * 1 [() [binary! + 2 3]]]"

    it "parse (1)", ->
      expect(str parse('(1)')).to.deep.equal "[() 1]"

    it "parse (1+2)*(3+4)", ->
      expect(str parse('(1+2)*(3+4)')).to.deep.equal "[binary! * [() [binary! + 1 2]] [() [binary! + 3 4]]]"

  describe "multi lines expression: ", ->
    it "parse 1+2\n*3", ->
      expect(str parse('1+2\n*3')).to.deep.equal "[binary! + 1 [binary! * 2 3]]"

    it "parse 1+2\n* 3", ->
      expect(str parse('1+2\n* 3')).to.deep.equal "[binary! + 1 [binary! * 2 3]]"

    it "parse 1+2\n+4\n*3", ->
      expect(str parse('1+2\n+4\n*3')).to.deep.equal "[binary! + [binary! + 1 2] [binary! * 4 3]]"

    it "parse 1+2\n+4*3", ->
      expect(str parse('1+2\n+4\n*3')).to.deep.equal "[binary! + [binary! + 1 2] [binary! * 4 3]]"

    it "parse 1+2\n+4\n*3\n/6", ->
      expect(str parse('1+2\n+4\n*3\n/6')).to.deep.equal "[binary! + [binary! + 1 2] [binary! / [binary! * 4 3] 6]]"

    it "parse 1+2\n+4\n*3\n&6", ->
      expect(str parse('1+2\n+4\n*3\n&6')).to.deep.equal "[binary! & [binary! + [binary! + 1 2] [binary! * 4 3]] 6]"

    it "parse 1+2\n+4\n*.!3\n&6+8*(9-3)", ->
      expect(str parse('1+2\n+4\n*(!3)\n&6+8*(9-3)')).to.deep.equal "[binary! & [binary! + [binary! + 1 2] [binary! * 4 [() [prefix! ! 3]]]] [binary! + 6 [binary! * 8 [() [binary! - 9 3]]]]]"

    it "parse 1+2\n+4\n/5\n*3==7", ->
      expect(str parse('1+2\n+4\n/5\n*3==7')).to.deep.equal "[binary! == [binary! + [binary! + 1 2] [binary! * [binary! / 4 5] 3]] 7]"

    it "parse 1+2\n+4\n*5\n*3==7", ->
      expect(str parse('1+2\n+4\n*5\n*3==7')).to.deep.equal "[binary! == [binary! + [binary! + 1 2] [binary! * [binary! * 4 5] 3]] 7]"

    it "parse 1/\n2", ->
      expect( str parse('1/\n2')).to.equal '[binary! / 1 2]'

    it "parse 1+2\n+4/\n*5\n*3==7", ->
      expect(str parse('1+2\n+4/\n*5\n*3==7')).to.equal '[binary! + [binary! + 1 2] 4]'

  describe "indent expression: ", ->
    it "parse 1\n *3", ->
      expect(str parse('1\n *3')).to.deep.equal "[binary! * 1 3]"

    it "parse (1\n *3\n)", ->
      expect(str parse('(1\n *3\n)')).to.deep.equal "[() [binary! * 1 3]]"

    it "parse 1\n *3\n/ 5", ->
      expect(str parse('1\n *3\n/ 5')).to.deep.equal "[binary! / [binary! * 1 3] 5]"

    it "parse 1+2\n* 3+6", ->
      expect(str parse('1+2\n* 3+6')).to.deep.equal "[binary! + [binary! + 1 [binary! * 2 3]] 6]"

    it "parse 1+2\n * 3", ->
      expect(str parse('1+2\n * 3')).to.deep.equal "[binary! + 1 [binary! * 2 3]]"

    it "parse 1+2\n * 3+6", ->
      expect(str parse('1+2\n * 3+6')).to.deep.equal "[binary! + [binary! + 1 [binary! * 2 3]] 6]"

    it "parse 1+2\n * 3+6\n + 5+8", ->
      expect(str parse('1+2\n * 3+6\n + 5+8')).to.deep.equal "[binary! + [binary! + [binary! + [binary! + 1 [binary! * 2 3]] 6] 5] 8]"

  describe "attribute!, index!: ", ->
    it "parse a.b", ->
      expect(str parse('a.b')).to.deep.equal '[binary! . a b]'
    it "parse %a.b", ->
      expect(str parse('%a.b')).to.deep.equal "[binary! . [prefix! % a] b]"
    it "parse %a()", ->
      expect(str parse('%a()')).to.deep.equal "[binary! concat() [prefix! % a] [()]]"
    it "parse a.b.c", ->
      expect(str parse('a.b.c')).to.deep.equal "[binary! . [binary! . a b] c]"
    it "parse a.b()", ->
      expect(str parse('a.b()')).to.deep.equal "[binary! concat() [binary! . a b] [()]]"
    it "parse @b.c", ->
      expect(str parse('@b.c')).to.deep.equal "[binary! . [prefix! @ b] c]"
    it "parse @b()", ->
      expect(str parse('@b()')).to.deep.equal "[binary! concat() [prefix! @ b] [()]]"
    it "parse a . b", ->
      expect(str parse('a . b')).to.deep.equal "[binary! . a b]"

    it "parse a[1]", ->
      expect(str parse('a[1]')).to.deep.equal "[binary! concat[] a [[] [1]]]"
    it "parse a (1)", ->
      expect(str parse('a (1)')).to.equal 'a'
    it "parse a [1]", ->
      expect(str parse('a [1]')).to.equal 'a'
    it "parse a[1][2]", ->
      expect(str parse('a[1][2]')).to.deep.equal "[binary! concat[] [binary! concat[] a [[] [1]]] [[] [2]]]"

    # &/ as index operator is deprecated, because a[b] is more generally.
    nit "parse a&/b", ->
      expect(str parse('a&/b')).to.deep.equal '[index! a b]'
    nit "parse a&/(1,2)", ->
      expect(str parse('a&/(1,2)')).to.deep.equal '[index! a [, 1 2]]'
    nit "parse '1'&/1", ->
      expect(str parse("'1'&/1")).to.deep.equal "[index! \"1\" 1]"
    nit "parse '1'&/(1,2)", ->
      expect(str parse("'1'&/(1,2)")).to.deep.equal "[index! \"1\" [, 1 2]]"

  describe "call: ", ->
    it "parse a(1)", ->
      expect(str parse('a(1)')).to.deep.equal "[binary! concat() a [() 1]]"
    it "parse a(1)(2)", ->
      expect(str parse('a(1)(2)')).to.deep.equal "[binary! concat() [binary! concat() a [() 1]] [() 2]]"
    it "parse a(1 , 2)", ->
      expect(str parse('a(1 , 2)')).to.deep.equal "[binary! concat() a [() [binary! , 1 2]]]"
    it "parse a(1 , 2 , 3)", ->
      expect(str parse('a(1 , 2 , 3)')).to.deep.equal "[binary! concat() a [() [binary! , [binary! , 1 2] 3]]]"

  describe "ellipsis: ", ->
    it "parse 1...5", ->
      expect(str parse('1...5')).to.deep.equal "[binary! ... 1 5]"

  describe "unquote: ", ->
    it "parse ^a", ->
      expect(str parse('^a')).to.deep.equal '[prefix! ^ a]'
    it "parse ^&a", ->
      expect(str parse('^&a')).to.deep.equal "[prefix! ^& a]"
    it "parse ^& a", ->
      expect(str parse('^& a')).to.deep.equal "[prefix! ^& a]"

  describe "comma expression: ", ->
    it "parse 1 , 2", ->
      expect(str parse('1 , 2')).to.deep.equal '[binary! , 1 2]'
    it "parse (1 , 2)", ->
      expect(str parse('(1 , 2)')).to.deep.equal "[() [binary! , 1 2]]"
    it "parse 1 , 2 , 3", ->
      expect(str parse('1 , 2 , 3')).to.deep.equal "[binary! , [binary! , 1 2] 3]"
    it "parse (1 , 2 , 3)", ->
      expect(str parse('(1 , 2 , 3)')).to.deep.equal "[() [binary! , [binary! , 1 2] 3]]"

  describe "assign and right assocciation: ", ->
    it "parse a=1", ->
      expect(str parse('a=1')).to.deep.equal '[binary! = a 1]'

    it "parse a = 1", ->
      expect(str parse('a = 1')).to.deep.equal '[binary! = a 1]'

    it "parse a = b = 1", ->
      expect(str parse('a = b = 1')).to.deep.equal '[binary! = a [binary! = b 1]]'

    it "parse a += b = 1", ->
      expect(str parse('a += b = 1')).to.deep.equal '[binary! += a [binary! = b 1]]'

  # ? should be identifier character, : should lead clauses.
  # {if! x y z} can be expression, so {x? y: z} is deprecated.
  ndescribe "ternary, i.e. condition expression: ", ->
    it "parse 1 ?  2 :  3", ->
      expect(str parse('1 ?  2 :  3')).to.deep.equal '[?: 1 2 3]'

    it "parse 1 ?  (a = 3) :  (b = 4)", ->
      expect(str parse('1 ?  (a = 3) :  (b = 4)')).to.deep.equal '[?: 1 [= a 3] [= b 4]]'

    it "parse a = 1 ?  2 :  3", ->
      expect(str parse('a = 1 ?  2 :  3')).to.deep.equal '[= a [?: 1 2 3]]'
