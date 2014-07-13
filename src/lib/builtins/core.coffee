# meta language command, mainly some lisp style command.

`__slice = [].slice`

fs = require 'fs'
{convertIdentifier, entity, begin, error, isArray, error, extend, splitSpace, return_, undefinedExp, addPrelude} = require '../utils'
{Parser} = require '../parser'
{convert, convertList, convertEllipsisList, convertExps, compileExp, transformToCode, metaList, metaCode} = require '../compiler'
TaijiModule = require '../module'

metaIndex = 0

exports['extern!'] = (exp, env) ->
  if exp[0]=='const' then isConst = true; exp = exp[1...]
  for e in exp
    if env.hasLocal(v=entity(e))
      error v+' has been declared as local variable, so it can not be declared as extern variable any more.', e
    env.set(v, v)
    if isConst then e.const = true
  ''

# always generate a new var a const
# so continuous "var a; var a;" will generate two different variable.
# [var [a = 1] [a = a+1]] , second right a will be evaluated in old env
declareVar = (fn) -> (exp, env) ->
  result = []
  for e in exp
    e0 = entity(e)
    if typeof e0=='string'
      if e0[0]=='"' then error 'variable name should not be a string'
      v = env.newVar(e0); env.set(e0, v); fn(v)
      if v.const then error 'const need to be initialized to a value'
      result.push(['var', v]); result.push v
    else
      e0 = entity(e[0])
      if typeof e0!='string' or e0[0]=='"'
        error 'illegal variable name in variable initialization'
      v = env.newVar(e0); fn(v); result.push(['var', v])
      if (e2=entity(e[2])) and e2[1]=='=' and typeof e2[0]=='string' and e2[0][0]!='"'
        result.push(['=', v, convert([exp[0], e[2]], env)])
        result.push v
      else result.push ['=', v, convert(e[2], env)]; result.push v
      # [var [a = a+1]] ,right a will be evaluated in old env
      env.set(e0, v)
  begin(result)

# assure when transforming, only there exists ['var', variable]
exports['var'] = declareVar((v) -> v)
exports['const'] = declareVar( (v) -> v.const=true; v )

makeSlice = (obj, start, stop) ->
  if stop==undefined then ['call!', ['attribute!', '__slice', 'call'], [obj, start]]
  else ['call!', ['attribute!', '__slice', 'call'], [obj, start, stop]]

convertAssignRight = (right, env) ->
  if right==undefined then undefinedExp
  else convert(right, env)

convertAssign = (left, right, env) ->
  eLeft = entity(left)
  if typeof eLeft=='string'
    if eLeft[0]=='"' then error 'wrong assign to string left side'
    else if env.hasFnLocal(eLeft)
      left = env.get(eLeft)
      if left.outer then error 'outer scope variable "'+eLeft+'" is not permitted to assign to local vaiable with the same identifier'
      if left.const then error 'should not assign value to const variable: '+eLeft
      ['=', left, convertAssignRight(right, env)]
    else
      env.set(eLeft, left=env.newVar(eLeft))
      left.const = true # create const by default
      ['begin!', ['var', left], ['=', left, convertAssignRight(right, env)], left]
  # left is assignable expression list
  else if left[0]=='list!'
    # right is already list in the compilation time
    ellipsis = undefined
    for item, i in left
      x = entity(item)
      if x and x[0]=='x...'
        if not ellipsis then ellipsis = i; left[i] = x[1]
        else error 'can not have multiple ellipsis item in the left side of assign'
    if ellipsis==undefined
      # no exp... is met in the left side, just do the normal list assign
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
          for e, i in left[1...] then result.push convertAssign(e,  ['direct!', ['index!', v, i]], env)
          return begin(result)
        else return convertAssign(left[1], ['index!', right, 0], env)
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
            else if i<ellipsis then result.push convertAssign(e,  ['direct!', ['index!', v, i-1]], env)
            else result.push ['=', e, ['?:', ['binary!', '>=', ['attribute!', v, 'length'], leftLength-1], makeSlice(v, i-1), []]]
        else
          result.push ['var', _i=env.newVar('i')]
          for e, i in left
            if i==0 then continue #[list! ...]
            else if i<ellipsis then result.push convertAssign(e,  ['direct!', ['index!', v, i-1]], env)
            else if i==ellipsis
              result.push ['=', e, ['?:', ['binary!', '>=', ['attribute!', v, 'length'], leftLength-1], makeSlice(v, i, ['=', _i,  ['binary!', '-', ['attribute!', v, 'length'], leftLength-i-1]]), ['comma!', [['=', _i,ellipsis-1], []]]]]
            else result.push ['=', e, ['index!', v, ['suffix!', '++', _i]]]
      begin(result)
  # left is not variable, is a assignable expression instead
  # ['@@' varName] is included by this case, see below: exports['@@'] = (exp, env) ->
  else ['=', convert(left, env), convertAssignRight(right, env)]

# normal assign in object language
exports['='] = (exp, env) -> convertAssign(exp[0], exp[1], env)

# meta assign, macro assign
exports['#='] = (exp, env) ->
  left = entity exp[0]; right = exp[1]
  if typeof left== 'string'
    if left[0]=='"' then error 'left side of assign should not be string'
    else
      env.set(left, left); value = convert(right, env)
      env.set(left, value); ''
  else error 'should not assign macro or meta value to non variable'

exports['@@'] = (exp, env) ->
  name = entity(exp[0]); outerEnv = env.outerVarScopeEnv()
  if env!=outerEnv and env.hasFnLocal(name)
    error '"'+name+'" is local variable, can not access outer "'+name+'"'
  # the parser should ensure the things below never happen:
  # if typeof name != 'string' then error 'wrong prefix before expression which is not a variable'
  if not (v=outerEnv.get(name)) then error 'wrongly access to the outside scope variable which is not existed'
  v.outer = true
  env.set(name, v)
  v

# create a block with new scope (i.e. evaluate all exp in new environment
exports['block'] = (exp, env) -> convertExps exp, env.extend({})

exports['let'] = (exp, env) ->
  newEnv = env.extend(scope={})
  result = []
  for x in exp[0]
    x0 = entity(x[0])
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
  for x in exp[0]
    x0 = entity(x[0])
    scope[x0] = var1 = env.newVar(x0)
    result.push ['var', var1]
    result.push ['=', var1, x[1]]
  result.push convert(exp[1], newEnv)
  result = begin(result)
  result

exports['letrec!'] = (exp, env) ->
  newEnv = env.extend(scope={})
  result = []
  for x in exp[0] then scope[x0=entity(x[0])] = var1 = newEnv.newVar(x0); result.push ['var', var1]
  for x in exp[0] then result.push ['=', var1, convert(x[2], newEnv)]
  result.push convert(exp[1], newEnv)
  result = begin(result)
  result.env = newEnv
  result

exports['letloop!'] = (exp, env) ->
  newEnv = env.extend(scope={})
  result = []
  exp0 = exp[0]
  for x in exp0 then x0 = entity(x[0]); scope[x0] =newEnv.newVar(x0)#  var1 =  ; result.push ['var', var1]
  params = []
  bindings =  for x in exp0
    value = x[2]
    if value and value.push and value[0].value=='->'
      for p, i in value[1]
        p1 = entity(p)
        if not params[i] then params.push p1
        else if p1!=params[i] then error 'different parameter list for functions in letloop bindings is not allowed', p
    if not fnBodyEnv then fnBodyEnv = newEnv.extend(fnScope={})
    for p in params then fnScope[p] = {symbol: p}
    [scope[entity(x[0])], return_(convert(begin(value[2]), fnBodyEnv)) ]
  exp = ['letloop!', params, bindings, convert(exp[1], newEnv)]
  exp.env = newEnv
  result.push exp
  result = begin(result)
  result.env = newEnv
  result

# don't convert the bound expression, similar to macro
# #letrecm is the same as the #letm exactly, so don't add it to meta builtins to avoid confusion

keywordConvert = (keyword) -> (exp, env) -> [keyword].concat(for e in exp then convert e, env)

do ->
  symbols  = 'throw return break label! if! cFor! forIn! forOf! while! doWhile! try! with! ?: ,'
  keywords = 'throw return break label!  if  cFor! forIn!  forOf!  while  doWhile! try with! ?: list!'
  for sym, i in splitSpace symbols then exports[sym] = keywordConvert(splitSpace(keywords)[i])

exports['begin!'] = (exp, env) -> begin(for e in exp then convert e, env)

exports['list!'] = convertEllipsisList

#['try', body, catchClauses: [list! ...], else_, final]
#['try! body, catchVar, catchBody, final] # attention: assume no else_ clause in current target javascript version

exports['if'] = (exp, env) ->
  if exp[2]!=undefined
    ['if', convert(exp[0], env), convert(exp[1], env), convert(exp[2], env)]
  else ['if', convert(exp[0], env), convert(exp[1], env)]

exports['switch!'] = (exp, env) ->
  result = ['switch', convert(exp[0], env)]
  # cases: [list! case1, case2, ...]
  # case clause: [list! ...] body
  result.push (for e in exp[1][1...] then [convertList(e[0][1...], env), convert(e[1], env)])
  if exp[2] then result.push convert(exp[2], env)
  result

idConvert = (keyword) -> (exp, env) -> [keyword, exp[0]]

do -> for word in splitSpace 'break continue' then exports[word] = idConvert(word)

exports['lineComment!'] = (exp, env) -> ''
exports['codeBlockComment!'] = (exp, env) -> ''

tjModule = require '../module'

parser = new Parser

# include! with parseMethod filePath
exports['include!'] = (exp, env) ->
  filePath = entity(exp[0])
  filePath = filePath.slice(1, filePath.length-1)
  #console.log 'include!: parent module:'+JSON.stringify env.module
  #console.log env.module instanceof TaijiModule
  taijiModule = new TaijiModule(filePath, env.module)
  newEnv = env.extend(null, env.parser, taijiModule)
  raw = fs.readFileSync taijiModule.filePath, 'utf8'
  code = if raw.charCodeAt(0) is 0xFEFF then raw.substring 1 else raw
  parseMethod = exp[1]
  if parseMethod then parseMethod = parser[entity(parseMethod)]
  else parseMethod = parser.module
  exp = parser.parse(code, parseMethod, 0, newEnv)
  exp = convert(exp.body, newEnv)

# use! with parseMethod #name [as alias], ..., from module as alias
# use! name [as alias], ... from module as alias
# use! module as alias
exports['use!'] = (exp, env) ->
  filePath = entity(exp[0])
  filePath = filePath.slice(1, filePath.length-1)
  taijiModule = new TaijiModule(filePath, env.module)
  alias = exp[1]; parseMethod = exp[2]; names = exp[3]
  if parseMethod then parseMethod = parser[entity(parseMethod)]
  else parseMethod = parser.module
  newEnv = env.extend(null, env.parser, taijiModule)
  raw = fs.readFileSync taijiModule.filePath, 'utf8'
  code = if raw.charCodeAt(0) is 0xFEFF then raw.substring 1 else raw
  exp = parser.parse(code, parseMethod, 0, newEnv)
  moduleFn =  ['->', ['$$taijiModule'], begin([exp.body, '$$taijiModule'])]
  useExp = ['call!', moduleFn, [['hash!']]]
  if not alias
    alias = env.ssaVar('module')
    env.set(alias.value, alias)
    useExp.push ['direct!', ['var', alias]]
  else
    useExp.push ['var', alias]
  useExp = ['=', alias, useExp]
  useExp = [useExp]
  metaNames = []
  for item in names
    [name, asName, inMeta] = item
    if inMeta then metaNames.push [name, asName]; continue
    asName = asName or name
    useExp.push ['var', asName]
    useExp.push ['=', asName, ['attribute!', alias, name]]
  resultExp = convert(begin(useExp), newEnv)
  tjExports = newEnv.module.exports
  for item in metaNames
    [name, asName] = item
    asName = entity(asName); name = entity(name)
    asName = asName or name
    if hasOwnProperty.call(tjExports, name)
      envValue = tjExports[name]
      env.set(asName, envValue)
    else error 'can not look up '+ name + ' from variable environment'
  resultExp

exports['export!'] = (exp, env) ->
  meta = env.meta
  isUsed = env.get('$$taijiModule')
  result = []
  for item in exp
    [name, value, inMeta] = item
    eName = entity(name)
    if inMeta
      if value
        if isUsed
          # meta.env ensure value can be compileExp and eval.
          env.module.exports[eName] = compileMetaListCode(value, env)
        else env.set(eName, eval(compileExp(value, meta.env)))
      else
        if isUsed then env.module.exports[eName] = env.get(eName)
        #else #nothing need to do, nam is just in the env
    else
      if value
        if isUsed then result.push ['=', ['attribute!', '$$taijiModule', name], value]
        else result.push ['=', ['attribute!', 'exports', name], value]
      else
        if isUsed then result.push ['=', ['attribute!', '$$taijiModule', name], name]
        else result.push ['=', ['attribute!', 'exports', name], name]
  convert begin(result), env

exports['direct!'] = (exp, env) -> exp[0]
exports['quote!'] = (exp, env) -> ['quote!', entity(exp[0])]

exports['call!'] = (exp, env) -> exp[1].unshift exp[0]; convert(exp[1], env)

exports['label!'] = (exp, env) -> ['label!', convertIdentifier(exp[0]), convert(exp[1], env)]

argumentsLength = ['attribute!', 'arguments', 'length']

convertParametersWithEllipsis = (exp, ellipsis, env) ->
  result = []; paramsLength = exp.length
  if ellipsis==paramsLength-1
    for param, i in exp
      result.push ['var', param]
      if i!=ellipsis then  result.push ['=', param, ['index!', 'arguments', i]]
      else result.push ['=', param, ['?:', ['>=', argumentsLength, paramsLength], makeSlice('arguments', i), []]]
  else
    result.push ['var', _i=env.newVar('i')]
    for param, i in exp
      result.push ['var', param]
      if i<ellipsis then result.push ['=', param, ['index!', 'arguments', i]]
      else if i==ellipsis
        result.push ['=', param, ['?:', ['>=', argumentsLength, paramsLength], makeSlice('arguments', i, ['=', _i,  ['-', argumentsLength, paramsLength-i-1]]), ['binary,', ['=', _i,ellipsis], []]]]
      else result.push ['=', param, ['index!', 'arguments', ['x++', _i]]]
  result

convertDefinition =  (exp, env, mode) ->
  newEnv = env.extend(scope={}, env.parser, env.module, {})
  if mode=='=>' or mode=='==>' or mode=='\\=>'
    _this = newEnv.newVar('_this')
    scope['@'] = _this
  else scope['@'] = 'this'
  exp0 = exp[0]; exp1 = exp[1]; defaultList = []
  for param, i in exp0
    param = entity(param)
    if param[0]=='x...'
      if not ellipsis? then ellipsis = i; exp0[i] = param[1]
      else error 'mulitple ellipsis parameters is not permitted'
    else if param[0]=='='
      defaultList.push param
      exp0[i] = param[1]
      # default parameter should not be ellipsis parameter at the same time
      # and this is the behavior in coffee-script too
#      if param[1][param[1][0]]=='x...'
#        if not ellipsis?
#          ellipsis = i
#          defaultList.push param
#          exp0[i] = param[1][...param[1].length-3]
#        else error 'mulitple ellipsis parameters is not permitted'
  if ellipsis!=undefined
    params = []
    body = convertParametersWithEllipsis(exp0, ellipsis, newEnv)
    body.push.apply body, defaultList
    body.push.apply body, exp1
  else
    params = for param, i in exp0 then param = entity(param); scope[param] = param
    body = defaultList
    body.push.apply body, exp1
  if mode[0]=='\\' then body =  convert(begin(body), newEnv)
  else body =  return_(convert(begin(body), newEnv))
  if mode=='=>' or mode=='\\=>' then result = ['begin!', ['=', _this, 'this'], ['function', params, body]]
  else result = ['function', params, body]
  result.env = newEnv
  result

exports['->'] = (exp, env) -> convertDefinition(exp, env, '->')
exports['\\->'] = (exp, env) -> convertDefinition(exp, env, '\\->')
exports['=>'] = (exp, env) -> convertDefinition(exp, env, '=>')
exports['\\=>'] = (exp, env) -> convertDefinition(exp, env, '\\=>')

convertMacro = (exp, env, mode) ->
  resultExp = convertDefinition(exp, env, mode)
  fnCode = transformToCode(resultExp, resultExp.newEnv)
  macroFn = eval '('+fnCode+')'
  macroFn.expression = exp
  #console.log fnCode
  (exp, env) -> expanded = macroFn(exp...); convert(expanded, env)

exports['-=>'] = (exp, env) -> convertMacro(exp, env, '-=>')
exports['\\-=>'] = (exp, env) -> convertMacro(exp, env, '\\-=>')


exports['unquote!'] = (exp, env) -> error('unexpected unquote!', exp)
exports['unquote-splice'] = (exp, env) -> error('unexpected unquote-splice', exp)
exports['quasiquote!'] =  quasiquote = (exp, env) ->
  exp0 = exp[0]
  if not isArray(exp0) then return ['quote!', entity(exp0)]
  else if not exp0.length then return []
  if (head=entity exp0[0])=='unquote!' or head=='unquote-splice' then return convert(exp0[1], env)
  result = ['list!']
  meetSplice = false
  for e in exp[0]
    if isArray(e) and e.length
      head = entity(e[0])
      if head=='unquote-splice'
        result = ['call!', ['attribute!', result, 'concat'], [convert(e[1], env)]]
        meetSplice = true
      else
        if not meetSplice
          if head=='unquote!' then result.push convert(e[1], env)
          else result.push quasiquote([e], env)
        else
          if head=='unquote!' then result = ['call!', ['attribute', result, 'concat'], [['list!', convert(e[1], env)]]]
          else result = ['call!', ['attribute!', result, 'concat'], [['list!', quasiquote([e], env)]]]
    else
      if not meetSplice then result.push JSON.stringify entity e
      else result = ['call!', ['attribute!', result, 'concat'], [['list!', JSON.stringify entity e]]]
  result

exports['eval!'] = (exp, env) ->
  exp0 = exp[0]
  if isArray(exp0)
    if exp0[0]=='quote!' then convert(exp0[1], env)
    else if exp0[0]=='quasiquote!' then convert(quasiquote(exp0[1], env), env)
    else ['call!', 'eval', [compileExp(exp0, env)]]
  else if typeof (exp0=entity(exp0)) =='string'
    if exp0[0]=='"'
      exp = (parser=new Parser).parse(exp0[1...exp0.length-1], parser.moduleBody, 0, env)
      objCode = compileExp(exp.body, env.extend({}))
      ['call!',  'eval', [objCode]]
    else ['call!', 'eval', exp0]
  else ['call!', 'eval', [compileExp(exp0, env)]]

compileMetaListCode = (exp, env) ->
  meta = env.meta
  meta.code.push compileExp ['=',['index!', ['jsvar!', 'metaList'], [meta.index]], exp], meta.env
  ['meta!', meta.index++]

exports['##'] = (exp, env) -> compileMetaListCode exp[0], env

exports['#'] = (exp, env) ->
  exp0 = exp[0]
  if exp0[0]=='if'
    exp0[2] = ['quote!', exp0[2]]
    exp0[3] = ['quote!', exp0[3]]
  # todo add more construct here ...
  compileMetaListCode exp0, env

# dynamic syntax, extend the parser on the fly
# the head of exp[0] will be convert to attribute of __$taiji_$_$parser__
exports['?/'] = (exp, env) ->
  convert(convertParserAttribute(exp[0]), env)

convertParserAttribute = (exp) ->
  if Object.prototype.toString.call(exp) == '[object Array]'
    if exp[0]=='attribute!' or exp[0]=='call!' or exp[0]=='index!'
      exp[1] = convertParserAttribute exp[1]
    exp
  else if typeof exp == 'object'
    if typeof exp.value=='string' and exp[0]!='"'
      result = ['attribute!', '__$taiji_$_$parser__', exp.value]
      extend result, exp
    else exp
  else exp

# identifier in exp[0] will be convert to attribute of __$taiji_$_$parser__
exports['?!'] = (exp, env) ->
  convert(convertParserExpression(exp[0]), env)

convertParserExpression = (exp) ->
  if Object.prototype.toString.call(exp) == '[object Array]'
    for e, i in exp then exp[i] = convertParserExpression e
    exp
  else if typeof exp == 'object'
    if typeof exp.value=='string' and exp[0]!='"'
      result = ['attribute!', '__$taiji_$_$parser__', exp.value]
      extend result, exp
    else exp
  else exp

exports['?attribute'] = (exp, env) ->
  convert(['attribute!', '__$taiji_$_$parser__', exp[0]], env)
