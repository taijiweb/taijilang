###
  this file is based on coffeescript/src/browser.coffee(https://github.com/jashkenas/coffeescript)
  Thanks to  Jeremy Ashkenas
  Some stuffs is added or modified for taiji langauge.
  this file is not tested in taiji still.
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

# This **Browser** compatibility layer extends core taiji functions
# to make things work smoothly when compiling code directly in the browser.
# We add support for loading remote Coffee scripts via **XHR**, and
# `text/taiji` script tags, source maps via data-URLs, and so on.

taiji = require './taiji'
taiji.require = require
compile = taiji.compile

# Use standard JavaScript `eval` to eval code.
taiji.eval = (code, options = {}) ->
  options.bare ?= true
  eval compile code, options

# Running code does not provide access to this scope.
taiji.run = (code, options = {}) ->
  options.bare = true
  options.shiftLine = true
  Function(compile code, options)()

# If we're not in a browser environment, we're finished with the public API.
return unless window?

# Include source maps where possible. If we've got a base64 encoder, a
# JSON serializer, and tools for escaping unicode characters, we're good to go.
# Ported from https://developer.mozilla.org/en-US/docs/DOM/window.btoa
if btoa? and JSON? and unescape? and encodeURIComponent?
  compile = (code, options = {}) ->
    options.sourceMap = true
    options.inline = true
    {js, v3SourceMap} = taiji.compile code, options
    "#{js}\n//# sourceMappingURL=data:application/json;base64,#{btoa unescape encodeURIComponent v3SourceMap}\n//# sourceURL=taiji"

# Load a remote script from the current domain via XHR.
taiji.load = (url, callback, options = {}, hold = false) ->
  options.sourceFiles = [url]
  xhr = if window.ActiveXObject
    new window.ActiveXObject('Microsoft.XMLHTTP')
  else
    new window.XMLHttpRequest()
  xhr.open 'GET', url, true
  xhr.overrideMimeType 'text/plain' if 'overrideMimeType' of xhr
  xhr.onreadystatechange = ->
    if xhr.readyState is 4
      if xhr.status in [0, 200]
        param = [xhr.responseText, options]
        taiji.run param... unless hold
      else
        throw new Error "Could not load #{url}"
      callback param if callback
  xhr.send null

# Activate taiji in the browser by having it compile and evaluate all script tags with a content-type of `text/taiji`.
# This happens on page load.
runScripts = ->
  scripts = window.document.getElementsByTagName 'script'
  taijitypes = ['text/taiji']
  taijis = (s for s in scripts when s.type in taijitypes)
  index = 0

  execute = ->
    param = taijis[index]
    if param instanceof Array
      taiji.run param...
      index++
      execute()

  for script, i in taijis
    do (script, i) ->
      options = literate: script.type is taijitypes[1]
      if script.src then taiji.load script.src,((param) -> taijis[i] = param; execute()), options, true
      else
        options.sourceFiles = ['embedded']
        taijis[i] = [script.innerHTML, options]

  execute()

# Listen for window load, both in decent browsers and in IE.
if window.addEventListener then window.addEventListener 'DOMContentLoaded', runScripts, no
else window.attachEvent 'onload', runScripts
