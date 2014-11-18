var COMMAND, LIST, SYMBOL, VALUE, assignVarsOf, compileError, constant, extend, pollutedOf, str, symbolLookupError, varsOf, _ref;

_ref = require('../utils'), constant = _ref.constant, extend = _ref.extend, str = _ref.str;

VALUE = constant.VALUE, SYMBOL = constant.SYMBOL, LIST = constant.LIST, COMMAND = constant.COMMAND;

exports.compileError = compileError = function(exp, message) {
  if (message) {
    throw new Error('compile error: ' + message + ': ' + str(exp));
  } else {
    throw new Error('compile error: ' + str(exp));
  }
};

exports.symbolLookupError = symbolLookupError = function(exp, message) {
  if (message) {
    throw new Error(message + ': ' + str(exp));
  } else {
    throw new Error('symbol lookup error: ' + str(exp));
  }
};

exports.varsOf = varsOf = function(exp) {
  var e, vars, _i, _len;
  if (exp.vars) {
    return exp.vars;
  }
  switch (exp.kind) {
    case VALUE:
    case COMMAND:
      exp.vars = vars = {};
      return vars;
    case SYMBOL:
      exp.vars = vars = {};
      vars[exp.value] = true;
      return vars;
    case LIST:
      vars = {};
      for (_i = 0, _len = exp.length; _i < _len; _i++) {
        e = exp[_i];
        extend(vars, varsOf(e));
      }
      exp.vars = vars;
      return vars;
  }
};

exports.assignVarsOf = assignVarsOf = function(exp) {
  var assignVars, e, _i, _len;
  if (exp.assignVars) {
    return exp.assignVars;
  }
  switch (exp.kind) {
    case VALUE:
    case SYMBOL:
    case COMMAND:
      exp.assignVars = assignVars = {};
      return assignVars;
    case LIST:
      assignVars = {};
      if (exp[0].kind === SYMBOL && exp[0].value === '=' && exp[1].kind === SYMBOL) {
        assignVars[exp[1].value] = true;
        extend(assignVars, assignVarsOf(exp[2]));
      } else {
        for (_i = 0, _len = exp.length; _i < _len; _i++) {
          e = exp[_i];
          extend(assignVars, assignVarsOf(e));
        }
      }
      exp.assignVars = assignVars;
      return assignVars;
  }
};

exports.pollutedOf = pollutedOf = function(exp) {
  var e, _i, _len;
  if (exp.polluted !== void 0) {
    return exp.polluted;
  }
  switch (exp.kind) {
    case VALUE:
    case SYMBOL:
    case COMMAND:
      return exp.polluted = false;
    case LIST:
      if (exp[0].kind === COMMAND && exp[0].value === 'call!') {
        exp.polluted = true;
      } else {
        for (_i = 0, _len = exp.length; _i < _len; _i++) {
          e = exp[_i];
          if (pollutedOf(e)) {
            exp.polluted = true;
            return true;
          }
        }
      }
      return exp.polluted = false;
  }
};
