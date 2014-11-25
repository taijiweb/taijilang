11-24
  todo: simplify
    goal: meta compilation, handwriting parser, indent grammar, json intermediate representation
    non goal:
      speed
      interpolate string, only "..."
      only // comment
      space and new line based priority, indent expression
      hash block
      optimization
      general transform
      compact var statement generation
      customabiltiy, extensibility
      source map
      power part in the float
      verbose error report and process
      module head, bin directive
      class
      for (; ; ) then expr

11-2 todo: record parent pointer, consistent tree expression, debug and test support
11-8 todo: indent stack should may be back? benifit?

todo: document
  todo: tutorial：interactive samples
  
todo: test new preprocess operator
  # let, letrec!, letloop!, doWhere!, while, doWhile!, doUntil!, cFor!, forIn!, forOf!, forIn!!, forOf!!

todo: assign optimization
  # ssaVar, const var, dummy var, etc

todo: better parser builtins ?!, ?/, etc

todo: remove "entity" utility function
  # method: everything is array, even number, string, identifier or symbol
  # ['num!', value], ['str', "some string"], ['symbol', 'console'], ['symbol', '+'], etc...
  # syntax information(cursor, line number, etc) is attachted to array
  
todo: [x, y, z] @= value # all= at --> all?

todo: dummy var: can be assigned, but can not be readed(do nothing while assigning)
  # useful for expressiveness and optimization
  # while optimization, assigned to dummy var will be removed.
  # e.g. dummy! _; [x..., _] = lst; [_, y...] = lst
  # f = (x, y, _) -> ... # parameter _ is treated as dummy var automatically

todo: pattern match, e.g.
  f = pattern (1) -> 1; (n) -> n+f(n-1)
  f = pattern 
    (1) -> 1
    (n) -> n+f(n-1)

todo: source map
  # a complicateful, hard and task with too much work to do
  # coffee-script is my friend.
----------------------------------------------------------
done: refactor parser for performance: more lexical analysis before parsing
done: Grammatical element expression(语法成分表达式) 
done: replace matchToken() as nextToken() 
---------------------2014-11-1---------------------------------------

done: add more preprocess operator
  # let, letrec!, letloop!, doWhere!, while, doWhile!, doUntil!, cFor!, forIn!, forOf!, forIn!!, forOf!!
done: transform string to symbol by escaping it. e.g.: \"x...", \"...x", \"..."
done: ":" at the end of line can replace 'then'
done: embedded meta compilation: #call, by evaluating the embedded meta code while running
done: refactor definition ->, =>, etc,  now they produces [->, [params], oneStatement], instead of statement list
done: \ lead symbol to escape it, e.g. \=, \+=, \>>, \/, etc, useful to write macros.
done: ellipsis subscript: a[1..3]; b[1...4]; a[...], a[..], x = a[..5]; x = a[...5]
done: range: a...b, a..b
done: hash assign: {a, b, c} = x # {} of the left side of = is treated as hash
done: macro for "for", do, etc
  # macro for for/c-style, do(as begin!) do/where, do/When and do/until is not necessary any more.
  # forIn!! and forOf!! is necessary still.
done: class similar to coffee-script
  # things like super, construcotr(too long name, maybe I'll use :: = (...)->)done: (x, @y...) ->, (x, @y...) =>
done: convert javascript keyword to legal idenentifier (var name)
done: refactor meta compilation; no -=>, ==> or macro, macro is just meta compilation 
--------------------------------------------------------------------------
done: release 0.1.0
done: \-=> and,\-> and \=> becomes |-=> and, |-> and |=> 
done: \-> and \=> prevent wrap return around function body
done: distinct -> and =>, in => this become _this, similar to coffee-script
done: default parameter: fn = (x=1, y=2) ->
done: ellipsis arguments for call, e.g. fn(a, x..., b, y..., z)
done: construct list with ellipsis operator
  x = [x..., y..., z]
done: destructive list assign
  [a, b] = x
  [a..., b] = x
  [a, b...] = x
  [a, b..., c] = x
  [x, y] = [1, 2]
done：[] becomes list, {} becomes expression block, {. .} becomes hash
done: @@outsideVariable = value
done: modulization, i.e.  use!, export!, include! for taiji
done: better format for generated javascript code
done: the robust and modularity of parser, once again
done: x... ellipsis parameter for function: (a, x...), (a, x..., b), (x..., b)
done: x... ellipsis parameter for macro: (a, x...), (a, x..., b), (x..., b)
done: merge short simple statement to one line when generating code
done: merge var and assign in on statements when generating code
done: bin/taiji: compile files
done: repl: lodoneup var in on environment
done: let the parser becomes dynamic parser
done: $clauseExpression as interpolated expression in string.
done: parser: do-where, do-until, do-while
done: compiler: convert: extern variable
done: compiler: code generation: generate tdoneen
done: space, line, indent block operator expression
done: chain expression: now it is called compact expression
done: unquote and unquote-splice: ^ ^&
done: concatenated line
done: interpolated string
done: curve dictionary
done: data bracket
done: @ as this
done: parser: class extends (x, y)
done: var
done: cFor!, forIn!, forOf!
done: let-then
-----------------------------------------------------------------

cancel: implement {assign! left right} and {augmentAssign! left op right} so that programmer can define macros more easily.
  # hack for =, += in the parser is error-prone.
  # after implementing escape symbol with \, this todo may be unnessary.

cancel: may be [x y z] should directly produce [x, y, z], no list! is unshift to its front, and item in {} or other blocks should produces ['call!', x, [y, z]]
  # now -> ... produces [-> [] statement], instead of [-> [] [statement list]]

