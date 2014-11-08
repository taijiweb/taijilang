var expect, iit, ndescribe, nit, strConvert, _ref;

_ref = require('../utils'), expect = _ref.expect, ndescribe = _ref.ndescribe, iit = _ref.iit, nit = _ref.nit, strConvert = _ref.strConvert;

ndescribe("convert: ", function() {
  return describe("convert number: ", function() {
    return iit("convert 1", function() {
      return expect(strConvert('1')).to.equal('1');
    });
  });
});
