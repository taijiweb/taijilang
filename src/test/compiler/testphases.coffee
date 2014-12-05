{expect, idescribe, ndescribe, iit, nit, strConvert, str, parse, norm} = require '../util'

lib = '../../lib/'

{transformExpression, transform, ShiftStatementInfo} =  require lib+'compiler/transform'
{tocode} =  require lib+'compiler/code'

{trace} = require lib+'utils'
{VALUE, SYMBOL, LIST} = require lib+'constant'

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
      it "convert [if, 1, 1]", ->
        expect(strConvert(['if', 1, 1])).to.equal "[if 1 1 undefined]"
      it "convert [if, 1, 1, 2]", ->
        expect(strConvert(['if', 1, 1, 2])).to.equal "[if 1 1 2]"

    describe "convert binary!", ->
      it "convert ['binary!', '+', 1, 2]", ->
        expect(strConvert(['binary!', '+', 1, 2])).to.equal '[binary! + 1 2]'

    describe "convert clause", ->
      it "convert ['@', 'a']", ->
        expect(strConvert(['begin!', ['var', 'a'], ['@', 'a']])).to.equal "[begin! [var a] [call! [jsvar! this] [a]]]"

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
    transformExp = (exp) ->
      env = taiji.initEnv(taiji.builtins, taiji.rootModule, {})
      info = new ShiftStatementInfo({}, {})
      result = transformExpression(norm(exp), env, info)

    it "[string! 'a']", ->
      result = transformExp(['string!', 'a'])
      expect(str result[1]).to.equal '[call! [attribute! [jsvar! JSON] stringify] [a]]'

    it "[return 'a']", ->
      result = transformExp(['return', 'a'])
      expect(str result[0]).to.equal "[return a]"
#      expect(info.affectVars['a']).to.equal(undefined)
#      expect(info.shiftVars['a']).to.equal(true)
    it "['binary!', '+', 1, ['return', 'a']]", ->
      env = taiji.initEnv(taiji.builtins, taiji.rootModule, {})
      info = new ShiftStatementInfo({}, {})
      result = transformExp(['binary!', '+', 1, ['return', 'a']])
      expect(str result[0]).to.equal "[return a]"
      expect(str result[1]).to.equal "[binary! + 1 undefined]"

    it "['binary!', '+', 'a', ['return', ['=', 'a', 1]]]", ->
      result = transformExp(['binary!', '+', 'a', ['return', ['=', 'a', 1]]])
      expect(str result[0]).to.equal "[begin! [var t] [= t a] [return [= a 1]]]"
      expect(str result[1]).to.equal "[binary! + t undefined]"

    it "['binary!', '+', 'a', ['return', ['=', 'b', 1]]]", ->
      result = transformExp(['binary!', '+', 'a', ['return', ['=', 'b', 1]]])
      expect(str result[0]).to.equal "[begin! [var t] [= t a] [return [= b 1]]]"
      expect(str result[1]).to.equal "[binary! + t undefined]"

    it "['binary!', '+', ['=', 'a', 1], ['return', 'a']]", ->
      result = transformExp(['binary!', '+', ['=', 'a', 1], ['return', 'a']])
      expect(str result[0]).to.equal "[begin! [var t] [= t [= a 1]] [return a]]"
      expect(str result[1]).to.equal "[binary! + t undefined]"


  describe "parse, convert and transform: ",  ->
    parseTransform = (text) ->
      trace '\r\n\r\nparseTransform: ', text
      exp = parse(text)
      exp = exp.value[3].value[1] # cut wrap layer: module!, moduleBody!
      env = taiji.initEnv(taiji.builtins, taiji.rootModule, {})
      exp = convert(exp, env)
      exp = transform(exp, env)

    it "var a", ->
      expect(str parseTransform("var a")).to.equal '[begin! [var a] undefined]'

    it '"a(1)"', ->
      expect(str parseTransform('"a(1)"')).to.equal "[binary! + \"a\" 1]"

    it "var a; a+{return a}", ->
      expect(str parseTransform("var a; a+{return a}")).to.equal "[begin! [var a] [var t] [= t a] [return a]]"

    it "var a, b; (b=a)+{return a}", ->
      expect(str parseTransform("var a, b; (b=a)+{return a}")).to.equal "[begin! [var a] [var b] [var t] [= t [= b a]] [return a]]"

    it "-> 1", ->
      expect(str parseTransform("-> 1")).to.equal "[function [] [return 1]]"

    it "var a; a = -> 1", ->
      expect(str parseTransform("var a; a = -> 1")).to.equal "[begin! [var a] [= a [function [] [return 1]]]]"

    it "var a; a[1] = -> 1", ->
      expect(str parseTransform("var a; a[1] = -> 1")).to.equal "[begin! [var a] [var t] [= t [function [] [return 1]]] [= [index! a 1] t] t]"

  describe "generate tocode: ",  ->
    it "1", ->
      expect(tocode(norm 1)).to.equal "1"

    it "['binary!', '+', 1, 2]", ->
      expect(tocode(norm ['binary!', '+', 1, 2])).to.equal "1 + 2"

    it "['binary!', '+', 1, ['binary!', '+', 2, 3]]", ->
      expect(tocode(norm ['binary!', '+', 1, ['binary!', '+', 2, 3]])).to.equal "1 + (2 + 3)"

    it "['binary!', '*', ['binary!', '+', 1, 2], 3]", ->
      expect(tocode(norm ['binary!', '*', ['binary!', '+', 1, 2], 3])).to.equal "(1 + 2) * 3"

    it "['binary!', '+', ['binary!', '+', 1, 2], 3]", ->
      expect(tocode(norm ['binary!', '+', ['binary!', '+', 1, 2], 3])).to.equal "1 + 2 + 3"

    it "['list!', 1, 2]", ->
      expect(tocode(norm ['list!', 1, 2])).to.equal "[1, 2]"

    it "['if', 1, 2, 3]", ->
      expect(tocode(norm ['if', 1, 2, 3])).to.equal "if (1) {\n  2\n} else {\n  3\n}"

    it "['begin!', 1, 2, 3]", ->
      expect(tocode(norm ['begin!', 1, 2, 3])).to.equal "1;\n2;\n3"

    it "['function', [], 1", ->
      expect(tocode(norm ['function', [], 1])).to.equal "function () {\n  1\n}"

    it "['function', ['a'], 1]", ->
      expect(tocode(norm ['function', ['a'], 1])).to.equal "function (a) {\n  1\n}"

    it "['function', ['a'], ['begin!', 1, 2]]", ->
      expect(tocode(norm ['function', ['a'], ['begin!', 1, 2]])).to.equal "function (a) {\n  1;\n  2\n}"