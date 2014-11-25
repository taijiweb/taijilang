var BINARY, BRACKET, COMPACT_CLAUSE_EXPRESSION, CONJUNCTION, CURVE, EOI, HALF_DENT, IDENTIFIER, INDENT, KEYWORD, LINE_COMMENT, NEWLINE, NULL, NUMBER, PAREN, PREFIX, PUNCTUATION, REGEXP, RIGHT_DELIMITER, SPACE, SPACES, SPACE_COMMENT, STRING, SUFFIX, SYMBOL, TAIL_COMMENT, UNDENT, begin, binaryOperatorDict, conjMap, conjunctionHasOwnProperty, constant, firstIdentifierCharSet, firstSymbolCharset, hasOwnProperty, identifierCharSet, keywordHasOwnProperty, keywordMap, prefixOperatorDict, str, taijiIdentifierCharSet, trace, _ref, _ref1,
  __slice = [].slice;

_ref = require('../utils'), str = _ref.str, hasOwnProperty = _ref.hasOwnProperty, firstIdentifierCharSet = _ref.firstIdentifierCharSet, identifierCharSet = _ref.identifierCharSet, firstSymbolCharset = _ref.firstSymbolCharset, taijiIdentifierCharSet = _ref.taijiIdentifierCharSet, constant = _ref.constant, trace = _ref.trace;

NULL = constant.NULL, NUMBER = constant.NUMBER, STRING = constant.STRING, IDENTIFIER = constant.IDENTIFIER, SYMBOL = constant.SYMBOL, REGEXP = constant.REGEXP, PUNCTUATION = constant.PUNCTUATION, PAREN = constant.PAREN, BRACKET = constant.BRACKET, CURVE = constant.CURVE, NEWLINE = constant.NEWLINE, SPACES = constant.SPACES, LINE_COMMENT = constant.LINE_COMMENT, EOI = constant.EOI, INDENT = constant.INDENT, UNDENT = constant.UNDENT, HALF_DENT = constant.HALF_DENT, SPACE_COMMENT = constant.SPACE_COMMENT, TAIL_COMMENT = constant.TAIL_COMMENT, SPACE = constant.SPACE, RIGHT_DELIMITER = constant.RIGHT_DELIMITER, KEYWORD = constant.KEYWORD, CONJUNCTION = constant.CONJUNCTION, PREFIX = constant.PREFIX, SUFFIX = constant.SUFFIX, BINARY = constant.BINARY, COMPACT_CLAUSE_EXPRESSION = constant.COMPACT_CLAUSE_EXPRESSION;

_ref1 = require('./operator'), prefixOperatorDict = _ref1.prefixOperatorDict, binaryOperatorDict = _ref1.binaryOperatorDict;

exports.keywordMap = keywordMap = {
  'if': 1,
  'try': 1,
  'while': 1,
  'return': 1,
  'break': 1,
  'continue': 1,
  'throw': 1,
  'for': 1,
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
  'extends': 1
};

conjunctionHasOwnProperty = hasOwnProperty.bind(exports.conjMap);

begin = function(exps) {
  var exp, result, _i, _len;
  if (!exps) {
    return 'undefined';
  } else if (exps.length === 0) {
    return 'undefined';
  } else if (exps.length === 1) {
    return exps[0];
  } else {
    result = ['begin!'];
    for (_i = 0, _len = exps.length; _i < _len; _i++) {
      exp = exps[_i];
      if (exp[0] === 'begin!') {
        result.push.apply(exps.slice(1));
      } else {
        result.push(exp);
      }
    }
    return result;
  }
};

exports.Parser = function() {
  var atStatementHead, breakContinueStatement, c, char, cursor, definitionSymbolBody, eoi, expectThen, expression, fn, indent, isNewlineChar, key, keyword2statement, keywordThenElseStatement, leadTokenClause, leadWordClauseMap, leftRegexp, lexIndent, lineStart, lineno, matchToken, maybeConjunction, newLineAndEmptyLines, nextNonspaceToken, nextPiece, nextToken, nullToken, operatorExpression, parseError, parser, rollbackOnType, setToken, skipInlineSpace, skipNewline, skipSPACE, skipSomeType, skipSpaceLines, skipTokenType, sym, symbolStopChars, text, textLength, throwReturnStatement, token, tokenFnMap, tokenOnBackSlashChar, tokenOnColonChar, tokenOnForwardSlashChar, tokenOnIdentifierChar, tokenOnLeftBracketChar, tokenOnLeftParenChar, tokenOnNewlineChar, tokenOnNumberChar, tokenOnQuoteChar, tokenOnRightDelimiterChar, tokenOnSymbolChar, tokenType, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref2, _ref3, _ref4, _ref5, _ref6;
  parser = this;
  text = '';
  textLength = text.length;
  cursor = 0;
  char = '';
  lineno = 0;
  lineStart = 0;
  lexIndent = 0;
  indent = 0;
  token = void 0;
  tokenType = void 0;
  atStatementHead = true;
  eoi = {
    type: EOI,
    value: '',
    cursor: text.length,
    column: -1,
    lexIndent: -1,
    indent: -1
  };
  eoi.next = eoi;
  nextToken = function() {
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
      return matchToken();
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
      token.next = eoi;
      lineStart = cursor;
      return setToken(eoi);
    } else {
      return token = tokenOnSymbolChar();
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
  setToken = function(tkn) {
    token = tkn;
    tokenType = token.type;
    return token;
  };
  skipTokenType = function(type) {
    if (tokenType === INDENT) {
      return nextToken();
    }
  };
  skipSPACE = function() {
    if (tokenType === SPACE) {
      nextToken();
    }
    return token;
  };
  nextNonspaceToken = function() {
    nextToken();
    skipSPACE();
    return token;
  };
  skipSomeType = function() {
    var t, types, _i, _len;
    types = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    for (_i = 0, _len = types.length; _i < _len; _i++) {
      t = types[_i];
      if (tokenType === t) {
        nextToken();
        return;
      }
    }
  };
  rollbackOnType = function(type, tkn) {
    if (tokenType === type) {
      return setToken(tkn);
    }
  };
  this.tokenFnMap = tokenFnMap = {};
  tokenOnSymbolChar = function() {
    var c2, cur;
    cur = cursor;
    while (char = text[++cursor]) {
      if (symbolStopChars[char]) {
        break;
      }
      if (char === '/' && ((c2 = text[cursor + 1]) === '/' || c2 === '!')) {
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
  tokenFnMap[' '] = tokenFnMap['\t'] = function() {
    var column, cur, line;
    cur = cursor;
    line = lineno;
    column = cursor - lineStart;
    indent = lexIndent;
    char = text[++cursor];
    skipInlineSpace(indent);
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
    skipNewline();
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
      } else if (skipNewline()) {
        continue;
      } else if (!char) {
        break;
      } else if ((lexIndent = cursor - lineStart) !== dent) {
        break;
      } else if (char === '/' && (c2 = text[cursor + 1]) === '/') {
        cursor += 2;
        char = text[cursor];
        while ((char = text[cursor]) && char !== '\n' && char !== '\r') {
          cursor++;
          char = text[cursor];
        }
      } else {
        break;
      }
    }
  };
  skipInlineSpace = function() {
    var _results;
    _results = [];
    while (1) {
      while (char === ' ' || char === '\t') {
        char = text[++cursor];
      }
      if (char === '/' && text[cursor + 1] === '/') {
        cursor += 2;
        char = text[cursor];
        while (char !== '\n' && char !== '\r') {
          char = text[++cursor];
          continue;
        }
        break;
      }
      break;
    }
    return _results;
  };
  skipNewline = function() {
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
  tokenOnNumberChar = function() {};
  isNewlineChar = function(c) {
    return c === '\n' || c === '\r';
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
      } else if (isNewlineChar(char)) {
        parseError('meet unexpected new line while parsing regular expression');
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
            parseError('too many modifiers "igm" after regexp');
          }
        }
        return;
      } else {
        char = text[++cursor];
      }
    }
    if (!char) {
      return parseError('unexpected end of input while parsing regexp');
    }
  };
  tokenFnMap['\\'] = tokenOnBackSlashChar = function() {
    var column, cur, line, tkn, _k, _len2, _ref4;
    cur = cursor;
    column = cursor - lineStart;
    char = text[++cursor];
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
    } else if (char === "'") {
      tkn = tokenOnQuoteChar();
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
            parseError('unexpected new line characters in escaped string');
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
    var column, cur, line, prev, value;
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
        cursor: cur,
        stopCursor: cursor,
        line: lineno,
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
          parseError('unexpected tab character "\t" at the head of line');
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
          parseError('unexpected tab character "\t" at the head of line');
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
  _ref4 = '0123456789';
  for (_k = 0, _len2 = _ref4.length; _k < _len2; _k++) {
    c = _ref4[_k];
    tokenFnMap[c] = tokenOnNumberChar;
  }
  tokenFnMap[','] = tokenFnMap[';'] = function() {
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
  tokenFnMap["'"] = tokenFnMap['"'] = tokenOnQuoteChar = function() {
    var column, cur, indentInfo, line, quote, s;
    quote = char;
    char = text[++cursor];
    column = cursor - lineStart;
    if (char === quote) {
      if (text[cursor + 1] === quote) {
        char = text[++cursor];
        return token.next = {
          value: '""',
          type: tokenType = STRING,
          atom: true,
          cursor: cursor - 2,
          line: lineno,
          column: column,
          atom: true
        };
      }
    } else {
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
        if (char === quote) {
          char = text[++cursor];
          return token.next = {
            type: tokenType = STRING,
            value: '"' + s + '"',
            atom: true,
            cursor: cur,
            stopCursor: cursor,
            line: line,
            stopLine: lineno,
            column: column
          };
        } else if (char === '\\') {
          char = text[++cursor];
          if (isNewlineChar(char)) {
            error('unexpected new line while parsing string');
          }
          char = text[++cursor];
        } else if (isNewlineChar(char)) {
          error('unexpected new line while parsing string');
        }
      }
      return parseError("expect \"'\", unexpected end of input while parsing interpolated string");
    }
  };
  tokenFnMap['('] = tokenOnLeftParenChar = function() {
    var column, cur, exp, ind, line, prev;
    cur = cursor;
    line = lineno;
    column = cursor - lineStart;
    char = text[++cursor];
    prev = token;
    matchToken();
    if (tokenType === UNDENT) {
      parseError('unexpected undent while parsing parenethis "(...)"');
    }
    ind = indent = lexIndent;
    if (tokenType === SPACE || tokenType === NEWLINE || tokenType === INDENT) {
      nextToken();
    }
    if (token.value === ')') {
      return prev.next = token = extend(['()'], {
        type: tokenType = PAREN,
        atom: true,
        cursor: cur,
        stopCursor: cursor,
        line: lineno,
        column: column,
        indent: lexIndent,
        empty: true,
        parameters: true
      });
    }
    exp = parser.operatorExpression();
    if (tokenType === UNDENT) {
      if (token.indent < ind) {
        parseError('expect ) indent equal to or more than (');
      } else {
        nextToken();
      }
    } else {
      skipSPACE();
      if (token.value !== ')') {
        parseError('expect )');
      }
    }
    return prev.next = token = extend(['()', exp], {
      type: tokenType = PAREN,
      cursor: cur,
      stopCursor: cursor,
      line: line,
      column: column,
      indent: lexIndent,
      atom: true,
      parameters: true
    });
  };
  tokenFnMap['['] = tokenOnLeftBracketChar = function() {
    var column, cur, exp, line, prev, value;
    trace("tokenFnMap['[']: ", nextPiece());
    cur = cursor;
    char = text[++cursor];
    line = lineno;
    column = cursor - lineStart;
    prev = token;
    matchToken();
    exp = parser.block() || parser.lineBlock();
    if (tokenType === UNDENT) {
      if (token.indent < ind) {
        parseError('unexpected undent while parsing parenethis "[...]"');
      } else {
        nextToken();
      }
    }
    if (token.value !== ']') {
      parseError('expect ]');
    }
    if (!exp) {
      value = ['[]'];
    } else {
      value = ['[]', exp];
    }
    return prev.next = token = extend(value, {
      type: tokenType = BRACKET,
      cursor: cur,
      stopCursor: cursor,
      line: line,
      column: column,
      indent: lexIndent,
      atom: true
    });
  };
  tokenFnMap['{'] = function() {
    var body, column, cur, ind, line, prev, tkn;
    trace("tokenFnMap['{']: " + nextPiece());
    cur = cursor;
    char = text[++cursor];
    line = lineno;
    column = cursor - lineStart;
    ind = lexIndent;
    prev = token;
    matchToken();
    skipSPACE();
    if (token.value === '}' && (tkn = nextToken())) {
      return prev.next = token = extend(['{}'], {
        kind: LIST,
        atom: true,
        cursor: cur,
        stopCursor: cursor,
        line: line,
        column: column,
        indent: lexIndent,
        next: tkn
      });
    }
    body = parser.block() || parser.lineBlock();
    if (tokenType === UNDENT && token.indent < ind) {
      nextToken();
    }
    if (token.value !== '}') {
      parseError('expect }');
    }
    tkn = nextToken();
    if (indent < ind) {
      parseError('unexpected undent while parsing parenethis "{...}"');
    }
    return prev.next = token = extend(['{}', begin(body)], {
      type: tokenType = CURVE,
      atom: true,
      cursor: cur,
      stopCursor: cursor,
      line: line,
      column: column,
      indent: lexIndent,
      next: tkn
    });
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
  this.prefixOperator = function(mode) {
    var op, opToken, tokenText;
    tokenText = token.value;
    if (!hasOwnProperty.call(prefixOperatorDict, tokenText) || !(op = prefixOperatorDict[tokenText])) {
      return;
    }
    if ((mode === COMPACT_CLAUSE_EXPRESSION || mode === SPACE_CLAUSE_EXPRESSION) && op.definition) {
      return;
    }
    opToken = token;
    nextToken();
    if (tokenType === INDENT || tokenType === NEWLINE || tokenType === UNDENT) {
      if (mode === COMPACT_CLAUSE_EXPRESSION) {
        token = opToken;
        tokenType = opToken.type;
        return;
      } else {
        nextToken();
      }
    } else if (tokenType === RIGHT_DELIMITER) {
      if (mode !== COMPACT_CLAUSE_EXPRESSION) {
        error('unexpected ' + token.value);
      } else {
        opToken.atom = true;
        return opToken;
      }
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
  this.binaryOperator = function(mode) {
    var op, start;
    start = token;
    if (tokenType === SPACE) {
      if (mode === COMPACT_CLAUSE_EXPRESSION) {
        return;
      } else {
        nextToken();
      }
    }
    if (tokenType !== IDENTIFIER && tokenType !== SYMBOL) {
      if (mode === COMPACT_CLAUSE_EXPRESSION) {
        return;
      } else if (tokenType === RIGHT_DELIMITER) {
        error('unexpected ' + token.value);
      } else if (tokenType === EOI) {
        error('unexpected end of input');
      } else if (tokenType === UNDENT && indent < dent) {
        'wrong undent';
      }
    }
    if (!hasOwnProperty.call(binaryOperatorDict, opValue)) {
      start[binaryOperatorMemoIndex + mode] = {};
      token = start;
      tokenType = token.type;
      return;
    }
    op = binaryOperatorDict[opValue];
    return {
      value: opValue,
      priority: op.priority,
      rightAssoc: rightAssoc,
      assign: op.assign
    };
  };
  this.prefixExpression = function(mode, priority) {
    var op, pri, start, x;
    start = token;
    if (op = parser.prefixOperator(mode)) {
      pri = priority > op.priority ? priority : op.priority;
      x = parser.expression(mode, pri, true);
      if (x) {
        return extend(['prefix!', op.value, x], {
          expressionType: PREFIX,
          priority: op.priority,
          rightAssoc: op.rightAssoc,
          start: op.start,
          stop: op.stop || op.start
        });
      } else {
        token = start;
        tokenType = token.type;
      }
    }
  };
  this.expression = expression = function(mode, priority, leftAssoc) {
    var op, opPri, start, tkn2, x, y;
    start = token;
    if (!(x = parser.prefixExpression(mode, priority))) {
      if (!token.atom) {
        return;
      } else {
        x = token;
        x.priority = 1000;
        nextToken();
      }
    }
    while (1) {
      tkn2 = token;
      if ((op = parser.binaryOperator(mode, x))) {
        if ((opPri = op.priority) > priority || (opPri === priority && !leftAssoc)) {
          y = expression(mode, opPri, !op.rightAssoc);
          if (y) {
            x = extend(['binary!', op.value, x, y], {
              expressionType: BINARY,
              priority: op.priority,
              rightAssoc: op.rightAssoc,
              start: op.start,
              stop: op.stop || op.start
            });
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
    return x;
  };
  this.operatorExpression = operatorExpression = function() {
    return parser.expression(OPERATOR_EXPRESSION, 0, true);
  };
  this.compactClauseExpression = function() {
    return parser.expression(COMPACT_CLAUSE_EXPRESSION, 600, true);
  };
  expectThen = function(isHeadStatement, clauseIndent) {
    skipSPACE();
    if (atStatementHead && !isHeadStatement) {
      parseError('unexpected new line before "then" of inline keyword statement');
    }
    if (tokenType === INDENT) {
      parseError('unexpected indent before "then"');
    } else if (tokenType === EOI) {
      parseError('unexpected end of input, expect "then"');
    }
    if (tokenType === NEWLINE) {
      nextToken();
    } else if (tokenType === UNDENT && token.indent >= clauseIndent) {
      nextToken();
    }
    if (atStatementHead && indent !== clauseIndent) {
      parseError('wrong indent before "then"');
    }
    if (tokenType === CONJUNCTION) {
      if (token.value === "then") {
        nextToken();
        return true;
      } else {
        return parseError('unexpected conjunction "' + token.value + '", expect "then"');
      }
    } else {
      return parseError('expect "then"');
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
      parseError('wrong indent');
    }
    if (indent === clauseIndent && tokenType === CONJUNCTION && token.value === conj) {
      conj = token;
      nextToken();
      return conj;
    }
  };
  keywordThenElseStatement = function(keyword) {
    return function(isHeadStatement) {
      var else_, ind, test, then_, tkn;
      ind = indent;
      nextNonspaceToken();
      if (!(test = parser.clause())) {
        parseError('expect a clause after "' + keyword + '"');
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
        return [keyword, test, begin(then_), begin(else_)];
      } else {
        return [keyword, test, begin(then_)];
      }
    };
  };
  throwReturnStatement = function(keyword) {
    return function(isHeadStatement) {
      var clause;
      nextNonspaceToken();
      if (clause = parser.clause()) {
        return [keyword, clause];
      } else {
        return [keyword];
      }
    };
  };
  breakContinueStatement = function(keyword) {
    return function(isHeadStatement) {
      var label;
      nextNonspaceToken();
      if (tokenType === IDENTIFIER) {
        label = token;
        nextNonspaceToken();
        return [keyword, label];
      } else {
        skipSPACE();
        return [keyword];
      }
    };
  };
  this.keyword2statement = keyword2statement = {
    'break': breakContinueStatement('break'),
    'continue': breakContinueStatement('continue'),
    'throw': throwReturnStatement('throw'),
    'return': throwReturnStatement('return'),
    'new': throwReturnStatement('new'),
    'if': keywordThenElseStatement('if'),
    'while': keywordThenElseStatement('while'),
    'for': function(isHeadStatement) {
      var body, inOf, ind, kw, name1, name2, obj, value;
      ind = indent;
      matchToken();
      skipSPACE();
      if (tokenType !== IDENTIFIER) {
        parseError('expect identifier');
      }
      name1 = token;
      nextToken();
      skipSPACE();
      if (token.value === ',') {
        nextNonspaceToken();
      }
      if (tokenType !== IDENTIFIER) {
        parseError('expect "in", "of" or index variable name');
      }
      if ((value = token.value) === 'in' || value === 'of') {
        inOf = value;
        nextToken();
      } else {
        name2 = token;
        nextNonspaceToken();
        if ((value = token.value) === 'in' || value === 'of') {
          inOf = value;
          nextToken();
        } else {
          'expect "in" or "of"';
        }
      }
      skipSPACE();
      obj = parser.clause();
      expectThen(isHeadStatement, ind);
      body = parser.block() || parser.line();
      if (inOf === 'in') {
        kw = 'forIn!';
      } else {
        kw = 'forOf!';
      }
      return [kw, name1, name2, obj, begin(body)];
    },
    'try': function(isHeadStatement) {
      var catchVar, catch_, final, ind, test;
      ind = indent;
      nextToken();
      skipSPACE();
      if (!(test = parser.block() || parser.line())) {
        parseError('expect a line or block after "try"');
      }
      if (atStatementHead && !isHeadStatement) {
        parseError('meet unexpected new line when parsing inline try statement');
      }
      if (maybeConjunction("catch", isHeadStatement, ind)) {
        skipSPACE();
        atStatementHead = false;
        if (tokenType === IDENTIFIER) {
          catchVar = token;
          nextToken();
        }
        skipSPACE();
        if (tokenType !== CONJUNCTION || token.value !== 'then') {
          parseError('expect "then" after "catch +' + catchVar.value + '"');
        }
        nextNonspaceToken();
        catch_ = parser.block() || parser.line();
      }
      if (maybeConjunction("finally", isHeadStatement, ind)) {
        skipSPACE();
        final = parser.block() || parser.line();
        return ['try', test, catchVar, begin(catch_)];
      } else {
        return ['try', begin(test), catchVar, begin(catch_), begin(final)];
      }
    }
  };
  this.sequenceClause = function() {
    var clause, item, tkn;
    clause = [];
    while (1) {
      skipSPACE();
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
    return clause;
  };
  leadWordClauseMap = {};
  _ref6 = ['~', '`', '^', '^&', '#', '##', '#/', '#-', '#&'];
  for (_m = 0, _len4 = _ref6.length; _m < _len4; _m++) {
    sym = _ref6[_m];
    leadWordClauseMap[sym] = function(tkn, clause) {
      return [tkn, clause];
    };
  }
  leadTokenClause = function(fn) {
    return function() {
      var start, type;
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
      return fn(start, parser.clause());
    };
  };
  for (key in leadWordClauseMap) {
    fn = leadWordClauseMap[key];
    symbol2clause[key] = leadTokenClause(fn);
  }
  this.definitionSymbolBody = definitionSymbolBody = function() {
    var body, start;
    start = token;
    nextNonspaceToken();
    if (tokenType === INDENT) {
      body = parser.block();
    } else {
      body = parser.line();
    }
    return [start, [], begin(body)];
  };
  symbol2clause['->'] = symbol2clause['=>'] = definitionSymbolBody;
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
    var blk, clause, clauseValue, clauses, definition, isStatementHead, op, params, result, start, tkn, value;
    trace("clause: " + nextPiece());
    skipSPACE();
    start = token;
    switch (tokenType) {
      case KEYWORD:
        isStatementHead = atStatementHead;
        atStatementHead = false;
        return keyword2statement[token.value](isStatementHead);
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
    if (clause = parser.sequenceClause()) {
      clause.value.unshift(head);
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
      } else {
        clause = {
          value: [clause, definition]
        };
      }
      return clause;
    }
    if ((value = token.value) === ',') {
      nextToken();
      return clause;
    } else if (value === ':') {
      nextToken();
      if (tokenType === INDENT) {
        clauses = parser.block();
      } else {
        clauses = parser.clauses();
      }
      if (clauses.length === 0) {
        parseError('expected arguments list after ":"');
      }
      clauses.unshift(clause);
      return clauses;
    } else if (token.value === '#' && nextToken()) {
      if (tokenType === SPACE) {
        clauses = parser.clauses();
        return ['#', clause, clauses];
      } else if (tokenType === INDENT) {
        clauses = parser.block();
        return ['#', clause, clauses];
      }
    } else if (tokenType === INDENT) {
      tkn = token;
      nextToken();
      if (tokenType === CONJUNCTION) {
        setToken(tkn);
        atStatementHead = true;
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
            value: blk
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
        parseError('oops! inifinte loops!!!');
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
    if (token.value === ';' && nextToken()) {
      skipTokenType(SPACE);
    }
    return result;
  };
  this.line = function() {
    var result, tkn, x;
    if (tokenType === UNDENT || tokenType === RIGHT_DELIMITER || tokenType === CONJUNCTION || tokenType === EOI) {
      return;
    }
    if (tokenType === INDENT) {
      return parser.block(indent);
    }
    result = [];
    tkn = token;
    while (x = parser.sentence()) {
      result.push.apply(result, x);
      if (tkn === token) {
        parseError('oops! inifinte loops!!!');
      }
      tkn = token;
    }
    return result;
  };
  this.block = function(dent) {
    skipTokenType(INDENT);
    return parser.blockWithoutIndentHead(indent);
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
          parseError('wrong indent');
        }
      } else if (tokenType === CONJUNCTION) {
        parseError('unexpected conjunction "' + token.value + '" following a indent block');
      }
    }
    return result;
  };
  this.lineBlock = function(dent) {
    var result, tkn;
    result = parser.line();
    skipSomeType(NEWLINE, SPACE);
    tkn = token;
    skipTokenType(INDENT);
    rollbackOnType(CONJUNCTION, tkn);
    if (tokenType === CONJUNCTION) {
      setToken(tkn);
    } else {
      setToken(tkn);
      if (token.indent > dent) {
        result.push.apply(result, parser.blockWithoutIndentHead());
      }
    }
    return result;
  };
  this.module = function() {
    var body, x;
    nextToken();
    body = [];
    while (1) {
      if (!(x = parser.line())) {
        break;
      }
      skipTokenType(NEWLINE);
      body.push.apply(body, x);
    }
    if (tokenType !== EOI) {
      parseError('expect end of input, but meet "' + text.slice(cursor) + '"');
    }
    return begin(body);
  };
  this.parse = function(data, root, cur) {
    text = data;
    textLength = text.length;
    cursor = cur;
    char = text[cursor];
    lineno = 1;
    lineStart = 0;
    token = nullToken;
    atStatementHead = true;
    return root();
  };
  parseError = function(message, tkn) {
    var cur;
    tkn = tkn || token;
    cur = token.cursor;
    throw cur + '(' + tkn.line + ':' + tkn.column + '): ' + message + ': ' + text.slice(tkn.cursor, tkn.stopCursor);
  };
};

exports.Parser.name = 'Parser';
