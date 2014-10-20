var BINARY, BLOCK_COMMENT, BRACKET, CODE_BLOCK_COMMENT, CODE_BLOCK_COMMENT_LEAD_SYMBOL, COMPACT_CLAUSE_EXPRESSION, CONCAT_LINE, CONJUNCTION, CURVE, C_BLOCK_COMMENT, DATA_BRACKET, END_INTERPOLATED_STRING, EOI, FUNCTION, HALF_DENT, HASH, HEAD_SPACES, IDENTIFIER, INDENT, INDENT_EXPRESSION, INLINE_COMMENT, INTERPOLATE_EXPRESSION, INTERPOLATE_STRING, KEYWORD, LINE_COMMENT, MODULE, MODULE_HEADER, NEWLINE, NON_INTERPOLATE_STRING, NUMBER, OPERATOR_EXPRESSION, PAREN, PREFIX, PUNCTUATION, REGEXP, RIGHT_DELIMITER, SPACE, SPACES, SPACES_INLINE_COMMENT, SPACE_CLAUSE_EXPRESSION, SPACE_COMMENT, STRING, SUFFIX, SYMBOL, TAIL_COMMENT, UNDENT, base, begin, binaryOperatorDict, charset, colors, compileExp, conjMap, conjunctionHasOwnProperty, constant, dict, digitCharSet, digitChars, entity, escapeNewLine, extend, firstIdentifierCharSet, firstIdentifierChars, firstSymbolCharset, getOperatorExpression, hasOwnProperty, identifierCharSet, identifierChars, isArray, isConjunction, isKeyword, keywordHasOwnProperty, keywordMap, letterCharSet, letterChars, letterDigitSet, list2dict, makeOperatorExpression, prefixOperatorDict, str, suffixOperatorDict, taijiIdentifierCharSet, wrapInfo1, wrapInfo2, _ref, _ref1, _ref2,
  __slice = [].slice;

colors = require('colors');

_ref = require('../utils'), charset = _ref.charset, isArray = _ref.isArray, wrapInfo1 = _ref.wrapInfo1, wrapInfo2 = _ref.wrapInfo2, str = _ref.str, entity = _ref.entity;

_ref1 = base = require('./base'), extend = _ref1.extend, firstIdentifierChars = _ref1.firstIdentifierChars, firstIdentifierCharSet = _ref1.firstIdentifierCharSet, letterDigitSet = _ref1.letterDigitSet, identifierChars = _ref1.identifierChars, digitCharSet = _ref1.digitCharSet, letterCharSet = _ref1.letterCharSet, identifierCharSet = _ref1.identifierCharSet, firstSymbolCharset = _ref1.firstSymbolCharset, taijiIdentifierCharSet = _ref1.taijiIdentifierCharSet, constant = _ref1.constant;

digitChars = base.digits;

letterChars = base.letters;

NUMBER = constant.NUMBER, STRING = constant.STRING, IDENTIFIER = constant.IDENTIFIER, SYMBOL = constant.SYMBOL, REGEXP = constant.REGEXP, HEAD_SPACES = constant.HEAD_SPACES, CONCAT_LINE = constant.CONCAT_LINE, PUNCTUATION = constant.PUNCTUATION, FUNCTION = constant.FUNCTION, C_BLOCK_COMMENT = constant.C_BLOCK_COMMENT, PAREN = constant.PAREN, BRACKET = constant.BRACKET, DATA_BRACKET = constant.DATA_BRACKET, CURVE = constant.CURVE, INDENT_EXPRESSION = constant.INDENT_EXPRESSION, NEWLINE = constant.NEWLINE, SPACES = constant.SPACES, INLINE_COMMENT = constant.INLINE_COMMENT, SPACES_INLINE_COMMENT = constant.SPACES_INLINE_COMMENT, LINE_COMMENT = constant.LINE_COMMENT, BLOCK_COMMENT = constant.BLOCK_COMMENT, CODE_BLOCK_COMMENT = constant.CODE_BLOCK_COMMENT, CONCAT_LINE = constant.CONCAT_LINE, NON_INTERPOLATE_STRING = constant.NON_INTERPOLATE_STRING, INTERPOLATE_STRING = constant.INTERPOLATE_STRING, EOI = constant.EOI, INDENT = constant.INDENT, UNDENT = constant.UNDENT, HALF_DENT = constant.HALF_DENT, MODULE_HEADER = constant.MODULE_HEADER, MODULE = constant.MODULE, SPACE_COMMENT = constant.SPACE_COMMENT, TAIL_COMMENT = constant.TAIL_COMMENT, SPACE = constant.SPACE, HASH = constant.HASH, RIGHT_DELIMITER = constant.RIGHT_DELIMITER, KEYWORD = constant.KEYWORD, CONJUNCTION = constant.CONJUNCTION, CODE_BLOCK_COMMENT_LEAD_SYMBOL = constant.CODE_BLOCK_COMMENT_LEAD_SYMBOL, PREFIX = constant.PREFIX, SUFFIX = constant.SUFFIX, BINARY = constant.BINARY, END_INTERPOLATED_STRING = constant.END_INTERPOLATED_STRING, OPERATOR_EXPRESSION = constant.OPERATOR_EXPRESSION, COMPACT_CLAUSE_EXPRESSION = constant.COMPACT_CLAUSE_EXPRESSION, SPACE_CLAUSE_EXPRESSION = constant.SPACE_CLAUSE_EXPRESSION, INTERPOLATE_EXPRESSION = constant.INTERPOLATE_EXPRESSION;

_ref2 = require('./operator'), prefixOperatorDict = _ref2.prefixOperatorDict, suffixOperatorDict = _ref2.suffixOperatorDict, binaryOperatorDict = _ref2.binaryOperatorDict, makeOperatorExpression = _ref2.makeOperatorExpression, getOperatorExpression = _ref2.getOperatorExpression;

dict = function() {
  var d, i, pairs, pairsLength;
  pairs = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  d = {};
  i = 0;
  pairsLength = pairs.length;
  while (i < pairsLength) {
    d[pairs[i]] = pairs[i + 1];
    i += 2;
  }
  return d;
};

list2dict = function() {
  var d, k, keys, _i, _len;
  keys = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  d = {};
  for (_i = 0, _len = keys.length; _i < _len; _i++) {
    k = keys[_i];
    d[k] = 1;
  }
  return d;
};

exports.escapeNewLine = escapeNewLine = function(s) {
  var c;
  return ((function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = s.length; _i < _len; _i++) {
      c = s[_i];
      _results.push(c === '\n' ? '\\n' : '\\r');
    }
    return _results;
  })()).join('');
};

exports.keywordMap = keywordMap = {
  'if': 1,
  'try': 1,
  'switch': 1,
  'while': 1,
  'let': 1,
  'letrec!': 1,
  'letloop!': 1,
  'do': 1,
  'repeat': 1,
  'return': 1,
  'break': 1,
  'continue': 1,
  'throw': 1,
  'function': 1,
  'for': 1,
  'loop': 1,
  'class': 1,
  'var': 1,
  'for': 1
};

keywordHasOwnProperty = Object.hasOwnProperty.bind(exports.keywordMap);

exports.isKeyword = isKeyword = function(item) {
  return item && !item.escaped && hasOwnProperty.call(exports.keywordMap, item.text);
};

exports.conjMap = conjMap = {
  'then': 1,
  'else': 1,
  'catch': 1,
  'finally': 1,
  'case': 1,
  'default': 1,
  'extends': 1,
  'until': 1,
  'where': 1,
  'when': 1
};

conjunctionHasOwnProperty = Object.hasOwnProperty.bind(exports.keywordMap);

exports.isConjunction = isConjunction = function(item) {
  return item && !item.escaped && hasOwnProperty.call(exports.conjMap, item.text);
};

hasOwnProperty = Object.prototype.hasOwnProperty;

begin = function(exp) {
  if (!exp || !exp.push) {
    return exp;
  }
  if (exp.length === 0) {
    return '';
  } else if (exp.length === 1) {
    return exp[0];
  } else {
    exp.unshift('begin!');
    return exp;
  }
};

exports.Parser = function() {
  var atLineHead, atStatementHead, atomTokenTypes, binaryDictOperator, binaryOperatorMemoIndex, bracketVariantMap, breakContinueStatement, c, caseClauseOfSwitchStatement, catchClause, char, concatenateLine, concatenating, conjClause, cursor, curveVariantMap, customBinaryOperatorFnMap, decimal, elseClause, endCursorOfDynamicBlockStack, environment, eof, error, expect, expectChar, expectIdentifier, expectIndentConj, expectOneOfWords, expectWord, expression, expressionMemoIndex, finallyClause, follow, followMatch, followSequence, indent, indentExpression, interolateStringNumber, interpolateStringPiece, isCallable, isIdentifier, itemToParameter, key, keywordTestExpressionBodyStatement, keywordThenElseStatement, leadTokenClause, leadWordClauseMap, leftCBlockComment, leftIndentBlockComment, leftInterpolateString, leftNonInterpolatedString, leftRawInterpolateString, leftRawNonInterpolatedString, leftRegexp, letLikeStatement, lexError, lineStart, lineno, literal, matchToken, maybeOneOfWords, memoIndex, memoMap, newline, nextToken, nonInterpolatedStringLine, operatorExpression, parenVariantMap, parser, predefined, rawInterpolateStringPiece, rawNonInterpolatedStringLine, repeatedCharToken, seperatorList, shadowToken, skipInlineSpace, skipSpaceLines, spaceClauseExpression, spaceComma, symbol2clause, symbolStopChars, text, textLength, thenClause, throwReturnStatement, toParameters, token, tokenFnMap, tokenOnAtChar, tokenOnBackSlashChar, tokenOnColonChar, tokenOnCommaChar, tokenOnDotChar, tokenOnDoubleQuoteChar, tokenOnForwardSlashChar, tokenOnIdentifierChar, tokenOnLeftBracketChar, tokenOnLeftParenChar, tokenOnNewlineChar, tokenOnNumberChar, tokenOnRightDelimiterChar, tokenOnSemiColonChar, tokenOnSingleQuoteChar, tokenOnSpaceChar, tokenOnSymbolChar, unchangeable, word, wrapResult, _i, _j, _len, _len1, _ref3, _ref4;
  parser = this;
  this.predefined = predefined = {};
  unchangeable = ['cursor', 'setCursor', 'lineno', 'setLineno', 'atLineHead', 'atStatementHead', 'setAtStatementHead'];
  text = '';
  textLength = 0;
  cursor = 0;
  char = '';
  lineno = 0;
  lineStart = 0;
  indent = 0;
  atLineHead = true;
  interolateStringNumber = 0;
  token = void 0;
  memoMap = {};
  atStatementHead = true;
  environment = null;
  endCursorOfDynamicBlockStack = [];
  memoIndex = 0;
  eof = {
    type: EOI,
    value: '',
    cursor: textLength,
    column: -1,
    indent: -1
  };
  eof.next = eof;
  nextToken = function() {
    if (token.next) {
      return token = token.next;
    } else {
      return matchToken();
    }
  };
  this.matchToken = matchToken = function() {
    var fn;
    if (!char) {
      if (token === eof) {
        return eof;
      }
      eof.lineno = lineno + 1;
      lineStart = cursor;
      indent = -1;
      token.next = eof;
      return token = eof;
    } else if (fn = tokenFnMap[char]) {
      return token = fn(char);
    } else {
      return token = tokenOnSymbolChar();
    }
  };
  this.token = function() {
    return token;
  };
  tokenFnMap = {};
  tokenOnSymbolChar = function() {
    var c2, cur;
    cur = cursor;
    while (char) {
      if (symbolStopChars[char]) {
        break;
      }
      if (char === '/' && ((c2 = text[cursor + 1]) === '/' || c2 === '*' || c2 === '!')) {
        break;
      }
      char = text[++cursor];
    }
    return token.next = {
      type: SYMBOL,
      value: text.slice(cur, cursor),
      cursor: cur,
      stopCursor: cursor,
      line: lineno,
      column: cursor - lineStart,
      indent: indent
    };
  };
  symbolStopChars = extend(charset(' \t\v\n\r()[]{},;:\'\".@\\'), identifierCharSet);
  tokenFnMap['@'] = tokenFnMap['.'] = tokenOnAtChar = tokenOnDotChar = repeatedCharToken = function() {
    var col, cur, first;
    cur = cursor;
    col = cursor - lineStart;
    first = char;
    char = text[++cursor];
    while (char === first) {
      char = text[++cursor];
    }
    return token.next = {
      type: SYMBOL,
      value: text.slice(cur, cursor),
      cursor: cur,
      stopCursor: cursor,
      line: lineno,
      column: col,
      indent: indent
    };
  };
  tokenFnMap[':'] = tokenOnColonChar = function() {
    var col, cur, first, type;
    cur = cursor;
    col = cursor - lineStart;
    first = char;
    char = text[++cursor];
    while (char === first) {
      char = text[++cursor];
    }
    if (cursor === cur + 1) {
      type = PUNCTUATION;
    } else {
      type = SYMBOL;
    }
    return token.next = {
      type: type,
      value: text.slice(cur, cursor),
      cursor: cur,
      stopCursor: cursor,
      line: lineno,
      column: col,
      indent: indent
    };
  };
  concatenateLine = function() {
    var col, cur, ind;
    cur = cursor - 1;
    col = cursor - lineStart;
    ind = indent;
    if (char === '\n') {
      char = text[++cursor];
      if (char === '\r') {
        char = text[++cursor];
      }
    } else if (char === '\r') {
      char = text[++cursor];
      if (char === '\n') {
        char = text[++cursor];
      }
    }
    lineStart = cursor;
    while ((char = text[cursor]) && char === ' ') {
      cursor++;
    }
    if (char === '\t') {
      error('do not allow use tab character "\t" at the head of line.');
    } else if (char === '\n' || char === '\r') {
      error('should not follow empty line as concatenated line');
    } else if (!char) {
      error('unexpected end of input after concatenated line symbol "\"');
    }
    indent = cursor - lineStart;
    if (indent < ind) {
      error('expect the same indent or more indent for the concatenated lines');
    }
    skipInlineSpace();
    if ((char = text[cursor]) === '\n' || char === '\r') {
      error('concatenated line should not have only spaces and comments');
    }
    return token.next = {
      type: SPACE,
      stopCursor: cursor,
      line: line,
      stopLine: lineno,
      column: col,
      stopColumn: cursor - lineStart,
      indent: ind,
      stopIndent: indent
    };
  };
  tokenFnMap[' '] = tokenFnMap['\t'] = tokenOnSpaceChar = function() {
    var col, cur, dent, line, tkn, type;
    cur = cursor;
    line = lineno;
    col = cursor - lineStart;
    dent = indent;
    char = text[++cursor];
    skipInlineSpace(dent);
    if (char === '\\') {
      char = text[++cursor];
      if (char === '\n' || c === '\r') {
        token.next = tkn = concatenateLine();
        tkn.cursor = cur;
        tkn.col = col;
        tkn.value = text.slice(cur, cursor);
        return tkn;
      } else {
        cursor--;
        return token.next = {
          type: SPACE,
          value: text.slice(cur, cursor),
          cursor: cur,
          stopCursor: cursor,
          line: line,
          stopLine: lineno,
          column: col,
          stopColumn: cursor - lineStart,
          indent: dent,
          stopIndent: indent
        };
      }
    } else if (char === '\n' || char === '\r') {
      skipSpaceLines(dent);
      indent = cursor - lineStart;
      if (!char) {
        type = EOI;
      } else if (indent > dent) {
        type = INDENT;
      } else if (indent < dent) {
        type = UNDENT;
      } else {
        type = NEWLINE;
      }
      return token.next = {
        type: type,
        value: text.slice(cur, cursor),
        cursor: cur,
        line: line,
        column: col,
        indent: dent,
        stopIndent: indent
      };
    } else {
      return token.next = {
        type: SPACE,
        value: text.slice(cur, cursor),
        cursor: cur,
        stopCursor: cursor,
        line: line,
        stopLine: lineno,
        column: col,
        stopColumn: cursor - lineStart,
        indent: dent,
        stopIndent: indent
      };
    }
  };
  skipSpaceLines = function(dent) {
    var c2;
    if (char === '\n') {
      char = text[++cursor];
      if (char === '\r') {
        char = text[++cursor];
      }
    } else if (char === '\r') {
      char = text[++cursor];
      if (char === '\n') {
        char = text[++cursor];
      }
    }
    lineStart = cursor;
    while (1) {
      if (!char) {
        return;
      }
      while (char && char === ' ') {
        cursor++;
        char = text[cursor];
      }
      if (char === '\t') {
        unexpectedTabCharAtLineHead();
      } else if (char === '\n') {
        if (char === '\r') {
          cursor += 2;
        } else {
          cursor++;
        }
        char = text[cursor];
        lineno++;
        lineStart = cursor;
        continue;
      } else if (char === '\r') {
        if (char === '\n') {
          cursor += 2;
        } else {
          cursor++;
        }
        char = text[cursor];
        lineno++;
        lineStart = cursor;
        continue;
      } else if (!char) {
        break;
      } else if (cursor - lineStart !== dent) {
        break;
      } else if (char === '/') {
        if ((c2 = text[cursor + 1]) === '/') {
          cursor += 2;
          char = text[cursor];
          while ((char = text[cursor]) && char !== '\n' && char !== '\r') {
            cursor++;
            char = text[cursor];
          }
          continue;
        } else if (c2 === '.') {
          if (atLineHead) {
            leftIndentBlockComment(dent);
            continue;
          } else {
            break;
          }
        } else if (c2 === '*') {
          cursor += 2;
          char = text[cursor];
          leftCBlockComment();
          skipInlineSpace();
          if (char === '\n') {
            if (char === '\r') {
              cursor += 2;
            } else {
              cursor++;
            }
            char = text[cursor];
            lineno++;
            lineStart = cursor;
            continue;
          } else if (char === '\r') {
            if (char === '\n') {
              cursor += 2;
            } else {
              cursor++;
            }
            char = text[cursor];
            lineno++;
            lineStart = cursor;
            continue;
          } else {
            break;
          }
        } else if (c2 === '!') {
          break;
        } else {
          break;
        }
      } else {
        break;
      }
    }
  };
  skipInlineSpace = function(dent) {
    var c2, _results;
    _results = [];
    while (1) {
      while (char === ' ' || char === '\t') {
        char = text[++cursor];
      }
      if (char === '/') {
        if ((c2 = text[cursor + 1]) === '*') {
          cursor += 2;
          char = text[cursor];
          leftCBlockComment(dent);
          continue;
        }
        if (c2 === '/') {
          cursor += 2;
          char = text[cursor];
          while (char !== '\n' && char !== '\r') {
            char = text[++cursor];
            continue;
          }
          break;
        }
      }
      break;
    }
    return _results;
  };
  this.newline = newline = function() {
    var c, c2;
    if ((c = char) === '\r') {
      cursor++;
      if ((c2 = text[cursor]) === '\n') {
        cursor++;
        c2 = '\n';
      }
      char = text[cursor];
      lineno++;
      lineStart = cursor;
    } else if (char === '\n') {
      cursor++;
      if ((c2 = text[cursor]) === '\r') {
        cursor++;
        c2 = '\r';
      }
      char = text[cursor];
      lineno++;
      lineStart = cursor;
    } else {
      return;
    }
    return c + (c2 || '');
  };
  leftIndentBlockComment = function(dent) {
    var _results;
    while (char !== '\n' && char !== '\r') {
      cursor++;
      char = text[cursor];
    }
    _results = [];
    while (1) {
      if (char === '\n') {
        if (text[cursor + 1] === '\r') {
          cursor += 2;
        } else {
          cursor++;
        }
        char = text[cursor];
        lineno++;
        lineStart = cursor;
        while (char === ' ') {
          cursor++;
          char = text[cursor];
        }
        if (char === '\n' || char === '\r') {
          continue;
        }
        if (char === '\t') {
          unexpectedTabCharAtLineHead();
        }
        if (cursor - lineStart <= dent) {
          break;
        } else {
          _results.push(void 0);
        }
      } else if (char === '\r') {
        if (text[cursor + 1] === '\n') {
          cursor += 2;
        } else {
          cursor += 1;
        }
        char = text[cursor];
        lineno++;
        lineStart = cursor;
        while (char === ' ') {
          cursor++;
          char = text[cursor];
        }
        if (char === '\n' || char === '\r') {
          continue;
        }
        if (char === '\t') {
          unexpectedTabCharAtLineHead();
        }
        if (cursor - lineStart <= dent) {
          break;
        } else {
          _results.push(void 0);
        }
      } else if (!char) {
        break;
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };
  leftCBlockComment = function(dent) {
    var _results;
    _results = [];
    while (1) {
      if (char === '*' && text[cursor + 1] === '/') {
        cursor += 2;
        char = text[cursor];
        break;
      } else if (char === '\n') {
        cursor++;
        char = text[cursor];
        lineno++;
        if (char === '\r') {
          cursor++;
          char = text[cursor];
        }
        lineStart = cursor;
        while (char === ' ') {
          cursor++;
          char = text[cursor];
        }
        if (char === '\t') {
          unexpectedTabCharAtLineHead();
        }
        if (char === '\n' || char === '\r') {
          continue;
        } else if (!char) {
          unexpectedEOI('while parsing c style block comment /* */');
        }
        if (lineStart - cursor < dent) {
          _results.push(expectMoreIndent(dent, 'while parsing c style block comment /* */'));
        } else {
          _results.push(void 0);
        }
      } else if (char === '\r') {
        cursor++;
        char = text[cursor];
        lineno++;
        if (char === '\n') {
          cursor++;
          char = text[cursor];
        }
        lineStart = cursor;
        while (char === ' ') {
          cursor++;
          char = text[cursor];
        }
        if (char === '\t') {
          unexpectedTabCharAtLineHead();
        }
        if (char === '\n' || char === '\r') {
          continue;
        } else if (!char) {
          unexpectedEOI('while parsing c style block comment /* */');
        }
        if (lineStart - cursor < dent) {
          _results.push(expectMoreIndent(dent));
        } else {
          _results.push(void 0);
        }
      } else if (!char) {
        _results.push(unexpectedEOI('while parsing c style block comment /* */'));
      } else {
        cursor++;
        _results.push(char = text[cursor]);
      }
    }
    return _results;
  };
  leftRegexp = function() {
    var c2, i;
    while (char) {
      if (char === '\\') {
        if ((c2 = text[cursor + 1] === '/') || c2 === '\\') {
          cursor += 2;
          char = text[cursor];
        } else {
          char = text[cursor++];
        }
      } else if (char === '\n' || char === '\r') {
        error('meet unexpected new line while parsing regular expression');
      } else if (char === '/') {
        i = 0;
        char = text[++cursor];
        while (char) {
          if (char === 'i' || char === 'g' || char === 'm') {
            char = text[++cursor];
            ++i;
          } else {
            break;
          }
          if (i > 3) {
            error('too many modifiers "igm" after regexp');
          }
        }
        return;
      } else {
        char = text[++cursor];
      }
    }
    if (!char) {
      return error('unexpected end of input while parsing regexp');
    }
  };
  tokenFnMap['\\'] = tokenOnBackSlashChar = function() {
    var c, col, cur, line, tkn, _i, _len, _ref3;
    cur = cursor;
    col = cursor - lineStart;
    char = text[++cursor];
    if (char === '\n' || char === '\r') {
      token.next = tkn = concatenateLine();
      tkn.cursor = cur;
      tkn.column = col;
      tkn.value = text.slice(cur, cursor);
      return tkn;
    }
    line = lineno;
    if (firstIdentifierCharSet[char]) {
      tkn = tokenOnIdentifierChar();
      tkn.escaped = true;
      tkn.cursor = cur;
      return token.next = tkn;
    } else if (firstSymbolCharset[char]) {
      tkn = tokenOnSymbolChar();
      tkn.escaped = true;
      tkn.cursor = cur;
      token.value = '\\' + token.value;
      return token.next = tkn;
    } else if (char === ':') {
      tkn = tokenOnColonChar();
      tkn.value = '\\' + tkn.value;
      tkn.escaped = true;
      tkn.cursor = cur;
      return token.next = tkn;
    } else if (char === '@') {
      tkn = tokenOnAtChar();
      tkn.value = '\\' + tkn.value;
      tkn.escaped = true;
      tkn.cursor = cur;
      return token.next = tkn;
    } else if (char === '.') {
      tkn = tokenOnDotChar();
      tkn.value = '\\' + tkn.value;
      tkn.escaped = true;
      tkn.cursor = cur;
      return token.next = tkn;
    } else if (char === "'") {
      tkn = tokenOnSingleQuoteChar();
      if (text[cur + 2] === "'" && text[cur + 3] === "'") {
        char = text[++cursor];
        return token.next = {
          type: SYMBOL,
          value: '\\',
          cursor: cur,
          stopCursor: cursor,
          line: lineno,
          column: cur - lineStart,
          indent: indent,
          stopIndent: indent,
          next: tkn
        };
      } else {
        _ref3 = text.slice(cur + 2, tkn.stopCursor);
        for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
          c = _ref3[_i];
          if (c === '\n' || c === '\r') {
            error('unexpected new line characters in escaped string');
          }
        }
        tkn.escaped = true;
        tkn.cursor = cur;
        return token.next = tkn;
      }
    } else {
      while (char = text[++cursor] === '\\') {
        true;
      }
      return token.next = {
        type: SYMBOL,
        value: text.slice(cur, cursor),
        cursor: cur,
        stopCursor: cursor,
        line: lineno,
        column: cur - lineStart,
        indent: indent
      };
    }
  };
  tokenFnMap['/'] = tokenOnForwardSlashChar = function() {
    var col, cur, ind, line, prev, t, type, value;
    cur = cursor;
    col = cursor - lineStart;
    char = text[++cursor];
    line = lineno;
    ind = indent;
    if (char === '/') {
      cursor++;
      char = text[cursor];
      while (char && char !== '\n' && char !== '\r') {
        cursor++;
        char = text[cursor];
      }
      skipSpaceLines(indent);
      if (!char) {
        type = EOI;
      } else if (indent > ind) {
        type = INDENT;
      } else if (indent === ind) {
        type = NEWLINE;
      } else {
        type = UNDENT;
      }
      return token.next = {
        type: type,
        value: text.slice(cur, cursor),
        cursor: cur,
        stopCursor: cursor,
        line: line,
        column: col,
        indent: ind,
        stopIndent: indent
      };
    } else if (char === '*') {
      leftCBlockComment();
      skipInlineSpace();
      if (!char) {
        return t = EOI;
      } else if (char === '\n' || char === '\r') {
        skipSpaceLines(ind);
        if (!char) {
          type = EOI;
        } else if (indent > ind) {
          type = INDENT;
        } else if (indent === ind) {
          type = NEWLINE;
        } else {
          type = UNDENT;
        }
        return token.next = {
          type: type,
          value: text.slice(cur, cursor),
          cursor: cur,
          stopCursor: cursor,
          line: line,
          column: col,
          indent: ind,
          stopIndent: indent
        };
      } else {
        type = SPACE;
        return token.next = {
          type: type,
          value: text.slice(cur, cursor),
          cursor: cur,
          stopCursor: cursor,
          line: line,
          column: col,
          indent: ind
        };
      }
    } else if (char === '!') {
      cur = cursor;
      cursor += 2;
      char = text[cursor];
      col = cursor - lineStart;
      leftRegexp();
      return token.next = {
        type: REGEXP,
        value: '/' + text.slice(cur + 1, cursor),
        cursor: cur,
        stopCursor: cursor,
        line: lineno,
        column: col
      };
    } else if (char === '.') {
      if (atLineHead) {
        char = text[++cursor];
        leftIndentBlockComment(ind);
        skipSpaceLines(ind);
        if (indent > ind) {
          t = INDENT;
        } else if (indent === ind) {
          t = NEWLINE;
        } else {
          t = UNDENT;
        }
        return token.next = {
          type: t,
          value: text.slice(cur, cursor),
          cursor: cur,
          stopCursor: cursor,
          line: line,
          column: col,
          indent: ind
        };
      } else {
        return token.next = {
          type: SYMBOL,
          value: "/",
          cursor: cur,
          stopCursor: cursor,
          line: line,
          indent: ind
        };
      }
    } else if (atLineHead) {
      return token.next = {
        type: CODE_BLOCK_COMMENT_LEAD_SYMBOL,
        value: "/",
        cursor: cur,
        stopCursor: cursor,
        line: line,
        column: col,
        indent: ind
      };
    } else {
      char = text[++cursor];
      prev = token;
      tokenOnSymbolChar();
      value = "/" + token.value;
      token = {
        type: SYMBOL,
        value: value,
        cursor: cur,
        stopCursor: cursor,
        line: line,
        column: col,
        indent: ind
      };
      return prev.next = token;
    }
  };
  tokenFnMap['\n'] = tokenFnMap['\r'] = tokenOnNewlineChar = function() {
    var col, cur, ind, line, type;
    cur = cursor;
    line = lineno;
    col = cursor - lineStart;
    ind = indent;
    skipSpaceLines(ind);
    if (!char) {
      type = EOI;
    } else if (indent > ind) {
      type = INDENT;
    } else if (indent === ind) {
      type = NEWLINE;
    } else {
      type = UNDENT;
    }
    return token.next = {
      type: type,
      value: text.slice(cur, cursor),
      cursor: cur,
      line: line,
      stopLine: lineno,
      column: col,
      indent: ind,
      stopIndent: indent
    };
  };
  tokenOnIdentifierChar = function() {
    var col, cur, txt, type;
    cur = cursor;
    char = text[++cursor];
    col = cursor - lineStart;
    while (char && identifierCharSet[char]) {
      char = text[++cursor];
    }
    txt = text.slice(cur, cursor);
    if (keywordHasOwnProperty(txt)) {
      type = KEYWORD;
    } else if (conjunctionHasOwnProperty(txt)) {
      type = CONJUNCTION;
    } else {
      type = IDENTIFIER;
    }
    return token.next = {
      type: type,
      value: txt,
      cursor: cur,
      stopCursor: cursor,
      line: lineno,
      column: col,
      indent: indent
    };
  };
  for (c in firstIdentifierCharSet) {
    tokenFnMap[c] = tokenOnIdentifierChar;
  }
  tokenOnNumberChar = function() {
    var baseStart, c2, col, cur, dotCursor, meetDigit;
    cur = cursor;
    base = 10;
    col = cursor - lineStart;
    if (char === '0' && (c2 = text[cursor + 1])) {
      if (c2 === 'b' || c2 === 'B') {
        base = 2;
        baseStart = cursor += 2;
        char = text[cursor];
      } else if (c2 === 'x' || c2 === 'X') {
        base = 16;
        baseStart = cursor += 2;
        char = text[cursor];
      } else {
        char = text[++cursor];
        meetDigit = true;
      }
    }
    if (base === 2) {
      while (char) {
        if (char === '0' || char === '1') {
          char = text[++cursor];
        } else {
          break;
        }
      }
    } else if (base === 16) {
      while (char) {
        if (!(('0' <= char && char <= '9') || ('a' <= char && char <= 'f') || ('A' <= char && char <= 'F'))) {
          break;
        } else {
          char = text[++cursor];
        }
      }
    }
    if (base === 2) {
      if (char === '.' || char === 'e' || char === 'E') {
        error('binary number followed by ".eE"');
      } else if (('2' <= char && char <= '9')) {
        error('binary number followed by 2-9');
      }
    }
    if (base === 16) {
      if (char === '.') {
        error('hexadecimal number followed by "."');
      } else if (letterCharSet[char]) {
        error('hexadecimal number followed by g-z or G-Z');
      }
    }
    if (base !== 10) {
      if (cursor === baseStart) {
        cursor--;
        char = text[cursor];
        return token.next = {
          type: NUMBER,
          value: text.slice(cur, cursor),
          value: 0,
          cursor: cur,
          stopCursor: cursor,
          line: lineno,
          column: col,
          indent: indent
        };
      } else {
        return token.next = {
          type: NUMBER,
          value: parseInt(text.slice(baseStart, cursor), base),
          cursor: cur,
          line: lineno,
          column: col,
          indent: indent
        };
      }
    }
    while (char) {
      if (('0' <= char && char <= '9')) {
        meetDigit = true;
        char = text[++cursor];
      } else {
        break;
      }
    }
    if (!meetDigit) {
      return;
    }
    if (char === '.') {
      meetDigit = false;
      char = text[++cursor];
      while (char) {
        if (char < '0' || '9' < char) {
          break;
        } else {
          meetDigit = true;
          char = text[++cursor];
        }
      }
    }
    dotCursor = cursor - 1;
    if (!meetDigit && char !== 'e' && char !== 'E') {
      cursor = dotCursor;
      char = text[cursor];
      return token.next = {
        type: NUMBER,
        value: parseInt(text.slice(baseStart, cursor), base),
        cursor: cur,
        stopCursor: cursor,
        line: lineno,
        column: col,
        indent: indent
      };
    }
    if (char === 'e' || char === 'E') {
      char = text[++cursor];
      if (char === '+' || char === '-') {
        char = text[++cursor];
        if (!char || char < '0' || '9' < char) {
          cursor = dotCursor;
          char = text[cursor];
          return token.next = {
            type: NUMBER,
            value: parseInt(text.slice(cur, dotCursor), base),
            cursor: cur,
            stopCursor: cursor,
            line: lineno,
            column: col,
            indent: indent
          };
        } else {
          while (char) {
            char = text[++cursor];
            if (char < '0' || '9' < char) {
              break;
            }
          }
        }
      } else if (!char || char < '0' || '9' < char) {
        cursor = dotCursor;
        char = text[cursor];
        return token.next = {
          type: NUMBER,
          value: parseInt(text.slice(cur, dotCursor), base),
          cursor: cur,
          stopCursor: cursor,
          line: lineno,
          column: col,
          indent: indent
        };
      } else {
        while (char) {
          if (char < '0' || '9' < char) {
            break;
          }
          char = text[++cursor];
        }
      }
    }
    return token.next = {
      type: NUMBER,
      value: parseFloat(text.slice(cur, cursor), base),
      cursor: cur,
      stopCursor: cursor,
      line: lineno,
      column: col,
      indent: indent
    };
  };
  _ref3 = '0123456789';
  for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
    c = _ref3[_i];
    tokenFnMap[c] = tokenOnNumberChar;
  }
  tokenFnMap[','] = tokenOnCommaChar = function() {
    var cur;
    cur = cursor;
    char = text[++cursor];
    return token.next = {
      type: PUNCTUATION,
      value: ',',
      line: lineno,
      stopLine: lineno,
      cursor: cursor,
      stopCursor: cursor,
      column: cur - lineStart,
      clauseEnd: true
    };
  };
  tokenFnMap[';'] = tokenOnSemiColonChar = function() {
    var cur;
    cur = cursor;
    char = text[++cursor];
    return token.next = {
      value: ';',
      type: PUNCTUATION,
      line: lineno,
      stopLine: lineno,
      cursor: cursor,
      stopCursor: cursor,
      column: cur - lineStart,
      clauseEnd: true,
      sentenceEnd: true
    };
  };
  concatenating = false;
  tokenFnMap["'"] = tokenOnSingleQuoteChar = function() {
    var col;
    char = text[++cursor];
    col = cursor - lineStart;
    if (char === "'") {
      if (text[cursor + 1] === "'") {
        cursor += 2;
        char = text[cursor];
        return token.next = leftRawNonInterpolatedString();
      } else {
        char = text[++cursor];
        return token.next = {
          value: '""',
          type: NON_INTERPOLATE_STRING,
          cursor: cursor - 2,
          line: lineno,
          column: col
        };
      }
    } else {
      return token.next = leftNonInterpolatedString();
    }
  };
  leftRawNonInterpolatedString = function() {
    var cur, indentInfo, line;
    cur = cursor - 3;
    line = lineno;
    if (cursor === indent + 3) {
      indentInfo = {
        indent: indent
      };
    } else {
      indentInfo = {};
    }
    str = '';
    while (char) {
      if (char === "'") {
        if (text[cursor + 1] === "'") {
          if (text[cursor + 2] === "'") {
            cursor += 3;
            char = text[cursor];
            return {
              type: NON_INTERPOLATE_STRING,
              value: '"' + str + '"',
              start: cur,
              stop: cursor,
              line: line,
              stopLine: lineno
            };
          } else {
            str += "''";
            cursor += 2;
            char = text[cursor];
          }
        } else {
          str += "'";
          char = text[++cursor];
        }
      } else if (char === '\\') {
        if ((c = text[cursor + 1]) === '\n' || c === '\r') {
          char = text[++cursor];
          concatenating = true;
          break;
        } else {
          str += '\\\\';
          char = text[++cursor];
        }
      } else if (char !== '\n' && char !== '\r') {
        str += char;
        char = text[++cursor];
      } else {
        break;
      }
    }
    while (char) {
      if (char === "'") {
        if (text[cursor + 1] === "'") {
          if (text[cursor + 2] === "'") {
            cursor += 3;
            char = text[cursor];
            return {
              type: NON_INTERPOLATE_STRING,
              value: '"' + str + '"',
              start: cur,
              stop: cursor,
              line: line,
              stopLine: lineno
            };
          } else {
            str += "''";
            cursor += 2;
            char = text[cursor];
          }
        } else {
          str += "'";
          char = text[++cursor];
        }
      } else {
        str += rawNonInterpolatedStringLine(indentInfo);
      }
    }
    if (!text[cursor]) {
      return error("expect ''', unexpected end of input while parsing interpolated string");
    }
  };
  rawNonInterpolatedStringLine = function(indentInfo) {
    var column, cur, i, ind, n, result;
    result = '';
    if (char === '\n') {
      if (!concatenating) {
        result += '\\n';
      }
      char = text[++cursor];
      if (char === '\r') {
        if (!concatenating) {
          result += '\\r';
        }
        char = text[++cursor];
      }
    } else {
      if (!concatenating) {
        result += '\\r';
      }
      char = text[++cursor];
      if (char === '\n') {
        if (!concatenating) {
          result += '\\n';
        }
        char = text[++cursor];
      }
    }
    concatenating = false;
    lineno++;
    cur = cursor;
    while (char === ' ') {
      char = text[++cursor];
    }
    column = cursor - lineStart;
    if (char === '\t') {
      error('unexpected tab character "\t" at the head of line');
    } else if (char === '\n' || char === '\r') {
      result += text.slice(cur, cursor);
      return result;
    } else if ((ind = indentInfo.value) !== void 0) {
      indentInfo.value = column;
    } else if (ind > column) {
      i = 0;
      n = column - ind;
      while (i++ < n) {
        result += ' ';
      }
    } else if (ind < column) {
      error('expect equal to or more than the indent of first line of the string');
    }
    while (char) {
      if (char === "'") {
        if (text[cursor + 1] === "'") {
          if (text[cursor + 2] === "'") {
            return result;
          } else {
            result += '\\"\\"';
            cursor += 2;
            char = text[cursor];
          }
        } else {
          result += '\\"';
          char = text[++cursor];
        }
      } else if (char === '\n' || char === '\r') {
        return result;
      } else if (char === '\\') {
        char = text[++cursor];
        if (char === '\n' || char === '\r') {
          concatenating = true;
          return result;
        }
        if (char) {
          result += '\\\\';
        } else {
          error('unexpected end of input while parsing non interpolated string');
        }
      } else {
        result += char;
        char = text[++cursor];
      }
    }
    return error('unexpected end of input while parsing non interpolated string');
  };
  leftNonInterpolatedString = function() {
    var col, cur, indentInfo, line;
    cur = cursor - 1;
    line = lineno;
    col = cur - lineStart;
    if (cursor === indent + 1) {
      indentInfo = {
        value: indent
      };
    } else {
      indentInfo = {};
    }
    str = '';
    while (char) {
      if (char === "'") {
        char = text[++cursor];
        return {
          type: NON_INTERPOLATE_STRING,
          value: '"' + str + '"',
          start: cur,
          stop: cursor,
          line: line,
          stopLine: line,
          column: col
        };
      } else if (char === '\\') {
        if ((c = text[cursor + 1]) === '\n' || c === '\r') {
          char = text[++cursor];
          concatenating = true;
          break;
        } else if (c === "'") {
          str += "'";
          cursor += 2;
          char = text[cursor];
        } else {
          str += '\\';
          char = text[++cursor];
        }
      } else if (char !== '\n' && char !== '\r') {
        str += char;
        char = text[++cursor];
      } else {
        break;
      }
    }
    while (char) {
      if (char === "'") {
        char = text[++cursor];
        return {
          type: NON_INTERPOLATE_STRING,
          value: '"' + str + '"',
          start: cur,
          stop: cursor,
          line: line,
          stopLine: lineno,
          column: col
        };
      }
      str += nonInterpolatedStringLine(indentInfo);
    }
    if (!char) {
      return error("expect \"'\", unexpected end of input while parsing interpolated string");
    }
  };
  nonInterpolatedStringLine = function(indentInfo) {
    var column, cur, i, ind, n, result;
    result = '';
    if (char === '\n') {
      if (!concatenating) {
        result += '\\n';
      }
      char = text[++cursor];
      if (char === '\r') {
        result += '\\r';
        char = text[++cursor];
      }
    } else {
      if (!concatenating) {
        result += '\r';
      }
      char = text[++cursor];
      if (char === '\\n') {
        if (!concatenating) {
          result += '\\n';
        }
        char = text[++cursor];
      }
    }
    concatenating = false;
    lineno++;
    cur = cursor;
    while (char === ' ') {
      char = text[++cursor];
    }
    column = cursor - lineStart;
    if (char === '\t') {
      error('unexpected tab character "\t" at the head of line');
    } else if (char === '\n' || char === '\r') {
      result += text.slice(cur, cursor);
      return result;
    } else if ((ind = indentInfo.value) !== void 0) {
      indentInfo.value = column;
    } else if (ind > column) {
      i = 0;
      n = column - ind;
      while (i++ < n) {
        result += ' ';
      }
    } else if (ind < column) {
      error('expect equal to or more than the indent of first line of the string');
    }
    while (char) {
      if (char === "'") {
        return result;
      } else if (char === '\n' || char === '\r') {
        return result;
      } else if (char === '\\') {
        char = text[++cursor];
        if (char === '\n' || char === '\r') {
          return result;
        } else if (char === "'") {
          result += "'";
          char = text[++cursor];
        } else if (char) {
          result += '\\';
          result += char;
          char = text[++cursor];
        } else {
          error('unexpected end of input while parsing non interpolated string');
        }
      } else if (char === '"') {
        result += '\\"';
        char = text[++cursor];
      } else {
        result += char;
        char = text[++cursor];
      }
    }
    return error('unexpected end of input while parsing non interpolated string');
  };
  tokenFnMap['"'] = tokenOnDoubleQuoteChar = function() {
    var tkn, tkn2;
    char = text[++cursor];
    if (char === '"') {
      if (text[cursor + 1] === '"') {
        cursor += 2;
        char = text[cursor];
        tkn = token;
        interolateStringNumber++;
        tkn2 = leftRawInterpolateString();
        interolateStringNumber--;
        tkn.next = tkn2;
        return tkn2;
      } else {
        char = text[++cursor];
        return token.next = {
          value: '""',
          type: NON_INTERPOLATE_STRING,
          lineno: lineno,
          cursor: cursor - 2,
          column: cursor - 2 - lineStart
        };
      }
    } else {
      tkn = token;
      interolateStringNumber++;
      tkn2 = leftInterpolateString();
      interolateStringNumber--;
      tkn.next = tkn2;
      return tkn2;
    }
  };
  this.leftRawInterpolateString = leftRawInterpolateString = function() {
    var cur, indentInfo, line, literalStart, pieces, x;
    cur = cursor;
    line = lineno;
    if (cursor - lineStart === indent + 3) {
      indentInfo = {
        value: indent
      };
    } else {
      indentInfo = {};
    }
    pieces = [];
    while (char) {
      if (char === '"' && text[cursor + 1] === '"' && text[cursor + 2] === '"') {
        cursor += 3;
        return {
          type: INTERPOLATE_STRING,
          value: ['string!'].concat(pieces),
          cursor: cur,
          stopCursor: cursor,
          line: line,
          stopLine: line
        };
      } else if (char === '$') {
        literalStart = ++cursor;
        char = text[cursor];
        if (!firstIdentifierCharSet[char]) {
          char = text[--cursor];
          pieces.push(rawInterpolateStringPiece(indentInfo));
        } else {
          x = parser.interpolateExpression();
          if (text[cursor] === ':') {
            char = text[++cursor];
            pieces.push(text.slice(literalStart, cursor));
          }
          pieces.push(x);
        }
      } else if (char === '(' || char === '{' || char === '[') {
        matchToken();
        pieces.push(getOperatorExpression(token));
      } else {
        pieces.push(rawInterpolateStringPiece(indentInfo));
      }
    }
    if (!text[cursor]) {
      return error('expect ' + quote + ', unexpected end of input while parsing interpolated string');
    }
  };
  rawInterpolateStringPiece = function(indentInfo) {
    var column, i, ind, n;
    str = '"';
    while (char) {
      if (char === '"') {
        if (text[cursor + 1] === '"') {
          if (text[cursor + 2] === '"') {
            return str + '"';
          } else {
            cursor += 2;
            char = text[cursor];
          }
        } else {
          str += '"';
          char = text[++cursor];
        }
      } else if (char === '\n') {
        if (!concatenating) {
          str += '\\n';
        }
        char = text[++cursor];
        if (char === '\r') {
          if (!concatenating) {
            str += '\\r';
          }
          char = text[++cursor];
        }
        concatenating = false;
        while (1) {
          lineno++;
          while (char === ' ') {
            str += char;
            char = text[++cursor];
          }
          if (char === '\n') {
            str += '\\n';
            char = text[++cursor];
            if (char === '\r') {
              str += '\\r';
              char = text[++cursor];
            }
            continue;
          } else if (char === '\r') {
            str += '\\r';
            char = text[++cursor];
            if (char === '\n') {
              str += '\\n';
              char = text[++cursor];
            }
            continue;
          } else {
            break;
          }
        }
        column = cursor - lineStart;
        if (char === '\t') {
          error('unexpected tab character "\t" in the head of line');
        } else if ((ind = indentInfo.value) !== void 0) {
          indentInfo.value = column;
        } else if (ind > column) {
          i = 0;
          n = column - ind;
          while (i++ < n) {
            result += ' ';
          }
        } else if (ind < column) {
          error('expect equal to or more than the indent of first line of the string');
        }
      } else if (char === '\r') {
        if (!concatenating) {
          str += '\\r';
        }
        char = text[++cursor];
        if (char === '\n') {
          if (!concatenating) {
            str += '\\n';
          }
          char = text[++cursor];
        }
        concatenating = false;
        while (1) {
          lineno++;
          while (char === ' ') {
            str += char;
            char = text[++cursor];
          }
          if (char === '\n') {
            str += '\\n';
            char = text[++cursor];
            if (char === '\r') {
              str += '\\r';
              char = text[++cursor];
            }
            continue;
          } else if (char === '\r') {
            str += '\\r';
            char = text[++cursor];
            if (char === '\n') {
              str += '\\n';
              char = text[++cursor];
            }
            continue;
          } else {
            break;
          }
        }
        column = cursor - lineStart;
        if (char === '\t') {
          error('unexpected tab character "\t" in the head of line');
        } else if ((ind = indentInfo.value) !== void 0) {
          indentInfo.value = column;
        } else if (ind > column) {
          i = 0;
          n = column - ind;
          while (i++ < n) {
            result += ' ';
          }
        } else if (ind < column) {
          error('expect equal to or more than the indent of first line of the string');
        }
      } else if (char === '(' || char === '{' || char === '[') {
        return str + '"';
      } else if (char === '$') {
        if ((char = text[++cursor])) {
          if (!firstIdentifierCharSet[char]) {
            str += '$';
          } else {
            char = '$';
            --cursor;
            return str + '"';
          }
        } else {
          break;
        }
      } else if (char === '\\') {
        char = text[++cursor];
        if (char === '\n' || char === '\r') {
          concatenating = true;
        } else if (char) {
          str += '\\\\';
        } else {
          error('unexpected end of input while parsing interpolated string');
        }
      } else {
        str += char;
        char = text[++cursor];
      }
    }
    return error('unexpected end of input while parsing interpolated string');
  };
  leftInterpolateString = function() {
    var cur, indentInfo, line, literalStart, pieces, x;
    cur = cursor - 1;
    line = lineno;
    if (cursor - 1 - lineStart === indent + 1) {
      indentInfo = {
        value: indent
      };
    } else {
      indentInfo = {};
    }
    pieces = [];
    while (char) {
      if (char === '"') {
        char = text[++cursor];
        return {
          type: INTERPOLATE_STRING,
          value: ['string!'].concat(pieces),
          cursor: cur,
          stopCursor: cursor,
          line: line,
          stopLine: lineno
        };
      }
      if (char === '$') {
        literalStart = ++cursor;
        char = text[cursor];
        if (!firstIdentifierCharSet[char]) {
          char = '$';
          --cursor;
          pieces.push(interpolateStringPiece(indentInfo));
        } else {
          x = parser.interpolateExpression();
          if (text[cursor] === ':') {
            char = text[++cursor];
            pieces.push(text.slice(literalStart, cursor));
          }
          pieces.push(x);
        }
      } else if (char === '(' || char === '{' || char === '[') {
        matchToken();
        pieces.push(getOperatorExpression(token));
      } else {
        pieces.push(interpolateStringPiece(indentInfo));
      }
    }
    if (!text[cursor]) {
      return error('expect \'"\', but meet end of input while parsing interpolated string');
    }
  };
  interpolateStringPiece = function(indentInfo) {
    var column, i, ind, n;
    str = '"';
    while (char) {
      if (char === '"') {
        return str + '"';
      } else if (char === '\n') {
        if (!concatenating) {
          str += char;
        }
        char = text[++cursor];
        if (char === '\r') {
          if (!concatenating) {
            str += char;
          }
          char = text[++cursor];
        }
        concatenating = false;
        while (1) {
          lineno++;
          while (char === ' ') {
            str += char;
            char = text[++cursor];
          }
          if (char === '\n') {
            str += char;
            char = text[++cursor];
            if (char === '\r') {
              str += char;
              char = text[++cursor];
            }
            continue;
          } else if (char === '\r') {
            str += char;
            char = text[++cursor];
            if (char === '\n') {
              str += char;
              char = text[++cursor];
            }
            continue;
          } else {
            break;
          }
        }
        column = cursor - lineStart;
        if (char === '\t') {
          error('unexpected tab character "\t" in the head of line');
        } else if ((ind = indentInfo.value) !== void 0) {
          indentInfo.value = column;
        } else if (ind > column) {
          i = 0;
          n = column - ind;
          while (i++ < n) {
            result += ' ';
          }
        } else if (ind < column) {
          error('expect equal to or more than the indent of first line of the string');
        }
      } else if (char === '\r') {
        if (!concatenating) {
          str += char;
        }
        char = text[++cursor];
        if (char === '\n') {
          if (!concatenating) {
            str += char;
          }
          char = text[++cursor];
        }
        concatenating = false;
        while (1) {
          lineno++;
          while (char === ' ') {
            str += char;
            char = text[++cursor];
          }
          if (char === '\n') {
            str += char;
            char = text[++cursor];
            if (char === '\r') {
              str += char;
              char = text[++cursor];
            }
            continue;
          } else if (char === '\r') {
            str += char;
            char = text[++cursor];
            if (char === '\n') {
              str += char;
              char = text[++cursor];
            }
            continue;
          } else {
            break;
          }
        }
        column = cursor - lineStart;
        if (char === '\t') {
          error('unexpected tab character "\t" in the head of line');
        } else if ((ind = indentInfo.value) !== void 0) {
          indentInfo.value = column;
        } else if (ind > column) {
          i = 0;
          n = column - ind;
          while (i++ < n) {
            result += ' ';
          }
        } else if (ind < column) {
          error('expect equal to or more than the indent of first line of the string');
        }
      } else if (char === '(' || char === '{' || char === '[') {
        return str + '"';
      } else if (char === '$') {
        if ((char = text[++cursor])) {
          if (!firstIdentifierCharSet[char]) {
            str += '$';
          } else {
            char = '$';
            --cursor;
            return str + '"';
          }
        } else {
          break;
        }
      } else if (char === '\\') {
        if (!(char = text[++cursor])) {
          break;
        } else if (char === '\n' || char === '\r') {
          char = text[++cursor];
        } else {
          str += '\\' + char;
          char = text[++cursor];
        }
      } else {
        str += char;
        char = text[++cursor];
      }
    }
    return error('unexpected end of input while parsing interpolated string');
  };
  tokenFnMap['('] = tokenOnLeftParenChar = function() {
    var col, cur, exp, ind, line, parenVariantFn, start, type;
    cur = cursor;
    line = lineno;
    col = cursor - lineStart;
    char = text[++cursor];
    ind = indent;
    start = token;
    interolateStringNumber *= 2;
    matchToken();
    if ((parenVariantFn = parenVariantMap[token.value])) {
      token = parenVariantFn();
      token.cursor = cursor;
      token.column = column;
      token.indent = ind;
    } else {
      if ((type = token.type) === UNDENT) {
        error('unexpected undent while parsing parenethis "(...)"');
      } else if (type === SPACE || type === NEWLINE || type === INDENT) {
        matchToken();
      }
      if (token.value === ')') {
        token = {
          type: PAREN,
          value: void 0,
          cursor: cur,
          stopCursor: cursor,
          line: lineno,
          column: col
        };
        start.next = token;
        return token;
      }
      exp = parser.operatorExpression();
      if (token.type === UNDENT) {
        if (token.stopIndent < ind) {
          error('expect ) indent equal to or more than (');
        } else {
          matchToken();
        }
      } else if (token.value !== ')') {
        error('expect )');
      }
      token = {
        type: PAREN,
        value: exp,
        cursor: cur,
        stopCursor: cursor,
        line: lineno,
        column: col
      };
    }
    if (interolateStringNumber % 2) {
      interolateStringNumber = (interolateStringNumber - 1) / 2;
    } else {
      interolateStringNumber %= 2;
    }
    start.next = token = token;
    return token;
  };
  parenVariantMap = {};
  tokenFnMap['['] = tokenOnLeftBracketChar = function() {
    var bracketVariantFn, col, cur, expList, ind, line, start;
    cur = cursor;
    char = text[++cursor];
    line = lineno;
    col = cursor - lineStart;
    ind = indent;
    start = token;
    interolateStringNumber *= 2;
    matchToken();
    if ((bracketVariantFn = bracketVariantMap[token.value])) {
      token = bracketVariantFn();
      token.cursor = cursor;
      token.column = column;
      token.indent = ind;
    } else {
      expList = parser.lineBlock();
      if (token.type === UNDENT) {
        if (token.stopIndent < ind) {
          error('unexpected undent while parsing parenethis "[...]"');
        } else {
          matchToken();
        }
      }
      if (token.value !== ']') {
        error('expect ]');
      }
      if (expList) {
        expList.unshift('list!');
      } else {
        expList = [];
      }
      token = {
        type: BRACKET,
        value: expList,
        cursor: cur,
        stopCursor: cursor,
        line: lineno,
        stopLine: lineno,
        column: col
      };
    }
    if (interolateStringNumber % 2) {
      interolateStringNumber = (interolateStringNumber - 1) / 2;
    } else {
      interolateStringNumber %= 2;
    }
    start.next = token;
    return token;
  };
  bracketVariantMap = {};
  tokenFnMap['{'] = function() {
    var body, col, cur, curveVariantFn, ind, line, start;
    cur = cursor;
    cursor++;
    line = lineno;
    col = cursor - lineStart;
    ind = indent;
    start = token;
    interolateStringNumber *= 2;
    matchToken();
    if ((curveVariantFn = curveVariantMap[token.value])) {
      token = curveVariantFn();
      token.cursor = cursor;
      token.column = column;
      token.indent = ind;
    } else {
      if (token.value === '}' && matchToken()) {
        token = {
          value: text.slice(cur, cursor),
          value: ['hash!'],
          cursor: cur,
          line: line,
          column: col
        };
        start.next = token;
        return start;
      }
      body = parser.lineBlock();
      if (token.indent < ind) {
        error('unexpected undent while parsing parenethis "{...}"');
      }
      if (token.value !== '}') {
        error('expect }');
      } else {
        cursor++;
      }
      if (body.length === 0) {
        return {
          type: CURVE,
          value: '',
          start: cur,
          stop: token
        };
      }
      if (body.length === 1) {
        body = body[0];
      } else {
        body.unshift('begin!');
      }
    }
    if (interolateStringNumber % 2) {
      interolateStringNumber = (interolateStringNumber - 1) / 2;
    } else {
      interolateStringNumber %= 2;
    }
    return extend(body, {
      type: CURVE,
      start: start,
      stop: cursor,
      line1: line1,
      line: lineno
    });
  };
  curveVariantMap = {
    '.': function() {
      matchToken();
      return hash();
    }
  };
  this.hash = function() {
    var cur, indentCol, items, line1;
    cur = cursor;
    line1 = lineno;
    indentCol = lineInfo[lineno].indentCol;
    if (text.slice(cursor, cursor + 2) !== '{.') {
      return;
    } else {
      cursor += 2;
    }
    items = parser.hashBlock();
    if (lineInfo[lineno].indentCol < indentCol) {
      error('unexpected undent while parsing parenethis "{.  ... .}"');
    }
    if (text.slice(cursor, cursor + 2) !== '.}') {
      error('expect .}');
    } else {
      cursor += 2;
    }
    return wrapResult(['hash!'].concat(items), {
      start: cur,
      stop: cursor,
      line1: line1,
      line: lineno
    });
  };
  this.hashBlock = function() {
    var col, cur, indentCol, line1, result, spac, space2, x;
    cur = cursor;
    line1 = lineno;
    if ((spac = bigSpace()) && spac.undent) {
      return;
    }
    result = [];
    if (spac.indent) {
      indentCol = lineInfo[lineno].indentCol;
    }
    while ((x = parser.hashItem()) && result.push(x)) {
      space();
      if (!(c = text[cursor])) {
        break;
      }
      if (c === '.') {
        if (text[cursor + 1] === '}') {
          break;
        } else {
          error('unexpected ".", expect .} to close hash block');
        }
      }
      if (c === ';') {
        cursor++;
      }
      space2 = bigSpace();
      if (!(c = text[cursor]) || c === '}') {
        break;
      }
      if (lineno === line1) {
        continue;
      }
      if ((col = lineInfo[lineno].indentCol) > column1) {
        if (indentCol && col !== indentCol) {
          error('unconsistent indent in hash {. .}');
        } else {
          indentCol = col;
        }
      } else if (col === column1) {
        break;
      } else if (col < column1) {
        rollbackToken(space2);
        return;
      }
    }
    result.start = cur;
    result.stop = cursor;
    return result;
  };
  this.hashItem = function() {
    var js, key, result, spac, t, value;
    if (isIndent(token)) {
      error('unexpected indent');
    } else if (isUndent(token)) {
      return;
    }
    if (key = parser.compactClauseExpression()) {
      if (isMultiline(token)) {
        error('unexpected new line after hash key');
      }
      if (token.value === ':' && matchToken()) {
        if ((t = key.type) === IDENTIFIER || t === NUMBER || t === NON_INTERPOLATE_STRING) {
          js = true;
        }
      } else if (text.slice(cursor, cursor + 2) === '=>') {
        cursor += 2;
      } else {
        error('expect : or => for hash item definition');
      }
      if ((spac = follow('spaceComment')) && spac.indent) {
        value = ['hash!'].concat(parser.hashBlock());
      } else {
        value = parser.clause();
      }
      if (!value) {
        error('expect value of hash item');
      }
      if (js) {
        result = ['jshashitem!', getOperatorExpression(key), value];
      } else {
        result = ['pyhashitem!', getOperatorExpression(key), value];
      }
      return wrapResult(result, {
        start: cur,
        stop: cursor,
        line1: line1,
        line: lineno
      });
    }
  };
  tokenOnRightDelimiterChar = function() {
    return token.next = {
      type: RIGHT_DELIMITER,
      value: char,
      cursor: cursor,
      stopCursor: cursor,
      line: lineno,
      indent: indent,
      stopIndent: indent
    };
  };
  _ref4 = ')]}';
  for (_j = 0, _len1 = _ref4.length; _j < _len1; _j++) {
    c = _ref4[_j];
    tokenFnMap[c] = tokenOnRightDelimiterChar;
  }
  this.followMatch = followMatch = function(fn) {
    var cur, line, x;
    cur = cursor;
    line = lineno;
    x = fn();
    cursor = cur;
    lineno = line;
    return x;
  };
  this.follow = follow = function(matcherName) {
    var cur, line, x;
    cur = cursor;
    line = lineno;
    x = parser[matcherName]();
    cursor = cur;
    lineno = line;
    return x;
  };
  this.expect = expect = function(matcherName, message) {
    var x;
    if (!(x = parser[matcherName]())) {
      return error(message);
    } else {
      return x;
    }
  };
  this.followSequence = followSequence = function() {
    var cur, line1, matcherList, matcherName, x, _k, _len2;
    matcherList = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    cur = cursor;
    line1 = lineno;
    for (_k = 0, _len2 = matcherList.length; _k < _len2; _k++) {
      matcherName = matcherList[_k];
      if (!(x = parser[matcherName]())) {
        break;
      }
    }
    cursor = cur;
    lineno = line1;
    return x;
  };
  this.followOneOf = function() {
    var cur, line1, matcherList, matcherName, x, _k, _len2;
    matcherList = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    cur = cursor;
    line1 = lineno;
    for (_k = 0, _len2 = matcherList.length; _k < _len2; _k++) {
      matcherName = matcherList[_k];
      cursor = cur;
      lineno = line1;
      if (x = parser[matcherName]()) {
        break;
      }
    }
    cursor = cur;
    lineno = line1;
    return x;
  };
  this.setText = function(x) {
    parser.text = text = x;
    return x;
  };
  this.cursor = function() {
    return cursor;
  };
  this.setCursor = function(x) {
    return cursor = x;
  };
  this.atStatementHead = function() {
    return atStatementHead;
  };
  this.setAtStatementHead = function(x) {
    return atStatementHead = x;
  };
  this.endOfInput = function() {
    return !text[cursor];
  };
  this.literal = literal = function(string) {
    var length;
    length = string.length;
    if (text.slice(cursor, cursor + length) === string) {
      cursor += length;
      return true;
    }
  };
  wrapResult = function(result, info) {
    result.info = info;
    return result;
  };
  this.decimal = decimal = function() {
    var cur;
    cur = cursor;
    while (c = text[cursor]) {
      if (('0' <= c && c <= '9')) {
        cursor++;
      } else {
        break;
      }
    }
    if (cursor === cur) {
      return;
    }
    return {
      value: text.slice(cur, cursor),
      cursor: cur
    };
  };
  this.symbolOrIdentifier = function() {
    return parser.symbol() || parser.identifier();
  };
  atomTokenTypes = list2dict(IDENTIFIER, NUMBER, REGEXP, PAREN, BRACKET, CURVE, HASH, BRACKET, PAREN, SYMBOL, NON_INTERPOLATE_STRING, INTERPOLATE_STRING, COMPACT_CLAUSE_EXPRESSION);
  this.atom = function(mode) {
    var atomToken, type;
    if (token.isCompactClauseExpression) {
      atomToken = token;
      nextToken();
      return atomToken;
    } else if (atomTokenTypes[(type = token.type)]) {
      atomToken = token;
      atomToken.priority = 1000;
      nextToken();
      return atomToken;
    }
  };
  this.prefixOperator = function(mode) {
    var op, opToken, priInc, tokenText, type;
    tokenText = token.value;
    if (!hasOwnProperty.call(prefixOperatorDict, tokenText) || !(op = prefixOperatorDict[tokenText])) {
      return;
    }
    if (token.escaped) {
      return;
    }
    opToken = token;
    matchToken();
    if (token.value === '.' && matchToken()) {
      if ((type = token.type) === SPACE || type === INDENT || type === UNDENT || type === NEWLINE) {
        if (mode === OPERATOR_EXPRESSION) {
          error('unexpected spaces after :');
        } else {
          token = opToken;
          return;
        }
      }
    } else if ((type = token.type) === INDENT) {
      error('unexpected indent after prefix operator');
    } else if (type === NEWLINE) {
      error('unexpected new line after prefix operator');
    } else if (type === UNDENT) {
      error('unexpected undent after prefix operator');
    } else if ((tokenText = token.value) === ")" || tokenText === ']' || tokenText === "}") {
      error('unexpected ' + tokenText + ' after prefix operator');
    } else if (type === SPACE) {
      matchToken();
      priInc = 300;
    } else {
      priInc = 600;
    }
    opToken.symbol = op.symbol;
    opToken.priority = op.priority + priInc;
    return wrapResult(opToken, {
      start: opToken
    });
  };
  this.suffixOperator = function(mode, x) {
    var op, opToken, type, value;
    if (token.type !== SYMBOL) {
      return;
    }
    if ((op = suffixOperatorDict[token.value])) {
      token.symbol = op.symbol;
      token.priority = op.priority + 600;
      opToken = token;
      matchToken();
      if ((type = token.type) === SPACE || type === NEWLINE || type === INDENT || type === UNDENT || type === EOI || type === RIGHT_DELIMITER || (value = token.value) === ':' || value === ',' || value === ';') {
        return wrapResult(opToken, {
          start: opToken
        });
      } else {
        token = opToken;
      }
    }
  };
  parser.clauseEnd = function(spac) {
    var cur, line1;
    cur = cursor;
    line1 = lineno;
    spac = spac || bigSpace();
    if ((c = text[cursor]) === ',') {
      if (!spac.inline) {
        error('"," should not be at the head of a line');
      }
      cursor++;
      return true;
    }
    if (parser.sentenceEnd(spac) || c === ';') {
      rollbackToken(spac);
      return true;
    }
  };
  binaryOperatorMemoIndex = memoIndex;
  memoIndex += 5;
  this.binaryOperator = function(mode, x) {
    var fn, m, op, opToken, start, type;
    if (token.isBinaryOperator) {
      opToken = token;
      nextToken();
      return opToken;
    }
    if (m = token[binaryOperatorMemoIndex + mode]) {
      token = m.next;
      return m.result;
    }
    if ((type = token.type) === EOI || type === UNDENT || type === RIGHT_DELIMITER || (mode !== OPERATOR_EXPRESSION && (type === NEWLINE || type === INDENT || type === PUNCTUATION)) || ((mode === COMPACT_CLAUSE_EXPRESSION || mode === INTERPOLATE_EXPRESSION) && type === SPACE) || (mode === INTERPOLATE_EXPRESSION && (char === "'" || char === '"'))) {
      token[binaryOperatorMemoIndex + mode] = {
        result: null,
        next: token
      };
      return;
    }
    start = token;
    if ((op = binaryDictOperator(mode, x)) || ((token = start) && (fn = customBinaryOperatorFnMap[type]) && (op = fn(mode, x)))) {
      token[binaryOperatorMemoIndex + mode] = {
        result: op,
        next: token
      };
      return op;
    } else {
      token = start;
    }
  };
  binaryDictOperator = function(mode, x) {
    var op, opToken, opValue, priInc, type, type1, value;
    if ((type1 = token.type) === SPACE) {
      priInc = 300;
      nextToken();
    } else if (type1 === NEWLINE || type1 === INDENT) {
      priInc = 0;
      nextToken();
    } else {
      priInc = 600;
      if (token.value === '.') {
        nextToken();
      }
    }
    opValue = token.value;
    if (!hasOwnProperty.call(binaryOperatorDict, opValue) || !(op = binaryOperatorDict[opValue])) {
      return;
    }
    opToken = token;
    nextToken();
    if (token.value === '.') {
      if (priInc !== 600) {
        error('unexpected "." after binary operator ' + opToken.value + ', here should be spaces, comment or newline');
      } else {
        nextToken();
      }
    }
    if ((value = token.value) === ',' || value === ';' || value === ':' || (type = token.type) === NEWLINE || type === UNDENT || type === EOI || (mode === INTERPOLATE_EXPRESSION && (char === "'" || char === '"'))) {
      return;
    }
    if ((type = token.type) === UNDENT) {
      error('unexpected undent after binary operator "' + opToken.value + '"');
    } else if (type === EOI) {
      error('unexpected end of input, expect right operand after binary operator');
    } else if (token.type === RIGHT_DELIMITER) {
      return;
    }
    if (priInc === 600) {
      if (type === SPACE) {
        if (op.value === ',') {
          priInc = 300;
          nextToken();
        } else if ((c = text[cursor]) === ';') {
          error('unexpected ;');
        } else {
          error('unexpected spaces or new lines after binary operator "' + op.value + '" before which there is no space.');
        }
      }
    } else if (priInc === 300) {
      if (type === UNDENT) {
        error('unexpceted undent after binary operator ' + op.value);
      } else if (type === NEWLINE) {
        priInc = 0;
      } else if (type === INDENT) {
        priInc = 0;
        indentExpression();
      } else if (type === SPACE) {
        nextToken();
      } else {
        if (mode === OPERATOR_EXPRESSION) {
          error('binary operator ' + op.value + ' should have spaces at its right side.');
        } else {
          token = start;
        }
      }
    } else {
      if (opValue === ',' || opValue === ':' || opValue === '%' || op.assign) {
        error('binary operator ' + op.symbol + ' should not be at begin of line');
      }
      if (type === UNDENT) {
        error('binary operator should not be at end of block');
      } else if (type === NEWLINE) {
        error('a single binary operator should not occupy whole line.');
      } else if (type === SPACE) {
        nextToken();
      }
      if (type1 === INDENT) {
        priInc = 0;
        indentExpression();
      }
    }
    opToken.symbol = op.symbol;
    opToken.priority = op.priority + priInc;
    return opToken;
  };
  indentExpression = function() {
    var indentExp, indentStart, type;
    indentStart = token;
    indentExp = parser.expression(mode, 0, true);
    if ((type = nextToken().type) !== UNDENT && type !== EOI && token.value !== ')') {
      error('expect an undent after a indented block expression');
    }
    indentExp.priority = 1000;
    nextToken();
    return token = indentStart;
  };
  customBinaryOperatorFnMap = {};
  customBinaryOperatorFnMap[PAREN] = function(mode, x) {
    return {
      symbol: 'call()',
      type: SYMBOL,
      priority: 800,
      start: token
    };
  };
  customBinaryOperatorFnMap[BRACKET] = function(mode, x) {
    return {
      symbol: 'index[]',
      type: SYMBOL,
      priority: 800,
      start: token
    };
  };
  customBinaryOperatorFnMap[IDENTIFIER] = function(mode, x) {
    var cur;
    cur = token.cursor;
    if ((x.value === '@' && x.stopCursor === cur) || (text.slice(cur - 2, cur) === '::' && text[cur - 3] !== ':')) {
      return {
        symbol: 'attribute!',
        type: SYMBOL,
        priority: 800,
        start: token
      };
    }
  };
  customBinaryOperatorFnMap[SYMBOL] = function(mode, x) {
    var tkn, value;
    tkn = token;
    if ((value = tkn.value) === '#' && nextToken()) {
      return {
        symbol: '#()',
        type: SYMBOL,
        priority: 800,
        start: tkn
      };
    } else if (value === '::' && (tkn = token) && nextToken()) {
      if (token.type === IDENTIFIER) {
        token = tkn;
        return {
          symbol: 'attribute!',
          type: SYMBOL,
          start: tkn,
          priority: 800
        };
      } else if (token.type === BRACKET) {
        token = tkn;
        return {
          symbol: 'index!',
          type: SYMBOL,
          start: tkn,
          priority: 800
        };
      }
    } else if (value === "." && (tkn = token) && nextToken()) {
      if (token.type === IDENTIFIER) {
        return {
          symbol: 'attribute!',
          type: SYMBOL,
          start: tkn,
          priority: 800
        };
      }
    }
  };
  this.prefixExpression = function(mode, priority) {
    var op, pri, start, x;
    start = token;
    if (op = parser.prefixOperator(mode)) {
      pri = priority > op.priority ? priority : op.priority;
      x = parser.expression(mode, pri, true);
      if (x) {
        return wrapResult(makeOperatorExpression(PREFIX, op, x), {
          start: start,
          stop: token
        });
      }
    }
  };
  expressionMemoIndex = memoIndex;
  memoIndex += 5;
  this.expression = expression = function(mode, priority, leftAssoc) {
    var indexMode, op, opPri, result, start, tkn, tkn1, tkn2, x, y;
    indexMode = expressionMemoIndex + mode;
    start = token;
    if (result = start[indexMode]) {
      token = result.next;
      return result.value;
    }
    if (!(x = parser.prefixExpression(mode, priority))) {
      if (!(x = parser.atom(mode))) {
        start[memoIndex + mode] = {
          value: null,
          next: token
        };
        return;
      }
    }
    while (1) {
      tkn1 = token;
      if ((op = parser.suffixOperator(mode, x))) {
        if (op.priority >= priority) {
          x = wrapResult(makeOperatorExpression(SUFFIX, op, x), {
            start: start,
            stop: token
          });
        } else {
          token = tkn1;
          break;
        }
      } else {
        break;
      }
    }
    while (1) {
      tkn2 = token;
      if ((op = parser.binaryOperator(mode, x))) {
        if ((leftAssoc && (opPri = op.priority) > priority) || (!leftAssoc && opPri >= priority)) {
          y = expression(mode, opPri, !op.rightAssoc);
          x = wrapResult(makeOperatorExpression(BINARY, op, x, y), {
            start: start,
            stop: token
          });
        } else {
          token = tkn2;
          break;
        }
      } else {
        break;
      }
    }
    if (token !== tkn1) {
      while (1) {
        tkn = token;
        if ((op = parser.suffixOperator(mode, x))) {
          if (op.priority >= priority) {
            x = wrapResult(makeOperatorExpression(SUFFIX, op, x), {
              start: start,
              stop: token
            });
          } else {
            token = tkn;
            break;
          }
        } else {
          break;
        }
      }
    }
    start[indexMode] = {
      value: x,
      next: token
    };
    return x;
  };
  this.operatorExpression = operatorExpression = function() {
    return parser.expression(OPERATOR_EXPRESSION, 0, true);
  };
  this.compactClauseExpression = function() {
    var result;
    result = parser.expression(COMPACT_CLAUSE_EXPRESSION, 600, true);
    if (result) {
      result.isCompactClauseExpression = true;
    }
    return result;
  };
  this.spaceClauseExpression = spaceClauseExpression = function() {
    if (token.type === SPACE) {
      nextToken();
    }
    return parser.expression(SPACE_CLAUSE_EXPRESSION, 300, true);
  };
  this.interpolateExpression = function() {
    var cur, exp, id, start;
    exp = tokenOnIdentifierChar();
    exp.start = exp.stop = start = exp;
    while (1) {
      cur = cursor;
      if (text[cursor] !== '.') {
        break;
      }
      if (char = text[++cursor] && firstIdentifierCharSet[char] && (id = tokenOnIdentifierChar())) {
        exp = ['attribute!', exp, id];
        id.start = id;
        id.stop = id;
        exp.start = start;
        exp.stop = id;
      } else {
        cursor = cur;
        break;
      }
    }
    return exp;
  };
  this.isIdentifier = isIdentifier = function(item) {
    return item.type === IDENTIFIER;
  };
  this.itemToParameter = itemToParameter = function(item) {
    var item0, item1, item10;
    if (item.type === IDENTIFIER) {
      return item;
    } else if (item0 = item[0]) {
      if (item0 === 'attribute!' && item[1].text === '@') {
        return item;
      } else if (item0.symbol === 'x...') {
        parser.meetEllipsis = item[1].ellipsis = true;
        return item;
      } else if (entity(item0) === '=') {
        if ((item1 = item[1]) && item1.type === IDENTIFIER) {
          return item;
        } else if ((item10 = item1[0]) && item10 === 'attribute!' && item1[1].text === '@') {
          return item;
        } else {

        }
      } else if (item0.symbol === 'unquote!' || item0.symbol === 'unquote-splice') {
        return item;
      }
    }
  };
  this.toParameters = toParameters = function(item) {
    var meetEllipsis, meetError, param, result, x;
    if (!item) {
      return [];
    }
    if (x = itemToParameter(item)) {
      return [x];
    } else if (item[0] === ',') {
      result = (function() {
        var _k, _len2, _ref5, _results;
        _ref5 = item.slice(1);
        _results = [];
        for (_k = 0, _len2 = _ref5.length; _k < _len2; _k++) {
          x = _ref5[_k];
          if (!(param = itemToParameter(x))) {
            meetError = true;
            break;
          }
          if (param.ellipsis) {
            if (meetEllipsis) {
              meetError = true;
              break;
            } else {
              meetEllipsis = true;
            }
          }
          _results.push(param);
        }
        return _results;
      })();
      if (!meetError) {
        return result;
      }
    }
  };
  this.labelStatement = function() {
    var clause, lbl, line1, spac, start;
    start = cursor;
    line1 = lineno;
    if (!(lbl = parser.jsIdentifier())) {
      return;
    }
    if (text[cursor] !== '#') {
      cursor = start;
      return;
    }
    cursor++;
    if ((spac = bigSpace()) && (!spac.text || spac.undent || spac.newline)) {
      cursor = start;
      return;
    }
    if (clause = parser.clause()) {
      clause = ['label!', lbl, clause];
    } else {
      clause = ['label!', lbl, ''];
    }
    return extend(clause, {
      start: start,
      stop: cursor,
      line1: line1,
      line: lineno
    });
  };
  this.conjunction = function() {
    var start, x;
    start = cursor;
    if ((x = symbol() || taijiIdentifier()) && isConjunction(x)) {
      return x;
    }
    cursor = start;
  };
  this.expectIndentConj = expectIndentConj = function(word, line1, isHeadStatement, options, clauseFn) {
    var col, indentCol, line2, meetWord, optionalClause, optionalWord, spac, start2, w;
    start2 = cursor;
    line2 = lineno;
    if (options.optionalClause != null) {
      optionalClause = options.optionalClause;
    } else {
      optionalClause = word !== 'then';
    }
    if (options.optionalWord != null) {
      optionalWord = options.optionalWord;
    } else {
      optionalWord = word === 'then';
    }
    indentCol = lineInfo[line1].indentCol;
    spac = bigSpace();
    col = lineInfo[lineno].indentCol;
    if (col === indentCol && lineno !== line1 && !isHeadStatement) {
      if (!optionalClause) {
        error('meet new line, expect inline keyword "' + word + '" for inline statement');
      } else {
        rollbackToken(spac);
        return;
      }
    }
    if (col < indentCol) {
      if (!optionalClause) {
        error('unexpected undent, expect ' + word);
      } else {
        rollbackToken(spac);
        return;
      }
    } else if (col > indentCol) {
      if (options.indentCol) {
        if (col !== options.indentCol) {
          error('unconsistent indent');
        }
      } else {
        options.indentCol = col;
      }
    }
    w = taijiIdentifier();
    meetWord = w && w.text === word;
    if (!meetWord) {
      if (isConjunction(w)) {
        if (optionalClause) {
          rollbackToken(spac);
          return;
        } else {
          error('unexpected ' + w.text + ', expect ' + word + ' clause');
        }
      } else if ((!optionalWord && !optionalClause) || (!optionalClause && optionalWord && spac.inline)) {
        if (word !== 'then' || !options.colonAtEndOfLine) {
          error('expect keyword ' + word);
        }
      } else if (!optionalWord) {
        return rollbackToken(spac);
      } else if (optionalClause) {
        return rollbackToken(spac);
      }
    }
    if (!meetWord) {
      rollback(start2, line2);
    }
    return clauseFn();
  };
  conjClause = function(conj, line1, isHeadStatement, options) {
    return begin(expectIndentConj(conj, line1, isHeadStatement, options, parser.lineBlock));
  };
  thenClause = function(line1, isHeadStatement, options) {
    return conjClause('then', line1, isHeadStatement, options);
  };
  elseClause = function(line1, isHeadStatement, options) {
    return conjClause('else', line1, isHeadStatement, options);
  };
  finallyClause = function(line1, isHeadStatement, options) {
    return conjClause('finally', line1, isHeadStatement, options);
  };
  catchClause = function(line1, isHeadStatement, options) {
    return expectIndentConj('catch', line1, isHeadStatement, options, function() {
      var catchVar, line2, then_;
      line2 = lineno;
      space();
      atStatementHead = false;
      catchVar = parser.identifier();
      space();
      then_ = thenClause(line2, false, {});
      return [catchVar, then_];
    });
  };
  caseClauseOfSwitchStatement = function(line1, isHeadStatement, options) {
    return expectIndentConj('case', line1, isHeadStatement, options, function() {
      var body, exp, line2;
      line2 = lineno;
      space();
      atStatementHead = false;
      exp = parser.compactClauseExpression();
      if (exp[0] !== 'list!') {
        exp = ['list!', exp];
      }
      space();
      expectChar(':', 'expect ":" after case values');
      body = parser.block() || parser.lineBlock();
      return [exp, begin(body)];
    });
  };
  this.keyword = function() {
    var start, x;
    start = cursor;
    if ((x = symbol() || taijiIdentifier()) && isKeyword(x)) {
      return x;
    }
    cursor = start;
  };
  keywordThenElseStatement = function(keyword) {
    return function(isHeadStatement) {
      var else_, line1, options, test, then_;
      line1 = lineno;
      space();
      if ((test = parser.clause()) == null) {
        error('expect a clause after "' + keyword + '"');
      }
      then_ = thenClause(line1, isHeadStatement, options = {
        colonAtEndOfLine: test.colonAtEndOfLine
      });
      else_ = elseClause(line1, isHeadStatement, options);
      if (else_) {
        return [keyword, test, then_, else_];
      } else {
        return [keyword, test, then_];
      }
    };
  };
  keywordTestExpressionBodyStatement = function(keyword) {
    return function(isHeadStatement) {
      var body, line1, test;
      line1 = lineno;
      space();
      if (!(test = parser.compactClauseExpression())) {
        error('expect a compact clause expression after "' + keyword + '"');
      }
      if (!(body = parser.lineBlock())) {
        error('expect the body for while! statement');
      }
      return [keyword, test, begin(body)];
    };
  };
  throwReturnStatement = function(keyword) {
    return function(isHeadStatement) {
      var clause;
      space();
      if (text[cursor] === ':' && text[cursor + 1] !== ':') {
        cursor++;
        space();
      }
      if (clause = parser.clause()) {
        return [keyword, clause];
      } else {
        return [keyword];
      }
    };
  };
  breakContinueStatement = function(keyword) {
    return function(isHeadStatement) {
      var lbl;
      space();
      if (lbl = jsIdentifier()) {
        return [keyword, lbl];
      } else {
        return [keyword];
      }
    };
  };
  letLikeStatement = function(keyword) {
    return function(isHeadStatement) {
      var line1, varDesc;
      line1 = lineno;
      space();
      varDesc = parser.varInitList() || parser.clause();
      return [keyword, varDesc, thenClause(line1, isHeadStatement, {})];
    };
  };
  this.identifierLine = function() {
    var result, x;
    result = [];
    while (space() && !parser.lineEnd() && !follow('newline') && text[cursor] !== ';') {
      if (x = parser.identifier()) {
        result.push(x);
      } else {
        error('expect an identifier');
      }
    }
    return result;
  };
  this.identifierList = function() {
    var col, col0, indentCol, line1, result, spac, varList;
    line1 = lineno;
    indentCol = lineInfo[line1].indentCol;
    result = parser.identifierLine();
    spac = bigSpace();
    if ((col0 = lineInfo[lineno].indentCol) <= indentCol) {
      rollbackToken(spac);
      return result;
    }
    if (text[cursor] === ';') {
      return result;
    }
    while (varList = parser.identifierLine()) {
      result.push.apply(result, varList);
      spac = bigSpace();
      if ((col = lineInfo[lineno].indentCol) <= indentCol) {
        rollbackToken(spac);
        break;
      } else if (col !== col0) {
        error('inconsistent indent of multiple identifiers lines after extern!');
      }
      if (text[cursor] === ';') {
        break;
      }
    }
    return result;
  };
  this.varInit = function() {
    var id, value;
    if (!(id = parser.identifier())) {
      return;
    }
    space();
    if (text[cursor] === '=' && cursor++) {
      if (value = parser.block()) {
        value = begin(value);
      } else if (!(value = parser.clause())) {
        error('expect a value after "=" in variable initilization');
      }
    }
    space();
    if (text[cursor] === ',') {
      cursor++;
    }
    if (!value) {
      return id;
    } else {
      return [id, '=', value];
    }
  };
  this.varInitList = function() {
    var col, indentCol0, indentCol1, line1, result, spac, space1, start, x;
    start = cursor;
    line1 = lineno;
    result = [];
    indentCol0 = lineInfo[lineno].indentCol;
    spac = bigSpace();
    col = lineInfo[lineno].indentCol;
    if (col > indentCol0) {
      indentCol1 = col;
    } else if (spac.undent || spac.newline) {
      error('unexpected new line, expect at least one variable in var statement');
    }
    while (1) {
      if (x = parser.varInit()) {
        result.push(x);
      } else {
        break;
      }
      space1 = bigSpace();
      col = lineInfo[lineno].indentCol;
      if (!text[cursor] || text[cursor] === ';' || follow('rightDelimiter')) {
        break;
      }
      if (lineno === line1) {
        continue;
      }
      if (col > indentCol0) {
        if (indentCol1 && col !== indentCol1) {
          error('unconsitent indent in var initialization block');
        } else if (!indentCol1) {
          indentCol1 = col;
        }
      } else if (col === indentCol0) {
        break;
      } else {
        rollbackToken(space1);
      }
    }
    if (!result.length) {
      rollback(start, line1);
      return;
    }
    return result;
  };
  this.importItem = function() {
    var asName, asName2, as_, line1, line2, name, start, start1, sym, sym2, sym3, symValue, symValue2;
    start = cursor;
    line1 = lineno;
    sym = parser.symbol();
    if (sym && (symValue = sym.text) !== '#' && symValue !== '#/') {
      error('unexpected symbol after "as" in import! statement');
    }
    name = parser.identifier();
    if (name) {
      if (name.text === 'from') {
        if (sym) {
          error('keyword "from" should not follow "#" or "#/" immediately in import! statement, expect variable name instead');
        } else {
          return rollback(start, lineno);
        }
      }
    } else if (text[cursor] === "'" || text[cursor] === '"') {
      if (sym) {
        error('file path should not follow "#" or "#/" immediately in import! statement, expect variable name instead');
      } else {
        return rollback(start, lineno);
      }
    }
    space();
    start1 = cursor;
    line2 = lineno;
    if ((as_ = taijiIdentifier())) {
      if (as_.text === 'from') {
        as_ = void 0;
        rollback(start1, line2);
      } else if (as_.text !== 'as') {
        error('unexpected word ' + as_.text + ', expect "as", "," or "from [module path...]"');
      } else {
        space();
        sym2 = parser.symbol();
        if (sym2 && (symValue2 = sym2.text) !== '#' && symValue2 !== '#/') {
          error('unexpected symbol after "as" in import! statement');
        }
        if (symValue === '#/') {
          if (symValue2 === '#') {
            error('expect "as #/alias" or or "as alias #alias2" after "#/' + name.text + '"');
          }
        } else if (symValue === '#') {
          if (!symValue) {
            error('meta variable can not be imported as runtime variable');
          } else if (symValue === '#/') {
            error('meta variable can not be imported as both meta and runtime variable');
          }
        } else if (!symValue) {
          if (symValue2 === '#') {
            error('runtime variable can not be imported as meta variable');
          } else if (symValue2 === '#/') {
            'runtime variable can not be imported as both meta and runtime variable';
          }
        }
        space();
        asName = expectIdentifier();
        if (symValue === '#/' && !symValue2) {
          space();
          sym3 = parser.symbol();
          if (!sym3) {
            error('expect # after "#/' + name.text + ' as ' + asName.text + '"');
          } else if (sym3.text !== '#') {
            error('unexpected ' + sym3.text + ' after "#/' + name.text + 'as ' + asName.text + '"');
          }
          asName2 = expectIdentifier();
        }
      }
    }
    if (!as_) {
      if (symValue === '#/') {
        return [[name, name], [name, name, 'meta']];
      } else if (symValue === '#') {
        return [[name, name, 'meta']];
      } else {
        return [[name, name]];
      }
    } else {
      if (symValue === '#/') {
        if (asName2) {
          return [[name, asName], [name, asName2, 'meta']];
        } else {
          return [[name, asName], [name, asName, 'meta']];
        }
      } else if (symValue === '#') {
        return [[name, asName, 'meta']];
      } else {
        return [[name, asName]];
      }
    }
  };
  this.exportItem = function() {
    var meta, name, runtime, value;
    runtime = void 0;
    if (text.slice(cursor, cursor + 2) === '#/') {
      cursor += 2;
      runtime = 'runtime';
      meta = 'meta';
      space();
    } else if ((c = text[cursor]) === '#') {
      cursor++;
      meta = 'meta';
      space();
    } else {
      runtime = 'runtime';
    }
    if (meta) {
      name = expectIdentifier();
    } else if (!(name = taijiIdentifier())) {
      return;
    }
    space();
    if (text[cursor] === '=' && cursor++) {
      space();
      value = parser.spaceClauseExpression();
      space();
    }
    return [name, value, runtime, meta];
  };
  this.spaceComma = spaceComma = function() {
    space();
    if (text[cursor] === ',') {
      cursor++;
      space();
      return true;
    }
  };
  this.seperatorList = seperatorList = function(item, seperator) {
    if (typeof item === 'string') {
      item = parser[item];
    }
    return function() {
      var result, x;
      result = [];
      while (x = item()) {
        result.push(x);
        if (seperator()) {
          continue;
        } else {
          break;
        }
      }
      return result;
    };
  };
  this.importItemList = seperatorList('importItem', spaceComma);
  this.exportItemList = seperatorList('exportItem', spaceComma);
  this.expectIdentifier = expectIdentifier = function(message) {
    var id;
    if (id = parser.identifier()) {
      return id;
    } else {
      return error(message || 'expect identifier');
    }
  };
  this.expectOneOfWords = expectOneOfWords = function() {
    var i, length, value, words;
    words = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    space();
    token = taijiIdentifier();
    if (!token) {
      error('expect one of the words: ' + words.join(' '));
    }
    value = token.value;
    i = 0;
    length = words.length;
    while (i < length) {
      if (value === words[i]) {
        return words[i];
      } else {
        i++;
      }
    }
    return error('expect one of the words: ' + words.join(' '));
  };
  maybeOneOfWords = function() {
    var i, length, value, words;
    words = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    space();
    token = taijiIdentifier();
    if (!token) {
      return;
    }
    value = token.value;
    i = 0;
    length = words.length;
    while (i < length) {
      if (value === words[i]) {
        return words[i];
      } else {
        i++;
      }
    }
  };
  expectWord = function(word) {
    space();
    if (!(token = taijiIdentifier()) || token.value !== word) {
      error('expect ' + word);
    }
    return word;
  };
  word = function(w) {
    var line1, start;
    start = cursor;
    line1 = lineno;
    space();
    if (!(token = taijiIdentifier())) {
      return;
    }
    if (token.value !== w) {
      return rollback(start, line1);
    }
    return token;
  };
  this.expectChar = expectChar = function(c) {
    if (text[cursor] === c) {
      return cursor++;
    } else {
      return error('expect "' + c + '"');
    }
  };
  this.endOfDynamicBlock = this.eob = function() {
    if (cursor === endCursorOfDynamicBlockStack[-1]) {
      return true;
    } else {
      return false;
    }
  };
  this.keywordToStatementMap = {
    '%': function(isHeadStatement) {
      var blockStopLineno, code, cursorAtEndOfDynamicBlock, indentCol, leadClause, line1, result, start;
      start = cursor;
      line1 = lineno;
      if (!space().text) {
        return;
      }
      leadClause = parser.clause();
      code = compileExp(['return', ['%/', leadClause]], environment);
      space();
      indentCol = lineInfo[lineno].indentCol;
      if (expectWord('then') || (text[cursor] === ':' && cursor++)) {
        space();
        if (newline()) {
          blockStopLineno = lineno;
          while (lineInfo[blockStopLineno].indentCol > indentCol && blockStopLineno < maxLine) {
            blockStopLineno++;
          }
          cursorAtEndOfDynamicBlock = lineInfo[blockStopLineno].indentCol || text.length;
        } else {
          blockStopLineno = lineno + 1;
          cursorAtEndOfDynamicBlock = lineInfo[blockStopLineno].indentCol || text.length;
        }
      } else {
        error('expect "then" or ":"');
      }
      endCursorOfDynamicBlockStack.push(cursorAtEndOfDynamicBlock);
      result = new Function('__$taiji_$_$parser__', code)(parser);
      endCursorOfDynamicBlockStack.pop();
      cursor = cursorAtEndOfDynamicBlock;
      lineno = blockStopLineno;
      if (Object.prototype.toString.call(result) === '[object Array]') {
        return extend(result, {
          start: start,
          stop: cursor,
          line1: line,
          lineno: lineno
        });
      } else {
        return {
          value: result,
          start: start,
          stop: cursor,
          line1: line1,
          lineno: lineno
        };
      }
    },
    'break': breakContinueStatement('break'),
    'continue': breakContinueStatement('continue'),
    'throw': throwReturnStatement('throw'),
    'return': throwReturnStatement('return'),
    'new': throwReturnStatement('new'),
    'var': function(isHeadStatement) {
      return ['var'].concat(parser.varInitList());
    },
    'extern!': function(isHeadStatement) {
      return ['extern!'].concat(parser.identifierList());
    },
    'include!': function(isHeadStatement) {
      var filePath, parseMethod;
      space();
      filePath = expect('string', 'expect a file path');
      space();
      if (word('by')) {
        space();
        parseMethod = expect('taijiIdentifier', 'expect a parser method');
      }
      return ['include!', filePath, parseMethod];
    },
    'import!': function(isHeadStatement) {
      var alias, alias2, as_, from_, item, items, metaAlias, metaImportList, parseMethod, runtimeImportList, srcModule, sym, sym2, symValue, x, _k, _l, _len2, _len3;
      space();
      items = parser.importItemList();
      space();
      if (items.length) {
        from_ = expectWord('from');
      } else {
        from_ = word('from');
      }
      space();
      srcModule = parser.string();
      space();
      if (as_ = literal('as')) {
        space();
        sym = parser.symbol();
        if (sym) {
          if ((symValue = sym.text) !== '#' && sym.text !== '#/') {
            error('unexpected symbol before import module name', sym);
          }
        }
        alias = expectIdentifier('expect an alias for module');
        if (symValue === '#') {
          metaAlias = alias;
          alias = void 0;
        } else if (symValue === '#/') {
          metaAlias = alias;
        }
        space();
        sym2 = parser.symbol();
        if (sym && sym2) {
          error('unexpected symbol after meta alias');
        }
        space();
        alias2 = parser.identifier();
        if (sym && alias2) {
          'unexpected identifier ' + alias2 + ' after ' + symValue + alias;
        }
        if (alias2) {
          metaAlias = alias2;
        }
        space();
      }
      if (word('by')) {
        space();
        parseMethod = expect('taijiIdentifier', 'expect a parser method');
      }
      runtimeImportList = [];
      metaImportList = [];
      for (_k = 0, _len2 = items.length; _k < _len2; _k++) {
        item = items[_k];
        for (_l = 0, _len3 = item.length; _l < _len3; _l++) {
          x = item[_l];
          if (x[2]) {
            metaImportList.push(x);
          } else {
            runtimeImportList.push(x);
          }
        }
      }
      return ['import!'].concat([srcModule, parseMethod, alias, metaAlias, runtimeImportList, metaImportList]);
    },
    'export!': function(isHeadStatement) {
      space();
      return ['export!'].concat(parser.exportItemList());
    },
    'let': letLikeStatement('let'),
    'letrec!': letLikeStatement('letrec!'),
    'letloop!': letLikeStatement('letloop!'),
    'if': keywordThenElseStatement('if'),
    'while': keywordThenElseStatement('while'),
    'while!': keywordTestExpressionBodyStatement('while!'),
    'for': function(isHeadStatement) {
      var inOf, init, kw, line1, name1, name2, obj, step, test, value;
      line1 = lineno;
      space();
      if (text[cursor] === '(' && cursor++) {
        init = parser.clause();
        space();
        expectChar(';');
        test = parser.clause();
        space();
        expectChar(';');
        step = parser.clause();
        space();
        expectChar(')');
        return ['cFor!', init, test, step, thenClause(line1, isHeadStatement, {})];
      }
      name1 = expectIdentifier();
      space();
      if (text[cursor] === ',') {
        cursor++;
        space();
      }
      if ((token = jsIdentifier()) && (value = token.value)) {
        if (value === 'in' || value === 'of') {
          inOf = value;
        } else {
          name2 = value;
          space();
          inOf = expectOneOfWords('in', 'of');
        }
        space();
        obj = parser.clause();
      }
      if (name2) {
        if (inOf === 'in') {
          kw = 'forIn!!';
        } else {
          kw = 'forOf!!';
        }
        return [kw, name1, name2, obj, thenClause(line1, isHeadStatement, {})];
      } else {
        if (inOf === 'in') {
          kw = 'forIn!';
        } else {
          kw = 'forOf!';
        }
        return [kw, name1, obj, thenClause(line1, isHeadStatement, {})];
      }
    },
    'do': function(isHeadStatement) {
      var body, conj, indentCol, line1, tailClause;
      line1 = lineno;
      space();
      indentCol = lineInfo[lineno].indentCol;
      body = parser.lineBlock();
      if (newlineFromLine(line1, lineno) && !isHeadStatement) {
        return body;
      }
      if (!(conj = maybeOneOfWords('where', 'when', 'until'))) {
        error('expect conjunction where, when or until');
      }
      if (conj === 'where') {
        tailClause = parser.varInitList();
      } else {
        tailClause = parser.clause();
      }
      if (conj === 'where') {
        return ['let', tailClause, body];
      } else if (conj === 'when') {
        return ['doWhile!', body, tailClause];
      } else {
        return ['doWhile!', body, ['!x', tailClause]];
      }
    },
    'switch': function(isHeadStatement) {
      var case_, cases, else_, line1, options, test;
      line1 = lineno;
      if (!(test = parser.clause())) {
        error('expect a clause after "switch"');
      }
      options = {};
      cases = ['list!'];
      while (case_ = caseClauseOfSwitchStatement(line1, isHeadStatement, options)) {
        cases.push(case_);
      }
      else_ = elseClause(line1, isHeadStatement, options);
      return ['switch', test, cases, else_];
    },
    'try': function(isHeadStatement) {
      var catch_, final, line1, options, test;
      line1 = lineno;
      if (!(test = parser.lineBlock())) {
        error('expect a line or block after "try"');
      }
      if (atStatementHead && !isHeadStatement) {
        error('meet unexpected new line when parsing inline try statement');
      }
      options = {};
      catch_ = catchClause(line1, isHeadStatement, options);
      if (!catch_) {
        error('expect a catch clause for try-catch statement');
      }
      final = finallyClause(line1, isHeadStatement, options);
      return ['try', begin(test), catch_[0], catch_[1], final];
    },
    'class': function(isHeadStatement) {
      var body, line1, name, superClass, supers;
      line1 = lineno;
      space();
      name = expect('identifier', 'expect class name');
      space();
      if (parser.conjunction('extends')) {
        space();
        superClass = parser.identifier();
        space();
      } else {
        supers = void 0;
      }
      if (followNewline() && newlineFromLine(line1, line1 + 1)) {
        body = void 0;
      } else {
        body = parser.lineBlock();
      }
      return ['#call!', 'class', [name, superClass, body]];
    }
  };
  this.statement = function() {
    var isHeadStatement, keyword, line1, start, stmt, stmtFn;
    start = cursor;
    line1 = lineno;
    if (!(keyword = symbol() || taijiIdentifier())) {
      return;
    }
    if (stmtFn = parser.keywordToStatementMap[keyword.text]) {
      isHeadStatement = atStatementHead;
      atStatementHead = false;
      if (stmt = stmtFn(isHeadStatement)) {
        return extend(stmt, {
          start: start,
          stop: cursor,
          line1: line1,
          line: lineno
        });
      }
    }
    return rollback(start, line1);
  };
  this.defaultAssignLeftSide = function() {
    var e, line1, start, x;
    start = cursor;
    line1 = lineno;
    if (!(x = parser.spaceClauseExpression())) {
      return;
    }
    if (x.type === PAREN || x.type === BRACKET || x.type === DATA_BRACKET || x.type === CURVE) {
      rollback(start, line1);
      return;
    }
    x = getOperatorExpression(x);
    if (!x) {
      rollback(start, line1);
      return;
    }
    if (x.type === IDENTIFIER || ((e = entity(x)) && (e[0] === 'attribute!' || e[0] === 'index!'))) {
      return x;
    } else if (x.text === '::') {
      return x;
    } else if (parser.isAssign(x[0])) {
      rollback(x[1].stop, x[1].line);
      return x[1];
    } else {
      rollback(start, line1);
    }
  };
  this.isAssign = function(val) {
    var op;
    return (op = binaryOperatorDict[val]) && op.assign;
  };
  this.defaultAssignSymbol = function() {
    var x;
    return (x = parser.symbol()) && parser.isAssign(x.text) && x;
  };
  this.defaultAssignRightSide = function() {
    var space2;
    space2 = bigSpace();
    if (space2.undent) {
      error('unexpected undent after assign symbol' + symbol.text);
    } else if (space2.newline) {
      error('unexpected new line after assign symbol' + symbol.text);
    }
    return parser.block() || parser.clause();
  };
  this.makeAssignClause = function(assignLeftSide, assignSymbol, assignRightSide) {
    return function() {
      var eLeft, left, line1, right, spac, start;
      start = cursor;
      line1 = lineno;
      if (!(left = assignLeftSide())) {
        return;
      }
      spac = space();
      if (!(token = assignSymbol())) {
        return rollback(start, line1);
      }
      right = assignRightSide(spac);
      if (left.type === CURVE) {
        eLeft = entity(left);
        if (typeof eLeft === 'string') {
          if (eLeft[0] === '"') {
            error('unexpected left side of assign: ' + eLeft);
          }
          left = [left];
        } else if (eLeft && eLeft.push) {
          if (eLeft[0] === 'begin!') {
            error('syntax error: left side of assign should be a list of variable names separated by space');
          }
        } else {
          error('unexpected left side of assign');
        }
        return ['hashAssign!', left, right];
      }
      return extend([token, left, right], {
        start: start,
        cursor: cursor,
        line1: line1,
        line: lineno
      });
    };
  };
  this.defaultAssignClause = this.makeAssignClause(this.defaultAssignLeftSide, this.defaultAssignSymbol, this.defaultAssignRightSide);
  this.customAssignClauses = [];
  this.assignClause = function() {
    var matcher, x, _k, _len2, _ref5;
    _ref5 = parser.customAssignClauses;
    for (_k = 0, _len2 = _ref5.length; _k < _len2; _k++) {
      matcher = _ref5[_k];
      if (x = matcher()) {
        return x;
      }
    }
    return parser.defaultAssignClause();
  };
  this.macroCallClause = function() {
    var args, blk, head, line1, spac, space1, start;
    start = cursor;
    line1 = lineno;
    if ((head = parser.compactClauseExpression())) {
      if ((space1 = space()) && !space1.text) {
        return rollback(start, line1);
      }
      if (text[cursor] === '#' && cursor++ && ((spac = space()) && spac.text || text[cursor] === '\n' || text[cursor] === '\r')) {
        if (blk = parser.block()) {
          return extend(['#call!', head, blk], {
            cursor: start,
            line1: lineno,
            stop: cursor,
            line: lineno
          });
        } else if (args = parser.clauses()) {
          return extend(['#call!', head, args], {
            cursor: start,
            line1: lineno,
            stop: cursor,
            line: lineno
          });
        }
      }
    }
    return rollback(start, line1);
  };
  this.parameterList = function() {
    var item, params, start;
    start = token;
    if (token.type === SPACE) {
      nextToken();
    }
    if (token.type !== PAREN) {
      token = start;
      return;
    }
    if (item = getOperatorExpression(token.value)) {
      if (params = parser.toParameters(item)) {
        return params;
      } else {
        if (followSequence('inlineSpaceComment', 'defaultSymbolOfDefinition')) {
          return error('illegal parameters list for function definition');
        } else {
          token = start;
        }
      }
    }
  };
  this.definition = function() {
    var body, define, parameters, start, tail, value;
    start = token;
    if (!(parameters = parser.parameterList())) {
      parameters = [];
    }
    if (token.type === SPACE) {
      nextToken();
    }
    if ((value = token.value) && ((tail = value.slice(value.length - 2)) === '->' || tail === '=>')) {
      define = token;
      nextToken();
      body = begin(parser.lineBlock()) || 'undefined';
      return extend([define, parameters, body], {
        start: start,
        stop: token
      });
    } else {
      token = start;
    }
  };
  this.clauseItem = function() {
    var d, item;
    if (token.type === SPACE) {
      nextToken();
    }
    if ((item = parser.compactClauseExpression())) {
      if (item.type === PAREN && (d = parser.definition())) {
        return d;
      }
      return item;
    }
  };
  this.sequenceClause = function() {
    var clause, item, start;
    start = token;
    clause = [];
    while (item = parser.clauseItem()) {
      clause.push(item);
    }
    if (!clause.length) {
      return;
    }
    return extend(clause, {
      start: start,
      stop: token
    });
  };
  this.customClauseList = ['assignClause', 'colonClause', 'macroCallClause', 'indentClause'];
  shadowToken = function(symbol, tkn) {
    return extend({
      symbol: symbol
    }, tkn);
  };
  leadTokenClause = function(value) {
    var clause, fn, start, type;
    start = token;
    if ((type = matchToken().type) !== SPACE && type !== INDENT) {
      return;
    }
    if (!(fn = leadWordClauseMap[start.value])) {
      return;
    }
    clause = fn(token, parser.clause());
    clause.start = start;
    clause.stop = token;
    return clause;
  };
  leadWordClauseMap = {
    '%%': function(tkn, clause) {
      var code;
      code = compileExp(['return', clause], environment);
      return new Function('__$taiji_$_$parser__', code)(parser);
    },
    '%/': function(tkn, clause) {
      var code;
      code = compileExp(['return', [tkn, clause]], environment);
      return new Function('__$taiji_$_$parser__', code)(parser);
    },
    '%!': function(tkn, clause) {
      var code;
      code = compileExp(['return', [tkn, clause]], environment);
      return new Function('__$taiji_$_$parser__', code)(parser);
    },
    '~': function(tkn, clause) {
      return [shadowToken(tkn, 'quote!'), clause];
    },
    '`': function(tkn, clause) {
      return [shadowToken(tkn, 'quasiquote!'), clause];
    },
    '^': function(tkn, clause) {
      return [shadowToken(tkn, 'unquote!'), clause];
    },
    '^&': function(tkn, clause) {
      return [shadowToken(tkn, 'unquote-splice'), clause];
    },
    '#': function(tkn, clause) {
      return [tkn, clause];
    },
    '##': function(tkn, clause) {
      return [tkn, clause];
    },
    '#/': function(tkn, clause) {
      return [tkn, clause];
    },
    '#-': function(tkn, clause) {
      return [tkn, clause];
    },
    '#&': function(tkn, clause) {
      return [tkn, clause];
    }
  };
  symbol2clause = {};
  for (key in leadWordClauseMap) {
    symbol2clause[key] = leadTokenClause;
  }
  this.clause = function() {
    var blk, clause, clauses, exp, fn, head, op, originalToken, start, tkn, type, value;
    start = token;
    if ((type = token.type) === SPACE) {
      nextToken();
      type = token.type;
    }
    if (type === KEYWORD) {
      return keyword2statement[token.value]();
    } else if (type === IDENTIFIER && nextToken()) {
      if (token.value === '#' && nextToken() && token.value === ':' && nextToken() && (blk = parser.lineBlock())) {
        return ['label!', start, blk];
      } else {
        token = start;
      }
    } else if (type === SYMBOL && (fn = symbol2clause[token.value])) {
      return fn();
    }
    if (!(head = parser.compactClauseExpression())) {
      if ((op = parser.prefixOperator())) {
        if (token.type === SPACE && nextToken() && (exp = parser.spaceClauseExpression())) {
          return [op, exp];
        } else {
          return op;
        }
      } else if (token.value === ',') {
        nextToken();
        return {
          value: 'undefined',
          start: start,
          stop: token
        };
      } else {
        return;
      }
    }
    if (op = parser.binaryOperator(SPACE_CLAUSE_EXPRESSION, 300)) {
      originalToken = token;
      token = head;
      head.next = op;
      op.isBinaryOperator = true;
      op.next = originalToken;
      if ((exp = parser.spaceClauseExpression())) {
        if ((value = token.value) === ',') {
          nextToken();
          if (token.type === SPACE) {
            nextToken();
          }
        } else if (value !== ';' && (type = token.type) !== NEWLINE && type !== UNDENT && type !== EOI) {
          error('after space expression clause, expect stop symbol of clause like colon, semicolon, new line, undent or end of input etc.');
        }
        return exp;
      } else {
        token = originalToken;
      }
    }
    tkn = token;
    if ((exp = parser.spaceClauseExpression())) {
      if (exp.priority <= 600 && isCallable(head)) {
        if ((value = token.value) === ',') {
          nextToken();
          if (token.type === SPACE) {
            nextToken();
          }
        } else if (value !== ';' && (type = token.type) !== NEWLINE && type !== UNDENT && type !== EOI) {
          error('after caller leading clause, expect stop symbol of clause like colon, semicolon, new line, undent or end of input etc.');
        }
        return [head, exp];
      } else {
        token = tkn;
      }
    } else if (token.value === '#' && nextToken()) {
      if (token.type === SPACE) {
        clauses = parser.clauses();
      } else if (token.type === INDENT) {
        clauses = parser.block();
      }
      return [head].concat(clauses);
    } else if (token.value === ':') {
      nextToken();
      if (token.type === SPACE) {
        nextToken();
      }
      clause = parser.clauses();
      clause.unshift(head);
      clause.start = head;
      return extend(clause, {
        start: start,
        stop: token
      });
    }
    if (clause = parser.sequenceClause()) {
      clause.unshift(head);
      clause.start = start;
      if (token.value === INDENT) {
        blk = parser.block();
        clause.push.apply(clause, blk);
        clause.stop = blk.stop;
      }
    } else {
      clause = head;
    }
    if ((value = token.value) === ',') {
      nextToken();
    } else if (value === ':') {
      nextToken();
      if (token.type === 'INDENT') {
        clauses = parser.block();
      } else {
        clauses = parser.clauses();
      }
      clauses.unshift(clause);
      clauses.start = start;
      clauses.stop = token;
      clauses;
    } else if (token.type === INDENT) {
      clauses = parser.block();
      clause.push.apply(clause, clauses);
    }
    return extend(clause, {
      start: start,
      stop: token
    });
  };
  isCallable = function(exp) {
    var type;
    return (type = exp.type) !== NUMBER && type !== NON_INTERPOLATE_STRING && type !== INTERPOLATE_STRING && type !== BRACKET && type !== HASH;
  };
  this.clauses = function() {
    var clause, result;
    result = [];
    while (clause = parser.clause()) {
      result.push(clause);
    }
    return result;
  };
  this.lineCommentBlock = function() {
    var comment, result, start;
    start = cursor;
    if (comment = parser.lineComment()) {
      if (comment.indent) {
        if (comment.text.slice(0, 3) === '///') {
          result = parser.blockWithoutIndentHead();
          result.unshift(['directLineComment!', comment.text]);
          return result;
        } else {
          return parser.blockWithoutIndentHead();
        }
      } else {
        if (text.slice(start, start + 3) === '///') {
          return [
            extend(['directLineComment!', comment.text], {
              start: start,
              stop: cursor,
              line: lineno
            })
          ];
        } else {
          return [
            extend(['lineComment!', comment.text], {
              start: start,
              stop: cursor,
              line: lineno
            })
          ];
        }
      }
    }
  };
  this.codeCommentBlockComment = function() {
    var code, line1, start;
    if (cursor !== lineInfo[lineno].start + lineInfo[lineno].indentCol) {
      return;
    }
    if (text[cursor] !== '/') {
      return;
    }
    if ((c = text[cursor + 1]) === '.' || c === '/' || c === '*') {
      return;
    }
    start = cursor;
    line1 = lineno;
    cursor++;
    code = parser.lineBlock();
    return extend([['codeBlockComment!', code]], {
      start: start,
      stop: cursor,
      line1: line1,
      line: lineno
    });
  };
  this.sentence = function() {
    var result, start, type;
    start = token;
    if ((type = token.type) === EOI || type === UNDENT || type === RIGHT_DELIMITER || isConjunction(token)) {
      return;
    }
    result = parser.clauses();
    if (token.value === ';') {
      nextToken();
      if (token.type === SPACE) {
        nextToken();
      }
    }
    return extend(result, {
      start: start,
      stop: token
    });
  };
  this.line = function() {
    var result, type, x;
    if ((type = token.type) === UNDENT || type === RIGHT_DELIMITER || isConjunction(token) && type === EOI) {
      return;
    }
    result = [];
    while (x = parser.sentence()) {
      result.push.apply(result, x);
    }
    if (token.type === NEWLINE) {
      nextToken();
    }
    return result;
  };
  this.block = function(dent) {
    if (token.type === INDENT) {
      nextToken();
      return parser.blockWithoutIndentHead(dent);
    }
  };
  this.blockWithoutIndentHead = function(dent) {
    var result, x;
    result = [];
    while ((x = parser.line())) {
      result.push.apply(result, x);
      if (token.stopIndent < dent) {
        break;
      }
    }
    return result;
  };
  this.lineBlock = function(dent) {
    var result;
    if (token.type === INDENT) {
      nextToken();
      return parser.blockWithoutIndentHead(dent);
    } else {
      result = parser.line();
      if (token.stopIndent > dent) {
        result.push.apply(result, parser.blockWithoutIndentHead());
      }
      return result;
    }
  };
  this.moduleBody = function() {
    var body, spac, x;
    matchToken();
    if (token.type === NEWLINE) {
      matchToken();
    }
    if (token.type === SPACE) {
      matchToken();
    }
    body = [];
    while (1) {
      if (!(x = parser.line())) {
        break;
      }
      spac = bigSpace();
      body.push.apply(body, x);
      clearMemo();
      if (lineInfo[lineno].indentCol < indentCol) {
        rollbackToken(spac);
        break;
      }
    }
    if (text[cursor]) {
      error('expect end of input, but meet "' + text.slice(cursor) + '"');
    }
    return begin(body);
  };
  this.moduleHeader = function() {
    var x, y;
    if (!(literal('taiji') && spaces() && literal('language') && spaces() && (x = decimal()) && char('.') && (y = decimal()))) {
      error('taiji language module should begin with "taiji language x.x"');
    }
    if ((x = x.value) !== 0 || (y = y.value) !== 1) {
      error('taiji 0.1 can not process taiji language' + x + '.' + y);
    }
    lineno++;
    while (lineno <= maxLine && (lineInfo[lineno].indentCol > 0 || lineInfo[lineno].empty)) {
      lineno++;
    }
    if (lineno > maxLine) {
      cursor = text.length;
    } else {
      cursor = lineInfo[lineno].start;
    }
    return {
      type: MODULE_HEADER,
      version: {
        main: x,
        minor: y
      },
      value: text.slice(0, cursor)
    };
  };
  this.module = function() {
    var scriptDirective;
    if (text.slice(cursor, cursor + 2) === '#!') {
      scriptDirective = ['scriptDirective!', skipLineTail()];
    }
    return wrapResult(['module!', scriptDirective, parser.moduleHeader(), parser.moduleBody()], {
      type: MODULE
    });
  };
  this.init = function(data, cur, env) {
    this.text = text = data;
    cursor = cur;
    char = text[cursor];
    lineno = 1;
    lineStart = 0;
    token = {};
    memoMap = {};
    atStatementHead = true;
    interolateStringNumber = 0;
    this.environment = environment = env;
    this.meetEllipsis = false;
    return endCursorOfDynamicBlockStack = [];
  };
  this.parse = function(data, root, cur, env) {
    parser.init(data, cur, env);
    return root();
  };
  this.lexError = lexError = function(message) {
    throw cursor + '(' + lexRow + ':' + lexCol + '): ' + message + ': \n' + text.slice(cursor - 40, cursor) + '|   |' + text.slice(cursor, cursor + 40);
  };
  this.error = error = function(message, tkn) {
    var cur;
    tkn = tkn || token;
    cur = tkn.cursor;
    throw cur + '(' + tkn.line + ':' + tkn.column + '): ' + message + ': \n' + text.slice(cur - 40, cur) + text.slice(cur, cur + 40).red;
  };
  return this;
};

compileExp = require('../compiler').compileExp;
