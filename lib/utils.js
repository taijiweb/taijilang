
/*
  this file is based on coffeescript/src/helper.coffee(https://github.com/jashkenas/coffeescript)
  Thanks to  Jeremy Ashkenas
  Some stuffs is added or modified for taiji langauge.
 */

/*
Copyright (c) 2009-2014 Jeremy Ashkenas
Copyright (c) 2014-2015 Caoxingming

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
 */
var BINARY, BLOCK_COMMENT, BRACKET, CODE_BLOCK_COMMENT, CODE_BLOCK_COMMENT_LEAD_SYMBOL, COMMAND, COMPACT_CLAUSE_EXPRESSION, CONCAT_LINE, CONJUNCTION, CURVE, C_BLOCK_COMMENT, DATA_BRACKET, EOI, FUNCTION, HALF_DENT, HASH, HASH_KEY_EXPRESSION, HEAD_SPACES, IDENTIFIER, INDENT, INDENT_EXPRESSION, INLINE_COMMENT, INTERPOLATE_STRING, KEYWORD, LINE_COMMENT, LIST, MODULE, MODULE_HEADER, NEWLINE, NON_INTERPOLATE_STRING, NULL, NUMBER, OPERATOR_EXPRESSION, PAREN, PREFIX, PUNCTUATION, REGEXP, RIGHT_DELIMITER, SPACE, SPACES, SPACES_INLINE_COMMENT, SPACE_CLAUSE_EXPRESSION, SPACE_COMMENT, STRING, SUFFIX, SYMBOL, TAIL_COMMENT, UNDENT, VALUE, addBeginItem, assert, begin, buildLocationData, charset, digitCharSet, digits, entity, error, extend, firstIdentifierChars, firstSymbolChars, flatten, formatTaijiJson, fs, identifierCharSet, identifierChars, isArray, isMetaOperation, javascriptKeywordSet, javascriptKeywordText, letterCharSet, letterDigits, letters, log, lowers, norm, path, repeat, returnFnMap, return_, stackReg, stackReg2, str, syntaxErrorToString, taijiIdentifierCharSet, taijiIdentifierChars, trace, trace0, trace1, trace2, trace3, truth, undefinedExp, uppers, _ref, _trace,
  __slice = [].slice;

OPERATOR_EXPRESSION = 0;

COMPACT_CLAUSE_EXPRESSION = 1;

SPACE_CLAUSE_EXPRESSION = 2;

INDENT_EXPRESSION = 3;

HASH_KEY_EXPRESSION = 4;

NULL = 0;

NUMBER = 1;

STRING = 2;

IDENTIFIER = 3;

SYMBOL = 4;

REGEXP = 5;

HEAD_SPACES = 6;

CONCAT_LINE = 7;

PUNCTUATION = 8;

FUNCTION = 9;

BRACKET = 10;

PAREN = 11;

DATA_BRACKET = 12;

CURVE = 13;

INDENT_EXPRESSION = 14;

NEWLINE = 15;

SPACES = 16;

INLINE_COMMENT = 17;

SPACES_INLINE_COMMENT = 18;

LINE_COMMENT = 19;

BLOCK_COMMENT = 20;

CODE_BLOCK_COMMENT = 21;

CONCAT_LINE = 22;

MODULE_HEADER = 23;

MODULE = 24;

NON_INTERPOLATE_STRING = 25;

INTERPOLATE_STRING = 26;

INDENT = 27;

UNDENT = 28;

HALF_DENT = 29;

EOI = 30;

C_BLOCK_COMMENT = 31;

SPACE_COMMENT = 32;

TAIL_COMMENT = 33;

SPACE = 34;

HASH = 35;

RIGHT_DELIMITER = 36;

KEYWORD = 37;

CONJUNCTION = 38;

CODE_BLOCK_COMMENT_LEAD_SYMBOL = 39;

PREFIX = 40;

SUFFIX = 41;

BINARY = 42;

VALUE = 43;

LIST = 44;

COMMAND = 45;

exports.constant = {
  OPERATOR_EXPRESSION: OPERATOR_EXPRESSION,
  COMPACT_CLAUSE_EXPRESSION: COMPACT_CLAUSE_EXPRESSION,
  SPACE_CLAUSE_EXPRESSION: SPACE_CLAUSE_EXPRESSION,
  INDENT_EXPRESSION: INDENT_EXPRESSION,
  HASH_KEY_EXPRESSION: HASH_KEY_EXPRESSION,
  NULL: NULL,
  NUMBER: NUMBER,
  STRING: STRING,
  IDENTIFIER: IDENTIFIER,
  SYMBOL: SYMBOL,
  REGEXP: REGEXP,
  HEAD_SPACES: HEAD_SPACES,
  CONCAT_LINE: CONCAT_LINE,
  PUNCTUATION: PUNCTUATION,
  FUNCTION: FUNCTION,
  BRACKET: BRACKET,
  PAREN: PAREN,
  DATA_BRACKET: DATA_BRACKET,
  CURVE: CURVE,
  INDENT_EXPRESSION: INDENT_EXPRESSION,
  NEWLINE: NEWLINE,
  SPACES: SPACES,
  INLINE_COMMENT: INLINE_COMMENT,
  SPACES_INLINE_COMMENT: SPACES_INLINE_COMMENT,
  LINE_COMMENT: LINE_COMMENT,
  BLOCK_COMMENT: BLOCK_COMMENT,
  CODE_BLOCK_COMMENT: CODE_BLOCK_COMMENT,
  CONCAT_LINE: CONCAT_LINE,
  MODULE_HEADER: MODULE_HEADER,
  MODULE: MODULE,
  NON_INTERPOLATE_STRING: NON_INTERPOLATE_STRING,
  INTERPOLATE_STRING: INTERPOLATE_STRING,
  INDENT: INDENT,
  UNDENT: UNDENT,
  HALF_DENT: HALF_DENT,
  EOI: EOI,
  C_BLOCK_COMMENT: C_BLOCK_COMMENT,
  SPACE_COMMENT: SPACE_COMMENT,
  TAIL_COMMENT: TAIL_COMMENT,
  SPACE: SPACE,
  HASH: HASH,
  RIGHT_DELIMITER: RIGHT_DELIMITER,
  KEYWORD: KEYWORD,
  CONJUNCTION: CONJUNCTION,
  CODE_BLOCK_COMMENT_LEAD_SYMBOL: CODE_BLOCK_COMMENT_LEAD_SYMBOL,
  PREFIX: PREFIX,
  SUFFIX: SUFFIX,
  BINARY: BINARY,
  VALUE: VALUE,
  LIST: LIST,
  COMMAND: COMMAND
};

fs = require('fs');

path = require('path');

stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/gi;

stackReg2 = /at\s+()(.*):(\d*):(\d*)/gi;

_trace = function(stackIndex, args) {
  var arg, file, line, method, pos, s, sp, stacklist;
  args = ((function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = args.length; _i < _len; _i++) {
      arg = args[_i];
      _results.push(arg.toString());
    }
    return _results;
  })()).join(', ');
  stacklist = (new Error()).stack.split('\n').slice(3);
  s = stacklist[stackIndex];
  sp = stackReg.exec(s) || stackReg2.exec(s);
  if (sp && sp.length === 5) {
    method = sp[1];
    file = path.basename(sp[2]);
    line = sp[3];
    pos = sp[4];
    return fs.appendFileSync("./debug.log", file + ': ' + method + ': ' + line + ':' + pos + ': ' + args + '\r\n');
  } else {
    return fs.appendFileSync("./debug.log", 'noname' + ': ' + ' ' + ': ' + 'xx' + ':' + 'yy' + ': ' + args + '\r\n');
  }
};

exports.log = log = function() {
  var args, level;
  level = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
  _trace(level, args);
  return console.log.apply(console, args);
};

exports.trace = trace = function() {
  var args;
  args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  return _trace(0, args);
};

exports.trace0 = trace0 = function() {
  var args;
  args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  return _trace(0, args);
};

exports.trace1 = trace1 = function() {
  var args;
  args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  return _trace(1, args);
};

exports.trace2 = trace2 = function() {
  var args;
  args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  return _trace(2, args);
};

exports.trace3 = trace3 = function() {
  var args;
  args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  return _trace(3, args);
};

exports.charset = charset = function(string) {
  var c, result, _i, _len;
  result = {};
  for (_i = 0, _len = string.length; _i < _len; _i++) {
    c = string[_i];
    result[c] = true;
  }
  return result;
};

exports.digits = digits = '0123456789';

exports.lowers = lowers = 'abcdefghijklmnopqrstuvwxyz';

exports.uppers = uppers = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

exports.letters = letters = lowers + uppers;

exports.letterDigits = letterDigits = letters + digits;

exports.letterDigitSet = charset(letterDigits);

exports.firstIdentifierChars = firstIdentifierChars = '$_' + letters;

exports.identifierChars = identifierChars = firstIdentifierChars + digits;

exports.taijiIdentifierChars = taijiIdentifierChars = '!?' + identifierChars;

exports.digitCharSet = digitCharSet = charset(exports.digits);

exports.letterCharSet = letterCharSet = charset(exports.letters);

exports.firstIdentifierCharSet = charset('$_' + letters);

exports.identifierCharSet = identifierCharSet = charset(identifierChars);

exports.taijiIdentifierCharSet = taijiIdentifierCharSet = charset(taijiIdentifierChars);

exports.taijiIdentifierCharSet = taijiIdentifierCharSet = charset(taijiIdentifierChars);

exports.firstSymbolChars = firstSymbolChars = '!#%^&*-+=?<>|~`';

exports.firstSymbolCharset = charset(firstSymbolChars);

isMetaOperation = isMetaOperation = function(head) {
  return (head[0] === '#' && head[1] !== '-') || head === 'include!' || head === 'import!' || head === 'export!';
};

exports.norm = norm = function(exp) {
  var e;
  assert(exp !== void 0, 'norm(exp) meet undefined');
  if (exp.kind) {
    return exp;
  }
  if (exp instanceof Array) {
    exp = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = exp.length; _i < _len; _i++) {
        e = exp[_i];
        _results.push(norm(e));
      }
      return _results;
    })();
    exp.kind = LIST;
    return exp;
  } else if (typeof exp === 'string') {
    if (exp[0] === '"') {
      return {
        value: exp,
        kind: VALUE,
        analyzed: true,
        transformed: true,
        optimized: true
      };
    } else {
      if (isMetaOperation(exp)) {
        return {
          value: exp,
          kind: SYMBOL,
          meta: true,
          analyzed: true,
          transformed: true
        };
      } else {
        return {
          value: exp,
          kind: SYMBOL,
          analyzed: true,
          transformed: true
        };
      }
    }
  } else if (typeof exp === 'object') {
    exp.kind = SYMBOL;
    return exp;
  } else {
    return {
      value: exp,
      kind: VALUE,
      analyzed: true,
      transformed: true,
      optimized: true
    };
  }
};

exports.QUOTE = {
  value: '~',
  kind: SYMBOL
};

exports.QUASIQUOTE = {
  value: '`',
  kind: SYMBOL
};

exports.UNQUOTE = {
  value: '^',
  kind: SYMBOL
};

exports.UNQUOTE_SPLICE = {
  value: '^&',
  kind: SYMBOL
};

exports.__TJ__QUOTE = {
  value: '__tj~',
  kind: SYMBOL
};

exports.__TJ__QUASIQUOTE = {
  value: '__tj`',
  kind: SYMBOL
};

exports.__TJ__UNQUOTE = {
  value: '__tj^',
  kind: SYMBOL
};

exports.__TJ__UNQUOTE_SPLICE = {
  value: '__tj^&',
  kind: SYMBOL
};

exports.str = str = function(item) {
  var x;
  if (isArray(item)) {
    return '[' + ((function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = item.length; _i < _len; _i++) {
        x = item[_i];
        _results.push(str(x));
      }
      return _results;
    })()).join(' ') + ']';
  } else if (typeof item === 'object') {
    if (item.symbol != null) {
      return item.symbol;
    } else {
      return str(item.value);
    }
  } else if (item === void 0) {
    return 'undefined';
  } else if (item === null) {
    return 'null';
  } else {
    return item.toString();
  }
};

exports.assert = assert = function(value, message) {
  if (!value) {
    trace2('assert:', message || 'assert failed');
    throw new Error(message || 'assert failed');
  }
};

exports.isArray = isArray = function(exp) {
  return Object.prototype.toString.call(exp) === '[object Array]';
};

exports.extend = extend = function() {
  var arg, args, key, object, value, _i, _len;
  object = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
  if (!object) {
    return object;
  }
  for (_i = 0, _len = args.length; _i < _len; _i++) {
    arg = args[_i];
    for (key in arg) {
      value = arg[key];
      object[key] = value;
    }
  }
  return object;
};

exports.error = error = function(message, symbol) {
  if (symbol) {
    throw message + ': ' + symbol;
  } else {
    throw message;
  }
};

exports.hasOwnProperty = Object.hasOwnProperty;

exports.debugging = false;

exports.testing = false;

exports.debug = function(message) {
  if (exports.debugging) {
    return console.log(message);
  }
};

exports.warn = function(message) {
  if (exports.debugging || exports.testing) {
    return console.log(message);
  }
};

exports.convertIdentifier = function(name) {
  var c, result, _i, _len, _ref;
  result = '';
  _ref = entity(name);
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    c = _ref[_i];
    if (c === '!' || c === '?' || c === '#') {
      result += '$';
    } else {
      result += c;
    }
  }
  return result;
};

exports.splitSpace = function(text) {
  var c, i, result, word;
  result = [];
  i = 0;
  word = '';
  while (1) {
    c = text[i++];
    if (c === ' ' || c === '\t' || c === '\n' || c === '\r') {
      if (word) {
        result.push(word);
        word = '';
      }
    } else if (!c) {
      if (word) {
        result.push(word);
        word = '';
      }
      if (!c) {
        break;
      }
    } else {
      word += c;
    }
  }
  return result;
};

exports.extend = function() {
  var arg, args, key, object, value, _i, _len;
  object = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
  if (!object) {
    return object;
  }
  for (_i = 0, _len = args.length; _i < _len; _i++) {
    arg = args[_i];
    for (key in arg) {
      value = arg[key];
      object[key] = value;
    }
  }
  return object;
};

exports.isArray = isArray = function(exp) {
  return Object.prototype.toString.call(exp) === '[object Array]';
};

exports.mergeSet = function() {
  var k, result, sets, x, _i, _j, _len, _len1;
  sets = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  result = {};
  for (_i = 0, _len = sets.length; _i < _len; _i++) {
    x = sets[_i];
    for (_j = 0, _len1 = x.length; _j < _len1; _j++) {
      k = x[_j];
      if (hasOwnProperty.call(x, k)) {
        result[k] = true;
      }
    }
  }
  return result;
};

exports.entity = entity = function(exp) {
  var e;
  if (exp instanceof Array) {
    if (exp.length === 0) {
      return exp;
    } else {
      return (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = exp.length; _i < _len; _i++) {
          e = exp[_i];
          _results.push(entity(e));
        }
        return _results;
      })();
    }
  }
  if (typeof exp === 'object') {
    return entity(exp.value);
  }
  return exp;
};

exports.kindSymbol = function(e) {
  return {
    value: e,
    kind: SYMBOL
  };
};

addBeginItem = function(result, exp) {
  var e, exp0Value, last, _i, _len, _ref;
  switch (exp.kind) {
    case VALUE:
    case SYMBOL:
      return exp;
    case LIST:
      exp0Value = exp[0].value;
      if (exp0Value === 'begin!') {
        _ref = exp.slice(1);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          e = _ref[_i];
          last = addBeginItem(result, e);
          if (!last) {
            return;
          }
        }
        return last;
      } else if (exp0Value === 'return' || exp0Value === 'throw' || exp0Value === 'break' || exp0Value === 'continue') {
        result.push(exp);
      } else {
        result.push(exp);
        return LIST;
      }
      break;
    default:
      trace('addBeginItem: wrong kind: ' + str(exp));
      throw 'addBeginItem: wrong kind: ' + str(exp);
  }
};

exports.begin = begin = function(exp) {
  var e, last, result, _i, _len;
  result = [];
  for (_i = 0, _len = exp.length; _i < _len; _i++) {
    e = exp[_i];
    last = addBeginItem(result, e);
    if (!last) {
      break;
    }
  }
  if (last && last !== LIST) {
    result.push(last);
  }
  if (result.length > 1) {
    result.unshift(norm('begin!'));
    return norm(result);
  } else if (result.length === 1) {
    return result[0];
  } else {
    return undefinedExp;
  }
};

returnFnMap = {
  'break': function(exp) {
    return exp;
  },
  'continue': function(exp) {
    return exp;
  },
  'throw': function(exp) {
    return exp;
  },
  'begin!': function(exp) {
    exp[exp.length - 1] = return_(exp[exp.length - 1]);
    return exp;
  },
  'if': function(exp) {
    exp[2] = return_(exp[2]);
    if (exp[3]) {
      exp[3] = return_(exp[3]);
    }
    return exp;
  },
  'switch': function(exp) {
    var case_, _i, _len, _ref;
    _ref = exp[2];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      case_ = _ref[_i];
      case_[1] = return_(case_);
    }
    exp[3] = return_(exp[3]);
    return exp;
  },
  'try': function(exp) {
    exp[1] = return_(exp[1]);
    exp[3] = return_(exp[3]);
    exp[4] = return_(exp[4]);
    return exp;
  },
  'letloop': function(exp) {
    exp[3] = return_(exp[3]);
    return exp;
  }
};

exports.return_ = return_ = function(exp) {
  var fn;
  if (!exp) {
    return exp;
  }
  if (!exp.push) {
    return [norm('return'), exp];
  }
  if (fn = returnFnMap[exp[0]]) {
    return fn(exp);
  }
  return [norm('return'), exp];
};

exports.pushExp = function(lst, v) {
  return norm(['call!', ['attribute!', lst, 'push'], [v]]);
};

exports.notExp = function(exp) {
  return norm(['prefix!', '!', exp]);
};

exports.undefinedExp = undefinedExp = norm('undefined');

exports.commentPlaceholder = {};

exports.isUndefinedExp = function() {
  return function(exp) {
    return exp === undefinedExp;
  };
};

truth = function(exp, env) {
  exp = entity(exp);
  if (exp == null) {
    return 2 - !!exp;
  }
  if (typeof exp === 'string') {
    if (exp[0] === '"') {
      return 2 - !!exp.slice(1, exp.length - 1);
    } else {
      return;
    }
  } else if (exp.push) {
    return;
  }
  return 2 - !!exp;
};

exports.addPrelude = function(parser, body) {
  var result;
  result = [];
  return body;
};

exports.realCode = function(code) {
  var endModuleText, realCodePos;
  endModuleText = '/// end of prelude;\n';
  if ((realCodePos = code.indexOf(endModuleText)) >= 0) {
    if (code[code.length - 1] === ';') {
      return code.slice(realCodePos + endModuleText.length, code.length - 1);
    } else {
      return code.slice(realCodePos + endModuleText.length);
    }
  } else {
    return code;
  }
};

exports.dict = function() {
  var d, i, pairs, pairsLength;
  pairs = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  d = {};
  i = 0;
  pairsLength = pairs.length;
  while (i < pairsLength) {
    d[pairs[i]] = pairs[i + 1];
    i += 2;
  }
  return d;
};

exports.list2dict = function() {
  var d, k, keys, _i, _len;
  keys = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  d = {};
  for (_i = 0, _len = keys.length; _i < _len; _i++) {
    k = keys[_i];
    d[k] = 1;
  }
  return d;
};

exports.extendSyntaxInfo = function(result, start, stop) {
  result.start = start;
  if (stop) {
    result.stop = stop;
  }
  return result;
};

exports.formatTaijiJson = formatTaijiJson = function(exp, level, start, newline, indent, lineLength) {
  var body, exp0, head, i, result, x, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
  if (newline) {
    head = repeat(repeat(' ', indent), level);
  } else {
    head = '';
  }
  body = JSON.stringify(exp);
  if (start + (x = head + body).length < lineLength) {
    return x;
  }
  result = head;
  if (Object.prototype.toString.call(exp) === '[object Array]') {
    exp0 = exp[0];
    result += '[' + formatTaijiJson(exp0, level, 0, false, indent, lineLength);
    if (exp0 === 'begin!' || exp0 === 'do') {
      _ref = exp.slice(1);
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        x = _ref[i];
        result += ',\n' + formatTaijiJson(x, level + 1, 0, true, indent, lineLength);
      }
    } else if (exp0 === 'if') {
      result += ', ' + formatTaijiJson(exp[1], level, result.length, false, indent, lineLength);
      result += ',\n' + formatTaijiJson(exp[2], level + 1, 0, true, indent, lineLength);
      if (exp[3]) {
        result += ',\n' + formatTaijiJson(exp[3], level + 1, 0, true, indent, lineLength);
      }
    } else if (exp0) {
      if (exp0[exp0.length - 1] === '=') {
        result += ', ' + formatTaijiJson(exp[1], level + 1, result.length, false, indent, lineLength);
        result += ',\n' + formatTaijiJson(exp[2], level + 1, 0, true, indent, lineLength);
      } else if (exp0.slice && ((x = exp0.slice(exp0.length - 2)) === '->' || x === '=>')) {
        result += ', ' + formatTaijiJson(exp[1], level, result.length, false, indent, lineLength);
        result += ',\n' + formatTaijiJson(exp[2], level + 1, 0, true, indent, lineLength);
      } else {
        _ref1 = exp.slice(1);
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          x = _ref1[_j];
          if (result.length > 40) {
            result += '\n' + formatTaijiJson(x, level + 1, 0, true, indent, lineLength);
          } else {
            result += ',' + formatTaijiJson(x, level, result.length, false, indent, lineLength);
          }
        }
      }
    } else {
      _ref2 = exp.slice(1);
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        x = _ref2[_k];
        if (result.length > 40) {
          result += '\n' + formatTaijiJson(x, level + 1, 0, true, indent, lineLength);
        } else {
          result += ',' + formatTaijiJson(x, level, result.length, false, indent, lineLength);
        }
      }
    }
    return result + ']';
  } else {
    return JSON.stringify(exp);
  }
};

exports.mergeList = function() {
  var l, list0, lists, _i, _len;
  lists = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  list0 = lists[0];
  for (_i = 0, _len = lists.length; _i < _len; _i++) {
    l = lists[_i];
    list0.push.apply(list0, l);
  }
  return list0;
};

exports.merge = function(options, overrides) {
  return extend(extend({}, options), overrides);
};

exports.flatten = flatten = function(array) {
  var element, flattened, _i, _len;
  flattened = [];
  for (_i = 0, _len = array.length; _i < _len; _i++) {
    element = array[_i];
    if (element instanceof Array) {
      flattened = flattened.concat(flatten(element));
    } else {
      flattened.push(element);
    }
  }
  return flattened;
};

exports.some = (_ref = Array.prototype.some) != null ? _ref : function(fn) {
  var e, _i, _len;
  for (_i = 0, _len = this.length; _i < _len; _i++) {
    e = this[_i];
    if (fn(e)) {
      return true;
    }
  }
  return false;
};

buildLocationData = function(first, last) {
  if (!last) {
    return first;
  } else {
    return {
      first_line: first.first_line,
      first_column: first.first_column,
      last_line: last.last_line,
      last_column: last.last_column
    };
  }
};

exports.locationDataToString = function(obj) {
  var locationData;
  if (("2" in obj) && ("first_line" in obj[2])) {
    locationData = obj[2];
  } else if ("first_line" in obj) {
    locationData = obj;
  }
  if (locationData("{locationData.first_line + 1}:{locationData.first_column + 1}-{locationData.last_line + 1}:{locationData.last_column + 1}")) {

  } else {
    return "No location data";
  }
};

exports.baseFileName = function(file, stripExt, useWinPathSep) {
  var parts, pathSep;
  if (stripExt == null) {
    stripExt = false;
  }
  if (useWinPathSep == null) {
    useWinPathSep = false;
  }
  pathSep = useWinPathSep ? /\\|\// : /\//;
  parts = file.split(pathSep);
  file = parts[parts.length - 1];
  if (!(stripExt && file.indexOf('.') >= 0)) {
    return file;
  }
  parts = file.split('.');
  parts.pop();
  if ((parts[parts.length - 1] === 'taiji' || parts[parts.length - 1] === 'tj') && parts.length > 1) {
    parts.pop();
  }
  return parts.join('.');
};

exports.isTaiji = function(file) {
  return /\.(taiji|tj|taiji.json|tj.json)$/.test(file);
};

exports.throwSyntaxError = function(message, location) {
  error = new SyntaxError(message);
  error.location = location;
  error.toString = syntaxErrorToString;
  error.stack = error.toString();
  throw error;
};

exports.updateSyntaxError = function(error, code, filename) {
  if (error.toString === syntaxErrorToString) {
    error.code || (error.code = code);
    error.filename || (error.filename = filename);
    error.stack = error.toString();
  }
  return error;
};

syntaxErrorToString = function() {
  var codeLine, colorize, colorsEnabled, end, filename, first_column, first_line, last_column, last_line, marker, start, _ref1, _ref2;
  if (!(this.code && this.location)) {
    return Error.prototype.toString.call(this);
  }
  _ref1 = this.location, first_line = _ref1.first_line, first_column = _ref1.first_column, last_line = _ref1.last_line, last_column = _ref1.last_column;
  if (last_line == null) {
    last_line = first_line;
  }
  if (last_column == null) {
    last_column = first_column;
  }
  filename = this.filename || '[stdin]';
  codeLine = this.code.split('\n')[first_line];
  start = first_column;
  end = first_line === last_line ? last_column + 1 : codeLine.length;
  marker = repeat(' ', start) + repeat('^', end - start);
  if (typeof process !== "undefined" && process !== null) {
    colorsEnabled = process.stdout.isTTY && !process.env.NODE_DISABLE_COLORS;
  }
  if ((_ref2 = this.colorful) != null ? _ref2 : colorsEnabled) {
    colorize = function(str) {
      return "\x1B[1;31m" + str + "\x1B[0m";
    };
    codeLine = codeLine.slice(0, start) + colorize(codeLine.slice(start, end)) + codeLine.slice(end);
    marker = colorize(marker);
  }
  return "" + filename + ":" + (first_line + 1) + ":" + (first_column + 1) + ": error: " + this.message + "\n" + codeLine + "\n" + marker;
};

exports.repeat = repeat = function(str, n) {
  var res;
  res = '';
  while (n > 0) {
    if (n & 1) {
      res += str;
    }
    n >>>= 1;
    str += str;
  }
  return res;
};

javascriptKeywordText = "break export return case for switch comment function this continue if typeof default import" + " var delete in void do label while else new with catch enum throw class super extends try const finally debugger";

exports.javascriptKeywordSet = javascriptKeywordSet = {};

(function() {
  var w, _i, _len, _ref1, _results;
  _ref1 = javascriptKeywordText.split(' ');
  _results = [];
  for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
    w = _ref1[_i];
    _results.push(javascriptKeywordSet[w] = 1);
  }
  return _results;
})();
