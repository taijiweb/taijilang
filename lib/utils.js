var ATTR, BEGIN, BINARY, BRACKET_PAIR, BREAK, CALL, CONTINUE, CURVE_PAIR, FORIN, FOROF, IF, INDEX, NEW, PAREN_PAIR, PREFIX, RETURN, SHARP, SUFFIX, SYMBOL, THROW, TRY, UNDEFINED, WHILE, addBeginItem, assert, begin, charset, commaList, digitCharSet, digits, error, firstIdentifierChars, firstSymbolChars, formatTaijiJson, fs, identifierCharSet, identifierChars, isArray, isMetaOperation, isObject, isSymbol, javascriptKeywordSet, javascriptKeywordText, letterCharSet, letterDigits, letters, log, log0, log1, log2, log3, lowers, path, returnFnMap, return_, stackReg, stackReg2, str, symbol, symbolOf, taijiIdentifierCharSet, taijiIdentifierChars, trace, trace0, trace1, trace2, trace3, truth, undefinedExp, uppers, _log, _ref, _trace,
  __slice = [].slice;

_ref = require('./constant'), SYMBOL = _ref.SYMBOL, symbol = _ref.symbol, UNDEFINED = _ref.UNDEFINED, BEGIN = _ref.BEGIN, IF = _ref.IF, PREFIX = _ref.PREFIX, SUFFIX = _ref.SUFFIX, BINARY = _ref.BINARY, WHILE = _ref.WHILE, BREAK = _ref.BREAK, CONTINUE = _ref.CONTINUE, THROW = _ref.THROW, RETURN = _ref.RETURN, NEW = _ref.NEW, FORIN = _ref.FORIN, FOROF = _ref.FOROF, TRY = _ref.TRY, SHARP = _ref.SHARP, CURVE_PAIR = _ref.CURVE_PAIR, PAREN_PAIR = _ref.PAREN_PAIR, BRACKET_PAIR = _ref.BRACKET_PAIR, CALL = _ref.CALL, ATTR = _ref.ATTR, INDEX = _ref.INDEX;

fs = require('fs');

path = require('path');

stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/gi;

stackReg2 = /at\s+()(.*):(\d*):(\d*)/gi;

_trace = function(stackIndex, args) {
  var arg, argsStr, file, line, method, pos, s, sp, stacklist, _i, _len;
  argsStr = '';
  for (_i = 0, _len = args.length; _i < _len; _i++) {
    arg = args[_i];
    if (argsStr === '' || argsStr.slice(argsStr.length - 2) === ': ' || argsStr[argsStr.length - 1] === ':') {
      argsStr += str(arg);
    } else {
      argsStr += ', ' + str(arg);
    }
  }
  stacklist = (new Error()).stack.split('\n').slice(3);
  s = stacklist[stackIndex];
  sp = stackReg.exec(s) || stackReg2.exec(s);
  if (sp && sp.length === 5) {
    method = sp[1];
    file = path.basename(sp[2]);
    line = sp[3];
    pos = sp[4];
    return fs.appendFileSync("./debug.log", file + ': ' + method + ': ' + line + ':' + pos + ': ' + argsStr + '\r\n');
  } else {
    return fs.appendFileSync("./debug.log", 'noname:  noname: xx: yy: ' + argsStr + '\r\n');
  }
};

exports._log = _log = function() {
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

exports.log = log = function() {
  var args;
  args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  return _log(0, args);
};

exports.log0 = log0 = function() {
  var args;
  args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  return _trace(0, args);
};

exports.log1 = log1 = function() {
  var args;
  args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  return _trace(1, args);
};

exports.log2 = log2 = function() {
  var args;
  args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  return _trace(2, args);
};

exports.log3 = log3 = function() {
  var args;
  args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  return _trace(3, args);
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

exports.isObject = isObject = function(exp) {
  return exp instanceof Object;
};

exports.isSymbol = isSymbol = function(exp) {
  return typeof exp === "string" || (exp && exp.kind === SYMBOL);
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

isArray = function(item) {
  return item instanceof Array;
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

exports.symbolOf = symbolOf = function(exp) {
  if (isObject(exp)) {
    return exp.value;
  } else {
    return exp;
  }
};

exports.valueOf = function(exp) {
  if (exp instanceof String) {
    return exp;
  } else if (isObject(exp)) {
    return exp.value;
  } else {
    return exp;
  }
};

exports.headSymbol = function(exp) {
  assert(isArray(exp), 'expect head symbol of list');
  if (isObject(exp[0])) {
    return exp[0].value;
  } else {
    return exp[0];
  }
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

exports.convertIdentifier = function(name) {
  var c, result, _i, _len, _ref1;
  result = '';
  _ref1 = entity(name);
  for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
    c = _ref1[_i];
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

exports.isEllipsis = function(exp) {
  return symbolOf(exp[0]) === 'suffix!' && symbolOf(exp[1]) === '...';
};

exports.commaList = commaList = function(exp) {
  var exp2, result;
  exp2 = exp[2];
  if (isArray(exp2) && symbolOf(exp2[0]) === 'binary!' && symbolOf(exp[1]) === ',') {
    result = commaList(exp2);
    result.push(exp[3]);
    return result;
  } else {
    return [exp2, exp[3]];
  }
};

addBeginItem = function(result, exp) {
  var e, exp0, last, _i, _len, _ref1;
  if (!(exp instanceof Array)) {
    return exp;
  }
  exp0 = exp[0];
  if (exp0 === 'begin!') {
    _ref1 = exp.slice(1);
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      e = _ref1[_i];
      last = addBeginItem(result, e);
      if (!last) {
        return;
      }
    }
    return last;
  } else if (exp0 === RETURN || exp0 === THROW || exp0 === BREAK || exp0 === CONTINUE) {
    result.push(exp);
  } else {
    result.push(exp);
    return true;
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
  if (last && last !== true) {
    result.push(last);
  }
  if (result.length > 1) {
    result.unshift('begin!');
    return result;
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
    var case_, _i, _len, _ref1;
    _ref1 = exp[2];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      case_ = _ref1[_i];
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
    return [RETURN, exp];
  }
  if (fn = returnFnMap[exp[0]]) {
    return fn(exp);
  }
  return [RETURN, exp];
};

exports.pushExp = function(lst, v) {
  return [CALL, ['attribute!', lst, PUSH], [v]];
};

exports.notExp = function(exp) {
  return [PREFIX, '!', exp];
};

exports.undefinedExp = undefinedExp = function() {
  return {
    value: 'undefined',
    kind: SYMBOL
  };
};

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

exports.formatTaijiJson = formatTaijiJson = function(exp, level, start, newline, indent, lineLength) {
  var body, exp0, head, i, result, x, _i, _j, _k, _len, _len1, _len2, _ref1, _ref2, _ref3;
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
      _ref1 = exp.slice(1);
      for (i = _i = 0, _len = _ref1.length; _i < _len; i = ++_i) {
        x = _ref1[i];
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
        _ref2 = exp.slice(1);
        for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
          x = _ref2[_j];
          if (result.length > 40) {
            result += '\n' + formatTaijiJson(x, level + 1, 0, true, indent, lineLength);
          } else {
            result += ',' + formatTaijiJson(x, level, result.length, false, indent, lineLength);
          }
        }
      }
    } else {
      _ref3 = exp.slice(1);
      for (_k = 0, _len2 = _ref3.length; _k < _len2; _k++) {
        x = _ref3[_k];
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

exports.madeConcat = function(head, tail) {
  var result;
  if (tail.concated) {
    result = ['call!', ['attribute!', ['list', head], 'concat'], [tail]];
  } else {
    tail.shift();
    result = [head].concat(tail);
  }
  result.convertToList = true;
  return result;
};

exports.madeCall = function(head, tail, env) {
  var head0, head1, obj, result;
  if (tail.concated) {
    if (head instanceof Array && ((head0 = head[0].value) === 'attribute!' || head0 === 'index!')) {
      head1 = head[1];
      if (head1.kind === SYMBOL) {
        return ['call!', ['attribute!', head, 'apply'], [head, tail]];
      } else {
        result = ['begin!', ['var', obj = env.ssaVar('obj')], ['=', obj, head1]];
        result.push(['call!', ['attribute!', [head0, obj, head[1]], 'apply'], [obj, tail]]);
        return result;
      }
    } else {
      return ['call!', ['attribute!', head, 'apply'], ['null', tail]];
    }
  } else {
    tail.shift();
    return ['call!', head, tail];
  }
};

exports.getStackTrace = function() {
  var obj;
  obj = {};
  Error.captureStackTrace(obj, getStackTrace);
  return obj.stack;
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
