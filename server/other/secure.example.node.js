

var http = require('http');
var fs = require('fs');
var path = require('path');
var ext = /[\w\d_-]+\.[\w\d]+$/;
var util = require("util");

var https = require('https');



const options = {
    key:  fs.readFileSync('/etc/letsencrypt/live/ayvexllc.com/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/ayvexllc.com/fullchain.pem')
};

/*
 from letsEncrypt.... 
   All generated keys and issued certificates can be found in
      /etc/letsencrypt/live/$domain
   Rather than copying, please point your (web) server 
   configuration directly to those files (or create symlinks).
   During the renewal, 
      /etc/letsencrypt/live is updated with the latest necessary files.
*/
  

https.createServer(options,function(req,res){


    console.log("Foo");
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello World---secure\n');



}).listen(80);

console.log("started secure 80");

