var BINARY, BLOCK_COMMENT, BRACKET, CODE_BLOCK_COMMENT, CONCAT_LINE, CURVE, DATA_BRACKET, FUNCTION, HALF_DENT, HEAD_SPACES, IDENTIFIER, INDENT, INDENT_EXPRESSION, INLINE_COMMENT, INTERPOLATE_STRING, LINE_COMMENT, NEWLINE, NON_INTERPOLATE_STRING, NUMBER, PAREN, PREFIX, PUNCT, REGEXP, SPACES, SPACES_INLINE_COMMENT, STRING, SUFFIX, SYMBOL, UNDENT, base, charset, constant, digitCharSet, error, extend, identifierCharSet, isArray, letterCharSet, prefixOperatorDict, suffixOperatorDict, wrapSyntaxInfo, _ref;

_ref = base = require('../utils'), extend = _ref.extend, charset = _ref.charset, digitCharSet = _ref.digitCharSet, letterCharSet = _ref.letterCharSet, identifierCharSet = _ref.identifierCharSet, constant = _ref.constant, isArray = _ref.isArray, wrapSyntaxInfo = _ref.wrapSyntaxInfo;

NUMBER = constant.NUMBER, STRING = constant.STRING, IDENTIFIER = constant.IDENTIFIER, SYMBOL = constant.SYMBOL, REGEXP = constant.REGEXP, HEAD_SPACES = constant.HEAD_SPACES, CONCAT_LINE = constant.CONCAT_LINE, PUNCT = constant.PUNCT, FUNCTION = constant.FUNCTION, PAREN = constant.PAREN, BRACKET = constant.BRACKET, INDENT_EXPRESSION = constant.INDENT_EXPRESSION, NEWLINE = constant.NEWLINE, SPACES = constant.SPACES, INLINE_COMMENT = constant.INLINE_COMMENT, SPACES_INLINE_COMMENT = constant.SPACES_INLINE_COMMENT, LINE_COMMENT = constant.LINE_COMMENT, BLOCK_COMMENT = constant.BLOCK_COMMENT, CODE_BLOCK_COMMENT = constant.CODE_BLOCK_COMMENT, NON_INTERPOLATE_STRING = constant.NON_INTERPOLATE_STRING, INTERPOLATE_STRING = constant.INTERPOLATE_STRING, DATA_BRACKET = constant.DATA_BRACKET, BRACKET = constant.BRACKET, INDENT = constant.INDENT, UNDENT = constant.UNDENT, HALF_DENT = constant.HALF_DENT, CURVE = constant.CURVE, PREFIX = constant.PREFIX, SUFFIX = constant.SUFFIX, BINARY = constant.BINARY;

exports.prefixOperatorDict = prefixOperatorDict = {
  '#': {
    priority: 200
  },
  '->': {
    priority: 5,
    definition: true
  },
  '|->': {
    priority: 5,
    definition: true
  },
  '=>': {
    priority: 5,
    definition: true
  },
  '|=>': {
    priority: 5,
    definition: true
  },
  '##': {
    priority: 5
  },
  '#/': {
    priority: 5
  },
  '#-': {
    priority: 5
  },
  '#&': {
    priority: 5
  },
  '~': {
    priority: 5
  },
  '`': {
    priority: 5
  },
  'yield': {
    priority: 20
  },
  'new': {
    priority: 140
  },
  'typeof': {
    priority: 140
  },
  'void': {
    priority: 140
  },
  'delete': {
    priority: 140
  },
  '..': {
    priority: 150
  },
  '...': {
    priority: 150
  },
  '^': {
    priority: 160
  },
  '^&': {
    priority: 160
  },
  '+': {
    priority: 180
  },
  '-': {
    priority: 180
  },
  '!': {
    priority: 180
  },
  '!!': {
    priority: 180
  },
  'not': {
    priority: 180
  },
  '|~': {
    priority: 180
  },
  '++': {
    priority: 180
  },
  '--': {
    priority: 180
  },
  '%': {
    priority: 210
  },
  '::': {
    priority: 210
  },
  '@': {
    priority: 210
  },
  '@@': {
    priority: 210
  }
};

exports.suffixOperatorDict = suffixOperatorDict = {
  '++': {
    priority: 180
  },
  '--': {
    priority: 180
  },
  '...': {
    priority: 180
  },
  '::': {
    priority: 180
  }
};

exports.binaryOperatorDict = {
  '->': {
    priority: 4,
    definition: true
  },
  '->': {
    priority: 4,
    definition: true
  },
  '=>': {
    priority: 4,
    definition: true
  },
  '|=>': {
    priority: 4,
    definition: true
  },
  ',': {
    priority: 5
  },
  '&&': {
    priority: 50
  },
  '||': {
    priority: 40
  },
  'and': {
    priority: 50
  },
  'or': {
    priority: 40
  },
  '^': {
    priority: 60
  },
  '|': {
    priority: 70
  },
  '&': {
    priority: 80
  },
  '==': {
    priority: 90
  },
  '!=': {
    priority: 90
  },
  '===': {
    priority: 90
  },
  '!==': {
    priority: 90
  },
  '<': {
    priority: 100
  },
  '<=': {
    priority: 100
  },
  '>': {
    priority: 100
  },
  '>=': {
    priority: 100
  },
  'in': {
    priority: 100
  },
  'instanceof': {
    priority: 100
  },
  'isoneof': {
    priority: 100
  },
  '..': {
    priority: 105
  },
  '...': {
    priority: 105
  },
  '<<': {
    priority: 110
  },
  '>>': {
    priority: 110
  },
  '>>>': {
    priority: 110
  },
  '+': {
    priority: 120
  },
  '-': {
    priority: 120
  },
  '*': {
    priority: 130
  },
  '/': {
    priority: 130
  },
  '%': {
    priority: 130
  },
  '::': {
    priority: 200
  },
  '#': {
    priority: 200
  },
  '.': {
    priority: 200
  }
};

exports.assignOperators = '= += -= *= /= %= <<= >>= >>>= &= |= ^= &&= ||= #= #/='.split(' ');

(function() {
  var op, _i, _len, _ref1, _results;
  _ref1 = exports.assignOperators;
  _results = [];
  for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
    op = _ref1[_i];
    _results.push(exports.binaryOperatorDict[op] = {
      priority: 20,
      rightAssoc: true,
      assign: true
    });
  }
  return _results;
})();

exports.makeExpression = function(type, op, x, y) {
  var opValue, result;
  switch (type) {
    case PREFIX:
    case SUFFIX:
      result = [op, x];
      break;
    case BINARY:
      opValue = op.value;
      if (opValue === ',') {
        if (x[0] === ',') {
          x.push(y);
          result = x;
        } else {
          result = [',', x, y];
        }
      } else if (opValue === 'index[]') {
        if (y.empty) {
          error('error when parsing subscript index.', y);
        } else if (y[0] === 'list!') {
          if (y.length === 1) {
            error('subscript index should not be empty list', y);
          } else if (y.length === 2) {
            result = ['index!', x, y[1]];
          } else {
            result = ['index!', x, y];
          }
        } else if (y[0] === ',') {
          result = ['index!', x, y.slice(1)];
        } else {
          result = ['index!', x, y];
        }
      } else if (opValue === 'call()') {
        if (y.empty) {
          result = ['call!', x, []];
        } else {
          if (y[0] === ',') {
            result = ['call!', x, y.slice(1)];
          } else {
            result = ['call!', x, [y]];
          }
        }
      } else if (opValue === '#()') {
        if (y.empty) {
          result = ['#call!', x, []];
        } else if (y[0] === ',') {
          result = ['#call!', x, y.slice(1)];
        } else {
          result = ['#call!', x, [y]];
        }
      } else {
        result = [op, x, y];
      }
  }
  result.expressionType = type;
  result.priority = op.priority;
  result.rightAssoc = op.rightAssoc;
  result.start = op.start;
  result.stop = op.stop || op.start;
  return result;
};

error = function(message) {
  throw message;
};
