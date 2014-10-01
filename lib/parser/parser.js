var BLOCK_COMMENT, BRACKET, CODE_BLOCK_COMMENT, CONCAT_LINE, CURVE, C_BLOCK_COMMENT, DATA_BRACKET, EOI, FUNCTION, HALF_DENT, HEAD_SPACES, IDENTIFIER, INDENT, INDENT_EXPRESSION, INLINE_COMMENT, INTERPOLATE_STRING, LINE_COMMENT, MODULE, MODULE_HEADER, NEWLINE, NON_INTERPOLATE_STRING, NUMBER, PAREN, PUNCT, REGEXP, SPACE, SPACES, SPACES_INLINE_COMMENT, SPACE_COMMENT, STRING, SYMBOL, TAIL_COMMENT, UNDENT, base, begin, binaryOperatorDict, charset, compileExp, constant, digitCharSet, digitChars, entity, escapeNewLine, extend, firstIdentifierCharSet, firstIdentifierChars, getOperatorExpression, hasOwnProperty, identifierCharSet, identifierChars, isArray, isConj, isKeyword, letterCharSet, letterChars, letterDigitSet, makeOperatorExpression, prefixOperatorDict, str, suffixOperatorDict, taijiIdentifierCharSet, wrapInfo1, wrapInfo2, _ref, _ref1, _ref2,
  __slice = [].slice;

_ref = require('../utils'), charset = _ref.charset, isArray = _ref.isArray, wrapInfo1 = _ref.wrapInfo1, wrapInfo2 = _ref.wrapInfo2, str = _ref.str, entity = _ref.entity;

_ref1 = base = require('./base'), extend = _ref1.extend, firstIdentifierChars = _ref1.firstIdentifierChars, firstIdentifierCharSet = _ref1.firstIdentifierCharSet, letterDigitSet = _ref1.letterDigitSet, identifierChars = _ref1.identifierChars, digitCharSet = _ref1.digitCharSet, letterCharSet = _ref1.letterCharSet, identifierCharSet = _ref1.identifierCharSet, taijiIdentifierCharSet = _ref1.taijiIdentifierCharSet, constant = _ref1.constant;

digitChars = base.digits;

letterChars = base.letters;

NUMBER = constant.NUMBER, STRING = constant.STRING, IDENTIFIER = constant.IDENTIFIER, SYMBOL = constant.SYMBOL, REGEXP = constant.REGEXP, HEAD_SPACES = constant.HEAD_SPACES, CONCAT_LINE = constant.CONCAT_LINE, PUNCT = constant.PUNCT, FUNCTION = constant.FUNCTION, C_BLOCK_COMMENT = constant.C_BLOCK_COMMENT, PAREN = constant.PAREN, BRACKET = constant.BRACKET, DATA_BRACKET = constant.DATA_BRACKET, CURVE = constant.CURVE, INDENT_EXPRESSION = constant.INDENT_EXPRESSION, NEWLINE = constant.NEWLINE, SPACES = constant.SPACES, INLINE_COMMENT = constant.INLINE_COMMENT, SPACES_INLINE_COMMENT = constant.SPACES_INLINE_COMMENT, LINE_COMMENT = constant.LINE_COMMENT, BLOCK_COMMENT = constant.BLOCK_COMMENT, CODE_BLOCK_COMMENT = constant.CODE_BLOCK_COMMENT, CONCAT_LINE = constant.CONCAT_LINE, NON_INTERPOLATE_STRING = constant.NON_INTERPOLATE_STRING, INTERPOLATE_STRING = constant.INTERPOLATE_STRING, EOI = constant.EOI, INDENT = constant.INDENT, UNDENT = constant.UNDENT, HALF_DENT = constant.HALF_DENT, MODULE_HEADER = constant.MODULE_HEADER, MODULE = constant.MODULE, SPACE_COMMENT = constant.SPACE_COMMENT, TAIL_COMMENT = constant.TAIL_COMMENT, SPACE = constant.SPACE;

_ref2 = require('./operator'), prefixOperatorDict = _ref2.prefixOperatorDict, suffixOperatorDict = _ref2.suffixOperatorDict, binaryOperatorDict = _ref2.binaryOperatorDict, makeOperatorExpression = _ref2.makeOperatorExpression, getOperatorExpression = _ref2.getOperatorExpression;

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

exports.keywordMap = {
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

exports.conjMap = {
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
  var atStatementHead, atomTokenTypes, bigSpace, binaryDictOperator, bracketVariantMap, breakContinueStatement, c, canFollowSufix, caseClauseOfSwitchStatement, catchClause, char, clearMemo, column, conjClause, cursor, cursor2token, curve, curveVariantMap, decimal, elseClause, endCursorOfDynamicBlockStack, environment, eof, error, escapeSymbol, expect, expectChar, expectIdentifier, expectIndentConj, expectOneOfWords, expectWord, finallyClause, follow, followMatch, followSequence, getAtToken, getBracketToken, getColonToken, getCommentRegexpToken, getCurveToken, getDotToken, getIdentifierToken, getInterpolatedStringToken, getMaybeConcatLine, getMaybeConcatLineToken, getNewlineToken, getNonInterpolatedStringToken, getNumberToken, getParenToken, getPunctToken, getRightDelimiterToken, getSpaceToken, getSymbolToken, indent, interpolateStringPiece, isIdentifier, itemToParameter, keywordTestExpressionBodyStatement, keywordThenElseStatement, leadWordClauseMap, leftCBlockComment, leftIndentBlockComment, leftLineTailComment, leftSpace, letLikeStatement, lexError, lineInfo, lineno, literal, makeTokenFnMap, matchToken, maxLine, maybeOneOfWords, memo, memoIndex, memoMap, newToken, newline, nextToken, nonInterpolatedStringLine, operatorExpression, paren, parser, predefined, recursive, row, saveMemo, seperatorList, skipInlineSpace, skipLineTail, skipSpaceLines, space, spaceClauseExpression, spaceComma, spaceCommentLines, symbolStopChars, text, textLength, thenClause, throwReturnStatement, toParameters, token, tokenFnMap, unchangeable, word, wrapResult;
  parser = this;
  this.predefined = predefined = {};
  unchangeable = ['cursor', 'setCursor', 'row', 'setLineno', 'atLineHead', 'atStatementHead', 'setAtStatementHead'];
  text = '';
  textLength = 0;
  cursor = 0;
  char = '';
  lineno = 0;
  column = 0;
  indent = 0;
  token = null;
  eof = {
    cursor: textLength,
    column: -1,
    indent: -1,
    isUndent: true
  };
  eof.next = eof;
  this.memo = memo = function(fn) {
    var tag;
    tag = memoIndex++;
    return function() {
      var m, row, x;
      if ((m = memoMap[tag]) && hasOwnProperty.call(m, cursor)) {
        if (x = m[cursor]) {
          cursor = x.stop;
          row = x.line;
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
    result.line = row;
    return memoMap[tag][start] = result;
  };
  this.clearMemo = function() {
    var memoMap;
    return memoMap = {};
  };
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
      eof.lineno = lineno + 1;
      token = eof;
    } else if (fn = tokenFnMap[char]) {
      fn(char);
    } else {
      getSymbolToken();
    }
    return token;
  };
  this.testMatchToken = function() {
    char = text[cursor];
    return matchToken();
  };
  newToken = function(tkn) {
    token.next = tkn;
    return token = tkn;
  };
  getSymbolToken = function() {
    var c, c2, col, cur;
    cur = cursor;
    col = column;
    while (c = text[cursor]) {
      if (symbolStopChars[c]) {
        break;
      }
      if (c === '/' && ((c2 = text[cursor + 1]) === '/' || c2 === '*')) {
        break;
      }
      if (c === '\\' && ((c2 = text[cursor + 1]) === '\n' || c2 === '\r')) {
        break;
      }
      cursor++;
    }
    column += cursor - cur;
    return newToken({
      value: text.slice(cur, cursor),
      cursor: cur,
      stopCursor: cursor,
      line: lineno,
      column: col,
      indent: indent
    });
  };
  symbolStopChars = extend(charset(' \t\v\n\r()[]{},;:\'\".@\\'), identifierCharSet);
  getAtToken = getDotToken = function() {
    var c, col, cur;
    cur = cursor;
    col = column;
    while ((c = text[cursor]) && c === char) {
      cursor++;
    }
    column += cursor - cur;
    return newToken({
      type: SYMBOL,
      value: text.slice(cur, cursor),
      cursor: cur,
      stop: cursor,
      line: lineno,
      column: col,
      indent: indent
    });
  };
  getColonToken = function() {
    var c, col, cur, type;
    cur = cursor;
    col = column;
    while ((c = text[cursor]) && c === char) {
      cursor++;
    }
    column += cursor - cur;
    if (cursor === cur + 1) {
      type === PUNCT;
    } else {
      type = SYMBOL;
    }
    return newToken({
      type: type,
      value: text.slice(cur, cursor),
      cursor: cur,
      stopCursor: cursor,
      line: lineno,
      column: col,
      indent: indent
    });
  };
  makeTokenFnMap = function() {
    return {
      ' ': getSpaceToken,
      '\t': getSpaceToken,
      '\n': getNewlineToken,
      '\r': getNewlineToken,
      '0': getNumberToken,
      '1': getNumberToken,
      '2': getNumberToken,
      '3': getNumberToken,
      '4': getNumberToken,
      '5': getNumberToken,
      '6': getNumberToken,
      '7': getNumberToken,
      '8': getNumberToken,
      '9': getNumberToken,
      '"': getInterpolatedStringToken,
      "'": getNonInterpolatedStringToken,
      '(': getParenToken,
      ')': getRightDelimiterToken,
      '[': getBracketToken,
      ']': getRightDelimiterToken,
      '{': getCurveToken,
      '}': getRightDelimiterToken,
      ',': getPunctToken,
      ';': getPunctToken,
      '.': getDotToken,
      ':': getColonToken,
      '@': getAtToken,
      '\\': getMaybeConcatLineToken,
      '/': getCommentRegexpToken
    };
  };
  getSpaceToken = function() {
    var c, col, concatIndent, cur, dent, line, tkn;
    cur = cursor;
    line = lineno;
    col = column;
    dent = indent;
    cursor++;
    column++;
    skipInlineSpace(dent);
    char = text[cursor];
    if (char === '\\' && newline()) {
      while ((c = text[cursor]) && c === ' ') {
        cursor++;
        column++;
      }
      if (c === '\n' || c === '\r') {
        error('should not follow empty line as concatenated line');
      } else if (!c) {
        unexpectedEOF('after concatenated line symbol "\"');
      }
      if (concatenating) {
        if (columen !== dent) {
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
    var c, c2, _results;
    _results = [];
    while (1) {
      while ((c = text[cursor]) && c === ' ') {
        cursor++;
        column++;
      }
      if (c === '\t') {
        _results.push(unexpectedTabCharAtLineHead());
      } else if (c === '\n') {
        cursor++;
        column = 0;
        if (c === '\r') {
          cursor++;
        }
        continue;
      } else if (c === '\r') {
        cursor++;
        column = 0;
        if (c === '\n') {
          cursor++;
        }
        continue;
      } else if (!c) {
        break;
      } else if (column !== dent) {
        break;
      } else if (c === '/') {
        if ((c2 = text[cursor + 1]) === '/') {
          cursor += 2;
          skipLineTail();
          continue;
        } else if (c2 === '*') {
          cursor += 2;
          leftCBlockComment();
          skipInlineSpace();
          if (newline()) {
            continue;
          } else {
            break;
          }
        } else {
          break;
        }
      } else {
        break;
      }
    }
    return _results;
  };
  skipInlineSpace = function(dent) {
    var c, c2, c3, _results;
    _results = [];
    while (1) {
      while (1) {
        c = text[cursor];
        if (c !== ' ' && c !== '\t') {
          break;
        }
        cursor++;
      }
      c = text[cursor];
      if (c === '/') {
        if ((c2 = text[cursor + 1]) === '*') {
          cursor += 2;
          column += 2;
          leftCBlockComment(dent);
          continue;
        }
        if (c2 === '/') {
          while ((c3 = text[cursor]) !== '\n' && c3 !== '\r') {
            cursor++;
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
    c = text[cursor];
    if (c === '\r') {
      cursor++;
      if (text[cursor] === '\n') {
        cursor++;
        c2 = '\n';
      }
      lineno++;
      column = 0;
    } else if (c === '\n') {
      cursor++;
      if (text[cursor] === '\r') {
        cursor++;
        c2 = '\r';
      }
      lineno++;
      column = 0;
    } else {
      return;
    }
    return c + (c2 || '');
  };
  skipLineTail = function() {
    var c;
    while ((c = text[cursor]) && c !== '\n' && c !== '\r') {
      cursor++;
    }
    if (!c) {
      return column = indent = -1;
    } else {
      column = 0;
      while (c === ' ') {
        cursor++;
        column++;
        c = text[cursor];
      }
      if (c === '\t') {
        return error('unexpected tab "\t" character in the head of line');
      }
    }
  };
  leftIndentBlockComment = function(dent) {
    var c, _results;
    skipLineTail();
    _results = [];
    while (1) {
      c = text[cursor];
      while (c && c === ' ') {
        cursor++;
        column++;
      }
      if (c === '\n' || c === '\r') {
        continue;
      }
      if (column <= dent) {
        break;
      }
      _results.push(skipLineTail());
    }
    return _results;
  };
  leftCBlockComment = function(dent) {
    var c, _results;
    _results = [];
    while (1) {
      c = text[cursor];
      if (c === '*' && text[cursor + 1] === '/') {
        cursor += 2;
        column += 2;
        break;
      } else if (c === '\n') {
        cursor++;
        lineno++;
        column = 0;
        if (c === '\r') {
          cursor++;
        }
        while ((c = text[cursor]) && c === ' ') {
          cursor++;
          column++;
        }
        if (c === '\t') {
          unexpectedTabCharAtLineHead();
        }
        if (c === '\n' || c === '\r') {
          continue;
        } else if (!c) {
          unexpectedEOF('while parsing c style block comment /* */');
        }
        if (column < dent) {
          _results.push(expectMoreIndent(dent, 'while parsing c style block comment /* */'));
        } else {
          _results.push(void 0);
        }
      } else if (c === '\r') {
        cursor++;
        lineno++;
        column = 0;
        if (c === '\n') {
          cursor++;
        }
        while ((c = text[cursor]) && c === ' ') {
          cursor++;
          column++;
        }
        if (c === '\t') {
          unexpectedTabCharAtLineHead();
        }
        if (c === '\n' || c === '\r') {
          continue;
        } else if (!c) {
          unexpectedEOF('while parsing c style block comment /* */');
        }
        if (column < dent) {
          _results.push(expectMoreIndent(dent));
        } else {
          _results.push(void 0);
        }
      } else if (!c) {
        _results.push(unexpectedEOF('while parsing c style block comment /* */'));
      } else {
        cursor++;
        _results.push(column++);
      }
    }
    return _results;
  };
  this.concatLine = function() {
    var c;
    if (text[cursor] !== '\\') {
      return;
    }
    if ((c = text[cursor + 1]) !== '\n' && c !== '\r') {
      return;
    }
    cursor++;
    return bigSpace();
  };
  this.inlineSpaceComment = space = memo(function() {
    var c, concat, cur, line1, lineTail;
    cur = cursor;
    line1 = row;
    while (c = text[cursor]) {
      if (c === ' ' || c === '\t') {
        cursor++;
      } else if (c === '\n' || c === '\r' || parser.tailComment()) {
        lineTail = true;
        break;
      } else if (parser.cBlockComment()) {
        continue;
      } else if (parser.concatLine()) {
        lineTail = true;
        concat = true;
        continue;
      } else {
        break;
      }
    }
    return {
      type: SPACE_COMMENT,
      value: text.slice(cur, cursor),
      start: cur,
      stop: cursor,
      line1: line1,
      line: row,
      multiLine: line1 !== row,
      lineTail: lineTail,
      concat: concat,
      inline: true
    };
  });
  this.multilineSpaceComment = memo(function() {
    var atStatementHead, c, cur, indentCol, line1, multiStart;
    cur = cursor;
    line1 = row;
    indentCol = lineInfo[row].indentCol;
    space();
    multiStart = cursor;
    while (c = text[cursor]) {
      if (newLineAndEmptyLines()) {
        continue;
      } else if (indentCol !== lineInfo[row].indentCol) {
        break;
      } else if (parser.indentBlockComment()) {
        continue;
      } else if (parser.cBlockComment()) {
        space();
        continue;
      } else {
        break;
      }
    }
    if (cursor === multiStart) {
      cursor = cur;
      return;
    }
    atStatementHead = true;
    return {
      type: SPACE_COMMENT,
      value: text.slice(cur, cursor),
      start: cur,
      stop: cursor,
      line1: line1,
      line: row,
      multipleLine: true,
      indent: indentCol < lineInfo[row].indentCol,
      undent: indentCol > lineInfo[row].indentCol,
      newline: indentCol === lineInfo[row].indentCol
    };
  });
  this.spaceComment = bigSpace = memo(function() {
    return parser.multilineSpaceComment() || space();
  });
  this.regexp = memo(function() {
    var c, cur, i;
    if (text.slice(cursor, +(cursor + 1) + 1 || 9e9) !== '/!') {
      return;
    }
    cur = cursor;
    cursor += 2;
    while (c = text[cursor]) {
      if (c === '\\' && text[cursor + 1] === '/') {
        cursor += 2;
      } else if (c === '\\' && text[cursor + 1] === '\\') {
        cursor += 2;
      } else if (c === '\n' || c === '\r') {
        error('meet unexpected new line while parsing regular expression');
      } else if (c === '/') {
        i = 0;
        cursor++;
        while (c = text[cursor]) {
          if (c === 'i' || c === 'g' || c === 'm') {
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
        cursor++;
      }
    }
    return wrapResult(['regexp!', '/' + text.slice(cur + 2, cursor)], {
      type: REGEXP,
      start: cur,
      stop: cursor,
      line: row
    });
  });
  leftLineTailComment = function() {
    var lexCol;
    char = text[++cursor];
    if (char === '\n' || char === '\r') {
      cursor++;
      char = text[cursor];
    }
    if (char === '\n' || char === '\r') {
      cursor++;
      char = text[cursor];
    }
    lexRow++;
    return lexCol = 0;
  };
  leftSpace = function() {
    var _results;
    _results = [];
    while (char === ' ' || char === '\t') {
      cursor++;
      lexCol++;
      _results.push(char = text[cursor]);
    }
    return _results;
  };
  spaceCommentLines = function() {
    if (char === ' ' || char === '\t') {
      cursor++;
      lexCol++;
      leftSpaceToken();
    }
    if (char === '/') {
      char = text[++cursor];
      if (char === '/') {
        return leftLineTailComment();
      }
    }
  };
  getCommentRegexpToken = function() {
    var cur, lineList, spaceLines, startLineIndent, t, tail, x, _results;
    cur = cursor;
    char = text[++cursor];
    if (char === '/') {
      cursor++;
      tail = skipLineTail();
      spaceLines = spaceCommentLines(indent);
      if (lexIndentCol > startIndentCol) {
        t = INDENT;
      } else if (lexIndentCol > startIndentCol) {
        t = NEWLINE;
      } else {
        t = UNDENT;
      }
      return {
        type: t,
        value: text.slice(cur, cursor),
        content: [tail, spaceLines]
      };
    } else if (char === '*') {
      leftCBlockComment();
      _results = [];
      while (1) {
        if (char === ' ' || char === '\t') {
          cursor++;
          lexCol++;
          leftSpaceToken();
        }
        if (char === '/') {
          if (text[cursor + 1] === '*') {
            _results.push(leftCBlockComment());
          } else if (text[cursor + 1] === '/') {
            leftLineTailComment();
            break;
          } else {
            _results.push(void 0);
          }
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    } else if (char === '.') {
      startLineIndent = lexIndentCol;
      x = skipLineTail();
      lineList = skipLineUntilSameOrLessIndent(startLineIndent);
      return {
        type: BLOCK_COMMENT,
        value: [x].concat(lineList)
      };
    } else if (char === '!') {
      cursor++;
      lexCol++;
      leftRexexp();
      return {
        type: REGEXP,
        value: '/' + text.slice(cur + 1, cursor)
      };
    } else if (firstIdentifierCharSet[char]) {
      cursor++;
      lexCol++;
      return {
        type: CODE_BLOCK_COMMENT_START,
        value: '/'
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
  getNewlineToken = function() {};
  getNumberToken = function() {
    var baseStart, c, c2, col, cur, dotCursor, meetDigit, value;
    cur = cursor;
    col = column;
    base = 10;
    c = text[cursor];
    if (c === '0' && (c2 = text[cursor + 1])) {
      if (c2 === 'b' || c2 === 'B') {
        base = 2;
        baseStart = cursor += 2;
        c = text[cursor];
      } else if (c2 === 'x' || c2 === 'X') {
        base = 16;
        baseStart = cursor += 2;
        c = text[cursor];
      } else {
        c = text[++cursor];
        meetDigit = true;
      }
    }
    if (base === 2) {
      while (c) {
        if (c === '0' || c === '1') {
          c = text[++cursor];
        } else {
          break;
        }
      }
    } else if (base === 16) {
      while (c) {
        if (!(('0' <= c && c <= '9') || ('a' <= c && c <= 'f') || ('A' <= c && c <= 'F'))) {
          break;
        } else {
          c = text[++cursor];
        }
      }
    }
    if (base === 2) {
      if (c === '.' || c === 'e' || c === 'E') {
        error('binary number followed by ".eE"');
      } else if (('2' <= c && c <= '9')) {
        error('binary number followed by 2-9');
      }
    }
    if (base === 16) {
      if (c === '.') {
        error('hexadecimal number followed by "."');
      } else if (letterCharSet[c]) {
        error('hexadecimal number followed by g-z or G-Z');
      }
    }
    if (base !== 10) {
      if (cursor === baseStart) {
        cursor--;
        return newToken({
          type: NUMBER,
          value: text.slice(cur, cursor),
          expr: ['number!', 0],
          cursor: cur,
          line: lineno,
          column: col,
          indent: indent
        });
      } else {
        return newToken({
          type: NUMBER,
          value: (value = text.slice(baseStart, cursor)),
          expr: ['number!', parseInt(value, base)],
          cursor: cur,
          line: lineno,
          column: col,
          indent: indent
        });
      }
    }
    while (c) {
      if (('0' <= c && c <= '9')) {
        meetDigit = true;
        c = text[++cursor];
      } else {
        break;
      }
    }
    if (!meetDigit) {
      return;
    }
    if (c === '.') {
      meetDigit = false;
      c = text[++cursor];
      while (c) {
        if (c < '0' || '9' < c) {
          break;
        } else {
          meetDigit = true;
          c = text[++cursor];
        }
      }
    }
    dotCursor = cursor - 1;
    if (!meetDigit && c !== 'e' && c !== 'E') {
      cursor = dotCursor;
      return newToken({
        type: NUMBER,
        value: (value = text.slice(baseStart, cursor)),
        expr: ['number!', parseInt(value, base)],
        cursor: cur,
        line: lineno,
        column: col,
        indent: indent
      });
    }
    if (c === 'e' || c === 'E') {
      c = text[++cursor];
      if (c === '+' || c === '-') {
        c = text[++cursor];
        if (!c || c < '0' || '9' < c) {
          cursor = dotCursor;
          return newToken({
            type: NUMBER,
            value: (value = text.slice(cur, dotCursor)),
            expr: ['number!', parseInt(value, base)],
            cursor: cur,
            line: lineno,
            column: col,
            indent: indent
          });
        } else {
          while (c) {
            c = text[++cursor];
            if (c < '0' || '9' < c) {
              break;
            }
          }
        }
      } else if (!c || c < '0' || '9' < c) {
        cursor = dotCursor;
        return newToken({
          type: NUMBER,
          value: (value = text.slice(cur, dotCursor)),
          expr: ['number!', parseInt(value, base)],
          cursor: cur,
          line: lineno,
          column: col,
          indent: indent
        });
      } else {
        while (c) {
          if (c < '0' || '9' < c) {
            break;
          }
          c = text[++cursor];
        }
      }
    }
    return newToken({
      type: NUMBER,
      value: (value = text.slice(cur, cursor)),
      expr: ['number!', parseFloat(value, base)],
      cursor: cur,
      line: lineno,
      column: col,
      indent: indent
    });
  };
  getInterpolatedStringToken = function() {};
  getNonInterpolatedStringToken = function() {};
  getBracketToken = function() {};
  getCurveToken = function() {};
  getRightDelimiterToken = function() {};
  getMaybeConcatLineToken = function() {};
  getCommentRegexpToken = function() {};
  getParenToken = function(c) {
    return {
      value: c,
      type: c,
      row: lexLineno,
      cursor: cursor,
      length: 1,
      col: lexCol
    };
  };
  getPunctToken = getParenToken;
  getInterpolatedStringToken = function(c) {
    if (text[cursor + 1] === '"') {
      if ([cursor + 2] === '"') {
        return parseRawInterpolateString();
      } else {
        return {
          value: '""',
          type: '"',
          row: lexLineno,
          cursor: cursor,
          length: 1,
          col: lexCol
        };
      }
    } else {
      return parseInterpolatedString();
    }
  };
  getInterpolatedStringToken = function(c) {
    if (text[cursor + 1] === "'") {
      if ([cursor + 2] === "'") {
        return parseRawNonInterpolateString();
      } else {
        return {
          value: '""',
          type: "'",
          row: lexLineno,
          cursor: cursor,
          length: 1,
          col: lexCol
        };
      }
    } else {
      return parseNonInterpolatedString();
    }
  };
  clearMemo = function() {
    var cursor2Token, memoMap;
    memoMap = {};
    return cursor2Token = {};
  };
  tokenFnMap = makeTokenFnMap();
  getIdentifierToken = function() {
    var c, col, cur, value;
    if (!firstIdentifierCharSet[text[cursor]]) {
      return;
    }
    cur = cursor;
    cursor++;
    while (c = text[cursor]) {
      if (identifierCharSet[c]) {
        cursor++;
      } else {
        break;
      }
    }
    col = column += cursor - cur;
    return newToken({
      type: IDENTIFIER,
      value: (value = text.slice(cur, cursor)),
      expr: ['identifier!', value],
      cursor: cur,
      stopCursor: cursor,
      line: lineno,
      column: col,
      indent: indent
    });
  };
  for (c in firstIdentifierCharSet) {
    tokenFnMap[c] = getIdentifierToken;
  }
  cursor = 0;
  row = 1;
  lineInfo = [];
  maxLine = -1;
  memoMap = {};
  atStatementHead = true;
  cursor2token = {};
  environment = null;
  endCursorOfDynamicBlockStack = [];
  memoIndex = 0;
  this.followMatch = followMatch = function(fn) {
    var cur, line, x;
    cur = cursor;
    line = row;
    x = fn();
    cursor = cur;
    row = line;
    return x;
  };
  this.follow = follow = function(matcherName) {
    var cur, line, x;
    cur = cursor;
    line = row;
    x = parser[matcherName]();
    cursor = cur;
    row = line;
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
    line1 = row;
    for (_i = 0, _len = matcherList.length; _i < _len; _i++) {
      matcherName = matcherList[_i];
      if (!(x = parser[matcherName]())) {
        break;
      }
    }
    cursor = cur;
    row = line1;
    return x;
  };
  this.followOneOf = function() {
    var cur, line1, matcherList, matcherName, x, _i, _len;
    matcherList = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    cur = cursor;
    line1 = row;
    for (_i = 0, _len = matcherList.length; _i < _len; _i++) {
      matcherName = matcherList[_i];
      cursor = cur;
      row = line1;
      if (x = parser[matcherName]()) {
        break;
      }
    }
    cursor = cur;
    row = line1;
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
  this.nonInterpolatedString = memo(function() {
    var cur, indentCol, line1, myIndent, myLineInfo, quote, quoteLength;
    if (text.slice(cursor, cursor + 3) === "'''") {
      quote = "'''";
    } else if (text[cursor] === "'") {
      quote = "'";
    } else {
      return;
    }
    cur = cursor;
    line1 = row;
    quoteLength = quote.length;
    indentCol = null;
    if (cursor === lineInfo[row].start + lineInfo[row].indentCol) {
      indentCol = lineInfo[row].indentCol;
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
          line: row
        };
      }
      if (lineInfo[row].empty) {
        str += nonInterpolatedStringLine(quote, quoteLength);
        continue;
      } else if (row !== line1) {
        myLineInfo = lineInfo[row];
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
  });
  interpolateStringPiece = function(quote, quoteLength, indentCol, lineIndex) {
    var c2, myIndent, x;
    str = '"';
    while (c = text[cursor]) {
      if (text.slice(cursor, cursor + quoteLength) === quote) {
        return str + '"';
      } else if (c === '"') {
        if (c !== quote) {
          str += '\\"';
          cursor++;
        } else {
          return str(+'\\"');
        }
      } else if (x = newline()) {
        if (!lineInfo[row].empty && (myIndent = lineInfo[row].indentCol) && lineIndex.value++) {
          if (indentCol.value === null) {
            indentCol.value = myIndent;
          } else if (myIndent !== indentCol.value) {
            error('wrong indent in string');
          } else {
            cursor += myIndent;
          }
        }
        return str + escapeNewLine(x) + '"';
      } else if (c === '(' || c === '{' || c === '[') {
        return str + c + '"';
      } else if (c === '$') {
        return str + '"';
      } else if (c === '\\') {
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
        str += c;
        cursor++;
      }
    }
    return error('unexpected end of input while parsing interpolated string');
  };
  this.interpolatedString = memo(function() {
    var col, cur, indentCol, line1, lineIndex, literalStart, pieces, quote, quoteLength, x;
    if (text.slice(cursor, cursor + 3) === '"""') {
      quote = '"""';
    } else if (text[cursor] === '"') {
      quote = '"';
    } else {
      return;
    }
    cur = cursor;
    line1 = row;
    indentCol = null;
    if ((col = parser.getCol()) === lineInfo[row].indentCol) {
      indentCol = {
        value: col
      };
    } else {
      indentCol = {};
    }
    quoteLength = quote.length;
    cursor += quoteLength;
    pieces = [];
    lineIndex = {
      value: 0
    };
    while (c = text[cursor]) {
      if (text.slice(cursor, cursor + quoteLength) === quote) {
        cursor += quoteLength;
        return {
          type: INTERPOLATE_STRING,
          value: ['string!'].concat(pieces),
          start: cur,
          stop: cursor,
          line1: line1,
          line: row
        };
      }
      if (c === '$') {
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
      } else if (c === '(' || c === '{' || c === '[') {
        if (x = parser.delimiterExpression('inStrExp')) {
          pieces.push(getOperatorExpression(x));
          if (c === '(') {
            pieces.push('")"');
          } else if (c === '[') {
            pieces.push('"]"');
          } else if (c === '{') {
            pieces.push('"}"');
          }
        } else {
          pieces.push('"' + c + '"');
        }
      } else {
        pieces.push(interpolateStringPiece(quote, quoteLength, indentCol, lineIndex));
      }
    }
    if (!text[cursor]) {
      return error('expect ' + quote + ', unexpected end of input while parsing interpolated string');
    }
  });
  this.string = function() {
    return parser.interpolatedString() || parser.nonInterpolatedString();
  };
  this.paren = paren = memo(function() {
    var exp, startToken;
    startToken = getToken();
    if (token.value !== '(') {
      return;
    } else {
      token = matchToken();
    }
    if (isSpaceToken(token)) {
      if (token.undent) {
        error('unexpected undent while parsing parenethis "(...)"');
      } else {
        token = matchToken();
      }
    }
    exp = parser.operatorExpression();
    if (token.isUndent && token.indent < startToken.indent) {
      error('expect ) indent equal to or more than (');
    }
    if (token.value !== ')') {
      error('expect )');
    } else {
      token = matchToken();
    }
    return wrapResult(exp, {
      type: PAREN,
      start: cur,
      stop: token
    });
  });
  curveVariantMap = {
    '.': function() {
      matchToken();
      return hash();
    }
  };
  this.curve = curve = memo(function() {
    var body, cur, curveVariantFn;
    cur = token;
    if (token.value !== '{') {
      return;
    }
    matchToken();
    if ((curveVariantFn = curveVariantFnMap[token.value])) {
      return curveVariantFn();
    }
    assertNotUndent();
    skipSpaceToken();
    if (token.value === '}') {
      matchToken();
      return extend(['hash!'], {
        start: cur,
        stop: token
      });
    }
    body = parser.lineBlock();
    if (token.indent < startIndent) {
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
      start: cur,
      stop: cursor,
      line1: line1,
      line: row
    });
  });
  bracketVariantMap = {};
  this.bracket = memo(function() {
    var cur, curveVariantFn, expList;
    cur = token;
    if (token.value !== '[') {
      return;
    }
    matchToken();
    if ((curveVariantFn = curveVariantFnMap[token.value])) {
      return curveVariantFn();
    }
    assertNotUndent();
    skipSpaceToken();
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
      line: row
    });
  });
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
        line: row
      });
    }
  });
  this.hashBlock = memo(function() {
    var col, column1, cur, indentCol, line1, result, spac, space2, x;
    cur = cursor;
    line1 = row;
    column1 = lineInfo[row].indentCol;
    if ((spac = bigSpace()) && spac.undent) {
      return;
    }
    result = [];
    if (spac.indent) {
      indentCol = lineInfo[row].indentCol;
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
      if (row === line1) {
        continue;
      }
      if ((col = lineInfo[row].indentCol) > column1) {
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
    line1 = row;
    indentCol = lineInfo[row].indentCol;
    if (text.slice(cursor, cursor + 2) !== '{.') {
      return;
    } else {
      cursor += 2;
    }
    items = parser.hashBlock();
    if (lineInfo[row].indentCol < indentCol) {
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
      line: row
    });
  });
  this.delimiterExpression = memo(function() {
    return parser.paren() || parser.dataBracket() || parser.bracket() || parser.curve() || parser.hash();
  });
  this.escapeSymbol = escapeSymbol = function() {
    var cur, line1, sym;
    cur = cursor;
    line1 = row;
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
  atomTokenTypes = {
    IDENTIFIER: 1,
    NUMBER: 1,
    REGEXP: 1,
    CURVE: 1,
    HASH: 1,
    BRACKET: 1,
    PAREN: 1,
    SYMBOL: 1
  };
  this.atom = function(mode) {
    var atomToken;
    if (atomTokenTypes[token.type]) {
      atomToken = token;
      matchToken();
      atomToken.priority = 1000;
      return wrapResult(atomToken, {
        start: atomToken
      });
    }
  };
  this.prefixOperator = function(mode) {
    var op, opToken, priInc;
    if (hasOwnProperty.call(prefixOperatorDict, token.value) && (op = prefixOperatorDict[token.value])) {
      return;
    }
    opToken = token;
    matchToken();
    if (token.value === ':') {
      matchToken();
      if (isSpace(token)) {
        if (mode === PAREN_EXPR) {
          error('unexpected spaces after :');
        } else {
          token = opToken;
          return;
        }
      }
    } else if (isSpace(token)) {
      if (isIndent(token)) {
        error('unexpected indent after prefix operator');
      } else if (isNewline(token)) {
        error('unexpected new line after prefix operator');
      }
      priInc = 300;
    } else if (!canFollowPrefix(token)) {
      error('unexpected ' + token.value + ' after prefix operator');
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
  this.suffixOperator = function(mode, x, priority) {
    var op, opToken;
    if (token.type !== SYMBOL) {
      return;
    }
    if ((op = suffixOperatorDict[token.value]) && op.priority + 600 >= priority) {
      token.symbol = op.symbol;
      token.priority = op.priority + 600;
      opToken = token;
      matchToken();
      if (canFollowSuffix()) {
        return wrapResult(opToken, {
          start: cur
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
    line1 = row;
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
  this.binaryOperator = function(mode, x, priority, leftAssoc) {
    var op;
    if (isEOI(token)) {

    } else if (op = binaryDictOperator(mode, x, priority, leftAssoc)) {
      return op;
    } else if (op = parser.customBinaryOperator(mode, x, priority, leftAssoc)) {
      return op;
    }
  };
  binaryDictOperator = function(mode, x, priority, leftAssoc) {
    var indentExp, indentLine, indentStart, op, opToken, pri, priInc, space3, start, tag, value;
    start = token;
    if (isInlineSpace(token)) {
      priInc = 300;
    } else if (isMultiplelines(token)) {
      priInc = 0;
    } else {
      priInc = 600;
      if (token.value === '.') {
        matchToken();
      }
    }
    if (priority >= priInc + 300) {
      return;
    }
    value = token.value;
    if (!hasOwnProperty.call(binaryOperatorDict, value) || !(op = binaryOperatorDict[value])) {
      token = start;
      return;
    }
    opToken = token;
    matchToken();
    if (token.value === '.') {
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
    if (isUndent(token)) {
      error('unexpected undent after binary operator "' + opToken.value + '"');
    }
    if (isEOI(token)) {
      error('unexpected end of input, expect right operand after binary operator');
    }
    if (token.type === RIGHT_DELIMITER) {
      return;
    }
    if (priInc === 600) {
      if (isSpace(Token)) {
        if (op.value === ',') {
          priInc = 300;
        } else if ((c = text[cursor]) === ';') {
          error('unexpected ;');
        } else {
          error('unexpected spaces or new lines after binary operator "' + op.value + '" before which there is no space.');
        }
      }
      pri = op.priority + priInc;
      if ((leftAssoc && pri <= priority) || pri < priority) {
        return rollback(start, line1);
      }
      return extend({}, op, {
        priority: pri
      });
    } else if (priInc === 300) {
      pri = op.priority + priInc;
      if (isSpace(Token)) {
        if (isUndent(token)) {
          error('unexpceted undent after binary operator ' + op.value);
        } else if (isNewline(token)) {
          priInc = 0;
        } else if (isIndent(token)) {
          priInc = 0;
          indentStart = cursor;
          indentLine = row;
          indentExp = parser.recursiveExpression(cursor)(mode, 0, true);
          if ((space3 = bigSpace()) && !space3.undent && text[cursor] && text[cursor] !== ')') {
            error('expect an undent after a indented block expression');
          }
          indentExp = {
            type: INDENT_EXPRESSION,
            value: indentExp,
            priority: 1000
          };
          tag = 'expr(' + mode + ',' + 300 + ',' + (0 + !op.rightAssoc) + ')';
          saveMemo(tag, indentStart, indentExp);
          cursor = indentStart;
        }
      } else {
        if (mode === 'opExp') {
          error('binary operator ' + op.symbol + ' should have spaces at its right side.');
        } else {
          return rollback(start, line1);
        }
      }
      if ((leftAssoc && pri <= priority) || pri < priority) {
        return rollback(start, line1);
      }
      return extend({}, op, {
        priority: pri
      });
    } else {
      if (priority > 300) {
        return rollback(start, line1);
      }
      if (op.valu === ',' || op.value === ':' || op.value === '%' || op.assign) {
        error('binary operator ' + op.symbol + ' should not be at begin of line');
      }
      if (space2.undent) {
        error('binary operator should not be at end of block');
      } else if (space2.newline) {
        error('a single binary operator should not occupy whole line.');
      }
      if (space1.indent) {
        priInc = 0;
        indentStart = cursor;
        indentLine = row;
        indentExp = parser.recursiveExpression(cursor)(mode, 0, true);
        if ((space3 = bigSpace()) && !space3.undent && text[cursor] && text[cursor] !== ')') {
          error('expect an undent after a indented block expression');
        }
        indentExp = {
          type: INDENT_EXPRESSION,
          value: indentExp,
          priority: 1000
        };
        tag = 'expr(' + mode + ',' + 300 + ',' + (0 + !op.rightAssoc) + ')';
        saveMemo(tag, indentStart, indentExp);
        cursor = indentStart;
        row = indentLine;
      }
      return extend({}, op, {
        priority: 300
      });
    }
  };
  this.followParenArguments = function() {
    var line1, start, x;
    start = cursor;
    line1 = row;
    x = paren();
    rollback(start, line1);
    return x;
  };
  this.binaryCallOperator = function(mode, x, priority, leftAssoc) {
    var start;
    if (isSpace(token)) {
      start = token;
      matchToken();
      if (token.type === PAREN) {
        if (mode === PAREN_EXPR) {
          throw '() as call operator should tightly close to the left caller';
        }
      } else {
        token = start;
      }
    } else if (800 > priority) {
      start = token;
      matchToken();
      if (token.type === PAREN) {
        return {
          symbol: 'call()',
          type: SYMBOL,
          priority: 800,
          start: cursor,
          stop: cursor,
          line: row
        };
      } else {
        return token = start;
      }
    }
  };
  this.binaryIndexOperator = function(mode, x, priority, leftAssoc) {
    var line1, spac, start;
    start = cursor;
    line1 = row;
    if ((spac = bigSpace()) && spac.value && follow('bracket')) {
      if (mode === 'opExp') {
        throw '[] as subscript should tightly close to left operand';
      } else {
        rollback(start, line1);
        return;
      }
    } else if (800 > priority && follow('bracket')) {
      return {
        symbol: 'index[]',
        type: SYMBOL,
        priority: 800,
        start: cursor,
        stop: cursor,
        line: row
      };
    }
    rollback(start, line1);
  };
  this.binaryAttributeOperator = function(mode, x, priority, leftAssoc) {
    var line1, spac, space2, start;
    start = cursor;
    line1 = row;
    if ((spac = bigSpace()) && spac.value) {
      if (500 <= priority) {
        return rollback(start, line1);
      }
      if (!(text[cursor] === '.' && text[cursor + 1] !== '.')) {
        return rollback(start, line1);
      }
      if (text[cursor] === '}') {
        return rollback(start, line1);
      }
      cursor++;
      if (!(space2 = bigSpace())) {
        error('expect spaces after "." because there are spaces before it');
      } else {
        return {
          symbol: 'attribute!',
          type: SYMBOL,
          priority: 500
        };
      }
    } else if (800 > priority && (text[cursor] === '.' && text[cursor + 1] !== '.') && ++cursor) {
      if (text[cursor] === '}') {
        return rollback(start, line1);
      }
      if ((spac = bigSpace()) && spac.value) {
        error('unexpected spaces after "." because there are no space before it');
      } else if (follow('symbol')) {
        return;
      } else {
        return {
          symbol: 'attribute!',
          type: SYMBOL,
          priority: 800
        };
      }
    }
    return rollback(start, line1);
  };
  this.customBinaryOperator = function(mode, x, priority, leftAssoc) {
    var fn, op, _i, _len, _ref3;
    _ref3 = parser.customBinaryOperators;
    for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
      fn = _ref3[_i];
      if (op = fn(mode, x, priority, leftAssoc)) {
        return op;
      }
    }
  };
  this.prefixExpression = function(mode, priority) {
    var line1, op, pri, start, x;
    start = cursor;
    line1 = row;
    if (op = parser.prefixOperator(mode)) {
      pri = priority > op.priority ? priority : op.priority;
      x = parser.recursiveExpression(cursor)(mode, pri, true);
      if (x) {
        return extend(makeOperatorExpression('prefix!', op, x), {
          start: start,
          stop: cursor,
          line1: line1,
          line: row
        });
      }
    }
  };
  this.recursiveExpression = recursive = function(start) {
    var expression, line1, x;
    x = null;
    line1 = row;
    return expression = function(mode, priority, leftAssoc) {
      var m, op, result, tag, y;
      tag = 'expr(' + mode + ',' + priority + ',' + (0 + leftAssoc) + ')';
      if (!(m = memoMap[tag])) {
        m = memoMap[tag] = {};
      } else if (result = m[start]) {
        cursor = result.stop;
        row = result.line;
        return result;
      }
      if (!x) {
        if (!(x = parser.prefixExpression(mode, priority))) {
          if (!(x = parser.atom(mode))) {
            memoMap[tag][start] = null;
            return;
          }
        }
      }
      if (op = parser.suffixOperator(mode, x, priority)) {
        x = extend(makeOperatorExpression('suffix!', op, x), {
          start: start,
          stop: cursor,
          line1: line1,
          line: row
        });
      }
      if (op = parser.binaryOperator(mode, x, priority, leftAssoc)) {
        y = recursive(cursor)(mode, op.priority, !op.rightAssoc);
        x = extend(makeOperatorExpression('binary!', op, x, y), {
          start: start,
          stop: cursor,
          line1: line1,
          line: row
        });
        return expression(mode, priority, leftAssoc);
      }
      return m[start] = x;
    };
  };
  this.operatorExpression = operatorExpression = function() {
    return parser.recursiveExpression(cursor)('opExp', 0, true);
  };
  this.compactClauseExpression = function() {
    return parser.recursiveExpression(cursor)('comClExp', 600, true);
  };
  this.spaceClauseExpression = spaceClauseExpression = function() {
    return parser.recursiveExpression(cursor)('spClExp', 300, true);
  };
  this.interpolateExpression = function() {
    return parser.recursiveExpression(cursor)('inStrExp', 600, true);
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
    line1 = row;
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
        line: row
      });
    } else {
      return extend({
        value: clause
      }, {
        start: start,
        stop: cursor,
        line1: line1,
        line: row
      });
    }
  };
  this.labelStatement = function() {
    var clause, lbl, line1, spac, start;
    start = cursor;
    line1 = row;
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
      line: row
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
    line2 = row;
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
    col = lineInfo[row].indentCol;
    if (col === indentCol && row !== line1 && !isHeadStatement) {
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
      line2 = row;
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
      line2 = row;
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
      line1 = row;
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
      line1 = row;
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
      line1 = row;
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
    line1 = row;
    indentCol = lineInfo[line1].indentCol;
    result = parser.identifierLine();
    spac = bigSpace();
    if ((col0 = lineInfo[row].indentCol) <= indentCol) {
      rollbackToken(spac);
      return result;
    }
    if (text[cursor] === ';') {
      return result;
    }
    while (varList = parser.identifierLine()) {
      result.push.apply(result, varList);
      spac = bigSpace();
      if ((col = lineInfo[row].indentCol) <= indentCol) {
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
    line1 = row;
    result = [];
    indentCol0 = lineInfo[row].indentCol;
    spac = bigSpace();
    col = lineInfo[row].indentCol;
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
      col = lineInfo[row].indentCol;
      if (!text[cursor] || text[cursor] === ';' || follow('rightDelimiter')) {
        break;
      }
      if (row === line1) {
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
    line1 = row;
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
          return rollback(start, row);
        }
      }
    } else if (text[cursor] === "'" || text[cursor] === '"') {
      if (sym) {
        error('file path should not follow "#" or "#/" immediately in import! statement, expect variable name instead');
      } else {
        return rollback(start, row);
      }
    }
    space();
    start1 = cursor;
    line2 = row;
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
    line1 = row;
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
      line1 = row;
      if (!space().value) {
        return;
      }
      leadClause = parser.clause();
      code = compileExp(['return', ['%/', leadClause]], environment);
      space();
      indentCol = lineInfo[row].indentCol;
      if (expectWord('then') || (text[cursor] === ':' && cursor++)) {
        space();
        if (newline()) {
          blockStopLineno = row;
          while (lineInfo[blockStopLineno].indentCol > indentCol && blockStopLineno < maxLine) {
            blockStopLineno++;
          }
          cursorAtEndOfDynamicBlock = lineInfo[blockStopLineno].indentCol || text.length;
        } else {
          blockStopLineno = row + 1;
          cursorAtEndOfDynamicBlock = lineInfo[blockStopLineno].indentCol || text.length;
        }
      } else {
        error('expect "then" or ":"');
      }
      endCursorOfDynamicBlockStack.push(cursorAtEndOfDynamicBlock);
      result = new Function('__$taiji_$_$parser__', code)(parser);
      endCursorOfDynamicBlockStack.pop();
      cursor = cursorAtEndOfDynamicBlock;
      row = blockStopLineno;
      if (Object.prototype.toString.call(result) === '[object Array]') {
        return extend(result, {
          start: start,
          stop: cursor,
          line1: line,
          row: row
        });
      } else {
        return {
          value: result,
          start: start,
          stop: cursor,
          line1: line1,
          row: row
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
      line1 = row;
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
      line1 = row;
      space();
      indentCol = lineInfo[row].indentCol;
      body = parser.lineBlock();
      if (newlineFromLine(line1, row) && !isHeadStatement) {
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
      line1 = row;
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
      line1 = row;
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
      line1 = row;
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
    line1 = row;
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
          line: row
        });
      }
    }
    return rollback(start, line1);
  });
  this.defaultAssignLeftSide = memo(function() {
    var e, line1, start, x;
    start = cursor;
    line1 = row;
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
      line1 = row;
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
        line: row
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
    line1 = row;
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
      result.line = row;
      return result;
    } else {
      return rollback(start, line1);
    }
  });
  this.indentClause = memo(function() {
    var blk, head, line1, spac, start;
    start = cursor;
    line1 = row;
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
      line: row
    });
  });
  this.macroCallClause = memo(function() {
    var args, blk, head, line1, spac, space1, start;
    start = cursor;
    line1 = row;
    if ((head = parser.compactClauseExpression())) {
      if ((space1 = space()) && !space1.value) {
        return rollback(start, line1);
      }
      if (text[cursor] === '#' && cursor++ && ((spac = space()) && spac.value || text[cursor] === '\n' || text[cursor] === '\r')) {
        if (blk = parser.block()) {
          return extend(['#call!', head, blk], {
            cursor: start,
            line1: row,
            stop: cursor,
            line: row
          });
        } else if (args = parser.clauses()) {
          return extend(['#call!', head, args], {
            cursor: start,
            line1: row,
            stop: cursor,
            line: row
          });
        }
      }
    }
    return rollback(start, line1);
  });
  this.unaryExpressionClause = memo(function() {
    var head, line1, start, x;
    start = cursor;
    line1 = row;
    if ((head = parser.compactClauseExpression()) && space() && (x = parser.spaceClauseExpression()) && parser.clauseEnd()) {
      if (text[cursor] === ',') {
        cursor++;
      }
      return extend([getOperatorExpression(head), getOperatorExpression(x)], {
        start: start,
        stop: cursor,
        line1: line1,
        line: row
      });
    }
    return rollback(start, line1);
  });
  this.expressionClause = memo(function() {
    var line1, start, x;
    start = cursor;
    line1 = row;
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
      line1 = row;
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
        line: row
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
    line1 = row;
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
        line: row
      });
    }
  };
  this.sequenceClause = memo(function() {
    var clause, item, line1, meetComma, start;
    start = cursor;
    line1 = row;
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
      line: row
    });
  });
  this.customClauseList = ['statement', 'labelStatement', 'leadWordClause', 'assignClause', 'colonClause', 'macroCallClause', 'indentClause', 'expressionClause', 'unaryExpressionClause'];
  this.clause = memo(function() {
    var clause, line1, matcher, start, x, _i, _len, _ref3;
    start = cursor;
    line1 = row;
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
      line: row
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
    line1 = row;
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
      line: row
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
              line: row
            })
          ];
        } else {
          return [
            extend(['lineComment!', comment.value], {
              start: start,
              stop: cursor,
              line: row
            })
          ];
        }
      }
    }
  });
  this.codeCommentBlockComment = memo(function() {
    var code, line1, start;
    if (cursor !== lineInfo[row].start + lineInfo[row].indentCol) {
      return;
    }
    if (text[cursor] !== '/') {
      return;
    }
    if ((c = text[cursor + 1]) === '.' || c === '/' || c === '*') {
      return;
    }
    start = cursor;
    line1 = row;
    cursor++;
    code = parser.lineBlock();
    return extend([['codeBlockComment!', code]], {
      start: start,
      stop: cursor,
      line1: line1,
      line: row
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
    indentCol = lineInfo[row].indentCol;
    spac = bigSpace();
    if (!spac.indent) {
      return rollbackToken(spac);
    } else {
      x = parser.blockWithoutIndentHead();
      spac = bigSpace();
      if (lineInfo[row].indentCol < indentCol) {
        rollbackToken(spac);
      }
      return x;
    }
  };
  this.blockWithoutIndentHead = function() {
    var indentCol, result, spac, x, x0;
    indentCol = lineInfo[row].indentCol;
    result = [];
    while ((x = parser.line()) && (spac = bigSpace())) {
      if (x.length !== 1 || !(x0 = x[0]) || (x0[0] !== 'lineComment!' && x0[0] !== 'codeBlockComment!')) {
        result.push.apply(result, x);
      }
      if (lineInfo[row].indentCol < indentCol) {
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
      if (lineInfo[row].indentCol < indentCol) {
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
    row++;
    while (row <= maxLine && (lineInfo[row].indentCol > 0 || lineInfo[row].empty)) {
      row++;
    }
    if (row > maxLine) {
      cursor = text.length;
    } else {
      cursor = lineInfo[row].start;
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
    lineno = 1;
    token = {};
    memoMap = {};
    atStatementHead = true;
    this.environment = environment = env;
    this.meetEllipsis = false;
    return endCursorOfDynamicBlockStack = [];
  };
  this.parse = function(data, root, cur, env) {
    parser.init(data, cur, env);
    matchToken();
    return root();
  };
  this.lexError = lexError = function(message) {
    throw cursor + '(' + lexRow + ':' + lexCol + '): ' + message + ': \n' + text.slice(cursor - 40, cursor) + '|   |' + text.slice(cursor, cursor + 40);
  };
  this.error = error = function(message) {
    throw cursor + '(' + row + ':' + parser.getCol() + '): ' + message + ': \n' + text.slice(cursor - 40, cursor) + '|   |' + text.slice(cursor, cursor + 40);
  };
  return this;
};

compileExp = require('../compiler').compileExp;
