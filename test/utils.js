var INDENT, NEWLINE, SPACE, constant, isArray, lib, str, _ref;

lib = '../lib/';

_ref = require(lib + 'parser/base'), constant = _ref.constant, isArray = _ref.isArray, str = _ref.str;

NEWLINE = constant.NEWLINE, INDENT = constant.INDENT, SPACE = constant.SPACE;

exports.matchRule = function(parser, rule) {
  return function() {
    var token;
    token = parser.matchToken();
    if (token.type === NEWLINE) {
      parser.matchToken();
    }
    if (token.type === SPACE) {
      parser.matchToken();
    }
    return rule();
  };
};
