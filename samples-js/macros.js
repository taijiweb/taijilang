__slice = [].slice;
var closure = function (exp, env) {
    var expanded;
    expanded = macroFn.apply(null, exp);
    return convert(expanded, env);
  };
closure(x, y, function () {
  return x(y);
});
closure(x, y, function () {
  return console.log(x, y);
});
var a2 = 1, 
    b = 2;
console.log(a2)(console.log(b));
var i = 0;

do {
  console.log(i++)();
} while (!(i === 10));
var a3 = 1, 
    b2 = 2;
console.log(a3)(console.log(b2));
var a4 = 1, 
    b3 = 2;
console.log(a4)();
var a5 = 1;
console.log(a5)();

do {
  a();
} while (a === 1);

do {
  a();
} while (!(a === 1));
3;