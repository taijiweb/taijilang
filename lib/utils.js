
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
var addBeginItem, begin, buildLocationData, entity, error, extend, flatten, formatTaijiJson, isArray, isValue, javascriptKeywordSet, javascriptKeywordText, repeat, returnFnMap, return_, str, syntaxErrorToString, undefinedExp, _ref,
  __slice = [].slice;

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
  } else if (item == null) {
    return 'undefined';
  } else if (item.value != null) {
    return item.value.toString();
  } else {
    return item.toString();
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
  } else if (item == null) {
    return 'undefined';
  } else if (item.symbol != null) {
    return item.symbol;
  } else if (item.value != null) {
    return str(item.value);
  } else {
    return item.toString();
  }
};

exports.charset = function(string) {
  var c, result, _i, _len;
  result = {};
  for (_i = 0, _len = string.length; _i < _len; _i++) {
    c = string[_i];
    result[c] = true;
  }
  return result;
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

exports.entity = entity = function(exp) {
  var e;
  if (!exp) {
    return exp;
  }
  if (exp.push) {
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
    return exp.symbol || entity(exp.value);
  } else if (typeof exp === 'string') {
    return exp;
  } else {
    return exp;
  }
};

exports.isValue = isValue = function(exp, env) {
  if (!exp) {
    return true;
  }
  if (exp.push) {
    return false;
  }
  exp = entity(exp);
  if (typeof exp === 'string') {
    if (exp[0] === '"') {
      return true;
    } else {
      return false;
    }
  }
  return true;
};

addBeginItem = function(result, e) {
  var x, _i, _len, _ref, _results;
  if (e && e.push && e[0] === 'begin!') {
    _ref = e.slice(1);
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      x = _ref[_i];
      _results.push(addBeginItem(result, x));
    }
    return _results;
  } else {
    return result.push(e);
  }
};

exports.begin = begin = function(exp) {
  var e, e0, i, length, result, x, _i, _len;
  result = [];
  for (_i = 0, _len = exp.length; _i < _len; _i++) {
    e = exp[_i];
    addBeginItem(result, e);
  }
  length = result.length;
  i = length - 1;
  while (--i >= 0) {
    e = result[i];
    if (!e || isValue(e) || !(x = entity(e)) || typeof x === 'string' || e === undefinedExp) {
      result.splice(i, 1);
    } else if ((e0 = e[0]) && (e0 === 'return' || e0 === 'throw' || e0 === 'break' || e0 === 'continue')) {
      result.splice(i + 1, result.length);
    }
  }
  if (result.length === 0) {
    return void 0;
  } else if (result.length === 1) {
    return result[0];
  } else {
    result.unshift('begin!');
    return result;
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
    return ['return', exp];
  }
  if (fn = returnFnMap[exp[0]]) {
    return fn(exp);
  }
  return ['return', exp];
};

exports.pushExp = function(lst, v) {
  return ['call!', ['attribute!', lst, 'push'], [v]];
};

exports.notExp = function(exp) {
  return ['prefix!', '!', exp];
};

exports.undefinedExp = undefinedExp = ['prefix!', 'void', 0];

exports.addPrelude = function(parser, body) {
  return body;
};

exports.wrapInfo1 = function(exp, info) {
  if (typeof exp !== 'object') {
    exp = {
      value: exp
    };
  }
  exp.start = info.start;
  exp.line1 = info.line1;
  exp.stop = info.stop;
  exp.line = info.line;
  return exp;
};

exports.wrapInfo2 = function(exp, first, last) {
  if (typeof exp !== 'object') {
    exp = {
      value: exp
    };
  }
  exp.start = first.start;
  exp.line1 = first.line1;
  exp.stop = last.stop;
  exp.line = last.line;
  return exp;
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
  if (locationData) {
    return ("" + (locationData.first_line + 1) + ":" + (locationData.first_column + 1) + "-") + ("" + (locationData.last_line + 1) + ":" + (locationData.last_column + 1));
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

javascriptKeywordText = "break export return case for switch comment function this continue if typeof default import" + " var delete in void do label while else new with catch enum throw class extends try const finally debugger super";

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
