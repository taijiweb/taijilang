###
  this file is based on coffeescript/src/helper.coffee(https://github.com/jashkenas/coffeescript)
  Thanks to  Jeremy Ashkenas
  Some stuffs is added or modified for taiji langauge.
###
###
Copyright (c) 2009-2014 Jeremy Ashkenas
Copyright (c) 2014-2015 Caoxingming

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
###

# This file contains the common helper functions that we'd like to share among
# the **Lexer**, **Rewriter**, and the **Nodes**. Merge objects, flatten
# arrays, count characters, that sort of thing.
#

exports.str = str = (item) ->
  if isArray(item) then '['+(str(x) for x in item).join(' ')+']'
  else if not item? then 'undefined'
  else if item.value? then item.value.toString()
  else item.toString()

exports.isArray = isArray = (exp) -> Object::toString.call(exp) == '[object Array]'

exports.extend = extend = (object, args...) ->
  if !object then return object;
  for arg in args then(for key, value of arg then object[key] = value)
  object

exports.error = error = (message, symbol) ->
  if symbol then throw message+': '+symbol else throw message

exports.hasOwnProperty = Object.hasOwnProperty

exports.debugging = false
exports.testing = false
exports.debug = (message) -> if exports.debugging then console.log message
exports.warn = (message) -> if exports.debugging or exports.testing then console.log message

exports.str = str = (item) ->
  if isArray(item) then '['+(str(x) for x in item).join(' ')+']'
  else if not item? then 'undefined'
  else if item.symbol? then item.symbol
  else if item.value? then str(item.value)
  else item.toString()

exports.charset = (string) ->
  result = {}
  for c in string then result[c] = true
  result

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

exports.isArray = isArray = (exp) -> Object::toString.call(exp) == '[object Array]'

exports.entity = entity = (exp) ->
  if not exp then return exp
  if exp.push
    if exp.length==0 then return exp
    else return (for e in exp then entity e)
  if typeof exp == 'object'
    return exp.symbol or entity(exp.value)
    #if (type=exp.type)==NUMBER or type==NON_INTERPOLATE_STRING or type==IDENTIFIER then return exp.value
  else if typeof exp == 'string' then return exp
  else return exp

exports.isValue = isValue = (exp, env) ->
  if not exp then return true
  if exp.push then return false
  exp = entity(exp)
  if typeof exp == 'string'
    if exp[0]=='"' then return true
    else return false
  return true

addBeginItem = (result, e) ->
  if e and e.push and e[0]=='begin!'
    for x in e[1...] then addBeginItem(result, x)
  else result.push e

exports.begin = begin = (exp) ->
  result = []
  for e in exp then addBeginItem(result, e)
  length = result.length; i = length-1
  while --i>=0
    e = result[i]
    if not e or isValue(e) or not (x=entity(e)) or typeof x=='string' or e==undefinedExp
      result.splice(i, 1)
    else if (e0=e[0]) and (e0=='return' or e0=='throw' or e0=='break' or e0=='continue')
      result.splice(i+1, result.length)
  if result.length==0 then undefined
  else if result.length==1 then result[0]
  else result.unshift 'begin!'; result

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
  if not exp.push then return ['return', exp]
  if fn=returnFnMap[exp[0]] then return fn(exp)
  ['return', exp]

exports.pushExp = (lst, v) -> ['call!', ['attribute!', lst, 'push'], [v]]
exports.notExp = (exp) -> ['prefix!', '!', exp]
exports.undefinedExp = undefinedExp = ['prefix!', 'void', 0]

exports.addPrelude = (parser, body) ->
  # return body
  result = []
  #if parser.meetEllipsis then result.push ['=', '__slice', ['attribute!', [], 'slice']]
  #result.push ['var', '__slice']
  #result.push ['#/=', '__slice', ['attribute!', [], 'slice']]
  #result.push ['var', '__hasProp']
  #result.push ['#/=', '__hasProp', ['attribute!', ['hash!'], 'hasOwnProperty']]
  result.push ['include!', '"prelude.tj"']
  result.push ['directLineComment!', '/// end of prelude']
  result.push body
  begin(result)

exports.realCode = (code) ->
  endModuleText = '/// end of prelude;\n'
  if ((realCodePos=code.indexOf(endModuleText))>=0)
    if code[code.length-1]==';'then code.slice(realCodePos+endModuleText.length, code.length-1)
    else code.slice(realCodePos+endModuleText.length)
  else code

exports.wrapInfo1 = (exp, info) ->
  if typeof exp != 'object' then exp = {value: exp}
  exp.start = info.start; exp.line1 = info.line1
  exp.stop = info.stop; exp.line = info.line
  exp

exports.wrapInfo2 = (exp, first, last) ->
  if typeof exp != 'object' then exp = {value: exp}
  exp.start = first.start; exp.line1 = first.line1
  exp.stop = last.stop; exp.line = last.line
  exp

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

# the above is coded by Caoxingming

# the below is from github.com/jashkenas/coffeescript and modified by Caoxingming

# Merge objects, returning a fresh copy with attributes from both sides.
# Used every time `Base#compile` is called, to allow properties in the
# options hash to propagate down the tree without polluting other branches.
exports.merge = (options, overrides) ->
  extend (extend {}, options), overrides

# Return a flattened version of an array.
# Handy for getting a list of `children` from the nodes.
exports.flatten = flatten = (array) ->
  flattened = []
  for element in array
    if element instanceof Array
      flattened = flattened.concat flatten element
    else
      flattened.push element
  flattened

# Typical Array::some
exports.some = Array::some ? (fn) ->
  return true for e in this when fn e
  false

# Merge two jison-style location data objects together.
# If `last` is not provided, this will simply return `first`.
buildLocationData = (first, last) ->
  if not last
    first
  else
    first_line: first.first_line
    first_column: first.first_column
    last_line: last.last_line
    last_column: last.last_column

# Convert jison location data to a string.
# `obj` can be a token, or a locationData.
exports.locationDataToString = (obj) ->
  if ("2" of obj) and ("first_line" of obj[2]) then locationData = obj[2]
  else if "first_line" of obj then locationData = obj

  if locationData
    "#{locationData.first_line + 1}:#{locationData.first_column + 1}-" +
    "#{locationData.last_line + 1}:#{locationData.last_column + 1}"
  else
    "No location data"

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

# Throws a SyntaxError from a given location.
# The error's `toString` will return an error message following the "standard"
# format <filename>:<line>:<col>: <message> plus the line with the error and a marker showing where the error is.
exports.throwSyntaxError = (message, location) ->
  error = new SyntaxError message
  error.location = location
  error.toString = syntaxErrorToString
  # Instead of showing the compiler's stacktrace, show our custom error message
  # (this is useful when the error bubbles up in Node.js applications that compile taiji for example).
  error.stack = error.toString()
  throw error

# Update a compiler SyntaxError with source code information if it didn't have it already.
exports.updateSyntaxError = (error, code, filename) ->
  # Avoid screwing up the `stack` property of other errors (i.e. possible bugs).
  if error.toString is syntaxErrorToString
    error.code or= code
    error.filename or= filename
    error.stack = error.toString()
  error

syntaxErrorToString = ->
  return Error::toString.call @ unless @code and @location

  {first_line, first_column, last_line, last_column} = @location
  last_line ?= first_line
  last_column ?= first_column

  filename = @filename or '[stdin]'
  codeLine = @code.split('\n')[first_line]
  start    = first_column
  # Show only the first line on multi-line errors.
  end      = if first_line is last_line then last_column + 1 else codeLine.length
  marker   = repeat(' ', start) + repeat('^', end - start)

  # Check to see if we're running on a color-enabled TTY.
  if process? then colorsEnabled = process.stdout.isTTY and not process.env.NODE_DISABLE_COLORS

  if @colorful ? colorsEnabled
    colorize = (str) -> "\x1B[1;31m#{str}\x1B[0m"
    codeLine = codeLine[...start] + colorize(codeLine[start...end]) + codeLine[end..]
    marker   = colorize marker

  """
    #{filename}:#{first_line + 1}:#{first_column + 1}: error: #{@message}
    #{codeLine}
    #{marker}
  """

# Repeat a string `n` times.
exports.repeat = repeat = (str, n) ->
  # Use clever algorithm to have O(log(n)) string concatenation operations.
  res = ''
  while n > 0
    res += str if n & 1
    n >>>= 1
    str += str
  res


javascriptKeywordText = ("break export return case for switch comment function this continue if typeof default import" +
" var delete in void do label while else new with catch enum throw class super extends try const finally debugger")
exports.javascriptKeywordSet = javascriptKeywordSet = {}
do ->
  for w in javascriptKeywordText.split(' ')
    javascriptKeywordSet[w] = 1

