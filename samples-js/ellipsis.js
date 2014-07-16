__slice = [].slice;

(function () {
  var x = arguments.length >= 1? __slice.call(arguments, 0): [];
  return x;
});

(function () {
  var x = arguments[0], 
      y = arguments.length >= 2? __slice.call(arguments, 1): [];
  return x;
});

(function () {
  var x = arguments[0], 
      y = arguments[1], 
      z = arguments.length >= 3? __slice.call(arguments, 2): [];
  return x;
});

(function () {
  var i, x = arguments[0], 
      y = arguments[1], 
      z = arguments.length >= 4? __slice.call(arguments, 2, i = arguments.length - 1): (i = 2,
        []), 
      a = arguments[i++];
  return x;
});

(function () {
  var i, x = arguments[0], 
      y = arguments[1], 
      z = arguments.length >= 4? __slice.call(arguments, 2, i = arguments.length - 1): (i = 2,
        []), 
      a = arguments[i++];
  return x;
});

(function () {
  var i, x = arguments[0], 
      y = arguments[1], 
      z = arguments.length >= 5? __slice.call(arguments, 2, i = arguments.length - 2): (i = 2,
        []), 
      a = arguments[i++], 
      b = arguments[i++];
  return x;
});

(function () {
  var i, z = arguments.length >= 3? __slice.call(arguments, 0, i = arguments.length
        - 2): (i = 0, []), 
      a = arguments[i++], 
      b = arguments[i++];
  return z;
});

(function () {
  var i, x = arguments[0], 
      y = arguments[1], 
      z = arguments.length >= 8? __slice.call(arguments, 2, i = arguments.length - 5): (i = 2,
        []), 
      a = arguments[i++], 
      b = arguments[i++], 
      c = arguments[i++], 
      d = arguments[i++], 
      e = arguments[i++];
  return z;
});

var m2 = function () {
  var i, x = arguments.length >= 2? __slice.call(arguments, 0, i = arguments.length
        - 1): (i = 0, []), 
      b = arguments[i++];
  console.log(x);
  return console.log(b);
};
m2(1, 2, 3);
m2(1, 2, 3);
var x, y, z, a, m, n, p, q;
x = 1;
y = [2, 3];
z = 4;
a = [1, 2, 3, 4];
var i, lst = a;
x = lst[0];
y = lst.length >= 3? __slice.call(lst, 2, i = lst.length - 1): (i = 1, []);
z = lst[i++];
a = [1, 2, 3, 4, 5, 6];
var i2, lst2 = a;
x = lst2[0];
y = lst2[1];
z = lst2.length >= 4? __slice.call(lst2, 3, i2 = lst2.length - 1): (i2 = 2, []);
m = lst2[i2++];
var i3, lst3 = a;
x = lst3[0];
y = lst3[1];
z = lst3.length >= 5? __slice.call(lst3, 3, i3 = lst3.length - 2): (i3 = 2, []);
m = lst3[i3++];
n = lst3[i3++];

(function () {
  var i, a = arguments[0], 
      x = arguments.length >= 4? __slice.call(arguments, 1, i = arguments.length - 2): (i = 1,
        []), 
      b = arguments[i++], 
      c = arguments[i++];
  a = 1;
  b = a;
  c = { };
  return 1;
});