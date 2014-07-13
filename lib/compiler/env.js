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
  function Environment(scope, parent, parser, module, newVarIndexMap, options) {
    this.scope = scope;
    this.parent = parent;
    this.parser = parser;
    this.module = module;
    this.newVarIndexMap = newVarIndexMap;
    this.options = options;
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

  Environment.prototype.extend = function(scope, parser, module, newVarIndexMap, options) {
    return new Environment(scope || this.scope, this, parser || this.parser, module || this.module, newVarIndexMap, options || this.options);
  };

  Environment.prototype.getNewVarIndexMap = function() {
    var env, newVarIndexMap;
    env = this;
    while (!(newVarIndexMap = env.newVarIndexMap)) {
      env = env.parent;
    }
    return newVarIndexMap;
  };

  Environment.prototype.newVar = function(symbol) {
    var newVarIndexMap, symbolIndex;
    newVarIndexMap = this.getNewVarIndexMap();
    if (!hasOwnProperty.call(newVarIndexMap, symbol)) {
      newVarIndexMap[symbol] = 1;
      return {
        symbol: symbol
      };
    } else {
      while (symbolIndex = symbol + (++newVarIndexMap[symbol])) {
        if (!hasOwnProperty.call(newVarIndexMap, symbolIndex)) {
          break;
        }
      }
      newVarIndexMap[symbolIndex] = 1;
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
    if (this.newVarIndexMap) {

    } else if (this.parent) {
      return this.parent.hasFnLocal(symbol);
    }
  };

  Environment.prototype.outerVarScopeEnv = function() {
    var parent;
    parent = this;
    while (1) {
      if (parent.newVarIndexMap) {
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
    var newVarIndexMap;
    newVarIndexMap = this.getNewVarIndexMap();
    if (!newVarIndexMap[symbol]) {
      newVarIndexMap[symbol] = 1;
    }
    return this.scope[symbol] = value;
  };

  Environment.prototype.get = function(symbol) {
    if (this.hasLocal(symbol)) {
      return this.scope[symbol];
    } else if (this.parent) {
      return this.parent.get(symbol);
    }
  };

  return Environment;

})();
