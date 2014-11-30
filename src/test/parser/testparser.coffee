{expect, ndescribe, idescribe, iit, nit, matchRule} = require '../util'

lib = '../../lib/'
{constant, isArray, str} = require lib+'utils'
{Parser} = require lib+'parser'

ndescribe "parse: ",  ->
  describe "clause: ",  ->
    parse = (text) ->
      parser = new Parser()
      x = parser.parse(text, matchRule(parser, parser.clause), 0)
      str x

    describe "normal clause: ",  ->
      it 'should parse 3+#(1+1)', ->
        expect(parse('3+#(1+1)')).to.equal "[binary! + 3 [prefix! # [() [binary! + 1 1]]]]"
      it 'should parse 1', ->
        expect(parse('1 ')).to.equal "1"
      it 'should parse y+!1', ->
        expect(parse('y+!1')).to.equal "[binary! + y [prefix! ! 1]]"
      it 'should parse a!=1', ->
        expect(parse('a!=1')).to.equal "[binary! != a 1]"
      it 'should parse a!=1', ->
        expect(parse('a!=1')).to.equal "[binary! != a 1]"
      it 'should parse 1,2', ->
        expect(parse('1,2')).to.equal '1'
      it 'should parse 1 , 2', ->
        expect(parse('1 , 2')).to.equal "1"
      it 'should parse 1 2', ->
        expect(parse('1 2 ')).to.equal '[1 2]'
      it 'should parse print +1', ->
        expect(parse('print +1')).to.equal "[print [prefix! + 1]]"
      it 'should parse print : 1 , 2', ->
        expect(parse('print : 1 , 2')).to.equal "[print 1 2]"
      it 'should parse print : and 1 2', ->
        x = parse('print : and 1 2')
        expect(x).to.equal "[print [and 1 2]]"
      it 'should parse print: and 1 2 , 3', ->
        x = parse('print: and 1 2 , 3')
        expect(x).to.equal "[print [and 1 2] 3]"
      it 'should parse print : add 1 2 , add 3 4', ->
        expect(parse('print : add 1 2 , add 3 4')).to.equal "[print [add 1 2] [add 3 4]]"
      it 'should parse select fn : 1 2 4', ->
        # this is correct parsing result, similar to select fn: pring 2 4
        expect(parse('select fn : 1 2 4')).to.equal "[[select fn] [1 2 4]]"
      it 'should parse select fn : 1, 2, 4', ->
        # this is correct parsing result, similar to select fn: pring 2 4
        expect(parse('select fn : 1, 2, 4')).to.equal "[[select fn] 1 2 4]"
      it 'should parse {select fn} 1 2 4', ->
        # this is correct parsing result, similar to select fn: pring 2 4
        expect(parse('{select fn} 1 2 4')).to.equal "[[{} [select fn]] 1 2 4]"
      it 'should parse {select fn} 1, 2, 4', ->
        # this is correct parsing result, similar to select fn: pring 2 4
        expect(parse('{select fn} 1, 2, 4')).to.equal "[[{} [select fn]] 1]"
      it 'should parse print: add: add 1 2 , add 3 4', ->
        expect(parse('print: add: add 1 2 , add 3 4')).to.equal "[print [add [add 1 2] [add 3 4]]]"
      it 'should parse [2]', ->
        expect(parse("[2]")).to.equal "[[] [2]]"
      it 'should parse [[2]]', ->
        expect(parse("[[2]]")).to.equal "[[] [[[] [2]]]]"
      it 'should parse [[[2] 3]]', ->
        expect(parse("[ [[2] 3] ]")).to.equal "[[] [[[] [[[[] [2]] 3]]]]]"

    describe "normal clause 2: ",  ->
      it 'should parse a = 1', ->
        expect(parse('a = 1')).to.equal "[= a 1]"
      it 'should parse require.extensions[".tj"] = 1', ->
        expect(parse('require.extensions[".tj"] = 1')).to.equal "[= [binary! concat[] [binary! . require extensions] [[] [\".tj\"]]] 1]"
      it 'should parse a = ->', ->
        expect(parse('a = ->')).to.equal "[= a [-> [] undefined]]"
      it 'should parse require.extensions[".tj"] = ->', ->
        expect(parse('require.extensions[".tj"] = ->')).to.equal "[= [binary! concat[] [binary! . require extensions] [[] [\".tj\"]]] [-> [] undefined]]"
      it 'should parse require.extensions[".tj"] = (module, filename) ->', ->
        expect(parse('require.extensions[".tj"] = (module, filename)  ->')).to.equal "[= [binary! concat[] [binary! . require extensions] [[] [\".tj\"]]] [-> [() [binary! , module filename]] undefined]]"
      it 'should parse x = ->', ->
        expect(parse('x = ->')).to.equal "[= x [-> [] undefined]]"
      nit 'should parse \\"x..." a', ->
        expect(parse('\\"x..." a')).to.equal 'undefined'
      nit '''should parse \\'x...' a''', ->
        expect(parse("\\'x...' a")).to.equal '["x..." a]'

    describe "clauses which contain in curve or bracket: ",  ->
      it 'should parse [1]', ->
        expect(parse('[1] ')).to.equal "[[] [1]]"
      it 'should parse {1}', ->
        expect(parse('{1} ')).to.equal "[{} 1]"
      it 'should parse {1, 2}', ->
        expect(parse('{1, 2} ')).to.equal "[{} [begin! 1 2]]"
      it 'should parse [1, 2]', ->
        expect(parse('[1, 2] ')).to.equal "[[] [1 2]]"
      it 'should parse {print 1}', ->
        expect(parse('{print 1} ')).to.equal "[{} [print 1]]"
      it 'should parse print {abs 1}', ->
        expect(parse('print {abs 1} ')).to.equal "[print [{} [abs 1]]]"
      it 'should parse print {abs \n 1}', ->
        expect(parse('print {abs \n 1} ')).to.equal "[print [{} [abs 1]]]"

    describe "function:",  ->
      it 'should parse ->', ->
        x = parse('->')
        expect(x).to.equal '[-> [] undefined]'
      it 'should parse -> 1', ->
        x = parse('-> 1')
        expect(x).to.equal "[-> [] 1]"
      it 'should parse () -> 1', ->
        x = parse('() -> 1')
        expect(x).to.equal "[-> [()] 1]"
      it 'should parse (a) -> 1', ->
        x = parse('(a) -> 1')
        expect(x).to.equal "[-> [() a] 1]"
      it 'should parse (a, b) -> 1', ->
        x = parse('(a , b) -> 1')
        expect(x).to.equal "[-> [() [binary! , a b]] 1]"
      it 'should parse (a , b , c) -> 1', ->
        x = parse('(a , b , c) -> 1')
        expect(x).to.equal "[-> [() [binary! , [binary! , a b] c]] 1]"
      it 'should parse (a , b , c) -> -> 1', ->
        x = parse('(a , b , c) -> -> 1')
        expect(x).to.equal "[-> [() [binary! , [binary! , a b] c]] [-> [] 1]]"
      it 'should parse (a , b , 1) -> 1', ->
        expect(parse('(a , b , 1) -> 1')).to.equal "[-> [() [binary! , [binary! , a b] 1]] 1]"
      it 'should parse (a , b + 1) -> 1', ->
        expect(parse('(a , b + 1) -> 1')).to.equal "[-> [() [binary! , a [binary! + b 1]]] 1]"
      it 'should parse -> and 1 2 ; and 3 4', ->
        x = parse('-> and 1 2 ; and 3 4')
        expect(x).to.equal "[-> [] [begin! [and 1 2] [and 3 4]]]"
      it 'should parse -> and 1 2 , and 3 4', ->
        x = parse('-> and 1 2 , and 3 4')
        expect(x).to.equal "[-> [] [begin! [and 1 2] [and 3 4]]]"
      it 'should parse print -> 2', ->
        x = parse('print -> 2')
        expect(x).to.equal "[print [-> [] 2]]"
      it 'should parse -> 1 -> 2', ->
        expect(parse('-> 1 -> 2')).to.equal "[-> [] [1 [-> [] 2]]]"
      it 'should parse -> and 1 2 , and 3 4 -> print x ; print 5 6', ->
        x = parse('-> and 1 2 , and 3 4 -> print x ; print 5 6')
        expect(x).to.equal "[-> [] [begin! [and 1 2] [and 3 4 [-> [] [begin! [print x] [print 5 6]]]]]]"

    describe 'meta: ', ->
      it 'should parse # if 1 then 1+2 else 3+4', ->
        expect(parse('# if 1 then 1+2 else 3+4')).to.equal "[# [if 1 [binary! + 1 2] [binary! + 3 4]]]"

      it 'should compile ## if 1 then 1+2 else 3+4', ->
        expect(parse('## if 1 then 1+2 else 3+4')).to.equal "[## [if 1 [binary! + 1 2] [binary! + 3 4]]]"

      it 'should parse # #(1+2)', ->
        expect(parse('# #(1+2)')).to.equal "[# [prefix! # [() [binary! + 1 2]]]]"

      it 'should parse # #(1+2)', ->
        expect(parse('# #(1+2)')).to.equal "[# [prefix! # [() [binary! + 1 2]]]]"

      it 'should parse # (#(1+2) + #(3+4))', ->
        expect(parse('# (#(1+2) + #(3+4))')).to.equal "[# [() [binary! + [prefix! # [() [binary! + 1 2]]] [prefix! # [() [binary! + 3 4]]]]]]"

      it 'should parse # ( #(1+2) + #(3+4))', ->
        expect(parse('# ( #(1+2) + #(3+4))')).to.equal "[# [() [binary! + [prefix! # [() [binary! + 1 2]]] [prefix! # [() [binary! + 3 4]]]]]]"

    describe 'for', ->
      it 'should parse for i in x then print i', ->
        x = parse('for i in x then print i')
        expect(x).to.equal "[forIn! i undefined x [print i]]"

      it 'should parse for i v in x then print i, print v', ->
        x = parse('for i v in x then print i, print v')
        expect(x).to.equal "[forIn! i v x [begin! [print i] [print v]]]"

      it 'should parse for i, v of x then print i, print v', ->
        x = parse('for i, v of x then print i, print v')
        expect(x).to.equal "[forOf! i v x [begin! [print i] [print v]]]"

    describe 'assign', ->
      it 'should parse a = 1', ->
        x = parse('a = 1')
        expect(x).to.equal '[= a 1]'

      it 'should parse \\if = 1', ->
        x = parse('\\if = 1')
        expect(x).to.equal "[= \\if 1]"

      it 'should parse a = b = 1', ->
        x = parse('a = b = 1')
        expect(x).to.equal '[= a [= b 1]]'

      it 'should parse a = \n b = 1', ->
        x = parse('a = \n b = 1')
        expect(x).to.equal "[= a [= b 1]]"

      it 'should parse a = \n b = \n  1', ->
        x = parse('a = \n b = \n  1')
        expect(x).to.equal "[= a [= b 1]]"

      it 'should parse :: = 1', ->
        x = parse(':: = 1')
        expect(x).to.equal "[= :: 1]"

      it 'should parse {a b c} = x', ->
        x = parse('{a b c} = x')
        expect(x).to.equal "[= [{} [a b c]] x]"

      it 'should parse {a} = x', ->
        x = parse('{a} = x')
        expect(x).to.equal "[= [{} a] x]"

    describe 'unquote!', ->
      it 'should parse ^ a', ->
        x = parse('^ a')
        expect(x).to.equal "[^ a]"

      it 'should parse ^& a', ->
        x = parse('^& a')
        expect(x).to.equal "[^& a]"

      it 'should parse ^&a', ->
        x = parse('^&a')
        expect(x).to.equal "[prefix! ^& a]"

    describe 'expression clause:', ->
      it 'should parse 1+2', ->
        x = parse('1+2')
        expect(x).to.equal "[binary! + 1 2]"

      it 'should parse print 1+2', ->
        x = parse('print 1+2')
        expect(x).to.equal "[print [binary! + 1 2]]"

      it 'should parse print (1+2)', ->
        x = parse('print (1+2)')
        expect(x).to.equal "[print [() [binary! + 1 2]]]"

      it 'should parse print (1 + 2)', ->
        x = parse('print (1 + 2)')
        expect(x).to.equal "[print [() [binary! + 1 2]]]"

  describe "sentence: ",  ->
    parse = (text) ->
      parser = new Parser()
      x = parser.parse(text, matchRule(parser, parser.sentence), 0)
      str x
    describe "old test: ",  ->
      it 'should parse print 1 , print 2', ->
        x = parse('print 1 , print 2')
        expect(x).to.equal "[[print 1] [print 2]]"
      it 'should parse if and 1 2 then 3', ->
        x = parse('if and 1 2 then 3')
        expect(x).to.equal "[[if [and 1 2] 3]]"
      it 'should parse if and 1 2 then\n 3', ->
        x = parse('if and 1 2 then\n 3')
        expect(x).to.equal "[[if [and 1 2] 3]]"
      it 'should parse if add : add 1 2 , add 3 4 then 5', ->
        x = parse('if add : add 1 2 , add 3 4 then 5')
        expect(x).to.equal "[[if [add [add 1 2] [add 3 4]] 5]]"
      it 'should parse print : and 1 2 , or : eq 3 4 , eq 5 6', ->
        x = parse('print : and 1 2 , or : eq 3 4 , eq 5 6')
        expect(x).to.equal "[[print [and 1 2] [or [eq 3 4] [eq 5 6]]]]"

    describe "old test 2: ",  ->
      it 'should parse if 2 then 3 else 4', ->
        x = parse('if 2 then 3 else 4')
        expect(x).to.equal "[[if 2 3 4]]"
      it 'should parse print 1 , if 2 then 3 else 4', ->
        x = parse('print 1 , if 2 then 3 else 4')
        expect(x).to.equal "[[print 1] [if 2 3 4]]"
      it 'should parse if 1 then 2 else if 1 then 2 else 3', ->
        x = parse('if 1 then 2 else if 1 then 2 else 3')
        expect(x).to.equal "[[if 1 2 [if 1 2 3]]]"
      it 'should parse if 1 then if 2 then 3 else 4 else 5', ->
        x = parse('if 1 then if 2 then 3 else 4 else 5')
        expect(x).to.equal "[[if 1 [if 2 3 4] 5]]"

    describe "if statement: ",  ->
      describe "group1: ",  ->
        it 'should parse if 1 then 2', ->
          x = parse('if 1 then 2')
          expect(x).to.equal "[[if 1 2]]"
        it 'should parse if 1 else 2', ->
          expect(try -> parse('if 1 else 2')).to.throw  /unexpected conjunction "else"/
        it 'should parse if 1 then 2 else 3', ->
          x = parse('if 1 then 2 else 3')
          expect(x).to.equal "[[if 1 2 3]]"
        it 'should parse if 1 then 2 \nelse 3', ->
          x = parse('if 1 then 2 \nelse 3')
          expect(x).to.equal "[[if 1 2 3]]"
        it 'should parse if 1 then \n  2 \nelse 3', ->
          x = parse('if 1 then \n  2 \nelse 3')
          expect(x).to.equal "[[if 1 2 3]]"
        it 'should parse if 1 \nthen 2 \nelse 3', ->
          x = parse('if 1 \nthen 2 \nelse 3')
          expect(x).to.equal "[[if 1 2 3]]"

      describe "group2: ",  ->
        it 'should parse if 1 then\n  2 \nelse 3', ->
          expect(parse('if 1 then\n  2 \nelse 3')).to.equal "[[if 1 2 3]]"
        it 'should parse if 1 then if 2 then 3', ->
          x = parse('if 1 then if 2 then 3')
          expect(x).to.equal "[[if 1 [if 2 3]]]"
        it 'should parse if 1 then if 2 then 3 else 4', ->
          x = parse('if 1 then if 2 then 3 else 4')
          expect(x).to.equal "[[if 1 [if 2 3 4]]]"
        it 'should parse if 1 then if 2 then 3 \nelse 4', ->
          x = parse('if 1 then if 2 then 3 \nelse 4')
          expect(x).to.equal "[[if 1 [if 2 3] 4]]"
        it 'should parse if 1 then \n if 2 then 3 \nelse 4', ->
          x = parse('if 1 then \n if 2 then 3 \nelse 4')
          expect(x).to.equal "[[if 1 [if 2 3] 4]]"
        it 'should parse if 1 then\n if 2 then 3 \n else 4', ->
          x = parse('if 1 then\n if 2 then 3 \n else 4')
          expect(x).to.equal "[[if 1 [if 2 3 4]]]"

    describe "while statement: ",  ->
      it 'should parse while 1 then 2', ->
        x = parse('while 1 then 2')
        expect(x).to.equal "[[while 1 2]]"
      it 'should parse while 1 else 2', ->
        expect(try -> parse('while 1 else 2')).to.throw /unexpected conjunction "else"/
      it 'should parse while 1 then \n while 2 then 3 \nelse 4', ->
        x = parse('while 1 then \n while 2 then 3 \nelse 4')
        expect(x).to.equal "[[while 1 [while 2 3] 4]]"
      it 'should parse while 1 then\n while 2 then 3 \n else 4', ->
        x = parse('while 1 then\n while 2 then 3 \n else 4')
        expect(x).to.equal "[[while 1 [while 2 3 4]]]"

    describe "try statement: ",  ->
      it 'should parse try 1 catch e then try 2 catch e then 3', ->
        x = parse('try 1 catch e then try 2 catch e then 3')
        expect(x).to.equal "[[try 1 e [try 2 e 3 undefined] undefined]]"
      it 'should parse try \n 1 catch e then\n 2', ->
        expect(-> parse('try \n 1 catch e then\n 2')).to.throw /unexpected conjunction "catch" following a indent block/
      it 'should parse try \n 1 \ncatch e then\n 2', ->
        expect(-> parse('try \n 1 catch e then\n 2')).to.throw /unexpected conjunction "catch" following a indent block/

    describe "try if statement: ",  ->
      it 'should parse try if 1 then 2 catch e then 3', ->
        x = parse('try if 1 then 2 catch e then 3')
        expect(x).to.equal "[[try [if 1 2] e 3 undefined]]"

    describe "indent block: ",  ->
      it 'should parse print \n 1', ->
        expect(parse('print \n 1')).to.equal '[[print 1]]'
      it 'should parse print \n 2 \n 3', ->
        expect(parse('print \n 2 \n 3')).to.equal '[[print 2 3]]'
      it 'should parse print \n abs \n   3', ->
        expect(parse('print \n abs \n   3')).to.equal '[[print [abs 3]]]'
      it 'should parse print \n abs 3 \n abs 4', ->
        expect(parse('print \n abs 3 \n abs 4')).to.equal '[[print [abs 3] [abs 4]]]'
      it 'should parse print : 2', ->
        expect(parse("print : 2")).to.equal '[[print 2]]'

  describe "line: ",  ->
    parse = (text) ->
      parser = new Parser()
      x = parser.parse(text, matchRule(parser, parser.line), 0)
      str x
    it 'should parse print 1 ; print 2', ->
      x = parse('print 1 ; print 2')
      expect(x).to.equal '[[print 1] [print 2]]'

    it '''should parse '#a=1;a''', ->
      expect(parse('#a=1;a')).to.equal "[[binary! = [prefix! # a] 1] a]"

    it '''should parse '##a=1;a''', ->
      expect(parse('##a=1;a')).to.equal "[[prefix! ## [binary! = a 1]] a]"

  describe "module: ",  ->
    parse = (text) ->
      parser = new Parser()
      x = parser.parse(text, parser.module, 0)
      str x
    describe "misc: ",  ->
      it 'should parse 1', ->
        expect(parse('1 ')).to.equal "1"
      it 'should parse 1.', ->
        expect(parse('1.')).to.equal "[1 .]"
      it 'should parse \n1', ->
        expect(parse('\n1 ')).to.equal "1"
      it 'should parse "1"', ->
        expect(parse('"1"')).to.equal "\"1\""
      it 'should parse a', ->
        expect(parse('a')).to.equal "a"
      it 'should parse  print 2', ->
        expect(parse('print 2 ')).to.equal "[print 2]"
      it '''should parse '##a=1; # ` ^ a''', ->
        expect(parse('##a=1; # ` ^ a')).to.equal "[begin! [prefix! ## [binary! = a 1]] [# [` [^ a]]]]"
      it '''should parse 'a#=1; # ` ^ a''', ->
        expect(parse('a#=1; # ` ^ a')).to.equal "[begin! [binary! #= a 1] [# [` [^ a]]]]"
    describe "misc2: ",  ->
      it 'should print \n 2 ', ->
        expect(parse('print \n 2 ')).to.equal "[print 2]"
      it 'should  print \n 2 \n 3', ->
        expect(parse('print \n 2 \n 3')).to.equal "[print 2 3]"
      it 'should parse  print \n 2  3', ->
        expect(parse('print \n 2  3')).to.equal "[print [2 3]]"
      it 'should parse print \n add 1 2; add 3 4', ->
        expect(parse('print \n add 1 2; add 3 4')).to.equal "[print [add 1 2] [add 3 4]]"
      it 'should parse ` [ ^1 ^2 ^&[3 4]]', ->
        expect(parse('`[ ^1 ^2 ^&[3 4]]')).to.equal "[prefix! ` [[] [[[prefix! ^ 1] [prefix! ^ 2] [prefix! ^& [[] [[3 4]]]]]]]]"
      it 'should parse ` [ ^1 ]', ->
        expect(parse('` [ ^1 ]')).to.equal "[` [[] [[prefix! ^ 1]]]]"
      it 'should parse `[ ^1 ]', ->
        expect(parse('`[ ^1 ]')).to.equal "[prefix! ` [[] [[prefix! ^ 1]]]]"
      it 'should parse `[ ^1 ^2 ]', ->
        expect(parse('`[ ^1 ^2]')).to.equal "[prefix! ` [[] [[[prefix! ^ 1] [prefix! ^ 2]]]]]"
      it 'should parse `{ ^1, ^2 }', ->
        expect(parse('`{ ^1, ^2 }')).to.equal "[prefix! ` [{} [begin! [prefix! ^ 1] [prefix! ^ 2]]]]"

    describe "misc3: ",  ->
      it 'should parse # if 0 then 1+2 else 3+4', ->
        expect(parse('# if 0 then 1+2 else 3+4')).to.equal "[# [if 0 [binary! + 1 2] [binary! + 3 4]]]"

      it '''should parse [1] ''', ->
        expect(parse('''[1]''')).to.equal "[[] [1]]"

      it '''should parse [1, 2] ''', ->
        expect(parse('''[1, 2]''')).to.equal "[[] [1 2]]"

      it '''should parse [ 1, 2 ] ''', ->
        expect(parse('''[ 1, 2 ]''')).to.equal "[[] [1 2]]"

      it '''should parse [\ 1, 2 \] ''', ->
        expect(parse('''[\ 1, 2 \]''')).to.equal "[[] [1 2]]"

      it '''should parse for x in [\ 1, 2 \] then print x''', ->
        expect(parse('''for x in [\ 1, 2 \] then print x''')).to.equal "[forIn! x undefined [[] [1 2]] [print x]]"

      it '''should parse for x in [1, 2 ] then print x''', ->
        expect(parse('''for x in [ 1, 2 ] then print x''')).to.equal "[forIn! x undefined [[] [1 2]] [print x]]"

      it '''should parse for x in [1 2 ] then print x''', ->
        expect(parse('''for x in [ 1 2 ] then print x''')).to.equal "[forIn! x undefined [[] [[1 2]]] [print x]]"

      it '''should parse for x in [ 1 ] then print x''', ->
        expect(parse('''for x in [ 1 ] then print x''')).to.equal "[forIn! x undefined [[] [1]] [print x]]"

      it '''should parse for x in [] then print x''', ->
        expect(parse('''for x in [] then print x''')).to.equal "[forIn! x undefined [[]] [print x]]"

      it 'should parse {(a,b) -> `( ^a + ^b )}(1,2)', ->
        expect(parse('{(a,b) -> `( ^a + ^b )}(1,2)')).to.equal "[binary! concat() [{} [-> [() [binary! , a b]] [prefix! ` [() [binary! + [prefix! ^ a] [prefix! ^ b]]]]]] [() [binary! , 1 2]]]"
      it 'should parse { -> ( a )}()', ->
        expect(parse('{ -> ( a )}()')).to.equal "[binary! concat() [{} [-> [] [() a]]] [()]]"
      it 'should parse m #= (a,b) -> `( ^a + ^b); m(1,2)', ->
        expect(parse('m #= (a,b) -> `( ^a + ^b ); m(1,2)')).to.equal "[#= m [-> [() [binary! , a b]] [begin! [prefix! ` [() [binary! + [prefix! ^ a] [prefix! ^ b]]]] [binary! concat() m [() [binary! , 1 2]]]]]]"

      it '''should parse (1) ''', ->
        expect(parse('''(1)''')).to.equal "[() 1]"

    describe "prefix: ",  ->
      it 'should parse +1', ->
        expect(parse('+1 ')).to.equal "[prefix! + 1]"

    describe "line and indent operator: ",  ->
      it "parse (1+2\n * 3+6)", ->
        expect(parse('(1+2\n * 3+6)')).to.equal "[() [binary! + [binary! + 1 [binary! * 2 3]] 6]]"

      it "parse 1+2\n * 3+6\n + 5+8", ->
        expect(parse('(1+2\n * 3+6\n + 5+8)')).to.equal "[() [binary! + [binary! + [binary! + [binary! + 1 [binary! * 2 3]] 6] 5] 8]]"

      it 'should parse ()', ->
        expect(parse('()').value).to.equal undefined

      it 'should parse ` { ^1 { ^2 ^&{3 4}}}', ->
        expect(parse('`{ ^1 { ^2 ^&{3 4}}}')).to.equal "[prefix! ` [{} [[prefix! ^ 1] [{} [[prefix! ^ 2] [prefix! ^& [{} [3 4]]]]]]]]"

      it 'should parse `{ ^1 { ^2 ^&{3 4}}}', ->
        expect(parse('`{ ^1 { ^2 ^&{3 4}}}')).to.equal "[prefix! ` [{} [[prefix! ^ 1] [{} [[prefix! ^ 2] [prefix! ^& [{} [3 4]]]]]]]]"

    describe "new parser tests from samples: ",  ->
      it "parse if 1 then 2\nprint 3", ->
        expect(parse('if 1 then 2\nprint 3')).to.equal "[begin! [if 1 2] [print 3]]"
      it "parse if 1 then 2 else 3\nprint 4", ->
        expect(parse('if 1 then 2 else 3\nprint 4')).to.equal "[begin! [if 1 2 3] [print 4]]"

      it 'should parse console.log : and 1 2', ->
        x = parse('console.log : and 1 2')
        expect(x).to.deep.equal "[[binary! . console log] [and 1 2]]"


    describe "new parser tests from samples 2: ",  ->
      it 'should parse x = /!-h\b|-r\b|-v\b|-b\b/', ->
        x = parse('x = /!-h\b|-r\b|-v\b|-b\b/')
        expect(x).to.deep.equal "[= x [regexp! /-h\b|-r\b|-v\b|-b\b/]]"

      it 'should parse a = 2\nx = : 1', ->
        expect(-> parse('a = 2\nx = : 1')).to.throw /unexpected ":"/

      it 'should parse a = 2\nx = 1', ->
        expect(parse('a = 2\nx = 1')).to.equal "[begin! [= a 2] [= x 1]]"

      it 'should parse error: 1', ->
        x = parse('error: 1 ')
        expect(x).to.deep.equal "[error 1]"

      it 'should parse error: new: Error "Error: No Input file given" ', ->
        x = parse('error: new: Error "Error: No Input file given" ')
        expect(x).to.deep.equal "[error [new [Error \"Error: No Input file given\"]]]"

      it 'should parse new : Error', ->
        x = parse('new : Error')
        expect(x).to.deep.equal "[new Error]"

      it 'should parse new: Error "Error: No Input file given" ', ->
        x = parse('new : Error "Error: No Input file given"')
        expect(x).to.deep.equal "[new [Error \"Error: No Input file given\"]]"

    describe "assign to outer scope var: ",  ->
      it "should parse @@a", ->
        expect(parse('@@a')).to.equal "[prefix! @@ a]"
      it "should parse @@a+1", ->
        expect(parse('@@a+1')).to.equal "[binary! + [prefix! @@ a] 1]"
      it "should parse a=1; -> @@a=1", ->
        expect(parse('a=1; -> @@a=1')).to.equal "[begin! [binary! = a 1] [-> [] [binary! = [prefix! @@ a] 1]]]"

    it 'should parse [1 2]', ->
      expect(parse("[1 2]")).to.equal "[[] [[1 2]]]"

    it 'should parse [1, 2]', ->
      expect(parse("[1, 2]")).to.equal "[[] [1 2]]"