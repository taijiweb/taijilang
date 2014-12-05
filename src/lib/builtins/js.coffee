{str, log, trace, begin, extend, splitSpace, undefinedExp, symbolOf, commaList, isArray, isSymbol, return_} = require '../utils'
{compileError} = require '../compiler/helper'

{convert, convertList} = require '../compiler'

exports['extern!'] = (exp, env) ->
  if env.hasLocal(v=symbolOf(exp[1]))
    error v+' has been declared as local variable, so it can not be declared as extern variable any more.', e
  env.set(v, exp[1])
  undefinedExp

# assure when transforming, only there exists ['var', variable]
exports['var'] = (exp, env) ->
  if isSymbol(exp[1])
    if env.hasLocal(sym=symbolOf(exp[1])) then error 'repeat declaring variable: '+str(e)
    return [exp[0], env.set(sym, exp[1])]
  else error 'only identifiers can be in var statement'

exports['newvar!'] = (exp, env) -> '"'+env.newVar((x=exp[1].value).slice(1, x.length-1)).symbol+'"'

convertAssign = (left, right, env) ->
  if isSymbol(left)
    leftValue = symbolOf(left)
    if env.hasLocal(leftValue)
      left = env.get(leftValue)
      if left.const then error 'should not assign value to const variable: '+leftValue
      if left.outer
        env.set(leftValue, left=env.newVar(leftValue))
        left.const = true # create const by default
        ['begin!', ['var', left], ['=', left, convert(right, env)], left]
      else ['=', left, convert(right, env)]
    else
      env.set(leftValue, left=env.newVar(leftValue))
      left.const = true # create const by default
      ['begin!', ['var', left], ['=', left, convert(right, env)], left]
  else
    # left is assignable expression list
    # we should convert the right side at first
    right = convert(right, env)
    ['=', convert(left, env), right]

# al assign in object language
exports['='] = (exp, env) -> convertAssign(exp[1], exp[2], env)

exports['begin!'] = (exp, env) -> begin(for e in exp[1...] then convert e, env)

exports['if'] = (exp, env) ->
  if exp[3]!=undefined
    [IF, convert(exp[1], env), convert(exp[2], env), convert(exp[3], env)]
  else [IF, convert(exp[1], env), convert(exp[2], env), undefinedExp]

exports['->'] = (exp, env) ->
  newEnv = env.extend(scope={}, env.parser, env.module, {})
  for param in exp[1] then scope[symbolOf(param)] = param
  body =  return_(convert(exp[2], newEnv))
  ['function', exp[1], body]

quasiquote = (exp, env, level) ->
  exp1 = exp[1]
  if not isArray(exp1) then return JSON.stringify entity(exp1)
  else if not exp1.length then return []
  if (head=entity exp1[0])=='unquote!' or head=='unquote-splice' then return convert(exp1[1], env, level-1)
  else if head=='quasiquote!' then return ['list!', '"quasiquote!"', quasiquote(exp1[1], env, level+1)]
  result = ['list!']
  meetSplice = false
  for e in exp1
    if isArray(e) and e.length
      head = entity(e[0])
      if head=='unquote-splice' and level==0
        result = ['call!', ['attribute!', result, 'concat'], [convert(e[1], env)]]
        meetSplice = true
      else if not meetSplice
        if head=='unquote-splice'
          result.push ['list!', '"unquote-splice"', quasiquote(e[1], env, level-1)]
        else if head=='unquote!'
          if level==0 then result.push convert(e[1], env)
          else result.push ['unquote!', quasiquote(e[1], env, level-1)]
        else if head=='quasiquote!' then result.push ['list!',  '"quasiquote!"', quasiquote(e[1], env, level+1)]
        else result.push quasiquote([e], env, level)
      else
        if head=='unquote-splice'
          item = [['list!', quasiquote(e[1], env, level-1)]]
        else
          if head=='unquote!'
            if level==0 then item = [['list!', convert(e[1], env)]]
            else item = [['list!', ['"unquote!"', quasiquote(e[1], env, level-1)]]]
          else if head=='quasiquote!' then item = [['list!', ['quasiquote!', quasiquote(e[1], env, level+1)]]]
          else item = [['list!', [quasiquote(e, env, level)]]]
        result = ['call!', ['attribute', result, 'concat'], item]
    else
      if not meetSplice then result.push JSON.stringify entity e
      else result = ['call!', ['attribute!', result, 'concat'], [['list!', JSON.stringify entity e]]]
  result

exports['{}'] = (exp, env) -> convert begin(exp[1]), env

exports['()'] = (exp, env) ->
  if exp[1].length==1 then convert exp[1][0], env
  else ['list!'].concat(convertList(exp[1], env))

exports['[]'] = (exp, env) -> ['list!'].concat(convertList(exp[1], env))

exports['~'] = (exp, env) -> ['quote!', exp[1]]

exports['prefix!'] = (exp, env) -> prefixConverters[exp[1].value](exp, env)

exports.prefixConverters = prefixConverters = {}

exports['^'] = prefixConverters['^'] = (exp, env) -> compileError('unexpected ^', exp)
exports['^&'] = prefixConverters['^&'] = (exp, env) -> compileError('unexpected ^&', exp)
exports['`'] = (exp, env) -> quasiquote(exp, env, 0)

for symbol in '++ -- yield new typeof void ! ~ + -'.split(' ')
  prefixConverters[symbol] = (exp, env) ->  ['prefix!', exp[1], convert exp[2], env]

exports['x++'] = (exp, env) ->
  if isArray(exp[1]) and symbolOf(exp[1][0])=='attribute!'
    t = env.newVar('t'); obj =  exp[1][1]; left =  ['attribute!', t, exp[1][2]];
    ['begin!', ['var', t], ['=', t, obj], ['=', left, ['binary!', '+', left, 1]]]
  else if isSymbol(exp[1]) then convert(['=', exp[1], ['binary!', '+', exp[1], 1]])

exports['binary!'] = (exp, env, compiler) -> binaryConverters[exp[1].value](exp, env)

exports.binaryConverters = binaryConverters = {}

binaryConverters['='] = (exp, env) -> convertAssign(exp[2], exp[3], env)

#['binary! concat[] obj [[] subscript]
# todo a[x], a[x, y]
binaryConverters['concat[]'] = (exp, env, compiler) ->
  trace("binaryConverters('concat[]'):", str(exp))
  subscript = exp[3][1]
  if subscript.length!=1 then compileError exp, 'the length of subscript should be 1'
  ['index!', convert(exp[2], env), convert(subscript[0], env)]

## todo: a(1), a(1, 2), need to be refined.
binaryConverters['concat()'] = (exp, env) -> ['call!', convert(exp[2], env), convertList(exp[3][1], env)]

for symbol in '+ - * / && || << >> >>> == === != !== > < >= <= instanceof'.split(' ')
  binaryConverters[symbol] = (exp, env) -> [exp[0], exp[1], convert(exp[2], env), convert(exp[3], env)]
  exports[symbol] = (exp, env) -> ['binary!', exp[0], convert(exp[1], env), convert(exp[2], env)]

binaryConverters[','] = (exp, env) -> ['list!'].concat(convertList(commaList(exp), env))
binaryConverters['.'] = (exp, env) -> ['attribute!', convert(exp[2], env), exp[3]]
exports['attribute!'] = (exp, env) -> ['attribute!', convert(exp[1], env), exp[2]]
exports['index!'] = (exp, env) -> ['index!', convert(exp[1], env), convert(exp[2], env)]


exports['forOf!'] = (exp, env) -> ['jsForIn!', convert(exp[1], env), convert(exp[2], env), convert(exp[3], env)]

#exports['forIn!'] = (exp, env) ->
#  log str exp
#  item = exp[1]; range = exp[2]; body = exp[3]
#  result = []
#  vRange = env.newVar('range')
#  result.push ['direct!', ['var', vRange]]
#  env.set(vRange.symbol, vRange)
#  result.push ['=', vRange, range]
#  length = env.newVar('length')
#  env.set(length.symbol, length)
#  result.push ['direct!', ['var', length]]
#  result.push ['=', length, ['attribute!', vRange, 'length']]
#  i = env.newVar('i')
#  result.push ['direct!', ['var', i]]
#  env.set(i.symbol, i)
#  result.push ['=', i, 0]
#  result.push ['while', ['<', i, length], begin([['=', item, ['index!', vRange, ['x++', i]]], body])]
#  convert begin(result), env

exports['forIn!'] = (exp, env) ->
  log str exp
  item = exp[1]; index = exp[2]; range = exp[3]; body = exp[4]
  result = []
  vRange = env.newVar('range')
  result.push ['direct!', ['var', vRange]]
  env.set(vRange.value, vRange)
  result.push ['=', vRange, range]
  if not index
    index = env.newVar('i')
    result.push ['direct!', ['var', index]]
  length = env.newVar('length')
  result.push ['direct!', ['var', length]]
  result.push ['=', length, ['attribute!', vRange, 'length']]
  result.push ['=', index, 0]
  result.push ['while', ['<', index, length], begin([['=', item, ['index!', vRange, ['x++', index]]], body])]
  convert begin(result), env

do -> for sym, i in splitSpace 'throw return if while try return list!'
  exports[sym] = (exp, env) -> [exp[0]].concat(convertList(exp[1...], env))

do -> for word in splitSpace 'break continue' then exports[word] = (exp, env) -> exp

do -> for sym in 'undefined null true false this console Math Object Array arguments eval require module exports'.split ' ' then exports[sym] = ['jsvar!', sym]

exports['direct!'] = (exp, env) -> exp[1]
exports['print'] = (exp, env) -> ['call!', ['attribute!', 'console', 'log'], convertList(exp[1], env)]