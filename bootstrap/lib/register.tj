###
  this file is based on coffeescript/src/register.coffee(https://github.com/jashkenas/coffeescript)
  Thanks to  Jeremy Ashkenas
  Some stuffs is added or modified for taiji langauge.
###
###
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
###

child_process = require 'child_process'
path = require 'path'
taiji  = require './taiji'
utils = require './utils'

# Load and run a taiji file for Node, stripping any `BOM`s.
loadFile = (module, filename) ->
  answer = taiji._compileFile filename, false
  module._compile answer, filename

# If the installed version of Node supports `require.extensions`, register taiji as an extension.
if require.extensions
  for ext in taiji.FILE_EXTENSIONS then require.extensions[ext] = loadFile

  # Patch Node's module loader to be able to handle multi-dot extensions.
  # This is a horrible thing that should not be required.
  Module = require 'module'

  findExtension = (filename) ->
    extensions = path.basename(filename).split '.'
    # Remove the initial dot from dotfiles.
    extensions.shift() if extensions[0] is ''
    # Start with the longest possible extension and work our way shortwards.
    while extensions.shift()
      curExtension = '.' + extensions.join '.'
      return curExtension if Module._extensions[curExtension]
    '.js'

  Module::load = (filename) ->
    @filename = filename
    @paths = Module._nodeModulePaths path.dirname filename
    extension = findExtension filename
    Module._extensions[extension](this, filename)
    @loaded = true

# If we're on Node, patch `child_process.fork` so that taiji scripts are able to fork both taiji files, and JavaScript files, directly.
if child_process
  {fork} = child_process
  binary = require.resolve '../bin/taiji'
  child_process.fork = (path, args, options) ->
    if utils.isTaiji path
      unless Array.isArray args then options = args or {}; args = []
      args = [path].concat args
      path = binary
    fork path, args, options
