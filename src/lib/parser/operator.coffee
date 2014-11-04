#https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
{extend, charset, digitCharSet, letterCharSet, identifierCharSet, constant, isArray, wrapSyntaxInfo} = base = require './base'

{NUMBER,  STRING,  IDENTIFIER, SYMBOL, REGEXP,  HEAD_SPACES, CONCAT_LINE, PUNCT, FUNCTION, PAREN, BRACKET, INDENT_EXPRESSION
NEWLINE,  SPACES,  INLINE_COMMENT, SPACES_INLINE_COMMENT, LINE_COMMENT, BLOCK_COMMENT, CODE_BLOCK_COMMENT,
NON_INTERPOLATE_STRING, INTERPOLATE_STRING, DATA_BRACKET, BRACKET
INDENT, UNDENT, HALF_DENT, CURVE,
PREFIX, SUFFIX, BINARY} = constant

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
  '~':  {priority: 5, value:'quote!'}
  '`':  {priority: 5, value:'quasiquote!'}

  'yield':  {priority: 20} # between assign and condition

  'new': {priority: 140}
  'typeof': {priority: 140}
  'void': {priority: 140}
  'delete': {priority: 140}

  '..': {value: '..x', priority: 150}  # arr[..5]
  '...': {value: '...x', priority: 150} #arr[..5]

  '^': {value: 'unquote!', priority: 160}
  '^&': {value: 'unquote-splice', priority: 160}

  '+': {value: '+x', priority: 180}
  '-': {value: '-x', priority: 180}
  '!': {value: '!x', priority: 180},
  '!!': {value: '!!x', priority: 180} # according the symbol matcher, !! is parsed one single symbol
  'not': {priority: 180}
  '|~': {value: '~', priority: 180}   #~, bit not
  '++': {value: '++x', priority: 180}
  '--': {value: '--x',priority: 180}
  # % used as parser attributer prefix operator
  # % parsing means dividing text to many parts, so use % is iconic and proper.
  '%': {value: '%x', priority: 210}
  '@@':  {priority: 210} # outer scope var

# suffix exports should not conflict with binary operators
exports.suffixOperatorDict = suffixOperatorDict =
  '++': {value: 'x++', priority: 180}
  '--': {value: 'x--', priority: 180}
  '...': {value: 'x...', priority: 180}

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
  '&&': {priority: 50}, '||': {priority: 40}, #'|||': {value: '^', priority: 40}
  'and': {value:'&&', priority: 50}, 'or': {value:'||', priority: 40}, #'xor': {value: '^', priority: 40}
  # ^ will be used as unquote, so use |\ as bit xor
  #'|\\': {priority: 60},
  # update: use ^ as binary operator will not conflict with prefix ^
  '^': {priority: 60},
  '|': {priority: 70}, '&': {priority: 80}

  '==': {priority: 90}, '!=': {priority: 90}, '===': {priority: 90}, '!==': {priority: 90},
  # because ! can be in identifier, so we use <> and <*> make a.!=b and a.!==b can be a<>b and a<*>b
  # update! the first character should not be !, and !! becomes a prefix operator, so <> and <*> become unnecessary.
  # '<>': {value: '!==', priority: 90},  '<*>': {value: '!=', priority: 90}
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

  #'.': {priority: 200, value: 'attribute!'}  # attribute, become customed parser.binaryAttributeOperator
  # '&/': {priority:200, value: 'index!'} # index

  #'|||=': {priority:20, value:'|||=', value:'^=', rightAssoc: true, assign:true}

  #'and=': {priority:20, value:'and=', value:'&&=', rightAssoc: true, assign:true}
  #'or=': {priority:20, value:'or=', value:'||=', rightAssoc: true, assign:true}

#: #=: meta assign, assign meta value or macro to variable
exports.assignOperators = ('= += -= *= /= %= <<= >>= >>>= &= |= ^= &&= ||= #= #/=').split(' ') # #&=
do -> for op in exports.assignOperators
  exports.binaryOperatorDict[op] = {priority:20, value: op, value:op, rightAssoc: true, assign:true}

exports.makeExpression = (type, op, x, y) ->
  switch type
    when PREFIX
#      if op.value=='%'
#        if x.type==IDENTIFIER
#          {value:['attribute!', 'parser!', x], type:type, priority:op.priority, rightAssoc:op.rightAssoc, start:op.start, stop:(op.stop or op.start)}
#        else {value:['index!', 'parser!', x], type:type, priority:op.priority, rightAssoc:op.rightAssoc, start:op.start, stop:(op.stop or op.start)}
#      else {value:[op, x], type:type, priority:op.priority, rightAssoc:op.rightAssoc, start:op.start, stop:(op.stop or op.start)}
      {value:[op, x], expressionType:type, priority:op.priority, rightAssoc:op.rightAssoc, start:op.start, stop:(op.stop or op.start)}
    when SUFFIX
      {value:[op, x], expressionType:type, priority:op.priority, rightAssoc:op.rightAssoc, start:x.start, stop:(op.stop or op.start)}
    when BINARY
      opValue = op.value; yValue = y.value
      if opValue=='call()'
        if y.empty then value = ['call!', x, []] # x()
        else
          yValue = yValue.value
          if yValue[0]==',' then value = ['call!', x, yValue[1...]]
          else value = ['call!', x, [y]]
      else if opValue=='index[]'
        if y.empty then error 'error when parsing subscript index.', y
        else if y.type==BRACKET and yValue[0]=='list!'
          if yValue.length==1 then error 'subscript index should not be empty list', y
          else if yValue.length==2 then value = ['index!', x, yValue[1]]
          else value = ['index!', x, y]
        else value =  ['index!', x, yValue[1...]]
#      else if opValue=='index&/'
#        if not y? then error 'error when parsing subscript index', exp
#        else wrapInfo1 ['index!', x, y], exp
      else if opValue==','
        if (xValue=x.value)[0]==',' then xValue.push y; value = xValue
        else value = [',', x,  y]
      else if opValue=='#()'
        if y.empty then value = ['#call!', x, []]
        else if yValue[0].value==',' then value = ['#call!', x, yValue[1...]]
        else value = ['#call!', x, [y]]
#      else if op.value=='?'
#        if yValue[0].value!=':' then error 'error when parsing ternary expression(i.e. x ? y :z)'
#        value = ['?:', x, yValue[1], yValue[2]]
      else value = [op, x, y]
      {value:value, expressionType:type, priority:op.priority, rightAssoc:op.rightAssoc, start:x.start, stop:(y.stop or y.start)}

error = (message) -> throw message
