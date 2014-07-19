chai = require("chai")
expect = chai.expect
iit = it.only
idescribe = describe.only

lib = '../lib/'
command = require lib+'command'

command.testing = true

describe 'test command:', ->
  describe "taiji command utilities: ",  ->
    describe "taiji information: ",  ->
      it 'should display taiji version', ->
        command.opts = {version: true}
        x = command.run()
        expect(x).to.equal true
      it 'should display taiji help information', ->
        command.opts = {help: true}
        x = command.run()
        expect(x).to.equal true

  parse = (outputPath, filePath) ->
    command.opts = {output: outputPath, parse:true, arguments:[filePath]}
    command.run()

  transform = (outputPath, filePath) ->
    command.opts = {output: outputPath, transform:true, arguments:[filePath]}
    command.run()

  compile = (outputPath, filePath) ->
    command.opts = {output: outputPath, compile:true, arguments:[filePath]}
    command.run()

  describe "parse and compile: ",  ->
    describe "samples: ",  ->
      it 'parse temp.tj', -> expect(parse 'samples-js/parse', 'samples/temp.tj').to.deep.equal [undefined]
      it 'transform temp.tj', -> expect(transform 'samples-js/transform', 'samples/temp.tj').to.deep.equal [undefined]
      it 'compile temp.tj', -> expect(compile 'samples-js', 'samples/temp.tj').to.deep.equal [undefined]
      it 'parse hello.tj', -> expect(parse 'samples-js/parse', 'samples/hello.tj').to.deep.equal [undefined]
      it 'compile hello.tj', -> expect(compile 'samples-js', 'samples/hello.tj').to.deep.equal [undefined]
      it 'sample.tj', -> expect(parse 'samples-js/parse', 'samples/sample.tj').to.deep.equal [undefined]
      it 'compile sample.tj', -> expect(compile 'samples-js', 'samples/sample.tj').to.deep.equal [undefined]
      it 'compile blockcomment.tj', -> expect(compile 'samples-js', 'samples/blockcomment.tj').to.deep.equal [undefined]
      it 'parse indent-then-else.tj', -> expect(parse 'samples-js/parse', 'samples/indent-then-else.tj').to.deep.equal [undefined]
      it 'compile indent-then-else.tj', -> expect(compile 'samples-js', 'samples/indent-then-else.tj').to.deep.equal [undefined]
      it 'parse macros.tj', -> expect(parse 'samples-js/parse', 'samples/macros.tj').to.deep.equal [undefined]
      it 'compile macros.tj', -> expect(compile 'samples-js', 'samples/macros.tj').to.deep.equal [undefined]
      it 'compile square-macro.tj', -> expect(compile 'samples-js', 'samples/square-macro.tj').to.deep.equal [undefined]
      it 'compile let.tj', -> expect(compile 'samples-js', 'samples/let.tj').to.deep.equal [undefined]
      it 'compile loop.tj', -> expect(compile 'samples-js', 'samples/loop.tj').to.deep.equal [undefined]
      it 'compile nodeserver.tj', -> expect(compile 'samples-js', 'samples/nodeserver.tj').to.deep.equal [undefined]
      it 'parse snippets.tj', -> expect(parse 'samples-js', 'samples/snippets.tj').to.deep.equal [undefined]
      it 'compile snippets.tj', -> expect(compile 'samples-js', 'samples/snippets.tj').to.deep.equal [undefined]
      it 'compile ellipsis.tj', -> expect(compile 'samples-js', 'samples/ellipsis.tj').to.deep.equal [undefined]
      iit 'compile include.tj', -> expect(compile 'samples-js', 'samples/include.tj').to.deep.equal [undefined]
      it 'compile use.tj', -> expect(compile 'samples-js', 'samples/use.tj').to.deep.equal [undefined]

    describe "parse and compile samples/bootstrap: ",  ->
      it 'parse require.tj', -> expect(parse 'samples-js/bootstrap/parse', 'samples/bootstrap/require.tj').to.deep.equal [undefined]
      it 'compile require.tj', -> expect(compile 'samples-js/bootstrap', 'samples/bootstrap/require.tj').to.deep.equal [undefined]
      it 'parse taijilang.tj', -> expect(parse 'samples-js/bootstrap/parse', 'samples/bootstrap/taijilang.tj').to.deep.equal [undefined]
      it 'compile taijilang.tj', -> expect(parse 'samples-js/bootstrap', 'samples/bootstrap/taijilang.tj').to.deep.equal [undefined]
      it 'compile repl.tj', -> expect(compile 'samples-js/bootstrap', 'samples/bootstrap/repl.tj').to.deep.equal [undefined]

    describe "parse and compile taiji-libraries: ",  ->
      it 'parse macros.tj', -> expect(parse 'taiji-libraries-js/parse', 'taiji-libraries/macros.tj').to.deep.equal [undefined]
      it 'compile macros.tj', -> expect(compile 'taiji-libraries-js', 'taiji-libraries/macros.tj').to.deep.equal [undefined]
      it 'parse class.tj', -> expect(parse 'taiji-libraries-js/parse', 'taiji-libraries/class.tj').to.deep.equal [undefined]
      xit 'compile class.tj', -> expect(compile 'taiji-libraries-js', 'taiji-libraries/class.tj').to.deep.equal [undefined]
      it 'parse module.tj', -> expect(parse 'taiji-libraries-js/parse', 'taiji-libraries/module.tj').to.deep.equal [undefined]
      xit 'compile module.tj', -> expect(compile 'taiji-libraries-js', 'taiji-libraries/module.tj').to.deep.equal [undefined]
      it 'compile browser.tj', -> expect(compile 'taiji-libraries-js', 'taiji-libraries/browser.tj').to.deep.equal [undefined]
      it 'compile html.tj', -> expect(compile 'taiji-libraries-js', 'taiji-libraries/html.tj').to.deep.equal [undefined]
      it 'parse prelude.tj', -> expect(parse 'taiji-libraries-js', 'taiji-libraries/prelude.tj').to.deep.equal [undefined]
      it 'compile prelude.tj', -> expect(compile 'taiji-libraries-js', 'taiji-libraries/prelude.tj').to.deep.equal [undefined]

  run = (filePath) ->
    command.opts = {run:true, arguments:[filePath]}
    command.run()

  describe "command run: ",  ->
    it 'hello.tj', -> expect(run 'samples/hello.tj').to.deep.equal [undefined]
    it 'ellipsis.tj', -> expect(run 'samples/ellipsis.tj').to.deep.equal [undefined]
