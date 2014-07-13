var analyze, analyzeFnMap, analyzeForInOfExpression, entity, error, extend, getValue, isArray, isValue, setValue, str, truth, wrapInfo1, _ref;

_ref = require('../utils'), str = _ref.str, entity = _ref.entity, isValue = _ref.isValue, isArray = _ref.isArray, extend = _ref.extend, error = _ref.error, wrapInfo1 = _ref.wrapInfo1;

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

analyzeForInOfExpression = function(exp, env) {
  var bodyStmt, bodyValue, forInStmt, lst, rangeStmt, rangeValue, _ref1, _ref2;
  lst = env.newVar('list');
  _ref1 = transformExpression(exp[2], env), rangeStmt = _ref1[0], rangeValue = _ref1[1];
  _ref2 = transformExpression(exp[3], env), bodyStmt = _ref2[0], bodyValue = _ref2[1];
  forInStmt = [exp[0], exp[1], rangeValue, begin([bodyStmt, pushExp(lst, bodyValue)])];
  return [begin([['var', lst], rangeStmt, forInStmt]), lst];
};

analyzeFnMap = {
  '=': function(exp, env) {
    var eLeft, left;
    left = exp[1];
    eLeft = entity(left);
    if (typeof eLeft === 'string') {
      if (left.refCount === 0) {
        exp.removable = true;
      }
      if (left["const"] && isAtomicValue(exp[2])) {
        exp.removable = true;
      }
    }
    return exp;
  },
  'prefix!': function(exp, env) {
    analyze(exp[2], env);
    return exp;
  },
  'suffix!': function(exp, env) {
    analyze(exp[2], env);
    return exp;
  },
  'binary!': function(exp, env) {
    analyze(exp[2], env);
    analyze(exp[3], env);
    return exp;
  },
  'begin!': function(exp, env) {
    var e, result, x, _i, _len, _ref1;
    exp = (function() {
      var _i, _len, _ref1, _results;
      _ref1 = exp.slice(1);
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        e = _ref1[_i];
        _results.push(analyze(e, env));
      }
      return _results;
    })();
    result = [];
    if (exp.length === 0) {
      return void 0;
    }
    _ref1 = exp.slice(0, exp.length - 1);
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      e = _ref1[_i];
      if (isValue(e)) {
        continue;
      } else if ((x = entity(e)) && typeof x === 'string') {
        continue;
      } else {
        result.push(e);
      }
    }
    result.push(exp[exp.length - 1]);
    if (result.length === 0) {
      return void 0;
    } else if (result.length === 1) {
      return result[0];
    } else {
      result.unshift('begin!');
      return result;
    }
  },
  'if': function(exp, env) {
    var test, x;
    if (x = truth(test = analyze(exp[1], env))) {
      return analyze(exp[x + 1], env);
    } else {
      return ['if', test, analyze(exp[2], env), analyze(exp[3], env)];
    }
  },
  'while': function(exp, env) {
    var body, test;
    test = analyze(exp[1], env);
    body = analyze(exp[2], env);
    if (truth(test) !== 2) {
      return ['while', test, body];
    }
  },
  'doWhile!': function(exp, env) {
    var body, test;
    test = analyze(exp[2], env);
    body = analyze(exp[1], env);
    if (truth(test) === 2) {
      return body;
    } else {
      return ['doWhile!', body, test];
    }
  }
};

exports.analyze = analyze = function(exp, env) {
  var e, fn, i, result, _i, _len;
  e = entity(exp);
  if (!e) {
    return exp;
  }
  if (typeof e === 'string') {
    if (e[0] === '"') {
      return exp;
    }
    exp.refCount++;
  }
  if (!exp.push) {
    return exp;
  }
  if (exp.analyzed) {
    return exp;
  }
  if (fn = analyzeFnMap[exp[0]]) {
    result = fn(exp, env);
    if (result === exp) {
      return result;
    }
    if (result && result.push) {
      result.analyzed = true;
    }
    result = wrapInfo1(result, exp);
    result.env = env;
    return result;
  } else {
    for (i = _i = 0, _len = exp.length; _i < _len; i = ++_i) {
      e = exp[i];
      exp[i] = analyze(e, env);
    }
    exp.analyzed = true;
    return exp;
  }
};
