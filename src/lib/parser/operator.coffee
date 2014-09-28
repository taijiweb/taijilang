#https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
{extend, charset, digitCharSet, letterCharSet, identifierCharSet, constant, isArray, wrapInfo1, wrapInfo2} = base = require './base'

{NUMBER,  STRING,  IDENTIFIER, SYMBOL, REGEXP,  HEAD_SPACES, CONCAT_LINE, PUNCT, FUNCTION, PAREN, BRACKET, INDENT_EXPRESSION
NEWLINE,  SPACES,  INLINE_COMMENT, SPACES_INLINE_COMMENT, LINE_COMMENT, BLOCK_COMMENT, CODE_BLOCK_COMMENT,
NON_INTERPOLATE_STRING, INTERPOLATE_STRING, DATA_BRACKET
INDENT, UNDENT, HALF_DENT, CURVE} = constant

exports.prefixOperatorDict = prefixOperatorDict =
  '#':  {priority: 200}, # preprocess, conditional meta compilation operator
  '##':  {priority: 5}, # meta compilation operator
  '#/':  {priority: 5}, # compile in both meta and object level
  '#-':  {priority: 5}, # exit meta level
  '#&':  {priority: 5}, # #& metaConvert exp and get the current expression(not metaConverted raw program)
  '~':  {priority: 5, symbol:'quote!'}
  '`':  {priority: 5, symbol:'quasiquote!'}

  'yield':  {priority: 20} # between assign and condition

  'new': {priority: 140}
  'typeof': {priority: 140}
  'void': {priority: 140}
  'delete': {priority: 140}

  '..': {symbol: '..x', priority: 150}  # arr[..5]
  '...': {symbol: '...x', priority: 150} #arr[..5]

  '^': {symbol: 'unquote!', priority: 160}
  '^&': {symbol: 'unquote-splice', priority: 160}

  '+': {symbol: '+x', priority: 180}
  '-': {symbol: '-x', priority: 180}
  '!': {symbol: '!x', priority: 180},
  '!!': {symbol: '!!x', priority: 180} # according the symbol matcher, !! is parsed one single symbol
  'not': {priority: 180}
  '|~': {symbol: '~', priority: 180}   #~, bit not
  '++': {symbol: '++x', priority: 180}
  '--': {symbol: '--x',priority: 180}
  # % used as parser attributer prefix operator
  # % parsing means dividing text to many parts, so use % is iconic and proper.
  '%': {symbol: '%x', priority: 210}
  '@@':  {priority: 210} # outer scope var

do -> for op, result of exports.prefixOperatorDict
  result.value = op
  if not result.symbol then result.symbol = op

# suffix exports should not conflict with binary operators
exports.suffixOperatorDict = suffixOperatorDict =
  '++': {symbol: 'x++', priority: 180}
  '--': {symbol: 'x--', priority: 180}
  # implemented as custom parameterEllipsisSuffix originally, but now I want it more general
  #'...': {symbol: 'x...', priority: 180}

do -> for op, result of exports.suffixOperatorDict
  result.value = op
  if not result.symbol then result.symbol = op

exports.binaryOperatorDict =
  ',': {priority: 5}

  # assign  {priority: 20}
  # 'yield':  {priority: 20} # prefix

  # condition, should transform it to proper form.
  #'?':{priority: 30}, ':':{priority: 31} # ? should be identifier character, : should lead clauses
  # ||| is logic xor
  '&&': {priority: 50}, '||': {priority: 40}, #'|||': {symbol: '^', priority: 40}
  'and': {symbol:'&&', priority: 50}, 'or': {symbol:'||', priority: 40}, #'xor': {symbol: '^', priority: 40}
  # ^ will be used as unquote, so use |\ as bit xor
  #'|\\': {priority: 60},
  # update: use ^ as binary operator will not conflict with prefix ^
  '^': {priority: 60},
  '|': {priority: 70}, '&': {priority: 80}

  '==': {priority: 90}, '!=': {priority: 90}, '===': {priority: 90}, '!==': {priority: 90},
  # because ! can be in identifier, so we use <> and <*> make a.!=b and a.!==b can be a<>b and a<*>b
  # update! the first character should not be !, and !! becomes a prefix operator, so <> and <*> become unnecessary.
  # '<>': {symbol: '!==', priority: 90},  '<*>': {symbol: '!=', priority: 90}
  '<': {priority: 100}, '<=': {priority: 100}, '>': {priority: 100}, '>=': {priority: 100}
  'in': {priority: 100}, 'instanceof': {priority: 100}, 'isoneof': {priority: 100}

  # a..b, a...b, x[a..b], x[a...b]
  '..': {priority: 105}, '...': {priority: 105},

  # >>>: javascript bitwise unsigned right shift operator.
  '<<': {priority: 110}, '>>': {priority: 110}, '>>>': {priority: 110}
  '+': {priority: 120}, '-': {priority: 120}

  # integer division, to replace '//', which is line comment
  # update: there is no integer division operator in javascript
  '*': {priority: 130}, '/': {priority: 130}, '%': {priority: 130}  #'/%': {priority: 130},

  # '.': {priority: 200, symbol: 'attribute!'}  # attribute, become customed parser.binaryAttributeOperator
  # '&/': {priority:200, symbol: 'index!'} # index

  #'|||=': {priority:20, value:'|||=', symbol:'^=', rightAssoc: true, assign:true}

  #'and=': {priority:20, value:'and=', symbol:'&&=', rightAssoc: true, assign:true}
  #'or=': {priority:20, value:'or=', symbol:'||=', rightAssoc: true, assign:true}

do -> for op, result of exports.binaryOperatorDict
  result.value = op
  if not result.symbol then result.symbol = op

#: #=: meta assign, assign meta value or macro to variable
exports.assignOperators = ('= += -= *= /= %= <<= >>= >>>= &= |= ^= &&= ||= #= #/=').split(' ') # #&=
do -> for op in exports.assignOperators
  exports.binaryOperatorDict[op] = {priority:20, value: op, symbol:op, rightAssoc: true, assign:true}

exports.binaryFunctionPriority = 35

exports.makeOperatorExpression = (type, op, x, y) ->
  if type=='binary!'
    result = [op, x, y]; result.type = type
    result.priority = op.priority; result.rightAssoc = op.rightAssoc
    wrapInfo2 result, x, y
  else if type=='prefix!'
    result = [op, x]; result.type = type
    result.priority = op.priority; result.rightAssoc = op.rightAssoc
    wrapInfo2 result, op, x
  else #'suffix'
    result = [op, x]; result.type = type
    result.priority = op.priority; result.rightAssoc = op.rightAssoc
    wrapInfo2 result, x, op

error = (message) -> throw message

exports.getOperatorExpression = getExpression = (exp) ->
  if not exp or not (type=exp.type) or type==NUMBER or type==IDENTIFIER or type==NON_INTERPOLATE_STRING or type==INTERPOLATE_STRING\
      or type==BRACKET or type==DATA_BRACKET or type==CURVE or (type==SYMBOL and exp.escape)
    return exp
  if (value=exp.value)=='@' or value=='::' or value=='...' then return exp
  if type==PAREN or type==INDENT_EXPRESSION then return getExpression(exp.value)
  if type==REGEXP then return ['regexp!', exp.value]
  if type=='prefix!'
    if exp.value=='%'
      if exp[1] and exp[1].type==IDENTIFIER
        wrapInfo1 ['attribute!', 'parser!', getExpression(exp[1])], exp
      else wrapInfo1 ['index!', 'parser!', getExpression(exp[1])], exp
    else if exp.value=='\\' then return getExpression(exp[1])
    return wrapInfo1 [exp[0], getExpression(exp[1])], exp
  if type=='suffix!'
#    if exp[0]=='x...' then return wrapInfo1 getExpression(exp[1])+'...', exp
#    else return wrapInfo1 [exp[0], getExpression(exp[1])], exp
    return wrapInfo1 [exp[0], getExpression(exp[1])], exp
  if type=='binary!'
    # todo should  refactor to configurable by programmer
    head = exp[0].symbol; x = getExpression exp[1]; y = getExpression exp[2]
    if head=='?'
      if not y or y[0]!=':' then error 'error when parsing ternary expression(i.e. x ? y :z)'
      wrapInfo1 ['?:', x, y[1], y[2]], exp
    else if head=='call()'
      if not y then return wrapInfo1 ['call!', x, []], exp
      if y[0]==',' then wrapInfo1 ['call!', x, y[1...]], exp
      else wrapInfo1 ['call!', x, [y]], exp
    else if head=='#()'
      if not y then return wrapInfo1 ['#call!', x, []], exp
      if y[0]==',' then wrapInfo1 ['#call!', x, y[1...]], exp
      else wrapInfo1 ['#call!', x, [y]], exp
    else if head=='index[]'
      if not y? then error 'error when parsing subscript index.', exp
      else if y.isBracket and y[0]=='list!'
        if y.length==1 then error 'subscript index should not be empty list', exp
        else if y.length==2 then wrapInfo1 ['index!', x, y[1]], exp
        else wrapInfo1 ['index!', x, y], exp
      else wrapInfo1 ['index!', x, y], exp
    else if head=='index&/'
      if not y? then error 'error when parsing subscript index', exp
      else wrapInfo1 ['index!', x, y], exp
    else if head==','
      if x and x[0]==','
        x.push y
        wrapInfo1 x, exp
      else wrapInfo1 [',', x,  y], exp
    else wrapInfo1 [head, x, y], exp
