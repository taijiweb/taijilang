var SYMBOL, ShiftStatementInfo, VALUE, assert, assignVarsOf, begin, commentPlaceholder, compileError, extend, hasOwnProperty, notExp, pollutedOf, pushExp, statementHeadMap, str, symbolOf, toExpression, trace, transform, transformAndOrExpression, transformExpression, transformExpressionFnMap, transformExpressionList, transformExpressionSequence, transformFnMap, transformReturnThrowExpression, undefinedExp, varsOf, _ref, _ref1, _ref2,
  __slice = [].slice;

_ref = require('../utils'), str = _ref.str, extend = _ref.extend, begin = _ref.begin, pushExp = _ref.pushExp, notExp = _ref.notExp, undefinedExp = _ref.undefinedExp, assert = _ref.assert, hasOwnProperty = _ref.hasOwnProperty, commentPlaceholder = _ref.commentPlaceholder, trace = _ref.trace, symbolOf = _ref.symbolOf;

_ref1 = require('./helper'), assignVarsOf = _ref1.assignVarsOf, varsOf = _ref1.varsOf, pollutedOf = _ref1.pollutedOf, compileError = _ref1.compileError;

_ref2 = require('../constant'), VALUE = _ref2.VALUE, SYMBOL = _ref2.SYMBOL;

exports.ShiftStatementInfo = ShiftStatementInfo = (function() {
  function ShiftStatementInfo(assignVars, vars, polluted, returnThrow) {
    this.assignVars = assignVars;
    this.vars = vars;
    this.polluted = polluted;
    this.returnThrow = returnThrow;
  }

  ShiftStatementInfo.prototype.affect = function(name) {
    return this.polluted || hasOwnProperty.call(this.assignVars, name);
  };

  ShiftStatementInfo.prototype.affectExp = function(exp) {
    var k, vars;
    if (this.polluted) {
      return true;
    }
    vars = varsOf(exp);
    for (k in vars) {
      if (hasOwnProperty.call(vars, k) && hasOwnProperty.call(this.assignVars, k)) {
        return true;
      }
    }
    return false;
  };

  ShiftStatementInfo.prototype.addEffect = function(stmt) {
    if (this.polluted) {
      return;
    }
    if (pollutedOf(stmt)) {
      this.polluted = true;
      return;
    }
    extend(this.assignVars, assignVarsOf(stmt));
    extend(this.vars, varsOf(stmt));
  };

  ShiftStatementInfo.prototype.copy = function() {
    if (this.polluted) {
      return this;
    } else {
      return new ShiftStatementInfo(extend({}, this.assignVars), extend({}, this.vars));
    }
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
      for (name in shiftStmtInfo.assignVars) {
        if (hasOwnProperty.call(shiftStmtInfo.assignVars, name)) {
          this.assignVars[name] = true;
        }
      }
      for (name in shiftStmtInfo.vars) {
        if (hasOwnProperty.call(shiftStmtInfo.vars, name)) {
          this.vars[name] = true;
        }
      }
    }
    return this;
  };

  return ShiftStatementInfo;

})();

transformAndOrExpression = function(op) {
  var testFn;
  testFn = op === '&&' ? notExp : function(x) {
    return x;
  };
  return function(exp, env, shiftStmtInfo) {
    var ifStmt, leftExp, leftStmt, leftVar, resultVar, rightExp, rightStmt, stmt, _ref3, _ref4, _ref5;
    _ref3 = transformExpressionSequence(exp.slice(2, 4), env, shiftStmtInfo), (_ref4 = _ref3[0], leftStmt = _ref4[0], leftExp = _ref4[1]), (_ref5 = _ref3[1], rightStmt = _ref5[0], rightExp = _ref5[1]);
    if (!rightStmt) {
      return [leftStmt, ['binary!', exp[1], leftExp, rightExp]];
    }
    leftVar = env.ssaVar('x');
    resultVar = env.ssaVar('t');
    ifStmt = ['if', testFn(leftVar), ['=', resultVar, leftVar], begin([rightStmt, ['=', resultVar, rightExp]])];
    stmt = begin([leftStmt, ['var', leftVar], ['=', leftVar, leftExp], ['var', resultVar], ifStmt]);
    return [stmt, resultVar];
  };
};

transformReturnThrowExpression = function(exp, env, shiftStmtInfo) {
  var expStmt, valueExp, _ref3;
  _ref3 = transformExpression(exp[1], env, shiftStmtInfo), expStmt = _ref3[0], valueExp = _ref3[1];
  shiftStmtInfo.polluted = true;
  return [begin([expStmt, [exp[0], valueExp]]), undefinedExp];
};

transformExpressionFnMap = {
  'index!': function(exp, env, shiftStmtInfo) {
    var es, stmt, t, _ref3;
    _ref3 = transformExpressionList(exp.slice(1), env, shiftStmtInfo), stmt = _ref3[0], es = _ref3[1];
    return [begin(stmt, ['var', (t = env.ssaVar('t'))], ['=', t, [exp[0]].concat(__slice.call(es))]), t];
  },
  'attribute!': function(exp, env, shiftStmtInfo) {
    var objExp, stmt, t, _ref3;
    _ref3 = transformExpression(exp[1], env, shiftStmtInfo), stmt = _ref3[0], objExp = _ref3[1];
    return [begin(stmt, ['var', (t = env.ssaVar('t'))], ['=', t, [exp[0], objExp, exp[2]]]), t];
  },
  'prefix!': function(exp, env, shiftStmtInfo) {
    var e, stmt, _ref3;
    _ref3 = transformExpression(exp[2], env, shiftStmtInfo), stmt = _ref3[0], e = _ref3[1];
    return [stmt, [PREFIX, exp[1], e]];
  },
  'binary!': function(exp, env, shiftStmtInfo) {
    var leftExp, leftStmt, result, rightExp, rightStmt, _ref3, _ref4;
    if (exp[1] === '||' || exp[1] === '&&') {
      return transformAndOrExpression(exp, env, shiftStmtInfo);
    }
    result = transformExpressionSequence(exp.slice(2, 4), env, shiftStmtInfo);
    (_ref3 = result[0], leftStmt = _ref3[0], leftExp = _ref3[1]), (_ref4 = result[1], rightStmt = _ref4[0], rightExp = _ref4[1]);
    return [begin([leftStmt, rightStmt]), ['binary!', exp[1], leftExp, rightExp]];
  },
  '=': function(exp, env, shiftStmtInfo) {
    var exp1, leftExp, leftStmt, rightExp, rightStmt, t, _ref3, _ref4, _ref5, _ref6;
    exp1 = exp[1];
    if (exp1.kind === SYMBOL) {
      _ref3 = transformExpression(exp[2], env, shiftStmtInfo), rightStmt = _ref3[0], rightExp = _ref3[1];
      if (shiftStmtInfo.affect(exp1.value)) {
        return [begin([rightStmt, ['var', (t = env.ssaVar('t'))], ['=', t, rightExp], ['=', exp1, t]]), t];
      } else if (hasOwnProperty.call(shiftStmtInfo.vars, exp1.value)) {
        return [begin([rightStmt, ['=', exp1, rightExp]]), exp1];
      } else {
        return [rightStmt, ['=', exp1, rightExp]];
      }
    } else {
      _ref4 = transformExpressionSequence(exp.slice(1, 3), env, shiftStmtInfo), (_ref5 = _ref4[0], leftStmt = _ref5[0], leftExp = _ref5[1]), (_ref6 = _ref4[1], rightStmt = _ref6[0], rightExp = _ref6[1]);
      return [begin([leftStmt, rightStmt, ['var', (t = env.ssaVar('t'))], ['=', t, rightExp], ['=', leftExp, t]]), t];
    }
  },
  'list!': function(exp, env, shiftStmtInfo) {
    var args, argsStmts, argsValues, e, _i, _len, _ref3;
    _ref3 = transformExpressionList(exp.slice(1), env, shiftStmtInfo), argsStmts = _ref3[0], argsValues = _ref3[1];
    args = [];
    for (_i = 0, _len = argsValues.length; _i < _len; _i++) {
      e = argsValues[_i];
      if (e === commentPlaceholder) {
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
    var e, stmt, t, _ref3;
    _ref3 = transformExpression(exp[1], env, shiftStmtInfo), stmt = _ref3[0], e = _ref3[1];
    return [begin([['var', t = env.ssaVar('t')], stmt, ['=', t, [NEW, e]]]), t];
  },
  'return': transformReturnThrowExpression,
  'throw': transformReturnThrowExpression,
  'var': function(exp, env, shiftStmtInfo) {
    var metaVar, variable;
    if (exp[1] instanceof Array) {
      env = env.outerVarScopeEnv();
      metaVar = exp[1][1];
      variable = metaVar + (env.getSymbolIndex(metaVar) || '');
      return [['var', variable], variable];
    } else {
      return [exp, undefinedExp];
    }
  },
  'label!': function(exp, env, shiftStmtInfo) {
    var e, stmt, _ref3;
    _ref3 = transformExpression(exp[1], env, shiftStmtInfo), stmt = _ref3[0], e = _ref3[1];
    return [[LABEL, stmt], e];
  },
  'noop!': function(exp, env, shiftStmtInfo) {
    return [exp, undefinedExp];
  },
  'jsvar!': function(exp, env, shiftStmtInfo) {
    var stmt, t;
    if (shiftStmtInfo.affect(exp[1].value)) {
      stmt = begin([['var', t = env.ssaVar('t')], ['=', t, exp[1]]]);
      stmt.vars = {};
      stmt[exp[1].value] = true;
      return [stmt, t];
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
  'call!': function(exp, env, shiftStmtInfo) {
    var args, argsStmts, argsValues, callerStmt, callerValue, e, t, _i, _len, _ref3, _ref4;
    _ref3 = transformExpressionList(exp[2], env, shiftStmtInfo), argsStmts = _ref3[0], argsValues = _ref3[1];
    shiftStmtInfo.addEffect(argsStmts);
    _ref4 = transformExpression(exp[1], env, shiftStmtInfo), callerStmt = _ref4[0], callerValue = _ref4[1];
    args = [];
    for (_i = 0, _len = argsValues.length; _i < _len; _i++) {
      e = argsValues[_i];
      if (e === commentPlaceholder) {
        continue;
      } else {
        args.push(e);
      }
    }
    return [begin([callerStmt, argsStmts, ['var', (t = env.ssaVar('t'))], ['=', t, [CALL, callerValue, argsValues]]]), t];
  },
  'function': function(exp, env, shiftStmtInfo) {
    env = exp.env;
    exp = ['function', exp[1], transform(exp[2], env)];
    exp.env = env;
    return [undefinedExp, exp];
  },
  'begin!': function(exp, env, shiftStmtInfo) {
    var e, stms, stmt, stmts, _i, _len, _ref3, _ref4, _ref5;
    if (exp.length === 0) {
      return [undefinedExp, undefinedExp];
    }
    stmts = [];
    _ref3 = exp.slice(1, exp.length - 1);
    for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
      e = _ref3[_i];
      _ref4 = transformExpression(e, env, shiftStmtInfo.copy()), stmt = _ref4[0], e = _ref4[1];
      stmts.push(stmt);
      stmts.push(e);
    }
    _ref5 = transformExpression(exp[exp.length - 1], env, shiftStmtInfo), stmt = _ref5[0], e = _ref5[1];
    stmts.push(stmt);
    stms = begin(stmts);
    return [stms, e];
  },
  'if': function(exp, env, shiftStmtInfo) {
    var elseExp, elseInfo, ifStmt, resultVar, stmtElse, stmtTest, stmtThen, testExp, testInfo, thenExp, thenInfo, _ref3, _ref4, _ref5;
    _ref3 = transformExpression(exp[1], env, testInfo = shiftStmtInfo.copy()), stmtTest = _ref3[0], testExp = _ref3[1];
    _ref4 = transformExpression(exp[2], env, thenInfo = shiftStmtInfo.copy()), stmtThen = _ref4[0], thenExp = _ref4[1];
    _ref5 = transformExpression(exp[3], env, elseInfo = shiftStmtInfo.copy()), stmtElse = _ref5[0], elseExp = _ref5[1];
    if (testInfo.polluted || thenInfo.polluted || elseInfo.polluted) {
      shiftStmtInfo.polluted = true;
    }
    resultVar = env.ssaVar('t');
    ifStmt = ['if', testExp, begin([stmtThen, ['=', resultVar, thenExp]]), begin([stmtElse, ['=', resultVar, elseExp]])];
    return [begin([stmtTest, ['var', resultVar], ifStmt]), resultVar];
  },
  'while': function(exp, env, shiftStmtInfo) {
    var bodyStmt, bodyValue, expTest, lst, stmtTest, whileStmt, _ref3, _ref4;
    lst = env.newVar('list');
    _ref3 = transformExpression(exp[1], env, shiftStmtInfo), stmtTest = _ref3[0], expTest = _ref3[1];
    _ref4 = transformExpression(exp[2], env, shiftStmtInfo), bodyStmt = _ref4[0], bodyValue = _ref4[1];
    if (stmtTest) {
      whileStmt = ['while', 1, begin([stmtTest, ['if', notExp(expTest), [BREAK]], bodyStmt, pushExp(lst, bodyValue)])];
    } else {
      whileStmt = ['while', expTest, begin([bodyStmt, pushExp(lst, bodyValue)])];
    }
    return [begin([['var', lst], ['=', lst, []], whileStmt]), lst];
  },
  'jsForIn!': function(exp, env, shiftStmtInfo) {
    var bodyStmt, bodyValue, forInStmt, lst, rangeStmt, rangeValue, _ref3, _ref4;
    lst = env.newVar('list');
    _ref3 = transformExpression(exp[2], env, shiftStmtInfo), rangeStmt = _ref3[0], rangeValue = _ref3[1];
    _ref4 = transformExpression(exp[3], env, shiftStmtInfo), bodyStmt = _ref4[0], bodyValue = _ref4[1];
    forInStmt = ['jsForIn!', exp[1], rangeValue, begin([bodyStmt, pushExp(lst, bodyValue)])];
    return [begin([['var', lst], ['=', lst, [LIST]], rangeStmt, forInStmt]), lst];
  },
  'try': function(exp, env, shiftStmtInfo) {
    var bodyInfo, bodyStmt, bodyValue, catchAction, catchInfo, finallyAction, finallyInfo, _ref3;
    _ref3 = transformExpression(exp[1], env, bodyInfo = shiftStmtInfo.copy()), bodyStmt = _ref3[0], bodyValue = _ref3[1];
    catchAction = transform(exp[3], env, catchInfo = shiftStmtInfo.copy());
    finallyAction = transform(exp[4], env, finallyInfo = shiftStmtInfo.copy());
    if (bodyInfo.polluted || finallyInfo.polluted || finallyInfo.polluted) {
      shiftStmtInfo.polluted = true;
    }
    return [['try!', bodyStmt, exp[2], catchAction, finallyAction], bodyValue];
  }
};

statementHeadMap = {
  'break': 1,
  'continue': 1,
  'switch': 1,
  'try': 1,
  'throw': 1,
  'return': 1,
  'jsForIn!': 1,
  'forOf!': 1,
  'cFor!': 1,
  'while': 1,
  'doWhile!': 1,
  'letloop': 1,
  'with': 1,
  'var': 1,
  'label!': 1,
  'function': 1
};

exports.toExpression = toExpression = function(exp) {
  var e, i, _i, _len;
  if (exp instanceof Array) {
    if (statementHeadMap[exp[0]]) {
      return false;
    }
    for (i = _i = 0, _len = exp.length; _i < _len; i = ++_i) {
      e = exp[i];
      if (i === 0) {
        continue;
      }
      if (!toExpression(e)) {
        return false;
      }
    }
    exp.asExpression = true;
    return true;
  } else {
    return true;
  }
};

exports.transformExpression = transformExpression = function(exp, env, shiftStmtInfo) {
  var result, stmt, t;
  switch (exp.kind) {
    case VALUE:
      return [undefinedExp, exp];
    case SYMBOL:
      if (exp.ssa) {
        return [undefinedExp, exp];
      } else if (shiftStmtInfo.affect(exp.value)) {
        stmt = begin([['var', t = env.ssaVar('t')], ['=', t, exp]]);
        stmt.vars = [exp.value];
        return [stmt, t];
      } else {
        return [undefinedExp, exp];
      }
      break;
    default:
      assert(exp instanceof Array, 'wrong kind of expression while transformExpression');
      if (toExpression(exp)) {
        if (shiftStmtInfo.affectExp(exp)) {
          stmt = begin([['var', t = env.ssaVar('t')], ['=', t, exp]]);
          stmt.vars = exp.vars;
          return [stmt, t];
        } else {
          return [undefinedExp, exp];
        }
      }
      assert(transformExpressionFnMap[symbolOf(exp[0])], 'no transformExpressionFnMap for ' + str(exp));
      result = transformExpressionFnMap[symbolOf(exp[0])](exp, env, shiftStmtInfo);
      return result;
  }
};

transformExpressionSequence = function(exps, env, shiftStmtInfo) {
  var i, result, stmtExp;
  result = [];
  i = exps.length;
  while (--i >= 0) {
    stmtExp = transformExpression(exps[i], env, shiftStmtInfo);
    result.unshift(stmtExp);
    if (i > 0) {
      shiftStmtInfo.addEffect(stmtExp[0]);
    }
  }
  return result;
};

transformExpressionList = function(exps, env, shiftStmtInfo, shifted) {
  var e, es, exp, i, stmt, stmts, _ref3;
  stmts = [];
  es = [];
  i = exps.length;
  while (--i >= 0) {
    exp = exps[i];
    _ref3 = transformExpression(exp, env, shiftStmtInfo, shifted), stmt = _ref3[0], e = _ref3[1];
    stmts.unshift(stmt);
    es.unshift(e);
    if (i > 0) {
      shiftStmtInfo.addEffect(stmt);
    }
  }
  return [begin(stmts), es];
};

transformFnMap = {
  'debugger': function(exp, env) {
    return exp;
  },
  'break': function(exp, env) {
    return exp;
  },
  'quote!': function(exp, env) {
    return exp;
  },
  'regexp!': function(exp, env) {
    return exp;
  },
  'continue': function(exp, env) {
    return exp;
  },
  'label!': function(exp, env, shiftStmtInfo) {
    return [LABEL, exp[1], transform(exp[2], env)];
  },
  'noop!': function(exp, env) {
    return exp;
  },
  'begin!': function(exp, env) {
    var e, stmts, _i, _len, _ref3;
    stmts = [];
    _ref3 = exp.slice(1);
    for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
      e = _ref3[_i];
      stmts.push(transform(e, env));
    }
    return begin(stmts);
  },
  'if': function(exp, env) {
    var stmtTest, testExp, _ref3;
    _ref3 = transformExpression(exp[1], env, new ShiftStatementInfo({}, {})), stmtTest = _ref3[0], testExp = _ref3[1];
    return begin([stmtTest, ['if', testExp, transform(exp[2], env), transform(exp[3], env)]]);
  },
  'while': function(exp, env) {
    var bodyStmt, stmt, testExp, _ref3;
    _ref3 = transformExpression(exp[1], env, new ShiftStatementInfo({}, {})), stmt = _ref3[0], testExp = _ref3[1];
    bodyStmt = transform(exp[2], env);
    if (stmt) {
      return ['while', 1, begin([stmt, ['if', notExp(testExp), [BREAK]], bodyStmt])];
    } else {
      return ['while', testExp, bodyStmt];
    }
  },
  'jsForIn!': function(exp, env) {
    var hashExp, stmt, _ref3;
    _ref3 = transformExpression(exp[2], env, new ShiftStatementInfo({}, {})), stmt = _ref3[0], hashExp = _ref3[1];
    if (stmt) {
      return ['begin!', stmt, ['jsForIn!', exp[1], hashExp, transform(exp[3], env)]];
    } else {
      return ['jsForIn!', exp[1], hashExp, transform(exp[3], env)];
    }
  },
  'try': function(exp, env) {
    return ['try!', transform(exp[1], env), exp[2], transform(exp[3], env), transform(exp[4], env)];
  }
};

exports.transform = transform = function(exp, env) {
  var fn, result;
  if (exp.transformed) {
    return exp;
  }
  if (exp instanceof Array) {
    trace('transform: ', str(exp));
    if ((fn = transformFnMap[exp[0]])) {
      result = fn(exp, env);
    } else {
      result = begin(transformExpression(exp, env, new ShiftStatementInfo({}, {})));
    }
    result.transformed = true;
    return result;
  } else {
    exp.transformed = true;
    return exp;
  }
};
