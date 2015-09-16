//var Socket = require('socket');
var http = require('http');
var natpmp = require('nat-pmp');

var meshPort = 9091;
 
// create a "client" instance connecting to your local gateway 
var client = natpmp.connect('192.168.1.1');
 

 
// explicitly ask for the current external IP address 
client.externalIp(function (err, info) {
    if (err) throw err;
    console.log('Current external IP address: %s', info.ip.join('.'));
});

debugger; 
 
// setup a new port mapping 
client.portMapping({ private: meshPort, public: meshPort, ttl: 3600 }, function (err, info) {
    if (err) throw err;
    console.log(info);
  // { 
  //   type: 'tcp', 
  //   epoch: 8922109, 
  //   private: 22,    //bugbug9091
  //   public: 2222,    //bugbug 9091
  //   ... 
  // } 
});



    
var server = http.createServer(function (request, response) {
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.end("Hello World\n");
});
server.listen(meshPort);  //for now is this unique enough?? todo revisit


