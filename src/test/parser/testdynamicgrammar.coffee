chai = require("chai")
expect = chai.expect
iit = it.only
idescribe = describe.only
ndescribe = ->

lib = '../../lib/'
{str, extend} = require lib+'utils'
taiji = require lib+'taiji'

describe "parse dyanmic syntax: ",  ->
  head = 'taiji language 0.1\n'
  parse = (text) ->
    env = taiji.initEnv(taiji.builtins, taiji.rootModule, {})
    parser = env.parser
    x = parser.parse(head+text, parser.module, 0, env)
    x.body
  it 'should parse ? xyz then x = abc', ->
    expect(str parse('? xyz then x = abc')).to.deep.equal "[? [xyz] [= x abc]]"
  it 'should parse ?? 1', ->
    expect(str parse('?? 1')).to.deep.equal "1"
  it 'should parse ?/ ?cursor', ->
    expect(str parse('?/ ?cursor')).to.deep.equal "function () {\n    return cursor;\n  }"
  it 'should parse ?/ ?cursor()', ->
    expect(str parse('?/ cursor()')).to.deep.equal "30"
  it 'should parse ?/ clause(), print 1', ->
    expect(str parse('?/ clause(), print 1')).to.deep.equal "[print 1]"
