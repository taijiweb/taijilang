var begin, binary, binaryConverters, call, convert, convertEllipsisRange, convertForInOf, convertHash, convertInterpolatedString, convertList, ellipsisIndex, ellipsisStopOp, entity, error, idBinaryConvert, identifierCharSet, isArray, prefix, pushExp, suffix, symbol, undefinedExp, _fn, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6;

_ref = require('../utils'), isArray = _ref.isArray, error = _ref.error, entity = _ref.entity, begin = _ref.begin, undefinedExp = _ref.undefinedExp, pushExp = _ref.pushExp, identifierCharSet = _ref.identifierCharSet;

_ref1 = require('../compiler'), convertList = _ref1.convertList, convert = _ref1.convert;

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
  var eExp1, exp1, exp10;
  exp1 = exp[1];
  exp10 = entity(exp1[0]);
  if (Object.prototype.toString.call(exp1) === '[object Array]') {
    if (exp10 === '...' || exp10 === '..') {
      return convert(ellipsisIndex(exp10, exp[0], exp1[1], exp1[2]), env);
    } else if (exp10 === 'x...') {
      return convert(ellipsisIndex('...', exp[0], exp1[1], void 0), env);
    } else if (exp10 === '...x') {
      return convert(ellipsisIndex('...', exp[0], void 0, exp1[1]), env);
    } else if (exp10 === '..x') {
      return convert(ellipsisIndex('..', exp[0], void 0, exp1[1]), env);
    } else {
      return ['index!', convert(exp[0], env), convert(exp[1], env)];
    }
  } else if ((eExp1 = entity(exp1)) === '..' || eExp1 === '...') {
    return convert(['call!', ['attribute!', exp[0], 'slice'], []], env);
  }
  return ['index!', convert(exp[0], env), convert(exp[1], env)];
};

exports['::'] = ['attribute!', 'this', 'prototype'];

exports['attribute!'] = function(exp, env) {
  var attr, c, nonJs, obj, _i, _len;
  obj = convert(exp[0], env);
  if ((attr = entity(exp[1])) === '::') {
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

call = function(caller) {
  return function(exp, env) {
    return convert(['call!', caller, exp], env);
  };
};

idBinaryConvert = function(op, left, right, env) {
  return ['binary!', op, convert(left, env), convert(right, env)];
};

binary = function(symbol) {
  return function(exp, env) {
    return ['binary!', symbol].concat(convertList(exp, env));
  };
};

_ref2 = '+ - * / && || << >> >>> != !== > < >= <='.split(' ');
for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
  symbol = _ref2[_i];
  exports[symbol] = binary(symbol);
  binaryConverters[symbol] = idBinaryConvert;
}

exports['=='] = binary('===');

exports['!='] = binary('!==');

exports['==='] = binary('==');

exports['!=='] = binary('!=');

exports['and'] = binary('&&');

exports['or'] = binary('||');

exports['binary,'] = binary(',');

_ref3 = '+ -'.split(' ');
_fn = function(symbol) {
  return exports[symbol] = function(exp, env) {
    if (exp.length === 2) {
      return ['binary!', symbol].concat(convertList(exp, env));
    } else {
      return ['prefix!', symbol].concat(convert(exp[0], env));
    }
  };
};
for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
  symbol = _ref3[_j];
  _fn(symbol);
}

_ref4 = '+ - * / && || << >> >>> ,'.split(' ');
for (_k = 0, _len2 = _ref4.length; _k < _len2; _k++) {
  symbol = _ref4[_k];
  exports[symbol + '='] = binary(symbol + '=');
}

exports['instanceof'] = binary('instanceof');

prefix = function(symbol) {
  return function(exp, env) {
    return ['prefix!', symbol, convert(exp[0], env)];
  };
};

_ref5 = '++x --x yield new typeof void !x ~x +x -x'.split(' ');
for (_l = 0, _len3 = _ref5.length; _l < _len3; _l++) {
  symbol = _ref5[_l];
  if (symbol[symbol.length - 1] === 'x') {
    exports[symbol] = prefix(symbol.slice(0, symbol.length - 1));
  } else {
    exports[symbol] = prefix(symbol);
  }
}

exports['not'] = prefix('!');

suffix = function(symbol) {
  return function(exp, env) {
    return ['suffix!', symbol, convert(exp[0], env)];
  };
};

_ref6 = 'x++ x--'.split(' ');
for (_m = 0, _len4 = _ref6.length; _m < _len4; _m++) {
  symbol = _ref6[_m];
  if (symbol[0] === 'x') {
    exports[symbol] = suffix(symbol.slice(1));
  } else {
    exports[symbol] = suffix(symbol);
  }
}

exports['!!x'] = function(exp, env) {
  return ['prefix!', '!', ['prefix!', '!', convert(exp[0], env)]];
};

exports['print'] = call(['attribute!', 'console', 'log']);

exports['jsvar!'] = function(exp, env) {
  env.set(entity(exp[0]), entity(exp[0]));
  return ['jsvar!', exp[0]];
};

exports['return'] = function(exp, env) {
  return ['return', convert(exp[0], env)];
};

(function() {
  var sym, _len5, _n, _ref7, _results;
  _ref7 = 'undefined null true false this console Math Object Array'.split(' ');
  _results = [];
  for (_n = 0, _len5 = _ref7.length; _n < _len5; _n++) {
    sym = _ref7[_n];
    _results.push(exports[sym] = ['jsvar!', sym]);
  }
  return _results;
})();

(function() {
  var sym, _len5, _n, _ref7, _results;
  _ref7 = 'window'.split(' ');
  _results = [];
  for (_n = 0, _len5 = _ref7.length; _n < _len5; _n++) {
    sym = _ref7[_n];
    _results.push(exports[sym] = ['jsvar!', sym]);
  }
  return _results;
})();

(function() {
  var sym, _len5, _n, _ref7, _results;
  _ref7 = 'require module exports process'.split(' ');
  _results = [];
  for (_n = 0, _len5 = _ref7.length; _n < _len5; _n++) {
    sym = _ref7[_n];
    _results.push(exports[sym] = ['jsvar!', sym]);
  }
  return _results;
})();

exports['__$taiji_$_$parser__'] = ['jsvar!', '__$taiji_$_$parser__'];

exports['@'] = ['jsvar!', 'this'];

exports['arguments'] = ['jsvar!', 'arguments'];

exports['regexp!'] = function(exp, env) {
  return ['regexp!', exp[0]];
};

exports['eval'] = ['jsvar!', 'eval'];

exports['__filename'] = ['jsvar!', '__filename'];

exports['__dir'] = ['jsvar!', '__dir'];

exports["string!"] = convertInterpolatedString = function(exp, env) {
  var e, e0, piece, result, x, _len5, _n;
  result = ['string!'];
  piece = '""';
  for (_n = 0, _len5 = exp.length; _n < _len5; _n++) {
    e = exp[_n];
    if (Object.prototype.toString.call(e) === '[object Array]') {
      x = convert(e, env);
    } else {
      e0 = entity(e);
      if (typeof e0 === 'string' && e0[0] === '"') {
        x = e0;
      } else {
        x = convert(e, env);
      }
    }
    if (typeof x === 'string' && x[0] === '"') {
      piece = piece.slice(0, piece.length - 1) + x.slice(1);
    } else {
      if (piece !== '""') {
        result.push(piece);
        piece = '""';
      }
      if (Object.prototype.toString.call(x) === '[object Array]') {
        if (x[0] === 'string!') {
          result.push.apply(result, x.slice(1));
        } else {
          result.push(x);
        }
      } else {
        result.push(x);
      }
    }
  }
  if (piece !== '""') {
    result.push(piece);
  }
  if (result.length === 1) {
    return '""';
  } else if (result.length === 2 && typeof result[1] === 'string' && result[1][0] === '"') {
    return result[1];
  } else {
    return result;
  }
};

exports["hash!"] = convertHash = function(exp, env) {
  var e, jsHashItems, pyHashItems, result, v, _len5, _len6, _n, _o;
  jsHashItems = [];
  pyHashItems = [];
  for (_n = 0, _len5 = exp.length; _n < _len5; _n++) {
    e = exp[_n];
    if (e[0] === 'jshashitem!') {
      jsHashItems.push(['hashitem!', e[1], convert(e[2], env)]);
    } else {
      pyHashItems.push([convert(e[1], env), convert(e[2], env)]);
    }
  }
  if (pyHashItems.length === 0) {
    return ['hash!', jsHashItems];
  }
  result = ['begin!', ['var', v = env.newVar('hash')], ['=', v, ['hash!', jsHashItems]]];
  for (_o = 0, _len6 = pyHashItems.length; _o < _len6; _o++) {
    e = pyHashItems[_o];
    result.push(['=', ['index!', v, e[0]], e[1]]);
  }
  result.push(v);
  return result;
};

convertForInOf = function(head) {};

exports['forOf!!'] = function(exp, env) {
  var body, key, key1, obj, result, vObj, value;
  key = exp[0], value = exp[1], obj = exp[2], body = exp[3];
  if (key[0] !== 'metaConvertVar!' && !env.hasFnLocal(key.value)) {
    env.set(key.value, key);
    key1 = ['var', key];
  } else {
    key1 = convert(key, env);
  }
  vObj = env.newVar('obj');
  env.set(vObj.symbol, vObj);
  result = [['direct!', ['var', vObj]], ['=', vObj, obj]];
  result.push(['=', value, ['index!', vObj, key]]);
  body = begin(result.concat(body));
  return ['jsForIn!', key1, convert(vObj, env), convert(body, env)];
};

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

exports['forIn!!'] = function(exp, env) {
  var body, index, item, length, range, result, vRange;
  item = exp[0], index = exp[1], range = exp[2], body = exp[3];
  result = [];
  vRange = env.newVar('range');
  result.push(['direct!', ['var', vRange]]);
  env.set(vRange.symbol, vRange);
  result.push(['=', vRange, range]);
  length = env.newVar('length');
  result.push(['direct!', ['var', length]]);
  length = env.newVar('length');
  result.push(['=', length, ['attribute!', vRange, 'length']]);
  result.push(['=', index, 0]);
  result.push(['while', ['<', index, length], begin([['=', item, ['index!', vRange, ['x++', index]]], body])]);
  return convert(begin(result), env);
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

exports['callByThis!'] = function(exp, env) {
  var args, caller;
  caller = exp[0], args = exp[1];
  return convert(['call!', ['attribute!', caller, 'call'], ['this'].concat(args)], env);
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
