{str, isArray, extend, entity, charset, begin, undefinedExp, isValue} = require '../utils'

{digitCharSet, letterCharSet, identifierCharSet} = require '../parser/base'

PAREN=1; BRACKET = 2; CURVE=3; LIST=4; STATEMENT_LIST=5; WRAP_BLOCK=6; BLOCK=7; MAYBE=8; STATEMENT=9;
CLAUSE=10; COMPOUND=11; FUNCTION=12; SEQUENCE = 13; LINE = 14; INDENT = 15; UNDENT = 16; BINARY = 17
tokenNameMap = {PAREN, BRACKET, CURVE, LIST, STATEMENT_LIST, WRAP_BLOCK, BLOCK, MAYBE, STATEMENT,
CLAUSE, COMPOUND, FUNCTION, SEQUENCE, LINE, INDENT, UNDENT, BINARY}

paren = (exp) -> {kind: PAREN, value: exp}
bracket = (exp) -> {kind: BRACKET, value: exp}
curve = (exp) -> {kind: CURVE, value: exp}
line = {kind: LINE}
indentToken = (width) -> {kind: INDENT, value: width}
undentToken = (width) -> {kind: UNDENT, value: width}
ind = {kind: INDENT}
und = {kind: UNDENT}
binary = (exp) -> {kind: BINARY, value: exp}
sequence = (exp) -> {kind: SEQUENCE, value: token(e) for e in exp}
list = (exp) -> {kind: LIST, value: token(e) for e in exp}
maybe = (test, exp) -> if test then exp else ''
clause = (exps...) -> {kind: CLAUSE, value: exps}
statement = (exp) ->
  t = token(exp)
  if t.kind==STATEMENT or t.kind==STATEMENT_LIST then t
  else {kind: STATEMENT, value: t}
compound = (exps...) -> {kind: STATEMENT, value: exps, compound: true}
statementList = (exp) -> {kind: STATEMENT_LIST, value: token(e) for e in exp}
block = (exp) -> {kind: BLOCK, value: exp}
wrapBlock = (exp) -> {kind: WRAP_BLOCK, value: exp}
func = (exps...) -> {kind: FUNCTION, value: exps, function:true}
setFunction = (depend, exp) ->
  if depend.function then exp.function = true
  exp
priority = (exp, pri) -> exp.pri = pri; exp

###
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
0 () 1. [] 2 new 3 ++ -- 4 ! ~ unary + - typeof void delete
5 * / %   6 + -  7 << >> >>>   8 < <= > >= in instanceof  9 == != === !==  10 & 11 ^ 12 |  13 && 14  || 15 ?:
16 yield right-to-left, 17 right-to-left += -=  *=  /=  %=  <<= >>= >>>= &= ^= |=, 18 comma ,
###
binaryPriority = {'*':5, '/':5, '%':5, '+':6, '-':6, '<<':7, '>>':7, '>>>':7
'<':8, '>':8, '>=':8, '<=':8, 'in':8, 'instanceof':8, '==':9, '===':9, '!=':9, '!==':9
'&':10, '^':11, '|':12, '&&': 13, '||':13, ',':18}
unaryPriority = {'new':2, '++':3, '--':3, '!':4, '+':4, '-':4, 'typeof':4, 'void':4, 'delete':4, 'yield':16}

tokenFnMap =
  '=': (exp) ->
    x = token(exp[2])
    setFunction x, priority([token(exp[1]), ' = ', (if x.pri>17 then paren(x) else x)], 17)
  'augmentAssign!': (exp) ->
    x = token(exp[3])
    setFunction x, priority([token(exp[2]), ' ', exp[1], ' ', (if x.pri>17 then paren(x) else x)], 17)
  'quote!': (exp) -> priority([JSON.stringify(exp[1])], 0)
  'jsvar!': (exp) -> priority(exp[1], 0)
  'regexp!': (exp) -> priority(exp[1], 0)
  #'array!':(exp) ->  priority(['[', list(exp[1...]), ']'], 0)  # array[i...]
  'list!':(exp) ->  priority(['[', list(exp[1...]), ']'], 0)  # array[i...]
  'comma!':(exp) ->  priority(list(exp[1]), 18)
  'call!': (exp) ->
    caller = token(exp[1])
    setFunction caller, priority([caller, paren(list(exp[2]))], 2)
  'index!': (exp) -> priority([token(exp[1]), bracket(token(exp[2]))], 1)
  'attribute!': (exp) -> priority([token(exp[1]), '.', exp[2]], 1) # a.b
  'hash!': (exp) -> priority([('{ '), list(exp[1]), '}'], 0) # { a: 1, b:2 ...}
  'hashitem!': (exp) -> priority([token(exp[1]), ': ', token(exp[2])], 0) # a.b
  'binary!': (exp) ->
    pri = binaryPriority[op=exp[1]]; x = token(exp[2]); y = token(exp[3])
    priority(binary([(if x.pri>pri then paren(x) else x), op, (if y.pri>pri then paren(y) else y)]), pri)
  'prefix!': (exp) ->
    pri = unaryPriority[exp[1]]; x = token(exp[2]);
    priority([exp[1], (if letterCharSet[entity(exp[1])[0]] then ' ' else ''), (if x.pri>pri then paren(x) else x)], pri)
  'suffix!': (exp) ->
    pri = unaryPriority[exp[1]]; x = token(exp[2]);
    priority([(if x.pri>pri then paren(x) else x), exp[1]], pri)
  '?:': (exp) ->
    x = token(exp[1]); y = token(exp[2]); z = token(exp[3])
    priority([(if x.pri>15 then paren(x) else x), '? ',
              (if y.pri>15 then paren(y) else y), ': ',  (if z.pri>15 then paren(z) else z)],15) # test? then: else
  'noop!': (exp) ->  ''
  'var': (exp) ->
    exps = []; assigns = []
    for e in exp[1...]
      if not e.push then exps.push e else assigns.push e
    result = ['var ', list(exps)]
    if exps.length and assigns.length
      result.push ', '
    if assigns.length>1 then result.push indentToken(4)
    t = token(assigns[0])
    if t.function then result.function = true
    if assigns.length then result.push t
    for e in assigns[1...]
      result.push ', '; result.push line
      t = token(e)
      if t.function then result.push line
      result.push t
    if assigns.length>1 then result.push undentToken(4)
    result
  'begin!': (exp) ->
    exps = []
    e1 = ''
    for e in exp[1...]
      if e1[0]=='var'
        if e[0]=='var' then e1.push e[1]
        else if e[0]=='=' and (ee1=entity(e[1])) and (typeof ee1 == 'string') and ee1==entity(e1[e1.length-1]) then e1.pop(); e1.push e
        else exps.push e; e1 = e
      else exps.push e; e1 = e
    e = exps[exps.length-1]
    if e=='' or (ee=entity(e))=='' or e==undefined or ee==undefined then exps.pop()
    if exps.length==1 then return statement exps[0]
    else statementList(for e in exps then statement(e))
  'label!': (exp) -> [token(exp[1]), ': ', token(exp[2])]
  'break': (exp) -> ['break ', token(exp[1])]
  'continue': (exp) -> ['continue ', token(exp[1])]
  'return': (exp) ->  ['return ', token(exp[1])]
  'throw': (exp) ->  ['throw ', token(exp[1])]
  'new': (exp) ->  priority(['new ', token(exp[1])], 1)
  'function': (exp) ->
    if entity(exp[2]) then body = wrapBlock(statement(exp[2])) else body = '{}'
    func('function ', paren(list(exp[1])), ' ',body)
  'if': (exp) ->
    if exp[3]
      elseClause = token(exp[3])
      if elseClause.kind==COMPOUND or elseClause.kind==STATEMENT_LIST and elseClause.value.length>1
        elseClause = block(elseClause)
      compound('if ', paren(token(exp[1])), block(token(exp[2])), clause('else ', elseClause))
    else compound('if ', paren(token(exp[1])), block(token(exp[2])))
  'while': (exp) -> compound('while ', paren(token(exp[1])), block(token(exp[2])))
  'doWhile!': (exp) -> compound('do ', wrapBlock(token(exp[1])), ' while ', paren(token(exp[2])))
  'try': (exp) ->
    result = ['try ', wrapBlock(token(exp[1])), clause('catch ', paren(token(exp[2]))),  wrapBlock(token(exp[3]))]
    if exp[4] then result.push  clause('finally ', wrapBlock token(exp[4]))
    compound result
  'forIn!': (exp) -> compound('for ', paren([token(exp[1]), ' in ', token(exp[2])]), block(token(exp[3])))
  'forOf!': (exp) -> compound('for ', paren([token(exp[1]), 'of ', token(exp[2])]), block(token(exp[3])))
  'cfor!': (exp) ->  compound('for ', paren([token(exp[1]), ';', token(exp[2]), ';', token(exp[3])]), block(token(exp[4])))
  'switch': (exp) ->
    body = []
    for e in exp[2]
      cases = []
      for x in e[0] then body.push 'case '; body.push token(x); body.push ': '
      body.push token(e[1]); body.push ';'
    if exp[3] then body.push clause('default: ', token(exp[3]))
    compound('switch ', paren(token(exp[1])), wrapBlock(body))

  'with!': (exp) -> compound('with ', paren(token(exp[1])), block(token(exp[2])))

  'letloop!': (exp) ->
    exps = []
    params = exp[1]; bindings = exp[2]; body = exp[3]
    for b in bindings then exps.push ['var', b[0]]; exps.push ['=', b[0], ['function ', params, b[1]]]
    exps.push body
    token begin(exps)

token = (exp) ->
  if isArray(exp)
    if not exp.length then '[]'
    else if typeof exp[0]!='string' then bracket(list(exp))
    else if (fn=tokenFnMap[exp[0]]) then fn(exp)
    else bracket(list(exp))
  else if typeof exp == 'object' or typeof exp=='string' then exp
  else if exp? then exp.toString()
  else ''

textize = (options) ->
  code = ''; prev = ''; indentRow = 0; lineno = 0; row = 0
  indentWidth = options.indentWidth or 2; lineLength = options.lineLength  or 80

  char = (c) ->
    code += c
    if c=='\n' then row = 0; lineno++
    else if c=='\r' then row = 0
    else
      row++;
      if c!=' ' and c!='\t' then prev = c
    c

  semicolon = -> if prev!=';' then char(';') else ''
  clauseSemicolon = -> if prev!=';' and prev!='}' then char(';') else ''

  str = (s) -> (for c in s then char(c)); return s

  newline = (startRow) ->
    result = char('\n'); i= 0
    while i++<startRow then result += char ' '
    return result

  nl = ->
    result = char('\n'); i= 0
    while i++<indentRow then result += char ' '
    return result

  indent = (width) -> indentRow += width or indentWidth; ''
  undent = (width) -> indentRow -= width or indentWidth; ''

  textFnMap =
    LINE: (tkn) -> newline(indentRow)
    INDENT: (tkn) -> indentRow += tkn.value or indentWidth; ''
    UNDENT: (tkn) -> indentRow -= tkn.value or indentWidth; ''
    PAREN: (tkn) -> char('(')+text(tkn.value)+char(')')
    BRACKET: (tkn) -> char('[')+text(tkn.value)+char(']')
    CURVE: (tkn) -> char('{')+text(tkn.value)+char('}')
    BINARY: (tkn) ->
      exp = tkn.value
      result = text(exp[0])
      op = exp[1]
      if op!=','
        if row>lineLength then result += indent() + nl() + text(exp[1]) + char(' ')+ text(exp[2]) + undent()
        else result +=  char(' ') + text(exp[1]) + char(' ') + text(exp[2])
      else
        if row>lineLength then result += indent() + text(exp[1]) + nl() + text(exp[2]) + undent()
        else result +=  text(exp[1]) + char(' ') + text(exp[2])
      result
    LIST: (tkn) ->
      exp = tkn.value
      if exp.length
        result = ''
        indented = false
        result += text(exp[0])
        for t in exp[1...]
          result += str(', ')
          if row>lineLength
            if not indented then indented = true; indent()
            result += nl()
          result += text(t)
        if indented then undent()
        return result
      else ''
    SEQUENCE: (tkn) -> (for t in tkn.value then text(t)).join ''
    WRAP_BLOCK: (tkn) ->
      exp = tkn.value
      if typeof exp=='object' and exp.kind==STATEMENT_LIST and (value=exp.value) and value.length==0
        return str('{}') + nl()
      str('{') + indent() + nl() + text(exp) + semicolon() + undent() + nl() + str('}')
    BLOCK: (tkn) ->
      exp = tkn.value
      if typeof exp=='object' and exp.kind==STATEMENT_LIST and (value=exp.value)
        if value.length==0  then '{}'+nl()
        else if value.length>1 then str('{ ') + indent() + nl() + text(exp) + semicolon() + undent() + nl() + str('}')
        else indent() + text(value[0]) + undent()
      else indent() + nl() + text(exp) + undent()
    STATEMENT_LIST: (tkn) ->
      exp = tkn.value
      if exp.length==0 then return ''
      result = text exp[0]
      for t in exp[1...]
        result += semicolon()
        if t.value and t.value.function or t.compound then result += nl()
        result += nl() + text(t)
      result
    STATEMENT: (tkn) -> text(tkn.value) + clauseSemicolon()
    FUNCTION: (tkn) ->
      if AfterNeedParnFunctionCharset[prev] or not prev then char('(') + text(tkn.value) + char(')')
      else text(tkn.value)
    CLAUSE: (tkn) -> clauseSemicolon() + nl() + text(tkn.value)

  textFnList = [0...100]
  for name,value of tokenNameMap then textFnList[value] = textFnMap[name]

  AfterNeedParnFunctionCharset = charset(';}\n\r')

  text = (exp) ->
    if not exp? then return ''
    else if Object.prototype.toString.call(exp) == '[object Array]'
      exp.textizedString = (for tkn in exp then text(tkn)).join('')
    else if typeof exp == 'object'
      if exp.kind? then return exp.textizedString = textFnList[exp.kind](exp)
      else return text(exp.identifier or exp.symbol or exp.value)
    else
      s = exp.toString()
      if not s then return ''
      s0 = s[0]
      prevChar = code[code.length-1]
      if identifierCharSet[prevChar] and identifierCharSet[s0] then c = char(' ')
      else if (prevChar==')' or prevChar==']')
        if identifierCharSet[s0] then c = char(' ')
        else if s0=='{' then c = char(' ')
      else if prevChar==',' or prevChar==';' then c = char(' ')
      else c = ''
      c+str(s)

  text.getCode = -> code

  text

exports.tocode = (exp, options) ->
  textFn = textize(extend({}, options))
  textFn(token(exp))
  textFn.getCode()