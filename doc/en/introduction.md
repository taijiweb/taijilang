# taijilang

## A language with meta language!
Taijilang is a new general powerful programming language, with flexibility, good readability, ease of use. Taijilang will have more customizability and scalability than all other existing programming languages. 

In general, the features of Taijilang can be summed up: more powerful macro than in lisp, more important white space than in the indentation syntax of python, more general preprocess than in C, broader meta compilation than metalua, more flexible dialect feature than rebol, more optimized object code than in coffee-script. Listed below are the specific features of Taijilang: 

* Compiled to javascript language 
   Taijilang may expand to use other languages ​​as the target language in the future . 
* Flexible friendly syntax 
   Taijilang have fine and flexible syntax control, e.g. indentation grammar and other kind of use of white spaces to help the reading; spaces can change the precedence of operators; flexible multi-line strings in which the programmer can control interpolation, escaping freely, and so on
* Everything are expressions 
   Similar to CoffeeScript, assignment, if, switch, while, for statement are all expressions. Further, in Taijilang, return, break statement has also been treated as expressions. Less distinction between statements and expressions will give us greater freedom to organize the program, which I fully understood while I develop the parser for Taijilang with coffee-script, it is exactly because of the syntax features of treating assignment and function definition in coffee-script language that I was inspired to find a new method to write parser by hand, which is the key to the dynamic parser of Taijilang (see the [peasy project](https://www.github.com/chaosim/peasy ) ). 
* Macro 
   Based on quasi quoted list, Taijilang have macro simliar to lisp. Combined with a friendly, extendable dynamic syntax, macro in Taijilang becomes even more powerful than lisp. 
* Meta Language 
   Any expression can be evaluated at compile time to control the compilation process and object code. This is similar to preprocess the C language, but more general. The macro and meta-language features can greatly improve expressionability, and help to write more optimized software. 
* Customizable and extensible syntax 
   Taijilang syntax can be customized and extended from the multi-level, including the re-definition of grammatical elements, define new operator expressions, set a new operator, and so on. Any keywords and symbols in Taijilang can be redefined by macros or functions. 
* Modulization
   Different from most other languages ​​compiled to javascript, Taijilang ​​have its own modular system.
The programmers can organize programs by modules and packages, and release libraries or frameworks in Taijilang. 
* Optimized object code 
   Contrast to other languages (such as coffee-script) compiled to javascript, Taijilang completely avoids generating closure function and function call while transforms expressions to javascript construct; Taijilang also deletes operation which has no effect, do recursion optimization, including but not limited to tail recursion optimization on, and so on. 


#### taijilang was inspired by lisp, scheme, LambdaProlog, curry, haskell, c, python, javascript, coffeescript, pyprolog, yieldProlog, dao, daonode, peasy, lispyscript and littlelisp.

#### Community
  google groups: [taijilang -- https://groups.google.com/forum/#!forum/taijilang](https://groups.google.com/forum/#!forum/taijilang).

### Contributors
[曹星明Caoxingming](https://github.com/taijilang).
