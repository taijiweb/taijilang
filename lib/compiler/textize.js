var LIST, SYMBOL, TKN_BINARY, TKN_BLOCK, TKN_BRACKET, TKN_CLAUSE, TKN_COMPOUND, TKN_CURVE, TKN_FUNCTION, TKN_INDENT, TKN_LINE, TKN_LIST, TKN_MAYBE, TKN_PAREN, TKN_SEQUENCE, TKN_STATEMENT, TKN_STATEMENT_LIST, TKN_UNDENT, TKN_VALUE, TKN_WRAP_BLOCK, TokenizeError, VALUE, assert, begin, binary, binaryPriority, block, bracket, charset, clause, compound, constant, curve, digitCharSet, extend, func, identifierCharSet, ind, indentToken, isArray, isValue, letterCharSet, line, list, makeTextizer, maybe, paren, priority, sequence, setFunction, statement, statementList, str, tokenFnMap, tokenNameMap, tokenize, tokenizeError, trace, unaryPriority, und, undefinedExp, undentToken, wrapBlock, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __slice = [].slice;

_ref = require('../utils'), str = _ref.str, isArray = _ref.isArray, extend = _ref.extend, charset = _ref.charset, begin = _ref.begin, undefinedExp = _ref.undefinedExp, isValue = _ref.isValue, digitCharSet = _ref.digitCharSet, letterCharSet = _ref.letterCharSet, identifierCharSet = _ref.identifierCharSet, constant = _ref.constant, assert = _ref.assert, trace = _ref.trace;

SYMBOL = constant.SYMBOL, VALUE = constant.VALUE, LIST = constant.LIST;

TKN_PAREN = 1;

TKN_BRACKET = 2;

TKN_CURVE = 3;

TKN_LIST = 4;

TKN_STATEMENT_LIST = 5;

TKN_WRAP_BLOCK = 6;

TKN_BLOCK = 7;

TKN_MAYBE = 8;

TKN_STATEMENT = 9;

TKN_CLAUSE = 10;

TKN_COMPOUND = 11;

TKN_FUNCTION = 12;

TKN_SEQUENCE = 13;

TKN_LINE = 14;

TKN_INDENT = 15;

TKN_UNDENT = 16;

TKN_BINARY = 17;

TKN_VALUE = 18;

tokenNameMap = {
  TKN_PAREN: TKN_PAREN,
  TKN_BRACKET: TKN_BRACKET,
  TKN_CURVE: TKN_CURVE,
  TKN_LIST: TKN_LIST,
  TKN_STATEMENT_LIST: TKN_STATEMENT_LIST,
  TKN_WRAP_BLOCK: TKN_WRAP_BLOCK,
  TKN_BLOCK: TKN_BLOCK,
  TKN_MAYBE: TKN_MAYBE,
  TKN_STATEMENT: TKN_STATEMENT,
  TKN_CLAUSE: TKN_CLAUSE,
  TKN_COMPOUND: TKN_COMPOUND,
  TKN_FUNCTION: TKN_FUNCTION,
  TKN_SEQUENCE: TKN_SEQUENCE,
  TKN_LINE: TKN_LINE,
  TKN_INDENT: TKN_INDENT,
  TKN_UNDENT: TKN_UNDENT,
  TKN_BINARY: TKN_BINARY,
  TKN_VALUE: TKN_VALUE
};

TokenizeError = (function(_super) {
  __extends(TokenizeError, _super);

  function TokenizeError(exp, message) {
    this.exp = exp;
    this.message = message;
  }

  return TokenizeError;

})(Error);

tokenizeError = function(exp, message) {
  throw message + ':  ' + str(exp);
};

paren = function(exp) {
  return {
    sort: TKN_PAREN,
    value: exp
  };
};

bracket = function(exp) {
  return {
    sort: TKN_BRACKET,
    value: exp
  };
};

curve = function(exp) {
  return {
    sort: TKN_CURVE,
    value: exp
  };
};

line = {
  sort: TKN_LINE
};

indentToken = function(width) {
  return {
    sort: TKN_INDENT,
    value: width
  };
};

undentToken = function(width) {
  return {
    sort: TKN_UNDENT,
    value: width
  };
};

ind = {
  sort: TKN_INDENT
};

und = {
  sort: TKN_UNDENT
};

binary = function(exp) {
  return {
    sort: TKN_BINARY,
    value: exp
  };
};

sequence = function(exp) {
  var e;
  return {
    sort: TKN_SEQUENCE,
    value: (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = exp.length; _i < _len; _i++) {
        e = exp[_i];
        _results.push(tokenize(e));
      }
      return _results;
    })()
  };
};

list = function(exp) {
  var e;
  return {
    sort: TKN_LIST,
    value: (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = exp.length; _i < _len; _i++) {
        e = exp[_i];
        _results.push(tokenize(e));
      }
      return _results;
    })()
  };
};

maybe = function(test, exp) {
  if (test) {
    return exp;
  } else {
    return '';
  }
};

clause = function() {
  var exps;
  exps = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  return {
    sort: TKN_CLAUSE,
    value: exps
  };
};

statement = function(exp) {
  var t;
  t = tokenize(exp);
  if (t.sort === TKN_STATEMENT || t.sort === TKN_STATEMENT_LIST) {
    return t;
  } else {
    return {
      sort: TKN_STATEMENT,
      value: t
    };
  }
};

compound = function() {
  var exps;
  exps = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  return {
    sort: TKN_STATEMENT,
    value: exps,
    compound: true
  };
};

statementList = function(exp) {
  var e;
  trace(str(exp));
  return {
    sort: TKN_STATEMENT_LIST,
    value: (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = exp.length; _i < _len; _i++) {
        e = exp[_i];
        _results.push(tokenize(e));
      }
      return _results;
    })()
  };
};

block = function(exp) {
  return {
    sort: TKN_BLOCK,
    value: exp
  };
};

wrapBlock = function(exp) {
  return {
    sort: TKN_WRAP_BLOCK,
    value: exp
  };
};

func = function() {
  var exps;
  exps = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  return {
    sort: TKN_FUNCTION,
    value: exps,
    "function": true
  };
};

setFunction = function(depend, exp) {
  if (depend["function"]) {
    exp["function"] = true;
  }
  return exp;
};

priority = function(exp, pri) {
  exp.pri = pri;
  return exp;
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

tokenFnMap = {
  '=': function(exp) {
    var x;
    x = tokenize(exp[2]);
    return setFunction(x, priority([tokenize(exp[1]), ' = ', (x.pri > 17 ? paren(x) : x)], 17));
  },
  'augmentAssign!': function(exp) {
    var x;
    x = tokenize(exp[3]);
    return setFunction(x, priority([tokenize(exp[2]), ' ', exp[1], ' ', (x.pri > 17 ? paren(x) : x)], 17));
  },
  'quote!': function(exp) {
    return priority([JSON.stringify(exp[1])], 0);
  },
  'jsvar!': function(exp) {
    return priority(exp[1], 0);
  },
  'regexp!': function(exp) {
    return priority(exp[1], 0);
  },
  'list!': function(exp) {
    return priority(['[', list(exp.slice(1)), ']'], 0);
  },
  'comma!': function(exp) {
    return priority(list(exp.slice(1)), 18);
  },
  'call!': function(exp) {
    var caller;
    caller = tokenize(exp[1]);
    return setFunction(caller, priority([caller, paren(list(exp[2]))], 2));
  },
  'index!': function(exp) {
    return priority([tokenize(exp[1]), bracket(tokenize(exp[2]))], 1);
  },
  'attribute!': function(exp) {
    return priority([tokenize(exp[1]), '.', exp[2]], 1);
  },
  'hash!': function(exp) {
    return priority(['{ ', list(exp[1]), '}'], 0);
  },
  'hashitem!': function(exp) {
    return priority([tokenize(exp[1]), ': ', tokenize(exp[2])], 0);
  },
  'binary!': function(exp) {
    var op, pri, x, y;
    pri = binaryPriority[op = exp[1]];
    x = tokenize(exp[2]);
    y = tokenize(exp[3]);
    return priority(binary([(x.pri > pri ? paren(x) : x), op, (y.pri > pri ? paren(y) : y)]), pri);
  },
  'prefix!': function(exp) {
    var op, pri, x;
    op = exp[1].value;
    pri = unaryPriority[op];
    x = tokenize(exp[2]);
    return priority([op, (letterCharSet[op[0]] ? ' ' : ''), (x.pri > pri ? paren(x) : x)], pri);
  },
  'suffix!': function(exp) {
    var pri, x;
    pri = unaryPriority[exp[1]];
    x = tokenize(exp[2]);
    return priority([(x.pri > pri ? paren(x) : x), exp[1]], pri);
  },
  '?:': function(exp) {
    var x, y, z;
    x = tokenize(exp[1]);
    y = tokenize(exp[2]);
    z = tokenize(exp[3]);
    return priority([(x.pri > 15 ? paren(x) : x), '? ', (y.pri > 15 ? paren(y) : y), ': ', (z.pri > 15 ? paren(z) : z)], 15);
  },
  'noop!': function(exp) {
    return '';
  },
  'directLineComment!': function(exp) {
    return exp[1].value;
  },
  'directCBlockComment!': function(exp) {
    return exp[1].value;
  },
  'var': function(exp) {
    var assigns, e, meetFirst, result, t, _i, _j, _len, _len1, _ref1;
    trace('tokenize var: ' + str(exp));
    result = ['var'];
    assigns = [];
    meetFirst = false;
    _ref1 = exp.slice(1);
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      e = _ref1[_i];
      if (!(e instanceof Array)) {
        if (meetFirst) {
          result.push(',');
        } else {
          meetFirst = true;
        }
        result.push(e);
      } else {
        assigns.push(e);
      }
    }
    if (!assigns.length) {
      return result;
    }
    result.push(indentToken(4));
    for (_j = 0, _len1 = assigns.length; _j < _len1; _j++) {
      e = assigns[_j];
      if (meetFirst) {
        result.push(',');
        result.push(line);
      } else {
        meetFirst = true;
      }
      t = tokenize(e);
      if (t["function"]) {
        result.push(line);
      }
      result.push(t);
    }
    result.push(undentToken(4));
    return result;
  },
  'begin!': function(exp) {
    var e, e1, e1Value, eValue, eValue0, eValue1Value, exps, _i, _len, _ref1;
    trace('tokenize begin!:', str(exp));
    exps = [];
    e1 = '';
    _ref1 = exp.slice(1);
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      e = _ref1[_i];
      assert(e, 'unexpected undefined while textizing ' + str(exp));
      eValue = e.value;
      if (e1 && (e1Value = e1.value)[0].value === 'var') {
        if ((eValue0 = eValue[0])) {
          if (eValue0.value === 'var') {
            e1Value.push(eValue[1]);
          } else if (eValue0.value === '=' && (eValue1Value = eValue[1].value) && (typeof eValue1Value === 'string') && eValue1Value === eValue[eValue.length - 1].value) {
            e1Value.pop();
            e1Value.push(e);
          } else {
            exps.push(e);
            e1 = e;
          }
        } else {
          exps.push(e);
          e1 = e;
        }
      } else {
        exps.push(e);
        e1 = e;
      }
    }
    if (e === '' || e === undefinedExp) {
      exps.pop();
    }
    if (exps.length === 1) {
      return statement(exps[0]);
    } else {
      return statementList(exps);
    }
  },
  'debugger!': function(exp) {
    return 'debugger';
  },
  'label!': function(exp) {
    return [tokenize(exp[1]), ': ', tokenize(exp[2])];
  },
  'break': function(exp) {
    return ['break ', tokenize(exp[1])];
  },
  'continue': function(exp) {
    return ['continue ', tokenize(exp[1])];
  },
  'return': function(exp) {
    return ['return ', tokenize(exp[1])];
  },
  'throw': function(exp) {
    return ['throw ', tokenize(exp[1])];
  },
  'new': function(exp) {
    return priority(['new ', tokenize(exp[1])], 1);
  },
  'function': function(exp) {
    var body, exp2, exp21;
    exp2 = exp[2].value;
    if (exp2[0] === 'return') {
      if (!(exp21 = exp2[1])) {
        body = '{}';
      } else if (exp21[0] === 'jsvar!' && exp21[1] === 'undefined') {
        body = '{}';
      } else {
        body = wrapBlock(statement(exp2));
      }
    } else if (exp2) {
      body = wrapBlock(statement(exp2));
    } else {
      body = '{}';
    }
    return func('function ', paren(list(exp[1])), ' ', body);
  },
  'if': function(exp) {
    var elseClause;
    if (exp[3]) {
      elseClause = tokenize(exp[3]);
      if (elseClause.sort === TKN_COMPOUND || elseClause.sort === TKN_STATEMENT_LIST && elseClause.value.length > 1) {
        elseClause = block(elseClause);
      }
      return compound('if ', paren(tokenize(exp[1])), block(tokenize(exp[2])), clause('else ', elseClause));
    } else {
      return compound('if ', paren(tokenize(exp[1])), block(tokenize(exp[2])));
    }
  },
  'while': function(exp) {
    return compound('while ', paren(tokenize(exp[1])), block(tokenize(exp[2])));
  },
  'doWhile!': function(exp) {
    return compound('do ', wrapBlock(tokenize(exp[1])), ' while ', paren(tokenize(exp[2])));
  },
  'try': function(exp) {
    var result;
    result = ['try ', wrapBlock(tokenize(exp[1])), clause('catch ', paren(tokenize(exp[2]))), wrapBlock(tokenize(exp[3]))];
    if (exp[4]) {
      result.push(clause('finally ', wrapBlock(tokenize(exp[4]))));
    }
    return compound(result);
  },
  'jsForIn!': function(exp) {
    return compound('for ', paren([tokenize(exp[1]), ' in ', tokenize(exp[2])]), block(tokenize(exp[3])));
  },
  'cfor!': function(exp) {
    return compound('for ', paren([tokenize(exp[1]), ';', tokenize(exp[2]), ';', tokenize(exp[3])]), block(tokenize(exp[4])));
  },
  'switch': function(exp) {
    var body, cases, e, x, _i, _j, _len, _len1, _ref1, _ref2;
    body = [];
    _ref1 = exp[2];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      e = _ref1[_i];
      cases = [];
      _ref2 = e[0];
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        x = _ref2[_j];
        body.push('case ');
        body.push(tokenize(x));
        body.push(': ');
      }
      body.push(tokenize(e[1]));
      body.push(';');
    }
    if (exp[3]) {
      body.push(clause('default: ', tokenize(exp[3])));
    }
    return compound('switch ', paren(tokenize(exp[1])), wrapBlock(body));
  },
  'with!': function(exp) {
    return compound('with ', paren(tokenize(exp[1])), block(tokenize(exp[2])));
  }
};

exports.tokenize = tokenize = function(exp) {
  trace('tokenize: ', str(exp));
  switch (exp.kind) {
    case SYMBOL:
    case VALUE:
      return exp.value;
    case LIST:
      assert(tokenFnMap[exp.value[0].value], 'found no tokenize function: ' + exp.value[0].value);
      return tokenFnMap[exp.value[0].value](exp.value);
    default:
      throw 'tokenize: wrong kind: ' + str(exp);
  }
};

makeTextizer = function(options) {
  var AfterNeedParnFunctionCharset, char, clauseSemicolon, code, indent, indentRow, indentWidth, lineLength, lineno, name, newline, nl, prev, row, semicolon, text, textFnList, textFnMap, undent, value, _i, _results;
  code = '';
  prev = '';
  indentRow = 0;
  lineno = 0;
  row = 0;
  indentWidth = options.indentWidth || 2;
  lineLength = options.lineLength || 80;
  char = function(c) {
    code += c;
    if (c === '\n') {
      row = 0;
      lineno++;
    } else if (c === '\r') {
      row = 0;
    } else {
      row++;
      if (c !== ' ' && c !== '\t') {
        prev = c;
      }
    }
    return c;
  };
  semicolon = function() {
    if (prev !== ';') {
      return char(';');
    } else {
      return '';
    }
  };
  clauseSemicolon = function() {
    if (prev !== ';' && prev !== '}') {
      return char(';');
    } else {
      return '';
    }
  };
  str = function(s) {
    var c, _i, _len;
    for (_i = 0, _len = s.length; _i < _len; _i++) {
      c = s[_i];
      char(c);
    }
    return s;
  };
  newline = function(startRow) {
    var i, result;
    result = char('\n');
    i = 0;
    while (i++ < startRow) {
      result += char(' ');
    }
    return result;
  };
  nl = function() {
    var i, result;
    result = char('\n');
    i = 0;
    while (i++ < indentRow) {
      result += char(' ');
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
  textFnMap = {
    TKN_INDENT: function(tkn) {
      indentRow += tkn.value || indentWidth;
      return '';
    },
    TKN_LINE: function(tkn) {
      return newline(indentRow);
    },
    TKN_INDENT: function(tkn) {
      indentRow += tkn.value || indentWidth;
      return '';
    },
    TKN_UNDENT: function(tkn) {
      indentRow -= tkn.value || indentWidth;
      return '';
    },
    TKN_PAREN: function(tkn) {
      return char('(') + text(tkn.value) + char(')');
    },
    TKN_BRACKET: function(tkn) {
      return char('[') + text(tkn.value) + char(']');
    },
    TKN_CURVE: function(tkn) {
      return char('{') + text(tkn.value) + char('}');
    },
    TKN_BINARY: function(tkn) {
      var exp, op, result;
      exp = tkn.value;
      result = text(exp[0]);
      op = exp[1];
      if (op !== ',') {
        if (row > lineLength) {
          result += indent() + nl() + text(exp[1]) + char(' ') + text(exp[2]) + undent();
        } else {
          result += char(' ') + text(exp[1]) + char(' ') + text(exp[2]);
        }
      } else {
        if (row > lineLength) {
          result += indent() + text(exp[1]) + nl() + text(exp[2]) + undent();
        } else {
          result += text(exp[1]) + char(' ') + text(exp[2]);
        }
      }
      return result;
    },
    TKN_LIST: function(tkn) {
      var exp, indented, result, t, _i, _len, _ref1;
      exp = tkn.value;
      if (exp.length) {
        result = '';
        indented = false;
        result += text(exp[0]);
        _ref1 = exp.slice(1);
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          t = _ref1[_i];
          result += str(', ');
          if (row > lineLength) {
            if (!indented) {
              indented = true;
              indent();
            }
            result += nl();
          }
          result += text(t);
        }
        if (indented) {
          undent();
        }
        return result;
      } else {
        return '';
      }
    },
    TKN_SEQUENCE: function(tkn) {
      var t;
      return ((function() {
        var _i, _len, _ref1, _results;
        _ref1 = tkn.value;
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          t = _ref1[_i];
          _results.push(text(t));
        }
        return _results;
      })()).join('');
    },
    TKN_WRAP_BLOCK: function(tkn) {
      var exp, value;
      exp = tkn.value;
      if (typeof exp === 'object' && exp.sort === TKN_STATEMENT_LIST && (value = exp.value) && value.length === 0) {
        return str('{}') + nl();
      }
      return str('{') + indent() + nl() + text(exp) + semicolon() + undent() + nl() + str('}');
    },
    TKN_BLOCK: function(tkn) {
      var exp, value;
      exp = tkn.value;
      if (typeof exp === 'object' && exp.sort === TKN_STATEMENT_LIST && (value = exp.value)) {
        if (value.length === 0) {
          return '{}' + nl();
        } else if (value.length > 1) {
          return str('{ ') + indent() + nl() + text(exp) + semicolon() + undent() + nl() + str('}');
        } else {
          return indent() + text(value[0]) + undent();
        }
      } else {
        return indent() + nl() + text(exp) + undent();
      }
    },
    TKN_STATEMENT_LIST: function(tkn) {
      var exp, result, t, _i, _len, _ref1;
      exp = tkn.value;
      if (exp.length === 0) {
        return '';
      }
      result = text(exp[0]);
      _ref1 = exp.slice(1);
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        t = _ref1[_i];
        result += semicolon();
        if (t.value && t.value["function"] || t.compound) {
          result += nl();
        }
        result += nl() + text(t);
      }
      return result;
    },
    TKN_STATEMENT: function(tkn) {
      return text(tkn.value) + clauseSemicolon();
    },
    TKN_FUNCTION: function(tkn) {
      if (AfterNeedParnFunctionCharset[prev] || !prev) {
        return char('(') + text(tkn.value) + char(')');
      } else {
        return text(tkn.value);
      }
    },
    TKN_CLAUSE: function(tkn) {
      return clauseSemicolon() + nl() + text(tkn.value);
    }
  };
  textFnList = (function() {
    _results = [];
    for (_i = 0; _i < 100; _i++){ _results.push(_i); }
    return _results;
  }).apply(this);
  for (name in tokenNameMap) {
    value = tokenNameMap[name];
    textFnList[value] = textFnMap[name];
  }
  AfterNeedParnFunctionCharset = charset(';}\n\r');
  return text = function(exp) {
    var c, prevChar, s, s0, tkn;
    if (exp instanceof Array) {
      return ((function() {
        var _j, _len, _results1;
        _results1 = [];
        for (_j = 0, _len = exp.length; _j < _len; _j++) {
          tkn = exp[_j];
          _results1.push(text(tkn));
        }
        return _results1;
      })()).join('');
    } else if (typeof exp === 'object') {
      if (!exp.sort) {
        return text(exp.value);
      } else {
        return textFnList[exp.sort](exp);
      }
    } else {
      s = exp.toString();
      s0 = exp[0];
      prevChar = code[code.length - 1];
      if (identifierCharSet[prevChar] && identifierCharSet[s0]) {
        c = char(' ');
      } else if (prevChar === ')' || prevChar === ']') {
        if (identifierCharSet[s0]) {
          c = char(' ');
        } else if (s0 === '{') {
          c = char(' ');
        }
      } else if (prevChar === ',' || prevChar === ';') {
        c = char(' ');
      } else {
        c = '';
      }
      return c + str(s);
    }
  };
};

exports.tocode = function(exp, options) {
  var textize;
  exp = tokenize(exp);
  textize = makeTextizer(extend({}, options));
  return textize(exp);
};
