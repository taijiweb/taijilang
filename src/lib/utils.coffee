fs = require('fs')
path = require('path')

stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/gi
stackReg2 = /at\s+()(.*):(\d*):(\d*)/gi

_trace = (stackIndex, args) ->
  argsStr = ''
  for arg in args
    if argsStr=='' or argsStr[argsStr.length-2...]==': ' or argsStr[argsStr.length-1]==':' then argsStr += arg.toString()
    else argsStr += ', '+ arg.toString()
  stacklist = (new Error()).stack.split('\n').slice(3)
  s = stacklist[stackIndex]
  sp = stackReg.exec(s) || stackReg2.exec(s)
  if sp && sp.length == 5
    method = sp[1]
    file = path.basename(sp[2])
    line = sp[3]
    pos = sp[4]
    fs.appendFileSync("./debug.log", file+': '+method+': '+line+':'+pos+': '+argsStr+'\r\n')
  else
    fs.appendFileSync("./debug.log", 'noname:  noname: xx: yy: '+argsStr+'\r\n')

exports.log = log = (level, args...) -> _trace(level, args); console.log(args...)
exports.trace = trace = (args...) ->  _trace(0, args)
exports.trace0 = trace0 = (args...) -> _trace(0, args)
exports.trace1 = trace1 = (args...) -> _trace(1, args)
exports.trace2 = trace2 = (args...) -> _trace(2, args)
exports.trace3 = trace3 = (args...) -> _trace(3, args)

exports.charset = charset = (string) ->
  result = {}
  for c in string then result[c] = true
  result

exports.digits = digits = '0123456789'
exports.lowers = lowers = 'abcdefghijklmnopqrstuvwxyz'
exports.uppers = uppers = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
exports.letters = letters = lowers+uppers
exports.letterDigits = letterDigits = letters+digits
exports.letterDigitSet = charset letterDigits
exports.firstIdentifierChars = firstIdentifierChars = '$_'+letters
exports.identifierChars = identifierChars = firstIdentifierChars+digits
exports.taijiIdentifierChars = taijiIdentifierChars = '!?'+identifierChars
exports.digitCharSet = digitCharSet = charset(exports.digits)
exports.letterCharSet = letterCharSet = charset(exports.letters)
exports.firstIdentifierCharSet = charset('$_'+letters)
exports.identifierCharSet = identifierCharSet = charset(identifierChars)
exports.taijiIdentifierCharSet = taijiIdentifierCharSet = charset(taijiIdentifierChars)
exports.taijiIdentifierCharSet = taijiIdentifierCharSet = charset(taijiIdentifierChars)
exports.firstSymbolChars = firstSymbolChars = '!#%^&*-+=?<>|~`'
exports.firstSymbolCharset = charset(firstSymbolChars)

# is head a operator for meta expression?
isMetaOperation = isMetaOperation = (head) -> (head[0]=='#' and head[1]!='-') or head=='include!' or head=='import!' or head=='export!'

isArray = (item) -> item instanceof Array

exports.str = str = (item) ->
  if isArray(item) then '['+(str(x) for x in item).join(' ')+']'
  else if typeof item =='object'
    if item.symbol? then item.symbol
    else str(item.value)
  else if item==undefined then 'undefined'
  else if item==null then 'null'
  else item.toString()

exports.assert = assert = (value, message) ->
  if not value
    trace2('assert:', message or 'assert failed')
    throw new Error message or 'assert failed'

exports.error = error = (message, symbol) ->
  if symbol then throw message+': '+symbol else throw message

exports.hasOwnProperty = Object.hasOwnProperty

exports.debugging = false
exports.testing = false
exports.debug = (message) -> if exports.debugging then console.log message
exports.warn = (message) -> if exports.debugging or exports.testing then console.log message

exports.convertIdentifier = (name) ->
  result = ''
  for c in entity(name)
    if c=='!' or c=='?' or c=='#' then result += '$' else result += c
  result

exports.splitSpace = (text) ->
  result = []; i = 0; word = ''
  while 1
    c = text[i++]
    if c==' ' or c=='\t' or c=='\n' or c=='\r' then if word then result.push word; word = ''
    else if not c then (if word then result.push word; word = ''); if not c then break
    else word += c
  result

exports.extend = (object, args...) ->
  if !object then return object;
  for arg in args then(for key, value of arg then object[key] = value)
  object

exports.mergeSet = (sets...) ->
  result = {}
  for x in sets
    for k in x
      if hasOwnProperty.call(x, k) then result[k] = true
  result

# return value:
# undefined: meet return, throw, break, continue
# value, symbol: meet value or symbol
# true: meet list
addBeginItem = (result, exp) ->
  if exp not instanceof Array then return exp
  exp0 = exp[0]
  if exp0=='begin!'
    for e in exp[1...]
      last = addBeginItem(result, e)
      if not last then return
    return last
  else if exp0=='return' or exp0=='throw' or exp0=='break' or exp0=='continue'
    result.push(exp); return
  else result.push exp; return true

exports.begin = begin = (exp) ->
    result = []
    for e in exp
      last = addBeginItem(result, e)
      if not last then break
    if last and last!=true then result.push last
    if result.length>1 then result.unshift 'begin!'; return (result)
    else if result.length==1 then return result[0]
    else return undefinedExp

returnFnMap =
  'break': (exp) -> exp
  'continue': (exp) -> exp
  'throw': (exp) -> exp
  'begin!': (exp) -> exp[exp.length-1] = return_(exp[exp.length-1] ); exp
  'if': (exp) ->
    exp[2] =  return_(exp[2])
    if exp[3] then exp[3] =  return_(exp[3])
    exp
  'switch': (exp) ->
    for case_ in exp[2] then case_[1] = return_(case_)
    exp[3] = return_(exp[3])
    exp
  # c-for, for-in, for-of, while, doWhile: use transformExpression
  'try': (exp) ->
    exp[1] =  return_(exp[1]) #test
    # exp[2]: catch var
    exp[3] = return_(exp[3]) #catch body
    exp[4] = return_(exp[4]) #finally body
    exp
  'letloop': (exp) -> exp[3] = return_(exp[3]); exp

exports.return_ = return_ = (exp) ->
  if not exp then return exp
  if not exp.push then return [('return'), exp]
  if fn=returnFnMap[exp[0]] then return fn(exp)
  [('return'), exp]

exports.pushExp = (lst, v) ->  ['call!', ['attribute!', lst, 'push'], [v]]
exports.notExp = (exp) ->  ['prefix!', '!', exp]

exports.isUndefinedExp = -> (exp) -> exp==undefinedExp

# get the truth value of exp under env
# 0: truth value is unknown
# 1: truth value is true
# 2: truth value is false
# todo: use kind(VALUE, SYMBOL, LIST) to optimize the code below
truth = (exp, env) ->
  exp = entity(exp)
  if not exp? then return 2-!!exp
  if typeof exp == 'string'
    if exp[0]=='"' then return 2-!!exp[1...exp.length-1]
    else return
  else if exp.push then return
  return 2-!!exp

exports.addPrelude = (parser, body) ->
  # return body
  result = []
  #if parser.meetEllipsis then result.push ['=', '__slice', ['attribute!', [], 'slice']]
  #result.push ['var', '__slice']
  #result.push ['#/=', '__slice', ['attribute!', [], 'slice']]
  #result.push ['var', '__hasProp']
  #result.push ['#/=', '__hasProp', ['attribute!', ['hash!'], 'hasOwnProperty']]

  #result.push ['include!', '"prelude.tj"']
  #result.push ['directLineComment!', '/// end of prelude']
  #result.push body
  #begin(result)
  body

exports.realCode = (code) ->
  endModuleText = '/// end of prelude;\n'
  if ((realCodePos=code.indexOf(endModuleText))>=0)
    if code[code.length-1]==';'then code.slice(realCodePos+endModuleText.length, code.length-1)
    else code.slice(realCodePos+endModuleText.length)
  else code

exports.dict = (pairs...) ->
  d = {}; i = 0; pairsLength = pairs.length
  while i<pairsLength
    d[pairs[i]] = pairs[i+1]
    i += 2
  d

exports.list2dict = (keys...) ->
  d = {}
  for k in keys then d[k] = 1
  d

# pretty print internal result
exports.formatTaijiJson = formatTaijiJson = (exp, level, start, newline, indent, lineLength) ->
  if newline then head = repeat(repeat(' ', indent), level)
  else head = ''
  body = JSON.stringify(exp)
  if start+(x=(head+body)).length<lineLength then return x
  result = head
  if Object.prototype.toString.call(exp) == '[object Array]'
    exp0 = exp[0]
    result += '['+ formatTaijiJson(exp0, level, 0, false, indent, lineLength)
    if exp0=='begin!' or exp0=='do'
      for x, i in exp.slice(1)
        result += ',\n'+formatTaijiJson(x, level+1, 0, true, indent, lineLength)
    else if exp0=='if'
      result += ', '+formatTaijiJson(exp[1], level, result.length, false, indent, lineLength)
      result += ',\n'+formatTaijiJson(exp[2], level+1, 0, true, indent, lineLength)
      if exp[3] then result += ',\n'+formatTaijiJson(exp[3], level+1, 0, true, indent, lineLength)
    else if exp0
      if exp0[exp0.length-1]=='='
        result += ', '+formatTaijiJson(exp[1], level+1, result.length, false, indent, lineLength)
        result += ',\n'+formatTaijiJson(exp[2], level+1, 0, true, indent, lineLength)
      else if exp0.slice and ((x=exp0[exp0.length-2...])=='->' or x=='=>')
        result += ', '+formatTaijiJson(exp[1], level, result.length, false, indent, lineLength)
        result += ',\n'+formatTaijiJson(exp[2], level+1, 0, true, indent, lineLength)
      else
        for x in exp[1...]
          if result.length>40
            result += '\n'+formatTaijiJson(x, level+1, 0, true, indent, lineLength)
          else result += ','+formatTaijiJson(x, level, result.length, false, indent, lineLength)
    else
      for x in exp[1...]
        if result.length>40
          result += '\n'+formatTaijiJson(x, level+1, 0, true, indent, lineLength)
        else result += ','+formatTaijiJson(x, level, result.length, false, indent, lineLength)
    return result+']'
  else JSON.stringify(exp)

# transform.coffee: merge list of variable list
exports.mergeList = (lists...) ->
  list0 = lists[0]
  for l in lists then list0.push.apply list0, l
  list0

# A `.taiji.md` compatible version of `basename`, that returns the file sans-extension.
exports.baseFileName = (file, stripExt = no, useWinPathSep = no) ->
  pathSep = if useWinPathSep then /\\|\// else /\//
  parts = file.split(pathSep)
  file = parts[parts.length - 1]
  return file unless stripExt and file.indexOf('.') >= 0
  parts = file.split('.')
  parts.pop()
  parts.pop() if (parts[parts.length - 1] is 'taiji' or parts[parts.length - 1] is 'tj') and parts.length > 1
  parts.join('.')

# Determine if a filename represents a taiji file.
exports.isTaiji = (file) -> /\.(taiji|tj|taiji.json|tj.json)$/.test file

