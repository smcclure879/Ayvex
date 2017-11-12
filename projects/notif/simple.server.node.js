

var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var ext = /[\w\d_-]+\.[\w\d]+$/;
var util = require("util");


var myNow = function() {
    return new Date().toISOString();
};
var metalog = function(x) {
    process.stdout.write(x);
    //log to a file here
}
var startIt = function(x) {
    metalog(myNow()+" "+x+" ");
}
var logIt = function(x) {
    metalog(x+" ");
}
var doneIt = function(x) {
    if (!x) { 
	x='';
    }
    metalog(x+"\n");
}




//todo move this all to a wrapFs module

var functionExists = function(f) {
    return (typeof f === 'function');
};

var isEmptyObject = function(o) {
    return ( Object.keys(o).length == 0 );
};

var noFsCheck = function(typeOfCheck) {
    if (!isEmptyObject(fs)) return;
    if (typeOfCheck != 'fatal') return;

    logIt("err:empty fs obj!!");
    process.exit(-4762);
};
noFsCheck('fatal');

//this is dumb dumb dumb should be a utility module or something
//even the INTENT is wrong,  it's really "exists and is a readable file".  probably best to just read it (bugbug you are here)
var fsExists = (function() { 
    if ( functionExists( fs.exists ) ) 
	return fs.exists;
    if ( functionExists( fs.access ) )
	return function(filePath,callback) {
	    fs.access(  filePath, fs.R_OK,  function(err){ callback(!err); }  ); 
	};
    //if ( functionExists( fs.stat )  )  //been causing problems  with stats arg not being passed!
    //    return function(filePath,callback) {
    //	    fs.stat(  filePath, function (err, stats) { 
    //		if (err) 
    //		    callback(false);
    //		else 
    //		    callback(stats.isFile());
    //	    });
    //	};
    return function(filePath,callback) {
	debugger;
	fs.open(filePath, 'r', function(err, fd) {
	    if (err) {
		callback(false);
		//if (err.code === "ENOENT") {
		//    callback(false);
		//} else {
		//    callback(true);
		//}
	    } else {
		callback(true);
	    }
	});

    }
    
})();





		 

Object.prototype.startsWith = function (sought) {
    return (this.substr(0,sought.length)==sought);
}


Object.prototype.endsWith = function (sought) {
    return (this.substr(this.length-sought.length)==sought);
}



Object.prototype.removeStart = function (start) {
    return (this+"").substr(start.length);
}


Object.prototype.contains = function (sought) {
    return ( (this+"").indexOf(""+sought) >= 0 );
}


var dump=util.inspect;



function getContentType(someFile) {
    someFile = ""+someFile;
    if (someFile.endsWith('.html')) return  'text/html';
    if (someFile.endsWith('.htm' )) return 'text/html';
    if (someFile.endsWith('.js'  )) return 'script/javascript';
    if (someFile.endsWith('.svg' )) return 'image/svg+xml';
	return 'text/plain';
}


function getFilePath(relPath) {
    return "."+relPath;
}


var users = {};
function getUserList() {
    return JSON.stringify(users); 
}

function doApi(req,res) {
    logIt('api-' + req.method );

    if (req.method=='GET') {
		return doGet(req,res);
	} else if (req.method=='PUT') {
		return doPut(req,res);
	} 
	//else if (req.method=='POST') doPost();
	else {    
		return unknownMethod(req,res);
	}
}

function doBonk(res){
    writeNormalHead(res);
    users = {};
    res.end("OK");
    return;
}
	
function doGet(req,res) {
    var url = ""+req.url;


    if (url=="/api/bonk/") {
	return doBonk(res);
    } else if (url=="/api/user/") {
	writeNormalHead(res);
	var userList = getUserList();
        //console.log("users:"+userList);
        res.end(userList);
    } else if (url.startsWith("/api/user/")) {
	var userName = url.removeStart("/api/user/");
	if (users[userName]) {
	    writeNormalHead(res);
	    res.end(users[userName]);
	} else { //don't have
	    res.writeHead(404, {'Content-Type': 'application/json'});
	    res.end('{response:"nothing found"}\n');    
	}
    } else {
	res.writeHead(404, {'Content-Type': 'application/json'});
	res.end('{response:"unknown api--'+req.url+'"}\n');    
    }
}	

function unknownMethod(req,res) {
    res.writeHead(404,  {'Content-Type': 'application/json'});
    res.end('{response:"unknown http method--'+req.method+'"}\n');    
}
    
	
	
//function doPost(req,res) {	
//  
//
//	res.writeHead(404,  {'Content-Type': 'application/json'});
//	res.end('{response:"POST NYI--'+req.method+'"}\n');    
// }
    
	
	
function doPut(req,res) {
    var url = ""+req.url;
    
    if (url.startsWith("/api/user/")) {
	var userName = url.removeStart("/api/user/");
	var body='';
	req.on('data',function(data){
	    body+=data;
	});
	req.on('end',function(){
	    logIt("body="+body);
	    users[userName]=body;
            //logIt("wrote user="+userName+" "+dump(users));
	    writeNormalHead(res);
	    res.end('{"response":"putOK"}\n');    //todo think we need to return id
	});
    } else {
	res.writeHead(404,  {'Content-Type': 'application/json'});
	res.end('{response:"err328s:cannot PUT '+url+'"}');
    }
}



function writeNormalHead(res)  {   //response; 
    res.writeHead(200, {'Content-Type': 'application/json'});
}







function doFancyApi(req,res) {    // strip off ?foo=bar so that the file can be served statically //

    logIt('fancy');
    //console.log('  ip:'+dump(req.connection.remoteAddress));
    var filePath = ""+req.url;
    filePath = filePath.substr(0,filePath.indexOf("?"));
    filePath = path.join(__dirname, filePath);

    if (!ext.test(filePath))  {
	res.end("err257c");  //bugbug todo consolidate these 3 checks into doStaticBase
	return;
    }

    return doStaticBase(filePath,res);

    //res.writeHead(200, {'Content-Type': 'application/json'});
    //res.end('Hello World - fancyApi\n');
}



function doStaticBase(filePath, res) {
    if (filePath.endsWith("/")) {
	filePath = filePath + "index.html";
    }
    fsExists(filePath, function (exists) {
	if (exists) {
	    logIt("found"+filePath);
	    res.writeHead(200, {'Content-Type': getContentType(filePath)});
            fs.createReadStream(filePath).pipe(res);
        } else {
	    logIt("lost");
	    res.writeHead(404, {'Content-Type': 'text/html'});
	    res.end("404");
        }
    });
}


function doStatic(req,res) {

    if (!ext.test(req.url))  {
	res.end("err257a");
	return;
    }

    var filePath = path.join(__dirname, req.url);
    return doStaticBase(filePath,res);
}


function doStaticRedir(req,res) {

    if (!ext.test(req.url))  {
	res.end("err257b");
	log(req.url);
	return;
    }
    
    var filePath = path.join(__dirname,"web", req.url);
    return doStaticBase(filePath,res);
}

function doAcmeStatic(req,res) {
    if (req.url.contains("..")) {
	res.end("err459i");
	return;
    } else {
	var filePath = path.join(__dirname,"web", req.url);
	return doStaticBase(filePath,res);
    }
}


//     } else if (ext.test(req.url)) {
//         fsExists(path.join(__dirname, req.url), function (exists) {
//             if (exists) {
//                 res.writeHead(200, {'Content-Type': 'text/html'});
//                 fs.createReadStream('index.html').pipe(res);
//             } else {
//                 res.writeHead(404, {'Content-Type': 'text/html'});
//                 fs.createReadStream('404.html').pipe(res);
//             }





function mainHandler (req, res) {

    var path=""+req.url; 
    startIt(req.connection.remoteAddress+" "+path);

    var retval = (function() {
	if (path.startsWith("/api/")) {
	    return doApi(req,res);
	} else if (path.contains("?")) {
	    return doFancyApi(req,res);
	} else if (path.startsWith("/web/")) {
	    return doStatic(req,res);
	} else if (path=="/favicon.ico") {
	    return doStaticRedir(req,res);
	} else if (path.startsWith("/.well-known/acme-challenge")) {
	    return doAcmeStatic(req,res);
	} else {
	    logIt("err320-fallthru-why?");
	    
	    res.writeHead(200, {'Content-Type': 'text/plain'});
	    res.end('Hello World---base\n');
	    return;
	}
    })();
    doneIt();
    return retval;
}




/*
 from letsEncrypt.... 
   All generated keys and issued certificates can be found in
      /etc/letsencrypt/live/$domain
   Rather than copying, please point your (web) server 
   configuration directly to those files (or create symlinks).
   During the renewal, 
      /etc/letsencrypt/live is updated with the latest necessary files.
*/



http.createServer(mainHandler).listen(80);  //http
startIt('started http:');
doneIt();

var keyPath   = '/etc/letsencrypt/live/ayvexllc.com/privkey.pem';
var chainPath = '/etc/letsencrypt/live/ayvexllc.com/fullchain.pem';

try {
    const tlsOptions = {
	key:  fs.readFileSync(keyPath),
	cert: fs.readFileSync(chainPath)
    };
    https.createServer(tlsOptions,mainHandler).listen(443);  //https
    startIt('started httpSSS');
    doneIt();
} catch (ex) {
    startIt('SKIPPING https-->'+ex);
    doneIt();
}  




