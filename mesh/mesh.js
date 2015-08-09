
//  author:smcclure879


var http = require('http');
var fs = require('fs');
var util = require('util');
var subprocess = require('child_process');


//can't use promiscuous (it's simpler to follow, but doesn't do hashSettled()
//var Promise = require('promiscuous');
var RSVP = require('rsvp');  //so trying this lib instead
var Promise = RSVP.Promise;



Object.prototype.mapValues = function (fn) {
    var retval = {};
    for(var p in this) {
	if (this.hasOwnProperty(p)) 
	    retval[p]=fn(this[p]);
    }
    return retval;
}



var print = console.log;
function dump(x) {
    return util.inspect(x,false,null);
}


//working example of a promise being used
// function promiseLater(f) {
//     return new Promise(function (resolve, reject) {
// 	setTimeout(function () {
// 	    if (f) {
//		
// 		var val=f();
// 		if (val)
// 		    resolve(val);
// 		else
// 		    reject(new Error("nothing"));
// 	    }else{
// 		reject(new Error("nothing2"));
// 	    }
//
// 	}, 100);
//     });
// }
//
//
// promiseLater(function() {
//     return 477; 
// }).then(function(c) { 
//     print("c="+typeof c); 
// });








//mine...  a promised http get....
function proGet(options) {  //options ala http.get
    return new Promise(
	function (resolve, reject) {

	    var request = http.get(options, function(response) { 
				       
		// Continuously update stream with data
		var body = '';
		response.on('data', function(d) {
		    body += d;        
		});
		response.on('end', function() {	
		    clearTimeout(timeout); 
		    resolve(    { 'body' : body , 'response' : response }     ); 
		});
	    });

	    // todo in future versions of nodejs, you can put this into the 
	    //     response object so it's more parallel with 'data' and 'end' above!!
	    request.on('error', function(er) {
		//keep--  print("Got error: " + dump(options) + dump(er)); 
		clearTimeout(timeout);
		reject(er);
	    });
	

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
    this.ipAddr = ipAddr;
}


NetInterface.prototype.verify = function() { // on all sites
    var that = this;
    var hashOfPromises = testSites.mapValues(  function(site) {

	//print("dumpsite="+dump(site));
	return 	site.verify(that); 
    }  );

    //turn the hash of promises into a promise of a hash, in which promises are turned into {state,result/reason} objects
    return RSVP.hashSettled(hashOfPromises);  
}

function createNetInterface(section) {
    var lines=section.split("\n");
    var name = lines[0].split("  ")[0];
    if (!name)
	return null;
    if (name=='lo')
	return null;
    
    print("interface="+name);

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

    //print("verifying site="+this.nick+" on interf="+netInterface.nick);

    var options = {
	host: this.host,
	port: this.port,
	path: '',
	localAddress: netInterface.ipAddr,
	method: 'HEAD'
    };

    var that = this;

    return proGet(options)
        .then(null,function(reason) {
	    return {
		response: {
		    statusCode:-1
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

		//debug fields
		statusCode: statusCode
	    };

	}).then(null,function(reason) {
	    print( "bugbug790a "+dump(reason) );
	    return false;
	});
}


function isdigit(c) {
    return ((c >= '0') && (c <= '9'));
}

Site.prototype.isExt = function()  {
    return !isdigit(this.host.charAt(0));
}




// settings
var meshPort = 9091;  //more of a const really bugbug revisit
var echoToConsole = true;
var speaking = false;
var testSites = {
    //bugbug get rid of dup field???
google:new Site("google","www.google.com",80,200),
    comcast:new Site("comcast","www.comcast.com",80,301), 
    ayvex:new Site("ayvex","ayvex.dnsalias.com",8081,200),
    bogus1:new Site("bogus1","notAyvex.dnsalias.com",80,-1),
    bogus2:new Site("bogus2","yapulousity.envalponer.com",80,-1),
    locaz1:new Site("locaz1","192.168.1.1",80,-1),
    locaz2:new Site("locaz2","10.1.1.1",80,-1)
};






var fh1=null;
function log(x) {
    x += "\n";
    if (fh1)
	fh1.write(x);

    if (echoToConsole)
        console.log(x);
}



function closeAll() {
    try {
        fh1.close()
    } catch (ex) {
        //do nothing
    }

    try {
        FNULL.close()
    }
    catch (ex) {
	//do nothing
    }

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
    
    var MINUTES = 60;
    
    // #chdir into own dir
    process.chdir(__dirname);
    
    
    // # #figure the time for log file etc.
    theTime = new Date();
    humanTime = theTime.toUTCString();
    timeForLogFile = fileFriendlyTime(theTime);   //because this didn't work on PC! .toString( "YYYY-MM-DDTHH:mm:ss.sssZ" );
//    console.log(timeForLogFile); //numeric??bugbug
    

// check space on disk with df

    
    // # open the log
    var logFile = "./logs/meshing_"+timeForLogFile+".txt";
    var fh1=fs.openSync(logFile, 'a');
    log("----starting log----time="+humanTime);


    var uptime = null;
    var sections = [];
    var interfacesUp = 0;



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
	    // var server = http.createServer(function (request, response) {
	    // 	response.writeHead(200, {"Content-Type": "text/plain"});
	    // 	response.end("Hello World\n");
	    // });
	    // server.listen(meshPort);  //for now is this unique enough?? todo revisit


	}).then( function() {
	    return proRun("ifconfig");  //really, pass on
	}).then( function(output) {
	    
	    interfaces = output.stdout.split("\n\n")
		.map(createNetInterface) //from a section
		.filter(function(netInterface) {
		    return  netInterface!=null 	&&  netInterface.name!='lo' ;
		});

	    return Promise.all( 
		    interfaces.map(  //ni = network interface
			function(ni) { 
			    return ni.verify();
			}
		    )
	    );	    
	}).then( function(arrVerifyPromises) { //array of all interface.verify() results!!

	    print("output="+dump(arrVerifyPromises));

	    //each item in array represents an interface.  each subitem a site result for that interface


//	    if (arrVerifyPromises.any())
//		quip("interface ok:"+

	    log("scan complete");	    
	    //quip("all interfaces ok");

	}, /* catch */ function(reason) {
    
	    log("something went wrong"+dump(reason));
	    //quip("one interface bad maybe");

	});



    log("end of entry function");


}










//stuff i might still need...



// old examples of promises...
// function bugbugproGetSite(site) { // getSite("www.google.com");
// 	var options = {
// 	  host: site,
// 	  port: 80,
// 	  path: ''
// 	};

// 	return proGet(options)
// 		.then( function(finishedResponse) { console.log("it worked"+finishedResponse.body); } )
// 		.then( function(x) { console.log("this too"); } )
// 		.then( null, function(reason) { console.log("error="+reason) } );
// }
//
//
//function run(prog,arg1) {
//   return proRun(prog,arg1)
//	.then(function(res) { print("bugbug1040a"+res); })
//	.then(null, function(reason) { print("reason="+reason); } );
//}


	//     sitesOk = 0;
	// 	    //testSites.forEach(function(element,index,array){
	// 	    //print("element"+element+index);

	// 	    var siteResult = site.verify(interface);
	// 	    print(JSON.stringify(siteResult));
	// 	    if (siteResult===true)
	// 		sitesOk += 1;
	// 	    else
	// 		quip(site.nick + " is down "+site);
		    
	// 	    if (sitesOk>0) {  // #some are at least
	// 		log("interface ok:" + interface.nick);
	// 	        interfacesUp += 1;
	// 	    }else{
	// 	        quip(interface.nick + "  is down");
	// 		//#start pinging the router etc            //TODO
	// 	    }

	// 	}) //next site

	//     } //next section


	//     if (interfacesUp<1)
	// 	quip("outside link is down");









//function run(prog,arg1) {
//    var x=proRun(prog,arg1).then(function(result) {return result});
//    print("quipping="+x);
//}

function quip(x) {
    log(x)
    if (speaking)
        runhide("espeak",x)  //it's noisy
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










startItUp();

// //bugbug need event to run these...what's it called?
// function doOnClose() {
    // quip("arrrrrr")
    // closeAll()
// }
