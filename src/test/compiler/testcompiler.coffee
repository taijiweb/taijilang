{expect, idescribe, ndescribe, iit, nit, matchRule, parse, compile} = require '../util'

lib = '../../lib/'

{str} = require lib+'utils'
{Parser} = require lib+'parser'

taiji = require lib+'taiji'
{nonMetaCompileExpNoOptimize} = require lib+'compiler'

parse = (text) ->
  parser = new Parser()
  x = parser.parse(text, parser.module, 0)

# below is compile without metaConvert
# if comment the definiton below ,will use "compile" required from util, which is a full compile funciton
compile = noOptCompile = (text) ->
  exp = parse(text)
  env = taiji.initEnv(taiji.builtins, taiji.rootModule, {})
  exp = nonMetaCompileExpNoOptimize exp, env
  exp

describe "compile: ",  ->
  describe "if and if!: ",  ->
    it 'should compile if 1 then 2 else 3', ->
      expect(compile("if 1 then 2 else 3")).to.have.string "2"

  describe "for in: ",  ->
    iit '''should compile for x in [ 1, 2 ] then print x''', ->
      expect(compile('''for x in [ 1 2 ] then print x''')).to.have.string 'var range = [1, 2], \n    length = range.length, \n    i = 0;\n\nwhile (i < length){ \n  var x = range[i++];\n  console.log(x);\n}'
    it '''should compile for x j in [ 1, 2 ] then print x''', ->
      expect(compile('''for x j in [ 1 2 ] then print x''')).to.have.string 'var length, range = [1, 2], \n    length22 = range.length, \n    j = 0;\n\nwhile (j < length22){ \n  var x = range[j++];\n  console.log(x);\n}'

  describe "function: ",  ->
    it 'should compile -> 1', ->
      expect(compile('-> 1')).to.have.string 'function () {\n  return 1\n}'
    it 'should compile {-> 1}()', ->
      expect(compile('{-> 1}()')).to.have.string  'function () {\n  return 1\n}()'
    it 'should compile ->', ->
      expect(compile('->')).to.have.string 'function () {\n  return undefined\n}'