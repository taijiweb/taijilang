{expect, idescribe, ndescribe, iit, nit, strConvert, str} = require '../utils'

lib = '../../lib/'

{transformExpression, ShiftStatementInfo} =  require lib+'compiler/transform'

{constant, norm} = require lib+'utils'
{VALUE, SYMBOL, LIST} = constant

{convert, metaConvert, nonMetaCompileExpNoOptimize} = require lib+'compiler'
{SymbolLookupError} = require lib+'compiler/env'
taiji = require lib+'taiji'

strConvert = (exp) ->
  exp = norm exp
  env = taiji.initEnv(taiji.builtins, taiji.rootModule, {})
  env.metaIndex = 0
  exp = convert exp, env
  str exp

strMetaConvert = (exp) ->
  exp = norm exp
  env = taiji.initEnv(taiji.builtins, taiji.rootModule, {})
  env.metaIndex = 0
  exp = metaConvert exp, metaExpList=[], env
  str exp

strNonOptCompile = (exp) ->
  exp = norm exp
  env = taiji.initEnv(taiji.builtins, taiji.rootModule, {})
  exp = nonMetaCompileExpNoOptimize exp, env
  str exp

describe "test phases: ",  ->
  describe "convert: ",  ->
    describe "convert simple: ",  ->
      it "convert 1", ->
        expect(strConvert(1)).to.equal '1'
      it '''convert '"hello"' ''', ->
        expect(strConvert('"hello"')).to.equal "\"hello\""
      it '''convert 'x' ''', ->
        expect(-> strConvert('x')).to.throw SymbolLookupError

    describe "convert if: ",  ->
      it "convert [if, 1, [1]]", ->
        expect(strConvert(['if', 1, [1]])).to.equal "[if 1 [1]]"
      it "convert [if, 1, [1], [2]]", ->
        expect(strConvert(['if', 1, [1], [2]])).to.equal "[if 1 [1] [2]]"

    describe "convert binary!", ->
      it "convert ['binary!', '+', 1, 2]", ->
        expect(strConvert(['binary!', '+', 1, 2])).to.equal '[binary! + 1 2]'

  describe "meta convert: ",  ->
    describe "convert simple: ",  ->
      it "convert 1", ->
        expect(strMetaConvert(1)).to.equal "[index! [jsvar! __tjExp] 0]"

  describe "nonMetaCompileExpNoOptimize: ",  ->
    describe "copmile simple: ",  ->
      it "copmile 1", ->
        expect(strNonOptCompile(1)).to.equal "1"
      it """copmile '"1"' """, ->
        expect(strNonOptCompile('"1"')).to.equal "\"1\""
      it """copmile ['binary!', '+', 1, 2] """, ->
        expect(strNonOptCompile(['binary!', '+', 1, 2])).to.equal "1 + 2"

  describe "transformExpression: ",  ->
    iit "return 'a'", ->
      env = taiji.initEnv(taiji.builtins, taiji.rootModule, {})
      info = new ShiftStatementInfo({}, {})
      result = transformExpression(norm(['return', 'a']), env, info)
      expect(str result[0]).to.equal "[return a]"
      expect(info.affectVars['a']).to.equal(undefined)
      expect(info.shiftVars['a']).to.equal(true)
