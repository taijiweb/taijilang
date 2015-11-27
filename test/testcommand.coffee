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
      it 'parse demo.tj', -> expect(parse 'samples-js/parse', 'samples/demo.tj').to.deep.equal [undefined]
      it 'compile demo.tj', -> expect(compile 'samples-js', 'samples/demo.tj').to.deep.equal [undefined]
      it 'compile meta.tj', -> expect(compile 'samples-js', 'samples/meta.tj').to.deep.equal [undefined]
      it 'parse sample.tj', -> expect(parse 'samples-js/parse', 'samples/sample.tj').to.deep.equal [undefined]
      it 'compile sample.tj', -> expect(compile 'samples-js', 'samples/sample.tj').to.deep.equal [undefined]
      it 'compile blockcomment.tj', -> expect(compile 'samples-js', 'samples/blockcomment.tj').to.deep.equal [undefined]
      it 'parse block.tj', -> expect(parse 'samples-js', 'samples/block.tj').to.deep.equal [undefined]
      it 'compile block.tj', -> expect(compile 'samples-js', 'samples/block.tj').to.deep.equal [undefined]
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
      it 'compile include.tj', -> expect(compile 'samples-js', 'samples/include.tj').to.deep.equal [undefined]
      it 'parse import.tj', -> expect(parse 'samples-js', 'samples/import.tj').to.deep.equal [undefined]
      it 'compile import.tj', -> expect(compile 'samples-js', 'samples/import.tj').to.deep.equal [undefined]
      it 'parse democlass.tj', -> expect(parse 'samples-js', 'samples/democlass.tj').to.deep.equal [undefined]
      it 'compile democlass.tj', -> expect(compile 'samples-js', 'samples/democlass.tj').to.deep.equal [undefined]

    describe "samples/bootstrap: ",  ->
      it 'parse require.tj', -> expect(parse 'samples-js/bootstrap/parse', 'samples/bootstrap/require.tj').to.deep.equal [undefined]
      it 'compile require.tj', -> expect(compile 'samples-js/bootstrap', 'samples/bootstrap/require.tj').to.deep.equal [undefined]
      it 'parse taijilang.tj', -> expect(parse 'samples-js/bootstrap/parse', 'samples/bootstrap/taijilang.tj').to.deep.equal [undefined]
      it 'compile taijilang.tj', -> expect(parse 'samples-js/bootstrap', 'samples/bootstrap/taijilang.tj').to.deep.equal [undefined]
      it 'compile repl.tj', -> expect(compile 'samples-js/bootstrap', 'samples/bootstrap/repl.tj').to.deep.equal [undefined]

    describe "taiji-libraries: ",  ->
      it 'parse macros.tj', -> expect(parse 'taiji-libraries-js/parse', 'taiji-libraries/macros.tj').to.deep.equal [undefined]
      it 'compile macros.tj', -> expect(compile 'taiji-libraries-js', 'taiji-libraries/macros.tj').to.deep.equal [undefined]
      it 'parse class@.tj', -> expect(parse 'taiji-libraries-js/parse', 'taiji-libraries/class@.tj').to.deep.equal [undefined]
      it 'compile class@.tj', -> expect(compile 'taiji-libraries-js', 'taiji-libraries/class@.tj').to.deep.equal [undefined]
      it 'compile browser.tj', -> expect(compile 'taiji-libraries-js', 'taiji-libraries/browser.tj').to.deep.equal [undefined]
      it 'compile html.tj', -> expect(compile 'taiji-libraries-js', 'taiji-libraries/html.tj').to.deep.equal [undefined]
      it 'parse prelude.tj', -> expect(parse 'taiji-libraries-js', 'taiji-libraries/prelude.tj').to.deep.equal [undefined]

    describe "bootstrap: ",  ->
      it 'compile bin/taiji.tj', -> expect(compile 'bootstrap-js/bin', 'bootstrap/bin/taiji.tj').to.deep.equal [undefined]
      it 'parse lib/repl.tj', -> expect(parse 'bootstrap-js/lib', 'bootstrap/lib/repl.tj').to.deep.equal [undefined]
      it 'compile lib/repl.tj', -> expect(compile 'bootstrap-js/lib', 'bootstrap/lib/repl.tj').to.deep.equal [undefined]
      it 'parse lib/utils.tj', -> expect(parse 'bootstrap-js/lib', 'bootstrap/lib/utils.tj').to.deep.equal [undefined]
      iit 'compile lib/utils.tj', -> expect(compile 'bootstrap-js/lib', 'bootstrap/lib/utils.tj').to.deep.equal [undefined]

  run = (filePath) ->
    command.opts = {run:true, arguments:[filePath]}
    command.run()

  describe "command run: ",  ->
    it 'hello.tj', -> expect(run 'samples/hello.tj').to.deep.equal [undefined]
    it 'ellipsis.tj', -> expect(run 'samples/ellipsis.tj').to.deep.equal [undefined]
