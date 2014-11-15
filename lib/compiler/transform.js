var JSONstringifyExp, LIST, SYMBOL, ShiftStatementInfo, VALUE, addStatementEffectFnMap, addStatementEffectList, assert, begin, constant, entity, error, extend, hasOwnProperty, idFn, isArray, isExpression, isExpressionList, mergeList, norm, notExp, pushExp, statementHeadMap, str, toExpression, transform, transformAndOrExpression, transformDirectExpression, transformExpression, transformExpressionFnMap, transformExpressionList, transformExpressionSequence, transformFnMap, transformInterpolatedString, transformReturnExpression, transformUnaryExpression, undefinedExp, useTransformExpression, wrapInfo1, _ref,
  __slice = [].slice;

_ref = require('../utils'), str = _ref.str, isArray = _ref.isArray, extend = _ref.extend, error = _ref.error, mergeList = _ref.mergeList, begin = _ref.begin, pushExp = _ref.pushExp, notExp = _ref.notExp, norm = _ref.norm, undefinedExp = _ref.undefinedExp, entity = _ref.entity, wrapInfo1 = _ref.wrapInfo1, constant = _ref.constant, assert = _ref.assert;

VALUE = constant.VALUE, SYMBOL = constant.SYMBOL, LIST = constant.LIST;

exports.idFn = idFn = function(exp, env) {
  return exp;
};

hasOwnProperty = Object.prototype.hasOwnProperty;

exports.ShiftStatementInfo = ShiftStatementInfo = (function() {
  function ShiftStatementInfo(affectVars, shiftVars, polluted) {
    this.affectVars = affectVars;
    this.shiftVars = shiftVars;
    this.polluted = polluted;
  }

  ShiftStatementInfo.prototype.addEffectOf = function(exp) {
    var fn;
    if (this.polluted) {
      return;
    }
    switch (exp.kind) {
      case VALUE:
        break;
      case SYMBOL:
        return this.shiftVars[exp.value] = true;
      case LIST:
        if (exp.affectAdded) {
          return;
        }
        if (fn = addStatementEffectFnMap[exp[0].value]) {
          fn(this, exp);
        } else {
          addStatementEffectList(this, exp);
        }
        return exp.affectAdded = true;
    }
  };

  ShiftStatementInfo.prototype.maybeAffect = function(name) {
    return this.polluted || hasOwnProperty.call(this.affectVars, name);
  };

  ShiftStatementInfo.prototype.copy = function() {
    return new ShiftStatementInfo(extend({}, this.affectVars), extend({}, this.shiftVars), this.polluted);
  };

  ShiftStatementInfo.prototype.merge = function() {
    var name, shiftStmtInfo, shiftStmtInfoList, _i, _j, _len, _len1;
    shiftStmtInfoList = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    if (this.polluted) {
      return this;
    }
    for (_i = 0, _len = shiftStmtInfoList.length; _i < _len; _i++) {
      shiftStmtInfo = shiftStmtInfoList[_i];
      if (shiftStmtInfo.polluted) {
        this.polluted = true;
        return this;
      }
    }
    for (_j = 0, _len1 = shiftStmtInfoList.length; _j < _len1; _j++) {
      shiftStmtInfo = shiftStmtInfoList[_j];
      for (name in shiftStmtInfo.affectVars) {
        if (hasOwnProperty.call(shiftStmtInfo.affectVars, name)) {
          this.affectVars[name] = true;
        }
      }
      for (name in shiftStmtInfo.shiftVars) {
        if (hasOwnProperty.call(shiftStmtInfo.shiftVars, name)) {
          this.shiftVars[name] = true;
        }
      }
    }
    return this;
  };

  return ShiftStatementInfo;

})();

addStatementEffectList = function(info, exp) {
  var e, _i, _len, _ref1;
  if (info.polluted) {
    return;
  }
  _ref1 = exp.slice(1);
  for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
    e = _ref1[_i];
    if (info.polluted) {
      return;
    } else {
      info.addEffectOf(e);
    }
  }
};

addStatementEffectFnMap = {
  '=': function(info, exp) {
    if (info.polluted) {
      return;
    }
    if (exp[1].kind === SYMBOL) {
      info.affectVars[exp[1]] = 1;
      info.addEffectOf(exp[2]);
    } else {
      info.addEffectOf(exp[1]);
      info.addEffectOf(exp[2]);
    }
  },
  'attribute!': function(info, exp) {
    return info.addEffectOf(exp[1]);
  },
  'index!': function(info, exp) {
    info.addEffectOf(exp[2]);
    return info.addEffectOf(exp[1]);
  },
  'binary!': function(info, exp) {
    return addStatementEffectList(info, exp.slice(2, 4));
  },
  'metaConvertVar!': function(info, exp) {},
  'break': function(info, exp) {},
  'quote!': function(info, exp) {},
  'regexp!': function(info, exp) {},
  'continue': function(info, exp) {},
  'var': function(info, exp) {},
  'label!': function(info, exp) {
    return info.addEffectOf(exp[1]);
  },
  'noop!': function(info, exp) {},
  'jsvar!': function(info, exp) {},
  'new': function(info, exp) {
    return info.polluted = true;
  },
  'hashitem!': function(info, exp) {
    return info.addEffectOf(exp[2]);
  },
  'call!': function(info, exp) {
    return info.polluted = true;
  },
  'function': function(info, exp) {},
  'letloop!': function(info, exp) {
    var binding, _i, _len, _ref1;
    _ref1 = exp[2];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      binding = _ref1[_i];
      info.affectVars[entity(binding[0])] = true;
    }
    return info.addEffectOf(exp[3]);
  }
};

statementHeadMap = {
  'break': 1,
  'continue': 1,
  'switch': 1,
  'try': 1,
  'throw': 1,
  'jsForIn!': 1,
  'forOf!': 1,
  'cFor!': 1,
  'while': 1,
  'doWhile!': 1,
  'letloop': 1,
  'with': 1,
  'var': 1,
  'label!': 1
};

exports.isExpression = isExpression = function(exp) {
  var exp0;
  exp0 = exp[0].value;
  if (exp0 === 'if') {
    return isExpressionList(exp.slice(1, 4));
  }
  if (exp0 === 'begin!') {
    return isExpressionList(exp.slice(1));
  }
  if (statementHeadMap[exp0]) {
    return false;
  }
  return true;
};

isExpressionList = function(exp) {
  var e, _i, _len;
  for (_i = 0, _len = exp.length; _i < _len; _i++) {
    e = exp[_i];
    if (!isExpression(e)) {
      return false;
    }
  }
  return true;
};

exports.toExpression = toExpression = function(exp) {
  var e, exp0;
  exp0 = exp[0].value;
  if (exp0 === 'if') {
    return [norm('?:'), toExpression(exp[1]), toExpression(exp[2]), toExpression(exp[3])];
  }
  if (exp0 === 'begin!') {
    return [norm('comma!')].concat((function() {
      var _i, _len, _ref1, _results;
      _ref1 = exp.slice(1);
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        e = _ref1[_i];
        _results.push(toExpression(e));
      }
      return _results;
    })());
  } else {
    return exp;
  }
};

JSONstringifyExp = norm(['attribute!', ['jsvar!', 'JSON'], 'stringify']);

transformInterpolatedString = function(exp) {
  exp = entity(exp);
  if (typeof exp === 'string') {
    if (exp[0] === '"') {
      return exp;
    } else {
      return ['call!', JSONstringifyExp, [exp]];
    }
  } else if (Object.prototype.toString.call(exp) === '[object Array]') {
    return ['call!', JSONstringifyExp, [exp]];
  } else {
    return exp;
  }
};

transformAndOrExpression = function(exp, env, shiftStmtInfo) {
  var ifStmt, isAndOr, leftStmt, leftValue, leftVar, resultVar, rightStmt, rightValue, stmt, testFn, _ref1, _ref2, _ref3;
  testFn = exp[1] === '&&' ? notExp : function(x) {
    return x;
  };
  isAndOr = exp[1] === '&&' ? 'isAnd' : 'isOr';
  _ref1 = transformExpressionSequence(exp.slice(2, 4), env, shiftStmtInfo), (_ref2 = _ref1[0], leftStmt = _ref2[0], leftValue = _ref2[1]), (_ref3 = _ref1[1], rightStmt = _ref3[0], rightValue = _ref3[1]);
  if (!rightStmt) {
    return norm([leftStmt, ['binary!', exp[1], leftValue, rightValue]]);
  }
  leftVar = env.ssaVar('x');
  resultVar = env.ssaVar('t');
  ifStmt = norm(['if', testFn(leftVar), ['=', resultVar, leftVar], begin([rightStmt, ['=', resultVar, rightValue]])]);
  ifStmt[isAndOr] = true;
  stmt = begin(norm([leftStmt, ['var', leftVar], ['=', leftVar, leftValue], ['var', resultVar], ifStmt]));
  return norm([stmt, resultVar]);
};

transformReturnExpression = function(exp, env, shiftStmtInfo) {
  var expStmt, value, _ref1;
  _ref1 = transformExpression(exp[1], env, shiftStmtInfo), expStmt = _ref1[0], value = _ref1[1];
  return [begin([expStmt, [exp[0], value]]), undefinedExp];
};

transformDirectExpression = function(exp, env, shiftStmtInfo) {
  var es, stmt, _ref1;
  _ref1 = transformExpressionList(exp.slice(1), env, shiftStmtInfo), stmt = _ref1[0], es = _ref1[1];
  return [stmt, [exp[0]].concat(__slice.call(es))];
};

transformUnaryExpression = function(exp, env, shiftStmtInfo) {
  var e, exp2, stmt, t, _ref1, _ref2, _ref3;
  if (exp[1] !== '++' && exp[1] !== '--') {
    _ref1 = transformExpression(exp[2], env, shiftStmtInfo), stmt = _ref1[0], e = _ref1[1];
    return [stmt, [exp[0], exp[1], e]];
  } else if (exp[0] === 'suffix!') {
    exp2 = entity(exp[2]);
    if (typeof exp2 === 'string' && exp2 && exp[0] !== '"') {
      if (shiftStmtInfo.maybeAffect(exp2)) {
        return [begin([['var', (t = env.ssaVar('t'))], ['=', t, exp2], exp]), t];
      } else {
        return [undefinedExp, exp];
      }
    } else {
      _ref2 = transformExpression(exp[2], env, shiftStmtInfo), stmt = _ref2[0], e = _ref2[1];
      return [begin([stmt, ['var', (t = env.ssaVar('t'))], ['=', t, e], ['suffix!', exp[1], e]]), t];
    }
  } else {
    exp2 = entity(exp[2]);
    if (typeof exp2 === 'string' && exp2 && exp[0] !== '"') {
      if (shiftStmtInfo.maybeAffect(exp2)) {
        return [begin([['var', (t = env.ssaVar('t'))], ['=', t, exp]]), t];
      } else {
        return [undefinedExp, exp];
      }
    } else {
      _ref3 = transformExpression(exp[2], env, shiftStmtInfo), stmt = _ref3[0], e = _ref3[1];
      return [begin([stmt, ['var', (t = env.ssaVar('t'))], ['=', t, ['prefix!', exp[1], e]]]), t];
    }
  }
};

transformExpressionFnMap = {
  'directLineComment!': function(exp, env, shiftStmtInfo) {
    return [exp, exp];
  },
  'directCBlockComment!': function(exp, env, shiftStmtInfo) {
    return [exp, exp];
  },
  'string!': function(exp, env, shiftStmtInfo) {
    var e, es, stmt, _i, _len, _ref1, _ref2;
    _ref1 = transformExpressionList(exp.slice(1), env, shiftStmtInfo), stmt = _ref1[0], es = _ref1[1];
    str = transformInterpolatedString(es[0]);
    _ref2 = es.slice(1);
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      e = _ref2[_i];
      str = ['binary!', '+', str, transformInterpolatedString(e)];
    }
    return [stmt, str];
  },
  'index!': transformDirectExpression,
  'attribute!': function(exp, env, shiftStmtInfo) {
    var objExp, objStmt, _ref1;
    _ref1 = transformExpression(exp[1], env, shiftStmtInfo), objStmt = _ref1[0], objExp = _ref1[1];
    return [objStmt, ['attribute!', objExp, exp[2]]];
  },
  '?:': function(exp, env, shiftStmtInfo) {
    var elseExp, elseInfo, elseStmt, ifStmt, t, testExp, testInfo, testStmt, thenExp, thenInfo, thenStmt, _ref1, _ref2, _ref3;
    _ref1 = transformExpression(exp[2], env, thenInfo = shiftStmtInfo.copy()), thenStmt = _ref1[0], thenExp = _ref1[1];
    _ref2 = transformExpression(exp[3], env, elseInfo = shiftStmtInfo.copy()), elseStmt = _ref2[0], elseExp = _ref2[1];
    _ref3 = transformExpression(exp[1], env, testInfo = shiftStmtInfo.copy()), testStmt = _ref3[0], testExp = _ref3[1];
    shiftStmtInfo.merge(thenInfo, elseInfo, testInfo);
    if (thenStmt || elseStmt) {
      t = env.ssaVar('t');
      ifStmt = ['if', testExp, begin([thenStmt, ['=', t, thenExp]]), begin([elseStmt, ['=', t, elseExp]])];
      ifStmt.isTernary = true;
      return [begin([testStmt, ['var', t], ifStmt]), t];
    } else {
      return [testStmt, ['?:', testExp, thenExp, elseExp]];
    }
  },
  'prefix!': transformUnaryExpression,
  'suffix!': transformUnaryExpression,
  'binary!': function(exp, env, shiftStmtInfo) {
    var left, leftStmt, right, rightStmt, _ref1, _ref2, _ref3;
    if (exp[1] === '||' || exp[1] === '&&') {
      return transformAndOrExpression(exp, env, shiftStmtInfo);
    }
    _ref1 = transformExpressionSequence(exp.slice(2, 4), env, shiftStmtInfo), (_ref2 = _ref1[0], leftStmt = _ref2[0], left = _ref2[1]), (_ref3 = _ref1[1], rightStmt = _ref3[0], right = _ref3[1]);
    return norm([begin([leftStmt, rightStmt]), norm(['binary!', exp[1], left, right])]);
  },
  '=': function(exp, env, shiftStmtInfo) {
    var exp1, leftExp, leftStmt, rightExp, rightStmt, t, _ref1, _ref2, _ref3, _ref4;
    exp1 = exp[1];
    if (left.kind === SYMBOL) {
      if (shiftStmtInfo.maybeAffect(exp1)) {
        _ref1 = transformExpression(exp[2], env, shiftStmtInfo), rightStmt = _ref1[0], rightExp = _ref1[1];
        return [begin([rightStmt, ['var', (t = env.ssaVar('t'))], ['=', t, rightExp], ['=', exp1, t]]), t];
      } else if (shiftStmtInfo.maybeAffectBy(exp1)) {
        return [begin([rightStmt, ['=', exp1, rightExp]]), exp1];
      } else {
        return [rightStmt, ['=', exp1, rightExp]];
      }
    } else {
      _ref2 = transformExpressionSequence(exp.slice(1, 3), env, shiftStmtInfo), (_ref3 = _ref2[0], leftStmt = _ref3[0], leftExp = _ref3[1]), (_ref4 = _ref2[1], rightStmt = _ref4[0], rightExp = _ref4[1]);
      return [begin([leftStmt, rightStmt]), ['=', leftExp, rightExp]];
    }
  },
  'augmentAssign!': function(exp, env, shiftStmtInfo) {
    var affected, exp2, leftExp, leftStmt, rightExp, rightStmt, t, _ref1, _ref2, _ref3, _ref4;
    exp2 = entity(exp[2]);
    if (typeof exp2 === 'string' && exp2 && exp[0] !== '"') {
      affected = shiftStmtInfo.maybeAffect(exp2);
      _ref1 = transformExpression(exp[3], env, shiftStmtInfo), rightStmt = _ref1[0], rightExp = _ref1[1];
      if (affected) {
        return [begin([rightStmt, ['var', (t = env.ssaVar('t'))], ['augmentAssign!', exp[1], exp2, rightExp], ['=', t, exp[2]], exp]), t];
      } else {
        return [rightStmt, ['augmentAssign!', exp[1], exp2, rightExp]];
      }
    } else {
      _ref2 = transformExpressionSequence(exp.slice(2, 4), env, shiftStmtInfo), (_ref3 = _ref2[0], leftStmt = _ref3[0], leftExp = _ref3[1]), (_ref4 = _ref2[1], rightStmt = _ref4[0], rightExp = _ref4[1]);
      return [begin([leftStmt, rightStmt]), ['augmentAssign!', exp[1], leftExp, rightExp]];
    }
  },
  'list!': function(exp, env, shiftStmtInfo) {
    var args, argsStmts, argsValues, e, _i, _len, _ref1;
    _ref1 = transformExpressionList(exp.slice(1), env, shiftStmtInfo), argsStmts = _ref1[0], argsValues = _ref1[1];
    args = [];
    for (_i = 0, _len = argsValues.length; _i < _len; _i++) {
      e = argsValues[_i];
      if (e && e[0] === 'directLineComment!' || e[0] === 'directCBlockComment!') {
        continue;
      } else {
        args.push(e);
      }
    }
    return [argsStmts, ['list!'].concat(args)];
  },
  'debugger': function(exp, env, shiftStmtInfo) {
    return [exp, undefinedExp];
  },
  'break': function(exp, env, shiftStmtInfo) {
    return [exp, undefinedExp];
  },
  'continue': function(exp, env, shiftStmtInfo) {
    return [exp, undefinedExp];
  },
  'quote!': function(exp, env, shiftStmtInfo) {
    return [undefinedExp, exp];
  },
  'regexp!': function(exp, env, shiftStmtInfo) {
    return [undefinedExp, exp];
  },
  'new': function(exp, env, shiftStmtInfo) {
    var argsStmts, argsValues, callerStmt, callerValue, e, stmt, t, _ref1, _ref2, _ref3;
    if (exp[1] && exp[1][0] === 'call!') {
      _ref1 = transformExpressionList(exp[2], env, shiftStmtInfo), argsStmts = _ref1[0], argsValues = _ref1[1];
      _ref2 = transformExpression(exp[1], env, shiftStmtInfo), callerStmt = _ref2[0], callerValue = _ref2[1];
      return [begin([['var', t = env.ssaVar('t')], callserStmt, argsStmt, ['=', t, ['new', ['call!', callerValues, argsValues]]]]), t];
    } else {
      _ref3 = transformExpression(exp[1], env, shiftStmtInfo), stmt = _ref3[0], e = _ref3[1];
      return [begin([['var', t = env.ssaVar('t')], stmt, ['=', t, ['new', e]]]), t];
    }
  },
  'return': transformReturnExpression,
  'throw': transformReturnExpression,
  'var': function(exp, env, shiftStmtInfo) {
    var metaVar, variable;
    if (Object.prototype.toString.call(exp[1]) === '[object Array]') {
      env = env.outerVarScopeEnv();
      metaVar = exp[1][1];
      variable = metaVar + (env.getSymbolIndex(metaVar) || '');
      return [['var', variable], variable];
    } else {
      return [exp, undefinedExp];
    }
  },
  'label!': function(exp, env, shiftStmtInfo) {
    var e, stmt, _ref1;
    _ref1 = transformExpression(exp[1], env, shiftStmtInfo), stmt = _ref1[0], e = _ref1[1];
    return [['label!', stmt], e];
  },
  'noop!': function(exp, env, shiftStmtInfo) {
    return [exp, undefinedExp];
  },
  'jsvar!': function(exp, env, shiftStmtInfo) {
    var t;
    if (shiftStmtInfo.maybeAffect(entity(exp[1]))) {
      return [begin([['var', t = env.ssaVar('t')], ['=', t, exp[1]]]), t];
    } else {
      return [undefinedExp, exp];
    }
  },
  '@@': function(exp, env, shiftStmtInfo) {
    var metaVar, variable;
    env = env.outerVarScopeEnv();
    metaVar = exp[1][1];
    variable = metaVar + (env.getSymbolIndex(metaVar) || '');
    return [undefinedExp, variable];
  },
  'metaConvertVar!': function(exp, env, shiftStmtInfo) {
    var variable;
    variable = exp[1] + (env.getSymbolIndex(exp[1]) || '');
    return [undefinedExp, variable];
  },
  'hash!': function(exp, env, shiftStmtInfo) {
    var e, stmt, _ref1;
    _ref1 = transformExpressionList(exp[1], env, shiftStmtInfo), stmt = _ref1[0], e = _ref1[1];
    return [stmt, ['hash!', e]];
  },
  'hashitem!': function(exp, env, shiftStmtInfo) {
    var e, stmt, _ref1;
    _ref1 = transformExpression(exp[2], env, shiftStmtInfo), stmt = _ref1[0], e = _ref1[1];
    return [stmt, ['hashitem!', exp[1], e]];
  },
  'call!': function(exp, env, shiftStmtInfo) {
    var args, argsStmts, argsValues, callerStmt, callerValue, e, _i, _len, _ref1, _ref2;
    _ref1 = transformExpressionList(exp[2], env, shiftStmtInfo), argsStmts = _ref1[0], argsValues = _ref1[1];
    _ref2 = transformExpression(exp[1], env, shiftStmtInfo), callerStmt = _ref2[0], callerValue = _ref2[1];
    args = [];
    for (_i = 0, _len = argsValues.length; _i < _len; _i++) {
      e = argsValues[_i];
      if (e && (e[0] === 'directLineComment!' || e[0] === 'directCBlockComment!')) {
        continue;
      } else {
        args.push(e);
      }
    }
    return [begin([callerStmt, argsStmts]), ['call!', callerValue, argsValues]];
  },
  'function': function(exp, env, shiftStmtInfo) {
    env = exp.env;
    exp = ['function', exp[1], transform(exp[2], env)];
    exp.env = env;
    return [undefinedExp, exp];
  },
  'begin!': function(exp, env, shiftStmtInfo) {
    var e, stmt, stmts, _i, _len, _ref1, _ref2, _ref3;
    if (exp.length === 0) {
      return [undefinedExp, undefinedExp];
    }
    stmts = [];
    _ref1 = exp.slice(1, exp.length - 1);
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      e = _ref1[_i];
      _ref2 = transformExpression(e, env, shiftStmtInfo), stmt = _ref2[0], e = _ref2[1];
      stmts.push(stmt);
      stmts.push(e);
    }
    _ref3 = transformExpression(exp[exp.length - 1], env, shiftStmtInfo), stmt = _ref3[0], e = _ref3[1];
    stmts.push(stmt);
    return [begin(stmts), e];
  },
  'if': function(exp, env, shiftStmtInfo) {
    var eElse, eThen, ifExp, ifStmt, resultVar, stmtElse, stmtTest, stmtThen, testExp, _ref1, _ref2, _ref3;
    _ref1 = transformExpression(exp[1], env, shiftStmtInfo), stmtTest = _ref1[0], testExp = _ref1[1];
    _ref2 = transformExpression(exp[2], env, shiftStmtInfo), stmtThen = _ref2[0], eThen = _ref2[1];
    if (exp[3]) {
      _ref3 = transformExpression(exp[3], env, shiftStmtInfo), stmtElse = _ref3[0], eElse = _ref3[1];
      if (isExpression(stmtElse) && isExpression(stmtThen)) {
        ifExp = ['?:', testExp, toExpression(begin([stmtThen, eThen])), toExpression(begin([stmtElse, eElse]))];
        return [stmtTest, ifExp];
      } else {
        resultVar = env.ssaVar('t');
        ifStmt = ['if', testExp, begin([stmtThen, ['=', resultVar, eThen]]), begin([stmtElse, ['=', resultVar, eElse]])];
        return [begin([stmtTest, ['var', resultVar], ifStmt]), resultVar];
      }
    } else {
      if (isExpression(stmtThen)) {
        ifExp = ['binary!', '&&', testExp, toExpression(begin([stmtThen, eThen]))];
        return [stmtTest, ifExp];
      } else {
        ifStmt = ['if', testExp, begin([stmtThen, ['=', resultVar, eThen]])];
        return [begin([stmtTest, ['var', resultVar], ifStmt]), resultVar];
      }
    }
  },
  'while': function(exp, env, shiftStmtInfo) {
    var bodyStmt, bodyValue, expTest, lst, stmtTest, whileStmt, _ref1, _ref2;
    lst = env.newVar('list');
    _ref1 = transformExpression(exp[1], env, shiftStmtInfo), stmtTest = _ref1[0], expTest = _ref1[1];
    _ref2 = transformExpression(exp[2], env, shiftStmtInfo), bodyStmt = _ref2[0], bodyValue = _ref2[1];
    if (stmtTest) {
      whileStmt = ['while', 1, begin([stmtTest, ['if', notExp(expTest), 'break'], bodyStmt, pushExp(lst, bodyValue)])];
    } else {
      whileStmt = ['while', expTest, begin([bodyStmt, pushExp(lst, bodyValue)])];
    }
    return [begin([['var', lst], ['=', lst, []], whileStmt]), lst];
  },
  'doWhile!': function(exp, env, shiftStmtInfo) {
    var bodyStmt, bodyValue, doWhileStmt, e, lst, stmt, _ref1, _ref2;
    lst = env.newVar('list');
    _ref1 = transformExpression(exp[1], env, shiftStmtInfo), bodyStmt = _ref1[0], bodyValue = _ref1[1];
    _ref2 = transformExpression(exp[1], env, shiftStmtInfo), stmt = _ref2[0], e = _ref2[1];
    doWhileStmt = ['doWhile!', begin([bodyStmt, pushExp(lst, bodyValue), stmt]), e];
    return [begin([['var', lst], doWhileStmt]), lst];
  },
  'jsForIn!': function(exp, env, shiftStmtInfo) {
    var bodyStmt, bodyValue, forInStmt, lst, rangeStmt, rangeValue, _ref1, _ref2;
    lst = env.newVar('list');
    _ref1 = transformExpression(exp[2], env, shiftStmtInfo), rangeStmt = _ref1[0], rangeValue = _ref1[1];
    _ref2 = transformExpression(exp[3], env, shiftStmtInfo), bodyStmt = _ref2[0], bodyValue = _ref2[1];
    forInStmt = ['jsForIn!', exp[1], rangeValue, begin([bodyStmt, pushExp(lst, bodyValue)])];
    return [begin([['var', lst], ['=', lst, ['list!']], rangeStmt, forInStmt]), lst];
  },
  'cFor!': function(exp, env, shiftStmtInfo) {
    var bodyStmt, bodyValue, cForStmt, initStmt, initValue, lst, stepStmt, stepValue, testStmt, testValue, _ref1, _ref2, _ref3, _ref4;
    lst = env.newVar('list');
    _ref1 = transformExpression(exp[1], env, shiftStmtInfo), initStmt = _ref1[0], initValue = _ref1[1];
    _ref2 = transformExpression(exp[2], env, shiftStmtInfo), testStmt = _ref2[0], testValue = _ref2[1];
    _ref3 = transformExpression(exp[3], env, shiftStmtInfo), stepStmt = _ref3[0], stepValue = _ref3[1];
    _ref4 = transformExpression(exp[4], env, shiftStmtInfo), bodyStmt = _ref4[0], bodyValue = _ref4[1];
    cForStmt = ['cFor!', initValue, undefinedExp, undefinedExp, begin([testStmt, ['if', notExp(testValue), ['break']], bodyStmt, pushExp(lst, bodyValue), stepStmt])];
    return [begin([initStmt, ['var', lst], cForStmt]), lst];
  },
  'try': function(exp, env, shiftStmtInfo) {
    var bodyStmt, bodyValue, catchAction, finallyAction, _ref1;
    _ref1 = transformExpression(exp[1], env, shiftStmtInfo), bodyStmt = _ref1[0], bodyValue = _ref1[1];
    catchAction = transform(exp[3], env, shiftStmtInfo);
    finallyAction = transform(exp[4], env, shiftStmtInfo);
    return [['try', bodyStmt, exp[2], catchAction, finallyAction], bodyValue];
  },
  'switch': function(exp, env, shiftStmtInfo) {
    var action, actionStmt, actionValue, caseClause, caseStmt, caseTestVar, caseValue, caseValueStmt, caseValues, cases, changeToIf, defaultStmt, defaultValue, e, e0, exp2, exp3, i, j, resultCases, resultVar, stmt, stmt00, stmtExp, switchStmt, testStmt, testValue, testVar, values, x, x1, _ref1, _ref2, _ref3, _ref4;
    changeToIf = false;
    exp2 = exp[2];
    cases = [];
    i = exp2.length;
    while (--i >= 0) {
      e = exp2[i];
      e0 = e[0];
      caseValues = [];
      j = e0.length;
      while (--j >= 0) {
        x = e0[j];
        caseValues.unshift((_ref1 = transformExpression(x, env, shiftStmtInfo), stmt = _ref1[0], x1 = _ref1[1], _ref1));
        if (i !== 0 && j !== 0 && entity(stmt)) {
          changeToIf = true;
        }
      }
      cases.unshift([caseValues, transformExpression(e[1], env, shiftStmtInfo)]);
    }
    if (exp3 = exp[3]) {
      _ref2 = transformExpression(exp3, env, shiftStmtInfo), defaultStmt = _ref2[0], defaultValue = _ref2[1];
    }
    _ref3 = transformExpression(exp[1], env, shiftStmtInfo), testStmt = _ref3[0], testValue = _ref3[1];
    resultVar = env.ssaVar('t');
    if (changeToIf) {
      testStmt = begin([testStmt, ['var', testVar], ['=', (testVar = env.ssaVar('t')), testValue], ['var', caseTestVar = env.ssaVar('t')]]);
      i = cases.length;
      if (exp3) {
        switchStmt = begin([defaultStmt, ['=', resultVar, defaultValue]]);
      } else {
        switchStmt = undefinedExp;
      }
      while (--i >= 0) {
        j = cases[i][0].length - 1;
        caseValueStmt = undefinedExp;
        while (--j >= 0) {
          caseClause = cases[i][0][j];
          caseStmt = caseClause[1];
          caseValue = caseClause[2];
          caseValueStmt = begin([caseStmt, ['if', ['binary!', '===', testVar, caseValue], ['=', caseTestVar, true], caseValueStmt]]);
        }
        _ref4 = cases[i][1], actionStmt = _ref4[0], actionValue = _ref4[1];
        switchStmt = begin([caseValueStmt, ['if', caseTestVar, begin([actionStmt, ['=', resultVar, actionValue]]), switchStmt]]);
      }
    } else {
      if (stmt00 = cases[0][0][0][0]) {
        testStmt = begin([testStmt, stmt00]);
      }
      resultCases = (function() {
        var _i, _len, _ref5, _results;
        _results = [];
        for (_i = 0, _len = cases.length; _i < _len; _i++) {
          _ref5 = cases[_i], caseValues = _ref5[0], action = _ref5[1];
          values = (function() {
            var _j, _len1, _results1;
            _results1 = [];
            for (_j = 0, _len1 = caseValues.length; _j < _len1; _j++) {
              stmtExp = caseValues[_j];
              _results1.push(stmtExp[1]);
            }
            return _results1;
          })();
          _results.push([values, begin([action[0], ['=', resultVar, action[1]], ['break']])]);
        }
        return _results;
      })();
      switchStmt = ['switch', testValue, resultCases, begin([defaultStmt, ['=', resultVar, defaultValue]])];
    }
    return [begin([testStmt, switchStmt]), resultVar];
  },
  'letloop!': function(exp, env, shiftStmtInfo) {
    var b, bindings, letloopStmt, t, _i, _len;
    bindings = exp[2];
    for (_i = 0, _len = bindings.length; _i < _len; _i++) {
      b = bindings[_i];
      b[1] = transform(b[1], env);
    }
    letloopStmt = ['letloop!', exp[1], bindings, begin([['var', t = env.ssaVar('t')], transform(['=', t, exp[3]], env)])];
    letloopStmt.env = exp.env;
    return [letloopStmt, t];
  }
};

exports.transformExpression = transformExpression = function(exp, env, shiftStmtInfo) {
  var result, t;
  switch (exp.kind) {
    case VALUE:
      return [undefinedExp, exp];
    case SYMBOL:
      if (exp.ssa) {
        return [undefinedExp, exp];
      } else if (shiftStmtInfo.maybeAffect(exp.value)) {
        return [begin([norm(['var', t = env.ssaVar('t')], norm(['=', t, exp]))]), t];
      } else {
        return [undefinedExp, exp];
      }
      break;
    case LIST:
      assert(transformExpressionFnMap[exp[0].value]);
      result = transformExpressionFnMap[exp[0].value](exp, env, shiftStmtInfo);
      shiftStmtInfo.addEffectOf(result[0]);
      return result;
  }
};

transformExpressionSequence = function(exps, env, shiftStmtInfo) {
  var exp, i, result;
  result = [];
  i = exps.length;
  while (--i) {
    exp = exps[i];
    result.unshift(transformExpression(exp, env, shiftStmtInfo));
  }
  return result;
};

transformExpressionList = function(exps, env, shiftStmtInfo) {
  var e, es, exp, i, stmt, stmts, _ref1;
  stmts = [];
  es = [];
  i = exps.length;
  while (--i) {
    exp = exps[i];
    _ref1 = transformExpression(exp, env, shiftStmtInfo), stmt = _ref1[0], e = _ref1[1];
    stmts.unshift(stmt);
    es.unshift(e);
  }
  return [begin(stmts), es];
};

useTransformExpression = function(exp, env) {
  return begin(transformExpression(exp, env, new ShiftStatementInfo({})));
};

transformFnMap = {
  'debugger': idFn,
  'break': idFn,
  'quote!': idFn,
  'regexp!': idFn,
  'continue': idFn,
  'label!': function(exp, env, shiftStmtInfo) {
    return ['label!', exp[1], transform(exp[2], env)];
  },
  'noop!': idFn,
  'directLineComment!': idFn,
  'directCBlockComment!': idFn,
  'begin!': function(exp, env) {
    var e, stmts, _i, _len, _ref1;
    stmts = [];
    _ref1 = exp.slice(1);
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      e = _ref1[_i];
      stmts.push(transform(e, env));
    }
    return begin(stmts);
  },
  'if': function(exp, env) {
    var stmtTest, testExp, _ref1;
    _ref1 = transformExpression(exp[1], env, new ShiftStatementInfo({})), stmtTest = _ref1[0], testExp = _ref1[1];
    return begin([stmtTest, ['if', testExp, transform(exp[2], env), transform(exp[3], env)]]);
  },
  'while': function(exp, env) {
    var bodyStmt, stmt, testExp, _ref1;
    _ref1 = transformExpression(exp[1], env, new ShiftStatementInfo({})), stmt = _ref1[0], testExp = _ref1[1];
    bodyStmt = transform(exp[2], env);
    if (stmt) {
      return ['while', 1, begin([stmt, ['if', notExp(testExp), 'break'], bodyStmt])];
    } else {
      return ['while', testExp, bodyStmt];
    }
  },
  'doWhile!': function(exp, env) {
    var stmt, testExp, _ref1;
    _ref1 = transformExpression(exp[2], env, new ShiftStatementInfo({})), stmt = _ref1[0], testExp = _ref1[1];
    return ['doWhile!', begin([transform(exp[1], env), stmt]), testExp];
  },
  'jsForIn!': function(exp, env) {
    var hashExp, stmt, _ref1;
    _ref1 = transformExpression(exp[2], env, new ShiftStatementInfo({})), stmt = _ref1[0], hashExp = _ref1[1];
    if (stmt) {
      return ['begin!', stmt, ['jsForIn!', exp[1], hashExp, transform(exp[3], env)]];
    } else {
      return ['jsForIn!', exp[1], hashExp, transform(exp[3], env)];
    }
  },
  'cFor!': function(exp, env) {
    var body, cForStmt, initStmt, initValue, stepStmt, stepValue, testStmt, testValue, _ref1, _ref2, _ref3;
    _ref1 = transformExpression(exp[1], env, new ShiftStatementInfo({})), initStmt = _ref1[0], initValue = _ref1[1];
    _ref2 = transformExpression(exp[2], env, new ShiftStatementInfo({})), testStmt = _ref2[0], testValue = _ref2[1];
    _ref3 = transformExpression(exp[3], env, new ShiftStatementInfo({})), stepStmt = _ref3[0], stepValue = _ref3[1];
    body = transform(exp[4], env);
    if (isUndefinedExp(testStmt)) {
      cForStmt = ['cFor!', initValue, testValue, stepValue, begin([testStmt, body, stepStmt])];
    } else {
      cForStmt = ['cFor!', initValue, true, stepValue, begin([testStmt, ['if', notExp(testValue), ['break']], body, stepStmt])];
    }
    return norm(begin([initStmt, cForStmt]));
  },
  'try': function(exp, env) {
    return norm(['try', transform(exp[1], env), exp[2], transform(exp[3], env), transform(exp[4], env)]);
  }
};

exports.transform = transform = function(exp, env) {
  var fn, result;
  if (exp.transformed) {
    return exp;
  }
  assert(exp.kind === LIST, 'wrong kind of exp: ' + str(exp));
  if ((fn = transformFnMap[exp[0].value])) {
    result = fn(exp, env);
  } else {
    result = useTransformExpression(exp, env);
  }
  result.transformed = true;
  return result;
};
