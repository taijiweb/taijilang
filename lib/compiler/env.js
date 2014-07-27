var Environment, SymbolLookupError, entity, error, extend, hasOwnProperty, identifierCharSet, javascriptKeywordSet, toIdentifier, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

_ref = require('../utils'), extend = _ref.extend, javascriptKeywordSet = _ref.javascriptKeywordSet, entity = _ref.entity;

identifierCharSet = require('../parser/base').identifierCharSet;

hasOwnProperty = Object.prototype.hasOwnProperty;

toIdentifier = function(symbol) {
  var c, result, _i, _len;
  result = '';
  for (_i = 0, _len = symbol.length; _i < _len; _i++) {
    c = symbol[_i];
    if (identifierCharSet[c]) {
      result += c;
    } else {
      result += '$';
    }
  }
  if (javascriptKeywordSet[symbol]) {
    result += '1';
  }
  return result;
};

error = function(msg, exp) {
  if (exp) {
    throw Error(msg + ': ' + exp);
  } else {
    throw Error(msg);
  }
};

SymbolLookupError = (function(_super) {
  __extends(SymbolLookupError, _super);

  function SymbolLookupError(msg, exp) {
    this.msg = msg;
    this.exp = exp;
  }

  return SymbolLookupError;

})(Error);

exports.Environment = Environment = (function() {
  function Environment(scope, parent, parser, module, functionInfo, options) {
    this.scope = scope;
    this.parent = parent;
    this.parser = parser;
    this.module = module;
    this.functionInfo = functionInfo;
    this.options = options;
    if (functionInfo) {
      functionInfo['backFillBlock!'] = [];
      this.localScopeLevel = 0;
    } else {
      this.localScopeLevel = parent.localScopeLevel + 1;
    }
    if (parent) {
      this.meta = parent.meta;
    } else {
      this.meta = {
        list: [],
        code: [],
        index: 0,
        env: this.extend({})
      };
    }
  }

  Environment.prototype.extend = function(scope, parser, module, functionInfo, options) {
    return new Environment(scope || this.scope, this, parser || this.parser, module || this.module, functionInfo, options || this.options);
  };

  Environment.prototype.getFunctionInfo = function() {
    var env, functionInfo;
    env = this;
    while (!(functionInfo = env.functionInfo)) {
      env = env.parent;
    }
    return functionInfo;
  };

  Environment.prototype.getFunctionEnv = function() {
    var env;
    env = this;
    while (!env.functionInfo) {
      env = env.parent;
    }
    return env;
  };

  Environment.prototype.newVar = function(symbol) {
    var functionInfo, name, symbolIndex;
    name = toIdentifier(symbol);
    functionInfo = this.getFunctionInfo();
    if (!hasOwnProperty.call(functionInfo, name)) {
      functionInfo[name] = 1;
      return {
        symbol: name
      };
    } else {
      while (symbolIndex = name + (++functionInfo[name])) {
        if (!hasOwnProperty.call(functionInfo, symbolIndex)) {
          break;
        }
      }
      functionInfo[symbolIndex] = 1;
      return {
        symbol: symbolIndex
      };
    }
  };

  Environment.prototype.constVar = function(symbol) {
    var v;
    v = this.newVar(symbol);
    v["const"] = true;
    return v;
  };

  Environment.prototype.ssaVar = function(symbol) {
    var v;
    v = this.newVar(symbol);
    v.ssa = true;
    return v;
  };

  Environment.prototype.newTaijiVar = function(symbol) {
    var functionInfo, name, symbolIndex;
    name = toIdentifier(symbol);
    functionInfo = this.getFunctionInfo();
    if (!hasOwnProperty.call(functionInfo, name)) {
      functionInfo[name] = 1;
      return {
        symbol: name
      };
    } else {
      while (symbolIndex = name.slice(0, name.length - 2) + (++functionInfo[name]) + name.slice(name.length - 2)) {
        if (!hasOwnProperty.call(functionInfo, symbolIndex)) {
          break;
        }
      }
      functionInfo[symbolIndex] = 1;
      return {
        symbol: symbolIndex
      };
    }
  };

  Environment.prototype.getSymbolIndex = function(symbol) {
    var functionInfo;
    functionInfo = this.getFunctionInfo();
    if (!hasOwnProperty.call(functionInfo, symbol)) {
      return 0;
    } else {
      return functionInfo[symbol];
    }
  };

  Environment.prototype.hasLocal = function(symbol) {
    return hasOwnProperty.call(this.scope, symbol);
  };

  Environment.prototype.hasFnLocal = function(symbol) {
    if (hasOwnProperty.call(this.scope, symbol)) {
      return true;
    }
    if (this.functionInfo) {

    } else if (this.parent) {
      return this.parent.hasFnLocal(symbol);
    }
  };

  Environment.prototype.outerVarScopeEnv = function() {
    var parent;
    parent = this;
    while (1) {
      if (parent.functionInfo) {
        if (parent.parent) {
          return parent.parent;
        } else {
          return this;
        }
      } else {
        parent = parent.parent;
      }
    }
  };

  Environment.prototype.set = function(symbol, value) {
    var functionInfo, name;
    functionInfo = this.getFunctionInfo();
    if (typeof value === 'object') {
      value.value = name = toIdentifier(entity(value));
    } else {
      value = name = toIdentifier(value);
    }
    if (!functionInfo[name]) {
      functionInfo[name] = 1;
    }
    return this.scope[symbol] = value;
  };

  Environment.prototype.get = function(symbol) {
    if (hasOwnProperty.call(this.scope, symbol)) {
      return this.scope[symbol];
    } else if (this.parent) {
      return this.parent.get(symbol);
    }
  };

  Environment.prototype.info = function(symbol) {
    if (this.optimizeInfoMap && hasOwnProperty.call(this.optimizeInfoMap, symbol)) {
      return this.optimizeInfoMap[symbol];
    } else if (this.parent) {
      return this.parent.info(symbol);
    }
  };

  return Environment;

})();
