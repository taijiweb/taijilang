
/*
  this file is based on coffeescript/src/sourcemap.coffee(https://github.com/jashkenas/coffeescript)
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

/*
Source maps allow JavaScript runtimes to match running JavaScript back to
the original source code that corresponds to it. This can be minified
JavaScript, but in our case, we're concerned with mapping pretty-printed
JavaScript back to Taijilang.
In order to produce maps, we must keep track of positions (line number, column number)
that originated every node in the syntax tree, and be able to generate a
[map file](https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit)
— which is a compact, VLQ-encoded representation of the JSON serialization
of this information — to write out alongside the generated JavaScript.
 */
var LineMap, SourceMap;

LineMap = (function() {
  function LineMap(line) {
    this.line = line;
    this.columns = [];
  }

  LineMap.prototype.add = function(column, _arg, options) {
    var sourceColumn, sourceLine;
    sourceLine = _arg[0], sourceColumn = _arg[1];
    if (options == null) {
      options = {};
    }
    if (this.columns[column] && options.noReplace) {
      return;
    }
    return this.columns[column] = {
      line: this.line,
      column: column,
      sourceLine: sourceLine,
      sourceColumn: sourceColumn
    };
  };

  LineMap.prototype.sourceLocation = function(column) {
    var mapping;
    while (!((mapping = this.columns[column]) || (column <= 0))) {
      column--;
    }
    return mapping && [mapping.sourceLine, mapping.sourceColumn];
  };

  return LineMap;

})();

SourceMap = (function() {
  var BASE64_CHARS, VLQ_CONTINUATION_BIT, VLQ_SHIFT, VLQ_VALUE_MASK;

  function SourceMap() {
    this.lines = [];
  }

  SourceMap.prototype.add = function(sourceLocation, generatedLocation, options) {
    var column, line, lineMap, _base;
    if (options == null) {
      options = {};
    }
    line = generatedLocation[0], column = generatedLocation[1];
    lineMap = ((_base = this.lines)[line] || (_base[line] = new LineMap(line)));
    return lineMap.add(column, sourceLocation, options);
  };

  SourceMap.prototype.sourceLocation = function(_arg) {
    var column, line, lineMap;
    line = _arg[0], column = _arg[1];
    while (!((lineMap = this.lines[line]) || (line <= 0))) {
      line--;
    }
    return lineMap && lineMap.sourceLocation(column);
  };

  SourceMap.prototype.generate = function(options, code) {
    var buffer, lastColumn, lastSourceColumn, lastSourceLine, lineMap, lineNumber, mapping, needComma, v3, writingline, _i, _len, _ref, _results;
    if (options == null) {
      options = {};
    }
    if (code == null) {
      code = null;
    }
    writingline = lastColumn = lastSourceLine = lastSourceColumn = 0;
    needComma = false;
    buffer = "";
    _ref = this.lines;
    _results = [];
    for (lineNumber = _i = 0, _len = _ref.length; _i < _len; lineNumber = ++_i) {
      lineMap = _ref[lineNumber];
      if (lineMap) {
        _results.push((function() {
          var _j, _len1, _ref1, _results1;
          _ref1 = lineMap.columns;
          _results1 = [];
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            mapping = _ref1[_j];
            if (!(mapping)) {
              continue;
            }
            while (writingline < mapping.line) {
              lastColumn = 0;
              needComma = false;
              buffer += ";";
              writingline++;
            }
            if (needComma) {
              buffer += ",";
              needComma = false;
            }
            buffer += this.encodeVlq(mapping.column - lastColumn);
            lastColumn = mapping.column;
            buffer += this.encodeVlq(0);
            buffer += this.encodeVlq(mapping.sourceLine - lastSourceLine);
            lastSourceLine = mapping.sourceLine;
            buffer += this.encodeVlq(mapping.sourceColumn - lastSourceColumn);
            lastSourceColumn = mapping.sourceColumn;
            needComma = true;
            v3 = {
              version: 3,
              file: options.generatedFile || '',
              sourceRoot: options.sourceRoot || '',
              sources: options.sourceFiles || [''],
              names: [],
              mappings: buffer
            };
            if (options.inline) {
              v3.sourcesContent = [code];
            }
            _results1.push(JSON.stringify(v3, null, 2));
          }
          return _results1;
        }).call(this));
      }
    }
    return _results;
  };

  VLQ_SHIFT = 5;

  VLQ_CONTINUATION_BIT = 1 << VLQ_SHIFT;

  VLQ_VALUE_MASK = VLQ_CONTINUATION_BIT - 1;

  SourceMap.prototype.encodeVlq = function(value) {
    var answer, nextChunk, signBit, valueToEncode;
    answer = '';
    signBit = value < 0 ? 1 : 0;
    valueToEncode = (Math.abs(value) << 1) + signBit;
    while (valueToEncode || !answer) {
      nextChunk = valueToEncode & VLQ_VALUE_MASK;
      valueToEncode = valueToEncode >> VLQ_SHIFT;
      if (valueToEncode) {
        nextChunk |= VLQ_CONTINUATION_BIT;
      }
      answer += this.encodeBase64(nextChunk);
    }
    return answer;
  };

  BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

  SourceMap.prototype.encodeBase64 = function(value) {
    return BASE64_CHARS[value] || (function() {
      throw new Error("Cannot Base64 encode value: " + value);
    })();
  };

  return SourceMap;

})();

module.exports = SourceMap;
