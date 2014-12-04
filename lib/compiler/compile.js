var $atMetaExpList, Environment, Parser, SYMBOL, TaijiModule, VALUE, analyze, begin, compileError, compileExp, compileExpNoOptimize, convert, convertArgumentList, convertExps, doAnalyze, entity, evaljs, exportsIndex, extend, extendSyntaxInfo, formatTaijiJson, fs, hasMeta, include, includeModuleFunctionCall, isArray, isEllipsis, isSymbol, madeCall, madeConcat, metaCompile, metaConvert, metaConvertExport, metaConvertFnMap, metaConvertImport, metaInclude, metaProcess, metaTransform, nonMetaCompileExp, nonMetaCompileExpNoOptimize, optimize, optimizeExp, parseModule, parser, path, preprocessMetaConvertFnMap, pushExp, str, symbolLookupError, symbolOf, taijiExports, tocode, trace, transform, transformExp, transformToCode, undefinedExp, wrapInfo1, wrapMetaObjectFunctionCall, wrapModuleFunctionCall, __TJ__QUOTE, _ref, _ref1, _ref2;

fs = require('fs');

path = require('path');

_ref = require('./helper'), compileError = _ref.compileError, symbolLookupError = _ref.symbolLookupError;

_ref1 = require('../utils'), evaljs = _ref1.evaljs, isArray = _ref1.isArray, extend = _ref1.extend, str = _ref1.str, formatTaijiJson = _ref1.formatTaijiJson, wrapInfo1 = _ref1.wrapInfo1, extendSyntaxInfo = _ref1.extendSyntaxInfo, entity = _ref1.entity, pushExp = _ref1.pushExp, undefinedExp = _ref1.undefinedExp, begin = _ref1.begin, __TJ__QUOTE = _ref1.__TJ__QUOTE, trace = _ref1.trace, madeConcat = _ref1.madeConcat, madeCall = _ref1.madeCall, isEllipsis = _ref1.isEllipsis, isSymbol = _ref1.isSymbol, symbolOf = _ref1.symbolOf;

_ref2 = require('../constant'), SYMBOL = _ref2.SYMBOL, VALUE = _ref2.VALUE;

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

tocode = require('./code').tocode;

Parser = require('../parser').Parser;

exports.convert = convert = function(exp, env) {
  var e, exp0, head, result, tail;
  trace('convert: ', str(exp));
  if (exp instanceof Array) {
    exp0 = exp[0];
    if (exp0 instanceof Array) {
      head = convert(exp0, env);
      tail = convertArgumentList(exp.slice(1), env);
      return madeCall(head, tail, env);
    } else if (isSymbol(exp0)) {
      head = env.get(symbolOf(exp0));
      if (!head) {
        symbolLookupError(exp0, exp);
      }
      if (typeof head === 'function') {
        return head(exp, env);
      } else {
        tail = convertArgumentList(exp.slice(1), env);
        return madeCall(head, tail, env);
      }
    } else {
      return (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = exp.length; _i < _len; _i++) {
          e = exp[_i];
          _results.push(convert(e, env));
        }
        return _results;
      })();
    }
  } else if (isSymbol(exp)) {
    if (result = env.get(symbolOf(exp))) {
      return result;
    } else {
      return symbolLookupError(exp);
    }
  } else {
    return exp;
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
  var concated, concating, e, e1, ee1, ellipsis, exp01, i, item, piece, result, _i, _j, _len, _len1, _ref3;
  if (exp.length === 0) {
    return [];
  }
  if (exp.length === 1) {
    if (isEllipsis(exp[0])) {
      return convert(exp[0][2], env);
    } else {
      return [convert(exp[0], env)];
    }
  }
  ellipsis = void 0;
  for (i = _i = 0, _len = exp.length; _i < _len; i = ++_i) {
    item = exp[i];
    if (isEllipsis(item)) {
      ellipsis = i;
      break;
    }
  }
  if (ellipsis === void 0) {
    return (function() {
      var _j, _len1, _results;
      _results = [];
      for (_j = 0, _len1 = exp.length; _j < _len1; _j++) {
        e = exp[_j];
        _results.push(convert(e, env));
      }
      return _results;
    })();
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
    _ref3 = exp.slice(1);
    for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
      e = _ref3[_j];
      if (isEllipsis(e)) {
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

TaijiModule = require('../module');

parser = new Parser;

metaInclude = function(exp, metaExpList, env) {
  var newEnv, _ref3;
  _ref3 = parseModule(entity(exp[1]), env, exp[2]), exp = _ref3[0], newEnv = _ref3[1];
  return metaTransform(exp, metaExpList, env);
};

preprocessMetaConvertFnMap = {
  'include': metaInclude,
  'if': function(exp, metaExpList, env) {
    return ['if', metaTransform(exp[1], metaExpList, env), metaConvert(exp[2], metaExpList, env), metaConvert(exp[3], metaExpList, env)];
  },
  'while': function(exp, metaExpList, env) {
    var resultExpList;
    resultExpList = ['metaConvertVar!', 'whileResult'];
    return ['begin!', ['var', resultExpList], ['=', resultExpList, []], ['while', metaTransform(exp[1], metaExpList, env), pushExp(resultExpList, metaConvert(exp[2], metaExpList, env))], resultExpList];
  },
  'forIn!': function(exp, metaExpList, env) {
    var resultExpList;
    resultExpList = ['metaConvertVar!', 'whileResult'];
    return ['begin!', ['var', resultExpList], ['=', resultExpList, []], ['forIn!', metaTransform(exp[1], metaExpList, env), metaTransform(exp[2], metaExpList, env), pushExp(resultExpList, metaConvert(exp[3], metaExpList, env))], resultExpList];
  },
  'forOf!': function(exp, metaExpList, env) {
    var resultExpList;
    resultExpList = ['metaConvertVar!', 'whileResult'];
    return ['begin!', ['var', resultExpList], ['=', resultExpList, []], ['forOf!!', metaTransform(exp[1], metaExpList, env), metaTransform(exp[2], metaExpList, env), metaTransform(exp[3], metaExpList, env), pushExp(resultExpList, metaConvert(exp[4], metaExpList, env))], resultExpList];
  }
};

taijiExports = ['jsvar!', 'exports'];

exportsIndex = function(name) {
  return ['index!', taijiExports, '"' + entity(name) + '"'];
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
  return ['=', moduleVar, ['call!', ['|->', [], begin([['=', taijiExports, ['hash!']], exp, ['return', taijiExports]])], []]];
};

wrapMetaObjectFunctionCall = function(exp, metaExpList, env, metaModuleAlias, objectModuleAlias) {
  var metaModuleVar, objectModuleInMetaLevel, objectModuleVar;
  if (objectModuleAlias) {
    objectModuleVar = objectModuleAlias;
    objectModuleInMetaLevel = metaConvert(wrapModuleFunctionCall(exp, objectModuleVar), metaExpList, env);
  } else {
    objectModuleVar = ['metaConvertVar!', 'module'];
    objectModuleInMetaLevel = metaConvert(['begin!', ['var', objectModuleVar], wrapModuleFunctionCall(exp, objectModuleVar)], metaExpList, env);
  }
  if (metaModuleAlias) {
    metaModuleVar = metaModuleAlias;
    return wrapModuleFunctionCall(exp, metaModuleVar);
  } else {
    metaModuleVar = ['metaConvertVar!', 'module'];
    return ['begin!', ['var', metaModuleVar], wrapModuleFunctionCall(objectModuleInMetaLevel, metaModuleVar)];
  }
};

metaConvertExport = function(exp, metaExpList, env) {
  var compileTime, item, name, result, runtime, value, _i, _len, _ref3;
  result = [];
  _ref3 = exp.slice(1);
  for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
    item = _ref3[_i];
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
  runtimeBody = ['metaConvertVar!', 'runtimeBody'];
  runtimeFunctionCall = metaConvert(['begin!', ['var', runtimeModuleAlias], ['=', runtimeModuleAlias, ['call!', ['->', [], ['begin!', ['=', 'exports', ['hash!']], exp, 'exports']], []]]], metaExpList, env);
  return begin([['var', runtimeBody], ['var', metaModuleAlias], ['=', metaModuleAlias, ['call!', ['->', [], ['begin!', ['=', 'exports', ['hash!']], ['=', ['@@', runtimeBody], runtimeFunctionCall], 'exports']], []]], runtimeBody]);
};

metaConvertImport = function(exp, metaExpList, env) {
  var asName, cmd, compileTimeAssignList, filePath, fnCall, importItemList, metaBegin, metaImportItemList, metaModuleAlias, moduleFnCall, name, newEnv, parseMethod, runtimeAssignList, runtimeModuleAlias, _i, _j, _len, _len1, _ref3, _ref4, _ref5;
  cmd = exp[0], filePath = exp[1], parseMethod = exp[2], runtimeModuleAlias = exp[3], metaModuleAlias = exp[4], importItemList = exp[5], metaImportItemList = exp[6];
  _ref3 = parseModule(entity(filePath), env, parseMethod), exp = _ref3[0], newEnv = _ref3[1];
  if (!metaModuleAlias) {
    metaModuleAlias = ['metaConvertVar!', 'module'];
  }
  if (!runtimeModuleAlias) {
    runtimeModuleAlias = ['metaConvertVar!', 'module'];
  }
  fnCall = includeModuleFunctionCall(exp, metaExpList, env, runtimeModuleAlias, metaModuleAlias);
  moduleFnCall = ['metaConvertVar!', 'moduleFnCall'];
  metaBegin = metaConvert('begin!', metaExpList, env);
  compileTimeAssignList = [];
  runtimeAssignList = [];
  for (_i = 0, _len = metaImportItemList.length; _i < _len; _i++) {
    _ref4 = metaImportItemList[_i], name = _ref4[0], asName = _ref4[1];
    compileTimeAssignList.push(['=', asName, ['index!', metaModuleAlias, '"' + entity(name) + '"']]);
  }
  compileTimeAssignList = begin(compileTimeAssignList);
  for (_j = 0, _len1 = importItemList.length; _j < _len1; _j++) {
    _ref5 = importItemList[_j], name = _ref5[0], asName = _ref5[1];
    runtimeAssignList.push(['=', asName, ['index!', runtimeModuleAlias, '"' + entity(name) + '"']]);
  }
  runtimeAssignList = metaConvert(begin(runtimeAssignList), metaExpList, env);
  return ['begin!', ['var', moduleFnCall], ['=', moduleFnCall, fnCall], compileTimeAssignList, ['list!', metaBegin, moduleFnCall, runtimeAssignList]];
};

include = function(exp, metaExpList, env) {
  var newEnv, _ref3;
  _ref3 = parseModule(entity(exp[1]), env, exp[2]), exp = _ref3[0], newEnv = _ref3[1];
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
    var args, e, _i, _len, _ref3;
    args = [];
    _ref3 = exp[2];
    for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
      e = _ref3[_i];
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
  return code = nonMetaCompileExp(['=', ['attribute!', 'module', 'exports'], ['->', ['__tjExp'], ['return', exp]]], env);
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
