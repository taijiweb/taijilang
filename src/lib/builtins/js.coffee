{isArray, error, entity, begin, undefinedExp} = require '../utils'
{convertList, convert} = require '../compiler'

exports['index!'] = (exp, env) -> ['index!', convert(exp[0], env), convert exp[1], env]

exports['::'] = ['attribute!', 'this', 'prototype']

exports['attribute!'] = (exp, env) ->
  obj = convert(exp[0], env)
  if entity(exp[1])=='::' then return ['attribute!', obj, 'prototype']
  ['attribute!', obj, exp[1]]

call = (caller) -> (exp, env) -> convert ['call!', caller, exp], env

binary = (symbol) -> (exp, env) -> ['binary!', symbol].concat convertList exp, env
for symbol in '+ - * / && || << >> >>> != !== > < >= <='.split(' ') then exports[symbol] = binary symbol
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
exports['__slice'] =  ['jsvar!', '__slice']
exports['__hasProp'] =  ['jsvar!', '__hasProp']

exports['regexp!'] = (exp, env) -> ['regexp!', exp[0]]

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

convertForInOf = (head) -> (exp, env) ->
  [item, range, body] = exp
  if not env.hasFnLocal(item.value) then env.set(item.value, item); item = ['var', item]
  else item = convert(item, env)
  [head, item, convert(range, env), convert(body, env)]

exports['forIn!'] = convertForInOf('forIn!')
exports['forOf!'] = convertForInOf('forOf!')

exports['forIn!!'] = (exp, env) ->
  [item, index, range, body] = exp
  if not index
    convert ['forIn!', item, range, body], env
  else
    result = []
    result.push ['var', index]
    t = env.ssaVar('t')
    result.push ['=', index, 0]
    result.push ['forIn!', item, range, ['begin!', ['=', t, body], ['x++', index], t]]
    begin(result)


