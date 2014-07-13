
/*
  this file is based on coffeescript/src/optparse.coffee(https://github.com/jashkenas/coffeescript)
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
var LONG_FLAG, MULTI_FLAG, OPTIONAL, OptionParser, SHORT_FLAG, buildRule, buildRules, normalizeArguments, repeat;

exports.OptionParser = OptionParser = (function() {
  function OptionParser(rules, banner) {
    this.banner = banner;
    this.rules = buildRules(rules);
  }

  OptionParser.prototype.parse = function(args) {
    var arg, i, isOption, matchedRule, options, originalArgs, pos, rule, seenNonOptionArg, skippingArgument, value, _i, _j, _len, _len1, _ref;
    options = {
      "arguments": []
    };
    skippingArgument = false;
    originalArgs = args;
    args = normalizeArguments(args);
    for (i = _i = 0, _len = args.length; _i < _len; i = ++_i) {
      arg = args[i];
      if (skippingArgument) {
        skippingArgument = false;
        continue;
      }
      if (arg === '--') {
        pos = originalArgs.indexOf('--');
        options["arguments"] = options["arguments"].concat(originalArgs.slice(pos + 1));
        break;
      }
      isOption = !!(arg.match(LONG_FLAG) || arg.match(SHORT_FLAG));
      seenNonOptionArg = options["arguments"].length > 0;
      if (!seenNonOptionArg) {
        matchedRule = false;
        _ref = this.rules;
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          rule = _ref[_j];
          if (rule.shortFlag === arg || rule.longFlag === arg) {
            value = true;
            if (rule.hasArgument) {
              skippingArgument = true;
              value = args[i + 1];
            }
            options[rule.name] = rule.isList ? (options[rule.name] || []).concat(value) : value;
            matchedRule = true;
            break;
          }
        }
        if (isOption && !matchedRule) {
          throw new Error("unrecognized option: " + arg);
        }
      }
      if (seenNonOptionArg || !isOption) {
        options["arguments"].push(arg);
      }
    }
    return options;
  };

  OptionParser.prototype.help = function() {
    var letPart, lines, rule, spaces, _i, _len, _ref;
    lines = [];
    if (this.banner) {
      lines.unshift("" + this.banner + "\n");
    }
    _ref = this.rules;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      rule = _ref[_i];
      spaces = 15 - rule.longFlag.length;
      spaces = spaces > 0 ? repeat(' ', spaces) : '';
      letPart = rule.shortFlag ? rule.shortFlag + ', ' : '    ';
      lines.push('  ' + letPart + rule.longFlag + spaces + rule.description);
    }
    return "\n" + (lines.join('\n')) + "\n";
  };

  return OptionParser;

})();

LONG_FLAG = /^(--\w[\w\-]*)/;

SHORT_FLAG = /^(-\w)$/;

MULTI_FLAG = /^-(\w{2,})/;

OPTIONAL = /\[(\w+(\*?))\]/;

buildRules = function(rules) {
  var tuple, _i, _len, _results;
  _results = [];
  for (_i = 0, _len = rules.length; _i < _len; _i++) {
    tuple = rules[_i];
    if (tuple.length < 3) {
      tuple.unshift(null);
    }
    _results.push(buildRule.apply(null, tuple));
  }
  return _results;
};

buildRule = function(shortFlag, longFlag, description, options) {
  var match;
  if (options == null) {
    options = {};
  }
  match = longFlag.match(OPTIONAL);
  longFlag = longFlag.match(LONG_FLAG)[1];
  return {
    name: longFlag.substr(2),
    shortFlag: shortFlag,
    longFlag: longFlag,
    description: description,
    hasArgument: !!(match && match[1]),
    isList: !!(match && match[2])
  };
};

normalizeArguments = function(args) {
  var arg, l, match, result, _i, _j, _len, _len1, _ref;
  args = args.slice(0);
  result = [];
  for (_i = 0, _len = args.length; _i < _len; _i++) {
    arg = args[_i];
    if (match = arg.match(MULTI_FLAG)) {
      _ref = match[1].split('');
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        l = _ref[_j];
        result.push('-' + l);
      }
    } else {
      result.push(arg);
    }
  }
  return result;
};

repeat = function(str, n) {
  var res;
  res = '';
  while (n > 0) {
    if (n & 1) {
      res += str;
    }
    n >>>= 1;
    str += str;
  }
  return res;
};
