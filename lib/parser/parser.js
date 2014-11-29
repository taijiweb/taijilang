var BINARY, BRACKET, COMPACT_CLAUSE_EXPRESSION, CONJUNCTION, CURVE, EOI, HALF_DENT, IDENTIFIER, INDENT, KEYWORD, LINE_COMMENT, NEWLINE, NULL, NUMBER, OPERATOR_EXPRESSION, PAREN, PREFIX, PUNCTUATION, REGEXP, RIGHT_DELIMITER, SPACE, SPACES, SPACE_COMMENT, STRING, SUFFIX, SYMBOL, TAIL_COMMENT, UNDENT, begin, binaryOperatorDict, conjMap, conjunctionHasOwnProperty, constant, extend, firstIdentifierCharSet, firstSymbolCharset, hasOwnProperty, keywordHasOwnProperty, keywordMap, letterCharSet, prefixOperatorDict, str, taijiIdentifierCharSet, trace, _ref, _ref1,
  __slice = [].slice;

_ref = require('../utils'), str = _ref.str, hasOwnProperty = _ref.hasOwnProperty, extend = _ref.extend, letterCharSet = _ref.letterCharSet, firstIdentifierCharSet = _ref.firstIdentifierCharSet, firstSymbolCharset = _ref.firstSymbolCharset, taijiIdentifierCharSet = _ref.taijiIdentifierCharSet, constant = _ref.constant, trace = _ref.trace;

NULL = constant.NULL, NUMBER = constant.NUMBER, STRING = constant.STRING, IDENTIFIER = constant.IDENTIFIER, SYMBOL = constant.SYMBOL, REGEXP = constant.REGEXP, PUNCTUATION = constant.PUNCTUATION, PAREN = constant.PAREN, BRACKET = constant.BRACKET, CURVE = constant.CURVE, NEWLINE = constant.NEWLINE, SPACES = constant.SPACES, LINE_COMMENT = constant.LINE_COMMENT, EOI = constant.EOI, INDENT = constant.INDENT, UNDENT = constant.UNDENT, HALF_DENT = constant.HALF_DENT, SPACE_COMMENT = constant.SPACE_COMMENT, TAIL_COMMENT = constant.TAIL_COMMENT, SPACE = constant.SPACE, RIGHT_DELIMITER = constant.RIGHT_DELIMITER, KEYWORD = constant.KEYWORD, CONJUNCTION = constant.CONJUNCTION, PREFIX = constant.PREFIX, SUFFIX = constant.SUFFIX, BINARY = constant.BINARY, COMPACT_CLAUSE_EXPRESSION = constant.COMPACT_CLAUSE_EXPRESSION, OPERATOR_EXPRESSION = constant.OPERATOR_EXPRESSION;

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
  var atStatementHead, baseCursor, breakContinueStatement, c, char, cur, cursor, cursor2Token, definitionSymbolBody, eoi, expectThen, expression, fn, identifierCharSet, indent, isNewlineChar, key, keyword2statement, keywordThenElseStatement, leadTokenClause, leadWordClauseMap, leftRegexp, lexIndent, lineStart, lineno, makeClause, matchToken, maybeConjunction, memoToken, newLineAndEmptyLines, newline, nextNonspaceToken, nextPiece, nextToken, parseError, parser, rollbackOnType, setToken, skipInlineSpace, skipSPACE, skipSomeType, skipTokenType, sym, symbol2clause, symbolStopChars, text, textLength, throwReturnStatement, token, tokenFnMap, tokenFromMemo, tokenOnBackSlashChar, tokenOnIdentifierChar, tokenOnLeftBracketChar, tokenOnNewlineChar, tokenOnNumberChar, tokenOnQuoteChar, tokenOnRightDelimiterChar, tokenOnSymbolChar, tokenType, tokenValue, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref2, _ref3, _ref4, _ref5, _ref6;
  parser = this;
  text = '';
  textLength = text.length;
  cur = 0;
  cursor = 0;
  char = '';
  lineno = 0;
  lineStart = 0;
  lexIndent = 0;
  indent = 0;
  token = void 0;
  tokenType = void 0;
  tokenValue = '';
  cursor2Token = [];
  baseCursor = 0;
  atStatementHead = true;
  this.cursor = function() {
    return cursor;
  };
  this.endOfInput = function() {
    return !text[cursor];
  };
  eoi = {
    type: EOI,
    value: '',
    start: text.length,
    stop: textLength,
    column: -1,
    lexIndent: -1,
    indent: -1
  };
  this.nextToken = nextToken = function() {
    var tkn;
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
    if (tkn = tokenFromMemo(cursor)) {
      return setToken(tkn);
    } else {
      return matchToken();
    }
  };
  matchToken = function() {
    var fn, pos;
    pos = cur = cursor;
    if (fn = tokenFnMap[char]) {
      token = fn(char);
    } else if (!char) {
      eoi.lineno = lineno + 1;
      lineStart = cursor;
      setToken(eoi);
    } else {
      token = tokenOnSymbolChar();
    }
    return memoToken(token, pos);
  };
  this.token = function() {
    return token;
  };
  memoToken = function(tkn, pos) {
    return cursor2Token[pos - baseCursor] = tkn;
  };
  tokenFromMemo = function(pos) {
    return cursor2Token[pos - baseCursor];
  };
  setToken = function(tkn) {
    token = tkn;
    tokenType = token.type;
    tokenValue = token.value;
    cur = token.start;
    cursor = token.stop;
    char = text[cursor];
    if (tokenType === NEWLINE || tokenType === INDENT || tokenType === UNDENT) {
      atStatementHead = true;
    }
    return token;
  };
  skipTokenType = function(type) {
    if (tokenType === type) {
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
    var c2;
    while (char = text[++cursor]) {
      if (symbolStopChars[char]) {
        break;
      }
      if (char === '/' && ((c2 = text[cursor + 1]) === '/' || c2 === '!')) {
        break;
      }
    }
    return {
      type: tokenType = SYMBOL,
      value: (tokenValue = text.slice(cur, cursor)),
      start: cur,
      stop: cursor,
      line: lineno,
      column: cur - lineStart
    };
  };
  symbolStopChars = {};
  _ref2 = ' \t\v\n\r()[]{},;:#\'\".@\\!';
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
  tokenFnMap[':'] = tokenFnMap['@'] = tokenFnMap['.'] = function() {
    var first;
    first = char;
    char = text[++cursor];
    while (char === first) {
      char = text[++cursor];
    }
    tokenValue = text.slice(cur, cursor);
    if (tokenValue === ':') {
      tokenType = PUNCTUATION;
    } else {
      tokenType = SYMBOL;
    }
    token = {
      type: tokenType,
      value: tokenValue,
      atom: cursor - cur >= 2,
      start: cur,
      stop: cursor,
      line: lineno,
      column: cur - lineStart
    };
    if (tokenType === SYMBOL) {
      token.atom = true;
    }
    return token;
  };
  tokenFnMap[' '] = tokenFnMap['\t'] = function() {
    var line;
    line = lineno;
    indent = lexIndent;
    char = text[++cursor];
    skipInlineSpace(indent);
    if (char) {
      if (char !== '\n' && char !== '\r') {
        return {
          type: tokenType = SPACE,
          value: (tokenValue = text.slice(cur, cursor)),
          start: cur,
          stop: cursor,
          line: line,
          stopLine: lineno,
          column: cur - lineStart,
          indent: lexIndent
        };
      } else {
        newLineAndEmptyLines();
        return {
          type: tokenType,
          value: (tokenValue = text.slice(cur, cursor)),
          start: cur,
          stop: cursor,
          line: line,
          column: cur - lineStart,
          indent: lexIndent
        };
      }
    } else {
      return {
        type: tokenType = EOI,
        value: (tokenValue = text.slice(cur, cursor)),
        start: cur,
        stop: cursor,
        line: line,
        column: cur - lineStart,
        indent: -1
      };
    }
  };
  skipInlineSpace = function() {
    var _results;
    while (char === ' ' || char === '\t') {
      char = text[++cursor];
    }
    if (char === '/' && text[cursor + 1] === '/') {
      cursor += 2;
      char = text[cursor];
      _results = [];
      while (char !== '\n' && char !== '\r') {
        _results.push(char = text[++cursor]);
      }
      return _results;
    }
  };
  newline = function() {
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
  tokenOnNumberChar = function() {
    var base, baseStart, c2, dotCursor, meetDigit;
    base = 10;
    if (char === '0' && (c2 = text[cursor + 1])) {
      if (c2 === 'x' || c2 === 'X') {
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
    if (base === 16) {
      while (char) {
        if (!(('0' <= char && char <= '9') || ('a' <= char && char <= 'f') || ('A' <= char && char <= 'F'))) {
          break;
        } else {
          char = text[++cursor];
        }
      }
    }
    if (base === 16) {
      if (char === '.') {
        lexError('hexadecimal number followed by "."');
      } else if (letterCharSet[char]) {
        lexError('hexadecimal number followed by g-z or G-Z');
      }
      if (cursor === baseStart) {
        cursor--;
        char = text[cursor];
      }
      return {
        type: tokenType = NUMBER,
        value: (tokenValue = text.slice(cur, cursor)),
        atom: true,
        start: cur,
        stop: cursor,
        line: lineno,
        column: cur - lineStart
      };
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
    } else if (char === 'e' || char === 'E') {
      char = text[++cursor];
      if (char === '+' || char === '-') {
        char = text[++cursor];
        if (!char || char < '0' || '9' < char) {
          cursor = dotCursor;
          char = text[cursor];
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
      } else {
        while (char) {
          if (char < '0' || '9' < char) {
            break;
          }
          char = text[++cursor];
        }
      }
    }
    return {
      type: tokenType = NUMBER,
      value: (tokenValue = text.slice(cur, cursor)),
      atom: true,
      start: cur,
      stop: cursor,
      line: lineno,
      column: cur - lineStart
    };
  };
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
    var line, tkn, _k, _len2, _ref4;
    char = text[++cursor];
    line = lineno;
    if (firstIdentifierCharSet[char]) {
      tkn = tokenOnIdentifierChar();
      tkn.type = tokenType = IDENTIFIER;
      tkn.escaped = true;
      tkn.start = cur;
      tkn.atom = true;
      return tkn;
    } else if (firstSymbolCharset[char]) {
      tkn = tokenOnSymbolChar();
      tkn.escaped = true;
      tkn.start = cur;
      token.value = tokenValue = '\\' + tokenValue;
      return tkn;
    } else if (char === ':') {
      tkn = tokenOnColonChar();
      tkn.value = tokenValue = '\\' + tokenValue;
      token.type = tokenType = SYMBOL;
      tkn.escaped = true;
      tkn.start = cur;
      return tkn;
    } else if (char === "'") {
      tkn = tokenOnQuoteChar();
      if (text[cur + 2] === "'" && text[cur + 3] === "'") {
        char = text[++cursor];
        return {
          type: tokenType = SYMBOL,
          value: (tokenValue = '\\'),
          start: cur,
          stop: cursor,
          line: lineno,
          column: cur - lineStart,
          indent: lexIndent
        };
      } else {
        _ref4 = text.slice(cur + 2, tkn.cursor);
        for (_k = 0, _len2 = _ref4.length; _k < _len2; _k++) {
          c = _ref4[_k];
          if (c === '\n' || c === '\r') {
            parseError('unexpected new line characters in escaped string');
          }
        }
        tkn.escaped = true;
        tkn.start = cur;
        tkn.atom = true;
        return tkn;
      }
    } else {
      while (char = text[++cursor] === '\\') {
        true;
      }
      return {
        type: tokenType = SYMBOL,
        value: (tokenValue = text.slice(cur, cursor)),
        start: cur,
        stop: cursor,
        line: lineno,
        column: cur - lineStart
      };
    }
  };
  tokenFnMap['/'] = function() {
    var line;
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
          return {
            type: tokenType = SPACE,
            value: (tokenValue = text.slice(cur, cursor)),
            start: cur,
            stop: cursor,
            line: line,
            stopLine: lineno,
            column: cur - lineStart,
            indent: lexIndent
          };
        } else {
          newLineAndEmptyLines();
          return {
            type: tokenType,
            value: (tokenValue = text.slice(cur, cursor)),
            start: cur,
            stop: cursor,
            line: line,
            column: cur - lineStart,
            indent: lexIndent
          };
        }
      } else {
        return {
          type: tokenType = EOI,
          value: (tokenValue = text.slice(cur, cursor)),
          start: cur,
          stop: cursor,
          line: line,
          column: cur - lineStart,
          indent: lexIndent
        };
      }
    } else if (char === '!') {
      cursor += 2;
      char = text[cursor];
      leftRegexp();
      return {
        type: tokenType = REGEXP,
        value: (tokenValue = ['regexp!', '/' + text.slice(cur + 2, cursor)]),
        atom: true,
        start: cur,
        stop: cursor,
        line: lineno,
        column: cur - lineStart
      };
    } else {
      char = text[--cursor];
      return tokenOnSymbolChar();
    }
  };
  newLineAndEmptyLines = function() {
    while (newline()) {
      while (char && char === ' ') {
        char = text[++cursor];
      }
      if (char === '\t') {
        parseError('unexpected tab character "\t" at the head of line');
      }
      if (!char || (char !== '\n' && char !== '\r')) {
        break;
      }
    }
    if (!char) {
      tokenType = EOI;
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
    var line;
    line = lineno;
    indent = lexIndent;
    newLineAndEmptyLines();
    return {
      type: tokenType,
      value: (tokenValue = text.slice(cur, cursor)),
      start: cur,
      stop: cursor,
      line: line,
      column: cur - lineStart,
      indent: lexIndent
    };
  };
  identifierCharSet = taijiIdentifierCharSet;
  tokenOnIdentifierChar = function() {
    var isAtom, txt;
    char = text[++cursor];
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
    return {
      type: tokenType,
      value: (tokenValue = txt),
      atom: isAtom,
      start: cur,
      stop: cursor,
      line: lineno,
      column: cur - lineStart
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
    char = text[++cursor];
    return {
      type: tokenType = PUNCTUATION,
      value: (tokenValue = ','),
      line: lineno,
      start: cursor,
      stop: cursor,
      column: cur - lineStart
    };
  };
  tokenFnMap["'"] = tokenFnMap['"'] = tokenOnQuoteChar = function() {
    var quote;
    quote = char;
    char = text[++cursor];
    while (char) {
      if (char === quote) {
        char = text[++cursor];
        return {
          type: tokenType = STRING,
          value: (tokenValue = text.slice(cur, cursor)),
          atom: true,
          start: cur,
          stop: cursor,
          line: lineno,
          column: cur - lineStart
        };
      } else if (char === '\\') {
        char = text[++cursor];
        if (isNewlineChar(char)) {
          parseError('unexpected new line while parsing string');
        }
        char = text[++cursor];
      } else if (isNewlineChar(char)) {
        parseError('unexpected new line while parsing string');
      } else {
        char = text[++cursor];
      }
    }
    return parseError("expect " + quote + ", unexpected end of input while parsing interpolated string");
  };
  tokenFnMap['('] = function() {
    var exp, ind, line;
    line = lineno;
    char = text[++cursor];
    nextToken();
    if (tokenType === UNDENT) {
      parseError('unexpected undent while parsing parenethis "(...)"');
    }
    ind = indent = lexIndent;
    if (tokenType === SPACE || tokenType === NEWLINE || tokenType === INDENT) {
      nextToken();
    }
    if (tokenValue === ')') {
      exp = ['()'];
    } else {
      exp = parser.operatorExpression();
      if (tokenType === UNDENT) {
        if (token.indent < ind) {
          parseError('expect ) indent equal to or more than (');
        } else {
          nextToken();
        }
      } else {
        skipSPACE();
        if (tokenValue !== ')') {
          parseError('expect )');
        }
      }
      exp = ['()', exp];
    }
    return extend(exp, {
      type: tokenType = PAREN,
      start: cur,
      stop: cursor,
      line: line,
      column: cur - lineStart,
      indent: lexIndent,
      atom: true,
      parameters: true
    });
  };
  tokenFnMap['['] = tokenOnLeftBracketChar = function() {
    var exp, line, value;
    trace("tokenFnMap['[']: ", nextPiece());
    char = text[++cursor];
    line = lineno;
    nextToken();
    exp = parser.block() || parser.lineBlock();
    if (tokenType === UNDENT) {
      if (token.indent < ind) {
        parseError('unexpected undent while parsing parenethis "[...]"');
      } else {
        nextToken();
      }
    }
    if (tokenValue !== ']') {
      parseError('expect ]');
    }
    nextToken();
    if (!exp) {
      value = ['[]'];
    } else {
      value = ['[]', exp];
    }
    return memoToken(extend(value, {
      type: tokenType = BRACKET,
      start: cur,
      stop: cursor,
      line: line,
      column: cur - lineStart,
      indent: lexIndent,
      atom: true
    }));
  };
  tokenFnMap['{'] = function() {
    var body, ind, line, tkn;
    trace("tokenFnMap['{']: " + nextPiece());
    char = text[++cursor];
    line = lineno;
    ind = lexIndent;
    nextToken();
    skipSPACE();
    if (tokenValue === '}' && (tkn = nextToken())) {
      return extend(['{}'], {
        atom: true,
        start: cur,
        stop: cursor,
        line: line,
        column: column,
        indent: lexIndent
      });
    }
    body = parser.block() || parser.lineBlock();
    if (tokenType === UNDENT && token.indent < ind) {
      nextToken();
    }
    if (tokenValue !== '}') {
      parseError('expect }');
    }
    tkn = nextToken();
    if (indent < ind) {
      parseError('unexpected undent while parsing parenethis "{...}"');
    }
    return extend(['{}', begin(body)], {
      type: tokenType = CURVE,
      atom: true,
      start: cur,
      stop: cursor,
      line: line,
      column: cur - lineStart,
      indent: lexIndent
    });
  };
  tokenOnRightDelimiterChar = function() {
    c = char;
    char = text[++cursor];
    return {
      type: tokenType = RIGHT_DELIMITER,
      value: (tokenValue = c),
      start: cur,
      stop: cursor,
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
    tokenText = tokenValue;
    if (!hasOwnProperty.call(prefixOperatorDict, tokenText)) {
      return;
    }
    op = prefixOperatorDict[tokenText];
    if (op.definition && mode === COMPACT_CLAUSE_EXPRESSION) {
      return;
    }
    opToken = token;
    nextToken();
    if (mode === COMPACT_CLAUSE_EXPRESSION) {
      if (tokenType === SPACE || tokenType === INDENT || tokenType === NEWLINE || tokenType === UNDENT) {
        setToken(opToken);
        return;
      }
    } else {
      skipSPACE();
      if (tokenType === RIGHT_DELIMITER) {
        error('unexpected ' + tokenValue);
      } else if (tokenType === EOI) {
        error('unexpected end of input');
      } else if (tokenType === INDENT || tokenType === NEWLINE || tokenType === UNDENT) {
        nextToken();
      }
    }
    return {
      value: opToken.value,
      priority: op.priority
    };
  };
  this.binaryOperator = function(mode, dent) {
    var op, opValue, start;
    start = token;
    switch (tokenType) {
      case PAREN:
        return {
          value: 'concat()',
          priority: 200,
          start: token
        };
      case BRACKET:
        return {
          value: 'concat[]',
          priority: 200,
          start: token
        };
    }
    if (tokenType === SPACE) {
      if (mode === COMPACT_CLAUSE_EXPRESSION) {
        return;
      } else {
        nextToken();
        if (tokenType === INDENT || tokenType === NEWLINE) {
          nextToken();
        }
      }
    }
    switch (tokenType) {
      case INDENT:
        if (mode === COMPACT_CLAUSE_EXPRESSION) {
          return;
        } else {
          nextToken();
        }
        break;
      case NEWLINE:
        if (mode === COMPACT_CLAUSE_EXPRESSION) {
          return;
        } else {
          nextToken();
        }
        break;
      case UNDENT:
        if (mode === COMPACT_CLAUSE_EXPRESSION) {
          return;
        } else if (indent < dent) {
          parseError('wrong indent');
        } else {
          nextToken();
        }
        break;
      case PUNCTUATION:
        if (mode === COMPACT_CLAUSE_EXPRESSION) {
          return;
        } else if (tokenValue === ',') {
          nextNonspaceToken();
          return {
            value: ',',
            priority: 5
          };
        } else {
          return;
        }
    }
    if (tokenType !== IDENTIFIER && tokenType !== SYMBOL) {
      return;
    }
    if (!hasOwnProperty.call(binaryOperatorDict, tokenValue)) {
      setToken(start);
      return;
    }
    op = binaryOperatorDict[opValue = tokenValue];
    nextToken();
    if (mode !== COMPACT_CLAUSE_EXPRESSION) {
      skipSPACE();
      skipSomeType(NEWLINE, INDENT, UNDENT);
    } else if (tokenType === NEWLINE || tokenType === INDENT || tokenType === UNDENT || tokenType === EOI) {
      setToken(start);
      return;
    }
    return {
      value: opValue,
      priority: op.priority,
      rightAssoc: op.rightAssoc,
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
          rightAssoc: op.rightAssoc
        });
      } else {
        setToken(start);
      }
    }
  };
  this.expression = expression = function(mode, priority, leftAssoc) {
    var op, opPri, tkn2, x, y;
    if (!(x = parser.prefixExpression(mode, priority))) {
      if (!token.atom) {
        return;
      } else {
        x = token;
        x.priority = 1000;
        nextToken();
      }
    }
    while (tkn2 = token) {
      if ((op = parser.binaryOperator(mode, x))) {
        if ((opPri = op.priority) > priority || (opPri === priority && !leftAssoc)) {
          if (y = expression(mode, opPri, !op.rightAssoc)) {
            x = extend(['binary!', op.value, x, y], {
              expressionType: BINARY,
              priority: op.priority,
              rightAssoc: op.rightAssoc
            });
            continue;
          }
        }
        setToken(tkn2);
        break;
      } else {
        break;
      }
    }
    return x;
  };
  this.operatorExpression = function() {
    return parser.expression(OPERATOR_EXPRESSION, 0, true);
  };
  this.compactClauseExpression = function() {
    return parser.expression(COMPACT_CLAUSE_EXPRESSION, 0, true);
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
      if (tokenValue === "then") {
        nextToken();
        return true;
      } else {
        return parseError('unexpected conjunction "' + tokenValue + '", expect "then"');
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
    if (indent === clauseIndent && tokenType === CONJUNCTION && tokenValue === conj) {
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
      var body, inOf, ind, kw, name1, name2, obj;
      ind = indent;
      nextToken();
      skipSPACE();
      if (tokenType !== IDENTIFIER) {
        parseError('expect identifier');
      }
      name1 = token;
      nextToken();
      skipSPACE();
      if (tokenValue === ',') {
        nextNonspaceToken();
      }
      if (tokenType !== IDENTIFIER) {
        parseError('expect "in", "of" or index variable name');
      }
      if (tokenValue === 'in' || tokenValue === 'of') {
        inOf = value;
        nextToken();
      } else {
        name2 = token;
        nextNonspaceToken();
        if (tokenValue === 'in' || tokenValue === 'of') {
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
        if (tokenType !== CONJUNCTION || tokenValue !== 'then') {
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
  this.sequence = function() {
    var clause, item, tkn;
    clause = [];
    while (1) {
      skipSPACE();
      tkn = token;
      if ((item = parser.compactClauseExpression())) {
        if (item === '#') {
          setToken(tkn);
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
  makeClause = function(items) {
    if (items.length === 1) {
      return items[0];
    } else {
      return items;
    }
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
        setToken(start);
        return;
      }
      nextToken();
      if (!(fn = leadWordClauseMap[start.value])) {
        setToken(start);
        return;
      }
      return fn(start, parser.clause());
    };
  };
  symbol2clause = {};
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
    var blk, clauses, definition, isStatementHead, items, itemsLength, last, op, result, tkn;
    trace("clause: " + nextPiece());
    skipSPACE();
    switch (tokenType) {
      case KEYWORD:
        isStatementHead = atStatementHead;
        atStatementHead = false;
        return keyword2statement[tokenValue](isStatementHead);
      case SYMBOL:
        if ((fn = symbol2clause[tokenValue]) && (result = fn())) {
          return result;
        }
        break;
      case PUNCTUATION:
        error('unexpected ' + tokenValue);
        break;
      case NEWLINE:
      case UNDENT:
      case RIGHT_DELIMITER:
      case CONJUNCTION:
      case EOI:
        return;
    }
    items = parser.sequence();
    if ((op = binaryOperatorDict[tokenValue]) && op.definition) {
      definition = definitionSymbolBody();
      if (!items) {
        return definition;
      }
      last = items[(itemsLength = items.length) - 1].parameters;
      if (last.parameter) {
        definition[1] = last;
        if (itemsLength === 1) {
          return definition;
        }
        items[clauseLength - 1] = defintion;
        return makeClause(items);
      }
    }
    if (tokenValue === ',') {
      nextToken();
      return makeClause(items);
    } else if (tokenValue === ':') {
      nextToken();
      if (tokenType === INDENT) {
        clauses = parser.block();
      } else {
        clauses = parser.clauses();
      }
      if (clauses.length === 0) {
        parseError('expected arguments list after ":"');
      }
      clauses.unshift(makeClause(items));
      return clauses;
    } else if (tokenValue === '#' && nextToken()) {
      if (tokenType === INDENT) {
        clauses = parser.block();
        return ['#', makeClause(items), clauses];
      } else {
        clauses = parser.clauses();
        return ['#', makeClause(items), clauses];
      }
    } else if (tokenType === INDENT) {
      tkn = token;
      nextToken();
      if (tokenType === CONJUNCTION) {
        setToken(tkn);
        return items;
      } else {
        setToken(tkn);
        blk = parser.block();
        items.push.apply(items, blk);
        return items;
      }
    } else {
      return makeClause(items);
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
    if (tokenValue === ';' && nextToken()) {
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
  this.block = function() {
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
        parseError('unexpected conjunction "' + tokenValue + '" following a indent block');
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
    while (x = parser.line()) {
      skipTokenType(NEWLINE);
      body.push.apply(body, x);
      cursor2Token = [];
      baseCursor = cursor;
    }
    if (tokenType !== EOI) {
      parseError('expect end of input, but meet "' + text.slice(cursor) + '"');
    }
    return begin(body);
  };
  this.init = function(data, cur) {
    text = data;
    textLength = text.length;
    cursor = cur;
    char = text[cursor];
    lineno = 1;
    lineStart = 0;
    token = {
      type: tokenType = NULL,
      value: tokenValue = '',
      start: 0,
      stop: 0,
      line: lineno,
      column: 1
    };
    cursor2Token = [];
    baseCursor = 0;
    return atStatementHead = true;
  };
  this.parse = function(data, root, cur) {
    parser.init(data, cur);
    return root();
  };
  parseError = function(message, tkn) {
    var pos;
    tkn = tkn || token;
    pos = token.start;
    throw pos + '(' + tkn.line + ':' + tkn.column + '): ' + message + ': ' + text.slice(tkn.start, tkn.stop);
  };
};
