2014
2014-11
  11-1 for statement, var initialization, if-then, while-else, try-catch
  11-2 
    switch-case, let, parser.line, label
    pass 472 tests, only letloop!, import!, export! do not be tested.

2014-10
  10-20
    interpolate string that starts with $: identifier.identifier...identifier
    interpolate string that starts with $: identifier.identifier...identifier
    can not use matchToken in string, so use a simpler definition.
  10-14
    pass more tests of expression
  10-13 
    compact clause expression pass several tests: a.b.c, `.^1

2014-9
  9-28->10-1
  refactor parser for better performace and better design
  space token under new lexical analysis and parser based on token

  it's coded that the framework of new lexical analysis and parser based on token
  space token and pass some tests

  9-1: 
    regexp: /.../  --> /!.../
    parse {} as [hash!]

2014-8
  8-19-8-31 personal private affairs
  8-10 -> 8-18 the definitive guide to taiji language -- taiji zhenjing
  8-5
    ? clause then body
    more preprocess clause
  8-4
    transform string to symbol by escaping it. e.g.: \"x...", \"...x", \"..."

2014-7
  7-31
    ":" at the end of line can replace 'then'
    embedded meta compilation: #call, by evaluating the embedded meta code while running
  7-30
    refactor definition ->, =>, etc,  now they produces [->, [params], oneStatement], instead of statement list
    ellipsis subscript: a[1..3]; b[1...4]; a[...], a[..], x = a[..5]; x = a[...5]
    \ lead symbol to escape it, e.g. \=, \+=, \>>, \/, etc, useful to write macros.
    1...5, 1..5
  7-29
    {x, y, z} = object
    class is implemented
  7-28
    forIn!, forOf!, forIn!!, forOf!!, jsForIn!
  7-27
    fix bug: multi level quasiquote and unquote
    replace row with column(thank to HackWaly)
  7-25 -> 7-26 
    try to implementing class by meta language
  7-20 -> 7-24
    reimplement module after reimplementing meta compilation 
  7-18 
    found a group of new meta operator #-, #&, #&=
  7-17
    (x, @y...) ->, (x, @y...) =>
    refactor meta compilation once again, no metaResultList and assign when metaConvert
  7-16
    refactor meta compilation; no -=>, ==> or macro, macro is just meta compilation
    fix a bug in default parameter, should assign based on whether the paramerter is undefined
  7-15
    do some marketing for taijilang, https://github.com/taijiweb/taijilang got 15 stars.
  ------------------------------------------------------------------------------------------  
  7-14
    taijilang 0.1.0 is released
  7-13
    \-=> and,\-> and \=> becomes |-=> and, |-> and |=>
    npm publish taiji 0.1.0
    recreate git repository, commit and push to github\taijiweb\taijilang
    prepare to release 0.1.0
  7-12
    distinct -> and =>, in => this become self, similar to coffee-script
    default parameter
    call with ellipsis  arguments, e.g. a(x..., y...)
    fix bug in [1 2]
      fix bug in [1 2]:[1 2] is not compiled to [[1, 2]] any more, [1, 2] instead

  7-11
    construct list with ellipsis operator
      x = [x..., y..., z]
    destructive list assign
      [a, b] = x
      [a..., b] = x
      [a, b...] = x
      [a, b..., c] = x
      [x, y] = [1, 2]
    use #= to do meta assignment for macro or meta value
  7-10
    use @@ access outer scope var
    refactor testcommand.coffee
      define parse, compile, run = (outputPath?, filePath) ->
    let [] becomes list, {} becomes expression block, {. .} becomes hash
    let, if, while, for, switch, try, etc do'nt put conjunction in the parsed expression
  7-9 
    prepare to release
  7-8
    ensure new var name does not conflict with existed names
    refactor meta to become a member of env
  7-1
    trying to add module once again

2014-6
  6-21 -> 6-30: refactor transform.coffee: everything is expression
  6-20
    compile files in taitilang
    fix bug in assign fn = (x, y) -> ...
  6-19: 
    fix bug: ellipsis parameter
    formatTaijiJson: pretty print intermediate result in taiji
  6-16: 
    fix a bug: operatorDict['toString'] == Object.toString function
    fix a gotcha: x!=1: 
      add a line in makeIdentifierFn = (charSet, firstCharSet=firstIdentifierCharSet) ->
      ...
      if text[cursor-1]=='!' and text[cursor]=='=' then cursor--
      ...

  6-15 
    finish the robust and modular parser
  6-12
    pass more tests
  6-9 -> 6-11
    under new no token parser, pass some tests about operator, clause, etc.
  6-8 
    remove a lot of package which are not used from node_modules
  6-5 -> 6-7
    pass some basic tests, but the progress is slow, because I'm having a a bad influenza and a terrible headache these days.
  6-4: 
    work for the robustmess and modularity of parser, once again
    remove 150 lines of code in the morning
  6-3 
    x... ellipsis parameter for function: (a, x...), (a, x..., b), (x..., b)
  6-2 
    compile square.tj: demo macro
    compile let.tj
  6-1
    fix bug in transform ['call', caller, args]: need flatten ['begin'...]
    compile nodeserver.tj

2014-5
  compiler, compiling time computation, parsing time computation
  5-30 -> 5-31
    compile chatserver.tj
    fix some bugs: . and !=, etc.
    assign can lead a block now.
  5-29
    use shelljs to test shell command of taiji
    add testcommand.coffee for test and debug taiji/command.coffee
  5-28
    repl
    compile taiji file to javascript file
  5-27 
    clauseOperatorExpression in interpolated string
    replace clauseExpression with clauseOperatorExpression
  5-26
    compile hash {x:y, a=>b}
    compile interpolated string
  5-23 -> 5-25
    work for the robustness and modularity of the parser under the solution that use less token, but failed.
    back to the full token solution
    new implementation for symbol
  5-22
    fix some bugs in parsing number
  5-21 
    pass first case on compiling while parsing
    start working for the robustness and modularity of the parser
  5-18 -> 5-20
    big refactor: change the solution to space, new line and indent operator expression.
    old solution is to use different combinator function which parameter is atom, operator
    new solution is to change the priority of operator according to space, new line.
    indent block always generates a INDENT_EXPRESSION atom.
  5-17
    mutual recursion: odd, even
    greatest-common-division
  5-16
    simple case of transforming recursion to loop: tail recursion or single recursive function
  5-15
    finish add cursor, line, row information to expression
  5-14 
    add cursor, line, row information to expression, half done
  5-13 
    compile operation with space, line and indent
    pass all tests in testcompilerbasic.coffee 
    @, :: 
  5-12 
    if!, switch!, etc.
    identifier can be ! and ? except the first char.
    switch!, try!
    label statement, break, continue
  5-11 
    compile macro and quasiquote
    assign macro to variable and call macro
  5-9 
    to code: split to two function, token and text 
    add some format(new line, space, indent and undent, etc)
    process the priority of operator when generating code
  5-8 
    meta operator: #, computing in compile time.
    attribute, e.g. console.log
  5-4
    assign, add, begin, if, let pass some tests
    congratulation to 100 commits.
  5-3
    no power in my house
  5-1 
    start coding compiler  
  
2014-4
  4-30
    @ as this
    class
    :: as prototype
    var statement
    c-for, for-in, for-of
  4-29
    concatenated line
    interpolated string
    curve: hash definition {key:value}
    data bracket: [/  ... /]
  4-28 
    compact, space, line and indent expression
    ^, ^&: unquote and unquote-splice
    compact expression as clause item
  4-26 
    pass 200 tests, parse function definition
  4-25
    use the indentStack, delimiterStack, priorityStack, the parser become simpler, I believe this will be the last solution.  
  4-15
    try three big refactor to parser: 1. indent as object, 2. indent as as closure, 3. indent as function based solution, see the branch in git.

2014-3
  3-31
    a parser can parse operator, indent is coded and pass many tests. the parser is based on function closure, need refactor.
  3-20
    the core of taijilang: eval array by interpreting
  3-11
    start taijilang project, start to code.