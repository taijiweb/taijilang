var COMMAND, LIST, SYMBOL, ShiftStatementInfo, VALUE, assert, assignVarsOf, begin, commentPlaceholder, compileError, constant, entity, extend, hasOwnProperty, norm, notExp, pollutedOf, pushExp, statementHeadMap, str, toExpression, trace, transform, transformAndOrExpression, transformExpression, transformExpressionFnMap, transformExpressionList, transformExpressionSequence, transformFnMap, transformReturnThrowExpression, undefinedExp, varsOf, wrapInfo1, _ref, _ref1,
  __slice = [].slice;

_ref = require('../utils'), str = _ref.str, extend = _ref.extend, begin = _ref.begin, pushExp = _ref.pushExp, notExp = _ref.notExp, norm = _ref.norm, undefinedExp = _ref.undefinedExp, entity = _ref.entity, wrapInfo1 = _ref.wrapInfo1, constant = _ref.constant, assert = _ref.assert, hasOwnProperty = _ref.hasOwnProperty, commentPlaceholder = _ref.commentPlaceholder, trace = _ref.trace;

_ref1 = require('./helper'), assignVarsOf = _ref1.assignVarsOf, varsOf = _ref1.varsOf, pollutedOf = _ref1.pollutedOf, compileError = _ref1.compileError;

VALUE = constant.VALUE, SYMBOL = constant.SYMBOL, LIST = constant.LIST, COMMAND = constant.COMMAND;

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
    var ifStmt, leftExp, leftStmt, leftVar, resultVar, rightExp, rightStmt, stmt, _ref2, _ref3, _ref4;
    _ref2 = transformExpressionSequence(exp.slice(2, 4), env, shiftStmtInfo), (_ref3 = _ref2[0], leftStmt = _ref3[0], leftExp = _ref3[1]), (_ref4 = _ref2[1], rightStmt = _ref4[0], rightExp = _ref4[1]);
    if (!rightStmt) {
      return [leftStmt, [norm('binary!'), exp[1], leftExp, rightExp]];
    }
    leftVar = env.ssaVar('x');
    resultVar = env.ssaVar('t');
    ifStmt = norm(['if', testFn(leftVar), ['=', resultVar, leftVar], begin([rightStmt, ['=', resultVar, rightExp]])]);
    stmt = begin(norm([leftStmt, ['var', leftVar], ['=', leftVar, leftExp], ['var', resultVar], ifStmt]));
    return norm([stmt, resultVar]);
  };
};

transformReturnThrowExpression = function(exp, env, shiftStmtInfo) {
  var expStmt, valueExp, _ref2;
  _ref2 = transformExpression(exp[1], env, shiftStmtInfo), expStmt = _ref2[0], valueExp = _ref2[1];
  shiftStmtInfo.polluted = true;
  return [begin([expStmt, norm([exp[0], valueExp])]), undefinedExp];
};

transformExpressionFnMap = {
  'directLineComment!': function(exp, env, shiftStmtInfo) {
    return [exp, commentPlaceholder];
  },
  'directCBlockComment!': function(exp, env, shiftStmtInfo) {
    return [exp, commentPlaceholder];
  },
  'string!': function(exp, env, shiftStmtInfo) {
    var e, es, s, stmt, _i, _len, _ref2, _ref3;
    _ref2 = transformExpressionList(exp.slice(1), env, shiftStmtInfo), stmt = _ref2[0], es = _ref2[1];
    if (es[0].kind === VALUE) {
      s = es[0];
    } else {
      s = norm(['call!', ['attribute!', ['jsvar!', 'JSON'], 'stringify'], [es[0]]]);
    }
    _ref3 = es.slice(1);
    for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
      e = _ref3[_i];
      if (e.kind === VALUE) {
        s = norm(['binary!', '+', s, e]);
      } else {
        s = norm(['binary!', '+', s, ['call!', ['attribute!', ['jsvar!', 'JSON'], 'stringify'], [e]]]);
      }
    }
    return [stmt, s];
  },
  'index!': function(exp, env, shiftStmtInfo) {
    var es, stmt, t, _ref2;
    _ref2 = transformExpressionList(exp.slice(1), env, shiftStmtInfo), stmt = _ref2[0], es = _ref2[1];
    return [begin(stmt, ['var', (t = env.ssaVar('t'))], ['=', t, [exp[0]].concat(__slice.call(es))]), t];
  },
  'attribute!': function(exp, env, shiftStmtInfo) {
    var objExp, stmt, t, _ref2;
    _ref2 = transformExpression(exp[1], env, shiftStmtInfo), stmt = _ref2[0], objExp = _ref2[1];
    return [begin(stmt, ['var', (t = env.ssaVar('t'))], ['=', t, [exp[0], objExp, exp[2]]]), t];
  },
  'prefix!': function(exp, env, shiftStmtInfo) {
    var e, stmt, _ref2;
    _ref2 = transformExpression(exp[2], env, shiftStmtInfo), stmt = _ref2[0], e = _ref2[1];
    return [stmt, ['prefix!', exp[1], e]];
  },
  'binary!': function(exp, env, shiftStmtInfo) {
    var leftExp, leftStmt, result, rightExp, rightStmt, _ref2, _ref3;
    if (exp[1] === '||' || exp[1] === '&&') {
      return transformAndOrExpression(exp, env, shiftStmtInfo);
    }
    result = transformExpressionSequence(exp.slice(2, 4), env, shiftStmtInfo);
    (_ref2 = result[0], leftStmt = _ref2[0], leftExp = _ref2[1]), (_ref3 = result[1], rightStmt = _ref3[0], rightExp = _ref3[1]);
    return norm([begin([leftStmt, rightStmt]), [norm('binary!'), exp[1], leftExp, rightExp]]);
  },
  '=': function(exp, env, shiftStmtInfo) {
    var exp1, leftExp, leftStmt, rightExp, rightStmt, t, _ref2, _ref3, _ref4, _ref5;
    exp1 = exp[1];
    if (exp1.kind === SYMBOL) {
      _ref2 = transformExpression(exp[2], env, shiftStmtInfo), rightStmt = _ref2[0], rightExp = _ref2[1];
      if (shiftStmtInfo.affect(exp1.value)) {
        return [begin([rightStmt, [norm('var'), (t = env.ssaVar('t'))], norm(['=', t, rightExp]), norm(['=', exp1, t])]), t];
      } else if (hasOwnProperty.call(shiftStmtInfo.vars, exp1.value)) {
        return [begin([rightStmt, norm(['=', exp1, rightExp])]), exp1];
      } else {
        return [rightStmt, norm(['=', exp1, rightExp])];
      }
    } else {
      _ref3 = transformExpressionSequence(exp.slice(1, 3), env, shiftStmtInfo), (_ref4 = _ref3[0], leftStmt = _ref4[0], leftExp = _ref4[1]), (_ref5 = _ref3[1], rightStmt = _ref5[0], rightExp = _ref5[1]);
      return [begin([leftStmt, rightStmt, norm(['var', (t = env.ssaVar('t'))]), norm(['=', t, rightExp]), norm(['=', leftExp, t])]), t];
    }
  },
  'list!': function(exp, env, shiftStmtInfo) {
    var args, argsStmts, argsValues, e, _i, _len, _ref2;
    _ref2 = transformExpressionList(exp.slice(1), env, shiftStmtInfo), argsStmts = _ref2[0], argsValues = _ref2[1];
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
    var e, stmt, t, _ref2;
    _ref2 = transformExpression(exp[1], env, shiftStmtInfo), stmt = _ref2[0], e = _ref2[1];
    return [begin([['var', t = env.ssaVar('t')], stmt, ['=', t, ['new', e]]]), t];
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
    var e, stmt, _ref2;
    _ref2 = transformExpression(exp[1], env, shiftStmtInfo), stmt = _ref2[0], e = _ref2[1];
    return [['label!', stmt], e];
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
  'metaConvertVar!': function(exp, env, shiftStmtInfo) {
    var variable;
    variable = exp[1] + (env.getSymbolIndex(exp[1]) || '');
    return [undefinedExp, variable];
  },
  'hash!': function(exp, env, shiftStmtInfo) {
    var e, stmt, _ref2;
    _ref2 = transformExpressionList(exp[1], env, shiftStmtInfo), stmt = _ref2[0], e = _ref2[1];
    return [stmt, ['hash!', e]];
  },
  'hashitem!': function(exp, env, shiftStmtInfo) {
    var e, stmt, _ref2;
    _ref2 = transformExpression(exp[2], env, shiftStmtInfo), stmt = _ref2[0], e = _ref2[1];
    return [stmt, ['hashitem!', exp[1], e]];
  },
  'call!': function(exp, env, shiftStmtInfo) {
    var args, argsStmts, argsValues, callerStmt, callerValue, e, t, _i, _len, _ref2, _ref3;
    _ref2 = transformExpressionList(exp[2], env, shiftStmtInfo), argsStmts = _ref2[0], argsValues = _ref2[1];
    shiftStmtInfo.addEffect(argsStmts);
    _ref3 = transformExpression(exp[1], env, shiftStmtInfo), callerStmt = _ref3[0], callerValue = _ref3[1];
    args = [];
    for (_i = 0, _len = argsValues.length; _i < _len; _i++) {
      e = argsValues[_i];
      if (e === commentPlaceholder) {
        continue;
      } else {
        args.push(e);
      }
    }
    return [begin([callerStmt, argsStmts, ['var', (t = env.ssaVar('t'))], ['=', t, ['call!', callerValue, argsValues]]]), t];
  },
  'function': function(exp, env, shiftStmtInfo) {
    env = exp.env;
    exp = norm(['function', exp[1], transform(exp[2], env)]);
    exp.env = env;
    return [undefinedExp, exp];
  },
  'begin!': function(exp, env, shiftStmtInfo) {
    var e, stms, stmt, stmts, _i, _len, _ref2, _ref3, _ref4;
    if (exp.length === 0) {
      return [undefinedExp, undefinedExp];
    }
    stmts = [];
    _ref2 = exp.slice(1, exp.length - 1);
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      e = _ref2[_i];
      _ref3 = transformExpression(e, env, shiftStmtInfo.copy()), stmt = _ref3[0], e = _ref3[1];
      stmts.push(stmt);
      stmts.push(e);
    }
    _ref4 = transformExpression(exp[exp.length - 1], env, shiftStmtInfo), stmt = _ref4[0], e = _ref4[1];
    stmts.push(stmt);
    stms = begin(stmts);
    stmts.assignVars = assignVars;
    stmts.vars = vars;
    return [stms, e];
  },
  'if': function(exp, env, shiftStmtInfo) {
    var elseExp, elseInfo, ifStmt, resultVar, stmtElse, stmtTest, stmtThen, testExp, testInfo, thenExp, thenInfo, _ref2, _ref3, _ref4;
    _ref2 = transformExpression(exp[1], env, testInfo = shiftStmtInfo.copy()), stmtTest = _ref2[0], testExp = _ref2[1];
    _ref3 = transformExpression(exp[2], env, thenInfo = shiftStmtInfo.copy()), stmtThen = _ref3[0], thenExp = _ref3[1];
    _ref4 = transformExpression(exp[3], env, elseInfo = shiftStmtInfo.copy()), stmtElse = _ref4[0], elseExp = _ref4[1];
    if (testInfo.polluted || thenInfo.polluted || elseInfo.polluted) {
      shiftStmtInfo.polluted = true;
    }
    resultVar = env.ssaVar('t');
    ifStmt = ['if', testExp, begin([stmtThen, ['=', resultVar, thenExp]]), begin([stmtElse, ['=', resultVar, elseExp]])];
    return [begin([stmtTest, ['var', resultVar], ifStmt]), resultVar];
  },
  'while': function(exp, env, shiftStmtInfo) {
    var bodyStmt, bodyValue, expTest, lst, stmtTest, whileStmt, _ref2, _ref3;
    lst = env.newVar('list');
    _ref2 = transformExpression(exp[1], env, shiftStmtInfo), stmtTest = _ref2[0], expTest = _ref2[1];
    _ref3 = transformExpression(exp[2], env, shiftStmtInfo), bodyStmt = _ref3[0], bodyValue = _ref3[1];
    if (stmtTest) {
      whileStmt = ['while', 1, begin([stmtTest, ['if', notExp(expTest), 'break'], bodyStmt, pushExp(lst, bodyValue)])];
    } else {
      whileStmt = ['while', expTest, begin([bodyStmt, pushExp(lst, bodyValue)])];
    }
    return [begin([['var', lst], ['=', lst, []], whileStmt]), lst];
  },
  'doWhile!': function(exp, env, shiftStmtInfo) {
    var bodyStmt, bodyValue, doWhileStmt, e, lst, stmt, _ref2, _ref3;
    lst = env.newVar('list');
    _ref2 = transformExpression(exp[1], env, shiftStmtInfo), bodyStmt = _ref2[0], bodyValue = _ref2[1];
    _ref3 = transformExpression(exp[1], env, shiftStmtInfo), stmt = _ref3[0], e = _ref3[1];
    doWhileStmt = ['doWhile!', begin([bodyStmt, pushExp(lst, bodyValue), stmt]), e];
    return [begin([['var', lst], doWhileStmt]), lst];
  },
  'jsForIn!': function(exp, env, shiftStmtInfo) {
    var bodyStmt, bodyValue, forInStmt, lst, rangeStmt, rangeValue, _ref2, _ref3;
    lst = env.newVar('list');
    _ref2 = transformExpression(exp[2], env, shiftStmtInfo), rangeStmt = _ref2[0], rangeValue = _ref2[1];
    _ref3 = transformExpression(exp[3], env, shiftStmtInfo), bodyStmt = _ref3[0], bodyValue = _ref3[1];
    forInStmt = ['jsForIn!', exp[1], rangeValue, begin([bodyStmt, pushExp(lst, bodyValue)])];
    return [begin([['var', lst], ['=', lst, ['list!']], rangeStmt, forInStmt]), lst];
  },
  'cFor!': function(exp, env, shiftStmtInfo) {
    var bodyStmt, bodyValue, cForStmt, initStmt, initValue, lst, stepStmt, stepValue, testStmt, testValue, _ref2, _ref3, _ref4, _ref5;
    lst = env.newVar('list');
    _ref2 = transformExpression(exp[1], env, shiftStmtInfo), initStmt = _ref2[0], initValue = _ref2[1];
    _ref3 = transformExpression(exp[2], env, shiftStmtInfo), testStmt = _ref3[0], testValue = _ref3[1];
    _ref4 = transformExpression(exp[3], env, shiftStmtInfo), stepStmt = _ref4[0], stepValue = _ref4[1];
    _ref5 = transformExpression(exp[4], env, shiftStmtInfo), bodyStmt = _ref5[0], bodyValue = _ref5[1];
    cForStmt = ['cFor!', initValue, undefinedExp, undefinedExp, begin([testStmt, ['if', notExp(testValue), ['break']], bodyStmt, pushExp(lst, bodyValue), stepStmt])];
    return [begin([initStmt, ['var', lst], cForStmt]), lst];
  },
  'try': function(exp, env, shiftStmtInfo) {
    var bodyInfo, bodyStmt, bodyValue, catchAction, catchInfo, finallyAction, finallyInfo, _ref2;
    _ref2 = transformExpression(exp[1], env, bodyInfo = shiftStmtInfo.copy()), bodyStmt = _ref2[0], bodyValue = _ref2[1];
    catchAction = transform(exp[3], env, catchInfo = shiftStmtInfo.copy());
    finallyAction = transform(exp[4], env, finallyInfo = shiftStmtInfo.copy());
    if (bodyInfo.polluted || finallyInfo.polluted || finallyInfo.polluted) {
      shiftStmtInfo.polluted = true;
    }
    return [['try', bodyStmt, exp[2], catchAction, finallyAction], bodyValue];
  },
  'switch': function(exp, env, shiftStmtInfo) {
    var action, caseValues, cases, defaultStmt, defaultValue, e, e0, exp2, exp3, i, info, j, resultCases, resultVar, stmt, stmt00, stmtExp, switchStmt, testStmt, testValue, values, x, x1, _ref2, _ref3, _ref4;
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
        caseValues.unshift((_ref2 = transformExpression(x, env, info = shiftStmtInfo.copy()), stmt = _ref2[0], x1 = _ref2[1], _ref2));
        if (info.polluted) {
          shiftStmtInfo.polluted = true;
        }
      }
      cases.unshift([caseValues, transformExpression(e[1], env, info = shiftStmtInfo.copy())]);
      if (info.polluted) {
        shiftStmtInfo.polluted = true;
      }
    }
    if (exp3 = exp[3]) {
      _ref3 = transformExpression(exp3, env, info = shiftStmtInfo.copy()), defaultStmt = _ref3[0], defaultValue = _ref3[1];
      if (info.polluted) {
        shiftStmtInfo.polluted = true;
      }
    }
    _ref4 = transformExpression(exp[1], env, info = shiftStmtInfo), testStmt = _ref4[0], testValue = _ref4[1];
    resultVar = env.ssaVar('t');
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
    return [begin([testStmt, switchStmt]), resultVar];
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
  'function': 1,
  'string!': 1
};

exports.toExpression = toExpression = function(exp) {
  var e, exp0Value, i, _i, _len;
  switch (exp.kind) {
    case VALUE:
    case SYMBOL:
    case COMMAND:
      return true;
    case LIST:
      exp0Value = exp[0].value;
      if (statementHeadMap[exp0Value]) {
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
    default:
      return compileError(exp, 'toExpression: wrong kind of expression');
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
        stmt = begin([norm(['var', t = env.ssaVar('t')]), norm(['=', t, exp])]);
        stmt.vars = [exp.value];
        return [stmt, t];
      } else {
        return [undefinedExp, exp];
      }
      break;
    case LIST:
      if (toExpression(exp)) {
        if (shiftStmtInfo.affectExp(exp)) {
          stmt = begin([norm(['var', t = env.ssaVar('t')]), norm(['=', t, exp])]);
          stmt.vars = exp.vars;
          return [stmt, t];
        } else {
          return [undefinedExp, exp];
        }
      }
      assert(transformExpressionFnMap[exp[0].value], 'no transformExpressionFnMap for ' + str(exp));
      result = transformExpressionFnMap[exp[0].value](exp, env, shiftStmtInfo);
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
  var e, es, exp, i, stmt, stmts, _ref2;
  stmts = [];
  es = [];
  i = exps.length;
  while (--i >= 0) {
    exp = exps[i];
    _ref2 = transformExpression(exp, env, shiftStmtInfo, shifted), stmt = _ref2[0], e = _ref2[1];
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
    return ['label!', exp[1], transform(exp[2], env)];
  },
  'noop!': function(exp, env) {
    return exp;
  },
  'directLineComment!': function(exp, env) {
    return exp;
  },
  'directCBlockComment!': function(exp, env) {
    return exp;
  },
  'begin!': function(exp, env) {
    var e, stmts, _i, _len, _ref2;
    stmts = [];
    _ref2 = exp.slice(1);
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      e = _ref2[_i];
      stmts.push(transform(e, env));
    }
    return begin(stmts);
  },
  'if': function(exp, env) {
    var stmtTest, testExp, _ref2;
    _ref2 = transformExpression(exp[1], env, new ShiftStatementInfo({}, {})), stmtTest = _ref2[0], testExp = _ref2[1];
    return begin([stmtTest, ['if', testExp, transform(exp[2], env), transform(exp[3], env)]]);
  },
  'while': function(exp, env) {
    var bodyStmt, stmt, testExp, _ref2;
    _ref2 = transformExpression(exp[1], env, new ShiftStatementInfo({}, {})), stmt = _ref2[0], testExp = _ref2[1];
    bodyStmt = transform(exp[2], env);
    if (stmt) {
      return ['while', 1, begin([stmt, ['if', notExp(testExp), 'break'], bodyStmt])];
    } else {
      return ['while', testExp, bodyStmt];
    }
  },
  'doWhile!': function(exp, env) {
    var stmt, testExp, _ref2;
    _ref2 = transformExpression(exp[2], env, new ShiftStatementInfo({}, {})), stmt = _ref2[0], testExp = _ref2[1];
    return ['doWhile!', begin([transform(exp[1], env), stmt]), testExp];
  },
  'jsForIn!': function(exp, env) {
    var hashExp, stmt, _ref2;
    _ref2 = transformExpression(exp[2], env, new ShiftStatementInfo({}, {})), stmt = _ref2[0], hashExp = _ref2[1];
    if (stmt) {
      return ['begin!', stmt, ['jsForIn!', exp[1], hashExp, transform(exp[3], env)]];
    } else {
      return ['jsForIn!', exp[1], hashExp, transform(exp[3], env)];
    }
  },
  'cFor!': function(exp, env) {
    var body, cForStmt, initExp, initStmt, stepExp, stepStmt, testExp, testStmt, _ref2, _ref3, _ref4;
    _ref2 = transformExpression(exp[1], env, new ShiftStatementInfo({}, {})), initStmt = _ref2[0], initExp = _ref2[1];
    _ref3 = transformExpression(exp[2], env, new ShiftStatementInfo({}, {})), testStmt = _ref3[0], testExp = _ref3[1];
    _ref4 = transformExpression(exp[3], env, new ShiftStatementInfo({}, {})), stepStmt = _ref4[0], stepExp = _ref4[1];
    body = transform(exp[4], env);
    if (isUndefinedExp(testStmt)) {
      cForStmt = ['cFor!', initExp, testExp, stepExp, begin([body, stepStmt])];
    } else {
      cForStmt = ['cFor!', initExp, trueExp, stepExp, begin([testStmt, ['if', notExp(testExp), ['break']], body, stepStmt])];
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
  assert(exp.kind === LIST, 'transform: wrong kind: ' + str(exp));
  trace('transform: ', str(exp));
  if ((fn = transformFnMap[exp[0].value])) {
    result = fn(exp, env);
  } else {
    result = begin(transformExpression(exp, env, new ShiftStatementInfo({}, {})));
  }
  result.transformed = true;
  return result;
};
