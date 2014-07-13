
/*
  this file is based on coffeescript/src/register.coffee(https://github.com/jashkenas/coffeescript)
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
var Module, binary, child_process, ext, findExtension, fork, loadFile, path, taiji, utils, _i, _len, _ref;

child_process = require('child_process');

path = require('path');

taiji = require('./taiji');

utils = require('./utils');

loadFile = function(module, filename) {
  var answer;
  answer = taiji._compileFile(filename, false);
  return module._compile(answer, filename);
};

if (require.extensions) {
  _ref = taiji.FILE_EXTENSIONS;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    ext = _ref[_i];
    require.extensions[ext] = loadFile;
  }
  Module = require('module');
  findExtension = function(filename) {
    var curExtension, extensions;
    extensions = path.basename(filename).split('.');
    if (extensions[0] === '') {
      extensions.shift();
    }
    while (extensions.shift()) {
      curExtension = '.' + extensions.join('.');
      if (Module._extensions[curExtension]) {
        return curExtension;
      }
    }
    return '.js';
  };
  Module.prototype.load = function(filename) {
    var extension;
    this.filename = filename;
    this.paths = Module._nodeModulePaths(path.dirname(filename));
    extension = findExtension(filename);
    Module._extensions[extension](this, filename);
    return this.loaded = true;
  };
}

if (child_process) {
  fork = child_process.fork;
  binary = require.resolve('../bin/taiji');
  child_process.fork = function(path, args, options) {
    if (utils.isTaiji(path)) {
      if (!Array.isArray(args)) {
        options = args || {};
        args = [];
      }
      args = [path].concat(args);
      path = binary;
    }
    return fork(path, args, options);
  };
}
