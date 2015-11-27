var chai, expect, idescribe, iit;

chai = require("chai");

expect = chai.expect;

iit = it.only;

idescribe = describe.only;

require('shelljs/global');

describe("taiji shell command: ", function() {
  describe("experiment with shelljs: ", function() {
    return it('should pwd', function() {
      var x;
      x = pwd();
      return expect(x).to.match(/taijilang/);
    });
  });
  it('should display node version', function() {
    var x;
    x = exec('node --version', {
      silent: true
    }).output;
    return expect(x).to.equal("v0.10.22\r\n");
  });
  it('should display taiji version', function() {
    var x;
    x = exec('node bin/taiji -v', {
      silent: true
    }).output;
    return expect(x).to.equal("taiji version 0.1.0\n");
  });
  describe("parse: ", function() {
    return it('should parse hello.tj', function() {
      var x;
      x = exec('node bin/taiji -o samples-js --parse samples/hello.tj', {
        silent: true
      }).output;
      return expect(x).to.equal("");
    });
  });
  describe("compile file: ", function() {
    it('should compile hello.tj', function() {
      var x;
      x = exec('node bin/taiji -o samples-js -c samples/hello.tj', {
        silent: true
      }).output;
      return expect(x).to.equal("");
    });
    it('should compile sample.tj', function() {
      var x;
      x = exec('node bin/taiji -o samples-js -c samples/sample.tj', {
        silent: true
      }).output;
      return expect(x).to.equal("");
    });
    return it('should compile loop.tj', function() {
      var x;
      x = exec('node bin/taiji -o samples-js -c samples/loop.tj', {
        silent: true
      }).output;
      return expect(x).to.equal("");
    });
  });
  return describe("run: ", function() {
    it('should run hello.tj', function() {
      var x;
      x = exec('node bin/taiji samples/hello.tj', {
        silent: true
      }).output;
      return expect(x).to.equal("hello taiji\n");
    });
    return it('should run sample.tj', function() {
      var x;
      x = exec('node bin/taiji samples/sample.tj', {
        silent: true
      }).output;
      return expect(x).to.equal("1\n7\n77\n77\n2\n2 3\n2\n2\n1\n2\n");
    });
  });
});
