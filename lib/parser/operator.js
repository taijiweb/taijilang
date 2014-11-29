var BINARY, BLOCK_COMMENT, BRACKET, CODE_BLOCK_COMMENT, CONCAT_LINE, CURVE, DATA_BRACKET, FUNCTION, HALF_DENT, HEAD_SPACES, IDENTIFIER, INDENT, INDENT_EXPRESSION, INLINE_COMMENT, INTERPOLATE_STRING, LINE_COMMENT, NEWLINE, NON_INTERPOLATE_STRING, NUMBER, PAREN, PREFIX, PUNCT, REGEXP, SPACES, SPACES_INLINE_COMMENT, STRING, SUFFIX, SYMBOL, UNDENT, base, charset, digitCharSet, error, extend, identifierCharSet, letterCharSet, prefixOperatorDict, suffixOperatorDict, _ref, _ref1;

_ref = base = require('../utils'), extend = _ref.extend, charset = _ref.charset, digitCharSet = _ref.digitCharSet, letterCharSet = _ref.letterCharSet, identifierCharSet = _ref.identifierCharSet;

_ref1 = require('../constant'), NUMBER = _ref1.NUMBER, STRING = _ref1.STRING, IDENTIFIER = _ref1.IDENTIFIER, SYMBOL = _ref1.SYMBOL, REGEXP = _ref1.REGEXP, HEAD_SPACES = _ref1.HEAD_SPACES, CONCAT_LINE = _ref1.CONCAT_LINE, PUNCT = _ref1.PUNCT, FUNCTION = _ref1.FUNCTION, PAREN = _ref1.PAREN, BRACKET = _ref1.BRACKET, INDENT_EXPRESSION = _ref1.INDENT_EXPRESSION, NEWLINE = _ref1.NEWLINE, SPACES = _ref1.SPACES, INLINE_COMMENT = _ref1.INLINE_COMMENT, SPACES_INLINE_COMMENT = _ref1.SPACES_INLINE_COMMENT, LINE_COMMENT = _ref1.LINE_COMMENT, BLOCK_COMMENT = _ref1.BLOCK_COMMENT, CODE_BLOCK_COMMENT = _ref1.CODE_BLOCK_COMMENT, NON_INTERPOLATE_STRING = _ref1.NON_INTERPOLATE_STRING, INTERPOLATE_STRING = _ref1.INTERPOLATE_STRING, DATA_BRACKET = _ref1.DATA_BRACKET, BRACKET = _ref1.BRACKET, INDENT = _ref1.INDENT, UNDENT = _ref1.UNDENT, HALF_DENT = _ref1.HALF_DENT, CURVE = _ref1.CURVE, PREFIX = _ref1.PREFIX, SUFFIX = _ref1.SUFFIX, BINARY = _ref1.BINARY;

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
  var op, _i, _len, _ref2, _results;
  _ref2 = exports.assignOperators;
  _results = [];
  for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
    op = _ref2[_i];
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
