//i need a rock-solid iterator.  do async step 1, then do async step 2 when #1 is finished, etc.

var http = require('http');
var Promise = require('promiscuous');

//uncomment the below to test
function promiseLater(something) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      if (something)
        resolve(something);
      else
        reject(new Error("nothing"));
    }, 1000);
  });
}
promiseLater("something").then(
  function (value) { console.log(value); },
  function (error) { console.error(error.message); });
/* something */

promiseLater(null).then(
  function (value) { console.log(value); },
  function (error) { console.error(error.message); });
/* nothing */

// the above worked !!!!!!!!!!
  
  
  

// // Configure our HTTP server to respond with Hello World to all requests.
// var server = http.createServer(function (request, response) {
  // response.writeHead(200, {"Content-Type": "text/plain"});
  // response.end("Hello World\n");
// });

// // Listen on port 8000, IP defaults to 127.0.0.1
// server.listen(9092);  //bugbug



// //simulate a typical async function, that we will call twice below.
// var _counter = 0;
// function increment(myArgs,andThen) {
	// setTimeout(function() { _counter += 1; console.log("counter="+_counter); if (typeof andThen==='function') andThen(myArgs)} , 500);
// }

// function myTest1()  {
	// increment(["blah"],	function(){increment(["blah2"]);});
// }

// //node.js doesn't support yield yet!!!
// // function* myTest2() {
	// // increment([],myTest2);
	// // yield 1;
	// // increment([],myTest2);
	// // yield 1;
// // }
// //myTest2();



// myTest3();

// // console.log("counter="+ _counter);


// // function SS() {
	// // this.prevFn = '';
	// // this.prevArgs = '';
// // }
// // SS.prototype.then(something) {
	// // this.doPreviousStep();
	
	// // return this;
// // }


// // SS().then(add1,3).then(add1(


// // // Put a friendly message on the terminal
// // console.log("Server running");






