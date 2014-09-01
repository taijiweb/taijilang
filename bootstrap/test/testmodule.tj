chai = require("chai")
expect = chai.expect
iit = it.only
idescribe = describe.only
ndescribe = ->
nit = ->

path = require 'path'
lib = '../lib/'
{Parser} = require lib+'parser'
{constant, isArray, str} = require lib+'parser/base'
{} = require lib+'compiler/compile'
taiji = require lib+'taiji'
TaijiModule = require lib+'module'
{realCode} = require lib+'utils'

compile = (code) ->
  head = 'taiji language 0.1\n'
  realCode taiji.compile(head+code, taiji.rootModule, taiji.builtins, {})

run = (code) ->
  head = 'taiji language 0.1\n'
  code = taiji.compile(head+code, taiji.rootModule, taiji.builtins, {})
  str eval code

describe "taiji module: ",  ->
  describe "path: ",  ->
    it '__dirname', ->
      expect(__dirname).to.match /test/
    it '__filename', ->
      expect(__filename).to.match /test\\testmodule.js/
    it 'process.cwd', ->
      expect(process.cwd()).to.match /taijilang/
    it 'process.execPath', ->
      expect(process.execPath).to.match /nodejs\\node/
    it 'process.execArgv', ->
      expect(process.execArgv).to.deep.equal []
    it 'process.env', ->
      #console.log process.env
      expect(process.env['TAIJILANG_PATH']).to.match /taijilang/
      expect(process.env['taijilang_path']).to.match /taijilang/

  describe 'new module: ', ->
    taijiModule = new TaijiModule('f:\\taijilang\\lib\\taiji.tj', null)
    it 'new TaijiModule', ->
      expect(taijiModule.basePath).to.match /lib/
      expect(str taijiModule.modulePaths).to.match /taiji-libraries/
    it 'should findPath', ->
      childModule = new TaijiModule('f:\\taijilang\\samples\\hello.tj', taijiModule)
      expect(childModule.basePath).to.equal 'f:\\taijilang\\samples'
      expect(childModule.findPath('.\\sample.tj')).to.equal 'f:\\taijilang\\samples\\sample.tj'
      expect(childModule.findPath('html.tj')).to.equal 'f:\\taijilang\\taiji-libraries\\html.tj'

  describe 'include!', ->
    it 'include! "./hello.tj"', ->
      expect(run("include! '../samples/hello.tj'")).to.equal "hello taiji"
