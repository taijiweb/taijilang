var BLOCK_COMMENT, BRACKET, CODE_BLOCK_COMMENT, CONCAT_LINE, CURVE, DATA_BRACKET, Environment, FUNCTION, HALF_DENT, HEAD_SPACES, IDENTIFIER, INDENT, INDENT_EXPRESSION, INLINE_COMMENT, INTERPOLATE_STRING, LINE_COMMENT, MODULE, MODULE_HEADER, NEWLINE, NON_INTERPOLATE_STRING, NUMBER, PAREN, PUNCT, REGEXP, SPACES, SPACES_INLINE_COMMENT, STRING, SYMBOL, UNDENT, analyze, compileExp, compileExpNoOptimize, constant, convert, convertEllipsisList, convertExps, dismeta, entity, error, evaljs, extend, getStackTrace, isArray, madeCall, madeConcat, metaConvert, optimize, optimizeExp, str, tocode, transform, transformExp, wrapInfo1, _ref;

_ref = require('../utils'), evaljs = _ref.evaljs, isArray = _ref.isArray, extend = _ref.extend, str = _ref.str, wrapInfo1 = _ref.wrapInfo1, entity = _ref.entity;

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

exports.dismeta = dismeta = function(exp, metaList) {
  var e, i, x, _i, _len;
  if (isArray(exp)) {
    if (!exp.length) {
      return exp;
    } else if (exp[0] === 'meta!') {
      return wrapInfo1(metaList[exp[1]], exp);
    } else {
      for (i = _i = 0, _len = exp.length; _i < _len; i = ++_i) {
        e = exp[i];
        if ((x = dismeta(e, metaList)) !== e) {
          exp[i] = x;
        }
      }
      return exp;
    }
  } else {
    return exp;
  }
};

exports.metaConvert = metaConvert = function(exp, env) {
  var code, e, i, meta, metaList, name, tjExports, value, _i, _len, _ref1;
  meta = {
    list: [],
    code: [],
    index: 0,
    env: env.extend({})
  };
  env.meta = meta;
  exp = convert(exp, env);
  code = meta.code.join(';');
  metaList = meta.list;
  new Function(['metaList'], code)(metaList);
  for (i = _i = 0, _len = metaList.length; _i < _len; i = ++_i) {
    e = metaList[i];
    metaList[i] = convert(e, env);
  }
  tjExports = env.module.exports;
  _ref1 = env.module.exports;
  for (name in _ref1) {
    value = _ref1[name];
    if (value[0] === 'meta!') {
      tjExports[name] = metaList[value[1]];
    }
  }
  return dismeta(exp, meta.list);
};

exports.transformToCode = function(exp, env) {
  exp = transform(exp, env);
  exp = analyze(exp, env);
  exp = optimize(exp, env);
  exp = tocode(exp);
  return exp;
};

exports.compileExp = compileExp = function(exp, env) {
  exp = metaConvert(exp, env);
  exp = transform(exp, env);
  exp = analyze(exp, env);
  exp = optimize(exp, env);
  exp = tocode(exp);
  return exp;
};

exports.compileExpNoOptimize = compileExpNoOptimize = function(exp, env) {
  exp = metaConvert(exp, env);
  exp = transform(exp, env);
  exp = tocode(exp);
  return exp;
};

exports.transformExp = transformExp = function(exp, env) {
  exp = metaConvert(exp, env);
  exp = transform(exp, env);
  return exp;
};

exports.optimizeExp = optimizeExp = function(exp, env) {
  exp = metaConvert(exp, env);
  exp = transform(exp, env);
  exp = analyze(exp, env);
  exp = optimize(exp, env);
  return exp;
};
