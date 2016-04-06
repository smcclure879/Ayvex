
var http = require('http');

Object.prototype.startsWith = function (other) {

    if (this.substr(0,other.length)==other)
	return true;
    else
	return false;

}


function doApi(request,response) {
    console.log('api');
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end('Hello World - api\n');    
}

function doStatic(request,response) {
    console.log('static');
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end('Hello World  should be static\n');
}










http.createServer(function (request, response) {

    debugger;

    var path=""+request.url;

    console.log(path);

    if (path.startsWith("/api/"))

	doApi(request,response);

    else if (path.startsWith("/web/")) {

	doStatic(request,response);

    }else{

	response.writeHead(200, {'Content-Type': 'text/plain'});
	response.end('Hello World---base\n');
    }

}).listen(8081);

// Console will print the message
console.log('Server running at http://127.0.0.1:8081/');


