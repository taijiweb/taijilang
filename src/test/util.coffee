chai = require("chai")
exports.expect = chai.expect
exports.iit = it.only
exports.idescribe = describe.only
exports.ndescribe = ->
exports.nit = ->

lib = '../lib/'

{constant, isArray, str} = require lib+'utils'
{Parser} = require lib+'parser'
taiji = require lib+'taiji'
{realCode} = require lib+'utils'

exports.str = str

{NEWLINE, INDENT, SPACE} = constant

exports.matchRule = (parser, rule) -> ->
  token = parser.nextToken()
  if token.type==NEWLINE then parser.nextToken()
  if token.type==SPACE then parser.nextToken()
  rule()

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
