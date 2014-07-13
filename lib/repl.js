
/*
  this file is based on coffeescript/src/repl.coffee(https://github.com/jashkenas/coffeescript)
  Thanks to  Jeremy Ashkenas
  Some stuffs is added or modified for taiji langauge.
 */

/*
Copyright (c) 2009-2014 Jeremy Ashkenas
Copyright (c) 2014-2015 Caoxingming

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
 */
var Environment, addHistory, addMultilineHandler, compileExp, env, extend, fs, merge, nodeREPL, options, parser, path, replDefaults, taiji, textizerOptions, updateSyntaxError, vm, _ref, _ref1;

fs = require('fs');

path = require('path');

vm = require('vm');

nodeREPL = require('repl');

_ref = taiji = require('./taiji'), Environment = _ref.Environment, compileExp = _ref.compileExp, textizerOptions = _ref.textizerOptions;

_ref1 = require('./utils'), extend = _ref1.extend, merge = _ref1.merge, updateSyntaxError = _ref1.updateSyntaxError;

options = extend({}, textizerOptions);

parser = new taiji.Parser;

env = new Environment(extend({}, taiji.builtins), null, {});

replDefaults = {
  prompt: 'taiji: ',
  historyFile: process.env.HOME ? path.join(process.env.HOME, '.taiji_history') : void 0,
  historyMaxInputSize: 10240,
  "eval": function(input, context, filename, cb) {
    var err, exp, js, result;
    input = input.replace(/\uFF00/g, '\n');
    input = input.replace(/^\(([\s\S]*)\n\)$/m, '$1');
    try {
      exp = parser.parse(input, parser.moduleBody, 0, 0, 0, env);
      js = compileExp(exp, env, options);
      result = context === global ? vm.runInThisContext(js, filename) : vm.runInContext(js, context, filename);
      return cb(null, result);
    } catch (_error) {
      err = _error;
      updateSyntaxError(err, input);
      return cb(err);
    }
  }
};

addMultilineHandler = function(repl) {
  var inputStream, multiline, nodeLineListener, outputStream, rli;
  rli = repl.rli, inputStream = repl.inputStream, outputStream = repl.outputStream;
  multiline = {
    enabled: false,
    initialPrompt: repl.prompt.replace(/^[^> ]*/, function(x) {
      return x.replace(/./g, '-');
    }),
    prompt: repl.prompt.replace(/^[^> ]*>?/, function(x) {
      return x.replace(/./g, '.');
    }),
    buffer: ''
  };
  nodeLineListener = rli.listeners('line')[0];
  rli.removeListener('line', nodeLineListener);
  rli.on('line', function(cmd) {
    if (multiline.enabled) {
      multiline.buffer += "" + cmd + "\n";
      rli.setPrompt(multiline.prompt);
      rli.prompt(true);
    } else {
      nodeLineListener(cmd);
    }
  });
  return inputStream.on('keypress', function(char, key) {
    if (!(key && key.ctrl && !key.meta && !key.shift && key.name === 'v')) {
      return;
    }
    if (multiline.enabled) {
      if (!multiline.buffer.match(/\n/)) {
        multiline.enabled = !multiline.enabled;
        rli.setPrompt(repl.prompt);
        rli.prompt(true);
        return;
      }
      if ((rli.line != null) && !rli.line.match(/^\s*$/)) {
        return;
      }
      multiline.enabled = !multiline.enabled;
      rli.line = '';
      rli.cursor = 0;
      rli.output.cursorTo(0);
      rli.output.clearLine(1);
      multiline.buffer = multiline.buffer.replace(/\n/g, '\uFF00');
      rli.emit('line', multiline.buffer);
      multiline.buffer = '';
    } else {
      multiline.enabled = !multiline.enabled;
      rli.setPrompt(multiline.initialPrompt);
      rli.prompt(true);
    }
  });
};

addHistory = function(repl, filename, maxSize) {
  var buffer, fd, lastLine, readFd, size, stat;
  lastLine = null;
  try {
    stat = fs.statSync(filename);
    size = Math.min(maxSize, stat.size);
    readFd = fs.openSync(filename, 'r');
    buffer = new Buffer(size);
    fs.readSync(readFd, buffer, 0, size, stat.size - size);
    repl.rli.history = buffer.toString().split('\n').reverse();
    if (stat.size > maxSize) {
      repl.rli.history.pop();
    }
    if (repl.rli.history[0] === '') {
      repl.rli.history.shift();
    }
    repl.rli.historyIndex = -1;
    lastLine = repl.rli.history[0];
  } catch (_error) {}
  fd = fs.openSync(filename, 'a');
  repl.rli.addListener('line', function(code) {
    if (code && code.length && code !== '.history' && lastLine !== code) {
      fs.write(fd, "" + code + "\n");
      return lastLine = code;
    }
  });
  repl.rli.on('exit', function() {
    return fs.close(fd);
  });
  return repl.commands['.history'] = {
    help: 'Show command history',
    action: function() {
      repl.outputStream.write("" + (repl.rli.history.slice(0).reverse().join('\n')) + "\n");
      return repl.displayPrompt();
    }
  };
};

module.exports = {
  start: function(opts) {
    var build, major, minor, repl, _ref2;
    if (opts == null) {
      opts = {};
    }
    _ref2 = process.versions.node.split('.').map(function(n) {
      return parseInt(n);
    }), major = _ref2[0], minor = _ref2[1], build = _ref2[2];
    if (major === 0 && minor < 8) {
      console.warn("Node 0.8.0+ required for taiji REPL");
      process.exit(1);
    }
    taiji.register();
    process.argv = ['taiji'].concat(process.argv.slice(2));
    opts = merge(replDefaults, opts);
    repl = nodeREPL.start(opts);
    repl.on('exit', function() {
      return repl.outputStream.write('\n');
    });
    addMultilineHandler(repl);
    if (opts.historyFile) {
      addHistory(repl, opts.historyFile, opts.historyMaxInputSize);
    }
    repl.commands['.load'].help = 'Load code from a file into this REPL session';
    return repl;
  }
};
