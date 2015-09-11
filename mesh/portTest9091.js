
var http = require('http');
var meshPort = 9091;
 
    
var server = http.createServer(function (request, response) {
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.end("Hello World\n");
});

server.listen(meshPort);  //for now is this unique enough?? todo revisit


