var BLOCK_COMMENT, BRACKET, CODE_BLOCK_COMMENT, CONCAT_LINE, CURVE, C_BLOCK_COMMENT, DATA_BRACKET, EOI, FUNCTION, HALF_DENT, HEAD_SPACES, IDENTIFIER, INDENT, INDENT_EXPRESSION, INLINE_COMMENT, INTERPOLATE_STRING, LINE_COMMENT, MODULE, MODULE_HEADER, NEWLINE, NON_INTERPOLATE_STRING, NUMBER, PAREN, PUNCT, REGEXP, SPACES, SPACES_INLINE_COMMENT, SPACE_COMMENT, STRING, SYMBOL, TAIL_COMMENT, UNDENT, base, begin, binaryOperatorDict, charset, compileExp, constant, digitCharSet, digitChars, entity, escapeNewLine, extend, firstIdentifierCharSet, firstIdentifierChars, getOperatorExpression, hasOwnProperty, identifierCharSet, identifierChars, isArray, isConj, isKeyword, letterCharSet, letterChars, letterDigitSet, makeOperatorExpression, prefixOperatorDict, str, suffixOperatorDict, taijiIdentifierCharSet, wrapInfo1, wrapInfo2, _ref, _ref1, _ref2,
  __slice = [].slice;

_ref = require('../utils'), charset = _ref.charset, isArray = _ref.isArray, wrapInfo1 = _ref.wrapInfo1, wrapInfo2 = _ref.wrapInfo2, str = _ref.str, entity = _ref.entity;

_ref1 = base = require('./base'), extend = _ref1.extend, firstIdentifierChars = _ref1.firstIdentifierChars, firstIdentifierCharSet = _ref1.firstIdentifierCharSet, letterDigitSet = _ref1.letterDigitSet, identifierChars = _ref1.identifierChars, digitCharSet = _ref1.digitCharSet, letterCharSet = _ref1.letterCharSet, identifierCharSet = _ref1.identifierCharSet, taijiIdentifierCharSet = _ref1.taijiIdentifierCharSet, constant = _ref1.constant;

digitChars = base.digits;

letterChars = base.letters;

NUMBER = constant.NUMBER, STRING = constant.STRING, IDENTIFIER = constant.IDENTIFIER, SYMBOL = constant.SYMBOL, REGEXP = constant.REGEXP, HEAD_SPACES = constant.HEAD_SPACES, CONCAT_LINE = constant.CONCAT_LINE, PUNCT = constant.PUNCT, FUNCTION = constant.FUNCTION, C_BLOCK_COMMENT = constant.C_BLOCK_COMMENT, PAREN = constant.PAREN, BRACKET = constant.BRACKET, DATA_BRACKET = constant.DATA_BRACKET, CURVE = constant.CURVE, INDENT_EXPRESSION = constant.INDENT_EXPRESSION, NEWLINE = constant.NEWLINE, SPACES = constant.SPACES, INLINE_COMMENT = constant.INLINE_COMMENT, SPACES_INLINE_COMMENT = constant.SPACES_INLINE_COMMENT, LINE_COMMENT = constant.LINE_COMMENT, BLOCK_COMMENT = constant.BLOCK_COMMENT, CODE_BLOCK_COMMENT = constant.CODE_BLOCK_COMMENT, CONCAT_LINE = constant.CONCAT_LINE, NON_INTERPOLATE_STRING = constant.NON_INTERPOLATE_STRING, INTERPOLATE_STRING = constant.INTERPOLATE_STRING, EOI = constant.EOI, INDENT = constant.INDENT, UNDENT = constant.UNDENT, HALF_DENT = constant.HALF_DENT, MODULE_HEADER = constant.MODULE_HEADER, MODULE = constant.MODULE, SPACE_COMMENT = constant.SPACE_COMMENT, TAIL_COMMENT = constant.TAIL_COMMENT;

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
  var atStatementHead, bigSpace, breakContinueStatement, caseClauseOfSwitchStatement, catchClause, char, conjClause, cursor, curve, decimal, elseClause, endCursorOfDynamicBlockStack, environment, error, escapeSymbol, expect, expectChar, expectIdentifier, expectIndentConj, expectOneOfWords, expectWord, finallyClause, follow, followMatch, followNewline, followSequence, indentFromLine, interpolateStringPiece, isIdentifier, itemToParameter, jsIdentifier, keywordTestExpressionBodyStatement, keywordThenElseStatement, leadWordClauseMap, letLikeStatement, lineInfo, lineno, literal, maxLine, maybeOneOfWords, memo, memoIndex, memoMap, newLineAndEmptyLines, newline, newlineFromLine, nonInterpolatedStringLine, number, operatorExpression, paren, parser, predefined, processDataBracetResult, recursive, rollback, rollbackToken, sameIndentFromLine, saveMemo, seperatorList, space, spaceClauseExpression, spaceComma, spaces, symbol, symbolStopChars, taijiIdentifier, text, thenClause, throwReturnStatement, toParameters, unchangeable, undentFromLine, word;
  parser = this;
  this.predefined = predefined = {};
  unchangeable = ['cursor', 'setCursor', 'lineno', 'setLineno', 'atLineHead', 'atStatementHead', 'setAtStatementHead'];
  text = null;
  cursor = 0;
  lineno = 1;
  lineInfo = [];
  maxLine = -1;
  memoMap = {};
  atStatementHead = true;
  environment = null;
  endCursorOfDynamicBlockStack = [];
  memoIndex = 0;
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
  this.followMatch = followMatch = function(fn) {
    var line, start, x;
    start = cursor;
    line = lineno;
    x = fn();
    cursor = start;
    lineno = line;
    return x;
  };
  this.follow = follow = function(matcherName) {
    var line, start, x;
    start = cursor;
    line = lineno;
    x = parser[matcherName]();
    cursor = start;
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
    var line1, matcherList, matcherName, start, x, _i, _len;
    matcherList = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    start = cursor;
    line1 = lineno;
    for (_i = 0, _len = matcherList.length; _i < _len; _i++) {
      matcherName = matcherList[_i];
      if (!(x = parser[matcherName]())) {
        break;
      }
    }
    cursor = start;
    lineno = line1;
    return x;
  };
  this.followOneOf = function() {
    var line1, matcherList, matcherName, start, x, _i, _len;
    matcherList = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    start = cursor;
    line1 = lineno;
    for (_i = 0, _len = matcherList.length; _i < _len; _i++) {
      matcherName = matcherList[_i];
      cursor = start;
      lineno = line1;
      if (x = parser[matcherName]()) {
        break;
      }
    }
    cursor = start;
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
  this.spaces = spaces = function() {
    var c, start;
    if ((c = text[cursor]) !== ' ' && c !== '\t') {
      return;
    }
    start = cursor;
    while ((c = text[cursor])) {
      if (c !== ' ' && c !== '\t') {
        break;
      } else {
        cursor++;
      }
    }
    return {
      type: SPACES,
      value: text.slice(start, cursor),
      start: start,
      stop: cursor,
      line: lineno
    };
  };
  this.char = char = function(c) {
    if (text[cursor] === c) {
      cursor++;
      return true;
    }
  };
  this.newline = newline = function() {
    var c, c2, line1, start;
    c = text[start = cursor];
    line1 = lineno;
    if (c === '\r') {
      cursor++;
      if (text[cursor] === '\n') {
        cursor++;
        c2 = '\n';
      }
      lineno++;
    } else if (c === '\n') {
      cursor++;
      if (text[cursor] === '\r') {
        cursor++;
        c2 = '\r';
      }
      lineno++;
    } else {
      return;
    }
    return {
      type: NEWLINE,
      value: c + (c2 || ''),
      start: start,
      stop: cursor,
      line1: line1,
      line: lineno
    };
  };
  this.followNewline = followNewline = function() {
    var x;
    if (x = newline()) {
      rollback(x.start, x.line1);
      return x;
    }
  };
  this.newLineAndEmptyLines = newLineAndEmptyLines = function() {
    var line1, start;
    start = cursor;
    line1 = lineno;
    if (!newline()) {
      return;
    }
    while (lineno < maxLine && lineInfo[lineno].emtpy) {
      lineno++;
    }
    cursor = lineInfo[lineno].start + lineInfo[lineno].indentColumn;
    return {
      type: NEWLINE,
      value: text.slice(start, cursor),
      start: start,
      stop: cursor,
      line1: line1,
      line: lineno
    };
  };
  this.tailComment = function() {
    var indentColumn, start;
    if (text.slice(cursor, cursor + 2) !== '//') {
      return;
    }
    indentColumn = lineInfo[lineno].indentColumn;
    if (cursor === lineInfo[lineno].start + indentColumn) {
      return;
    }
    start = cursor;
    if (lineno === maxLine) {
      cursor = text.length;
    } else {
      cursor = lineInfo[lineno + 1].start - 1;
    }
    return {
      type: TAIL_COMMENT,
      value: text.slice(start, cursor),
      start: start,
      line: lineno
    };
  };
  this.lineComment = function() {
    var indentColumn, lastPos, line1, start;
    if (text[cursor] !== '/' || text[cursor + 1] !== '/') {
      return;
    }
    indentColumn = lineInfo[lineno].indentColumn;
    if (cursor !== lineInfo[lineno].start + indentColumn) {
      return;
    }
    start = cursor;
    line1 = lineno;
    while (++lineno && lineno <= maxLine && lineInfo[lineno].empty) {
      continue;
    }
    cursor = lineInfo[lineno].start + lineInfo[lineno].indentColumn;
    lastPos = lineInfo[lineno].start - 1;
    if (text[lastPos] === '\n') {
      lastPos--;
    }
    if (text[lastPos] === '\r') {
      lastPos--;
    }
    return {
      type: LINE_COMMENT,
      value: text.slice(start, lastPos + 1),
      start: start,
      stop: cursor,
      line1: line1,
      line: lineno,
      indent: indentColumn < lineInfo[lineno].indentColumn
    };
  };
  this.indentBlockComment = function() {
    var indentColumn, line1, start;
    if (cursor !== lineInfo[lineno].start + (indentColumn = lineInfo[lineno].indentColumn)) {
      return;
    }
    if (text.slice(cursor, +(cursor + 1) + 1 || 9e9) !== '/.') {
      return;
    }
    start = cursor;
    line1 = lineno;
    lineno++;
    while (lineno <= maxLine) {
      if (lineInfo[lineno].empty) {
        lineno++;
      } else if (lineInfo[lineno].indentColumn > indentColumn) {
        lineno++;
      } else {
        break;
      }
    }
    if (lineno > maxLine) {
      cursor = text.length;
    } else {
      cursor = lineInfo[lineno].start + lineInfo[lineno].indentColumn;
    }
    return {
      type: BLOCK_COMMENT,
      value: text.slice(start, cursor),
      start: start,
      stop: cursor,
      line1: line1,
      line: lineno
    };
  };
  this.cBlockComment = function() {
    var c, indentColumn, line1, start;
    if (text.slice(cursor, cursor + 2) !== '/*') {
      return;
    }
    start = cursor;
    cursor += 2;
    line1 = lineno;
    indentColumn = lineInfo[lineno].indentColumn;
    while (1) {
      if (!(c = text[cursor])) {
        error('meet unexpected end of input while parsing inline comment');
      }
      if (text.slice(cursor, cursor + 2) === '*/') {
        cursor += 2;
        break;
      } else if (newline()) {
        while (lineno < maxLine && lineInfo[lineno].empty) {
          lineno++;
        }
        if (lineInfo[lineno].indentColumn < indentColumn) {
          error('the lines in c style block comment should not indent less than its begin line');
        }
        cursor = lineInfo[lineno].start + lineInfo[lineno].indentColumn;
      } else {
        cursor++;
      }
    }
    return {
      type: C_BLOCK_COMMENT,
      value: text.slice(start, cursor),
      start: start,
      stop: cursor,
      line1: line1,
      line: lineno
    };
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
    var c, concat, line1, lineTail, start;
    start = cursor;
    line1 = lineno;
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
      value: text.slice(start, cursor),
      start: start,
      stop: cursor,
      line1: line1,
      line: lineno,
      multiLine: line1 !== lineno,
      lineTail: lineTail,
      concat: concat,
      inline: true
    };
  });
  this.multilineSpaceComment = memo(function() {
    var c, indentColumn, line1, multiStart, start;
    start = cursor;
    line1 = lineno;
    indentColumn = lineInfo[lineno].indentColumn;
    space();
    multiStart = cursor;
    while (c = text[cursor]) {
      if (newLineAndEmptyLines()) {
        continue;
      } else if (indentColumn !== lineInfo[lineno].indentColumn) {
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
      cursor = start;
      return;
    }
    atStatementHead = true;
    return {
      type: SPACE_COMMENT,
      value: text.slice(start, cursor),
      start: start,
      stop: cursor,
      line1: line1,
      line: lineno,
      multipleLine: true,
      indent: indentColumn < lineInfo[lineno].indentColumn,
      undent: indentColumn > lineInfo[lineno].indentColumn,
      newline: indentColumn === lineInfo[lineno].indentColumn
    };
  });
  this.spaceComment = bigSpace = memo(function() {
    return parser.multilineSpaceComment() || space();
  });
  this.regexp = memo(function() {
    var c, i, start;
    if (text.slice(cursor, +(cursor + 1) + 1 || 9e9) !== '/!') {
      return;
    }
    start = cursor;
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
    return {
      type: REGEXP,
      value: '/' + text.slice(start + 2, cursor),
      start: start,
      stop: cursor,
      line: lineno
    };
  });
  this.literal = literal = function(string) {
    var length;
    length = string.length;
    if (text.slice(cursor, cursor + length) === string) {
      cursor += length;
      return true;
    }
  };
  this.decimal = decimal = memo(function() {
    var c, start;
    start = cursor;
    while (c = text[cursor]) {
      if (('0' <= c && c <= '9')) {
        cursor++;
      } else {
        break;
      }
    }
    if (cursor === start) {
      return;
    }
    return {
      start: start,
      stop: cursor,
      value: parseInt(text.slice(start, cursor))
    };
  });
  this.makeIdentifierFn = function(charSet, firstCharSet) {
    if (firstCharSet == null) {
      firstCharSet = firstIdentifierCharSet;
    }
    return function() {
      var c, start;
      start = cursor;
      if (!firstCharSet[text[cursor]]) {
        return;
      }
      cursor++;
      while (c = text[cursor]) {
        if (charSet[c]) {
          cursor++;
        } else {
          break;
        }
      }
      if (text[cursor - 1] === '!' && text[cursor] === '=') {
        cursor--;
      }
      return {
        type: IDENTIFIER,
        value: text.slice(start, cursor),
        start: start,
        stop: cursor,
        line: lineno
      };
    };
  };
  this.jsIdentifier = jsIdentifier = memo(this.makeIdentifierFn(identifierCharSet, firstIdentifierCharSet));
  this.taijiIdentifier = taijiIdentifier = memo(this.makeIdentifierFn(taijiIdentifierCharSet, firstIdentifierCharSet));
  this.identifier = memo(function() {
    var line1, start, token;
    start = cursor;
    line1 = lineno;
    if ((token = parser.taijiIdentifier())) {
      if (!isKeyword(token) && !isConj(token)) {
        return token;
      } else {
        return rollback(start, line1);
      }
    } else if (text[cursor] === '\\' && ++cursor) {
      if ((token = parser.taijiIdentifier())) {
        token.escaped = true;
        token.start = start;
        return token;
      } else {
        return rollback(start, line1);
      }
    } else {

    }
  });
  this.number = number = memo(function() {
    var baseStart, c, c2, dotCursor, meetDigit, start;
    start = cursor;
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
        return {
          type: NUMBER,
          value: 0,
          start: start,
          stop: cursor,
          line: lineno
        };
      } else {
        return {
          type: NUMBER,
          value: parseInt(text.slice(baseStart, cursor), base),
          start: start,
          stop: cursor,
          line: lineno
        };
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
      return {
        type: NUMBER,
        value: parseInt(text.slice(start, cursor)),
        start: start,
        stop: cursor,
        line: lineno
      };
    }
    if (c === 'e' || c === 'E') {
      c = text[++cursor];
      if (c === '+' || c === '-') {
        c = text[++cursor];
        if (!c || c < '0' || '9' < c) {
          cursor = dotCursor;
          return {
            type: NUMBER,
            value: parseInt(text.slice(start, dotCursor)),
            start: start,
            stop: dotCursor,
            line: lineno
          };
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
        return {
          type: NUMBER,
          value: parseInt(text.slice(start, dotCursor)),
          start: start,
          stop: dotCursor,
          line: lineno
        };
      } else {
        while (c) {
          if (c < '0' || '9' < c) {
            break;
          }
          c = text[++cursor];
        }
      }
    }
    return {
      type: NUMBER,
      value: parseFloat(text.slice(start, cursor)),
      start: start,
      stop: cursor,
      line: lineno
    };
  });
  nonInterpolatedStringLine = function(quote, quoteLength) {
    var c, result, x;
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
    var indentColumn, line1, myIndent, myLineInfo, quote, quoteLength, start;
    if (text.slice(cursor, cursor + 3) === "'''") {
      quote = "'''";
    } else if (text[cursor] === "'") {
      quote = "'";
    } else {
      return;
    }
    start = cursor;
    line1 = lineno;
    quoteLength = quote.length;
    indentColumn = null;
    if (cursor === lineInfo[lineno].start + lineInfo[lineno].indentColumn) {
      indentColumn = lineInfo[lineno].indentColumn;
    }
    cursor += quoteLength;
    str = '';
    while (text[cursor]) {
      if (text.slice(cursor, cursor + quoteLength) === quote) {
        cursor += quoteLength;
        return {
          type: NON_INTERPOLATE_STRING,
          value: '"' + str + '"',
          start: start,
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
        myIndent = myLineInfo.indentColumn;
        if (indentColumn === null) {
          indentColumn = myIndent;
        } else if (myIndent < indentColumn) {
          error('wrong indent in string');
        }
        cursor += indentColumn;
      }
      str += nonInterpolatedStringLine(quote, quoteLength);
    }
    if (!text[cursor]) {
      return error('expect ' + quote + ', unexpected end of input while parsing interpolated string');
    }
  });
  interpolateStringPiece = function(quote, quoteLength, indentColumn, lineIndex) {
    var c, c2, myIndent, x;
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
        if (!lineInfo[lineno].empty && (myIndent = lineInfo[lineno].indentColumn) && lineIndex.value++) {
          if (indentColumn.value === null) {
            indentColumn.value = myIndent;
          } else if (myIndent !== indentColumn.value) {
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
    var c, column, indentColumn, line1, lineIndex, literalStart, pieces, quote, quoteLength, start, x;
    if (text.slice(cursor, cursor + 3) === '"""') {
      quote = '"""';
    } else if (text[cursor] === '"') {
      quote = '"';
    } else {
      return;
    }
    start = cursor;
    line1 = lineno;
    indentColumn = null;
    if ((column = parser.getColumn()) === lineInfo[lineno].indentColumn) {
      indentColumn = {
        value: column
      };
    } else {
      indentColumn = {};
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
          start: start,
          stop: cursor,
          line1: line1,
          line: lineno
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
        pieces.push(interpolateStringPiece(quote, quoteLength, indentColumn, lineIndex));
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
    var exp, line1, spac, start;
    start = cursor;
    line1 = lineno;
    if (text[cursor] !== '(') {
      return;
    } else {
      cursor++;
    }
    spac = bigSpace();
    if (spac.undent) {
      error('unexpected undent while parsing parenethis "(...)"');
    }
    exp = parser.operatorExpression();
    bigSpace();
    if (lineInfo[lineno].indentColumn < lineInfo[line1].indentColumn) {
      error('expect ) indent equal to or more than (');
    }
    if (text[cursor] !== ')') {
      error('expect )');
    } else {
      cursor++;
    }
    return {
      type: PAREN,
      value: exp,
      start: start,
      stop: cursor,
      line1: line1,
      line: lineno
    };
  });
  this.curve = curve = memo(function() {
    var body, indentColumn, line1, start;
    start = cursor;
    line1 = lineno;
    indentColumn = lineInfo[lineno].indentColumn;
    if (text[cursor] !== '{' || text[cursor + 1] === '.') {
      return;
    } else {
      cursor++;
      space();
    }
    space();
    if (text[cursor] === '}') {
      cursor++;
      return extend(['hash!'], {
        start: start,
        stop: cursor,
        line1: line1,
        line: lineno
      });
    }
    body = parser.lineBlock();
    bigSpace();
    if (lineInfo[lineno].indentColumn < indentColumn) {
      error('unexpected undent while parsing parenethis "{...}"');
    }
    if (text[cursor] !== '}') {
      error('expect }');
    } else {
      cursor++;
    }
    if (body.length === 0) {
      return {
        type: CURVE,
        value: '',
        start: start,
        stop: cursor,
        line1: line1,
        line: lineno
      };
    } else {
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
    }
  });
  this.bracket = memo(function() {
    var expList, indentColumn, line1, start;
    start = cursor;
    line1 = lineno;
    indentColumn = lineInfo[lineno].indentColumn;
    if (text[cursor] !== '[') {
      return;
    } else {
      cursor++;
    }
    expList = parser.lineBlock();
    bigSpace();
    if (lineInfo[lineno].indentColumn < indentColumn) {
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
    return extend(expList, {
      type: BRACKET,
      isBracket: true,
      start: start,
      stop: cursor,
      line1: line1,
      line: lineno
    });
  });
  this.dataBracket = memo(function() {
    var indentColumn, line1, result, spac, start, x;
    start = cursor;
    line1 = lineno;
    indentColumn = lineInfo[lineno].indentColumn;
    if (text.slice(cursor, cursor + 2) !== '[\\') {
      return;
    } else {
      cursor += 2;
    }
    result = [];
    while ((x = parser.dataLine()) && (spac = bigSpace())) {
      result.push(x);
      if (lineInfo[lineno].indentColumn < indentColumn) {
        error('expect to indent the same as or more than  the line of [\\');
      }
    }
    space();
    if (lineInfo[lineno].indentColumn < indentColumn) {
      error('unexpected undent while parsing parenethis "[\\ ...\\]"');
    }
    if (text.slice(cursor, cursor + 2) !== '\\]') {
      error('expect \\]');
    } else {
      cursor += 2;
    }
    result.unshift('list!');
    return extend(result, {
      type: DATA_BRACKET,
      start: start,
      stop: cursor,
      line1: line1,
      line: lineno
    });
  });
  this.hashItem = memo(function() {
    var js, key, line1, result, spac, space1, space2, start, t, value;
    start = cursor;
    line1 = lineno;
    space1 = bigSpace();
    js = false;
    if (space1.indent) {
      error('unexpected indent');
    } else if (space1.undent) {
      return rollback(start, line1);
    }
    if (key = parser.compactClauseExpression()) {
      space2 = bigSpace();
      if (space2.multipleLine) {
        error('unexpected new line after hash key');
      }
      if (text[cursor] === ':' && cursor++) {
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
      return extend(result, {
        start: start,
        stop: cursor,
        line1: line1,
        line: lineno
      });
    }
  });
  this.hashBlock = memo(function() {
    var c, column, column1, indentColumn, line1, result, spac, space2, start, x;
    start = cursor;
    line1 = lineno;
    column1 = lineInfo[lineno].indentColumn;
    if ((spac = bigSpace()) && spac.undent) {
      return;
    }
    result = [];
    if (spac.indent) {
      indentColumn = lineInfo[lineno].indentColumn;
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
      if ((column = lineInfo[lineno].indentColumn) > column1) {
        if (indentColumn && column !== indentColumn) {
          error('unconsistent indent in hash {. .}');
        } else {
          indentColumn = column;
        }
      } else if (column === column1) {
        break;
      } else if (column < column1) {
        rollbackToken(space2);
        return;
      }
    }
    result.start = start;
    result.stop = cursor;
    return result;
  });
  this.hash = memo(function() {
    var indentColumn, items, line1, start;
    start = cursor;
    line1 = lineno;
    indentColumn = lineInfo[lineno].indentColumn;
    if (text.slice(cursor, cursor + 2) !== '{.') {
      return;
    } else {
      cursor += 2;
    }
    items = parser.hashBlock();
    if (lineInfo[lineno].indentColumn < indentColumn) {
      error('unexpected undent while parsing parenethis "{.  ... .}"');
    }
    if (text.slice(cursor, cursor + 2) !== '.}') {
      error('expect .}');
    } else {
      cursor += 2;
    }
    return extend(['hash!'].concat(items), {
      start: start,
      stop: cursor,
      line1: line1,
      line: lineno
    });
  });
  this.delimiterExpression = memo(function() {
    return parser.paren() || parser.dataBracket() || parser.bracket() || parser.curve() || parser.hash();
  });
  symbolStopChars = extend(charset(' \t\v\n\r()[]{},;:\'\".@\\'), identifierCharSet);
  this.symbol = symbol = memo(function() {
    var back, c, c2, first, start;
    if (text.slice(cursor, cursor + 2) === '.}') {
      return;
    }
    start = cursor;
    first = text[cursor];
    if (first === '.' || first === '@' || first === ':') {
      cursor++;
      while ((c = text[cursor])) {
        if (c !== first) {
          break;
        } else {
          cursor++;
        }
      }
    }
    if (cursor !== start) {
      return {
        value: text.slice(start, cursor),
        start: start,
        stop: cursor,
        line: lineno
      };
    }
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
    if (cursor === start) {
      return;
    }
    if ((c = text[cursor]) === ')' || c === ']' || c === '}') {
      back = cursor - 1;
      while (charset[back]) {
        back--;
      }
      cursor = back + 1;
    }
    if (cursor === start) {
      return;
    }
    if (cursor !== start) {
      return {
        value: text.slice(start, cursor),
        start: start,
        stop: cursor,
        line: lineno
      };
    }
  });
  this.escapeSymbol = escapeSymbol = function() {
    var line1, start, sym;
    start = cursor;
    line1 = lineno;
    if (text[cursor] !== '\\') {
      return;
    }
    cursor++;
    sym = parser.symbol();
    if (!sym) {
      return rollback(start, line1);
    } else {
      sym.start = start;
      sym.escape = true;
      return sym;
    }
  };
  this.escapeStringSymbol = function() {
    var c, quote, symbolStart;
    if (text[cursor] !== "\\" || (quote = text[cursor + 1]) !== '"' && quote !== "'") {
      return;
    }
    cursor += 2;
    symbolStart = cursor;
    while (1) {
      if (!(c = text[cursor])) {
        error('unexpected end of input while parsing escaped string symbol');
      } else if (c === '\n' || c === '\r') {
        error('unexpected new line in escaped string symbol');
      } else if (c === ' ' || c === '\t') {
        error('spaces and tabs are not permitted in escaped string symbol');
      } else if (c === '"') {
        if (c === quote) {
          cursor++;
          break;
        } else {
          error('unexpected " in escaped string symbol');
        }
      } else if (c === "'") {
        if (c === quote) {
          cursor++;
          break;
        } else {
          error("unexpected ' in escaped string symbol");
        }
      }
      cursor++;
    }
    return {
      type: SYMBOL,
      escape: true,
      value: text.slice(symbolStart, cursor - 1),
      start: symbolStart - 2,
      stop: cursor,
      line: lineno
    };
  };
  this.delimiterCharset = charset('|\\//:');
  this.rightDelimiter = function(delimiter) {
    var c, start;
    start = cursor;
    if (text.slice(cursor, cursor + 2) === '.}') {
      cursor += 2;
      return '.}';
    }
    while ((c = text[cursor]) && parser.delimiterCharset[c]) {
      cursor++;
    }
    if (c !== ')' && c !== ']' && c !== '}') {
      cursor = start;
      return;
    }
    cursor++;
    if (delimiter) {
      if (text.slice(start, cursor) !== delimiter) {
        cursor = start;
      } else {
        return delimiter;
      }
    } else {
      return text.slice(start, cursor);
    }
  };
  this.symbolOrIdentifier = function() {
    return parser.symbol() || parser.identifier();
  };
  this.atom = function(mode) {
    var m, result, start, tag, x;
    start = cursor;
    tag = mode + ':atom';
    if (!(m = memoMap[tag])) {
      m = memoMap[tag] = {};
    } else if (result = m[start]) {
      cursor = result.stop;
      lineno = result.line;
      return result;
    }
    if (mode !== 'inStrExp' && (x = parser.string())) {
      x.priority = 1000;
    } else if (x = parser.identifier() || parser.number() || parser.regexp() || parser.delimiterExpression() || parser.escapeSymbol() || parser.escapeStringSymbol()) {
      x.priority = 1000;
    } else if (parser.defaultSymbolOfDefinition()) {
      cursor = start;
      x = null;
    } else if (x = parser.symbol()) {
      x.priority = 1000;
    } else {
      x = null;
    }
    m[start] = x;
    if (x) {
      return x;
    }
  };
  this.prefixParserAttributeOperator = function(priority, leftAssoc) {
    var start, x;
    start = cursor;
    if ((x = parser.symbol()) && x.value === '%' && parser.follow('atom')) {
      return {
        symbol: '%x',
        value: '%',
        priority: {
          800: {
            start: cursor - 1,
            stop: cursor,
            line: lineno
          }
        }
      };
    } else {
      cursor = start;
    }
  };
  this.customPrefixOperators = [this.prefixParserAttributeOperator];
  this.customPrefixOperator = function(mode) {
    var fn, op, _i, _len, _ref3;
    _ref3 = parser.customPrefixOperators;
    for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
      fn = _ref3[_i];
      if (op = fn(mode)) {
        return op;
      }
    }
  };
  this.prefixOperator = function(mode) {
    var line1, op, priInc, spac, space2, start, token;
    if (op = parser.customPrefixOperator()) {
      return op;
    }
    start = cursor;
    line1 = lineno;
    token = parser.operatorLiteral();
    if (!token) {
      return;
    }
    spac = bigSpace();
    if (!text[cursor]) {
      return rollback(start, line1);
    }
    if (parser.rightDelimiter()) {
      return rollback(start, line1);
    }
    if (spac.newline || spac.undent) {
      return rollback(start, line1);
    }
    op = hasOwnProperty.call(prefixOperatorDict, token.value) && prefixOperatorDict[token.value];
    if (!op) {
      return rollback(start, line1);
    }
    if (spac.indent) {
      if (mode !== 'opExp') {
        return rollback(start, line1);
      }
      if (text[cursor] === '.') {
        error('unnecessary "."');
      }
      priInc = 300;
    } else {
      if (text[cursor] === '.' && text[cursor + 1] !== '.') {
        if ((space2 = bigSpace()) && space2.value) {
          error('unexpected spaces, new line or comment after "."');
        } else if (text[cursor + 1] === '}') {
          return rollback(start, line1);
        } else {
          cursor++;
        }
      }
      priInc = 600;
    }
    return extend({}, op, {
      priority: op.priority + priInc
    });
  };
  this.parameterEllipsisSuffix = function(mode, x, priority) {
    var c, op, start;
    start = cursor;
    if (!(op = parser.symbol())) {
      return;
    } else if (op.value !== '...') {
      cursor = start;
      return;
    }
    space();
    if ((c = text[cursor]) === ',' || c === ')' || c === ']') {
      if (priority > 600) {
        cursor = start;
      } else {
        return {
          priority: 780,
          symbol: 'x...'
        };
      }
    } else {
      cursor = start;
    }
  };
  this.customSuffixOperators = [this.parameterEllipsisSuffix];
  this.customSuffixOperator = function(mode, x, priority) {
    var fn, op, _i, _len, _ref3;
    _ref3 = parser.customSuffixOperators;
    for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
      fn = _ref3[_i];
      if (op = fn(mode, x, priority)) {
        return op;
      }
    }
  };
  this.suffixOperator = function(mode, x, priority) {
    var line1, op, priInc, spac, start, token;
    if (!text[cursor]) {
      return;
    }
    if (op = parser.customSuffixOperator(mode, x, priority)) {
      return op;
    }
    start = cursor;
    line1 = lineno;
    spac = bigSpace();
    if (spac.multiline || spac.tailComment || spac.concatLine) {
      return rollback(start, line1);
    }
    if (spac.value) {
      if (priority >= 600) {
        return rollback(start, line1);
      } else {
        priInc = 300;
      }
    } else {
      priInc = 600;
      if (text[cursor] === '.' && text[cursor + 1] !== '.' && text[cursor + 1] !== '}') {
        cursor++;
      }
    }
    token = parser.operatorLiteral();
    if (!token) {
      return rollback(start, line1);
    }
    if ((op = hasOwnProperty.call(suffixOperatorDict, token.value) && suffixOperatorDict[token.value]) && op.priority + priInc >= priority) {
      if (op.symbol === 'x...') {
        parser.ellipsis = true;
      }
      return op;
    }
    return rollback(start, line1);
  };
  rollback = function(cur, line) {
    cursor = cur;
    lineno = line;
  };
  rollbackToken = function(token) {
    cursor = token.start;
    lineno = token.line1 || token.line;
  };
  parser.clauseEnd = function(spac) {
    var c, line1, start;
    start = cursor;
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
    var c;
    if (!parser.isClauseExpression(mode)) {
      return;
    }
    return (c = text[cursor]) === ':' && text[cursor + 1] !== ':' || parser.clauseEnd(spac) || (mode === 'comClExp' && spac.value) || (mode === 'inStrExp' && (c === "'" || c === '"'));
  };
  parser.isClauseExpression = function(mode) {
    return mode === 'comClExp' || mode === 'spClExp' || mode === 'inStrExp';
  };
  this.operatorLiteral = function() {
    var x;
    if (x = symbol() || taijiIdentifier()) {
      return x;
    } else if (text[cursor]) {
      return {
        value: text[cursor++]
      };
    }
  };
  this.binaryOperator = function(mode, x, priority, leftAssoc) {
    var c, indentExp, indentLine, indentStart, line1, op, opToken, pri, priInc, space1, space2, space3, start, tag;
    if (!text[cursor]) {
      return;
    }
    if (op = parser.customBinaryOperator(mode, x, priority, leftAssoc)) {
      return op;
    }
    start = cursor;
    line1 = lineno;
    if (parser.expressionEnd(mode, space1 = bigSpace())) {
      return rollback(start, line1);
    }
    if (space1.indent || space1.newline) {
      priInc = 0;
    } else if (undentFromLine(line1)) {
      return rollback(start, line1);
    } else if (space1.value) {
      priInc = 300;
    } else if (cursor === lineInfo[lineno].start + lineInfo[lineno].indentColumn) {
      priInc = 0;
    } else {
      priInc = 600;
    }
    if (priority >= priInc + 300) {
      return rollback(start, line1);
    }
    if (priInc === 600 && text[cursor] === '.' && text[cursor + 1] !== '.' && text[cursor + 1] !== '}') {
      cursor++;
    }
    if (parser.isClauseExpression() && text[cursor] === ':' && text[cursor + 1] !== ':') {
      return rollback(start, line1);
    }
    opToken = parser.operatorLiteral();
    if (!opToken || !(op = hasOwnProperty.call(binaryOperatorDict, opToken.value) && binaryOperatorDict[opToken.value])) {
      return rollback(start, line1);
    }
    if ((c = text[cursor]) === '.' && text[cursor + 1] !== '.' && text[cursor + 1] !== '}') {
      if (priInc === 300) {
        error('unexpected "." after binary operator ' + opToken.value + 'which follow something like space, comment or newline');
      } else {
        cursor++;
      }
    }
    if (parser.expressionEnd(mode, space2 = bigSpace())) {
      return rollback(start, line1);
    }
    if (space2.undent) {
      error('unexpected undent after binary operator "' + opToken.value + '"');
    }
    if (!c) {
      error('unexpected end of input, expect right operand after binary operator');
    }
    if (c === ')' || c === ']' || c === ',') {
      if (op.value !== '...') {
        error('unexpected ")"');
      } else {
        return rollback(start, line1);
      }
    }
    if (priInc === 600) {
      if (space2.value) {
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
      if (space2.value) {
        if (space2.undent) {
          error('unexpceted undent after binary operator ' + op.value);
        } else if (space2.newline) {
          priInc = 0;
        } else if (space1.indent) {
          priInc = 0;
          indentStart = cursor;
          indentLine = lineno;
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
        indentLine = lineno;
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
        lineno = indentLine;
      }
      return extend({}, op, {
        priority: 300
      });
    }
  };
  this.binaryPriority = function(op, type) {
    return binaryOperatorDict[op].priority;
  };
  this.followParenArguments = function() {
    var line1, start, x;
    start = cursor;
    line1 = lineno;
    x = paren();
    rollback(start, line1);
    return x;
  };
  this.binaryCallOperator = function(mode, x, priority, leftAssoc) {
    var line1, spac, start;
    start = cursor;
    line1 = lineno;
    if ((spac = bigSpace()) && spac.value && parser.followParenArguments()) {
      if (mode === 'opExp') {
        throw '() as call operator should tightly close to the left caller';
      } else {
        rollback(start, line1);
        return;
      }
    } else if (800 > priority && parser.followParenArguments()) {
      return {
        symbol: 'call()',
        type: SYMBOL,
        priority: 800,
        start: cursor,
        stop: cursor,
        line: lineno
      };
    }
    return rollback(start, line1);
  };
  this.binaryMacroCallOperator = function(mode, x, priority, leftAssoc) {
    var line1, pri, space1, space2, start;
    start = cursor;
    line1 = lineno;
    space1 = space();
    if (text[cursor] !== '#') {
      return rollback(start, line1);
    }
    cursor++;
    space2 = space();
    if (!!space2.value !== !!space1.value && text[cursor] === '(') {
      error('should have spaces on both or neither sides of symbol around "#"');
    }
    if (!parser.followParenArguments()) {
      return rollback(start, line1);
    }
    pri = typeof space1.value === "function" ? space1.value({
      500: 800
    }) : void 0;
    if (pri <= priority) {
      rollback(start, line1);
    }
    return {
      symbol: '#()',
      type: SYMBOL,
      priority: 800,
      start: cursor,
      stop: cursor,
      line: lineno
    };
  };
  this.binaryIndexOperator = function(mode, x, priority, leftAssoc) {
    var line1, spac, start;
    start = cursor;
    line1 = lineno;
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
        line: lineno
      };
    }
    rollback(start, line1);
  };
  this.binaryAttributeOperator = function(mode, x, priority, leftAssoc) {
    var line1, spac, space2, start;
    start = cursor;
    line1 = lineno;
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
  this.binaryAtThisAttributeIndexOperator = function(mode, x, priority, leftAssoc) {
    if (800 <= priority || x.value !== '@') {
      return;
    }
    if (x.stop !== cursor) {
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
  this.binaryPrototypeAttributeOperator = function(mode, x, priority, leftAssoc) {
    if (800 <= priority) {
      return;
    }
    if ((x.type === IDENTIFIER || x.value === '@') && text.slice(cursor, cursor + 2) === '::' && text[cursor + 2] !== ':') {
      return {
        symbol: 'attribute!',
        type: SYMBOL,
        start: cursor,
        stop: cursor,
        line: lineno,
        priority: 800
      };
    } else if (text[cursor - 3] !== ':' && text.slice(cursor - 2, cursor) === '::') {
      if (followMatch((function() {
        return parser.recursiveExpression(cursor)(mode, 800, leftAssoc);
      }))) {
        return {
          symbol: 'attribute!',
          type: SYMBOL,
          start: cursor,
          stop: cursor,
          line: lineno,
          priority: 800
        };
      }
    }
  };
  this.customBinaryOperators = [this.binaryAttributeOperator, this.binaryCallOperator, this.binaryMacroCallOperator, this.binaryIndexOperator, this.binaryAtThisAttributeIndexOperator, this.binaryPrototypeAttributeOperator];
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
  this.binaryFunctionPriority = 35;
  this.prefixExpression = function(mode, priority) {
    var line1, op, pri, start, x;
    start = cursor;
    line1 = lineno;
    if (op = parser.prefixOperator(mode)) {
      pri = priority > op.priority ? priority : op.priority;
      x = parser.recursiveExpression(cursor)(mode, pri, true);
      if (x) {
        return extend(makeOperatorExpression('prefix!', op, x), {
          start: start,
          stop: cursor,
          line1: line1,
          line: lineno
        });
      }
    }
  };
  this.recursiveExpression = recursive = function(start) {
    var expression, line1, x;
    x = null;
    line1 = lineno;
    return expression = function(mode, priority, leftAssoc) {
      var binLine, binStart, m, op, result, tag, y;
      tag = 'expr(' + mode + ',' + priority + ',' + (0 + leftAssoc) + ')';
      if (!(m = memoMap[tag])) {
        m = memoMap[tag] = {};
      } else if (result = m[start]) {
        cursor = result.stop;
        lineno = result.line;
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
          line: lineno
        });
      }
      binStart = cursor;
      binLine = lineno;
      if (op = parser.binaryOperator(mode, x, priority, leftAssoc)) {
        if (y = recursive(cursor)(mode, op.priority, !op.rightAssoc)) {
          x = extend(makeOperatorExpression('binary!', op, x, y), {
            start: start,
            stop: cursor,
            line1: line1,
            line: lineno
          });
          return expression(mode, priority, leftAssoc);
        } else {
          rollback(binStart, binLine);
        }
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
    var column, indentColumn, line2, meetWord, optionalClause, optionalWord, spac, start2, w;
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
    indentColumn = lineInfo[line1].indentColumn;
    spac = bigSpace();
    column = lineInfo[lineno].indentColumn;
    if (column === indentColumn && lineno !== line1 && !isHeadStatement) {
      if (!optionalClause) {
        error('meet new line, expect inline keyword "' + word + '" for inline statement');
      } else {
        rollbackToken(spac);
        return;
      }
    }
    if (column < indentColumn) {
      if (!optionalClause) {
        error('unexpected undent, expect ' + word);
      } else {
        rollbackToken(spac);
        return;
      }
    } else if (column > indentColumn) {
      if (options.indentColumn) {
        if (column !== options.indentColumn) {
          error('unconsistent indent');
        }
      } else {
        options.indentColumn = column;
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
    var column, indentColumn, line1, result, row0, spac, varList;
    line1 = lineno;
    indentColumn = lineInfo[line1].indentColumn;
    result = parser.identifierLine();
    spac = bigSpace();
    if ((row0 = lineInfo[lineno].indentColumn) <= indentColumn) {
      rollbackToken(spac);
      return result;
    }
    if (text[cursor] === ';') {
      return result;
    }
    while (varList = parser.identifierLine()) {
      result.push.apply(result, varList);
      spac = bigSpace();
      if ((column = lineInfo[lineno].indentColumn) <= indentColumn) {
        rollbackToken(spac);
        break;
      } else if (column !== row0) {
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
    var column, indentColumn0, indentColumn1, line1, result, spac, space1, start, x;
    start = cursor;
    line1 = lineno;
    result = [];
    indentColumn0 = lineInfo[lineno].indentColumn;
    spac = bigSpace();
    column = lineInfo[lineno].indentColumn;
    if (column > indentColumn0) {
      indentColumn1 = column;
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
      column = lineInfo[lineno].indentColumn;
      if (!text[cursor] || text[cursor] === ';' || follow('rightDelimiter')) {
        break;
      }
      if (lineno === line1) {
        continue;
      }
      if (column > indentColumn0) {
        if (indentColumn1 && column !== indentColumn1) {
          error('unconsitent indent in var initialization block');
        } else if (!indentColumn1) {
          indentColumn1 = column;
        }
      } else if (column === indentColumn0) {
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
    var c, meta, name, runtime, value;
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
    var i, length, token, value, words;
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
    var i, length, token, value, words;
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
    var token;
    space();
    if (!(token = taijiIdentifier()) || token.value !== word) {
      error('expect ' + word);
    }
    return word;
  };
  word = function(w) {
    var line1, start, token;
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
      var blockStopLineno, code, cursorAtEndOfDynamicBlock, indentColumn, leadClause, line1, result, start;
      start = cursor;
      line1 = lineno;
      if (!space().value) {
        return;
      }
      leadClause = parser.clause();
      code = compileExp(['return', ['%/', leadClause]], environment);
      space();
      indentColumn = lineInfo[lineno].indentColumn;
      if (expectWord('then') || (text[cursor] === ':' && cursor++)) {
        space();
        if (newline()) {
          blockStopLineno = lineno;
          while (lineInfo[blockStopLineno].indentColumn > indentColumn && blockStopLineno < maxLine) {
            blockStopLineno++;
          }
          cursorAtEndOfDynamicBlock = lineInfo[blockStopLineno].indentColumn || text.length;
        } else {
          blockStopLineno = lineno + 1;
          cursorAtEndOfDynamicBlock = lineInfo[blockStopLineno].indentColumn || text.length;
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
      var inOf, init, kw, line1, name1, name2, obj, step, test, token, value;
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
      var body, conj, indentColumn, line1, tailClause;
      line1 = lineno;
      space();
      indentColumn = lineInfo[lineno].indentColumn;
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
      var eLeft, left, line1, right, spac, start, token;
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
      var body, line1, parameters, start, token;
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
    var c, code, line1, start;
    if (cursor !== lineInfo[lineno].start + lineInfo[lineno].indentColumn) {
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
    memoMap = {};
    return result;
  };
  this.block = function() {
    var indentColumn, spac, x;
    indentColumn = lineInfo[lineno].indentColumn;
    spac = bigSpace();
    if (!spac.indent) {
      return rollbackToken(spac);
    } else {
      x = parser.blockWithoutIndentHead();
      spac = bigSpace();
      if (lineInfo[lineno].indentColumn < indentColumn) {
        rollbackToken(spac);
      }
      return x;
    }
  };
  this.blockWithoutIndentHead = function() {
    var indentColumn, result, spac, x, x0;
    indentColumn = lineInfo[lineno].indentColumn;
    result = [];
    while ((x = parser.line()) && (spac = bigSpace())) {
      if (x.length !== 1 || !(x0 = x[0]) || (x0[0] !== 'lineComment!' && x0[0] !== 'codeBlockComment!')) {
        result.push.apply(result, x);
      }
      if (lineInfo[lineno].indentColumn < indentColumn) {
        rollbackToken(spac);
        break;
      }
    }
    return result;
  };
  this.lineBlock = function() {
    var column, cursor2, indentColumn, line, line1, line2, space1, start;
    start = cursor;
    line1 = lineno;
    indentColumn = lineInfo[lineno].indentColumn;
    space1 = bigSpace();
    if (space1.indent) {
      return parser.blockWithoutIndentHead();
    }
    line = parser.line();
    cursor2 = cursor;
    line2 = lineno;
    bigSpace();
    column = lineInfo[lineno].indentColumn;
    if (column <= indentColumn) {
      rollback(cursor2, line2);
    } else {
      line.push.apply(line, parser.blockWithoutIndentHead());
    }
    return line;
  };
  processDataBracetResult = function(items) {
    if (items.length === 0) {
      return items;
    } else if (items.length === 1) {
      return items[0];
    } else {
      return ['list!'].concat(items);
    }
  };
  this.dataClause = function() {
    var clause, item, spac, sym;
    if (parser.clauseEnd(spac = bigSpace())) {
      return;
    }
    clause = [];
    while (1) {
      if (text[cursor] === ':' && text[cursor + 1] !== ':') {
        error('unexptected ";" in data block');
      }
      if (text[cursor] === ',') {
        cursor++;
        break;
      }
      if (item = parser.spaceClauseExpression()) {
        clause.push(getOperatorExpression(item));
      } else if (sym = parser.symbol()) {
        clause.push(sym);
      }
      if (parser.clauseEnd()) {
        break;
      }
    }
    return processDataBracetResult(clause);
  };
  this.dataClauses = function() {
    var clause, result;
    result = [];
    while (clause = parser.dataClause()) {
      result.push(clause);
    }
    return result;
  };
  this.dataSentence = function() {
    if (parser.sentenceEnd()) {
      return;
    }
    if (text[cursor] === ';') {
      cursor++;
      return [];
    }
    return processDataBracetResult(parser.dataClauses());
  };
  this.dataLineEnd = function() {
    return !text[cursor] || follow('rightDelimiter');
  };
  this.basicDataLine = function() {
    var result, x;
    if (parser.dataLineEnd()) {
      return;
    }
    result = [];
    while (x = parser.dataSentence()) {
      result.push(x);
    }
    return processDataBracetResult(result);
  };
  this.dataBlock = function() {
    var indentColumn, result, spac, x;
    indentColumn = lineInfo[lineno].indentColumn;
    result = [];
    spac = bigSpace();
    while ((x = parser.dataLine()) && (spac = bigSpace())) {
      result.push(x);
      if (lineInfo[lineno].indentColumn < indentColumn) {
        rollbackToken(spac);
        break;
      }
    }
    return result;
  };
  this.dataLine = function() {
    var indentColumn, line1, result;
    line1 = lineno;
    indentColumn = lineInfo[lineno].indentColumn;
    result = parser.basicDataLine();
    if (lineInfo[lineno].indentColumn > indentColumn) {
      result.concat(parser.dataBlock());
    }
    return result;
  };
  this.lines = function() {
    var indentColumn, result, spac, x;
    indentColumn = lineInfo[lineno].indentColumn;
    result = [];
    while ((x = parser.line()) && (spac = bigSpace())) {
      result.push.apply(result, x);
      if (lineInfo[lineno].indentColumn < indentColumn) {
        rollbackToken(spac);
        break;
      }
    }
    return result;
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
    while (lineno <= maxLine && (lineInfo[lineno].indentColumn > 0 || lineInfo[lineno].empty)) {
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
  this.moduleBody = function() {
    var body;
    body = parser.lines();
    if (text[cursor]) {
      error('expect end of input, but meet "' + text.slice(cursor) + '"');
    }
    return begin(body);
  };
  this.module = function() {
    var binNode, header;
    if (text.slice(cursor, cursor + 2) === '#!') {
      lineno = 2;
      cursor = lineInfo[lineno].start;
      binNode = ['scriptDirective!', text.slice(0, cursor)];
    }
    header = parser.moduleHeader();
    return {
      type: MODULE,
      header: header,
      body: parser.moduleBody()
    };
  };
  this.indentFromLine = indentFromLine = function(line1) {
    return lineInfo[lineno].indentColumn > lineInfo[line1].indentColumn;
  };
  this.undentFromLine = undentFromLine = function(line1) {
    return lineInfo[lineno].indentColumn < lineInfo[line1].indentColumn;
  };
  this.sameIndentFromLine = sameIndentFromLine = function(line1) {
    return lineInfo[lineno].indentColumn === lineInfo[line1].indentColumn;
  };
  this.newlineFromLine = newlineFromLine = function(line1, line2) {
    return line2 !== line1 && lineInfo[line2].indentColumn === lineInfo[line1].indentColumn;
  };
  this.getColumn = function() {
    return cursor - lineInfo[lineno].start;
  };
  this.preparse = function() {
    var atLineHead, c, column, diffSpace, i, indentColumn, indentLine, indentStack, indentStackIndex, line, lineHeadChar, prevIndentLine;
    i = 0;
    line = 1;
    column = 0;
    parser.lineInfo = lineInfo = [
      {
        start: -1,
        empty: true,
        indentColumn: 0
      }, {
        start: 0
      }
    ];
    atLineHead = true;
    diffSpace = void 0;
    lineHeadChar = void 0;
    indentStack = [0];
    indentLine = 0;
    indentColumn = 0;
    indentStackIndex = 0;
    while (c = text[i]) {
      if (c === '\n' && ++i) {
        lineInfo.push({});
        if (atLineHead) {
          lineInfo[line].empty = true;
          lineInfo[line].indentColumn = column;
        }
        if (text[i] === '\r') {
          i++;
        }
        lineInfo[++line].start = i;
        column = 0;
        atLineHead = true;
      } else if (c === '\r' && ++i) {
        lineInfo.push({});
        if (atLineHead) {
          lineInfo[line].empty = true;
          lineInfo[line].indentColumn = column;
        }
        if (text[i] === '\n') {
          i++;
        }
        lineInfo[++line].start = i;
        column = 0;
        atLineHead = true;
      } else {
        if (atLineHead) {
          if (c === ' ' || c === '\t') {
            if (lineHeadChar) {
              if (lineHeadChar !== c) {
                diffSpace = column;
              }
            } else {
              lineHeadChar = c;
            }
          } else if (diffSpace) {
            error(i + '(' + line + ':' + diffSpace + '): ' + 'unconsistent space or tab character in the head of a line');
          } else {
            lineInfo[line].indentColumn = column;
            atLineHead = false;
            if (column > indentColumn) {
              lineInfo[line].indent = indentLine;
              indentStack.push(indentLine = line);
              indentColumn = column;
              indentStackIndex++;
            } else if (column === indentColumn) {
              lineInfo[line].prevLine = indentLine;
              indentStack[indentStackIndex] = indentLine = line;
              if (indentStackIndex > 1) {
                lineInfo[line].indent = indentStack[indentStackIndex - 1];
              }
            } else {
              while (column < indentColumn) {
                prevIndentLine = indentStack[indentStackIndex];
                indentStack.pop();
                --indentStackIndex;
                indentColumn = lineInfo[indentStack[indentStackIndex]].indentColumn;
              }
              lineInfo[line].undent = prevIndentLine;
              if (column === indentColumn) {
                lineInfo[line].prevLine = indentStack[indentStackIndex];
              } else {
                lineInfo[line].indent = indentStack[indentStackIndex];
                indentStack.push(line);
                indentColumn = column;
                indentStackIndex++;
              }
              indentLine = line;
            }
          }
        }
        i++;
        column++;
      }
    }
    lineInfo.push({
      indentColumn: 0,
      start: text.length
    });
    maxLine = line;
  };
  this.init = function(data, cur, env) {
    this.text = text = data;
    cursor = cur;
    lineno = 1;
    memoMap = {};
    atStatementHead = true;
    this.environment = environment = env;
    this.meetEllipsis = false;
    return endCursorOfDynamicBlockStack = [];
  };
  this.parse = function(data, root, cur, env) {
    parser.init(data, cur, env);
    parser.preparse();
    return root();
  };
  this.error = error = function(message) {
    throw cursor + '(' + lineno + ':' + parser.getColumn() + '): ' + message + ': \n' + text.slice(cursor - 40, cursor) + '|   |' + text.slice(cursor, cursor + 40);
  };
  return this;
};

compileExp = require('../compiler').compileExp;
