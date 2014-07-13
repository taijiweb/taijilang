# Taijilang

## introduction
Taijilang is a new general powerful programming language. Taijilang have more customizability and extensibility than all other existing programming languages. 

In general, the features of Taijilang can be summed up: more useful macro than in lisp, more important white space in syntax than in python, more general preprocess than in C, more powerful meta compilation than metalua, more flexible dialect than rebol, more optimized object code than in coffee-script. 

### features
* Compiled to javascript language 
* Flexible friendly syntax with attaching great importance to indent and white spaces,

e.g. white space can change the precedence of operator, see the examples below:

    1+2*3 // same as 1 + (2*3)
    1+2 * 3 // same as (1+2) *3
    (1 + 2
    * 3 + 4) // same as (1+2) * (3+4)
    
* Everything are expressions 
* Macro in lisp style

Based on quasi quoted list, Taijilang have macro simliar to lisp. Combined with a friendly, extendable dynamic syntax, macro in Taijilang becomes even more powerful than lisp:

    /. "/." starts a indent block comment, which stop until meeting an undent.
      taijilang implements macro in lisp style, but with different symbol in accordance with  traditional grammar, i.e.
      "~" equal to "'" in lisp
      "^" eqaul to "," in lisp
      "^&" equal to ",@" in lisp
    // below is a macro definition
    // line comment can lead a indented code block
      // do is a predefined keyword, we add \ before it to escape the meaning
    \do #= (body..., clause) -=>
      if clause[0]=='where' then
      `{let ^&(clause.slice(1)) then ^&body}
      else if clause[0]=='when' then
      `{doWhile! ^clause[1] ^&body}
      else if clause[0]=='until' then
      `{doWhile! not(^clause[1]) ^&body}
    // now the code below becomes valid:
      do 
        print a
        print b 
      where a=1, b=2
      i = 0; do print i++ until i==10
      
* Meta Language
Any expression can be evaluated in the compiling time, so taijilang become the meta language of itself.

below is some samples to demonstrate the meta language features, e.g.
  
    // #1+2 and #3+4 is evaluated in compiling time:
      if 1 then #1+2 else #3+4
    // the condition of "if" statemeng is evaluated in compiling time
    // when the condition is true, "then" clause is compiled, else "else" clause is compiled. 
    // this is similar to the #if in C language.
      # if 1 then 1+2 else 3+4
    // different from the above sample, the whole "if" statement below is evaluated in the compiling time
      ## if 1 then 1+2 else 3+4
      
* Most customizable and extensible language, with the help of dynamic parser, macro and meta language features

below is some samples:

    // Taijilang use ? as an attribute prefix to access the parser, 
    // use ?? and ?/ to evaluate in the parsing time, if use ?/, the prefix ? can be omitted. 
      ?? ?cursor() // put the current parsing position to the compiled code
      ?? ?clause(), print 1 // all parser.clause() to parse the following code
      ?/ clause(), print 1 // call parser.clause() to parse the following code
    
* Module and package
* Optimized object code
  Taijilang completely avoids generating closure function and function call while transforms expressions to javascript construct; delete operation which has no effect; do recursion optimization, including but not limited to tail recursion optimization on((see samles/let.tj), and so on. 

## Project Address: 
[github: github.com/taijiweb/taijilang](https://www.github.com/taijiweb/taijilang)

[npm: npmjs.org/chaosim/taiji](https://www.npmjs.org/package/taiji)

[google groups: taijilang](https://groups.google.com/forum/?hl=en#forum/taijilang!)
 
[G+: taiji lang](https://plus.google.com/u/0/114446069949044102399/posts/p/pub)

QQ group: 太极语言 194928684

### Creator and contributors
The creator of taijilang is [曹星明( Caoxingming, assumed name 太极真人(Taiji Zhenren) )](taijiweeb@gmail.com).

Everyone is welcome to becoming the contributors.

Let it go, let's start the game of throne, to write a song of ice and fire in the taiji language.
