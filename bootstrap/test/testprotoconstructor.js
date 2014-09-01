var chai = require("chai");
var expect = chai.expect;
var iit = it.only;
var idescribe = describe.only;
var ndescribe = function() {};
var lib = '../lib/';
var _ref = require(lib + 'utils'), str = _ref.str, extend = _ref.extend;
var taiji = require(lib + 'taiji');

describe("prototype constructor: ", function() {
    it('should constructor and instanceof', function () {
        var A = function(){}
        var B = function(){}
        b = new B()
        expect(b.constructor).to.equal(B);
        expect(b instanceof B).to.be.ok
    });
    it('should derived constructor and instanceof', function () {
        var A = function(){}
        var B = function(){}
        function ctor() { this.constructor = B; }
        ctor.prototype = A.prototype;
        B.prototype = new ctor;
        b = new B()
        expect(b.constructor).to.equal(B);
        expect(b instanceof B).to.be.ok
        expect(b instanceof A).to.be.ok
    });
    it('should inherit without ctor', function () {
        var A = function(){}
        var B = function(){}
        B.prototype = A.prototype;
        b = new B()
        expect(b.constructor).to.not.equal(B);
        expect(b.constructor).to.equal(A);
        expect(b instanceof B).to.be.ok
        expect(b instanceof A).to.be.ok
    });
});