{constant, extend, str} = require '../utils'
{VALUE, SYMBOL, LIST, COMMAND} = constant

exports.compileError = compileError = (exp, message) ->
  if message then throw new Error('compile error: '+message+': '+str(exp))
  else throw new Error('compile error: '+str(exp))

exports.symbolLookupError = symbolLookupError = (exp, message) ->
  if message then throw new Error(message+': '+str(exp))
  else throw new Error('symbol lookup error: '+str(exp))

# transformExpression in transform.coffee need varsOf, assignVarsOf, pollutedOf
exports.varsOf = varsOf = (exp) ->
  if exp.vars then return exp.vars
  switch exp.kind
    when VALUE, COMMAND then exp.vars = vars = {}; vars
    when SYMBOL then exp.vars = vars = {}; vars[exp.value] = true; vars
    when LIST
      vars = {}
      for e in exp then extend vars, varsOf(e)
      exp.vars = vars
      vars

exports.assignVarsOf = assignVarsOf = (exp) ->
  if exp.assignVars then return exp.assignVars
  switch exp.kind
    when VALUE, SYMBOL, COMMAND then exp.assignVars = assignVars = {}; assignVars
    when LIST
      assignVars = {}
      if exp[0].kind==SYMBOL and exp[0].value=='=' and exp[1].kind==SYMBOL
        assignVars[exp[1].value] = true
        extend(assignVars, assignVarsOf(exp[2]))
      else for e in exp then extend assignVars, assignVarsOf(e)
      exp.assignVars = assignVars
      assignVars

# todo: more refinement on call!
exports.pollutedOf = pollutedOf = (exp) ->
  if exp.polluted!=undefined then return exp.polluted
  switch exp.kind
    when VALUE, SYMBOL, COMMAND then exp.polluted = false
    when LIST
      if exp[0].kind==COMMAND and exp[0].value=='call!' then exp.polluted = true
      else for e in exp then if pollutedOf(e) then exp.polluted = true; return true
      exp.polluted = false
