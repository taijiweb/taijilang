{expect, idescribe, ndescribe, iit, nit, strConvert, str} = require '../utils'

lib = '../../lib/'

{constant} = require lib+'utils'
{VALUE, SYMBOL, LIST} = constant

{convert, metaConvert} = require lib+'compiler'
{SymbolLookupError} = require lib+'compiler/env'
taiji = require lib+'taiji'
env = taiji.initEnv(taiji.builtins, taiji.rootModule, {})

# is head a operator for meta expression?
isMetaOperation = isMetaOperation = (head) -> (head[0]=='#' and head[1]!='-') or head=='include!' or head=='import!' or head=='export!'

makeExpression = (exp) ->
  if exp instanceof Array
    exp = for e in exp then makeExpression(e)
    exp.kind = LIST
    exp
  else if typeof exp == 'string'
    if exp[0]=='"' then {value:exp, kind:VALUE}
    else
      if isMetaOperation(exp) then {value:exp, kind:SYMBOL, meta:true}
      else {value:exp, kind:SYMBOL}
  else if typeof exp =='object' then exp
  else {value:exp, kind:VALUE}

strConvert = (exp) ->
  exp = makeExpression exp
  exp = convert exp, env
  str exp

strMetaConvert = (exp) ->
  exp = makeExpression exp
  exp = metaConvert exp, metaExpList=[], env
  str exp

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
      expect(strMetaConvert(1)).to.equal '1'