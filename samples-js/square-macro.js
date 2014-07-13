var square = function (n) {
  return n * n;
};
console.log(square(10));
var square! = function (exp, env) {
    var expanded;
    expanded = macroFn.apply(null, exp);
    return convert(expanded, env);
  };
console.log(square!(10));
var x = 1;
square!(x);
var i = 2;
console.log(square!(i++));
var x2 = i++;
console.log([x2 * x2]);