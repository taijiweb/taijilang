(function (x, y) {
  return function () {
    return x(y);
  };
})(x, y);

(function (x) {
  return y(function () {
    return console.log(x, y);
  });
})(x);
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

(function () {
  return ["+",1,2];
})();