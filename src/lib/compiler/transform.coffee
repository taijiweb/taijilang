{str, extend, begin, pushExp, notExp, norm, undefinedExp, entity, wrapInfo1, constant, assert, hasOwnProperty, commentPlaceholder} = require '../utils'
{assignVarsOf, varsOf, pollutedOf} = require './helper'

{VALUE, SYMBOL, LIST} = constant

# todo: keep the env of the function definition expression to optimization phase

exports.ShiftStatementInfo = class ShiftStatementInfo
  # @polluted: if polluted, it means important side effects has happened and be moved to previous statement
  # then all exp and variable will be affected, variable must be referenced by temporary variable.
  # @assignVars: assigned variables occured in the shifted statements
  # @vars: all variables accured in the shifted statements, ssa variable(single assigned variable) is not considered.
  constructor: (@assignVars, @vars, @polluted) ->

  polluteOrAssign: (name) -> @polluted or hasOwnProperty.call(@assignVars, name)

  addEffect: (stmt) ->
    if @polluted then return
    if pollutedOf(stmt) then @polluted = true; return
    extend(@assignVars, assignVarsOf(stmt))
    extend(@vars, varsOf(stmt))
    return

  copy: ->
    if @polluted then return @
    else new ShiftStatementInfo(extend({}, @assignVars), extend({}, @vars))

  # used by if statement
  merge: (shiftStmtInfoList...) ->
    if @polluted then return @
    for shiftStmtInfo in shiftStmtInfoList
      if shiftStmtInfo.polluted then @polluted = true; return @
    for shiftStmtInfo in shiftStmtInfoList
      for name of shiftStmtInfo.assignVars
        if hasOwnProperty.call(shiftStmtInfo.assignVars, name)
          @assignVars[name] = true
      for name of shiftStmtInfo.vars
        if hasOwnProperty.call(shiftStmtInfo.vars, name)
          @vars[name] = true
    @

transformAndOrExpression = (op) ->
  # short circuit evaluation
  testFn = if op=='&&' then notExp else (x) -> x
  (exp, env, shiftStmtInfo) ->
    [[leftStmt, leftExp], [rightStmt, rightExp]] = transformExpressionSequence(exp[2..3], env, shiftStmtInfo)
    if not rightStmt then return [leftStmt, [norm('binary!'), exp[1], leftExp, rightExp]]
    leftVar=env.ssaVar('x'); resultVar=env.ssaVar('t')
    ifStmt = norm ['if', testFn(leftVar),
              ['=', resultVar, leftVar],
              begin([ rightStmt, ['=', resultVar, rightExp]])]
    stmt =  begin(norm [leftStmt,
      ['var', leftVar], ['=', leftVar, leftExp],
      ['var', resultVar]
      ifStmt])
    norm [stmt, resultVar]

transformReturnThrowExpression = (exp, env, shiftStmtInfo) ->
  [expStmt, valueExp] = transformExpression(exp[1], env, shiftStmtInfo)
  # the exprssion after return or throw has no effects.
  [begin([expStmt, norm([exp[0], valueExp])]), undefinedExp]

transformExpressionFnMap =
  'directLineComment!': (exp, env, shiftStmtInfo) -> [exp, commentPlaceholder] # error 'direct line comment should not been here'
  'directCBlockComment!': (exp, env, shiftStmtInfo) -> [exp, commentPlaceholder]  #error 'direct line comment should not been here'

  'string!': (exp, env, shiftStmtInfo) ->
     [stmt, es] = transformExpressionList(exp[1...], env, shiftStmtInfo)
     if es[0].kind==VALUE then str = es[0]
     else str = norm ['call!', ['attribute!', ['jsvar!', 'JSON'], 'stringify'], [es[0]]]
     for e in es[1...]
       if e.kind==VALUE then str = ['binary!', '+', str, e]
       else str = norm ['binary!', '+', str, ['call!', ['attribute!', ['jsvar!', 'JSON'], 'stringify'], [e]]]
     [stmt,  str]

  'index!': (exp, env, shiftStmtInfo) ->
    [stmt, es] = transformExpressionList(exp[1...], env, shiftStmtInfo)
    [begin(stmt,  ['var', (t=env.ssaVar('t'))], ['=', t, [exp[0], es...]]), t]

  'attribute!': (exp, env, shiftStmtInfo) ->
    [stmt, objExp] = transformExpression(exp[1], env, shiftStmtInfo)
    [begin(stmt,  ['var', (t=env.ssaVar('t'))], ['=', t, [exp[0], objExp, exp[2]]]), t]

  # '++' '--' should be excluded in converting phase
  'prefix!': (exp, env, shiftStmtInfo) ->
    # without ++ and --, all prefix! in js has no side effects.
    [stmt, e] = transformExpression(exp[2], env, shiftStmtInfo)
    [stmt, ['prefix!', exp[1], e]]

  'binary!': (exp, env, shiftStmtInfo) ->
    # short circuit evaluation
    if exp[1]=='||'  or exp[1]=='&&' then return transformAndOrExpression(exp, env, shiftStmtInfo)
    result = transformExpressionSequence(exp[2..3], env, shiftStmtInfo)
    [[leftStmt, leftExp], [rightStmt, rightExp]] = result
    # in js, it can be assured that all binary operator has no effects
    # in python, this must be rethought.
    norm [begin([leftStmt, rightStmt]),  [norm('binary!'), exp[1], leftExp, rightExp]]

  '=': (exp, env, shiftStmtInfo) ->
    exp1 = exp[1] # left
    if exp1.kind==SYMBOL
      [rightStmt, rightExp] = transformExpression(exp[2], env, shiftStmtInfo)
      if shiftStmtInfo.polluteOrAssign(exp1.value)
        [begin([rightStmt, ['var', (t=env.ssaVar('t'))], ['=', t, rightExp], ['=', exp1, t]]), t]
      else if hasOwnProperty.call(shiftStmtInfo.vars, exp1.value)
        [begin([rightStmt, ['=', exp1, rightExp]]), exp1]
      else [rightStmt, ['=', exp1, rightExp]]
    else
      # a.x = 1; b[2] = 3, ...
      [[leftStmt, leftExp], [rightStmt, rightExp]] = transformExpressionSequence(exp[1..2], env, shiftStmtInfo)
      [begin([leftStmt, rightStmt, ['=', leftExp, rightExp], ], ['var', (t=env.ssaVar('t'))], ['=', t, leftExp]), t]

  'list!':(exp, env, shiftStmtInfo) ->
    [argsStmts, argsValues] = transformExpressionList(exp[1...], env, shiftStmtInfo)
    args = []
    for e in argsValues
      if e==commentPlaceholder then continue
      else args.push e
    [argsStmts, ['list!'].concat(args)]

  'debugger': (exp, env, shiftStmtInfo) -> [exp, undefinedExp]

  # {break label} and {continue label}
  'break': (exp, env, shiftStmtInfo) -> [exp, undefinedExp]

  'continue': (exp, env, shiftStmtInfo) -> [exp, undefinedExp]

  'quote!': (exp, env, shiftStmtInfo) -> [undefinedExp, exp]

  'regexp!': (exp, env, shiftStmtInfo) -> [undefinedExp, exp]

  'new': (exp, env, shiftStmtInfo) ->
    # [new X] should be converted to standardized form [new [call X []]]
    [stmt, e] = transformExpression(exp[1], env, shiftStmtInfo)
    [begin([['var', t=env.ssaVar('t')], stmt, ['=', t, ['new', e]]]), t]

  'return': transformReturnThrowExpression

  'throw': transformReturnThrowExpression

  'var': (exp, env, shiftStmtInfo) ->
    if exp[1] instanceof Array
      # metaVar? wtf?
      env = env.outerVarScopeEnv()
      metaVar = exp[1][1]
      variable = metaVar+(env.getSymbolIndex(metaVar) or '')
      [['var', variable], variable]
    else [exp, undefinedExp]

  'label!': (exp, env, shiftStmtInfo) ->
    [stmt, e] = transformExpression(exp[1], env, shiftStmtInfo)
    [['label!', stmt], e]

  'noop!': (exp, env, shiftStmtInfo) -> [exp, undefinedExp]

  'jsvar!': (exp, env, shiftStmtInfo) ->
    if shiftStmtInfo.polluteOrAssign(entity(exp[1]))
      stmt = begin([['var', t=env.ssaVar('t')], ['=', t, exp[1]]])
      stmt.vars = {}; stmt[exp[1].value] = true
      [stmt, t]
    else [undefinedExp, exp]
  '@@': (exp, env, shiftStmtInfo) ->
    env = env.outerVarScopeEnv()
    metaVar = exp[1][1]
    variable = metaVar+(env.getSymbolIndex(metaVar) or '')
    [undefinedExp, variable]
  'metaConvertVar!':(exp, env, shiftStmtInfo) ->
    variable = exp[1]+(env.getSymbolIndex(exp[1]) or '')
    [undefinedExp, variable]

  'hash!': (exp, env, shiftStmtInfo) ->
    [stmt, e] = transformExpressionList(exp[1], env, shiftStmtInfo)
    [stmt, ['hash!', e]]

  'hashitem!': (exp, env, shiftStmtInfo) ->
    [stmt, e] = transformExpression(exp[2], env, shiftStmtInfo)
    [stmt, ['hashitem!', exp[1], e]]

  'call!': (exp, env, shiftStmtInfo) ->
    [argsStmts, argsValues] = transformExpressionList(exp[2], env, shiftStmtInfo)
    shiftStmtInfo.addEffect(argsStmts)
    [callerStmt, callerValue] = transformExpression(exp[1], env, shiftStmtInfo)
    args = []
    for e in argsValues
      if e==commentPlaceholder then continue
      else args.push e
    [begin([callerStmt, argsStmts, ['var', (t=env.ssaVar('t'))],  ['=', t, ['call!', callerValue, argsValues]]]), t]

  'function': (exp, env, shiftStmtInfo) ->
    env = exp.env
    exp = ['function', exp[1], transform(exp[2], env)]
    exp.env = env
    [undefinedExp, exp]

  'begin!': (exp, env, shiftStmtInfo) ->
    if exp.length==0 then return [undefinedExp, undefinedExp]
    stmts = []
    for e in exp[1...exp.length-1]
      [stmt, e] = transformExpression(e, env, shiftStmtInfo.copy())
      stmts.push stmt; stmts.push e
    # the last exp in begin
    [stmt, e] = transformExpression(exp[exp.length-1], env, shiftStmtInfo)
    stmts.push stmt
    stms = begin(stmts)
    stmts.assignVars = assignVars; stmts.vars = vars
    [stms, e]

  'if': (exp, env, shiftStmtInfo) ->
    # before transforming, if expression should be standized as [if test then else]
    [stmtTest, testExp] = transformExpression(exp[1], env, shiftStmtInfo.copy())
    [stmtThen, thenExp] = transformExpression(exp[2], env, shiftStmtInfo.copy())
    [stmtElse, elseExp] = transformExpression(exp[3], env, shiftStmtInfo.copy())
    resultVar = env.ssaVar('t')
    ifStmt = ['if', testExp,
              begin([stmtThen, ['=', resultVar, thenExp]]),
              begin([stmtElse, ['=', resultVar, elseExp]])]
    [begin([stmtTest, ['var', resultVar], ifStmt]), resultVar]

  'while': (exp, env, shiftStmtInfo) ->
    lst = env.newVar('list')
    [stmtTest, expTest] = transformExpression(exp[1], env, shiftStmtInfo)
    [bodyStmt, bodyValue] = transformExpression(exp[2], env, shiftStmtInfo)
    if stmtTest
      whileStmt = ['while', 1,
                 begin([stmtTest,
                        ['if', notExp(expTest), 'break'],
                        bodyStmt,
                        pushExp(lst, bodyValue)])]
    else
      whileStmt = ['while', expTest,
                   begin([bodyStmt,
                          pushExp(lst, bodyValue)])]
    [begin([['var', lst], ['=', lst, []], whileStmt]), lst]

  'doWhile!': (exp, env, shiftStmtInfo) ->
    lst = env.newVar('list')
    [bodyStmt, bodyValue] = transformExpression(exp[1], env, shiftStmtInfo)
    [stmt, e] = transformExpression(exp[1], env, shiftStmtInfo)
    doWhileStmt = ['doWhile!',
                  begin([
                    bodyStmt,
                    pushExp(lst, bodyValue),
                    stmt]),
                  e]
    [begin([['var', lst], doWhileStmt]), lst]

  'jsForIn!': (exp, env, shiftStmtInfo) ->
    lst = env.newVar('list')
    # do not transform exp[1], because it must be [var name] or name
    #[varStmt, varName] = transformExpression(exp[1], env, shiftStmtInfo)
    [rangeStmt, rangeValue] = transformExpression(exp[2], env, shiftStmtInfo)
    [bodyStmt, bodyValue] = transformExpression(exp[3], env, shiftStmtInfo)
    # exp[0]: forIn! or forOf!
    forInStmt = ['jsForIn!', exp[1], rangeValue,
                 begin([bodyStmt, pushExp(lst, bodyValue)])]
    [begin([['var', lst], ['=', lst, ['list!']], rangeStmt, forInStmt]), lst]

  # javascript has no for key of hash {...}
  #'forOf!': transformForInExpression

  'cFor!': (exp, env, shiftStmtInfo) ->
    lst = env.newVar('list')
    [initStmt, initValue] = transformExpression(exp[1], env, shiftStmtInfo)
    [testStmt, testValue] = transformExpression(exp[2], env, shiftStmtInfo)
    [stepStmt, stepValue] = transformExpression(exp[3], env, shiftStmtInfo)
    [bodyStmt, bodyValue] = transformExpression(exp[4], env, shiftStmtInfo)
    cForStmt = ['cFor!', initValue, undefinedExp, undefinedExp,
                begin([testStmt,
                        ['if', notExp(testValue), ['break']],
                        bodyStmt,
                        pushExp(lst, bodyValue),
                        stepStmt])]

    [begin([initStmt, ['var', lst], cForStmt]), lst]

  'try': (exp, env, shiftStmtInfo) ->
    [bodyStmt, bodyValue] = transformExpression(exp[1], env, shiftStmtInfo.copy())
    catchAction = transform(exp[3], env, shiftStmtInfo.copy())
    finallyAction = transform(exp[4], env, shiftStmtInfo.copy())
    [['try', bodyStmt, exp[2], catchAction, finallyAction], bodyValue]

  # [switch test [[v, v, ...] clause] default]
  'switch': (exp, env, shiftStmtInfo) ->
    exp2 = exp[2]; cases =  []; i = exp2.length
    while --i>=0
      e = exp2[i]; e0 = e[0]; caseValues = []; j = e0.length
      while --j>=0
        x = e0[j]
        caseValues.unshift [stmt, x1] = transformExpression(x, env, shiftStmtInfo.copy())
      cases.unshift [caseValues, transformExpression(e[1], env, shiftStmtInfo.copy())]
    if exp3=exp[3]
      [defaultStmt, defaultValue] = transformExpression(exp3, env, shiftStmtInfo.copy())
    [testStmt, testValue] = transformExpression(exp[1], env, shiftStmtInfo.copy())
    resultVar = env.ssaVar('t');
    if stmt00=cases[0][0][0][0] then testStmt = begin([testStmt, stmt00])
    resultCases = for [caseValues, action] in cases
      values = for stmtExp in caseValues then stmtExp[1]
      [values, begin([action[0], ['=', resultVar, action[1]], ['break']])]
    switchStmt = ['switch', testValue, resultCases, begin([defaultStmt, ['=', resultVar, defaultValue]])]
    [begin([testStmt, switchStmt]), resultVar]

exports.transformExpression = transformExpression = (exp, env, shiftStmtInfo) ->
  switch exp.kind
    when VALUE then  [undefinedExp, exp]
    when SYMBOL
      if exp.ssa then return [undefinedExp, exp]
      else if shiftStmtInfo.polluteOrAssign(exp.value)
        stmt = begin([norm(['var', t=env.ssaVar('t')]), norm(['=', t, exp])])
        stmt.vars = [exp.value]
        return [stmt, t]
      else return [undefinedExp, exp]
    when LIST
      assert transformExpressionFnMap[exp[0].value]
      result = transformExpressionFnMap[exp[0].value](exp, env, shiftStmtInfo)
      # result is in form [stmt, exp], now add the effects of stmt, which will be shifted ahead.
      return result

# used by binary!, =, augmentAssign, result in sequence need to be processed independently
transformExpressionSequence = (exps, env, shiftStmtInfo) ->
  result = []
  i = exps.length
  while --i>=0  # >=0 is necessary, else will missing the run on i==0
    exp = exps[i]
    result.unshift (stmtExp = transformExpression exp, env, shiftStmtInfo)
    if i>0 then shiftStmtInfo.addEffect(stmtExp[0])
  result

# different from above, stmts is merged by begin and es is merged to a list.
transformExpressionList = (exps, env, shiftStmtInfo, shifted) ->
  stmts = []; es = []
  i = exps.length
  while --i>=0 # >=0 is necessary, else will missing the run on i==0
    exp = exps[i]
    [stmt, e] = transformExpression exp, env, shiftStmtInfo, shifted
    stmts.unshift stmt; es.unshift e
    if i>0 then shiftStmtInfo.addEffect(stmtExp[0])
  [begin(stmts), es]

transformFnMap =
  'debugger': (exp, env) -> exp
  'break': (exp, env) -> exp
  'quote!': (exp, env) -> exp
  'regexp!': (exp, env) -> exp
  'continue': (exp, env) -> exp
  'label!': (exp, env, shiftStmtInfo) -> ['label!', exp[1], transform(exp[2], env)]
  'noop!': (exp, env) -> exp
  'directLineComment!': (exp, env) -> exp
  'directCBlockComment!': (exp, env) -> exp

  'begin!': (exp, env) ->
    stmts = []
    for e in exp[1...]
      stmts.push transform(e, env)
    begin(stmts)

  'if': (exp, env) ->
    [stmtTest, testExp] = transformExpression(exp[1], env, new ShiftStatementInfo({}))
    begin([stmtTest, ['if', testExp, transform(exp[2], env), transform(exp[3], env)]])

  'while': (exp, env) ->
    [stmt, testExp] = transformExpression(exp[1], env, new ShiftStatementInfo({}))
    bodyStmt = transform(exp[2], env)
    if stmt  then ['while', 1, begin([stmt,['if', notExp(testExp), 'break'],bodyStmt])]
    else ['while', testExp, bodyStmt]

  'doWhile!': (exp, env) ->
    [stmt, testExp] = transformExpression(exp[2], env, new ShiftStatementInfo({}))
    ['doWhile!', begin([ transform(exp[1], env), stmt]), testExp]

  # for key in hash {...}
  # [forIn! key hash body]
  'jsForIn!': (exp, env) ->
    [stmt, hashExp] = transformExpression(exp[2], env, new ShiftStatementInfo({}))
    # do not transform exp[1], because it must be [var name] or name
    if stmt then ['begin!', stmt, ['jsForIn!', exp[1], hashExp, transform(exp[3], env)]]
    else ['jsForIn!', exp[1], hashExp, transform(exp[3], env)]

  # javascript has no [for key of hash {...}]
  #'forOf!': transformForInExpression

  'cFor!': (exp, env) ->
    [initStmt, initExp] = transformExpression(exp[1], env, new ShiftStatementInfo({}))
    [testStmt, testExp] = transformExpression(exp[2], env, new ShiftStatementInfo({}))
    [stepStmt, stepExp] = transformExpression(exp[3], env, new ShiftStatementInfo({}))
    body = transform(exp[4], env)
    if isUndefinedExp(testStmt)
      cForStmt = ['cFor!', initExp, testExp, stepExp, begin([body, stepStmt])]
    else
      cForStmt = ['cFor!', initExp, trueExp, stepExp, begin([testStmt, ['if', notExp(testExp), ['break']], body, stepStmt])]
    norm begin([initStmt, cForStmt])

  'try': (exp, env) -> norm ['try', transform(exp[1], env), exp[2], transform(exp[3], env), transform(exp[4], env)]

# todo: we can assure "transformed" of value and symbol always be true in the previous phases.
# so we can simplify this function by removing the first two cases of switch
exports.transform = transform = (exp, env) ->
  # value and symbol should be preset exp.transform = true
  if exp.transformed then return exp
  assert exp.kind==LIST, 'wrong kind of exp: '+str(exp)
  if (fn=transformFnMap[exp[0].value]) then result = fn(exp, env)
  else
    # transformExpression will produce [stmt, e], use begin to merge them
    result = begin transformExpression(exp, env, new ShiftStatementInfo({}))
  result.transformed  = true
  result
