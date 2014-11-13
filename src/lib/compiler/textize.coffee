{str, isArray, extend, entity, charset, begin, undefinedExp, isValue, digitCharSet, letterCharSet, identifierCharSet, constant, assert} = require '../utils'

{SYMBOL, VALUE, LIST} = constant

# sort of tokenize, where "sort" means kind or type
TKN_PAREN=1; TKN_BRACKET = 2; TKN_CURVE=3; TKN_LIST=4; TKN_STATEMENT_LIST=5; TKN_WRAP_BLOCK=6; TKN_BLOCK=7; TKN_MAYBE=8; TKN_STATEMENT=9;
TKN_CLAUSE=10; TKN_COMPOUND=11; TKN_FUNCTION=12; TKN_SEQUENCE = 13; TKN_LINE = 14; TKN_INDENT = 15; TKN_UNDENT = 16; TKN_BINARY = 17; TKN_VALUE = 18

tokenNameMap = {TKN_PAREN, TKN_BRACKET, TKN_CURVE, TKN_LIST, TKN_STATEMENT_LIST, TKN_WRAP_BLOCK, TKN_BLOCK, TKN_MAYBE, TKN_STATEMENT,
TKN_CLAUSE, TKN_COMPOUND, TKN_FUNCTION, TKN_SEQUENCE, TKN_LINE, TKN_INDENT, TKN_UNDENT, TKN_BINARY, TKN_VALUE
}

class TokenizeError extends Error
  constructor: (@exp, @message) ->

tokenizeError = (exp, message) ->
  # throw new TokenizeError(exp, message)
  throw message+':  '+str(exp)

paren = (exp) -> {sort: TKN_PAREN, value: exp}
bracket = (exp) -> {sort: TKN_BRACKET, value: exp}
curve = (exp) -> {sort: TKN_CURVE, value: exp}
line = {sort: TKN_LINE}
indentToken = (width) -> {sort: TKN_INDENT, value: width}
undentToken = (width) -> {sort: TKN_UNDENT, value: width}
ind = {sort: TKN_INDENT}
und = {sort: TKN_UNDENT}
binary = (exp) -> {sort: TKN_BINARY, value: exp}
sequence = (exp) -> {sort: TKN_SEQUENCE, value: tokenize(e) for e in exp}
list = (exp) -> {sort: TKN_LIST, value: tokenize(e) for e in exp}
maybe = (test, exp) -> if test then exp else ''
clause = (exps...) -> {sort: TKN_CLAUSE, value: exps}
statement = (exp) ->
  t = tokenize(exp)
  if t.sort==TKN_STATEMENT or t.sort==TKN_STATEMENT_LIST then t
  else {sort: TKN_STATEMENT, value: t}
compound = (exps...) -> {sort: TKN_STATEMENT, value: exps, compound: true}
statementList = (exp) -> {sort: TKN_STATEMENT_LIST, value: tokenize(e) for e in exp}
block = (exp) -> {sort: TKN_BLOCK, value: exp}
wrapBlock = (exp) -> {sort: TKN_WRAP_BLOCK, value: exp}
func = (exps...) -> {sort: TKN_FUNCTION, value: exps, function:true}
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
    x = tokenize(exp[2])
    setFunction x, priority([tokenize(exp[1]), ' = ', (if x.pri>17 then paren(x) else x)], 17)
  'augmentAssign!': (exp) ->
    x = tokenize(exp[3])
    setFunction x, priority([tokenize(exp[2]), ' ', exp[1], ' ', (if x.pri>17 then paren(x) else x)], 17)
  'quote!': (exp) -> priority([JSON.stringify(exp[1])], 0)
  'jsvar!': (exp) -> priority(exp[1], 0)
  'regexp!': (exp) -> priority(exp[1], 0)
  #'array!':(exp) ->  priority(['[', list(exp[1...]), ']'], 0)  # array[i...]
  'list!':(exp) ->  priority(['[', list(exp[1...]), ']'], 0)  # array[i...]
  'comma!':(exp) ->  priority(list(exp[1...]), 18)
  'call!': (exp) ->
    caller = tokenize(exp[1])
    setFunction caller, priority([caller, paren(list(exp[2]))], 2)
  'index!': (exp) -> priority([tokenize(exp[1]), bracket(tokenize(exp[2]))], 1)
  'attribute!': (exp) -> priority([tokenize(exp[1]), '.', exp[2]], 1) # a.b
  'hash!': (exp) -> priority([('{ '), list(exp[1]), '}'], 0) # { a: 1, b:2 ...}
  'hashitem!': (exp) -> priority([tokenize(exp[1]), ': ', tokenize(exp[2])], 0) # a.b
  'binary!': (exp) ->
    pri = binaryPriority[op=exp[1]]; x = tokenize(exp[2]); y = tokenize(exp[3])
    priority(binary([(if x.pri>pri then paren(x) else x), op, (if y.pri>pri then paren(y) else y)]), pri)
  'prefix!': (exp) ->
    pri = unaryPriority[exp[1]]; x = tokenize(exp[2]);
    priority([exp[1], (if letterCharSet[entity(exp[1])[0]] then ' ' else ''), (if x.pri>pri then paren(x) else x)], pri)
  'suffix!': (exp) ->
    pri = unaryPriority[exp[1]]; x = tokenize(exp[2]);
    priority([(if x.pri>pri then paren(x) else x), exp[1]], pri)
  '?:': (exp) ->
    x = tokenize(exp[1]); y = tokenize(exp[2]); z = tokenize(exp[3])
    priority([(if x.pri>15 then paren(x) else x), '? ',
              (if y.pri>15 then paren(y) else y), ': ',  (if z.pri>15 then paren(z) else z)],15) # test? then: else
  'noop!': (exp) ->  ''
  'directLineComment!': (exp) -> entity(exp[1])
  'directCBlockComment!': (exp) -> entity(exp[1])
  'var': (exp) ->
    exps = []; assigns = []
    for e in exp[1...]
      if not e.push then exps.push e else assigns.push e
    result = ['var ', list(exps)]
    if exps.length and assigns.length
      result.push ', '
    if assigns.length>1 then result.push indentToken(4)
    t = tokenize(assigns[0])
    if t.function then result.function = true
    if assigns.length then result.push t
    for e in assigns[1...]
      result.push ', '; result.push line
      t = tokenize(e)
      if t.function then result.push line
      result.push t
    if assigns.length>1 then result.push undentToken(4)
    result
  'begin!': (exp) ->
    exps = []
    e1 = ''
    for e in exp[1...]
      if not e then exps.push e
      else if e1[0]=='var'
        if e[0]=='var' then e1.push e[1]
        else if e[0]=='=' and (ee1=entity(e[1])) and (typeof ee1 == 'string') and ee1==entity(e1[e1.length-1]) then e1.pop(); e1.push e
        else exps.push e; e1 = e
      else exps.push e; e1 = e
    e = exps[exps.length-1]
    if e=='' or (ee=entity(e))=='' or e==undefined or ee==undefined then exps.pop()
    if exps.length==1 then return statement exps[0]
    else statementList(for e in exps then statement(e))
  'debugger!': (exp) -> 'debugger'
  'label!': (exp) -> [tokenize(exp[1]), ': ', tokenize(exp[2])]
  'break': (exp) -> ['break ', tokenize(exp[1])]
  'continue': (exp) -> ['continue ', tokenize(exp[1])]
  'return': (exp) ->  ['return ', tokenize(exp[1])]
  'throw': (exp) ->  ['throw ', tokenize(exp[1])]
  'new': (exp) ->  priority(['new ', tokenize(exp[1])], 1)
  'function': (exp) ->
    exp2 = entity(exp[2])
    if exp2[0]=='return'
      if not (exp21=exp2[1]) then body = '{}'
      else if exp21[0]=='jsvar!' and exp21[1]=='undefined' then body = '{}'
      else body = wrapBlock(statement(exp2))
    else if exp2 then body = wrapBlock(statement(exp2))
    else body = '{}'
    func('function ', paren(list(exp[1])), ' ',body)
  'if': (exp) ->
    if exp[3]
      elseClause = tokenize(exp[3])
      if elseClause.sort==TKN_COMPOUND or elseClause.sort==TKN_STATEMENT_LIST and elseClause.value.length>1
        elseClause = block(elseClause)
      compound('if ', paren(tokenize(exp[1])), block(tokenize(exp[2])), clause('else ', elseClause))
    else compound('if ', paren(tokenize(exp[1])), block(tokenize(exp[2])))
  'while': (exp) -> compound('while ', paren(tokenize(exp[1])), block(tokenize(exp[2])))
  'doWhile!': (exp) -> compound('do ', wrapBlock(tokenize(exp[1])), ' while ', paren(tokenize(exp[2])))
  'try': (exp) ->
    result = ['try ', wrapBlock(tokenize(exp[1])), clause('catch ', paren(tokenize(exp[2]))),  wrapBlock(tokenize(exp[3]))]
    if exp[4] then result.push  clause('finally ', wrapBlock tokenize(exp[4]))
    compound result
  # javascript has no "for key of hash {...}", has "for key in hash {...}" instead.
  'jsForIn!': (exp) -> compound('for ', paren([tokenize(exp[1]), ' in ', tokenize(exp[2])]), block(tokenize(exp[3])))
  #'forOf!': (exp) -> compound('for ', paren([tokenize(exp[1]), 'of ', tokenize(exp[2])]), block(tokenize(exp[3])))
  'cfor!': (exp) ->  compound('for ', paren([tokenize(exp[1]), ';', tokenize(exp[2]), ';', tokenize(exp[3])]), block(tokenize(exp[4])))
  'switch': (exp) ->
    body = []
    for e in exp[2]
      cases = []
      for x in e[0] then body.push 'case '; body.push tokenize(x); body.push ': '
      body.push tokenize(e[1]); body.push ';'
    if exp[3] then body.push clause('default: ', tokenize(exp[3]))
    compound('switch ', paren(tokenize(exp[1])), wrapBlock(body))

  'with!': (exp) -> compound('with ', paren(tokenize(exp[1])), block(tokenize(exp[2])))

  'letloop!': (exp) ->
    exps = []
    params = exp[1]; bindings = exp[2]; body = exp[3]
    for b in bindings then exps.push ['var', b[0]]; exps.push ['=', b[0], ['function ', params, b[1]]]
    exps.push body
    tokenize begin(exps)

tokenize = (exp) ->
  switch exp.kind
    when SYMBOL, VALUE then exp.value
    when LIST
      assert tokenFnMap[exp[0].value], 'found no tokenize function: '+exp[0].value
      tokenFnMap[exp[0].value](exp)
    else throw 'wrong kind of exp while tokenizing'

#  switch exp.kind
#    when VALUE then exp.value
#    when SYMBOL then exp.value
#    when LIST
#      if (exp0=exp[0]) and exp0.kind==SYMBOL and (fn=tokenFnMap[exp[0]]) then fn(exp)
#      else tokenizeError exp, 'unexpected expression while tokenizing'
#    else tokenizeError exp, 'wrong kind of expression for tokenization'

makeTextizer = (options) ->
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
    TKN_INDENT: (tkn) -> indentRow += tkn.value or indentWidth; ''
    TKN_LINE: (tkn) -> newline(indentRow)
    TKN_INDENT: (tkn) -> indentRow += tkn.value or indentWidth; ''
    TKN_UNDENT: (tkn) -> indentRow -= tkn.value or indentWidth; ''
    TKN_PAREN: (tkn) -> char('(')+text(tkn.value)+char(')')
    TKN_BRACKET: (tkn) -> char('[')+text(tkn.value)+char(']')
    TKN_CURVE: (tkn) -> char('{')+text(tkn.value)+char('}')
    TKN_BINARY: (tkn) ->
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
    TKN_LIST: (tkn) ->
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
    TKN_SEQUENCE: (tkn) -> (for t in tkn.value then text(t)).join ''
    TKN_WRAP_BLOCK: (tkn) ->
      exp = tkn.value
      if typeof exp=='object' and exp.sort==TKN_STATEMENT_LIST and (value=exp.value) and value.length==0
        return str('{}') + nl()
      str('{') + indent() + nl() + text(exp) + semicolon() + undent() + nl() + str('}')
    TKN_BLOCK: (tkn) ->
      exp = tkn.value
      if typeof exp=='object' and exp.sort==TKN_STATEMENT_LIST and (value=exp.value)
        if value.length==0  then '{}'+nl()
        else if value.length>1 then str('{ ') + indent() + nl() + text(exp) + semicolon() + undent() + nl() + str('}')
        else indent() + text(value[0]) + undent()
      else indent() + nl() + text(exp) + undent()
    TKN_STATEMENT_LIST: (tkn) ->
      exp = tkn.value
      if exp.length==0 then return ''
      result = text exp[0]
      for t in exp[1...]
        result += semicolon()
        if t.value and t.value.function or t.compound then result += nl()
        result += nl() + text(t)
      result
    TKN_STATEMENT: (tkn) -> text(tkn.value) + clauseSemicolon()
    TKN_FUNCTION: (tkn) ->
      if AfterNeedParnFunctionCharset[prev] or not prev then char('(') + text(tkn.value) + char(')')
      else text(tkn.value)
    TKN_CLAUSE: (tkn) -> clauseSemicolon() + nl() + text(tkn.value)

  textFnList = [0...100]
  for name,value of tokenNameMap then textFnList[value] = textFnMap[name]

  AfterNeedParnFunctionCharset = charset(';}\n\r')

  text = (exp) ->
    if exp instanceof Array
      (for tkn in exp then text(tkn)).join('')
    else if typeof exp == 'object'
      if not exp.sort then return text(exp.value)
      else textFnList[exp.sort](exp)
    else
      s = exp.toString()
      s0 = exp[0]
      prevChar = code[code.length-1]
      if identifierCharSet[prevChar] and identifierCharSet[s0] then c = char(' ')
      else if (prevChar==')' or prevChar==']')
        if identifierCharSet[s0] then c = char(' ')
        else if s0=='{' then c = char(' ')
      else if prevChar==',' or prevChar==';' then c = char(' ')
      else c = ''
      c+str(s)

exports.tocode = (exp, options) ->
  exp = tokenize(exp)
  textize = makeTextizer(extend({}, options))
  textize(exp)