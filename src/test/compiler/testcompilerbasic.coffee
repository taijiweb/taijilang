chai = require("chai")
expect = chai.expect
iit = it.only
idescribe = describe.only
ndescribe = ->

lib = '../../lib/'
{Parser} = require lib+'parser'
{constant, isArray, str} = require lib+'parser/base'
taiji = require lib+'taiji'

compile = (code) ->
  head = 'taiji language 0.1\n'
  taiji.compile(head+code, taiji.rootModule, taiji.builtins, {})

compileNoOptimize = (code) ->
  head = 'taiji language 0.1\n'
  taiji.compileNoOptimize(head+code, taiji.rootModule, taiji.builtins, {})

describe "compiler basic: ",  ->
  describe "compile number: ",  ->
    it "compile 1", ->
      expect(compile('1')).to.equal '1'
    it "compile 01", ->
      expect(compile('01')).to.equal '1'
    it "compile 0x01", ->
      expect(compile('0x01')).to.equal '1'
    it "compile 0xa", ->
      expect(compile('0xa')).to.equal '10'
      expect(compile('0xa')).to.equal '10'
    it "compile 1.", ->
      expect(-> compile('1.')).to.throw /fail to look up symbol from environment/

  describe "compile string: ",  ->
    describe "compile interpolate string: ",  ->
      it "compile a", ->
        expect(compile('"a"')).to.equal "\"a\""
      it "compile a\\b", ->
        expect(compile('"a\\b"')).to.equal "\"a\\b\""
      it "compile '''a\"'\\n'''", ->
        expect(compile('"""a\\"\'\\n"""')).to.equal "\"a\\\"'\\n\""
      it """compile "a(1)" """, ->
        expect(compile('"a(1)"')).to.equal "\"a(1)\""
      it """compile "a[1]" """, ->
        expect(compile('"a[1]"')).to.equal "\"a[\" + JSON.stringify([1]) + \"]\""
      it """compile "a[1] = $a[1]" """, ->
        expect(compile('var a; "a[1] = $a[1]"')).to.equal "var a;\n\"a[\" + JSON.stringify([1]) + \"] = \" + JSON.stringify(a[1]);"

    describe "compile raw string without interpolation: ",  ->
      it "compile '''a\\b'''", ->
        expect(compile("'''a\\b'''")).to.deep.equal "\"a\\b\""
      it "compile '''a\\b\ncd'''", ->
        expect(compile("'''a\\b\ncd'''")).to.deep.equal "\"a\\b\\ncd\""
      it "compile '''a\"'\\n'''", ->
        expect(compile("'''a\"'\\n'''")).to.deep.equal "\"a\\\"'\\n\""

    describe "compile escape string without interpolation: ",  ->
      it "compile 'a\\b'", ->
        expect(compile("'a\\b'")).to.deep.equal "\"a\\b\""
      it "compile 'a\\b\ncd'", ->
        expect(compile("'a\\b\ncd'")).to.deep.equal "\"a\\b\\ncd\""
      it "compile 'a\"\\\"\'\\n'", ->
        expect(compile("'a\"\\\"\\'\\n'")).to.deep.equal "\"a\\\"\\\"\\'\\n\""
      it "compile 'a\"\\\"\\'\\n\n'", ->
        expect(compile("'a\"\\\"\\'\\n\n'")).to.deep.equal "\"a\\\"\\\"\\'\\n\\n\""
      it "compile 'a\"\\\"\n\'\\n'", ->
        expect(compile("'a\"\\\"\n\\'\\n\n'")).to.deep.equal "\"a\\\"\\\"\\n\\'\\n\\n\""

  describe "parenthesis: ",  ->
    it 'should compile ()', ->
      expect(compile('()')).to.deep.equal ''
    it 'should compile (a)', ->
      expect(compile('var a; (a)')).to.deep.equal 'var a;\na;'
    it 'should compile (a,b)', ->
      expect(compile('var a, b; (a,b)')).to.deep.equal 'var a, b;\n[a, b];'

  describe "@ as this", ->
    it 'should compile @', ->
      expect(compile('@')).to.deep.equal 'this'
    it 'should compile @a', ->
      expect(compile('@a')).to.deep.equal "this.a"
    it 'should compile @ a', ->
      expect(compile('var a; @ a')).to.deep.equal "var a;\nthis(a);"

  describe ":: as prototype: ", ->
    it 'should compile @:: ', ->
      expect(compile('@::')).to.deep.equal "this.prototype"
    it 'should compile a:: ', ->
      expect(compile('var a; a::')).to.deep.equal "var a;\na.prototype;"
    it 'should compile a::b ', ->
      expect(compile('var a; a::b')).to.deep.equal "var a;\na.prototype.b;"
    it 'should compile ::a', ->
      expect(compile('::a')).to.deep.equal "this.prototype.a"

  describe "quote expression:", ->
    describe "quote expression:", ->
      it 'should compile ~ a.b', ->
        expect(compile('~ a.b')).to.deep.equal "[\"attribute!\",\"a\",\"b\"]"
      it 'should compile ~ print a b', ->
        expect(compile('~ print a b')).to.deep.equal "[\"print\",\"a\",\"b\"]"
      it 'should compile ` print a b', ->
        expect(compile('` print a b')).to.deep.equal "[\"print\", \"a\", \"b\"]"
      it 'should compile ~ print : min a \n abs b', ->
        expect(compile('~ print : min a \n abs b')).to.deep.equal "[\"print\",[\"min\",\"a\",[\"abs\",\"b\"]]]"
      it 'should compile ` a.b', ->
        expect(compile('` a.b')).to.deep.equal "[\"attribute!\", \"a\", \"b\"]"

  describe "unquote expression:", ->
    describe "unquote expression: ", ->
      it 'should compile ` ^ a.b', ->
        expect(compile('var a; ` ^ a.b')).to.deep.equal 'var a;\na.b;'
      it 'should compile ` ^ [print a b]', ->
        expect(compile('var a, b; ` ^ [print a b]')).to.deep.equal "var a, b;\n[console.log(a, b)];"
      it 'should compile ` ^ {print a b}', ->
        expect(compile('var a, b; ` ^ {print a b}')).to.deep.equal "var a, b;\nconsole.log(a, b);"
      it 'should compile ` ^ print a b', ->
        expect(compile('var a, b; ` ^ print a b')).to.deep.equal "var a, b;\nconsole.log(a, b);"
      it 'should compile ` ^.~print a b', ->
        expect(compile('` ^.~print a b')).to.deep.equal "[\"print\", \"a\", \"b\"]"

    describe "unquote-splice expression: ", ->
      it 'should compile `  ^& a.b', ->
        expect(compile('var a; ` ^& a.b')).to.deep.equal "var a;\na.b;"
      it 'should compile `  ^&a.b', ->
        expect(compile('var a; ` ^&a.b')).to.deep.equal "var a;\na.b;"
      it 'should compile ` ( ^&a).b', ->
        expect(compile('var a; ` ( ^&a).b')).to.deep.equal "var a;\n[\"attribute!\"].concat(a).concat([\"b\"]);"
      it 'should compile ` ^@ [print a b]', ->
        expect(compile('var a, b; ` ^& [print a b]')).to.deep.equal "var a, b;\n[console.log(a, b)];"
      it 'should compile ` ^@ {print a b}', ->
        expect(compile('var a, b; ` ^& {print a b}')).to.deep.equal "var a, b;\nconsole.log(a, b);"
      it 'should compile ` ^ print a b', ->
        expect(compile('var a, b; ` ^ [print a b]')).to.deep.equal "var a, b;\n[console.log(a, b)];"
      it 'should compile ` ^ print a b', ->
        expect(compile('var a, b; ` ^ {print a b}')).to.deep.equal "var a, b;\nconsole.log(a, b);"

  describe "hash!: ",  ->
    describe "hash! expression: ",  ->
      it 'should compile {.1:2.}', ->
        expect(compile('{.1:2.}')).to.deep.equal "{ 1: 2}"
      it 'should compile {.1:2; 3:4.}', ->
        expect(compile('{.1:2; 3:4.}')).to.deep.equal "{ 1: 2, 3: 4}"
      it 'should compile {.1:2; 3:abs\n    5.}', ->
        expect(compile('extern! abs; {. 1:2; 3:abs\n    5.}')).to.deep.equal "{ 1: 2, 3: abs(5)}"
      it 'should compile {. 1:2; 3:4;\n 5:6.}', ->
        expect(compile('{. 1:2; 3:4;\n 5:6.}')).to.equal "{ 1: 2, 3: 4, 5: 6}"
      it 'should compile {. 1:2; 3:\n 5:6\n.}', ->
        expect(compile('{. 1:2; 3:\n 5:6\n.}')).to.deep.equal "{ 1: 2, 3: { 5: 6}}"
      it 'should compile {. 1:2; 3:\n 5:6;a=>8\n.}', ->
        expect(compile('var a; {. 1:2; 3:\n 5:6;a=>8\n.}')).to.deep.equal "var a, hash = { 5: 6};\nhash[a] = 8;\n{ 1: 2, 3: hash}"

  describe  "line comment block",  ->
    it 'should compile // line comment\n 1', ->
      expect(compile('// line comment\n 1')).to.deep.equal '1'
    it 'should compile // line comment\n 1', ->
      expect(compile('// line comment\n 1')).to.deep.equal '1'
    it 'should compile var x; x\n // line comment block\n 1', ->
      expect(compile('var x; x\n // line comment block\n 1')).to.deep.equal "var x;\nx(1);"
    it 'should compile // line comment block\n 1 2, 3 4', ->
      expect(compile('// line comment block\n 1 2, 3 4')).to.deep.equal '[1, 2];\n[3, 4];'
    it 'should compile // line comment block\n 1 2, 3 4\n 5 6, 7 8', ->
      expect(compile('// line comment block\n 1 2; 3 4\n 5 6; 7 8')).to.deep.equal "[1, 2];\n[3, 4];\n[5, 6];\n[7, 8];"
    it 'should compile // \n 1 2, 3 4\n // \n5 6, 7 8', ->
      expect(compile('// \n 1 2, 3 4\n // \n  5 6, 7 8')).to.deep.equal "[1, 2];\n[3, 4];\n[5, 6];\n[7, 8];"
    it 'should compile // \n 1 2, 3 4\n // \n5 6, 7 8', ->
      expect(compile('// \n 1 2, 3 4\n // \n  5 6, 7 8\n // \n  9 10, 11 12')).to.deep.equal "[1, 2];\n[3, 4];\n[5, 6];\n[7, 8];\n[9, 10];\n[11, 12];"

  describe  "block comment ",  ->
    it 'should compile /. some comment', ->
      expect(compile('/. some comment')).to.deep.equal ''
    it 'should compile /. some \n  embedded \n  comment', ->
      expect(compile('/. some \n  embedded \n  comment')).to.deep.equal ''
