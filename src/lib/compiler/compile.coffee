{evaljs, isArray, extend, str, wrapInfo1, entity, pushExp, undefinedExp} = require '../utils'

{constant} = require '../parser/base'
{NUMBER, STRING, IDENTIFIER, SYMBOL, REGEXP, HEAD_SPACES, CONCAT_LINE, PUNCT, FUNCTION,
BRACKET, PAREN, DATA_BRACKET, CURVE, INDENT_EXPRESSION
NEWLINE, SPACES, INLINE_COMMENT, SPACES_INLINE_COMMENT, LINE_COMMENT, BLOCK_COMMENT, CODE_BLOCK_COMMENT, CONCAT_LINE
MODULE_HEADER, MODULE
NON_INTERPOLATE_STRING, INTERPOLATE_STRING
INDENT, UNDENT, HALF_DENT
} = constant

{Environment} = require './env'
exports.Environment = Environment
{transform} = require './transform'
{analyze} = require './analyze'
{optimize} = require './optimize'
{tocode} = require './textize'

getStackTrace = ->
  obj = {}
  Error.captureStackTrace(obj, getStackTrace)
  obj.stack

error = (msg, exp) -> throw Error msg+exp

madeConcat = (head, tail) ->
  if tail.concated then result = ['call!', ['attribute!', ['list', head], 'concat'], [tail]]
  else tail.shift(); result = [head].concat tail
  result.convertToList = true
  result

madeCall = (head, tail, env) ->
  if tail.concated
    if head and head.push and ((head0=head[0])=='attribute!' or head0=='index!')
      h1 = entity(head[1])
      if typeof h1=='string' and h1[0]!='"' then ['call!', ['attribute!', head, 'apply'], [h1, tail]]
      else
        result = ['begin!', ['var', obj=env.ssaVar('obj')], ['=', obj, head[1]]]
        result.push ['call!', ['attribute!', [head0, obj, head[1]], 'apply'], [obj, tail]]
        result
    else ['call!', ['attribute!', head, 'apply'], ['null', tail]]
  else tail.shift(); ['call!', head, tail]

exports.convert = convert = (exp, env) ->
  if Object.prototype.toString.call(exp) == '[object Array]'
    if exp.length==0 then return exp
    head = convert(exp[0], env)
    if typeof head == 'function' then result = head(exp[1...], env)
    else
      tail = convertEllipsisList(exp[1...], env)
      if (t=typeof entity(head)) == 'string'
        if not head or head[0]=='"' then result = madeConcat head, tail
        else result = madeCall head, tail, env
      else if Object.prototype.toString.call(head) == '[object Array]'
         result =  madeCall head, tail, env
      else if t == 'object'
        if (type=head.type)==NON_INTERPOLATE_STRING or type==NUMBER then result = madeConcat head, tail
        else if type==IDENTIFIER then result =  madeCall head, tail, env
        else if typeof head.value != 'string' then result = madeConcat head, tail
        else result = ['call!', head, tail]
      else result = madeConcat head, tail
  else if typeof exp=='object'
    result = convert(entity(exp), env)
  else if typeof entity(exp)=='string'
    if not exp or exp[0]=='"' then return exp
    if not (result = env.get(exp)) then error 'fail to look up symbol from environment:', exp
  else result = exp
  if typeof result=='function' then result
  else
    if exp==result then result
    else wrapInfo1 result, exp

exports.convertExps = convertExps = (exp, env) -> ['begin!'].concat(for e in exp then convert e, env)
exports.convertList = (exp, env) -> for e in exp then convert(e, env)
exports.convertEllipsisList = convertEllipsisList = (exp, env) ->
  if exp.length==0 then return []
  if exp.length==1
    if (e = exp[0]) and e[0]=='x...' then return convert e[0][1], env
    else
      result = convert(e, env)
      if result and result.convertToList then return ['list!'].concat result
      else return ['list!', result]
  ellipsis = undefined
  for item, i in exp
    x = entity(item)
    if x and x[0]=='x...' then ellipsis = i; break
  if ellipsis==undefined
    return ['list!'].concat(for e in exp then convert(e, env))
  else
    concated = false # tell call! whether it need to be transformed to fn.apply(obj, ...)
    concating = false
    if ellipsis==0
      exp01 = exp[0][1]
      if exp01 and exp01[0]=='list!' then result = piece = convert(exp01, env)
      else result = exp01; concating = true; concated = true
    else result = piece = ['list!', convert(exp[0], env)]
    for e in exp[1...]
      ee = entity e
      if ee and ee[0]=='x...'
        e1 = convert(e[1], env)
        if e1 and e1[0]=='list!'
          if concating then result = ['call!', ['attribute!', result, 'concat'], [e1]]; piece = e1; concating = false
          else piece.push.apply piece, e1[1...]
        else
          ee1 = entity(e1)
          # todo use __slice.call(arguments)
          if ee1=='arguments' or (ee1) and ee1[1]=='arguments' then e1 = ['call!', ['attribute!', [], 'slice'], [e1]]
          result = ['call!', ['attribute!', result, 'concat'], [e1]]; concating = true; concated = true
      else
        e = convert e, env
        if concating then result = ['call!', ['attribute!', result, 'concat'], (piece=[['list!', e]])]; concating = false
        else piece.push  e
    result.concated = concated
    result

$atMetaExpList = (index) -> ['index!', ['jsvar!', '__tjExp'], index]

preprocessMetaConvertFnMap =
  'if': (exp, metaExpList, env) ->
    test = metaTransform(exp[1], metaExpList, env)
    metaExpList.push metaTransform(exp[2], metaExpList, env)
    thenIndex = env.metaIndex++
    metaExpList.push  metaTransform(exp[3], metaExpList, env)
    elseIndex = env.metaIndex++
    ['if', test, $atMetaExpList(thenIndex), $atMetaExpList(elseIndex)]
  'while': (exp, metaExpList, env) ->
    metaExpList.push metaConvert(exp[2], metaExpList, env)
    whileIndex = env.metaIndex++
    resultExpList = env.constVar('result')
    ['begin!',
      ['var', resultExpList], ['=', resultExpList, []],
       ['while', metaConvert(exp[1], metaExpList, env),
          ['direct!', pushExp(resultExpList, [$atMetaExpList(whileIndex)])]],
       resultExpList]
  #'let': (exp, metaExpList, env) ->
  #'letrec': (exp, metaExpList, env) ->
  #'letloop': (exp, metaExpList, env) ->
  # todo add more construct here ...

metaConvertFnMap =
  '##': (exp, metaExpList, env) -> metaTransform exp[1], metaExpList, env

  '#': (exp, metaExpList, env) ->
    exp1 = exp[1]
    if Object.prototype.toString.call(exp1) == '[object Array]'
      if not exp1.length then return exp[1]
      else if fn = preprocessMetaConvertFnMap[exp1[0]]
        return fn(exp1, metaExpList, env)
      else return metaTransform exp1, metaExpList, env
    else metaTransform exp1, metaExpList, env

  '#=': (exp, metaExpList, env) -> ['=', metaTransform(exp[1], metaExpList, env), metaTransform(exp[2], metaExpList, env)]

  # macro call
  '#call!': (exp, metaExpList, env) ->
    args = []
    for e in exp[2] then metaExpList.push metaTransform(e, env); args.push $atMetaExpList(env.metaIndex++)
    #console.log code.text
    ['call!', metaTransform(exp[1], metaExpList, env), args]
  # both meta level and object level
  '#/': (exp, metaExpList, env) ->

metaTransform = (exp, metaExpList, env) ->
  if Object.prototype.toString.call(exp) == '[object Array]'
    if exp.length==0 then return exp
    else if (head=entity(exp[0])) and head[0]=='#' then metaConvert(exp, metaExpList, env)
    else for e in exp then metaTransform(e, metaExpList, env)
  else return exp

hasMeta = (exp) ->
  if not exp then return false
  if exp.hasMeta then return true
  if Object.prototype.toString.call(exp) != '[object Array]'
    exp.hasMeta = false; return false
  for e in exp
    if  Object.prototype.toString.call(e) == '[object Array]'
      if (eLength=e.length)<=1 then continue
      else
        if (e0=entity(e[0])) and typeof e0 == 'string'
          if e0[0]=='#' then exp.hasMeta = true; return true
        if hasMeta(e) then exp.hasMeta = true; return true
  exp.hasMeta = false
  return false

exports.metaConvert = metaConvert = (exp, metaExpList, env) ->
  if Object.prototype.toString.call(exp) == '[object Array]'
    if exp.length==0 then return []
    exp0 = entity exp[0]
    if fn=metaConvertFnMap[exp0] then return fn(exp, metaExpList, env)
    else
      if hasMeta(exp)
        result = ['list!']
        for e, i in exp then result.push metaConvert(e, metaExpList, env)
        return result
      else metaExpList.push exp; return $atMetaExpList(env.metaIndex++)
  else
#    e = entity exp
#    if typeof e == 'string' and e[0]=='"' then return exp
#    else return exp
    metaExpList.push exp; return $atMetaExpList(env.metaIndex++)

metaProcess = (exp, env) ->
  env = env.extend({})
  env.metaIndex = 0
  exp = metaConvert exp, metaExpList=[], env
  code = nonMetaCompileExp(['return', exp], env)
  #console.log code
  new Function(['__tjExp'], code)(metaExpList)

exports.transformExp = transformExp = (exp, env) ->
  exp = metaProcess exp, env
  exp = convert exp, env
  exp = transform exp, env
  exp

exports.transformToCode = transformToCode = (exp, env) ->
  exp = transform exp, env
  exp = analyze exp, env
  exp = optimize exp, env
  exp = tocode exp
  exp

exports.optimizeExp = optimizeExp = (exp, env) ->
  exp = metaProcess exp, env
  exp = convert exp, env
  exp = transform exp, env
  exp = analyze exp, env
  exp = optimize exp, env
  exp

exports.nonMetaCompileExp = nonMetaCompileExp = (exp, env) ->
  exp = convert exp, env
  exp = transform exp, env
  exp = analyze exp, env
  exp = optimize exp, env
  exp = tocode exp
  exp

exports.compileExp = compileExp = (exp, env) ->
  exp = metaProcess(exp, env)
  exp = nonMetaCompileExp exp, env

exports.nonMetaCompileExpNoOptimize = nonMetaCompileExpNoOptimize = (exp, env) ->
  exp = convert exp, env
  exp = transform exp, env
  exp = tocode exp
  exp

exports.compileExpNoOptimize = compileExpNoOptimize = (exp, env) ->
  exp = metaProcess exp, env
  exp = nonMetaCompileExpNoOptimize exp, env
  exp

