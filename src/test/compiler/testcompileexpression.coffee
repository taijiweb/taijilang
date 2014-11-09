{expect, idescribe, ndescribe, iit, nit} = require '../utils'

lib = '../../lib/'
{Environment, textizerOptions, builtins, initEnv, rootModule} = require lib+'taiji'
{compileExp, compileExpNoOptimize} = compiler = require lib+'compiler'
{extend} =  require lib+'utils'

compile = (exp) -> compileExp(exp, initEnv(builtins, rootModule, {}))
compileNoOptimize = (code) -> compileExpNoOptimize(exp, initEnv(builtins, rootModule, {}))

transform = (exp) ->
  compiler.transform(exp,  initEnv(builtins, rootModule, {}))

ndescribe "compile expression: ",  ->
  describe "simple: ",  ->
    it 'should compile 1', ->
      expect(compile(1)).to.equal '1'
    it '''should compile [',', ['=', 'x',1], []]]''', ->
      expect(compile(['binary,', ['=', 'x',1], []])).to.equal "var x = 1;\nx, [];"
    it '''should compile ['binary,', 1, []]''', ->
      expect(compile(['binary,', 1, []])).to.equal "1, []"
