var BINARY, BLOCK_COMMENT, BRACKET, CODE_BLOCK_COMMENT, CODE_BLOCK_COMMENT_LEAD_SYMBOL, COMPACT_CLAUSE_EXPRESSION, CONCAT_LINE, CONJUNCTION, CURVE, C_BLOCK_COMMENT, DATA_BRACKET, END_INTERPOLATED_STRING, EOI, FUNCTION, HALF_DENT, HASH, HASH_KEY_EXPRESSION, HEAD_SPACES, IDENTIFIER, INDENT, INDENT_EXPRESSION, INLINE_COMMENT, INTERPOLATE_STRING, KEYWORD, LINE_COMMENT, LIST, MODULE, MODULE_HEADER, NEWLINE, NON_INTERPOLATE_STRING, NULL, NUMBER, OPERATOR_EXPRESSION, PAREN, PREFIX, PUNCTUATION, REGEXP, RIGHT_DELIMITER, SPACE, SPACES, SPACES_INLINE_COMMENT, SPACE_CLAUSE_EXPRESSION, SPACE_COMMENT, STRING, SUFFIX, SYMBOL, TAIL_COMMENT, UNDENT, VALUE, begin, binaryOperatorDict, charset, colors, compileExp, conjMap, conjunctionHasOwnProperty, constant, dict, digitCharSet, digitChars, digits, extend, extendSyntaxInfo, firstIdentifierCharSet, firstIdentifierChars, firstSymbolCharset, hasOwnProperty, identifierCharSet, identifierChars, keywordHasOwnProperty, keywordMap, kindSymbol, letterCharSet, letterChars, letterDigitSet, list2dict, norm, prefixOperatorDict, str, suffixOperatorDict, taijiIdentifierCharSet, trace, undefinedExp, _ref, _ref1;

colors = require('colors');

_ref = require('../utils'), charset = _ref.charset, str = _ref.str, dict = _ref.dict, list2dict = _ref.list2dict, extendSyntaxInfo = _ref.extendSyntaxInfo, extend = _ref.extend, firstIdentifierChars = _ref.firstIdentifierChars, firstIdentifierCharSet = _ref.firstIdentifierCharSet, letterDigitSet = _ref.letterDigitSet, identifierChars = _ref.identifierChars, digitCharSet = _ref.digitCharSet, letterCharSet = _ref.letterCharSet, identifierCharSet = _ref.identifierCharSet, firstSymbolCharset = _ref.firstSymbolCharset, digits = _ref.digits, digitChars = _ref.digitChars, letterChars = _ref.letterChars, taijiIdentifierCharSet = _ref.taijiIdentifierCharSet, constant = _ref.constant, kindSymbol = _ref.kindSymbol, norm = _ref.norm, undefinedExp = _ref.undefinedExp, trace = _ref.trace;

NULL = constant.NULL, NUMBER = constant.NUMBER, STRING = constant.STRING, IDENTIFIER = constant.IDENTIFIER, SYMBOL = constant.SYMBOL, REGEXP = constant.REGEXP, HEAD_SPACES = constant.HEAD_SPACES, CONCAT_LINE = constant.CONCAT_LINE, PUNCTUATION = constant.PUNCTUATION, FUNCTION = constant.FUNCTION, C_BLOCK_COMMENT = constant.C_BLOCK_COMMENT, PAREN = constant.PAREN, BRACKET = constant.BRACKET, DATA_BRACKET = constant.DATA_BRACKET, CURVE = constant.CURVE, INDENT_EXPRESSION = constant.INDENT_EXPRESSION, NEWLINE = constant.NEWLINE, SPACES = constant.SPACES, INLINE_COMMENT = constant.INLINE_COMMENT, SPACES_INLINE_COMMENT = constant.SPACES_INLINE_COMMENT, LINE_COMMENT = constant.LINE_COMMENT, BLOCK_COMMENT = constant.BLOCK_COMMENT, CODE_BLOCK_COMMENT = constant.CODE_BLOCK_COMMENT, CONCAT_LINE = constant.CONCAT_LINE, NON_INTERPOLATE_STRING = constant.NON_INTERPOLATE_STRING, INTERPOLATE_STRING = constant.INTERPOLATE_STRING, EOI = constant.EOI, INDENT = constant.INDENT, UNDENT = constant.UNDENT, HALF_DENT = constant.HALF_DENT, MODULE_HEADER = constant.MODULE_HEADER, MODULE = constant.MODULE, SPACE_COMMENT = constant.SPACE_COMMENT, TAIL_COMMENT = constant.TAIL_COMMENT, SPACE = constant.SPACE, HASH = constant.HASH, RIGHT_DELIMITER = constant.RIGHT_DELIMITER, KEYWORD = constant.KEYWORD, CONJUNCTION = constant.CONJUNCTION, CODE_BLOCK_COMMENT_LEAD_SYMBOL = constant.CODE_BLOCK_COMMENT_LEAD_SYMBOL, PREFIX = constant.PREFIX, SUFFIX = constant.SUFFIX, BINARY = constant.BINARY, END_INTERPOLATED_STRING = constant.END_INTERPOLATED_STRING, OPERATOR_EXPRESSION = constant.OPERATOR_EXPRESSION, COMPACT_CLAUSE_EXPRESSION = constant.COMPACT_CLAUSE_EXPRESSION, SPACE_CLAUSE_EXPRESSION = constant.SPACE_CLAUSE_EXPRESSION, INDENT_EXPRESSION = constant.INDENT_EXPRESSION, HASH_KEY_EXPRESSION = constant.HASH_KEY_EXPRESSION, VALUE = constant.VALUE, LIST = constant.LIST;

_ref1 = require('./operator'), prefixOperatorDict = _ref1.prefixOperatorDict, suffixOperatorDict = _ref1.suffixOperatorDict, binaryOperatorDict = _ref1.binaryOperatorDict;

hasOwnProperty = Object.prototype.hasOwnProperty;

exports.keywordMap = keywordMap = {
  'if': 1,
  'try': 1,
  'switch': 1,
  'while': 1,
  'while!': 1,
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
  'import!': 1,
  'export!': 1,
  'loop': 1,
  'class': 1,
  'var': 1
};

keywordHasOwnProperty = hasOwnProperty.bind(exports.keywordMap);

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

conjunctionHasOwnProperty = hasOwnProperty.bind(exports.conjMap);

begin = function(exp) {
  var e, result, _i, _len;
  if (!exp) {
    return norm('undefined');
  } else if (exp.length === 0) {
    return norm('undefined');
  } else if (exp.length === 1) {
    return exp[0];
  } else {
    result = [norm('begin!')];
    for (_i = 0, _len = exp.length; _i < _len; _i++) {
      e = exp[_i];
      if (e[0] && e[0].value === 'begin!') {
        result.push.apply(e.slice(1));
      } else {
        result.push(e);
      }
    }
    return {
      value: result,
      kind: LIST
    };
  }
};

exports.Parser = function() {
  var atLineHead, atStatementHead, binaryOperatorMemoIndex, bracketVariantMap, breakContinueStatement, c, char, concatenateLine, concatenating, cursor, curveVariantMap, decimal, definitionSymbolBody, environment, eoi, expectThen, expression, expressionMemoIndex, fn, hashBlock, hashItem, hashLine, hashLineBlock, indent, indentExpression, itemToParameter, key, keyword2statement, keywordThenElseStatement, leadTokenClause, leadWordClauseMap, leftCBlockComment, leftIndentBlockComment, leftInterpolateString, leftNonInterpolatedString, leftRawInterpolateString, leftRawNonInterpolatedString, leftRegexp, letLikeStatement, lexError, lexIndent, lineStart, lineno, literal, matchChar, matchToken, maybeConjunction, maybeIndentConjunction, memoIndex, memoMap, newLineAndEmptyLines, newline, nextPiece, nextToken, nonInterpolatedStringLine, nullToken, operatorExpression, parenVariantMap, parser, rawNonInterpolatedStringLine, seperatorList, skipInlineSpace, skipSpace, skipSpaceLines, skipToken, spaceClauseExpression, spaceComma, spaces, symbol2clause, symbolStopChars, syntaxError, text, textLength, throwReturnStatement, token, tokenFnMap, tokenOnAtChar, tokenOnBackSlashChar, tokenOnColonChar, tokenOnCommaChar, tokenOnDoubleQuoteChar, tokenOnForwardSlashChar, tokenOnIdentifierChar, tokenOnLeftBracketChar, tokenOnLeftParenChar, tokenOnNewlineChar, tokenOnNumberChar, tokenOnRightDelimiterChar, tokenOnSemiColonChar, tokenOnSharpChar, tokenOnSingleQuoteChar, tokenOnSpaceChar, tokenOnSymbolChar, tokenType, varInitLine, whileTestStatement, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref2, _ref3, _ref4, _ref5;
  parser = this;
  this.name = 'parser';
  text = '';
  textLength = text.length;
  cursor = 0;
  char = '';
  lineno = 0;
  lineStart = 0;
  lexIndent = 0;
  indent = 0;
  atLineHead = true;
  token = void 0;
  tokenType = void 0;
  memoMap = {};
  atStatementHead = true;
  environment = null;
  memoIndex = 0;
  eoi = {
    type: EOI,
    value: '',
    cursor: text.length,
    column: -1,
    indent: -1
  };
  eoi.next = eoi;
  nextToken = function() {
    var fn;
    if (token.indent !== void 0) {
      indent = token.indent;
    }
    switch (tokenType) {
      case NEWLINE:
      case INDENT:
      case UNDENT:
      case EOI:
        atStatementHead = true;
    }
    if (token.next) {
      token = token.next;
      return tokenType = token.type;
    } else {
      if (fn = tokenFnMap[char]) {
        return token = fn(char);
      } else if (!char) {
        if (token === eoi) {
          return eoi;
        }
        eoi.lineno = lineno + 1;
        lineStart = cursor;
        lexIndent = -1;
        tokenType = EOI;
        token.next = eoi;
        return token = eoi;
      } else {
        return token = tokenOnSymbolChar();
      }
    }
  };
  this.matchToken = matchToken = function() {
    var fn;
    if (fn = tokenFnMap[char]) {
      return token = fn(char);
    } else if (!char) {
      if (token === eoi) {
        return eoi;
      }
      eoi.lineno = lineno + 1;
      lineStart = cursor;
      lexIndent = -1;
      token.next = eoi;
      tokenType = EOI;
      return token = eoi;
      return tokenType = EOI;
    } else {
      return token = tokenOnSymbolChar();
    }
  };
  skipToken = function() {
    cursor = token.stopCursor;
    char = text[cursor];
    lexIndent = indent = token.indent || indent;
    return token = nullToken();
  };
  skipSpace = function() {
    if (char !== ' ' && char !== '\t') {
      return;
    }
    token = tokenOnSpaceChar();
    if (tokenType === SPACE) {
      return skipToken();
    }
  };
  nullToken = function() {
    return {
      type: tokenType = NULL,
      value: '',
      cursor: cursor,
      stopCursor: cursor,
      line: lineno,
      column: cursor - lineStart
    };
  };
  this.token = function() {
    return token;
  };
  this.tokenFnMap = tokenFnMap = {};
  tokenOnSymbolChar = function() {
    var c2, cur;
    cur = cursor;
    while (char = text[++cursor]) {
      if (symbolStopChars[char]) {
        break;
      }
      if (char === '/' && ((c2 = text[cursor + 1]) === '/' || c2 === '*' || c2 === '!')) {
        break;
      }
    }
    return token.next = {
      type: tokenType = SYMBOL,
      value: text.slice(cur, cursor),
      cursor: cur,
      stopCursor: cursor,
      line: lineno,
      column: cursor - lineStart
    };
  };
  symbolStopChars = {};
  _ref2 = ' \t\v\n\r()[]{},;:#\'\".@\\';
  for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
    c = _ref2[_i];
    symbolStopChars[c] = true;
  }
  for (c in firstIdentifierCharSet) {
    symbolStopChars[c] = true;
  }
  _ref3 = '0123456789';
  for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
    c = _ref3[_j];
    symbolStopChars[c] = true;
  }
  tokenFnMap['#'] = tokenOnSharpChar = function() {
    var c2, cur;
    cur = cursor;
    while (1) {
      if ((char = text[++cursor]) !== '#') {
        break;
      }
    }
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
      type: tokenType = SYMBOL,
      kind: SYMBOL,
      value: text.slice(cur, cursor),
      cursor: cur,
      stopCursor: cursor,
      line: lineno,
      column: cursor - lineStart
    };
  };
  tokenFnMap['@'] = tokenFnMap['.'] = tokenOnAtChar = function() {
    var column, cur, first;
    cur = cursor;
    column = cursor - lineStart;
    first = char;
    char = text[++cursor];
    while (char === first) {
      char = text[++cursor];
    }
    return token.next = {
      type: tokenType = SYMBOL,
      kind: SYMBOL,
      value: text.slice(cur, cursor),
      cursor: cur,
      stopCursor: cursor,
      line: lineno,
      column: column,
      atom: cursor - cur === 1
    };
  };
  tokenFnMap[':'] = tokenOnColonChar = function() {
    var column, cur, first;
    cur = cursor;
    column = cursor - lineStart;
    first = char;
    char = text[++cursor];
    while (char === first) {
      char = text[++cursor];
    }
    if (cursor === cur + 1) {
      tokenType = PUNCTUATION;
    } else {
      tokenType = SYMBOL;
    }
    return token.next = {
      type: tokenType,
      kind: SYMBOL,
      value: text.slice(cur, cursor),
      atom: cursor - cur === 2,
      cursor: cur,
      stopCursor: cursor,
      line: lineno,
      column: column
    };
  };
  concatenateLine = function() {
    var column, cur, line;
    cur = cursor - 1;
    line = lineno;
    column = cursor - lineStart;
    indent = lexIndent;
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
      lexError('do not allow use tab character "\t" at the head of line.');
    } else if (char === '\n' || char === '\r') {
      lexError('should not follow empty line as concatenated line');
    } else if (!char) {
      lexError('unexpected end of input after concatenated line symbol "\"');
    }
    lexIndent = cursor - lineStart;
    if (lexIndent < indent) {
      lexError('expect the same indent or more indent for the concatenated lines');
    }
    skipInlineSpace();
    if ((char = text[cursor]) === '\n' || char === '\r') {
      lexError('concatenated line should not have only spaces and comments');
    }
    return token.next = {
      type: tokenType = SPACE,
      cursor: cur,
      stopCursor: cursor,
      line: line,
      stopLine: lineno,
      column: column,
      indent: lexIndent
    };
  };
  tokenFnMap[' '] = tokenFnMap['\t'] = tokenOnSpaceChar = function() {
    var column, cur, line, tkn;
    cur = cursor;
    line = lineno;
    column = cursor - lineStart;
    indent = lexIndent;
    char = text[++cursor];
    skipInlineSpace(indent);
    if (char === '\\') {
      char = text[++cursor];
      if (char === '\n' || c === '\r') {
        token.next = tkn = concatenateLine();
        tkn.cursor = cur;
        tkn.line = line;
        tkn.column = column;
        tkn.value = text.slice(cur, cursor);
        return tkn;
      } else {
        cursor--;
        return token.next = {
          type: tokenType = SPACE,
          kind: VALUE,
          transformed: true,
          value: text.slice(cur, cursor),
          cursor: cur,
          stopCursor: cursor,
          line: line,
          stopLine: lineno,
          column: column,
          indent: lexIndent
        };
      }
    } else if (char) {
      if (char !== '\n' && char !== '\r') {
        return token.next = {
          type: tokenType = SPACE,
          value: text.slice(cur, cursor),
          cursor: cur,
          stopCursor: cursor,
          line: line,
          stopLine: lineno,
          column: column,
          indent: lexIndent
        };
      } else {
        newLineAndEmptyLines();
        return token.next = {
          type: tokenType,
          value: text.slice(cur, cursor),
          cursor: cur,
          line: line,
          column: column,
          indent: lexIndent
        };
      }
    } else {
      return token.next = {
        type: tokenType = EOI,
        value: text.slice(cur, cursor),
        cursor: cur,
        line: line,
        column: column,
        indent: -1
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
      } else if ((lexIndent = cursor - lineStart) !== dent) {
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
    var c2;
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
    while (char && char !== '\n' && char !== '\r') {
      char = text[++cursor];
    }
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
          char = text[++cursor];
        }
        if (char === '\n' || char === '\r') {
          continue;
        }
        if (char === '\t') {
          lexError('unexpected tab character "\t" at the head of line');
        }
        if (cursor - lineStart <= dent) {
          break;
        }
        while (char && char !== '\n' && char !== '\r') {
          char = text[++cursor];
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
          lexError('unexpected tab character "\t" at the head of line');
        }
        if (cursor - lineStart <= dent) {
          break;
        }
        while (char && char !== '\n' && char !== '\r') {
          char = text[++cursor];
        }
      } else if (!char) {
        lexIndent = -1;
        break;
      }
    }
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
        _results.push(char = text[++cursor]);
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
        lexError('meet unexpected new line while parsing regular expression');
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
            lexError('too many modifiers "igm" after regexp');
          }
        }
        return;
      } else {
        char = text[++cursor];
      }
    }
    if (!char) {
      return lexError('unexpected end of input while parsing regexp');
    }
  };
  tokenFnMap['\\'] = tokenOnBackSlashChar = function() {
    var column, cur, line, tkn, _k, _len2, _ref4;
    cur = cursor;
    column = cursor - lineStart;
    char = text[++cursor];
    if (char === '\n' || char === '\r') {
      token.next = tkn = concatenateLine();
      tkn.cursor = cur;
      tkn.column = column;
      tkn.value = text.slice(cur, cursor);
      return tkn;
    }
    line = lineno;
    if (firstIdentifierCharSet[char]) {
      tkn = tokenOnIdentifierChar();
      tkn.type = tokenType = IDENTIFIER;
      tkn.escaped = true;
      tkn.cursor = cur;
      tkn.atom = true;
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
      token.type = tokenType = SYMBOL;
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
          type: tokenType = SYMBOL,
          value: '\\',
          cursor: cur,
          stopCursor: cursor,
          line: lineno,
          column: cur - lineStart,
          indent: lexIndent,
          next: tkn
        };
      } else {
        _ref4 = text.slice(cur + 2, tkn.stopCursor);
        for (_k = 0, _len2 = _ref4.length; _k < _len2; _k++) {
          c = _ref4[_k];
          if (c === '\n' || c === '\r') {
            lexError('unexpected new line characters in escaped string');
          }
        }
        tkn.escaped = true;
        tkn.cursor = cur;
        tkn.atom = true;
        return token.next = tkn;
      }
    } else {
      while (char = text[++cursor] === '\\') {
        true;
      }
      return token.next = {
        type: tokenType = SYMBOL,
        kind: SYMBOL,
        value: text.slice(cur, cursor),
        cursor: cur,
        stopCursor: cursor,
        line: lineno,
        column: cur - lineStart
      };
    }
  };
  tokenFnMap['/'] = tokenOnForwardSlashChar = function() {
    var column, cur, line, prev, tokenTypet, value;
    cur = cursor;
    column = cursor - lineStart;
    char = text[++cursor];
    line = lineno;
    indent = lexIndent;
    if (char === '/') {
      cursor++;
      char = text[cursor];
      while (char && char !== '\n' && char !== '\r') {
        cursor++;
        char = text[cursor];
      }
      if (char) {
        if (char !== '\n' && char !== '\r') {
          return token.next = {
            type: tokenType = SPACE,
            value: text.slice(cur, cursor),
            cursor: cur,
            stopCursor: cursor,
            line: line,
            stopLine: lineno,
            column: column,
            indent: lexIndent
          };
        } else {
          newLineAndEmptyLines();
          return token.next = {
            type: tokenType,
            value: text.slice(cur, cursor),
            cursor: cur,
            stopCursor: cursor,
            line: line,
            column: column,
            indent: lexIndent
          };
        }
      } else {
        return token.next = {
          type: tokenType = EOI,
          value: text.slice(cur, cursor),
          cursor: cur,
          stopCursor: cursor,
          line: line,
          column: column,
          indent: lexIndent
        };
      }
    } else if (char === '*') {
      leftCBlockComment();
      skipInlineSpace();
      if (char) {
        if (char !== '\n' && char !== '\r') {
          return token.next = {
            type: tokenType = SPACE,
            value: text.slice(cur, cursor),
            cursor: cur,
            stopCursor: cursor,
            line: line,
            stopLine: lineno,
            column: column,
            indent: lexIndent
          };
        } else {
          newLineAndEmptyLines();
          return token.next = {
            type: tokenType,
            value: text.slice(cur, cursor),
            cursor: cur,
            stopCursor: cursor,
            line: line,
            column: column,
            indent: lexIndent
          };
        }
      } else {
        return token.next = {
          type: tokenType = EOI,
          value: text.slice(cur, cursor),
          cursor: cur,
          stopCursor: cursor,
          line: line,
          column: column,
          indent: lexIndent
        };
      }
    } else if (char === '!') {
      cur = cursor;
      cursor += 2;
      char = text[cursor];
      column = cursor - lineStart;
      leftRegexp();
      return token.next = {
        type: tokenType = REGEXP,
        value: ['regexp!', '/' + text.slice(cur + 1, cursor)],
        atom: true,
        kind: LIST,
        cursor: cur,
        stopCursor: cursor,
        line: lineno,
        column: column
      };
    } else if (char === '.') {
      if (atLineHead) {
        char = text[++cursor];
        leftIndentBlockComment(indent);
        skipSpaceLines(indent);
        if (!char) {
          tokenType = EOI;
        } else if (lexIndent > indent) {
          tokenType = INDENT;
        } else if (lexIndent === indent) {
          tokenType = NEWLINE;
        } else {
          tokenTypet = UNDENT;
        }
        return token.next = {
          type: tokenType,
          value: text.slice(cur, cursor),
          cursor: cur,
          stopCursor: cursor,
          line: line,
          column: column
        };
      } else {
        return token.next = {
          type: tokenType = SYMBOL,
          value: "/",
          cursor: cur,
          stopCursor: cursor,
          line: line,
          column: column
        };
      }
    } else if (atLineHead) {
      return token.next = {
        type: tokenType = CODE_BLOCK_COMMENT_LEAD_SYMBOL,
        value: "/",
        cursor: cur,
        stopCursor: cursor,
        line: line,
        column: column
      };
    } else {
      char = text[++cursor];
      prev = token;
      tokenOnSymbolChar();
      value = "/" + token.value;
      token = {
        type: tokenType = SYMBOL,
        value: value,
        cursor: cur,
        stopCursor: cursor,
        line: line,
        column: column
      };
      return prev.next = token;
    }
  };
  newLineAndEmptyLines = function() {
    var type;
    while (1) {
      if (char === '\n') {
        char = text[++cursor];
        if (char === '\r') {
          char = text[++cursor];
        }
        lineStart = cursor;
        while (char && char === ' ') {
          char = text[++cursor];
        }
        if (char === '\t') {
          lexError('unexpected tab character "\t" at the head of line');
        }
        if (!char || (char !== '\n' && char !== '\r')) {
          break;
        }
      } else if (char === '\r') {
        char = text[++cursor];
        if (char === '\n') {
          char = text[++cursor];
        }
        lineStart = cursor;
        while (char && char === ' ') {
          char = text[++cursor];
        }
        if (char === '\t') {
          lexError('unexpected tab character "\t" at the head of line');
        }
        if (!char || (char !== '\n' && char !== '\r')) {
          break;
        }
      } else {
        break;
      }
    }
    if (!char) {
      type = EOI;
      return lexIndent = -1;
    } else {
      lexIndent = cursor - lineStart;
      if (lexIndent > indent) {
        return tokenType = INDENT;
      } else if (lexIndent < indent) {
        return tokenType = UNDENT;
      } else {
        return tokenType = NEWLINE;
      }
    }
  };
  tokenFnMap['\n'] = tokenFnMap['\r'] = tokenOnNewlineChar = function() {
    var column, cur, line;
    cur = cursor;
    line = lineno;
    column = cursor - lineStart;
    indent = lexIndent;
    newLineAndEmptyLines();
    return token.next = {
      type: tokenType,
      value: text.slice(cur, cursor),
      cursor: cur,
      stopCursor: cursor,
      line: line,
      column: column,
      indent: lexIndent
    };
  };
  identifierCharSet = taijiIdentifierCharSet;
  tokenOnIdentifierChar = function() {
    var column, cur, isAtom, txt;
    cur = cursor;
    char = text[++cursor];
    column = cursor - lineStart;
    while (char && identifierCharSet[char]) {
      char = text[++cursor];
    }
    if (char === '=' && text[cursor - 1] === '!') {
      char = text[--cursor];
    }
    txt = text.slice(cur, cursor);
    if (keywordHasOwnProperty(txt)) {
      tokenType = KEYWORD;
      isAtom = false;
    } else if (conjunctionHasOwnProperty(txt)) {
      tokenType = CONJUNCTION;
      isAtom = false;
    } else {
      tokenType = IDENTIFIER;
      isAtom = true;
    }
    return token.next = {
      type: tokenType,
      kind: SYMBOL,
      transformed: true,
      value: txt,
      atom: isAtom,
      cursor: cur,
      stopCursor: cursor,
      line: lineno,
      column: column
    };
  };
  for (c in firstIdentifierCharSet) {
    tokenFnMap[c] = tokenOnIdentifierChar;
  }
  tokenOnNumberChar = function() {
    var base, baseStart, c2, column, cur, dotCursor, meetDigit;
    cur = cursor;
    base = 10;
    column = cursor - lineStart;
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
        baseStart = cursor;
      }
    } else {
      meetDigit = true;
      baseStart = cursor;
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
        lexError('binary number followed by ".eE"');
      } else if (('2' <= char && char <= '9')) {
        lexError('binary number followed by 2-9');
      }
    }
    if (base === 16) {
      if (char === '.') {
        lexError('hexadecimal number followed by "."');
      } else if (letterCharSet[char]) {
        lexError('hexadecimal number followed by g-z or G-Z');
      }
    }
    if (base !== 10) {
      if (cursor === baseStart) {
        cursor--;
        char = text[cursor];
        return token.next = {
          type: tokenType = NUMBER,
          kind: VALUE,
          transformed: true,
          value: parseInt(text.slice(baseStart, cursor), base),
          atom: true,
          cursor: cur,
          stopCursor: cursor,
          line: lineno,
          column: column
        };
      } else {
        return token.next = {
          type: tokenType = NUMBER,
          kind: VALUE,
          transformed: true,
          value: parseInt(text.slice(baseStart, cursor), base),
          atom: true,
          cursor: cur,
          line: lineno,
          column: column
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
        type: tokenType = NUMBER,
        kind: VALUE,
        transformed: true,
        value: parseInt(text.slice(baseStart, cursor), base),
        atom: true,
        cursor: cur,
        stopCursor: cursor,
        line: lineno,
        column: column
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
            type: tokenType = NUMBER,
            kind: VALUE,
            transformed: true,
            value: parseInt(text.slice(cur, dotCursor), base),
            atom: true,
            cursor: cur,
            stopCursor: cursor,
            line: lineno,
            column: column
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
          type: tokenType = NUMBER,
          kind: VALUE,
          transformed: true,
          value: parseInt(text.slice(cur, dotCursor), base),
          atom: true,
          cursor: cur,
          stopCursor: cursor,
          line: lineno,
          column: column
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
      type: tokenType = NUMBER,
      kind: VALUE,
      transformed: true,
      value: parseFloat(text.slice(cur, cursor), base),
      atom: true,
      cursor: cur,
      stopCursor: cursor,
      line: lineno,
      column: column
    };
  };
  _ref4 = '0123456789';
  for (_k = 0, _len2 = _ref4.length; _k < _len2; _k++) {
    c = _ref4[_k];
    tokenFnMap[c] = tokenOnNumberChar;
  }
  tokenFnMap[','] = tokenOnCommaChar = function() {
    var cur;
    cur = cursor;
    char = text[++cursor];
    return token.next = {
      type: tokenType = PUNCTUATION,
      kind: SYMBOL,
      value: ',',
      line: lineno,
      cursor: cursor,
      stopCursor: cursor,
      column: cur - lineStart
    };
  };
  tokenFnMap[';'] = tokenOnSemiColonChar = function() {
    var cur;
    cur = cursor;
    char = text[++cursor];
    return token.next = {
      value: ';',
      kind: SYMBOL,
      type: tokenType = PUNCTUATION,
      cursor: cursor,
      stopCursor: cursor,
      line: lineno,
      column: cur - lineStart
    };
  };
  concatenating = false;
  tokenFnMap["'"] = tokenOnSingleQuoteChar = function() {
    var column;
    char = text[++cursor];
    column = cursor - lineStart;
    if (char === "'") {
      if (text[cursor + 1] === "'") {
        cursor += 2;
        char = text[cursor];
        return token.next = leftRawNonInterpolatedString();
      } else {
        char = text[++cursor];
        return token.next = {
          value: '""',
          type: tokenType = NON_INTERPOLATE_STRING,
          kind: VALUE,
          transformed: true,
          atom: true,
          cursor: cursor - 2,
          line: lineno,
          column: column,
          atom: true
        };
      }
    } else {
      return token.next = leftNonInterpolatedString();
    }
  };
  leftRawNonInterpolatedString = function() {
    var cur, indentInfo, line, s;
    cur = cursor - 3;
    line = lineno;
    if (cursor === indent + 3) {
      indentInfo = {
        indent: lexIndent
      };
    } else {
      indentInfo = {};
    }
    s = '';
    while (char) {
      if (char === "'") {
        if (text[cursor + 1] === "'") {
          if (text[cursor + 2] === "'") {
            cursor += 3;
            char = text[cursor];
            return {
              type: tokenType = NON_INTERPOLATE_STRING,
              kind: VALUE,
              transformed: true,
              value: '"' + s + '"',
              atom: true,
              start: cur,
              stop: cursor,
              line: line,
              stopLine: lineno
            };
          } else {
            s += "''";
            cursor += 2;
            char = text[cursor];
          }
        } else {
          s += "'";
          char = text[++cursor];
        }
      } else if (char === '\\') {
        if ((c = text[cursor + 1]) === '\n' || c === '\r') {
          char = text[++cursor];
          concatenating = true;
          break;
        } else {
          s += '\\\\';
          char = text[++cursor];
        }
      } else if (char !== '\n' && char !== '\r') {
        s += char;
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
              type: tokenType = NON_INTERPOLATE_STRING,
              kind: VALUE,
              transformed: true,
              value: '"' + s + '"',
              atom: true,
              start: cur,
              stop: cursor,
              line: line,
              stopLine: lineno
            };
          } else {
            s += "''";
            cursor += 2;
            char = text[cursor];
          }
        } else {
          s += "'";
          char = text[++cursor];
        }
      } else {
        s += rawNonInterpolatedStringLine(indentInfo);
      }
    }
    if (!text[cursor]) {
      return lexError("expect ''', unexpected end of input while parsing interpolated string");
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
      lexError('unexpected tab character "\t" at the head of line');
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
      lexError('expect equal to or more than the indent of first line of the string');
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
          lexError('unexpected end of input while parsing non interpolated string');
        }
      } else {
        result += char;
        char = text[++cursor];
      }
    }
    return lexError('unexpected end of input while parsing non interpolated string');
  };
  leftNonInterpolatedString = function() {
    var column, cur, indentInfo, line, s;
    cur = cursor - 1;
    line = lineno;
    column = cur - lineStart;
    if (cursor === indent + 1) {
      indentInfo = {
        value: indent
      };
    } else {
      indentInfo = {};
    }
    s = '';
    while (char) {
      if (char === "'") {
        char = text[++cursor];
        return {
          type: tokenType = NON_INTERPOLATE_STRING,
          value: '"' + s + '"',
          kind: VALUE,
          transformed: true,
          atom: true,
          cursor: cur,
          stopCursor: cursor,
          line: line,
          stopLine: lineno,
          column: column
        };
      } else if (char === '\\') {
        if ((c = text[cursor + 1]) === '\n' || c === '\r') {
          char = text[++cursor];
          concatenating = true;
          break;
        } else if (c === "'") {
          s += "'";
          cursor += 2;
          char = text[cursor];
        } else {
          s += '\\';
          char = text[++cursor];
        }
      } else if (char !== '\n' && char !== '\r') {
        s += char;
        char = text[++cursor];
      } else {
        break;
      }
    }
    while (char && char !== "'") {
      s += nonInterpolatedStringLine(indentInfo);
    }
    if (char === "'") {
      char = text[++cursor];
      return {
        type: tokenType = NON_INTERPOLATE_STRING,
        value: '"' + s + '"',
        kind: VALUE,
        transformed: true,
        atom: true,
        cursor: cur,
        stopCursor: cursor,
        line: line,
        stopLine: lineno,
        column: column
      };
    } else {
      return lexError("expect \"'\", unexpected end of input while parsing interpolated string");
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
      lexError('unexpected tab character "\t" at the head of line');
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
      lexError('expect equal to or more than the indent of first line of the string');
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
          lexError('unexpected end of input while parsing non interpolated string');
        }
      } else if (char === '"') {
        result += '\\"';
        char = text[++cursor];
      } else {
        result += char;
        char = text[++cursor];
      }
    }
    return lexError('unexpected end of input while parsing non interpolated string');
  };
  tokenFnMap['"'] = tokenOnDoubleQuoteChar = function() {
    var tkn, tkn2;
    char = text[++cursor];
    if (char === '"') {
      if (text[cursor + 1] === '"') {
        cursor += 2;
        char = text[cursor];
        tkn = token;
        tkn2 = leftRawInterpolateString();
        tkn.next = tkn2;
        return tkn2;
      } else {
        char = text[++cursor];
        return token.next = {
          value: '""',
          type: tokenType = NON_INTERPOLATE_STRING,
          kind: VALUE,
          transformed: true,
          atom: true,
          line: lineno,
          cursor: cursor - 2,
          column: cursor - 2 - lineStart
        };
      }
    } else {
      tkn = token;
      tkn2 = leftInterpolateString();
      tkn.next = tkn2;
      return tkn2;
    }
  };
  this.leftRawInterpolateString = leftRawInterpolateString = function() {
    var column, cur, i, ind, indentInfo, line, literalStart, n, pieces, s, x;
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
    s = '"';
    while (char) {
      if (char === '"') {
        if (text[cursor + 1] === '"') {
          if (text[cursor + 2] === '"') {
            cursor += 3;
            char = text[cursor];
            if (s !== '"') {
              pieces.push(norm(s += '"'));
            }
            pieces.unshift(norm('string!'));
            return {
              type: tokenType = INTERPOLATE_STRING,
              value: pieces,
              kind: LIST,
              atom: true,
              cursor: cur,
              stopCursor: cursor,
              line: line,
              stopLine: line
            };
          } else {
            cursor += 2;
            char = text[cursor];
          }
        } else {
          s += '"';
          char = text[++cursor];
        }
      } else if (char === '\n') {
        if (!concatenating) {
          s += '\\n';
        }
        char = text[++cursor];
        if (char === '\r') {
          if (!concatenating) {
            s += '\\r';
          }
          char = text[++cursor];
        }
        concatenating = false;
        while (1) {
          lineno++;
          while (char === ' ') {
            s += char;
            char = text[++cursor];
          }
          if (char === '\n') {
            s += '\\n';
            char = text[++cursor];
            if (char === '\r') {
              s += '\\r';
              char = text[++cursor];
            }
            continue;
          } else if (char === '\r') {
            s += '\\r';
            char = text[++cursor];
            if (char === '\n') {
              s += '\\n';
              char = text[++cursor];
            }
            continue;
          } else {
            break;
          }
        }
        column = cursor - lineStart;
        if (char === '\t') {
          lexError('unexpected tab character "\t" in the head of line');
        }
        if (indentInfo.value === void 0) {
          indentInfo.value = column;
        }
        ind = indentInfo.value;
        if (ind < column) {
          lexError('expect equal to or more than the indent of first line of the string');
        } else if (ind > column) {
          i = 0;
          n = column - ind;
          while (i++ < n) {
            s += ' ';
          }
        }
      } else if (char === '\r') {
        if (!concatenating) {
          s += '\\r';
        }
        char = text[++cursor];
        if (char === '\n') {
          if (!concatenating) {
            s += '\\n';
          }
          char = text[++cursor];
        }
        concatenating = false;
        while (1) {
          lineno++;
          while (char === ' ') {
            s += char;
            char = text[++cursor];
          }
          if (char === '\n') {
            s += '\\n';
            char = text[++cursor];
            if (char === '\r') {
              s += '\\r';
              char = text[++cursor];
            }
            continue;
          } else if (char === '\r') {
            s += '\\r';
            char = text[++cursor];
            if (char === '\n') {
              s += '\\n';
              char = text[++cursor];
            }
            continue;
          } else {
            break;
          }
        }
        column = cursor - lineStart;
        if (char === '\t') {
          lexError('unexpected tab character "\t" in the head of line');
        } else if ((ind = indentInfo.value) !== void 0) {
          indentInfo.value = column;
        } else if (ind > column) {
          i = 0;
          n = column - ind;
          while (i++ < n) {
            s += ' ';
          }
        } else if (ind < column) {
          lexError('expect equal to or more than the indent of first line of the string');
        }
      } else if (char === '(' || char === '{' || char === '[') {
        pieces.push(s + '"');
        matchToken();
        pieces.push(token);
        s = '"';
      } else if (char === '$') {
        if ((char = text[++cursor])) {
          if (!firstIdentifierCharSet[char]) {
            s += '$';
          } else {
            char = '$';
            --cursor;
            pieces.push(norm(s + '"'));
            s = '"';
          }
        } else {
          break;
        }
      } else if (char === '$') {
        literalStart = ++cursor;
        char = text[cursor];
        if (!firstIdentifierCharSet[char]) {
          s += '$';
        } else {
          x = parser.interpolateExpression();
          if (text[cursor] === ':') {
            char = text[++cursor];
            pieces.push(norm(s + text.slice(literalStart, cursor) + '"'));
            s = '"';
          } else if (s !== '"') {
            pieces.push(norm(s + '"'));
            s = '"';
          }
          pieces.push(x);
        }
      } else if (char === '\\') {
        char = text[++cursor];
        if (char === '\n' || char === '\r') {
          concatenating = true;
        } else if (char) {
          s += '\\\\';
        } else {
          lexError('unexpected end of input while parsing interpolated string');
        }
      } else {
        s += char;
        char = text[++cursor];
      }
    }
    if (!text[cursor]) {
      return lexError('expect \'"\', unexpected end of input while parsing interpolated string');
    }
  };
  leftInterpolateString = function() {
    var column, cur, i, ind, indentInfo, line, literalStart, n, pieces, s, x;
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
    s = '"';
    while (char) {
      if (char === '"') {
        if (s !== '"') {
          pieces.push(norm(s + '"'));
        }
        char = text[++cursor];
        pieces.unshift(norm('string!'));
        return {
          type: tokenType = INTERPOLATE_STRING,
          value: pieces,
          kind: LIST,
          atom: true,
          cursor: cur,
          stopCursor: cursor,
          line: line,
          stopLine: line
        };
      } else if (char === '\n') {
        if (!concatenating) {
          s += char;
        }
        char = text[++cursor];
        if (char === '\r') {
          if (!concatenating) {
            s += char;
          }
          char = text[++cursor];
        }
        concatenating = false;
        while (1) {
          lineno++;
          while (char === ' ') {
            s += char;
            char = text[++cursor];
          }
          if (char === '\n') {
            s += char;
            char = text[++cursor];
            if (char === '\r') {
              s += char;
              char = text[++cursor];
            }
            continue;
          } else if (char === '\r') {
            s += char;
            char = text[++cursor];
            if (char === '\n') {
              s += char;
              char = text[++cursor];
            }
            continue;
          } else {
            break;
          }
        }
        column = cursor - lineStart;
        if (char === '\t') {
          lexError('unexpected tab character "\t" in the head of line');
        } else if (indentInfo.value === void 0) {
          indentInfo.value = column;
        } else {
          ind = indentInfo.value;
          if (ind > column) {
            i = 0;
            n = column - ind;
            while (i++ < n) {
              result += ' ';
            }
          } else if (ind < column) {
            lexError('expect equal to or more than the indent of first line of the string');
          }
        }
      } else if (char === '\r') {
        if (!concatenating) {
          s += char;
        }
        char = text[++cursor];
        if (char === '\n') {
          if (!concatenating) {
            s += char;
          }
          char = text[++cursor];
        }
        concatenating = false;
        while (1) {
          lineno++;
          while (char === ' ') {
            s += char;
            char = text[++cursor];
          }
          if (char === '\n') {
            s += char;
            char = text[++cursor];
            if (char === '\r') {
              s += char;
              char = text[++cursor];
            }
            continue;
          } else if (char === '\r') {
            s += char;
            char = text[++cursor];
            if (char === '\n') {
              s += char;
              char = text[++cursor];
            }
            continue;
          } else {
            break;
          }
        }
        column = cursor - lineStart;
        if (char === '\t') {
          lexError('unexpected tab character "\t" in the head of line');
        } else if (indentInfo.value === void 0) {
          indentInfo.value = column;
        } else {
          ind = indentInfo.value;
          if (ind > column) {
            i = 0;
            n = column - ind;
            while (i++ < n) {
              result += ' ';
            }
          } else if (ind < column) {
            lexError('expect equal to or more than the indent of first line of the string');
          }
        }
      } else if (char === '$') {
        literalStart = ++cursor;
        char = text[cursor];
        if (!firstIdentifierCharSet[char]) {
          s += '$';
        } else {
          x = parser.interpolateExpression();
          if (text[cursor] === ':') {
            char = text[++cursor];
            pieces.push(norm(s + text.slice(literalStart, cursor) + '"'));
            s = '"';
          } else if (s !== '"') {
            pieces.push(norm(s + '"'));
            s = '"';
          }
          pieces.push(x);
        }
      } else if (char === '(' || char === '{' || char === '[') {
        pieces.push(norm(s + '"'));
        matchToken();
        pieces.push(token);
        s = '"';
      } else if (char === '\\') {
        if (!(char = text[++cursor])) {
          break;
        } else if (char === '\n' || char === '\r') {
          char = text[++cursor];
          concatenating = true;
        } else {
          s += '\\' + char;
          char = text[++cursor];
        }
      } else {
        s += char;
        char = text[++cursor];
      }
    }
    if (!text[cursor]) {
      return lexError('expect \'"\', but meet end of input while parsing interpolated string');
    }
  };
  tokenFnMap['('] = tokenOnLeftParenChar = function() {
    var column, cur, exp, ind, line, parenVariantFn, prev;
    cur = cursor;
    line = lineno;
    column = cursor - lineStart;
    char = text[++cursor];
    prev = token;
    matchToken();
    if ((parenVariantFn = parenVariantMap[token.value])) {
      prev.next = token = parenVariantFn();
      token.cursor = cursor;
      token.line = line;
      token.column = column;
      return token;
    } else {
      if (tokenType === UNDENT) {
        lexError('unexpected undent while parsing parenethis "(...)"');
      }
      ind = indent = lexIndent;
      if (tokenType === SPACE || tokenType === NEWLINE || tokenType === INDENT) {
        nextToken();
      }
      if (token.value === ')') {
        return prev.next = token = {
          value: [
            {
              value: '()',
              kind: SYMBOL
            }
          ],
          type: tokenType = PAREN,
          kind: LIST,
          atom: true,
          cursor: cur,
          stopCursor: cursor,
          line: lineno,
          column: column,
          indent: lexIndent,
          empty: true,
          parameters: true
        };
      }
      exp = parser.operatorExpression();
      if (tokenType === UNDENT) {
        if (token.indent < ind) {
          lexError('expect ) indent equal to or more than (');
        } else {
          nextToken();
        }
      } else {
        if (tokenType === SPACE) {
          nextToken();
        }
        if (token.value !== ')') {
          lexError('expect )');
        }
      }
      return prev.next = token = {
        value: [norm('()'), exp],
        kind: LIST,
        type: tokenType = PAREN,
        cursor: cur,
        stopCursor: cursor,
        line: line,
        column: column,
        indent: lexIndent,
        atom: true,
        parameters: true
      };
    }
  };
  parenVariantMap = {};
  tokenFnMap['['] = tokenOnLeftBracketChar = function() {
    var bracketVariantFn, column, cur, exp, line, prev, value;
    trace("tokenFnMap['[']: ", nextPiece());
    cur = cursor;
    char = text[++cursor];
    line = lineno;
    column = cursor - lineStart;
    prev = token;
    matchToken();
    if ((bracketVariantFn = bracketVariantMap[token.value])) {
      token = bracketVariantFn();
      token.cursor = cur;
      token.line = lineno;
      token.column = column;
      return token;
    } else {
      exp = parser.block() || parser.lineBlock();
      if (tokenType === UNDENT) {
        if (token.indent < ind) {
          lexError('unexpected undent while parsing parenethis "[...]"');
        } else {
          nextToken();
        }
      }
      if (token.value !== ']') {
        lexError('expect ]');
      }
      if (!exp) {
        value = [norm('[]')];
      } else {
        value = [norm('[]'), exp];
      }
      return prev.next = token = {
        value: value,
        type: tokenType = BRACKET,
        kind: LIST,
        cursor: cur,
        stopCursor: cursor,
        line: line,
        column: column,
        indent: lexIndent,
        atom: true
      };
    }
  };
  bracketVariantMap = {};
  tokenFnMap['{'] = function() {
    var body, column, cur, curveVariantFn, ind, line, prev, tkn;
    trace("tokenFnMap['{']: " + nextPiece());
    cur = cursor;
    char = text[++cursor];
    line = lineno;
    column = cursor - lineStart;
    ind = lexIndent;
    prev = token;
    matchToken();
    if ((curveVariantFn = curveVariantMap[token.value])) {
      prev.next = token = curveVariantFn();
      token.cursor = cur;
      token.stopCursor = cursor;
      token.line = line;
      token.stopLine = lineno;
      token.column = column;
      token.indent = lexIndent;
      return token;
    } else {
      if (tokenType === SPACE) {
        nextToken();
      }
      if (token.value === '}' && (tkn = nextToken())) {
        return prev.next = token = {
          value: [norm('{}')],
          kind: LIST,
          atom: true,
          cursor: cur,
          stopCursor: cursor,
          line: line,
          column: column,
          indent: lexIndent,
          next: tkn
        };
      }
      body = parser.block() || parser.lineBlock();
      if (tokenType === UNDENT && token.indent < ind) {
        nextToken();
      }
      if (token.value !== '}') {
        lexError('expect }');
      }
      tkn = nextToken();
      if (indent < ind) {
        lexError('unexpected undent while parsing parenethis "{...}"');
      }
    }
    return prev.next = token = {
      value: [norm('{}'), begin(body)],
      kind: LIST,
      type: tokenType = CURVE,
      atom: true,
      cursor: cur,
      stopCursor: cursor,
      line: line,
      column: column,
      indent: lexIndent,
      next: tkn
    };
  };
  curveVariantMap = {
    '.': function() {
      nextToken();
      return parser.hash();
    }
  };
  this.hash = function() {
    var ind, items, start;
    start = token;
    ind = indent;
    if (tokenType === SPACE) {
      if (token.stopLine === token.line) {
        nextToken();
        items = hashLineBlock(ind);
      } else {
        items = hashBlock(ind);
      }
    } else if (tokenType === INDENT) {
      nextToken();
      items = parser.hashBlock(ind);
    } else {
      items = hashLineBlock(ind);
    }
    if (tokenType === UNDENT) {
      nextToken();
    }
    if (token.indent < ind) {
      lexError("expect the same indent as or more indent as the start line of hash block");
    }
    if (token.value !== '}') {
      lexError('expect }');
    }
    nextToken();
    return {
      value: [norm('hash!')].concat(items),
      atom: true,
      start: start,
      stop: token
    };
  };
  hashLineBlock = function(dent) {
    var items;
    items = hashLine(dent);
    if (tokenType === INDENT) {
      nextToken();
    } else if (tokenType === UNDENT) {
      if (token.indent <= dent) {
        return items;
      } else {
        nextToken();
      }
    }
    items.push.apply(items, hashBlock(indent));
    return items;
  };
  hashLine = function() {
    var result, value, x;
    result = [];
    while ((x = parser.hashItem())) {
      result.push(x);
      if ((value = token.value) === ';') {
        nextToken();
        if (tokenType === SPACE) {
          nextToken();
        }
      } else if (tokenType === NEWLINE) {
        nextToken();
        break;
      } else if (tokenType === UNDENT || value === '}') {
        break;
      } else if (tokenType === EOI) {
        lexError("unexpected end of input while parsing hash block");
      }
    }
    return result;
  };
  hashBlock = function() {
    var blk, items, result, start, value;
    start = token;
    result = [];
    while ((items = hashLine())) {
      result.push.apply(result, items);
      if (tokenType === EOI) {
        lexError("unexpected end of input while parsing hash block");
      } else if (tokenType === UNDENT) {
        break;
      } else if ((value = token.value) === ';') {
        nextToken();
      } else if (value === '}') {
        break;
      }
      if (tokenType === INDENT) {
        if (token.isComment) {
          blk = parser.hashBlock();
          result.push.apply(result, blk);
        } else {
          lexError("unexpected indent while parsing hash block");
        }
      }
    }
    result.start = start;
    result.stop = token;
    return result;
  };
  this.hashItem = hashItem = function() {
    var blk, js, key, result, start, tkn, type, value;
    if (tokenType === UNDENT) {
      return;
    }
    start = token;
    if (key = parser.hashKeyExpression()) {
      if (tokenType === NEWLINE || tokenType === UNDENT) {
        lexError('unexpected new line after hash key');
      } else if (tokenType === EOI) {
        "unexpected end of input after hash key";
      } else if (tokenType === SPACE) {
        nextToken();
      }
      if ((value = token.value) === ':' && nextToken()) {
        if ((type = key.type) === IDENTIFIER || type === NUMBER || type === NON_INTERPOLATE_STRING) {
          js = true;
        }
      } else if (value === '->') {
        nextToken();
      } else {
        lexError('expect : or -> for hash item definition');
      }
      if (tokenType === SPACE) {
        nextToken();
      }
      if (tokenType === INDENT) {
        nextToken();
        tkn = token;
        blk = hashBlock();
        value = {
          value: [
            {
              value: 'hash!',
              kind: SYMBOL
            }
          ].concat(blk),
          kind: LIST,
          start: tkn,
          stop: token
        };
      } else {
        value = parser.clause();
      }
      if (!value) {
        lexError('expect value of hash item');
      }
      if (js) {
        result = [
          {
            value: 'jshashitem!',
            kind: SYMBOL
          }, key, value
        ];
      } else {
        result = [
          {
            value: 'pyhashitem!',
            kind: SYMBOL
          }, key, value
        ];
      }
      ({
        value: result,
        start: start,
        stop: token
      });
      return result;
    }
  };
  tokenOnRightDelimiterChar = function() {
    var cur;
    c = char;
    cur = cursor;
    char = text[++cursor];
    return token.next = {
      type: tokenType = RIGHT_DELIMITER,
      value: c,
      cursor: cur,
      stopCursor: cursor,
      line: lineno,
      column: cur - lineStart
    };
  };
  _ref5 = ')]}';
  for (_l = 0, _len3 = _ref5.length; _l < _len3; _l++) {
    c = _ref5[_l];
    tokenFnMap[c] = tokenOnRightDelimiterChar;
  }
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
  spaces = function() {
    var cur;
    cur = cursor;
    while (char === ' ' || char === '\t') {
      char = text[++cursor];
    }
    return {
      value: text.slice(cur, cursor)
    };
  };
  matchChar = function(c) {
    if (char === c) {
      char = text[++cursor];
      return true;
    }
  };
  this.literal = literal = function(string) {
    var length;
    length = string.length;
    if (text.slice(cursor, cursor + length) === string) {
      cursor += length;
      char = text[cursor];
      return true;
    }
  };
  this.decimal = decimal = function() {
    var cur;
    cur = cursor;
    while (('0' <= char && char <= '9')) {
      char = text[++cursor];
    }
    if (cursor === cur) {
      return;
    }
    return {
      value: text.slice(cur, cursor),
      cursor: cur
    };
  };
  this.prefixOperator = function(mode) {
    var op, opToken, priInc, tokenText;
    tokenText = token.value;
    if (!hasOwnProperty.call(prefixOperatorDict, tokenText) || !(op = prefixOperatorDict[tokenText])) {
      return;
    }
    if ((mode === COMPACT_CLAUSE_EXPRESSION || mode === SPACE_CLAUSE_EXPRESSION) && op.definition) {
      return;
    }
    if (token.escaped) {
      return;
    }
    opToken = token;
    nextToken();
    if (tokenType === INDENT) {
      syntaxError('unexpected indent after prefix operator');
    } else if (tokenType === NEWLINE) {
      syntaxError('unexpected new line after prefix operator');
    } else if (tokenType === UNDENT) {
      syntaxError('unexpected undent after prefix operator');
    } else if (tokenType === RIGHT_DELIMITER) {
      syntaxError('unexpected ' + token.value + ' after prefix operator');
    } else if (tokenType === SPACE) {
      if (op.definition && mode === SPACE_CLAUSE_EXPRESSION) {
        token = opToken;
        tokenType = opToken.type;
        return;
      } else if (opToken.value === '@' || opToken.value === '::') {
        token = opToken;
        tokenType = opToken.type;
        return;
      }
      nextToken();
      priInc = 300;
    } else if (tokenType === SYMBOL) {
      if (opToken.value === '@' || opToken.value === '::') {
        token = opToken;
        tokenType = opToken.type;
        return;
      } else if (token.value === '.') {
        nextToken();
        if (tokenType === SPACE || tokenType === NEWLINE || tokenType === UNDENT || tokenType === INDENT || tokenType === EOI) {
          lexError('unexpected spaces or new lines or end of lines after compact prefix Operaotr and "."');
        }
      }
      priInc = 600;
    } else {
      priInc = 600;
    }
    return {
      value: opToken.value,
      kind: SYMBOL,
      transformed: true,
      start: opToken,
      stop: token,
      priority: op.priority + priInc
    };
  };
  this.suffixOperator = function(mode, x) {
    var op, opToken;
    if (tokenType !== SYMBOL) {
      return;
    }
    if ((op = suffixOperatorDict[token.value])) {
      opToken = token;
      nextToken();
      if (tokenType === SPACE || tokenType === NEWLINE || tokenType === INDENT || tokenType === UNDENT || tokenType === EOI || tokenType === RIGHT_DELIMITER) {
        return {
          value: opToken.value,
          start: opToken,
          stop: token,
          priority: op.priority + 600
        };
      } else {
        token = opToken;
        tokenType = opToken.type;
      }
    }
  };
  binaryOperatorMemoIndex = memoIndex;
  memoIndex += 10;
  this.binaryOperator = function(mode, x) {
    var m, memoTag, op, opToken, opValue, pri, priInc, result, rightAssoc, start, tkn, type1;
    memoTag = 'm' + (binaryOperatorMemoIndex + mode);
    if (m = token[memoTag]) {
      token = m.next || token;
      tokenType = token.type;
      return m.result;
    }
    start = token;
    switch (type1 = tokenType) {
      case EOI:
      case RIGHT_DELIMITER:
        token[memoTag] = {};
        return;
      case NEWLINE:
        priInc = 0;
        nextToken();
        break;
      case UNDENT:
        if (mode !== OPERATOR_EXPRESSION) {
          token[memoTag] = {};
          return;
        } else {
          priInc = 0;
          nextToken();
        }
        break;
      case INDENT:
        if (mode !== OPERATOR_EXPRESSION && mode !== INDENT_EXPRESSION) {
          token[memoTag] = {};
          return;
        } else {
          priInc = 0;
          nextToken();
        }
        break;
      case SPACE:
        if (mode === COMPACT_CLAUSE_EXPRESSION) {
          token[memoTag] = {};
          return;
        } else {
          start = token;
          nextToken();
          if (tokenType !== IDENTIFIER && tokenType !== SYMBOL && tokenType !== PUNCTUATION) {
            start[memoTag] = {};
            token = start;
            tokenType = token.type;
            return;
          }
          if (token.value === '.') {
            if (nextToken() && tokenType === SPACE && nextToken()) {
              return {
                value: '.',
                priority: 800,
                start: start
              };
            } else {
              token[memoTag] = {};
              token = start;
              tokenType = token.type;
              return;
            }
          } else {
            priInc = 300;
          }
        }
        break;
      case PUNCTUATION:
        if (mode !== OPERATOR_EXPRESSION && mode !== INDENT_EXPRESSION) {
          token[memoTag] = {};
          return;
        } else {
          priInc = 600;
        }
        break;
      case PAREN:
        return {
          value: 'concat()',
          priority: 800,
          start: token,
          kind: SYMBOL
        };
      case BRACKET:
        return {
          value: 'concat[]',
          priority: 800,
          start: token,
          kind: SYMBOL
        };
      case IDENTIFIER:
        start[binaryOperatorMemoIndex + mode] = {};
        return;
      case SYMBOL:
        tkn = token;
        if (token.value === "." && (tkn = token) && nextToken()) {
          if (tokenType === IDENTIFIER) {
            return {
              value: '.',
              start: tkn,
              priority: 800
            };
          } else if (tokenType === SPACE || tokenType === NEWLINE || tokenType === INDENT || tokenType === UNDENT || tokenType === EOI) {
            if (mode === OPERATOR_EXPRESSION) {
              syntaxError('unexpected space or new line or end of line after "."');
            } else {
              token = tkn;
              tokenType = token.type;
              return;
            }
          } else if (tokenType === NUMBER || tokenType === NON_INTERPOLATE_STRING || tokenType === INTERPOLATE_STRING) {
            return {
              value: '.',
              type: tokenType = SYMBOL,
              start: tkn,
              priority: 800
            };
          } else {
            priInc = 600;
          }
        } else {
          priInc = 600;
        }
        break;
      default:
        priInc = 600;
    }
    opValue = token.value;
    if ((mode === COMPACT_CLAUSE_EXPRESSION || mode === SPACE_CLAUSE_EXPRESSION) && opValue === ',' || opValue === ';' || opValue === ':') {
      start[memoTag] = {};
      token = start;
      tokenType = token.type;
      return;
    }
    if (!hasOwnProperty.call(binaryOperatorDict, opValue)) {
      start[binaryOperatorMemoIndex + mode] = {};
      token = start;
      tokenType = token.type;
      return;
    }
    op = binaryOperatorDict[opValue];
    if ((op.definition || op.assign) && mode === SPACE_CLAUSE_EXPRESSION) {
      start[binaryOperatorMemoIndex + mode] = {};
      token = start;
      tokenType = token.type;
      return;
    }
    if (token.value === '->' && mode === HASH_KEY_EXPRESSION) {
      start[binaryOperatorMemoIndex + mode] = {};
      token = start;
      tokenType = token.type;
      return;
    }
    opToken = token;
    nextToken();
    if (token.value === '.') {
      if (priInc === 300) {
        syntaxError('unexpected "." after binary operator ' + opToken.value + ', here should be spaces, comment or newline');
      } else {
        nextToken();
      }
    }
    switch (tokenType) {
      case SPACE:
        if (priInc === 600) {
          if (opValue === ',') {
            priInc = 300;
            nextToken();
          } else {
            syntaxError('unexpected spaces or new lines after binary operator "' + opValue + '" before which there is no space.');
          }
        } else if (priInc === 300) {
          nextToken();
        } else {
          nextToken();
          if (type1 === INDENT) {
            indentExpression();
          }
        }
        break;
      case NEWLINE:
        if (opValue !== ',') {
          syntaxError('unexpected new line after binary operator ' + opValue);
        } else if (priInc === 0) {
          syntaxError('a single binary operator should not occupy whole line.');
        } else {
          priInc = 0;
        }
        break;
      case UNDENT:
        if (mode !== OPERATOR_EXPRESSION) {
          syntaxError('unexpected undent after binary operator ' + opValue);
        } else {
          return;
        }
        break;
      case INDENT:
        if (opValue !== ',') {
          syntaxError('unexpected indent after binary operator ' + opValue);
        }
        priInc = 0;
        indentExpression();
        break;
      case EOI:
        if (mode !== OPERATOR_EXPRESSION) {
          syntaxError('unexpected end of input, expect right operand after binary operator');
        }
        break;
      case RIGHT_DELIMITER:
        if (mode !== OPERATOR_EXPRESSION) {
          start[binaryOperatorMemoIndex + mode] = {};
          return;
        } else {
          syntaxError('unexpected ' + token.value);
        }
        break;
      case PUNCTUATION:
        if (mode !== OPERATOR_EXPRESSION) {
          return;
        } else if (priInc !== 0) {
          syntaxError('unexpected ' + token.value);
        }
        if (priInc === 0) {
          if (opValue === ',' || opValue === ':') {
            syntaxError('binary operator ' + opValue + ' should not be at begin of line');
          }
        }
        break;
      default:
        if (priInc === 300) {
          if (mode === OPERATOR_EXPRESSION) {
            syntaxError('binary operator ' + opValue + ' should have spaces at its right side.');
          } else {
            token = start;
            tokenType = token.type;
            start[binaryOperatorMemoIndex + mode] = {};
            return;
          }
        } else if (priInc === 0) {
          if (opValue === '%' || op.assign) {
            syntaxError('binary operator ' + opValue + ' should not be at begin of line');
          }
          if (type1 === INDENT) {
            indentExpression();
          }
        }
    }
    pri = op.priority + priInc;
    if (pri < 300) {
      pri = 300;
      rightAssoc = false;
    } else {
      rightAssoc = op.rightAssoc;
    }
    result = {
      value: opValue,
      start: start,
      stop: token,
      priority: pri,
      rightAssoc: rightAssoc,
      assign: op.assign
    };
    start[binaryOperatorMemoIndex + OPERATOR_EXPRESSION] = {
      result: result,
      next: token
    };
    return result;
  };
  indentExpression = function() {
    var indentExp;
    indentExp = parser.expression(INDENT_EXPRESSION, 0, true);
    if (tokenType !== UNDENT && tokenType !== EOI && token.value !== ')') {
      syntaxError('expect an undent after a indented block expression');
    }
    indentExp.priority = 1000;
    indentExp.atom = true;
    tokenType = INDENT_EXPRESSION;
    indentExp.next = token;
    indentExp['m' + (expressionMemoIndex + OPERATOR_EXPRESSION)] = {
      result: indentExp,
      next: token
    };
    return token = indentExp;
  };
  this.prefixExpression = function(mode, priority) {
    var op, pri, start, x;
    start = token;
    if (op = parser.prefixOperator(mode)) {
      pri = priority > op.priority ? priority : op.priority;
      x = parser.expression(mode, pri, true);
      if (x) {
        return {
          value: [
            {
              value: 'prefix!',
              kind: SYMBOL
            }, op, x
          ],
          kind: LIST,
          expressionType: PREFIX,
          priority: op.priority,
          rightAssoc: op.rightAssoc,
          start: op.start,
          stop: op.stop || op.start
        };
      } else {
        token = start;
        tokenType = token.type;
      }
    }
  };
  expressionMemoIndex = memoIndex;
  memoIndex += 10;
  this.expression = expression = function(mode, priority, leftAssoc) {
    var m, memoTag, op, opPri, start, tkn, tkn1, tkn2, x, y;
    memoTag = 'm' + (expressionMemoIndex + mode);
    start = token;
    if (m = start[memoTag]) {
      token = m.next || token;
      tokenType = token.type;
      return m.result;
    }
    if (!(x = parser.prefixExpression(mode, priority))) {
      if (!token.atom) {
        start[memoTag] = {};
        return;
      } else {
        x = token;
        x.priority = 1000;
        x.start = x;
        nextToken();
      }
    }
    while (1) {
      tkn1 = token;
      if ((op = parser.suffixOperator(mode, x))) {
        if (op.priority >= priority) {
          return {
            value: [
              {
                value: 'suffix!',
                kind: SYMBOL
              }, op, x
            ],
            kind: LIST,
            expressionType: SUFFIX,
            priority: op.priority,
            rightAssoc: op.rightAssoc,
            start: op.start,
            stop: op.stop || op.start
          };
        } else {
          token = tkn1;
          tokenType = token.type;
          break;
        }
      } else {
        break;
      }
    }
    while (1) {
      tkn2 = token;
      if ((op = parser.binaryOperator(mode, x))) {
        if ((opPri = op.priority) > priority || (opPri === priority && !leftAssoc)) {
          y = expression(mode, opPri, !op.rightAssoc);
          if (y) {
            x = {
              value: [
                {
                  value: 'binary!',
                  kind: SYMBOL
                }, op, x, y
              ],
              kind: LIST,
              expressionType: BINARY,
              priority: op.priority,
              rightAssoc: op.rightAssoc,
              start: op.start,
              stop: op.stop || op.start
            };
          } else {
            token = tkn2;
            tokenType = token.type;
            break;
          }
        } else {
          token = tkn2;
          tokenType = token.type;
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
            x = {
              value: [
                {
                  value: 'suffix!',
                  kind: SYMBOL
                }, op, x
              ],
              kind: LIST,
              expressionType: SUFFIX,
              priority: op.priority,
              rightAssoc: op.rightAssoc,
              start: op.start,
              stop: op.stop || op.start
            };
          } else {
            token = tkn;
            tokenType = token.type;
            break;
          }
        } else {
          break;
        }
      }
    }
    start[memoTag] = {
      result: x,
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
      result.atom = true;
    }
    return result;
  };
  this.hashKeyExpression = function() {
    return parser.expression(HASH_KEY_EXPRESSION, 600, true);
  };
  this.spaceClauseExpression = spaceClauseExpression = function() {
    if (tokenType === SPACE) {
      nextToken();
    }
    return parser.expression(SPACE_CLAUSE_EXPRESSION, 300, true);
  };
  this.interpolateExpression = function() {
    var cur, exp, id, start, tkn;
    exp = tokenOnIdentifierChar();
    exp.start = exp.stop = start = exp;
    while (1) {
      cur = cursor;
      if ((char = text[cursor]) === '.') {
        if (char = text[++cursor] && firstIdentifierCharSet[char] && (id = tokenOnIdentifierChar())) {
          exp = norm([norm('.'), exp, id]);
          id.start = id;
          id.stop = id;
          exp.start = start;
          exp.stop = id;
        } else {
          break;
        }
      } else if (char === '[') {
        if ((tkn = tokenOnLeftBracketChar()) && tokenType === BRACKET) {
          exp = {
            value: [norm('index!'), exp, tkn],
            kind: LIST,
            start: start,
            stop: tkn
          };
        } else {
          lexError('error while parsing "[" leading interpolate expression in double qoute string');
        }
      } else {
        cursor = cur;
        break;
      }
    }
    return exp;
  };
  this.itemToParameter = itemToParameter = function(item) {
    var item0, item1, item10;
    if (item.type === IDENTIFIER) {
      return item;
    } else if (item0 = item[0]) {
      if (item0 === '@x') {
        return item;
      } else if (item0.value === 'x...') {
        parser.meetEllipsis = item[1].ellipsis = true;
        return item;
      } else if (item0.value === '=') {
        if ((item1 = item[1]) && item1.type === IDENTIFIER) {
          return item;
        } else if ((item10 = item1[0]) && item10 === '@') {
          return item;
        } else {

        }
      } else if (item0.value === 'unquote!' || item0.value === 'unquote-splice') {
        return item;
      }
    }
  };
  expectThen = function(isHeadStatement, clauseIndent) {
    if (tokenType === SPACE) {
      nextToken();
    }
    if (atStatementHead && !isHeadStatement) {
      syntaxError('unexpected new line before "then" of inline keyword statement');
    }
    if (tokenType === INDENT) {
      syntaxError('unexpected indent before "then"');
    } else if (tokenType === EOI) {
      syntaxError('unexpected end of input, expect "then"');
    }
    if (tokenType === NEWLINE) {
      nextToken();
    } else if (tokenType === UNDENT && token.indent >= clauseIndent) {
      nextToken();
    }
    if (atStatementHead && indent !== clauseIndent) {
      syntaxError('wrong indent before "then"');
    }
    if (tokenType === CONJUNCTION) {
      if (token.value === "then") {
        nextToken();
        return true;
      } else {
        return syntaxError('unexpected conjunction "' + token.value + '", expect "then"');
      }
    } else {
      return syntaxError('expect "then"');
    }
  };
  maybeConjunction = function(conj, isHeadStatement, clauseIndent) {
    if (atStatementHead && !isHeadStatement) {
      return;
    }
    if (tokenType === EOI) {
      return;
    }
    if (indent < clauseIndent) {
      return;
    }
    if (indent > clauseIndent) {
      syntaxError('wrong indent');
    }
    if (indent === clauseIndent && tokenType === CONJUNCTION && token.value === conj) {
      conj = token;
      nextToken();
      return conj;
    }
  };
  maybeIndentConjunction = function(conj, isHeadStatement, parentIndent, myIndent) {
    var ind;
    ind = myIndent.indent;
    if (tokenType === INDENT) {
      nextToken();
    } else if (tokenType === NEWLINE) {
      nextToken();
    }
    if (tokenType === SPACE) {
      nextToken();
    }
    if (ind) {
      if (indent < ind) {
        return;
      } else if (indent > ind) {
        syntaxError('wrong indent before matching conjunction');
      }
    } else if (atStatementHead) {
      if (indent <= parentIndent) {
        return;
      } else {
        myIndent.indent = indent;
      }
    }
    if (tokenType === CONJUNCTION && token.value === conj) {
      return nextToken();
    }
  };
  keywordThenElseStatement = function(keyword) {
    return function(isHeadStatement) {
      var else_, ind, result, start, test, then_, tkn;
      start = token;
      ind = indent;
      nextToken();
      if (tokenType === SPACE) {
        nextToken();
      }
      if (!(test = parser.clause())) {
        syntaxError('expect a clause after "' + keyword + '"');
      }
      expectThen(isHeadStatement, ind);
      then_ = parser.block() || parser.line();
      if (tokenType === NEWLINE) {
        tkn = token;
        nextToken();
      }
      if (maybeConjunction('else', isHeadStatement, ind)) {
        else_ = parser.block() || parser.line();
      } else if (tkn) {
        token = tkn;
        tokenType = token.type;
      }
      if (else_) {
        result = [kindSymbol(keyword), test, begin(then_), begin(else_)];
      } else {
        result = [kindSymbol(keyword), test, begin(then_)];
      }
      return {
        value: result,
        kind: LIST,
        start: start,
        stop: token
      };
    };
  };
  whileTestStatement = function(keyword) {
    return function(isHeadStatement) {
      var body, start, test;
      start = token;
      nextToken();
      if (tokenType === SPACE) {
        nextToken();
      }
      if (!(test = parser.compactClauseExpression())) {
        syntaxError("expect compact clause expression to be used as condition");
      }
      body = parser.block() || parser.line();
      if (!body) {
        syntaxError('expect the body for while! statement');
      }
      return {
        value: [kindSymbol(keyword), test, begin(body)],
        kind: LIST,
        start: start,
        stop: token
      };
    };
  };
  throwReturnStatement = function(keyword) {
    return function(isHeadStatement) {
      var clause, result, start;
      start = token;
      nextToken();
      if (tokenType === SPACE) {
        nextToken();
      }
      if (clause = parser.clause()) {
        result = [kindSymbol(keyword), clause];
      } else {
        result = [kindSymbol(keyword)];
      }
      return {
        value: result,
        start: start,
        stop: token,
        kind: LIST
      };
    };
  };
  breakContinueStatement = function(keyword) {
    return function(isHeadStatement) {
      var label, result, start;
      start = token;
      nextToken();
      if (tokenType === SPACE) {
        nextToken();
      }
      if (tokenType === IDENTIFIER) {
        label = token;
        nextToken();
        if (tokenType === SPACE) {
          nextToken();
        }
        result = [kindSymbol(keyword), label];
      } else {
        if (tokenType === SPACE) {
          nextToken();
        }
        result = [kindSymbol(keyword)];
      }
      return {
        value: result,
        kind: LIST,
        start: start,
        stop: token
      };
    };
  };
  letLikeStatement = function(keyword) {
    return function(isHeadStatement) {
      var body, ind, start, varDesc;
      start = token;
      nextToken();
      ind = indent;
      if (tokenType === SPACE) {
        nextToken();
      }
      varDesc = parser.varInitList() || parser.clause();
      expectThen(isHeadStatement, ind);
      body = parser.block() || parser.line();
      return {
        value: [kindSymbol(keyword), varDesc, begin(body)],
        kind: LIST,
        start: start,
        stop: token
      };
    };
  };
  this.identifierLine = function() {
    var result, x;
    result = [];
    if (tokenType === SPACE) {
      nextToken();
    }
    while (!parser.lineEnd() && !follow('newline') && text[cursor] !== ';') {
      if (x = parser.identifier()) {
        result.push(x);
      } else {
        syntaxError('expect an identifier');
      }
      if (tokenType === SPACE) {
        nextToken();
      }
    }
    return result;
  };
  this.identifierList = function() {
    var col0, column, indentCol, line1, result, spac, varList;
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
      if ((column = lineInfo[lineno].indentCol) <= indentCol) {
        rollbackToken(spac);
        break;
      } else if (column !== col0) {
        syntaxError('inconsistent indent of multiple identifiers lines after extern!');
      }
      if (text[cursor] === ';') {
        break;
      }
    }
    return result;
  };
  this.varInit = function() {
    var id, result, value;
    if (tokenType !== IDENTIFIER) {
      return;
    }
    id = token;
    nextToken();
    if (tokenType === SPACE) {
      nextToken();
    }
    if (token.value === '=') {
      nextToken();
      if (tokenType === SPACE) {
        nextToken();
      }
      if ((value = parser.block())) {
        if (value.length > 1) {
          value.unshift('begin!');
        } else if (value.length === 1) {
          value = value[0];
        } else {
          value = 'undefined';
        }
      } else if (!(value = parser.clause())) {
        syntaxError('expect a value after "=" in variable initilization');
      }
    } else if (token.value === ',' && nextToken()) {
      if (tokenType === SPACE) {
        nextToken();
      }
    }
    if (!value) {
      return id;
    } else {
      result = norm(['=', id, value]);
      result.start = id;
      result.stop = token;
      return result;
    }
  };
  varInitLine = function() {
    var result, x;
    result = [];
    while (1) {
      if (x = parser.varInit()) {
        result.push(x);
      } else {
        break;
      }
      if (tokenType === SPACE) {
        nextToken();
      }
    }
    return result;
  };
  this.varInitList = function() {
    var ind0, ind1, result;
    ind0 = indent;
    if (tokenType === UNDENT) {
      syntaxError('unexpected undent');
    } else if (tokenType === NEWLINE) {
      syntaxError('unexpected new line, expect at least one variable in var statement');
    }
    if (tokenType !== INDENT) {
      result = varInitLine();
    } else {
      nextToken();
      ind1 = indent;
      if (tokenType === SPACE) {
        nextToken();
      }
      result = [];
      while (1) {
        result.push.apply(result, varInitLine());
        if (token.value = ';') {
          nextToken();
          if (tokenType === SPACE) {
            nextToken();
          }
        }
        if (tokenType === EOI) {
          break;
        } else if (tokenType === UNDENT) {
          if (indent === ind1) {
            continue;
          } else if (indent === ind0) {
            nextToken();
            break;
          } else if (indent < ind0) {
            break;
          } else {
            syntaxError('unconsistent indent in var initialization block');
          }
        } else if (tokenType === NEWLINE) {
          nextToken();
          continue;
        } else if (tokenType === CONJUNCTION) {
          break;
        } else {
          continue;
        }
      }
    }
    return result;
  };
  this.importItem = function() {
    var asName, asName2, as_, name, start, sym, sym2, sym3, symValue, symValue2;
    start = token;
    if (tokenType === SYMBOL) {
      sym = token;
      nextToken();
      if ((symValue = sym.value) !== '#' && symValue !== '#/') {
        syntaxError('unexpected symbol after "as" in import! statement');
      }
    }
    if (tokenType === IDENTIFIER) {
      if (token.value === 'from') {
        if (sym) {
          syntaxError('keyword "from" should not follow "#" or "#/" immediately in import! statement, expect variable name');
        } else {
          return;
        }
      }
      name = token;
      nextToken();
    } else if (tokenType === NON_INTERPOLATE_STRING || tokenType === INTERPOLATE_STRING) {
      if (sym) {
        syntaxError('file path should not follow "#" or "#/" immediately in import! statement, expect variable name');
      } else {
        token = start;
        tokenType = token.type;
        return;
      }
    }
    if (tokenType === SPACE) {
      nextToken();
    }
    if (tokenType === IDENTIFIER && token.value !== 'from') {
      if (token.value !== 'as') {
        syntaxError('unexpected word ' + as_.value + ', expect "as", "," or "from [module path...]"');
      }
      as_ = token;
      nextToken();
      if (tokenType === SPACE) {
        nextToken();
      }
      if (tokenType === SYMBOL && (sym2 = token) && nextToken() && (symValue2 = sym2.value) !== '#' && symValue2 !== '#/') {
        syntaxError('unexpected symbol after "as" in import! statement');
      }
      if (symValue === '#/') {
        if (symValue2 === '#') {
          syntaxError('expect "as #/alias" or or "as alias #alias2" after "#/' + name.value + '"');
        }
      } else if (symValue === '#') {
        if (!symValue) {
          syntaxError('meta variable can not be imported as runtime variable');
        } else if (symValue === '#/') {
          syntaxError('meta variable can not be imported as both meta and runtime variable');
        }
      } else if (!symValue) {
        if (symValue2 === '#') {
          syntaxError('runtime variable can not be imported as meta variable');
        } else if (symValue2 === '#/') {
          'runtime variable can not be imported as both meta and runtime variable';
        }
      }
      if (tokenType !== IDENTIFIER) {
        syntaxError("expect identifier");
      }
      asName = token;
      nextToken();
      if (tokenType === SPACE) {
        nextToken();
      }
      if (symValue === '#/' && !symValue2) {
        if (tokenType !== SYMBOL) {
          syntaxError('expect # after "#/' + name.value + ' as ' + asName.value + '"');
        }
        if (tokenType === SYMBOL) {
          sym3 = token;
          if (sym3.value !== '#') {
            syntaxError('unexpected ' + sym3.value + ' after "#/' + name.value + 'as ' + asName.value + '"');
          }
          nextToken();
          if (tokenType !== IDENTIFIER) {
            syntaxError("expect identifier");
          }
          asName2 = token;
          nextToken();
          if (tokenType === SPACE) {
            nextToken();
          }
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
    if (token.value === '#/') {
      nextToken();
      runtime = 'runtime';
      meta = 'meta';
      if (tokenType === SPACE) {
        nextToken();
      }
    } else if (token.value === '#') {
      nextToken();
      meta = 'meta';
      if (tokenType === SPACE) {
        nextToken();
      }
    } else {
      runtime = 'runtime';
    }
    if (meta) {
      if (tokenType === IDENTIFIER) {
        name = token;
        nextToken();
      } else {
        syntaxError('expect identifier');
      }
    } else if (tokenType !== IDENTIFIER) {
      return;
    } else {
      name = token;
      nextToken();
    }
    if (tokenType === SPACE) {
      nextToken();
    }
    if (token.value === '=' && nextToken()) {
      if (tokenType === SPACE) {
        nextToken();
      }
      value = parser.spaceClauseExpression();
      if (tokenType === SPACE) {
        nextToken();
      }
    }
    return [name, value, runtime, meta];
  };
  spaceComma = function() {
    var result;
    if (tokenType === SPACE) {
      nextToken();
    }
    if (token.value === ',') {
      nextToken();
      result = true;
    }
    if (tokenType === SPACE) {
      nextToken();
    }
    return result;
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
  this.keyword2statement = keyword2statement = {
    'break': breakContinueStatement('break'),
    'continue': breakContinueStatement('continue'),
    'throw': throwReturnStatement('throw'),
    'return': throwReturnStatement('return'),
    'new': throwReturnStatement('new'),
    'while!': whileTestStatement('while!'),
    'var': function(isHeadStatement) {
      var start, varList;
      start = token;
      nextToken();
      if (tokenType === SPACE) {
        nextToken();
      }
      varList = parser.varInitList();
      if (varList.length === 0) {
        syntaxError('expect variable name');
      }
      if (tokenType !== NEWLINE && tokenType !== UNDENT && tokenType !== EOI && tokenType !== CONJUNCTION && tokenType !== RIGHT_DELIMITER && tokenType !== PUNCTUATION) {
        syntaxError('unexpected token after var initialization list: "' + token.value + '"');
      }
      varList.unshift(norm('var'));
      return {
        value: varList,
        kind: LIST,
        start: start,
        stop: token
      };
    },
    'extern!': function(isHeadStatement) {
      var ids, start;
      start = token;
      nextToken();
      if (tokenType === SPACE) {
        nextToken();
      }
      ids = parser.identifierList();
      ids.unshift(norm('extern!'));
      return {
        value: ids,
        kind: LIST,
        start: start,
        stop: token
      };
    },
    'include!': function(isHeadStatement) {
      var filePath, parseMethod;
      if (tokenType === SPACE) {
        nextToken();
      }
      filePath = expect('string', 'expect a file path');
      if (tokenType === SPACE) {
        nextToken();
      }
      if (word('by')) {
        if (tokenType === SPACE) {
          nextToken();
        }
        parseMethod = expect('taijiIdentifier', 'expect a parser method');
      }
      return {
        value: [
          {
            value: 'include!',
            kind: SYMBOL
          }, filePath, parseMethod
        ],
        kind: LIST,
        start: start,
        stop: token
      };
    },
    'import!': function(isHeadStatement) {
      var alias, item, items, metaAlias, metaImportList, parseMethod, runtimeImportList, srcModule, start, sym, symValue, x, _len4, _len5, _m, _n;
      start = token;
      nextToken();
      if (tokenType === SPACE) {
        nextToken();
      }
      items = parser.importItemList();
      if (tokenType === SPACE) {
        nextToken();
      }
      if (tokenType === IDENTIFIER) {
        nextToken();
        if (tokenType === SPACE) {
          nextToken();
        }
      } else if (items.length) {
        syntaxError('expect "from"');
      }
      if (tokenType !== NON_INTERPOLATE_STRING) {
        syntaxError('expect the path of module file');
      }
      srcModule = token;
      nextToken();
      if (tokenType === SPACE) {
        nextToken();
      }
      if (token.value === 'as') {
        nextToken();
        if (tokenType === SPACE) {
          nextToken();
        }
        if (tokenType === SYMBOL) {
          if ((symValue = token.value) && symValue !== '#' && symValue !== '#/') {
            syntaxError('unexpected symbol before import module name', token);
          }
          sym = token;
          nextToken();
        }
        if (tokenType !== IDENTIFIER) {
          syntaxError('expect an alias for module');
        }
        alias = token;
        nextToken();
        if (tokenType === SPACE) {
          nextToken();
        }
        if (symValue === '#') {
          metaAlias = alias;
          alias = void 0;
        } else if (symValue === '#/') {
          metaAlias = alias;
        }
        if (!metaAlias) {
          if (tokenType === SYMBOL) {
            if (token.value !== '#') {
              syntaxError('unexpected symbol');
            } else {
              nextToken();
              if (tokenType === SPACE) {
                nextToken();
              }
              if (tokenType === IDENTIFIER && token.value !== 'by') {
                metaAlias = token;
                nextToken();
                if (tokenType === SPACE) {
                  nextToken();
                }
              }
            }
          }
        }
      }
      if (token.value === 'by' && nextToken()) {
        if (tokenType === SPACE) {
          nextToken();
        }
        if (tokenType !== IDENTIFIER) {
          syntaxError('expect parser method');
        }
        if (tokenType === SPACE) {
          nextToken();
        }
        parseMethod = token;
      }
      runtimeImportList = [];
      metaImportList = [];
      for (_m = 0, _len4 = items.length; _m < _len4; _m++) {
        item = items[_m];
        for (_n = 0, _len5 = item.length; _n < _len5; _n++) {
          x = item[_n];
          if (x[2]) {
            metaImportList.push(x);
          } else {
            runtimeImportList.push(x);
          }
        }
      }
      return {
        value: [norm('import!'), srcModule, parseMethod, alias, metaAlias, runtimeImportList, metaImportList],
        kind: LIST,
        start: start,
        stop: token
      };
    },
    'export!': function(isHeadStatement) {
      var start;
      start = token;
      nextToken();
      if (tokenType === SPACE) {
        nextToken();
      }
      return {
        value: [norm('export!')].concat(parser.exportItemList(), {
          kind: LIST,
          start: start,
          stop: token
        })
      };
    },
    'let': letLikeStatement('let'),
    'letrec!': letLikeStatement('letrec!'),
    'letloop!': letLikeStatement('letloop!'),
    'if': keywordThenElseStatement('if'),
    'while': keywordThenElseStatement('while'),
    'for': function(isHeadStatement) {
      var body, inOf, ind, init, kw, name1, name2, obj, start, step, test, value;
      start = token;
      ind = indent;
      skipToken();
      skipSpace();
      if (char === '(' && (char = text[++cursor])) {
        matchToken();
        if (tokenType === SPACE) {
          nextToken();
        }
        init = parser.clause();
        if (tokenType === SPACE) {
          nextToken();
        }
        if (token.value === ';') {
          nextToken();
        } else {
          syntaxError('expect ";"');
        }
        if (tokenType === SPACE) {
          nextToken();
        }
        test = parser.clause();
        if (tokenType === SPACE) {
          nextToken();
        }
        if (token.value === ';') {
          nextToken();
        } else {
          syntaxError('expect ";"');
        }
        if (tokenType === SPACE) {
          nextToken();
        }
        step = parser.clause();
        if (tokenType === SPACE) {
          nextToken();
        }
        if (token.value === ')') {
          nextToken();
        } else {
          'expect ")"';
        }
        if (tokenType === SPACE) {
          nextToken();
        }
        expectThen(isHeadStatement, ind);
        body = parser.block() || parser.line();
        return {
          value: [norm('cFor!'), init, test, step, begin(body)],
          start: start,
          stop: token
        };
      }
      matchToken();
      if (tokenType === SPACE) {
        nextToken();
      }
      if (tokenType !== IDENTIFIER) {
        syntaxError('expect identifier');
      }
      name1 = token;
      nextToken();
      if (tokenType === SPACE) {
        nextToken();
      }
      if (token.value === ',') {
        nextToken();
        if (tokenType === SPACE) {
          nextToken();
        }
      }
      if (tokenType !== IDENTIFIER) {
        syntaxError('expect "in", "of" or index variable name');
      }
      if ((value = token.value) === 'in' || value === 'of') {
        inOf = value;
        nextToken();
      } else {
        name2 = token;
        nextToken();
        if (tokenType === SPACE) {
          nextToken();
        }
        if ((value = token.value) === 'in' || value === 'of') {
          inOf = value;
          nextToken();
        } else {
          'expect "in" or "of"';
        }
      }
      if (tokenType === SPACE) {
        nextToken();
      }
      obj = parser.clause();
      expectThen(isHeadStatement, ind);
      body = parser.block() || parser.line();
      if (inOf === 'in') {
        kw = 'forIn!';
      } else {
        kw = 'forOf!';
      }
      return {
        value: [norm(kw), name1, name2, obj, begin(body)],
        start: start,
        stop: token
      };
    },
    'do': function(isHeadStatement) {
      var body, conj, conjValue, ind, start, tailClause;
      start = token;
      ind = indent;
      nextToken();
      if (tokenType === SPACE) {
        nextToken();
      }
      body = parser.block() || parser.line();
      if (indent === ind) {
        if (tokenType === UNDENT) {
          nextToken();
        }
        if (atStatementHead && !isHeadStatement) {
          return {
            value: body,
            start: start,
            stop: token
          };
        }
        if (tokenType === CONJUNCTION && (conjValue = token.value) === 'where' || conjValue === 'when' || conjValue === 'until') {
          conj = token;
          nextToken();
          if (tokenType === SPACE) {
            nextToken();
          }
        }
      } else if (indent > ind) {
        syntaxError("wrong indent after the block of do statement");
      }
      if (!conj) {
        return {
          value: body,
          start: start,
          stop: token
        };
      }
      if (conjValue === 'where') {
        tailClause = parser.varInitList();
      } else {
        tailClause = parser.clause();
      }
      if (conjValue === 'where') {
        return {
          value: [norm('let'), tailClause, begin(body)],
          kind: LIST,
          start: start,
          stop: token
        };
      } else if (conjValue === 'when') {
        return {
          value: [norm('doWhile!'), begin(body), tailClause],
          kind: LIST,
          start: start,
          stop: token
        };
      } else {
        return {
          value: [norm('doWhile!'), begin(body), [norm('prefix'), '!', tailClause]],
          kind: LIST,
          start: start,
          stop: token
        };
      }
    },
    'switch': function(isHeadStatement) {
      var body, caseValues, cases, else_, exp, ind, indentInfo, start, test;
      start = token;
      ind = indent;
      nextToken();
      if (tokenType === SPACE) {
        nextToken();
      }
      if (!(test = parser.clause())) {
        syntaxError('expect a clause after "switch"');
      }
      cases = [];
      if (indent > ind) {
        indentInfo = {
          indent: indent
        };
      } else {
        indentInfo = {};
      }
      while (1) {
        if (!maybeIndentConjunction('case', isHeadStatement, ind, indentInfo)) {
          break;
        }
        if (tokenType === SPACE) {
          nextToken();
        }
        caseValues = [];
        while (exp = parser.compactClauseExpression()) {
          caseValues.push(exp);
          if (tokenType === SPACE) {
            nextToken();
          }
          if (token.value === ',') {
            nextToken();
            if (tokenType === SPACE) {
              nextToken();
            }
          }
        }
        if (token.value !== ':') {
          'expect ":" after case values';
        }
        nextToken();
        if (tokenType === SPACE) {
          nextToken();
        }
        body = parser.block() || parser.line();
        cases.push([caseValues, begin(body)]);
      }
      if (maybeIndentConjunction('else', isHeadStatement, ind, indentInfo)) {
        else_ = parser.block() || parser.line();
      }
      return {
        value: [norm('switch'), test, cases, begin(else_)],
        start: start,
        stop: token
      };
    },
    'try': function(isHeadStatement) {
      var catchVar, catch_, final, ind, result, start, test;
      start = token;
      ind = indent;
      nextToken();
      if (tokenType === SPACE) {
        nextToken();
      }
      if (!(test = parser.block() || parser.line())) {
        syntaxError('expect a line or block after "try"');
      }
      if (atStatementHead && !isHeadStatement) {
        syntaxError('meet unexpected new line when parsing inline try statement');
      }
      if (maybeConjunction("catch", isHeadStatement, ind)) {
        if (tokenType === SPACE) {
          nextToken();
        }
        atStatementHead = false;
        if (tokenType === IDENTIFIER) {
          catchVar = token;
          nextToken();
        }
        if (tokenType === SPACE) {
          nextToken();
        }
        if (tokenType !== CONJUNCTION || token.value !== 'then') {
          syntaxError('expect "then" after "catch +' + catchVar.value + '"');
        }
        nextToken();
        if (tokenType === SPACE) {
          nextToken();
        }
        catch_ = parser.block() || parser.line();
      }
      if (maybeConjunction("finally", isHeadStatement, ind)) {
        if (tokenType === SPACE) {
          nextToken();
        }
        final = parser.block() || parser.line();
        result = [norm('try'), test, catchVar, begin(catch_)];
      } else {
        result = [norm('try'), begin(test), catchVar, begin(catch_), begin(final)];
      }
      return {
        value: result,
        start: start,
        stop: token
      };
    },
    'class': function(isHeadStatement) {
      var body, name, start, superClass;
      start = token;
      nextToken();
      if (tokenType === SPACE) {
        nextToken();
      }
      if (tokenType !== IDENTIFIER) {
        syntaxError('expect class nam');
      }
      name = token;
      nextToken();
      if (tokenType === SPACE) {
        nextToken();
      }
      if (tokenType === CONJUNCTION && token.value === 'extends' && nextToken()) {
        if (tokenType === SPACE) {
          nextToken();
        }
        if (tokenType === IDENTIFIER) {
          superClass = token;
          nextToken();
        }
        if (tokenType === SPACE) {
          nextToken();
        }
      } else {
        superClass = void 0;
      }
      if (tokenType === NEWLINE || tokenType === UNDENT || tokenType === EOI) {
        body = void 0;
      } else {
        body = parser.block() || parser.line();
      }
      return {
        value: ['#call!', 'class', [name, superClass, begin(body)]],
        start: start,
        stop: token
      };
    }
  };
  this.sequenceClause = function() {
    var clause, item, start, tkn;
    start = token;
    clause = [];
    while (1) {
      if (tokenType === SPACE) {
        nextToken();
      }
      tkn = token;
      if ((item = parser.compactClauseExpression())) {
        if (item.value === '#') {
          token = tkn;
          tokenType = token.type;
          break;
        } else {
          clause.push(item);
        }
      } else {
        break;
      }
    }
    if (!clause.length) {
      return;
    }
    return {
      value: clause,
      kind: LIST,
      start: start,
      stop: token
    };
  };
  leadWordClauseMap = {
    '%%': function(tkn, clause) {
      var code;
      code = compileExp(norm(['return', clause]), environment);
      return new Function('__$taiji_$_$parser__', code)(parser);
    },
    '%/': function(tkn, clause) {
      var code;
      code = compileExp(norm([
        {
          value: 'return',
          kind: SYMBOL
        }, [tkn, clause]
      ]), environment);
      return new Function('__$taiji_$_$parser__', code)(parser);
    },
    '%!': function(tkn, clause) {
      var code;
      code = compileExp(norm([norm('return'), [tkn, clause]]), environment);
      return new Function('__$taiji_$_$parser__', code)(parser);
    },
    '~': function(tkn, clause) {
      return norm([tkn, clause]);
    },
    '`': function(tkn, clause) {
      return norm([tkn, clause]);
    },
    '^': function(tkn, clause) {
      return norm([tkn, clause]);
    },
    '^&': function(tkn, clause) {
      return norm([tkn, clause]);
    },
    '#': function(tkn, clause) {
      return norm([tkn, clause]);
    },
    '##': function(tkn, clause) {
      return norm([tkn, clause]);
    },
    '#/': function(tkn, clause) {
      return norm([tkn, clause]);
    },
    '#-': function(tkn, clause) {
      return norm([tkn, clause]);
    },
    '#&': function(tkn, clause) {
      return norm([tkn, clause]);
    }
  };
  symbol2clause = {
    '%': function(isHeadStatement) {
      var code, ind, leadClause, result;
      ind = indent;
      if (tokenType !== SPACE) {
        return;
      }
      leadClause = parser.clause();
      code = compileExp(['return', ['%/', leadClause]], environment);
      if (tokenType === SPACE) {
        nextToken();
      }
      if (token.value === 'then' && nextToken()) {
        result = new Function('__$taiji_$_$parser__', code)(parser);
        if (indent < ind) {
          syntaxError('expect same or less indent after custom parsing');
        }
        return result;
      } else {
        return syntaxError('expect the conjunction "then"');
      }
    }
  };
  leadTokenClause = function(fn) {
    return function() {
      var result, start, type;
      start = token;
      if ((type = nextToken().type) !== SPACE && type !== INDENT) {
        token = start;
        tokenType = token.type;
        return;
      }
      nextToken();
      if (!(fn = leadWordClauseMap[start.value])) {
        token = start;
        tokenType = token.type;
        return;
      }
      result = fn(start, parser.clause());
      result.start = start;
      result.stop = token;
      return result;
    };
  };
  for (key in leadWordClauseMap) {
    fn = leadWordClauseMap[key];
    symbol2clause[key] = leadTokenClause(fn);
  }
  this.definitionSymbolBody = definitionSymbolBody = function() {
    var body, result, start;
    start = token;
    nextToken();
    if (tokenType === SPACE) {
      nextToken();
    }
    if (tokenType === INDENT) {
      body = parser.block();
    } else {
      body = parser.line();
    }
    result = norm([start, [], begin(body)]);
    result.start = start;
    result.stop = token;
    return result;
  };
  symbol2clause['->'] = definitionSymbolBody;
  symbol2clause['|->'] = definitionSymbolBody;
  symbol2clause['=>'] = definitionSymbolBody;
  symbol2clause['|=>'] = definitionSymbolBody;
  this.customDefinitionParameterList = function() {};
  nextPiece = function() {
    if (!char) {
      return 'end of input';
    } else {
      return text.slice(cursor, cursor + 8 > (typeof textLength === "function" ? textLength({
        textLength: cursor + 8
      }) : void 0));
    }
  };
  this.clause = function() {
    var blk, clause, clauseValue, clauses, definition, exp, head, isStatementHead, op, opToken, params, result, right, start, tkn, tokenAfterOperator, type, value;
    trace("clause: " + nextPiece());
    if (tokenType === SPACE) {
      nextToken();
      type = tokenType;
    }
    start = token;
    switch (tokenType) {
      case KEYWORD:
        isStatementHead = atStatementHead;
        atStatementHead = false;
        return keyword2statement[token.value](isStatementHead);
      case IDENTIFIER:
        nextToken();
        if (token.value === '#' && nextToken() && token.value === ':' && nextToken()) {
          if (tokenType === SPACE) {
            nextToken();
          }
          return {
            value: [
              {
                value: 'label!',
                kind: SYMBOL
              }, start, begin(parser.lineBlock())
            ],
            kind: LIST,
            start: start,
            stop: token
          };
        } else {
          token = start;
          tokenType = token.type;
        }
        break;
      case SYMBOL:
        if ((fn = symbol2clause[token.value]) && (result = fn())) {
          return result;
        }
        break;
      case NEWLINE:
      case UNDENT:
      case RIGHT_DELIMITER:
      case CONJUNCTION:
      case EOI:
        return;
    }
    head = parser.compactClauseExpression();
    if (!head) {
      if ((op = parser.prefixOperator())) {
        if (tokenType === SPACE && nextToken() && (exp = parser.spaceClauseExpression())) {
          result = norm([op, exp]);
          result.start = start;
          result.stop = token;
          return result;
        } else {
          return op;
        }
      } else if (token.value === ',') {
        nextToken();
        return {
          value: 'undefined',
          kind: SYMBOL,
          start: start,
          stop: token
        };
      } else {
        return;
      }
    }
    if (op = parser.binaryOperator(SPACE_CLAUSE_EXPRESSION)) {
      tokenAfterOperator = token;
      token = head;
      tokenType = token.type;
      head.next = op;
      op['m' + (binaryOperatorMemoIndex + SPACE_CLAUSE_EXPRESSION)] = {
        result: op,
        next: tokenAfterOperator
      };
      if ((exp = parser.spaceClauseExpression())) {
        if ((value = token.value) === ',') {
          nextToken();
          if (tokenType === SPACE) {
            nextToken();
          }
          return exp;
        } else if (value !== ';' && tokenType !== NEWLINE && tokenType !== UNDENT && tokenType !== EOI) {
          if (exp.priority < 600) {
            syntaxError('after space expression clause, expect stop symbol of clause like colon, semicolon, new line, undent or end of input etc.');
          } else {
            token = op;
            tokenType = token.type;
          }
        } else {
          return exp;
        }
      } else {
        token = op;
        tokenType = token.type;
      }
    } else if ((type = head.type) !== NUMBER && type !== NON_INTERPOLATE_STRING && type !== INTERPOLATE_STRING && type !== BRACKET && type !== HASH) {
      tkn = token;
      if ((exp = parser.spaceClauseExpression()) && exp.priority <= 600) {
        if ((value = token.value) === ',') {
          nextToken();
          if (tokenType === SPACE) {
            nextToken();
          }
          return {
            value: [head, exp],
            kind: LIST,
            start: start,
            stop: token
          };
        } else if (value !== ';' && tokenType !== NEWLINE && tokenType !== UNDENT && tokenType !== EOI) {
          syntaxError('after caller leading clause, expect stop symbol of clause like colon, semicolon, new line, undent or end of input etc.');
        } else {
          return {
            value: [head, exp],
            kind: LIST,
            start: start,
            stop: token,
            kind: LIST
          };
        }
      } else {
        token = tkn;
        tokenType = token.type;
      }
    }
    if (tokenType === SPACE) {
      nextToken();
    }
    if ((op = binaryOperatorDict[token.value]) && op.assign) {
      opToken = token;
      opToken.priority = op.priority;
      nextToken();
      if (tokenType === SPACE) {
        nextToken();
        type = tokenType;
      }
      if (tokenType === UNDENT) {
        syntaxError('unexpected undent after assign symbol' + op.value);
      } else if (tokenType === NEWLINE) {
        syntaxError('unexpected new line after assign symbol' + op.value);
      } else if (tokenType === EOI) {
        syntaxError('unexpected end of input' + op.value);
      }
      right = parser.block() || parser.clause();
      if (!right) {
        syntaxError('expect the right side of assign');
      }
      return {
        value: [norm(opToken), head, right],
        kind: LIST,
        start: start,
        stop: token
      };
    } else if (token.value === '#' && nextToken()) {
      if (tokenType === SPACE) {
        clauses = parser.clauses();
        return {
          value: [
            {
              value: '#',
              kind: SYMBOL
            }, head, clauses
          ],
          kind: LIST,
          start: start,
          stop: token
        };
      } else if (tokenType === INDENT) {
        clauses = parser.block();
        return {
          value: [
            {
              value: '#',
              kind: SYMBOL
            }, head, clauses
          ],
          kind: LIST,
          start: start,
          stop: token
        };
      }
    } else if (token.value === ':' && nextToken()) {
      if (tokenType === SPACE) {
        nextToken();
      }
      clause = parser.clauses();
      clause.unshift(head);
      return {
        value: clause,
        kind: LIST,
        start: head.start,
        stop: token
      };
    }
    if (clause = parser.sequenceClause()) {
      clause.value.unshift(head);
      clause.start = start;
    } else {
      clause = head;
    }
    if ((op = binaryOperatorDict[token.value]) && op.definition) {
      definition = definitionSymbolBody();
      if (clause.parameters) {
        definition.value[1] = clause;
        clause = definition;
        definition.start = start;
      } else if ((clauseValue = clause.value) instanceof Array && clauseValue.length > 1) {
        params = clauseValue[clauseValue.length - 1];
        if (params.parameters) {
          clauseValue.pop();
          definition[1] = params;
          definition.start = params.start;
        }
        clauseValue.push(definition);
        clause.stop = token;
      } else {
        clause = {
          value: [clause, definition],
          kind: LIST,
          kind: VALUE,
          start: start,
          stop: token
        };
      }
      return clause;
    }
    if ((value = token.value) === ',') {
      nextToken();
      clause.stop = token;
      return clause;
    } else if (value === ':') {
      nextToken();
      if (tokenType === INDENT) {
        clauses = parser.block();
      } else {
        clauses = parser.clauses();
      }
      if (clauses.length === 0) {
        syntaxError('expected arguments list after ":"');
      }
      clauses.unshift(clause);
      return {
        value: clauses,
        start: start,
        stop: token
      };
    } else if (token.value === '#' && nextToken()) {
      if (tokenType === SPACE) {
        clauses = parser.clauses();
        return {
          value: [norm('#'), clause, clauses],
          kind: LIST,
          start: start,
          stop: token
        };
      } else if (tokenType === INDENT) {
        clauses = parser.block();
        return {
          value: [norm('#'), clause, clauses],
          kind: LIST,
          start: start,
          stop: token
        };
      }
    } else if (tokenType === INDENT) {
      tkn = token;
      nextToken();
      if (tokenType === CONJUNCTION) {
        token = tkn;
        tokenType = token.type;
        atStatementHead = true;
        clause.stop = token;
        return clause;
      } else {
        token = tkn;
        tokenType = token.type;
        atStatementHead = true;
        blk = parser.block();
        if ((clauseValue = clause.value) instanceof Array) {
          clauseValue.push.apply(clauseValue, blk);
          clause.stop = token;
          return clause;
        } else {
          blk.unshift(clause);
          return {
            value: blk,
            kind: LIST,
            start: start,
            stop: token
          };
        }
      }
    } else {
      return clause;
    }
  };
  this.clauses = function() {
    var clause, result, tkn;
    result = [];
    tkn = token;
    while (clause = parser.clause()) {
      result.push(clause);
      if (tkn === token) {
        syntaxError('oops! inifinte loops!!!');
      }
      tkn = token;
    }
    return result;
  };
  this.sentence = function() {
    var result;
    if (tokenType === EOI || tokenType === INDENT || tokenType === UNDENT || tokenType === NEWLINE || tokenType === RIGHT_DELIMITER || tokenType === CONJUNCTION) {
      return;
    }
    result = parser.clauses();
    if (token.value === ';') {
      nextToken();
      if (tokenType === SPACE) {
        nextToken();
      }
    }
    return result;
  };
  this.line = function() {
    var result, start, tkn, x;
    if (tokenType === UNDENT || tokenType === RIGHT_DELIMITER || tokenType === CONJUNCTION || tokenType === EOI) {
      return;
    }
    if (tokenType === INDENT) {
      return parser.block(indent);
    }
    if (tokenType === CODE_BLOCK_COMMENT_LEAD_SYMBOL) {
      start = token;
      nextToken();
      if (tokenType === SPACE) {
        nextToken();
      }
      x = parser.line();
      return [
        {
          value: [
            {
              value: 'codeBlockComment!',
              kind: SYMBOL
            }, x
          ],
          start: start,
          stop: token
        }
      ];
    }
    result = [];
    tkn = token;
    while (x = parser.sentence()) {
      result.push.apply(result, x);
      if (tkn === token) {
        syntaxError('oops! inifinte loops!!!');
      }
      tkn = token;
    }
    return result;
  };
  this.block = function(dent) {
    if (tokenType === INDENT) {
      nextToken();
      return parser.blockWithoutIndentHead(indent);
    }
  };
  this.blockWithoutIndentHead = function(dent) {
    var ind, result, x;
    result = [];
    ind = indent;
    while ((x = parser.line())) {
      result.push.apply(result, x);
      if (tokenType === NEWLINE) {
        nextToken();
        continue;
      }
      if (tokenType === EOI) {
        break;
      } else if (tokenType === UNDENT) {
        if (indent < dent) {
          break;
        } else if (indent === dent) {
          nextToken();
          break;
        } else if (indent === ind) {
          nextToken();
          continue;
        } else {
          syntaxError('wrong indent');
        }
      } else if (tokenType === CONJUNCTION) {
        syntaxError('unexpected conjunction "' + token.value + '" following a indent block');
      }
    }
    return result;
  };
  this.lineBlock = function(dent) {
    var result, tkn;
    result = parser.line();
    if (tokenType === NEWLINE) {
      nextToken();
    }
    tkn = token;
    if (tokenType === INDENT) {
      nextToken();
    }
    if (tokenType === SPACE) {
      nextToken();
    }
    if (tokenType === CONJUNCTION) {
      token = tkn;
      tokenType = token.type;
    } else {
      token = tkn;
      tokenType = token.type;
      if (token.indent > dent) {
        result.push.apply(result, parser.blockWithoutIndentHead());
      }
    }
    return result;
  };
  this.moduleBody = function() {
    var body, start, x;
    start = token;
    matchToken();
    if (tokenType === NEWLINE) {
      nextToken();
    } else if (tokenType === SPACE) {
      nextToken();
    }
    body = [];
    while (1) {
      if (!(x = parser.line())) {
        break;
      }
      if (tokenType === NEWLINE) {
        nextToken();
      }
      body.push.apply(body, x);
    }
    if (tokenType !== EOI) {
      syntaxError('expect end of input, but meet "' + text.slice(cursor) + '"');
    }
    return {
      value: [
        {
          value: 'moduleBody!',
          kind: SYMBOL
        }, begin(body)
      ],
      start: start,
      stop: token
    };
  };
  this.binShellDirective = function() {
    var cur;
    if (text.slice(cursor, cursor + 2) !== '#!') {
      return undefinedExp;
    }
    cur = cursor;
    while (char && char !== '\n' && char !== '\r') {
      char = text[++cursor];
    }
    if (char === '\n') {
      if (char === '\r') {
        cursor += 2;
      } else {
        cursor++;
      }
      lineno++;
    } else if (char === '\r') {
      if (char === '\n') {
        cursor += 2;
      } else {
        cursor++;
      }
      lineno++;
    }
    lineStart = cursor;
    return {
      value: [
        {
          value: 'binShellDirective!',
          kind: SYMBOL
        }, text.slice(cur, cursor)
      ],
      kind: LIST,
      cursor: 0,
      line: 1,
      column: 0,
      stopCursor: cursor
    };
  };
  this.moduleHeader = function() {
    var cur, x, y;
    cur = cursor;
    if (!(literal('taiji') && spaces() && literal('language') && spaces() && (x = decimal()) && matchChar('.') && (y = decimal()))) {
      lexError('taiji language module should begin with "taiji language x.x"');
    }
    if ((x = x.value) !== '0' || (y = y.value) !== '1') {
      syntaxError('taiji 0.1 can not process taiji language' + x + '.' + y);
    }
    while (char && char !== '\n' && char !== '\r') {
      char = text[++cursor];
    }
    while (char) {
      if (char === '\n') {
        if (char === '\r') {
          cursor += 2;
        } else {
          cursor++;
        }
        lineno++;
      } else if (char === '\r') {
        if (char === '\n') {
          cursor += 2;
        } else {
          cursor++;
        }
        lineno++;
      }
      if ((char = text[cursor]) !== ' ' && char !== '\t' && char !== '\n' && char !== '\r') {
        break;
      }
      while (char && char !== '\n' && char !== '\r') {
        char = text[++cursor];
      }
    }
    return {
      type: MODULE_HEADER,
      version: {
        main: x,
        minor: y
      },
      value: text.slice(0, cursor),
      cursor: cur,
      stopCursor: cursor
    };
  };
  this.module = function() {
    var body, header, scriptDirective;
    scriptDirective = [norm('scriptDirective!'), parser.binShellDirective()];
    header = parser.moduleHeader();
    body = parser.moduleBody();
    return {
      value: [
        {
          value: 'module!',
          kind: SYMBOL
        }, scriptDirective, header, body
      ],
      cursor: 0,
      stopCursor: text.length,
      line: 1,
      column: 0,
      start: scriptDirective,
      kind: LIST
    };
  };
  this.init = function(data, cur, env) {
    var endCursorOfDynamicBlockStack;
    this.text = text = data;
    this.textLength = textLength = text.length;
    cursor = cur;
    char = text[cursor];
    lineno = 1;
    lineStart = 0;
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
    throw cursor + '(' + lineno + ':' + (cursor - lineStart) + '): ' + 'lexical error: ' + message + ': \n' + text.slice(cursor - 40, cursor) + '|   |' + text.slice(cursor, cursor + 40);
  };
  this.syntaxError = syntaxError = function(message, tkn) {
    var cur, s;
    tkn = tkn || token;
    cur = tkn.cursor;
    s = cur + '(' + tkn.line + ':' + tkn.column + '): ' + message + (", meet \"" + token.value + "\"\n") + text.slice(cur - 40, cur) + text.slice(cur, cur + 40);
    throw s;
  };
  return this;
};

exports.Parser.name = 'Parser';

compileExp = require('../compiler').compileExp;
