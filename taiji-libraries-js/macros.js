var __slice = [].slice, 
    __hasProp = { }.hasOwnProperty;
/// end of prelude;

var arrayInit = function (len, obj) {
      var ret = [];
      return ret;
    }, 
    
    arrayInit2d = function (m, n, obj) {
      var ret = [];
      return ret;
    };
////////////////////// Iteration and Looping ////////////////////
;

var map = function () {
      var arr = arguments[0], 
          rest = arguments.length >= 2? __slice.call(arguments, 1): [];
      return arr.map(rest);
    }, 
    
    filter = function () {
      var rest = arguments.length >= 1? __slice.call(arguments, 0): [];
      return Array.prototype.filter.call(rest);
    }, 
    
    some = function () {
      var rest = arguments.length >= 1? __slice.call(arguments, 0): [];
      return Array.prototype.some.call(rest);
    }, 
    
    every = function () {
      var rest = arguments.length >= 1? __slice.call(arguments, 0): [];
      return Array.prototype.every.call(rest);
    };
//////////////////// Templates ////////////////////////////
;
/////////////////// Callback Sequence ////////////////////;

//////////////////; Unit Testing ////////////////////////////;

//////////////// Monads //////////////////////////////////;

function () {
        return { mBind: [function (mv, mf) {
          return mf(mv);
        }], mResult: [function (v) {
          return v;
        }]};
      }