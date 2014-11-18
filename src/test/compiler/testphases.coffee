{expect, idescribe, ndescribe, iit, nit, strConvert, str, parse} = require '../util'

lib = '../../lib/'

{Parser} = require lib+'parser'
{transformExpression, transform, ShiftStatementInfo} =  require lib+'compiler/transform'

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

ndescribe "test phases: ",  ->
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
        expect(strConvert(['if', 1, [1]])).to.equal "[if 1 [1] undefined]"
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
    it "return 'a'", ->
      env = taiji.initEnv(taiji.builtins, taiji.rootModule, {})
      info = new ShiftStatementInfo({}, {})
      result = transformExpression(norm(['return', 'a']), env, info)
      expect(str result[0]).to.equal "[return a]"
#      expect(info.affectVars['a']).to.equal(undefined)
#      expect(info.shiftVars['a']).to.equal(true)
    it "['binary!', '+', 1, ['return', 'a']]", ->
      env = taiji.initEnv(taiji.builtins, taiji.rootModule, {})
      info = new ShiftStatementInfo({}, {})
      result = transformExpression(norm(['binary!', '+', 1, ['return', 'a']]), env, info)
      expect(str result[0]).to.equal "[return a]"
      expect(str result[1]).to.equal "[binary! + 1 undefined]"

    it "['binary!', '+', 'a', ['return', ['=', 'a', 1]]]", ->
      env = taiji.initEnv(taiji.builtins, taiji.rootModule, {})
      info = new ShiftStatementInfo({}, {})
      result = transformExpression(norm(['binary!', '+', 'a', ['return', ['=', 'a', 1]]]), env, info)
      expect(str result[0]).to.equal "[begin! [var t] [= t a] [return [= a 1]]]"
      expect(str result[1]).to.equal "[binary! + t undefined]"

    it "['binary!', '+', 'a', ['return', ['=', 'b', 1]]]", ->
      env = taiji.initEnv(taiji.builtins, taiji.rootModule, {})
      info = new ShiftStatementInfo({}, {})
      result = transformExpression(norm(['binary!', '+', 'a', ['return', ['=', 'b', 1]]]), env, info)
      expect(str result[0]).to.equal "[begin! [var t] [= t a] [return [= b 1]]]"
      expect(str result[1]).to.equal "[binary! + t undefined]"

    it "['binary!', '+', ['=', 'a', 1], ['return', 'a']]", ->
      env = taiji.initEnv(taiji.builtins, taiji.rootModule, {})
      info = new ShiftStatementInfo({}, {})
      result = transformExpression(norm(['binary!', '+', ['=', 'a', 1], ['return', 'a']]), env, info)
      expect(str result[0]).to.equal "[begin! [var t] [= t [= a 1]] [return a]]"
      expect(str result[1]).to.equal "[binary! + t undefined]"


  describe "parse, convert and transform: ",  ->
    parseTransform = (text) ->
      exp = parse(text)
      exp = exp[3][1] # cut wrap layer: module!, moduleBody!
      env = taiji.initEnv(taiji.builtins, taiji.rootModule, {})
      exp = convert(exp, env)
      exp = transform(exp, env)

    it "var a", ->
      expect(str parseTransform("var a")).to.equal '[begin! [var a] undefined]'

    it "var a; a+{return a}", ->
      expect(str parseTransform("var a; a+{return a}")).to.equal "[begin! [var a] [var t] [= t a] [return a]]"

    it "var a, b; (b=a)+{return a}", ->
      expect(str parseTransform("var a, b; (b=a)+{return a}")).to.equal "[begin! [var a] [var b] [var t] [= t [= b a]] [return a]]"
