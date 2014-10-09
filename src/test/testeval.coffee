chai = require("chai")
expect = chai.expect
iit = it.only
idescribe = describe.only
ndescribe = ->

lib = '../lib/'
taiji = require lib+'taiji'

evaltj = (code) ->
  head = 'taiji language 0.1\n'
  taiji.eval(head+code, taiji.rootModule, taiji.builtins, {})

ndescribe "eval: ",  ->
  describe "eval simple: ",  ->
    it 'should eval 1', ->
      expect(evaltj('1')).to.equal 1
    it 'should eval \'a\'', ->
      expect(evaltj("'a'")).to.equal 'a'
    it 'should eval if 1 then 2', ->
      expect(evaltj("if 1 then 2")).to.equal 2
    it 'should eval ~ 2', ->
      expect(evaltj("~ 2")).to.equal 2
    it 'should eval 1+1', ->
      expect(evaltj("1+1")).to.equal 2

  describe "statement: ",  ->
    it 'should eval a=1', ->
      expect(evaltj("a=1")).to.equal 1
    it 'should eval a=1; a+a', ->
      expect(evaltj("a=1; a+a")).to.equal 2
    it 'should eval let a=1 then let a = 2 then a+a', ->
      expect(evaltj("let a=1 then let a = 2 then a+a")).to.equal 4

  describe "eval 2",  ->
    it 'should eval "a"', ->
      expect(evaltj('"a"')).to.equal 'a'
