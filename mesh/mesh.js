"use strict";

//  author:smcclure879

var ayvex = require('ayvex');
var http = require('http');
var fs = require('fs');
var util = require('util');
var subprocess = require('child_process');
var dns = require('dns');

var Datastore = require('nedb');


//var nat = require('nat-upnp');  //couldn't install this lib on the pi, or 'nat-pmp'
//can't use promiscuous (it's simpler to follow, but doesn't do hashSettled()
//var Promise = require('promiscuous');
var RSVP = require('rsvp');  //so trying this lib instead
var Promise = RSVP.Promise;



var databaseFile = "dbMeshites.db";


//bugbug all these should be detected/sussed by the prog not hardcoded ??
var meshPortBase = 9091;  //more of a const really bugbug revisit
//bugbug add this feature later  //var meshPortBaseInternal = 9091;  internal and external might be different
var meshPortCount = 3;  //bugbug should be 10 approx once it works good.



//bugbug  make this two separate optional files  maybe not in git?

var dnsName="ayvex.dnsalias.com";
var pazzword="20abd9bc512f11e4814ccd0e1d232429";  //bugbug update this at some point

//global vars  bugbug fix location
var correctTime;  //note will need to call to update this periodically
var dnsAddress = null;
var ipAddr = null;



var upDown = '1';   //1 means "want the mapping"  //bugbug rename
var force = 0; //until sufficiently tested   forces dns write...bugbug rename

var doNotCheckIp = 0;  //bugbug remove before checkin!!!

//more globals
var theTime;
var humanTime;
var localTime;
var timeForLogFile;
var me;   //my local copy of everything I know, that I can write to DB??



var Exception = ayvex.Exception;

//vars that will be assigned in the course of things
var fh1=null;
var interfaces = null;
var bestInterface = null;
var db = null;

var MINUTE = 60 * 1000;


function firstToSucceed(list,fn) {
    return fn(list[0]);  //bugbug for now
    // fn(list[ii]) returns a promise.  run them sequentially until something works, then return that fulfilled promise
}

function getRouterIpList(internalIpAddr) {
    if ( ayvex.startsWith(internalIpAddr,"192.168.") )
	return  [ "192.168.1.1" , "192.168.1.0" ];
    if ( ayvex.startsWith(internalIpAddr,"10.10.") )
	return [ "10.10.1.1" ];
    //return '192.168.1.1';


    throw new Exception("do not know how to deal with this ipAddr:"+internalIpAddr);
}







function proPrepDb() {
    return proInsertDocDb(  { type: 'startup', logTime: humanTime }  );
}

function proInsertDocDb(doc) {	
    return new Promise(function(resolve,reject) {
	db.insert( doc, function (err, newDoc) {   
	    if (err) {
		console.log("err="+dump(err));
		reject(err);
	    } else { 
		console.log("newDoc="+dump(newDoc));
		resolve(newDoc);
	    }
	});
    });
}



/*
here is the schema

machineX(subj=hwAddr) thinks machineY(obj=hwAddr) at 4:32pm (time) was at 299.47.32.1 (ipAddr)

we'll loosen later, go tight to get it working...

pk1: type: 'think' 
pk1: subj: hwAddr  (who thinks it)
pk1: obj: hwAddr (who is thought about)
pk1: utc: humanTime  (utc)
   : ip: ipAddr (v4 for now)

here's a cut n paste

    type:
    subj:
    obj:
    utc: 
    ip: ipAddr (v4 for now)


*/




var think='think'; //for my own convenience

function proVerifySelfRecord(inta) {  //inta is an an interface

    if (!inta || !inta.hwAddr)
	throw new Exception("bugbug143a");


    return new Promise(function(resolve,reject) {


	//bugbug SOON this should be changed to db.update(    ,options={upsert:true},  blah );



	db.find( {
	    type: think,
	    subj: inta.hwAddr,
	    obj: inta.hwAddr
	},
		 function(arrDocs) { 

		     debugger; //xx156 wy is arrDocs null?  do I need to specify all fields??? 

		     if (!arrDocs || arrDocs.length==0) {
			 db.insert(  
			     {				 
				 type: think,
				 subj: inta.hwAddr,
				 obj: inta.hwAddr,
				 utc: humanTime,
				 ip: inta.ipAddr //(v4 for now)
			     
			     }, function(err,newDoc) {


				 if (err) {
				     log("bugbug417 error on insert"+err);
				     reject("cannot create selfDoc:"+err);
				 } else {
				     logdump("newDoc",newDoc);
				     resolve(newDoc);
				 }
			     }
			 );
		     } else if (arrDocs.length==1) {
			 var selfDoc = arrDocs[0];
			 if (selfDoc.hwAddr == hwAddr)
			     //bugbug should  note the new access time and persist that to disk???
			     resolve(selfDoc);
			 else
			     reject("wrong selfDoc:"+dump(selfDoc));
		     } else {
			 reject("wrong number of selfDocs:"+arrDocs);
		     }
		     
		 });
    });
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
	var retval = 0;  //assume fail until success
	return proPostSoap( xml, routerIp )
	    .then(null,function(reason) {   //catch
		retval = 0;
		log("bugbug754c: "+reason);
	    }).then(function(result) {  

		if (result && result.body && ayvex.contains(result.body,"WANIPConnection:1")) {
		    logdump("port forward OK",preferredExternalPort);
		    retval = 1;	    //SUCCESS
		} else {
		    logdump("bugbug729x: result=",result); 
		    retval = 0;
		}
	    }).then(function(result) {
		if (retval) {
		    return new Promise(function(resolve,reject) {      //from proPortForward   //have to return as a promise
			resolve(retval);
		    });
		} else {
		    return ayvex.proSleep(1000);
		}
	    });

    });

	

}



function proPostSoap(xmlData,routerIpAddr) {

    var post_data = xmlData;

    // An object of options to indicate where to post to
    var options = {
	retryCount: 1,
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





function proTimeGet(host,path) {

    var options = {
	host:host,
	port:80,
	path:path,
	method:'GET',
	headers: {

 	    'Content-Type': 'text/text; charset="utf-8"',
	    'Connection': 'close',
	    //'SOAPAction': '"urn:schemas-upnp-org:service:WANIPConnection:1#AddPortMapping"', 
            'Content-Length': 0

	},
	maxTime: 10000 
    };


    return new Promise(
	function (resolve, reject) {

	    //bugbug consolidate with proGet!!  esp retryCount!
	    var request = http.get(options, function(response) { 
				       
		// Continuously update stream with data
		var body = '';
		response.on('data', function(d) {
		    body += d;        
		    //print(d);
		});
		response.on('end', function() {	
		    clearTimeout(timeout); 

		    resolve(   response.headers  );
		});
	    });

	    // todo in future versions of nodejs, you can put this into the 
	    //     response object so it's more parallel with 'data' and 'end' above!!
	    request.on('error', function(er) {
		print("Got error: " + dump(options) + dump(er)); 
		clearTimeout(timeout);
		reject(er);
	    });
	



	    var timeoutEh = function() {
		print("aborting the request="+(dump(options)));
		request.abort();
	    };

	    var timeout = setTimeout(timeoutEh, options.maxTime || 2000);  

	    request.end();
	}
    );



}










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

function logdump(label,val) {
    log(  label +"="+ dump(val)  );
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


function startBeacon() {

    setTimeout(beacon,1); //now!

    setInterval(beacon,5*MINUTE);  //and every 5 minutes //bugbug randomize better
}

function beacon() {
    //known peers
    db.find({
	type:think   //bugbug fix soon.... this is not selective enough??
    },function(err,docs){


	if (err) {
	    //bugbug what to do here
	    log("error with db.find of 'think':"+err);
	
	} else {

	    return; //bugbug because this doesn't work yet <----------------   not selective enough "find" condition above

	    var msg=dump(docs);
	    print("beacon msg="+msg);
	    debugger; //xx401
	    for(var index in docs) {	  //
		//pk of peer is MAC ??bugbug
		
		var peer = docs[index];
		dumplog("telling peer",peer);
		tellPeer(peer,msg);
	    }
	}
    });
}


function discoverPeersOnLan() {
    //later (bugbug) send broadcast or multicast UDP packet.  w.o. UDP functionality
	//  the listen in web server
}


function tellPeer() {

    log("bugbug934 --tellpeer is nyi");
}




//promise-wrapper for dns.resolve4
function proResolve4(domain) {
    return new Promise( function(resolve,reject) {


	dns.resolve4( domain, function(err,addresses,family) {
	    if (err) {
		reject(err); 
	    } else {
		resolve(addresses);
	    }
	});


    });
}





function proCheckFixDns() {

    //////////////  SECTION  FOR external !!! ip addr....
    //bugbug what about for each interface??? for now just to the "best"
    // the address FROM dns system!!!


    return proResolve4(dnsName)
    
        .then(function(dnsAddresses) {

	    //domain, family, callback  for .lookup???
	    //dnsAddress = dns.lookup(dnsName);
	    if (dnsAddresses.length !== 1) {
		throw new Exception( "dnsAddresses=" + dump(dnsAddresses) );
	    }

	    dnsAddress = dnsAddresses[0];

	    log("dns address="+ dnsAddress);

	}).then(function() {     


	    if (doNotCheckIp)
		return "skipping";

	    // get ext IP addr
	    var options = {
		
		retryCount: 3,
		path: '/',
		method: 'GET',
		  //bugbug should use "firstToSucceed" semantics and have a list of ip-determining sites to try  (or best 3 of 5?)
		host: "api.ipify.org",       //host: "checkip.dyndns.org", <--bugbug the server I pay for never works
		errorMsg: "where is the internet2 ???",  //bugbug: make this option work in proGet 
		maxTime: 5000  //5 seconds
//		headers: {
//		    "Content-type": "text/html",
//		    "Content-length":0
//		}
	    };
	    

	    
	    return proGet(options);   //bugbug need to add retries....this site is flaky???

	}).then(function(stuff) {

	    if (stuff=="skipping")
		return "skipping";

	    //log("bugbug956 stuff="+dump(stuff));

	    var content = stuff.body;
	    log("ext ip content="+content);

	    var maybeIp = content.match(/([0-9]{1,3}\.){3}[0-9]{1,3}/i );

            if ( maybeIp && maybeIp[0] ) {
		ipAddr = maybeIp[0];
		log("measured ip="+ ipAddr);
	    } else {
		log("ERROR: no IP address at checkIP: here is start of content:"+content.substr(0,300));
		throw new Exception("noIPaddr");
	    }


	    if (ayvex.contains(ipAddr,",")) {
		log("bugbug408i");
		throw new Exception("bugbug408s");
	    }

	}).then(function(stuff) {

	    if (stuff=="skipping")
		return "skipping";


	    log( "ipAddr:   actual=" + ipAddr + " ...  dns=" + dnsAddress);
	    log("force = "+force);

	    if ( ipAddr==dnsAddress && !force ) {
		log("not updating: no need");
    
	    }else {
		log("need to update");
	    
		//bugbug test this branch!!!


		//work with dyn.org
		var urlTemplate=
		    "http://ayvex:%s\@members.dyndns.org/nic/update?hostname=%s&myip=%s&wildcard=NOCHG&mx=NOCHG&backmx=NOCHG";
		//like this...  http://username:password@members.dyndns.org/nic/update?hostname=yourhostname&myip=ipaddress&wildcard=NOCHG&mx=NOCHG&backmx=NOCHG
		
		var url = util.format(urlTemplate,pazzword,dnsName,ipAddr);
		
		log(url);
		return proSimpleGet(url);		
	    }


	}).then(function(stuff) { 
	    
	    if (!stuff || stuff=="skipping") 
		return;
	    
	    var body = stuff.body;
	    if (!body)
		return;

	    log( "body from not-quite-curl-bugbug:::" + dump(body));
	    if ( ! /good/.test(body) ) {
		log("bad body from dnsalias"+body);
	    }
	    return body; //bugbug???

	});

}













    // #bugbug do this later....from the perl....

    // #check old IP before rewriting file
    // #my $oldIp;
    // #open my $fhr, "<", "$mcLocalFolder$mcGuideFile";
    // #while(<$fhr>)
    // #{
    // #    next unless /(\d{1,3}\.){3}\d{1,3}/gio;
    // #    $oldIp=$&;
    // #    last;
    // #}

    // #if ($force || ($oldIp ne $ipAddr))
    // #{
    // #print system(qq(git add $mcLocalFolder$mcGuideFile));
    
    // #    open my $fhw, ">", "updateIp.log."+time;
    // #    print $fhw "direct connect IP address is:   $ipAddr:25565\n\n";
    // #    print $fhw "timestamp=".$timeStr;
    // #    print $fhw "\nbookmark this page!";
    // #    print $fhw "\n\nThere is also a creative-mode server if you use 25566 instead\n";
    // #    close $fhw;
    
    // ##system(qq(git commit -m "foobar" $mcLocalFolder$mcGuideFile )) == 0 or print "ERROR: bad commit operation\n";
    // ##system(qq(git push )) == 0  or print "ERROR: bad push operation\n";
    // ##print "skipping copy of file to   https://raw.github.com/smcclure879/Ayvex/master/web/mc/guide.htm\n\n"
    // #}
    // #else
    // #{
    // #    print "not writing file...same IP, not forced\n";
    // #}
















function proSimpleGet(url) {
    var options = {

	retryCount: 1,
	href: url,


    };
    return proGet(options,'');
}





//mine...  a promised http get....
function proGet(options,outData) {  //options ala http.get


    if (!options.retryCount)
	options.retryCount = 3;

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


		//reject(er); 
		options.retryCount--;
		if (options.retryCount<1) {
		    reject("out of retries"+dump(options));
		} else {
		    return proGet(options,outData);  //bugbug did this work?  or use resolve(proGet(blah))???  //xx702
		}
	    });
	
	    if (outData) {
		request.write(outData);
		request.end();
	    }


	    var timeoutEh = function() {
		print("aborting the request="+(options.nick||options.host||dump(options)));
		request.abort();
	    };

	    var timeout = setTimeout( timeoutEh,   options.maxTime || 2000  );
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
	    var child = exec(path+" "+arg1,  //bugbug shouldn't be concatting these, find a better method to call!!!
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







function NetInterface(nick,name,ipAddr,hwAddr) {
    this.nick = nick;
    this.name = name;
    if (!ipAddr) { //bugbug
	throw new Exception("no ip addr");
	process.exit(47);
    }
    this.ipAddr = ipAddr;
    this.hwAddr = hwAddr;
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


    var hwAddr=seek2(section,"HWaddr");

    if (!hwAddr || !hwAddr.length>3) {

	throw new Exception("bugbug626u="+hwAddr);
    }


    log("found hwAddr="+hwAddr);

    if (!ipAddr) {
	quip("bad interface: "+getNick(name));
	return null;
    }
    
    return new NetInterface(nick,name,ipAddr,hwAddr)
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
	retryCount: 1,  //only 1 chance on a verification!
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
    localTime = theTime.toString();
    timeForLogFile = fileFriendlyTime(theTime);   //because this didn't work on PC! .toString( "YYYY-MM-DDTHH:mm:ss.sssZ" );



    // check space on disk with df

    
    // # open the log
    //print(process.cwd());
    var logFile = "./logs/meshing_"+timeForLogFile+".txt";
    print("logfile="+logFile);
    print("cwd="+process.cwd());
    fh1=fs.openSync(logFile, 'a');

    log("----starting log----time="+humanTime);




    //better make sure we can get the DB file rights etc...
    db = new Datastore({ filename: databaseFile, autoload: true });  //synchronous load






    var uptime = null;
    var sections = [];



    //if less than N minutes since startup then hold off (exit)
    return  proRun("cat","/proc/uptime")
    	.then(null,function(reason) {
	    log("uptime computation didn't work:"+reason);
	    //bugbug die  ayvex.die(why);
	}).then(function(output) { 
	    var stdoutput = output.stdout.toString();
	    uptime=parseInt(stdoutput.split(" ")[0]);
	    log( "hrs up=" + Math.floor( uptime/3600 )); 

	    var delay = 1*MINUTES;
	    if ( uptime < delay ) {
		setTimeout(startItUp,delay); //try again in 5
		throw new Exception("too early"); //to take us out of here for now
	    }


	    // get the external vs. internal clock time...
	    return proTimeGet( 'www.timeapi.org','/utc/now' );

	}).then(null,function(reason) { //catch
	    log("issue getting time:"+ reason);
	    throw new Exception("bugbug440y"+reason);  
	}).then(function(headers) {

	    correctTime = headers.date; //bugbug or it should be humanTime

	    //here try to get the time for files we used there
	    var timeStr = humanTime + " UTC    local=" + localTime; //bugbug is there previous time string available?? verify sources
	    log( "computer clock: " + timeStr );
	    log( "timeapi.org has: " + dump(correctTime) );

	    // bugbug if theTime < year2015 then ayvex.die()
	    log("end of time section");
	}).then( function() {


	    // # #if there's another of me then die -- bugbug just don't let this happen
	    // ok don't do this.......procs = run("ps", "-A").split()   should return zero lines containing nodejs??? bugbug
	    //...... instead....
	}).then( function() {
	    //bugbug move creation code too???
	    return proPrepDb();  //writes a startup record in there

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

	    
	    var interfacesForProcessing=mapValuesInside(interfaces,function(ni) {   //ni = network interface
		return ni.verify();//still a promise
	    });
				      

	    return settleMap( interfacesForProcessing );

	   
	}).then( function(hashNetInterfaces) {

	    //each item in hash represents an interface.  each subiem a site result for that interface
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
		} else {
		    quip(netNick + " interface is up");
		    if (!bestInterface) {
			bestInterface = netNick;
		    }
		}
	    }
	    
	    hashNetInterfaces.utc=humanTime;
	    log(dump(  hashNetInterfaces  ));



	    log("scan complete");	    

	}).then(null, function(reason) {  //catch
    
	    log("something went wrong"+dump(reason));
	    //quip("one interface bad maybe");

	}).then(function() {

	    //bugbug you are here    bestInterface is only the nick for the best interface.  
	    //     gotta go pull it from the hash, but hashNeInterfaces is already-scanned, so missing hwAddr etc etc

	    //fix bestInterface up
	    bestInterface = interfaces[bestInterface];


	    
	    if (!bestInterface) {
		log("bugbug128p no best interface NICK found"+dump(bestInterface));
		return null;
	    }

	    if (!bestInterface) {
		log("bugbug128p no best interface ITEM found"+dump(bestInterface));
		return null;
	    }
	    
	    if (!bestInterface.hwAddr) {
		log("bugbug128p no hwAddr found"+dump(bestInterface));
	    }
	

   

	    //check our identity-from db vs. our hwAddr from ifconfig 
	    return proVerifySelfRecord(bestInterface);  

	    //bugbug do we ahve enough to complete it here?  break it up into multiple records how???

	}).then(null, function(er) {  // "catch"
	    log(er);
	    return null;  //as the self doc, because what else?
	}).then(function(selfDoc) {
	    
	    logdump("selfDoc",selfDoc);
	    me = selfDoc;  //bugbug verify this var usage everywhere?  what if null from above.



	    //bugbug next you are here....make this a range of ports and record if it worked in a global and db.  it's important to know if we are full or half meshite.

	    var meshPortMappings = ayvex.rangeMapping(meshPortBase, meshPortBase+meshPortCount); //  [[9091,9091],[9092,9092]]  etc

	    var chain = meshPortMappings.reduce(function(previous,item) {
		return previous.then(function(previousValue) {
		    logdump("bugbug ignore previous value=",previousValue);
		    return proPortForward(bestInterface,item[0],item[1]);
		});
	    }, Promise.resolve(7777) );  //bugbug7777
	    
	    return chain;

	}).then(function() {

	    log("mapping two ssh ports as well!");

	    var extraSshPort = meshPortBase+meshPortCount+1;
	    return proPortForward(bestInterface,extraSshPort,22)  //might now work, we don't care
	        .then(null, function(reason) { //catch
		    logdump("ssh port mapping failed, reason=",reason);
		}).then(function(result) {
		    log("doing 2nd shh port");
		    return proPortForward(bestInterface,22,22); //this might work, and if it doesn't then Oh well.
		}).then(null, function(reason) { //catch
		    logdump("ssh port mapping 22 failed",reason);
		});
	    
	    

	}).then(function() {

	    log("checking and fixing dns");
	    return proCheckFixDns();

	}).then(function() {

	    log("starting beacon");
	    startBeacon(); //known peers
	    discoverPeersOnLan();

	});
	

	

	    log("end of entry function");


	}  //returned
	








//function iammapped(bugbug) {
//    return true;  //bugbug
//}
	
// 	    client.getMappings(function(err,results) {    

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
	response.end("Hello World  bugbug this is supposed to be for forwarding to other machines!!!  this is just sample for now\n");
    });
    server.listen(meshPortBase);  //for now is this unique enough?? bugbug listen on all ports!  for what?  
    
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

function seek2(corpus,soughtName) {  //look for soughtName,whitespace,hexesAndColons

    var chunks = corpus.split("  ");
    var sought = soughtName + " ";
    var theLen = sought.length;
    for (var chunkIndex=0, il=chunks.length; chunkIndex<il; chunkIndex++ ) {
	var chunk = chunks[chunkIndex];
	if ( chunk.substr(0,theLen)==sought )
	    return chunk.substr(theLen);
    }


}


function runHide(prog,arg1) {  //bugbug doesn't hide output yet??
    proRun(prog,arg1)
	.then(null,function(reason) {
	//hide the yucky error.   //print("i didn't say it "+reason);

	});
}






startItUp();

