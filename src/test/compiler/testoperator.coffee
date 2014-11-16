{expect, idescribe, ndescribe, iit, nit} = require '../util'

lib = '../../lib/'
{constant, isArray, str, realCode} = require lib+'utils'
{Parser} = require lib+'parser'
taiji = require lib+'taiji'

compile = (code) ->
  head = 'taiji language 0.1\n'
  realCode taiji.compile(head+code, taiji.rootModule, taiji.builtins, {})

compileNoOptimize = (code) ->
  head = 'taiji language 0.1\n'
  realCode taiji.compileNoOptimize(head+code, taiji.rootModule, taiji.builtins, {})

ndescribe "compile operator expression: ", ->
  describe "atom: ", ->
    it "compile 1", ->
      expect(compile('1')).to.have.string '1'
    it "compile var a; a", ->
      expect(compile('var a; a')).to.have.string "var a;\na"
    it "compile extern! a; a", ->
      expect(compile('extern! a; a')).to.have.string "a"
    it "compile 'a'", ->
      expect(compile("'a'")).to.have.string "\"a\""
    it 'compile "a"', ->
      expect(compile('"a"')).to.have.string "\"a\""

  describe "prefix: ",  ->
    it 'should compile + 1', ->
      expect(compile('+ 1 ')).to.have.string "1"
    it 'should compile ( + + 1)', ->
      expect(compile('( + + 1) ')).to.have.string "1"
    it 'should compile console.log', ->
      expect(compile('console.log')).to.have.string "console.log"
    it 'should compile print 1', ->
      expect(compile('print 1 ')).to.have.string "console.log(1)"
    it 'should compile print +1', ->
      expect(compile('print +1 ')).to.have.string "console.log(1)"

  describe "multi lines and indent expression", ->
    it "compile 1+2\n*3", ->
      expect(compile('(1+2\n*3)')).to.have.string '9'

    it "compile 1+2\n* 3", ->
      expect(compile('(1+2\n* 3)')).to.have.string '9'

    it "compile 1+2\n* 3+6", ->
      expect(compile('(1+2\n* 3+6)')).to.have.string '27'

    it "compile 1+2\n * 3+6", ->
      expect(compile('(1+2\n * 3+6)')).to.have.string '27'

    it "compile 1+2\n * 3+6\n + 5+8", ->
      expect(compile('(1+2\n * 3+6\n + 5+8)')).to.have.string "66"

    it "compile 1+2\n+4\n*3", ->
      expect(compile('(1+2\n+4\n*3)')).to.have.string '21'

  describe "add and multiply", ->
    it "compile (1+2)", ->
      expect(compile('(1+2)')).to.have.string "3"

    it "compile 1+ 2", ->
      expect(-> compile('(1+ 2)')).to.throw /unexpected spaces or new lines after binary operator/

    it "compile 1+ 2*3", ->
      expect(-> compile('(1+ 2*3)')).to.throw /unexpected spaces or new lines after binary operator/

    it "compile (1, 2)", ->
      expect(compile('(1, 2)')).to.have.string "[1, 2]"
    it "compile (1, 2+3)", ->
      expect(compile('(1, 2+3)')).to.have.string "[1, 5]"
    it "compile (1,2 + 3)", ->
      expect(compile('(1,2 + 3)')).to.have.string "[1, 2] + 3"

    it "compile (1 +2)", ->
      expect(-> compile('(1 +2)')).to.throw /should have spaces at its right side/

    it "compile (1+2 * 3)", ->
      expect(compile('(1+2 * 3)')).to.have.string '9'

    it "compile (1 + 2*3)", ->
      expect(compile('(1 + 2*3)')).to.have.string '7'

    it "compile (1+2+3)", ->
      expect(compile('1+2+3')).to.have.string "6"

    it "compile (1 + 2+3)", ->
      expect(compile('(1 + 2+3)')).to.have.string "6"

    it "compile (1+2*3)", ->
      expect(compile('1+2*3')).to.have.string "7"

    it "compile 1*2+3", ->
      expect(compile('1*2+3')).to.have.string "5"

    it "compile 1*(2+3)", ->
      expect(compile('1*(2+3)')).to.have.string  "5"

    it "compile (1)", ->
      expect(compile('(1)')).to.have.string '1'

    it "compile (1+2)*(3+4)", ->
      expect(compile('(1+2)*(3+4)')).to.have.string "21"

  describe "attribute, index", ->
    it "compile a.b", ->
      expect(compile('var a; a.b')).to.have.string "var a;\na.b"
    it "compile a . b", ->
      expect(compile('var a; (a . b)')).to.have.string "var a;\na.b"

    # x[y] can be used as subscript, so &/ is deprecated.
    nit "compile a&/b", ->
      expect(compile('var a, b; a&/b')).to.have.string "var a, b;\na[b]"
    nit "compile a&/1", ->
      expect(compile('var a; a&/1')).to.have.string "var a;\na[1]"
    nit "compile a&/(1)", ->
      expect(compile('var a; a&/(1)')).to.have.string "var a;\na[1]"
    nit "compile a&/(1,2)", ->
      expect(compile('var a; a&/(1,2)')).to.have.string "var a;\na[[1, 2]]"
    nit "compile '1'&/1", ->
      expect(compile("'1'&/1")).to.have.string "\"1\"[1]"
    nit "compile '1'&/(1,2)", ->
      expect(compile("'1'&/(1,2)")).to.have.string "\"1\"[[1, 2]]"

    it "compile a[1]", ->
      expect(compile('var a; a[1]')).to.have.string "var a;\na[1]"
    it "compile a [1]", ->
      expect(-> compile('(a [1])')).to.throw /subscript should tightly close to left operand/
    it "compile a[1][2]", ->
      expect(compile('var a; a[1][2]')).to.have.string "var a;\na[1][2]"
    it """compile require.extensions[".tj"]""", ->
      expect(compile('require.extensions[".tj"]')).to.have.string "require.extensions[\".tj\"]"

  describe "call: ", ->
    it "compile a(1)", ->
      expect(compile('var a; a(1)')).to.have.string "var a;\na(1)"
    it "compile a.b(1)", ->
      expect(compile('var a; a.b(1)')).to.have.string "var a;\na.b(1)"
    it "compile a['b'](1)", ->
      expect(compile("var a; a['b'](1)")).to.have.string "var a;\na[\"b\"](1)"
    it "compile a(1 , 2)", ->
      expect(compile('var a; a(1 , 2)')).to.have.string "var a;\na(1, 2)"
    it "compile a(1, x..., 2, y..., z)", ->
      expect(compile('var a, x, y, z; a(1, x..., 2, y..., z)')).to.have.string "var a, x, y, z;\na.apply(null, [1].concat(x).concat([2]).concat(y).concat([z]))"
    it "compile a.f(1, x..., 2, y..., z)", ->
      expect(compile('var f, a, x, y, z; a.f(1, x..., 2, y..., z)')).to.have.string "var f, a, x, y, z;\na.f.apply(a, [1].concat(x).concat([2]).concat(y).concat([z]))"
    it "compile a.f(1, arguments...)", ->
      expect(compile('var f, a, x, y, z; a.f(1, arguments...)')).to.have.string "var f, a, x, y, z;\na.f.apply(a, [1].concat([].slice(arguments)))"
    it "compile a(1 , 2 , 3)", ->
      expect(compile('var a; a(1 , 2 , 3)')).to.have.string  "var a;\na(1, 2, 3)"

  describe "unquote: ", ->
    it "compile ^a", ->
      expect(-> compile('^a')).to.throw /unexpected unquote/
    it "compile ^&a", ->
      expect(-> compile('^&a')).to.throw /unexpected unquote-splice/
    it "compile ^& a", ->
      expect(-> compile('^& a')).to.throw /unexpected unquote-splice/

  describe "comma expression", ->
    it "compile 1 , 2", ->
      expect(compile('1 , 2')).to.have.string "2"
    it "compile 1 , 2 , 3", ->
      expect(compile('1 , 2 , 3')).to.have.string "3"

  describe "assign and right assocciation ", ->
    it "compile a=1", ->
      expect(compile('a=1')).to.have.string "var a = 1;\na"

    it "compile a = 1", ->
      expect(compile('a = 1')).to.have.string "var a = 1;\na"

    it "compile a = b = 1", ->
      expect(compile('a = b = 1')).to.have.string "var a, b = 1;\na = b;\na"

    it "compile a += b = 1", ->
      expect(compile('var a; a += b = 1')).to.have.string "var a, b = 1;\na += b"

  # {if! x y z} could be used as ternary
  ndescribe "ternary, i.e. condition expression", ->
    it "compile 1 ?  2 :  3", ->
      expect(compile('(1 ?  2 :  3)')).to.have.string "1? 2: 3"

    it "compile 1 ?  (a = 3) :  (b = 4)", ->
      expect(compile('(1 ?  (a = 3) :  (b = 4))')).to.have.string "var t, a = 3;\nt = a;\nt"

    it "compile 1 ?  (a = 3) :  (b = 4)", ->
      expect(compile('var x; (x ?  (a = 3) :  (b = 4))')).to.have.string "var x, t;\n\nif (x){ \n  var a = 3;\n  t = a;\n}\nelse { \n  var b = 4;\n  t = b;\n};\nt"

    it "compile a = (1 ?  2 :  3)", ->
      expect(compile('a = (1 ?  2 :  3)')).to.have.string "var a = 1? 2: 3;\na"

    it "compile (a = (1 ?  2 :  3))", ->
      expect(compile('(a = (1 ?  2 :  3))')).to.have.string "var a = 1? 2: 3;\na"
