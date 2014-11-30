var LIST, LIST$, Parser, SYMBOL, VALUE, addPrelude, argumentsLength, begin, binaryConverters, commaList, compileError, compileExp, convert, convertArgumentList, convertAssign, convertDefinition, convertExps, convertIdentifier, convertList, convertMetaExp, convertParametersWithEllipsis, convertParserAttribute, convertParserExpression, error, extend, fs, idConvert, isArray, keywordConvert, makeSlice, metaIndex, metaProcess, metaProcessConvert, nonMetaCompileExp, prefixConverters, quasiquote, return_, splitSpace, str, suffixConverters, sym, symbol, symbolOf, trace, transformToCode, undefinedExp, _fn, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3, _ref4;

_ref = require('../utils'), str = _ref.str, trace = _ref.trace, convertIdentifier = _ref.convertIdentifier, begin = _ref.begin, return_ = _ref.return_, error = _ref.error, error = _ref.error, extend = _ref.extend, splitSpace = _ref.splitSpace, undefinedExp = _ref.undefinedExp, addPrelude = _ref.addPrelude, symbolOf = _ref.symbolOf, commaList = _ref.commaList, isArray = _ref.isArray;

_ref1 = require('../constant'), VALUE = _ref1.VALUE, SYMBOL = _ref1.SYMBOL, LIST = _ref1.LIST, LIST$ = _ref1.LIST$;

compileError = require('../compiler/helper').compileError;

__slice = [].slice;

fs = require('fs');

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
    if (env.hasLocal(v = symbolOf(e))) {
      error(v + ' has been declared as local variable, so it can not be declared as extern variable any more.', e);
    }
    env.set(v, e);
    if (isConst) {
      e["const"] = true;
    }
  }
  return '';
};

exports['var'] = function(exp, env) {
  var e, result, v, _i, _len, _ref3;
  result = [];
  _ref3 = exp.slice(1);
  for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
    e = _ref3[_i];
    trace('convert ', str(e));
    if (e.kind === SYMBOL) {
      if (env.hasLocal(e.value)) {
        error('repeat declaring variable: ' + str(e));
      }
      v = env.set(e.value, e);
      result.push([exp[0], v]);
    } else {
      error('only identifiers can be in var statement');
    }
  }
  return begin(result);
};

exports['newvar!'] = function(exp, env) {
  var x;
  return '"' + env.newVar((x = exp[1].value).slice(1, x.length - 1)).symbol + '"';
};

makeSlice = function(obj, start, stop) {
  if (stop === void 0) {
    return ['call!', ['attribute!', '__slice', 'call'], [obj, start]];
  } else {
    return ['call!', ['attribute!', '__slice', 'call'], [obj, start, stop]];
  }
};

convertAssign = function(left, right, env) {
  var e, ellipsis, i, item, leftLength, leftValue, n, result, rightLength, v, x, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _len6, _m, _n, _o, _ref3, _ref4;
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
        return ['begin!', ['var', left], ['=', left, convert(right, env)], left];
      } else {
        return ['=', left, convert(right, env)];
      }
    } else {
      env.set(leftValue, left = env.newVar(leftValue));
      left["const"] = true;
      return ['begin!', ['var', left], ['=', left, convert(right, env)], left];
    }
  } else if (left[0] === LIST$) {
    ellipsis = void 0;
    for (i = _i = 0, _len = left.length; _i < _len; i = ++_i) {
      item = left[i];
      x = item.value;
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
      if (right[0] === LIST$) {
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
          result.push(['var', v = env.ssaVar('lst')]);
          result.push(['=', v, convert(right, env)]);
          _ref4 = left.slice(1);
          for (i = _k = 0, _len2 = _ref4.length; _k < _len2; i = ++_k) {
            e = _ref4[i];
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
      if (right[0] === LIST$) {
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
    return [exp[0], convert(left, env), convert(right, env)];
  }
};

exports['='] = function(exp, env) {
  return convertAssign(exp[1], exp[2], env);
};

exports['hashAssign!'] = function(exp, env) {
  var exp1, exp2, result, vObj, x, _i, _len;
  exp1 = exp[1];
  exp2 = exp[2];
  if (exp1.length > 1) {
    result = [];
    if (exp2.kind !== SYMBOL) {
      vObj = env.newVar('obj');
      result.push(['direct!', ['var', vObj]]);
      env.set(vObj.symbol, vObj);
      result.push(['=', vObj, exp1]);
    } else {
      vObj = exp2;
    }
    for (_i = 0, _len = exp1.length; _i < _len; _i++) {
      x = exp1[_i];
      result.push(['=', x, ['attribute!', vObj, x]]);
    }
    return convert(begin(result), env);
  } else {
    return convert(['=', exp1[0], ['attribute!', exp2, exp1[0]]], env);
  }
};

exports['#='] = function(exp, env) {
  return ['##', convert(['=', exp[1], exp[2]], env)];
};

exports['#/'] = function(exp, env) {
  return ['#/', convert(['=', exp[1], exp[2]], env)];
};

exports['@@'] = function(exp, env) {
  var name, outerEnv, outerName, v;
  name = exp[1].value;
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
    return [IF, convert(exp[1], env), convert(exp[2], env), convert(exp[3], env)];
  } else {
    return [IF, convert(exp[1], env), convert(exp[2], env), undefinedExp];
  }
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

exports['direct!'] = function(exp, env) {
  return exp[1];
};

exports['quote!'] = function(exp, env) {
  return ['quote!', exp[1]];
};

exports['~'] = function(exp, env) {
  return ['quote!', exp[1]];
};

exports['call!'] = function(exp, env) {
  return convert([exp[1]].concat(exp[2]), env);
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
  functionExp = ['function', params, body];
  functionExp.env = newEnv;
  if (mode === '=>' || mode === '|=>') {
    return ['begin!', ['var', _this], ['=', _this, 'this'], functionExp];
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
    return [LIST$, '"quasiquote!"', quasiquote(exp1[1], env, level + 1)];
  }
  result = [LIST$];
  meetSplice = false;
  for (_j = 0, _len1 = exp1.length; _j < _len1; _j++) {
    e = exp1[_j];
    if (isArray(e) && e.length) {
      head = entity(e[0]);
      if (head === 'unquote-splice' && level === 0) {
        result = ['call!', ['attribute!', result, 'concat'], [convert(e[1], env)]];
        meetSplice = true;
      } else if (!meetSplice) {
        if (head === 'unquote-splice') {
          result.push([LIST$, '"unquote-splice"', quasiquote(e[1], env, level - 1)]);
        } else if (head === 'unquote!') {
          if (level === 0) {
            result.push(convert(e[1], env));
          } else {
            result.push(['unquote!', quasiquote(e[1], env, level - 1)]);
          }
        } else if (head === 'quasiquote!') {
          result.push([LIST$, '"quasiquote!"', quasiquote(e[1], env, level + 1)]);
        } else {
          result.push(quasiquote([e], env, level));
        }
      } else {
        if (head === 'unquote-splice') {
          item = [[LIST$, quasiquote(e[1], env, level - 1)]];
        } else {
          if (head === 'unquote!') {
            if (level === 0) {
              item = [[LIST$, convert(e[1], env)]];
            } else {
              item = [[LIST$, ['"unquote!"', quasiquote(e[1], env, level - 1)]]];
            }
          } else if (head === 'quasiquote!') {
            item = [[LIST$, ['quasiquote!', quasiquote(e[1], env, level + 1)]]];
          } else {
            item = [[LIST$, [quasiquote(e, env, level)]]];
          }
        }
        result = ['call!', ['attribute', result, 'concat'], item];
      }
    } else {
      if (!meetSplice) {
        result.push(JSON.stringify(entity(e)));
      } else {
        result = ['call!', ['attribute!', result, 'concat'], [[LIST$, JSON.stringify(entity(e))]]];
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
      return ['call!', 'eval', [objCode]];
    } else {
      return ['call!', 'eval', exp1];
    }
  } else {
    return ['call!', 'eval', [nonMetaCompileExp(exp1, env)]];
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
  return convert(['attribute!', '__$taiji_$_$parser__', exp[1]], env);
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
      result = ['attribute!', '__$taiji_$_$parser__', exp.value];
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
      result = ['attribute!', '__$taiji_$_$parser__', exp.value];
      return extend(result, exp);
    } else {
      return exp;
    }
  } else {
    return exp;
  }
};

exports['prefix!'] = function(exp, env, compiler) {
  return prefixConverters[exp[1].value](exp, env);
};

exports.prefixConverters = prefixConverters = {};

_ref4 = '++ -- yield new typeof void ! ~ + -'.split(' ');
for (_j = 0, _len1 = _ref4.length; _j < _len1; _j++) {
  symbol = _ref4[_j];
  prefixConverters['+'] = function(exp, env) {
    return ['prefix!', exp[1], convert(exp[2], env)];
  };
}

prefixConverters['@'] = function(exp, env) {
  if (symbolOf(exp[2]) === '::') {
    return ['attribute!', 'this', 'prototype'];
  }
  return ['attribute!', 'this', exp[2]];
};

prefixConverters['::'] = function(exp, env) {
  return ['attribute!', ['attribute!', 'this', 'prototype'], exp[2]];
};

exports['suffix!'] = function(exp, env, compiler) {
  return suffixConverters[exp[1].value](exp, env);
};

exports.suffixConverters = suffixConverters = {};

suffixConverters['::'] = function(exp, env) {
  return ['attribute!', convert(exp[2], env), 'prototype'];
};

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
  subscript = exp[3].value[1];
  if (subscript.length === 0 || subscript.length > 1) {
    compileError(exp, 'wrong subscript: ');
  }
  return ['index!', convert(exp[2], env), convert(subscript[0], env)];
};

binaryConverters['concat()'] = function(exp, env, compiler) {
  var args, exp3;
  exp3 = exp[3];
  args = exp3[1];
  if (isArray(args)) {
    if (symbolOf(args[0]) === 'binary!' && symbolOf(args[1]) === ',') {
      args = convertArgumentList(commaList(args), env);
    } else {
      args = [convert(args, env)];
    }
  } else if (args) {
    args = [convert(args, env)];
  } else {
    args = [];
  }
  return ['call!', convert(exp[2], env), args];
};

binaryConverters['::'] = function(exp, env, compiler) {
  return ['attribute!', ['attribute!', convert(exp[2], env), 'prototype'], exp[3]];
};

exports['{}'] = function(exp, env) {
  return convert(exp[1], env);
};

binaryConverters[','] = function(exp, env) {
  var e, result;
  result = (function() {
    var _k, _len2, _ref5, _results;
    _ref5 = commaList(exp);
    _results = [];
    for (_k = 0, _len2 = _ref5.length; _k < _len2; _k++) {
      e = _ref5[_k];
      _results.push(convert(e, env));
    }
    return _results;
  })();
  result.unshift(LIST$);
  return result;
};

exports['()'] = function(exp, env) {
  if (isArray(exp[1])) {
    if (symbolOf(exp[1][0]) === 'binary!' && symbolOf(exp[1][1]) === ',') {
      return convertArgumentList(commaList(exp[1]), env);
    } else {
      return convert(exp[1], env);
    }
  } else if (exp[1]) {
    return convert(exp[1], env);
  } else {
    return [];
  }
};

exports['[]'] = function(exp, env) {
  var e, items;
  items = (function() {
    var _k, _len2, _ref5, _results;
    _ref5 = exp[1];
    _results = [];
    for (_k = 0, _len2 = _ref5.length; _k < _len2; _k++) {
      e = _ref5[_k];
      _results.push(convert(e, env));
    }
    return _results;
  })();
  items.unshift(LIST$);
  return {
    value: items,
    kind: LIST
  };
};
