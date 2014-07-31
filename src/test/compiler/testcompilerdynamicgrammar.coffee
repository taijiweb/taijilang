chai = require("chai")
expect = chai.expect
iit = it.only
idescribe = describe.only
nit = ->

lib = '../../lib/'
{Parser} = require lib+'parser'
{constant, isArray, str} = require lib+'parser/base'
taiji = require lib+'taiji'
{realCode} = require lib+'utils'

compile = (code) ->
  head = 'taiji language 0.1\n'
  realCode taiji.compile(head+code, taiji.rootModule, taiji.builtins, {})

compileNoOptimize = (code) ->
  head = 'taiji language 0.1\n'
  realCode taiji.compileNoOptimize(head+code, taiji.rootModule, taiji.builtins, {})

describe "compile dyanmic syntax: ",  ->
  describe "compile parser attribute: ",  ->
    it 'should compile ?xyz[0]()', ->
      expect(compile('?xyz[0]()')).to.have.string "__$taiji_$_$parser__.xyz[0]()"
    it 'should compile ?cursor', ->
      expect(compile('?cursor')).to.have.string "__$taiji_$_$parser__.cursor"
    it 'should compile ?char()', ->
      expect(compile('?char()')).to.have.string "__$taiji_$_$parser__.char()"

  describe "parsing time evaluation: ",  ->
    it 'should compile ?? 1', ->
      expect(compile('?? 1')).to.have.string "1"
    it 'should compile ?? ?cursor()', ->
      expect(compile('?? ?cursor()')).to.have.string "31"
    it 'should compile ?? ?clause()', ->
      expect(compile('?? ?clause(), 1')).to.have.string "1"

  describe "parsing time evaluation macro ?/: ",  ->
    it 'should compile ?/ cursor', ->
      expect(compile('?/ cursor')).to.have.string "function () {\n    return cursor;\n  }"
    it 'should compile ?/ cursor', ->
      expect(compile('?/ cursor()')).to.have.string "30"
    it 'should compile ?/ clause(), 1', ->
      expect(compile('?/ clause(), 1')).to.have.string "1"
    it 'should compile ?/ clause(), 1', ->
      expect(compile('?/ clause(), print 1')).to.have.string "console.log(1)"

  describe "macro ?! used by ?!: ",  ->
    it 'should compile ?! cursor()', ->
      expect(compile('?! cursor()')).to.have.string "30"
    it 'should compile ?! char()', ->
      expect(compile('?! char()')).to.have.string "true"

  describe "?-then statement: ",  ->
    nit 'should compile ? xyz then x = abc', ->
      expect(compile('? xyz then x = abc')).to.have.string "[? [xyz] [then \"= x abc\"]]"
