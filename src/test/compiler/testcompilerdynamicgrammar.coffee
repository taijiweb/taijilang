chai = require("chai")
expect = chai.expect
iit = it.only
idescribe = describe.only

lib = '../../lib/'
{Parser} = require lib+'parser'
{constant, isArray, str} = require lib+'parser/base'
taiji = require lib+'taiji'

compile = (code) ->
  head = 'taiji language 0.1\n'
  taiji.compile(head+code, taiji.rootModule, taiji.builtins, {})

compileNoOptimize = (code) ->
  head = 'taiji language 0.1\n'
  taiji.compileNoOptimize(head+code, taiji.rootModule, taiji.builtins, {})

describe "compile dyanmic syntax: ",  ->
  describe "compile parser attribute: ",  ->
    it 'should compile ?xyz[0]()', ->
      expect(compile('?xyz[0]()')).to.equal "__$taiji_$_$parser__.xyz[0]()"
    it 'should compile ?cursor', ->
      expect(compile('?cursor')).to.equal "__$taiji_$_$parser__.cursor"
    it 'should compile ?char()', ->
      expect(compile('?char()')).to.equal "__$taiji_$_$parser__.char()"

  describe "parsing time evaluation: ",  ->
    it 'should compile ?? 1', ->
      expect(compile('?? 1')).to.equal "1"
    it 'should compile ?? ?cursor()', ->
      expect(compile('?? ?cursor()')).to.equal "31"
    it 'should compile ?? ?clause()', ->
      expect(compile('?? ?clause(), 1')).to.equal "1"

  describe "parsing time evaluation macro ?/: ",  ->
    it 'should compile ?/ cursor', ->
      expect(compile('?/ cursor')).to.equal "function () {\n    return cursor;\n  }"
    it 'should compile ?/ cursor', ->
      expect(compile('?/ cursor()')).to.equal "30"
    it 'should compile ?/ clause(), 1', ->
      expect(compile('?/ clause(), 1')).to.equal "1"
    it 'should compile ?/ clause(), 1', ->
      expect(compile('?/ clause(), print 1')).to.equal "console.log(1)"

  describe "macro ?! used by ?!: ",  ->
    it 'should compile ?! cursor()', ->
      expect(compile('?! cursor()')).to.equal "30"
    it 'should compile ?! char()', ->
      expect(compile('?! char()')).to.equal "true"

  describe "?-then statement: ",  ->
    xit 'should compile ? xyz then x = abc', ->
      expect(compile('? xyz then x = abc')).to.equal "[? [xyz] [then \"= x abc\"]]"
