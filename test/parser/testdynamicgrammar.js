var chai, expect, extend, idescribe, iit, lib, ndescribe, str, taiji, _ref;

chai = require("chai");

expect = chai.expect;

iit = it.only;

idescribe = describe.only;

ndescribe = function() {};

lib = '../../lib/';

_ref = require(lib + 'utils'), str = _ref.str, extend = _ref.extend;

taiji = require(lib + 'taiji');

describe("parse dyanmic syntax: ", function() {
  var head, parse;
  head = 'taiji language 0.1\n';
  parse = function(text) {
    var env, parser, x;
    env = taiji.initEnv(taiji.builtins, taiji.rootModule, {});
    parser = env.parser;
    x = parser.parse(head + text, parser.module, 0, env);
    return x.body;
  };
  it('should parse ? xyz then x = abc', function() {
    return expect(str(parse('? xyz then x = abc'))).to.deep.equal("[? [xyz] [= x abc]]");
  });
  it('should parse ?? 1', function() {
    return expect(str(parse('?? 1'))).to.deep.equal("1");
  });
  it('should parse ?/ ?cursor', function() {
    return expect(str(parse('?/ ?cursor'))).to.deep.equal("function () {\n    return cursor;\n  }");
  });
  it('should parse ?/ ?cursor()', function() {
    return expect(str(parse('?/ cursor()'))).to.deep.equal("30");
  });
  return it('should parse ?/ clause(), print 1', function() {
    return expect(str(parse('?/ clause(), print 1'))).to.deep.equal("[print 1]");
  });
});
