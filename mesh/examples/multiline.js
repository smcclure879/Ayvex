var util = require('util');
var multiline = function(f) {

    var EOL = "\n";
    var lines = f.toString().split(EOL);

    //throw out first and last
    lines.shift();
    lines.pop();

    return lines.join(EOL);

};
