chai = require("chai")
expect = chai.expect
iit = it.only
idescribe = describe.only
ndescribe = ->

lib = '../lib/'
{isTaiji, baseFileName} = utils = require lib+'utils'

describe "utils.coffee: ",  ->
  describe "isTaiji filename: ",  ->
    it ' 1.tj', ->
      expect(isTaiji '1.tj').to.equal true
    it ' 1.taiji', ->
      expect(isTaiji '1.taiji').to.equal true
    it ' 1.TAIJI', ->
      expect(isTaiji '1.TAIJI').to.equal false
    it ' 1.taiji.json', ->
      expect(isTaiji '1.taiji.json').to.equal true
    it ' 1.tj.json', ->
      expect(isTaiji '1.tj.json').to.equal true

  describe " baseFileName: ",  ->
    it ' 1.tj', ->
      expect(baseFileName '1.tj', true).to.equal '1'
    it ' x\\1.tj', ->
      expect(baseFileName 'x\\1.tj', true, true).to.equal '1'
    it ' 1.taiji', ->
      expect(baseFileName '1.taiji', true).to.equal '1'
    it ' x\\1.taiji', ->
      expect(baseFileName 'x\\1.taiji', true, true).to.equal '1'
    it ' x//1.taiji', ->
      expect(baseFileName 'x//1.taiji', true).to.equal '1'
    it ' 1.taiji.json', ->
      expect(baseFileName '1.taiji.json', true).to.equal '1'
    it ' 1.tj.json', ->
      expect(baseFileName '1.tj.json', true).to.equal '1'
