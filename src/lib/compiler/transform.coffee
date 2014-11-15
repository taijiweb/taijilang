{str, isArray, extend, error, mergeList, begin, pushExp, notExp, norm, undefinedExp, entity, wrapInfo1, constant, assert} = require '../utils'

{VALUE, SYMBOL, LIST} = constant

# todo: keep the env of the function definition expression

exports.idFn = idFn = (exp, env) -> exp

hasOwnProperty = Object::hasOwnProperty

exports.ShiftStatementInfo = class ShiftStatementInfo
  # @polluted: if polluted, it means important side effects has happened and be moved to previous statement
  # then all exp and variable will be affected, variable must be referenced by temporary variable.
  constructor: (@affectVars, @shiftVars, @polluted) ->

  addEffectOf: (exp) ->
    if @polluted then return
    switch exp.kind
      when VALUE then return
      when SYMBOL then @shiftVars[exp.value] = true
      when LIST
        if exp.affectAdded then return
        if fn=addStatementEffectFnMap[exp[0].value] then fn(@, exp)
        else addStatementEffectList(@, exp)
        exp.affectAdded = true

  maybeAffect: (name) -> @polluted or hasOwnProperty.call(@affectVars, name)

  copy: -> new ShiftStatementInfo(extend({}, @affectVars), extend({}, @shiftVars), @polluted)

  merge: (shiftStmtInfoList...) ->
    if @polluted then return @
    for shiftStmtInfo in shiftStmtInfoList
      if shiftStmtInfo.polluted then @polluted = true; return @
    for shiftStmtInfo in shiftStmtInfoList
      for name of shiftStmtInfo.affectVars
        if hasOwnProperty.call(shiftStmtInfo.affectVars, name)
          @affectVars[name] = true
      for name of shiftStmtInfo.shiftVars
        if hasOwnProperty.call(shiftStmtInfo.shiftVars, name)
          @shiftVars[name] = true
    @

addStatementEffectList = (info, exp) ->
  if info.polluted then return
  for e in exp[1...]
    if info.polluted then return
    else info.addEffectOf(e)

addStatementEffectFnMap =
  # augmentAssign, ++, -- should be converted to the form: ['=', x, y]
  # in python, ++, --, augmentAssign can be redefined, so they need to be rethinked about, and can not be treated as assign by certainly.
  '=': (info, exp) ->
    # [binary! = x  y] should has been converted to [= x y] in convert phase.
    if info.polluted
      exp.shift = true
    addStatementEffect(info, exp[2])
    if exp[1].kind==SYMBOL
      if info.affectVars[exp[1].value]
        exp.shift = true
      else info.affextVars[exp[1].value] = true
    else
      addStatementEffect(info, exp[1])

    return

  # todo rethink about attribute! and index!
  'attribute!': (info, exp) -> info.addEffectOf(exp[1])
  'index!': (info, exp) -> info.addEffectOf(exp[2]); info.addEffectOf(exp[1])

  # '=', 'augmentAssign!' is converted to leaving 'binary!' in converting phase
  'binary!': (info, exp) -> addStatementEffectList(info, exp[2..3])

  'metaConvertVar!': (info, exp) -> return
  'break': (info, exp) -> return
  'quote!': (info, exp) -> return
  'regexp!': (info, exp) -> return
  'continue': (info, exp) -> return

  # var initialization should be divided into another expression
  'var': (info, exp) -> return

  'label!': (info, exp) -> info.addEffectOf(exp[1])

  'noop!': (info, exp) -> return

  # can we treat jsvar! as const?
  'jsvar!': (info, exp) -> return

  # constructor is always caller
  'new': (info, exp) -> info.polluted = true

  # exp[1] is the key, which is a constant value.
  'hashitem!': (info, exp) -> info.addEffectOf(exp[2])

  # provided more annotation on caller and function, we can optimized this
  # pure? assign? closure var?
  'call!': (info, exp) -> info.polluted = true

  # To define function is not to call it
  'function': (info, exp) -> return

  'letloop!':(info, exp) ->
    for binding in exp[2] then info.affectVars[entity(binding[0])] = true
    info.addEffectOf(exp[3])

statementHeadMap = {'break':1, 'continue':1, 'switch':1, 'try':1, 'throw':1,
'jsForIn!':1, 'forOf!': 1, 'cFor!':1, 'while':1, 'doWhile!':1,  'letloop':1,
'with':1, 'var':1, 'label!':1}

exports.isExpression = isExpression = (exp) ->
  exp0 = exp[0].value
  if exp0=='if' then return isExpressionList(exp[1..3])
  if exp0=='begin!' then return isExpressionList(exp[1...])
  # see the definition above: break, continue, ...
  if statementHeadMap[exp0] then return false
  return true

isExpressionList = (exp) ->
  for e in exp
    if not isExpression(e) then return false
  return true

exports.toExpression = toExpression = (exp) ->
  exp0 = exp[0].value
  if exp0=='if' then return [norm('?:'), toExpression(exp[1]), toExpression(exp[2]), toExpression(exp[3])]
  if exp0=='begin!' then return [norm 'comma!'].concat(for e in exp[1...] then toExpression(e))
  else return exp

JSONstringifyExp = norm ['attribute!', ['jsvar!', 'JSON'], 'stringify']

transformInterpolatedString = (exp) ->
  exp = entity(exp)
  if typeof exp =='string'
    if exp[0]=='"' then return exp
    else  return ['call!', JSONstringifyExp, [exp]]
  else if Object.prototype.toString.call(exp) == '[object Array]'
    return ['call!', JSONstringifyExp, [exp]]
  else return exp

transformAndOrExpression = (exp, env, shiftStmtInfo) ->
  # short circuit evaluation
  testFn = if exp[1]=='&&' then notExp else (x) -> x
  isAndOr = if exp[1]=='&&' then 'isAnd' else 'isOr'
  [[leftStmt, leftValue], [rightStmt, rightValue]] = transformExpressionSequence(exp[2..3], env, shiftStmtInfo)
  if not rightStmt then return norm [leftStmt, ['binary!', exp[1], leftValue, rightValue]]
  leftVar=env.ssaVar('x'); resultVar=env.ssaVar('t')
  ifStmt = norm ['if', testFn(leftVar),
            ['=', resultVar, leftVar],
            begin([ rightStmt, ['=', resultVar, rightValue]])]
  ifStmt[isAndOr] = true
  stmt =  begin(norm [
    leftStmt,
    ['var', leftVar], ['=', leftVar, leftValue],
    ['var', resultVar]
    ifStmt])
  norm [stmt, resultVar]

transformReturnExpression = (exp, env, shiftStmtInfo) ->
  [expStmt, value] = transformExpression(exp[1], env, shiftStmtInfo)
  # the exprssion after return or throw has no effects.
  [begin([expStmt, norm([norm(exp[0]), value])]), undefinedExp]

transformDirectExpression = (exp, env, shiftStmtInfo) ->
  [stmt, es] = transformExpressionList(exp[1...], env, shiftStmtInfo)
  [stmt, [exp[0], es...]]

transformUnaryExpression = (exp, env, shiftStmtInfo) ->
  if exp[1]!='++' and exp[1]!='--'
    [stmt, e] = transformExpression(exp[2], env, shiftStmtInfo)
    [stmt, [exp[0], exp[1], e]]
  else if exp[0]=='suffix!'
    exp2 = entity(exp[2])
    if typeof exp2 == 'string' and exp2 and exp[0]!='"'
      if shiftStmtInfo.maybeAffect(exp2)
        [begin([['var', (t=env.ssaVar('t'))],
          ['=', t, exp2],
          exp]),
         t]
      else [undefinedExp, exp]
    else
      [stmt, e] = transformExpression(exp[2], env, shiftStmtInfo)
      [begin([stmt, ['var', (t=env.ssaVar('t'))], ['=', t, e], ['suffix!', exp[1], e]]), t]
  else
    exp2 = entity(exp[2])
    if typeof exp2 == 'string' and exp2 and exp[0]!='"'
      if shiftStmtInfo.maybeAffect(exp2)
        [begin([['var', (t=env.ssaVar('t'))], ['=', t, exp]]), t]
      else [undefinedExp, exp]
    else
      [stmt, e] = transformExpression(exp[2], env, shiftStmtInfo)
      [begin([stmt, ['var', (t=env.ssaVar('t'))], ['=', t,  ['prefix!', exp[1], e]]]), t]

transformExpressionFnMap =
  'directLineComment!': (exp, env, shiftStmtInfo) -> [exp, undefinedExp] # error 'direct line comment should not been here'
  'directCBlockComment!': (exp, env, shiftStmtInfo) -> [exp, undefinedExp]  #error 'direct line comment should not been here'
  'string!': (exp, env, shiftStmtInfo) ->
     [stmt, es] = transformExpressionList(exp[1...], env, shiftStmtInfo)
     str = transformInterpolatedString(es[0])
     for e in es[1...] then str = ['binary!', '+', str, transformInterpolatedString(e)]
     [stmt,  str]

  'index!': transformDirectExpression

  'attribute!': (exp, env, shiftStmtInfo) ->
    [objStmt, objExp] = transformExpression(exp[1], env, shiftStmtInfo)
    [objStmt, ['attribute!', objExp, exp[2]]]

  '?:': (exp, env, shiftStmtInfo) ->
    [thenStmt, thenExp] = transformExpression(exp[2], env, thenInfo=shiftStmtInfo.copy())
    [elseStmt, elseExp] = transformExpression(exp[3], env, elseInfo=shiftStmtInfo.copy())
    [testStmt, testExp] = transformExpression(exp[1], env, testInfo=shiftStmtInfo.copy())
    shiftStmtInfo.merge(thenInfo, elseInfo, testInfo)
    if thenStmt or elseStmt
      t = env.ssaVar('t')
      ifStmt = ['if', testExp, begin([thenStmt, ['=', t, thenExp]]), begin([elseStmt, ['=', t, elseExp]])]
      ifStmt.isTernary = true
      [begin([testStmt, ['var', t], ifStmt]), t]
    else [testStmt, ['?:', testExp, thenExp, elseExp]]

  # '++' '--' should be excluded in converting phase
  'prefix!': transformUnaryExpression

  'suffix!': transformUnaryExpression

  'binary!': (exp, env, shiftStmtInfo) ->
    # short circuit evaluation
    if exp[1]=='||'  or exp[1]=='&&' then return transformAndOrExpression(exp, env, shiftStmtInfo)
    [[leftStmt, left], [rightStmt, right]] = transformExpressionSequence(exp[2..3], env, shiftStmtInfo)
    norm [begin([leftStmt, rightStmt]), norm ['binary!', exp[1], left, right]]

  '=': (exp, env, shiftStmtInfo) ->
    exp1 = exp[1]
    if left.kind==SYMBOL
      if shiftStmtInfo.maybeAffect(exp1)
        [rightStmt, rightExp] = transformExpression(exp[2], env, shiftStmtInfo)
        [begin([rightStmt, ['var', (t=env.ssaVar('t'))], ['=', t, rightExp], ['=', exp1, t]]), t]
      else if shiftStmtInfo.maybeAffectBy(exp1)
        [begin([rightStmt, ['=', exp1, rightExp]]), exp1]
      else [rightStmt, ['=', exp1, rightExp]]
    else
      [[leftStmt, leftExp], [rightStmt, rightExp]] = transformExpressionSequence(exp[1..2], env, shiftStmtInfo)
      [begin([leftStmt, rightStmt]), ['=', leftExp, rightExp]]

  'list!':(exp, env, shiftStmtInfo) ->
    [argsStmts, argsValues] = transformExpressionList(exp[1...], env, shiftStmtInfo)
    args = []
    for e in argsValues
      if e and e[0]=='directLineComment!' or e[0]=='directCBlockComment!' then continue
      else args.push e
    [argsStmts, ['list!'].concat(args)]

  'debugger': (exp, env, shiftStmtInfo) -> [exp, undefinedExp]

  # {break label} and {continue label}
  'break': (exp, env, shiftStmtInfo) -> [exp, undefinedExp]

  'continue': (exp, env, shiftStmtInfo) -> [exp, undefinedExp]

  'quote!': (exp, env, shiftStmtInfo) -> [undefinedExp, exp]

  'regexp!': (exp, env, shiftStmtInfo) -> [undefinedExp, exp]

  'new': (exp, env, shiftStmtInfo) ->
    if exp[1] and exp[1][0]=='call!'
      [argsStmts, argsValues] = transformExpressionList(exp[2], env, shiftStmtInfo)
      [callerStmt, callerValue] = transformExpression(exp[1], env, shiftStmtInfo)
      [begin([['var', t=env.ssaVar('t')], callserStmt, argsStmt, ['=', t, ['new', ['call!', callerValues, argsValues]]]]), t]
    else
      [stmt, e] = transformExpression(exp[1], env, shiftStmtInfo)
      [begin([['var', t=env.ssaVar('t')], stmt, ['=', t, ['new', e]]]), t]


  'return': transformReturnExpression

  'throw': transformReturnExpression

  'var': (exp, env, shiftStmtInfo) ->
    if Object.prototype.toString.call(exp[1]) == '[object Array]'
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
    if shiftStmtInfo.maybeAffect(entity(exp[1]))
      [begin([['var', t=env.ssaVar('t')], ['=', t, exp[1]]]), t]
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
    [callerStmt, callerValue] = transformExpression(exp[1], env, shiftStmtInfo)
    args = []
    for e in argsValues
      if e and (e[0]=='directLineComment!' or e[0]=='directCBlockComment!') then continue
      else args.push e
    [begin([callerStmt, argsStmts]), ['call!', callerValue, argsValues]]

  'function': (exp, env, shiftStmtInfo) ->
    env = exp.env
    exp = ['function', exp[1], transform(exp[2], env)]
    exp.env = env
    [undefinedExp, exp]

  'begin!': (exp, env, shiftStmtInfo) ->
    if exp.length==0 then return [undefinedExp, undefinedExp]
    stmts = []
    for e in exp[1...exp.length-1]
      [stmt, e] = transformExpression(e, env, shiftStmtInfo)
      stmts.push stmt
      stmts.push e
    [stmt, e] = transformExpression(exp[exp.length-1], env, shiftStmtInfo)
    stmts.push stmt
    [begin(stmts), e]

  'if': (exp, env, shiftStmtInfo) ->
    [stmtTest, testExp] = transformExpression(exp[1], env, shiftStmtInfo)
    [stmtThen, eThen] = transformExpression(exp[2], env, shiftStmtInfo)
    if exp[3]
      [stmtElse, eElse] = transformExpression(exp[3], env, shiftStmtInfo)
      if isExpression(stmtElse) and isExpression(stmtThen)
        ifExp = ['?:', testExp, toExpression(begin([stmtThen, eThen])), toExpression(begin([stmtElse, eElse]))]
        [stmtTest, ifExp]
      else
        resultVar = env.ssaVar('t')
        ifStmt = ['if', testExp,
                  begin([stmtThen, ['=', resultVar, eThen]]),
                  begin([stmtElse, ['=', resultVar, eElse]])]
        [begin([stmtTest, ['var', resultVar], ifStmt]), resultVar]
    else
      if isExpression(stmtThen)
        ifExp = ['binary!', '&&', testExp, toExpression(begin([stmtThen, eThen]))]
        [stmtTest, ifExp]
      else
        ifStmt = ['if', testExp, begin([stmtThen, ['=', resultVar, eThen]])]
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
    [bodyStmt, bodyValue] = transformExpression(exp[1], env, shiftStmtInfo)
    catchAction = transform(exp[3], env, shiftStmtInfo)
    finallyAction = transform(exp[4], env, shiftStmtInfo)
    [['try', bodyStmt, exp[2], catchAction, finallyAction], bodyValue]

  'switch': (exp, env, shiftStmtInfo) ->
    changeToIf  = false
    exp2 = exp[2]; cases =  []; i = exp2.length
    while --i>=0
      e = exp2[i]; e0 = e[0]; caseValues = []; j = e0.length
      while --j>=0
        x = e0[j]
        caseValues.unshift [stmt, x1] = transformExpression(x, env, shiftStmtInfo)
        if i!=0 and j!=0 and entity(stmt) then changeToIf = true
# added in other place after here:
#      action = transformExpression(e[1], env, shiftStmtInfo)
#      action[0] = begin([action[0], ['break']])
      cases.unshift [caseValues, transformExpression(e[1], env, shiftStmtInfo)]
    if exp3=exp[3]
      [defaultStmt, defaultValue] = transformExpression(exp3, env, shiftStmtInfo)
    [testStmt, testValue] = transformExpression(exp[1], env, shiftStmtInfo)
    resultVar = env.ssaVar('t');
    if changeToIf
      testStmt = begin([testStmt, ['var', testVar], ['=', (testVar=env.ssaVar('t')), testValue], ['var', caseTestVar = env.ssaVar('t')]])
      i = cases.length
      if exp3 then switchStmt = begin([defaultStmt, ['=', resultVar, defaultValue]])
      else switchStmt = undefinedExp
      while --i>=0
        j = cases[i][0].length-1; caseValueStmt = undefinedExp
        while --j>=0
          caseClause = cases[i][0][j]
          caseStmt = caseClause[1]
          caseValue = caseClause[2]
          caseValueStmt = begin([caseStmt,
            ['if', ['binary!', '===', testVar, caseValue],
              ['=', caseTestVar, true]
              caseValueStmt]])
        [actionStmt, actionValue] = cases[i][1]
        switchStmt = begin([caseValueStmt,
                            ['if', caseTestVar,
                              begin([actionStmt, ['=', resultVar, actionValue]]),
                              switchStmt]])
    else
      if stmt00=cases[0][0][0][0] then testStmt = begin([testStmt, stmt00])
      resultCases = for [caseValues, action] in cases
        values = for stmtExp in caseValues then stmtExp[1]
        [values, begin([action[0], ['=', resultVar, action[1]], ['break']])]
      switchStmt = ['switch', testValue, resultCases, begin([defaultStmt, ['=', resultVar, defaultValue]])]
    [begin([testStmt, switchStmt]), resultVar]

  'letloop!':(exp, env, shiftStmtInfo) ->
    bindings = exp[2]
    for b in bindings then b[1] = transform(b[1], env)
    letloopStmt = ['letloop!', exp[1], bindings, begin([['var', t=env.ssaVar('t')], transform(['=', t, exp[3]], env)])]
    letloopStmt.env = exp.env
    [letloopStmt, t]

exports.transformExpression = transformExpression = (exp, env, shiftStmtInfo) ->
  switch exp.kind
    when VALUE then  [undefinedExp, exp]
    when SYMBOL
      if exp.ssa then return [undefinedExp, exp]
      else if shiftStmtInfo.maybeAffect(exp.value)
        stmt = begin([norm ['var', t=env.ssaVar('t')], norm ['=', t, exp]])
        stmt.shiftVars = [expValue]
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
  while --i
    exp = exps[i]
    result.unshift transformExpression exp, env, shiftStmtInfo
  result

# different from above, stmts is merged by begin and es is merged to a list.
transformExpressionList = (exps, env, shiftStmtInfo, shifted) ->
  stmts = []; es = []
  i = exps.length
  while --i
    exp = exps[i]
    [stmt, e] = transformExpression exp, env, shiftStmtInfo, shifted
    stmts.unshift stmt; es.unshift e
  [begin(stmts), es]

useTransformExpression = (exp, env) -> begin transformExpression(exp, env, new ShiftStatementInfo({}))

transformFnMap =
  'debugger': idFn
  'break': idFn
  'quote!': idFn
  'regexp!': idFn
  'continue': idFn
  'label!': (exp, env, shiftStmtInfo) -> ['label!', exp[1], transform(exp[2], env)]
  'noop!': idFn
  'directLineComment!': idFn
  'directCBlockComment!': idFn

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

  # javascript has no for key of hash {...}
  #'forOf!': transformForInExpression

  'cFor!': (exp, env) ->
    [initStmt, initValue] = transformExpression(exp[1], env, new ShiftStatementInfo({}))
    [testStmt, testValue] = transformExpression(exp[2], env, new ShiftStatementInfo({}))
    [stepStmt, stepValue] = transformExpression(exp[3], env, new ShiftStatementInfo({}))
    body = transform(exp[4], env)
    if isUndefinedExp(testStmt)
      cForStmt = ['cFor!', initValue, testValue, stepValue,
                  begin([testStmt, body, stepStmt])]
    else
      cForStmt = ['cFor!', initValue, true, stepValue,
                  begin([testStmt, ['if', notExp(testValue), ['break']], body, stepStmt])]
    norm begin([initStmt, cForStmt])

  'try': (exp, env) -> norm ['try', transform(exp[1], env), exp[2], transform(exp[3], env), transform(exp[4], env)]

# todo: we can assure "transformed" of value and symbol always be true in the previous phases.
# so we can simplify this function by removing the first two cases of switch
exports.transform = transform = (exp, env) ->
  # value and symbol should be preset exp.transform = true
  if exp.transformed then return exp
  assert exp.kind==LIST, 'wrong kind of exp: '+str(exp)
  if (fn=transformFnMap[exp[0].value]) then result = fn(exp, env)
  else result = useTransformExpression(exp, env)
  result.transformed  = true
  result
