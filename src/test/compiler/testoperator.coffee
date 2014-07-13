chai = require("chai")
expect = chai.expect
iit = it.only
idescribe = describe.only
ndescribe = ->

lib = '../../lib/'
{Parser} = require lib+'parser'
{constant, isArray, str} = require lib+'parser/base'
taiji = require lib+'taiji'

compile = (code) ->
  head = 'taiji language 0.1\n'
  taiji.compile(head+code, taiji.rootModule, taiji.builtins, {})

compileNoOptimize = (code) ->
  head = 'taiji language 0.1\n'
  taiji.compileNoOptimize(head+code, taiji.rootModule, taiji.builtins, {})

describe "compile operator expression: ", ->
  describe "atom: ", ->
    it "compile 1", ->
      expect(compile('1')).to.deep.equal '1'
    it "compile var a; a", ->
      expect(compile('var a; a')).to.deep.equal "var a;\na;"
    it "compile extern! a; a", ->
      expect(compile('extern! a; a')).to.deep.equal "a"
    it "compile 'a'", ->
      expect(compile("'a'")).to.deep.equal "\"a\""
    it 'compile "a"', ->
      expect(compile('"a"')).to.deep.equal "\"a\""

  describe "prefix: ",  ->
    it 'should compile + 1', ->
      expect(compile('+ 1 ')).to.deep.equal "1"
    it 'should compile ( + + 1)', ->
      expect(compile('( + + 1) ')).to.deep.equal "1"
    it 'should compile console.log', ->
      expect(compile('console.log')).to.deep.equal "console.log"
    it 'should compile print 1', ->
      expect(compile('print 1 ')).to.deep.equal "console.log(1)"
    it 'should compile print +1', ->
      expect(compile('print +1 ')).to.deep.equal "console.log(1)"

  describe "multi lines and indent expression", ->
    it "compile 1+2\n*3", ->
      expect(compile('(1+2\n*3)')).to.deep.equal '9'

    it "compile 1+2\n* 3", ->
      expect(compile('(1+2\n* 3)')).to.deep.equal '9'

    it "compile 1+2\n* 3+6", ->
      expect(compile('(1+2\n* 3+6)')).to.deep.equal '27'

    it "compile 1+2\n * 3+6", ->
      expect(compile('(1+2\n * 3+6)')).to.deep.equal '27'

    it "compile 1+2\n * 3+6\n + 5+8", ->
      expect(compile('(1+2\n * 3+6\n + 5+8)')).to.deep.equal "66"

    it "compile 1+2\n+4\n*3", ->
      expect(compile('(1+2\n+4\n*3)')).to.deep.equal '21'

  describe "add and multiply", ->
    it "compile (1+2)", ->
      expect(compile('(1+2)')).to.deep.equal "3"

    it "compile 1+ 2", ->
      expect(-> compile('(1+ 2)')).to.throw /unexpected spaces or new lines after binary operator/

    it "compile 1+ 2*3", ->
      expect(-> compile('(1+ 2*3)')).to.throw /unexpected spaces or new lines after binary operator/

    it "compile (1, 2)", ->
      expect(compile('(1, 2)')).to.deep.equal "[1, 2]"
    it "compile (1, 2+3)", ->
      expect(compile('(1, 2+3)')).to.deep.equal "[1, 5]"
    it "compile (1,2 + 3)", ->
      expect(compile('(1,2 + 3)')).to.deep.equal "[1, 2] + 3"

    it "compile (1 +2)", ->
      expect(-> compile('(1 +2)')).to.throw /should have spaces at its right side/

    it "compile (1+2 * 3)", ->
      expect(compile('(1+2 * 3)')).to.deep.equal '9'

    it "compile (1 + 2*3)", ->
      expect(compile('(1 + 2*3)')).to.deep.equal '7'

    it "compile (1+2+3)", ->
      expect(compile('1+2+3')).to.deep.equal "6"

    it "compile (1 + 2+3)", ->
      expect(compile('(1 + 2+3)')).to.deep.equal "6"

    it "compile (1+2*3)", ->
      expect(compile('1+2*3')).to.deep.equal "7"

    it "compile 1*2+3", ->
      expect(compile('1*2+3')).to.deep.equal "5"

    it "compile 1*(2+3)", ->
      expect(compile('1*(2+3)')).to.deep.equal  "5"

    it "compile (1)", ->
      expect(compile('(1)')).to.deep.equal '1'

    it "compile (1+2)*(3+4)", ->
      expect(compile('(1+2)*(3+4)')).to.deep.equal "21"

  describe "attribute, index", ->
    it "compile a.b", ->
      expect(compile('var a; a.b')).to.deep.equal "var a;\na.b;"
    it "compile a . b", ->
      expect(compile('var a; (a . b)')).to.deep.equal "var a;\na.b;"
    it "compile a&/b", ->
      expect(compile('var a, b; a&/b')).to.deep.equal "var a, b;\na[b];"
    it "compile a&/1", ->
      expect(compile('var a; a&/1')).to.deep.equal "var a;\na[1];"
    it "compile a&/(1)", ->
      expect(compile('var a; a&/(1)')).to.deep.equal "var a;\na[1];"
    it "compile a&/(1,2)", ->
      expect(compile('var a; a&/(1,2)')).to.deep.equal "var a;\na[[1, 2]];"
    it "compile '1'&/1", ->
      expect(compile("'1'&/1")).to.deep.equal "\"1\"[1]"
    it "compile '1'&/(1,2)", ->
      expect(compile("'1'&/(1,2)")).to.deep.equal "\"1\"[[1, 2]]"
    it "compile a[1]", ->
      expect(compile('var a; a[1]')).to.deep.equal "var a;\na[1];"
    it "compile a [1]", ->
      expect(-> compile('(a [1])')).to.throw /subscript should tightly close to left operand/
    it "compile a[1][2]", ->
      expect(compile('var a; a[1][2]')).to.deep.equal "var a;\na[1][2];"
    it """compile require.extensions[".tj"]""", ->
      expect(compile('require.extensions[".tj"]')).to.deep.equal "require.extensions[\".tj\"]"

  describe "call: ", ->
    it "compile a(1)", ->
      expect(compile('var a; a(1)')).to.deep.equal "var a;\na(1);"
    it "compile a.b(1)", ->
      expect(compile('var a; a.b(1)')).to.deep.equal "var a;\na.b(1);"
    it "compile a['b'](1)", ->
      expect(compile("var a; a['b'](1)")).to.deep.equal "var a;\na[\"b\"](1);"
    it "compile a(1 , 2)", ->
      expect(compile('var a; a(1 , 2)')).to.deep.equal "var a;\na(1, 2);"
    it "compile a(1, x..., 2, y..., z)", ->
      expect(compile('var a, x, y, z; a(1, x..., 2, y..., z)')).to.deep.equal "var a, x, y, z;\na.apply(null, [1].concat(x).concat([2]).concat(y).concat([z]));"
    it "compile a.f(1, x..., 2, y..., z)", ->
      expect(compile('var f, a, x, y, z; a.f(1, x..., 2, y..., z)')).to.deep.equal "var f, a, x, y, z;\na.f.apply(a, [1].concat(x).concat([2]).concat(y).concat([z]));"
    it "compile a.f(1, arguments...)", ->
      expect(compile('var f, a, x, y, z; a.f(1, arguments...)')).to.deep.equal "var f, a, x, y, z;\na.f.apply(a, [1].concat([].slice(arguments)));"
    it "compile a(1 , 2 , 3)", ->
      expect(compile('var a; a(1 , 2 , 3)')).to.deep.equal  "var a;\na(1, 2, 3);"

  describe "unquote: ", ->
    it "compile ^a", ->
      expect(-> compile('^a')).to.throw /unexpected unquote/
    it "compile ^&a", ->
      expect(-> compile('^&a')).to.throw /unexpected unquote-splice/
    it "compile ^& a", ->
      expect(-> compile('^& a')).to.throw /unexpected unquote-splice/

  describe "comma expression", ->
    it "compile 1 , 2", ->
      expect(compile('1 , 2')).to.deep.equal "2"
    it "compile 1 , 2 , 3", ->
      expect(compile('1 , 2 , 3')).to.deep.equal "3"

  describe "assign and right assocciation ", ->
    it "compile a=1", ->
      expect(compile('a=1')).to.deep.equal "var a = 1;\na;"

    it "compile a = 1", ->
      expect(compile('a = 1')).to.deep.equal "var a = 1;\na;"

    it "compile a = b = 1", ->
      expect(compile('a = b = 1')).to.deep.equal "var a, b = 1;\na = b;\na;"

    it "compile a += b = 1", ->
      expect(compile('var a; a += b = 1')).to.deep.equal "var a, b = 1;\na += b;"

  describe "ternary, i.e. condition expression", ->
    it "compile 1 ?  2 :  3", ->
      expect(compile('(1 ?  2 :  3)')).to.deep.equal "1? 2: 3"

    it "compile 1 ?  (a = 3) :  (b = 4)", ->
      expect(compile('(1 ?  (a = 3) :  (b = 4))')).to.deep.equal "var t, a = 3;\nt = a;\nt;"

    it "compile 1 ?  (a = 3) :  (b = 4)", ->
      expect(compile('var x; (x ?  (a = 3) :  (b = 4))')).to.deep.equal "var x, t;\n\nif (x){ \n  var a = 3;\n  t = a;\n}\nelse { \n  var b = 4;\n  t = b;\n};\nt;"

    it "compile a = (1 ?  2 :  3)", ->
      expect(compile('a = (1 ?  2 :  3)')).to.deep.equal "var a = 1? 2: 3;\na;"

    it "compile (a = (1 ?  2 :  3))", ->
      expect(compile('(a = (1 ?  2 :  3))')).to.deep.equal "var a = 1? 2: 3;\na;"
