var BINARY, BLOCK_COMMENT, BRACKET, CODE_BLOCK_COMMENT, CONCAT_LINE, CURVE, DATA_BRACKET, FUNCTION, HALF_DENT, HEAD_SPACES, IDENTIFIER, INDENT, INDENT_EXPRESSION, INLINE_COMMENT, INTERPOLATE_STRING, LINE_COMMENT, NEWLINE, NON_INTERPOLATE_STRING, NUMBER, PAREN, PREFIX, PUNCT, REGEXP, SPACES, SPACES_INLINE_COMMENT, STRING, SUFFIX, SYMBOL, UNDENT, base, charset, constant, digitCharSet, error, extend, identifierCharSet, isArray, letterCharSet, prefixOperatorDict, suffixOperatorDict, wrapSyntaxInfo, _ref;

_ref = base = require('./base'), extend = _ref.extend, charset = _ref.charset, digitCharSet = _ref.digitCharSet, letterCharSet = _ref.letterCharSet, identifierCharSet = _ref.identifierCharSet, constant = _ref.constant, isArray = _ref.isArray, wrapSyntaxInfo = _ref.wrapSyntaxInfo;

NUMBER = constant.NUMBER, STRING = constant.STRING, IDENTIFIER = constant.IDENTIFIER, SYMBOL = constant.SYMBOL, REGEXP = constant.REGEXP, HEAD_SPACES = constant.HEAD_SPACES, CONCAT_LINE = constant.CONCAT_LINE, PUNCT = constant.PUNCT, FUNCTION = constant.FUNCTION, PAREN = constant.PAREN, BRACKET = constant.BRACKET, INDENT_EXPRESSION = constant.INDENT_EXPRESSION, NEWLINE = constant.NEWLINE, SPACES = constant.SPACES, INLINE_COMMENT = constant.INLINE_COMMENT, SPACES_INLINE_COMMENT = constant.SPACES_INLINE_COMMENT, LINE_COMMENT = constant.LINE_COMMENT, BLOCK_COMMENT = constant.BLOCK_COMMENT, CODE_BLOCK_COMMENT = constant.CODE_BLOCK_COMMENT, NON_INTERPOLATE_STRING = constant.NON_INTERPOLATE_STRING, INTERPOLATE_STRING = constant.INTERPOLATE_STRING, DATA_BRACKET = constant.DATA_BRACKET, BRACKET = constant.BRACKET, INDENT = constant.INDENT, UNDENT = constant.UNDENT, HALF_DENT = constant.HALF_DENT, CURVE = constant.CURVE, PREFIX = constant.PREFIX, SUFFIX = constant.SUFFIX, BINARY = constant.BINARY;

exports.prefixOperatorDict = prefixOperatorDict = {
  '#': {
    priority: 200
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
    priority: 5,
    symbol: 'quote!'
  },
  '`': {
    priority: 5,
    symbol: 'quasiquote!'
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
    symbol: '..x',
    priority: 150
  },
  '...': {
    symbol: '...x',
    priority: 150
  },
  '^': {
    symbol: 'unquote!',
    priority: 160
  },
  '^&': {
    symbol: 'unquote-splice',
    priority: 160
  },
  '+': {
    symbol: '+x',
    priority: 180
  },
  '-': {
    symbol: '-x',
    priority: 180
  },
  '!': {
    symbol: '!x',
    priority: 180
  },
  '!!': {
    symbol: '!!x',
    priority: 180
  },
  'not': {
    priority: 180
  },
  '|~': {
    symbol: '~',
    priority: 180
  },
  '++': {
    symbol: '++x',
    priority: 180
  },
  '--': {
    symbol: '--x',
    priority: 180
  },
  '%': {
    symbol: '%x',
    priority: 210
  },
  '@@': {
    priority: 210
  }
};

(function() {
  var op, result, _ref1, _results;
  _ref1 = exports.prefixOperatorDict;
  _results = [];
  for (op in _ref1) {
    result = _ref1[op];
    result.value = op;
    if (!result.symbol) {
      _results.push(result.symbol = op);
    } else {
      _results.push(void 0);
    }
  }
  return _results;
})();

exports.suffixOperatorDict = suffixOperatorDict = {
  '++': {
    symbol: 'x++',
    priority: 180
  },
  '--': {
    symbol: 'x--',
    priority: 180
  },
  '...': {
    symbol: 'x...',
    priority: 180
  }
};

(function() {
  var op, result, _ref1, _results;
  _ref1 = exports.suffixOperatorDict;
  _results = [];
  for (op in _ref1) {
    result = _ref1[op];
    result.value = op;
    if (!result.symbol) {
      _results.push(result.symbol = op);
    } else {
      _results.push(void 0);
    }
  }
  return _results;
})();

exports.binaryOperatorDict = {
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
    symbol: '&&',
    priority: 50
  },
  'or': {
    symbol: '||',
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
  }
};

(function() {
  var op, result, _ref1, _results;
  _ref1 = exports.binaryOperatorDict;
  _results = [];
  for (op in _ref1) {
    result = _ref1[op];
    result.value = op;
    if (!result.symbol) {
      _results.push(result.symbol = op);
    } else {
      _results.push(void 0);
    }
  }
  return _results;
})();

exports.assignOperators = '= += -= *= /= %= <<= >>= >>>= &= |= ^= &&= ||= #= #/='.split(' ');

(function() {
  var op, _i, _len, _ref1, _results;
  _ref1 = exports.assignOperators;
  _results = [];
  for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
    op = _ref1[_i];
    _results.push(exports.binaryOperatorDict[op] = {
      priority: 20,
      value: op,
      symbol: op,
      rightAssoc: true,
      assign: true
    });
  }
  return _results;
})();

exports.makeExpression = function(type, op, x, y) {
  var opValue, value, xValue, yValue;
  switch (type) {
    case PREFIX:
      return {
        value: [op, x],
        expressionType: type,
        priority: op.priority,
        rightAssoc: op.rightAssoc,
        start: op.start,
        stop: op.stop || op.start
      };
    case SUFFIX:
      return {
        value: [op, x],
        expressionType: type,
        priority: op.priority,
        rightAssoc: op.rightAssoc,
        start: x.start,
        stop: op.stop || op.start
      };
    case BINARY:
      opValue = op.symbol;
      yValue = y.value;
      if (opValue === 'call()') {
        if (y.empty) {
          value = ['call!', x, []];
        } else if (yValue[0] === ',') {
          value = ['call!', x, yValue.slice(1)];
        } else {
          value = ['call!', x, [y]];
        }
      } else if (opValue === 'index[]') {
        if (y.empty) {
          error('error when parsing subscript index.', y);
        } else if (y.type === BRACKET && yValue[0] === 'list!') {
          if (yValue.length === 1) {
            error('subscript index should not be empty list', y);
          } else if (yValue.length === 2) {
            value = ['index!', x, yValue[1]];
          } else {
            value = ['index!', x, y];
          }
        } else {
          value = ['index!', x, yValue.slice(1)];
        }
      } else if (opValue === ',') {
        if ((xValue = x.value)[0] === ',') {
          xValue.push(y);
          value = xValue;
        } else {
          value = [',', x, y];
        }
      } else if (opValue === '#()') {
        if (y.empty) {
          value = ['#call!', x, []];
        } else if (yValue[0].value === ',') {
          value = ['#call!', x, yValue.slice(1)];
        } else {
          value = ['#call!', x, [y]];
        }
      } else {
        value = [op, x, y];
      }
      return {
        value: value,
        expressionType: type,
        priority: op.priority,
        rightAssoc: op.rightAssoc,
        start: x.start,
        stop: y.stop || y.start
      };
  }
};

error = function(message) {
  throw message;
};
