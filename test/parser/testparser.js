var Parser, constant, expect, idescribe, iit, isArray, lib, matchRule, ndescribe, nit, str, _ref, _ref1;

_ref = require('../util'), expect = _ref.expect, ndescribe = _ref.ndescribe, idescribe = _ref.idescribe, iit = _ref.iit, nit = _ref.nit, matchRule = _ref.matchRule;

lib = '../../lib/';

_ref1 = require(lib + 'utils'), constant = _ref1.constant, isArray = _ref1.isArray, str = _ref1.str;

Parser = require(lib + 'parser').Parser;

describe("parse: ", function() {
  describe("clause: ", function() {
    var parse;
    parse = function(text) {
      var parser, x;
      parser = new Parser();
      x = parser.parse(text, matchRule(parser, parser.clause), 0);
      return str(x);
    };
    describe("normal clause: ", function() {
      it('should parse 3+#(1+1)', function() {
        return expect(parse('3+#(1+1)')).to.equal("[binary! + 3 [prefix! # [() [binary! + 1 1]]]]");
      });
      it('should parse 1', function() {
        return expect(parse('1 ')).to.equal("1");
      });
      it('should parse y+!1', function() {
        return expect(parse('y+!1')).to.equal("[binary! + y [prefix! ! 1]]");
      });
      it('should parse a!=1', function() {
        return expect(parse('a!=1')).to.equal("[binary! != a 1]");
      });
      it('should parse a!=1', function() {
        return expect(parse('a!=1')).to.equal("[binary! != a 1]");
      });
      it('should parse 1,2', function() {
        return expect(parse('1,2')).to.equal('1');
      });
      it('should parse 1 , 2', function() {
        return expect(parse('1 , 2')).to.equal("1");
      });
      it('should parse 1 2', function() {
        return expect(parse('1 2 ')).to.equal('[1 2]');
      });
      it('should parse print : 1 , 2', function() {
        return expect(parse('print : 1 , 2')).to.equal("[print 1 2]");
      });
      it('should parse print : and 1 2', function() {
        var x;
        x = parse('print : and 1 2');
        return expect(x).to.equal("[print [and 1 2]]");
      });
      it('should parse print: and 1 2 , 3', function() {
        var x;
        x = parse('print: and 1 2 , 3');
        return expect(x).to.equal("[print [and 1 2] 3]");
      });
      it('should parse print : add 1 2 , add 3 4', function() {
        return expect(parse('print : add 1 2 , add 3 4')).to.equal("[print [add 1 2] [add 3 4]]");
      });
      it('should parse select fn : 1 2 4', function() {
        return expect(parse('select fn : 1 2 4')).to.equal("[[select fn] [1 2 4]]");
      });
      it('should parse select fn : 1, 2, 4', function() {
        return expect(parse('select fn : 1, 2, 4')).to.equal("[[select fn] 1 2 4]");
      });
      it('should parse {select fn} 1 2 4', function() {
        return expect(parse('{select fn} 1 2 4')).to.equal("[[{} [select fn]] 1 2 4]");
      });
      it('should parse {select fn} 1, 2, 4', function() {
        return expect(parse('{select fn} 1, 2, 4')).to.equal("[[{} [select fn]] 1]");
      });
      it('should parse print: add: add 1 2 , add 3 4', function() {
        return expect(parse('print: add: add 1 2 , add 3 4')).to.equal("[print [add [add 1 2] [add 3 4]]]");
      });
      it('should parse [2]', function() {
        return expect(parse("[2]")).to.equal("[[] [2]]");
      });
      it('should parse [[2]]', function() {
        return expect(parse("[[2]]")).to.equal("[[] [[[] [2]]]]");
      });
      return it('should parse [[[2] 3]]', function() {
        return expect(parse("[ [[2] 3] ]")).to.equal("[[] [[[] [[[[] [2]] 3]]]]]");
      });
    });
    describe("normal clause 2: ", function() {
      it('should parse a = 1', function() {
        return expect(parse('a = 1')).to.equal("[= a 1]");
      });
      it('should parse require.extensions[".tj"] = 1', function() {
        return expect(parse('require.extensions[".tj"] = 1')).to.equal("[= [binary! concat[] [binary! . require extensions] [[] [\".tj\"]]] 1]");
      });
      it('should parse a = ->', function() {
        return expect(parse('a = ->')).to.equal("[= a [-> [] undefined]]");
      });
      it('should parse require.extensions[".tj"] = ->', function() {
        return expect(parse('require.extensions[".tj"] = ->')).to.equal("[= [binary! concat[] [binary! . require extensions] [[] [\".tj\"]]] [-> [] undefined]]");
      });
      it('should parse require.extensions[".tj"] = (module, filename) ->', function() {
        return expect(parse('require.extensions[".tj"] = (module, filename)  ->')).to.equal("[= [binary! concat[] [binary! . require extensions] [[] [\".tj\"]]] [-> [() [binary! , module filename]] undefined]]");
      });
      it('should parse x = ->', function() {
        return expect(parse('x = ->')).to.equal("[= x [-> [] undefined]]");
      });
      nit('should parse \\"x..." a', function() {
        return expect(parse('\\"x..." a')).to.equal('undefined');
      });
      return nit('should parse \\\'x...\' a', function() {
        return expect(parse("\\'x...' a")).to.equal('["x..." a]');
      });
    });
    describe("clauses which contain in curve or bracket: ", function() {
      it('should parse [1]', function() {
        return expect(parse('[1] ')).to.equal("[[] [1]]");
      });
      it('should parse {1}', function() {
        return expect(parse('{1} ')).to.equal("[{} 1]");
      });
      it('should parse {1, 2}', function() {
        return expect(parse('{1, 2} ')).to.equal("[{} [begin! 1 2]]");
      });
      it('should parse [1, 2]', function() {
        return expect(parse('[1, 2] ')).to.equal("[[] [1 2]]");
      });
      it('should parse {print 1}', function() {
        return expect(parse('{print 1} ')).to.equal("[{} [print 1]]");
      });
      it('should parse print {abs 1}', function() {
        return expect(parse('print {abs 1} ')).to.equal("[print [{} [abs 1]]]");
      });
      return it('should parse print {abs \n 1}', function() {
        return expect(parse('print {abs \n 1} ')).to.equal("[print [{} [abs 1]]]");
      });
    });
    describe("function:", function() {
      it('should parse ->', function() {
        var x;
        x = parse('->');
        return expect(x).to.equal('[-> [] undefined]');
      });
      it('should parse -> 1', function() {
        var x;
        x = parse('-> 1');
        return expect(x).to.equal("[-> [] 1]");
      });
      it('should parse () -> 1', function() {
        var x;
        x = parse('() -> 1');
        return expect(x).to.equal("[-> [()] 1]");
      });
      it('should parse (a) -> 1', function() {
        var x;
        x = parse('(a) -> 1');
        return expect(x).to.equal("[-> [() a] 1]");
      });
      it('should parse (a, b) -> 1', function() {
        var x;
        x = parse('(a , b) -> 1');
        return expect(x).to.equal("[-> [() [binary! , a b]] 1]");
      });
      it('should parse (a , b , c) -> 1', function() {
        var x;
        x = parse('(a , b , c) -> 1');
        return expect(x).to.equal("[-> [() [binary! , [binary! , a b] c]] 1]");
      });
      it('should parse (a , b , c) -> -> 1', function() {
        var x;
        x = parse('(a , b , c) -> -> 1');
        return expect(x).to.equal("[-> [() [binary! , [binary! , a b] c]] [-> [] 1]]");
      });
      it('should parse (a , b , 1) -> 1', function() {
        return expect(parse('(a , b , 1) -> 1')).to.equal("[-> [() [binary! , [binary! , a b] 1]] 1]");
      });
      it('should parse (a , b + 1) -> 1', function() {
        return expect(parse('(a , b + 1) -> 1')).to.equal("[-> [() [binary! , a [binary! + b 1]]] 1]");
      });
      it('should parse -> and 1 2 ; and 3 4', function() {
        var x;
        x = parse('-> and 1 2 ; and 3 4');
        return expect(x).to.equal("[-> [] [begin! [and 1 2] [and 3 4]]]");
      });
      it('should parse -> and 1 2 , and 3 4', function() {
        var x;
        x = parse('-> and 1 2 , and 3 4');
        return expect(x).to.equal("[-> [] [begin! [and 1 2] [and 3 4]]]");
      });
      it('should parse print -> 2', function() {
        var x;
        x = parse('print -> 2');
        return expect(x).to.equal("[print [-> [] 2]]");
      });
      it('should parse -> 1 -> 2', function() {
        return expect(parse('-> 1 -> 2')).to.equal("[-> [] [1 [-> [] 2]]]");
      });
      return it('should parse -> and 1 2 , and 3 4 -> print x ; print 5 6', function() {
        var x;
        x = parse('-> and 1 2 , and 3 4 -> print x ; print 5 6');
        return expect(x).to.equal("[-> [] [begin! [and 1 2] [and 3 4 [-> [] [begin! [print x] [print 5 6]]]]]]");
      });
    });
    describe('meta: ', function() {
      it('should parse # if 1 then 1+2 else 3+4', function() {
        return expect(parse('# if 1 then 1+2 else 3+4')).to.equal("[# [if 1 [binary! + 1 2] [binary! + 3 4]]]");
      });
      it('should compile ## if 1 then 1+2 else 3+4', function() {
        return expect(parse('## if 1 then 1+2 else 3+4')).to.equal("[## [if 1 [binary! + 1 2] [binary! + 3 4]]]");
      });
      it('should parse # #(1+2)', function() {
        return expect(parse('# #(1+2)')).to.equal("[# [prefix! # [() [binary! + 1 2]]]]");
      });
      it('should parse # #(1+2)', function() {
        return expect(parse('# #(1+2)')).to.equal("[# [prefix! # [() [binary! + 1 2]]]]");
      });
      it('should parse # (#(1+2) + #(3+4))', function() {
        return expect(parse('# (#(1+2) + #(3+4))')).to.equal("[# [() [binary! + [prefix! # [() [binary! + 1 2]]] [prefix! # [() [binary! + 3 4]]]]]]");
      });
      return it('should parse # ( #(1+2) + #(3+4))', function() {
        return expect(parse('# ( #(1+2) + #(3+4))')).to.equal("[# [() [binary! + [prefix! # [() [binary! + 1 2]]] [prefix! # [() [binary! + 3 4]]]]]]");
      });
    });
    describe('for', function() {
      it('should parse for i in x then print i', function() {
        var x;
        x = parse('for i in x then print i');
        return expect(x).to.equal("[forIn! i undefined x [print i]]");
      });
      it('should parse for i v in x then print i, print v', function() {
        var x;
        x = parse('for i v in x then print i, print v');
        return expect(x).to.equal("[forIn! i v x [begin! [print i] [print v]]]");
      });
      return it('should parse for i, v of x then print i, print v', function() {
        var x;
        x = parse('for i, v of x then print i, print v');
        return expect(x).to.equal("[forOf! i v x [begin! [print i] [print v]]]");
      });
    });
    describe('assign', function() {
      it('should parse a = 1', function() {
        var x;
        x = parse('a = 1');
        return expect(x).to.equal('[= a 1]');
      });
      it('should parse \\if = 1', function() {
        var x;
        x = parse('\\if = 1');
        return expect(x).to.equal("[= \\if 1]");
      });
      it('should parse a = b = 1', function() {
        var x;
        x = parse('a = b = 1');
        return expect(x).to.equal('[= a [= b 1]]');
      });
      it('should parse a = \n b = 1', function() {
        var x;
        x = parse('a = \n b = 1');
        return expect(x).to.equal("[= a [= b 1]]");
      });
      it('should parse a = \n b = \n  1', function() {
        var x;
        x = parse('a = \n b = \n  1');
        return expect(x).to.equal("[= a [= b 1]]");
      });
      it('should parse :: = 1', function() {
        var x;
        x = parse(':: = 1');
        return expect(x).to.equal("[= :: 1]");
      });
      it('should parse {a b c} = x', function() {
        var x;
        x = parse('{a b c} = x');
        return expect(x).to.equal("[= [{} [a b c]] x]");
      });
      return it('should parse {a} = x', function() {
        var x;
        x = parse('{a} = x');
        return expect(x).to.equal("[= [{} a] x]");
      });
    });
    describe('unquote!', function() {
      it('should parse ^ a', function() {
        var x;
        x = parse('^ a');
        return expect(x).to.equal("[^ a]");
      });
      it('should parse ^& a', function() {
        var x;
        x = parse('^& a');
        return expect(x).to.equal("[^& a]");
      });
      return it('should parse ^&a', function() {
        var x;
        x = parse('^&a');
        return expect(x).to.equal("[prefix! ^& a]");
      });
    });
    return describe('expression clause:', function() {
      it('should parse 1+2', function() {
        var x;
        x = parse('1+2');
        return expect(x).to.equal("[binary! + 1 2]");
      });
      it('should parse print 1+2', function() {
        var x;
        x = parse('print 1+2');
        return expect(x).to.equal("[print [binary! + 1 2]]");
      });
      it('should parse print (1+2)', function() {
        var x;
        x = parse('print (1+2)');
        return expect(x).to.equal("[print [() [binary! + 1 2]]]");
      });
      return it('should parse print (1 + 2)', function() {
        var x;
        x = parse('print (1 + 2)');
        return expect(x).to.equal("[print [() [binary! + 1 2]]]");
      });
    });
  });
  describe("sentence: ", function() {
    var parse;
    parse = function(text) {
      var parser, x;
      parser = new Parser();
      x = parser.parse(text, matchRule(parser, parser.sentence), 0);
      return str(x);
    };
    describe("old test: ", function() {
      it('should parse print 1 , print 2', function() {
        var x;
        x = parse('print 1 , print 2');
        return expect(x).to.equal("[[print 1] [print 2]]");
      });
      it('should parse if and 1 2 then 3', function() {
        var x;
        x = parse('if and 1 2 then 3');
        return expect(x).to.equal("[[if [and 1 2] 3]]");
      });
      it('should parse if and 1 2 then\n 3', function() {
        var x;
        x = parse('if and 1 2 then\n 3');
        return expect(x).to.equal("[[if [and 1 2] 3]]");
      });
      it('should parse if add : add 1 2 , add 3 4 then 5', function() {
        var x;
        x = parse('if add : add 1 2 , add 3 4 then 5');
        return expect(x).to.equal("[[if [add [add 1 2] [add 3 4]] 5]]");
      });
      return it('should parse print : and 1 2 , or : eq 3 4 , eq 5 6', function() {
        var x;
        x = parse('print : and 1 2 , or : eq 3 4 , eq 5 6');
        return expect(x).to.equal("[[print [and 1 2] [or [eq 3 4] [eq 5 6]]]]");
      });
    });
    describe("old test 2: ", function() {
      it('should parse if 2 then 3 else 4', function() {
        var x;
        x = parse('if 2 then 3 else 4');
        return expect(x).to.equal("[[if 2 3 4]]");
      });
      it('should parse print 1 , if 2 then 3 else 4', function() {
        var x;
        x = parse('print 1 , if 2 then 3 else 4');
        return expect(x).to.equal("[[print 1] [if 2 3 4]]");
      });
      it('should parse if 1 then 2 else if 1 then 2 else 3', function() {
        var x;
        x = parse('if 1 then 2 else if 1 then 2 else 3');
        return expect(x).to.equal("[[if 1 2 [if 1 2 3]]]");
      });
      return it('should parse if 1 then if 2 then 3 else 4 else 5', function() {
        var x;
        x = parse('if 1 then if 2 then 3 else 4 else 5');
        return expect(x).to.equal("[[if 1 [if 2 3 4] 5]]");
      });
    });
    describe("if statement: ", function() {
      describe("group1: ", function() {
        it('should parse if 1 then 2', function() {
          var x;
          x = parse('if 1 then 2');
          return expect(x).to.equal("[[if 1 2]]");
        });
        it('should parse if 1 else 2', function() {
          return expect((function() {
            try {
              return function() {
                return parse('if 1 else 2');
              };
            } catch (_error) {}
          })()).to["throw"](/unexpected conjunction "else"/);
        });
        it('should parse if 1 then 2 else 3', function() {
          var x;
          x = parse('if 1 then 2 else 3');
          return expect(x).to.equal("[[if 1 2 3]]");
        });
        it('should parse if 1 then 2 \nelse 3', function() {
          var x;
          x = parse('if 1 then 2 \nelse 3');
          return expect(x).to.equal("[[if 1 2 3]]");
        });
        it('should parse if 1 then \n  2 \nelse 3', function() {
          var x;
          x = parse('if 1 then \n  2 \nelse 3');
          return expect(x).to.equal("[[if 1 2 3]]");
        });
        return it('should parse if 1 \nthen 2 \nelse 3', function() {
          var x;
          x = parse('if 1 \nthen 2 \nelse 3');
          return expect(x).to.equal("[[if 1 2 3]]");
        });
      });
      return describe("group2: ", function() {
        it('should parse if 1 then\n  2 \nelse 3', function() {
          return expect(parse('if 1 then\n  2 \nelse 3')).to.equal("[[if 1 2 3]]");
        });
        it('should parse if 1 then if 2 then 3', function() {
          var x;
          x = parse('if 1 then if 2 then 3');
          return expect(x).to.equal("[[if 1 [if 2 3]]]");
        });
        it('should parse if 1 then if 2 then 3 else 4', function() {
          var x;
          x = parse('if 1 then if 2 then 3 else 4');
          return expect(x).to.equal("[[if 1 [if 2 3 4]]]");
        });
        it('should parse if 1 then if 2 then 3 \nelse 4', function() {
          var x;
          x = parse('if 1 then if 2 then 3 \nelse 4');
          return expect(x).to.equal("[[if 1 [if 2 3] 4]]");
        });
        it('should parse if 1 then \n if 2 then 3 \nelse 4', function() {
          var x;
          x = parse('if 1 then \n if 2 then 3 \nelse 4');
          return expect(x).to.equal("[[if 1 [if 2 3] 4]]");
        });
        return it('should parse if 1 then\n if 2 then 3 \n else 4', function() {
          var x;
          x = parse('if 1 then\n if 2 then 3 \n else 4');
          return expect(x).to.equal("[[if 1 [if 2 3 4]]]");
        });
      });
    });
    describe("while statement: ", function() {
      it('should parse while 1 then 2', function() {
        var x;
        x = parse('while 1 then 2');
        return expect(x).to.equal("[[while 1 2]]");
      });
      it('should parse while 1 else 2', function() {
        return expect((function() {
          try {
            return function() {
              return parse('while 1 else 2');
            };
          } catch (_error) {}
        })()).to["throw"](/unexpected conjunction "else"/);
      });
      it('should parse while 1 then \n while 2 then 3 \nelse 4', function() {
        var x;
        x = parse('while 1 then \n while 2 then 3 \nelse 4');
        return expect(x).to.equal("[[while 1 [while 2 3] 4]]");
      });
      return it('should parse while 1 then\n while 2 then 3 \n else 4', function() {
        var x;
        x = parse('while 1 then\n while 2 then 3 \n else 4');
        return expect(x).to.equal("[[while 1 [while 2 3 4]]]");
      });
    });
    describe("try statement: ", function() {
      it('should parse try 1 catch e then try 2 catch e then 3', function() {
        var x;
        x = parse('try 1 catch e then try 2 catch e then 3');
        return expect(x).to.equal("[[try 1 e [try 2 e 3 undefined] undefined]]");
      });
      it('should parse try \n 1 catch e then\n 2', function() {
        return expect(function() {
          return parse('try \n 1 catch e then\n 2');
        }).to["throw"](/unexpected conjunction "catch" following a indent block/);
      });
      return it('should parse try \n 1 \ncatch e then\n 2', function() {
        return expect(function() {
          return parse('try \n 1 catch e then\n 2');
        }).to["throw"](/unexpected conjunction "catch" following a indent block/);
      });
    });
    describe("try if statement: ", function() {
      return it('should parse try if 1 then 2 catch e then 3', function() {
        var x;
        x = parse('try if 1 then 2 catch e then 3');
        return expect(x).to.equal("[[try [if 1 2] e 3 undefined]]");
      });
    });
    return describe("indent block: ", function() {
      it('should parse print \n 1', function() {
        return expect(parse('print \n 1')).to.equal('[[print 1]]');
      });
      it('should parse print \n 2 \n 3', function() {
        return expect(parse('print \n 2 \n 3')).to.equal('[[print 2 3]]');
      });
      it('should parse print \n abs \n   3', function() {
        return expect(parse('print \n abs \n   3')).to.equal('[[print [abs 3]]]');
      });
      it('should parse print \n abs 3 \n abs 4', function() {
        return expect(parse('print \n abs 3 \n abs 4')).to.equal('[[print [abs 3] [abs 4]]]');
      });
      return it('should parse print : 2', function() {
        return expect(parse("print : 2")).to.equal('[[print 2]]');
      });
    });
  });
  describe("line: ", function() {
    var parse;
    parse = function(text) {
      var parser, x;
      parser = new Parser();
      x = parser.parse(text, matchRule(parser, parser.line), 0);
      return str(x);
    };
    it('should parse print 1 ; print 2', function() {
      var x;
      x = parse('print 1 ; print 2');
      return expect(x).to.equal('[[print 1] [print 2]]');
    });
    it('should parse \'#a=1;a', function() {
      return expect(parse('#a=1;a')).to.equal("[[binary! = [prefix! # a] 1] a]");
    });
    return it('should parse \'##a=1;a', function() {
      return expect(parse('##a=1;a')).to.equal("[[prefix! ## [binary! = a 1]] a]");
    });
  });
  return describe("module: ", function() {
    var parse;
    parse = function(text) {
      var parser, x;
      parser = new Parser();
      x = parser.parse(text, parser.module, 0);
      return str(x);
    };
    describe("misc: ", function() {
      it('should parse 1', function() {
        return expect(parse('1 ')).to.equal("1");
      });
      it('should parse 1.', function() {
        return expect(parse('1.')).to.equal("[1 .]");
      });
      it('should parse \n1', function() {
        return expect(parse('\n1 ')).to.equal("1");
      });
      it('should parse "1"', function() {
        return expect(parse('"1"')).to.equal("\"1\"");
      });
      it('should parse a', function() {
        return expect(parse('a')).to.equal("a");
      });
      it('should parse  print 2', function() {
        return expect(parse('print 2 ')).to.equal("[print 2]");
      });
      it('should parse \'##a=1; # ` ^ a', function() {
        return expect(parse('##a=1; # ` ^ a')).to.equal("[begin! [prefix! ## [binary! = a 1]] [# [` [^ a]]]]");
      });
      return it('should parse \'a#=1; # ` ^ a', function() {
        return expect(parse('a#=1; # ` ^ a')).to.equal("[begin! [binary! #= a 1] [# [` [^ a]]]]");
      });
    });
    describe("misc2: ", function() {
      it('should print \n 2 ', function() {
        return expect(parse('print \n 2 ')).to.equal("[print 2]");
      });
      it('should  print \n 2 \n 3', function() {
        return expect(parse('print \n 2 \n 3')).to.equal("[print 2 3]");
      });
      it('should parse  print \n 2  3', function() {
        return expect(parse('print \n 2  3')).to.equal("[print [2 3]]");
      });
      it('should parse print \n add 1 2; add 3 4', function() {
        return expect(parse('print \n add 1 2; add 3 4')).to.equal("[print [add 1 2] [add 3 4]]");
      });
      it('should parse ` [ ^1 ^2 ^&[3 4]]', function() {
        return expect(parse('`[ ^1 ^2 ^&[3 4]]')).to.equal("[prefix! ` [[] [[[prefix! ^ 1] [prefix! ^ 2] [prefix! ^& [[] [[3 4]]]]]]]]");
      });
      it('should parse ` [ ^1 ]', function() {
        return expect(parse('` [ ^1 ]')).to.equal("[` [[] [[prefix! ^ 1]]]]");
      });
      it('should parse `[ ^1 ]', function() {
        return expect(parse('`[ ^1 ]')).to.equal("[prefix! ` [[] [[prefix! ^ 1]]]]");
      });
      it('should parse `[ ^1 ^2 ]', function() {
        return expect(parse('`[ ^1 ^2]')).to.equal("[prefix! ` [[] [[[prefix! ^ 1] [prefix! ^ 2]]]]]");
      });
      return it('should parse `{ ^1, ^2 }', function() {
        return expect(parse('`{ ^1, ^2 }')).to.equal("[prefix! ` [{} [begin! [prefix! ^ 1] [prefix! ^ 2]]]]");
      });
    });
    describe("misc3: ", function() {
      it('should parse # if 0 then 1+2 else 3+4', function() {
        return expect(parse('# if 0 then 1+2 else 3+4')).to.equal("[# [if 0 [binary! + 1 2] [binary! + 3 4]]]");
      });
      it('should parse [1] ', function() {
        return expect(parse('[1]')).to.equal("[[] [1]]");
      });
      it('should parse [1, 2] ', function() {
        return expect(parse('[1, 2]')).to.equal("[[] [1 2]]");
      });
      it('should parse [ 1, 2 ] ', function() {
        return expect(parse('[ 1, 2 ]')).to.equal("[[] [1 2]]");
      });
      it('should parse [\ 1, 2 \] ', function() {
        return expect(parse('[\ 1, 2 \]')).to.equal("[[] [1 2]]");
      });
      it('should parse for x in [\ 1, 2 \] then print x', function() {
        return expect(parse('for x in [\ 1, 2 \] then print x')).to.equal("[forIn! x undefined [[] [1 2]] [print x]]");
      });
      it('should parse for x in [1, 2 ] then print x', function() {
        return expect(parse('for x in [ 1, 2 ] then print x')).to.equal("[forIn! x undefined [[] [1 2]] [print x]]");
      });
      it('should parse for x in [1 2 ] then print x', function() {
        return expect(parse('for x in [ 1 2 ] then print x')).to.equal("[forIn! x undefined [[] [[1 2]]] [print x]]");
      });
      it('should parse for x in [ 1 ] then print x', function() {
        return expect(parse('for x in [ 1 ] then print x')).to.equal("[forIn! x undefined [[] [1]] [print x]]");
      });
      it('should parse for x in [] then print x', function() {
        return expect(parse('for x in [] then print x')).to.equal("[forIn! x undefined [[]] [print x]]");
      });
      it('should parse {(a,b) -> `( ^a + ^b )}(1,2)', function() {
        return expect(parse('{(a,b) -> `( ^a + ^b )}(1,2)')).to.equal("[binary! concat() [{} [-> [() [binary! , a b]] [prefix! ` [() [binary! + [prefix! ^ a] [prefix! ^ b]]]]]] [() [binary! , 1 2]]]");
      });
      it('should parse { -> ( a )}()', function() {
        return expect(parse('{ -> ( a )}()')).to.equal("[binary! concat() [{} [-> [] [() a]]] [()]]");
      });
      it('should parse m #= (a,b) -> `( ^a + ^b); m(1,2)', function() {
        return expect(parse('m #= (a,b) -> `( ^a + ^b ); m(1,2)')).to.equal("[#= m [-> [() [binary! , a b]] [begin! [prefix! ` [() [binary! + [prefix! ^ a] [prefix! ^ b]]]] [binary! concat() m [() [binary! , 1 2]]]]]]");
      });
      return it('should parse (1) ', function() {
        return expect(parse('(1)')).to.equal("[() 1]");
      });
    });
    describe("prefix: ", function() {
      return it('should parse +1', function() {
        return expect(parse('+1 ')).to.equal("[prefix! + 1]");
      });
    });
    describe("line and indent operator: ", function() {
      it("parse (1+2\n * 3+6)", function() {
        return expect(parse('(1+2\n * 3+6)')).to.equal("[() [binary! + [binary! + 1 [binary! * 2 3]] 6]]");
      });
      it("parse 1+2\n * 3+6\n + 5+8", function() {
        return expect(parse('(1+2\n * 3+6\n + 5+8)')).to.equal("[() [binary! + [binary! + [binary! + [binary! + 1 [binary! * 2 3]] 6] 5] 8]]");
      });
      it('should parse ()', function() {
        return expect(parse('()').value).to.equal(void 0);
      });
      it('should parse ` { ^1 { ^2 ^&{3 4}}}', function() {
        return expect(parse('`{ ^1 { ^2 ^&{3 4}}}')).to.equal("[prefix! ` [{} [[prefix! ^ 1] [{} [[prefix! ^ 2] [prefix! ^& [{} [3 4]]]]]]]]");
      });
      return it('should parse `{ ^1 { ^2 ^&{3 4}}}', function() {
        return expect(parse('`{ ^1 { ^2 ^&{3 4}}}')).to.equal("[prefix! ` [{} [[prefix! ^ 1] [{} [[prefix! ^ 2] [prefix! ^& [{} [3 4]]]]]]]]");
      });
    });
    describe("new parser tests from samples: ", function() {
      it("parse if 1 then 2\nprint 3", function() {
        return expect(parse('if 1 then 2\nprint 3')).to.equal("[begin! [if 1 2] [print 3]]");
      });
      it("parse if 1 then 2 else 3\nprint 4", function() {
        return expect(parse('if 1 then 2 else 3\nprint 4')).to.equal("[begin! [if 1 2 3] [print 4]]");
      });
      return it('should parse console.log : and 1 2', function() {
        var x;
        x = parse('console.log : and 1 2');
        return expect(x).to.deep.equal("[[binary! . console log] [and 1 2]]");
      });
    });
    describe("new parser tests from samples 2: ", function() {
      it('should parse x = /!-h\b|-r\b|-v\b|-b\b/', function() {
        var x;
        x = parse('x = /!-h\b|-r\b|-v\b|-b\b/');
        return expect(x).to.deep.equal("[= x [regexp! /-h\b|-r\b|-v\b|-b\b/]]");
      });
      it('should parse a = 2\nx = : 1', function() {
        return expect(function() {
          return parse('a = 2\nx = : 1');
        }).to["throw"](/unexpected ":"/);
      });
      it('should parse a = 2\nx = 1', function() {
        return expect(parse('a = 2\nx = 1')).to.equal("[begin! [= a 2] [= x 1]]");
      });
      it('should parse error: 1', function() {
        var x;
        x = parse('error: 1 ');
        return expect(x).to.deep.equal("[error 1]");
      });
      it('should parse error: new: Error "Error: No Input file given" ', function() {
        var x;
        x = parse('error: new: Error "Error: No Input file given" ');
        return expect(x).to.deep.equal("[error [new [Error \"Error: No Input file given\"]]]");
      });
      it('should parse new : Error', function() {
        var x;
        x = parse('new : Error');
        return expect(x).to.deep.equal("[new Error]");
      });
      return it('should parse new: Error "Error: No Input file given" ', function() {
        var x;
        x = parse('new : Error "Error: No Input file given"');
        return expect(x).to.deep.equal("[new [Error \"Error: No Input file given\"]]");
      });
    });
    describe("assign to outer scope var: ", function() {
      it("should parse @@a", function() {
        return expect(parse('@@a')).to.equal("[prefix! @@ a]");
      });
      it("should parse @@a+1", function() {
        return expect(parse('@@a+1')).to.equal("[binary! + [prefix! @@ a] 1]");
      });
      return it("should parse a=1; -> @@a=1", function() {
        return expect(parse('a=1; -> @@a=1')).to.equal("[begin! [binary! = a 1] [-> [] [binary! = [prefix! @@ a] 1]]]");
      });
    });
    it('should parse [1 2]', function() {
      return expect(parse("[1 2]")).to.equal("[[] [[1 2]]]");
    });
    return it('should parse [1, 2]', function() {
      return expect(parse("[1, 2]")).to.equal("[[] [1 2]]");
    });
  });
});
