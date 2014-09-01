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
    str x.body
  it 'should parse % xyz then anything here', ->
    expect(parse('% xyz then anything here')).to.equal "[object Object]"
  it 'should parse % cursor() then anything here', ->
    expect(parse('% cursor() then x = abc')).to.equal "35"
  it 'should parse % text then anything here', ->
    expect(parse('% text then anything here')).to.equal "taiji language 0.1\n% text then anything here"
  it 'should parse %% 1', ->
    expect(parse('%% 1')).to.equal "1"
  it 'should parse %/ %cursor', ->
    expect(parse('%/ %cursor')).to.equal "function () {\n    return cursor;\n  }"
  it 'should parse %/ cursor()', ->
    expect(parse('%/ cursor()')).to.equal "30"
  it 'should parse %/ clause(), print 1', ->
    expect(parse('%/ clause(), print 1')).to.equal "[print 1]"
