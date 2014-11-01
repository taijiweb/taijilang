lib = '../lib/'
{constant, isArray, str} = require lib+'parser/base'
{NEWLINE, INDENT, SPACE} = constant

exports.matchRule = (parser, rule) -> ->
  token = parser.matchToken()
  if token.type==NEWLINE then parser.matchToken()
  if token.type==SPACE then parser.matchToken()
  rule()