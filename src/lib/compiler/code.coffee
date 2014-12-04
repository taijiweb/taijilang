{isArray, trace, symbolOf, valueOf, letterCharSet} = require '../utils'

{compileError} = require './helper'

string = (s) -> if s instanceof String then s else new String(s)

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

exports.makeCoder = makeCoder = (options) ->
  indentWidth = options.indentWidth or 2
  indentRow = 0; prev = ''

  nl = ->
    result = '\n'; i= 0
    while i++<indentRow then result += ' '
    return result

  indent = (width) -> indentRow += width or indentWidth; ''
  undent = (width) -> indentRow -= width or indentWidth; ''

  paren = (exp) -> '('+exp+')'
  list = (exp) -> (for e in exp then code(e)).join(', ')
  block = (exp) -> '{'+indent()+nl()+code(exp)+undent()+nl()+'}'
  priority = (exp, pri) -> exp = string(exp); exp.pri = pri; exp
  priParen = (x, pri) -> if x.pri>pri then paren(x) else x
  priParen2 = (x, pri) -> if x.pri>=pri then paren(x) else x

  codeFnMap =
    '=': (exp) -> priority(code(exp[1])+' = '+priParen(code(exp[2]), 17), 17)
    'quote!': (exp) -> priority(JSON.stringify(exp[1]), 0)
    'jsvar!': (exp) -> priority(exp[1], 0)
    'regexp!': (exp) -> priority(exp[1], 0)
    'list!':(exp) ->  priority('['+list(exp[1...])+']', 0)
    'comma!':(exp) ->  priority(list(exp[1...]), 18)
    'call!': (exp) -> priority(code(exp[1])+paren(list(exp[2])), 2)
    'index!': (exp) -> priority(code(exp[1])+'['+code(exp[2])+']', 1)
    'attribute!': (exp) -> priority(code(exp[1])+'.'+exp[2], 1) # a.b
    'hash!': (exp) -> priority('{ '+list(exp[1])+'}', 0) # { a: 1, b:2 ...}
    'hashitem!': (exp) -> priority(code(exp[1])+': '+code(exp[2]), 0) # a.b
    'binary!': (exp) ->
      pri = binaryPriority[op=symbolOf(exp[1])]
      priority(priParen(code(exp[2]), pri)+' '+op+' '+priParen2(code(exp[3]), pri), pri)
    'prefix!': (exp) ->
      op = symbolOf(exp[1]); pri = unaryPriority[op]
      priority(string(op+(if letterCharSet[op[0]] then ' ' else '')+priParen(code(exp[2]), pri)), pri)
    'suffix!': (exp) ->
      pri = unaryPriority[exp[1]]; x = code(exp[2])
      priority(string(priParen(x, pri)+exp[1]), pri)
    '?:': (exp) -> priority(priParen(code(exp[1]))+'? '+priParen(code(exp[2]))+': '+priParen(code(exp[3])), 15) # test? then: else
    'var': (exp) -> 'var '+code(exp[1])
    'begin!': (exp) ->
      if exp.length==1 then return ''
      result = code(exp[1])
      for e in exp[2...] then result += ';'+nl()+code(e)
      result
    'debugger!': (exp) -> 'debugger'
    'label!': (exp) -> code(exp[1])+': '+code(exp[2])
    'break': (exp) -> 'break '+code(exp[1])
    'continue': (exp) -> 'continue '+code(exp[1])
    'return': (exp) ->  'return '+code(exp[1])
    'throw': (exp) ->  'throw '+code(exp[1])
    'new': (exp) ->  priority(string('new '+code(exp[1])), 1)
    'function': (exp) -> 'function '+paren(list(exp[1]))+ ' '+block(exp[2])
    'if': (exp) ->
      if exp[3] then 'if '+paren(code(exp[1]))+' '+block(exp[2])+' else '+block(exp[3])
      else 'if '+paren(code(exp[1]))+block(exp[2])
    'while': (exp) -> 'while '+paren(code(exp[1]))+block(exp[2])
    'try': (exp) ->
      result = 'try '+block(exp[1])+' catch '+paren(code(exp[2]))+block(exp[3])
      if exp[4] then result += ' finally '+block(exp[4])
      result
    'jsForIn!': (exp) -> 'for '+paren(code(exp[1])+' in '+code(exp[2]))+block(exp[3])

  code = (exp) ->
    trace('generate code', exp)
    if isArray(exp) then prev = codeFnMap[symbolOf(exp[0])](exp)
    else prev = string(valueOf(exp))

exports.code = (exp) -> makeCoder({})(exp).toString()