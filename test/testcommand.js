var chai, command, expect, idescribe, iit, lib;

chai = require("chai");

expect = chai.expect;

iit = it.only;

idescribe = describe.only;

lib = '../lib/';

command = require(lib + 'command');

command.testing = true;

describe('test command:', function() {
  var compile, parse, run, transform;
  describe("taiji command utilities: ", function() {
    return describe("taiji information: ", function() {
      it('should display taiji version', function() {
        var x;
        command.opts = {
          version: true
        };
        x = command.run();
        return expect(x).to.equal(true);
      });
      return it('should display taiji help information', function() {
        var x;
        command.opts = {
          help: true
        };
        x = command.run();
        return expect(x).to.equal(true);
      });
    });
  });
  parse = function(outputPath, filePath) {
    command.opts = {
      output: outputPath,
      parse: true,
      "arguments": [filePath]
    };
    return command.run();
  };
  transform = function(outputPath, filePath) {
    command.opts = {
      output: outputPath,
      transform: true,
      "arguments": [filePath]
    };
    return command.run();
  };
  compile = function(outputPath, filePath) {
    command.opts = {
      output: outputPath,
      compile: true,
      "arguments": [filePath]
    };
    return command.run();
  };
  describe("parse and compile: ", function() {
    describe("samples: ", function() {
      it('parse temp.tj', function() {
        return expect(parse('samples-js/parse', 'samples/temp.tj')).to.deep.equal([void 0]);
      });
      it('transform temp.tj', function() {
        return expect(transform('samples-js/transform', 'samples/temp.tj')).to.deep.equal([void 0]);
      });
      it('compile temp.tj', function() {
        return expect(compile('samples-js', 'samples/temp.tj')).to.deep.equal([void 0]);
      });
      it('parse hello.tj', function() {
        return expect(parse('samples-js/parse', 'samples/hello.tj')).to.deep.equal([void 0]);
      });
      it('compile hello.tj', function() {
        return expect(compile('samples-js', 'samples/hello.tj')).to.deep.equal([void 0]);
      });
      it('parse demo.tj', function() {
        return expect(parse('samples-js/parse', 'samples/demo.tj')).to.deep.equal([void 0]);
      });
      it('compile demo.tj', function() {
        return expect(compile('samples-js', 'samples/demo.tj')).to.deep.equal([void 0]);
      });
      it('parse sample.tj', function() {
        return expect(parse('samples-js/parse', 'samples/sample.tj')).to.deep.equal([void 0]);
      });
      it('compile sample.tj', function() {
        return expect(compile('samples-js', 'samples/sample.tj')).to.deep.equal([void 0]);
      });
      it('compile blockcomment.tj', function() {
        return expect(compile('samples-js', 'samples/blockcomment.tj')).to.deep.equal([void 0]);
      });
      it('parse block.tj', function() {
        return expect(parse('samples-js', 'samples/block.tj')).to.deep.equal([void 0]);
      });
      it('compile block.tj', function() {
        return expect(compile('samples-js', 'samples/block.tj')).to.deep.equal([void 0]);
      });
      it('parse indent-then-else.tj', function() {
        return expect(parse('samples-js/parse', 'samples/indent-then-else.tj')).to.deep.equal([void 0]);
      });
      it('compile indent-then-else.tj', function() {
        return expect(compile('samples-js', 'samples/indent-then-else.tj')).to.deep.equal([void 0]);
      });
      it('parse macros.tj', function() {
        return expect(parse('samples-js/parse', 'samples/macros.tj')).to.deep.equal([void 0]);
      });
      it('compile macros.tj', function() {
        return expect(compile('samples-js', 'samples/macros.tj')).to.deep.equal([void 0]);
      });
      it('compile square-macro.tj', function() {
        return expect(compile('samples-js', 'samples/square-macro.tj')).to.deep.equal([void 0]);
      });
      it('compile let.tj', function() {
        return expect(compile('samples-js', 'samples/let.tj')).to.deep.equal([void 0]);
      });
      it('compile loop.tj', function() {
        return expect(compile('samples-js', 'samples/loop.tj')).to.deep.equal([void 0]);
      });
      it('compile nodeserver.tj', function() {
        return expect(compile('samples-js', 'samples/nodeserver.tj')).to.deep.equal([void 0]);
      });
      it('parse snippets.tj', function() {
        return expect(parse('samples-js', 'samples/snippets.tj')).to.deep.equal([void 0]);
      });
      it('compile snippets.tj', function() {
        return expect(compile('samples-js', 'samples/snippets.tj')).to.deep.equal([void 0]);
      });
      it('compile ellipsis.tj', function() {
        return expect(compile('samples-js', 'samples/ellipsis.tj')).to.deep.equal([void 0]);
      });
      it('compile include.tj', function() {
        return expect(compile('samples-js', 'samples/include.tj')).to.deep.equal([void 0]);
      });
      it('parse import.tj', function() {
        return expect(parse('samples-js', 'samples/import.tj')).to.deep.equal([void 0]);
      });
      it('compile import.tj', function() {
        return expect(compile('samples-js', 'samples/import.tj')).to.deep.equal([void 0]);
      });
      it('parse democlass.tj', function() {
        return expect(parse('samples-js', 'samples/democlass.tj')).to.deep.equal([void 0]);
      });
      return it('compile democlass.tj', function() {
        return expect(compile('samples-js', 'samples/democlass.tj')).to.deep.equal([void 0]);
      });
    });
    describe("parse and compile samples/bootstrap: ", function() {
      it('parse require.tj', function() {
        return expect(parse('samples-js/bootstrap/parse', 'samples/bootstrap/require.tj')).to.deep.equal([void 0]);
      });
      it('compile require.tj', function() {
        return expect(compile('samples-js/bootstrap', 'samples/bootstrap/require.tj')).to.deep.equal([void 0]);
      });
      it('parse taijilang.tj', function() {
        return expect(parse('samples-js/bootstrap/parse', 'samples/bootstrap/taijilang.tj')).to.deep.equal([void 0]);
      });
      it('compile taijilang.tj', function() {
        return expect(parse('samples-js/bootstrap', 'samples/bootstrap/taijilang.tj')).to.deep.equal([void 0]);
      });
      return it('compile repl.tj', function() {
        return expect(compile('samples-js/bootstrap', 'samples/bootstrap/repl.tj')).to.deep.equal([void 0]);
      });
    });
    return describe("parse and compile taiji-libraries: ", function() {
      it('parse macros.tj', function() {
        return expect(parse('taiji-libraries-js/parse', 'taiji-libraries/macros.tj')).to.deep.equal([void 0]);
      });
      it('compile macros.tj', function() {
        return expect(compile('taiji-libraries-js', 'taiji-libraries/macros.tj')).to.deep.equal([void 0]);
      });
      it('parse class.tj', function() {
        return expect(parse('taiji-libraries-js/parse', 'taiji-libraries/class.tj')).to.deep.equal([void 0]);
      });
      it('parse lib class.tj', function() {
        return expect(parse('taiji-libraries-js', 'taiji-libraries/class.tj')).to.deep.equal([void 0]);
      });
      it('compile lib class.tj', function() {
        return expect(compile('taiji-libraries-js', 'taiji-libraries/class.tj')).to.deep.equal([void 0]);
      });
      it('compile browser.tj', function() {
        return expect(compile('taiji-libraries-js', 'taiji-libraries/browser.tj')).to.deep.equal([void 0]);
      });
      it('compile html.tj', function() {
        return expect(compile('taiji-libraries-js', 'taiji-libraries/html.tj')).to.deep.equal([void 0]);
      });
      return it('parse prelude.tj', function() {
        return expect(parse('taiji-libraries-js', 'taiji-libraries/prelude.tj')).to.deep.equal([void 0]);
      });
    });
  });
  run = function(filePath) {
    command.opts = {
      run: true,
      "arguments": [filePath]
    };
    return command.run();
  };
  return describe("command run: ", function() {
    it('hello.tj', function() {
      return expect(run('samples/hello.tj')).to.deep.equal([void 0]);
    });
    return it('ellipsis.tj', function() {
      return expect(run('samples/ellipsis.tj')).to.deep.equal([void 0]);
    });
  });
});
