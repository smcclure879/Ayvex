//  author:smcclure879


// "imports"
var http = require('http');
var fs = require('fs');
var subprocess = require('child_process');
var Promise = require('promiscuous');



var options = {
  host: 'www.google.com',
  port: 80,
  path: ''
};

// http.get(options, function(res) {
  // console.log("Got response: " + res.statusCode);
// }).on('error', function(e) {
  // console.log("Got error: " + e.message);
// });


//should work like this
function promiseLater(something) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      if (something)
        resolve(something);
      else
        reject(new Error("nothing"));
    }, 1000);
  });
}

//mine...  a promised http get....
function proGet(options) {  //options ala http.get
	return new Promise(
		function (resolve, reject) {
			http.get(options,function(response) { 
								// Continuously update stream with data
								var body = '';
								response.on('data', function(d) {	body += d;  });
								response.on('end', function() {	resolve({'body':body,'response':response}); })
							}
					)
				.on('error', function (er) { console.log("Got error: " + er.message); reject(er);}  );
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

function proGetSite(site) { // getSite("www.google.com");
	var options = {
	  host: site,
	  port: 80,
	  path: ''
	};

	return proGet(options)
		.then( function(finishedResponse) { console.log("it worked"+finishedResponse.body); } )
		.then( function(x) { console.log("this too"); } )
		.then( null, function(reason) { console.log("error="+reason) } );
}


function run(prog,arg1) {
	//var stdoutput = subprocess.execSync( prog, [arg1] );  //doesn't exist in this version !! bugbug
    //return stdoutput;
	
	return 	proRun(prog,arg1)
		.then(function(res) { print("bugbug1040a"+res); })
		.then(null, function(reason) { print("reason="+reason); } );

}

// function runall(argsArray) {  //#of which prog is the first!
    // return run( argsArray[0], argsArray.splice(0,1) );
// }


//proRun("dir");








            // for (var sectionIndex=0, il=sections.length; sectionIndex<il; sectionIndex++) {  //  #each is an interface
	    // 	var section=sections[sectionIndex];






function NetInterface(nick,name,ipAddr) {
    this.nick = nick;
    this.name = name;
    this.ipAddr = ipAddr;
}

NetInterface.prototype.getAddressTuple = function() {
    return (this.ipAddr,openPorts.next())
}


NetInterface.prototype.verify = function(site) {


    return this.name;
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
    this.timeout = 10;
}


// // never hand out the same port twice
// var nextPort=8899;
// var openPorts=function portGiver() {  return nextPort++; }





//note: returns a promise-to-verify....rename TODO
Site.prototype.verify = function(interface) {

    print(this.nick);

    var options = {
	host: this.host,
	port: this.port,
	path: '',
	'how to put in interfacebugbug': '',
	verb:'HEAD'  //which option does this?
    };


    
    return proGet(options)
	.then(function(result) {
	    return (res.status==this.expectCode);
	}).then(null,function(reason) {
	    print( " "+res.status, res.reason);
	    return false;
	});
}



//            conn = httplib.HTTPConnection(this.host, this.port, this.strict, this.timeout, interface.getAddressTuple())
//            except HTTPException as ex:
//            log("exception "+ex)
//            return false
            
//        res = ''
//        try:
//            conn.request("HEAD", "/")
//            res = conn.getresponse()
//        except:
//            log("failed response:"+this.nick)
//            return false
//
//
//        try:
//            conn.close()
//        except:
//            pass






// settings
var meshPort = 9091;  //more of a const really bugbug revisit
var echoToConsole = true;
var speaking = false;
var testSites = [
	new Site("google","www.google.com",80,200),
	new Site("comcast","www.comcast.com",80,301), 
	new Site("ayvex","ayvex.dnsalias.com",8081,200),
	new Site("bogus1","notAyvex.dnsalias.com",80,200),
	new Site("bogus2","yapulousity.envalponer.com",80,200),
	new Site("locaz1","192.168.1.1",80,200),
	new Site("locaz2","10.1.1.1",80,200)
];






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

var print = console.log;
function last2(x) {
	x="000000"+x;
	return x.slice(-2);
}
function fileFriendlyTime(t) {  //a Date obj
	
	return ""
			+last2(t.getUTCFullYear())
			+last2(t.getUTCMonth())
			+last2(t.getUTCDate())
			//+"--"
			+last2(t.getUTCHours())
			//+t.getUTCMinutes()
			//t.getUTCSeconds()
	;
		
	//print("year"+someTime.getFullYear());
	//print(someTime.day);
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
    console.log(timeForLogFile); //bugbug
    

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



	    // # #if there's another of me then die -- bugbug just don't let this happen
	    // ok don't do this.......procs = run("ps", "-A").split()   should return zero lines containing nodejs??? bugbug
	    //...... instead....
	    // var server = http.createServer(function (request, response) {
	    // 	response.writeHead(200, {"Content-Type": "text/plain"});
	    // 	response.end("Hello World\n");
	    // });
	    // server.listen(meshPort);  //for now is this unique enough?? todo revisit





	    return proRun("ifconfig");  //really, pass on
	}).then( function(output) {
	    
	    interfaces = output.stdout.split("\n\n")
		.map(createNetInterface) //from a section
		.filter(function(netInterface) {return netInterface!=null && netInterface.name!='lo'});
			


	    return Promise.all( 
		interfaces.map(
		    function(interface) { return interface.verify(); }
		)
	    );
	    
	}).then( function(arrVerifyPromises) { //array of all interface.verify() results!!


	    print("output="+arrVerifyPromises);

	    log("scan complete");	    
	    //quip("all interfaces ok");

	}, /* catch */ function(reason) {
    
	    log("something went wrong"+reason);
	    //quip("one interface bad maybe");

	});



    log("end of entry function");


}










//stuff i might still need...



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













// FNULL = open(os.devnull, 'w')
// def runhide(prog,arg1):
//     cmd = subprocess.Popen([prog,arg1],stderr=FNULL) #bugbug how to hide input??
//     stdoutdata, stderrdata = cmd.communicate()
//     return stdoutdata

function run(prog,arg1) {
    var x=proRun(prog,arg1).then(function(result) {return result});
    print("quipping="+x);
}

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
