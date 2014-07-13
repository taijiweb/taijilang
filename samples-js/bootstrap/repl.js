require("./require");
var readline = require("readline"), 
    tj = require("../lib/taijilang"), 
    prefix = "tj> ";

exports.runrepl = function () {
  var rl = readline.createInterface(process.stdin, process.stdout);
  rl.on("line", function (line) {
    var line1 = tj._compile(line);
    console.log(eval(line1));
    
    (function (err) {
      return console.log(err);
    });
    rl.setPrompt(prefix, prefix.length);
    return rl.prompt();
  });
  rl.on("close", function () {
    console.log("Bye!");
    return process.exit(0);
  });
  console.log(JSON.stringify(prefix) + " taijilang repl v" + JSON.stringify(taiji.version));
  rl.setPrompt(prefix, prefix.length);
  return rl.prompt();
}