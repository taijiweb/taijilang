var LIST, Parser, SYMBOL, VALUE, addPrelude, argumentsLength, begin, binaryConverters, compileError, compileExp, constant, convert, convertArgumentList, convertAssign, convertDefinition, convertExps, convertIdentifier, convertList, convertMetaExp, convertParametersWithEllipsis, convertParserAttribute, convertParserExpression, declareVar, entity, error, extend, fs, idConvert, isArray, keywordConvert, makeSlice, metaIndex, metaProcess, metaProcessConvert, nonMetaCompileExp, norm, quasiquote, return_, splitSpace, str, sym, trace, transformToCode, undefinedExp, _fn, _i, _len, _ref, _ref1, _ref2, _ref3;

_ref = require('../utils'), norm = _ref.norm, constant = _ref.constant, str = _ref.str, trace = _ref.trace;

VALUE = constant.VALUE, SYMBOL = constant.SYMBOL, LIST = constant.LIST;

compileError = require('../compiler/helper').compileError;

__slice = [].slice;

fs = require('fs');

_ref1 = require('../utils'), convertIdentifier = _ref1.convertIdentifier, entity = _ref1.entity, begin = _ref1.begin, return_ = _ref1.return_, error = _ref1.error, isArray = _ref1.isArray, error = _ref1.error, extend = _ref1.extend, splitSpace = _ref1.splitSpace, undefinedExp = _ref1.undefinedExp, addPrelude = _ref1.addPrelude;

Parser = require('../parser').Parser;

_ref2 = require('../compiler'), convert = _ref2.convert, convertList = _ref2.convertList, convertArgumentList = _ref2.convertArgumentList, convertExps = _ref2.convertExps, compileExp = _ref2.compileExp, nonMetaCompileExp = _ref2.nonMetaCompileExp, transformToCode = _ref2.transformToCode, metaProcessConvert = _ref2.metaProcessConvert, metaProcess = _ref2.metaProcess;

metaIndex = 0;

exports['extern!'] = function(exp, env) {
  var e, isConst, v, _i, _len, _ref3;
  if (exp[1] === 'const') {
    isConst = true;
    exp = exp.slice(2);
  }
  _ref3 = exp.slice(1);
  for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
    e = _ref3[_i];
    if (env.hasLocal(v = entity(e))) {
      error(v + ' has been declared as local variable, so it can not be declared as extern variable any more.', e);
    }
    env.set(v, v);
    if (isConst) {
      e["const"] = true;
    }
  }
  return '';
};

exports['metaConvertVar!'] = function(exp, env) {
  return exp;
};

declareVar = function(fn) {
  return function(exp, env) {
    var e, e0, e1, e1Value, eValue, i, len, result, v;
    result = [];
    len = exp.length;
    i = 1;
    while (i < len) {
      e = exp[i++];
      switch (e.kind) {
        case VALUE:
          error('illegal variable name');
          break;
        case SYMBOL:
          eValue = e.value;
          if (env.hasLocal(e.value)) {
            error('repeat declaring variable: ' + str(e));
          }
          v = env.set(eValue, e);
          fn(v);
          if (v["const"]) {
            error('const need to be initialized to a value');
          }
          result.push(norm(['var', v]));
          break;
        case LIST:
          e0 = e[0];
          if (e0.kind === SYMBOL) {
            if (e0.value === 'metaConvertVar!') {
              result.push(norm([norm('var'), e]));
            } else if (e0.value === '=') {
              e1 = e[1];
              if (e1.kind !== SYMBOL) {
                error('illegal variable name in variable initialization: ' + str(e1));
              }
              if (env.hasLocal(e1Value = e1.value)) {
                error('repeat declaring variable: ' + str(e1));
              }
              v = env.newVar(e1Value);
              fn(v);
              result.push(norm(['var', v]));
              result.push(norm(['=', v, convert(e[2], env)]));
              env.set(e1Value, e1);
            }
          } else {
            compileError(e, 'wrong form of var initialization');
          }
      }
    }
    return begin(result);
  };
};

exports['var'] = declareVar(function(v) {
  return v;
});

exports['const'] = declareVar(function(v) {
  v["const"] = true;
  return v;
});

exports['newvar!'] = function(exp, env) {
  var x;
  return '"' + env.newVar((x = entity(exp[1])).slice(1, x.length - 1)).symbol + '"';
};

makeSlice = function(obj, start, stop) {
  if (stop === void 0) {
    return norm(['call!', ['attribute!', '__slice', 'call'], [obj, start]]);
  } else {
    return norm(['call!', ['attribute!', '__slice', 'call'], [obj, start, stop]]);
  }
};

convertAssign = function(exp, env) {
  var e, ellipsis, i, item, left, leftLength, leftValue, n, result, right, rightLength, v, x, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _len6, _m, _n, _o, _ref3, _ref4;
  left = exp[1];
  if (left.kind === SYMBOL) {
    leftValue = left.value;
    if (env.hasLocal(leftValue)) {
      left = env.get(leftValue);
      if (left["const"]) {
        error('should not assign value to const variable: ' + leftValue);
      }
      if (left.outer) {
        env.set(leftValue, left = env.newVar(leftValue));
        left["const"] = true;
        return norm(['begin!', ['var', left], ['=', left, convert(exp[2], env)], left]);
      } else {
        return norm(['=', left, convert(exp[2], env)]);
      }
    } else {
      env.set(leftValue, left = env.newVar(leftValue));
      left["const"] = true;
      return norm(['begin!', ['var', left], ['=', left, convert(exp[2], env)], left]);
    }
  } else if (left[0] === 'list!') {
    ellipsis = void 0;
    for (i = _i = 0, _len = left.length; _i < _len; i = ++_i) {
      item = left[i];
      x = entity(item);
      if (x && x[0] === 'x...') {
        if (!ellipsis) {
          ellipsis = i;
          left[i] = x[1];
        } else {
          error('can not have multiple ellipsis item in the left side of assign');
        }
      }
    }
    if (ellipsis === void 0) {
      right = exp[2];
      if (right[0] === 'list!') {
        if (left.length > 1) {
          result = [];
          _ref3 = left.slice(1);
          for (i = _j = 0, _len1 = _ref3.length; _j < _len1; i = ++_j) {
            e = _ref3[i];
            result.push(convertAssign(e, right[i + 1], env));
          }
          return begin(result);
        } else {
          return convertAssign(left[1], right[1], env);
        }
      } else {
        if (left.length > 1) {
          result = [];
          result.push(norm(['var', v = env.ssaVar('lst')]));
          result.push(norm(['=', v, convert(right, env)]));
          _ref4 = left.slice(1);
          for (i = _k = 0, _len2 = _ref4.length; _k < _len2; i = ++_k) {
            e = _ref4[i];
            result.push(convertAssign(e, norm(['direct!', ['index!', v, i]]), env));
          }
          return begin(result);
        } else {
          return convertAssign(left[1], norm(['index!', right, 0]), env);
        }
      }
    } else {
      result = [];
      leftLength = left.length;
      if (right[0] === 'list!') {
        rightLength = right.length;
        if (leftLength > rightLength) {
          for (i = _l = 0, _len3 = left.length; _l < _len3; i = ++_l) {
            e = left[i];
            if (i === 0) {
              continue;
            } else if (i < ellipsis) {
              result.push(convertAssign(e, right[i], env));
            } else if (i === ellipsis) {
              result.push(convertAssign(e, [], env));
            } else {
              n = ellipsis + (rightLength - i) + 1;
              if (n >= rightLength) {
                result.push(convertAssign(e, void 0, env));
              } else {
                result.push(convertAssign(e, right[n], env));
              }
            }
          }
        } else {
          for (i = _m = 0, _len4 = left.length; _m < _len4; i = ++_m) {
            e = left[i];
            if (i === 0) {
              continue;
            } else if (i < ellipsis) {
              result.push(convertAssign(e, right[i], env));
            } else if (i === ellipsis) {
              result.push(convertAssign(e, right.slice(ellipsis, (n = ellipsis + rightLength - leftLength + 1)), env));
            } else {
              result.push(convertAssign(e, right[n++], env));
            }
          }
        }
      } else {
        result.push(norm(['var', v = env.ssaVar('lst')]));
        result.push(norm(['=', v, convert(right, env)]));
        if (ellipsis === leftLength - 1) {
          for (i = _n = 0, _len5 = left.length; _n < _len5; i = ++_n) {
            e = left[i];
            if (i === 0) {
              continue;
            } else if (i < ellipsis) {
              result.push(convertAssign(e, norm(['direct!', ['index!', v, i - 1]]), env));
            } else {
              result.push(norm(['=', e, ['?:', ['binary!', '>=', ['attribute!', v, 'length'], leftLength - 1], makeSlice(v, i - 1), []]]));
            }
          }
        } else {
          result.push(norm(['var', _i = env.newVar('i')]));
          for (i = _o = 0, _len6 = left.length; _o < _len6; i = ++_o) {
            e = left[i];
            if (i === 0) {
              continue;
            } else if (i < ellipsis) {
              result.push(convertAssign(e, norm(['direct!', ['index!', v, i - 1]]), env));
            } else if (i === ellipsis) {
              result.push(norm(['=', e, ['?:', ['binary!', '>=', ['attribute!', v, 'length'], leftLength - 1], makeSlice(v, i, ['=', _i, ['binary!', '-', ['attribute!', v, 'length'], leftLength - i - 1]]), ['comma!', [['=', _i, ellipsis - 1], []]]]]));
            } else {
              result.push(norm(['=', e, ['index!', v, ['suffix!', '++', _i]]]));
            }
          }
        }
      }
      return begin(result);
    }
  } else {
    return norm([exp[0], convert(left, env), convert(exp[2], env)]);
  }
};

exports['='] = function(exp, env) {
  return convertAssign(exp, env);
};

exports['hashAssign!'] = function(exp, env) {
  var exp1, exp2, result, vObj, x, _i, _len;
  exp1 = exp[1];
  exp2 = exp[2];
  if (exp1.length > 1) {
    result = [];
    if (typeof entity(exp2) !== 'string') {
      vObj = env.newVar('obj');
      result.push(norm(['direct!', ['var', vObj]]));
      env.set(vObj.symbol, vObj);
      result.push(['=', vObj, exp1]);
    } else {
      vObj = exp2;
    }
    for (_i = 0, _len = exp1.length; _i < _len; _i++) {
      x = exp1[_i];
      result.push(norm(['=', x, ['attribute!', vObj, x]]));
    }
    return convert(begin(result), env);
  } else {
    return convert(norm(['=', exp1[0], ['attribute!', exp2, exp1[0]]]), env);
  }
};

exports['#='] = function(exp, env) {
  return ['##', convert([norm('='), exp[1], exp[2]], env)];
};

exports['#/'] = function(exp, env) {
  return ['#/', convert([norm('='), exp[1], exp[2]], env)];
};

exports['@@'] = function(exp, env) {
  var name, outerEnv, outerName, v;
  name = entity(exp[1]);
  outerEnv = env.outerVarScopeEnv();
  if (Object.prototype.toString.call(name) === '[object Array]') {
    return ['@@', name];
  }
  v = outerEnv.get(name);
  if (!(v = outerEnv.get(name))) {
    error('wrongly access to the outside scope variable which is not existed');
  }
  outerName = v.symbol;
  if (env !== outerEnv && env.fnLocalNames(name)[outerName]) {
    error('"' + name + '" is local variable, can not access outer "' + name + '"');
  }
  v.outer = true;
  env.set(name, v);
  return v;
};

exports['block!'] = function(exp, env) {
  return convertExps(exp.slice(1), env.extend({}));
};

exports['let'] = function(exp, env) {
  var newEnv, result, scope, var1, x, x0, _i, _len, _ref3;
  newEnv = env.extend(scope = {});
  result = [];
  _ref3 = exp[1];
  for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
    x = _ref3[_i];
    x0 = entity(x[0]);
    scope[x0] = var1 = newEnv.newVar(x0);
    result.push(['var', var1]);
    result.push(['=', var1, convert(x[2], env)]);
  }
  result.push(convert(exp[1], newEnv));
  result = begin(result);
  result.env = newEnv;
  return result;
};

exports['letm!'] = function(exp, env) {
  var newEnv, result, scope, var1, x, x0, _i, _len, _ref3;
  newEnv = env.extend(scope = {});
  result = [];
  _ref3 = exp[1];
  for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
    x = _ref3[_i];
    x0 = entity(x[0]);
    scope[x0] = var1 = env.newVar(x0);
    result.push([norm('var'), var1]);
    result.push([norm('='), var1, x[1]]);
  }
  result.push(convert(exp[1], newEnv));
  result = begin(result);
  return result;
};

exports['letrec!'] = function(exp, env) {
  var newEnv, result, scope, var1, x, x0, _i, _j, _len, _len1, _ref3, _ref4;
  newEnv = env.extend(scope = {});
  result = [];
  _ref3 = exp[1];
  for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
    x = _ref3[_i];
    scope[x0 = entity(x[0])] = var1 = newEnv.newVar(x0);
    result.push([norm('var'), var1]);
  }
  _ref4 = exp[1];
  for (_j = 0, _len1 = _ref4.length; _j < _len1; _j++) {
    x = _ref4[_j];
    result.push([norm('='), var1, convert(x[2], newEnv)]);
  }
  result.push(convert(exp[1], newEnv));
  result = begin(result);
  result.env = newEnv;
  return result;
};

keywordConvert = function(keyword) {
  return function(exp, env) {
    var e;
    return [keyword].concat((function() {
      var _i, _len, _ref3, _results;
      _ref3 = exp.slice(1);
      _results = [];
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        e = _ref3[_i];
        _results.push(convert(e, env));
      }
      return _results;
    })());
  };
};

(function() {
  var i, keywords, sym, symbols, _i, _len, _ref3, _results;
  symbols = 'throw return break label! if! cFor! while while! doWhile! try! try with! ?: ,';
  keywords = 'throw return break label!  if  cFor! while while  doWhile! try try with! ?: list!';
  _ref3 = splitSpace(symbols);
  _results = [];
  for (i = _i = 0, _len = _ref3.length; _i < _len; i = ++_i) {
    sym = _ref3[i];
    _results.push(exports[sym] = keywordConvert(splitSpace(keywords)[i]));
  }
  return _results;
})();

exports['begin!'] = function(exp, env) {
  var e;
  return begin((function() {
    var _i, _len, _ref3, _results;
    _ref3 = exp.slice(1);
    _results = [];
    for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
      e = _ref3[_i];
      _results.push(convert(e, env));
    }
    return _results;
  })());
};

exports['list!'] = function(exp, env) {
  return convertArgumentList(exp.slice(1), env);
};

exports['if'] = function(exp, env) {
  if (exp[3] !== void 0) {
    return [norm('if'), convert(exp[1], env), convertList(exp[2], env), convertList(exp[3], env)];
  } else {
    return [norm('if'), convert(exp[1], env), convertList(exp[2], env), undefinedExp];
  }
};

exports['switch!'] = function(exp, env) {
  var e, result;
  result = ['switch', convert(exp[1], env)];
  result.push((function() {
    var _i, _len, _ref3, _results;
    _ref3 = exp[2].slice(1);
    _results = [];
    for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
      e = _ref3[_i];
      _results.push([convertList(e[0].slice(1), env), convert(e[1], env)]);
    }
    return _results;
  })());
  if (exp[3]) {
    result.push(convert(exp[3], env));
  }
  return result;
};

idConvert = function(keyword) {
  return function(exp, env) {
    return [keyword, exp[1]];
  };
};

(function() {
  var word, _i, _len, _ref3, _results;
  _ref3 = splitSpace('break continue');
  _results = [];
  for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
    word = _ref3[_i];
    _results.push(exports[word] = idConvert(word));
  }
  return _results;
})();

exports['lineComment!'] = function(exp, env) {
  return '';
};

exports['directLineComment!'] = function(exp, env) {
  return [norm('directLineComment!'), exp[1]];
};

exports['codeBlockComment!'] = function(exp, env) {
  return '';
};

exports['directCBlockComment!'] = function(exp, env) {
  return [norm('directCBlockComment!'), exp[1]];
};

exports['direct!'] = function(exp, env) {
  return exp[1];
};

exports['quote!'] = function(exp, env) {
  return [norm('quote!'), entity(exp[1])];
};

exports['call!'] = function(exp, env) {
  return convert([exp[1]].concat(exp[2]), env);
};

exports['label!'] = function(exp, env) {
  return [norm('label!'), convertIdentifier(exp[1]), convert(exp[2], env)];
};

argumentsLength = ['attribute!', 'arguments', 'length'];

convertParametersWithEllipsis = function(exp, ellipsis, env) {
  var i, param, paramsLength, result, _i, _j, _len, _len1;
  result = [];
  paramsLength = exp.length;
  if (ellipsis === paramsLength - 1) {
    for (i = _i = 0, _len = exp.length; _i < _len; i = ++_i) {
      param = exp[i];
      result.push(['var', param]);
      if (i !== ellipsis) {
        result.push(norm(['=', param, ['index!', 'arguments', i]]));
      } else {
        result.push(norm(['=', param, ['?:', ['>=', argumentsLength, paramsLength], makeSlice('arguments', i), []]]));
      }
    }
  } else {
    result.push([norm('var'), _i = env.newVar('i')]);
    for (i = _j = 0, _len1 = exp.length; _j < _len1; i = ++_j) {
      param = exp[i];
      result.push(['var', param]);
      if (i < ellipsis) {
        result.push(norm(['=', param, ['index!', 'arguments', i]]));
      } else if (i === ellipsis) {
        result.push(norm(['=', param, ['?:', ['>=', argumentsLength, paramsLength], makeSlice('arguments', i, ['=', _i, ['-', argumentsLength, paramsLength - i - 1]]), ['binary,', ['=', _i, ellipsis], []]]]));
      } else {
        result.push(norm(['=', param, ['index!', 'arguments', ['x++', _i]]]));
      }
    }
  }
  return result;
};

convertDefinition = function(exp, env, mode) {
  var body, defaultList, ellipsis, exp1, exp2, functionExp, i, newEnv, param, param1, params, scope, thisParams, _i, _j, _len, _len1, _this;
  newEnv = env.extend(scope = {}, env.parser, env.module, {});
  if (mode === '=>' || mode === '|=>' || mode === '==>' || mode === '|==>') {
    _this = env.newVar('_this');
    scope['@'] = _this;
  } else {
    scope['@'] = 'this';
  }
  exp1 = exp[1];
  exp2 = exp[2];
  defaultList = [];
  thisParams = [];
  params = [];
  for (i = _i = 0, _len = exp1.length; _i < _len; i = ++_i) {
    param = exp1[i];
    param = entity(param);
    if (param[0] === 'x...') {
      if (typeof ellipsis === "undefined" || ellipsis === null) {
        ellipsis = i;
        param1 = param[1];
        if (param1[0] === 'attribute!') {
          params.push(param1[2]);
          thisParams.push(['=', param1, param1[2]]);
        } else {
          params.push(param1);
        }
      } else {
        error('mulitple ellipsis parameters is not permitted');
      }
    } else if (param[0] === '=') {
      param1 = param[1];
      if (param1[0] === 'attribute!') {
        thisParams.push(['=', param1, param1[2]]);
        param1 = param1[2];
        param = ['=', param1, param[2]];
      }
      defaultList.push(['if', ['==', param1, ['direct!', undefinedExp]], param]);
      params.push(param1);
    } else if (param[0] === 'attribute!') {
      params.push(param[2]);
      thisParams.push(['=', param, param[2]]);
    } else {
      params.push(param);
    }
  }
  if (ellipsis !== void 0) {
    body = convertParametersWithEllipsis(params, ellipsis, newEnv);
    params = [];
  } else {
    body = [];
    for (_j = 0, _len1 = params.length; _j < _len1; _j++) {
      param = params[_j];
      param = entity(param);
      scope[param] = param;
    }
  }
  body.push.apply(body, defaultList);
  body.push.apply(body, thisParams);
  body.push(exp2);
  if (mode[0] === '|') {
    body = convert(begin(body), newEnv);
  } else {
    body = return_(convert(begin(body), newEnv));
  }
  functionExp = norm(['function', params, body]);
  functionExp.env = newEnv;
  if (mode === '=>' || mode === '|=>') {
    return norm(['begin!', ['var', _this], ['=', _this, 'this'], functionExp]);
  } else {
    return functionExp;
  }
};

_ref3 = '-> |-> => |=>'.split(' ');
_fn = function(sym) {
  return exports[sym] = function(exp, env) {
    return convertDefinition(exp, env, sym);
  };
};
for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
  sym = _ref3[_i];
  _fn(sym);
}

exports['unquote!'] = function(exp, env) {
  return error('unexpected unquote!', exp);
};

exports['unquote-splice'] = function(exp, env) {
  return error('unexpected unquote-splice', exp);
};

exports['quasiquote!'] = function(exp, env) {
  return quasiquote(exp, env, 0);
};

quasiquote = function(exp, env, level) {
  var e, exp1, head, item, meetSplice, result, _j, _len1;
  exp1 = exp[1];
  if (!isArray(exp1)) {
    return JSON.stringify(entity(exp1));
  } else if (!exp1.length) {
    return [];
  }
  if ((head = entity(exp1[0])) === 'unquote!' || head === 'unquote-splice') {
    return convert(exp1[1], env, level - 1);
  } else if (head === 'quasiquote!') {
    return norm(['list!', '"quasiquote!"', quasiquote(exp1[1], env, level + 1)]);
  }
  result = ['list!'];
  meetSplice = false;
  for (_j = 0, _len1 = exp1.length; _j < _len1; _j++) {
    e = exp1[_j];
    if (isArray(e) && e.length) {
      head = entity(e[0]);
      if (head === 'unquote-splice' && level === 0) {
        result = norm(['call!', ['attribute!', result, 'concat'], [convert(e[1], env)]]);
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
          result.push(norm(['list!', '"quasiquote!"', quasiquote(e[1], env, level + 1)]));
        } else {
          result.push(quasiquote([e], env, level));
        }
      } else {
        if (head === 'unquote-splice') {
          item = [['list!', quasiquote(e[1], env, level - 1)]];
        } else {
          if (head === 'unquote!') {
            if (level === 0) {
              item = norm([['list!', convert(e[1], env)]]);
            } else {
              item = norm([['list!', ['"unquote!"', quasiquote(e[1], env, level - 1)]]]);
            }
          } else if (head === 'quasiquote!') {
            item = norm([['list!', ['quasiquote!', quasiquote(e[1], env, level + 1)]]]);
          } else {
            item = norm([['list!', [quasiquote(e, env, level)]]]);
          }
        }
        result = norm(['call!', ['attribute', result, 'concat'], item]);
      }
    } else {
      if (!meetSplice) {
        result.push(JSON.stringify(entity(e)));
      } else {
        result = norm(['call!', ['attribute!', result, 'concat'], [['list!', JSON.stringify(entity(e))]]]);
      }
    }
  }
  return result;
};

exports['eval!'] = function(exp, env) {
  var exp1, objCode, parser;
  exp1 = exp[1];
  if (isArray(exp1)) {
    if (exp1[0] === 'quote!') {
      return convert(exp1[1], env);
    } else if (exp1[0] === 'quasiquote!') {
      return convert(quasiquote(exp1[1], env), env);
    } else {
      return ['call!', 'eval', [nonMetaCompileExp(exp1, env)]];
    }
  } else if (typeof (exp1 = entity(exp1)) === 'string') {
    if (exp1[0] === '"') {
      exp = (parser = new Parser).parse(exp1.slice(1, exp1.length - 1), parser.moduleBody, 0, env);
      objCode = compileExp(exp.body, env.extend({}));
      return norm(['call!', 'eval', [objCode]]);
    } else {
      return norm(['call!', 'eval', exp1]);
    }
  } else {
    return norm(['call!', 'eval', [nonMetaCompileExp(exp1, env)]]);
  }
};

exports['metaEval!'] = function(exp, env) {
  return eval(nonMetaCompileExp(exp[1], env));
};

convertMetaExp = function(head) {
  return function(exp, env) {
    return [head, convert(exp[1], env)];
  };
};

exports['##'] = convertMetaExp('##');

exports['#'] = convertMetaExp('#');

exports['#/'] = convertMetaExp('#/');

exports['#call!'] = function(exp, env) {
  return ['#call', convert(exp[1], env), convert(exp[2], env)];
};

exports['%x'] = function(exp, env) {
  return convert(norm(['attribute!', '__$taiji_$_$parser__', exp[1]]), env);
};

exports['%/'] = function(exp, env) {
  return convert(convertParserAttribute(exp[1]), env);
};

convertParserAttribute = function(exp) {
  var result;
  if (Object.prototype.toString.call(exp) === '[object Array]') {
    if (exp[1] === 'attribute!' || exp[1] === 'call!' || exp[1] === 'index!') {
      exp[1] = convertParserAttribute(exp[1]);
    }
    return exp;
  } else if (typeof exp === 'object') {
    if (typeof exp.value === 'string' && exp[1] !== '"') {
      result = norm(['attribute!', '__$taiji_$_$parser__', exp.value]);
      return extend(result, exp);
    } else {
      return exp;
    }
  } else {
    return exp;
  }
};

exports['%!'] = function(exp, env) {
  return convert(convertParserExpression(exp[1]), env);
};

convertParserExpression = function(exp) {
  var e, i, result, _j, _len1;
  if (Object.prototype.toString.call(exp) === '[object Array]') {
    for (i = _j = 0, _len1 = exp.length; _j < _len1; i = ++_j) {
      e = exp[i];
      exp[i] = convertParserExpression(e);
    }
    return exp;
  } else if (typeof exp === 'object') {
    if (typeof exp.value === 'string' && exp[1] !== '"') {
      result = norm(['attribute!', '__$taiji_$_$parser__', exp.value]);
      return extend(result, exp);
    } else {
      return exp;
    }
  } else {
    return exp;
  }
};

exports['binary!'] = function(exp, env, compiler) {
  return binaryConverters[exp[1].value](exp, env);
};

exports.binaryConverters = binaryConverters = {};

binaryConverters['concat[]'] = function(exp, env, compiler) {
  var subscript;
  trace("binaryConverters('concat[]'):", str(exp));
  subscript = exp[3][1];
  if (subscript.length === 0 || subscript.length > 1) {
    compileError(exp, 'wrong subscript: ');
  }
  return norm(['index!', convert(exp[2], env), convert(subscript[0], env)]);
};

binaryConverters['concat()'] = function(exp, env, compiler) {
  return norm(['call!', convert(exp[2], env), convert(exp[3], env)]);
};

exports['{}'] = function(exp, env) {
  return convert(exp[1], env);
};

exports['()'] = function(exp, env) {
  return convert(exp[1], env);
};

exports['[]'] = function(exp, env) {
  var e, items;
  items = (function() {
    var _j, _len1, _ref4, _results;
    _ref4 = exp[1];
    _results = [];
    for (_j = 0, _len1 = _ref4.length; _j < _len1; _j++) {
      e = _ref4[_j];
      _results.push(convert(e, env));
    }
    return _results;
  })();
  items.unshift(norm('list!'));
  items.kind = LIST;
  return items;
};
