{str, entity, isValue, isArray, extend, error, wrapInfo1} = require '../utils'

truth = (exp, env) ->
  exp = entity(exp)
  if not exp? then return 2-!!exp
  if typeof exp == 'string'
    if exp[0]=='"' then return 2-!!exp[1...exp.length-1]
    else return
  else if exp.push then return
  return 2-!!exp

setValue = (x) ->
  if x==undefined then undefinedExp
  else if typeof x == 'string' then '"'+x+'"'
  else x

#todo: maybe this utility can be deprecated, because we can eval(tocode(exp))
getValue = (x) -> entity(x)

analyzeForInOfExpression = (exp, env) ->
  lst = env.newVar('list')
  [rangeStmt, rangeValue] = transformExpression(exp[2], env)
  [bodyStmt, bodyValue] = transformExpression(exp[3], env)
  forInStmt = [exp[0], exp[1], rangeValue,
               begin([bodyStmt, pushExp(lst, bodyValue)])]
  [begin([['var', lst], rangeStmt, forInStmt]), lst]

analyzeFnMap =
  '=': (exp, env) ->
    left = exp[1]
    eLeft = entity(left)
    if typeof eLeft=='string'
      if left.refCount==0 then exp.removable = true
      if left.const and isAtomicValue(exp[2]) then exp.removable = true
    exp

  'prefix!': (exp, env) ->
    analyze(exp[2], env)
    exp

  'suffix!': (exp, env) ->
    analyze(exp[2], env)
    exp

  'binary!': (exp, env) ->
    analyze(exp[2], env); analyze(exp[3], env)
    exp

  'begin!': (exp, env) ->
    exp = for e in exp[1...] then analyze(e, env)
    result =[]
    if exp.length==0 then return undefined
    for e in exp[...exp.length-1]
      if isValue(e) then continue
      else if (x=entity(e)) and typeof x=='string' then continue
      else result.push e
    result.push exp[exp.length-1]
    if result.length==0 then return undefined
    else if result.length==1 then result[0]
    else result.unshift 'begin!'; result

  'if': (exp, env) ->
    if x=truth(test=analyze(exp[1], env)) then analyze(exp[x+1], env)
    else ['if', test, analyze(exp[2], env), analyze(exp[3], env)]

  'while': (exp, env) ->
    test = analyze(exp[1], env); body = analyze(exp[2], env)
    if truth(test)!=2 then ['while', test, body]

  'doWhile!': (exp, env) ->
    test = analyze(exp[2], env); body = analyze(exp[1], env)
    if truth(test)==2 then body else ['doWhile!', body, test]

exports.analyze = analyze = (exp, env) ->
  e = entity exp
  if not e then return exp
  if typeof e=='string'
    if e[0]=='"' then return exp
    exp.refCount++
  if not exp.push then  return exp
  if exp.analyzed then return exp
  if fn=analyzeFnMap[exp[0]]
    result = fn(exp, env)
    if result==exp then return result
    if result and result.push then result.analyzed  = true
    result = wrapInfo1 result, exp
    result.env = env
    result
  else
    for e, i in exp then exp[i] = analyze(e, env)
    exp.analyzed  = true
    exp