chai = require("chai")
expect = chai.expect
iit = it.only
idescribe = describe.only

lib = '../../lib/'
{Parser} = require lib+'parser'
{constant, isArray, str} = require lib+'parser/base'

describe "parse: ",  ->
  describe "clause: ",  ->
    parse = (text) ->
      parser = new Parser()
      x = parser.parse(text, parser.clause, 0)

    describe "normal clause: ",  ->
      it 'should parse 3+.#(1+1)', ->
        expect(str parse('3+.#(1+1)')).to.equal "[+ 3 [# [+ 1 1]]]"
      it 'should parse 1', ->
        expect(str parse('1 ')).to.equal "1"
      it 'should parse y+.!1', ->
        expect(str parse('y+.!1')).to.equal "[+ y [!x 1]]"
      it 'should parse a.!=1', ->
        expect(str parse('a.!=1')).to.equal "[!= a 1]"
      it 'should parse 1,2', ->
        expect(str parse('1,2')).to.equal '1'
      it 'should parse 1 , 2', ->
        expect(str parse('1 , 2')).to.equal '1'
      it 'should parse 1 2', ->
        expect(str parse('1 2 ')).to.equal '[1 2]'
      it 'should parse print : 1 , 2', ->
        expect(str parse('print : 1 , 2')).to.equal '[print 1 2]'
      it 'should parse print : and 1 2', ->
        x = parse('print : and 1 2')
        expect(str x).to.equal '[print [and 1 2]]'
      it 'should parse print: and 1 2 , 3', ->
        x = parse('print: and 1 2 , 3')
        expect(str x).to.equal '[print [and 1 2] 3]'
      it 'should parse print : add 1 2 , add 3 4', ->
        expect(str parse('print : add 1 2 , add 3 4')).to.equal '[print [add 1 2] [add 3 4]]'
      it 'should parse print 1 2 : add 3 4', ->
        expect(str parse('print 1 2 : add 3 4')).to.equal '[print 1 2 [add 3 4]]'
      it 'should parse print 1 2 : add 3 4', ->
        expect(str parse('print: add: add 1 2 , add 3 4')).to.equal '[print [add [add 1 2] [add 3 4]]]'
      it 'should parse [2]', ->
        expect(str parse("[2]")).to.equal "[list! 2]"
      it 'should parse [[2]]', ->
        expect(str parse("[[2]]")).to.equal "[list! [list! 2]]"
      it 'should parse [[[2] 3]]', ->
        expect(str parse("[ [[2] 3] ]")).to.equal "[list! [list! [[list! 2] 3]]]"
      it 'should parse require.extensions[".tj"] = 1', ->
        expect(str parse('require.extensions[".tj"] = 1')).to.equal "[= [index! [attribute! require extensions] [string! \".tj\"]] 1]"
      it 'should parse require.extensions[".tj"] = ->', ->
        expect(str parse('require.extensions[".tj"] = ->')).to.equal "[= [index! [attribute! require extensions] [string! \".tj\"]] [-> [] []]]"
      it 'should parse require.extensions[".tj"] = (module, filename) ->', ->
        expect(str parse('require.extensions[".tj"] = (module, filename)  ->')).to.equal "[= [index! [attribute! require extensions] [string! \".tj\"]] [-> [module filename] []]]"
      it 'should parse x = ->', ->
        expect(str parse('x = ->')).to.equal "[= x [-> [] []]]"

    describe "concatenated line clauses: ",  ->
      it 'should parse print 1 \\\n 2 3', ->
        expect(str parse('print 1 \\\n 2 3')).to.equal "[print 1 2 3]"
      it 'should parse print 1 \n 2 3', ->
        expect(str parse('print 1 \n 2 3')).to.equal "[print 1 [2 3]]"
      it 'should parse print 1 \\\n {print 2 \\\n 3 4} 5', ->
        expect(str parse('print 1 \\\n {print 2 \\\n 3 4} 5')).to.equal "[print 1 [print 2 3 4] 5]"

    describe "clauses which contain in curve or bracket: ",  ->
      it 'should parse [1]', ->
        expect(str parse('[1] ')).to.equal "[list! 1]"
      it 'should parse {1}', ->
        expect(str parse('{1} ')).to.equal "1"
      it 'should parse {1, 2}', ->
        expect(str parse('{1, 2} ')).to.equal '[begin! 1 2]'
      it 'should parse [1, 2]', ->
        expect(str parse('[1, 2] ')).to.equal '[list! 1 2]'
      it 'should parse {print 1}', ->
        expect(str parse('{print 1} ')).to.equal "[print 1]"
      it 'should parse print {abs 1}', ->
        expect(str parse('print {abs 1} ')).to.equal "[print [abs 1]]"
      it 'should parse print {abs \n 1}', ->
        expect(str parse('print {abs \n 1} ')).to.equal "[print [abs 1]]"

    describe "function:",  ->
      it 'should parse ->', ->
        x = parse('->')
        expect(str x).to.equal '[-> [] []]'
      it 'should parse () -> 1', ->
        x = parse('() -> 1')
        expect(str x).to.equal '[-> [] [1]]'
      it 'should parse (a) -> 1', ->
        x = parse('(a) -> 1')
        expect(str x).to.equal '[-> [a] [1]]'
      it 'should parse (a, b) -> 1', ->
        x = parse('(a , b) -> 1')
        expect(str x).to.equal '[-> [a b] [1]]'
      it 'should parse (a , b , c) -> 1', ->
        x = parse('(a , b , c) -> 1')
        expect(str x).to.equal '[-> [a b c] [1]]'
      it 'should parse (a , b , c) -> -> 1', ->
        x = parse('(a , b , c) -> -> 1')
        expect(str x).to.equal '[-> [a b c] [[-> [] [1]]]]'
      it 'should parse (a , b , 1) -> 1', ->
        expect(-> parse('(a , b , 1) -> 1')).to.throw  /illegal parameters list for function definition/
      it 'should parse (a , b + 1) -> 1', ->
        expect(-> parse('(a , b + 1) -> 1')).to.throw  /illegal parameters list for function definition/
      it 'should parse -> and 1 2 ; and 3 4', ->
        x = parse('-> and 1 2 ; and 3 4')
        expect(str x).to.equal "[-> [] [[and 1 2] [and 3 4]]]"
      it 'should parse -> and 1 2 , and 3 4', ->
        x = parse('-> and 1 2 , and 3 4')
        expect(str x).to.equal "[-> [] [[and 1 2] [and 3 4]]]"
      it 'should parse -> and 1 2 , and 3 4 -> print x ; print 5 6', ->
        x = parse('-> and 1 2 , and 3 4 -> print x ; print 5 6')
        expect(str x).to.equal "[-> [] [[and 1 2] [and 3 4 [-> [] [[print x] [print 5 6]]]]]]"

    describe 'meta: ', ->
      it 'should parse # if 1 then 1+2 else 3+4', ->
        expect(str parse('# if 1 then 1+2 else 3+4')).to.equal "[# [if 1 [+ 1 2] [+ 3 4]]]"
      it 'should compile ## if 1 then 1+2 else 3+4', ->
        expect(str parse('## if 1 then 1+2 else 3+4')).to.equal "[## [if 1 [+ 1 2] [+ 3 4]]]"

      it 'should parse # #(1+2)', ->
        expect(str parse('# #(1+2)')).to.equal "[# [# [+ 1 2]]]"

      it 'should parse # #(1+2) + #(3+4)', ->
        expect(str parse('# #(1+2) + #(3+4)')).to.equal "[# [+ [# [+ 1 2]] [# [+ 3 4]]]]"

      it 'should parse # (#(1+2) + #(3+4))', ->
        expect(str parse('# (#(1+2) + #(3+4))')).to.equal "[# [+ [# [+ 1 2]] [# [+ 3 4]]]]"

      it 'should parse # ( #(1+2) + #(3+4))', ->
        expect(str parse('# ( #(1+2) + #(3+4))')).to.equal "[# [+ [# [+ 1 2]] [# [+ 3 4]]]]"

    describe 'class: ', ->
      it 'should parse class A', ->
        x = parse('class A')
        expect(str x).to.equal "[#call! class [A undefined undefined]]"

      it 'should parse class A :: = ->', ->
        x = parse('class A :: = ->')
        expect(str x).to.equal "[#call! class [A undefined [[= :: [-> [] []]]]]]"

      it 'should parse class B extends A :: = ->', ->
        x = parse('class B extends A :: = ->')
        expect(str x).to.equal "[#call! class [B A [[= :: [-> [] []]]]]]"

      it 'should parse class B extends A', ->
        x = parse('class B extends A')
        expect(str x).to.equal "[#call! class [B A undefined]]"

      it 'should parse class B extends A  :: = ->', ->
        x = parse('class B extends A  :: = ->')
        expect(str x).to.equal "[#call! class [B A [[= :: [-> [] []]]]]]"

    describe 'for', ->
      it 'should parse for (i=0; i<10; i++) then print i', ->
        x = parse('for (i=0; i<10; i++) then print i')
        expect(str x).to.equal "[cFor! [= i 0] [< i 10] [x++ i] [print i]]"

      it 'should parse for i in x then print i', ->
        x = parse('for i in x then print i')
        expect(str x).to.equal "[forIn! i x [print i]]"

      it 'should parse for i v in x then print i, print v', ->
        x = parse('for i v in x then print i, print v')
        expect(str x).to.equal "[forIn!! i v x [begin! [print i] [print v]]]"

      it 'should parse for i, v of x then print i, print v', ->
        x = parse('for i, v of x then print i, print v')
        expect(str x).to.equal "[forOf!! i v x [begin! [print i] [print v]]]"

      it 'should parse label: forx# for i, v in x then print i', ->
        x = parse('forx# for i, v in x then print i, print v')
        expect(str x).to.equal "[label! forx [forIn!! i v x [begin! [print i] [print v]]]]"

    describe 'var', ->
      it 'should parse var a', ->
        x = parse('var a')
        expect(str x).to.equal '[var a]'

      it 'should parse var a = 1', ->
        x = parse('var a = 1')
        expect(str x).to.equal '[var [a = 1]]'

      it 'should parse var a = \n 1', ->
        x = parse('var a = \n 1')
        expect(str x).to.equal '[var [a = 1]]'

      it 'should parse var \n a =  1', ->
        x = parse('var \n a = 1')
        expect(str x).to.equal '[var [a = 1]]'

      it 'should parse var \n a = \n  1\n b', ->
        x = parse('var \n a = \n  1\n b')
        expect(str x).to.equal "[var [a = 1] b]"

      it 'should parse var a,b', ->
        x = parse('var a,b')
        expect(str x).to.equal '[var a b]'

      it 'should parse var 1', ->
        expect(str parse('var 1')).to.equal "[var undefined]"

    describe 'extern!', ->
      it 'should parse extern! a', ->
        x = parse('extern! add a b')
        expect(str x).to.equal '[extern! add a b]'

    describe 'assign', ->
      it 'should parse a = 1', ->
        x = parse('a = 1')
        expect(str x).to.equal '[= a 1]'

      it 'should parse \\if = 1', ->
        x = parse('\\if = 1')
        expect(str x).to.equal '[= if 1]'

      it 'should parse a = b = 1', ->
        x = parse('a = b = 1')
        expect(str x).to.equal '[= a [= b 1]]'

      it 'should parse a = \n b = 1', ->
        x = parse('a = \n b = 1')
        expect(str x).to.equal '[= a [= b 1]]'

      it 'should parse a = \n b = \n  1', ->
        x = parse('a = \n b = \n  1')
        expect(str x).to.equal '[= a [= b 1]]'

      it 'should parse :: = 1', ->
        x = parse(':: = 1')
        expect(str x).to.equal "[= :: 1]"

      it 'should parse {a b c} = x', ->
        x = parse('{a b c} = x')
        expect(str x).to.equal "[hashAssign! [a b c] x]"

      it 'should parse {a b c\\\ne f} = x', ->
        x = parse('{a b c\\\n e f} = x')
        expect(str x).to.equal "[hashAssign! [a b c e f] x]"

      it 'should parse {a} = x', ->
        x = parse('{a} = x')
        expect(str x).to.equal "[hashAssign! [a] x]"



    describe 'unquote!', ->
      it 'should parse ^ a', ->
        x = parse('^ a')
        expect(str x).to.equal '[unquote! a]'

      it 'should parse ^& a', ->
        x = parse('^& a')
        expect(str x).to.equal '[unquote-splice a]'

      it 'should parse ^&a', ->
        x = parse('^&a')
        expect(str x).to.equal '[unquote-splice a]'

    describe 'expression clause', ->
      it 'should parse 1+2', ->
        x = parse('1+2')
        expect(str x).to.equal '[+ 1 2]'

      it 'should parse print 1+2', ->
        x = parse('print 1+2')
        expect(str x).to.equal '[print [+ 1 2]]'

      it 'should parse print (1+2)', ->
        x = parse('print (1+2)')
        expect(str x).to.equal '[print [+ 1 2]]'

      it 'should parse print 1 + 2', ->
        x = parse('print (1 + 2)')
        expect(str x).to.equal '[print [+ 1 2]]'

      it 'should parse print 1 + 2', ->
        x = parse('print 1 + 2')
        expect(str x).to.equal '[print [+ 1 2]]'

      it 'should parse 1 + 2', ->
        x = parse('1 + 2')
        expect(str x).to.equal '[+ 1 2]'

    describe "do statement: ",  ->
      it 'should parse do print 1; print 2; where a = 1', ->
        x = parse('do print 1; print 2; where a = 1')
        expect(str x).to.equal "[let [[a = 1]] [[print 1] [print 2]]]"
      it 'should parse do print 1; print 2; where a = 1, b = 2', ->
        x = parse('do print 1; print 2; where a = 1, b = 2')
        expect(str x).to.equal "[let [[a = 1] [b = 2]] [[print 1] [print 2]]]"
      it 'should parse do print 1; print 2; when a==1', ->
        x = parse('do print 1; print 2; when a==1')
        expect(str x).to.equal "[doWhile! [[print 1] [print 2]] [== a 1]]"
      it 'should parse do print 1; print 2; while a==1', ->
        expect(-> parse('do print 1; print 2; while a==1')).to.throw /expect keyword then/
      it 'should parse do print 1; print 2; until a==1', ->
        x = parse('do print 1; print 2; until a==1')
        expect(str x).to.equal "[doWhile! [[print 1] [print 2]] [!x [== a 1]]]"

  describe "sentence: ",  ->
    parse = (text) ->
      parser = new Parser()
      x = parser.parse(text, parser.sentence, 0)
    describe "old test: ",  ->
      it 'should parse print 1 , print 2', ->
        x = parse('print 1 , print 2')
        expect(str x).to.equal "[[print 1] [print 2]]"
      it 'should parse if and 1 2 then 3', ->
        x = parse('if and 1 2 then 3')
        expect(str x).to.equal "[[if [and 1 2] 3]]"
      it 'should parse if add : add 1 2 , add 3 4 then 5', ->
        x = parse('if add : add 1 2 , add 3 4 then 5')
        expect(str x).to.equal "[[if [add [add 1 2] [add 3 4]] 5]]"
      it 'should parse print : and 1 2 , or : eq 3 4 , eq 5 6', ->
        x = parse('print : and 1 2 , or : eq 3 4 , eq 5 6')
        expect(str x).to.equal '[[print [and 1 2] [or [eq 3 4] [eq 5 6]]]]'

    describe "old test 2: ",  ->
      it 'should parse if 2 then 3 else 4', ->
        x = parse('if 2 then 3 else 4')
        expect(str x).to.equal "[[if 2 3 4]]"
      it 'should parse print 1 , if 2 then 3 else 4', ->
        x = parse('print 1 , if 2 then 3 else 4')
        expect(str x).to.equal "[[print 1] [if 2 3 4]]"
      it 'should parse if 1 then 2 else if 1 then 2 else 3', ->
        x = parse('if 1 then 2 else if 1 then 2 else 3')
        expect(str x).to.equal "[[if 1 2 [if 1 2 3]]]"
      it 'should parse if 1 then if 2 then 3 else 4 else 5', ->
        x = parse('if 1 then if 2 then 3 else 4 else 5')
        expect(str x).to.equal "[[if 1 [if 2 3 4] 5]]"

    describe "if statement: ",  ->
      describe "group1: ",  ->
        it 'should parse if 1 then 2', ->
          x = parse('if 1 then 2')
          expect(str x).to.equal "[[if 1 2]]"
        it 'should parse if 1 else 2', ->
          expect(try -> parse('if 1 else 2')).to.throw /unexpected else, expect then clause/
        it 'should parse if 1 then 2 else 3', ->
          x = parse('if 1 then 2 else 3')
          expect(str x).to.equal "[[if 1 2 3]]"
        it 'should parse if 1 then 2 \nelse 3', ->
          x = parse('if 1 then 2 \nelse 3')
          expect(str x).to.equal "[[if 1 2 3]]"
        it 'should parse if 1 then \n  2 \nelse 3', ->
          x = parse('if 1 then \n  2 \nelse 3')
          expect(str x).to.equal "[[if 1 2 3]]"
        it 'should parse if 1 \nthen 2 \nelse 3', ->
          x = parse('if 1 \nthen 2 \nelse 3')
          expect(str x).to.equal "[[if 1 2 3]]"

      describe "group2: ",  ->
        it 'should parse if 1 \n  2 \nelse 3', ->
          expect(-> parse('if 1 \n  2 \nelse 3')).to.throw /unexpected else, expect then clause/
        it 'should parse if 1 then if 2 then 3', ->
          x = parse('if 1 then if 2 then 3')
          expect(str x).to.equal "[[if 1 [if 2 3]]]"
        it 'should parse if 1 then if 2 then 3 else 4', ->
          x = parse('if 1 then if 2 then 3 else 4')
          expect(str x).to.equal "[[if 1 [if 2 3 4]]]"
        it 'should parse if 1 then if 2 then 3 \nelse 4', ->
          x = parse('if 1 then if 2 then 3 \nelse 4')
          expect(str x).to.equal "[[if 1 [if 2 3] 4]]"
        it 'should parse if 1 then \n if 2 then 3 \nelse 4', ->
          x = parse('if 1 then \n if 2 then 3 \nelse 4')
          expect(str x).to.equal "[[if 1 [if 2 3] 4]]"
        it 'should parse if 1 then\n if 2 then 3 \n else 4', ->
          x = parse('if 1 then\n if 2 then 3 \n else 4')
          expect(str x).to.equal "[[if 1 [if 2 3 4]]]"

    describe "while statement: ",  ->
      it 'should parse while 1 then 2', ->
        x = parse('while 1 then 2')
        expect(str x).to.equal "[[while 1 2]]"
      it 'should parse while 1 else 2', ->
        expect(try -> parse('while 1 else 2')).to.throw /unexpected else, expect then clause/
      it 'should parse while 1 then \n while 2 then 3 \nelse 4', ->
        x = parse('while 1 then \n while 2 then 3 \nelse 4')
        expect(str x).to.equal "[[while 1 [while 2 3] 4]]"
      it 'should parse while 1 then\n while 2 then 3 \n else 4', ->
        x = parse('while 1 then\n while 2 then 3 \n else 4')
        expect(str x).to.equal "[[while 1 [while 2 3 4]]]"

    describe "try statement: ",  ->
      describe "group1: ",  ->
        it 'should parse try 1 catch e then 2', ->
          x = parse('try 1 catch e then 2')
          expect(str x).to.equal "[[try 1 [list! [e 2]] undefined undefined]]"
        it 'should parse try 1 else 2', ->
          x = parse('try 1 else 2')
          expect(str x).to.equal "[[try 1 [list!] 2 undefined]]"
        it 'should parse try 1 catch e then 2 else 3', ->
          x = parse('try 1 catch e then 2 else 3')
          expect(str x).to.equal "[[try 1 [list! [e 2]] 3 undefined]]"
        it 'should parse try 1 catch e then 2 \nelse 3', ->
          x = parse('try 1 catch e then 2 \nelse 3')
          expect(str x).to.equal "[[try 1 [list! [e 2]] 3 undefined]]"
        it 'should parse try 1 catch e then \n  2 \nelse 3', ->
          x = parse('try 1 catch e then \n  2 \nelse 3')
          expect(str x).to.equal "[[try 1 [list! [e 2]] 3 undefined]]"
        it 'should parse try 1 \ncatch e then 2 \nelse 3', ->
          x = parse('try 1 \ncatch e then 2 \nelse 3')
          expect(str x).to.equal "[[try 1 [list! [e 2]] 3 undefined]]"
        it 'should parse try 1 \n  2 \nelse 3', ->
          expect(str parse('try 1 \n  2 \nelse 3')).to.equal "[[try [1 2] [list!] 3 undefined]]"
      describe "group2: ",  ->
        it 'should parse try 1 catch e then try 2 catch e then 3', ->
          x = parse('try 1 catch e then try 2 catch e then 3')
          expect(str x).to.equal "[[try 1 [list! [e [try 2 [list! [e 3]] undefined undefined]]] undefined undefined]]"
        it 'should parse try 1 catch e then try 2 catch e then 3 else 4', ->
          x = parse('try 1 catch e then try 2 catch e then 3 else 4')
          expect(str x).to.equal "[[try 1 [list! [e [try 2 [list! [e 3]] 4 undefined]]] undefined undefined]]"
        it 'should parse try 1 catch e then try 2 catch e then 3 \nelse 4', ->
          x = parse('try 1 catch e then try 2 catch e then 3 \nelse 4')
          expect(str x).to.equal "[[try 1 [list! [e [try 2 [list! [e 3]] undefined undefined]]] 4 undefined]]"
        it 'should parse try 1 catch e then \n try 2 catch e then 3 \nelse 4', ->
          x = parse('try 1 catch e then \n try 2 catch e then 3 \nelse 4')
          expect(str x).to.equal "[[try 1 [list! [e [try 2 [list! [e 3]] undefined undefined]]] 4 undefined]]"
        it 'should parse try 1 catch e then\n try 2 catch e then 3 \n else 4', ->
          x = parse('try 1 catch e then\n try 2 catch e then 3 \n else 4')
          expect(str x).to.equal "[[try 1 [list! [e [try 2 [list! [e 3]] 4 undefined]]] undefined undefined]]"

    describe "try if statement: ",  ->
      it 'should parse try if 1 then 2 catch e then 3', ->
        x = parse('try if 1 then 2 catch e then 3')
        expect(str x).to.equal "[[try [if 1 2] [list! [e 3]] undefined undefined]]"

    describe "switch statement: ",  ->
      describe "group1: ",  ->
        it 'should parse switch 1 case e: 2', ->
          x = parse('switch 1 case e: 2')
          expect(str x).to.equal "[[switch 1 [list! [[list! e] 2]] undefined]]"
        it 'should parse switch 1 else 2', ->
          x = parse('switch 1 else 2')
          expect(str x).to.equal "[[switch 1 [list!] 2]]"
        it 'should parse switch 1 case e: 2 else 3', ->
          x = parse('switch 1 case e: 2 else 3')
          expect(str x).to.equal "[[switch 1 [list! [[list! e] 2]] 3]]"
        it 'should parse switch 1 case e: 2 \nelse 3', ->
          x = parse('switch 1 case e: 2 \nelse 3')
          expect(str x).to.equal "[[switch 1 [list! [[list! e] 2]] 3]]"
        it 'should parse switch 1 case e: \n  2 \nelse 3', ->
          x = parse('switch 1 case e: \n  2 \nelse 3')
          expect(str x).to.equal "[[switch 1 [list! [[list! e] 2]] 3]]"
        it 'should parse switch 1 \n case e: 2 \n else 3', ->
          x = parse('switch 1 \n case e: 2 \n else 3')
          expect(str x).to.equal "[[switch 1 [list! [[list! e] 2]] 3]]"
        it 'should parse switch 1 \n  case 2: 4 \n else 3', ->
          expect(str parse('switch 1 \n case 2: 4 \n else 3')).to.equal "[[switch 1 [list! [[list! 2] 4]] 3]]"
        it 'should parse switch 1 case e: switch 2 case e: 3', ->
          x = parse('switch 1 case e: switch 2 case e: 3')
          expect(str x).to.equal "[[switch 1 [list! [[list! e] [switch 2 [list! [[list! e] 3]] undefined]]] undefined]]"
      describe "group2: ",  ->
        it 'should parse switch 1 case e: switch 2 case e: 3 else 4', ->
          x = parse('switch 1 case e: switch 2 case e: 3 else 4')
          expect(str x).to.equal "[[switch 1 [list! [[list! e] [switch 2 [list! [[list! e] 3]] 4]]] undefined]]"
        it 'should parse switch 1 case e: switch 2 case e: 3 \nelse 4', ->
          x = parse('switch 1 case e: switch 2 case e: 3 \nelse 4')
          expect(str x).to.equal "[[switch 1 [list! [[list! e] [switch 2 [list! [[list! e] 3]] undefined]]] 4]]"
        it 'should parse switch 1 case e: \n switch 2 case e: 3 \nelse 4', ->
          x = parse('switch 1 case e: \n switch 2 case e: 3 \nelse 4')
          expect(str x).to.equal "[[switch 1 [list! [[list! e] [switch 2 [list! [[list! e] 3]] undefined]]] 4]]"
        it 'should parse switch 1 case e:\n switch 2 case e: 3 \n else 4', ->
          x = parse('switch 1 case e:\n switch 2 case e: 3 \n else 4')
          expect(str x).to.equal "[[switch 1 [list! [[list! e] [switch 2 [list! [[list! e] 3]] 4]]] undefined]]"

    describe "let statement: ",  ->
      it 'should parse let a = 1 then 2', ->
        x = parse('let a = 1 then 2')
        expect(str x).to.equal "[[let [[a = 1]] 2]]"
      it 'should parse let a = 1 \nthen 2', ->
        x = parse('let a = 1 \nthen 2')
        expect(str x).to.equal "[[let [[a = 1]] 2]]"
      it 'should parse let a = 1, b = 3 \nthen 2', ->
        x = parse('let a = 1, b = 3 \nthen 2')
        expect(str x).to.equal "[[let [[a = 1] [b = 3]] 2]]"
      it 'should parse let a = abs \n    1, \n  b = 3 \nthen 2', ->
        x = parse('let a = abs \n    1, \n  b = 3 \nthen 2')
        expect(str x).to.equal "[[let [[a = [abs 1]] [b = 3]] 2]]"
      it 'should parse letrec! f = (x) -> if! x==1 1 f(x-1) then f(3)', ->
        expect(str parse('letrec! f = (x) -> if! x==1 1 f(x-1) then f(3)')).to.equal "[[letrec! [[f = [-> [x] [[if! [== x 1] 1 [call! f [[- x 1]]]]]]]] [call! f [3]]]]"
      it 'should parse letloop! f = (x) -> if! x==1 1 x+f(x-1)', ->
        expect(str parse('letloop! f = (x) -> if! x==1 1 x+f(x-1) then f(3)')).to.equal "[[letloop! [[f = [-> [x] [[if! [== x 1] 1 [+ x [call! f [[- x 1]]]]]]]]] [call! f [3]]]]"
      # single \ is invalid escape, will lost
      it '''should parse let a=[\ 1 \] then a[1]''', ->
        x = parse('''let a=[\ 1 \] then a[1]''')
        expect(str x).to.equal "[[let [[a = [list! 1]]] [index! a 1]]]"
      it '''should parse let a=[\\ 1 \\] then a[1]''', ->
        x = parse('''let a=[\\ 1 \\] then a[1]''')
        expect(str x).to.equal "[[let [[a = [list! 1]]] [index! a 1]]]"

    describe "indent block: ",  ->
      it 'should parse print \n 1', ->
        expect(str parse('print \n 1')).to.equal '[[print 1]]'
      it 'should parse print \n 2 \n 3', ->
        expect(str parse('print \n 2 \n 3')).to.equal '[[print 2 3]]'
      it 'should parse print \n abs \n   3', ->
        expect(str parse('print \n abs \n   3')).to.equal '[[print [abs 3]]]'
      it 'should parse print \n abs 3 \n abs 4', ->
        expect(str parse('print \n abs 3 \n abs 4')).to.equal '[[print [abs 3] [abs 4]]]'
      it 'should parse print : 2', ->
        expect(str parse("print : 2")).to.equal '[[print 2]]'

  describe "line: ",  ->
    parse = (text) ->
      parser = new Parser()
      x = parser.parse(text, parser.line, 0)
    it 'should parse print 1 ; print 2', ->
      x = parse('print 1 ; print 2')
      expect(str x).to.equal '[[print 1] [print 2]]'
    it 'should parse y+.!1 // y+!1 will be parsed as [+. y 1], so we separate + and ! by "."\n~ print 1', ->
      expect(str parse('y+.!1 // y+!1 will be parsed as [+. y 1], so we separate + and ! by "."\n~ print 1')).to.equal "[[+ y [!x 1]]]"

    it 'should parse / print 1 ; print 2', ->
      x = parse('/ print 1 ; print 2')
      expect(str x).to.equal "[[codeBlockComment! [[print 1] [print 2]]]]"

    it 'should parse / print \n abs 3 \n abs 4', ->
      expect(str parse('/ print \n abs 3 \n abs 4')).to.equal "[[codeBlockComment! [[print [abs 3] [abs 4]]]]]"

    it 'should parse / try 1 \n  2 \nelse 3', ->
      expect(str parse('/ try 1 \n  2 \nelse 3')).to.equal "[[codeBlockComment! [[try [1 2] [list!] 3 undefined]]]]"

    it '''should parse '#a=1;a''', ->
      expect(str parse('#a=1;a')).to.equal "[[= [# a] 1] a]"

    it '''should parse '##a=1;a''', ->
      expect(str parse('##a=1;a')).to.equal "[[## [= a 1]] a]"

    # \ is escape, will lost in string
    it '''should parse let a=[\ 1 \] then a[1]''', ->
      x = str parse('''let a=[\ 1 \] then a[1]''')
      expect(x).to.equal "[[let [[a = [list! 1]]] [index! a 1]]]"

  describe "data bracket: ",  ->
    parse = (text) ->
      parser = new Parser()
      x = parser.parse(text, parser.dataBracket, 0)
    it 'should parse [\\ 1 \\]', ->
      x = parse('[\\ 1 \\]')
      expect(str x).to.equal "[list! 1]"
    it 'should parse [\\1\n2 \\]', ->
      x = parse('[\\1\n2 \\]')
      expect(str x).to.equal "[list! 1 2]"
    it 'should parse [\\ 1 2\n3 4 \\]', ->
      x = parse('[\\ 1 2\n3 4 \\]')
      expect(str x).to.equal "[list! [list! 1 2] [list! 3 4]]"

  describe "module: ",  ->
    head = 'taiji language 0.1\n'
    parse = (text) ->
      parser = new Parser()
      x = parser.parse(head+text, parser.module, 0)
      x.body
    it 'should parse 1', ->
      expect(str parse('1 ')).to.equal '1'
    it 'should parse 1.', ->
      expect(str parse('1.')).to.equal "[1 .]"
    it 'should parse \n1', ->
      expect(str parse('\n1 ')).to.equal '1'
    it 'should parse "1"', ->
      expect(str parse('"1"')).to.equal '[string! "1"]'
    it 'should parse a', ->
      expect(str parse('a')).to.equal 'a'
    it 'should parse  print 2', ->
      expect(str parse('print 2 ')).to.equal '[print 2]'
    it '''should parse '##a=1; # ` ^ a''', ->
      expect(str parse('##a=1; # ` ^ a')).to.equal "[begin! [## [= a 1]] [# [quasiquote! [unquote! a]]]]"
    it '''should parse 'a#=1; # ` ^ a''', ->
      expect(str parse('a#=1; # ` ^ a')).to.equal "[begin! [#= a 1] [# [quasiquote! [unquote! a]]]]"
    it '''should parse ^.a''', ->
      expect(str parse('^.a')).to.equal "[unquote! a]"
    it '''should parse '##a=1; #.`.^a''', ->
      expect(str parse('##a=1; #.`.^a')).to.equal "[begin! [## [= a 1]] [# [quasiquote! [unquote! a]]]]"
    it 'should print \n 2 ', ->
      expect(str parse('print \n 2 ')).to.equal '[print 2]'
    it 'should  print \n 2 \n 3', ->
      expect(str parse('print \n 2 \n 3')).to.equal "[print 2 3]"
    it 'should parse  print \n 2  3', ->
      expect(str parse('print \n 2  3')).to.equal "[print [2 3]]"
    it 'should parse print \n add 1 2; add 3 4', ->
      expect(str parse('print \n add 1 2; add 3 4')).to.equal '[print [add 1 2] [add 3 4]]'
    it 'should parse /. some comment', ->
      expect(str parse('/. some comment')).to.equal ''
    it 'should parse 1\n/. some comment', ->
      expect(str parse('1\n/. some comment')).to.equal "1"
    it 'should parse /. some \n  embedded \n  comment', ->
      expect(str parse('/. some \n  embedded \n  comment')).to.equal ''
    it 'should parse ` [ ^1 ^2 ^&[3 4]]', ->
      expect(str parse('`[ ^1 ^2 ^&[3 4]]')).to.equal "[quasiquote! [list! [[unquote! 1] [unquote! 2] [unquote-splice [list! [3 4]]]]]]"
    it 'should parse ` [ ^1 ]', ->
      expect(str parse('` [ ^1 ]')).to.equal "[quasiquote! [list! [unquote! 1]]]"
    it 'should parse `[ ^1 ]', ->
      expect(str parse('`[ ^1 ]')).to.equal "[quasiquote! [list! [unquote! 1]]]"
    it 'should parse `[ ^1 ^2 ]', ->
      expect(str parse('`[ ^1 ^2]')).to.equal "[quasiquote! [list! [[unquote! 1] [unquote! 2]]]]"
    it 'should parse `{ ^1, ^2 }', ->
      expect(str parse('`{ ^1, ^2 }')).to.equal '[quasiquote! [begin! [unquote! 1] [unquote! 2]]]'

    it 'should parse # if 0 then 1+2 else 3+4', ->
      expect(str parse('# if 0 then 1+2 else 3+4')).to.equal "[# [if 0 [+ 1 2] [+ 3 4]]]"

    it '''should parse for x in [\ 1, 2 \] then print x''', ->
      expect(str parse('''for x in [\ 1 2 \] then print x''')).to.equal "[forIn! x [list! [1 2]] [print x]]"

    it 'should parse {(a,b) -=> `( ^a + ^b )}(1,2)', ->
      expect(str parse('{(a,b) -=> `( ^a + ^b )}(1,2)')).to.equal "[call! [-=> [a b] [[quasiquote! [+ [unquote! a] [unquote! b]]]]] [1 2]]"
    it 'should parse { -=> ( a )}()', ->
      expect(str parse('{ -=> ( a )}()')).to.equal "[call! [-=> [] [a]] []]"
    it 'should parse m = (a,b) -=> `( ^a + ^b); m(1,2)', ->
      expect(str parse('m = (a,b) -=> `( ^a + ^b ); m(1,2)')).to.equal "[= m [-=> [a b] [[quasiquote! [+ [unquote! a] [unquote! b]]] [call! m [1 2]]]]]"

    it 'should parse switch! 1 {{[2] 3}} 4', ->
      expect(str parse("switch! 1 { {[2] 3} } 4")).to.equal "[switch! 1 [[list! 2] 3] 4]"

    it '''should parse while! (1) {print 1} ''', ->
      expect(str parse('''while! (1) {print 1}''')).to.equal "[while! 1 [print 1]]"

    it '''should parse while! (1) ''', ->
      expect(-> parse('''while! (1)''')).to.throw /expect the body for while! statement/

    it '''should parse (1) ''', ->
      expect(str parse('''(1)''')).to.equal '1'

    describe "prefix: ",  ->
      it 'should parse +1', ->
        expect(str parse('+1 ')).to.equal "[+x 1]"
      it 'should parse + 1', ->
        expect(str parse('+ 1 ')).to.equal "[+x 1]"
      it 'should parse + + 1', ->
        expect(str parse('+ + 1 ')).to.equal "[+x [+x 1]]"
      it 'should parse print + 1', ->
        expect(str parse('print + 1 ')).to.equal "[+ print 1]"
      it 'should parse print: + 1', ->
        expect(str parse('print: + 1 ')).to.equal "[print [+x 1]]"

    describe "line and indent operator: ",  ->
      it "parse (1+2\n * 3+6)", ->
        expect(str parse('(1+2\n * 3+6)')).to.equal "[* [+ 1 2] [+ 3 6]]"

      it "parse 1+2\n * 3+6\n + 5+8", ->
        expect(str parse('(1+2\n * 3+6\n + 5+8)')).to.equal "[* [+ 1 2] [+ [+ 3 6] [+ 5 8]]]"

      it 'should parse ()', ->
        expect(parse('()').value).to.equal undefined

      it 'should parse ` { ^1 { ^2 ^&{3 4}}}', ->
        expect(str parse('`{ ^1 { ^2 ^&{3 4}}}')).to.equal "[quasiquote! [[unquote! 1] [[unquote! 2] [unquote-splice [3 4]]]]]"

      it 'should parse `{ ^1 { ^2 ^&{3 4}}}', ->
        expect(str parse('`{ ^1 { ^2 ^&{3 4}}}')).to.equal "[quasiquote! [[unquote! 1] [[unquote! 2] [unquote-splice [3 4]]]]]"

    it 'should parse letloop! \n  odd = (x) -> if! x==0 0 even(x-1)\n  even = (x) -> if! x==0 1 odd(x-1) \nthen odd(3)', ->
      expect(str parse('letloop! \n  odd = (x) -> if! x==0 0 even(x-1)\n  even = (x) -> if! x==0 1 odd(x-1) \nthen odd(3)')).to.equal "[letloop! [[odd = [-> [x] [[if! [== x 0] 0 [call! even [[- x 1]]]]]]] [even = [-> [x] [[if! [== x 0] 1 [call! odd [[- x 1]]]]]]]] [call! odd [3]]]"

    describe "new parser tests from samples: ",  ->
      it "parse while! 2 if 1 then console.log 1 else console.log 2", ->
        expect(str parse('while! 2 if 1 then console.log 1 else console.log 2')).to.equal "[while! 2 [if 1 [[attribute! console log] 1] [[attribute! console log] 2]]]"
      it "parse while! 2 if 1 then console.log 1 else console.log 2\nwhile! 3\n if 1 then console.log 1 else console.log 2", ->
        expect(str parse('while! 2 if 1 then console.log 1 else console.log 2\nwhile! 3\n if 1 then console.log 1 else console.log 2')).to.equal "[begin! [while! 2 [if 1 [[attribute! console log] 1] [[attribute! console log] 2]]] [while! 3 [if 1 [[attribute! console log] 1] [[attribute! console log] 2]]]]"
      it "parse var a=1, b=2", ->
        expect(str parse('var a=1, b=2')).to.equal "[var [a = 1] [b = 2]]"

      it '''should parse try! {throw 3} e {print 1} {print 'finally here'}''', ->
        expect(str parse("var e\ntry! {throw 3} e {print 1} {print 'finally here'}")).to.equal "[begin! [var e] [try! [throw 3] e [print 1] [print \"finally here\"]]]"

      it 'should parse console.log : and 1 2', ->
        x = str parse('console.log : and 1 2')
        expect(x).to.deep.equal "[[attribute! console log] [and 1 2]]"

      it 'should parse and 1 /* inline comment */ 2', ->
        x = str parse('and 1 /* inline comment */ 2')
        expect(x).to.deep.equal "[and 1 2]"

      it 'should parse and 1 /* inline \ncomment */ 2', ->
        x = str parse('and 1 /* inline \ncomment */ 2')
        expect(x).to.deep.equal "[and 1 2]"

      it 'should parse and 1/* inline comment */2', ->
        x = str parse('and 1/* inline comment */2')
        expect(x).to.deep.equal "[and 1 2]"

      it 'should parse and\n 1\n/* comment */', ->
        x = str parse('and\n 1\n/* comment */')
        expect(x).to.deep.equal "[and 1]"

      it 'should parse x = ->\n 1\n/* comment */', ->
        x = str parse('x = ->\n 1\n/* comment */')
        expect(x).to.deep.equal "[= x [-> [] [1]]]"

      it 'should parse x = /-h\b|-r\b|-v\b|-b\b/', ->
        x = str parse('x = /-h\b|-r\b|-v\b|-b\b/')
        expect(x).to.deep.equal "[= x [regexp! /-h\b|-r\b|-v\b|-b\b/]]"

      it 'should parse a = 2\nx = : 1', ->
        x = str parse('a = 2\nx = : 1')
        expect(x).to.deep.equal "[begin! [= a 2] [= x [: 1]]]"

      it 'should parse error: new: Error "Error: No Input file given" ', ->
        x = str parse('error: new: Error "Error: No Input file given" ')
        expect(x).to.deep.equal "[error [new [Error [string! \"Error: No Input file given\"]]]]"

      it 'should parse new: Error "Error: No Input file given" ', ->
        x = str parse('new : Error "Error: No Input file given"')
        expect(x).to.deep.equal "[new [Error [string! \"Error: No Input file given\"]]]"

      it 'should parse node.spawn outfile() {.stdio: "inherit".}', ->
        expect(str parse('node.spawn outfile() {.stdio: "inherit".}')).to.equal "[[attribute! node spawn] [call! outfile []] [hash! [jshashitem! stdio [string! \"inherit\"]]]]"

    describe "indented string block: ",  ->
      it 'should parse indented string ', ->
        code = '''var a = '
          a abbr address
          caption cite' '''
        x = str parse(code)
        expect(x).to.deep.equal "[var [a = \"\\na abbr address\\ncaption cite\"]]"

      it 'should parse assign a indented string ', ->
        code = '''a = '
          a abbr address
          caption cite' '''
        x = str parse(code)
        expect(x).to.deep.equal "[= a \"\\na abbr address\\ncaption cite\"]"

      it 'should parse indented string which start by space ', ->
        # the first line is indented by a space , so it is a part of module head, not the program body.
        code = ''' var a = '
          a abbr address
          caption cite' '''
        expect(-> parse(code)).to.throw /unexpected end of input/

    describe "import module: ",  ->
      it '''should parse import! a as A, #b as #b from 'x.tj' as x''', ->
        code = '''import! a as A, #b as #b from 'x.tj' as x '''
        x = str parse(code)
        expect(x).to.deep.equal "[import! \"x.tj\" undefined x undefined [[a A]] [[b b meta]]]"
      it '''should parse import! a as A, #b as #b from 'x.tj' as #/x''', ->
        code = '''import! a as A, #b as #b from 'x.tj' as #/x '''
        x = str parse(code)
        expect(x).to.deep.equal "[import! \"x.tj\" undefined x x [[a A]] [[b b meta]]]"
      it '''should parse import! a as A, #b from 'x.tj' as x''', ->
        code = '''import! a as A, #b from 'x.tj' as x '''
        x = str parse(code)
        expect(x).to.deep.equal "[import! \"x.tj\" undefined x undefined [[a A]] [[b b meta]]]"
      it '''should parse import! a as A, #/b from 'x.tj' as x''', ->
        code = '''import! a as A, #/b from 'x.tj' as x '''
        x = str parse(code)
        expect(x).to.deep.equal "[import! \"x.tj\" undefined x undefined [[a A] [b b]] [[b b meta]]]"
      it '''should parse import! a as A, #/b as b1 #b2 from 'x.tj' as x''', ->
        code = '''import! a as A, #/b as b1 #b2 from 'x.tj' as x '''
        x = str parse(code)
        expect(x).to.deep.equal "[import! \"x.tj\" undefined x undefined [[a A] [b b1]] [[b b2 meta]]]"
      it '''should parse import! x''', ->
        code = '''import! 'x.tj' '''
        x = str parse(code)
        expect(x).to.deep.equal "[import! \"x.tj\" undefined undefined undefined [] []]" # import path method alias metaAlias runtimeImportList metaImportItemList

    describe "export!: ",  ->
      it '''should parse export! a = A, #b, c, #b = d''', ->
        code = '''export! a = A, #b, c, #b = d '''
        x = str parse(code)
        expect(x).to.deep.equal "[export! [a A runtime undefined] [b undefined undefined meta] [c undefined runtime undefined] [b d undefined meta]]"

    describe "assign to outer scope var: ",  ->
      it "should parse @@a", ->
        expect(str parse('@@a')).to.equal "[@@ a]"
      it "should parse @@a+1", ->
        expect(str parse('@@a+1')).to.equal "[+ [@@ a] 1]"
      it "should parse a=1; -> @@a=1", ->
        expect(str parse('a=1; -> @@a=1')).to.equal "[begin! [= a 1] [-> [] [[= [@@ a] 1]]]]"

    it 'should parse if! 1 {break} {continue}', ->
      expect(str parse("if! 1 {break} {continue}")).to.equal "[if! 1 [break] [continue]]"

    it 'should parse [1 2]', ->
      expect(str parse("[1 2]")).to.equal "[list! [1 2]]"

    it 'should parse [1, 2]', ->
      expect(str parse("[1, 2]")).to.equal "[list! 1 2]"