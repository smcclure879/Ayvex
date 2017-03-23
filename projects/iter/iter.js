//i need a rock-solid iterator.  do async step 1, then do async step 2 when #1 is finished, etc.



// Load the http module to create an http server.
var http = require('http');

// Configure our HTTP server to respond with Hello World to all requests.
var server = http.createServer(function (request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.end("Hello World\n");
});

// Listen on port 8000, IP defaults to 127.0.0.1
server.listen(9092);  //bugbug



//simulate a typical async function, that we will call twice below.
var _counter = 0;
function increment(andThen,args) {
	setTimeout(function() { _counter += 1; andThen(args)} , 500);
}




function SS() {
	this.prevFn = '';
	this.prevArgs = '';
}
SS.prototype.then(something) {
	this.doPreviousStep();
	
	return this;
}


SS().then(add1,3).then(add1(


// Put a friendly message on the terminal
console.log("Server running");






