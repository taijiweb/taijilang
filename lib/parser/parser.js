var BINARY, BLOCK_COMMENT, BRACKET, CODE_BLOCK_COMMENT, CODE_BLOCK_COMMENT_LEAD_SYMBOL, COMPACT_CLAUSE_EXPRESSION, CONCAT_LINE, CONJUNCTION, CURVE, C_BLOCK_COMMENT, DATA_BRACKET, END_INTERPOLATED_STRING, EOI, FUNCTION, HALF_DENT, HASH, HASH_KEY_EXPRESSION, HEAD_SPACES, IDENTIFIER, INDENT, INDENT_EXPRESSION, INLINE_COMMENT, INTERPOLATE_STRING, KEYWORD, LINE_COMMENT, MODULE, MODULE_HEADER, NEWLINE, NON_INTERPOLATE_STRING, NULL, NUMBER, OPERATOR_EXPRESSION, PAREN, PREFIX, PUNCTUATION, REGEXP, RIGHT_DELIMITER, SPACE, SPACES, SPACES_INLINE_COMMENT, SPACE_CLAUSE_EXPRESSION, SPACE_COMMENT, STRING, SUFFIX, SYMBOL, TAIL_COMMENT, UNDENT, base, begin, binaryOperatorDict, charset, colors, compileExp, conjMap, conjunctionHasOwnProperty, constant, dict, digitCharSet, digitChars, entity, escapeNewLine, extend, extendSyntaxInfo, firstIdentifierCharSet, firstIdentifierChars, firstSymbolCharset, hasOwnProperty, identifierCharSet, identifierChars, isArray, isConjunction, isKeyword, keywordHasOwnProperty, keywordMap, letterCharSet, letterChars, letterDigitSet, list2dict, makeExpression, prefixOperatorDict, str, suffixOperatorDict, taijiIdentifierCharSet, _ref, _ref1, _ref2;

colors = require('colors');

_ref = require('../utils'), charset = _ref.charset, isArray = _ref.isArray, str = _ref.str, entity = _ref.entity, dict = _ref.dict, list2dict = _ref.list2dict, extendSyntaxInfo = _ref.extendSyntaxInfo;

_ref1 = base = require('./base'), extend = _ref1.extend, firstIdentifierChars = _ref1.firstIdentifierChars, firstIdentifierCharSet = _ref1.firstIdentifierCharSet, letterDigitSet = _ref1.letterDigitSet, identifierChars = _ref1.identifierChars, digitCharSet = _ref1.digitCharSet, letterCharSet = _ref1.letterCharSet, identifierCharSet = _ref1.identifierCharSet, firstSymbolCharset = _ref1.firstSymbolCharset, taijiIdentifierCharSet = _ref1.taijiIdentifierCharSet, constant = _ref1.constant;

digitChars = base.digits;

letterChars = base.letters;

NULL = constant.NULL, NUMBER = constant.NUMBER, STRING = constant.STRING, IDENTIFIER = constant.IDENTIFIER, SYMBOL = constant.SYMBOL, REGEXP = constant.REGEXP, HEAD_SPACES = constant.HEAD_SPACES, CONCAT_LINE = constant.CONCAT_LINE, PUNCTUATION = constant.PUNCTUATION, FUNCTION = constant.FUNCTION, C_BLOCK_COMMENT = constant.C_BLOCK_COMMENT, PAREN = constant.PAREN, BRACKET = constant.BRACKET, DATA_BRACKET = constant.DATA_BRACKET, CURVE = constant.CURVE, INDENT_EXPRESSION = constant.INDENT_EXPRESSION, NEWLINE = constant.NEWLINE, SPACES = constant.SPACES, INLINE_COMMENT = constant.INLINE_COMMENT, SPACES_INLINE_COMMENT = constant.SPACES_INLINE_COMMENT, LINE_COMMENT = constant.LINE_COMMENT, BLOCK_COMMENT = constant.BLOCK_COMMENT, CODE_BLOCK_COMMENT = constant.CODE_BLOCK_COMMENT, CONCAT_LINE = constant.CONCAT_LINE, NON_INTERPOLATE_STRING = constant.NON_INTERPOLATE_STRING, INTERPOLATE_STRING = constant.INTERPOLATE_STRING, EOI = constant.EOI, INDENT = constant.INDENT, UNDENT = constant.UNDENT, HALF_DENT = constant.HALF_DENT, MODULE_HEADER = constant.MODULE_HEADER, MODULE = constant.MODULE, SPACE_COMMENT = constant.SPACE_COMMENT, TAIL_COMMENT = constant.TAIL_COMMENT, SPACE = constant.SPACE, HASH = constant.HASH, RIGHT_DELIMITER = constant.RIGHT_DELIMITER, KEYWORD = constant.KEYWORD, CONJUNCTION = constant.CONJUNCTION, CODE_BLOCK_COMMENT_LEAD_SYMBOL = constant.CODE_BLOCK_COMMENT_LEAD_SYMBOL, PREFIX = constant.PREFIX, SUFFIX = constant.SUFFIX, BINARY = constant.BINARY, END_INTERPOLATED_STRING = constant.END_INTERPOLATED_STRING, OPERATOR_EXPRESSION = constant.OPERATOR_EXPRESSION, COMPACT_CLAUSE_EXPRESSION = constant.COMPACT_CLAUSE_EXPRESSION, SPACE_CLAUSE_EXPRESSION = constant.SPACE_CLAUSE_EXPRESSION, INDENT_EXPRESSION = constant.INDENT_EXPRESSION, HASH_KEY_EXPRESSION = constant.HASH_KEY_EXPRESSION;

_ref2 = require('./operator'), prefixOperatorDict = _ref2.prefixOperatorDict, suffixOperatorDict = _ref2.suffixOperatorDict, binaryOperatorDict = _ref2.binaryOperatorDict, makeExpression = _ref2.makeExpression;

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
  'var': 1,
  'for': 1
};

keywordHasOwnProperty = Object.hasOwnProperty.bind(exports.keywordMap);

exports.isKeyword = isKeyword = function(item) {
  return item && !item.escaped && keywordHasOwnProperty(item.text);
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

conjunctionHasOwnProperty = Object.hasOwnProperty.bind(exports.conjMap);

exports.isConjunction = isConjunction = function(item) {
  return item && !item.escaped && conjunctionHasOwnProperty(item.text);
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
  var atLineHead, atStatementHead, binaryOperatorMemoIndex, bracketVariantMap, breakContinueStatement, c, char, concatenateLine, concatenating, cursor, curveVariantMap, decimal, definitionSymbolBody, endCursorOfDynamicBlockStack, environment, eoi, expectThen, expression, expressionMemoIndex, fn, hashBlock, hashItem, hashLine, hashLineBlock, indent, indentExpression, itemToParameter, key, keyword2statement, keywordThenElseStatement, leadTokenClause, leadWordClauseMap, leftCBlockComment, leftIndentBlockComment, leftInterpolateString, leftNonInterpolatedString, leftRawInterpolateString, leftRawNonInterpolatedString, leftRegexp, letLikeStatement, lexError, lexIndent, lineStart, lineno, literal, matchChar, matchToken, maybeConjunction, maybeIndentConjunction, memoIndex, memoMap, newLineAndEmptyLines, newline, nextToken, nonInterpolatedStringLine, nullToken, operatorExpression, parenVariantMap, parser, predefined, rawNonInterpolatedStringLine, seperatorList, skipInlineSpace, skipSpace, skipSpaceLines, skipToken, spaceClauseExpression, spaceComma, spaces, symbol2clause, symbolStopChars, syntaxError, text, throwReturnStatement, toParameters, token, tokenFnMap, tokenOnAtChar, tokenOnBackSlashChar, tokenOnColonChar, tokenOnCommaChar, tokenOnDoubleQuoteChar, tokenOnForwardSlashChar, tokenOnIdentifierChar, tokenOnLeftBracketChar, tokenOnLeftParenChar, tokenOnNewlineChar, tokenOnNumberChar, tokenOnRightDelimiterChar, tokenOnSemiColonChar, tokenOnSharpChar, tokenOnSingleQuoteChar, tokenOnSpaceChar, tokenOnSymbolChar, unchangeable, varInitLine, whileTestStatement, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref3, _ref4, _ref5, _ref6;
  parser = this;
  this.predefined = predefined = {};
  unchangeable = ['cursor', 'setCursor', 'lineno', 'setLineno', 'atLineHead', 'atStatementHead', 'setAtStatementHead'];
  text = '';
  cursor = 0;
  char = '';
  lineno = 0;
  lineStart = 0;
  lexIndent = 0;
  indent = 0;
  atLineHead = true;
  token = void 0;
  memoMap = {};
  atStatementHead = true;
  environment = null;
  endCursorOfDynamicBlockStack = [];
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
    switch (token.type) {
      case NEWLINE:
      case INDENT:
      case UNDENT:
      case EOI:
        atStatementHead = true;
    }
    if (token.next) {
      return token = token.next;
    } else {
      if (!char) {
        if (token === eoi) {
          return eoi;
        }
        eoi.lineno = lineno + 1;
        lineStart = cursor;
        lexIndent = -1;
        token.next = eoi;
        return token = eoi;
      } else if (fn = tokenFnMap[char]) {
        return token = fn(char);
      } else {
        return token = tokenOnSymbolChar();
      }
    }
  };
  this.matchToken = matchToken = function() {
    var fn;
    if (!char) {
      if (token === eoi) {
        return eoi;
      }
      eoi.lineno = lineno + 1;
      lineStart = cursor;
      lexIndent = -1;
      token.next = eoi;
      return token = eoi;
    } else if (fn = tokenFnMap[char]) {
      return token = fn(char);
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
    tokenOnSpaceChar();
    if (token.type === SPACE) {
      return skipToken();
    }
  };
  nullToken = function() {
    return {
      type: NULL,
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
      type: SYMBOL,
      value: text.slice(cur, cursor),
      cursor: cur,
      stopCursor: cursor,
      line: lineno,
      column: cursor - lineStart
    };
  };
  symbolStopChars = {};
  _ref3 = ' \t\v\n\r()[]{},;:#\'\".@\\';
  for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
    c = _ref3[_i];
    symbolStopChars[c] = true;
  }
  for (c in firstIdentifierCharSet) {
    symbolStopChars[c] = true;
  }
  _ref4 = '0123456789';
  for (_j = 0, _len1 = _ref4.length; _j < _len1; _j++) {
    c = _ref4[_j];
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
      type: SYMBOL,
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
      type: SYMBOL,
      value: text.slice(cur, cursor),
      cursor: cur,
      stopCursor: cursor,
      line: lineno,
      column: column,
      atom: cursor - cur === 1
    };
  };
  tokenFnMap[':'] = tokenOnColonChar = function() {
    var column, cur, first, type;
    cur = cursor;
    column = cursor - lineStart;
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
      type: SPACE,
      cursor: cur,
      stopCursor: cursor,
      line: line,
      stopLine: lineno,
      column: column,
      indent: lexIndent
    };
  };
  tokenFnMap[' '] = tokenFnMap['\t'] = tokenOnSpaceChar = function() {
    var column, cur, line, tkn, type;
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
          type: SPACE,
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
          type: SPACE,
          value: text.slice(cur, cursor),
          cursor: cur,
          stopCursor: cursor,
          line: line,
          stopLine: lineno,
          column: column,
          indent: lexIndent
        };
      } else {
        type = newLineAndEmptyLines();
        return token.next = {
          type: type,
          value: text.slice(cur, cursor),
          cursor: cur,
          line: line,
          column: column,
          indent: lexIndent
        };
      }
    } else {
      return token.next = {
        type: EOI,
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
    var column, cur, line, tkn, _k, _len2, _ref5;
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
      tkn.type = IDENTIFIER;
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
          indent: lexIndent,
          next: tkn
        };
      } else {
        _ref5 = text.slice(cur + 2, tkn.stopCursor);
        for (_k = 0, _len2 = _ref5.length; _k < _len2; _k++) {
          c = _ref5[_k];
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
        type: SYMBOL,
        value: text.slice(cur, cursor),
        cursor: cur,
        stopCursor: cursor,
        line: lineno,
        column: cur - lineStart
      };
    }
  };
  tokenFnMap['/'] = tokenOnForwardSlashChar = function() {
    var column, cur, line, prev, t, value;
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
            type: SPACE,
            value: text.slice(cur, cursor),
            cursor: cur,
            stopCursor: cursor,
            line: line,
            stopLine: lineno,
            column: column,
            indent: lexIndent
          };
        } else {
          return token.next = {
            type: newLineAndEmptyLines(),
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
          type: EOI,
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
            type: SPACE,
            value: text.slice(cur, cursor),
            cursor: cur,
            stopCursor: cursor,
            line: line,
            stopLine: lineno,
            column: column,
            indent: lexIndent
          };
        } else {
          return token.next = {
            type: newLineAndEmptyLines(),
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
          type: EOI,
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
        type: REGEXP,
        value: ['regexp!', '/' + text.slice(cur + 1, cursor)],
        atom: true,
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
          t = EOI;
        } else if (lexIndent > indent) {
          t = INDENT;
        } else if (lexIndent === indent) {
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
          column: column
        };
      } else {
        return token.next = {
          type: SYMBOL,
          value: "/",
          cursor: cur,
          stopCursor: cursor,
          line: line,
          column: column
        };
      }
    } else if (atLineHead) {
      return token.next = {
        type: CODE_BLOCK_COMMENT_LEAD_SYMBOL,
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
        type: SYMBOL,
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
      lexIndent = -1;
    } else {
      lexIndent = cursor - lineStart;
      if (lexIndent > indent) {
        type = INDENT;
      } else if (lexIndent < indent) {
        type = UNDENT;
      } else {
        type = NEWLINE;
      }
    }
    return type;
  };
  tokenFnMap['\n'] = tokenFnMap['\r'] = tokenOnNewlineChar = function() {
    var column, cur, line, type;
    cur = cursor;
    line = lineno;
    column = cursor - lineStart;
    indent = lexIndent;
    type = newLineAndEmptyLines();
    return token.next = {
      type: type,
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
    var column, cur, isAtom, txt, type;
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
      type = KEYWORD;
      isAtom = false;
    } else if (conjunctionHasOwnProperty(txt)) {
      type = CONJUNCTION;
      isAtom = false;
    } else {
      type = IDENTIFIER;
      isAtom = true;
    }
    return token.next = {
      type: type,
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
    var baseStart, c2, column, cur, dotCursor, meetDigit;
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
          type: NUMBER,
          value: parseInt(text.slice(baseStart, cursor), base),
          atom: true,
          cursor: cur,
          stopCursor: cursor,
          line: lineno,
          column: column
        };
      } else {
        return token.next = {
          type: NUMBER,
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
        type: NUMBER,
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
            type: NUMBER,
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
          type: NUMBER,
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
      type: NUMBER,
      value: parseFloat(text.slice(cur, cursor), base),
      atom: true,
      cursor: cur,
      stopCursor: cursor,
      line: lineno,
      column: column
    };
  };
  _ref5 = '0123456789';
  for (_k = 0, _len2 = _ref5.length; _k < _len2; _k++) {
    c = _ref5[_k];
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
      type: PUNCTUATION,
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
          type: NON_INTERPOLATE_STRING,
          atom: true,
          cursor: cursor - 2,
          line: lineno,
          column: column
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
        indent: lexIndent
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
              atom: true,
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
              atom: true,
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
    var column, cur, indentInfo, line;
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
    str = '';
    while (char) {
      if (char === "'") {
        char = text[++cursor];
        return {
          type: NON_INTERPOLATE_STRING,
          value: '"' + str + '"',
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
    while (char && char !== "'") {
      str += nonInterpolatedStringLine(indentInfo);
    }
    if (char === "'") {
      char = text[++cursor];
      return {
        type: NON_INTERPOLATE_STRING,
        value: '"' + str + '"',
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
          type: NON_INTERPOLATE_STRING,
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
    var column, cur, i, ind, indentInfo, line, literalStart, n, pieces, x;
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
    str = '"';
    while (char) {
      if (char === '"') {
        if (text[cursor + 1] === '"') {
          if (text[cursor + 2] === '"') {
            cursor += 3;
            if (str !== '"') {
              pieces.push(str += '"');
            }
            return {
              type: INTERPOLATE_STRING,
              value: ['string!'].concat(pieces),
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
            str += ' ';
          }
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
          lexError('unexpected tab character "\t" in the head of line');
        } else if ((ind = indentInfo.value) !== void 0) {
          indentInfo.value = column;
        } else if (ind > column) {
          i = 0;
          n = column - ind;
          while (i++ < n) {
            str += ' ';
          }
        } else if (ind < column) {
          lexError('expect equal to or more than the indent of first line of the string');
        }
      } else if (char === '(' || char === '{' || char === '[') {
        pieces.push(str + '"');
        matchToken();
        pieces.push(token);
        str = '"';
      } else if (char === '$') {
        if ((char = text[++cursor])) {
          if (!firstIdentifierCharSet[char]) {
            str += '$';
          } else {
            char = '$';
            --cursor;
            pieces.push(str + '"');
            str = '"';
          }
        } else {
          break;
        }
      } else if (char === '$') {
        literalStart = ++cursor;
        char = text[cursor];
        if (!firstIdentifierCharSet[char]) {
          str += '$';
        } else {
          x = parser.interpolateExpression();
          if (text[cursor] === ':') {
            char = text[++cursor];
            pieces.push(str + text.slice(literalStart, cursor) + '"');
            str = '"';
          } else if (str !== '"') {
            pieces.push(str + '"');
            str = '"';
          }
          pieces.push(x);
        }
      } else if (char === '\\') {
        char = text[++cursor];
        if (char === '\n' || char === '\r') {
          concatenating = true;
        } else if (char) {
          str += '\\\\';
        } else {
          lexError('unexpected end of input while parsing interpolated string');
        }
      } else {
        str += char;
        char = text[++cursor];
      }
    }
    if (!text[cursor]) {
      return lexError('expect \'"\', unexpected end of input while parsing interpolated string');
    }
  };
  leftInterpolateString = function() {
    var column, cur, i, ind, indentInfo, line, literalStart, n, pieces, x;
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
    str = '"';
    while (char) {
      if (char === '"') {
        if (str !== '"') {
          pieces.push(str + '"');
          char = text[++cursor];
        }
        return {
          type: INTERPOLATE_STRING,
          value: ['string!'].concat(pieces),
          atom: true,
          cursor: cur,
          stopCursor: cursor,
          line: line,
          stopLine: lineno
        };
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
          str += '$';
        } else {
          x = parser.interpolateExpression();
          if (text[cursor] === ':') {
            char = text[++cursor];
            pieces.push(str + text.slice(literalStart, cursor) + '"');
            str = '"';
          } else if (str !== '"') {
            pieces.push(str + '"');
            str = '"';
          }
          pieces.push(x);
        }
      } else if (char === '(' || char === '{' || char === '[') {
        pieces.push(str + '"');
        matchToken();
        pieces.push(token);
        str = '"';
      } else if (char === '\\') {
        if (!(char = text[++cursor])) {
          break;
        } else if (char === '\n' || char === '\r') {
          char = text[++cursor];
          concatenating = true;
        } else {
          str += '\\' + char;
          char = text[++cursor];
        }
      } else {
        str += char;
        char = text[++cursor];
      }
    }
    if (!text[cursor]) {
      return lexError('expect \'"\', but meet end of input while parsing interpolated string');
    }
  };
  tokenFnMap['('] = tokenOnLeftParenChar = function() {
    var column, cur, exp, ind, line, parenVariantFn, prev, type;
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
      return token.indent = lexIndent;
    } else {
      if ((type = token.type) === UNDENT) {
        lexError('unexpected undent while parsing parenethis "(...)"');
      }
      ind = indent = lexIndent;
      if (type === SPACE || type === NEWLINE || type === INDENT) {
        matchToken();
      }
      if (token.value === ')') {
        token = {
          type: PAREN,
          value: [],
          atom: true,
          cursor: cur,
          stopCursor: cursor,
          line: lineno,
          column: column,
          indent: lexIndent,
          empty: true,
          parameters: true
        };
        prev.next = token;
        return token;
      }
      exp = parser.operatorExpression();
      if (token.type === UNDENT) {
        if (token.indent < ind) {
          lexError('expect ) indent equal to or more than (');
        } else {
          matchToken();
        }
      } else {
        if (token.type === SPACE) {
          nextToken();
        }
        if (token.value !== ')') {
          lexError('expect )');
        }
      }
      return prev.next = token = {
        type: PAREN,
        value: exp,
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
    var bracketVariantFn, column, cur, expList, line, prev;
    cur = cursor;
    char = text[++cursor];
    line = lineno;
    column = cursor - lineStart;
    prev = token;
    matchToken();
    if ((bracketVariantFn = bracketVariantMap[token.value])) {
      token = bracketVariantFn();
      token.cursor = cursor;
      token.line = lineno;
      token.column = column;
      token.indent = indent;
    } else {
      expList = parser.block() || parser.lineBlock();
      if (token.type === UNDENT) {
        if (token.indent < ind) {
          lexError('unexpected undent while parsing parenethis "[...]"');
        } else {
          matchToken();
        }
      }
      if (token.value !== ']') {
        lexError('expect ]');
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
        line: line,
        column: column,
        indent: lexIndent
      };
    }
    prev.next = token;
    token.atom = true;
    return token;
  };
  bracketVariantMap = {};
  tokenFnMap['{'] = function() {
    var body, column, cur, curveVariantFn, ind, line, prev, tkn;
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
      if (token.type === SPACE) {
        nextToken();
      }
      if (token.value === '}' && (tkn = matchToken())) {
        token = {
          value: text.slice(cur, cursor),
          value: ['hash!'],
          cursor: cur,
          line: line,
          column: column,
          indent: lexIndent,
          next: tkn
        };
        prev.next = token;
        return token;
      }
      body = parser.block() || parser.lineBlock();
      if (token.type === UNDENT && token.indent < ind) {
        nextToken();
      }
      if (token.value !== '}') {
        lexError('expect }');
      }
      if (indent < ind) {
        lexError('unexpected undent while parsing parenethis "{...}"');
      }
      if (body.length === 0) {
        return {
          type: CURVE,
          value: '',
          cursor: cur,
          stopCursor: cursor,
          line: line,
          column: column,
          indent: lexIndent
        };
      }
      if (body.length === 1) {
        body = body[0];
      } else {
        body.unshift('begin!');
      }
    }
    return prev.next = token = {
      type: CURVE,
      value: body,
      atom: true,
      cursor: cur,
      stopCursor: cursor,
      line: line,
      column: column,
      indent: lexIndent
    };
  };
  curveVariantMap = {
    '.': function() {
      matchToken();
      return parser.hash();
    }
  };
  this.hash = function() {
    var ind, items, start;
    start = token;
    ind = indent;
    if (token.type === SPACE) {
      if (token.stopLine === token.line) {
        matchToken();
        items = hashLineBlock(ind);
      } else {
        items = hashBlock(ind);
      }
    } else if (token.type === INDENT) {
      matchToken();
      items = parser.hashBlock(ind);
    } else {
      items = hashLineBlock(ind);
    }
    if (token.type === UNDENT) {
      matchToken();
    }
    if (token.indent < ind) {
      lexError("expect the same indent as or more indent as the start line of hash block");
    }
    if (token.value !== '}') {
      lexError('expect }');
    }
    matchToken();
    return extendSyntaxInfo({
      value: ['hash!'].concat(items),
      atom: true
    }, start, token);
  };
  hashLineBlock = function(dent) {
    var items;
    items = hashLine(dent);
    if (token.type === INDENT) {
      nextToken();
    } else if (token.type === UNDENT) {
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
    var result, type, value, x;
    result = [];
    while ((x = parser.hashItem())) {
      result.push(x);
      if ((value = token.value) === ';') {
        matchToken();
        if (token.type === SPACE) {
          matchToken();
        }
      } else if ((type = token.type) === NEWLINE) {
        matchToken();
        break;
      } else if (type === UNDENT || value === '}') {
        break;
      } else if (type === EOI) {
        lexError("unexpected end of input while parsing hash block");
      }
    }
    return result;
  };
  hashBlock = function() {
    var blk, items, result, start, type, value;
    start = token;
    result = [];
    while ((items = hashLine())) {
      result.push.apply(result, items);
      if ((type = token.type) === EOI) {
        lexError("unexpected end of input while parsing hash block");
      } else if (type === UNDENT) {
        break;
      } else if ((value = token.value) === ';') {
        matchToken();
      } else if (value === '}') {
        break;
      }
      if (token.type === INDENT) {
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
    var blk, js, key, result, start, t, tkn, type, value;
    if (token.type === UNDENT) {
      return;
    }
    start = token;
    if (key = parser.hashKeyExpression()) {
      if ((type = token.type) === NEWLINE || type === UNDENT) {
        lexError('unexpected new line after hash key');
      } else if (type === EOI) {
        "unexpected end of input after hash key";
      } else if (type === SPACE) {
        matchToken();
      }
      if ((value = token.value) === ':' && matchToken()) {
        if ((t = key.type) === IDENTIFIER || t === NUMBER || t === NON_INTERPOLATE_STRING) {
          js = true;
        }
      } else if (value === '->') {
        matchToken();
      } else {
        lexError('expect : or -> for hash item definition');
      }
      if (token.type === SPACE) {
        matchToken();
      }
      if (token.type === INDENT) {
        matchToken();
        tkn = token;
        blk = hashBlock();
        value = {
          value: ['hash!'].concat(blk),
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
        result = ['jshashitem!', key, value];
      } else {
        result = ['pyhashitem!', key, value];
      }
      return extendSyntaxInfo(result, start, token);
    }
  };
  tokenOnRightDelimiterChar = function() {
    var cur;
    c = char;
    cur = cursor;
    char = text[++cursor];
    return token.next = {
      type: RIGHT_DELIMITER,
      value: c,
      cursor: cur,
      stopCursor: cursor,
      line: lineno,
      column: cur - lineStart
    };
  };
  _ref6 = ')]}';
  for (_l = 0, _len3 = _ref6.length; _l < _len3; _l++) {
    c = _ref6[_l];
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
    var op, opToken, priInc, tokenText, type;
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
    if ((type = token.type) === INDENT) {
      syntaxError('unexpected indent after prefix operator');
    } else if (type === NEWLINE) {
      syntaxError('unexpected new line after prefix operator');
    } else if (type === UNDENT) {
      syntaxError('unexpected undent after prefix operator');
    } else if ((tokenText = token.value) === ")" || tokenText === ']' || tokenText === "}") {
      syntaxError('unexpected ' + tokenText + ' after prefix operator');
    } else if (type === SPACE) {
      if (op.definition && mode === SPACE_CLAUSE_EXPRESSION) {
        token = start;
        return;
      }
      matchToken();
      priInc = 300;
    } else {
      priInc = 600;
      if (token.value === '.') {
        nextToken();
        if ((type = token.type) === SPACE || type === NEWLINE || type === UNDENT || type === INDENT || type === EOI) {
          lexError('unexpected spaces or new lines or end of lines after compact prefix Operaotr and "."');
        }
      }
    }
    opToken.symbol = op.symbol;
    opToken.priority = op.priority + priInc;
    return extendSyntaxInfo(opToken, opToken);
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
        return extendSyntaxInfo(opToken, opToken);
      } else {
        token = opToken;
      }
    }
  };
  binaryOperatorMemoIndex = memoIndex;
  memoIndex += 5;
  this.binaryOperator = function(mode, x) {
    var cur, m, op, opToken, opValue, pri, priInc, start, tkn, type, type1, value;
    if (m = token[binaryOperatorMemoIndex + mode]) {
      token = m.next || token;
      return m.result;
    }
    start = token;
    switch (type1 = token.type) {
      case EOI:
      case RIGHT_DELIMITER:
        token[binaryOperatorMemoIndex + mode] = {};
        return;
      case NEWLINE:
        priInc = 0;
        nextToken();
        break;
      case UNDENT:
        if (mode !== OPERATOR_EXPRESSION) {
          token[binaryOperatorMemoIndex + mode] = {};
          return;
        } else {
          priInc = 0;
          nextToken();
        }
        break;
      case INDENT:
        if (mode !== OPERATOR_EXPRESSION && mode !== INDENT_EXPRESSION) {
          token[binaryOperatorMemoIndex + mode] = {};
          return;
        } else {
          priInc = 0;
          nextToken();
        }
        break;
      case SPACE:
        if (mode === COMPACT_CLAUSE_EXPRESSION) {
          token[binaryOperatorMemoIndex + mode] = {};
          return;
        } else {
          start = token;
          nextToken();
          if (token.type !== IDENTIFIER && token.type !== SYMBOL && token.type !== PUNCTUATION) {
            start[binaryOperatorMemoIndex + mode] = {};
            token = start;
            return;
          }
          if (token.value === '.') {
            if (nextToken() && token.type === SPACE && nextToken()) {
              return {
                symbol: 'attribute!',
                type: SYMBOL,
                priority: 800,
                start: start
              };
            } else {
              token[binaryOperatorMemoIndex + mode] = {};
              token = start;
              return;
            }
          } else {
            priInc = 300;
          }
        }
        break;
      case PUNCTUATION:
        if (mode !== OPERATOR_EXPRESSION && mode !== INDENT_EXPRESSION) {
          token[binaryOperatorMemoIndex + mode] = {};
          return;
        } else {
          priInc = 600;
        }
        break;
      case PAREN:
        return {
          symbol: 'call()',
          type: SYMBOL,
          priority: 800,
          start: token
        };
      case BRACKET:
        return {
          symbol: 'index[]',
          type: SYMBOL,
          priority: 800,
          start: token
        };
      case IDENTIFIER:
        cur = token.cursor;
        if ((x.value === '@' && x.stopCursor === cur) || (text.slice(cur - 2, cur) === '::' && text[cur - 3] !== ':')) {
          return {
            symbol: 'attribute!',
            type: SYMBOL,
            priority: 800,
            start: token
          };
        } else {
          start[binaryOperatorMemoIndex + mode] = {};
          return;
        }
        break;
      case SYMBOL:
        tkn = token;
        if ((value = tkn.value) === '#' && nextToken()) {
          return {
            symbol: '#()',
            type: SYMBOL,
            priority: 800,
            start: tkn
          };
        } else if (value === '::') {
          return {
            symbol: 'attribute!',
            type: SYMBOL,
            start: tkn,
            priority: 800
          };
        } else if (value === "." && (tkn = token) && nextToken()) {
          if ((type = token.type) === IDENTIFIER) {
            return {
              symbol: 'attribute!',
              type: SYMBOL,
              start: tkn,
              priority: 800
            };
          } else if (type === SPACE || type === NEWLINE || type === INDENT || type === UNDENT || type === EOI) {
            if (mode === OPERATOR_EXPRESSION) {
              syntaxError('unexpected space or new line or end of line after "."');
            } else {
              token = tkn;
              return;
            }
          } else if (type === NUMBER || type === NON_INTERPOLATE_STRING || type === INTERPOLATE_STRING) {
            return {
              symbol: 'index!',
              type: SYMBOL,
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
      start[binaryOperatorMemoIndex + mode] = {};
      token = start;
      return;
    }
    if (!hasOwnProperty.call(binaryOperatorDict, opValue)) {
      start[binaryOperatorMemoIndex + mode] = {};
      token = start;
      return;
    }
    op = binaryOperatorDict[opValue];
    if ((op.definition || op.assign) && mode === SPACE_CLAUSE_EXPRESSION) {
      start[binaryOperatorMemoIndex + mode] = {};
      token = start;
      return;
    }
    if (op.value === '->') {
      start[binaryOperatorMemoIndex + mode] = {};
      token = start;
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
    switch (token.type) {
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
            syntaxError('binary operator ' + op.symbol + ' should not be at begin of line');
          }
        }
        break;
      default:
        if (priInc === 300) {
          if (mode === OPERATOR_EXPRESSION) {
            syntaxError('binary operator ' + opValue + ' should have spaces at its right side.');
          } else {
            token = start;
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
    opToken.symbol = op.symbol;
    pri = op.priority + priInc;
    opToken.assign = op.assign;
    opToken.rightAssoc = op.rightAssoc;
    if (pri < 300) {
      pri = 300;
      opToken.rightAssoc = false;
    }
    opToken.priority = pri;
    start[binaryOperatorMemoIndex + OPERATOR_EXPRESSION] = {
      result: opToken,
      next: token
    };
    return opToken;
  };
  indentExpression = function() {
    var indentExp, type;
    indentExp = parser.expression(INDENT_EXPRESSION, 0, true);
    if ((type = token.type) !== UNDENT && type !== EOI && token.value !== ')') {
      syntaxError('expect an undent after a indented block expression');
    }
    indentExp.priority = 1000;
    indentExp[expressionMemoIndex + OPERATOR_EXPRESSION] = {
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
        return extendSyntaxInfo(makeExpression(PREFIX, op, x));
      } else {
        token = start;
      }
    }
  };
  expressionMemoIndex = memoIndex;
  memoIndex += 5;
  this.expression = expression = function(mode, priority, leftAssoc) {
    var indexMode, m, op, opPri, start, tkn, tkn1, tkn2, x, y;
    indexMode = expressionMemoIndex + mode;
    start = token;
    if (m = start[indexMode]) {
      token = m.next || token;
      return m.result;
    }
    if (!(x = parser.prefixExpression(mode, priority))) {
      if (!token.atom) {
        start[memoIndex + mode] = {};
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
          x = makeExpression(SUFFIX, op, x);
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
        if ((opPri = op.priority) > priority || (opPri === priority && !leftAssoc)) {
          y = expression(mode, opPri, !op.rightAssoc);
          if (y) {
            x = makeExpression(BINARY, op, x, y);
          } else {
            token = tkn2;
            break;
          }
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
            x = makeExpression(SUFFIX, op, x);
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
    if (token.type === SPACE) {
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
          exp = ['attribute!', exp, id];
          id.start = id;
          id.stop = id;
          exp.start = start;
          exp.stop = id;
        } else {
          break;
        }
      } else if (char === '[') {
        if ((tkn = tokenOnLeftBracketChar()) && token.type === BRACKET) {
          exp = ['index!', exp, tkn];
          exp.start = start;
          exp.stop = tkn;
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
        var _len4, _m, _ref7, _results;
        _ref7 = item.slice(1);
        _results = [];
        for (_m = 0, _len4 = _ref7.length; _m < _len4; _m++) {
          x = _ref7[_m];
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
  expectThen = function(isHeadStatement, clauseIndent) {
    if (token.type === SPACE) {
      nextToken();
    }
    if (atStatementHead && !isHeadStatement) {
      syntaxError('unexpected new line before "then" of inline keyword statement');
    }
    if (token.type === INDENT) {
      syntaxError('unexpected indent before "then"');
    } else if (token.type === EOI) {
      syntaxError('unexpected end of input, expect "then"');
    }
    if (token.type === NEWLINE) {
      nextToken();
    } else if (token.type === UNDENT && token.indent >= clauseIndent) {
      nextToken();
    }
    if (atStatementHead && indent !== clauseIndent) {
      syntaxError('wrong indent before "then"');
    }
    if (token.type === CONJUNCTION) {
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
    if (token.type === EOI) {
      return;
    }
    if (indent < clauseIndent) {
      return;
    }
    if (indent > clauseIndent) {
      syntaxError('wrong indent');
    }
    if (indent === clauseIndent && token.type === CONJUNCTION && token.value === conj) {
      conj = token;
      nextToken();
      return conj;
    }
  };
  maybeIndentConjunction = function(conj, isHeadStatement, parentIndent, myIndent) {
    var ind;
    ind = myIndent.indent;
    if (token.type === INDENT) {
      nextToken();
    } else if (token.type === NEWLINE) {
      nextToken();
    }
    if (token.type === SPACE) {
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
    if (token.type === CONJUNCTION && token.value === conj) {
      return nextToken();
    }
  };
  keywordThenElseStatement = function(keyword) {
    return function(isHeadStatement) {
      var else_, ind, start, test, then_, tkn;
      start = token;
      ind = indent;
      nextToken();
      if (token.type === SPACE) {
        nextToken();
      }
      if (!(test = parser.clause())) {
        syntaxError('expect a clause after "' + keyword + '"');
      }
      expectThen(isHeadStatement, ind);
      then_ = parser.block() || parser.line();
      if (then_.length === 1) {
        then_ = then_[0];
      } else if (then_.length === 0) {
        then_ = void 0;
      } else {
        then_.unshift('begin!');
      }
      if (token.type === NEWLINE) {
        tkn = token;
        nextToken();
      }
      if (maybeConjunction('else', isHeadStatement, ind)) {
        else_ = parser.block() || parser.line();
        if (else_.length === 1) {
          else_ = else_[0];
        } else if (else_.length === 0) {
          else_ = void 0;
        } else {
          else_.unshift('begin!');
        }
      } else if (tkn) {
        token = tkn;
      }
      if (else_) {
        return {
          value: [keyword, test, then_, else_],
          start: start,
          stop: token
        };
      } else {
        return {
          value: [keyword, test, then_],
          start: start,
          stop: token
        };
      }
    };
  };
  whileTestStatement = function(keyword) {
    return function(isHeadStatement) {
      var body, start, test;
      start = token;
      nextToken();
      if (token.type === SPACE) {
        nextToken();
      }
      if (!(test = parser.compactClauseExpression())) {
        syntaxError("expect compact clause expression to be used as condition");
      }
      body = parser.block() || parser.line();
      if (!body) {
        syntaxError('expect the body for while! statement');
      }
      if (body.length === 1) {
        body = body[0];
      } else if (body.length === 0) {
        body = void 0;
      } else {
        body.unshift('begin!');
      }
      return {
        value: [keyword, test, body],
        start: start,
        stop: token
      };
    };
  };
  throwReturnStatement = function(keyword) {
    return function(isHeadStatement) {
      var clause, start;
      start = token;
      nextToken();
      if (token.type === SPACE) {
        nextToken();
      }
      if (clause = parser.clause()) {
        return {
          value: [keyword, clause],
          start: start,
          stop: token
        };
      } else {
        return {
          value: [keyword],
          start: start,
          stop: token
        };
      }
    };
  };
  breakContinueStatement = function(keyword) {
    return function(isHeadStatement) {
      var label, start;
      start = token;
      nextToken();
      if (token.type === SPACE) {
        nextToken();
      }
      if (token.type === IDENTIFIER) {
        label = token;
        nextToken();
        if (token.type === SPACE) {
          nextToken();
        }
        return {
          value: [keyword, label],
          start: start,
          stop: token
        };
      } else {
        if (token.type === SPACE) {
          nextToken();
        }
        return {
          value: [keyword],
          start: start,
          stop: token
        };
      }
    };
  };
  letLikeStatement = function(keyword) {
    return function(isHeadStatement) {
      var body, ind, start, varDesc;
      start = token;
      nextToken();
      ind = indent;
      if (token.type === SPACE) {
        nextToken();
      }
      varDesc = parser.varInitList() || parser.clause();
      expectThen(isHeadStatement, ind);
      body = parser.block() || parser.line();
      if (body.length === 1) {
        body = body[0];
      } else if (body.length === 0) {
        body = 'undefined';
      } else {
        body.unshift('begin!');
      }
      return {
        value: [keyword, varDesc, body],
        start: start,
        stop: token
      };
    };
  };
  this.identifierLine = function() {
    var result, x;
    result = [];
    if (token.type === SPACE) {
      nextToken();
    }
    while (!parser.lineEnd() && !follow('newline') && text[cursor] !== ';') {
      if (x = parser.identifier()) {
        result.push(x);
      } else {
        syntaxError('expect an identifier');
      }
      if (token.type === SPACE) {
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
    var id, value;
    if (token.type !== IDENTIFIER) {
      return;
    }
    id = token;
    nextToken();
    if (token.type === SPACE) {
      nextToken();
    }
    if (token.value === '=') {
      nextToken();
      if (token.type === SPACE) {
        nextToken();
      }
      if (value = parser.block()) {
        value = begin(value);
      } else if (!(value = parser.clause())) {
        syntaxError('expect a value after "=" in variable initilization');
      }
    }
    if (token.value === ',') {
      nextToken();
    }
    if (token.type === SPACE) {
      nextToken();
    }
    if (!value) {
      return id;
    } else {
      return {
        value: [id, '=', value],
        start: id,
        stop: token
      };
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
    }
    return result;
  };
  this.varInitList = function() {
    var ind0, ind1, result;
    ind0 = indent;
    if (token.type === UNDENT) {
      syntaxError('unexpected undent');
    } else if (token.type === NEWLINE) {
      syntaxError('unexpected new line, expect at least one variable in var statement');
    }
    if (token.type !== INDENT) {
      result = varInitLine();
    } else {
      nextToken();
      ind1 = indent;
      if (token.type === SPACE) {
        nextToken();
      }
      result = [];
      while (1) {
        result.push.apply(result, varInitLine());
        if (token.value = ';') {
          nextToken();
          if (token.type === SPACE) {
            nextToken();
          }
        }
        if (token.type === EOI) {
          break;
        } else if (token.type === UNDENT) {
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
        } else if (token.type === NEWLINE) {
          nextToken();
          continue;
        } else if (token.type === CONJUNCTION) {
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
    if (token.type === SYMBOL) {
      sym = token;
      nextToken();
      if ((symValue = sym.value) !== '#' && symValue !== '#/') {
        syntaxError('unexpected symbol after "as" in import! statement');
      }
    }
    if (token.type === IDENTIFIER) {
      if (token.value === 'from') {
        if (sym) {
          syntaxError('keyword "from" should not follow "#" or "#/" immediately in import! statement, expect variable name');
        } else {
          return;
        }
      }
      name = token;
      nextToken();
    } else if (token.type === NON_INTERPOLATE_STRING || token.type === INTERPOLATE_STRING) {
      if (sym) {
        syntaxError('file path should not follow "#" or "#/" immediately in import! statement, expect variable name');
      } else {
        token = start;
        return;
      }
    }
    if (token.type === SPACE) {
      nextToken();
    }
    if (token.type === IDENTIFIER && token.value !== 'from') {
      if (token.value !== 'as') {
        syntaxError('unexpected word ' + as_.value + ', expect "as", "," or "from [module path...]"');
      }
      as_ = token;
      nextToken();
      if (token.type === SPACE) {
        nextToken();
      }
      if (token.type === SYMBOL && (sym2 = token) && nextToken() && (symValue2 = sym2.value) !== '#' && symValue2 !== '#/') {
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
      if (token.type !== IDENTIFIER) {
        syntaxError("expect identifier");
      }
      asName = token;
      nextToken();
      if (token.type === SPACE) {
        nextToken();
      }
      if (symValue === '#/' && !symValue2) {
        if (token.type !== SYMBOL) {
          syntaxError('expect # after "#/' + name.value + ' as ' + asName.value + '"');
        }
        if (token.type === SYMBOL) {
          sym3 = token;
          if (sym3.value !== '#') {
            syntaxError('unexpected ' + sym3.value + ' after "#/' + name.value + 'as ' + asName.value + '"');
          }
          nextToken();
          if (token.type !== IDENTIFIER) {
            syntaxError("expect identifier");
          }
          asName2 = token;
          nextToken();
          if (token.type === SPACE) {
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
      if (token.type === SPACE) {
        nextToken();
      }
    } else if (token.value === '#') {
      nextToken();
      meta = 'meta';
      if (token.type === SPACE) {
        nextToken();
      }
    } else {
      runtime = 'runtime';
    }
    if (meta) {
      if (token.type === IDENTIFIER) {
        name = token;
        nextToken();
      } else {
        syntaxError('expect identifier');
      }
    } else if (token.type !== IDENTIFIER) {
      return;
    } else {
      name = token;
      nextToken();
    }
    if (token.type === SPACE) {
      nextToken();
    }
    if (token.value === '=' && nextToken()) {
      if (token.type === SPACE) {
        nextToken();
      }
      value = parser.spaceClauseExpression();
      if (token.type === SPACE) {
        nextToken();
      }
    }
    return [name, value, runtime, meta];
  };
  spaceComma = function() {
    var result;
    if (token.type === SPACE) {
      nextToken();
    }
    if (token.value === ',') {
      nextToken();
      result = true;
    }
    if (token.type === SPACE) {
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
      var start, type, varList;
      start = token;
      nextToken();
      if (token.type === SPACE) {
        nextToken();
      }
      varList = parser.varInitList();
      if (varList.length === 0) {
        syntaxError('expect variable name');
      }
      if ((type = token.type) !== NEWLINE && type !== UNDENT && type !== EOI && type !== CONJUNCTION && type !== RIGHT_DELIMITER && type !== PUNCTUATION) {
        syntaxError('unexpected token after var initialization list "' + token.value + '"');
      }
      varList.unshift('var');
      return {
        value: varList,
        start: start,
        stop: token
      };
    },
    'extern!': function(isHeadStatement) {
      return ['extern!'].concat(parser.identifierList());
    },
    'include!': function(isHeadStatement) {
      var filePath, parseMethod;
      if (token.type === SPACE) {
        nextToken();
      }
      filePath = expect('string', 'expect a file path');
      if (token.type === SPACE) {
        nextToken();
      }
      if (word('by')) {
        if (token.type === SPACE) {
          nextToken();
        }
        parseMethod = expect('taijiIdentifier', 'expect a parser method');
      }
      return ['include!', filePath, parseMethod];
    },
    'import!': function(isHeadStatement) {
      var alias, item, items, metaAlias, metaImportList, parseMethod, runtimeImportList, srcModule, start, sym, symValue, x, _len4, _len5, _m, _n;
      start = token;
      nextToken();
      if (token.type === SPACE) {
        nextToken();
      }
      items = parser.importItemList();
      if (token.type === SPACE) {
        nextToken();
      }
      if (token.type === IDENTIFIER) {
        nextToken();
        if (token.type === SPACE) {
          nextToken();
        }
      } else if (items.length) {
        syntaxError('expect "from"');
      }
      if (token.type !== NON_INTERPOLATE_STRING) {
        syntaxError('expect the path of module file');
      }
      srcModule = token;
      nextToken();
      if (token.type === SPACE) {
        nextToken();
      }
      if (token.value === 'as') {
        nextToken();
        if (token.type === SPACE) {
          nextToken();
        }
        if (token.type === SYMBOL) {
          if ((symValue = token.value) && symValue !== '#' && symValue !== '#/') {
            syntaxError('unexpected symbol before import module name', token);
          }
          sym = token;
          nextToken();
        }
        if (token.type !== IDENTIFIER) {
          syntaxError('expect an alias for module');
        }
        alias = token;
        nextToken();
        if (token.type === SPACE) {
          nextToken();
        }
        if (symValue === '#') {
          metaAlias = alias;
          alias = void 0;
        } else if (symValue === '#/') {
          metaAlias = alias;
        }
        if (!metaAlias) {
          if (token.type === SYMBOL) {
            if (token.value !== '#') {
              syntaxError('unexpected symbol');
            } else {
              nextToken();
              if (token.type === SPACE) {
                nextToken();
              }
              if (token.type === IDENTIFIER && token.value !== 'by') {
                metaAlias = token;
                nextToken();
                if (token.type === SPACE) {
                  nextToken();
                }
              }
            }
          }
        }
      }
      if (token.value === 'by' && nextToken()) {
        if (token.type === SPACE) {
          nextToken();
        }
        if (token.type !== IDENTIFIER) {
          syntaxError('expect parser method');
        }
        if (token.type === SPACE) {
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
        value: ['import!', srcModule, parseMethod, alias, metaAlias, runtimeImportList, metaImportList],
        start: start,
        stop: token
      };
    },
    'export!': function(isHeadStatement) {
      var start;
      start = token;
      nextToken();
      if (token.type === SPACE) {
        nextToken();
      }
      return {
        value: ['export!'].concat(parser.exportItemList(), {
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
      var body, clause, inOf, ind, init, kw, name1, name2, obj, start, step, test, value;
      start = token;
      ind = indent;
      skipToken();
      skipSpace();
      if (char === '(' && (char = text[++cursor])) {
        matchToken();
        if (token.type === SPACE) {
          nextToken();
        }
        init = parser.clause();
        if (token.type === SPACE) {
          nextToken();
        }
        if (token.value === ';') {
          nextToken();
        } else {
          syntaxError('expect ";"');
        }
        if (token.type === SPACE) {
          nextToken();
        }
        test = parser.clause();
        if (token.type === SPACE) {
          nextToken();
        }
        if (token.value === ';') {
          nextToken();
        } else {
          syntaxError('expect ";"');
        }
        if (token.type === SPACE) {
          nextToken();
        }
        step = parser.clause();
        if (token.type === SPACE) {
          nextToken();
        }
        if (token.value === ')') {
          nextToken();
        } else {
          'expect ")"';
        }
        if (token.type === SPACE) {
          nextToken();
        }
        expectThen(isHeadStatement, ind);
        body = parser.block() || parser.line();
        if (body.length === 1) {
          body = body[0];
        } else if (body.length === 0) {
          body = 'undefined';
        } else {
          body.unshift('begin!');
        }
        return {
          value: ['cFor!', init, test, step, body],
          start: start,
          stop: token
        };
      }
      matchToken();
      if (token.type !== IDENTIFIER) {
        syntaxError('expect identifier');
      }
      name1 = token;
      nextToken();
      if (token.type === SPACE) {
        nextToken();
      }
      if (token.value === ',') {
        nextToken();
        if (token.type === SPACE) {
          nextToken();
        }
      }
      if (token.type !== IDENTIFIER) {
        syntaxError('expect "in", "of" or index variable name');
      }
      if ((value = token.value) === 'in' || value === 'of') {
        inOf = value;
        nextToken();
      } else {
        name2 = token;
        nextToken();
        if (token.type === SPACE) {
          nextToken();
        }
        if ((value = token.value) === 'in' || value === 'of') {
          inOf = value;
          nextToken();
        } else {
          'expect "in" or "of"';
        }
      }
      if (token.type === SPACE) {
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
      if (body.length === 1) {
        body = body[0];
      } else if (body.length === 0) {
        body = 'undefined';
      } else {
        body.unshift('begin!');
      }
      clause = [kw, name1, name2, obj, body];
      clause.start = start;
      clause.stop = token;
      return clause;
    },
    'do': function(isHeadStatement) {
      var body, conj, conjValue, ind, start, tailClause;
      start = token;
      ind = indent;
      nextToken();
      if (token.type === SPACE) {
        nextToken();
      }
      body = parser.block() || parser.line();
      if (body.length === 1) {
        body = body[0];
      } else if (body.length === 0) {
        body = 'undefined';
      } else {
        body.unshift('begin!');
      }
      if (indent === ind) {
        if (token.type === UNDENT) {
          nextToken();
        }
        if (atStatementHead && !isHeadStatement) {
          return {
            value: body,
            start: start,
            stop: token
          };
        }
        if (token.type === CONJUNCTION && (conjValue = token.value) === 'where' || conjValue === 'when' || conjValue === 'until') {
          conj = token;
          nextToken();
          if (token.type === SPACE) {
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
          value: ['let', tailClause, body],
          start: start,
          stop: token
        };
      } else if (conjValue === 'when') {
        return {
          value: ['doWhile!', body, tailClause],
          start: start,
          stop: token
        };
      } else {
        return {
          value: ['doWhile!', body, ['!x', tailClause]],
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
      if (token.type === SPACE) {
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
        if (token.type === SPACE) {
          nextToken();
        }
        caseValues = [];
        while (exp = parser.compactClauseExpression()) {
          caseValues.push(exp);
          if (token.type === SPACE) {
            nextToken();
          }
          if (token.value === ',') {
            nextToken();
            if (token.type === SPACE) {
              nextToken();
            }
          }
        }
        if (token.value !== ':') {
          'expect ":" after case values';
        }
        nextToken();
        if (token.type === SPACE) {
          nextToken();
        }
        body = parser.block() || parser.line();
        if (body.length === 1) {
          body = body[0];
        } else if (body.length === 0) {
          body = void 0;
        } else {
          body.unshift('begin!');
        }
        cases.push([caseValues, body]);
      }
      if (maybeIndentConjunction('else', isHeadStatement, ind, indentInfo)) {
        else_ = parser.block() || parser.line();
        if (else_.length === 1) {
          else_ = else_[0];
        } else if (else_.length === 0) {
          else_ = void 0;
        } else {
          else_.unshift('begin!');
        }
      }
      return {
        value: ['switch', test, cases, else_],
        start: start,
        stop: token
      };
    },
    'try': function(isHeadStatement) {
      var catchVar, catch_, final, ind, start, test;
      start = token;
      ind = indent;
      nextToken();
      if (token.type === SPACE) {
        nextToken();
      }
      if (!(test = parser.block() || parser.line())) {
        syntaxError('expect a line or block after "try"');
      }
      if (test.length === 1) {
        test = test[0];
      } else if (test.length === 0) {
        test = void 0;
      } else {
        test.unshift('begin!');
      }
      if (atStatementHead && !isHeadStatement) {
        syntaxError('meet unexpected new line when parsing inline try statement');
      }
      if (maybeConjunction("catch", isHeadStatement, ind)) {
        if (token.type === SPACE) {
          nextToken();
        }
        atStatementHead = false;
        if (token.type === IDENTIFIER) {
          catchVar = token;
          nextToken();
        }
        if (token.type === SPACE) {
          nextToken();
        }
        if (token.type !== CONJUNCTION || token.value !== 'then') {
          syntaxError('expect "then" after "catch +' + catchVar.value + '"');
        }
        nextToken();
        if (token.type === SPACE) {
          nextToken();
        }
        catch_ = parser.block() || parser.line();
        if (catch_.length === 1) {
          catch_ = catch_[0];
        } else if (catch_.length === 0) {
          catch_ = void 0;
        } else {
          catch_.unshift('begin!');
        }
      }
      if (maybeConjunction("finally", isHeadStatement, ind)) {
        if (token.type === SPACE) {
          nextToken();
        }
        final = parser.block() || parser.line();
        if (final.length === 1) {
          final = final[0];
        } else if (final.length === 0) {
          final = void 0;
        } else {
          final.unshift('begin!');
        }
      }
      return {
        value: ['try', test, catchVar, catch_, final],
        start: start,
        stop: token
      };
    },
    'class': function(isHeadStatement) {
      var body, name, superClass;
      nextToken();
      if (token.type === SPACE) {
        nextToken();
      }
      if (token.type !== IDENTIFIER) {
        syntaxError('expect class nam');
      }
      name = token;
      nextToken();
      if (token.type === SPACE) {
        nextToken();
      }
      if (token.type === CONJUNCTION && token.value === 'extends' && nextToken()) {
        if (token.type === SPACE) {
          nextToken();
        }
        if (token.type === IDENTIFIER) {
          superClass = token;
          nextToken();
        }
        if (token.type === SPACE) {
          nextToken();
        }
      } else {
        superClass = void 0;
      }
      if (token.type === NEWLINE || token.type === UNDENT || token.type === EOI) {
        body = void 0;
      } else {
        body = parser.block() || parser.line();
      }
      return ['#call!', 'class', [name, superClass, body]];
    }
  };
  this.sequenceClause = function() {
    var clause, item, start;
    start = token;
    clause = [];
    while (1) {
      if (token.type === SPACE) {
        nextToken();
      }
      if ((item = parser.compactClauseExpression())) {
        clause.push(item);
      } else {
        break;
      }
    }
    if (!clause.length) {
      return;
    }
    return {
      value: clause,
      start: start,
      stop: token
    };
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
      tkn.symbol = 'quote!';
      return [tkn, clause];
    },
    '`': function(tkn, clause) {
      tkn.symbol = 'quasiquote!';
      return [tkn, clause];
    },
    '^': function(tkn, clause) {
      tkn.symbol = 'unquote!';
      return [tkn, clause];
    },
    '^&': function(tkn, clause) {
      tkn.symbol = 'unquote-splice';
      return [tkn, clause];
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
  symbol2clause = {
    '%': function(isHeadStatement) {
      var code, ind, leadClause, result;
      ind = indent;
      if (token.type !== SPACE) {
        return;
      }
      leadClause = parser.clause();
      code = compileExp(['return', ['%/', leadClause]], environment);
      if (token.type === SPACE) {
        matchToken();
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
      var start, type;
      start = token;
      if ((type = matchToken().type) !== SPACE && type !== INDENT) {
        token = start;
        return;
      }
      matchToken();
      if (!(fn = leadWordClauseMap[start.value])) {
        token = start;
        return;
      }
      return {
        value: fn(start, parser.clause()),
        start: start,
        stop: token
      };
    };
  };
  for (key in leadWordClauseMap) {
    fn = leadWordClauseMap[key];
    symbol2clause[key] = leadTokenClause(fn);
  }
  this.definitionSymbolBody = definitionSymbolBody = function() {
    var body, start;
    start = token;
    nextToken();
    if (token.type === SPACE) {
      nextToken();
    }
    if (token.type === INDENT) {
      body = parser.block();
    } else {
      body = parser.line();
    }
    if (body) {
      if (body.length === 1) {
        body = body[0];
      } else if (body.length === 0) {
        body = 'undefined';
      } else {
        body.unshift('begin!');
      }
    }
    return {
      value: [start, [], body],
      start: start,
      stop: token
    };
  };
  symbol2clause['->'] = definitionSymbolBody;
  symbol2clause['|->'] = definitionSymbolBody;
  symbol2clause['=>'] = definitionSymbolBody;
  symbol2clause['|=>'] = definitionSymbolBody;
  this.customDefinitionParameterList = function() {};
  this.clause = function() {
    var blk, clause, clause0, clauseValue, clauses, definition, exp, head, isStatementHead, op, params, result, right, start, tkn, tokenAfterOperator, type, value;
    if ((type = token.type) === SPACE) {
      nextToken();
      type = token.type;
    }
    start = token;
    switch (token.type) {
      case KEYWORD:
        isStatementHead = atStatementHead;
        atStatementHead = false;
        return keyword2statement[token.value](isStatementHead);
      case IDENTIFIER:
        nextToken();
        if (token.value === '#' && nextToken() && token.value === ':' && nextToken()) {
          if (token.type === SPACE) {
            nextToken();
          }
          blk = parser.lineBlock();
          if (blk.length === 1) {
            blk = blk[0];
          } else if (blk.length === 0) {
            blk = void 0;
          } else {
            blk.unshift('begin!');
          }
          return {
            value: ['label!', start, blk],
            start: start,
            stop: token
          };
        } else {
          token = start;
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
        if (token.type === SPACE && nextToken() && (exp = parser.spaceClauseExpression())) {
          return {
            value: [op, exp],
            start: start,
            stop: token
          };
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
    if (op = parser.binaryOperator(SPACE_CLAUSE_EXPRESSION)) {
      tokenAfterOperator = token;
      token = head;
      head.next = op;
      op[binaryOperatorMemoIndex + SPACE_CLAUSE_EXPRESSION] = {
        result: op,
        next: tokenAfterOperator
      };
      if ((exp = parser.spaceClauseExpression())) {
        if ((value = token.value) === ',') {
          nextToken();
          if (token.type === SPACE) {
            nextToken();
          }
          return exp;
        } else if (value !== ';' && (type = token.type) !== NEWLINE && type !== UNDENT && type !== EOI) {
          if (exp.priority < 600) {
            syntaxError('after space expression clause, expect stop symbol of clause like colon, semicolon, new line, undent or end of input etc.');
          } else {
            token = op;
          }
        } else {
          return exp;
        }
      } else {
        token = op;
      }
    } else if ((type = head.type) !== NUMBER && type !== NON_INTERPOLATE_STRING && type !== INTERPOLATE_STRING && type !== BRACKET && type !== HASH) {
      tkn = token;
      if ((exp = parser.spaceClauseExpression()) && exp.priority <= 600) {
        if ((value = token.value) === ',') {
          nextToken();
          if (token.type === SPACE) {
            nextToken();
          }
          return {
            value: [head, exp],
            start: start,
            stop: token
          };
        } else if (value !== ';' && (type = token.type) !== NEWLINE && type !== UNDENT && type !== EOI) {
          syntaxError('after caller leading clause, expect stop symbol of clause like colon, semicolon, new line, undent or end of input etc.');
        } else {
          return {
            value: [head, exp],
            start: start,
            stop: token
          };
        }
      } else {
        token = tkn;
      }
    }
    if (token.type === SPACE) {
      nextToken();
    }
    if ((op = binaryOperatorDict[token.value]) && op.assign) {
      nextToken();
      if ((type = token.type) === SPACE) {
        nextToken();
        type = token.type;
      }
      if (type === UNDENT) {
        syntaxError('unexpected undent after assign symbol' + op.value);
      } else if (type === NEWLINE) {
        syntaxError('unexpected new line after assign symbol' + op.value);
      } else if (type === EOI) {
        syntaxError('unexpected end of input' + op.value);
      }
      if (right = parser.block()) {
        if (right.length === 1) {
          right = right[0];
        } else if (right.length === 0) {
          right = 'undefined';
        } else {
          right.unshift('begin!');
        }
      } else {
        right = parser.clause();
      }
      if (head.type === CURVE) {
        return {
          value: ['hashAssign!', op, head, right],
          start: start,
          stop: token
        };
      } else if (head.type === BRACKET) {
        return {
          value: ['listAssign!', op, head, right],
          start: start,
          stop: token
        };
      } else {
        return {
          value: [op, head, right],
          start: start,
          stop: token
        };
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
      return {
        value: clause,
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
      clauseValue = clause.value;
      if (clause.parameters) {
        if (clause.type === PAREN) {
          if (clause.empty) {
            definition.value[1] = [];
            definition.start = start;
            clause = definition;
          } else {
            clauseValue = clauseValue.value;
            if (clauseValue.push) {
              if (clauseValue.length === 0) {
                syntaxError('unexpected [] in parameter list');
              } else if (clauseValue[0] !== ',') {
                syntaxError('syntax error in parameter list');
              } else {
                clauseValue.shift();
                definition.value[1] = clauseValue;
                definition.start = start;
                clause = definition;
              }
            } else {
              definition.value[1] = [clause];
              definition.start = start;
              clause = definition;
            }
          }
        } else {
          parser.customDefinitionParameterList(clause, definition);
        }
      } else if (clauseValue.push && clauseValue.length > 1) {
        params = clauseValue[clauseValue.length - 1];
        if (params.parameters) {
          clauseValue.pop();
          definition.value[1] = params;
          definition.start = params.start;
        }
        clauseValue.push(definition);
        clause.stop = token;
      } else {
        clause = [clause, definition];
        clause.start = start;
        clause.stop = token;
      }
      return clause;
    }
    if ((value = token.value) === ',') {
      nextToken();
      clause.stop = token;
      return clause;
    } else if (value === ':') {
      nextToken();
      if (token.type === INDENT) {
        clauses = parser.block();
      } else {
        clauses = parser.clauses();
      }
      if (clauses.length === 1) {
        clause0 = clauses[0];
        if (clause0.value.push && clause0.type !== BRACKET) {
          clauses = clause0.value;
        }
      } else if (clauses.length === 0) {
        syntaxError('expected arguments list after ":"');
      }
      clauses.unshift(clause);
      clauses.start = start;
      clauses.stop = token;
      return clauses;
    } else if (token.type === INDENT) {
      tkn = token;
      nextToken();
      if (token.type === CONJUNCTION) {
        token = tkn;
        atStatementHead = true;
        clause.stop = token;
        return clause;
      } else {
        token = tkn;
        atStatementHead = true;
        clauses = parser.block();
        if (clause.value.push) {
          clause.value.push.apply(clause.value, clauses);
          clause.stop = token;
          return clause;
        } else {
          clauses.unshift(clause);
          return clause = {
            value: clauses,
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
    var result, start, type;
    start = token;
    if ((type = token.type) === EOI || type === INDENT || type === UNDENT || type === NEWLINE || type === RIGHT_DELIMITER || type === CONJUNCTION) {
      return;
    }
    result = parser.clauses();
    if (token.value === ';') {
      nextToken();
      if (token.type === SPACE) {
        nextToken();
      }
    }
    return extendSyntaxInfo(result, start, token);
  };
  this.line = function() {
    var result, start, tkn, type, x;
    if ((type = token.type) === UNDENT || type === RIGHT_DELIMITER || type === CONJUNCTION || type === EOI) {
      return;
    }
    if (type === INDENT) {
      return parser.block(indent);
    }
    if (type === CODE_BLOCK_COMMENT_LEAD_SYMBOL) {
      start = token;
      nextToken();
      if (token.type === SPACE) {
        nextToken();
      }
      x = parser.line();
      return [
        {
          value: ['codeBlockComment!', x],
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
    if (token.type === INDENT) {
      nextToken();
      return parser.blockWithoutIndentHead(indent);
    }
  };
  this.blockWithoutIndentHead = function(dent) {
    var result, x;
    result = [];
    while ((x = parser.line())) {
      result.push.apply(result, x);
      if (token.type === NEWLINE) {
        nextToken();
        continue;
      }
      if (token.type === EOI) {
        break;
      } else if (token.type === UNDENT) {
        if (indent === dent) {
          nextToken();
          break;
        } else if (indent > dent) {
          syntaxError('wrong indent');
        } else {
          continue;
        }
      } else if (token.type === CONJUNCTION) {
        syntaxError('unexpected conjunction "' + token.value + '" following a indent block');
      }
    }
    return result;
  };
  this.lineBlock = function(dent) {
    var result, tkn;
    result = parser.line();
    if (token.type === NEWLINE) {
      nextToken();
    }
    tkn = token;
    if (token.type === INDENT) {
      nextToken();
    }
    if (token.type === SPACE) {
      nextToken();
    }
    if (token.type === CONJUNCTION) {
      token = tkn;
    } else {
      token = tkn;
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
    if (token.type === NEWLINE) {
      matchToken();
    } else if (token.type === SPACE) {
      matchToken();
    }
    body = [];
    while (1) {
      if (!(x = parser.line())) {
        break;
      }
      if (token.type === NEWLINE) {
        nextToken();
      }
      body.push.apply(body, x);
    }
    if (token.type !== EOI) {
      syntaxError('expect end of input, but meet "' + text.slice(cursor) + '"');
    }
    if (body.length > 1) {
      body.unshift('begin!');
    } else if (body.length === 1) {
      body = body[0];
    } else {
      body = void 0;
    }
    return {
      value: body,
      start: start,
      stop: eoi
    };
  };
  this.binShellDirective = function() {
    var cur;
    if (text.slice(cursor, cursor + 2) !== '#!') {
      return;
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
    return ['binShellDirective!', text.slice(cur, cursor)];
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
    var body, header, result, scriptDirective;
    scriptDirective = ['scriptDirective!', parser.binShellDirective()];
    header = parser.moduleHeader();
    body = parser.moduleBody();
    result = {
      value: ['module!', scriptDirective, header, body],
      cursor: 0,
      stopCursor: text.length,
      line: 1,
      column: 0
    };
    result.start = result;
    return result;
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
    var cur;
    tkn = tkn || token;
    cur = tkn.cursor;
    str = cur + '(' + tkn.line + ':' + tkn.column + '): ' + message + (", meet \"" + token.value + "\"\n") + text.slice(cur - 40, cur) + text.slice(cur, cur + 40);
    throw str;
  };
  return this;
};

compileExp = require('../compiler').compileExp;
