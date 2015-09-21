//  author:smcclure879

var ayvex = require('ayvex');
var http = require('http');
var fs = require('fs');
var util = require('util');
var subprocess = require('child_process');


//var nat = require('nat-upnp');  //couldn't install this lib on the pi, or 'nat-pmp'

//can't use promiscuous (it's simpler to follow, but doesn't do hashSettled()
//var Promise = require('promiscuous');
var RSVP = require('rsvp');  //so trying this lib instead  //bugbug needed?
var Promise = RSVP.Promise;



//bugbug all these should be detected/sussed by the prog not hardcoded
var meshPort = '9091';  //more of a const really bugbug revisit
var externalPort = meshPort;  //might need to override (bugbug) (eg. if two meshites in the same LAN)
var internalPort = meshPort;


var upDown = '1';



var Exception = ayvex.Exception;

//vars that will be assigned in the course of things
var fh1=null;
var bestInterface = null;



var upDown = 1;  //1 means "want the mapping"




function firstToSucceed(list,fn) {
    return fn(list[0]);  //bugbug for now
    // fn(list[ii]) returns a promise.  run them sequentially until something works, then return that fulfilled promise
    
}

function getRouterIpList(internalIpAddr) {
    if ( ayvex.startsWith(internalIpAddr,"192.168.") )
	return  [ "192.168.1.1" , "192.168.1.0" ];
    if ( ayvex.startsWith(internalIpAddr,"10.10.") )
	return [ "10.10.1.1" ];
    return '192.168.1.1';


    //bugbugthrow new Exception("do not know how to deal with this ipAddr:"+internalIpAddr);
}




function proPortForward(netInterface,internalPort,preferredExternalPort) {

    var xmlTemplate = ayvex.multiline(function(){  /*
        <?xml version="1.0"?>
	<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
	<s:Body>
	<u:AddPortMapping xmlns:u="urn:schemas-upnp-org:service:WANIPConnection:1">
	<NewRemoteHost></NewRemoteHost>
	<NewExternalPort>%s</NewExternalPort>
	<NewProtocol>TCP</NewProtocol>
	<NewInternalPort>%s</NewInternalPort>
	<NewInternalClient>%s</NewInternalClient>
	<NewEnabled>%s</NewEnabled>
	<NewPortMappingDescription>ayvex:node:nat:upnp</NewPortMappingDescription>
	<NewLeaseDuration>0</NewLeaseDuration>
	</u:AddPortMapping>
	</s:Body>
	</s:Envelope>
						   */});

    var upDown = 1;  //1 means "want the mapping"


    var internalIpAddr = netInterface.ipAddr; //my address on that interface, not the ip of the router which is .routerIpAddr

    var xml = util.format(xmlTemplate, preferredExternalPort, internalPort, internalIpAddr, upDown);
    // print(xml);

    
    return firstToSucceed(getRouterIpList(internalIpAddr), function (routerIp) {
	return proPostSoap( xml, routerIp );
    });
}



function proPostSoap(xmlData,routerIpAddr) {

    var post_data = xmlData;

    // An object of options to indicate where to post to
    var options = {
	host: routerIpAddr,
	port: '5000',
	path: '/Public_UPNP_C3',
	method: 'POST',
	headers: {

 	    'Content-Type': 'text/xml; charset="utf-8"',
	    'Connection': 'close',
	    'SOAPAction': '"urn:schemas-upnp-org:service:WANIPConnection:1#AddPortMapping"', 
            'Content-Length': post_data.length
	}
    };

    return proGet(options,xmlData);
}

//bugbug move to tests or something??  postSoap(xmlData);














var print = console.log;
function dump(x) {
    try {
	if (typeof x === 'undefined')
	    return 'undefined';
	if (x == null) 
	    return 'null';
	var retval = util.inspect(x,false,null);
	return retval;
    } catch(ex) {
	return "bugbug1248c"+ex;
    }

}




function mapValuesInside(hash,fn) {
    var retval = {};

    for (var key in hash) {
	if (!hash.hasOwnProperty(key))
	    continue;
	retval[key] = fn( hash[key] );
    }
    return retval;
}




function settleMap(mapping) {
    return RSVP.hashSettled( mapping );
}





//generate an hash from an array using the field named keyField from each element as the key for the hash. the index numbers are lost
var enhash = function(arr,keyField) {
    var retval = {};
    for(var ii=0,il=arr.length; ii<il; ii++) {
	var item = arr[ii];
	var keyVal = item[keyField];
	retval[keyVal] = item;
    }
    return retval;
};







//mine...  a promised http get....
function proGet(options,outData) {  //options ala http.get
    return new Promise(
	function (resolve, reject) {

	    var request = http.get(options, function(response) { 
				       
		// Continuously update stream with data
		var body = '';
		response.on('data', function(d) {
		    body += d;        
		    //print(d);
		});
		response.on('end', function() {	
		    clearTimeout(timeout); 
		    resolve(    { 'body' : body , 'response' : response , 'ipAddr' : options.localAddress }     ); 
		});
	    });

	    // todo in future versions of nodejs, you can put this into the 
	    //     response object so it's more parallel with 'data' and 'end' above!!
	    request.on('error', function(er) {
		print("Got error: " + dump(options) + dump(er)); 
		clearTimeout(timeout);
		reject(er);
	    });
	
	    if (outData) {
		request.write(outData);
		request.end();
	    }

	    var timeoutEh = function() {
		print("aborting the request="+(options.nick||options.host||dump(options)));
		request.abort();
	    };

	    var timeout = setTimeout(timeoutEh,2000);
	}
    );
}



var exec = subprocess.exec;
//a promised system call...
function proRun(path,arg1) {
    if (!arg1) 
	arg1='';
    return new Promise(
	function (resolve, reject) {
	    child = exec(path+" "+arg1,  //bugbug shouldn't be concatting these, find a better method to call!!!
			 function (error, stdout, stderr) {
			     if (error || stderr) {
				 //log("rejecting: errorCode="+error+"  stderr="+stderr+"   stdout="+stdout);
				 reject("errorCode="+error+"  stderr="+stderr+"   stdout="+stdout);
			     } else {
				 resolve({'stdout':stdout});
			     }
			 }
			);
	}
    );
}	







function NetInterface(nick,name,ipAddr) {
    this.nick = nick;
    this.name = name;
    if (!ipAddr) { //bugbug
	throw new Exception("no ip addr");
	process.exit(47);
    }
    this.ipAddr = ipAddr;
}


NetInterface.prototype.verify = function() { // on all sites
    var that = this;

    var hashOfPromises = mapValuesInside(testSites, function(site) {
	return 	site.verify(that); 
    });

    hashOfPromises.ipAddr = this.ipAddr;

    //turn the hash of promises into a promise of a hash, in which promises are turned into {state,result/reason} objects
    return settleMap(hashOfPromises);  
}


function createNetInterface(section) {
    var lines=section.split("\n");
    var name = lines[0].split("  ")[0];
    if (!name)
	return null;
    if (name=='lo')
	return null;
    
    //print("interface="+name);

    var nick=getNick(name);
    
    var ipAddr=seek(section,"inet addr");

    if (!ipAddr) {
	quip("bad interface: "+getNick(name));
	return null;
    }
    
    return new NetInterface(nick,name,ipAddr)
}


function getNick(name) {
    if (name=="eth0") return "wired";
    if (name=="wlan0") return "wireless";
    return "unknown "+name;
}











function Site(nick,host,port,expectCode) {
    this.nick = nick;
    this.host = host;
    this.port = port;
    this.expectCode = expectCode;
    this.strict = true;
    this.timeout = 10;  ///bugbug not using this value all the way thru!
}







//note: returns a promise-to-verify....rename TODO
Site.prototype.verify = function(netInterface) {

    var options = {
	host: this.host,
	port: this.port,
	path: '',
	localAddress: netInterface.ipAddr,  //bugbug needed?
	method: 'HEAD'
    };

    var that = this;

    return proGet(options)
        .then(null,function(reason) {
	    return {
		response : {
		    statusCode : -1,
		    reason : reason
		} 
	    };  //no result at all?  fix it before continuing: sentinel value
	})
	.then(function(result) {

	    var statusCode=result.response.statusCode;

	    return {
		//the PK
		nick : that.nick,

		//quick decider fields
		updown : statusCode>0,  //it's "up" (true) if we get ANY status code (the connection is up)
		perfect: statusCode==that.expectCode, //....but...the SITE might not be in perfect health tho!
		isExt : that.isExt(),
//bugbug hopefully don't need		ipAddr : result.ipAddr,

		//debug fields
		statusCode: statusCode
	    };

	}).then(null,function(reason) {
	    print( "bugbug790a "+dump(reason) );
	    return false;
	});
}//returns a Promise, normally


function isdigit(c) {
    return ((c >= '0') && (c <= '9'));
}

Site.prototype.isExt = function()  {
    return !isdigit(this.host.charAt(0));
}




// settings

var echoToConsole = true;
var speaking = false;
var testSites = enhash([
    new Site("google","www.google.com",80,200),
    new Site("comcast","www.comcast.com",80,301), 
    new Site("ayvex","ayvex.dnsalias.com",8081,200),
    new Site("bogus1","notAyvex.dnsalias.com",80,-1),
    new Site("bogus2","yapulousity.envalponer.com",80,-1),
    new Site("locaz1","192.168.1.1",80,-1),
    new Site("locaz2","10.1.1.1",80,-1)
],"nick");







function log(x) {
    x += "\n";

    if (echoToConsole)
        console.log(x);

    if (fh1)
	fs.writeSync(fh1,x);
}



function closeAll() {
    try {
        fs.closeSync(fh1);
    } catch (ex) {
        //do nothing
    }
    fh1=null;
}


function last2(x) {
	x="000000"+x;
	return x.slice(-2);
}
function fileFriendlyTime(t) {  //a Date obj

    return ""
	+last2(t.getUTCFullYear())
	+last2(t.getUTCMonth()+1)
	+last2(t.getUTCDate())
	+last2(t.getUTCHours())
    ;
}







// ////////////    START  /////////////
function startItUp(){
    

    RSVP.on('error', function(reason) {
	console.assert(false, reason);
    });




    var MINUTES = 60;
    
    // #chdir into own dir
    //    print("dirname="+__dirname+"xxx");
    process.chdir(__dirname);
    
    
    // # #figure the time for log file etc.
    theTime = new Date();
    humanTime = theTime.toUTCString();
    timeForLogFile = fileFriendlyTime(theTime);   //because this didn't work on PC! .toString( "YYYY-MM-DDTHH:mm:ss.sssZ" );

    

    // check space on disk with df

    
    // # open the log
    //print(process.cwd());
    var logFile = "./logs/meshing_"+timeForLogFile+".txt";
    print("logfile="+logFile);
    print("cwd="+process.cwd());
    fh1=fs.openSync(logFile, 'a');

    log("----starting log----time="+humanTime);


    var uptime = null;
    var sections = [];
    //var interfacesUp = 0;



    //if less than N minutes since startup then hold off (exit)
    proRun("cat","/proc/uptime")
	.then( function(output) { 
	    var stdoutput = output.stdout.toString();
	    uptime=parseInt(stdoutput.split(" ")[0]);
	    log( "hrs up=" + Math.floor( uptime/3600 )); 
	    
	    var delay = 1*MINUTES;
	    if ( uptime < delay ) {
		setTimeout(startItUp,delay); //try again in 5
		throw new Exception("too early"); //to take us out of here for now
	    }
	}).then( function() {


	    // # #if there's another of me then die -- bugbug just don't let this happen
	    // ok don't do this.......procs = run("ps", "-A").split()   should return zero lines containing nodejs??? bugbug
	    //...... instead....
	}).then( function() {

	    //maybe something else??

	}).then( function() {


	    startupServer();


	}).then( function() {
	    return proRun("ifconfig");  //really, pass on
	}).then( function(output) {
	    
	    interfaces = output.stdout.split("\n\n")
		.map(createNetInterface) //from a section
		.filter(function(netInterface) {
		    return  netInterface!=null 	&&  netInterface.name!='lo' ;
		});

	    interfaces=enhash(interfaces,'nick');  //nick is key!


	    interfaces=mapValuesInside(interfaces,function(ni) {   //ni = network interface
		return ni.verify();//still a promise
	    });
				      

	    return settleMap( interfaces );

	   
	}).then( function(hashNetInterfaces) {

	    //each item in hash represents an interface.  each subitem a site result for that interface
	    //redefining...(unpromising?  unpacking promises?)...
	    //bugbug consolidate the dupe code below...maybe it should be recursive?

	    hashNetInterfaces = mapValuesInside(hashNetInterfaces,function(nipf) {
		
		// nipf = network interface promise, hopefully fulfilled. 
		
		if (typeof nipf == 'undefined')
		    return null;

		//print("nipf="+dump(nipf));
		if (nipf.state != 'fulfilled') {
		    print("bad nipf"+nipf.state);
		    //throw new Exception("bugbug1249"+nipf.reason);
		    return null;
		}
		var ni = nipf.value;
		//regark(ni);  //bugbug or should this happen earlier???
		ni = mapValuesInside(ni, function(spf) { //    spf=site promise, hopefully fulfilled
		    if (spf.state != 'fulfilled') {
			print("bad site"+spf.state);
			throw new Exception("bugbug546a"+spf.reason);
			return null;
		    }
		    var site=spf.value;

		    return site;
		});



		if (!ni.ipAddr)
		    throw new Exception("bugbug431f"+ni);
		return ni;
	    });



	    //print("----------"+humanTime+"--------\n");
	    //print( dump(hashNetInterfaces) );


	    for (var netNick in hashNetInterfaces) {

		var ni = hashNetInterfaces[netNick];
		var niUpdown = false;  //until proven otherwise

		//bugbug make this an "any" call ??
		for (var siteNick in ni) {
		    if (!ni.hasOwnProperty(siteNick))
			continue;

		    var site = ni[siteNick];

		    if (site.isExt && site.updown) {
			niUpdown = true;
		    }
		}

		hashNetInterfaces[netNick].updown=niUpdown; 
	    }



	    for (var netNick in hashNetInterfaces) {
		if (!hashNetInterfaces[netNick].updown) {
		    quip(netNick + " interface is down");
		}
		else {
		    quip(netNick + " interface is up");
		    if (!bestInterface)
			bestInterface = hashNetInterfaces[netNick];
		}
		
	    }
	    
	    hashNetInterfaces.utc=humanTime;
	    log( dump( hashNetInterfaces ) );



	    log("scan complete");	    

	}, /* catch */ function(reason) {
    
	    log("something went wrong"+dump(reason));
	    //quip("one interface bad maybe");

	}).then(function() {

	    if (!bestInterface || !bestInterface.ipAddr)
	    {
		print("bugbug128");
		debugger;
		return null;
	    }

	    return proPortForward(bestInterface,meshPort,meshPort);

	}).then(function(result) {
	    if (result && ayvex.contains(result.body,"WANIPConnection:1"))
		print("success really 743i  !!!!!!!!!");
	    else 
		print("bugbug126...here set up response to port forwarding, turn on port 9091 server etc)");
	    debugger;

	});



    log("end of entry function");


}






//function iammapped(bugbug) {
//    return true;  //bugbug
//}
	
// 	    client.getMappings(function(err,results) {    //bugbug you are here... you can force a connection as above, but need to inspect it maybe?...how to test from external???

// 		if (err)
// 		{
// 		    log(err);
// 		    reject(err);
// 		    return false;
// 		}
		
// 		log(result);
		
// 		if (iammapped(result))
// 		{
// 		    resolve(somethingbugbug);
// 		    return result;
// 		}
// 		else
// 		{

// 		    mapMe(something,something);
// 		}

	 
// 	    });
//     });
    
// }







function startupServer() {
    
    var server = http.createServer(function (request, response) {
	response.writeHead(200, {"Content-Type": "text/plain"});
	response.end("Hello World\n");
    });
    server.listen(meshPort);  //for now is this unique enough?? todo revisit
    
}



function quip(x) {
    log("quipping : "+x);
    if (speaking)
        runHide("espeak","\""+x+"\"");  //it's noisy
}

function seek(corpus,soughtName)  {  //look for soughtName:  value  and return value
    var chunks = corpus.split("  ");  //that's a double space!
    var sought = soughtName + ":";
    var theLen = sought.length;
    for (var chunkIndex=0, il=chunks.length; chunkIndex<il; chunkIndex++ ) {
	var chunk = chunks[chunkIndex];
        if ( chunk.substr(0,theLen)==sought )
            return chunk.substr(theLen);
    }
    return '';
}



function runHide(prog,arg1) {  //bugbug doesn't hide output yet??
    proRun(prog,arg1)
	.then(null,function(reason) {
	//hide the yucky error.   //print("i didn't say it "+reason);

	});
}






startItUp();

