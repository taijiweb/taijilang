var BLOCK_COMMENT, BRACKET, CODE_BLOCK_COMMENT, COMMAND, CONCAT_LINE, CURVE, DATA_BRACKET, FUNCTION, HALF_DENT, HEAD_SPACES, IDENTIFIER, INDENT, INDENT_EXPRESSION, INLINE_COMMENT, INTERPOLATE_STRING, LINE_COMMENT, LIST, MODULE, MODULE_HEADER, NEWLINE, NON_INTERPOLATE_STRING, NUMBER, PAREN, PUNCT, REGEXP, SPACES, SPACES_INLINE_COMMENT, STRING, SYMBOL, UNDENT, VALUE, begin, compileError, error, extend, isExpression, norm, optimize, optimizeFnMap, optimizeList, setValue, str, tocode, trace, undefinedExp, _ref, _ref1;

_ref = require('../utils'), str = _ref.str, extend = _ref.extend, error = _ref.error, begin = _ref.begin, undefinedExp = _ref.undefinedExp, norm = _ref.norm, trace = _ref.trace;

compileError = require('./helper').compileError;

_ref1 = '../constant', NUMBER = _ref1.NUMBER, STRING = _ref1.STRING, IDENTIFIER = _ref1.IDENTIFIER, SYMBOL = _ref1.SYMBOL, REGEXP = _ref1.REGEXP, HEAD_SPACES = _ref1.HEAD_SPACES, CONCAT_LINE = _ref1.CONCAT_LINE, PUNCT = _ref1.PUNCT, FUNCTION = _ref1.FUNCTION, BRACKET = _ref1.BRACKET, PAREN = _ref1.PAREN, DATA_BRACKET = _ref1.DATA_BRACKET, CURVE = _ref1.CURVE, INDENT_EXPRESSION = _ref1.INDENT_EXPRESSION, NEWLINE = _ref1.NEWLINE, SPACES = _ref1.SPACES, INLINE_COMMENT = _ref1.INLINE_COMMENT, SPACES_INLINE_COMMENT = _ref1.SPACES_INLINE_COMMENT, LINE_COMMENT = _ref1.LINE_COMMENT, BLOCK_COMMENT = _ref1.BLOCK_COMMENT, CODE_BLOCK_COMMENT = _ref1.CODE_BLOCK_COMMENT, CONCAT_LINE = _ref1.CONCAT_LINE, MODULE_HEADER = _ref1.MODULE_HEADER, MODULE = _ref1.MODULE, NON_INTERPOLATE_STRING = _ref1.NON_INTERPOLATE_STRING, INTERPOLATE_STRING = _ref1.INTERPOLATE_STRING, INDENT = _ref1.INDENT, UNDENT = _ref1.UNDENT, HALF_DENT = _ref1.HALF_DENT, VALUE = _ref1.VALUE, SYMBOL = _ref1.SYMBOL, LIST = _ref1.LIST, COMMAND = _ref1.COMMAND;

isExpression = require('./transform').isExpression;

tocode = require('./textize').tocode;

setValue = function(x) {
  if (x === void 0) {
    return undefinedExp;
  } else if (typeof x === 'string') {
    return '"' + x + '"';
  } else {
    return x;
  }
};

optimizeFnMap = {
  '=': function(exp, env) {
    var left;
    left = exp[1];
    if (left.kind === SYMBOL) {
      if (left["const"] && exp[2].kind === VALUE) {
        env.scope[left.value] = exp[2];
        return undefinedExp;
      }
      if (left.refCount === void 0) {
        return undefinedExp;
      }
    } else {
      left = optimize(left, env);
    }
    return norm([norm('='), left, optimize(exp[2], env)]);
  },
  'prefix!': function(exp, env) {
    var code, exp2, result;
    exp2 = optimize(exp[2], env);
    result = [exp[0], exp[1], exp2];
    if (exp2.kind === VALUE) {
      code = tocode(result);
      return setValue(eval(code));
    } else {
      return result;
    }
  },
  'binary!': function(exp, env) {
    var code, result, x, y;
    x = optimize(exp[2]);
    y = optimize(exp[3]);
    result = ['binary!', exp[1], x, y];
    if (x.kind === VALUE && y.kind === VALUE) {
      code = tocode(result);
      return setValue(eval(code));
    } else {
      return result;
    }
  },
  'index!': function(exp, env) {
    return exp;
  },
  'call!': function(exp, env) {
    var caller;
    caller = exp[1];
    if (caller.kind === LIST && caller[0].value === 'attribute!' && caller[1].refCount === 0) {
      exp.removed = true;
    }
    exp[1] = optimize(exp[1], env);
    exp[2] = optimizeList(exp[2], env);
    return exp;
  },
  'list!': function(exp, env) {
    return exp[1] = [norm('list!')].concat(optimizeList(exp.slice(1), env));
  },
  'comma!': function(exp, env) {
    return [norm('comma!')].concat(optimizeList(exp.slice(1), env));
  },
  'begin!': function(exp, env) {
    var e;
    exp = (function() {
      var _i, _len, _ref2, _results;
      _ref2 = exp.slice(1);
      _results = [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        e = _ref2[_i];
        _results.push(optimize(e, env));
      }
      return _results;
    })();
    return begin(exp);
  },
  'if': function(exp, env) {
    var else_, test, then_, x;
    if (x = truth(test = optimize(exp[1]))) {
      return optimize(exp[x + 1]);
    } else {
      then_ = optimize(exp[2]);
      else_ = optimize(exp[3]);
      if (isExpression(else_)) {
        if (exp.isAnd) {
          return norm(['binary!', '&&', then_[2], else_]);
        } else if (exp.isOr) {
          return norm(['binary!', '||', then_[2], else_]);
        } else if (isExpression(then_) && exp.isTernay) {
          return norm(['?:', test, then_, else_]);
        }
      }
      return norm(['if', test, then_, else_]);
    }
  },
  'while': function(exp, env) {
    var body, test;
    test = optimize(exp[1], env);
    body = optimize(exp[2], env);
    if (truth(test) !== 2) {
      return norm(['while', test, body]);
    }
  },
  'doWhile!': function(exp, env) {
    var body, test;
    test = optimize(exp[2], env);
    body = optimize(exp[1], env);
    if (truth(test) === 2) {
      return body;
    } else {
      return norm(['doWhile!', body, test]);
    }
  },
  'forIn!': function(exp, env) {
    return exp;
  },
  'forOf!': function(exp, env) {
    return exp;
  },
  'function': function(exp, env) {
    env = exp.env;
    exp = norm(['function', exp[1], optimize(exp[2], env)]);
    exp.env = env;
    return exp;
  }
};

optimizeList = function(exp, env) {
  var e, _i, _len, _results;
  _results = [];
  for (_i = 0, _len = exp.length; _i < _len; _i++) {
    e = exp[_i];
    _results.push(optimize(e, env));
  }
  return _results;
};

exports.optimize = optimize = function(exp, env) {
  var e, exp0, fn, i, result, _i, _len;
  switch (exp.kind) {
    case VALUE:
      return exp;
    case SYMBOL:
      if (exp.refCount === 1 && !exp.valueChanged) {
        return exp.assignExp[2];
      } else if (exp.firstRef) {
        return exp.assignExp;
      } else {
        return exp;
      }
      break;
    case LIST:
      trace('optimize: ', str(exp));
      if (((exp0 = exp[0]).kind === SYMBOL) && (fn = optimizeFnMap[exp0.value])) {
        result = fn(exp, env);
        if (result === exp) {
          return result;
        }
        if (result && result.push) {
          result.optimized = true;
        }
        result.start = exp.start;
        result.stop = exp.stop;
        result.env = env;
        return result;
      } else {
        for (i = _i = 0, _len = exp.length; _i < _len; i = ++_i) {
          e = exp[i];
          exp[i] = optimize(e, env);
        }
        exp.optimized = true;
        return exp;
      }
      break;
    default:
      trace('optimize: ', 'wrong kind: ', str(exp));
      return compileError(exp, 'optimize: wrong kind: ' + exp.kind);
  }
};
