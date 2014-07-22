var BLOCK_COMMENT, BRACKET, CODE_BLOCK_COMMENT, CONCAT_LINE, CURVE, DATA_BRACKET, FUNCTION, HALF_DENT, HEAD_SPACES, IDENTIFIER, INDENT, INDENT_EXPRESSION, INLINE_COMMENT, INTERPOLATE_STRING, LINE_COMMENT, NEWLINE, NON_INTERPOLATE_STRING, NUMBER, PAREN, PUNCT, REGEXP, SPACES, SPACES_INLINE_COMMENT, STRING, SYMBOL, UNDENT, base, charset, constant, digitCharSet, error, extend, getExpression, identifierCharSet, isArray, letterCharSet, prefixOperatorDict, suffixOperatorDict, wrapInfo1, wrapInfo2, _ref;

_ref = base = require('./base'), extend = _ref.extend, charset = _ref.charset, digitCharSet = _ref.digitCharSet, letterCharSet = _ref.letterCharSet, identifierCharSet = _ref.identifierCharSet, constant = _ref.constant, isArray = _ref.isArray, wrapInfo1 = _ref.wrapInfo1, wrapInfo2 = _ref.wrapInfo2;

NUMBER = constant.NUMBER, STRING = constant.STRING, IDENTIFIER = constant.IDENTIFIER, SYMBOL = constant.SYMBOL, REGEXP = constant.REGEXP, HEAD_SPACES = constant.HEAD_SPACES, CONCAT_LINE = constant.CONCAT_LINE, PUNCT = constant.PUNCT, FUNCTION = constant.FUNCTION, PAREN = constant.PAREN, BRACKET = constant.BRACKET, INDENT_EXPRESSION = constant.INDENT_EXPRESSION, NEWLINE = constant.NEWLINE, SPACES = constant.SPACES, INLINE_COMMENT = constant.INLINE_COMMENT, SPACES_INLINE_COMMENT = constant.SPACES_INLINE_COMMENT, LINE_COMMENT = constant.LINE_COMMENT, BLOCK_COMMENT = constant.BLOCK_COMMENT, CODE_BLOCK_COMMENT = constant.CODE_BLOCK_COMMENT, NON_INTERPOLATE_STRING = constant.NON_INTERPOLATE_STRING, INTERPOLATE_STRING = constant.INTERPOLATE_STRING, DATA_BRACKET = constant.DATA_BRACKET, INDENT = constant.INDENT, UNDENT = constant.UNDENT, HALF_DENT = constant.HALF_DENT, CURVE = constant.CURVE;

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
  '|%': {
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
    symbol: '%',
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
  '?': {
    priority: 30
  },
  ':': {
    priority: 31
  },
  '&&': {
    priority: 50
  },
  '||': {
    priority: 40
  },
  '|||': {
    symbol: '^',
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
  'xor': {
    symbol: '^',
    priority: 40
  },
  '|\\': {
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
  '<>': {
    symbol: '!==',
    priority: 90
  },
  '<*>': {
    symbol: '!=',
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
  '/%': {
    priority: 130
  },
  '%': {
    priority: 130
  },
  '&/': {
    priority: 200,
    symbol: 'index!'
  },
  '|||=': {
    priority: 20,
    value: '|||=',
    symbol: '^=',
    rightAssoc: true,
    assign: true
  },
  'and=': {
    priority: 20,
    value: 'and=',
    symbol: '&&=',
    rightAssoc: true,
    assign: true
  },
  'or=': {
    priority: 20,
    value: 'or=',
    symbol: '||=',
    rightAssoc: true,
    assign: true
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

exports.assignOperators = ('= #= += -= *= /= %= <<= >>= >>>= &= |\= |=' + ' &&= ||=').split(' ');

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

exports.binaryFunctionPriority = 35;

exports.makeOperatorExpression = function(type, op, x, y) {
  var result;
  if (type === 'binary!') {
    result = [op, x, y];
    result.type = type;
    result.priority = op.priority;
    result.rightAssoc = op.rightAssoc;
    return wrapInfo2(result, x, y);
  } else if (type === 'prefix!') {
    result = [op, x];
    result.type = type;
    result.priority = op.priority;
    result.rightAssoc = op.rightAssoc;
    return wrapInfo2(result, op, x);
  } else {
    result = [op, x];
    result.type = type;
    result.priority = op.priority;
    result.rightAssoc = op.rightAssoc;
    return wrapInfo2(result, x, op);
  }
};

error = function(message) {
  throw message;
};

exports.getOperatorExpression = getExpression = function(exp) {
  var head, type, value, x, y;
  if (!exp || !(type = exp.type) || type === NUMBER || type === IDENTIFIER || type === NON_INTERPOLATE_STRING || type === INTERPOLATE_STRING || type === BRACKET || type === DATA_BRACKET || type === CURVE) {
    return exp;
  }
  if ((value = exp.value) === '@' || value === '::' || value === '...') {
    return exp;
  }
  if (type === PAREN || type === INDENT_EXPRESSION) {
    return getExpression(exp.value);
  }
  if (type === REGEXP) {
    return ['regexp!', exp.value];
  }
  if (type === 'prefix!') {
    if (exp.value === '%') {
      if (exp[1] && exp[1].type === IDENTIFIER) {
        wrapInfo1(['attribute!', 'parser!', getExpression(exp[1])], exp);
      } else {
        wrapInfo1(['index!', 'parser!', getExpression(exp[1])], exp);
      }
    } else if (exp.value === '\\') {
      return getExpression(exp[1]);
    }
    return wrapInfo1([exp[0], getExpression(exp[1])], exp);
  }
  if (type === 'suffix!') {
    return wrapInfo1([exp[0], getExpression(exp[1])], exp);
  }
  if (type === 'binary!') {
    head = exp[0].symbol;
    x = getExpression(exp[1]);
    y = getExpression(exp[2]);
    if (head === '?') {
      if (!y || y[0] !== ':') {
        error('error when parsing ternary expression(i.e. x ? y :z)');
      }
      return wrapInfo1(['?:', x, y[1], y[2]], exp);
    } else if (head === 'call()') {
      if (!y) {
        return wrapInfo1(['call!', x, []], exp);
      }
      if (y[0] === ',') {
        return wrapInfo1(['call!', x, y.slice(1)], exp);
      } else {
        return wrapInfo1(['call!', x, [y]], exp);
      }
    } else if (head === '#()') {
      if (!y) {
        return wrapInfo1(['#call!', x, []], exp);
      }
      if (y[0] === ',') {
        return wrapInfo1(['#call!', x, y.slice(1)], exp);
      } else {
        return wrapInfo1(['#call!', x, [y]], exp);
      }
    } else if (head === 'index[]') {
      if (y == null) {
        return error('error when parsing subscript index.', exp);
      } else if (y.isBracket && y[0] === 'list!') {
        if (y.length === 1) {
          return error('subscript index should not be empty list', exp);
        } else if (y.length === 2) {
          return wrapInfo1(['index!', x, y[1]], exp);
        } else {
          return wrapInfo1(['index!', x, y], exp);
        }
      } else {
        return wrapInfo1(['index!', x, y], exp);
      }
    } else if (head === 'index&/') {
      if (y == null) {
        return error('error when parsing subscript index', exp);
      } else {
        return wrapInfo1(['index!', x, y], exp);
      }
    } else if (head === ',') {
      if (x && x[0] === ',') {
        x.push(y);
        return wrapInfo1(x, exp);
      } else {
        return wrapInfo1([',', x, y], exp);
      }
    } else {
      return wrapInfo1([head, x, y], exp);
    }
  }
};
