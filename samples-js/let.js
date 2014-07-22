var name = "Jonh", 
    email = "john@example.com", 
    tel = "555-555-5556";
console.log("name: " + JSON.stringify(name) + " email: " + JSON.stringify(email) + " tel:"
  + JSON.stringify(tel));
var a = 1, 
    a2 = 2;
console.log(a2);

var f = function (x) {
  if (x === 1)
    return 1;
  else return f(x - 1);
};
f(3);

var f2 = function (x, acc) {
      var f2;
      
      while (1)
        if (x === 1)
          return acc;
        else { 
          acc = x + acc;
          x = x - 1;
        };
    }, 
    t = f2(3, 0), 
    
    f3 = function (x) {
      var f3 = 1;
      
      while (1)
        if (x === 1)
          return f3;
        else { 
          f3 = x + f3;
          x = x - 1;
        };
    }, 
    t2 = f3(3), 
    
    odd = function (x) {
      return loopFn(x, odd);
    }, 
    
    even = function (x) {
      return loopFn(x, even);
    }, 
    
    loopFn = function (x, fn) {
      var loopFn;
      
      while (1)
        if (fn === odd)
          if (x === 0)
            return 0;
          else { 
            x = x - 1;
            fn = even;
          }
        else if (fn === even)
          if (x === 0)
            return 1;
          else { 
            x = x - 1;
            fn = odd;
          };
    }, 
    t3 = odd(3), 
    
    gcd = function (a, b) {
      var gcd;
      
      while (1)
        if (a > b)
          a = a - b;
        else if (b > a)
          b = b - a;
        else return a;
    }, 
    t4 = gcd(9, 12);
t4;