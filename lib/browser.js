
/*
  this file is based on coffeescript/src/browser.coffee(https://github.com/jashkenas/coffeescript)
  Thanks to  Jeremy Ashkenas
  Some stuffs is added or modified for taiji langauge.
  this file is not tested in taiji still.
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
var compile, runScripts, taiji,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

taiji = require('./taiji');

taiji.require = require;

compile = taiji.compile;

taiji["eval"] = function(code, options) {
  if (options == null) {
    options = {};
  }
  if (options.bare == null) {
    options.bare = true;
  }
  return eval(compile(code, options));
};

taiji.run = function(code, options) {
  if (options == null) {
    options = {};
  }
  options.bare = true;
  options.shiftLine = true;
  return Function(compile(code, options))();
};

if (typeof window === "undefined" || window === null) {
  return;
}

if ((typeof btoa !== "undefined" && btoa !== null) && (typeof JSON !== "undefined" && JSON !== null) && (typeof unescape !== "undefined" && unescape !== null) && (typeof encodeURIComponent !== "undefined" && encodeURIComponent !== null)) {
  compile = function(code, options) {
    var js, v3SourceMap, _ref;
    if (options == null) {
      options = {};
    }
    options.sourceMap = true;
    options.inline = true;
    _ref = taiji.compile(code, options), js = _ref.js, v3SourceMap = _ref.v3SourceMap;
    return "" + js + "\n//# sourceMappingURL=data:application/json;base64," + (btoa(unescape(encodeURIComponent(v3SourceMap)))) + "\n//# sourceURL=taiji";
  };
}

taiji.load = function(url, callback, options, hold) {
  var xhr;
  if (options == null) {
    options = {};
  }
  if (hold == null) {
    hold = false;
  }
  options.sourceFiles = [url];
  xhr = window.ActiveXObject ? new window.ActiveXObject('Microsoft.XMLHTTP') : new window.XMLHttpRequest();
  xhr.open('GET', url, true);
  if ('overrideMimeType' in xhr) {
    xhr.overrideMimeType('text/plain');
  }
  xhr.onreadystatechange = function() {
    var param, _ref;
    if (xhr.readyState === 4) {
      if ((_ref = xhr.status) === 0 || _ref === 200) {
        param = [xhr.responseText, options];
        if (!hold) {
          taiji.run.apply(taiji, param);
        }
      } else {
        throw new Error("Could not load " + url);
      }
      if (callback) {
        return callback(param);
      }
    }
  };
  return xhr.send(null);
};

runScripts = function() {
  var execute, i, index, s, script, scripts, taijis, taijitypes, _fn, _i, _len;
  scripts = window.document.getElementsByTagName('script');
  taijitypes = ['text/taiji'];
  taijis = (function() {
    var _i, _len, _ref, _results;
    _results = [];
    for (_i = 0, _len = scripts.length; _i < _len; _i++) {
      s = scripts[_i];
      if (_ref = s.type, __indexOf.call(taijitypes, _ref) >= 0) {
        _results.push(s);
      }
    }
    return _results;
  })();
  index = 0;
  execute = function() {
    var param;
    param = taijis[index];
    if (param instanceof Array) {
      taiji.run.apply(taiji, param);
      index++;
      return execute();
    }
  };
  _fn = function(script, i) {
    var options;
    options = {
      literate: script.type === taijitypes[1]
    };
    if (script.src) {
      return taiji.load(script.src, (function(param) {
        taijis[i] = param;
        return execute();
      }), options, true);
    } else {
      options.sourceFiles = ['embedded'];
      return taijis[i] = [script.innerHTML, options];
    }
  };
  for (i = _i = 0, _len = taijis.length; _i < _len; i = ++_i) {
    script = taijis[i];
    _fn(script, i);
  }
  return execute();
};

if (window.addEventListener) {
  window.addEventListener('DOMContentLoaded', runScripts, false);
} else {
  window.attachEvent('onload', runScripts);
}
