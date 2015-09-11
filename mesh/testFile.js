
//  some async-but-sequential  file system examples including trying to use the promised-io/fs module





//  author:smcclure879


//var http = require('http');
var fsp = require('promised-io/fs');
var util = require('util');
//var subprocess = require('child_process');
var RSVP = require('rsvp');






var fh1 =   fsp.open("./logs/log2.txt",'a');


fh1.write("here it is").then(function() {
    fh1.close();
});

process.exit(1);













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
function log(x) {
    if (!fh1)
	print("what??? no log file");

    fs.writeSync(fh1,x);
}



function startItUp(){
    RSVP.on('error', function(reason) {  console.assert(false, reason);   }  );


    var path = require('path');
//    var fh1 = fs.openSync(path.join(process.cwd(), 'log.txt'), 'a');
    fh1 = fs.openSync( './logs/log.txt', 'a');
    fs.writeSync(fh1, 'contents to append');
    console.log('closing file now');
    fs.closeSync(fh1);
    return;


    var MINUTES = 60;
    // #chdir into own dir
//    process.chdir(__dirname);
  


//    process.exit();















    
    // # #figure the time for log file etc.
    theTime = new Date();
    humanTime = theTime.toUTCString();
    //timeForLogFile = fileFriendlyTime(theTime);   //because this didn't work on PC! .toString( "YYYY-MM-DDTHH:mm:ss.sssZ" );

    

    // check space on disk with df

    
    // # open the log
    var logFile = "./logfoo.txt";
    var fh1=fs.openSync(logFile, 'a');
//    print(dump(fh1));
    fs.writeSync(fh1,"hihihi");
    log("----starting log----time="+humanTime);


    //bugbug temp close to test!!
    fh1.closeSync(fh1);
    fh1=null; 




}


function morePromiseOldCode() {

//chopping continues here bugbug





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
