var name, __slice = [].slice, 
    __hasProp = { }.hasOwnProperty, 
    
    module = function () {
      var a, exports = { };
      exports["a"] = a;
      exports["b"] = 1;
      return exports;
    }();

for (name in module)
  if (__hasProp.call(module, name))
    name = module[name];

var module = function () {
  var a, exports = { };
  exports["a"] = a;
  exports["b"] = 1;
  return exports;
}();