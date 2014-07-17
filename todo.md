todo: class similar to coffee-script
  # things like super, construcotr(too long name, maybe I'll use init: (...)->)
  
todo: range: x = a...b, x = a..b
todo: ellipsis subscript: x = a[1..3]; x = b[1...4]; x = a[...], x = a[..], x = a[..5]; x = a[...5]
todo: hash assign
  {a, b, c} = x # {} of the left side of = is treated as hash

todo: \ lead symbol to escape it, e.g. \=, \+=, \>>, \/, etc, useful to write macros.

todo: ":" at the end of line can replace 'then'

todo: add more cases for preprocess operator
  # let, letrec!, letloop!, doWhere!, while, doWhile!, doUntil!, cFor!, forIn!, forOf!, forIn!!, forOf!!

todo: assign optimization
  # ssaVar, const var, dummy var, etc

todo: macro for "for", do, try, etc
  # macro for for/c-style, do(as begin!) do/where, do/When and do/until is not necessary any more.
  # forIn!! and forOf!! is necessary still.

todo: may be [x y z] should directly produce [x, y, z], no list! is unshift to its front, and item in {} or other blocks should produces ['call!', x, [y, z]]

todo: [x, y, z] @= value # all= at --> all?

todo: dummy var: can be assigned, but can not be readed
  # useful for expressiveness and optimization
  # while optimization, assigned to dummy var will be removed.
  # e.g. dummy! _; [x..., _] = lst; [_, y...] = lst
  # f = (x, y, _) -> ... # parameter _ is treated as dummy var automatically

todo: pattern match, e.g.
  f = pattern (1) -> 1; (n) -> n+f(n-1)
  f = pattern 
    (1) -> 1
    (n) -> n+f(n-1)

todo: implement {assign! left right} and {augmentAssign! left op right} so that programmer can define macros more easily.
  # hack for =, += in the parser is error-prone.
  # after implementing escape symbol with \, this todo may be unnessary.

todo: source map
  # a complicateful, hard and task with too much work to do
  # coffee-script is my friend.

todo: document
  todo: tutorial：interactive samples

------------------------------------------------------------
done: (x, @y...) ->, (x, @y...) =>
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
