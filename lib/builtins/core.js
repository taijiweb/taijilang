__slice = [].slice;
var Parser, addPrelude, argumentsLength, begin, compileExp, convert, convertAssign, convertAssignRight, convertDefinition, convertEllipsisList, convertExps, convertIdentifier, convertList, convertMacro, convertMetaExp, convertParametersWithEllipsis, convertParserAttribute, convertParserExpression, declareVar, entity, error, extend, fs, idConvert, isArray, keywordConvert, makeSlice, metaIndex, metaProcess, metaProcessConvert, quasiquote, return_, splitSpace, sym, transformToCode, undefinedExp, _fn, _i, _len, _ref, _ref1, _ref2;

fs = require('fs');

_ref = require('../utils'), convertIdentifier = _ref.convertIdentifier, entity = _ref.entity, begin = _ref.begin, error = _ref.error, isArray = _ref.isArray, error = _ref.error, extend = _ref.extend, splitSpace = _ref.splitSpace, return_ = _ref.return_, undefinedExp = _ref.undefinedExp, addPrelude = _ref.addPrelude;

Parser = require('../parser').Parser;

_ref1 = require('../compiler'), convert = _ref1.convert, convertList = _ref1.convertList, convertEllipsisList = _ref1.convertEllipsisList, convertExps = _ref1.convertExps, compileExp = _ref1.compileExp, transformToCode = _ref1.transformToCode, metaProcessConvert = _ref1.metaProcessConvert, metaProcess = _ref1.metaProcess;

metaIndex = 0;

exports['extern!'] = function(exp, env) {
  var e, isConst, v, _i, _len;
  if (exp[0] === 'const') {
    isConst = true;
    exp = exp.slice(1);
  }
  for (_i = 0, _len = exp.length; _i < _len; _i++) {
    e = exp[_i];
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
  return ['metaConvertVar!', exp[0]];
};

declareVar = function(fn) {
  return function(exp, env) {
    var e, e0, e2, result, v, _i, _len;
    result = [];
    for (_i = 0, _len = exp.length; _i < _len; _i++) {
      e = exp[_i];
      e0 = entity(e);
      if (typeof e0 === 'string') {
        if (e0[0] === '"') {
          error('variable name should not be a string');
        }
        if (env.hasLocal(e)) {
          error('repeat declaring variable: ' + e0);
        }
        v = env.set(e0, e);
        fn(v);
        if (v["const"]) {
          error('const need to be initialized to a value');
        }
        result.push(['var', v]);
        result.push(v);
      } else if (Object.prototype.toString.call(e) === '[object Array]' && e[0] === 'metaConvertVar!') {
        result.push(['var', e]);
      } else {
        e0 = entity(e[0]);
        if (typeof e0 !== 'string' || e0[0] === '"') {
          error('illegal variable name in variable initialization: ' + JSON.stringify(e0));
        }
        v = env.newVar(e0);
        fn(v);
        result.push(['var', v]);
        if ((e2 = entity(e[2])) && e2[1] === '=' && typeof e2[0] === 'string' && e2[0][0] !== '"') {
          result.push(['=', v, convert([exp[0], e[2]], env)]);
          result.push(v);
        } else {
          result.push(['=', v, convert(e[2], env)]);
          result.push(v);
        }
        env.set(e0, v);
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

makeSlice = function(obj, start, stop) {
  if (stop === void 0) {
    return ['call!', ['attribute!', '__slice', 'call'], [obj, start]];
  } else {
    return ['call!', ['attribute!', '__slice', 'call'], [obj, start, stop]];
  }
};

convertAssignRight = function(right, env) {
  if (right === void 0) {
    return undefinedExp;
  } else {
    return convert(right, env);
  }
};

convertAssign = function(left, right, env) {
  var e, eLeft, ellipsis, i, item, leftLength, n, result, rightLength, v, x, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _len6, _m, _n, _o, _ref2, _ref3;
  eLeft = entity(left);
  if (typeof eLeft === 'string') {
    if (eLeft[0] === '"') {
      return error('wrong assign to string left side');
    } else if (env.hasFnLocal(eLeft)) {
      left = env.get(eLeft);
      if (left.outer) {
        error('outer scope variable "' + eLeft + '" is not permitted to assign to local vaiable with the same identifier');
      }
      if (left["const"]) {
        error('should not assign value to const variable: ' + eLeft);
      }
      return ['=', left, convertAssignRight(right, env)];
    } else {
      env.set(eLeft, left = env.newVar(eLeft));
      left["const"] = true;
      return ['begin!', ['var', left], ['=', left, convertAssignRight(right, env)], left];
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
      if (right[0] === 'list!') {
        if (left.length > 1) {
          result = [];
          _ref2 = left.slice(1);
          for (i = _j = 0, _len1 = _ref2.length; _j < _len1; i = ++_j) {
            e = _ref2[i];
            result.push(convertAssign(e, right[i + 1], env));
          }
          return begin(result);
        } else {
          return convertAssign(left[1], right[1], env);
        }
      } else {
        if (left.length > 1) {
          result = [];
          result.push(['var', v = env.ssaVar('lst')]);
          result.push(['=', v, convert(right, env)]);
          _ref3 = left.slice(1);
          for (i = _k = 0, _len2 = _ref3.length; _k < _len2; i = ++_k) {
            e = _ref3[i];
            result.push(convertAssign(e, ['direct!', ['index!', v, i]], env));
          }
          return begin(result);
        } else {
          return convertAssign(left[1], ['index!', right, 0], env);
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
        result.push(['var', v = env.ssaVar('lst')]);
        result.push(['=', v, convert(right, env)]);
        if (ellipsis === leftLength - 1) {
          for (i = _n = 0, _len5 = left.length; _n < _len5; i = ++_n) {
            e = left[i];
            if (i === 0) {
              continue;
            } else if (i < ellipsis) {
              result.push(convertAssign(e, ['direct!', ['index!', v, i - 1]], env));
            } else {
              result.push(['=', e, ['?:', ['binary!', '>=', ['attribute!', v, 'length'], leftLength - 1], makeSlice(v, i - 1), []]]);
            }
          }
        } else {
          result.push(['var', _i = env.newVar('i')]);
          for (i = _o = 0, _len6 = left.length; _o < _len6; i = ++_o) {
            e = left[i];
            if (i === 0) {
              continue;
            } else if (i < ellipsis) {
              result.push(convertAssign(e, ['direct!', ['index!', v, i - 1]], env));
            } else if (i === ellipsis) {
              result.push(['=', e, ['?:', ['binary!', '>=', ['attribute!', v, 'length'], leftLength - 1], makeSlice(v, i, ['=', _i, ['binary!', '-', ['attribute!', v, 'length'], leftLength - i - 1]]), ['comma!', [['=', _i, ellipsis - 1], []]]]]);
            } else {
              result.push(['=', e, ['index!', v, ['suffix!', '++', _i]]]);
            }
          }
        }
      }
      return begin(result);
    }
  } else {
    return ['=', convert(left, env), convertAssignRight(right, env)];
  }
};

exports['='] = function(exp, env) {
  return convertAssign(exp[0], exp[1], env);
};

exports['#='] = function(exp, env) {
  return ['##', convert(['=', exp[0], exp[1]], env)];
};

exports['#/'] = function(exp, env) {
  return ['#/', convert(['=', exp[0], exp[1]], env)];
};

exports['@@'] = function(exp, env) {
  var name, outerEnv, v;
  name = entity(exp[0]);
  outerEnv = env.outerVarScopeEnv();
  if (Object.prototype.toString.call(name) === '[object Array]') {
    return ['@@', name];
  }
  if (env !== outerEnv && env.hasFnLocal(name)) {
    error('"' + name + '" is local variable, can not access outer "' + name + '"');
  }
  if (!(v = outerEnv.get(name))) {
    error('wrongly access to the outside scope variable which is not existed');
  }
  v.outer = true;
  env.set(name, v);
  return v;
};

exports['block'] = function(exp, env) {
  return convertExps(exp, env.extend({}));
};

exports['let'] = function(exp, env) {
  var newEnv, result, scope, var1, x, x0, _i, _len, _ref2;
  newEnv = env.extend(scope = {});
  result = [];
  _ref2 = exp[0];
  for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
    x = _ref2[_i];
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
  var newEnv, result, scope, var1, x, x0, _i, _len, _ref2;
  newEnv = env.extend(scope = {});
  result = [];
  _ref2 = exp[0];
  for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
    x = _ref2[_i];
    x0 = entity(x[0]);
    scope[x0] = var1 = env.newVar(x0);
    result.push(['var', var1]);
    result.push(['=', var1, x[1]]);
  }
  result.push(convert(exp[1], newEnv));
  result = begin(result);
  return result;
};

exports['letrec!'] = function(exp, env) {
  var newEnv, result, scope, var1, x, x0, _i, _j, _len, _len1, _ref2, _ref3;
  newEnv = env.extend(scope = {});
  result = [];
  _ref2 = exp[0];
  for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
    x = _ref2[_i];
    scope[x0 = entity(x[0])] = var1 = newEnv.newVar(x0);
    result.push(['var', var1]);
  }
  _ref3 = exp[0];
  for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
    x = _ref3[_j];
    result.push(['=', var1, convert(x[2], newEnv)]);
  }
  result.push(convert(exp[1], newEnv));
  result = begin(result);
  result.env = newEnv;
  return result;
};

exports['letloop!'] = function(exp, env) {
  var bindings, exp0, fnBodyEnv, fnScope, i, newEnv, p, p1, params, result, scope, value, x, x0, _i, _len;
  newEnv = env.extend(scope = {});
  result = [];
  exp0 = exp[0];
  for (_i = 0, _len = exp0.length; _i < _len; _i++) {
    x = exp0[_i];
    x0 = entity(x[0]);
    scope[x0] = newEnv.newVar(x0);
  }
  params = [];
  bindings = (function() {
    var _j, _k, _l, _len1, _len2, _len3, _ref2, _results;
    _results = [];
    for (_j = 0, _len1 = exp0.length; _j < _len1; _j++) {
      x = exp0[_j];
      value = x[2];
      if (value && value.push && value[0].value === '->') {
        _ref2 = value[1];
        for (i = _k = 0, _len2 = _ref2.length; _k < _len2; i = ++_k) {
          p = _ref2[i];
          p1 = entity(p);
          if (!params[i]) {
            params.push(p1);
          } else if (p1 !== params[i]) {
            error('different parameter list for functions in letloop bindings is not allowed', p);
          }
        }
      }
      if (!fnBodyEnv) {
        fnBodyEnv = newEnv.extend(fnScope = {});
      }
      for (_l = 0, _len3 = params.length; _l < _len3; _l++) {
        p = params[_l];
        fnScope[p] = {
          symbol: p
        };
      }
      _results.push([scope[entity(x[0])], return_(convert(begin(value[2]), fnBodyEnv))]);
    }
    return _results;
  })();
  exp = ['letloop!', params, bindings, convert(exp[1], newEnv)];
  exp.env = newEnv;
  result.push(exp);
  result = begin(result);
  result.env = newEnv;
  return result;
};

keywordConvert = function(keyword) {
  return function(exp, env) {
    var e;
    return [keyword].concat((function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = exp.length; _i < _len; _i++) {
        e = exp[_i];
        _results.push(convert(e, env));
      }
      return _results;
    })());
  };
};

(function() {
  var i, keywords, sym, symbols, _i, _len, _ref2, _results;
  symbols = 'throw return break label! if! cFor! forIn! forOf! while! doWhile! try! with! ?: ,';
  keywords = 'throw return break label!  if  cFor! forIn!  forOf!  while  doWhile! try with! ?: list!';
  _ref2 = splitSpace(symbols);
  _results = [];
  for (i = _i = 0, _len = _ref2.length; _i < _len; i = ++_i) {
    sym = _ref2[i];
    _results.push(exports[sym] = keywordConvert(splitSpace(keywords)[i]));
  }
  return _results;
})();

exports['begin!'] = function(exp, env) {
  var e;
  return begin((function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = exp.length; _i < _len; _i++) {
      e = exp[_i];
      _results.push(convert(e, env));
    }
    return _results;
  })());
};

exports['list!'] = convertEllipsisList;

exports['if'] = function(exp, env) {
  if (exp[2] !== void 0) {
    return ['if', convert(exp[0], env), convert(exp[1], env), convert(exp[2], env)];
  } else {
    return ['if', convert(exp[0], env), convert(exp[1], env)];
  }
};

exports['switch!'] = function(exp, env) {
  var e, result;
  result = ['switch', convert(exp[0], env)];
  result.push((function() {
    var _i, _len, _ref2, _results;
    _ref2 = exp[1].slice(1);
    _results = [];
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      e = _ref2[_i];
      _results.push([convertList(e[0].slice(1), env), convert(e[1], env)]);
    }
    return _results;
  })());
  if (exp[2]) {
    result.push(convert(exp[2], env));
  }
  return result;
};

idConvert = function(keyword) {
  return function(exp, env) {
    return [keyword, exp[0]];
  };
};

(function() {
  var word, _i, _len, _ref2, _results;
  _ref2 = splitSpace('break continue');
  _results = [];
  for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
    word = _ref2[_i];
    _results.push(exports[word] = idConvert(word));
  }
  return _results;
})();

exports['lineComment!'] = function(exp, env) {
  return '';
};

exports['codeBlockComment!'] = function(exp, env) {
  return '';
};

exports['direct!'] = function(exp, env) {
  return exp[0];
};

exports['quote!'] = function(exp, env) {
  return ['quote!', entity(exp[0])];
};

exports['call!'] = function(exp, env) {
  return convert([exp[0]].concat(exp[1]), env);
};

exports['label!'] = function(exp, env) {
  return ['label!', convertIdentifier(exp[0]), convert(exp[1], env)];
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
        result.push(['=', param, ['index!', 'arguments', i]]);
      } else {
        result.push(['=', param, ['?:', ['>=', argumentsLength, paramsLength], makeSlice('arguments', i), []]]);
      }
    }
  } else {
    result.push(['var', _i = env.newVar('i')]);
    for (i = _j = 0, _len1 = exp.length; _j < _len1; i = ++_j) {
      param = exp[i];
      result.push(['var', param]);
      if (i < ellipsis) {
        result.push(['=', param, ['index!', 'arguments', i]]);
      } else if (i === ellipsis) {
        result.push(['=', param, ['?:', ['>=', argumentsLength, paramsLength], makeSlice('arguments', i, ['=', _i, ['-', argumentsLength, paramsLength - i - 1]]), ['binary,', ['=', _i, ellipsis], []]]]);
      } else {
        result.push(['=', param, ['index!', 'arguments', ['x++', _i]]]);
      }
    }
  }
  return result;
};

convertDefinition = function(exp, env, mode) {
  var body, defaultList, ellipsis, exp0, exp1, functionExp, i, newEnv, param, param1, params, scope, thisParams, _i, _j, _len, _len1, _this;
  newEnv = env.extend(scope = {}, env.parser, env.module, {});
  if (mode === '=>' || mode === '|=>' || mode === '==>' || mode === '|==>') {
    _this = env.newVar('_this');
    scope['@'] = _this;
  } else {
    scope['@'] = 'this';
  }
  exp0 = exp[0];
  exp1 = exp[1];
  defaultList = [];
  thisParams = [];
  params = [];
  for (i = _i = 0, _len = exp0.length; _i < _len; i = ++_i) {
    param = exp0[i];
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
  body.push.apply(body, exp1);
  if (mode[0] === '|') {
    body = convert(begin(body), newEnv);
  } else {
    body = return_(convert(begin(body), newEnv));
  }
  functionExp = ['function', params, body];
  functionExp.env = newEnv;
  if (mode === '=>' || mode === '|=>') {
    return ['begin!', ['var', _this], ['=', _this, 'this'], functionExp];
  } else {
    return functionExp;
  }
};

_ref2 = '-> |-> => |=>'.split(' ');
_fn = function(sym) {
  return exports[sym] = function(exp, env) {
    return convertDefinition(exp, env, sym);
  };
};
for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
  sym = _ref2[_i];
  _fn(sym);
}

convertMacro = function(exp, env, mode) {
  var fnCode, macroFn, resultExp;
  resultExp = convertDefinition(exp, env, mode);
  fnCode = transformToCode(resultExp, resultExp.newEnv);
  macroFn = eval('(' + fnCode + ')');
  macroFn.expression = exp;
  return function(exp, env) {
    var expanded;
    expanded = macroFn.apply(null, exp);
    return convert(expanded, env);
  };
};

exports['unquote!'] = function(exp, env) {
  return error('unexpected unquote!', exp);
};

exports['unquote-splice'] = function(exp, env) {
  return error('unexpected unquote-splice', exp);
};

exports['quasiquote!'] = quasiquote = function(exp, env) {
  var e, exp0, head, meetSplice, result, _j, _len1, _ref3;
  exp0 = exp[0];
  if (!isArray(exp0)) {
    return ['quote!', entity(exp0)];
  } else if (!exp0.length) {
    return [];
  }
  if ((head = entity(exp0[0])) === 'unquote!' || head === 'unquote-splice') {
    return convert(exp0[1], env);
  }
  result = ['list!'];
  meetSplice = false;
  _ref3 = exp[0];
  for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
    e = _ref3[_j];
    if (isArray(e) && e.length) {
      head = entity(e[0]);
      if (head === 'unquote-splice') {
        result = ['call!', ['attribute!', result, 'concat'], [convert(e[1], env)]];
        meetSplice = true;
      } else {
        if (!meetSplice) {
          if (head === 'unquote!') {
            result.push(convert(e[1], env));
          } else {
            result.push(quasiquote([e], env));
          }
        } else {
          if (head === 'unquote!') {
            result = ['call!', ['attribute', result, 'concat'], [['list!', convert(e[1], env)]]];
          } else {
            result = ['call!', ['attribute!', result, 'concat'], [['list!', quasiquote([e], env)]]];
          }
        }
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

exports['eval!'] = function(exp, env) {
  var exp0, objCode, parser;
  exp0 = exp[0];
  if (isArray(exp0)) {
    if (exp0[0] === 'quote!') {
      return convert(exp0[1], env);
    } else if (exp0[0] === 'quasiquote!') {
      return convert(quasiquote(exp0[1], env), env);
    } else {
      return ['call!', 'eval', [compileExp(exp0, env)]];
    }
  } else if (typeof (exp0 = entity(exp0)) === 'string') {
    if (exp0[0] === '"') {
      exp = (parser = new Parser).parse(exp0.slice(1, exp0.length - 1), parser.moduleBody, 0, env);
      objCode = compileExp(exp.body, env.extend({}));
      return ['call!', 'eval', [objCode]];
    } else {
      return ['call!', 'eval', exp0];
    }
  } else {
    return ['call!', 'eval', [compileExp(exp0, env)]];
  }
};

convertMetaExp = function(head) {
  return function(exp, env) {
    return [head, convert(exp[0], env)];
  };
};

exports['##'] = convertMetaExp('##');

exports['#'] = convertMetaExp('#');

exports['#/'] = convertMetaExp('#/');

exports['#call!'] = function(exp, env) {
  return ['#call', convert(exp[0], env), convert(exp[1], env)];
};

exports['?/'] = function(exp, env) {
  return convert(convertParserAttribute(exp[0]), env);
};

convertParserAttribute = function(exp) {
  var result;
  if (Object.prototype.toString.call(exp) === '[object Array]') {
    if (exp[0] === 'attribute!' || exp[0] === 'call!' || exp[0] === 'index!') {
      exp[1] = convertParserAttribute(exp[1]);
    }
    return exp;
  } else if (typeof exp === 'object') {
    if (typeof exp.value === 'string' && exp[0] !== '"') {
      result = ['attribute!', '__$taiji_$_$parser__', exp.value];
      return extend(result, exp);
    } else {
      return exp;
    }
  } else {
    return exp;
  }
};

exports['?!'] = function(exp, env) {
  return convert(convertParserExpression(exp[0]), env);
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
    if (typeof exp.value === 'string' && exp[0] !== '"') {
      result = ['attribute!', '__$taiji_$_$parser__', exp.value];
      return extend(result, exp);
    } else {
      return exp;
    }
  } else {
    return exp;
  }
};

exports['?attribute'] = function(exp, env) {
  return convert(['attribute!', '__$taiji_$_$parser__', exp[0]], env);
};
