var LIST, SYMBOL, VALUE, begin, binary, binaryConverters, convert, convertArgumentList, convertAttribute, convertEllipsisRange, convertForInOf, convertList, ellipsisIndex, ellipsisStopOp, error, idBinaryConvert, identifierCharSet, isArray, op, prefix, pushExp, str, suffix, symbol, symbolOf, trace, undefinedExp, _fn, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;

_ref = require('../utils'), isArray = _ref.isArray, error = _ref.error, begin = _ref.begin, undefinedExp = _ref.undefinedExp, pushExp = _ref.pushExp, identifierCharSet = _ref.identifierCharSet, str = _ref.str, symbolOf = _ref.symbolOf, trace = _ref.trace;

_ref1 = require('../constant'), SYMBOL = _ref1.SYMBOL, VALUE = _ref1.VALUE, LIST = _ref1.LIST;

_ref2 = require('../compiler'), convertList = _ref2.convertList, convert = _ref2.convert, convertArgumentList = _ref2.convertArgumentList;

binaryConverters = require('./core').binaryConverters;

ellipsisIndex = function(kind, list, start, stop, env) {
  if (start === void 0) {
    start = 0;
  }
  if (kind === '...') {
    if (stop === void 0) {
      return ['call!', ['attribute!', list, 'slice'], [start]];
    } else {
      return ['call!', ['attribute!', list, 'slice'], [start, stop]];
    }
  } else {
    if (stop === void 0) {
      return ['call!', ['attribute!', list, 'slice'], [start]];
    } else {
      return ['call!', ['attribute!', list, 'slice'], [start, ['+', stop, 1]]];
    }
  }
};

exports['index!'] = function(exp, env) {
  var exp2, exp20Value, exp2Value;
  exp2 = exp[2];
  exp20Value = exp2[0];
  if (exp2 instanceof Array) {
    if (exp20Value === '...' || exp20Value === '..') {
      return convert(ellipsisIndex(exp20Value, exp[1], exp2[1], exp2[2]), env);
    } else if (exp20Value === 'x...') {
      return convert(ellipsisIndex('...', exp[1], exp2[1], void 0), env);
    } else if (exp20Value === '...x') {
      return convert(ellipsisIndex('...', exp[1], void 0, exp2[1]), env);
    } else if (exp20Value === '..x') {
      return convert(ellipsisIndex('..', exp[1], void 0, exp2[1]), env);
    } else {
      return ['index!', convert(exp[1], env), convert(exp[2], env)];
    }
  } else if ((exp2Value = exp2.value) === '..' || exp2Value === '...') {
    return convert(['call!', ['attribute!', exp[1], 'slice'], []], env);
  }
  return ['index!', convert(exp[1], env), convert(exp[2], env)];
};

exports['::'] = ['jsvar!', 'prototype'];

exports['attribute!'] = exports['.'] = function(exp, env) {
  return convertAttribute(exp[1], exp[2], env);
};

convertAttribute = function(obj, attr, env) {
  var c, nonJs, _i, _len;
  obj = convert(obj, env);
  attr = symbolOf(attr);
  trace(str(obj, attr));
  if (symbolOf(attr) === '::') {
    return ['attribute!', obj, 'prototype'];
  }
  nonJs = false;
  for (_i = 0, _len = attr.length; _i < _len; _i++) {
    c = attr[_i];
    if (!identifierCharSet[c]) {
      nonJs = true;
      break;
    }
  }
  if (nonJs) {
    return ['index!', obj, '"' + attr + '"'];
  } else {
    return ['attribute!', obj, attr];
  }
};

idBinaryConvert = function(exp, env) {
  return [exp[0], exp[1], convert(exp[2], env), convert(exp[3], env)];
};

binary = function(symbol) {
  return function(exp, env) {
    return ['binary!', symbol].concat(convertList(exp, env));
  };
};

_ref3 = '+ - * / && || << >> >>> != !== > < >= <='.split(' ');
for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
  symbol = _ref3[_i];
  exports[symbol] = binary(symbol);
  binaryConverters[symbol] = idBinaryConvert;
}

binaryConverters['.'] = function(exp, env) {
  return convertAttribute(exp[2], exp[3], env);
};

exports['=='] = binary('===');

exports['!='] = binary('!==');

exports['==='] = binary('==');

exports['!=='] = binary('!=');

exports['and'] = binary('&&');

exports['or'] = binary('||');

exports['binary,'] = binary(',');

_ref4 = '+ -'.split(' ');
_fn = function(symbol) {
  return exports[symbol] = function(exp, env) {
    if (exp.length === 2) {
      return ['binary!', symbol].concat(convertList(exp, env));
    } else {
      return ['prefix!', symbol].concat(convert(exp[1], env));
    }
  };
};
for (_j = 0, _len1 = _ref4.length; _j < _len1; _j++) {
  symbol = _ref4[_j];
  _fn(symbol);
}

_ref5 = '+ - * / && || << >> >>> ,'.split(' ');
for (_k = 0, _len2 = _ref5.length; _k < _len2; _k++) {
  symbol = _ref5[_k];
  op = symbol + '=';
  exports[op] = binary(op);
  binaryConverters[op] = function(exp, env) {
    return [exp[0], exp[1], convert(exp[2], env), convert(exp[3], env)];
  };
}

exports['instanceof'] = binary('instanceof');

prefix = function(symbol) {
  return function(exp, env) {
    return ['prefix!', symbol, convert(exp[1], env)];
  };
};

_ref6 = '++x --x yield new typeof void !x ~x +x -x'.split(' ');
for (_l = 0, _len3 = _ref6.length; _l < _len3; _l++) {
  symbol = _ref6[_l];
  if (symbol[symbol.length - 1] === 'x') {
    exports[symbol] = prefix(symbol.slice(0, symbol.length - 1));
  } else {
    exports[symbol] = prefix(symbol);
  }
}

exports['not'] = prefix('!');

suffix = function(symbol) {
  return function(exp, env) {
    return ['suffix!', symbol, convert(exp[1], env)];
  };
};

_ref7 = 'x++ x--'.split(' ');
for (_m = 0, _len4 = _ref7.length; _m < _len4; _m++) {
  symbol = _ref7[_m];
  if (symbol[0] === 'x') {
    exports[symbol] = suffix(symbol.slice(1));
  } else {
    exports[symbol] = suffix(symbol);
  }
}

exports['!!x'] = function(exp, env) {
  return ['prefix!', '!', ['prefix!', '!', convert(exp[1], env)]];
};

exports['print'] = function(exp, env) {
  return ['call!', ['attribute!', 'console', 'log'], convertArgumentList(exp.slice(1), env)];
};

exports['jsvar!'] = function(exp, env) {
  env.set(exp[1].value, exp[1]);
  return exp;
};

exports['return'] = function(exp, env) {
  return ['return', convert(exp[1], env)];
};

(function() {
  var sym, _len5, _n, _ref8, _results;
  _ref8 = 'undefined null true false this console Math Object Array'.split(' ');
  _results = [];
  for (_n = 0, _len5 = _ref8.length; _n < _len5; _n++) {
    sym = _ref8[_n];
    _results.push(exports[sym] = ['jsvar!', sym]);
  }
  return _results;
})();

(function() {
  var sym, _len5, _n, _ref8, _results;
  _ref8 = 'window document'.split(' ');
  _results = [];
  for (_n = 0, _len5 = _ref8.length; _n < _len5; _n++) {
    sym = _ref8[_n];
    _results.push(exports[sym] = ['jsvar!', sym]);
  }
  return _results;
})();

(function() {
  var sym, _len5, _n, _ref8, _results;
  _ref8 = 'require module exports process'.split(' ');
  _results = [];
  for (_n = 0, _len5 = _ref8.length; _n < _len5; _n++) {
    sym = _ref8[_n];
    _results.push(exports[sym] = ['jsvar!', sym]);
  }
  return _results;
})();

exports['__$taiji_$_$parser__'] = ['jsvar!', '__$taiji_$_$parser__'];

exports['@'] = ['jsvar!', 'this'];

exports['::'] = ['jsvar!', 'prototype'];

exports['arguments'] = ['jsvar!', 'arguments'];

exports['regexp!'] = function(exp, env) {
  return ['regexp!', exp[1]];
};

exports['eval'] = ['jsvar!', 'eval'];

exports['__filename'] = ['jsvar!', '__filename'];

exports['__dir'] = ['jsvar!', '__dir'];

convertForInOf = function(head) {};

exports['forOf!'] = function(exp, env) {
  var body, key, obj;
  key = exp[0], obj = exp[1], body = exp[2];
  if (key[0] !== 'metaConvertVar!' && !env.hasFnLocal(key.value)) {
    env.set(key.value, key);
    key = ['var', key];
  } else {
    key = convert(key, env);
  }
  return ['jsForIn!', key, convert(obj, env), convert(body, env)];
};

exports['forIn!'] = function(exp, env) {
  var body, i, item, length, range, result, vRange;
  item = exp[0], range = exp[1], body = exp[2];
  result = [];
  vRange = env.newVar('range');
  result.push(['direct!', ['var', vRange]]);
  env.set(vRange.symbol, vRange);
  result.push(['=', vRange, range]);
  length = env.newVar('length');
  env.set(length.symbol, length);
  result.push(['direct!', ['var', length]]);
  result.push(['=', length, ['attribute!', vRange, 'length']]);
  i = env.newVar('i');
  result.push(['direct!', ['var', i]]);
  env.set(i.symbol, i);
  result.push(['=', i, 0]);
  result.push(['while', ['<', i, length], begin([['=', item, ['index!', vRange, ['x++', i]]], body])]);
  return convert(begin(result), env);
};

ellipsisStopOp = {
  '...': '<',
  '..': '<='
};

convertEllipsisRange = function(kind) {
  return function(exp, env) {
    var i, list, result, start, stop, vStop;
    start = exp[0], stop = exp[1];
    result = [];
    list = env.newVar('list');
    result.push(['direct!', ['var', list]]);
    env.set(list.symbol, list);
    result.push(['=', list, []]);
    vStop = env.newVar('stop');
    result.push(['direct!', ['var', vStop]]);
    env.set(vStop.symbol, vStop);
    result.push(['=', vStop, stop]);
    i = env.newVar('i');
    result.push(['direct!', ['var', i]]);
    env.set(i.symbol, i);
    result.push(['=', i, start]);
    result.push(['while', [ellipsisStopOp[kind], i, vStop], begin([pushExp(list, ['x++', i])])]);
    result.push(list);
    return convert(begin(result), env);
  };
};

exports['..'] = convertEllipsisRange('..');

exports['...'] = convertEllipsisRange('...');
