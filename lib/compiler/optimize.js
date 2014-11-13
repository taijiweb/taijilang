var BLOCK_COMMENT, BRACKET, CODE_BLOCK_COMMENT, CONCAT_LINE, CURVE, DATA_BRACKET, FUNCTION, HALF_DENT, HEAD_SPACES, IDENTIFIER, INDENT, INDENT_EXPRESSION, INLINE_COMMENT, INTERPOLATE_STRING, LINE_COMMENT, MODULE, MODULE_HEADER, NEWLINE, NON_INTERPOLATE_STRING, NUMBER, PAREN, PUNCT, REGEXP, SPACES, SPACES_INLINE_COMMENT, STRING, SYMBOL, UNDENT, begin, constant, containVar, containVars, entity, error, extend, getValue, isArray, isExpression, isValue, norm, optimize, optimizeFnMap, optimizeLetLoopFnBody, optimizeList, optimizeMutualLetLoopBody, replaceCallFn, replaceCallParam, replaceMutualCallFn, replaceMutualCallParam, rewriteLetloopBody, setValue, str, toExpression, tocode, undefinedExp, wrapInfo1, _ref, _ref1;

_ref = require('../utils'), str = _ref.str, entity = _ref.entity, wrapInfo1 = _ref.wrapInfo1, isValue = _ref.isValue, isArray = _ref.isArray, extend = _ref.extend, error = _ref.error, begin = _ref.begin, undefinedExp = _ref.undefinedExp, constant = _ref.constant, norm = _ref.norm;

NUMBER = constant.NUMBER, STRING = constant.STRING, IDENTIFIER = constant.IDENTIFIER, SYMBOL = constant.SYMBOL, REGEXP = constant.REGEXP, HEAD_SPACES = constant.HEAD_SPACES, CONCAT_LINE = constant.CONCAT_LINE, PUNCT = constant.PUNCT, FUNCTION = constant.FUNCTION, BRACKET = constant.BRACKET, PAREN = constant.PAREN, DATA_BRACKET = constant.DATA_BRACKET, CURVE = constant.CURVE, INDENT_EXPRESSION = constant.INDENT_EXPRESSION, NEWLINE = constant.NEWLINE, SPACES = constant.SPACES, INLINE_COMMENT = constant.INLINE_COMMENT, SPACES_INLINE_COMMENT = constant.SPACES_INLINE_COMMENT, LINE_COMMENT = constant.LINE_COMMENT, BLOCK_COMMENT = constant.BLOCK_COMMENT, CODE_BLOCK_COMMENT = constant.CODE_BLOCK_COMMENT, CONCAT_LINE = constant.CONCAT_LINE, MODULE_HEADER = constant.MODULE_HEADER, MODULE = constant.MODULE, NON_INTERPOLATE_STRING = constant.NON_INTERPOLATE_STRING, INTERPOLATE_STRING = constant.INTERPOLATE_STRING, INDENT = constant.INDENT, UNDENT = constant.UNDENT, HALF_DENT = constant.HALF_DENT;

_ref1 = require('./transform'), isExpression = _ref1.isExpression, toExpression = _ref1.toExpression;

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

getValue = function(x) {
  return entity(x);
};

replaceCallFn = function(exp, fnName) {
  var e, _i, _len, _results;
  if (!isArray(exp)) {
    return exp;
  }
  if (exp[0] !== 'call!' || entity(exp[1]) !== fnName) {
    _results = [];
    for (_i = 0, _len = exp.length; _i < _len; _i++) {
      e = exp[_i];
      _results.push(replaceCallFn(e, fnName));
    }
    return _results;
  } else {
    return fnName;
  }
};

replaceMutualCallFn = function(exp, fnName, fnNames) {
  var e, _i, _len, _results;
  if (!isArray(exp)) {
    return exp;
  }
  if (exp[0] !== 'call!' || !fnNames[entity(exp[1])]) {
    _results = [];
    for (_i = 0, _len = exp.length; _i < _len; _i++) {
      e = exp[_i];
      _results.push(replaceMutualCallFn(e, fnName, fnNames));
    }
    return _results;
  } else {
    return fnName;
  }
};

replaceCallParam = function(exp, fnName) {
  var e, x, _i, _len;
  if (!isArray(exp)) {
    return;
  }
  if (exp[0] !== 'call!' || entity(exp[1]) !== fnName) {
    for (_i = 0, _len = exp.length; _i < _len; _i++) {
      e = exp[_i];
      if (x = replaceCallParam(e, fnName)) {
        return x;
      }
    }
  } else {
    return exp[2];
  }
};

replaceMutualCallParam = function(exp, fnName, fnNames) {
  var e, x, _i, _len;
  if (!isArray(exp)) {
    return;
  }
  if (exp[0] !== 'call!' || !fnNames[entity(exp[1])]) {
    for (_i = 0, _len = exp.length; _i < _len; _i++) {
      e = exp[_i];
      if (x = replaceMutualCallParam(e, fnName, fnNames)) {
        return x;
      }
    }
  } else {
    return exp[2];
  }
};

containVar = function(exp, variable) {
  var e, _i, _len;
  exp = entity(exp);
  if (exp === variable) {
    return true;
  }
  if (isArray(exp)) {
    for (_i = 0, _len = exp.length; _i < _len; _i++) {
      e = exp[_i];
      if (containVar(e, variable)) {
        return true;
      }
    }
  }
};

containVars = function(exp, variables) {
  var e, x, _i, _len;
  exp = entity(exp);
  if (variables[exp]) {
    return exp;
  }
  if (isArray(exp)) {
    for (_i = 0, _len = exp.length; _i < _len; _i++) {
      e = exp[_i];
      if (x = containVars(e, variables)) {
        return x;
      }
    }
  }
};

optimizeLetLoopFnBody = function(exp, fnName, replacedName, params, loopInit) {
  var arg, exps, i, right, x, _i, _j, _len, _len1, _ref2, _results;
  if (!isArray(exp)) {
    return exp;
  }
  if (exp[0] === 'return') {
    if (containVar(exp[1], fnName)) {
      exps = [];
      _ref2 = replaceCallParam(exp[1], fnName);
      for (i = _i = 0, _len = _ref2.length; _i < _len; i = ++_i) {
        arg = _ref2[i];
        if (entity(arg) !== entity(params[i])) {
          exps.unshift(['=', params[i], arg]);
        }
      }
      if ((right = replaceCallFn(exp[1], fnName)) !== fnName) {
        exps.unshift(['=', fnName, right]);
      }
      return begin(exps);
    } else {
      if (containVar(params, entity(exp[1]))) {
        return ['return', exp[1]];
      } else {
        loopInit.push(['=', fnName, exp[1]]);
        return ['return', fnName];
      }
    }
  } else {
    _results = [];
    for (_j = 0, _len1 = exp.length; _j < _len1; _j++) {
      x = exp[_j];
      _results.push(optimizeLetLoopFnBody(x, fnName, fnName, params, loopInit));
    }
    return _results;
  }
};

optimizeMutualLetLoopBody = function(exp, fnName, replacedName, params, loopInit, fnNames) {
  var arg, exps, i, right, x, _i, _j, _len, _len1, _ref2, _results;
  if (!isArray(exp)) {
    return exp;
  }
  if (exp[0] === 'return') {
    if (x = containVars(exp[1], fnNames)) {
      exps = [];
      _ref2 = replaceMutualCallParam(exp[1], fnName, fnNames);
      for (i = _i = 0, _len = _ref2.length; _i < _len; i = ++_i) {
        arg = _ref2[i];
        exps.unshift(['=', params[i], arg]);
      }
      if ((right = replaceMutualCallFn(exp[1], replacedName, fnNames)) !== replacedName) {
        exps.unshift(['=', replacedName, right]);
      } else {
        loopInit.removed = true;
      }
      exps.push(['=', fnName, x]);
      return begin(exps);
    } else {
      if (containVars(params, fnNames)) {
        return ['return', exp[1]];
      } else {
        loopInit.push(['=', replacedName, exp[1]]);
        return ['letloop-return', replacedName, exp[1]];
      }
    }
  } else {
    _results = [];
    for (_j = 0, _len1 = exp.length; _j < _len1; _j++) {
      x = exp[_j];
      _results.push(optimizeMutualLetLoopBody(x, fnName, replacedName, params, loopInit, fnNames));
    }
    return _results;
  }
};

rewriteLetloopBody = function(exp, initRemoved) {
  var i;
  if (Object.prototype.toString.call(exp) === '[object Array]') {
    if (exp[0] === 'if') {
      rewriteLetloopBody(exp[2], initRemoved);
      return rewriteLetloopBody(exp[3], initRemoved);
    } else if (exp[0] === 'begin!') {
      i = 1;
      while (i++ < exp.length - 1) {
        rewriteLetloopBody(exp[i], initRemoved);
      }
    } else if (exp[0] === 'letloop-return') {
      exp[0] = 'return';
      if (initRemoved) {
        return exp[1] = exp[2];
      }
    }
  }
};

optimizeFnMap = {
  '=': function(exp, env) {
    var left;
    left = entity(exp[1]);
    if (typeof eLeft === 'string') {
      if (left["const"] && isAtomicValue(exp[2])) {
        env.scope[eLeft] = exp[2];
        return '';
      }
      if (left.refCount === void 0) {
        return '';
      }
    } else {
      left = optimize(left, env);
    }
    return ['=', left, optimize(exp[2], env)];
  },
  'prefix!': function(exp, env) {
    var code, exp2, result;
    exp2 = optimize(exp[2]);
    result = ['prefix!', exp[1], exp2];
    if (isValue(exp2)) {
      code = tocode(result);
      return setValue(eval(code));
    } else {
      return result;
    }
  },
  'suffix!': function(exp, env) {
    var code, exp2, result;
    exp2 = optimize(exp[2]);
    result = ['suffix!', exp[1], exp2];
    if (isValue(exp2)) {
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
    if (isValue(x) && isValue(y)) {
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
    if (caller[0] === 'attribute!' && caller[1].refCount === 0) {
      exp.removed = true;
    }
    exp[1] = optimize(exp[1], env);
    exp[2] = optimizeList(exp[2], env);
    return exp;
  },
  'list!': function(exp, env) {
    return exp[1] = ['list!'].concat(optimizeList(exp.slice(1), env));
  },
  'comma!': function(exp, env) {
    return ['comma!'].concat(optimizeList(exp.slice(1), env));
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
          return ['binary!', '&&', then_[2], else_];
        } else if (exp.isOr) {
          return ['binary!', '||', then_[2], else_];
        } else if (isExpression(then_) && exp.isTernay) {
          return ['?:', test, then_, else_];
        }
      }
      return ['if', test, then_, else_];
    }
  },
  'while': function(exp, env) {
    var body, test;
    test = optimize(exp[1], env);
    body = optimize(exp[2], env);
    if (truth(test) !== 2) {
      return ['while', test, body];
    }
  },
  'doWhile!': function(exp, env) {
    var body, test;
    test = optimize(exp[2], env);
    body = optimize(exp[1], env);
    if (truth(test) === 2) {
      return body;
    } else {
      return ['doWhile!', body, test];
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
    exp = ['function', exp[1], optimize(exp[2], env)];
    exp.env = env;
    return exp;
  },
  'letloop!': function(exp, env) {
    var bindings, body, expEnv, fn, fnBody, fnName, fnNames, i, ifExp, init, initExp, initRemoved, loopFn, params, result, then_, v, v1, whileBody, whileExp, _i, _j, _len, _len1, _ref2, _ref3, _ref4, _ref5;
    params = exp[1];
    bindings = exp[2];
    body = exp[3];
    expEnv = exp.env;
    result = [];
    fnBody = [];
    if (bindings.length === 1) {
      _ref2 = bindings[0], v = _ref2[0], fn = _ref2[1];
      fnBody.push(['var', v]);
      v1 = entity(v);
      whileBody = optimizeLetLoopFnBody(fn, v1, v1, params, fnBody);
      fnBody.push(['while', 1, whileBody]);
      result.push(['var', v]);
      result.push(['=', v, ['function', params, begin(fnBody)]]);
    } else {
      loopFn = expEnv.newVar('loopFn');
      fnName = expEnv.newVar('fn');
      fnNames = {};
      for (_i = 0, _len = bindings.length; _i < _len; _i++) {
        _ref3 = bindings[_i], v = _ref3[0], fn = _ref3[1];
        fnNames[entity(v)] = 1;
      }
      for (_j = 0, _len1 = bindings.length; _j < _len1; _j++) {
        _ref4 = bindings[_j], v = _ref4[0], fn = _ref4[1];
        result.push(['var', v]);
        result.push(['=', v, ['function', params, ['return', ['call!', loopFn, params.concat(v)]]]]);
      }
      fnBody.push(['var', loopFn]);
      ifExp = void 0;
      i = bindings.length;
      while (--i >= 0) {
        _ref5 = bindings[i], v = _ref5[0], fn = _ref5[1];
        init = [];
        then_ = optimizeMutualLetLoopBody(fn, fnName, loopFn, params, init, fnNames);
        if (init.removed) {
          initRemoved = true;
        }
        ifExp = ['if', ['binary!', '===', fnName, v], then_, ifExp];
        initExp = ['if', ['binary!', '===', fnName, v], begin(init), initExp];
      }
      whileExp = ['while', 1];
      rewriteLetloopBody(ifExp, initRemoved);
      whileExp.push(ifExp);
      if (initRemoved || containVars(params, fnNames)) {
        fnBody.push(whileExp);
      } else {
        fnBody.push(begin([initExp, whileExp]));
      }
      result.push(['var', loopFn]);
      result.push(['=', loopFn, ['function', params.concat(fnName), begin(fnBody)]]);
    }
    result.push(body);
    return begin(result);
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
  var e, fn, i, result, _i, _len;
  switch (exp) {
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
      if ((exp0.kind === SYMBOL) && (fn = optimizeFnMap[exp[0].value])) {
        result = fn(exp, env);
        if (result === exp) {
          return result;
        }
        if (result && result.push) {
          result.optimized = true;
        }
        result = wrapInfo1(result, exp);
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
  }
};
