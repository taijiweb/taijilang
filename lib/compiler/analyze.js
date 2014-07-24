var analyze, analyzeDefinition, analyzeFnMap, entity, error, extend, getValue, isArray, isValue, setValue, str, truth, wrapInfo1, _ref;

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

analyzeDefinition = function(exp, env) {};

analyzeFnMap = {
  '=': function(exp, env) {
    var eLeft, info, left;
    left = exp[1];
    eLeft = entity(left);
    if (typeof eLeft === 'string') {
      if (left["const"] && isAtomicValue(exp[2])) {
        return exp.removable = true;
      } else {
        info = env.info(left);
        if (!info) {
          env.optimizeInfoMap[left] = info = {};
        }
        info.assign = exp;
        return exp.refCount = 0;
      }
    } else {
      analyze(left, env);
      return analyze(exp[2], env);
    }
  },
  'var': function(exp, env) {
    var info, v;
    v = entity(exp[1]);
    env.optimizeInfoMap[v] = info = {};
    info.assign = void 0;
    return info.decl = exp;
  },
  'prefix!': function(exp, env) {
    return analyze(exp[2], env);
  },
  'suffix!': function(exp, env) {
    return analyze(exp[2], env);
  },
  'binary!': function(exp, env) {
    analyze(exp[2], env);
    return analyze(exp[3], env);
  },
  'augmentAssign!': function(exp, env) {
    analyze(exp[2], env);
    return analyze(exp[3], env);
  },
  'attribute!': function(exp, env) {
    return analyze(exp[1], env);
  },
  'index!': function(exp, env) {
    analyze(exp[1], env);
    return analyze(exp[2], env);
  },
  'augmentAssign!': function(exp, env) {
    analyze(exp[2], env);
    return analyze(exp[3], env);
  },
  'list!': function(exp, env) {
    var e, _i, _len, _ref1, _results;
    _ref1 = exp.slice(1);
    _results = [];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      e = _ref1[_i];
      _results.push(analyze(e, env));
    }
    return _results;
  },
  'begin!': function(exp, env) {
    var e, _i, _len, _ref1, _results;
    _ref1 = exp.slice(1);
    _results = [];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      e = _ref1[_i];
      _results.push(analyze(e, env));
    }
    return _results;
  },
  'debugger': function(exp, env) {},
  'break': function(exp, env) {},
  'continue': function(exp, env) {},
  'return': function(exp, env) {
    return analyze(exp[1], env);
  },
  'quote!': function(exp, env) {},
  'regexp!': function(exp, env) {},
  'noop!': function(exp, env) {},
  'jsvar!': function(exp, env) {},
  'label!': function(exp, env) {
    return analyze(exp[1], env);
  },
  'new': function(exp, env) {
    return analyze(exp[1], env);
  },
  'hash!': function(exp, env) {
    return analyze(exp[1], env);
  },
  'hashitem!': function(exp, env) {
    return analyze(exp[2], env);
  },
  'call!': function(exp, env) {
    analyze(exp[1], env);
    return analyze(exp[2], env);
  },
  'if': function(exp, env) {
    analyze(exp[1], env);
    analyze(exp[2], env);
    return analyze(exp[3], env);
  },
  'while': function(exp, env) {
    analyze(exp[1], env);
    return analyze(exp[2], env);
  },
  'doWhile!': function(exp, env) {
    analyze(exp[2], env);
    return analyze(exp[1], env);
  },
  'forIn!': function(exp, env) {
    analyze(exp[2], env);
    return analyze(exp[3], env);
  },
  'cFor!': function(exp, env) {
    analyze(exp[1], env);
    analyze(exp[2], env);
    analyze(exp[3], env);
    return analyze(exp[4], env);
  },
  'try!': function(exp, env) {
    analyze(exp[1], env);
    analyze(exp[3], env);
    return analyze(exp[4], env);
  },
  'switch!': function(exp, env) {
    analyze(exp[1], env);
    analyze(exp[1], env);
    return analyze(exp[1], env);
  },
  'function': function(exp, env) {
    var e, info, _i, _len, _ref1;
    env = exp.env;
    env.optimizeInfoMap = {};
    _ref1 = exp[1];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      e = _ref1[_i];
      env.optimizeInfoMap[entity(e)] = info = {};
      info.assign = [];
    }
    return analyze(exp[2], exp.env);
  },
  'letloop': function(exp, env) {
    var b, bindings, _i, _len;
    env = exp.env;
    env.optimizeInfoMap = {};
    bindings = exp[2];
    for (_i = 0, _len = bindings.length; _i < _len; _i++) {
      b = bindings[_i];
      transform(b[1], env);
    }
    return analyze(exp[3], env);
  }
};

exports.analyze = analyze = function(exp, env) {
  var e, fn, info, result, _i, _len;
  e = entity(exp);
  if (!e) {
    return;
  }
  if (typeof e === 'string') {
    if (e[0] === '"') {
      return;
    }
    info = env.info(e);
    if (info && info.assign) {
      info.assign.refCount++;
    }
    if (info && info.decl) {
      info.decl.refCount++;
    }
  }
  if (!exp.push) {
    return;
  }
  if (exp.analyzed) {
    return;
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
    return result.env = env;
  } else {
    for (_i = 0, _len = exp.length; _i < _len; _i++) {
      e = exp[_i];
      analyze(e, env);
    }
    return exp.analyzed = true;
  }
};
