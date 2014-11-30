chai = require("chai")
exports.expect = chai.expect
exports.iit = it.only
exports.idescribe = describe.only
exports.ndescribe = ->
exports.nit = ->

lib = '../lib/'

{str, assert} = require lib+'utils'
{Parser} = require lib+'parser'
taiji = require lib+'taiji'
{realCode} = require lib+'utils'

exports.str = str

{NEWLINE, INDENT, SPACE, VALUE, SYMBOL} = require lib+'constant'

exports.matchRule = (parser, rule) -> ->
  token = parser.nextToken()
  if token.type==NEWLINE then parser.nextToken()
  if token.type==SPACE then parser.nextToken()
  rule()

# set exp.kind attribute, recursively if exp is array
# normalize expression for compilation, used in multiple phases
# todo: this should be compile time function in taijilang bootstrap compilation program, so it can be optimized greatly.
# to make "analyzed", "transformed", "optimized" being true here, we can avoid switch branch in the following phases.
exports.norm = norm = (exp) ->
  # trace('norm: ', str(exp))
  assert exp!=undefined, 'norm(exp) meet undefined'
  if exp.kind then return exp
  if exp instanceof Array
    for e in exp then norm e
  else if typeof exp == 'string'
    if exp[0]=='"' then {value:exp, kind:VALUE}
    else {value:exp, kind:SYMBOL}
  else if typeof exp =='object' and not exp.kind? then exp.kind = SYMBOL; exp
  else {value:exp, kind:VALUE}

head = 'taiji language 0.1\n'

exports.parse = (text) ->
  parser = new Parser()
  x = parser.parse(head+text, parser.module, 0)

exports.compile = (code) ->
  head = 'taiji language 0.1\n'
  realCode taiji.compile(head+code, taiji.rootModule, taiji.builtins, {})

exports.compileNoOptimize = (code) ->
  head = 'taiji language 0.1\n'
  realCode taiji.compileNoOptimize(head+code, taiji.rootModule, taiji.builtins, {})

exports.expectCompile = (srcCode, result) -> expect(compile(srcCode)).to.have.string result
exports.itCompile = (srcCode, result) -> it 'should compile'+srcCode, ->  expectCompile(srcCode, result)
exports.iitCompile = (srcCode, result) -> iit 'should compile '+srcCode, ->  expectCompile(srcCode, result)

exports.expectParse = (srcCode, result) -> expect(parse(srcCode)).to.have.string result
exports.itParse = (srcCode, result) -> it 'should parse'+srcCode, ->  expectParse(srcCode, result)
exports.iitParse = (srcCode, result) -> iit 'should parse '+srcCode, ->  expectParse(srcCode, result)
