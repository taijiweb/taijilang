{str, extend, begin, pushExp, notExp, undefinedExp, assert, hasOwnProperty, commentPlaceholder, trace, symbolOf} = require '../utils'
{assignVarsOf, varsOf, pollutedOf, compileError} = require './helper'

{VALUE, SYMBOL

UNDEFINED, BEGIN, IF, PREFIX, SUFFIX, BINARY, WHILE, BREAK, CONTINUE, THROW, RETURN, NEW, FORIN, FOROF, TRY,
SHARP, CURVE_PAIR, PAREN_PAIR, BRACKET_PAIR, LIST$
} = require '../constant'

# todo: keep the env of the function definition expression to optimization phase

exports.ShiftStatementInfo = class ShiftStatementInfo
  # @polluted: if polluted, it means important side effects has happened and be moved to previous statement
  # then all exp and variable will be affected, variable must be referenced by temporary variable.
  # @assignVars: assigned variables occured in the shifted statements
  # @vars: all variables accured in the shifted statements, ssa variable(single assigned variable) is not considered.
  constructor: (@assignVars, @vars, @polluted, @returnThrow) ->

  affect: (name) -> @polluted or hasOwnProperty.call(@assignVars, name)
  affectExp: (exp) ->
    if @polluted then return true
    vars = varsOf(exp)
    for k of vars
      if  hasOwnProperty.call(vars, k) and hasOwnProperty.call(@assignVars, k) then return true
    false

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
    if not rightStmt then return [leftStmt, [BINARY, exp[1], leftExp, rightExp]]
    leftVar=env.ssaVar('x'); resultVar=env.ssaVar('t')
    ifStmt = [IF, testFn(leftVar),
              ['=', resultVar, leftVar],
              begin([ rightStmt, ['=', resultVar, rightExp]])]
    stmt =  begin([leftStmt,
      [VAR, leftVar], ['=', leftVar, leftExp],
      [VAR, resultVar]
      ifStmt])
    [stmt, resultVar]

transformReturnThrowExpression = (exp, env, shiftStmtInfo) ->
  [expStmt, valueExp] = transformExpression(exp[1], env, shiftStmtInfo)
  shiftStmtInfo.polluted = true
  # the exprssion after return or throw has no effects.
  [begin([expStmt, ([exp[0], valueExp])]), undefinedExp]

transformExpressionFnMap =
  'index!': (exp, env, shiftStmtInfo) ->
    [stmt, es] = transformExpressionList(exp[1...], env, shiftStmtInfo)
    [begin(stmt,  [VAR, (t=env.ssaVar('t'))], ['=', t, [exp[0], es...]]), t]

  'attribute!': (exp, env, shiftStmtInfo) ->
    [stmt, objExp] = transformExpression(exp[1], env, shiftStmtInfo)
    [begin(stmt,  [VAR, (t=env.ssaVar('t'))], ['=', t, [exp[0], objExp, exp[2]]]), t]

  # '++' '--' should be excluded in converting phase
  'prefix!': (exp, env, shiftStmtInfo) ->
    # without ++ and --, all prefix! in js has no side effects.
    [stmt, e] = transformExpression(exp[2], env, shiftStmtInfo)
    [stmt, [PREFIX, exp[1], e]]

  'binary!': (exp, env, shiftStmtInfo) ->
    # short circuit evaluation
    if exp[1]=='||'  or exp[1]=='&&' then return transformAndOrExpression(exp, env, shiftStmtInfo)
    result = transformExpressionSequence(exp[2..3], env, shiftStmtInfo)
    [[leftStmt, leftExp], [rightStmt, rightExp]] = result
    # in js, it can be assured that all binary operator has no effects
    # in python, this must be rethought.
    [begin([leftStmt, rightStmt]),  [BINARY, exp[1], leftExp, rightExp]]

  '=': (exp, env, shiftStmtInfo) ->
    exp1 = exp[1] # left
    if exp1.kind==SYMBOL
      [rightStmt, rightExp] = transformExpression(exp[2], env, shiftStmtInfo)
      if shiftStmtInfo.affect(exp1.value)
        [begin([rightStmt, [VAR, (t=env.ssaVar('t'))], (['=', t, rightExp]), (['=', exp1, t])]), t]
      else if hasOwnProperty.call(shiftStmtInfo.vars, exp1.value)
        [begin([rightStmt, (['=', exp1, rightExp])]), exp1]
      else [rightStmt, (['=', exp1, rightExp])]
    else
      # a.x = 1; b[2] = 3, ...
      [[leftStmt, leftExp], [rightStmt, rightExp]] = transformExpressionSequence(exp[1..2], env, shiftStmtInfo)
      [begin([leftStmt, rightStmt, ([VAR, (t=env.ssaVar('t'))]), (['=', t, rightExp]), (['=', leftExp, t])]), t]

  'list!':(exp, env, shiftStmtInfo) ->
    [argsStmts, argsValues] = transformExpressionList(exp[1...], env, shiftStmtInfo)
    args = []
    for e in argsValues
      if e==commentPlaceholder then continue
      else args.push e
    [argsStmts, [LIST$].concat(args)]

  'debugger': (exp, env, shiftStmtInfo) -> [(exp), undefinedExp]

  # {break label} and {continue label}
  'break': (exp, env, shiftStmtInfo) -> [(exp), undefinedExp]

  'continue': (exp, env, shiftStmtInfo) -> [(exp), undefinedExp]

  'quote!': (exp, env, shiftStmtInfo) -> [undefinedExp, exp]

  'regexp!': (exp, env, shiftStmtInfo) -> [undefinedExp, exp]

  'new': (exp, env, shiftStmtInfo) ->
    # [new X] should be converted to standardized form [new [call X []]]
    [stmt, e] = transformExpression(exp[1], env, shiftStmtInfo)
    [begin([([VAR, t=env.ssaVar('t')]), stmt, (['=', t, ([NEW, e])])]), t]

  'return': transformReturnThrowExpression

  'throw': transformReturnThrowExpression

  'var': (exp, env, shiftStmtInfo) ->
    if exp[1] instanceof Array
      # metaVar? wtf?
      env = env.outerVarScopeEnv()
      metaVar = exp[1][1]
      variable = metaVar+(env.getSymbolIndex(metaVar) or '')
      [([VAR, variable]), variable]
    else [(exp), undefinedExp]

  'label!': (exp, env, shiftStmtInfo) ->
    [stmt, e] = transformExpression(exp[1], env, shiftStmtInfo)
    [([LABEL, stmt]), e]

  'noop!': (exp, env, shiftStmtInfo) -> [(exp), undefinedExp]

  'jsvar!': (exp, env, shiftStmtInfo) ->
    if shiftStmtInfo.affect(exp[1].value)
      stmt = begin([[VAR, t=env.ssaVar('t')], ['=', t, exp[1]]])
      stmt.vars = {}; stmt[exp[1].value] = true
      [stmt, t]
    else [undefinedExp, exp]
  '@@': (exp, env, shiftStmtInfo) ->
    env = env.outerVarScopeEnv()
    metaVar = exp[1][1]
    variable = metaVar+(env.getSymbolIndex(metaVar) or '')
    [undefinedExp, variable]

  'call!': (exp, env, shiftStmtInfo) ->
    [argsStmts, argsValues] = transformExpressionList(exp[2], env, shiftStmtInfo)
    shiftStmtInfo.addEffect(argsStmts)
    [callerStmt, callerValue] = transformExpression(exp[1], env, shiftStmtInfo)
    args = []
    for e in argsValues
      if e==commentPlaceholder then continue
      else args.push e
    [begin([callerStmt, argsStmts, [VAR, (t=env.ssaVar('t'))],  ['=', t, [CALL, callerValue, argsValues]]]), t]

  'function': (exp, env, shiftStmtInfo) ->
    env = exp.env
    exp = [FUNCTION, exp[1], transform(exp[2], env)]
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
    [stms, e]

  'if': (exp, env, shiftStmtInfo) ->
    # before transforming, if expression should be standized as [if test then else]
    [stmtTest, testExp] = transformExpression(exp[1], env, testInfo=shiftStmtInfo.copy())
    [stmtThen, thenExp] = transformExpression(exp[2], env, thenInfo=shiftStmtInfo.copy())
    [stmtElse, elseExp] = transformExpression(exp[3], env, elseInfo=shiftStmtInfo.copy())
    if testInfo.polluted or thenInfo.polluted or elseInfo.polluted then shiftStmtInfo.polluted = true
    resultVar = env.ssaVar('t')
    ifStmt = [IF, testExp,
              begin([stmtThen, ['=', resultVar, thenExp]]),
              begin([stmtElse, ['=', resultVar, elseExp]])]
    [begin([stmtTest, [VAR, resultVar], ifStmt]), resultVar]

  'while': (exp, env, shiftStmtInfo) ->
    lst = env.newVar('list')
    [stmtTest, expTest] = transformExpression(exp[1], env, shiftStmtInfo)
    [bodyStmt, bodyValue] = transformExpression(exp[2], env, shiftStmtInfo)
    if stmtTest
      whileStmt = [WHILE, 1,
                 begin([stmtTest,
                        [IF, notExp(expTest), [BREAK]],
                        bodyStmt,
                        pushExp(lst, bodyValue)])]
    else
      whileStmt = [WHILE, expTest,
                   begin([bodyStmt,
                          pushExp(lst, bodyValue)])]
    [begin([[VAR, lst], ['=', lst, []], whileStmt]), lst]

  'jsForIn!': (exp, env, shiftStmtInfo) ->
    lst = env.newVar('list')
    # do not transform exp[1], because it must be [var name] or name
    #[varStmt, varName] = transformExpression(exp[1], env, shiftStmtInfo)
    [rangeStmt, rangeValue] = transformExpression(exp[2], env, shiftStmtInfo)
    [bodyStmt, bodyValue] = transformExpression(exp[3], env, shiftStmtInfo)
    # exp[0]: forIn! or forOf!
    forInStmt = [JSFORIN, exp[1], rangeValue,
                 begin([bodyStmt, pushExp(lst, bodyValue)])]
    [begin([[VAR, lst], ['=', lst, [LIST]], rangeStmt, forInStmt]), lst]

  'try': (exp, env, shiftStmtInfo) ->
    [bodyStmt, bodyValue] = transformExpression(exp[1], env, bodyInfo=shiftStmtInfo.copy())
    catchAction = transform(exp[3], env, catchInfo=shiftStmtInfo.copy())
    finallyAction = transform(exp[4], env, finallyInfo=shiftStmtInfo.copy())
    if bodyInfo.polluted or finallyInfo.polluted or finallyInfo.polluted then shiftStmtInfo.polluted = true
    [[TRY, bodyStmt, exp[2], catchAction, finallyAction], bodyValue]

statementHeadMap = {'break':1, 'continue':1, 'switch':1, 'try':1, 'throw':1, 'return':1,
'jsForIn!':1, 'forOf!': 1, 'cFor!':1, 'while':1, 'doWhile!':1,  'letloop':1,
'with':1, 'var':1, 'label!':1,
'function':1, # althought function itself is expression, but the body need to be processed as statements
}

exports.toExpression = toExpression = (exp) ->
  if exp instanceof Array
    if statementHeadMap[exp[0]] then return false
    for e, i in exp
      # all list expression is converted to the form [command, ...]
      if i==0 then continue
      if not toExpression(e) then return false
    # if begin! is contained in below
    exp.asExpression = true
    return true
  else return true

exports.transformExpression = transformExpression = (exp, env, shiftStmtInfo) ->
  switch exp.kind
    when VALUE then  [undefinedExp, exp]
    when SYMBOL
      if exp.ssa then return [undefinedExp, exp]
      else if shiftStmtInfo.affect(exp.value)
        stmt = begin([([VAR, t=env.ssaVar('t')]), (['=', t, exp])])
        stmt.vars = [exp.value]
        return [stmt, t]
      else return [undefinedExp, exp]
    else
      assert (exp instanceof Array), 'wrong kind of expression while transformExpression'
      if toExpression(exp)
        if shiftStmtInfo.affectExp(exp)
          stmt = begin([[VAR, t=env.ssaVar('t')], ['=', t, exp]])
          # while calling shiftStmtInfo.affectExp(exp), we call varsOf(exp) at first
          stmt.vars = exp.vars
          return [stmt, t]
        else return [undefinedExp, exp]

      assert transformExpressionFnMap[symbolOf(exp[0])], 'no transformExpressionFnMap for '+str(exp)
      result = transformExpressionFnMap[symbolOf(exp[0])](exp, env, shiftStmtInfo)
      # result is in form [stmt, exp], now add the effects of stmt, which will be shifted ahead.
      return result

# used by binary!, =, augmentAssign, result in sequence need to be processed independently
transformExpressionSequence = (exps, env, shiftStmtInfo) ->
  result = []
  i = exps.length
  while --i>=0  # >=0 is necessary, else will missing the run on i==0
    stmtExp = transformExpression(exps[i], env, shiftStmtInfo)
    result.unshift stmtExp
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
    if i>0 then shiftStmtInfo.addEffect(stmt)
  [begin(stmts), es]

transformFnMap =
  'debugger': (exp, env) -> exp
  'break': (exp, env) -> exp
  'quote!': (exp, env) -> exp
  'regexp!': (exp, env) -> exp
  'continue': (exp, env) -> exp
  'label!': (exp, env, shiftStmtInfo) -> [LABEL, exp[1], transform(exp[2], env)]
  'noop!': (exp, env) -> exp

  'begin!': (exp, env) ->
    stmts = []
    for e in exp[1...]
      stmts.push transform(e, env)
    begin(stmts)

  'if': (exp, env) ->
    [stmtTest, testExp] = transformExpression(exp[1], env, new ShiftStatementInfo({}, {}))
    begin([stmtTest, [IF, testExp, transform(exp[2], env), transform(exp[3], env)]])

  'while': (exp, env) ->
    [stmt, testExp] = transformExpression(exp[1], env, new ShiftStatementInfo({}, {}))
    bodyStmt = transform(exp[2], env)
    if stmt  then [WHILE, 1, begin([stmt,[IF, notExp(testExp), [BREAK]],bodyStmt])]
    else [WHILE, testExp, bodyStmt]

  # for key in hash {...}
  # [forIn! key hash body]
  'jsForIn!': (exp, env) ->
    [stmt, hashExp] = transformExpression(exp[2], env, new ShiftStatementInfo({}, {}))
    # do not transform exp[1], because it must be [var name] or name
    if stmt then [BEGIN, stmt, [JSFORIN, exp[1], hashExp, transform(exp[3], env)]]
    else [JSFORIN, exp[1], hashExp, transform(exp[3], env)]

  'try': (exp, env) -> [TRY, transform(exp[1], env), exp[2], transform(exp[3], env), transform(exp[4], env)]

# todo: we can assure "transformed" of value and symbol always be true in the previous phases.
# so we can simplify this function by removing the first two cases of switch
exports.transform = transform = (exp, env) ->
  if exp.transformed then return exp
  if exp instanceof Array
    trace('transform: ', str(exp))
    if (fn=transformFnMap[exp[0]]) then result = fn(exp, env)
    else result = begin transformExpression(exp, env, new ShiftStatementInfo({}, {}))
    result.transformed  = true
    result
  else exp.transformed = true; return exp
