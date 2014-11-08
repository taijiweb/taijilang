{expect, ndescribe, iit, nit, strConvert} = require '../utils'

ndescribe "convert: ",  ->
  describe "convert number: ",  ->
    iit "convert 1", ->
      expect(strConvert('1')).to.equal '1'