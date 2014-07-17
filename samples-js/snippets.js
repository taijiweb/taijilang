if (typeof window === undefined)
  console.log("Not Running on browser");
else console.log("Running on browser");
var arr = ["list!",[1,2,3,4,5]];
console.log(arr[2]);
[console.log("Nos are not equal")];

if (typeof console === "object")
  console.log("console is an object");
else console.log("console is not an object");

if (typeof console === "object")
  console.log("console is an object");
else console.log("console is not an object");

if (typeof console === "object")
  console.log("console is an object");
else console.log("console is not an object");

if (typeof console === "object")
  if (arr)
    console.log("console is an object");
  else console.log("console is not an object");

if (typeof console === "object")
  if (arr)
    if (arr !== 1)
      console.log("console is an object");
    else console.log("console is not an object");
  else console.log("console is not an object");

if (Object.prototype.toString.call(console) == "[object Array]")
  console.log("console is an array");
else console.log("console is not an array");
var _ = require("underscore");
Array.prototype.forEach.call(["list!",[1,2,3]], function (elem, i, list) {
  return console.log(elem);
});
Array.prototype.forEach.call([1, 2, 3], function (elem, i, list) {
  return console.log(elem);
});