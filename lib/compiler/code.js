var assert, binaryPriority, compileError, isArray, letterCharSet, makeCoder, str, string, symbolOf, trace, unaryPriority, valueOf, _ref;

_ref = require('../utils'), isArray = _ref.isArray, str = _ref.str, trace = _ref.trace, assert = _ref.assert, symbolOf = _ref.symbolOf, valueOf = _ref.valueOf, letterCharSet = _ref.letterCharSet;

compileError = require('./helper').compileError;

string = function(s) {
  if (s instanceof String) {
    return s;
  } else {
    return new String(s);
  }
};


/*
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
0 () 1. [] 2 new 3 ++ -- 4 ! ~ unary + - typeof void delete
5 * / %   6 + -  7 << >> >>>   8 < <= > >= in instanceof  9 == != === !==  10 & 11 ^ 12 |  13 && 14  || 15 ?:
16 yield right-to-left, 17 right-to-left += -=  *=  /=  %=  <<= >>= >>>= &= ^= |=, 18 comma ,
 */

binaryPriority = {
  '*': 5,
  '/': 5,
  '%': 5,
  '+': 6,
  '-': 6,
  '<<': 7,
  '>>': 7,
  '>>>': 7,
  '<': 8,
  '>': 8,
  '>=': 8,
  '<=': 8,
  'in': 8,
  'instanceof': 8,
  '==': 9,
  '===': 9,
  '!=': 9,
  '!==': 9,
  '&': 10,
  '^': 11,
  '|': 12,
  '&&': 13,
  '||': 13,
  ',': 18
};

unaryPriority = {
  'new': 2,
  '++': 3,
  '--': 3,
  '!': 4,
  '+': 4,
  '-': 4,
  'typeof': 4,
  'void': 4,
  'delete': 4,
  'yield': 16
};

exports.makeCoder = makeCoder = function(options) {
  var block, code, codeFnMap, indent, indentRow, indentWidth, list, nl, paren, priParen, priParen2, priority, undent;
  indentWidth = options.indentWidth || 2;
  indentRow = 0;
  nl = function() {
    var i, result;
    result = '\n';
    i = 0;
    while (i++ < indentRow) {
      result += ' ';
    }
    return result;
  };
  indent = function(width) {
    indentRow += width || indentWidth;
    return '';
  };
  undent = function(width) {
    indentRow -= width || indentWidth;
    return '';
  };
  paren = function(exp) {
    return '(' + exp + ')';
  };
  list = function(exp) {
    var e;
    return ((function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = exp.length; _i < _len; _i++) {
        e = exp[_i];
        _results.push(code(e));
      }
      return _results;
    })()).join(', ');
  };
  block = function(exp) {
    return '{' + indent() + nl() + code(exp) + undent() + nl() + '}';
  };
  priority = function(exp, pri) {
    exp = string(exp);
    exp.pri = pri;
    return exp;
  };
  priParen = function(x, pri) {
    if (x.pri > pri) {
      return paren(x);
    } else {
      return x;
    }
  };
  priParen2 = function(x, pri) {
    if (x.pri >= pri) {
      return paren(x);
    } else {
      return x;
    }
  };
  codeFnMap = {
    '=': function(exp) {
      return priority(code(exp[1]) + ' = ' + priParen(code(exp[2]), 17), 17);
    },
    'quote!': function(exp) {
      return priority(JSON.stringify(exp[1]), 0);
    },
    'jsvar!': function(exp) {
      return priority(exp[1], 0);
    },
    'regexp!': function(exp) {
      return priority(exp[1], 0);
    },
    'list!': function(exp) {
      return priority('[' + list(exp.slice(1)) + ']', 0);
    },
    'comma!': function(exp) {
      return priority(list(exp.slice(1)), 18);
    },
    'call!': function(exp) {
      return priority(code(exp[1]) + paren(list(exp[2])), 2);
    },
    'index!': function(exp) {
      return priority(code(exp[1]) + '[' + code(exp[2]) + ']', 1);
    },
    'attribute!': function(exp) {
      return priority(code(exp[1]) + '.' + exp[2], 1);
    },
    'hash!': function(exp) {
      return priority('{ ' + list(exp[1]) + '}', 0);
    },
    'hashitem!': function(exp) {
      return priority(code(exp[1]) + ': ' + code(exp[2]), 0);
    },
    'binary!': function(exp) {
      var op, pri;
      pri = binaryPriority[op = symbolOf(exp[1])];
      return priority(priParen(code(exp[2]), pri) + ' ' + op + ' ' + priParen2(code(exp[3]), pri), pri);
    },
    'prefix!': function(exp) {
      var op, pri;
      op = symbolOf(exp[1]);
      pri = unaryPriority[op];
      return priority(string(op + (letterCharSet[op[0]] ? ' ' : '') + priParen(code(exp[2]), pri)), pri);
    },
    'suffix!': function(exp) {
      var pri, x;
      pri = unaryPriority[exp[1]];
      x = code(exp[2]);
      return priority(string(priParen(x, pri) + exp[1]), pri);
    },
    '?:': function(exp) {
      return priority(priParen(code(exp[1])) + '? ' + priParen(code(exp[2])) + ': ' + priParen(code(exp[3])), 15);
    },
    'var': function(exp) {
      return 'var ' + code(exp[1]);
    },
    'begin!': function(exp) {
      var e, result, _i, _len, _ref1;
      if (exp.length === 1) {
        return '';
      }
      result = code(exp[1]);
      _ref1 = exp.slice(2);
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        e = _ref1[_i];
        result += ';' + nl() + code(e);
      }
      return result;
    },
    'debugger!': function(exp) {
      return 'debugger';
    },
    'label!': function(exp) {
      return code(exp[1]) + ': ' + code(exp[2]);
    },
    'break': function(exp) {
      return 'break ' + code(exp[1]);
    },
    'continue': function(exp) {
      return 'continue ' + code(exp[1]);
    },
    'return': function(exp) {
      return 'return ' + code(exp[1]);
    },
    'throw': function(exp) {
      return 'throw ' + code(exp[1]);
    },
    'new': function(exp) {
      return priority(string('new ' + code(exp[1])), 1);
    },
    'function': function(exp) {
      return 'function ' + paren(list(exp[1])) + ' ' + block(exp[2]);
    },
    'if': function(exp) {
      if (exp[3]) {
        return 'if ' + paren(code(exp[1])) + ' ' + block(exp[2]) + ' else ' + block(exp[3]);
      } else {
        return 'if ' + paren(code(exp[1])) + block(exp[2]);
      }
    },
    'while': function(exp) {
      return 'while ' + paren(code(exp[1])) + block(exp[2]);
    },
    'try': function(exp) {
      var result;
      result = 'try ' + block(exp[1]) + ' catch ' + paren(code(exp[2])) + block(exp[3]);
      if (exp[4]) {
        result += ' finally ' + block(exp[4]);
      }
      return result;
    },
    'jsForIn!': function(exp) {
      return 'for ' + paren(code(exp[1]) + ' in ' + code(exp[2])) + block(exp[3]);
    }
  };
  return code = function(exp) {
    var fn;
    trace('generate code', exp);
    if (isArray(exp)) {
      if (fn = codeFnMap[symbolOf(exp[0])]) {
        return fn(exp);
      } else {
        return '[' + list(exp) + ']';
      }
    } else {
      return string(valueOf(exp));
    }
  };
};

exports.tocode = function(exp) {
  return makeCoder({})(exp).toString();
};
