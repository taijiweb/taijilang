var $atMetaExpList, BLOCK_COMMENT, BRACKET, CODE_BLOCK_COMMENT, CONCAT_LINE, CURVE, DATA_BRACKET, Environment, FUNCTION, HALF_DENT, HEAD_SPACES, IDENTIFIER, INDENT, INDENT_EXPRESSION, INLINE_COMMENT, INTERPOLATE_STRING, LINE_COMMENT, MODULE, MODULE_HEADER, NEWLINE, NON_INTERPOLATE_STRING, NUMBER, PAREN, PUNCT, REGEXP, SPACES, SPACES_INLINE_COMMENT, STRING, SYMBOL, UNDENT, analyze, compileExp, compileExpNoOptimize, constant, convert, convertEllipsisList, convertExps, entity, error, evaljs, extend, getStackTrace, hasMeta, isArray, madeCall, madeConcat, metaConvert, metaConvertFnMap, metaProcess, metaTransform, nonMetaCompileExp, nonMetaCompileExpNoOptimize, optimize, optimizeExp, preprocessMetaConvertFnMap, pushExp, str, tocode, transform, transformExp, transformToCode, undefinedExp, wrapInfo1, _ref;

_ref = require('../utils'), evaljs = _ref.evaljs, isArray = _ref.isArray, extend = _ref.extend, str = _ref.str, wrapInfo1 = _ref.wrapInfo1, entity = _ref.entity, pushExp = _ref.pushExp, undefinedExp = _ref.undefinedExp;

constant = require('../parser/base').constant;

NUMBER = constant.NUMBER, STRING = constant.STRING, IDENTIFIER = constant.IDENTIFIER, SYMBOL = constant.SYMBOL, REGEXP = constant.REGEXP, HEAD_SPACES = constant.HEAD_SPACES, CONCAT_LINE = constant.CONCAT_LINE, PUNCT = constant.PUNCT, FUNCTION = constant.FUNCTION, BRACKET = constant.BRACKET, PAREN = constant.PAREN, DATA_BRACKET = constant.DATA_BRACKET, CURVE = constant.CURVE, INDENT_EXPRESSION = constant.INDENT_EXPRESSION, NEWLINE = constant.NEWLINE, SPACES = constant.SPACES, INLINE_COMMENT = constant.INLINE_COMMENT, SPACES_INLINE_COMMENT = constant.SPACES_INLINE_COMMENT, LINE_COMMENT = constant.LINE_COMMENT, BLOCK_COMMENT = constant.BLOCK_COMMENT, CODE_BLOCK_COMMENT = constant.CODE_BLOCK_COMMENT, CONCAT_LINE = constant.CONCAT_LINE, MODULE_HEADER = constant.MODULE_HEADER, MODULE = constant.MODULE, NON_INTERPOLATE_STRING = constant.NON_INTERPOLATE_STRING, INTERPOLATE_STRING = constant.INTERPOLATE_STRING, INDENT = constant.INDENT, UNDENT = constant.UNDENT, HALF_DENT = constant.HALF_DENT;

Environment = require('./env').Environment;

exports.Environment = Environment;

transform = require('./transform').transform;

analyze = require('./analyze').analyze;

optimize = require('./optimize').optimize;

tocode = require('./textize').tocode;

getStackTrace = function() {
  var obj;
  obj = {};
  Error.captureStackTrace(obj, getStackTrace);
  return obj.stack;
};

error = function(msg, exp) {
  throw Error(msg + exp);
};

madeConcat = function(head, tail) {
  var result;
  if (tail.concated) {
    result = ['call!', ['attribute!', ['list', head], 'concat'], [tail]];
  } else {
    tail.shift();
    result = [head].concat(tail);
  }
  result.convertToList = true;
  return result;
};

madeCall = function(head, tail, env) {
  var h1, head0, obj, result;
  if (tail.concated) {
    if (head && head.push && ((head0 = head[0]) === 'attribute!' || head0 === 'index!')) {
      h1 = entity(head[1]);
      if (typeof h1 === 'string' && h1[0] !== '"') {
        return ['call!', ['attribute!', head, 'apply'], [h1, tail]];
      } else {
        result = ['begin!', ['var', obj = env.ssaVar('obj')], ['=', obj, head[1]]];
        result.push(['call!', ['attribute!', [head0, obj, head[1]], 'apply'], [obj, tail]]);
        return result;
      }
    } else {
      return ['call!', ['attribute!', head, 'apply'], ['null', tail]];
    }
  } else {
    tail.shift();
    return ['call!', head, tail];
  }
};

exports.convert = convert = function(exp, env) {
  var head, result, t, tail, type;
  if (Object.prototype.toString.call(exp) === '[object Array]') {
    if (exp.length === 0) {
      return exp;
    }
    head = convert(exp[0], env);
    if (typeof head === 'function') {
      result = head(exp.slice(1), env);
    } else {
      tail = convertEllipsisList(exp.slice(1), env);
      if ((t = typeof entity(head)) === 'string') {
        if (!head || head[0] === '"') {
          result = madeConcat(head, tail);
        } else {
          result = madeCall(head, tail, env);
        }
      } else if (Object.prototype.toString.call(head) === '[object Array]') {
        result = madeCall(head, tail, env);
      } else if (t === 'object') {
        if ((type = head.type) === NON_INTERPOLATE_STRING || type === NUMBER) {
          result = madeConcat(head, tail);
        } else if (type === IDENTIFIER) {
          result = madeCall(head, tail, env);
        } else if (typeof head.value !== 'string') {
          result = madeConcat(head, tail);
        } else {
          result = ['call!', head, tail];
        }
      } else {
        result = madeConcat(head, tail);
      }
    }
  } else if (typeof exp === 'object') {
    result = convert(entity(exp), env);
  } else if (typeof entity(exp) === 'string') {
    if (!exp || exp[0] === '"') {
      return exp;
    }
    if (!(result = env.get(exp))) {
      error('fail to look up symbol from environment:', exp);
    }
  } else {
    result = exp;
  }
  if (typeof result === 'function') {
    return result;
  } else {
    if (exp === result) {
      return result;
    } else {
      return wrapInfo1(result, exp);
    }
  }
};

exports.convertExps = convertExps = function(exp, env) {
  var e;
  return ['begin!'].concat((function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = exp.length; _i < _len; _i++) {
      e = exp[_i];
      _results.push(convert(e, env));
    }
    return _results;
  })());
};

exports.convertList = function(exp, env) {
  var e, _i, _len, _results;
  _results = [];
  for (_i = 0, _len = exp.length; _i < _len; _i++) {
    e = exp[_i];
    _results.push(convert(e, env));
  }
  return _results;
};

exports.convertEllipsisList = convertEllipsisList = function(exp, env) {
  var concated, concating, e, e1, ee, ee1, ellipsis, exp01, i, item, piece, result, x, _i, _j, _len, _len1, _ref1;
  if (exp.length === 0) {
    return [];
  }
  if (exp.length === 1) {
    if ((e = exp[0]) && e[0] === 'x...') {
      return convert(e[0][1], env);
    } else {
      result = convert(e, env);
      if (result && result.convertToList) {
        return ['list!'].concat(result);
      } else {
        return ['list!', result];
      }
    }
  }
  ellipsis = void 0;
  for (i = _i = 0, _len = exp.length; _i < _len; i = ++_i) {
    item = exp[i];
    x = entity(item);
    if (x && x[0] === 'x...') {
      ellipsis = i;
      break;
    }
  }
  if (ellipsis === void 0) {
    return ['list!'].concat((function() {
      var _j, _len1, _results;
      _results = [];
      for (_j = 0, _len1 = exp.length; _j < _len1; _j++) {
        e = exp[_j];
        _results.push(convert(e, env));
      }
      return _results;
    })());
  } else {
    concated = false;
    concating = false;
    if (ellipsis === 0) {
      exp01 = exp[0][1];
      if (exp01 && exp01[0] === 'list!') {
        result = piece = convert(exp01, env);
      } else {
        result = exp01;
        concating = true;
        concated = true;
      }
    } else {
      result = piece = ['list!', convert(exp[0], env)];
    }
    _ref1 = exp.slice(1);
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      e = _ref1[_j];
      ee = entity(e);
      if (ee && ee[0] === 'x...') {
        e1 = convert(e[1], env);
        if (e1 && e1[0] === 'list!') {
          if (concating) {
            result = ['call!', ['attribute!', result, 'concat'], [e1]];
            piece = e1;
            concating = false;
          } else {
            piece.push.apply(piece, e1.slice(1));
          }
        } else {
          ee1 = entity(e1);
          if (ee1 === 'arguments' || ee1 && ee1[1] === 'arguments') {
            e1 = ['call!', ['attribute!', [], 'slice'], [e1]];
          }
          result = ['call!', ['attribute!', result, 'concat'], [e1]];
          concating = true;
          concated = true;
        }
      } else {
        e = convert(e, env);
        if (concating) {
          result = ['call!', ['attribute!', result, 'concat'], (piece = [['list!', e]])];
          concating = false;
        } else {
          piece.push(e);
        }
      }
    }
    result.concated = concated;
    return result;
  }
};

$atMetaExpList = function(index) {
  return ['index!', ['jsvar!', '__tjExp'], index];
};

preprocessMetaConvertFnMap = {
  'if': function(exp, metaExpList, env) {
    var elseIndex, test, thenIndex;
    test = metaTransform(exp[1], metaExpList, env);
    metaExpList.push(metaTransform(exp[2], metaExpList, env));
    thenIndex = env.metaIndex++;
    metaExpList.push(metaTransform(exp[3], metaExpList, env));
    elseIndex = env.metaIndex++;
    return ['if', test, $atMetaExpList(thenIndex), $atMetaExpList(elseIndex)];
  },
  'while': function(exp, metaExpList, env) {
    var resultExpList, whileIndex;
    metaExpList.push(metaConvert(exp[2], metaExpList, env));
    whileIndex = env.metaIndex++;
    resultExpList = env.constVar('result');
    return ['begin!', ['var', resultExpList], ['=', resultExpList, []], ['while', metaConvert(exp[1], metaExpList, env), ['direct!', pushExp(resultExpList, [$atMetaExpList(whileIndex)])]], resultExpList];
  }
};

metaConvertFnMap = {
  '##': function(exp, metaExpList, env) {
    return metaTransform(exp[1], metaExpList, env);
  },
  '#': function(exp, metaExpList, env) {
    var exp1, fn;
    exp1 = exp[1];
    if (Object.prototype.toString.call(exp1) === '[object Array]') {
      if (!exp1.length) {
        return exp[1];
      } else if (fn = preprocessMetaConvertFnMap[exp1[0]]) {
        return fn(exp1, metaExpList, env);
      } else {
        return metaTransform(exp1, metaExpList, env);
      }
    } else {
      return metaTransform(exp1, metaExpList, env);
    }
  },
  '#=': function(exp, metaExpList, env) {
    return ['=', metaTransform(exp[1], metaExpList, env), metaTransform(exp[2], metaExpList, env)];
  },
  '#call!': function(exp, metaExpList, env) {
    var args, e, _i, _len, _ref1;
    args = [];
    _ref1 = exp[2];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      e = _ref1[_i];
      metaExpList.push(metaTransform(e, env));
      args.push($atMetaExpList(env.metaIndex++));
    }
    return ['call!', metaTransform(exp[1], metaExpList, env), args];
  },
  '#/': function(exp, metaExpList, env) {}
};

metaTransform = function(exp, metaExpList, env) {
  var e, head, _i, _len, _results;
  if (Object.prototype.toString.call(exp) === '[object Array]') {
    if (exp.length === 0) {
      return exp;
    } else if ((head = entity(exp[0])) && head[0] === '#') {
      return metaConvert(exp, metaExpList, env);
    } else {
      _results = [];
      for (_i = 0, _len = exp.length; _i < _len; _i++) {
        e = exp[_i];
        _results.push(metaTransform(e, metaExpList, env));
      }
      return _results;
    }
  } else {
    return exp;
  }
};

hasMeta = function(exp) {
  var e, e0, eLength, _i, _len;
  if (!exp) {
    return false;
  }
  if (exp.hasMeta) {
    return true;
  }
  if (Object.prototype.toString.call(exp) !== '[object Array]') {
    exp.hasMeta = false;
    return false;
  }
  for (_i = 0, _len = exp.length; _i < _len; _i++) {
    e = exp[_i];
    if (Object.prototype.toString.call(e) === '[object Array]') {
      if ((eLength = e.length) <= 1) {
        continue;
      } else {
        if ((e0 = entity(e[0])) && typeof e0 === 'string') {
          if (e0[0] === '#') {
            exp.hasMeta = true;
            return true;
          }
        }
        if (hasMeta(e)) {
          exp.hasMeta = true;
          return true;
        }
      }
    }
  }
  exp.hasMeta = false;
  return false;
};

exports.metaConvert = metaConvert = function(exp, metaExpList, env) {
  var e, exp0, fn, i, result, _i, _len;
  if (Object.prototype.toString.call(exp) === '[object Array]') {
    if (exp.length === 0) {
      return [];
    }
    exp0 = entity(exp[0]);
    if (fn = metaConvertFnMap[exp0]) {
      return fn(exp, metaExpList, env);
    } else {
      if (hasMeta(exp)) {
        result = ['list!'];
        for (i = _i = 0, _len = exp.length; _i < _len; i = ++_i) {
          e = exp[i];
          result.push(metaConvert(e, metaExpList, env));
        }
        return result;
      } else {
        metaExpList.push(exp);
        return $atMetaExpList(env.metaIndex++);
      }
    }
  } else {
    metaExpList.push(exp);
    return $atMetaExpList(env.metaIndex++);
  }
};

metaProcess = function(exp, env) {
  var code, metaExpList;
  env = env.extend({});
  env.metaIndex = 0;
  exp = metaConvert(exp, metaExpList = [], env);
  code = nonMetaCompileExp(['return', exp], env);
  return new Function(['__tjExp'], code)(metaExpList);
};

exports.transformExp = transformExp = function(exp, env) {
  exp = metaProcess(exp, env);
  exp = convert(exp, env);
  exp = transform(exp, env);
  return exp;
};

exports.transformToCode = transformToCode = function(exp, env) {
  exp = transform(exp, env);
  exp = analyze(exp, env);
  exp = optimize(exp, env);
  exp = tocode(exp);
  return exp;
};

exports.optimizeExp = optimizeExp = function(exp, env) {
  exp = metaProcess(exp, env);
  exp = convert(exp, env);
  exp = transform(exp, env);
  exp = analyze(exp, env);
  exp = optimize(exp, env);
  return exp;
};

exports.nonMetaCompileExp = nonMetaCompileExp = function(exp, env) {
  exp = convert(exp, env);
  exp = transform(exp, env);
  exp = analyze(exp, env);
  exp = optimize(exp, env);
  exp = tocode(exp);
  return exp;
};

exports.compileExp = compileExp = function(exp, env) {
  exp = metaProcess(exp, env);
  return exp = nonMetaCompileExp(exp, env);
};

exports.nonMetaCompileExpNoOptimize = nonMetaCompileExpNoOptimize = function(exp, env) {
  exp = convert(exp, env);
  exp = transform(exp, env);
  exp = tocode(exp);
  return exp;
};

exports.compileExpNoOptimize = compileExpNoOptimize = function(exp, env) {
  exp = metaProcess(exp, env);
  exp = nonMetaCompileExpNoOptimize(exp, env);
  return exp;
};
