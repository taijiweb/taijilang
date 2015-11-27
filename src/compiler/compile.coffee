fs = require 'fs'
path = require 'path'
{evaljs, isArray, extend, str, formatTaijiJson, wrapInfo1, entity, pushExp, undefinedExp, begin} = require '../utils'

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
exports.transform = transform

{analyze} = require './analyze'
doAnalyze = (exp, env) ->
  env.optimizeInfoMap = {}
  analyze(exp, env)

{optimize} = require './optimize'
{tocode} = require './textize'
{Parser} = require '../parser'

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
    if not (result = env.get(exp))
      if exp.start
        throw exp.start+'('+exp.lineno+'): '+message+': \n'+text[exp.start-40...exp.start]+'|   |'+text[exp.start...exp.start+40]
      else error 'fail to look up symbol from environment:', exp
  else result = exp
  if typeof result=='function' then result
  else
    if exp==result then result
    else wrapInfo1 result, exp

exports.convertExps = convertExps = (exp, env) -> begin(for e in exp then convert e, env)
exports.convertList = (exp, env) -> for e in exp then convert(e, env)

# convert list! construct which contains x..., e.g. [x, y, z..., m]
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

TaijiModule = require '../module'
parser = new Parser

metaInclude = (exp, metaExpList, env) ->
  [exp, newEnv] = parseModule entity(exp[1]), env, exp[2]
  metaTransform(exp, metaExpList, env) # when including, necessary use the same "env"

preprocessMetaConvertFnMap =

  'include': metaInclude

  'if': (exp, metaExpList, env) ->
    ['if', metaTransform(exp[1], metaExpList, env),
     metaConvert(exp[2], metaExpList, env),
     metaConvert(exp[3], metaExpList, env)]

  # todo: # while, doWhile!, let, etc is not tested still
  'while': (exp, metaExpList, env) ->
    resultExpList = ['metaConvertVar!', 'whileResult']
    ['begin!',
     ['var', resultExpList],
     ['=', resultExpList, []],
     ['while', metaTransform(exp[1], metaExpList, env) # while test:exp[1] body,
      pushExp(resultExpList, metaConvert(exp[2], metaExpList, env))],
     resultExpList]

  #['doWhile!', body, condition]
  'doWhile!': (exp, metaExpList, env) ->
    resultExpList = ['metaConvertVar!', 'whileResult']
    ['begin!',
     ['var', resultExpList],
     ['=', resultExpList, []],
     ['doWhile!',
      pushExp(resultExpList, metaConvert(exp[1], metaExpList, env)),
      metaTransform(exp[2], metaExpList, env) # while test:exp[1] body
     ],
     resultExpList]
  # doUntil! is parsed to doWhile!

  'cFor!': (exp, metaExpList, env) ->
    resultExpList = ['metaConvertVar!', 'whileResult']
    ['begin!',
     ['var', resultExpList],
     ['=', resultExpList, []],
     ['cFor!',
        metaTransform(exp[1], metaExpList, env),
        metaTransform(exp[2], metaExpList, env),
        metaTransform(exp[3], metaExpList, env),
        pushExp(resultExpList, metaConvert(exp[4], metaExpList, env))
     ],
     resultExpList]

  'forIn!': (exp, metaExpList, env) ->
    resultExpList = ['metaConvertVar!', 'whileResult']
    ['begin!',
     ['var', resultExpList],
     ['=', resultExpList, []],
     ['forIn!',
      metaTransform(exp[1], metaExpList, env),
      metaTransform(exp[2], metaExpList, env),
      pushExp(resultExpList, metaConvert(exp[3], metaExpList, env))
     ],
     resultExpList]

  'forOf!': (exp, metaExpList, env) ->
    resultExpList = ['metaConvertVar!', 'whileResult']
    ['begin!',
     ['var', resultExpList],
     ['=', resultExpList, []],
     ['forOf!',
      metaTransform(exp[1], metaExpList, env),
      metaTransform(exp[2], metaExpList, env),
      pushExp(resultExpList, metaConvert(exp[3], metaExpList, env))
     ],
     resultExpList]

  'forIn!!': (exp, metaExpList, env) ->
    resultExpList = ['metaConvertVar!', 'whileResult']
    ['begin!',
     ['var', resultExpList],
     ['=', resultExpList, []],
     ['forIn!!',
      metaTransform(exp[1], metaExpList, env),
      metaTransform(exp[2], metaExpList, env),
      metaTransform(exp[3], metaExpList, env),
      pushExp(resultExpList, metaConvert(exp[4], metaExpList, env))
     ],
     resultExpList]

  'forOf!': (exp, metaExpList, env) ->
    resultExpList = ['metaConvertVar!', 'whileResult']
    ['begin!',
     ['var', resultExpList],
     ['=', resultExpList, []],
     ['forOf!!',
      metaTransform(exp[1], metaExpList, env),
      metaTransform(exp[2], metaExpList, env),
      metaTransform(exp[3], metaExpList, env),
      pushExp(resultExpList, metaConvert(exp[4], metaExpList, env))
     ],
     resultExpList]

  'let': (exp, metaExpList, env) ->
    ['let',
     metaTransform(exp[1], metaExpList, env) #bindings is in meta level
     metaConvert(exp[2], metaExpList, env)]
  # {do ... where binding} is parsed to let binding body

  'letrec!': (exp, metaExpList, env) ->
    ['letrec!',
     metaTransform(exp[1], metaExpList, env) #bindings is in meta level
     metaConvert(exp[2], metaExpList, env)]

  # do not consider letloop! while preprocessing
  #'letloop!': (exp, metaExpList, env) ->

  # todo add more construct here ...

taijiExports = ['jsvar!', 'exports']

# use index! so taiji identifier like undefined? will not be illegal in javascript
# if use 'attribute!' then "exports.undefined?" will be illegel javascript code
exportsIndex = (name) -> ['index!',taijiExports , '"'+entity(name)+'"']

parseModule = (modulePath, env, parseMethod) ->
  filePath = modulePath.slice(1, modulePath.length-1)
  taijiModule = new TaijiModule(filePath, env.module)
  newEnv = env.extend(null, env.parser, taijiModule)
  raw = fs.readFileSync taijiModule.filePath, 'utf8'
  code = if raw.charCodeAt(0) is 0xFEFF then raw.substring 1 else raw
  if parseMethod then parseMethod = parser[entity(parseMethod)]
  else parseMethod = parser.module
  exp = parser.parse(code, parseMethod, 0, newEnv)
  [exp.body, newEnv]

wrapModuleFunctionCall = (exp, moduleVar) ->
  ['=', moduleVar, ['call!', ['|->', [], begin([['=', taijiExports, ['hash!']], exp, ['return', taijiExports]])], []]]

wrapMetaObjectFunctionCall = (exp, metaExpList, env, metaModuleAlias, objectModuleAlias) ->
  # the object function wrapper should be metaConverted,
  # which generate ['list!', '|->'(index form), ..., some meta pieces, ...]
  #metaModuleVar = metaModuleAlias or (v=env.newTaijiVar('__taiji$Module__'))
  if objectModuleAlias
    objectModuleVar = objectModuleAlias
    objectModuleInMetaLevel = metaConvert(wrapModuleFunctionCall(exp, objectModuleVar), metaExpList, env)
  else
    objectModuleVar = ['metaConvertVar!', 'module']
    objectModuleInMetaLevel = metaConvert(['begin!', ['var', objectModuleVar], wrapModuleFunctionCall(exp, objectModuleVar)], metaExpList, env)
  # all of part of the generated expression by below action is prepared meta level expression as they are.
  # so metaTransform need not be called
  if metaModuleAlias
    metaModuleVar = metaModuleAlias
    wrapModuleFunctionCall(exp, metaModuleVar)
  else
    metaModuleVar = ['metaConvertVar!', 'module']
    ['begin!', ['var', metaModuleVar], wrapModuleFunctionCall(objectModuleInMetaLevel, metaModuleVar)]

metaConvertExport = (exp, metaExpList, env) ->
  result = []
  for item in exp[1...]
    [name, value, runtime, compileTime] = item
    # !!! should not env.get or do other transformation to the name
    # because the name would be the attribute of the exports object
    # not in the variable scope
    if value is undefined then value = name
    if compileTime then result.push metaTransform(['=', exportsIndex(name), value], metaExpList, env)
    if runtime then result.push metaConvert(['=', exportsIndex(name), value], metaExpList, env)
  begin(result)

includeModuleFunctionCall = (exp, metaExpList, env, runtimeModuleAlias, metaModuleAlias) ->
  runtimeBody = ['metaConvertVar!', 'runtimeBody']
  runtimeFunctionCall = metaConvert(['begin!',
   ['var', runtimeModuleAlias],
   ['=', runtimeModuleAlias, ['call!', ['->', [], ['begin!',
      ['=',  'exports',['hash!']],
      exp,
      'exports']], []]]], metaExpList, env)
  # meta level expression
  begin [
   ['var', runtimeBody],
   ['var', metaModuleAlias],
   ['=', metaModuleAlias, ['call!', ['->', [], ['begin!',
     ['=', 'exports', ['hash!']],
     ['=', ['@@', runtimeBody], runtimeFunctionCall],
     'exports']], []]],
   runtimeBody]

# import! with parseMethod #name [as alias], ..., from module as alias
# import! name [as alias], ... from module as alias
# import! module as alias
metaConvertImport = (exp, metaExpList, env) ->
  [cmd, filePath, parseMethod, runtimeModuleAlias, metaModuleAlias, importItemList, metaImportItemList] = exp
  [exp, newEnv] = parseModule entity(filePath), env, parseMethod
  if not metaModuleAlias then metaModuleAlias = ['metaConvertVar!', 'module']
  if not runtimeModuleAlias then runtimeModuleAlias = ['metaConvertVar!', 'module']
  fnCall = includeModuleFunctionCall(exp, metaExpList, env, runtimeModuleAlias, metaModuleAlias)
  moduleFnCall = ['metaConvertVar!', 'moduleFnCall']
  metaBegin = metaConvert('begin!', metaExpList, env)
  compileTimeAssignList = []; runtimeAssignList = []
  for [name, asName] in metaImportItemList
    compileTimeAssignList.push ['=', asName, ['index!', metaModuleAlias, '"'+entity(name)+'"']]
  compileTimeAssignList = begin(compileTimeAssignList)
  for [name, asName] in importItemList
    runtimeAssignList.push ['=', asName, ['index!', runtimeModuleAlias, '"'+entity(name)+'"']]
  runtimeAssignList = metaConvert(begin(runtimeAssignList), metaExpList, env)
  ['begin!'
   ['var', moduleFnCall]
   ['=', moduleFnCall, fnCall],
   compileTimeAssignList,
   ['list!', metaBegin, moduleFnCall, runtimeAssignList]]

include = (exp, metaExpList, env) ->
  [exp, newEnv] = parseModule entity(exp[1]), env, exp[2]
  metaConvert(exp, metaExpList, env)

# process code which is hybrid of object and meta level
# exp(like [#..., ], [include!, x], ...) is hybrid code
# x is known at meta level
metaConvertFnMap =
  # directly evaluate in meta leval
  '##': (exp, metaExpList, env) -> metaTransform exp[1], metaExpList, env

   # evaluate in both meta and object level
  '#/': (exp, metaExpList, env) ->
    result = metaTransform exp[1], metaExpList, env
    metaExpList.push result
    begin [result, $atMetaExpList(env.metaIndex++)]

  # #& metaConvert exp and get the current expression(not metaConverted raw program)
  '#&': (exp, metaExpList, env) ->
    result = metaTransform(exp[1], metaExpList, env)
    # notice the difference between #& and #/
    # here exp[1] is raw object level expression,
    # but in "#/" metaExpList.push result instead
    metaExpList.push exp[1]
    begin([result, $atMetaExpList(env.metaIndex++)])

  # assign in meta level, same as
  '#=': (exp, metaExpList, env) ->
    metaTransform ['=', exp[1], exp[2]], metaExpList, env

  '#/=': (exp, metaExpList, env) ->
    result = metaTransform ['=', exp[1], exp[2]], metaExpList, env
    metaExpList.push result
    begin([result, $atMetaExpList(env.metaIndex++)])

  # #&= assign the object level program to meta variable( not metaConverted raw program)
  '#&=': (exp, metaExpList, env) ->
    exp2 = metaTransform(exp[2], metaExpList, env)
    metaExpList.push exp[2]
    begin [exp2, ['=', exp[1], $atMetaExpList(env.metaIndex++)]]

  '#': (exp, metaExpList, env) ->
    exp1 = exp[1]
    if Object.prototype.toString.call(exp1) == '[object Array]'
      if not exp1.length then return exp[1]
      else if fn = preprocessMetaConvertFnMap[exp1[0]]
        return fn(exp1, metaExpList, env)
      else return metaTransform exp1, metaExpList, env
    else metaTransform exp1, metaExpList, env

  # exit meta level while parsing meta
  '#-': (exp, metaExpList, env) ->
    error 'unexpected meta operator #-', ''
#    x = metaConvert(exp[1], metaExpList, env)
#    metaExpList.push x
#    $atMetaExpList(env.metaIndex++)

  # macro call
  '#call!': (exp, metaExpList, env) ->
    args = []
    for e in exp[2]
      metaExpList.push metaTransform(e, metaExpList, env)
      args.push $atMetaExpList(env.metaIndex++)
    #console.log code.text
    ['call!', metaTransform(exp[1], metaExpList, env), args]

  'export!': metaConvertExport
  'include!': include
  'import!': metaConvertImport

# whehter head is a operator for meta expression?
isMetaOperation = (head) -> (head[0]=='#' and head[1]!='-') or head=='include!' or head=='import!' or head=='export!'

# should be called by metaConvert while which is processing meta level code
# exp should be the code which is known being at meta level.
metaTransform = (exp, metaExpList, env) ->
  if Object.prototype.toString.call(exp) == '[object Array]'
    if exp.length==0 then return exp
    head=entity(exp[0])
    # todo: #call may need special process
    if head=='#call!'
      return ['list!', '"metaEval!"', metaConvert(exp, metaExpList, env)]
    if head and isMetaOperation(head)
      # no recursive embedded meta compilation
      metaConvert(exp, metaExpList, env)
    else if typeof head == 'string' and head[..2]=='#-'
      #if exp[1] is array, will be unshifted 'list!' or get index form
      metaConvert exp[1], metaExpList, env
    else for e in exp
      # contrary to metaConvert, no list! is unshifted and not index form
      metaTransform(e, metaExpList, env)
  else return exp

# whether exp contains any meta operations?
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
          if isMetaOperation(e0) then exp.hasMeta = true; return true
        if hasMeta(e) then exp.hasMeta = true; return true
  exp.hasMeta = false
  return false

# meta convert a hybrid meta and object level expression to a meta level expression, which will be the parameter of "convert" function.
# all meta expression will be compiled to javascript code,
# but original object level expression will be transformed to a _tjExp parameter index expression of the meta leval javascript function
exports.metaConvert = metaConvert = (exp, metaExpList, env) ->
  if Object.prototype.toString.call(exp) == '[object Array]'
    if exp.length==0 then return []
    exp0 = entity exp[0]
    if fn=metaConvertFnMap[exp0] then return fn(exp, metaExpList, env)
    else
      # contrary to metaConvert, list! is unshifted to the head of exp and e is transformed to index form when necessary
      if hasMeta(exp)
        result = ['list!']
        for e, i in exp then result.push metaConvert(e, metaExpList, env)
        return result
      else metaExpList.push exp; return $atMetaExpList(env.metaIndex++)
  else metaExpList.push exp; return $atMetaExpList(env.metaIndex++)

# metaConvert expression to meta level and compile to javascript function code
# evaluate the function with the object expression pieces list as argument
# and get the object level expression to wait convert and compile to object level javascript code
exports.metaCompile = metaCompile = (exp, metaExpList, env) ->
  # env = env.extend({}) # env is not used in metaCompile phase
  # todo: remove the parameter "env" from metaCompile, metaConvert and metaTransform ...
  env.metaIndex = 0 #todo: Instead of member of env, metaIndex may become a global variable
  exp = metaConvert exp, metaExpList, env
  code = nonMetaCompileExp(['=', ['attribute!', 'module', 'exports'], ['->', ['__tjExp'], ['return', exp]]], env)

# metaConvert expression to meta level and compile to javascript function code
# evaluate the function with the object expression pieces list as argument
# and get the object level expression to wait convert and compile to object level javascript code
exports.metaProcess = metaProcess = (exp, env) ->
  env = env.extend({}) # this line is necessary to avoid put the mete variable in the runtime scope.
  code = metaCompile(exp, metaExpList=[], env)
  compiledPath = path.join process.cwd(), '/lib/compiler/metacompiled.js'
  fs.writeFileSync(compiledPath, code)
  delete require.cache[require.resolve(compiledPath)]
  metaFn = require(compiledPath)
  #console.log code
  metaFn(metaExpList)

exports.nonMetaCompileExp = nonMetaCompileExp = (exp, env) ->
  exp = convert exp, env
  #console.log formatTaijiJson entity exp
  exp = transform exp, env
  doAnalyze exp, env
  exp = optimize exp, env
  exp = tocode exp, env
  exp

exports.compileExp = compileExp = (exp, env) ->
  exp = metaProcess(exp, env)
  exp = nonMetaCompileExp exp, env

exports.nonMetaCompileExpNoOptimize = nonMetaCompileExpNoOptimize = (exp, env) ->
  exp = convert exp, env
  exp = transform exp, env
  exp = tocode exp, env
  exp

exports.compileExpNoOptimize = compileExpNoOptimize = (exp, env) ->
  exp = metaProcess exp, env
  exp = nonMetaCompileExpNoOptimize exp, env
  exp

# metaProcess, convert and transform the expression
exports.transformExp = transformExp = (exp, env) ->
  exp = metaProcess exp, env
  exp = convert exp, env
  exp = transform exp, env
  exp

# transform and optimize expression
exports.transformToCode = transformToCode = (exp, env) ->
  exp = transform exp, env
  doAnalyze exp, env
  exp = optimize exp, env
  exp = tocode exp, env
  exp

exports.optimizeExp = optimizeExp = (exp, env) ->
  exp = metaProcess exp, env
  exp = convert exp, env
  exp = transform exp, env
  doAnalyze exp, env
  exp = optimize exp, env
  exp

