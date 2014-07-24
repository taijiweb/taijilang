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

analyzeDefinition =  (exp, env) ->

analyzeFnMap =
  '=': (exp, env) ->
    left = exp[1]
    eLeft = entity(left)
    if typeof eLeft=='string'
      # while optimizing, replace the reference of left with value unconditionally.
      # is this necessary to do this while analyzing?
      if left.const and isAtomicValue(exp[2]) then exp.removable = true
      else
        info = env.info(left)
        if not info then env.optimizeInfoMap[left] = info = {}
        info.assign = exp
        exp.refCount = 0
    else analyze(left, env); analyze(exp[2], env)

  'var': (exp, env) ->
     v = entity(exp[1])
     env.optimizeInfoMap[v] = info = {}
     info.assign = undefined
     info.decl = exp

# because now is after transforming, so prefix! is only object language prefix operator.
  'prefix!': (exp, env) -> analyze(exp[2], env)
  'suffix!': (exp, env) -> analyze(exp[2], env)
  'binary!': (exp, env) -> analyze(exp[2], env); analyze(exp[3], env)
  'augmentAssign!': (exp, env) -> analyze(exp[2], env); analyze(exp[3], env)
  'attribute!': (exp, env) -> analyze(exp[1], env)
  'index!': (exp, env) -> analyze(exp[1], env); analyze(exp[2], env)
  'augmentAssign!': (exp, env) -> analyze(exp[2], env); analyze(exp[3], env)
  'list!': (exp, env) -> for e in exp[1...] then analyze(e, env)
  'begin!': (exp, env) -> for e in exp[1...] then analyze(e, env)

  'debugger': (exp, env) ->
  'break': (exp, env) ->
  'continue': (exp, env) ->
  'return': (exp, env) -> analyze(exp[1], env)
  'quote!': (exp, env) ->
  'regexp!': (exp, env) ->
  'noop!': (exp, env) ->
  'jsvar!': (exp, env) -> # analyze(exp[1], env) # do not change reference count for jsvar!
  'label!': (exp, env) -> analyze(exp[1], env)
  'new': (exp, env) -> analyze(exp[1], env)
  'hash!': (exp, env) -> analyze(exp[1], env)
  'hashitem!': (exp, env) -> analyze(exp[2], env)
  'call!': (exp, env) -> analyze(exp[1], env); analyze(exp[2], env)

  'if': (exp, env) -> analyze(exp[1], env); analyze(exp[2], env); analyze(exp[3], env)
  'while': (exp, env) -> analyze(exp[1], env); analyze(exp[2], env)
  'doWhile!': (exp, env) -> analyze(exp[2], env); analyze(exp[1], env)
  'forIn!': (exp, env) ->
    # [forIn! loopVariable range body]
    # loopVariable should not be treated as variable reference, so exp[1] is skipped
    analyze(exp[2], env); analyze(exp[3], env)
  'cFor!': (exp, env) -> analyze(exp[1], env); analyze(exp[2], env); analyze(exp[3], env); analyze(exp[4], env)
  'try!': (exp, env) ->
    # [try test catchVariable catchBody finallyBody]
    # catchVariable should not be treated as catchVariable reference, so exp[2] is skipped
    analyze(exp[1], env); analyze(exp[3], env); analyze(exp[4], env)
  'switch!': (exp, env) ->
    # [switch test cases body]
    analyze(exp[1], env); analyze(exp[1], env); analyze(exp[1], env)

  # ->, =>, |->, |=> have been transformed to function!
  #[function! [params...] body]
  'function': (exp, env) ->
    # use the env which is own to [function! ...]
    env = exp.env; env.optimizeInfoMap = {}
    for e in exp[1] then env.optimizeInfoMap[entity(e)] = info = {}; info.assign = []
    analyze(exp[2], exp.env)

  'letloop': (exp, env) ->
    #[params, bindings, body]
    env = exp.env; env.optimizeInfoMap = {}
    bindings = exp[2]
    for b in bindings then transform(b[1], env)
    analyze(exp[3], env)

exports.analyze = analyze = (exp, env) ->
  e = entity exp
  if not e then return
  if typeof e == 'string'
    if e[0]=='"' then return
    info = env.info(e)
    if info and info.assign then info.assign.refCount++
    if info and info.decl then info.decl.refCount++
  if not exp.push then  return
  if exp.analyzed then return
  if fn=analyzeFnMap[exp[0]]
    result = fn(exp, env)
    if result==exp then return result
    if result and result.push then result.analyzed  = true
    result = wrapInfo1 result, exp
    result.env = env
  else
    for e in exp then analyze(e, env)
    exp.analyzed  = true