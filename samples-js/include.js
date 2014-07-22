var name, module = function () {
  var exports = { };
  return exports;
}();

for (name in module)
  if (__hasProp.call(module, name))
    name = module[name];