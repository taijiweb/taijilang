{constant, str, trace, convertIdentifier, begin, return_, error, isArray, error, extend, splitSpace, undefinedExp, addPrelude} = require '../utils'
{VALUE, SYMBOL, LIST} = constant

{compileError} = require '../compiler/helper'

# meta language command, mainly some lisp style command.

`__slice = [].slice`

fs = require 'fs'
{Parser} = require '../parser'
{convert, convertList, convertArgumentList, convertExps, compileExp, nonMetaCompileExp, transformToCode, metaProcessConvert, metaProcess} = require '../compiler'

metaIndex = 0

exports['extern!'] = (exp, env) ->
  if exp[1]=='const' then isConst = true; exp = exp[2...]
  for e in exp[1...]
    if env.hasLocal(v=e.value)
      error v+' has been declared as local variable, so it can not be declared as extern variable any more.', e
    env.set(v, v)
    if isConst then e.const = true
  ''

# todo: while transform(exp, env), [metaConvertVar name] should be transformed a proper variable name
# avoid to conflict with other names
exports['metaConvertVar!'] = (exp, env) -> exp

# always generate a new var a const
# so continuous "var a; var a;" will generate two different variable.
# [var [a = 1] [a = a+1]] , second right a will be evaluated in old env
declareVar = (fn) -> (exp, env) ->
  result = []
  len = exp.length
  i = 1;
  while i<len
    e = exp[i++]
    switch e.kind
      when VALUE then error 'illegal variable name'
      when SYMBOL
        eValue = e.value
        if env.hasLocal(e.value) then error 'repeat declaring variable: '+str(e)
        v = env.set(eValue, e); fn(v) # when convert [const v], fn(v) will set v.const = true
        if v.const then error 'const need to be initialized to a value'
        result.push ['var', v]
      when LIST
        e0 = e[0]
        if e0.kind==SYMBOL
          if e0.value=='metaConvertVar!'
            result.push [('var'), e]
          else if e0.value=='='
            e1 = e[1]
            if e1.kind!=SYMBOL
              error 'illegal variable name in variable initialization: '+str(e1)
            if env.hasLocal(e1Value=e1.value) then error 'repeat declaring variable: '+str(e1)
            v = env.newVar(e1Value); fn(v);  result.push((['var', v]))
            result.push(['=', v, convert(e[2], env)])
            # [var [a = a+1]] ,right a will be evaluated in old env
            env.set(e1Value, e1);
        else compileError e, 'wrong form of var initialization'
  begin(result)

# assure when transforming, only there exists ['var', variable]
exports['var'] = declareVar((v) -> v)
exports['const'] = declareVar( (v) -> v.const=true; v )

exports['newvar!'] = (exp, env) -> '"'+env.newVar((x=exp[1].value).slice(1, x.length-1)).symbol+'"'

# obj.slice(start, stop)
makeSlice = (obj, start, stop) ->
  if stop==undefined then ['call!', ['attribute!', '__slice', 'call'], [obj, start]]
  else ['call!', ['attribute!', '__slice', 'call'], [obj, start, stop]]

convertAssign = (exp, env) ->
  left = exp[1]
  if left.kind==SYMBOL
    leftValue = left.value
    if env.hasLocal(leftValue)
      left = env.get(leftValue)
      if left.const then error 'should not assign value to const variable: '+leftValue
      if left.outer
        env.set(leftValue, left=env.newVar(leftValue))
        left.const = true # create const by default
        ['begin!', ['var', left], ['=', left, convert(exp[2], env)], left]
      else ['=', left, convert(exp[2], env)]
    else
      env.set(leftValue, left=env.newVar(leftValue))
      left.const = true # create const by default
      ['begin!', ['var', left], ['=', left, convert(exp[2], env)], left]
  # left is assignable expression list
  else if left[0]=='list!'
    # right is already list in the compilation time
    ellipsis = undefined
    for item, i in left
      x = item.value
      if x and x[0]=='x...'
        if not ellipsis then ellipsis = i; left[i] = x[1]
        else error 'can not have multiple ellipsis item in the left side of assign'
    if ellipsis==undefined
      right = exp[2]
      # no exp... is met in the left side, just do the al list assign
      if right[0]=='list!'
        if left.length>1
          result = []
          for e, i in left[1...] then result.push convertAssign(e, right[i+1], env)
          return begin(result)
        else return convertAssign(left[1], right[1], env)
      else
        if left.length>1
          result = []
          result.push ['var', v=env.ssaVar('lst')]
          result.push ['=', v, convert(right, env)]
          for e, i in left[1...] then result.push convertAssign(e,  (['direct!', ['index!', v, i]]), env)
          return begin(result)
        else return convertAssign(left[1], (['index!', right, 0]), env)
    else
      result = []; leftLength = left.length
      if right[0]=='list!'
        rightLength = right.length
        if leftLength>rightLength
          for e, i in left
            if i==0 then continue #[list! ...]
            else if i<ellipsis then result.push convertAssign(e, right[i], env)
            # x... is set a emtply list [] always
            else if i==ellipsis then result.push convertAssign(e, [], env)
            else
              n = ellipsis+(rightLength-i)+1
              if n>=rightLength then result.push convertAssign(e, undefined, env)
              else result.push convertAssign(e, right[n], env)
        else
          for e, i in left
            if i==0 then continue #[list! ...]
            else if i<ellipsis then result.push convertAssign(e, right[i], env)
            else if i==ellipsis then result.push convertAssign(e, right[ellipsis...(n=ellipsis+rightLength-leftLength+1)], env)
            else result.push convertAssign(e, right[n++], env)
      else # left have ellipsis and right is not list
        # see the implementation of ellipsis parameter list
        result.push ['var', v=env.ssaVar('lst')]
        result.push ['=', v, convert(right, env)]
        if ellipsis==leftLength-1
          for e, i in left
            if i==0 then continue #[list! ...]
            else if i<ellipsis then result.push convertAssign(e,  (['direct!', ['index!', v, i-1]]), env)
            else result.push ['=', e, ['?:', ['binary!', '>=', ['attribute!', v, 'length'], leftLength-1], makeSlice(v, i-1), []]]
        else
          result.push ['var', _i=env.newVar('i')]
          for e, i in left
            if i==0 then continue #[list! ...]
            else if i<ellipsis then result.push convertAssign(e,  (['direct!', ['index!', v, i-1]]), env)
            else if i==ellipsis
              result.push ['=', e, ['?:', ['binary!', '>=', ['attribute!', v, 'length'], leftLength-1], makeSlice(v, i, ['=', _i,  ['binary!', '-', ['attribute!', v, 'length'], leftLength-i-1]]), ['comma!', [['=', _i,ellipsis-1], []]]]]
            else result.push ['=', e, ['index!', v, ['suffix!', '++', _i]]]
      begin(result)
  # left is not variable, is a assignable expression instead
  # ['@@' varName] is included by this case, see below: exports['@@'] = (exp, env) ->
  else
    # we should convert the right side at first
    [exp[0], convert(left, env), convert(exp[2], env)]

# al assign in object language
exports['='] = (exp, env) -> convertAssign(exp, env)

# {a, b, c } = x
# {a} = x
exports['hashAssign!'] = (exp, env) ->
  exp1 = exp[1]; exp2 = exp[2]
  if exp1.length>1
    result = []
    if exp2.kind!=SYMBOL
      # need saved in a temporary varibale, so as to avoid duplicate evaluation
      vObj = env.newVar('obj')
      result.push ['direct!', ['var', vObj]]
      env.set(vObj.symbol, vObj)
      result.push ['=', vObj, exp1]
    else vObj = exp2
    for x in exp1 then result.push ['=', x, ['attribute!', vObj, x]]
    convert(begin(result), env)
  else convert((['=', exp1[0], ['attribute!', exp2, exp1[0]]]), env)

# meta assign, macro assign
exports['#='] = (exp, env) -> ['##', convert([('='), exp[1], exp[2]], env)]
exports['#/'] = (exp, env) -> ['#/', convert([('='), exp[1], exp[2]], env)]

exports['@@'] = (exp, env) ->
  name = exp[1].value
  # the outer scope that can define new var in javascript, would be function or the top scope of a file, and the like.
  outerEnv = env.outerVarScopeEnv()
  # I've forgotten the effect of the line below ;)
  if Object.prototype.toString.call(name) == '[object Array]' then return ['@@', name]
  v = outerEnv.get(name)
  if not (v=outerEnv.get(name)) then error 'wrongly access to the outside scope variable which is not existed'
  outerName = v.symbol
  # prevent name conflict
  if env!=outerEnv and env.fnLocalNames(name)[outerName]
    error '"'+name+'" is local variable, can not access outer "'+name+'"'
  # the parser should ensure the things below never happen:
  # if typeof name != 'string' then error 'wrong prefix before expression which is not a variable'
  v.outer = true
  env.set(name, v)
  v

# create a block with new scope (i.e. evaluate all exp in new environment
exports['block!'] = (exp, env) -> convertExps exp[1...], env.extend({})

exports['let'] = (exp, env) ->
  newEnv = env.extend(scope={})
  result = []
  for x in exp[1]
    x0 = x[0].value
    scope[x0] = var1 = newEnv.newVar(x0)
    result.push (['var', var1])
    result.push ['=', var1, convert(x[2], env)]
  result.push convert(exp[1], newEnv)
  result = begin(result)
  result.env = newEnv
  result

# don't convert the bound expression, similar to macro
exports['letm!'] = (exp, env) ->
  newEnv = env.extend(scope={})
  result = []
  for x in exp[1]
    x0 = x[0].value
    scope[x0] = var1 = env.newVar(x0)
    result.push [('var'), var1]
    result.push [('='), var1, x[1]]
  result.push convert(exp[1], newEnv)
  result = begin(result)
  result

exports['letrec!'] = (exp, env) ->
  newEnv = env.extend(scope={})
  result = []
  for x in exp[1] then scope[x0=x[0].value] = var1 = newEnv.newVar(x0); result.push [('var'), var1]
  for x in exp[1] then result.push [('='), var1, convert(x[2], newEnv)]
  result.push convert(exp[1], newEnv)
  result = begin(result)
  result.env = newEnv
  result

# don't convert the bound expression, similar to macro
# #letrecm is the same as the #letm exactly, so don't add it to meta builtins to avoid confusion

keywordConvert = (keyword) -> (exp, env) -> [keyword].concat(for e in exp[1...] then convert e, env)

do ->
  symbols  = 'throw return break label! if! cFor! while while! doWhile! try! try with! ?: ,'
  keywords = 'throw return break label!  if  cFor! while while  doWhile! try try with! ?: list!'
  for sym, i in splitSpace symbols then exports[sym] = keywordConvert(splitSpace(keywords)[i])

exports['begin!'] = (exp, env) -> begin(for e in exp[1...] then convert e, env)

exports['list!'] = (exp, env) -> convertArgumentList(exp[1...], env)

#['try', body, catchClauses: [list! ...], else_, final]
#['try! body, catchVar, catchBody, final] # attention: assume no else_ clause in current target javascript version

exports['if'] = (exp, env) ->
  if exp[3]!=undefined
    [('if'), convert(exp[1], env), convert(exp[2], env), convert(exp[3], env)]
  else [('if'), convert(exp[1], env), convert(exp[2], env), undefinedExp]

exports['switch!'] = (exp, env) ->
  assert false, 'todo: rewrite switch'
  result = ['switch', convert(exp[1], env)]
  # cases: [list! case1, case2, ...]
  # case clause: [list! ...] body
  result.push (for e in exp[2][1...] then [convertList(e[0][1...], env), convert(e[1], env)])
  if exp[3] then result.push convert(exp[3], env)
  result

idConvert = (keyword) -> (exp, env) -> [keyword, exp[1]]

do -> for word in splitSpace 'break continue' then exports[word] = idConvert(word)

exports['lineComment!'] = (exp, env) ->  ''
exports['directLineComment!'] = (exp, env) -> [('directLineComment!'), exp[1]]
exports['codeBlockComment!'] = (exp, env) -> ''
exports['directCBlockComment!'] = (exp, env) -> [('directCBlockComment!'), exp[1]]

exports['direct!'] = (exp, env) -> exp[1]
exports['quote!'] = (exp, env) -> [('quote!'), exp[1]]
exports['~'] = (exp, env) -> [('quote!'), exp[1]]

exports['call!'] = (exp, env) -> convert([exp[1]].concat(exp[2]), env)

exports['label!'] = (exp, env) -> [('label!'), convertIdentifier(exp[1]), convert(exp[2], env)]

argumentsLength = ['attribute!', 'arguments', 'length']

convertParametersWithEllipsis = (exp, ellipsis, env) ->
  result = []; paramsLength = exp.length
  if ellipsis==paramsLength-1
    for param, i in exp
      result.push ['var', param]
      if i!=ellipsis then  result.push ['=', param, ['index!', 'arguments', i]]
      else result.push ['=', param, ['?:', ['>=', argumentsLength, paramsLength], makeSlice('arguments', i), []]]
  else
    result.push [('var'), _i=env.newVar('i')]
    for param, i in exp
      result.push ['var', param]
      if i<ellipsis then result.push ['=', param, ['index!', 'arguments', i]]
      else if i==ellipsis
        result.push ['=', param, ['?:', ['>=', argumentsLength, paramsLength], makeSlice('arguments', i, ['=', _i,  ['-', argumentsLength, paramsLength-i-1]]), ['binary,', ['=', _i,ellipsis], []]]]
      else result.push ['=', param, ['index!', 'arguments', ['x++', _i]]]
  result

convertDefinition =  (exp, env, mode) ->
  newEnv = env.extend(scope={}, env.parser, env.module, {})  #scope, parser, module, functionInfo(i.e. newVarIndexMap...)
  if mode=='=>' or mode=='|=>' or mode=='==>' or mode=='|==>'
    _this = env.newVar('_this')
    scope['@'] = _this
  else scope['@'] = 'this'
  exp1 = exp[1]; exp2 = exp[2]; defaultList = []; thisParams = []
  params = []
  for param, i in exp1
    param = entity(param)
    if param[0]=='x...'
      if not ellipsis?
        ellipsis = i
        param1 = param[1]
        if param1[0]=='attribute!' then params.push param1[2]; thisParams.push ['=', param1, param1[2]]
        else params.push param1
      else error 'mulitple ellipsis parameters is not permitted'
    else if param[0]=='='
      param1 = param[1]
      if param1[0]=='attribute!'
        thisParams.push ['=', param1, param1[2]]
        param1 = param1[2]
        param = ['=', param1, param[2]]
      defaultList.push ['if', ['==', param1, ['direct!', undefinedExp]], param]
      params.push param1
      # default parameter should not be ellipsis parameter at the same time
      # and this is the behavior in coffee-script too
    else if param[0]=='attribute!'
      params.push param[2]; thisParams.push ['=', param, param[2]]
    else params.push param
  if ellipsis!=undefined
    body = convertParametersWithEllipsis(params, ellipsis, newEnv)
    params = []
  else
    body = []
    for param in params then param = entity(param); scope[param] = param
  body.push.apply body, defaultList
  body.push.apply body, thisParams
  body.push exp2
  if mode[0]=='|' then body =  convert(begin(body), newEnv)
  else body =  return_(convert(begin(body), newEnv))
  functionExp = ['function', params, body]
  functionExp.env = newEnv
  if mode=='=>' or mode=='|=>' then ['begin!', ['var', _this], ['=', _this, 'this'], functionExp]
  else functionExp

for sym in '-> |-> => |=>'.split(' ') then do (sym=sym) ->
    exports[sym] = (exp, env) -> convertDefinition(exp, env,sym)

exports['unquote!'] = (exp, env) -> error('unexpected unquote!', exp)
exports['unquote-splice'] = (exp, env) -> error('unexpected unquote-splice', exp)
exports['quasiquote!'] = (exp, env) -> quasiquote(exp, env, 0)

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

exports['eval!'] = (exp, env) ->
  exp1 = exp[1]
  if isArray(exp1)
    if exp1[0]=='quote!' then convert(exp1[1], env)
    else if exp1[0]=='quasiquote!' then convert(quasiquote(exp1[1], env), env)
    else ['call!', 'eval', [nonMetaCompileExp(exp1, env)]]
  else if typeof (exp1=entity(exp1)) =='string'
    if exp1[0]=='"'
      exp = (parser=new Parser).parse(exp1[1...exp1.length-1], parser.moduleBody, 0, env)
      objCode = compileExp(exp.body, env.extend({}))
      ['call!',  'eval', [objCode]]
    else ['call!', 'eval', exp1]
  else ['call!', 'eval', [nonMetaCompileExp(exp1, env)]]

exports['metaEval!'] = (exp, env) -> eval nonMetaCompileExp(exp[1], env)

convertMetaExp = (head) -> (exp, env) -> [head, convert(exp[1], env)]
exports['##'] = convertMetaExp('##')
exports['#'] = convertMetaExp('#')
exports['#/'] = convertMetaExp('#/')
exports['#call!'] = (exp, env) -> ['#call', convert(exp[1], env), convert(exp[2], env)]

# prefix % will generate %x
#exports['parserAttr!'] = (exp, env) ->
#  convert(['attribute!', '__$taiji_$_$parser__', exp[1]], env)

exports['%x'] = (exp, env) ->
  convert((['attribute!', '__$taiji_$_$parser__', exp[1]]), env)

# dynamic syntax, extend the parser on the fly
# the head of exp[1] will be convert to attribute of __$taiji_$_$parser__
# {%/ matchA(x,y)} will be converted { %% %matchA(x, y) }
exports['%/'] = (exp, env) ->
  convert(convertParserAttribute(exp[1]), env)

convertParserAttribute = (exp) ->
  if Object.prototype.toString.call(exp) == '[object Array]'
    if exp[1]=='attribute!' or exp[1]=='call!' or exp[1]=='index!'
      exp[1] = convertParserAttribute exp[1]
    exp
  else if typeof exp == 'object'
    if typeof exp.value=='string' and exp[1]!='"'
      result = ['attribute!', '__$taiji_$_$parser__', exp.value]
      extend result, exp
    else exp
  else exp

# identifier in exp[1] will be convert to attribute of __$taiji_$_$parser__
# {%! matchA(x,y)} will be converted { %% %matchA(%x, %y) }
exports['%!'] = (exp, env) ->
  convert(convertParserExpression(exp[1]), env)

convertParserExpression = (exp) ->
  if Object.prototype.toString.call(exp) == '[object Array]'
    for e, i in exp then exp[i] = convertParserExpression e
    exp
  else if typeof exp == 'object'
    if typeof exp.value=='string' and exp[1]!='"'
      result = ['attribute!', '__$taiji_$_$parser__', exp.value]
      extend result, exp
    else exp
  else exp

exports['prefix!'] = (exp, env, compiler) -> prefixConverters[exp[1].value](exp, env)

exports.prefixConverters = prefixConverters = {}

prefixConverters['@'] = (exp, env) ->
  ['attribute!', 'this', exp[2]]

prefixConverters['::'] = (exp, env) ->
  ['attribute!', ['attribute!', 'this', 'prototype'], exp[2]]

exports['suffix!'] = (exp, env, compiler) -> suffixConverters[exp[1].value](exp, env)

exports.suffixConverters = suffixConverters = {}

suffixConverters['::'] = (exp, env) ->
  ['attribute!', convert(exp[2], env), 'prototype']

exports['binary!'] = (exp, env, compiler) -> binaryConverters[exp[1].value](exp, env)

exports.binaryConverters = binaryConverters = {}

# todo a[x], a[x, y]
binaryConverters['concat[]'] = (exp, env, compiler) ->
  trace("binaryConverters('concat[]'):", str(exp))
  subscript = exp[3].value[1]
  if subscript.length==0 or subscript.length>1
    compileError exp, 'wrong subscript: '
  ['index!', convert(exp[2], env), convert(subscript[0], env)]

## todo: a(1), a(1, 2), need to be refined.
binaryConverters['concat()'] = (exp, env, compiler) ->
  ['call!', convert(exp[2], env), convert(exp[3], env)]

binaryConverters['::'] = (exp, env, compiler) ->
  ['attribute!', ['attribute!', convert(exp[2], env), 'prototype'], exp[3]]

exports['{}'] = (exp, env) -> convert exp[1], env

# ['binary!' "," left right]
commaList = (exp) ->
  exp2 = exp[2]
  if exp2.kind==LIST and exp2[0].value=='binary!' and exp2[1].value==','
    result = commaList(exp2)
    result.push exp[3]
    result
  else [exp2, exp[3]]

binaryConverters[','] = (exp, env) ->
  result = for e in commaList(exp) then convert(e, env)
  result.unshift 'list!'
  result

exports['()'] = (exp, env) ->
  if exp[1] then convert exp[1], env
  else ['list!']

exports['[]'] = (exp, env) ->
  items = for e in exp[1] then convert e, env
  items.unshift 'list!'
  {value:items, kind:LIST}