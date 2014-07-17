{charset, isArray, wrapInfo1, wrapInfo2, str, entity} = require '../utils'
{compileExp} = require '../compiler'

{extend, firstIdentifierChars, firstIdentifierCharSet, letterDigitSet, identifierChars,
digitCharSet, letterCharSet, identifierCharSet,
taijiIdentifierCharSet, constant} = base = require './base'
digitChars = base.digits
letterChars = base.letters

{NUMBER,  STRING,  IDENTIFIER, SYMBOL, REGEXP,  HEAD_SPACES, CONCAT_LINE, PUNCT, FUNCTION, C_BLOCK_COMMENT
PAREN, BRACKET, DATA_BRACKET, CURVE, INDENT_EXPRESSION
NEWLINE,  SPACES,  INLINE_COMMENT, SPACES_INLINE_COMMENT,
LINE_COMMENT, BLOCK_COMMENT, CODE_BLOCK_COMMENT,CONCAT_LINE
NON_INTERPOLATE_STRING, INTERPOLATE_STRING, EOI
INDENT, UNDENT, HALF_DENT, MODULE_HEADER, MODULE, SPACE_COMMENT, TAIL_COMMENT
} = constant

{prefixOperatorDict, suffixOperatorDict, binaryOperatorDict,
makeOperatorExpression, getOperatorExpression} = require './operator'

exports.escapeNewLine = escapeNewLine = (s) -> (for c in s then (if c=='\n' then '\\n' else '\\r')).join('')

exports.keywordMap =
  'if': 1, 'try':1, 'switch':1, 'while':1, 'let':1, 'letrec!':1, 'letloop!':1, 'do':1, 'repeat':1
  'return':1, 'break':1, 'continue':1, 'throw':1,'function':1,'for':1
  'loop':1, 'class':1, 'var':1, 'for':1

exports.isKeyword = isKeyword = (item) ->
  item and not item.escaped and hasOwnProperty.call(exports.keywordMap, item.value)

exports.conjMap =
  'then':1, 'else':1, 'catch':1, 'finally':1, 'case':1, 'default':1, 'extends': 1
  'until':1, 'where':1, 'when':1

exports.isConj = isConj = (item) ->
  item and not item.escaped and hasOwnProperty.call(exports.conjMap, item.value)

hasOwnProperty = Object::hasOwnProperty

begin = (exp) ->
  if not exp or not exp.push then return exp
  if exp.length==0 then ''
  else if exp.length==1 then exp[0]
  else exp.unshift('begin!'); exp


exports.Parser = ->
  parser = @; @predefined = predefined = {}
  unchangeable = ['cursor', 'setCursor', 'lineno', 'setLineno', 'atLineHead', 'atStatementHead', 'setAtStatementHead']

  text = null; cursor = 0; lineno = 1;  lineInfo = []; maxLine = -1
  memoMap = {}; atStatementHead = true
  environment = null

  memoIndex = 0  # don't need be set in parser.init, memoMap need to be set instead.

  # to maintain the balance of delimterStack with memo function, it's the duty of programer who are extending the parser
  @memo = memo = (fn) -> 
    tag = memoIndex++
    ->
      if (m=memoMap[tag]) and hasOwnProperty.call(m, cursor)
        if x=m[cursor] then cursor = x.stop; lineno = x.line
        return x
      else
        if not memoMap[tag] then memoMap[tag] = m = {}
        m[cursor] = fn()
        #console.log tag+' '+cursor+' '+lineno
        #m[cursor]

  parser.saveMemo = saveMemo = (tag, start, result) ->
    if not memoMap[tag] then memoMap[tag] = {}
    result.stop = cursor; result.line = lineno
    memoMap[tag][start] = result

  # garbage collector: do this in some proper time, e.g. when starting to parse a sentence
  @clearMemo = -> memoMap = {}

  @followMatch = followMatch = (fn) ->
    start = cursor; line = lineno
    x = fn()
    cursor = start; lineno = line
    x

  @follow = follow = (matcherName) ->
    start = cursor; line = lineno
    x = parser[matcherName]()
    cursor = start; lineno = line
    x

  @expect = expect = (matcherName, message) ->
    if not (x = parser[matcherName]()) then error message
    else x

  @followSequence = followSequence = (matcherList...) ->
    start = cursor; line1 = lineno
    for matcherName in  matcherList
      if not (x=parser[matcherName]()) then break
    cursor = start; lineno = line1
    x

  @followOneOf = (matcherList...) ->
    start = cursor; line1 = lineno
    for matcherName in  matcherList
      cursor = start; lineno = line1 # defensive coding style
      if x =  parser[matcherName]() then break
    cursor = start; lineno = line1
    x

  @cursor = -> cursor
  @setCursor = (x) -> cursor = x
  @atStatementHead = -> atStatementHead
  @setAtStatementHead = (x) -> atStatementHead = x
  @endOfInput = -> not text[cursor]

  # one or more whitespaces, ie. space or tab.<br/>
  @spaces = spaces = ->
    if (c=text[cursor])!=' ' and c!='\t' then return
    start = cursor
    while (c=text[cursor]) then (if c!=' ' and c!='\t' then break else cursor++)    
    { type:SPACES, value: text.slice(start, cursor), start:start, stop:cursor, line: lineno}

  @char = char = (c) ->  if text[cursor]==c then cursor++; true

  # \n\r, don't eat spaces.
  @newline = newline = ->
    c = text[start=cursor]; line1 = lineno
    if c=='\r'
      cursor++
      if text[cursor]=='\n' then cursor++; c2 = '\n'
      lineno++
    else if c=='\n'
      cursor++
      if text[cursor]=='\r' then cursor++; c2 = '\r'
      lineno++
    else return
    {type: NEWLINE, value: c+(c2 or ''), start:start, stop: cursor, line1:line1, line:lineno}

  # \n\r, don't eat spaces.
  @newLineAndEmptyLines = newLineAndEmptyLines = ->
    start = cursor; line1 = lineno
    if not newline() then return
    while lineno<maxLine and lineInfo[lineno].emtpy then lineno++;
    cursor = lineInfo[lineno].start+lineInfo[lineno].indentRow
    {type: NEWLINE, value:text[start...cursor], start:start, stop: cursor, line1:line1, line:lineno}

  @tailComment = ->
    if text[cursor...cursor+2]!='//' then return
    indentRow = lineInfo[lineno].indentRow
    if cursor==lineInfo[lineno].start+indentRow then return
    start = cursor
    if lineno+1==maxLine then cursor = text.length; lineno++
    else cursor = lineInfo[lineno+1].start-1
#      while (c=text[cursor])=='\n' or c=='\r' then cursor--
#      cursor++
    { type: TAIL_COMMENT, value:text[start...cursor], start:start,line: lineno}

  @lineComment = ->
    if text[cursor]!='/' or text[cursor+1]!='/' then return
    indentRow = lineInfo[lineno].indentRow
    if cursor!=lineInfo[lineno].start+indentRow then return
    start = cursor; line1 = lineno
    while ++lineno and lineno<=maxLine and lineInfo[lineno].empty then continue
    cursor = lineInfo[lineno].start + lineInfo[lineno].indentRow
    #cursor = lineInfo[lineno].start-1; lineno--
    { type: LINE_COMMENT, value:text.slice(start, cursor), start:start, stop:cursor, line1:line1, line: lineno
    #indent:lineno<maxLine and indentRow<lineInfo[lineno+1].indentRow
    indent: indentRow<lineInfo[lineno].indentRow
    }

  @indentBlockComment = ->
    if cursor!=lineInfo[lineno].start+(indentRow=lineInfo[lineno].indentRow) then return
    if text[cursor..cursor+1]!='/.' then return
    start = cursor; line1 = lineno; lineno++
    while lineno<=maxLine
      if lineInfo[lineno].empty then lineno++
      else if lineInfo[lineno].indentRow>indentRow then lineno++
      else break
    if lineno>maxLine then cursor = text.length
    else cursor = lineInfo[lineno].start+lineInfo[lineno].indentRow
    { type: BLOCK_COMMENT, value: text.slice(start, cursor), start:start, stop:cursor, line1: line1, line: lineno}

  # default /* some content */, can cross lines
  @cBlockComment = ->
    if text.slice(cursor, cursor+2) !='/*' then return
    start = cursor; cursor +=2; line1 = lineno
    indentRow = lineInfo[lineno].indentRow
    while 1
      if not (c=text[cursor]) then error 'meet unexpected end of input while parsing inline comment'
      if text.slice(cursor, cursor+2)=='*/' then cursor += 2; break
      else if newline()
        while lineno<maxLine and lineInfo[lineno].empty then lineno++
        if lineInfo[lineno].indentRow<indentRow
          error 'the lines in c style block comment should not indent less than its begin line'
        cursor = lineInfo[lineno].start+lineInfo[lineno].indentRow
      else cursor++
    { type: C_BLOCK_COMMENT, value:text.slice(start, cursor), start:start, stop:cursor, line1:line1, line: lineno}

  @concatLine = ->
    if text[cursor]!='\\' then return
    if (c=text[cursor+1])!='\n' and c!='\r' then return
    cursor++; bigSpc()

  @inlineSpaceComment = spc = memo ->
    start = cursor; line1 = lineno
    while c=text[cursor]
      if c==' ' or c=='\t' then cursor++
      else if c=='\n' or c=='\r' or parser.tailComment() then lineTail = true; break
      else if parser.cBlockComment() then continue
      else if parser.concatLine() then lineTail = true; concat=true; continue
      else break
#    console.log cursor+' '+lineno
    {type: SPACE_COMMENT, value:text[start...cursor],
    start: start, stop:cursor, line1:line1, line:lineno
    multiLine: line1!=lineno, lineTail: lineTail, concat:concat, inline:true}

  @multilineSpaceComment = memo ->
    start = cursor; line1 = lineno; indentRow = lineInfo[lineno].indentRow
    spc();
    multiStart = cursor
    while c=text[cursor]
      if newLineAndEmptyLines() then continue
      else if indentRow!=lineInfo[lineno].indentRow then break  # stop at indent or undent
      else if parser.indentBlockComment() then continue
      else if parser.cBlockComment() then spc(); continue
      else break
    if cursor==multiStart then cursor = start; return # fail if only meet inline space comment
    atStatementHead = true
    {type: SPACE_COMMENT, value:text[start...cursor], start: start, stop:cursor, line1:line1, line:lineno
    multipleLine: true
    indent:indentRow<lineInfo[lineno].indentRow
    undent:indentRow>lineInfo[lineno].indentRow
    newline:indentRow==lineInfo[lineno].indentRow}

  @spaceComment = bigSpc = memo -> parser.multilineSpaceComment() or spc()

  @regexp = memo ->
    if text[start=cursor]!='/' then return
    if cursor==(indentRow=lineInfo[lineno].indentRow) then return # code block comment
    c = text[cursor+1]
    if c=='*' or c=='/' then return
    start = cursor
    while c = text[++cursor]
      if c=='\\' and text[cursor+1]=='/' then cursor++
      else if c=='\n' or c=='\r'
        error 'meet unexpected new line while parsing regular expression'
      else if c=='/'
        i = 0
        while c=text[++cursor] and ++i
          if c=='i' or c=='g'or c=='m' then cursor++
          else break
        if i>3 then 'too many modifiers after regexp'
        break
    { type: REGEXP, value:text.slice(start, cursor), start:start, stop: cursor, line: lineno}

  @literal = literal = (string) ->
    length = string.length
    if text[cursor...cursor+length]==string then cursor += length; true

  @decimal = decimal = memo ->
    start = cursor
    while c = text[cursor] then (if  '0'<=c<='9' then cursor++ else break)
    if cursor==start then return
    {start:start, stop: cursor, value: parseInt(text[start...cursor])}

  @makeIdentifierFn = (charSet, firstCharSet=firstIdentifierCharSet) ->
    ->
      start = cursor
      if not firstCharSet[text[cursor]] then return
      cursor++
      while c=text[cursor] then (if charSet[c] then cursor++ else break)
      # avoid gotcha: x!=
      # x!.=1 x!=1 x.!=1
      if text[cursor-1]=='!' and text[cursor]=='=' then cursor--
      {type: IDENTIFIER, value: text.slice(start, cursor), start:start, stop: cursor, line: lineno}

  #js style identifier, can have $, letter, digit, underline
  @jsIdentifier = jsIdentifier = memo @makeIdentifierFn(identifierCharSet, firstIdentifierCharSet)
  # parser.conjunction uses private var taijiIdentifier
  @taijiIdentifier = taijiIdentifier = memo @makeIdentifierFn(taijiIdentifierCharSet, firstIdentifierCharSet)
  @identifier = memo ->
    if (token=parser.taijiIdentifier())
      if not isKeyword(token) and not isConj(token) then token
      else rollbackToken(token)
    else if text[cursor]=='\\' and ++cursor and (token=parser.taijiIdentifier())
      token.escaped = true; return token

  # binary, hexidecimal, decimal, scientic float
  @number = number = memo ->
    start = cursor; base = 10; c = text[cursor]
    if c=='0' and c2 = text[cursor+1]
      if c2=='b' or c2=='B' then base = 2; baseStart = cursor += 2; c = text[cursor]
      else if c2=='x' or c2=='X' then base = 16; baseStart = cursor += 2; c = text[cursor]
      else c = text[++cursor]; meetDigit = true
    if base==2
      while c
        if c=='0' or c=='1' then c = text[++cursor]
        else break
    else if base==16
      while c
        if  not('0'<=c<='9' or 'a'<=c<='f' or 'A'<=c<='F') then break
        else c = text[++cursor]
    if base==2
      if c=='.' or c=='e' or c=='E' then error 'binary number followed by ".eE"'
      else if '2'<=c<='9' then error 'binary number followed by 2-9'
    if base==16
      if c=='.' then error 'hexadecimal number followed by "."'
      else if letterCharSet[c] then error 'hexadecimal number followed by g-z or G-Z'
    if base!=10
      if cursor==baseStart then cursor--; return { type: NUMBER, value: 0, start:start, stop: cursor, line:lineno}
      else return { type: NUMBER, value: parseInt(text[baseStart...cursor], base), start:start, stop: cursor, line:lineno}
    # base==10
    while c
      if '0'<=c<='9' then meetDigit = true; c = text[++cursor]
      else break
    # if not meetDigit then return symbol() # comment because in no matchToken solution
    if not meetDigit then return
    if c=='.'
      meetDigit = false
      c = text[++cursor]
      while c
        if c<'0' or '9'<c then break
        else meetDigit = true; c = text[++cursor]
    dotCursor = cursor-1
    if not meetDigit and c!='e' and c!='E'
      cursor = dotCursor;
      return { type: NUMBER, value: parseInt(text[start...cursor]), start:start, stop: cursor, line:lineno}
    if c=='e' or c=='E'
      c = text[++cursor]
      if c=='+' or c=='-'
        c = text[++cursor]
        if not c or c<'0' or '9'<c
          cursor = dotCursor;
          return { type: NUMBER, value: parseInt(text[start...dotCursor]), start:start, stop: dotCursor, line:lineno}
        else
          while c
            c = text[++cursor]
            if  c<'0' or '9'<c then break
      else if not c or c<'0' or '9'<c
        cursor = dotCursor;
        return { type: NUMBER, value: parseInt(text[start...dotCursor]), start:start, stop: dotCursor, line:lineno}
      else while c
          if  c<'0' or '9'<c then break
          c = text[++cursor]
    { type: NUMBER, value: parseFloat(text[start...cursor]), start:start, stop: cursor, line:lineno}

  nonInterpolatedStringLine = (quote, quoteLength) ->
    result = ''
    while c=text[cursor]
      if text[cursor...cursor+quoteLength]==quote then return result
      else if x=newline() then return result+escapeNewLine(x.value)
      else if c=='\\'
        result += '\\'; cursor++
        if x=newline() then return result+escapeNewLine(x.value)
        else if c=text[cursor] then result += c else return result
      else if c=='"'  then result += '\\"'
      else result += c
      ++cursor
    error 'unexpected end of input while parsing non interpolated string'

  @nonInterpolatedString = memo ->
    if text[cursor...cursor+3]=="'''" then quote = "'''"
    else if text[cursor]=="'" then quote = "'"
    else return
    start = cursor; line1 = lineno; quoteLength = quote.length; indentRow = null
    if cursor==lineInfo[lineno].start+lineInfo[lineno].indentRow then indentRow = lineInfo[lineno].indentRow
    cursor += quoteLength; str = ''
    while text[cursor]
      if text[cursor...cursor+quoteLength]==quote
        cursor += quoteLength
        return {type: NON_INTERPOLATE_STRING, value: '"'+str+'"', start:start, stop:cursor, line1:line1, line: lineno}
      if lineInfo[lineno].empty
        str += nonInterpolatedStringLine(quote, quoteLength)
        continue
      else if lineno!=line1
        myLineInfo =  lineInfo[lineno]; myIndent = myLineInfo.indentRow
        if indentRow==null then indentRow = myIndent
        else if myIndent<indentRow then error 'wrong indent in string'
        cursor += indentRow
      str += nonInterpolatedStringLine(quote, quoteLength)
    if not text[cursor] then error 'expect '+quote+', unexpected end of input while parsing interpolated string'

  interpolateStringPiece = (quote, quoteLength, indentRow, lineIndex) ->
    str = '"'
    while c = text[cursor]
      if text[cursor...cursor+quoteLength]==quote then return str+'"'
      else if c=='"'
        if c!=quote then str +='\\"'; cursor++
        else return str +'\\"'
      else if x = newline()
        if not lineInfo[lineno].empty and (myIndent=lineInfo[lineno].indentRow) and lineIndex.value++
          if indentRow.value==null then indentRow.value = myIndent
          else if myIndent!=indentRow.value then error 'wrong indent in string'
          else cursor += myIndent
        return str+escapeNewLine(x)+'"'
      else if c=='(' or c=='{' or c=='[' then return str+c+'"'
      else if  c=='$' then return str+'"'
      else if c=='\\'
        if not (c2=text[cursor+1]) then break
        else if c2=='\n' or c2=='\r' then cursor++; str += '\\'
        else cursor += 2; str += '\\'+c2
      else str += c; cursor++
    error 'unexpected end of input while parsing interpolated string'

  @interpolatedString = memo ->
    if text[cursor...cursor+3]=='"""' then quote = '"""'
    else if text[cursor]=='"' then quote = '"'
    else return
    start = cursor; line1 = lineno; indentRow = null
    if (row=parser.getRow())==lineInfo[lineno].indentRow then indentRow = {value:row}
    else indentRow = {}
    quoteLength = quote.length; cursor += quoteLength; pieces = []
    lineIndex = {value:0}
    while c=text[cursor]
      if text[cursor...cursor+quoteLength]==quote
        cursor += quoteLength
        return {type: INTERPOLATE_STRING, value: ['string!'].concat(pieces), start:start, stop:cursor, line1:line1, line: lineno}
      if c=='$'
        literalStart = cursor++
        x = parser.interpolateExpression()
        if x
          x = getOperatorExpression x
          if text[cursor]==':'
            cursor++
            pieces.push text[literalStart...cursor]
          pieces.push x
        else pieces.push '"$"'
      else if c=='(' or c=='{' or c=='['
        if x=parser.delimiterExpression('inStrExp')
          pieces.push getOperatorExpression(x)
          if c=='(' then pieces.push '")"'
          else if c=='[' then  pieces.push '"]"'
          else if c=='{' then  pieces.push '"}"'
        else pieces.push '"'+c+'"'
      else pieces.push interpolateStringPiece(quote, quoteLength, indentRow, lineIndex)
    if not text[cursor] then error 'expect '+quote+', unexpected end of input while parsing interpolated string'

  @string = -> parser.interpolatedString() or parser.nonInterpolatedString()

  @paren = paren = memo ->
    start = cursor; line1 = lineno
    if text[cursor]!='(' then return else cursor++
    space = bigSpc()
    if space.undent then error 'unexpected undent while parsing parenethis "(...)"'
    exp = parser.operatorExpression()
    bigSpc()
    if lineInfo[lineno].indentRow<lineInfo[line1].indentRow
      error 'expect ) indent equal to or more than ('
    if text[cursor]!=')' then error 'expect )' else cursor++
    {type: PAREN, value: exp, start:start, stop:cursor, line1:line1, line: lineno}

  @curve = curve = memo ->
    start = cursor; line1 = lineno; indentRow = lineInfo[lineno].indentRow
    if text[cursor]!='{' or text[cursor+1]=='.' then return else cursor++; spc()
    body = parser.lineBlock()
    bigSpc()
    if lineInfo[lineno].indentRow<indentRow then error 'unexpected undent while parsing parenethis "{...}"'
    if text[cursor]!='}' then error 'expect }' else cursor++
    if body.length==0 then {type: CURVE, value:'', start:start, stop: cursor, line1:line1, line:lineno}
    else
      if body.length==1 then body = body[0]
      else body.unshift 'begin!'
      extend body, {type: CURVE, start:start, stop: cursor, line1:line1, line:lineno}

  @bracket = memo ->
    start = cursor; line1 = lineno; indentRow = lineInfo[lineno].indentRow
    if text[cursor]!='[' then return else cursor++
    expList = parser.lineBlock()
    bigSpc()
    if lineInfo[lineno].indentRow<indentRow then error 'unexpected undent while parsing parenethis "[...]"'
    if text[cursor]!=']' then error 'expect ]' else cursor++
    if expList then expList.unshift 'list!'
    else expList = []
    extend expList, {type: BRACKET, isBracket: true, start:start, stop: cursor, line1:line1, line:lineno}

  @dataBracket = memo ->
    start = cursor; line1 = lineno; indentRow = lineInfo[lineno].indentRow
    if text[cursor...cursor+2]!='[\\' then return else cursor+=2
    result = []
    while (x=parser.dataLine()) and (space = bigSpc())
      result.push x
      if lineInfo[lineno].indentRow<indentRow
        error 'expect to indent the same as or more than  the line of [\\'
    spc()
    if lineInfo[lineno].indentRow<indentRow then error 'unexpected undent while parsing parenethis "[\\ ...\\]"'
    if text[cursor...cursor+2]!='\\]' then error 'expect \\]' else cursor+=2
    result.unshift 'list!'
    extend result, {type: DATA_BRACKET, start:start, stop:cursor, line1:line1, line: lineno}

  @hashItem = memo ->
    start = cursor; line1 = lineno;
    space1 = bigSpc(); js = false
    if space1.indent then error 'unexpected indent'
    else if space1.undent then return rollback start, line1
    if key=parser.compactClauseExpression()
      space2 = bigSpc()
      if space2.multipleLine then error 'unexpected new line after hash key'
      if text[cursor]==':' and cursor++
        if (t=key.type)==IDENTIFIER or t==NUMBER or t==NON_INTERPOLATE_STRING then js = true
      else if text[cursor...cursor+2]=='=>' then cursor+=2
      else error 'expect : or => for hash item definition'
      if (space=follow('spaceComment')) and space.indent
        value = ['hash!'].concat parser.hashBlock()
      else value = parser.clause()
      if not value then error 'expect value of hash item'
      if js then result = ['jshashitem!', getOperatorExpression(key), value]
      else result = ['pyhashitem!', getOperatorExpression(key), value]
      extend result, {start:start, stop:cursor, line1:line1, line:lineno}

  @hashBlock = memo ->
    start = cursor; line1 = lineno; row1 = lineInfo[lineno].indentRow
    if (space=bigSpc()) and space.undent then return
    result = []; if space.indent then indentRow = lineInfo[lineno].indentRow
    while (x=parser.hashItem()) and result.push x
      spc()
      if not (c=text[cursor]) then break
      if c=='.'
        if text[cursor+1]=='}' then break
        else error 'unexpected ".", expect .} to close hash block'
      if c==';' then cursor++
      space2 = bigSpc()
      if not (c=text[cursor]) or c=='}' then break
      if lineno==line1 then continue
      if (row=lineInfo[lineno].indentRow)>row1
        if indentRow and row!=indentRow then error 'unconsistent indent in hash {. .}'
        else indentRow = row
      else if row==row1 then break
      else if row<row1 then rollbackToken space2; return
    result.start = start; result.stop = cursor; result

  @hash = memo ->
    start = cursor; line1 = lineno; indentRow = lineInfo[lineno].indentRow
    if text[cursor...cursor+2]!='{.' then return else cursor += 2
    items = parser.hashBlock()
    if lineInfo[lineno].indentRow<indentRow then error 'unexpected undent while parsing parenethis "{.  ... .}"'
    if text[cursor...cursor+2]!='.}' then error 'expect .}' else cursor += 2
    extend ['hash!'].concat(items), {start:start, stop:cursor, line1:line1, line:lineno}

  @delimiterExpression = memo -> parser.paren() or parser.dataBracket() or parser.bracket() or parser.curve() or parser.hash()

  symbolStopChars = extend charset(' \t\v\n\r()[]{},;:\'\".@'), identifierCharSet

  # parser.conjunction uses private var "symbol".
  @symbol = symbol = memo ->
    if text[cursor...cursor+2]=='.}' then return
    start = cursor; first = text[cursor]
    if first=='.' or first=='@' or first==':'
      cursor++
      while (c=text[cursor])
        if c!=first then break
        else cursor++
    if cursor!=start then return {value: text.slice(start, cursor), start:start, stop:cursor, line: lineno}
    while c=text[cursor]
      if symbolStopChars[c] then break
      if c=='/' and ((c2=text[cursor+1])=='/' or c2=='*') then break
      if c=='\\' and ((c2=text[cursor+1])=='\n'  or c2=='\r') then break
      cursor++
    if cursor==start then return
    if (c=text[cursor])==')' or c==']' or c=='}'
      back = cursor-1
      while charset[back] then back--
      cursor = back+1
    if cursor==start then return
    if cursor!=start then return {value: text.slice(start, cursor), start:start, stop:cursor, line: lineno}

  @delimiterCharset = charset('|\\//:')

  @rightDelimiter = (delimiter) ->
    start = cursor
    if text[cursor...cursor+2]=='.}' then cursor += 2; return '.}'
    while (c=text[cursor]) and parser.delimiterCharset[c] then cursor++
    if c!=')' and c!=']' and c!='}' then cursor = start; return  # and c!='>'
    cursor++
    if delimiter
      if text[start...cursor]!=delimiter then cursor = start; return
      else delimiter
    else text[start...cursor]

  @symbolOrIdentifier = -> parser.symbol() or parser.identifier()

  @atom = (mode) ->
    start = cursor
    tag = mode+':atom'
    if not (m=memoMap[tag]) then m = memoMap[tag] = {}
    else if result=m[start] then cursor = result.stop; lineno = result.line; return result
    if mode!='inStrExp' and x=parser.string()  then x.priority = 1000
    else if x = (parser.identifier() or parser.number() or parser.regexp() or parser.delimiterExpression())
      x.priority = 1000
    else if parser.defaultSymbolOfDefinition() then cursor = start; x = null
    else if x=parser.symbol() then x.priority = 1000
    else x = null
    m[start] = x
    if x then return x

  @prefixParserAttributeOperator = (priority, leftAssoc) ->
    start = cursor
    if (x=parser.symbol()) and x.value=='?' and parser.follow('atom')
      {symbol:'?attribute', value: '?', priority: 800: start:cursor-1, stop:cursor, line:lineno}
    else cursor = start; return

  @customPrefixOperators = [@prefixParserAttributeOperator]
  @customPrefixOperator = (mode) ->
    for fn in parser.customPrefixOperators then if op = fn(mode) then return op
    return

  # prefix operator don't need to be compared to current global priority
  @prefixOperator = (mode) ->
    if op=parser.customPrefixOperator() then return op
    start = cursor; line1 = lineno
    token = parser.operatorLiteral()
    if not token then return
    space = bigSpc()
    if not text[cursor] then return rollback start, line1
    if parser.rightDelimiter() then return rollback start, line1
    if space.newline or space.undent then return rollback start, line1
    op = hasOwnProperty.call(prefixOperatorDict, token.value) and prefixOperatorDict[token.value]
    if not op then return rollback start, line1
    if space.indent
      if mode!='opExp' then return rollback start, line1
      if text[cursor]=='.' then error 'unnecessary "."'
      priInc = 300
    else
      if text[cursor]=='.' and text[cursor+1]!='.'
        if (space2=bigSpc()) and space2.value
          error 'unexpected spaces, new line or comment after "."'
        else if text[cursor+1]=='}' then return rollback start, line1
        else cursor++
      priInc = 600
    extend {}, op, {priority: op.priority+priInc}

  # ellipsis becomes more general
  @parameterEllipsisSuffix = (mode, x, priority) ->
    start = cursor
    if not (x=parser.symbol()) or (x.value!='...')  then cursor = start; return
    if (c=text[cursor])==',' or c==')'
      return {priority: 780, symbol:'x...'}
    else
      spc()
      if (c=text[cursor])==','
        rollback start, line1
        return extend {}, tkn0, {priority: 780, symbol:'x...'}
      else if c==')'
        return extend {}, tkn0, {priority: 780, symbol:'x...'}

  @customSuffixOperators = []   #@parameterEllipsisSuffix
  @customSuffixOperator = (mode, x, priority) ->
    for fn in parser.customSuffixOperators then if op = fn(mode, x, priority) then return op
    return

  # the current operator association is not needed by suffix operator
  @suffixOperator = (mode, x, priority) ->
    if not text[cursor] then return
    if op=parser.customSuffixOperator(mode, x, priority) then return op
    start = cursor; line1 = lineno
    space = bigSpc()
    if space.multiline or space.tailComment or space.concatLine then return rollback start, line1
    if space.value then (if priority>=600 then return rollback start, line1  else priInc = 300)
    else priInc = 600; if text[cursor]=='.' and text[cursor+1]!='.' and text[cursor+1]!='}' then cursor++
    token =parser.operatorLiteral()
    if not token then return rollback start, line1
    if (op=(hasOwnProperty.call(suffixOperatorDict, token.value) and suffixOperatorDict[token.value])) and op.priority+priInc>=priority
      if op.symbol=='x...' then parser.ellipsis = true
      return op
    return rollback start, line1

  rollback = (cur, line) -> cursor = cur; lineno = line; return
  rollbackToken = (token) -> cursor = token.start; lineno = token.line1 or token.line; return

  parser.clauseEnd = (space) ->
    start = cursor; line1 = lineno
    space = space or bigSpc()
    if (c=text[cursor])==','
      if not space.inline then error '"," should not be at the head of a line'
      cursor++; return true
    if parser.sentenceEnd(space) or c==';' then  rollbackToken space; return true

  parser.expressionEnd = (mode, space) ->
    if (not parser.isClauseExpression(mode)) then return
    (c=text[cursor])==':' and text[cursor+1]!=':'  or parser.clauseEnd(space)\
    or (mode=='comClExp' and space.value) or (mode=='inStrExp' and (c=="'" or c=='"'))

  parser.isClauseExpression = (mode) -> mode=='comClExp' or mode=='spClExp' or mode=='inStrExp'

  # don't use parser.symbol, parser.identifier, avoid destructured by user redefinition
  @operatorLiteral = ->
    if x=(symbol() or taijiIdentifier()) then x
    else if text[cursor] then {value:text[cursor++]}

  @binaryOperator = (mode, x, priority, leftAssoc) ->
    if not text[cursor] then return  # match compact expression in interpolated string, meet the end delimiter
    if op=parser.customBinaryOperator(mode, x, priority, leftAssoc) then return op
    start = cursor; line1 = lineno
    if parser.expressionEnd(mode, space1=bigSpc()) then return rollback start, line1
    if space1.indent or space1.newline then priInc = 0
    else if undentFromLine(line1) then return rollback start, line1
    else if space1.value then priInc = 300
    else if cursor==lineInfo[lineno].start+lineInfo[lineno].indentRow then priInc = 0
    else priInc = 600
    if priority>=priInc+300 then return rollback start, line1
    if priInc==600 and text[cursor]=='.'and text[cursor+1]!='.' and text[cursor+1]!='}' then cursor++ # meetDot = true;
    if parser.isClauseExpression() and text[cursor]==':' and text[cursor+1]!=':' then return rollback start, line1
    opToken = parser.operatorLiteral()
    if not opToken or not (op=(hasOwnProperty.call(binaryOperatorDict, opToken.value) and binaryOperatorDict[opToken.value]))
      return rollback start, line1
    if text[cursor]=='.'and text[cursor+1]!='.' and text[cursor+1]!='}'
      if priInc==300
        error 'unexpected "." after binary operator '+opToken.value+'which follow something like space, comment or newline'
      else cursor++
#      else if not meetDot
#        error 'unexpected "." after "'+opToken.value+'" which doese not follow "."'
    if parser.expressionEnd(mode, space2=bigSpc()) then return rollback start, line1
    if space2.undent then error 'unexpected undent after binary operator "'+opToken.value+'"'
    if not text[cursor] then error 'unexpected end of input, expect right operand after binary operator'
    if text[cursor]==')' then error 'unexpected ")"'
    if priInc==600
      if space2.value
        if op.value==',' then priInc = 300
        else if (c=text[cursor])==';' then error 'unexpected ;'
        else error 'unexpected spaces or new lines after binary operator "'+op.value+'" before which there is no space.'
      pri = op.priority+priInc
      if (leftAssoc and pri<=priority) or pri<priority then return rollback start, line1
      extend {}, op, {priority: pri}
    else if priInc==300
      pri = op.priority+priInc
      if space2.value
        if space2.undent then error 'unexpceted undent after binary operator '+op.value
        else if space2.newline then priInc = 0
        else if space1.indent
          priInc = 0; indentStart = cursor; indentLine = lineno
          indentExp = parser.recursiveExpression(cursor)(mode, 0, true)
          if  (space3=bigSpc()) and not space3.undent and text[cursor] and text[cursor]!=')'
            error 'expect an undent after a indented block expression'
          indentExp = {type: INDENT_EXPRESSION, value: indentExp, priority:1000}
          tag = 'expr('+mode+','+300+','+(0+!op.rightAssoc)+')'
          saveMemo tag, indentStart, indentExp
          cursor = indentStart
      else
        if mode=='opExp' then error 'binary operator '+op.symbol+' should have spaces at its right side.'
        else return rollback start, line1
      if (leftAssoc and pri<=priority) or pri<priority then return rollback start, line1
      extend {}, op, {priority: pri}
    # below must in operator expression (...) mode, not in clause mode.
    else
      if priority>300 then return rollback start, line1
      # any operator near newline always have the priority 300, i.e. compute from up to down
      if op.valu==',' or op.value==':' or op.value=='?'  or op.assign
        error 'binary operator '+op.symbol+' should not be at begin of line'
      if space2.undent then error 'binary operator should not be at end of block'
      else if space2.newline then error 'a single binary operator should not occupy whole line.'
      if space1.indent
        priInc = 0; indentStart = cursor; indentLine = lineno
        indentExp = parser.recursiveExpression(cursor)(mode, 0, true)
        if  (space3=bigSpc()) and not space3.undent and text[cursor] and text[cursor]!=')'
          error 'expect an undent after a indented block expression'
        indentExp = {type: INDENT_EXPRESSION, value: indentExp, priority:1000}
        tag = 'expr('+mode+','+300+','+(0+!op.rightAssoc)+')'
        saveMemo tag, indentStart, indentExp
        cursor = indentStart; lineno = indentLine
      extend {}, op, {priority: 300}

  @binaryPriority = (op, type) -> binaryOperatorDict[op].priority

  @followParenArguments = -> # use the private paren
    start = cursor; line1 = lineno
    x=paren()
    #always rollback, because just followParenArguments
    rollback start, line1; return  x

  @binaryCallOperator = (mode, x, priority, leftAssoc) ->
    start = cursor; line1 = lineno
    if (space=bigSpc()) and space.value and parser.followParenArguments()
      if mode=='opExp'
        throw '() as call operator should tightly close to the left caller'
      else rollback start, line1;  return
    else if 800>priority and parser.followParenArguments()
      return {symbol:'call()', type: SYMBOL, priority: 800, start:cursor, stop:cursor, line:lineno}
    return rollback start, line1

  @binaryMacroCallOperator = (mode, x, priority, leftAssoc) ->
    start = cursor; line1 = lineno
    space1=spc()
    if text[cursor]!='#' then return rollback start, line1
    cursor++; space2 = spc();
    if !!space2.value != !!space1.value and text[cursor]=='('
      error 'should have spaces on both or neither sides of symbol around "#"'
    if not parser.followParenArguments() then return rollback start, line1
    pri = space1.value? 500 : 800
    if pri<=priority then rollback start, line1
    return {symbol:'#()', type: SYMBOL, priority: 800, start:cursor, stop:cursor, line:lineno}

  @binaryIndexOperator = (mode, x, priority, leftAssoc) ->
    start = cursor; line1 = lineno
    if (space=bigSpc()) and space.value and follow('bracket')
      if mode=='opExp'
        throw '[] as subscript should tightly close to left operand'
      else rollback start, line1;  return
    else if 800>priority and follow('bracket')
      return {symbol:'index[]', type: SYMBOL, priority: 800, start:cursor, stop:cursor, line:lineno}
    rollback start, line1;  return

  @binaryAttributeOperator = (mode, x, priority, leftAssoc) ->
    start = cursor; line1 = lineno
    if (space=bigSpc()) and space.value
      if 500<=priority then return rollback start, line1
      if not (text[cursor]=='.' and text[cursor+1]!='.') then return rollback start, line1
      if text[cursor]=='}' then  return rollback start, line1
      cursor++
      if not (space2=bigSpc())
        error 'expect spaces after "." because there are spaces before it'
      else return {symbol:'attribute!', type: SYMBOL, priority: 500}
    else if 800>priority and (text[cursor]=='.' and text[cursor+1]!='.') and ++cursor
      if text[cursor]=='}' then  return rollback start, line1
      if (space=bigSpc()) and space.value
        error 'unexpected spaces after "." because there are no space before it'
      else if follow('symbol') then return
      else return {symbol:'attribute!', type: SYMBOL, priority: 800}
    return rollback start, line1

  @binaryAtThisAttributeIndexOperator = (mode, x, priority, leftAssoc) ->
    if 800<=priority or x.value!='@' then return
    if x.stop!=cursor then return
    if follow('jsIdentifier')
      {symbol:'attribute!', type: SYMBOL, start: cursor, stop:cursor, line: lineno, priority: 800}
    else if follow 'bracket'
      {symbol:'index!', type: SYMBOL, start: cursor, stop:cursor, line: lineno, priority: 800}

  @binaryPrototypeAttributeOperator = (mode, x, priority, leftAssoc) ->
    if 800<=priority then return
    if (x.type==IDENTIFIER or x.value=='@') and text[cursor...cursor+2]=='::' and text[cursor+2]!=':'
      {symbol:'attribute!', type: SYMBOL, start: cursor, stop:cursor, line: lineno, priority: 800}
    else if  text[cursor-3]!=':' and text[cursor-2...cursor]=='::'
      if followMatch (-> parser.recursiveExpression(cursor)(mode, 800, leftAssoc))
        {symbol:'attribute!', type: SYMBOL, start: cursor, stop:cursor, line: lineno, priority: 800}

  @customBinaryOperators = [@binaryAttributeOperator, @binaryCallOperator, @binaryMacroCallOperator, @binaryIndexOperator,
                            @binaryAtThisAttributeIndexOperator, @binaryPrototypeAttributeOperator]

  @customBinaryOperator = (mode, x, priority, leftAssoc) ->
    for fn in parser.customBinaryOperators then if op = fn(mode, x, priority, leftAssoc)  then return op
    return

  # any binary function can be used as binary exports, and the priority to be used actually is set here.
  @binaryFunctionPriority = 35

  @prefixExpression = (mode, priority) ->
    start = cursor; line1 = lineno
    # current global prority doesn't affect prefixOperator
    if op=parser.prefixOperator(mode)
      pri = if priority>op.priority then priority else op.priority
      x = parser.recursiveExpression(cursor)(mode, pri, true)
      if x then extend makeOperatorExpression('prefix!', op, x), {start:start, stop:cursor, line1:line1, line:lineno}

  @recursiveExpression = recursive = (start) ->
    x = null; line1 = lineno
    expression = (mode, priority, leftAssoc) ->
      tag = 'expr('+mode+','+priority+','+(0+leftAssoc)+')'
      if not (m=memoMap[tag]) then m = memoMap[tag] = {}
      else if result=m[start] then cursor = result.stop; lineno = result.line; return result
      if not x
        if not x = parser.prefixExpression(mode, priority)
          if not x = parser.atom(mode) then memoMap[tag][start] = null; return
      if op = parser.suffixOperator(mode, x, priority)
        x = extend makeOperatorExpression('suffix!', op, x), {start:start, stop:cursor, line1:line1, line:lineno}
        # the priority and association of suffix operator does not affect the following expression
        # return expression(mode, priority, leftAssoc)
      binStart = cursor; binLine = lineno
      if op = parser.binaryOperator(mode, x, priority, leftAssoc)
        if y = recursive(cursor)(mode, op.priority, not op.rightAssoc)
          x = extend makeOperatorExpression('binary!', op, x, y), {start:start, stop:cursor, line1:line1, line:lineno}
          return expression(mode, priority, leftAssoc)
        else rollback binStart, binLine
      m[start] = x

  # the priority of operator vary from 0 to 300,
  # if there is no space between them, then add 600, if there is spaces, then add 300.
  # if meet newline, add 0.
  @operatorExpression = operatorExpression = -> parser.recursiveExpression(cursor)('opExp', 0, true)
  # compact expression as clause item.
  @compactClauseExpression = -> parser.recursiveExpression(cursor)('comClExp', 600, true)
  # space expression as clause item.
  @spaceClauseExpression = spaceClauseExpression = -> parser.recursiveExpression(cursor)('spClExp', 300, true)
  # interpolate expression embedded in string
  @interpolateExpression = -> parser.recursiveExpression(cursor)('inStrExp', 600, true)

  @isIdentifier = isIdentifier = (item) -> item.type==IDENTIFIER

  @itemToParameter = itemToParameter = (item) ->
    if item.type==IDENTIFIER then return item
    else if item0=item[0]
      if item0=='attribute!' and item[1].value=='@' then return item
      else if item0.symbol=='x...'
        parser.meetEllipsis = item[1].ellipsis = true
        return item
      else if entity(item0)=='=' # default parameter
        # default parameter should not be ellipsis parameter at the same time
        # and this is the behavior in coffee-script too
        # and (item01[0].symbol!='x...' or not isIdentifier(item01[1]).type==IDENTIFIER)
        if (item1=item[1]) and item1.type==IDENTIFIER then return item
        else if ((item10=item1[0]) and item10=='attribute!' and item1[1].value=='@') then return item
        else return
      # for dynamic parser and writing macro
      else if item0.symbol=='unquote!' or item0.symbol=='unquote-splice'
        return item

  @toParameters = toParameters = (item) ->
    if not item then return []
    if x=itemToParameter(item) then return [x]
    else if item[0]==','
      result = for x in item[1...]
        if not(param=itemToParameter(x)) then meetError = true; break
        if param.ellipsis
          if meetEllipsis then meetError = true; break
          else meetEllipsis = true
        param
      if not meetError then result

  evalWhileParsing = (clause) ->
    new Function('__$taiji_$_$parser__', compileExp(['return',clause], environment))(parser)

  # the head of expression will be convert to attribute of __$taiji_$_$parser__
  evalParserAttribute = (clause) ->
    code=compileExp(['return', ['?/', clause]], environment)
    new Function('__$taiji_$_$parser__', code)(parser)

  evalParserExpression = (clause) ->
    code=compileExp(['return', ['?!', clause]], environment)
    new Function('__$taiji_$_$parser__', code)(parser)

  leadWordClauseMap =
    '??':  evalWhileParsing
    '?/':  evalParserAttribute
    '?!':  evalParserExpression
    '~':  (clause) -> ['quote!', clause]
    '`':  (clause) -> ['quasiquote!', clause]
    '^':  (clause) -> ['unquote!', clause]
    '^&': (clause) -> ['unquote-splice', clause]
    '#':  (clause) -> ['#', clause]
    '##':  (clause) -> ['##', clause]
    '#.': (clause) -> ['#.', clause]

  @leadWordClause = ->
    start = cursor; line1 = lineno
    if not (key = parser.symbol() or parser.identifier()) then return
    if (space=spc()) and (not space.value or space.undent) then return rollback start, line1
    if not (fn=leadWordClauseMap[key.value]) then return rollback start, line1
    clause = fn(parser.clause())
    if clause and typeof clause=='object'
      extend clause, {start:start, stop:cursor, line1:line1, line:lineno}
    else extend {value:clause}, {start:start, stop:cursor, line1:line1, line:lineno}

  @labelStatement = ->
    start = cursor; line1 = lineno
    if not (lbl=parser.jsIdentifier()) then return
    if text[cursor]!='#' then cursor = start; return
    cursor++
    if (space=bigSpc()) and (not space.value or space.undent or space.newline)  then cursor = start; return
    if clause=parser.clause() then clause = ['label!', lbl, clause]
    else clause = ['label!', lbl, '']
    extend clause, {start:start, stop:cursor, line1:line1, line:lineno}

  @conjunction = ->
    start = cursor
    if (x=symbol() or taijiIdentifier()) and isConj(x) then return x
    cursor = start; return

  @expectIndentConj = expectIndentConj = (word, line1, isHeadStatement, options, clauseFn) ->
    start2 = cursor; line2 = lineno
    if options.optionalClause? then optionalClause = options.optionalClause
    else optionalClause = word!='then'
    if options.optionalWord? then optionalWord = options.optionalWord
    else optionalWord = word=='then'
    indentRow = lineInfo[line1].indentRow
    space = bigSpc(); row = lineInfo[lineno].indentRow
    if row==indentRow and lineno!=line1 and not isHeadStatement
      if not optionalClause
        error 'meet new line, expect inline keyword "'+word+'" for inline statement'
      else rollbackToken space; return
    if row<indentRow
      if not optionalClause then error 'unexpected undent, expect '+word
      else rollbackToken space; return
    else if row>indentRow
      if options.indentRow
        if row!=options.indentRow then error 'unconsistent indent'
      else options.indentRow = row
    w = taijiIdentifier()
    meetWord = w and w.value==word
    if not meetWord
      if isConj(w)
        if optionalClause then rollbackToken space; return
        else  error 'unexpected '+w.value+', expect '+word+' clause'
      else if (not optionalWord and not optionalClause) or (
          not optionalClause and optionalWord and space.inline)
        error 'expect keyword '+word
      else if not optionalWord then return rollbackToken space
      else if optionalClause then return rollbackToken space
    if not meetWord then rollback start2, line2
    clauseFn()

  conjClause = (conj, line1, isHeadStatement, options) ->
    begin(expectIndentConj conj, line1, isHeadStatement, options, parser.lineBlock)

  thenClause  = (line1, isHeadStatement, options) -> conjClause 'then', line1, isHeadStatement, options
  elseClause  = (line1, isHeadStatement, options) -> conjClause 'else', line1, isHeadStatement, options
  finallyClause  = (line1, isHeadStatement, options) -> conjClause 'finally', line1, isHeadStatement, options
  catchClauseOfTryStatement = (line1, isHeadStatement, options) ->
    expectIndentConj 'catch', line1, isHeadStatement, options, ->
      line2 = lineno; spc(); atStatementHead = false
      catchVar = parser.identifier(); spc(); then_ = thenClause(line2, false, {})
      [catchVar, then_]

  caseClauseOfSwitchStatement = (line1, isHeadStatement, options) ->
    expectIndentConj 'case', line1, isHeadStatement, options, ->
      line2 = lineno; spc(); atStatementHead = false
      exp = parser.compactClauseExpression()
      #if exp.isBracket then exp.shift()
      if exp[0]!='list!' then exp = ['list!', exp]
      spc(); expectChar(':', 'expect ":" after case values')
      body = parser.block() or parser.lineBlock()
      [exp, begin(body)]

  @keyword = ->
    start = cursor
    if (x=symbol() or taijiIdentifier()) and isKeyword(x) then return x
    cursor = start; return

  # if test then action else action
  keywordThenElseStatement = (keyword) -> (isHeadStatement) ->
    line1 = lineno; spc()
    if not (test = parser.clause())? then error 'expect a clause after "'+keyword+'"'
    then_ = thenClause(line1, isHeadStatement, options={}); else_ = elseClause(line1, isHeadStatement, options)
    if else_ then [keyword, test, then_, else_]
    else [keyword, test, then_]

  # while! test body...
  keywordTestExpressionBodyStatement = (keyword) -> (isHeadStatement) ->
    line1 = lineno; spc()
    if not (test = parser.compactClauseExpression())
      error 'expect a compact clause expression after "'+keyword+'"'
    if not (body = parser.lineBlock()) then error 'expect the body for while! statement'
    [keyword, test, begin(body)]

  # throw or return value
  throwReturnStatement = (keyword) -> (isHeadStatement) ->
    spc(); if text[cursor]==':' and text[cursor+1]!=':' then cursor++; spc();
    if clause = parser.clause() then [keyword, clause] else [keyword]

  # break; continue
  breakContinueStatement = (keyword) -> (isHeadStatement) ->
    spc()
    if lbl = jsIdentifier() then [keyword, lbl] else [keyword]

  letLikeStatement = (keyword) -> (isHeadStatement) ->
    line1 = lineno; spc()
    varDesc = parser.varInitList() or parser.clause()
    [keyword, varDesc, thenClause(line1, isHeadStatement, {})]

  # no cursor and lineno is attached in result, so can not be memorized directly.
  @identifierLine = ->
    result = []
    while spc() and not parser.lineEnd() and not follow('newline') and text[cursor]!=';'
      if x=parser.identifier() then result.push x
      else error 'expect an identifier'
    result

  # no cursor and lineno is attached in result, so can not be memorized directly.
  @identifierList = ->
    line1 = lineno; indentRow = lineInfo[line1].indentRow
    result = parser.identifierLine()
    space = bigSpc();
    if (row0=lineInfo[lineno].indentRow)<=indentRow
      rollbackToken space; return result
    if text[cursor]==';' then return result
    while varList=parser.identifierLine()
      result.push.apply result, varList
      space = bigSpc()
      if (row=lineInfo[lineno].indentRow)<=indentRow then rollbackToken space; break
      else if row!=row0 then error 'inconsistent indent of multiple identifiers lines after extern!'
      if text[cursor]==';' then break
    result

  @varInit = ->
    if not (id = parser.identifier()) then return
    spc()
    if text[cursor]=='=' and cursor++
      if value=parser.block() then value = begin(value)
      else if not(value=parser.clause()) then error 'expect a value after "=" in variable initilization'
    spc()
    if text[cursor]==',' then cursor++
    if not value then return id else return [id, '=', value]

  @varInitList = ->
    start = cursor; line1 = lineno; result = []
    indentRow0 = lineInfo[lineno].indentRow
    space = bigSpc()
    row = lineInfo[lineno].indentRow
    if row>indentRow0 then indentRow1 = row
    else if space.undent or space.newline then error 'unexpected new line, expect at least one variable in var statement'
    while 1
      if x=parser.varInit() then result.push x
      else break
      space1 = bigSpc()
      row = lineInfo[lineno].indentRow
      if not text[cursor] or text[cursor]==';' or follow 'rightDelimiter' then break
      if lineno==line1 then continue
      if row>indentRow0
        if indentRow1 and row!=indentRow1 then error 'unconsitent indent in var initialization block'
        else if not indentRow1 then indentRow1 = row
      else if row==indentRow0 then break
      else rollbackToken space1
    # if not result.length then error 'expect at least one variable in var statement'
    if not result.length then rollback start, line1; return
    return result

  @useItem = ->
    if (c=text[cursor])=='#' then cursor++; meta = 'meta'; spc()
    if (x=follow('jsIdentifier')) and x.value=='from'
      if meta
        error 'keyword "from" should not follow "#" immediately in use! statement, expect variable name instead'
      else return
    else if text[cursor]=="'" or text[cursor]=='"'
      if meta
        error 'file path should not follow "#" immediately in use! statement, expect variable name instead'
      return
    name = expectIdentifier(); spc();
    if (as_=taijiIdentifier())
      if as_.value!='as' then error 'unexpected word '+as_.value+', expect "as", "," or "from [module path...]"'
      else spc(); asName = expectIdentifier(); spc()
    [name, asName, meta]

  @exportItem = ->
    if (c=text[cursor])=='#' then cursor++; meta = 'meta'; spc()
    if meta then name = expectIdentifier()
    else if not (name = taijiIdentifier()) then return
    spc()
    if text[cursor]=='=' and cursor++
      spc(); value = parser.spaceClauseExpression(); spc()
    [name, value, meta]

  @spaceComma = spaceComma = -> spc(); if text[cursor]==',' then cursor++; spc(); return true
  @seperatorList = seperatorList = (item, seperator) ->
    if typeof item=='string' then item = parser[item]
    ->
      result = []
      while x=item()
        result.push x
        if seperator() then continue
        else break
      result

  @useItemList = seperatorList('useItem', spaceComma)
  @exportItemList = seperatorList('exportItem', spaceComma)

  @expectIdentifier = expectIdentifier = (message) ->
    if id=parser.identifier() then return id
    else error message or 'expect identifier'

  @expectOneOfWords = expectOneOfWords = (words...) ->
    spc(); token = taijiIdentifier();
    if not token then error 'expect one of the words: '+words.join(' ')
    value = token.value; i = 0; length = words.length;
    while i<length then (if value==words[i] then return words[i] else i++)
    error 'expect one of the words: '+words.join(' ')

  maybeOneOfWords = (words...) ->
    spc(); token = taijiIdentifier();
    if not token then return
    value = token.value; i = 0; length = words.length;
    while i<length then (if value==words[i] then return words[i] else i++)
    return
  expectWord = (word) -> spc(); (if not (token=taijiIdentifier()) or token.value!=word then error 'expect '+ word); word
  word = (w) ->
    start = cursor; line1 = lineno; spc()
    if not token=taijiIdentifier() then return
    if token.value!=w then return rollback(start, line1)
    return token

  @expectChar = expectChar = (c) -> if text[cursor]==c then cursor++ else error 'expect "'+c+'"'

  @keywordToStatementMap =
    '?': (isHeadStatement) ->
      if not spc().value then return
      line1 = lineno
      ['?', parser.lineBlock(), thenClause(line1, isHeadStatement, {})]

    'break': breakContinueStatement('break')
    'continue': breakContinueStatement('continue')
    'throw': throwReturnStatement('throw')
    'return': throwReturnStatement('return')
    'new': throwReturnStatement('new')

    'var': (isHeadStatement) -> ['var'].concat parser.varInitList()
    'extern!': (isHeadStatement) -> ['extern!'].concat parser.identifierList()
    'include!': (isHeadStatement) ->
      spc()
      if with_ = word('with')
        spc(); parseMethod = expect('taijiIdentifier', 'expect a parser method')
      spc(); filePath = expect('string', 'expect a file path')
      ['include!', filePath, parseMethod]
    'use!': (isHeadStatement) ->
      spc()
      if with_ = word('with')
        spc(); parseMethod = expect('taijiIdentifier', 'expect a parser method')
      items = parser.useItemList(); spc()
      if items.length then from_ = expectWord('from') # or items[0][2]
      else from_ = word('from')
      #if not from_ then return ['use!', names[0][0], names[0][1], []]
      spc(); srcModule = parser.compactClauseExpression(); spc();
      if as_ = literal('as')
        spc()
        alias = expectIdentifier('expect an alias after "as" for module')
      ['use!'].concat [srcModule, alias, parseMethod, items]
    'export!': (isHeadStatement) -> spc(); ['export!'].concat parser.exportItemList()

    'let': letLikeStatement('let')
    'letrec!': letLikeStatement('letrec!')
    'letloop!': letLikeStatement('letloop!')
    'if': keywordThenElseStatement('if')
    'while': keywordThenElseStatement('while')
    'while!': keywordTestExpressionBodyStatement('while!')

    'for': (isHeadStatement) ->
      line1 = lineno; spc()
      if text[cursor]=='(' and cursor++
        init = parser.clause(); spc(); expectChar(';')
        test = parser.clause(); spc(); expectChar(';')
        step = parser.clause(); spc(); expectChar(')')
        return ['cFor!', init, test, step, thenClause(line1, isHeadStatement, {})]
      name1 = expectIdentifier(); spc()
      if text[cursor]==',' then cursor++; spc()
      if (token=jsIdentifier()) and value=token.value
        if value=='in' or value=='of' then inOf = value
        else name2 = value; spc(); inOf = expectOneOfWords('in', 'of')
        spc(); list = parser.clause()
      if inOf=='in' then kw = 'forIn!!' else kw = 'forOf!!'
      [kw, name1, name2, list, thenClause(line1, isHeadStatement, {})]

    'do': (isHeadStatement) ->
      line1 = lineno; spc(); indentRow = lineInfo[lineno].indentRow
      body = parser.lineBlock()
      if newlineFromLine(line1) and not isHeadStatement then return body
      if not (conj=maybeOneOfWords('where', 'when', 'until'))
        error 'expect conjunction where, when or until'
      if conj=='where' then tailClause = parser.varInitList()
      else tailClause = parser.clause()
      if conj=='where' then ['let', tailClause, body]
      else if conj=='when' then ['doWhile!', body, tailClause]
      else ['doWhile!', body, ['!x', tailClause]]

    'switch': (isHeadStatement) ->
      line1 = lineno
      if not (test = parser.clause()) then error 'expect a clause after "switch"'
      options = {}; cases = ['list!']
      while case_=caseClauseOfSwitchStatement(line1, isHeadStatement, options) then cases.push case_
      else_ = elseClause(line1, isHeadStatement, options)
      ['switch', test, cases, else_]

    'try': (isHeadStatement) ->
      line1 = lineno;
      if not (test = parser.lineBlock()) then error 'expect a line or block after "try"'
      if atStatementHead and not isHeadStatement
        error 'meet unexpected new line when parsing inline try statement'
      options = {}; catchClauses = ['list!']
      while catch_=catchClauseOfTryStatement(line1, isHeadStatement, options) then catchClauses.push catch_
      else_ = elseClause(line1, isHeadStatement, options); final = finallyClause(line1, isHeadStatement, options)
      ['try', begin(test), catchClauses, else_, final]

    'class': (isHeadStatement) ->
      spc()
      if parser.conjunction('extends') then spc(); superClass = parser.identifier(); spc()
      else supers = []
      body = parser.lineBlock()
      ['class', superClass].concat body

  @statement = memo ->
    start = cursor; line1 = lineno
    if not (keyword = symbol() or taijiIdentifier()) then return
    if stmtFn = parser.keywordToStatementMap[keyword.value]
      isHeadStatement = atStatementHead; atStatementHead = false
      if stmt = stmtFn(isHeadStatement)
        return extend stmt, {start:start, stop:cursor, line1:line1, line:lineno}
    return rollback start, line1

  @defaultAssignLeftSide = memo ->
    start = cursor; line1 = lineno
    if not (x=parser.spaceClauseExpression()) then return
    if x.type==PAREN or x.type==BRACKET or x.type==DATA_BRACKET or x.type==CURVE
      rollback start, line1; return
    x = getOperatorExpression x
    if not x then  rollback start, line1; return
    if x.type==IDENTIFIER or ((e=entity(x)) and (e[0]=='attribute!' or e[0]=='index!')) then x
    else if parser.isAssign(x[0]) then rollback x[1].stop, x[1].line; return x[1]
    else  rollback start, line1; return

  @isAssign = (val) -> (op=binaryOperatorDict[val]) and op.assign

  @defaultAssignSymbol = -> (x=parser.symbol()) and parser.isAssign(x.value) and x

  @defaultAssignRightSide = memo ->
    space2 = bigSpc()
    if space2.undent then error 'unexpected undent after assign symbol'+symbol.value
    else if space2.newline then error 'unexpected new line after assign symbol'+symbol.value
    parser.block() or parser.clause()

  @makeAssignClause = (assignLeftSide, assignSymbol, assignRightSide) -> ->
    start = cursor; line1 = lineno
    if not (left=assignLeftSide()) then return
    space = spc()
    if not (token=assignSymbol()) then return rollback start, line1
    right = assignRightSide(space)
    extend [token, left, right], {start:start, cursor:cursor, line1:line1, line:lineno}

  @defaultAssignClause = @makeAssignClause @defaultAssignLeftSide, @defaultAssignSymbol, @defaultAssignRightSide

  @customAssignClauses = []

  @assignClause = memo ->
    for matcher in parser.customAssignClauses then if x=matcher() then return x
    parser.defaultAssignClause()

  @colonClause = memo ->
    start = cursor; line1 = lineno
    if not (head = parser.sequenceClause()) then return
    if not head.push then head = [head]
    spc()
    if (x=parser.symbol()) and x.value==':'
      space = bigSpc()
      if space.newline then error '":" should not before a new line'
      else if space.undent then error '":" should not be before undent'
      else if space.indent then return rollback start, line1
      head.push.apply head, parser.clauses()
      head.stop = cursor; head.line = lineno
      head
    else return rollback start, line1

  @indentClause = memo ->
    start = cursor; line1 = lineno
    if not (head=parser.sequenceClause()) then return
    space = bigSpc(); if not space.indent then return rollback start, line1
    if parser.lineEnd() then return rollback start, line1
    if not (blk=parser.blockWithoutIndentHead()) then return rollback start, line1
    if not head.push then head = [head]; head.start = start; head.line1 = line1
    head.push.apply head, blk
    extend head, {stop:cursor, line:lineno}

  @macroCallClause = memo ->
    start = cursor; line1 = lineno
    if (head=parser.compactClauseExpression())
       if (space1=spc()) and not space1.value then return rollback(start, line1)
       if text[cursor]=='#' and cursor++ and ((space=spc()) and space.value or text[cursor]=='\n' or text[cursor]=='\r')
          if blk = parser.block()
            return extend ['#call!', head, blk], {cursor:start, line1:lineno, stop:cursor, line:lineno}
          else if args = parser.clauses()
            return extend ['#call!', head, args], {cursor:start, line1:lineno, stop:cursor, line:lineno}
    rollback(start, line1)

  @unaryExpressionClause = memo ->
    start = cursor; line1 = lineno
    if (head=parser.compactClauseExpression()) and spc() and (x=parser.spaceClauseExpression()) and parser.clauseEnd()
      if text[cursor]==',' then cursor++
      return extend [getOperatorExpression(head), getOperatorExpression(x)], {start:start, stop:cursor, line1:line1, line:lineno}
    return rollback start, line1

  @expressionClause = memo ->
    start = cursor; line1 = lineno
    if (x=parser.spaceClauseExpression())
      if parser.clauseEnd() then return getOperatorExpression x
      else return rollback start, line1

  @defaultParameterList = ->
    if item=getOperatorExpression(paren(item))
      if params=parser.toParameters(item) then return params
      else
        if followSequence('inlineSpaceComment', 'defaultSymbolOfDefinition')
          error 'illegal parameters list for function definition'
        else rollbackToken item

  @defaultSymbolOfDefinition = ->
    if (x=parser.symbol())
      if (xValue=x.value) and xValue[0]!='\\' and ((xTail=xValue[xValue.length-2...])=='->' or xTail=='=>') then return x
      else rollbackToken(x)

  # a = -> x; b = -> y should be [= a [-> x [= b [-> y]]]]
  @defaultDefinitionBody = -> parser.lineBlock() or []

  @makeDefinition = (parameterList, symbolOfDefinition, definitionBody) -> memo ->
    start = cursor; line1 = lineno
    if not (parameters=parameterList()) then parameters = []
    spc()
    if not (token=symbolOfDefinition()) then return rollback start, line1
    spc()
    body = definitionBody()
    extend [token, parameters, body], {start:start, stop:cursor, line1:line1, line:lineno}

  @defaultDefinition = @makeDefinition @defaultParameterList, @defaultSymbolOfDefinition, @defaultDefinitionBody

  @customDefinition = []

  @definition = memo ->
    for matcher in parser.customDefinition
      if x=matcher() then break
    if x or (x=parser.defaultDefinition()) then return x

  @clauseItem = ->
    start = cursor; line1 = lineno; space = bigSpc()
    if not space.inline then rollbackToken space; return
    if parser.clauseEnd() then return
    if text[cursor]==':' and text[cursor+1]!=':' then return
    if (item=parser.definition()) then return item
    item = parser.compactClauseExpression()
    if item then return extend getOperatorExpression(item), {start:start, stop:cursor, line1:line1, line:lineno}

  @sequenceClause = memo ->
    start = cursor; line1 = lineno; clause = []
    while item = parser.clauseItem() then clause.push item
    if text[cursor]==',' then meetComma = true; cursor++
    if not clause.length and not meetComma then return
    extend clause, {start:start, stop:cursor, line1:line1, line:lineno}

  @customClauseList = ['statement','labelStatement',
    'leadWordClause', 'assignClause', 'colonClause', 'macroCallClause', 'indentClause',
    'expressionClause', 'unaryExpressionClause']

  @clause = memo ->
    start = cursor; line1 = lineno
    if (parser.clauseEnd()) then return
    for matcher in parser.customClauseList
      if x=parser[matcher]() then return x
    if not(clause = parser.sequenceClause()) then return
    if clause.length==1 then clause = clause[0]
    if typeof clause != 'object' then clause = {value: clause}
    extend clause, {start:start, stop:cursor, line1:line1, line:lineno}

  @clauses = -> result = []; (while clause=parser.clause() then result.push clause); return result

  @sentenceEnd = (space) ->
    space=space or bigSpc()
    if parser.lineEnd() then return true
    if not space.inline then rollbackToken(space); return true

  @sentence = memo ->
    start = cursor; line1 = lineno
    if parser.sentenceEnd() then return
    if text[cursor]==';' then cursor++; return []
    extend parser.clauses(), {start:start, stop:cursor, line1:line1, line:lineno}

  @lineCommentBlock = memo ->
    start = cursor
    if comment=parser.lineComment()
      if comment.indent then parser.blockWithoutIndentHead()
      else [extend(['lineComment!', '"'+text[start...cursor]+'"'], {start:start, stop:cursor, line: lineno})]

  @codeCommentBlockComment = memo ->
    if cursor!=lineInfo[lineno].start+lineInfo[lineno].indentRow then return
    if text[cursor]!='/' then return
    if (c=text[cursor+1])=='.' or c=='/' or c=='*' then return
    start = cursor; line1 = lineno; cursor++
    code = parser.lineBlock()
    extend [['codeBlockComment!', code]], {start:start, stop:cursor, line1: line1, line: lineno}

  @lineEnd = -> not text[cursor] or follow('conjunction') or follow('rightDelimiter')#  \
   # or (space=follow('spaceComment') and not space.inline)

  @line = ->
    if parser.lineEnd() then return
    if x=(parser.lineCommentBlock() or parser.codeCommentBlockComment()) then return x
    result = []
    while x = parser.sentence() then result.push.apply result, x
    memoMap = {}
    result

  @block = ->
    indentRow = lineInfo[lineno].indentRow; space = bigSpc();
    if not space.indent then return rollbackToken space
    else
      x = parser.blockWithoutIndentHead()
      space = bigSpc()
      if lineInfo[lineno].indentRow<indentRow then rollbackToken space
      x

  @blockWithoutIndentHead = ->
    indentRow = lineInfo[lineno].indentRow; result = []
    while (x=parser.line()) and (space = bigSpc())
      if x.length!=1 or not (x0=x[0]) or (x0[0]!='lineComment!' and x0[0]!='codeBlockComment!')
        result.push.apply(result, x)
      if lineInfo[lineno].indentRow<indentRow then rollbackToken space; break
    result

  @lineBlock = ->
    start = cursor; line1 = lineno; indentRow = lineInfo[lineno].indentRow
    space1 = bigSpc(); if space1.indent then return parser.blockWithoutIndentHead()
    line = parser.line()
    cursor2 = cursor; line2 = lineno;
    bigSpc(); row = lineInfo[lineno].indentRow
    if row<=indentRow then rollback cursor2, line2
    else line.push.apply line, parser.blockWithoutIndentHead()
    line

  processDataBracetResult = (items) ->
    if items.length==0 then return items
    else if items.length==1 then return items[0]
    else ['list!'].concat(items)

  @dataClause = ->
    if (parser.clauseEnd(space = bigSpc())) then return
    clause = []
    while 1
      if text[cursor]==':' and text[cursor+1]!=':' then error 'unexptected ";" in data block'
      if text[cursor]==',' then cursor++; break
      if item = parser.spaceClauseExpression() then clause.push getOperatorExpression(item)
      else if sym = parser.symbol() then clause.push sym
      if parser.clauseEnd() then break
    processDataBracetResult(clause)

  @dataClauses = -> result = []; (while clause=parser.dataClause() then result.push clause); return result

  @dataSentence = ->
    if parser.sentenceEnd() then return
    if text[cursor]==';' then cursor++; return []
    processDataBracetResult parser.dataClauses()

  @dataLineEnd = -> (not text[cursor] or follow('rightDelimiter'))

  @basicDataLine = ->
    if parser.dataLineEnd() then return
    result = []
    while x = parser.dataSentence() then result.push x # don't push.apply, because will do it in transform
    processDataBracetResult result

  @dataBlock = ->
    indentRow = lineInfo[lineno].indentRow; result = []
    space = bigSpc()
    # had better to check indent before call dataBlock
    # space.indent is a wrong check, because it will ignore half dent wrongly.
    #if not space.indent then return rollbackToken space
    while (x=parser.dataLine()) and (space = bigSpc())
      result.push(x)
      if lineInfo[lineno].indentRow<indentRow then rollbackToken space; break
    result

  @dataLine = ->
    line1 = lineno; indentRow = lineInfo[lineno].indentRow
    result = parser.basicDataLine()
    if lineInfo[lineno].indentRow>indentRow then result.concat parser.dataBlock()
    result

  @lines = ->
    indentRow = lineInfo[lineno].indentRow; result = []
    while (x=parser.line()) and (space = bigSpc())
      result.push.apply result, x
      if lineInfo[lineno].indentRow<indentRow then rollbackToken space; break
    result

  @moduleHeader = ->
    if not (literal('taiji') and spaces()  and  literal('language') and spaces() and
        (x=decimal()) and char('.') and (y=decimal()))
      error 'taiji language module should begin with "taiji language x.x"'
    if (x=x.value)!=0 or (y=y.value)!=1 then error 'taiji 0.1 can not process taiji language'+x+'.'+y
    lineno = 2
    while lineno<=maxLine and (lineInfo[lineno].indentRow>0 or lineInfo[lineno].empty) then lineno++
    if lineno>maxLine then cursor = text.length
    else cursor = lineInfo[lineno].start # lineInfo[lineno].indentRow = 0
    {type: MODULE_HEADER, version: {main:x, minor:y}, text: text[...cursor]}

  @moduleBody = ->
    body = parser.lines()
    if text[cursor] then error 'expect end of input, but meet "'+text.slice(cursor)+'"'
    begin body

  @module = ->
    header = parser.moduleHeader()
    {type: MODULE, header:header, body:parser.moduleBody()}

  @indentFromLine = indentFromLine = (line1) -> lineInfo[lineno].indentRow>lineInfo[line1].indentRow
  @undentFromLine = undentFromLine = (line1) -> lineInfo[lineno].indentRow<lineInfo[line1].indentRow
  @sameIndentFromLine = sameIndentFromLine = (line1) -> lineInfo[lineno].indentRow==lineInfo[line1].indentRow
  @newlineFromLine = newlineFromLine = (line1) -> lineno!=line1 and lineInfo[lineno].indentRow==lineInfo[line1].indentRow
  @getRow = -> cursor-lineInfo[lineno].start

  @preparse = ->
    i = 0; line = 1; row = 0; parser.lineInfo = lineInfo = [{start:-1, empty:true, indentRow:0}, {start:0}]
    atLineHead = true; diffSpace = undefined; lineHeadChar = undefined
    indentStack = [0]; indentLine = 0; indentRow = 0; indentStackIndex = 0
    while c=text[i]
      if c=='\n' and ++i
        lineInfo.push {}
        if atLineHead
          lineInfo[line].empty = true
          lineInfo[line].indentRow = row
        if text[i]=='\r'then i++
        lineInfo[++line].start = i; row = 0; atLineHead = true
      else if c=='\r' and ++i
        lineInfo.push {}
        if atLineHead
          lineInfo[line].empty = true
          lineInfo[line].indentRow = row
        if text[i]=='\n' then i++
        lineInfo[++line].start = i; row = 0; atLineHead = true
      else
        if atLineHead
          if c==' ' or c=='\t'
            if lineHeadChar
              if lineHeadChar!=c then diffSpace = row
            else lineHeadChar = c
          else if diffSpace
            error i+'('+line+':'+diffSpace+'): '+'unconsistent space or tab character in the head of a line'
          else
            lineInfo[line].indentRow = row; atLineHead = false
            if row>indentRow
              lineInfo[line].indent = indentLine
              indentStack.push indentLine=line
              indentRow = row
              indentStackIndex++
            else if row==indentRow
              lineInfo[line].prevLine = indentLine
              indentStack[indentStackIndex] = indentLine = line
              if indentStackIndex>1 then lineInfo[line].indent = indentStack[indentStackIndex-1]
            else
              while row<indentRow
                prevIndentLine = indentStack[indentStackIndex]
                indentStack.pop(); --indentStackIndex
                indentRow = lineInfo[indentStack[indentStackIndex]].indentRow
              lineInfo[line].undent = prevIndentLine
              if row==indentRow
                 lineInfo[line].prevLine = indentStack[indentStackIndex]
              else
                 lineInfo[line].indent = indentStack[indentStackIndex]
                 indentStack.push line
                 indentRow = row
                 indentStackIndex++
              indentLine = line
        i++; row++
    lineInfo.push {indentRow:0, start:text.length}
    maxLine = line
    return

  @init = (data, cur, env) ->
    @text = text = data; cursor = cur; lineno = 1 # lineno start from 1, line 0 is a placeholder
    memoMap = {}
    atStatementHead = true
    @environment = environment = env
    @meetEllipsis = false

  @parse = (data, root, cur, env) ->
    parser.init(data, cur, env)
    parser.preparse()
    root()

  @error = error = (message) ->
    throw cursor+'('+lineno+':'+parser.getRow()+'): '+message+': \n'+text[cursor-40...cursor]+'|   |'+text[cursor...cursor+40]

  return @