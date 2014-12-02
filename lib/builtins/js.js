var begin, binaryConverters, commaList, compileError, convert, convertAssign, convertList, extend, isArray, isSymbol, prefixConverters, quasiquote, splitSpace, str, symbol, symbolOf, trace, undefinedExp, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3;

_ref = require('../utils'), str = _ref.str, trace = _ref.trace, begin = _ref.begin, extend = _ref.extend, splitSpace = _ref.splitSpace, undefinedExp = _ref.undefinedExp, symbolOf = _ref.symbolOf, commaList = _ref.commaList, isArray = _ref.isArray, isSymbol = _ref.isSymbol;

compileError = require('../compiler/helper').compileError;

_ref1 = require('../compiler'), convert = _ref1.convert, convertList = _ref1.convertList;

exports['extern!'] = function(exp, env) {
  var v;
  if (env.hasLocal(v = symbolOf(exp[1]))) {
    error(v + ' has been declared as local variable, so it can not be declared as extern variable any more.', e);
  }
  env.set(v, exp[1]);
  return undefinedExp;
};

exports['var'] = function(exp, env) {
  var sym;
  if (isSymbol(exp[1])) {
    if (env.hasLocal(sym = symbolOf(exp[1]))) {
      error('repeat declaring variable: ' + str(e));
    }
    return [exp[0], env.set(sym, exp[1])];
  } else {
    return error('only identifiers can be in var statement');
  }
};

exports['newvar!'] = function(exp, env) {
  var x;
  return '"' + env.newVar((x = exp[1].value).slice(1, x.length - 1)).symbol + '"';
};

convertAssign = function(left, right, env) {
  var leftValue;
  if (isSymbol(left)) {
    leftValue = symbolOf(left);
    if (env.hasLocal(leftValue)) {
      left = env.get(leftValue);
      if (left["const"]) {
        error('should not assign value to const variable: ' + leftValue);
      }
      if (left.outer) {
        env.set(leftValue, left = env.newVar(leftValue));
        left["const"] = true;
        return ['begin!', ['var', left], ['=', left, convert(right, env)], left];
      } else {
        return ['=', left, convert(right, env)];
      }
    } else {
      env.set(leftValue, left = env.newVar(leftValue));
      left["const"] = true;
      return ['begin!', ['var', left], ['=', left, convert(right, env)], left];
    }
  } else {
    right = convert(right, env);
    return [exp[0], convert(left, env), right];
  }
};

exports['='] = function(exp, env) {
  return convertAssign(exp[1], exp[2], env);
};

exports['begin!'] = function(exp, env) {
  var e;
  return begin((function() {
    var _i, _len, _ref2, _results;
    _ref2 = exp.slice(1);
    _results = [];
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      e = _ref2[_i];
      _results.push(convert(e, env));
    }
    return _results;
  })());
};

exports['if'] = function(exp, env) {
  if (exp[3] !== void 0) {
    return [IF, convert(exp[1], env), convert(exp[2], env), convert(exp[3], env)];
  } else {
    return [IF, convert(exp[1], env), convert(exp[2], env), undefinedExp];
  }
};

exports['->'] = function(exp, env) {
  var body, newEnv, param, scope, _i, _len, _ref2;
  newEnv = env.extend(scope = {}, env.parser, env.module, {});
  _ref2 = exp[1];
  for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
    param = _ref2[_i];
    scope[symbolOf(param)] = param;
  }
  body = return_(convert(begin(exp[2]), newEnv));
  return ['function', params, body];
};

quasiquote = function(exp, env, level) {
  var e, exp1, head, item, meetSplice, result, _i, _len;
  exp1 = exp[1];
  if (!isArray(exp1)) {
    return JSON.stringify(entity(exp1));
  } else if (!exp1.length) {
    return [];
  }
  if ((head = entity(exp1[0])) === 'unquote!' || head === 'unquote-splice') {
    return convert(exp1[1], env, level - 1);
  } else if (head === 'quasiquote!') {
    return ['list!', '"quasiquote!"', quasiquote(exp1[1], env, level + 1)];
  }
  result = ['list!'];
  meetSplice = false;
  for (_i = 0, _len = exp1.length; _i < _len; _i++) {
    e = exp1[_i];
    if (isArray(e) && e.length) {
      head = entity(e[0]);
      if (head === 'unquote-splice' && level === 0) {
        result = ['call!', ['attribute!', result, 'concat'], [convert(e[1], env)]];
        meetSplice = true;
      } else if (!meetSplice) {
        if (head === 'unquote-splice') {
          result.push(['list!', '"unquote-splice"', quasiquote(e[1], env, level - 1)]);
        } else if (head === 'unquote!') {
          if (level === 0) {
            result.push(convert(e[1], env));
          } else {
            result.push(['unquote!', quasiquote(e[1], env, level - 1)]);
          }
        } else if (head === 'quasiquote!') {
          result.push(['list!', '"quasiquote!"', quasiquote(e[1], env, level + 1)]);
        } else {
          result.push(quasiquote([e], env, level));
        }
      } else {
        if (head === 'unquote-splice') {
          item = [['list!', quasiquote(e[1], env, level - 1)]];
        } else {
          if (head === 'unquote!') {
            if (level === 0) {
              item = [['list!', convert(e[1], env)]];
            } else {
              item = [['list!', ['"unquote!"', quasiquote(e[1], env, level - 1)]]];
            }
          } else if (head === 'quasiquote!') {
            item = [['list!', ['quasiquote!', quasiquote(e[1], env, level + 1)]]];
          } else {
            item = [['list!', [quasiquote(e, env, level)]]];
          }
        }
        result = ['call!', ['attribute', result, 'concat'], item];
      }
    } else {
      if (!meetSplice) {
        result.push(JSON.stringify(entity(e)));
      } else {
        result = ['call!', ['attribute!', result, 'concat'], [['list!', JSON.stringify(entity(e))]]];
      }
    }
  }
  return result;
};

exports['{}'] = function(exp, env) {
  return convert(begin(exp[1]), env);
};

exports['()'] = function(exp, env) {
  if (exp[1].length === 1) {
    return convert(exp[1][0], env);
  } else {
    return ['list!'].concat(convertList(exp[1], env));
  }
};

exports['[]'] = function(exp, env) {
  return ['list!'].concat(convertList(exp[1], env));
};

exports['~'] = function(exp, env) {
  return ['quote!', exp[1]];
};

exports['prefix!'] = function(exp, env) {
  return prefixConverters[exp[1].value](exp, env);
};

exports.prefixConverters = prefixConverters = {};

exports['^'] = prefixConverters['^'] = function(exp, env) {
  return compileError('unexpected ^', exp);
};

exports['^&'] = prefixConverters['^&'] = function(exp, env) {
  return compileError('unexpected ^&', exp);
};

exports['`'] = function(exp, env) {
  return quasiquote(exp, env, 0);
};

_ref2 = '++ -- yield new typeof void ! ~ + -'.split(' ');
for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
  symbol = _ref2[_i];
  prefixConverters[symbol] = function(exp, env) {
    return ['prefix!', exp[1], convert(exp[2], env)];
  };
}

exports['binary!'] = function(exp, env, compiler) {
  return binaryConverters[exp[1].value](exp, env);
};

exports.binaryConverters = binaryConverters = {};

binaryConverters['='] = function(exp, env) {
  return convertAssign(exp[2], exp[3], env);
};

binaryConverters['concat[]'] = function(exp, env, compiler) {
  var subscript;
  trace("binaryConverters('concat[]'):", str(exp));
  subscript = exp[3][1];
  if (subscript.length !== 1) {
    compileError(exp, 'the length of subscript should be 1');
  }
  return ['index!', convert(exp[2], env), convert(subscript[0], env)];
};

binaryConverters['concat()'] = function(exp, env) {
  return ['call!', convert(exp[2], env), convertList(exp[3][1], env)];
};

_ref3 = '+ - * / && || << >> >>> == === != !== > < >= <= instanceof'.split(' ');
for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
  symbol = _ref3[_j];
  binaryConverters[symbol] = function(exp, env) {
    return [exp[0], exp[1], convert(exp[2], env), convert(exp[3], env)];
  };
}

binaryConverters[','] = function(exp, env) {
  return ['list!'].concat(convertList(commaList(exp), env));
};

binaryConverters['.'] = function(exp, env) {
  return ['attribute!', convert(exp[2], env), exp[3]];
};

exports['forOf!'] = function(exp, env) {
  return ['jsForIn!', convert(exp[1], env), convert(exp[2], env), convert(exp[3], env)];
};

(function() {
  var i, sym, _k, _len2, _ref4, _results;
  _ref4 = splitSpace('throw return if while try return list!');
  _results = [];
  for (i = _k = 0, _len2 = _ref4.length; _k < _len2; i = ++_k) {
    sym = _ref4[i];
    _results.push(exports[sym] = function(exp, env) {
      return [exp[0]].concat(convertList(exp.slice(1), env));
    });
  }
  return _results;
})();

(function() {
  var word, _k, _len2, _ref4, _results;
  _ref4 = splitSpace('break continue');
  _results = [];
  for (_k = 0, _len2 = _ref4.length; _k < _len2; _k++) {
    word = _ref4[_k];
    _results.push(exports[word] = function(exp, env) {
      return exp;
    });
  }
  return _results;
})();

(function() {
  var sym, _k, _len2, _ref4, _results;
  _ref4 = 'undefined null true false this console Math Object Array arguments eval require module exports'.split(' ');
  _results = [];
  for (_k = 0, _len2 = _ref4.length; _k < _len2; _k++) {
    sym = _ref4[_k];
    _results.push(exports[sym] = ['jsvar!', sym]);
  }
  return _results;
})();
