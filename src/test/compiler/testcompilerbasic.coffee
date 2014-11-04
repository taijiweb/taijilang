chai = require("chai")
expect = chai.expect
iit = it.only
idescribe = describe.only
ndescribe = ->

lib = '../../lib/'
{Parser} = require lib+'parser'
{constant, isArray, str} = require lib+'parser/base'
taiji = require lib+'taiji'
{realCode} = require lib+'utils'

head = 'taiji language 0.1\n'
parse = (text) ->
  parser = new Parser()
  x = parser.parse(head+text, parser.module, 0)
  str x.body

compile = (code) ->
  head = 'taiji language 0.1\n'
  realCode taiji.compile(head+code, taiji.rootModule, taiji.builtins, {})

compileNoOptimize = (code) ->
  head = 'taiji language 0.1\n'
  realCode taiji.compileNoOptimize(head+code, taiji.rootModule, taiji.builtins, {})

expectCompile = (srcCode, result) -> expect(compile(srcCode)).to.have.string result
itCompile = (srcCode, result) -> it 'should compile'+srcCode, ->  expectCompile(srcCode, result)
iitCompile = (srcCode, result) -> iit 'should compile '+srcCode, ->  expectCompile(srcCode, result)

expectParse = (srcCode, result) -> expect(parse(srcCode)).to.have.string result
itParse = (srcCode, result) -> it 'should parse'+srcCode, ->  expectParse(srcCode, result)
iitParse = (srcCode, result) -> iit 'should parse '+srcCode, ->  expectParse(srcCode, result)

ndescribe "compiler basic: ",  ->
  describe "compile number: ",  ->
    iit "compile 1", ->
      expect(compile('1')).to.have.string '1'
    it "compile 01", ->
      expect(compile('01')).to.have.string '1'
    it "compile 0x01", ->
      expect(compile('0x01')).to.have.string '1'
    it "compile 0xa", ->
      expect(compile('0xa')).to.have.string '10'
      expect(compile('0xa')).to.have.string '10'
    it "compile 1.", ->
      expect(-> compile('1.')).to.throw /fail to look up symbol from environment/

  ndescribe "compile string: ",  ->
    describe "compile interpolate string: ",  ->
      it "compile a", ->
        expect(compile('"a"')).to.have.string "\"a\""
      it "compile a\\b", ->
        expect(compile('"a\\b"')).to.have.string "\"a\\b\""
      it "compile '''a\"'\\n'''", ->
        expect(compile('"""a\\"\'\\n"""')).to.have.string "\"a\\\"'\\n\""
      it """compile "a(1)" """, ->
        expect(compile('"a(1)"')).to.have.string "\"a(1)\""
      it """compile "a[1]" """, ->
        expect(compile('"a[1]"')).to.have.string "\"a[\" + JSON.stringify([1]) + \"]\""
      it """compile "a[1] = $a[1]" """, ->
        expect(compile('var a; "a[1] = $a[1]"')).to.have.string "var a;\n\"a[\" + JSON.stringify([1]) + \"] = \" + JSON.stringify(a[1])"

    ndescribe "compile raw string without interpolation: ",  ->
      it "compile '''a\\b'''", ->
        expect(compile("'''a\\b'''")).to.have.string "\"a\\b\""
      it "compile '''a\\b\ncd'''", ->
        expect(compile("'''a\\b\ncd'''")).to.have.string "\"a\\b\\ncd\""
      it "compile '''a\"'\\n'''", ->
        expect(compile("'''a\"'\\n'''")).to.have.string "\"a\\\"'\\n\""

    ndescribe "compile escape string without interpolation: ",  ->
      it "compile 'a\\b'", ->
        expect(compile("'a\\b'")).to.have.string "\"a\\b\""
      it "compile 'a\\b\ncd'", ->
        expect(compile("'a\\b\ncd'")).to.have.string "\"a\\b\\ncd\""
      it "compile 'a\"\\\"\'\\n'", ->
        expect(compile("'a\"\\\"\\'\\n'")).to.have.string "\"a\\\"\\\"\\'\\n\""
      it "compile 'a\"\\\"\\'\\n\n'", ->
        expect(compile("'a\"\\\"\\'\\n\n'")).to.have.string "\"a\\\"\\\"\\'\\n\\n\""
      it "compile 'a\"\\\"\n\'\\n'", ->
        expect(compile("'a\"\\\"\n\\'\\n\n'")).to.have.string "\"a\\\"\\\"\\n\\'\\n\\n\""

  ndescribe "parenthesis: ",  ->
    it 'should compile ()', ->
      expect(compile('()')).to.have.string ''
    it 'should compile (a)', ->
      expect(compile('var a; (a)')).to.have.string 'var a;\na'
    it 'should compile (a,b)', ->
      expect(compile('var a, b; (a,b)')).to.have.string 'var a, b;\n[a, b]'

  ndescribe "@ as this", ->
    it 'should compile @', ->
      expect(compile('@')).to.have.string 'this'
    it 'should compile @a', ->
      expect(compile('@a')).to.have.string "this.a"
    it 'should compile @ a', ->
      expect(compile('var a; @ a')).to.have.string "var a;\nthis(a)"

  ndescribe ":: as prototype: ", ->
    it 'should compile @:: ', ->
      expect(compile('@::')).to.have.string "this.prototype"
    it 'should compile a:: ', ->
      expect(compile('var a; a::')).to.have.string "var a;\na.prototype"
    it 'should compile a::b ', ->
      expect(compile('var a; a::b')).to.have.string "var a;\na.prototype.b"
    it 'should compile ::a', ->
      expect(compile('::a')).to.have.string "this.prototype.a"

  ndescribe "quote expression:", ->
    describe "quote expression:", ->
      it 'should compile ~ a.b', ->
        expect(compile('~ a.b')).to.have.string "[\"attribute!\",\"a\",\"b\"]"
      it 'should compile ~ print a b', ->
        expect(compile('~ print a b')).to.have.string "[\"print\",\"a\",\"b\"]"
      it 'should compile ` print a b', ->
        expect(compile('` print a b')).to.have.string "[\"print\", \"a\", \"b\"]"
      it 'should compile ~ print : min a \n abs b', ->
        expect(compile('~ print : min a \n abs b')).to.have.string "[\"print\",[\"min\",\"a\",[\"abs\",\"b\"]]]"
      it 'should compile ` a.b', ->
        expect(compile('` a.b')).to.have.string "[\"attribute!\", \"a\", \"b\"]"

  ndescribe "unquote expression:", ->
    describe "unquote expression: ", ->
      it 'should compile ` ^ a.b', ->
        expect(compile('var a; ` ^ a.b')).to.have.string 'var a;\na.b'
      it 'should compile ` ^ [print a b]', ->
        expect(compile('var a, b; ` ^ [print a b]')).to.have.string "var a, b;\n[console.log(a, b)]"
      it 'should compile ` ^ {print a b}', ->
        expect(compile('var a, b; ` ^ {print a b}')).to.have.string "var a, b;\nconsole.log(a, b)"
      it 'should compile ` ^ print a b', ->
        expect(compile('var a, b; ` ^ print a b')).to.have.string "var a, b;\nconsole.log(a, b)"
      it 'should compile ` ^.~print a b', ->
        expect(compile('` ^.~print a b')).to.have.string "[\"print\", \"a\", \"b\"]"

    ndescribe "unquote-splice expression: ", ->
      it 'should compile `  ^& a.b', ->
        expect(compile('var a; ` ^& a.b')).to.have.string "var a;\na.b"
      it 'should compile `  ^&a.b', ->
        expect(compile('var a; ` ^&a.b')).to.have.string "var a;\na.b"
      it 'should compile ` ( ^&a).b', ->
        expect(compile('var a; ` ( ^&a).b')).to.have.string "var a;\n[\"attribute!\"].concat(a).concat([\"b\"])"
      it 'should compile ` ^@ [print a b]', ->
        expect(compile('var a, b; ` ^& [print a b]')).to.have.string "var a, b;\n[console.log(a, b)]"
      it 'should compile ` ^@ {print a b}', ->
        expect(compile('var a, b; ` ^& {print a b}')).to.have.string "var a, b;\nconsole.log(a, b)"
      it 'should compile ` ^ print a b', ->
        expect(compile('var a, b; ` ^ [print a b]')).to.have.string "var a, b;\n[console.log(a, b)]"
      it 'should compile ` ^ print a b', ->
        expect(compile('var a, b; ` ^ {print a b}')).to.have.string "var a, b;\nconsole.log(a, b)"

  ndescribe "hash!: ",  ->
    describe "hash! expression: ",  ->
      itCompile '{}', "{ }"

      it 'should compile {.1:2.}', ->
        expect(compile('{.1:2.}')).to.have.string "{ 1: 2}"
      it 'should compile {.1:2; 3:4.}', ->
        expect(compile('{.1:2; 3:4.}')).to.have.string "{ 1: 2, 3: 4}"
      it 'should compile {.1:2; 3:abs\n    5.}', ->
        expect(compile('extern! abs; {. 1:2; 3:abs\n    5.}')).to.have.string "{ 1: 2, 3: abs(5)}"
      it 'should compile {. 1:2; 3:4;\n 5:6.}', ->
        expect(compile('{. 1:2; 3:4;\n 5:6.}')).to.have.string "{ 1: 2, 3: 4, 5: 6}"
      it 'should compile {. 1:2; 3:\n 5:6\n.}', ->
        expect(compile('{. 1:2; 3:\n 5:6\n.}')).to.have.string "{ 1: 2, 3: { 5: 6}}"
      it 'should compile {. 1:2; 3:\n 5:6;a=>8\n.}', ->
        expect(compile('var a; {. 1:2; 3:\n 5:6;a=>8\n.}')).to.have.string "var a, hash = { 5: 6};\nhash[a] = 8;\n{ 1: 2, 3: hash}"

  ndescribe  "line comment block",  ->
    it 'should compile // line comment\n 1', ->
      expect(compile('// line comment\n 1')).to.have.string '1'
    it 'should compile // line comment\n 1', ->
      expect(compile('// line comment\n 1')).to.have.string '1'
    it 'should compile var x; x\n // line comment block\n 1', ->
      expect(compile('var x; x\n // line comment block\n 1')).to.have.string "var x;\nx(1)"
    it 'should compile // line comment block\n 1 2, 3 4', ->
      expect(compile('// line comment block\n 1 2, 3 4')).to.have.string '[1, 2];\n[3, 4]'
    it 'should compile // line comment block\n 1 2, 3 4\n 5 6, 7 8', ->
      expect(compile('// line comment block\n 1 2; 3 4\n 5 6; 7 8')).to.have.string "[1, 2];\n[3, 4];\n[5, 6];\n[7, 8]"
    it 'should compile // \n 1 2, 3 4\n // \n5 6, 7 8', ->
      expect(compile('// \n 1 2, 3 4\n // \n  5 6, 7 8')).to.have.string "[1, 2];\n[3, 4];\n[5, 6];\n[7, 8]"
    it 'should compile // \n 1 2, 3 4\n // \n5 6, 7 8', ->
      expect(compile('// \n 1 2, 3 4\n // \n  5 6, 7 8\n // \n  9 10, 11 12')).to.have.string "[1, 2];\n[3, 4];\n[5, 6];\n[7, 8];\n[9, 10];\n[11, 12]"

  ndescribe  "block comment ",  ->
    it 'should compile /. some comment', ->
      expect(compile('/. some comment')).to.have.string ''
    it 'should compile /. some \n  embedded \n  comment', ->
      expect(compile('/. some \n  embedded \n  comment')).to.have.string ''
    it 'should compile /// line comment\n 1', ->
      expect(compile('/// line comment\n 1')).to.equal "/// line comment;\n1"