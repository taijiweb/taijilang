{expect, idescribe, ndescribe, iit, nit, matchRule, parse, compile} = require '../util'

lib = '../../lib/'

{str} = require lib+'utils'
{Parser} = require lib+'parser'

taiji = require lib+'taiji'
{nonMetaCompileExpNoOptimize} = require lib+'compiler'

parse = (text) ->
  parser = new Parser()
  x = parser.parse(text, parser.module, 0)

parseClause = (text) ->
  parser = new Parser()
  x = parser.parse(text, matchRule(parser, parser.clause), 0)
  str x

# below is compile without metaConvert
# if comment the definiton below ,will use "compile" required from util, which is a full compile funciton
compile = noOptCompile = (text) ->
  exp = parse(text)
  env = taiji.initEnv(taiji.builtins, taiji.rootModule, {})
  exp = nonMetaCompileExpNoOptimize exp, env
  exp

ndescribe "compile operator expression: ", ->
  describe "atom: ", ->
    it "compile 1", ->
      expect(compile('1')).to.have.string '1'
    it "compile var a; a", ->
      expect(compile('var a; a')).to.have.string "var a;\na"
    it "compile extern! a; a", ->
      expect(compile('extern! a; a')).to.have.string "a"
    it "compile 'a'", ->
      expect(compile("'a'")).to.have.string '\'a\''
    it 'compile "a"', ->
      expect(compile('"a"')).to.have.string '"a"'

  describe "prefix: ",  ->
    it 'should compile +1', ->
      expect(compile('+1 ')).to.have.string "1"

  describe "attribute: ",  ->
    it 'should compile console.log', ->
      expect(compile('console.log')).to.have.string "console.log"

  ndescribe "multi lines and indent expression", ->
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
    it "compile 1+2", ->
      expect(compile('1+2')).to.have.string '1 + 2'

    it "compile (1,2)", ->
      expect(compile('(1,2)')).to.have.string '[1, 2]'

    it "compile (1+2)", ->
      expect(compile('(1+2)')).to.have.string '1 + 2'

    it "compile (1, 2+3)", ->
      expect(compile('(1, 2+3)')).to.have.string '[1, 2 + 3]'

    it "compile (1)", ->
      expect(compile('(1)')).to.have.string '1'

  describe "attribute, index", ->
    it "compile a.b", ->
      expect(compile('var a; a.b')).to.have.string "var a;\na.b"
    it "compile a . b", ->
      expect(compile('var a; (a . b)')).to.have.string "var a;\na.b"

    it "compile a[1]", ->
      expect(compile('var a; a[1]')).to.have.string "var a;\na[1]"
    it "compile (a [1])", ->
      expect(-> compile('(a [1])')).to.throw /expect /
    it "compile a[1][2]", ->
      expect(compile('var a; a[1][2]')).to.have.string "var a;\na[1][2]"
    it """compile require.extensions[".tj"]""", ->
      expect(compile('require.extensions[".tj"]')).to.have.string "require.extensions[\".tj\"]"

  describe "call: ", ->
    it "compile a()", ->
      expect(compile('var a; a()')).to.have.string "var a;\na()"
    it "compile a(1)", ->
      expect(compile('var a; a(1)')).to.have.string "var a;\na(1)"
    it "parse a(1 , 2)", ->
      expect(str parse('a(1 , 2)')).to.have.string '[binary! concat() a [() [1 2]]]'
    it "compile a(1 , 2, 3)", ->
      expect(compile('var a; a(1 , 2, 3)')).to.have.string 'var a;\na(1, 2, 3)'
    it "compile a(1 , 2)", ->
      expect(compile('var a; a(1 , 2)')).to.have.string "var a;\na(1, 2)"
    it "compile a.b(1)", ->
      expect(compile('var a; a.b(1)')).to.have.string "var a;\na.b(1)"
    it "compile a['b'](1)", ->
      expect(compile("var a; a['b'](1)")).to.have.string  'var a;\na[\'b\'](1)'

  describe "unquote: ", ->
    it "compile ^a", ->
      expect(-> compile('^a')).to.throw /unexpected /
    it "compile ^&a", ->
      expect(-> compile('^&a')).to.throw /unexpected /
    it "compile ^& a", ->
      expect(-> compile('^& a')).to.throw /unexpected /

  describe "comma expression", ->
    it "compile 1 , 2", ->
      expect(compile('1 , 2')).to.have.string "2"
    it "compile 1 , 2 , 3", ->
      expect(compile('1 , 2 , 3')).to.have.string "3"

  describe "assign and right assocciation ", ->
    it "compile a=1", ->
      expect(compile('a=1')).to.have.string 'var a;\na = 1;\na'

    it "compile a = 1", ->
      expect(str parse ('a = 1')).to.have.string '[= a 1]'
      expect(compile('a = 1')).to.have.string 'var a;\na = 1;\na'

    it "compile a = b = 1", ->
      expect(compile('a = b = 1')).to.have.string 'var a;\nvar b;\nb = 1;\na = b;\na'