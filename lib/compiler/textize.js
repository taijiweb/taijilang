var BINARY, BLOCK, BRACKET, CLAUSE, COMPOUND, CURVE, FUNCTION, INDENT, LINE, LIST, MAYBE, PAREN, SEQUENCE, STATEMENT, STATEMENT_LIST, UNDENT, WRAP_BLOCK, begin, binary, binaryPriority, block, bracket, charset, clause, compound, curve, digitCharSet, entity, extend, func, identifierCharSet, ind, indentToken, isArray, isValue, letterCharSet, line, list, maybe, paren, priority, sequence, setFunction, statement, statementList, str, textize, token, tokenFnMap, tokenNameMap, unaryPriority, und, undefinedExp, undentToken, wrapBlock, _ref, _ref1,
  __slice = [].slice;

_ref = require('../utils'), str = _ref.str, isArray = _ref.isArray, extend = _ref.extend, entity = _ref.entity, charset = _ref.charset, begin = _ref.begin, undefinedExp = _ref.undefinedExp, isValue = _ref.isValue;

_ref1 = require('../parser/base'), digitCharSet = _ref1.digitCharSet, letterCharSet = _ref1.letterCharSet, identifierCharSet = _ref1.identifierCharSet;

PAREN = 1;

BRACKET = 2;

CURVE = 3;

LIST = 4;

STATEMENT_LIST = 5;

WRAP_BLOCK = 6;

BLOCK = 7;

MAYBE = 8;

STATEMENT = 9;

CLAUSE = 10;

COMPOUND = 11;

FUNCTION = 12;

SEQUENCE = 13;

LINE = 14;

INDENT = 15;

UNDENT = 16;

BINARY = 17;

tokenNameMap = {
  PAREN: PAREN,
  BRACKET: BRACKET,
  CURVE: CURVE,
  LIST: LIST,
  STATEMENT_LIST: STATEMENT_LIST,
  WRAP_BLOCK: WRAP_BLOCK,
  BLOCK: BLOCK,
  MAYBE: MAYBE,
  STATEMENT: STATEMENT,
  CLAUSE: CLAUSE,
  COMPOUND: COMPOUND,
  FUNCTION: FUNCTION,
  SEQUENCE: SEQUENCE,
  LINE: LINE,
  INDENT: INDENT,
  UNDENT: UNDENT,
  BINARY: BINARY
};

paren = function(exp) {
  return {
    kind: PAREN,
    value: exp
  };
};

bracket = function(exp) {
  return {
    kind: BRACKET,
    value: exp
  };
};

curve = function(exp) {
  return {
    kind: CURVE,
    value: exp
  };
};

line = {
  kind: LINE
};

indentToken = function(width) {
  return {
    kind: INDENT,
    value: width
  };
};

undentToken = function(width) {
  return {
    kind: UNDENT,
    value: width
  };
};

ind = {
  kind: INDENT
};

und = {
  kind: UNDENT
};

binary = function(exp) {
  return {
    kind: BINARY,
    value: exp
  };
};

sequence = function(exp) {
  var e;
  return {
    kind: SEQUENCE,
    value: (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = exp.length; _i < _len; _i++) {
        e = exp[_i];
        _results.push(token(e));
      }
      return _results;
    })()
  };
};

list = function(exp) {
  var e;
  return {
    kind: LIST,
    value: (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = exp.length; _i < _len; _i++) {
        e = exp[_i];
        _results.push(token(e));
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
    kind: CLAUSE,
    value: exps
  };
};

statement = function(exp) {
  var t;
  t = token(exp);
  if (t.kind === STATEMENT || t.kind === STATEMENT_LIST) {
    return t;
  } else {
    return {
      kind: STATEMENT,
      value: t
    };
  }
};

compound = function() {
  var exps;
  exps = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  return {
    kind: STATEMENT,
    value: exps,
    compound: true
  };
};

statementList = function(exp) {
  var e;
  return {
    kind: STATEMENT_LIST,
    value: (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = exp.length; _i < _len; _i++) {
        e = exp[_i];
        _results.push(token(e));
      }
      return _results;
    })()
  };
};

block = function(exp) {
  return {
    kind: BLOCK,
    value: exp
  };
};

wrapBlock = function(exp) {
  return {
    kind: WRAP_BLOCK,
    value: exp
  };
};

func = function() {
  var exps;
  exps = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  return {
    kind: FUNCTION,
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
    x = token(exp[2]);
    return setFunction(x, priority([token(exp[1]), ' = ', (x.pri > 17 ? paren(x) : x)], 17));
  },
  'augmentAssign!': function(exp) {
    var x;
    x = token(exp[3]);
    return setFunction(x, priority([token(exp[2]), ' ', exp[1], ' ', (x.pri > 17 ? paren(x) : x)], 17));
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
    return priority(list(exp[1]), 18);
  },
  'call!': function(exp) {
    var caller;
    caller = token(exp[1]);
    return setFunction(caller, priority([caller, paren(list(exp[2]))], 2));
  },
  'index!': function(exp) {
    return priority([token(exp[1]), bracket(token(exp[2]))], 1);
  },
  'attribute!': function(exp) {
    return priority([token(exp[1]), '.', exp[2]], 1);
  },
  'hash!': function(exp) {
    return priority(['{ ', list(exp[1]), '}'], 0);
  },
  'hashitem!': function(exp) {
    return priority([token(exp[1]), ': ', token(exp[2])], 0);
  },
  'binary!': function(exp) {
    var op, pri, x, y;
    pri = binaryPriority[op = exp[1]];
    x = token(exp[2]);
    y = token(exp[3]);
    return priority(binary([(x.pri > pri ? paren(x) : x), op, (y.pri > pri ? paren(y) : y)]), pri);
  },
  'prefix!': function(exp) {
    var pri, x;
    pri = unaryPriority[exp[1]];
    x = token(exp[2]);
    return priority([exp[1], (letterCharSet[entity(exp[1])[0]] ? ' ' : ''), (x.pri > pri ? paren(x) : x)], pri);
  },
  'suffix!': function(exp) {
    var pri, x;
    pri = unaryPriority[exp[1]];
    x = token(exp[2]);
    return priority([(x.pri > pri ? paren(x) : x), exp[1]], pri);
  },
  '?:': function(exp) {
    var x, y, z;
    x = token(exp[1]);
    y = token(exp[2]);
    z = token(exp[3]);
    return priority([(x.pri > 15 ? paren(x) : x), '? ', (y.pri > 15 ? paren(y) : y), ': ', (z.pri > 15 ? paren(z) : z)], 15);
  },
  'noop!': function(exp) {
    return '';
  },
  'directLineComment!': function(exp) {
    return entity(exp[1]);
  },
  'directCBlockComment!': function(exp) {
    return entity(exp[1]);
  },
  'var': function(exp) {
    var assigns, e, exps, result, t, _i, _j, _len, _len1, _ref2, _ref3;
    exps = [];
    assigns = [];
    _ref2 = exp.slice(1);
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      e = _ref2[_i];
      if (!e.push) {
        exps.push(e);
      } else {
        assigns.push(e);
      }
    }
    result = ['var ', list(exps)];
    if (exps.length && assigns.length) {
      result.push(', ');
    }
    if (assigns.length > 1) {
      result.push(indentToken(4));
    }
    t = token(assigns[0]);
    if (t["function"]) {
      result["function"] = true;
    }
    if (assigns.length) {
      result.push(t);
    }
    _ref3 = assigns.slice(1);
    for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
      e = _ref3[_j];
      result.push(', ');
      result.push(line);
      t = token(e);
      if (t["function"]) {
        result.push(line);
      }
      result.push(t);
    }
    if (assigns.length > 1) {
      result.push(undentToken(4));
    }
    return result;
  },
  'begin!': function(exp) {
    var e, e1, ee, ee1, exps, _i, _len, _ref2;
    exps = [];
    e1 = '';
    _ref2 = exp.slice(1);
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      e = _ref2[_i];
      if (!e) {
        exps.push(e);
      } else if (e1[0] === 'var') {
        if (e[0] === 'var') {
          e1.push(e[1]);
        } else if (e[0] === '=' && (ee1 = entity(e[1])) && (typeof ee1 === 'string') && ee1 === entity(e1[e1.length - 1])) {
          e1.pop();
          e1.push(e);
        } else {
          exps.push(e);
          e1 = e;
        }
      } else {
        exps.push(e);
        e1 = e;
      }
    }
    e = exps[exps.length - 1];
    if (e === '' || (ee = entity(e)) === '' || e === void 0 || ee === void 0) {
      exps.pop();
    }
    if (exps.length === 1) {
      return statement(exps[0]);
    } else {
      return statementList((function() {
        var _j, _len1, _results;
        _results = [];
        for (_j = 0, _len1 = exps.length; _j < _len1; _j++) {
          e = exps[_j];
          _results.push(statement(e));
        }
        return _results;
      })());
    }
  },
  'debugger!': function(exp) {
    return 'debugger';
  },
  'label!': function(exp) {
    return [token(exp[1]), ': ', token(exp[2])];
  },
  'break': function(exp) {
    return ['break ', token(exp[1])];
  },
  'continue': function(exp) {
    return ['continue ', token(exp[1])];
  },
  'return': function(exp) {
    return ['return ', token(exp[1])];
  },
  'throw': function(exp) {
    return ['throw ', token(exp[1])];
  },
  'new': function(exp) {
    return priority(['new ', token(exp[1])], 1);
  },
  'function': function(exp) {
    var body;
    if (entity(exp[2])) {
      body = wrapBlock(statement(exp[2]));
    } else {
      body = '{}';
    }
    return func('function ', paren(list(exp[1])), ' ', body);
  },
  'if': function(exp) {
    var elseClause;
    if (exp[3]) {
      elseClause = token(exp[3]);
      if (elseClause.kind === COMPOUND || elseClause.kind === STATEMENT_LIST && elseClause.value.length > 1) {
        elseClause = block(elseClause);
      }
      return compound('if ', paren(token(exp[1])), block(token(exp[2])), clause('else ', elseClause));
    } else {
      return compound('if ', paren(token(exp[1])), block(token(exp[2])));
    }
  },
  'while': function(exp) {
    return compound('while ', paren(token(exp[1])), block(token(exp[2])));
  },
  'doWhile!': function(exp) {
    return compound('do ', wrapBlock(token(exp[1])), ' while ', paren(token(exp[2])));
  },
  'try': function(exp) {
    var result;
    result = ['try ', wrapBlock(token(exp[1])), clause('catch ', paren(token(exp[2]))), wrapBlock(token(exp[3]))];
    if (exp[4]) {
      result.push(clause('finally ', wrapBlock(token(exp[4]))));
    }
    return compound(result);
  },
  'jsForIn!': function(exp) {
    return compound('for ', paren([token(exp[1]), ' in ', token(exp[2])]), block(token(exp[3])));
  },
  'cfor!': function(exp) {
    return compound('for ', paren([token(exp[1]), ';', token(exp[2]), ';', token(exp[3])]), block(token(exp[4])));
  },
  'switch': function(exp) {
    var body, cases, e, x, _i, _j, _len, _len1, _ref2, _ref3;
    body = [];
    _ref2 = exp[2];
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      e = _ref2[_i];
      cases = [];
      _ref3 = e[0];
      for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
        x = _ref3[_j];
        body.push('case ');
        body.push(token(x));
        body.push(': ');
      }
      body.push(token(e[1]));
      body.push(';');
    }
    if (exp[3]) {
      body.push(clause('default: ', token(exp[3])));
    }
    return compound('switch ', paren(token(exp[1])), wrapBlock(body));
  },
  'with!': function(exp) {
    return compound('with ', paren(token(exp[1])), block(token(exp[2])));
  },
  'letloop!': function(exp) {
    var b, bindings, body, exps, params, _i, _len;
    exps = [];
    params = exp[1];
    bindings = exp[2];
    body = exp[3];
    for (_i = 0, _len = bindings.length; _i < _len; _i++) {
      b = bindings[_i];
      exps.push(['var', b[0]]);
      exps.push(['=', b[0], ['function ', params, b[1]]]);
    }
    exps.push(body);
    return token(begin(exps));
  }
};

token = function(exp) {
  var fn;
  if (isArray(exp)) {
    if (!exp.length) {
      return '[]';
    } else if (typeof exp[0] !== 'string') {
      return bracket(list(exp));
    } else if ((fn = tokenFnMap[exp[0]])) {
      return fn(exp);
    } else {
      return bracket(list(exp));
    }
  } else if (typeof exp === 'object' || typeof exp === 'string') {
    return exp;
  } else if (exp != null) {
    return exp.toString();
  } else {
    return '';
  }
};

textize = function(options) {
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
    LINE: function(tkn) {
      return newline(indentRow);
    },
    INDENT: function(tkn) {
      indentRow += tkn.value || indentWidth;
      return '';
    },
    UNDENT: function(tkn) {
      indentRow -= tkn.value || indentWidth;
      return '';
    },
    PAREN: function(tkn) {
      return char('(') + text(tkn.value) + char(')');
    },
    BRACKET: function(tkn) {
      return char('[') + text(tkn.value) + char(']');
    },
    CURVE: function(tkn) {
      return char('{') + text(tkn.value) + char('}');
    },
    BINARY: function(tkn) {
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
    LIST: function(tkn) {
      var exp, indented, result, t, _i, _len, _ref2;
      exp = tkn.value;
      if (exp.length) {
        result = '';
        indented = false;
        result += text(exp[0]);
        _ref2 = exp.slice(1);
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          t = _ref2[_i];
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
    SEQUENCE: function(tkn) {
      var t;
      return ((function() {
        var _i, _len, _ref2, _results;
        _ref2 = tkn.value;
        _results = [];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          t = _ref2[_i];
          _results.push(text(t));
        }
        return _results;
      })()).join('');
    },
    WRAP_BLOCK: function(tkn) {
      var exp, value;
      exp = tkn.value;
      if (typeof exp === 'object' && exp.kind === STATEMENT_LIST && (value = exp.value) && value.length === 0) {
        return str('{}') + nl();
      }
      return str('{') + indent() + nl() + text(exp) + semicolon() + undent() + nl() + str('}');
    },
    BLOCK: function(tkn) {
      var exp, value;
      exp = tkn.value;
      if (typeof exp === 'object' && exp.kind === STATEMENT_LIST && (value = exp.value)) {
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
    STATEMENT_LIST: function(tkn) {
      var exp, result, t, _i, _len, _ref2;
      exp = tkn.value;
      if (exp.length === 0) {
        return '';
      }
      result = text(exp[0]);
      _ref2 = exp.slice(1);
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        t = _ref2[_i];
        result += semicolon();
        if (t.value && t.value["function"] || t.compound) {
          result += nl();
        }
        result += nl() + text(t);
      }
      return result;
    },
    STATEMENT: function(tkn) {
      return text(tkn.value) + clauseSemicolon();
    },
    FUNCTION: function(tkn) {
      if (AfterNeedParnFunctionCharset[prev] || !prev) {
        return char('(') + text(tkn.value) + char(')');
      } else {
        return text(tkn.value);
      }
    },
    CLAUSE: function(tkn) {
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
  text = function(exp) {
    var c, prevChar, s, s0, tkn;
    if (exp == null) {
      return '';
    } else if (Object.prototype.toString.call(exp) === '[object Array]') {
      return exp.textizedString = ((function() {
        var _j, _len, _results1;
        _results1 = [];
        for (_j = 0, _len = exp.length; _j < _len; _j++) {
          tkn = exp[_j];
          _results1.push(text(tkn));
        }
        return _results1;
      })()).join('');
    } else if (typeof exp === 'object') {
      if (exp.kind != null) {
        return exp.textizedString = textFnList[exp.kind](exp);
      } else {
        return text(exp.identifier || exp.symbol || exp.value);
      }
    } else {
      s = exp.toString();
      if (!s) {
        return '';
      }
      s0 = s[0];
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
  text.getCode = function() {
    return code;
  };
  return text;
};

exports.tocode = function(exp, options) {
  var textFn;
  textFn = textize(extend({}, options));
  textFn(token(exp));
  return textFn.getCode();
};
