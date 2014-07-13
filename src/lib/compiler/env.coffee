{extend} = require '../utils'

hasOwnProperty = Object::hasOwnProperty

error = (msg, exp) ->
  if exp then throw Error msg+': '+exp
  else throw Error msg

class SymbolLookupError extends Error
  constructor: (@msg, @exp) ->

# options: {module, newVarIndexMap, parser, ...}
exports.Environment = class Environment
  constructor: (@scope, @parent, @parser, @module, @newVarIndexMap, @options) ->
    if parent then @meta = parent.meta
    else @meta = {list: [], code: [], index:0, env: @extend({})}

  extend: (scope, parser, module, newVarIndexMap, options) ->
    new Environment(scope or @scope, @, parser or @parser, module or @module, newVarIndexMap, options or @options)

  getNewVarIndexMap: ->
    env = @
    while not newVarIndexMap = env.newVarIndexMap then env = env.parent
    newVarIndexMap
  newVar: (symbol) ->
    newVarIndexMap = @getNewVarIndexMap()
    if not hasOwnProperty.call(newVarIndexMap, symbol)
      newVarIndexMap[symbol] = 1; {symbol: symbol}
    else
      while symbolIndex = symbol+(++newVarIndexMap[symbol])
        if not hasOwnProperty.call(newVarIndexMap, symbolIndex) then break
      newVarIndexMap[symbolIndex] = 1
      {symbol: symbolIndex}

  ssaVar: (symbol) -> v = @newVar(symbol); v.ssa = true; v

  hasLocal: (symbol) ->  hasOwnProperty.call(@scope, symbol)

  hasFnLocal: (symbol) ->
    if hasOwnProperty.call(@scope, symbol) then return true
    if @newVarIndexMap then return
    else if @parent then return @parent.hasFnLocal(symbol)

  # use @@x to get variable x in outer var scope( outer function or module variable)
  outerVarScopeEnv: ->
    parent = @
    while 1
      if parent.newVarIndexMap
        if parent.parent then return parent.parent
        else return @ # instead of returning parent, return @. because the check in core.coffee exports['='] if env!=outerEnv and env.get(name)
      else parent = parent.parent

  set: (symbol, value) ->
    newVarIndexMap = @getNewVarIndexMap()
    if not newVarIndexMap[symbol] then  newVarIndexMap[symbol] = 1
    @scope[symbol] = value

  get: (symbol) ->
    if @hasLocal(symbol) then  return @scope[symbol]
    else if @parent then return @parent.get(symbol)
    #else throw new SymbolLookupError(symbol)

#  getOptions: ->
#    if @options then @options
#    else
#      parent = @parent
#      while parent
#        if parent.options then @options = parent.options; return @options
#        parent = parent.parent
#      @options = {}



