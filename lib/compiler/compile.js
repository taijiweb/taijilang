var $atMetaExpList, BLOCK_COMMENT, BRACKET, CODE_BLOCK_COMMENT, CONCAT_LINE, CURVE, DATA_BRACKET, Environment, FUNCTION, HALF_DENT, HEAD_SPACES, IDENTIFIER, INDENT, INDENT_EXPRESSION, INLINE_COMMENT, INTERPOLATE_STRING, LINE_COMMENT, LIST, MODULE, MODULE_HEADER, NEWLINE, NON_INTERPOLATE_STRING, NUMBER, PAREN, PUNCT, Parser, REGEXP, SPACES, SPACES_INLINE_COMMENT, STRING, SYMBOL, TaijiModule, UNDENT, VALUE, analyze, begin, compileError, compileExp, compileExpNoOptimize, constant, convert, convertArgumentList, convertExps, doAnalyze, entity, evaljs, exportsIndex, extend, extendSyntaxInfo, formatTaijiJson, fs, getStackTrace, hasMeta, include, includeModuleFunctionCall, isArray, madeCall, madeConcat, metaCompile, metaConvert, metaConvertExport, metaConvertFnMap, metaConvertImport, metaInclude, metaProcess, metaTransform, nonMetaCompileExp, nonMetaCompileExpNoOptimize, norm, optimize, optimizeExp, parseModule, parser, path, preprocessMetaConvertFnMap, pushExp, str, taijiExports, tocode, trace, transform, transformExp, transformToCode, undefinedExp, wrapInfo1, wrapMetaObjectFunctionCall, wrapModuleFunctionCall, __TJ__QUOTE, _ref;

fs = require('fs');

path = require('path');

compileError = require('./helper').compileError;

_ref = require('../utils'), evaljs = _ref.evaljs, isArray = _ref.isArray, extend = _ref.extend, str = _ref.str, formatTaijiJson = _ref.formatTaijiJson, wrapInfo1 = _ref.wrapInfo1, extendSyntaxInfo = _ref.extendSyntaxInfo, entity = _ref.entity, pushExp = _ref.pushExp, undefinedExp = _ref.undefinedExp, begin = _ref.begin, __TJ__QUOTE = _ref.__TJ__QUOTE, constant = _ref.constant, norm = _ref.norm, trace = _ref.trace;

NUMBER = constant.NUMBER, STRING = constant.STRING, IDENTIFIER = constant.IDENTIFIER, SYMBOL = constant.SYMBOL, REGEXP = constant.REGEXP, HEAD_SPACES = constant.HEAD_SPACES, CONCAT_LINE = constant.CONCAT_LINE, PUNCT = constant.PUNCT, FUNCTION = constant.FUNCTION, BRACKET = constant.BRACKET, PAREN = constant.PAREN, DATA_BRACKET = constant.DATA_BRACKET, CURVE = constant.CURVE, INDENT_EXPRESSION = constant.INDENT_EXPRESSION, NEWLINE = constant.NEWLINE, SPACES = constant.SPACES, INLINE_COMMENT = constant.INLINE_COMMENT, SPACES_INLINE_COMMENT = constant.SPACES_INLINE_COMMENT, LINE_COMMENT = constant.LINE_COMMENT, BLOCK_COMMENT = constant.BLOCK_COMMENT, CODE_BLOCK_COMMENT = constant.CODE_BLOCK_COMMENT, CONCAT_LINE = constant.CONCAT_LINE, MODULE_HEADER = constant.MODULE_HEADER, MODULE = constant.MODULE, NON_INTERPOLATE_STRING = constant.NON_INTERPOLATE_STRING, INTERPOLATE_STRING = constant.INTERPOLATE_STRING, INDENT = constant.INDENT, UNDENT = constant.UNDENT, HALF_DENT = constant.HALF_DENT, VALUE = constant.VALUE, LIST = constant.LIST;

Environment = require('./env').Environment;

exports.Environment = Environment;

transform = require('./transform').transform;

exports.transform = transform;

analyze = require('./analyze').analyze;

doAnalyze = function(exp, env) {
  env.optimizeInfoMap = {};
  return analyze(exp, env);
};

optimize = require('./optimize').optimize;

tocode = require('./textize').tocode;

Parser = require('../parser').Parser;

getStackTrace = function() {
  var obj;
  obj = {};
  Error.captureStackTrace(obj, getStackTrace);
  return obj.stack;
};

madeConcat = function(head, tail) {
  var result;
  if (tail.concated) {
    result = norm(['call!', ['attribute!', ['list', head], 'concat'], [tail]]);
  } else {
    tail.shift();
    result = [head].concat(tail);
  }
  result.convertToList = true;
  return result;
};

madeCall = function(head, tail, env) {
  var head0, head1, obj, result;
  if (tail.concated) {
    if (head instanceof Array && ((head0 = head[0].value) === 'attribute!' || head0 === 'index!')) {
      head1 = head[1];
      if (head1.kind === SYMBOL) {
        return norm(['call!', ['attribute!', head, 'apply'], [head, tail]]);
      } else {
        result = norm(['begin!', ['var', obj = env.ssaVar('obj')], ['=', obj, head1]]);
        result.push(norm(['call!', ['attribute!', [head0, obj, head[1]], 'apply'], [obj, tail]]));
        return result;
      }
    } else {
      return norm(['call!', ['attribute!', head, 'apply'], ['null', tail]]);
    }
  } else {
    tail.shift();
    return norm(['call!', head, tail]);
  }
};

exports.convert = convert = function(exp, env) {
  var e, exp0, head, result, tail;
  trace('convert: ', str(exp));
  switch (exp.kind) {
    case LIST:
      exp0 = exp[0];
      switch (exp0.kind) {
        case LIST:
          head = convert(exp0);
          tail = convertArgumentList(exp.slice(1), env);
          return madeCall(head, tail, env);
        case SYMBOL:
          head = env.get(exp0);
          if (typeof head === 'function') {
            result = head(exp, env);
            result.start = exp.start;
            result.stop = exp.stop;
            return result;
          } else {
            tail = convertArgumentList(exp.slice(1), env);
            return madeCall(head, tail, env);
          }
          break;
        case VALUE:
          result = (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = exp.length; _i < _len; _i++) {
              e = exp[_i];
              _results.push(convert(e, env));
            }
            return _results;
          })();
          result.start = exp.start;
          return result.stop = exp.stop;
        default:
          return compileError(exp, 'convert: wrong kind: ' + exp.kind);
      }
      break;
    case SYMBOL:
      return env.get(exp);
    case VALUE:
      return exp;
    default:
      return compileError(exp, 'convert: wrong kind: ' + exp.kind);
  }
};

exports.convertExps = convertExps = function(exp, env) {
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

exports.convertList = function(exp, env) {
  var e, _i, _len, _results;
  _results = [];
  for (_i = 0, _len = exp.length; _i < _len; _i++) {
    e = exp[_i];
    _results.push(convert(e, env));
  }
  return _results;
};

exports.convertArgumentList = convertArgumentList = function(exp, env) {
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
        return [
          {
            value: 'list!',
            kind: SYMBOL
          }
        ].concat(result);
      } else {
        return [norm('list!', result)];
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
    return [norm('list!')].concat((function() {
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
      result = piece = [norm('list!', convert(exp[0], env))];
    }
    _ref1 = exp.slice(1);
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      e = _ref1[_j];
      ee = entity(e);
      if (ee && ee[0] === 'x...') {
        e1 = convert(e[1], env);
        if (e1 && e1[0] === 'list!') {
          if (concating) {
            result = norm(['call!', ['attribute!', result, 'concat'], [e1]]);
            piece = e1;
            concating = false;
          } else {
            piece.push.apply(piece, e1.slice(1));
          }
        } else {
          ee1 = entity(e1);
          if (ee1 === 'arguments' || ee1 && ee1[1] === 'arguments') {
            e1 = norm(['call!', ['attribute!', [], 'slice'], [e1]]);
          }
          result = norm(['call!', ['attribute!', result, 'concat'], [e1]]);
          concating = true;
          concated = true;
        }
      } else {
        e = convert(e, env);
        if (concating) {
          result = norm(['call!', ['attribute!', result, 'concat'], (piece = [['list!', e]])]);
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
  return norm(['index!', ['jsvar!', '__tjExp'], index]);
};

TaijiModule = require('../module');

parser = new Parser;

metaInclude = function(exp, metaExpList, env) {
  var newEnv, _ref1;
  _ref1 = parseModule(entity(exp[1]), env, exp[2]), exp = _ref1[0], newEnv = _ref1[1];
  return metaTransform(exp, metaExpList, env);
};

preprocessMetaConvertFnMap = {
  'include': metaInclude,
  'if': function(exp, metaExpList, env) {
    return norm(['if', metaTransform(exp[1], metaExpList, env), metaConvert(exp[2], metaExpList, env), metaConvert(exp[3], metaExpList, env)]);
  },
  'while': function(exp, metaExpList, env) {
    var resultExpList;
    resultExpList = norm(['metaConvertVar!', 'whileResult']);
    return norm(['begin!', ['var', resultExpList], ['=', resultExpList, []], ['while', metaTransform(exp[1], metaExpList, env), pushExp(resultExpList, metaConvert(exp[2], metaExpList, env))], resultExpList]);
  },
  'doWhile!': function(exp, metaExpList, env) {
    var resultExpList;
    resultExpList = norm(['metaConvertVar!', 'whileResult']);
    return norm(['begin!', ['var', resultExpList], ['=', resultExpList, []], ['doWhile!', pushExp(resultExpList, metaConvert(exp[1], metaExpList, env)), metaTransform(exp[2], metaExpList, env)], resultExpList]);
  },
  'cFor!': function(exp, metaExpList, env) {
    var resultExpList;
    resultExpList = norm(['metaConvertVar!', 'whileResult']);
    return norm(['begin!', ['var', resultExpList], ['=', resultExpList, []], ['cFor!', metaTransform(exp[1], metaExpList, env), metaTransform(exp[2], metaExpList, env), metaTransform(exp[3], metaExpList, env), pushExp(resultExpList, metaConvert(exp[4], metaExpList, env))], resultExpList]);
  },
  'forIn!': function(exp, metaExpList, env) {
    var resultExpList;
    resultExpList = norm(['metaConvertVar!', 'whileResult']);
    return norm(['begin!', ['var', resultExpList], ['=', resultExpList, []], ['forIn!', metaTransform(exp[1], metaExpList, env), metaTransform(exp[2], metaExpList, env), pushExp(resultExpList, metaConvert(exp[3], metaExpList, env))], resultExpList]);
  },
  'forOf!': function(exp, metaExpList, env) {
    var resultExpList;
    resultExpList = norm(['metaConvertVar!', 'whileResult']);
    return norm(['begin!', ['var', resultExpList], ['=', resultExpList, []], ['forOf!', metaTransform(exp[1], metaExpList, env), metaTransform(exp[2], metaExpList, env), pushExp(resultExpList, metaConvert(exp[3], metaExpList, env))], resultExpList]);
  },
  'forIn!!': function(exp, metaExpList, env) {
    var resultExpList;
    resultExpList = norm(['metaConvertVar!', 'whileResult']);
    return norm(['begin!', ['var', resultExpList], ['=', resultExpList, []], ['forIn!!', metaTransform(exp[1], metaExpList, env), metaTransform(exp[2], metaExpList, env), metaTransform(exp[3], metaExpList, env), pushExp(resultExpList, metaConvert(exp[4], metaExpList, env))], resultExpList]);
  },
  'forOf!': function(exp, metaExpList, env) {
    var resultExpList;
    resultExpList = norm(['metaConvertVar!', 'whileResult']);
    return norm(['begin!', ['var', resultExpList], ['=', resultExpList, []], ['forOf!!', metaTransform(exp[1], metaExpList, env), metaTransform(exp[2], metaExpList, env), metaTransform(exp[3], metaExpList, env), pushExp(resultExpList, metaConvert(exp[4], metaExpList, env))], resultExpList]);
  },
  'let': function(exp, metaExpList, env) {
    return [norm('let', metaTransform(exp[1], metaExpList, env), metaConvert(exp[2], metaExpList, env))];
  },
  'letrec!': function(exp, metaExpList, env) {
    return [norm('letrec!', metaTransform(exp[1], metaExpList, env), metaConvert(exp[2], metaExpList, env))];
  }
};

taijiExports = norm(['jsvar!', 'exports']);

exportsIndex = function(name) {
  return norm(['index!', taijiExports, '"' + entity(name) + '"']);
};

hasMeta = function(exp) {
  var e, _i, _len;
  trace('hasMeta:', str(exp));
  if (exp.hasMeta !== void 0) {
    return exp.hasMeta;
  } else if (exp instanceof Array) {
    for (_i = 0, _len = exp.length; _i < _len; _i++) {
      e = exp[_i];
      if (hasMeta(e)) {
        return exp.hasMeta = true;
      }
    }
    return exp.hasMeta = false;
  } else {
    return exp.hasMeta = exp.meta || false;
  }
};

parseModule = function(modulePath, env, parseMethod) {
  var code, exp, filePath, newEnv, raw, taijiModule;
  filePath = modulePath.slice(1, modulePath.length - 1);
  taijiModule = new TaijiModule(filePath, env.module);
  newEnv = env.extend(null, env.parser, taijiModule);
  raw = fs.readFileSync(taijiModule.filePath, 'utf8');
  code = raw.charCodeAt(0) === 0xFEFF ? raw.substring(1) : raw;
  if (parseMethod) {
    parseMethod = parser[entity(parseMethod)];
  } else {
    parseMethod = parser.module;
  }
  exp = parser.parse(code, parseMethod, 0, newEnv);
  return [exp.body, newEnv];
};

wrapModuleFunctionCall = function(exp, moduleVar) {
  return norm(['=', moduleVar, ['call!', ['|->', [], begin([['=', taijiExports, ['hash!']], exp, ['return', taijiExports]])], []]]);
};

wrapMetaObjectFunctionCall = function(exp, metaExpList, env, metaModuleAlias, objectModuleAlias) {
  var metaModuleVar, objectModuleInMetaLevel, objectModuleVar;
  if (objectModuleAlias) {
    objectModuleVar = objectModuleAlias;
    objectModuleInMetaLevel = metaConvert(wrapModuleFunctionCall(exp, objectModuleVar), metaExpList, env);
  } else {
    objectModuleVar = norm(['metaConvertVar!', 'module']);
    objectModuleInMetaLevel = metaConvert(norm(['begin!', ['var', objectModuleVar], wrapModuleFunctionCall(exp, objectModuleVar)], metaExpList, env));
  }
  if (metaModuleAlias) {
    metaModuleVar = metaModuleAlias;
    return wrapModuleFunctionCall(exp, metaModuleVar);
  } else {
    metaModuleVar = norm(['metaConvertVar!', 'module']);
    return norm(['begin!', ['var', metaModuleVar], wrapModuleFunctionCall(objectModuleInMetaLevel, metaModuleVar)]);
  }
};

metaConvertExport = function(exp, metaExpList, env) {
  var compileTime, item, name, result, runtime, value, _i, _len, _ref1;
  result = [];
  _ref1 = exp.slice(1);
  for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
    item = _ref1[_i];
    name = item[0], value = item[1], runtime = item[2], compileTime = item[3];
    if (value === void 0) {
      value = name;
    }
    if (compileTime) {
      result.push(metaTransform(['=', exportsIndex(name), value], metaExpList, env));
    }
    if (runtime) {
      result.push(metaConvert(['=', exportsIndex(name), value], metaExpList, env));
    }
  }
  return begin(result);
};

includeModuleFunctionCall = function(exp, metaExpList, env, runtimeModuleAlias, metaModuleAlias) {
  var runtimeBody, runtimeFunctionCall;
  runtimeBody = norm(['metaConvertVar!', 'runtimeBody']);
  runtimeFunctionCall = metaConvert(norm(['begin!', ['var', runtimeModuleAlias], ['=', runtimeModuleAlias, ['call!', ['->', [], ['begin!', ['=', 'exports', ['hash!']], exp, 'exports']], []]]], metaExpList, env));
  return begin(norm([['var', runtimeBody], ['var', metaModuleAlias], ['=', metaModuleAlias, ['call!', ['->', [], ['begin!', ['=', 'exports', ['hash!']], ['=', ['@@', runtimeBody], runtimeFunctionCall], 'exports']], []]], runtimeBody]));
};

metaConvertImport = function(exp, metaExpList, env) {
  var asName, cmd, compileTimeAssignList, filePath, fnCall, importItemList, metaBegin, metaImportItemList, metaModuleAlias, moduleFnCall, name, newEnv, parseMethod, runtimeAssignList, runtimeModuleAlias, _i, _j, _len, _len1, _ref1, _ref2, _ref3;
  cmd = exp[0], filePath = exp[1], parseMethod = exp[2], runtimeModuleAlias = exp[3], metaModuleAlias = exp[4], importItemList = exp[5], metaImportItemList = exp[6];
  _ref1 = parseModule(entity(filePath), env, parseMethod), exp = _ref1[0], newEnv = _ref1[1];
  if (!metaModuleAlias) {
    metaModuleAlias = norm(['metaConvertVar!', 'module']);
  }
  if (!runtimeModuleAlias) {
    runtimeModuleAlias = norm(['metaConvertVar!', 'module']);
  }
  fnCall = includeModuleFunctionCall(exp, metaExpList, env, runtimeModuleAlias, metaModuleAlias);
  moduleFnCall = norm(['metaConvertVar!', 'moduleFnCall']);
  metaBegin = metaConvert('begin!', metaExpList, env);
  compileTimeAssignList = [];
  runtimeAssignList = [];
  for (_i = 0, _len = metaImportItemList.length; _i < _len; _i++) {
    _ref2 = metaImportItemList[_i], name = _ref2[0], asName = _ref2[1];
    compileTimeAssignList.push(['=', asName, ['index!', metaModuleAlias, '"' + entity(name) + '"']]);
  }
  compileTimeAssignList = begin(compileTimeAssignList);
  for (_j = 0, _len1 = importItemList.length; _j < _len1; _j++) {
    _ref3 = importItemList[_j], name = _ref3[0], asName = _ref3[1];
    runtimeAssignList.push(['=', asName, ['index!', runtimeModuleAlias, '"' + entity(name) + '"']]);
  }
  runtimeAssignList = metaConvert(begin(runtimeAssignList), metaExpList, env);
  return norm(['begin!', ['var', moduleFnCall], ['=', moduleFnCall, fnCall], compileTimeAssignList, ['list!', metaBegin, moduleFnCall, runtimeAssignList]]);
};

include = function(exp, metaExpList, env) {
  var newEnv, _ref1;
  _ref1 = parseModule(entity(exp[1]), env, exp[2]), exp = _ref1[0], newEnv = _ref1[1];
  return metaConvert(exp, metaExpList, env);
};

metaConvertFnMap = {
  '##': function(exp, metaExpList, env) {
    return metaTransform(exp[1], metaExpList, env);
  },
  '#/': function(exp, metaExpList, env) {
    var result;
    result = metaTransform(exp[1], metaExpList, env);
    metaExpList.push(result);
    return begin([result, $atMetaExpList(env.metaIndex++)]);
  },
  '#&': function(exp, metaExpList, env) {
    var result;
    result = metaTransform(exp[1], metaExpList, env);
    metaExpList.push(exp[1]);
    return begin([result, $atMetaExpList(env.metaIndex++)]);
  },
  '#=': function(exp, metaExpList, env) {
    return metaTransform(['=', exp[1], exp[2]], metaExpList, env);
  },
  '#/=': function(exp, metaExpList, env) {
    var result;
    result = metaTransform(['=', exp[1], exp[2]], metaExpList, env);
    metaExpList.push(result);
    return begin([result, $atMetaExpList(env.metaIndex++)]);
  },
  '#&=': function(exp, metaExpList, env) {
    var exp2;
    exp2 = metaTransform(exp[2], metaExpList, env);
    metaExpList.push(exp[2]);
    return begin([exp2, ['=', exp[1], $atMetaExpList(env.metaIndex++)]]);
  },
  '#': function(exp, metaExpList, env) {
    var exp1, fn;
    exp1 = exp[1];
    if (exp1 instanceof Array) {
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
  '#-': function(exp, metaExpList, env) {
    return error('unexpected meta operator #-', '');
  },
  '#call!': function(exp, metaExpList, env) {
    var args, e, _i, _len, _ref1;
    args = [];
    _ref1 = exp[2];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      e = _ref1[_i];
      metaExpList.push(metaTransform(e, metaExpList, env));
      args.push($atMetaExpList(env.metaIndex++));
    }
    return ['call!', metaTransform(exp[1], metaExpList, env), args];
  },
  'export!': metaConvertExport,
  'include!': include,
  'import!': metaConvertImport
};

metaTransform = function(exp, metaExpList, env) {
  var e, head, _i, _len, _results;
  if (exp instanceof Array) {
    head = exp[0];
    if (head.value === '#call!') {
      return ['list!', '"metaEval!"', metaConvert(exp, metaExpList, env)];
    } else if (head.meta) {
      return metaConvert(exp, metaExpList, env);
    } else if (typeof head === 'string' && head.slice(0, 3) === '#-') {
      return metaConvert(exp[1], metaExpList, env);
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

exports.metaConvert = metaConvert = function(exp, metaExpList, env) {
  var e, exp0, fn, i, result, _i, _len;
  trace('metaConvert: ', str(exp));
  if (exp instanceof Array) {
    exp0 = exp[0];
    if (fn = metaConvertFnMap[exp0]) {
      return fn(exp, metaExpList, env);
    } else {
      if (hasMeta(exp)) {
        result = [
          {
            value: 'list!',
            kind: symbol
          }
        ];
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

exports.metaCompile = metaCompile = function(exp, metaExpList, env) {
  var code;
  trace('metaCompile: ', str(exp));
  env.metaIndex = 0;
  exp = metaConvert(exp, metaExpList, env);
  return code = nonMetaCompileExp(norm(['=', ['attribute!', 'module', 'exports'], ['->', ['__tjExp'], ['return', exp]]]), env);
};

exports.metaProcess = metaProcess = function(exp, env) {
  var code, compiledPath, metaExpList, metaFn;
  trace('metaProcess: ', str(exp));
  env = env.extend({});
  code = metaCompile(exp, metaExpList = [], env);
  compiledPath = path.join(process.cwd(), '/lib/compiler/metacompiled.js');
  fs.writeFileSync(compiledPath, code);
  delete require.cache[require.resolve(compiledPath)];
  metaFn = require(compiledPath);
  return metaFn(metaExpList);
};

exports.nonMetaCompileExp = nonMetaCompileExp = function(exp, env) {
  trace('nonMetaCompileExp: ', str(exp));
  exp = convert(exp, env);
  exp = transform(exp, env);
  doAnalyze(exp, env);
  exp = optimize(exp, env);
  exp = tocode(exp, env);
  return exp;
};

exports.compileExp = compileExp = function(exp, env) {
  exp = metaProcess(exp, env);
  return exp = nonMetaCompileExp(exp, env);
};

exports.nonMetaCompileExpNoOptimize = nonMetaCompileExpNoOptimize = function(exp, env) {
  exp = convert(exp, env);
  exp = transform(exp, env);
  exp = tocode(exp, env);
  return exp;
};

exports.compileExpNoOptimize = compileExpNoOptimize = function(exp, env) {
  exp = metaProcess(exp, env);
  exp = nonMetaCompileExpNoOptimize(exp, env);
  return exp;
};

exports.transformExp = transformExp = function(exp, env) {
  exp = metaProcess(exp, env);
  exp = convert(exp, env);
  exp = transform(exp, env);
  return exp;
};

exports.transformToCode = transformToCode = function(exp, env) {
  exp = transform(exp, env);
  doAnalyze(exp, env);
  exp = optimize(exp, env);
  exp = tocode(exp, env);
  return exp;
};

exports.optimizeExp = optimizeExp = function(exp, env) {
  exp = metaProcess(exp, env);
  exp = convert(exp, env);
  exp = transform(exp, env);
  doAnalyze(exp, env);
  exp = optimize(exp, env);
  return exp;
};
