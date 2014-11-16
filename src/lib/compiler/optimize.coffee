{str, entity, wrapInfo1, isValue, isArray, extend, error, begin, undefinedExp, constant, norm} = require '../utils'

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

setValue = (x) ->
  if x==undefined then undefinedExp
  else if typeof x == 'string' then '"'+x+'"'
  else x

#todo: maybe this utility can be deprecated, because we can eval(tocode(exp))
getValue = (x) -> entity(x)

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
  'comma!': (exp, env) -> ['comma!'].concat optimizeList(exp[1...], env)

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

optimizeList = (exp, env) -> for e in exp then optimize(e, env)

exports.optimize = optimize = (exp, env) ->
  switch exp
    when VALUE then exp
    when SYMBOL
      if exp.refCount==1 and not exp.valueChanged
        exp.assignExp[2]
      else if exp.firstRef
        exp.assignExp
      else exp
    when LIST
      if (exp0.kind==SYMBOL) and (fn=optimizeFnMap[exp[0].value])
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