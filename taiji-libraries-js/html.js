var __slice = [].slice, 
    __hasProp = { }.hasOwnProperty;
/// end of prelude;

var expandTag = function () {
  var name = arguments[0], 
      args = arguments.length >= 2? __slice.call(arguments, 1): [];
  
  if (isString(name)){ 
    var ret = "<" + name;
    
    if (isObject(args[0])){ 
      var attr = args.shift();
      ret += templateRepeatKey(attr, " ", key, "=", "\"", value, "\"");
    };
    
    if (args.length > 0 || name === "script")
      ;
    else ret += "/>";
    return ret;
  }
  else return "";
};
exports.expandTag = expandTag;
var tagNames = "\r\na abbr address area article aside audio b base bdi bdo blockquote body br button canvas\r\ncaption cite code col colgroup command data datalist dd del details dfn div dl dt em embed fieldset\r\nfigcaption figure footer form h1 h2 h3 h4 h5 h6 head header hgroup  hr html i iframe img input ins\r\nkbd keygen label legend li link map mark menu meta meter nav noscript object ol optgroup option\r\noutput p param pre progress q rest rt rest rp ruby s samp progress script section select small source span\r\nstrong style sub summary sup table tbody td textarea tfoot th thead time title tr track u ul video wbr";

exports["var_"] = function () {
  var rest = arguments.length >= 1? __slice.call(arguments, 0): [];
  return expandTag("var", rest);
};
exports["y"] = 1;