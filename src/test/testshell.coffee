chai = require("chai")
expect = chai.expect
iit = it.only
idescribe = describe.only

require('shelljs/global')

describe "taiji shell command: ",  ->
  describe "experiment with shelljs: ",  ->
    it 'should pwd', ->
      x = pwd()
      expect(x).to.match /taijilang/

  it 'should display node version', ->
    x = exec('node --version', {silent:true}).output
    expect(x).to.equal "v0.10.22\r\n"

  it 'should display taiji version', ->
    x = exec('node bin/taiji -v', {silent:true}).output
    expect(x).to.equal "taiji version 0.1.0\n"

  describe "parse: ",  ->
    it 'should parse hello.tj', ->
      x = exec('node bin/taiji -o samples-js --parse samples/hello.tj', {silent:true}).output
      expect(x).to.equal ""

  describe "compile file: ",  ->
    it 'should compile hello.tj', ->
      x = exec('node bin/taiji -o samples-js -c samples/hello.tj', {silent:true}).output
      expect(x).to.equal ""
    it 'should compile sample.tj', ->
      x = exec('node bin/taiji -o samples-js -c samples/sample.tj', {silent:true}).output
      expect(x).to.equal ""
    it 'should compile loop.tj', ->
      x = exec('node bin/taiji -o samples-js -c samples/loop.tj', {silent:true}).output
      expect(x).to.equal ""

  describe "run: ",  ->
    it 'should run hello.tj', ->
      x = exec('node bin/taiji samples/hello.tj', {silent:true}).output
      expect(x).to.equal "hello taiji\n"
    it 'should run sample.tj', ->
      x = exec('node bin/taiji samples/sample.tj', {silent:true}).output
      expect(x).to.equal "1\n7\n77\n77\n2\n2 3\n2\n2\n"
