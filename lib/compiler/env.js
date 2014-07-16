var Environment, SymbolLookupError, error, extend, hasOwnProperty,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

extend = require('../utils').extend;

hasOwnProperty = Object.prototype.hasOwnProperty;

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

  Environment.prototype.newVar = function(symbol) {
    var functionInfo, symbolIndex;
    functionInfo = this.getFunctionInfo();
    if (!hasOwnProperty.call(functionInfo, symbol)) {
      functionInfo[symbol] = 1;
      return {
        symbol: symbol
      };
    } else {
      while (symbolIndex = symbol + (++functionInfo[symbol])) {
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

  Environment.prototype.ssaVar = function(symbol) {
    var v;
    v = this.newVar(symbol);
    v.ssa = true;
    return v;
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
    var functionInfo;
    functionInfo = this.getFunctionInfo();
    if (!functionInfo[symbol]) {
      functionInfo[symbol] = 1;
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

  return Environment;

})();
