{isArray, error, entity, begin, undefinedExp, pushExp, identifierCharSet} = require '../utils'
{convertList, convert} = require '../compiler'

{binaryConverters} = require './core'

ellipsisIndex = (kind, list, start, stop, env) ->
  if start==undefined then start = 0
  if kind=='...'
    if stop==undefined then ['call!', ['attribute!', list, 'slice'], [start]]
    else ['call!', ['attribute!', list, 'slice'], [start, stop]]
  else # if kind=='..'
    if stop==undefined then ['call!', ['attribute!', list, 'slice'], [start]]
    else ['call!', ['attribute!', list, 'slice'], [start, ['+', stop, 1]]]

exports['index!'] = (exp, env) ->
  exp1 = exp[1]; exp10 = entity(exp1[0])
  if Object::toString.call(exp1) == '[object Array]'
    if exp10=='...' or exp10=='..'
      return convert ellipsisIndex(exp10, exp[0], exp1[1], exp1[2]), env
    else if exp10=='x...'
      return convert ellipsisIndex('...', exp[0], exp1[1], undefined), env
    else if exp10=='...x'
      return convert ellipsisIndex('...', exp[0], undefined, exp1[1]), env
    else if exp10=='..x'
      return convert ellipsisIndex('..', exp[0], undefined, exp1[1]), env
    else return ['index!', convert(exp[0], env), convert exp[1], env]
  else if (eExp1=entity(exp1))=='..'or eExp1=='...'
    return  convert ['call!', ['attribute!', exp[0], 'slice'], []], env
  ['index!', convert(exp[0], env), convert exp[1], env]

exports['::'] = ['attribute!', 'this', 'prototype']

exports['attribute!'] = (exp, env) ->
  obj = convert(exp[0], env)
  if (attr=entity(exp[1]))=='::' then return ['attribute!', obj, 'prototype']
  nonJs = false
  for c in attr
    if not identifierCharSet[c] then nonJs = true; break
  if nonJs then ['index!', obj, '"'+attr+'"']
  else ['attribute!', obj, attr]

call = (caller) -> (exp, env) -> convert ['call!', caller, exp], env

idBinaryConvert = (op, left, right, env) -> ['binary!', op, convert(left, env), convert(right, env)]

binary = (symbol) -> (exp, env) -> ['binary!', symbol].concat convertList exp, env
for symbol in '+ - * / && || << >> >>> != !== > < >= <='.split(' ')
  exports[symbol] = binary symbol
  binaryConverters[symbol] = idBinaryConvert

# learn coffee-script
exports['=='] = binary '==='
exports['!='] = binary '!=='
# less used, more danger operation need more typing
exports['==='] = binary '=='
exports['!=='] = binary '!='

exports['and'] = binary '&&'
exports['or'] = binary '||'
exports['binary,'] = binary ','
for symbol in '+ -'.split ' '
  do (symbol=symbol) ->
    exports[symbol] = (exp, env) ->
      if exp.length==2 then ['binary!', symbol].concat convertList exp, env
      else ['prefix!', symbol].concat convert exp[0], env
#augmentAssign = (symbol) -> (exp, env) -> ['augmentAssign', symbol].concat convertList exp, env
for symbol in '+ - * / && || << >> >>> ,'.split(' ') then exports[symbol+'='] = binary symbol+'='
exports['instanceof'] = binary 'instanceof'

prefix = (symbol) -> (exp, env) -> ['prefix!', symbol, convert exp[0], env]
for symbol in '++x --x yield new typeof void !x ~x +x -x'.split(' ')
  if symbol[symbol.length-1]=='x' then exports[symbol] = prefix symbol[...symbol.length-1]
  else exports[symbol] = prefix symbol
exports['not'] = prefix '!'

suffix = (symbol) -> (exp, env) -> ['suffix!', symbol, convert exp[0], env]
for symbol in 'x++ x--'.split(' ')
  if symbol[0]=='x' then exports[symbol] = suffix symbol[1...]
  else exports[symbol] = suffix symbol

exports['!!x'] = (exp, env) -> ['prefix!', '!', ['prefix!', '!', convert(exp[0], env)]]

exports['print'] = call ['attribute!', 'console', 'log']

exports['jsvar!'] = (exp, env) ->
  env.set(entity(exp[0]), entity(exp[0]))
  ['jsvar!', exp[0]]

exports['return'] = (exp, env) -> ['return', convert(exp[0], env)]

# javascript
do -> for sym in 'undefined null true false this console Math Object Array'.split ' ' then exports[sym] = ['jsvar!', sym]
# javascript in browser
do -> for sym in 'window'.split ' ' then exports[sym] = ['jsvar!', sym]
# node.js
do -> for sym in 'require module exports process'.split ' ' then exports[sym] = ['jsvar!', sym]

exports['__$taiji_$_$parser__'] = ['jsvar!', '__$taiji_$_$parser__']

exports['@'] =  ['jsvar!', 'this']
exports['arguments'] =  ['jsvar!', 'arguments']
#exports['__slice'] =  ['jsvar!', '__slice']
#exports['__hasProp'] =  ['jsvar!', '__hasProp']

exports['regexp!'] = (exp, env) -> ['regexp!', exp[0]]
exports['eval'] = ['jsvar!', 'eval']

# node module variable
exports['__filename'] = ['jsvar!', '__filename']
exports['__dir'] = ['jsvar!', '__dir']

exports["string!"] = convertInterpolatedString = (exp, env)->
  result = ['string!']
  piece = '""'
  for e in exp
    if Object.prototype.toString.call(e) == '[object Array]'
      x = convert(e, env)
    else
      e0 = entity(e)
      if typeof e0=='string' and e0[0]=='"' then x = e0
      else x = convert(e, env)
    if typeof x =='string' and x[0]=='"' then piece = piece[...piece.length-1] + x[1...]
    else
      if piece!='""' then result.push piece; piece = '""'
      if Object.prototype.toString.call(x) == '[object Array]'
        if x[0]=='string!' then result.push.apply result, x[1...]
        else result.push x
      else result.push x
  if piece!='""' then result.push piece
  if result.length==1 then return '""'
  else if result.length==2 and typeof result[1]=='string' and result[1][0]=='"' then return result[1]
  else return result

exports["hash!"] = convertHash = (exp, env) ->
  jsHashItems = []; pyHashItems = []
  for e in exp
    if e[0]=='jshashitem!' then jsHashItems.push ['hashitem!', e[1], convert(e[2], env)]
    else pyHashItems.push [convert(e[1], env), convert(e[2], env)]
  if pyHashItems.length==0 then return ['hash!', jsHashItems]
  result= ['begin!', ['var', v=env.newVar('hash')], ['=', v, ['hash!', jsHashItems]]]
  for e in pyHashItems then result.push ['=', ['index!', v, e[0]], e[1]]
  result.push v
  result

convertForInOf = (head) ->

exports['forOf!!'] = (exp, env) ->
  [key, value, obj, body] = exp
  if key[0]!='metaConvertVar!' and not env.hasFnLocal(key.value)
    env.set(key.value, key); key1 = ['var', key]
  else key1 = convert(key, env)
  vObj = env.newVar('obj')
  env.set(vObj.symbol, vObj)
  result =[['direct!', ['var', vObj]], ['=', vObj, obj]]
  result.push ['=', value, ['index!', vObj, key]]
  body = begin(result.concat(body))
  ['jsForIn!', key1, convert(vObj, env), convert(body, env)]

exports['forOf!'] = (exp, env) ->
  [key, obj, body] = exp
  if key[0]!='metaConvertVar!' and not env.hasFnLocal(key.value)
    env.set(key.value, key); key = ['var', key]
  else key = convert(key, env)
  ['jsForIn!', key, convert(obj, env), convert(body, env)]

exports['forIn!!'] = (exp, env) ->
  [item, index, range, body] = exp
  result = []
  vRange = env.newVar('range')
  result.push ['direct!', ['var', vRange]]
  env.set(vRange.symbol, vRange)
  result.push ['=', vRange, range]
  length = env.newVar('length')
  result.push ['direct!', ['var', length]]
  length = env.newVar('length')
  result.push ['=', length, ['attribute!', vRange, 'length']]
  result.push ['=', index, 0]
  result.push ['while', ['<', index, length], begin([['=', item, ['index!', vRange, ['x++', index]]], body])]
  convert begin(result), env

exports['forIn!'] = (exp, env) ->
  [item, range, body] = exp
  result = []
  vRange = env.newVar('range')
  result.push ['direct!', ['var', vRange]]
  env.set(vRange.symbol, vRange)
  result.push ['=', vRange, range]
  length = env.newVar('length')
  env.set(length.symbol, length)
  result.push ['direct!', ['var', length]]
  result.push ['=', length, ['attribute!', vRange, 'length']]
  i = env.newVar('i')
  result.push ['direct!', ['var', i]]
  env.set(i.symbol, i)
  result.push ['=', i, 0]
  result.push ['while', ['<', i, length], begin([['=', item, ['index!', vRange, ['x++', i]]], body])]
  convert begin(result), env

# caller.call(this, args)
exports['callByThis!'] = (exp, env) ->
  [caller, args] = exp
  convert(['call!', ['attribute!', caller, 'call'], ['this'].concat(args)], env)

ellipsisStopOp = {'...':'<', '..': '<='}

convertEllipsisRange = (kind) -> (exp, env) ->
  [start, stop] = exp
  result = []
  list = env.newVar('list')
  result.push ['direct!', ['var', list]]
  env.set(list.symbol, list)
  result.push ['=', list, []]
  vStop = env.newVar('stop')
  result.push ['direct!', ['var', vStop]]
  env.set(vStop.symbol, vStop)
  result.push ['=', vStop, stop]
  i = env.newVar('i')
  result.push ['direct!', ['var', i]]
  env.set(i.symbol, i)
  result.push ['=', i, start]
  result.push ['while', [ellipsisStopOp[kind], i, vStop], begin([pushExp(list, ['x++', i])])]
  result.push(list)
  convert begin(result), env

exports['..'] = convertEllipsisRange('..')
exports['...'] = convertEllipsisRange('...')

