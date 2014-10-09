var chai, expect, extend, idescribe, iit, lib, ndescribe, str, taiji, _ref;

chai = require("chai");

expect = chai.expect;

iit = it.only;

idescribe = describe.only;

ndescribe = function() {};

lib = '../../lib/';

_ref = require(lib + 'utils'), str = _ref.str, extend = _ref.extend;

taiji = require(lib + 'taiji');

ndescribe("parse dyanmic syntax: ", function() {
  var head, parse;
  head = 'taiji language 0.1\n';
  parse = function(text) {
    var env, parser, x;
    env = taiji.initEnv(taiji.builtins, taiji.rootModule, {});
    parser = env.parser;
    x = parser.parse(head + text, parser.module, 0, env);
    return str(x.body);
  };
  it('should parse % xyz then anything here', function() {
    return expect(parse('% xyz then anything here')).to.equal("[object Object]");
  });
  it('should parse % cursor() then anything here', function() {
    return expect(parse('% cursor() then x = abc')).to.equal("35");
  });
  it('should parse % text then anything here', function() {
    return expect(parse('% text then anything here')).to.equal("taiji language 0.1\n% text then anything here");
  });
  it('should parse %% 1', function() {
    return expect(parse('%% 1')).to.equal("1");
  });
  it('should parse %/ %cursor', function() {
    return expect(parse('%/ %cursor')).to.equal("function () {\n    return cursor;\n  }");
  });
  it('should parse %/ cursor()', function() {
    return expect(parse('%/ cursor()')).to.equal("30");
  });
  return it('should parse %/ clause(), print 1', function() {
    return expect(parse('%/ clause(), print 1')).to.equal("[print 1]");
  });
});
