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

ndescribe "compiler basic: ",  ->
  describe "compile value: ",  ->
    it "compile 1", ->
      expect(compile('1')).to.have.string "1"
    it "compile 01", ->
      expect(compile('01')).to.have.string '1'
    it "compile 0x01", ->
      expect(compile('0x01')).to.have.string '1'
    it "compile 0xa", ->
      expect(compile('0xa')).to.have.string '0xa'
    it "compile a", ->
        expect(compile('"a"')).to.have.string "\"a\""

  describe "parenthesis: ",  ->
    it 'should compile ()', ->
      expect(compile('()')).to.have.string ''
    it 'should compile (a)', ->
      expect(compile('var a; (a)')).to.have.string 'var a;\na'
    it 'should compile (a,b)', ->
      expect(compile('var a; var b; (a,b)')).to.have.string 'var a;\nvar b;\n[a, b]'
    it 'should compile (1,2)', ->
      expect(compile('(1,2)')).to.have.string '[1, 2]'

  ndescribe "quote expression:", ->
    describe "quote expression:", ->
      it 'should compile ~ a.b', ->
        expect(compile('~ a.b')).to.have.string "[\"attribute!\",\"a\",\"b\"]"
      it 'should compile ~ print a b', ->
        expect(compile('~ print a b')).to.have.string "[\"print\",\"a\",\"b\"]"
      it 'should compile ` print a b', ->
        expect(compile('` print a b')).to.have.string "[\"print\", \"a\", \"b\"]"
      it 'should compile ~ print : min a \n abs b', ->
        expect(compile('~ print : min a \n abs b')).to.have.string "[\"print\",[\"min\",\"a\",[\"abs\",\"b\"]]]"
      it 'should compile ` a.b', ->
        expect(compile('` a.b')).to.have.string "[\"attribute!\", \"a\", \"b\"]"

  ndescribe "unquote expression:", ->
    describe "unquote expression: ", ->
      it 'should compile ` ^ a.b', ->
        expect(compile('var a; ` ^ a.b')).to.have.string 'var a;\na.b'
      it 'should compile ` ^ [print a b]', ->
        expect(compile('var a, b; ` ^ [print a b]')).to.have.string "var a, b;\n[console.log(a, b)]"
      it 'should compile ` ^ {print a b}', ->
        expect(compile('var a, b; ` ^ {print a b}')).to.have.string "var a, b;\nconsole.log(a, b)"
      it 'should compile ` ^ print a b', ->
        expect(compile('var a, b; ` ^ print a b')).to.have.string "var a, b;\nconsole.log(a, b)"
      it 'should compile ` ^.~print a b', ->
        expect(compile('` ^.~print a b')).to.have.string "[\"print\", \"a\", \"b\"]"

    ndescribe "unquote-splice expression: ", ->
      it 'should compile `  ^& a.b', ->
        expect(compile('var a; ` ^& a.b')).to.have.string "var a;\na.b"
      it 'should compile `  ^&a.b', ->
        expect(compile('var a; ` ^&a.b')).to.have.string "var a;\na.b"
      it 'should compile ` ( ^&a).b', ->
        expect(compile('var a; ` ( ^&a).b')).to.have.string "var a;\n[\"attribute!\"].concat(a).concat([\"b\"])"
      it 'should compile ` ^@ [print a b]', ->
        expect(compile('var a, b; ` ^& [print a b]')).to.have.string "var a, b;\n[console.log(a, b)]"
      it 'should compile ` ^@ {print a b}', ->
        expect(compile('var a, b; ` ^& {print a b}')).to.have.string "var a, b;\nconsole.log(a, b)"
      it 'should compile ` ^ print a b', ->
        expect(compile('var a, b; ` ^ [print a b]')).to.have.string "var a, b;\n[console.log(a, b)]"
      it 'should compile ` ^ print a b', ->
        expect(compile('var a, b; ` ^ {print a b}')).to.have.string "var a, b;\nconsole.log(a, b)"
