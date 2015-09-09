
//  author:smcclure879


var http = require('http');
var fs = require('fs');
var util = require('util');
var subprocess = require('child_process');


//can't use promiscuous (it's simpler to follow, but doesn't do hashSettled()
//var Promise = require('promiscuous');
var RSVP = require('rsvp');  //so trying this lib instead
var Promise = RSVP.Promise;



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


var fh1=null;


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
    this.ipAddr = ipAddr;
}


NetInterface.prototype.verify = function() { // on all sites
    var that = this;

    var hashOfPromises = mapValuesInside(testSites, function(site) {
	return 	site.verify(that); 
    });

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
    print("dirname="+__dirname+"xxx");
    process.chdir(__dirname);
    
    
    // # #figure the time for log file etc.
    theTime = new Date();
    humanTime = theTime.toUTCString();
    timeForLogFile = fileFriendlyTime(theTime);   //because this didn't work on PC! .toString( "YYYY-MM-DDTHH:mm:ss.sssZ" );

    

    // check space on disk with df

    
    // # open the log
    print(process.cwd());
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

	    interfaces=enhash(interfaces,'nick');  //nick is key!


	    interfaces=mapValuesInside(interfaces,function(ni) {   //ni = network interface
		    return ni.verify();
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

		hashNetInterfaces[netNick].updown=niUpdown; //bugbug needed??
	    }



	    for (var netNick in hashNetInterfaces) {
		if (!hashNetInterfaces[netNick].updown)
		    quip(netNick + " interface is down");
		else 
		    quip(netNick + " interface is up");
		
	    }
	    
	    hashNetInterfaces.utc=humanTime;
	    print( dump( hashNetInterfaces ) );



	    log("scan complete");	    
	    //quip("all interfaces ok");

	}, /* catch */ function(reason) {
    
	    log("something went wrong"+dump(reason));
	    //quip("one interface bad maybe");

	});



    log("end of entry function");


}







function quip(x) {
    log("SPEAKING : "+x);
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

// //bugbug need event to run these...what's it called?
// function doOnClose() {
    // quip("arrrrrr")
    // closeAll()
// }
