'use strict';
const webPush = require('web-push');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const ext = /[\w\d_-]+\.[\w\d]+$/;
const util = require("util");
const datastore = require('nedb');

const exec = require('child_process').exec;



//early startup stuff----------------------

//subscription registrations "database"
const db = new datastore({ filename: 'beepRegistrations.db', autoload: true, timestampData: true });
db.ensureIndex({ fieldName: 'endpoint', unique: true, sparse: true }, function (err) {
    if (err)
	logIt("problem creating index on registrations:"+err);
    else
	logIt("db=beepRegistrations OK");
});


const alertsDb = new datastore({ filename: 'alerts.db', autoload: true, timestampData: true});
alertsDb.ensureIndex({ fieldName: 'createdAt', unique: false, sparse: true, expireAfterSeconds: 60*60*48 }, function (err) {
    if (err)
	logIt("problem creating index on alerts:"+err);
    else
	logIt("db=beepAlerts OK");
});



const rawData = fs.readFileSync('vapid-keys.secret.json');
const vapidDetails = JSON.parse(rawData);

//end early startup stuff-----------------


const myNow = function() {
    return new Date().toISOString();
};
const metalog = function(x) {
    process.stdout.write(x);
    //log to a file here
}
const startIt = function(x) {
    metalog(myNow()+" "+x+" ");
}
const logIt = function(x) {
    metalog(x+" ");
}
const doneIt = function(x) {
    if (!x) { 
	x='';
    }
    metalog(x+"\n");
}




//todo move this all to a wrapFs module

const functionExists = function(f) {
    return (typeof f === 'function');
};

const isEmptyObject = function(o) {
    return ( Object.keys(o).length == 0 );
};

const noFsCheck = function(typeOfCheck) {
    if (!isEmptyObject(fs)) return;
    if (typeOfCheck != 'fatal') return;

    logIt("err:empty fs obj!!");
    process.exit(-4762);
};
noFsCheck('fatal');

//this is dumb dumb dumb should be a utility module or something
//even the INTENT is wrong,  it's really "exists and is a readable file".  probably best to just read it
const fsExists = (function() { 
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


const dump=util.inspect;


function fireAndForget(whatToRun) {

    exec(whatToRun, function callback(error, stdout, stderr){
	logIt("run of "+whatToRun)
    });

}



//mime types
function getContentType(someFile) {
    someFile = ""+someFile;
    if (someFile.endsWith('.html')) return  'text/html';
    if (someFile.endsWith('.htm' )) return 'text/html';
    if (someFile.endsWith('.work.js' )) return 'text/javascript;';
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
    //} else if (req.method=='POST') {
    //	doPost();
    } else {    
	return unknownMethod(req,res);
    }
}

function doBonk(res){
    writeNormalHead(res);
    users = {};
    res.end("OK");
}

function doVapidPk(res){
    writeNormalHead(res);
    res.write(JSON.stringify({ publicKey : vapidDetails.publicKey }));
    res.end();
}

//a best effort collect
function collectBody(req,res) {
    return new Promise(function(resolve,reject) {
	var body='';
	req.on('data',function(data){
	    body+=data;
	});
	req.on('end',function(){
	    body = "" + body;
	    var userJson = JSON.parse(body);
	    resolve(userJson);
	});
    });
}

function chan(sendAllJson) {
    const saj = sendAllJson;

    if (saj.talkChannel)
	return saj.talkChannel;
    
    const cd = saj.channelData;
    if (!cd) return "---";
    logIt("cl="+JSON.stringify(cd.channelList));
    const talkChannel = cd.channelList[parseInt(cd.talk)-1];
    return talkChannel || "-.-";
}

const charLim = 10;
const padding=Array(charLim).join('·');

function padEndSpace(orig,goodLen) {
    var l=orig.length;
    if (l>goodLen)
	return orig+padding.substr(0,1);
    return (orig + padding).substr(0,goodLen);
}

function doConvo(req,res) {
    var myRes=res;
    collectBody(req,res).catch(function(err){
	logIt("bugbug235:"+JSON.stringify(err));
    }).then(function(jsonBody) {

	var channelList = jsonBody.channelList;
	
	alertsDb
	    .find( {'sendall': { $exists:true }, 'sendall.talkChannel': {$in:channelList}} )  
	    .sort( {'createdAt':1} )
	    //.projection( {'sendall.clientTime':1,'sendall.msg':1} )
	    .exec( function (err, docs) {
		if ( err )
		    logIt( JSON.stringify(err) );
		//logIt(JSON.stringify(docs));
		var tt = docs
		    .map( x => padEndSpace(x.sendall.msg,40) +  chan(x.sendall)+"_"+x.sendall.clientTime ) 
		    .join( "\n" );
		//logIt(tt);
		writeNormalHead(myRes);
		res.end(  JSON.stringify({result:tt})  );
	    });
    }).catch(function(err) {
	logIt("errCode219s:"+err);
    });
}



function doBeepApi(req,res) {
    const subUrl = (""+req.url).removeStart("/api/beep/");

    if (subUrl.startsWith("convo")) {
	return doConvo(req,res);
    }

    //the remaining actions have a fire-and-forget-best-effort, standard response pattern
    var action;

    if (subUrl.startsWith("register")) {
	action = function(objFromUser) {
	    //bugbug todo sterilize user input better..shouldn't just persist from enduser!
	    if (!objFromUser['channelData'] || !objFromUser['channelData']['channelList']) {
		logIt("\n\nproblem with register...no channels"+JSON.stringify(objFromUser)+"..."+JSON.stringify(obj)+"ppp\n\n");
		res.writeHead(400,  {'Content-Type': 'application/json'});
		res.end('{response:"err810q: bad request, no channels given "}');
		return;
	    }

	    //the obj to write
	    var obj=Object.assign({},objFromUser['subscription']);
	    obj["channelData"] = objFromUser['channelData']
	    obj["dateTime"] = myNow();
	    obj["isRegistration"] = true;

	    logIt("obj="+JSON.stringify(obj));
	    
	    const findSameEndpoint = { endpoint:obj['endpoint'] };
	    const options = { multi:false, upsert:true, returnUpdatedDocs:false };

	    db.update(findSameEndpoint, obj, options, function (err, numAffected, newDoc, upsert) { // optional

		if (err) logIt(err);
		logIt("numAffected="+numAffected);
		logIt(upsert);
		
		//  Warning: above callback API was changed btwn v1.7.4 and v1.8. Please refer2 change log
		//dumb logging ...find something better --  db.insert({"foobar":"saved to db--"+newDoc._id});
	    });
	};
    } else if (subUrl.startsWith("sendall")) {
	action = function(userJsonObj) {
	    alertsDb.insert({sendall:userJsonObj});  //best effort
	    const notificationOptions = { vapidDetails: vapidDetails  };
	    var talkChannel = userJsonObj.talkChannel;
		
	    //iterate all registrations and send msg to each listening on that channel
	    db.find({"isRegistration":true,
		     "channelData.channelList":{$elemMatch:talkChannel}},  //the channel in which it was spoken
		    function(err,docs){
			if (docs.length<1) {
			    logIt("\ndocs 000000000000000000000000000\n\n");
			}
			for (var ii = 0, len = docs.length; ii < len; ii++) {
			    logIt("ii="+ii);
			    var reg = docs[ii];
			    var payload=Object.assign({ii:ii},userJsonObj);
			    payload=JSON.stringify(payload);
			    logIt("payload="+payload);
			    logIt("about to send to:"+JSON.stringify(reg));
			    webPush
				.sendNotification(reg, payload, notificationOptions)
				.catch(function(err){
				    if ( Object.keys(err).length != 0 || err.constructor != Object) {  // !=emptyObject
					logIt("pushReturnedErr="+JSON.stringify(err)+err);
				    }
				}).then(function(obj){
				    //logIt(obj.statusCode);  // the status code of the response from the push service;
				    logIt("return obj="+JSON.stringify(obj));  
				    //logIt("body was="+obj.body);        // the body of the response from the push service.
				});
			    
			}//end for
		    });
	};
    } else {
	db.insert({debug:"bugbug how did we get here??",now:myNow()});  //best effort
    }
    
    
    var body='';
    req.on('data',function(data){
	body+=data;
    });
    req.on('end',function(){
	body = "" + body;
	logIt("body="+body);
	
	try {
	    var userJson = JSON.parse(body);
	    action(userJson);  //whichever beep action we are doing
	}catch(ex){
	    logIt("exception="+ex);
	}
	
	writeNormalHead(res);
	res.end('{"response":"putOK"}\n');    //todo think we need to return id bugbug
	
    });
    
}
    


    
function doGet(req,res) {
    const url = ""+req.url;

    if (url=="/api/beep/vapidpk/") {
	return doVapidPk(res);
//    } else if (url=="/api/beep/convo/") {
//	return doConvo(req,res);
    } else if (url=="/api/bonk/") {
	return doBonk(res);
    } else if (url=="/api/user/") {
	writeNormalHead(res);
	const userList = getUserList();
        //console.log("users:"+userList);
        res.end(userList);
    } else if (url.startsWith("/api/user/")) {
	const userName = url.removeStart("/api/user/");
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
    
	
	
// function doPost(req,res) {	

//     res.writeHead(404,  {'Content-Type': 'application/json'});
//     res.end('{response:"POST NYI--'+req.method+'"}\n');    
// }
    
	
	
function doPut(req,res) {
    const url = ""+req.url;
    
    if (url.startsWith("/api/user/")) {
	const userName = url.removeStart("/api/user/");
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
    } else if (url.startsWith("/api/beep/")) {
	doBeepApi(req,res);
    } else {
	res.writeHead(404,  {'Content-Type': 'application/json'});
	res.end('{response:"err328s:cannot PUT '+url+'"}');
    }
}



function writeNormalHead(res)  {   //response;
    res.writeHead(200, {'Content-Type': 'application/json'});
}


var reSafe = new RegExp('^[\\w\\d\\=]{5,30}$');
function safeString(x) {
    return reSafe.test(x);
}
if (!reSafe.test("ding=foobar")) {
    process.exit(-4222);
}
logIt("passed 4222");
if (reSafe.test("&%")) {
    process.exit(-4128);
}
logIt("passed 4128");

function doFancyApi(req,res) {    // strip off ?foo=bar so that the file can be served statically //

    logIt('fancy');
    //console.log('  ip:'+dump(req.connection.remoteAddress));
    let filePath = ""+req.url;
    let brk = filePath.indexOf("?");

    let mods = filePath.substr(brk+1);
    logIt("mods="+mods);

    if (!safeString(mods)) {
    	res.end("err914z");  //bugbug todo consolidate these N checks into doStaticBase
	return;
    }

    
    if (mods.contains("ding")) {
	fireAndForget('espeak "ding '+mods+'"');
    }  else  {
	//fireAndForget('espeak "nope nope'+mods+'"');
    }


    filePath = filePath.substr(0,brk);
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

    const filePath = path.join(__dirname, req.url);
    return doStaticBase(filePath,res);
}


function doStaticRedir(req,res) {

    if (!ext.test(req.url))  {
	res.end("err257b");
	log(req.url);
	return;
    }
    
    const filePath = path.join(__dirname,"web", req.url);
    return doStaticBase(filePath,res);
}

function doAcmeStatic(req,res) {
    if (req.url.contains("..")) {
	res.end("err459i");
	return;
    } else {
	const filePath = path.join(__dirname,"web", req.url);
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

    const path=""+req.url; 
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



http.createServer(mainHandler).listen(3080);  //http
startIt('started http:');
doneIt();

const keyPath   = '/etc/letsencrypt/live/ayvexllc.com/privkey.pem';
const chainPath = '/etc/letsencrypt/live/ayvexllc.com/fullchain.pem';

try {
    const tlsOptions = {
	key:  fs.readFileSync(keyPath),
	cert: fs.readFileSync(chainPath)
    };
    https.createServer(tlsOptions,mainHandler).listen(3443);  //https
    startIt('started httpSSS');
    doneIt();
} catch (ex) {
    startIt('SKIPPING https-->'+ex);
    doneIt();
}  




