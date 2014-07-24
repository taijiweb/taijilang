{str, entity, wrapInfo1, isValue, isArray, extend, error, begin, undefinedExp} = require '../utils'

{constant} = require '../parser/base'
{NUMBER, STRING, IDENTIFIER, SYMBOL, REGEXP, HEAD_SPACES, CONCAT_LINE, PUNCT, FUNCTION,
BRACKET, PAREN, DATA_BRACKET, CURVE, INDENT_EXPRESSION
NEWLINE, SPACES, INLINE_COMMENT, SPACES_INLINE_COMMENT, LINE_COMMENT, BLOCK_COMMENT, CODE_BLOCK_COMMENT, CONCAT_LINE
MODULE_HEADER, MODULE
NON_INTERPOLATE_STRING, INTERPOLATE_STRING
INDENT, UNDENT, HALF_DENT
} = constant

{isExpression, toExpression} = require './transform'
{tocode} = require './textize'

# todo:
# variable add a tag field, which is a different index number in the whole program

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

replaceCallFn = (exp, fnName)->
  if not isArray(exp) then return exp
  if exp[0]!= 'call!' or entity(exp[1])!=fnName then for e in exp then replaceCallFn(e, fnName)
  else fnName

replaceMutualCallFn = (exp, fnName, fnNames)->
  if not isArray(exp) then return exp
  if exp[0]!= 'call!' or not fnNames[entity(exp[1])] then for e in exp then replaceMutualCallFn(e, fnName, fnNames)
  else fnName

replaceCallParam = (exp, fnName)->
  if not isArray(exp) then return
  if exp[0]!= 'call!' or entity(exp[1])!=fnName
    for e in exp then  if x=replaceCallParam(e, fnName) then return x
  else return exp[2]

replaceMutualCallParam = (exp, fnName, fnNames)->
  if not isArray(exp) then return
  if exp[0]!= 'call!' or not fnNames[entity(exp[1])]
    for e in exp then  if x=replaceMutualCallParam(e, fnName, fnNames) then return x
  else return exp[2]

containVar = (exp, variable) ->
  exp = entity(exp)
  if exp==variable then return true
  if isArray(exp) then for e in exp  then if containVar(e, variable) then return true

containVars = (exp, variables) ->
  exp = entity(exp)
  if variables[exp] then return exp
  if isArray(exp) then for e in exp  then if x=containVars(e, variables) then return x

# tempArgs
optimizeLetLoopFnBody = (exp, fnName, replacedName, params, loopInit) ->
  if not isArray(exp) then return exp
  if exp[0]=='return'
    if containVar(exp[1], fnName)
      exps = []
      for arg, i in replaceCallParam(exp[1], fnName)
        if entity(arg)!=entity(params[i]) then exps.unshift ['=', params[i], arg]
      if (right=replaceCallFn(exp[1], fnName))!=fnName then exps.unshift ['=', fnName, right]
      begin(exps)
    else
      if containVar(params, entity(exp[1])) then ['return', exp[1]]
      else loopInit.push(['=', fnName, exp[1]]); ['return', fnName]
  else
    for x in exp then optimizeLetLoopFnBody(x, fnName, fnName, params, loopInit)

optimizeMutualLetLoopBody = (exp, fnName, replacedName, params, loopInit, fnNames) ->
  if not isArray(exp) then return exp
  if exp[0]=='return'
    if x = containVars(exp[1], fnNames)
      exps = []
      for arg, i in replaceMutualCallParam(exp[1], fnName, fnNames)
        exps.unshift ['=', params[i], arg]
      if (right=replaceMutualCallFn(exp[1], replacedName, fnNames))!=replacedName
        exps.unshift ['=', replacedName, right]
      else loopInit.removed = true
      exps.push ['=', fnName, x]
      begin(exps)
    else
      if containVars(params, fnNames) then ['return', exp[1]]
      else
        loopInit.push(['=', replacedName, exp[1]])
        ['letloop-return', replacedName, exp[1]]
  else
    for x in exp then optimizeMutualLetLoopBody(x, fnName, replacedName, params, loopInit, fnNames)

rewriteLetloopBody = (exp, initRemoved) ->
  if Object.prototype.toString.call(exp) == '[object Array]'
    if exp[0]=='if'
      rewriteLetloopBody(exp[2], initRemoved)
      rewriteLetloopBody(exp[3], initRemoved)
    else if exp[0]=='begin!'
      i = 1
      while i++<exp.length-1 then rewriteLetloopBody(exp[i], initRemoved)
      return
    else if exp[0]=='letloop-return'
      exp[0] = 'return'
      if initRemoved then exp[1] = exp[2]

optimizeFnMap =
  '=': (exp, env) ->
    left = entity(exp[1])
    if typeof eLeft=='string'
      # while optimizing, replace the reference of left with value unconditionally.
      # is this necessary to do this while analyzing?
      if left.const and isAtomicValue(exp[2])
        env.scope[eLeft] = exp[2]
        return ''
      if left.refCount==undefined then return ''
    else left = optimize(left, env)
    ['=', left, optimize(exp[2], env)]

  'prefix!': (exp, env) ->
    exp2 = optimize(exp[2])
    result = ['prefix!', exp[1], exp2]
    if isValue(exp2) then code = tocode(result); setValue(eval(code))
    else result

  'suffix!': (exp, env) ->
    exp2 = optimize(exp[2])
    result = ['suffix!', exp[1], exp2]
    if isValue(exp2) then code = tocode(result); setValue(eval(code))
    else result

  'binary!': (exp, env) ->
    x = optimize(exp[2]); y = optimize(exp[3])
    result = ['binary!', exp[1], x, y]
    if isValue(x) and isValue(y) then code = tocode(result); setValue(eval(code))
    else result

  'index!': (exp, env) -> exp

  'call!': (exp, env) ->
    caller = exp[1]
    if caller[0]=='attribute!' and caller[1].refCount==0 then exp.removed = true
    exp[1] = optimize(exp[1], env); exp[2] = optimizeList(exp[2], env)
    exp

  'list!': (exp, env) -> exp[1] = ['list!'].concat optimizeList(exp[1...], env)
  'comma!': (exp, env) -> exp[1] = optimizeList(exp[1], env); exp

  'begin!': (exp, env) ->
    exp = for e in exp[1...] then optimize(e, env)
    begin(exp)

  'if': (exp, env) ->
    if x=truth(test=optimize(exp[1])) then optimize(exp[x+1])
    else
      then_ = optimize(exp[2]); else_ = optimize(exp[3])
      if isExpression(else_)
        if exp.isAnd then return ['binary!', '&&', then_[2], else_]
        else if exp.isOr then return ['binary!', '||', then_[2], else_]
        else if isExpression(then_) and exp.isTernay then return ['?:', test, then_, else_]
      ['if', test, then_, else_]

  'while': (exp, env) ->
    test = optimize(exp[1], env); body = optimize(exp[2], env)
    if truth(test)!=2 then ['while', test, body]

  'doWhile!': (exp, env) ->
    test = optimize(exp[2], env); body = optimize(exp[1], env)
    if truth(test)==2 then body else ['doWhile!', body, test]

  'forIn!': (exp, env) -> exp

  'forOf!': (exp, env) -> exp

  'function': (exp, env) ->
    # use the env which is own to [function! ...]
    env = exp.env
    exp = ['function', exp[1], optimize(exp[2], env)]
    exp.env = env
    exp

  'letloop!':(exp, env) ->
    params = exp[1]; bindings = exp[2]; body = exp[3]; expEnv = exp.env
    result = []; fnBody = []
    if bindings.length==1
      [v, fn]  = bindings[0]
      fnBody.push ['var', v]
      v1 = entity(v)
      whileBody = optimizeLetLoopFnBody(fn, v1, v1, params, fnBody) #, tempArgs
      fnBody.push ['while', 1, whileBody]
      result.push ['var', v]
      result.push ['=', v, ['function', params, begin(fnBody)]]
    else
      loopFn = expEnv.newVar('loopFn'); fnName = expEnv.newVar('fn'); fnNames =  {}
      for [v, fn] in bindings then fnNames[entity(v)] = 1
      for [v, fn] in bindings
        result.push ['var', v]
        result.push ['=', v, ['function', params, ['return', ['call!', loopFn, params.concat(v)]]]]
      fnBody.push ['var', loopFn]
      ifExp = undefined
      i = bindings.length
      while --i>=0
        [v, fn] = bindings[i]
        init=[]
        then_ = optimizeMutualLetLoopBody(fn, fnName, loopFn, params, init, fnNames)
        if init.removed then initRemoved = true
        ifExp = ['if', ['binary!', '===', fnName, v], then_, ifExp]
        initExp = ['if', ['binary!', '===', fnName, v], begin(init), initExp]
      whileExp = ['while', 1]
      rewriteLetloopBody(ifExp, initRemoved)
      whileExp.push ifExp
      if initRemoved or containVars(params, fnNames)
        fnBody.push whileExp
      else fnBody.push begin([initExp,  whileExp])
      result.push ['var', loopFn]
      result.push ['=', loopFn, ['function', params.concat(fnName), begin(fnBody)]]
    result.push body
    begin(result)

exports.optimize = optimize = (exp, env) ->
  e = entity exp
  if not e then return exp
  if typeof e=='string'
    if e[0]=='"' then return exp
    if exp.refCount==1 and not exp.valueChanged
      return exp.assignExp[2]
    else if exp.firstRef
      return exp.assignExp
  if not exp.push then  return exp
  if exp.optimized then return exp
  if fn=optimizeFnMap[exp[0]]
    result = fn(exp, env)
    if result==exp then return result
    if result and result.push then result.optimized  = true
    result = wrapInfo1 result, exp
    result.env = env
    result
  else
    for e, i in exp then exp[i] = optimize(e, env)
    exp.optimized  = true
    exp

optimizeList = (exp, env) -> for e in exp then optimize(e, env)