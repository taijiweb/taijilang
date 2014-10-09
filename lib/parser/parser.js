var BLOCK_COMMENT, BRACKET, CODE_BLOCK_COMMENT, COMPACT_CLAUSE_EXPRESSION, CONCAT_LINE, CONJUNCTION, CURVE, C_BLOCK_COMMENT, DATA_BRACKET, EOI, FUNCTION, HALF_DENT, HASH, HEAD_SPACES, IDENTIFIER, INDENT, INDENT_EXPRESSION, INLINE_COMMENT, INTERPOLATE_EXPRESSION, INTERPOLATE_STRING, KEYWORD, LINE_COMMENT, MODULE, MODULE_HEADER, NEWLINE, NON_INTERPOLATE_STRING, NUMBER, OPERATOR_EXPRESSION, PAREN, PUNCT, REGEXP, RIGHT_DELIMITER, SPACE, SPACES, SPACES_INLINE_COMMENT, SPACE_CLAUSE_EXPRESSION, SPACE_COMMENT, STRING, SYMBOL, TAIL_COMMENT, UNDENT, base, begin, binaryOperatorDict, charset, colors, compileExp, conjMap, constant, dict, digitCharSet, digitChars, entity, escapeNewLine, extend, firstIdentifierCharSet, firstIdentifierChars, firstSymbolCharset, getOperatorExpression, hasOwnProperty, identifierCharSet, identifierChars, isArray, isConj, isKeyword, keywordMap, letterCharSet, letterChars, letterDigitSet, makeOperatorExpression, prefixOperatorDict, str, suffixOperatorDict, taijiIdentifierCharSet, wrapInfo1, wrapInfo2, _ref, _ref1, _ref2,
  __slice = [].slice;

colors = require('colors');

_ref = require('../utils'), charset = _ref.charset, isArray = _ref.isArray, wrapInfo1 = _ref.wrapInfo1, wrapInfo2 = _ref.wrapInfo2, str = _ref.str, entity = _ref.entity;

_ref1 = base = require('./base'), extend = _ref1.extend, firstIdentifierChars = _ref1.firstIdentifierChars, firstIdentifierCharSet = _ref1.firstIdentifierCharSet, letterDigitSet = _ref1.letterDigitSet, identifierChars = _ref1.identifierChars, digitCharSet = _ref1.digitCharSet, letterCharSet = _ref1.letterCharSet, identifierCharSet = _ref1.identifierCharSet, firstSymbolCharset = _ref1.firstSymbolCharset, taijiIdentifierCharSet = _ref1.taijiIdentifierCharSet, constant = _ref1.constant;

digitChars = base.digits;

letterChars = base.letters;

NUMBER = constant.NUMBER, STRING = constant.STRING, IDENTIFIER = constant.IDENTIFIER, SYMBOL = constant.SYMBOL, REGEXP = constant.REGEXP, HEAD_SPACES = constant.HEAD_SPACES, CONCAT_LINE = constant.CONCAT_LINE, PUNCT = constant.PUNCT, FUNCTION = constant.FUNCTION, C_BLOCK_COMMENT = constant.C_BLOCK_COMMENT, PAREN = constant.PAREN, BRACKET = constant.BRACKET, DATA_BRACKET = constant.DATA_BRACKET, CURVE = constant.CURVE, INDENT_EXPRESSION = constant.INDENT_EXPRESSION, NEWLINE = constant.NEWLINE, SPACES = constant.SPACES, INLINE_COMMENT = constant.INLINE_COMMENT, SPACES_INLINE_COMMENT = constant.SPACES_INLINE_COMMENT, LINE_COMMENT = constant.LINE_COMMENT, BLOCK_COMMENT = constant.BLOCK_COMMENT, CODE_BLOCK_COMMENT = constant.CODE_BLOCK_COMMENT, CONCAT_LINE = constant.CONCAT_LINE, NON_INTERPOLATE_STRING = constant.NON_INTERPOLATE_STRING, INTERPOLATE_STRING = constant.INTERPOLATE_STRING, EOI = constant.EOI, INDENT = constant.INDENT, UNDENT = constant.UNDENT, HALF_DENT = constant.HALF_DENT, MODULE_HEADER = constant.MODULE_HEADER, MODULE = constant.MODULE, SPACE_COMMENT = constant.SPACE_COMMENT, TAIL_COMMENT = constant.TAIL_COMMENT, SPACE = constant.SPACE, HASH = constant.HASH, RIGHT_DELIMITER = constant.RIGHT_DELIMITER, KEYWORD = constant.KEYWORD, CONJUNCTION = constant.CONJUNCTION, OPERATOR_EXPRESSION = constant.OPERATOR_EXPRESSION, COMPACT_CLAUSE_EXPRESSION = constant.COMPACT_CLAUSE_EXPRESSION, SPACE_CLAUSE_EXPRESSION = constant.SPACE_CLAUSE_EXPRESSION, INTERPOLATE_EXPRESSION = constant.INTERPOLATE_EXPRESSION;

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

exports.isKeyword = isKeyword = function(item) {
  return item && !item.escaped && hasOwnProperty.call(exports.keywordMap, item.value);
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

exports.isConj = isConj = function(item) {
  return item && !item.escaped && hasOwnProperty.call(exports.conjMap, item.value);
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
  var atLineHead, atStatementHead, atomTokenTypes, binaryDictOperator, binaryOperatorMemoIndex, bracket, bracketVariantMap, breakContinueStatement, c, canFollowSuffix, canFollowSufix, caseClauseOfSwitchStatement, catchClause, char, column, conjClause, cursor, curve, curveVariantMap, decimal, elseClause, endCursorOfDynamicBlockStack, environment, eof, error, escapeSymbol, expect, expectChar, expectIdentifier, expectIndentConj, expectOneOfWords, expectWord, finallyClause, follow, followMatch, followSequence, getMaybeConcatLine, indent, indentExpression, interpolateStringPiece, isIdentifier, itemToParameter, keywordTestExpressionBodyStatement, keywordThenElseStatement, leadWordClauseMap, leftCBlockComment, leftIndentBlockComment, leftRegexp, letLikeStatement, lexError, lineno, literal, makeTokenFnMap, matchToken, maybeOneOfWords, memo, memoIndex, memoMap, newToken, newline, nextToken, nonInterpolatedStringLine, operatorExpression, paren, parser, predefined, recursive, recursiveExpressionMemoIndex, repeatedCharToken, saveMemo, seperatorList, skipInlineSpace, skipSpaceLines, spaceClauseExpression, spaceComma, symbolStopChars, text, textLength, thenClause, throwReturnStatement, toParameters, token, tokenFnMap, tokenOnAtChar, tokenOnBackSlashChar, tokenOnColonChar, tokenOnDotChar, tokenOnDoubleQuoteChar, tokenOnForwardSlashChar, tokenOnIdentifierChar, tokenOnLeftBracketChar, tokenOnLeftCurveChar, tokenOnLeftParenChar, tokenOnNewlineChar, tokenOnNumberChar, tokenOnPunctChar, tokenOnRightDelimiterChar, tokenOnSingleQuoteChar, tokenOnSpaceChar, tokenOnSymbolChar, unchangeable, word, wrapResult;
  parser = this;
  this.predefined = predefined = {};
  unchangeable = ['cursor', 'setCursor', 'lineno', 'setLineno', 'atLineHead', 'atStatementHead', 'setAtStatementHead'];
  text = '';
  textLength = 0;
  cursor = 0;
  char = '';
  lineno = 0;
  column = 0;
  indent = 0;
  atLineHead = true;
  token = void 0;
  memoMap = {};
  atStatementHead = true;
  environment = null;
  endCursorOfDynamicBlockStack = [];
  memoIndex = 0;
  eof = {
    type: EOI,
    value: void 0,
    cursor: textLength,
    column: -1,
    indent: -1
  };
  eof.next = eof;
  this.memo = memo = function(fn) {
    var tag;
    tag = memoIndex++;
    return function() {
      var m, x;
      if ((m = memoMap[tag]) && hasOwnProperty.call(m, cursor)) {
        if (x = m[cursor]) {
          cursor = x.stop;
          lineno = x.line;
        }
        return x;
      } else {
        if (!memoMap[tag]) {
          memoMap[tag] = m = {};
        }
        return m[cursor] = fn();
      }
    };
  };
  parser.saveMemo = saveMemo = function(tag, start, result) {
    if (!memoMap[tag]) {
      memoMap[tag] = {};
    }
    result.stop = cursor;
    result.line = lineno;
    return memoMap[tag][start] = result;
  };
  this.clearMemo = function() {
    return memoMap = {};
  };
  nextToken = function() {
    if (token.next) {
      return token = token.next;
    } else {
      return matchToken();
    }
  };
  newToken = function(tkn) {
    token.next = tkn;
    return token = tkn;
  };
  this.matchToken = matchToken = function() {
    var fn;
    if (!char) {
      eof.lineno = lineno + 1;
      token = eof;
    } else if (fn = tokenFnMap[char]) {
      fn(char);
    } else {
      tokenOnSymbolChar();
    }
    return token;
  };
  makeTokenFnMap = function() {
    return {
      ' ': tokenOnSpaceChar,
      '\t': tokenOnSpaceChar,
      '\n': tokenOnNewlineChar,
      '\r': tokenOnNewlineChar,
      '0': tokenOnNumberChar,
      '1': tokenOnNumberChar,
      '2': tokenOnNumberChar,
      '3': tokenOnNumberChar,
      '4': tokenOnNumberChar,
      '5': tokenOnNumberChar,
      '6': tokenOnNumberChar,
      '7': tokenOnNumberChar,
      '8': tokenOnNumberChar,
      '9': tokenOnNumberChar,
      '"': tokenOnDoubleQuoteChar,
      "'": tokenOnSingleQuoteChar,
      '(': tokenOnLeftParenChar,
      ')': tokenOnRightDelimiterChar,
      '[': tokenOnLeftBracketChar,
      ']': tokenOnRightDelimiterChar,
      '{': tokenOnLeftCurveChar,
      '}': tokenOnRightDelimiterChar,
      ',': tokenOnPunctChar,
      ';': tokenOnPunctChar,
      '.': tokenOnDotChar,
      ':': tokenOnColonChar,
      '@': tokenOnAtChar,
      '\\': tokenOnBackSlashChar,
      '/': tokenOnForwardSlashChar
    };
  };
  tokenOnSymbolChar = function() {
    var c2, col, cur, value;
    cur = cursor;
    col = column;
    while (char) {
      if (symbolStopChars[char]) {
        break;
      }
      if (char === '/' && ((c2 = text[cursor + 1]) === '/' || c2 === '*' || c2 === '!')) {
        break;
      }
      cursor++;
      char = text[cursor];
    }
    column += cursor - cur;
    return newToken({
      type: SYMBOL,
      value: (value = text.slice(cur, cursor)),
      cursor: cur,
      stopCursor: cursor,
      line: lineno,
      column: col,
      indent: indent
    });
  };
  symbolStopChars = extend(charset(' \t\v\n\r()[]{},;:\'\".@\\'), identifierCharSet);
  tokenOnAtChar = tokenOnDotChar = repeatedCharToken = function() {
    var col, cur, first, value;
    cur = cursor;
    col = column;
    first = char;
    char = text[++cursor];
    while (char === first) {
      char = text[++cursor];
    }
    column += cursor - cur;
    return newToken({
      type: SYMBOL,
      value: (value = text.slice(cur, cursor)),
      cursor: cur,
      stopCursor: cursor,
      line: lineno,
      column: col,
      indent: indent
    });
  };
  tokenOnColonChar = function() {
    var col, cur, first, type, value;
    cur = cursor;
    col = column;
    first = char;
    char = text[++cursor];
    while (char === first) {
      char = text[++cursor];
    }
    column += cursor - cur;
    if (cursor === cur + 1) {
      type === PUNCT;
    } else {
      type = SYMBOL;
    }
    return newToken({
      type: type,
      value: (value = text.slice(cur, cursor)),
      cursor: cur,
      stopCursor: cursor,
      line: lineno,
      column: col,
      indent: indent
    });
  };
  tokenOnSpaceChar = function() {
    var c, col, concatIndent, cur, dent, line, tkn;
    cur = cursor;
    line = lineno;
    col = column;
    dent = indent;
    char = text[++cursor];
    ++column;
    skipInlineSpace(dent);
    if (char === '\\' && newline()) {
      while ((c = text[cursor]) && c === ' ') {
        cursor++;
        column++;
      }
      if (c === '\n' || c === '\r') {
        error('should not follow empty line as concatenated line');
      } else if (!c) {
        unexpectedEOI('after concatenated line symbol "\"');
      }
      if (concatenating) {
        if (column !== dent) {
          error('expect the same indent for the second and more concatenated lines');
        }
      } else if (column <= dent) {
        expectMoreIndent(dent, 'in the following concatenated line');
      }
      concatIndent = column;
      skipInlineSpace(concatIndent);
      if ((c = text[cursor]) === '\n' || c === '\r') {
        error('concatenated line should not have only spaces and comments');
      }
      return newToken({
        type: SPACE,
        value: text.slice(cur, cursor),
        cursor: cur,
        stopCursor: cursor,
        line: line,
        stopLine: lineno,
        column: col,
        stopColumn: column,
        indent: dent
      });
    }
    if (newline()) {
      skipSpaceLines(dent);
      indent = column;
      tkn = {
        type: SPACE,
        value: text.slice(cur, cursor),
        cursor: cur,
        stopCursor: cursor,
        line: line,
        stopLine: lineno,
        column: col,
        stopColumn: column,
        indent: dent
      };
      if (indent > dent) {
        tkn.isIndent = true;
      } else if (indent < dent) {
        tkn.isUndent = false;
      } else {
        tkn.isNewline = true;
      }
      return newToken(tkn);
    } else {
      return newToken({
        type: SPACE,
        value: text.slice(cur, cursor),
        cursor: cur,
        stopCursor: cursor,
        line: line,
        stopLine: lineno,
        column: col,
        stopColumn: column,
        indent: dent
      });
    }
  };
  skipSpaceLines = function(dent) {
    var c2;
    while (1) {
      if (!char) {
        return;
      }
      while (char && char === ' ') {
        cursor++;
        char = text[cursor];
        column++;
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
        column = 0;
        continue;
      } else if (char === '\r') {
        if (char === '\n') {
          cursor += 2;
        } else {
          cursor++;
        }
        char = text[cursor];
        lineno++;
        column = 0;
        continue;
      } else if (!char) {
        break;
      } else if (column !== dent) {
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
            column = 0;
            continue;
          } else if (char === '\r') {
            if (char === '\n') {
              cursor += 2;
            } else {
              cursor++;
            }
            char = text[cursor];
            lineno++;
            column = 0;
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
          column += 2;
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
      column = 0;
    } else if (char === '\n') {
      cursor++;
      if ((c2 = text[cursor]) === '\r') {
        cursor++;
        c2 = '\r';
      }
      char = text[cursor];
      lineno++;
      column = 0;
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
        column = 0;
        while (char === ' ') {
          cursor++;
          char = text[cursor];
          column++;
        }
        if (char === '\n' || char === '\r') {
          continue;
        }
        if (char === '\t') {
          unexpectedTabCharAtLineHead();
        }
        if (column <= dent) {
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
        column = 0;
        while (char === ' ') {
          cursor++;
          char = text[cursor];
          column++;
        }
        if (char === '\n' || char === '\r') {
          continue;
        }
        if (char === '\t') {
          unexpectedTabCharAtLineHead();
        }
        if (column <= dent) {
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
        column += 2;
        break;
      } else if (char === '\n') {
        cursor++;
        char = text[cursor];
        lineno++;
        column = 0;
        if (char === '\r') {
          cursor++;
          char = text[cursor];
        }
        while (char === ' ') {
          cursor++;
          char = text[cursor];
          column++;
        }
        if (char === '\t') {
          unexpectedTabCharAtLineHead();
        }
        if (char === '\n' || char === '\r') {
          continue;
        } else if (!char) {
          unexpectedEOI('while parsing c style block comment /* */');
        }
        if (column < dent) {
          _results.push(expectMoreIndent(dent, 'while parsing c style block comment /* */'));
        } else {
          _results.push(void 0);
        }
      } else if (char === '\r') {
        cursor++;
        char = text[cursor];
        lineno++;
        column = 0;
        if (char === '\n') {
          cursor++;
          char = text[cursor];
        }
        while (char === ' ') {
          cursor++;
          char = text[cursor];
          column++;
        }
        if (char === '\t') {
          unexpectedTabCharAtLineHead();
        }
        if (char === '\n' || char === '\r') {
          continue;
        } else if (!char) {
          unexpectedEOI('while parsing c style block comment /* */');
        }
        if (column < dent) {
          _results.push(expectMoreIndent(dent));
        } else {
          _results.push(void 0);
        }
      } else if (!char) {
        _results.push(unexpectedEOI('while parsing c style block comment /* */'));
      } else {
        cursor++;
        char = text[cursor];
        _results.push(column++);
      }
    }
    return _results;
  };
  leftRegexp = function() {
    var c2, i, _results;
    _results = [];
    while (char = text[cursor]) {
      if (char === '\\') {
        if ((c2 = text[cursor + 1] === '/') || c2 === '\\') {
          _results.push(cursor += 2);
        } else {
          _results.push(cursor++);
        }
      } else if (char === '\n' || char === '\r') {
        _results.push(error('meet unexpected new line while parsing regular expression'));
      } else if (char === '/') {
        i = 0;
        cursor++;
        while (char = text[cursor]) {
          if (char === 'i' || char === 'g' || char === 'm') {
            cursor++;
            ++i;
          } else {
            break;
          }
        }
        if (i > 3) {
          'too many modifiers after regexp';
        }
        break;
      } else {
        _results.push(cursor++);
      }
    }
    return _results;
  };
  tokenOnBackSlashChar = function() {
    char = text[++cursor];
    column++;
    if (char === '\n' || char === '\r') {
      return concatline;
    } else if (firstIdentifierCharSet[char]) {
      tokenOnIdentifierChar();
      return token.escaped = true;
    } else if (firstSymbolCharset[char]) {
      tokenOnSymbolChar();
      return token.escaped = true;
    } else if (char === ':') {
      tokenOnColonChar();
      return token.escaped = true;
    } else if (char === '@') {
      tokenOnAtChar();
      return token.escaped = true;
    } else if (char === '.') {
      tokenOnDotChar();
      return token.escaped = true;
    } else if (char === "'") {
      tokenOnSingleQuoteChar();
      return token.escaped = true;
    } else {
      char = text[--cursor];
      column--;
      return repeatedCharToken();
    }
  };
  tokenOnForwardSlashChar = function() {
    var cur, ind, t;
    cur = cursor;
    char = text[++cursor];
    ind = indent;
    if (char === '/') {
      cursor++;
      char = text[cursor];
      while (char && char !== '\n' && char !== '\r') {
        cursor++;
        char = text[cursor];
      }
      skipSpaceLines(indent);
      if (indent > ind) {
        t = INDENT;
      } else if (indent === ind) {
        t = NEWLINE;
      } else {
        t = UNDENT;
      }
      return {
        type: t,
        value: text.slice(cur, cursor)
      };
    } else if (char === '*') {
      leftCBlockComment();
      skipInlineSpace();
      if (!char) {
        t = EOI;
      } else if (char === '\n' || char === '\r') {
        skipSpaceLines(ind);
        if (indent > ind) {
          t = INDENT;
        } else if (indent === ind) {
          t = NEWLINE;
        } else {
          t = UNDENT;
        }
      } else {
        t = SPACE;
      }
      return newToken({
        type: t,
        value: text.slice(cur, cursor)
      });
    } else if (char === '!') {
      cursor += 2;
      column += 2;
      leftRegexp();
      return {
        type: REGEXP,
        value: '/' + text.slice(cur + 1, cursor),
        expr: ['regexp!', value],
        start: cur,
        stop: cursor,
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
        return {
          type: t,
          value: text.slice(cur, cursor)
        };
      } else {
        return {
          type: SYMBOL,
          value: "/",
          cursor: cur,
          line: line,
          indent: ind
        };
      }
    } else {
      return {
        type: CODE_BLOCK_COMMENT_LEAD_SYMBOL,
        value: "/",
        cursor: cur,
        line: line,
        column: col,
        indent: ind
      };
    }
  };
  getMaybeConcatLine = function() {
    var lexIndent, lexRow;
    cursor++;
    lexRow++;
    if (char === '\n') {
      cursor++;
      lexRow = 0;
      if (char === '\r') {
        cursor++;
      }
      leftSpaceToken();
      if (lexRow < lexIndent && char && char !== '\n' && char !== '\r') {
        lexError('should not intent less in concatenated line');
      }
      lexIndent = lexRow;
      char = text[cursor];
      return {
        type: SPACE,
        value: text.slice(cur, cursor),
        concatLine: true
      };
    } else if (char === '\r') {
      cursor++;
      lexRow = 0;
      if (char === '\n') {
        cursor++;
      }
      leftSpaceToken();
      if (lexRow < lexIndentt && char && char !== '\n' && char !== '\r') {
        lexError('should not intent less in concatenated line');
      }
      lexIndent = lexRow;
      return {
        type: SPACE,
        value: text.slice(cur, cursor),
        concatLine: true
      };
    } else {
      return leftSymbolToken('\\');
    }
  };
  tokenOnNewlineChar = function() {
    var col, cur, ind, line, type;
    cur = cursor;
    line = lineno;
    col = column;
    ind = indent;
    char = text[cursor + 1];
    if (char === '\n' || char === '\r') {
      cursor += 2;
    } else {
      cursor++;
    }
    char = text[cursor];
    skipSpaceLines(ind);
    if (indent > ind) {
      type = INDENT;
    } else if (indent === ind) {
      type === NEWLINE;
    } else {
      type = UNDENT;
    }
    return newToken({
      type: INDENT,
      value: text.slice(cur, cursor),
      cursor: cur,
      line: line,
      column: col,
      indent: ind,
      stopIndent: indent
    });
  };
  tokenOnNumberChar = function() {
    var baseStart, c2, col, cur, dotCursor, meetDigit, value;
    cur = cursor;
    col = column;
    base = 10;
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
        column += cursor - cur;
        return newToken({
          type: NUMBER,
          value: text.slice(cur, cursor),
          expr: 0,
          cursor: cur,
          line: lineno,
          column: col,
          indent: indent
        });
      } else {
        return newToken({
          type: NUMBER,
          value: (value = text.slice(baseStart, cursor)),
          expr: parseInt(value, base),
          cursor: cur,
          line: lineno,
          column: col,
          indent: indent
        });
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
      column += cursor - cur;
      return newToken({
        type: NUMBER,
        value: (value = text.slice(baseStart, cursor)),
        expr: parseInt(value, base),
        cursor: cur,
        line: lineno,
        column: col,
        indent: indent
      });
    }
    if (char === 'e' || char === 'E') {
      char = text[++cursor];
      if (char === '+' || char === '-') {
        char = text[++cursor];
        if (!char || char < '0' || '9' < char) {
          cursor = dotCursor;
          char = text[cursor];
          column += cursor - cur;
          return newToken({
            type: NUMBER,
            value: (value = text.slice(cur, dotCursor)),
            expr: parseInt(value, base),
            cursor: cur,
            line: lineno,
            column: col,
            indent: indent
          });
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
        column += cursor - cur;
        return newToken({
          type: NUMBER,
          value: (value = text.slice(cur, dotCursor)),
          expr: parseInt(value, base),
          cursor: cur,
          line: lineno,
          column: col,
          indent: indent
        });
      } else {
        while (char) {
          if (char < '0' || '9' < char) {
            break;
          }
          char = text[++cursor];
        }
      }
    }
    column += cursor - cur;
    return newToken({
      type: NUMBER,
      value: (value = text.slice(cur, cursor)),
      expr: parseFloat(value, base),
      cursor: cur,
      line: lineno,
      column: col,
      indent: indent
    });
  };
  tokenOnDoubleQuoteChar = function() {};
  tokenOnSingleQuoteChar = function() {};
  tokenOnLeftBracketChar = function() {};
  tokenOnLeftCurveChar = function() {};
  tokenOnRightDelimiterChar = function() {};
  tokenOnLeftParenChar = function(c) {
    return {
      value: c,
      type: c,
      lineno: lexLineno,
      cursor: cursor,
      length: 1,
      col: lexCol
    };
  };
  tokenOnPunctChar = tokenOnLeftParenChar;
  tokenOnDoubleQuoteChar = function(c) {
    if (text[cursor + 1] === '"') {
      if ([cursor + 2] === '"') {
        return parseRawInterpolateString();
      } else {
        return {
          value: '""',
          type: '"',
          lineno: lexLineno,
          cursor: cursor,
          length: 1,
          col: lexCol
        };
      }
    } else {
      return parseInterpolatedString();
    }
  };
  tokenOnDoubleQuoteChar = function(c) {
    if (text[cursor + 1] === "'") {
      if ([cursor + 2] === "'") {
        return parseRawNonInterpolateString();
      } else {
        return {
          value: '""',
          type: "'",
          lineno: lexLineno,
          cursor: cursor,
          length: 1,
          col: lexCol
        };
      }
    } else {
      return parseNonInterpolatedString();
    }
  };
  tokenFnMap = makeTokenFnMap();
  tokenOnIdentifierChar = function() {
    var col, cur, type, value;
    cur = cursor;
    char = text[++cursor];
    col = column;
    while (char && identifierCharSet[char]) {
      char = text[++cursor];
    }
    value = text.slice(cur, cursor);
    column += cursor - cur;
    if (keywordMap[value]) {
      type = KEYWORD;
    } else if (conjMap[value]) {
      type = CONJUNCTION;
    } else {
      type = IDENTIFIER;
    }
    return newToken({
      type: type,
      value: value,
      cursor: cur,
      line: lineno,
      column: col,
      indent: indent
    });
  };
  for (c in firstIdentifierCharSet) {
    tokenFnMap[c] = tokenOnIdentifierChar;
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
    var cur, line1, matcherList, matcherName, x, _i, _len;
    matcherList = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    cur = cursor;
    line1 = lineno;
    for (_i = 0, _len = matcherList.length; _i < _len; _i++) {
      matcherName = matcherList[_i];
      if (!(x = parser[matcherName]())) {
        break;
      }
    }
    cursor = cur;
    lineno = line1;
    return x;
  };
  this.followOneOf = function() {
    var cur, line1, matcherList, matcherName, x, _i, _len;
    matcherList = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    cur = cursor;
    line1 = lineno;
    for (_i = 0, _len = matcherList.length; _i < _len; _i++) {
      matcherName = matcherList[_i];
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
  this.decimal = decimal = memo(function() {
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
  });
  nonInterpolatedStringLine = function(quote, quoteLength) {
    var result, x;
    result = '';
    while (c = text[cursor]) {
      if (text.slice(cursor, cursor + quoteLength) === quote) {
        return result;
      } else if (x = newline()) {
        return result + escapeNewLine(x.value);
      } else if (c === '\\') {
        result += '\\';
        cursor++;
        if (x = newline()) {
          return result + escapeNewLine(x.value);
        } else if (c = text[cursor]) {
          result += c;
        } else {
          return result;
        }
      } else if (c === '"') {
        result += '\\"';
      } else {
        result += c;
      }
      ++cursor;
    }
    return error('unexpected end of input while parsing non interpolated string');
  };
  this.nonInterpolatedString = function() {
    var cur, indentCol, line1, myIndent, myLineInfo, quote, quoteLength;
    if (text.slice(cursor, cursor + 3) === "'''") {
      quote = "'''";
      quoteLength = 3;
    } else if (text[cursor] === "'") {
      quote = "'";
      quoteLength = 1;
    } else {
      return;
    }
    cur = cursor;
    line1 = lineno;
    indentCol = null;
    if (cursor = indent) {
      indentCol = indent;
    }
    cursor += quoteLength;
    str = '';
    while (text[cursor]) {
      if (text.slice(cursor, cursor + quoteLength) === quote) {
        cursor += quoteLength;
        return {
          type: NON_INTERPOLATE_STRING,
          value: '"' + str + '"',
          start: cur,
          stop: cursor,
          line1: line1,
          line: lineno
        };
      }
      if (lineInfo[lineno].empty) {
        str += nonInterpolatedStringLine(quote, quoteLength);
        continue;
      } else if (lineno !== line1) {
        myLineInfo = lineInfo[lineno];
        myIndent = myLineInfo.indentCol;
        if (indentCol === null) {
          indentCol = myIndent;
        } else if (myIndent < indentCol) {
          error('wrong indent in string');
        }
        cursor += indentCol;
      }
      str += nonInterpolatedStringLine(quote, quoteLength);
    }
    if (!text[cursor]) {
      return error('expect ' + quote + ', unexpected end of input while parsing interpolated string');
    }
  };
  interpolateStringPiece = function(quote, quoteLength, indentCol, lineIndex) {
    var c2, myIndent, x;
    str = '"';
    while (char = text[cursor]) {
      if (text.slice(cursor, cursor + quoteLength) === quote) {
        return str + '"';
      } else if (char === '"') {
        if (char !== quote) {
          str += '\\"';
          cursor++;
        } else {
          return str(+'\\"');
        }
      } else if (x = newline()) {
        if (!lineInfo[lineno].empty && (myIndent = lineInfo[lineno].indentCol) && lineIndex.value++) {
          if (indentCol.value === null) {
            indentCol.value = myIndent;
          } else if (myIndent !== indentCol.value) {
            error('wrong indent in string');
          } else {
            cursor += myIndent;
          }
        }
        return str + escapeNewLine(x) + '"';
      } else if (char === '(' || char === '{' || char === '[') {
        return str + char + '"';
      } else if (char === '$') {
        return str + '"';
      } else if (char === '\\') {
        if (!(c2 = text[cursor + 1])) {
          break;
        } else if (c2 === '\n' || c2 === '\r') {
          cursor++;
          str += '\\';
        } else {
          cursor += 2;
          str += '\\' + c2;
        }
      } else {
        str += char;
        cursor++;
      }
    }
    return error('unexpected end of input while parsing interpolated string');
  };
  this.interpolatedString = function() {
    var cur, indentCol, line1, lineIndex, literalStart, pieces, quote, quoteLength, x;
    if (text.slice(cursor, cursor + 3) === '"""') {
      quote = '"""';
      quoteLength = 3;
    } else if (text[cursor] === '"') {
      quote = '"';
      quoteLength = 1;
    } else {
      return;
    }
    cur = cursor;
    line1 = lineno;
    indentCol = null;
    if (column === indent) {
      indentCol = {
        value: col
      };
    } else {
      indentCol = {};
    }
    cursor += quoteLength;
    pieces = [];
    lineIndex = {
      value: 0
    };
    while (char = text[cursor]) {
      if (text.slice(cursor, cursor + quoteLength) === quote) {
        cursor += quoteLength;
        return {
          type: INTERPOLATE_STRING,
          value: ['string!'].concat(pieces),
          start: cur,
          stop: cursor,
          line1: line1,
          line: lineno
        };
      }
      if (char === '$') {
        literalStart = cursor++;
        x = parser.interpolateExpression();
        if (x) {
          x = getOperatorExpression(x);
          if (text[cursor] === ':') {
            cursor++;
            pieces.push(text.slice(literalStart, cursor));
          }
          pieces.push(x);
        } else {
          pieces.push('"$"');
        }
      } else if (char === '(' || char === '{' || char === '[') {
        if (x = parser.delimiterExpression('inStrExp')) {
          pieces.push(getOperatorExpression(x));
          if (char === '(') {
            pieces.push('")"');
          } else if (char === '[') {
            pieces.push('"]"');
          } else if (char === '{') {
            pieces.push('"}"');
          }
        } else {
          pieces.push('"' + char + '"');
        }
      } else {
        pieces.push(interpolateStringPiece(quote, quoteLength, indentCol, lineIndex));
      }
    }
    if (!text[cursor]) {
      return error('expect ' + quote + ', unexpected end of input while parsing interpolated string');
    }
  };
  this.paren = paren = function() {
    var col, cur, exp, line, start, type;
    cur = cursor;
    line = lineno;
    col = column;
    cursor++;
    column++;
    start = token;
    matchToken();
    if ((type = token.type) === UNDENT) {
      error('unexpected undent while parsing parenethis "(...)"');
    } else if (type === SPACE || type === NEWLINE || type === INDENT) {
      matchToken();
    }
    exp = parser.operatorExpression();
    if ((type = token.type) === UNDENT) {
      if (token.stopIndent < start.indent) {
        error('expect ) indent equal to or more than (');
      } else {
        matchToken();
      }
    } else if (token.value !== ')') {
      error('expect )');
    } else {
      matchToken();
    }
    token = {
      type: PAREN,
      value: text.slice(cur, cursor),
      expr: exp,
      cursor: cur,
      line: lineno,
      column: col
    };
    start.next = token;
    return start;
  };
  curveVariantMap = {
    '.': function() {
      matchToken();
      return hash();
    }
  };
  this.curve = curve = function() {
    var body, col, cur, curveVariantFn, ind, line, start;
    cur = cursor;
    cursor++;
    line = lineno;
    col = column;
    column++;
    ind = indent;
    start = token;
    matchToken();
    if ((curveVariantFn = curveVariantFnMap[token.value])) {
      return curveVariantFn();
    }
    if (token.value === '}') {
      matchToken();
      token = {
        value: text.slice(cur, cursor),
        expr: ['hash!'],
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
    return extend(body, {
      type: CURVE,
      start: start,
      stop: cursor,
      line1: line1,
      line: lineno
    });
  };
  bracketVariantMap = {};
  this.bracket = bracket = function() {
    var col, cur, expList, ind, line, racketVariantFn, start;
    cur = cursor;
    cursor++;
    line = lineno;
    col = column;
    column++;
    ind = indent;
    start = token;
    matchToken();
    if ((racketVariantFn = bracketVariantMap[token.value])) {
      return racketVariantFn();
    }
    cur = token;
    if (token.value !== '[') {
      return;
    }
    matchToken();
    expList = parser.lineBlock();
    bigSpace();
    if (token.indent < start.indent) {
      error('unexpected undent while parsing parenethis "[...]"');
    }
    if (text[cursor] !== ']') {
      error('expect ]');
    } else {
      cursor++;
    }
    if (expList) {
      expList.unshift('list!');
    } else {
      expList = [];
    }
    return wrapResult(expList, {
      type: BRACKET,
      isBracket: true,
      start: cur,
      stop: cursor,
      line1: line1,
      line: lineno
    });
  };
  this.hashItem = memo(function() {
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
  });
  this.hashBlock = memo(function() {
    var col, column1, cur, indentCol, line1, result, spac, space2, x;
    cur = cursor;
    line1 = lineno;
    column1 = lineInfo[lineno].indentCol;
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
  });
  this.hash = memo(function() {
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
  });
  this.delimiterExpression = memo(function() {
    return parser.paren() || parser.dataBracket() || parser.bracket() || parser.curve() || parser.hash();
  });
  this.escapeSymbol = escapeSymbol = function() {
    var cur, line1, sym;
    cur = cursor;
    line1 = lineno;
    if (text[cursor] !== '\\') {
      return;
    }
    cursor++;
    sym = parser.symbol();
    if (!sym) {
      return rollback(cur, line1);
    } else {
      sym.start = cur;
      sym.escape = true;
      return sym;
    }
  };
  this.escapeStringSymbol = function() {
    if (token.value !== "\\") {
      return;
    }
    matchToken();
    if (token.type !== NON_INTERPOLATED_STRING) {
      return;
    }
    if (isMultipleLines(token)) {
      rollback(cur);
    }
    matchToken();
    return wrapResult(['symbol!', token], {
      type: SYMBOL,
      escape: true,
      start: cur,
      stop: token
    });
  };
  this.delimiterCharset = charset('|\\//:');
  this.rightDelimiter = function(delimiter) {
    var cur;
    cur = cursor;
    if (text.slice(cursor, cursor + 2) === '.}') {
      cursor += 2;
      return '.}';
    }
    while ((c = text[cursor]) && parser.delimiterCharset[c]) {
      cursor++;
    }
    if (c !== ')' && c !== ']' && c !== '}') {
      cursor = cur;
      return;
    }
    cursor++;
    if (delimiter) {
      if (text.slice(cur, cursor) !== delimiter) {
        cursor = cur;
      } else {
        return delimiter;
      }
    } else {
      return text.slice(cur, cursor);
    }
  };
  this.symbolOrIdentifier = function() {
    return parser.symbol() || parser.identifier();
  };
  atomTokenTypes = dict(IDENTIFIER, 1, NUMBER, 1, REGEXP, 1, CURVE, 1, HASH, 1, BRACKET, 1, PAREN, 1, SYMBOL, 1);
  this.atom = function(mode) {
    var atomToken;
    if (atomTokenTypes[token.type]) {
      atomToken = token;
      nextToken();
      atomToken.priority = 1000;
      return atomToken;
    }
  };
  this.prefixOperator = function(mode) {
    var op, opToken, priInc, tokenValue, type;
    tokenValue = token.value;
    if (!hasOwnProperty.call(prefixOperatorDict, tokenValue) || !(op = prefixOperatorDict[tokenValue])) {
      return;
    }
    if (token.escaped) {
      return;
    }
    opToken = token;
    matchToken();
    if (tokenValue === '.') {
      matchToken();
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
    } else if ((tokenValue = token.value) === ")" || tokenValue === ']' || tokenValue === "}") {
      error('unexpected ' + tokenValue + ' after prefix operator');
    } else if (type === SPACE) {
      matchToken();
      priInc = 300;
    } else {
      priInc = 600;
    }
    opToken.symbol = op.symbol;
    opToken.value = op.priority + priInc;
    return wrapResult(opToken, {
      start: opToken,
      token: token
    });
  };
  canFollowSuffix = function() {
    var type, value;
    if ((type = token.type) === SPACE || type === INDENT || type === UNDENT || type === NEWLINE || type === SYMBOL || type === EOI) {
      return true;
    }
    if ((value = token.value) === ')' || value === ']' || value === '}' || value === ':' || value === ',' || value === ';') {
      return true;
    }
    if (type === IDENTIFIER) {
      return false;
    }
  };
  this.suffixOperator = function(mode, x) {
    var op, opToken;
    if (token.type !== SYMBOL) {
      return;
    }
    if ((op = suffixOperatorDict[token.value])) {
      token.symbol = op.symbol;
      token.priority = op.priority + 600;
      opToken = token;
      matchToken();
      if (canFollowSuffix()) {
        return wrapResult(opToken, {
          start: opToken
        });
      } else {
        token = opToken;
      }
    }
  };
  canFollowSufix = function() {
    var t;
    return (t = token.type) === SPACE || t === RIGHT_DELIMITER || t === PUNCTUATION || t === EOI;
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
  parser.expressionEnd = function(mode, spac) {
    if (!parser.isClauseExpression(mode)) {
      return;
    }
    return (c = text[cursor]) === ':' && text[cursor + 1] !== ':' || parser.clauseEnd(spac) || (mode === 'comClExp' && spac.value) || (mode === 'inStrExp' && (c === "'" || c === '"'));
  };
  parser.isClauseExpression = function(mode) {
    return mode === 'comClExp' || mode === 'spClExp' || mode === 'inStrExp';
  };
  binaryOperatorMemoIndex = memoIndex;
  memoIndex += 4;
  this.binaryOperator = function(mode, x) {
    var m, op;
    if (m = token[binaryOperatorMemoIndex + mode]) {
      token = m.next;
      return m.result;
    }
    if (token.type === EOI) {
      return;
    }
    op = binaryDictOperator(mode, x) || parser.customBinaryOperator(mode, x);
    token[binaryOperatorMemoIndex + mode] = {
      result: op,
      next: token
    };
    return op;
  };
  binaryDictOperator = function(mode, x) {
    var op, opToken, opValue, pri, priInc, start, type, type1, value2;
    start = token;
    if ((type1 = token.type) === SPACE) {
      if (mode === COMPACT_CLAUSE_EXPRESSION || mode === INTERPOLATE_EXPRESSION) {
        return;
      }
      priInc = 300;
      matchToken();
    } else if (type1 === NEWLINE || type1 === INDENT || type1 === UNDENT) {
      if (mode !== OPERATOR_EXPRESSION) {
        return;
      }
      priInc = 0;
      matchToken();
    } else {
      priInc = 600;
      if (token.value === '.') {
        matchToken();
      }
    }
    opValue = token.value;
    if (!hasOwnProperty.call(binaryOperatorDict, opValue) || !(op = binaryOperatorDict[opValue])) {
      token = start;
      return;
    }
    opToken = token;
    matchToken();
    value2 = token.value;
    if (value2 === '.') {
      if (priInc === 600) {
        error('unexpected "." after binary operator ' + opToken.value + ', here should be spaces, comment or newline');
      } else {
        matchToken();
      }
    }
    if (parser.expressionEnd(mode)) {
      token = start;
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
        } else if ((c = text[cursor]) === ';') {
          error('unexpected ;');
        } else {
          error('unexpected spaces or new lines after binary operator "' + op.value + '" before which there is no space.');
        }
      }
      pri = op.priority + priInc;
      return extend({}, op, {
        priority: pri
      });
    } else if (priInc === 300) {
      if (type === UNDENT) {
        error('unexpceted undent after binary operator ' + op.value);
      } else if (type === NEWLINE) {
        priInc = 0;
      } else if (type === INDENT) {
        priInc = 0;
        indentExpression();
      } else if (type !== SPACE) {
        if (mode === OPERATOR_EXPRESSION) {
          error('binary operator ' + op.value + ' should have spaces at its right side.');
        } else {
          token = start;
        }
      }
      pri = op.priority + priInc;
      return extend({
        priority: pri
      }, op);
    } else {
      if (opValue === ',' || opValue === ':' || opValue === '%' || op.assign) {
        error('binary operator ' + op.symbol + ' should not be at begin of line');
      }
      if (type === UNDENT) {
        error('binary operator should not be at end of block');
      } else if (type === NEWLINE) {
        error('a single binary operator should not occupy whole line.');
      }
      if (type1 === INDENT) {
        priInc = 0;
        indentExpression();
      }
      return extend({
        priority: 300
      }, op);
    }
  };
  indentExpression = function() {
    var indentExp, indentStart, tkn, type;
    indentStart = token;
    indentExp = parser.recursiveExpression(mode, 0, true);
    tkn = matchToken();
    if ((type = tkn.type) !== UNDENT && type !== EOI && type.value !== ')') {
      error('expect an undent after a indented block expression');
    }
    indentExp.priority = 1000;
    matchToken();
    return token = indentStart;
  };
  this.followParenArguments = function() {
    var line1, start, x;
    start = cursor;
    line1 = lineno;
    x = paren();
    rollback(start, line1);
    return x;
  };
  this.binaryCallOperator = function(mode, x) {
    if (token.type === PAREN) {
      return {
        symbol: 'call()',
        type: SYMBOL,
        priority: 800,
        start: start
      };
    }
  };
  this.binaryMacroCallOperator = function(mode, x) {
    var start;
    if (token.value !== '#') {
      return;
    }
    start = token;
    nextToken();
    if (token.type !== PAREN()) {
      token = start;
      return;
    }
    return {
      symbol: '#()',
      type: SYMBOL,
      priority: 800,
      start: start
    };
  };
  this.binaryIndexOperator = function(mode, x) {
    if (token.type === BRACKET) {
      return {
        symbol: 'index[]',
        type: SYMBOL,
        priority: 800,
        start: start
      };
    }
  };
  this.binaryAttributeOperator = function(mode, x) {
    var start;
    if (token.type === SPACE) {
      start = token;
      nextToken();
      if (token.value !== '.') {
        token = start;
        return;
      }
      nextToken();
      if (token.type !== SPACE) {
        error('expect spaces after "." because there are spaces before it');
      }
      return {
        symbol: 'attribute!',
        type: SYMBOL,
        priority: 500
      };
    } else if (token.value === '.') {
      nextToken();
      if (token.type === SPACE) {
        error('unexpected spaces after "." because there are no space before it');
      }
      return {
        symbol: 'attribute!',
        type: SYMBOL,
        priority: 800
      };
    }
  };
  this.binaryAtThisAttributeIndexOperator = function(mode, x) {
    if (x.stop !== token) {
      return;
    }
    if (follow('jsIdentifier')) {
      return {
        symbol: 'attribute!',
        type: SYMBOL,
        start: cursor,
        stop: cursor,
        line: lineno,
        priority: 800
      };
    } else if (follow('bracket')) {
      return {
        symbol: 'index!',
        type: SYMBOL,
        start: cursor,
        stop: cursor,
        line: lineno,
        priority: 800
      };
    }
  };
  this.binaryPrototypeAttributeOperator = function(mode, x) {
    var cur;
    if ((x.type === IDENTIFIER || x.value === '@') && token.value === '::') {
      return {
        symbol: 'attribute!',
        type: SYMBOL,
        start: cursor,
        stop: cursor,
        line: lineno,
        priority: 800
      };
    } else if ((cur = token.cursor) && text[cur - 3] !== ':' && text.slice(cur - 2, cur) === '::') {
      return {
        symbol: 'attribute!',
        type: SYMBOL,
        start: cursor,
        stop: cursor,
        line: lineno,
        priority: 800
      };
    }
  };
  this.customBinaryOperators = [this.binaryAttributeOperator, this.binaryCallOperator, this.binaryMacroCallOperator, this.binaryIndexOperator, this.binaryAtThisAttributeIndexOperator, this.binaryPrototypeAttributeOperator];
  this.customBinaryOperator = function(mode, x) {
    var fn, op, _i, _len, _ref3;
    _ref3 = parser.customBinaryOperators;
    for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
      fn = _ref3[_i];
      if (op = fn(mode, x)) {
        return op;
      }
    }
  };
  this.prefixExpression = function(mode, priority) {
    var op, pri, start, x;
    start = token;
    if (op = parser.prefixOperator(mode)) {
      pri = priority > op.priority ? priority : op.priority;
      x = parser.recursiveExpression(mode, pri, true);
      if (x) {
        return wrapResult(makeOperatorExpression('prefix!', op, x), {
          start: start,
          stop: token
        });
      }
    }
  };
  recursiveExpressionMemoIndex = memoIndex;
  memoIndex += 4;
  this.recursiveExpression = recursive = function(mode, priority, leftAssoc) {
    var expression, result, start, x;
    if (result = token[memoIndex + mode]) {
      token = result.next;
      return result.value;
    }
    start = token;
    x = null;
    expression = function() {
      var op, y;
      if (!x) {
        if (!(x = parser.prefixExpression(mode, priority))) {
          if (!(x = parser.atom(mode))) {
            start[memoIndex] = {
              value: null,
              next: token
            };
            return;
          }
        }
      }
      if ((op = parser.suffixOperator(mode, x)) && op.priority >= priority) {
        x = wrapResult(makeOperatorExpression('suffix!', op, x), {
          start: start,
          stop: token
        });
      }
      if ((op = parser.binaryOperator(mode, x)) && ((leftAssoc && op.priority > priority) || (!leftAssoc && op.priority >= priority))) {
        y = recursive(mode, op.priority, !op.rightAssoc);
        x = wrapResult(makeOperatorExpression('binary!', op, x, y), {
          start: start,
          stop: token
        });
        return expression();
      }
      start[memoIndex + mode] = {
        value: x,
        next: token
      };
      return x;
    };
    return expression();
  };
  this.operatorExpression = operatorExpression = function() {
    return parser.recursiveExpression(OPERATOR_EXPRESSION, 0, true);
  };
  this.compactClauseExpression = function() {
    return parser.recursiveExpression(COMPACT_CLAUSE_EXPRESSION, 600, true);
  };
  this.spaceClauseExpression = spaceClauseExpression = function() {
    return parser.recursiveExpression(SPACE_CLAUSE_EXPRESSION, 300, true);
  };
  this.interpolateExpression = function() {
    return parser.recursiveExpression(INTERPOLATE_EXPRESSION, 600, true);
  };
  this.isIdentifier = isIdentifier = function(item) {
    return item.type === IDENTIFIER;
  };
  this.itemToParameter = itemToParameter = function(item) {
    var item0, item1, item10;
    if (item.type === IDENTIFIER) {
      return item;
    } else if (item0 = item[0]) {
      if (item0 === 'attribute!' && item[1].value === '@') {
        return item;
      } else if (item0.symbol === 'x...') {
        parser.meetEllipsis = item[1].ellipsis = true;
        return item;
      } else if (entity(item0) === '=') {
        if ((item1 = item[1]) && item1.type === IDENTIFIER) {
          return item;
        } else if ((item10 = item1[0]) && item10 === 'attribute!' && item1[1].value === '@') {
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
        var _i, _len, _ref3, _results;
        _ref3 = item.slice(1);
        _results = [];
        for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
          x = _ref3[_i];
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
  leadWordClauseMap = {
    '%%': function(clause) {
      var code;
      code = compileExp(['return', clause], environment);
      return new Function('__$taiji_$_$parser__', code)(parser);
    },
    '%/': function(clause) {
      var code;
      code = compileExp(['return', ['%/', clause]], environment);
      return new Function('__$taiji_$_$parser__', code)(parser);
    },
    '%!': function(clause) {
      var code;
      code = compileExp(['return', ['%!', clause]], environment);
      return new Function('__$taiji_$_$parser__', code)(parser);
    },
    '~': function(clause) {
      return ['quote!', clause];
    },
    '`': function(clause) {
      return ['quasiquote!', clause];
    },
    '^': function(clause) {
      return ['unquote!', clause];
    },
    '^&': function(clause) {
      return ['unquote-splice', clause];
    },
    '#': function(clause) {
      return ['#', clause];
    },
    '##': function(clause) {
      return ['##', clause];
    },
    '#/': function(clause) {
      return ['#/', clause];
    },
    '#-': function(clause) {
      return ['#/', clause];
    },
    '#&': function(clause) {
      return ['#&', clause];
    }
  };
  this.leadWordClause = function() {
    var clause, fn, key, line1, spac, start;
    start = cursor;
    line1 = lineno;
    if (!(key = parser.symbol() || parser.identifier())) {
      return;
    }
    if ((spac = space()) && (!spac.value || spac.undent)) {
      return rollback(start, line1);
    }
    if (!(fn = leadWordClauseMap[key.value])) {
      return rollback(start, line1);
    }
    clause = fn(parser.clause());
    if (clause && typeof clause === 'object') {
      return extend(clause, {
        start: start,
        stop: cursor,
        line1: line1,
        line: lineno
      });
    } else {
      return extend({
        value: clause
      }, {
        start: start,
        stop: cursor,
        line1: line1,
        line: lineno
      });
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
    if ((spac = bigSpace()) && (!spac.value || spac.undent || spac.newline)) {
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
    if ((x = symbol() || taijiIdentifier()) && isConj(x)) {
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
    meetWord = w && w.value === word;
    if (!meetWord) {
      if (isConj(w)) {
        if (optionalClause) {
          rollbackToken(spac);
          return;
        } else {
          error('unexpected ' + w.value + ', expect ' + word + ' clause');
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
    if (sym && (symValue = sym.value) !== '#' && symValue !== '#/') {
      error('unexpected symbol after "as" in import! statement');
    }
    name = parser.identifier();
    if (name) {
      if (name.value === 'from') {
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
      if (as_.value === 'from') {
        as_ = void 0;
        rollback(start1, line2);
      } else if (as_.value !== 'as') {
        error('unexpected word ' + as_.value + ', expect "as", "," or "from [module path...]"');
      } else {
        space();
        sym2 = parser.symbol();
        if (sym2 && (symValue2 = sym2.value) !== '#' && symValue2 !== '#/') {
          error('unexpected symbol after "as" in import! statement');
        }
        if (symValue === '#/') {
          if (symValue2 === '#') {
            error('expect "as #/alias" or or "as alias #alias2" after "#/' + name.value + '"');
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
            error('expect # after "#/' + name.value + ' as ' + asName.value + '"');
          } else if (sym3.value !== '#') {
            error('unexpected ' + sym3.value + ' after "#/' + name.value + 'as ' + asName.value + '"');
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
      if (!space().value) {
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
      var alias, alias2, as_, from_, item, items, metaAlias, metaImportList, parseMethod, runtimeImportList, srcModule, sym, sym2, symValue, x, _i, _j, _len, _len1;
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
          if ((symValue = sym.value) !== '#' && sym.value !== '#/') {
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
      for (_i = 0, _len = items.length; _i < _len; _i++) {
        item = items[_i];
        for (_j = 0, _len1 = item.length; _j < _len1; _j++) {
          x = item[_j];
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
  this.statement = memo(function() {
    var isHeadStatement, keyword, line1, start, stmt, stmtFn;
    start = cursor;
    line1 = lineno;
    if (!(keyword = symbol() || taijiIdentifier())) {
      return;
    }
    if (stmtFn = parser.keywordToStatementMap[keyword.value]) {
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
  });
  this.defaultAssignLeftSide = memo(function() {
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
    } else if (x.value === '::') {
      return x;
    } else if (parser.isAssign(x[0])) {
      rollback(x[1].stop, x[1].line);
      return x[1];
    } else {
      rollback(start, line1);
    }
  });
  this.isAssign = function(val) {
    var op;
    return (op = binaryOperatorDict[val]) && op.assign;
  };
  this.defaultAssignSymbol = function() {
    var x;
    return (x = parser.symbol()) && parser.isAssign(x.value) && x;
  };
  this.defaultAssignRightSide = memo(function() {
    var space2;
    space2 = bigSpace();
    if (space2.undent) {
      error('unexpected undent after assign symbol' + symbol.value);
    } else if (space2.newline) {
      error('unexpected new line after assign symbol' + symbol.value);
    }
    return parser.block() || parser.clause();
  });
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
  this.assignClause = memo(function() {
    var matcher, x, _i, _len, _ref3;
    _ref3 = parser.customAssignClauses;
    for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
      matcher = _ref3[_i];
      if (x = matcher()) {
        return x;
      }
    }
    return parser.defaultAssignClause();
  });
  this.colonClause = memo(function() {
    var line1, result, spac, start, x;
    start = cursor;
    line1 = lineno;
    if (!(result = parser.sequenceClause())) {
      return;
    }
    space();
    if ((x = parser.symbol()) && x.value === ':') {
      spac = bigSpace();
      if (spac.newline) {
        error('":" should not before a new line');
      } else if (spac.undent) {
        error('":" should not be before undent');
      } else if (spac.indent) {
        result.colonAtEndOfLine = true;
        return result;
      }
      if (!result.push || result.isBracket) {
        result = [result];
      }
      result.push.apply(result, parser.clauses());
      result.stop = cursor;
      result.line = lineno;
      return result;
    } else {
      return rollback(start, line1);
    }
  });
  this.indentClause = memo(function() {
    var blk, head, line1, spac, start;
    start = cursor;
    line1 = lineno;
    if (!(head = parser.sequenceClause())) {
      return;
    }
    spac = bigSpace();
    if (!spac.indent) {
      return rollback(start, line1);
    }
    if (parser.lineEnd()) {
      return rollback(start, line1);
    }
    if (!(blk = parser.blockWithoutIndentHead())) {
      return rollback(start, line1);
    }
    if (!head.push) {
      head = [head];
      head.start = start;
      head.line1 = line1;
    }
    head.push.apply(head, blk);
    return extend(head, {
      stop: cursor,
      line: lineno
    });
  });
  this.macroCallClause = memo(function() {
    var args, blk, head, line1, spac, space1, start;
    start = cursor;
    line1 = lineno;
    if ((head = parser.compactClauseExpression())) {
      if ((space1 = space()) && !space1.value) {
        return rollback(start, line1);
      }
      if (text[cursor] === '#' && cursor++ && ((spac = space()) && spac.value || text[cursor] === '\n' || text[cursor] === '\r')) {
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
  });
  this.unaryExpressionClause = memo(function() {
    var head, line1, start, x;
    start = cursor;
    line1 = lineno;
    if ((head = parser.compactClauseExpression()) && space() && (x = parser.spaceClauseExpression()) && parser.clauseEnd()) {
      if (text[cursor] === ',') {
        cursor++;
      }
      return extend([getOperatorExpression(head), getOperatorExpression(x)], {
        start: start,
        stop: cursor,
        line1: line1,
        line: lineno
      });
    }
    return rollback(start, line1);
  });
  this.expressionClause = memo(function() {
    var line1, start, x;
    start = cursor;
    line1 = lineno;
    if ((x = parser.spaceClauseExpression())) {
      if (parser.clauseEnd()) {
        return getOperatorExpression(x);
      } else {
        return rollback(start, line1);
      }
    }
  });
  this.defaultParameterList = function() {
    var item, params;
    if (item = getOperatorExpression(paren(item))) {
      if (params = parser.toParameters(item)) {
        return params;
      } else {
        if (followSequence('inlineSpaceComment', 'defaultSymbolOfDefinition')) {
          return error('illegal parameters list for function definition');
        } else {
          return rollbackToken(item);
        }
      }
    }
  };
  this.defaultSymbolOfDefinition = function() {
    var x, xTail, xValue;
    if ((x = parser.symbol())) {
      if ((xValue = x.value) && xValue[0] !== '\\' && ((xTail = xValue.slice(xValue.length - 2)) === '->' || xTail === '=>')) {
        return x;
      } else {
        return rollbackToken(x);
      }
    }
  };
  this.defaultDefinitionBody = function() {
    return begin(parser.lineBlock()) || 'undefined';
  };
  this.makeDefinition = function(parameterList, symbolOfDefinition, definitionBody) {
    return memo(function() {
      var body, line1, parameters, start;
      start = cursor;
      line1 = lineno;
      if (!(parameters = parameterList())) {
        parameters = [];
      }
      space();
      if (!(token = symbolOfDefinition())) {
        return rollback(start, line1);
      }
      space();
      body = definitionBody();
      return extend([token, parameters, body], {
        start: start,
        stop: cursor,
        line1: line1,
        line: lineno
      });
    });
  };
  this.defaultDefinition = this.makeDefinition(this.defaultParameterList, this.defaultSymbolOfDefinition, this.defaultDefinitionBody);
  this.customDefinition = [];
  this.definition = memo(function() {
    var matcher, x, _i, _len, _ref3;
    _ref3 = parser.customDefinition;
    for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
      matcher = _ref3[_i];
      if (x = matcher()) {
        break;
      }
    }
    if (x || (x = parser.defaultDefinition())) {
      return x;
    }
  });
  this.clauseItem = function() {
    var item, line1, spac, start;
    start = cursor;
    line1 = lineno;
    spac = bigSpace();
    if (!spac.inline) {
      rollbackToken(spac);
      return;
    }
    if (parser.clauseEnd()) {
      return;
    }
    if (text[cursor] === ':' && text[cursor + 1] !== ':') {
      return;
    }
    if ((item = parser.definition())) {
      return item;
    }
    item = parser.compactClauseExpression();
    if (item) {
      return extend(getOperatorExpression(item), {
        start: start,
        stop: cursor,
        line1: line1,
        line: lineno
      });
    }
  };
  this.sequenceClause = memo(function() {
    var clause, item, line1, meetComma, start;
    start = cursor;
    line1 = lineno;
    clause = [];
    while (item = parser.clauseItem()) {
      clause.push(item);
    }
    if (text[cursor] === ',') {
      meetComma = true;
      cursor++;
    }
    if (!clause.length && !meetComma) {
      return;
    }
    return extend(clause, {
      start: start,
      stop: cursor,
      line1: line1,
      line: lineno
    });
  });
  this.customClauseList = ['statement', 'labelStatement', 'leadWordClause', 'assignClause', 'colonClause', 'macroCallClause', 'indentClause', 'expressionClause', 'unaryExpressionClause'];
  this.clause = memo(function() {
    var clause, line1, matcher, start, x, _i, _len, _ref3;
    start = cursor;
    line1 = lineno;
    if (parser.clauseEnd()) {
      return;
    }
    _ref3 = parser.customClauseList;
    for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
      matcher = _ref3[_i];
      if (x = parser[matcher]()) {
        return x;
      }
    }
    if (!(clause = parser.sequenceClause())) {
      return;
    }
    if (clause.length === 1) {
      clause = clause[0];
    }
    if (typeof clause !== 'object') {
      clause = {
        value: clause
      };
    }
    return extend(clause, {
      start: start,
      stop: cursor,
      line1: line1,
      line: lineno
    });
  });
  this.clauses = function() {
    var clause, result;
    result = [];
    while (clause = parser.clause()) {
      result.push(clause);
    }
    return result;
  };
  this.sentenceEnd = function(spac) {
    spac = spac || bigSpace();
    if (parser.lineEnd()) {
      return true;
    }
    if (!spac.inline) {
      rollbackToken(spac);
      return true;
    }
  };
  this.sentence = memo(function() {
    var line1, start;
    start = cursor;
    line1 = lineno;
    if (parser.sentenceEnd()) {
      return;
    }
    if (text[cursor] === ';') {
      cursor++;
      return [];
    }
    return extend(parser.clauses(), {
      start: start,
      stop: cursor,
      line1: line1,
      line: lineno
    });
  });
  this.lineCommentBlock = memo(function() {
    var comment, result, start;
    start = cursor;
    if (comment = parser.lineComment()) {
      if (comment.indent) {
        if (comment.value.slice(0, 3) === '///') {
          result = parser.blockWithoutIndentHead();
          result.unshift(['directLineComment!', comment.value]);
          return result;
        } else {
          return parser.blockWithoutIndentHead();
        }
      } else {
        if (text.slice(start, start + 3) === '///') {
          return [
            extend(['directLineComment!', comment.value], {
              start: start,
              stop: cursor,
              line: lineno
            })
          ];
        } else {
          return [
            extend(['lineComment!', comment.value], {
              start: start,
              stop: cursor,
              line: lineno
            })
          ];
        }
      }
    }
  });
  this.codeCommentBlockComment = memo(function() {
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
  });
  this.lineEnd = function() {
    return !text[cursor] || follow('conjunction') || follow('rightDelimiter');
  };
  this.line = function() {
    var result, x;
    if (parser.lineEnd()) {
      return;
    }
    if (x = parser.lineCommentBlock() || parser.codeCommentBlockComment()) {
      return x;
    }
    result = [];
    while (x = parser.sentence()) {
      result.push.apply(result, x);
    }
    return result;
  };
  this.block = function() {
    var indentCol, spac, x;
    indentCol = lineInfo[lineno].indentCol;
    spac = bigSpace();
    if (!spac.indent) {
      return rollbackToken(spac);
    } else {
      x = parser.blockWithoutIndentHead();
      spac = bigSpace();
      if (lineInfo[lineno].indentCol < indentCol) {
        rollbackToken(spac);
      }
      return x;
    }
  };
  this.blockWithoutIndentHead = function() {
    var indentCol, result, spac, x, x0;
    indentCol = lineInfo[lineno].indentCol;
    result = [];
    while ((x = parser.line()) && (spac = bigSpace())) {
      if (x.length !== 1 || !(x0 = x[0]) || (x0[0] !== 'lineComment!' && x0[0] !== 'codeBlockComment!')) {
        result.push.apply(result, x);
      }
      if (lineInfo[lineno].indentCol < indentCol) {
        rollbackToken(spac);
        break;
      }
    }
    return result;
  };
  this.lineBlock = function() {
    var cursor2, line, space1, space2;
    space1 = bigSpace();
    if (space1.indent) {
      return parser.blockWithoutIndentHead();
    }
    line = parser.line();
    cursor2 = cursor;
    space2 = bigSpace();
    if (indentCol <= indentCol1) {
      rollback(cursor2);
    } else {
      line.push.apply(line, parser.blockWithoutIndentHead());
    }
    return line;
  };
  this.moduleBody = function() {
    var body, spac, x;
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
      text: text.slice(0, cursor)
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
    column = 0;
    token = {};
    memoMap = {};
    atStatementHead = true;
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
