
var http = require('http');

Object.prototype.startsWith = function (sought) {

    if (this.substr(0,sought.length)==sought)
	return true;
    else
	return false;

}


Object.prototype.endsWith = function (sought) {
    
    if (this.substr(this.length-sought.length)==sought)
	return true;
    else
	return false;

}



Object.prototype.removeStart = function (start) {

    return (this+"").substr(start.length);

}


function getContentType(someFile) {
    someFile = ""+someFile;
    if (someFile.endsWith('.html')) return  'text/html';
    if (someFile.endsWith('.htm' )) return 'text/html';
    if (someFile.endsWith('.js'  )) return 'script/javascript';
    return 'text/plain';
}


function getFilePath(relPath) {
    return "."+relPath;
}





function doApi(request,response) {
    console.log('api-'+request.path);
    response.writeHead(200, {'Content-Type': 'application/json'});
    response.end('Hello World - api\n');    
}

function doStatic(request,response) {
    console.log('static-'+request.path);
    var filePath=getFilePath((request.path+"").removeStart('web'));
    response.writeHead(200, {'Content-Type': getContentType(filePath)});
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


