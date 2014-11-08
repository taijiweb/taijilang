#https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
{extend, charset, digitCharSet, letterCharSet, identifierCharSet, constant, isArray, wrapSyntaxInfo} = base = require './base'

{NUMBER,  STRING,  IDENTIFIER, SYMBOL, REGEXP,  HEAD_SPACES, CONCAT_LINE, PUNCT, FUNCTION, PAREN, BRACKET, INDENT_EXPRESSION
NEWLINE,  SPACES,  INLINE_COMMENT, SPACES_INLINE_COMMENT, LINE_COMMENT, BLOCK_COMMENT, CODE_BLOCK_COMMENT,
NON_INTERPOLATE_STRING, INTERPOLATE_STRING, DATA_BRACKET, BRACKET
INDENT, UNDENT, HALF_DENT, CURVE,
PREFIX, SUFFIX, BINARY} = constant

# :: can be prefix, suffix, binary and atom at the same time

exports.prefixOperatorDict = prefixOperatorDict =
  '#':  {priority: 200}, # preprocess, conditional meta compilation operator
  '->':  {priority: 5, definition:true}, # definition operator
  '|->':  {priority: 5, definition:true}, # definitionoperator
  '=>':  {priority: 5, definition:true}, # definition operator
  '|=>':  {priority: 5, definition:true}, # definition operator
  '##':  {priority: 5}, # meta compilation operator
  '#/':  {priority: 5}, # compile in both meta and object level
  '#-':  {priority: 5}, # exit meta level
  '#&':  {priority: 5}, # #& metaConvert exp and get the current expression(not metaConverted raw program)
  '~':  {priority: 5}
  '`':  {priority: 5}

  'yield':  {priority: 20} # between assign and condition

  'new': {priority: 140}
  'typeof': {priority: 140}
  'void': {priority: 140}
  'delete': {priority: 140}

  '..': {priority: 150}  # arr[..5]
  '...': {priority: 150} #arr[..5]

  '^': {priority: 160}
  '^&': {priority: 160}

  '+': {priority: 180}
  '-': {priority: 180}
  '!': {priority: 180},
  '!!': {priority: 180} # according the symbol matcher, !! is parsed one single symbol
  'not': {priority: 180}
  '|~': {priority: 180}   #~, bit not
  '++': {priority: 180}
  '--': {priority: 180}
  # % used as parser attributer prefix operator
  # % parsing means dividing text to many parts, so use % is iconic and proper.
  '%': {priority: 210}

  '::':  {priority: 210}   # :: can be prefix, suffix, binary and atom at the same time

  '@': {priority: 210}
  '@@':  {priority: 210} # outer scope var

# suffix exports should not conflict with binary operators
exports.suffixOperatorDict = suffixOperatorDict =
  '++': {priority: 180}
  '--': {priority: 180}
  '...': {priority: 180}
  '::': {priority: 180}  # :: can be prefix, suffix, binary and atom at the same time

exports.binaryOperatorDict =
  '->': {priority: 4, definition:true} # defintion operator
  '->': {priority: 4, definition:true}
  '=>': {priority: 4, definition:true}
  '|=>': {priority: 4, definition:true}

  ',': {priority: 5}

  # assign  {priority: 20}
  # 'yield':  {priority: 20} # prefix

  # condition, should transform it to proper form.
  #'?':{priority: 30}, ':':{priority: 31} # ? should be identifier character, : should lead clauses
  # ||| is logic xor
  '&&': {priority: 50}, '||': {priority: 40}, #'|||': {priority: 40}
  'and': {priority: 50}, 'or': {priority: 40}, #'xor': {priority: 40}
  # ^ will be used as unquote, so use |\ as bit xor
  #'|\\': {priority: 60},
  # update: use ^ as binary operator will not conflict with prefix ^
  '^': {priority: 60},
  '|': {priority: 70}, '&': {priority: 80}

  '==': {priority: 90}, '!=': {priority: 90}, '===': {priority: 90}, '!==': {priority: 90},
  # because ! can be in identifier, so we use <> and <*> make a.!=b and a.!==b can be a<>b and a<*>b
  # update! the first character should not be !, and !! becomes a prefix operator, so <> and <*> become unnecessary.
  # '<>': {priority: 90},  '<*>': {priority: 90}
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

  # :: can be prefix, suffix, binary and atom at the same time
  '::': {priority: 200}  # :: operator, should do some additional validation in binaryOperator

  '#': {priority: 200} # meta call operator

  #'.': {priority: 200}  # attribute, become customed parser.binaryAttributeOperator
  # '&/': {priority:200} # index

  #'|||=': {priority:20, rightAssoc: true, assign:true}

  #'and=': {priority:20, rightAssoc: true, assign:true}
  #'or=': {priority:20, rightAssoc: true, assign:true}

#: #=: meta assign, assign meta value or macro to variable
exports.assignOperators = ('= += -= *= /= %= <<= >>= >>>= &= |= ^= &&= ||= #= #/=').split(' ') # #&=
do -> for op in exports.assignOperators
  exports.binaryOperatorDict[op] = {priority:20, rightAssoc: true, assign:true}

# this function is refactored out and is deprecated.
# grammatical element expression will do more thing and be more extendable and customable.
exports.makeExpression = (type, op, x, y) ->
  switch type
    when PREFIX, SUFFIX then result = [op, x]
    when BINARY
      opValue = op.value
      if opValue==','
        if x[0]==',' then x.push y; result = x
        else result = [',', x,  y]
      else if opValue=='index[]'
        if y.empty then error 'error when parsing subscript index.', y  # x[]
        else if y[0]=='list!'
          if y.length==1 then error 'subscript index should not be empty list', y
          else if y.length==2 then result = ['index!', x, y[1]]
          else result = ['index!', x, y]
        else if y[0]==',' then result =  ['index!', x, y[1...]]
        else result = ['index!', x, y]
      else if opValue=='call()'
          if y.empty then result = ['call!', x, []] # x()
          else
            if y[0]==',' then result = ['call!', x, y[1...]]
            else result = ['call!', x, [y]]
      else if opValue=='#()'
        if y.empty then result = ['#call!', x, []]   # x#()
        else if y[0]==',' then result = ['#call!', x, y[1...]] # x#(a, b)
        else result = ['#call!', x, [y]] # x#(a)
      else result = [op, x, y]
  result.expressionType = type; result.priority = op.priority; result.rightAssoc = op.rightAssoc; result.start = op.start; result.stop = (op.stop or op.start)
  result

error = (message) -> throw message
