//  author:smcclure879


// "imports"
var http = require('http');
var fs = require('fs');
var subprocess = require('child_process');



// settings
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



function run(prog,arg1) {
    var running = subprocess.execFile( prog, [arg1] );
    running = 
}

function runall(argsArray) {  //#of which prog is the first!
    return run( argsArray[0], argsArray.splice(0,1) );
}






var fh1=null;
function log(x) {
    x += "\n"
    if (fh1)
	fh1.write(x)

    if (echoToConsole)
        console.log(x)
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



////////////    START  /////////////
function startItUp(){
    
    var MINUTES = 60;
    
    // #chdir into own dir
    process.chdir(__dirname)
    
    
    // # #figure the time for log file etc.
    theTime = new Date();
    humanTime = theTime.toUTCString();
    timeForLogFile = theTime.toString( "YYYY-MM-DDTHH:mm:ss.sssZ" );
    console.log(timeForLogFile); //bugbug
    
    
    // # open the log
    var logFile = "./logs/meshing_"+timeForLogFile+".txt";
    var fh1=fs.openSync(logFile, 'a');
    log("----starting log----time="+humanTime);


    
    var server = http.createServer(function (request, response) {
	response.writeHead(200, {"Content-Type": "text/plain"});
	response.end("Hello World\n");
    });
    
    
    var meshPort = 9091;
    server.listen(meshPort);



    //if less than 5 minutes since startup then hold off (exit)
    uptime = parseInt(run("cat","/proc/uptime"));
    log( "hrs up=" + uptime/3600 )
    if ( uptime < 5*MINUTES ) {
	log( "waiting 5 minutes " );
	sleep(5*MINUTES);
    }


    // # #if there's another of me then die -- bugbug just don't let this happen
    // # run ps grep for checkEverything
    // procs = run("ps", "-A").split()   should return zero lines containing nodejs??? bugbug




    var sections = runall(["ifconfig"]).split("\n\n");
    var interfacesUp = 0;

    console.log(sections)

//  for section in sections:  #each is an interface
//     lines=section.split("\n")
//     name = lines[0].split("  ")[0]
//     if not name:
//         continue
//     if name=='lo':
//         continue
//     print "interface="+name
//     ipAddr=seek(section,"inet addr")
//     if not ipAddr:
//         quip("bad interface: "+getNick(name))
//     else:
//         interface = makeInterface(name,section)
//         sitesOk = 0
//         for site in testSites:
//             if site.verify(interface):
//                 sitesOk += 1
//             else:
//                 quip(site.nick + " is down")



//         if sitesOk>0: #some are at least
//             log("interface ok:" + interface.nick)
//             interfacesUp += 1
//         else:
//             quip(interface.nick + "is down")
//             #start pinging the router etc            

// if interfacesUp<1:
//     quip("comcast is down")


        
    log("Server running at http://127.0.0.1:"+meshPort+"/");

}





function Site(nick,host,port,expectCode) {
    this.nick = nick;
    this.host = host;
    this.port = port;
    this.expectCode = expectCode;
    this.strict = true;
    this.timeout = 10;
}


// never hand out the same port twice
var nextPort=8899;
var openPorts=function portGiver() {  return nextPort++; }





//  ----- bugbug comb  -----





//     def verify(self,interface):
//         print this.nick
//         try:
//             conn = httplib.HTTPConnection(this.host, this.port, this.strict, this.timeout, interface.getAddressTuple())
//         except HTTPException as ex:
//             log("exception "+ex)
//             return false
            
//         res = ''
//         try:
//             conn.request("HEAD", "/")
//             res = conn.getresponse()
//         except:
//             log("failed response:"+this.nick)
//             return false


//         try:
//             conn.close()
//         except:
//             pass

//         if res.status==this.expectCode:
//             return true

//         print res.status, res.reason
//         return false




// class NetInterface:
//     def __init__(self,nick,name,ipAddr):
//         this.nick = nick
//         this.name = name
//         this.ipAddr = ipAddr
//     def getAddressTuple(self):
//         return (this.ipAddr,openPorts.next())
    

// def makeInterface(name,section):
//     nick=getNick(name)
//     ipAddr=seek(section,"inet addr")
//     return NetInterface(nick,name,ipAddr)



// def getNick(name):
//     if name=="eth0":
//         return "wired"
//     elif name=="wlan0":
//         return "wireless"
//     else:
//         return "unknown"









// FNULL = open(os.devnull, 'w')
// def runhide(prog,arg1):
//     cmd = subprocess.Popen([prog,arg1],stderr=FNULL) #bugbug how to hide input??
//     stdoutdata, stderrdata = cmd.communicate()
//     return stdoutdata


// def quip(x):
//     log(x)
//     if speaking:
//         runhide("espeak",x)  #it's noisy


// def seek(corpus,soughtName):  #look for soughtName:  value  and return value
//     chunks = corpus.split("  ")
//     sought = soughtName + ":"
//     theLen = len(sought)
//     for chunk in chunks:
//         if chunk[0:theLen]==sought:
//             return chunk[len(sought):]
//     return ''












startItUp()

//bugbug need event to run these...what's it called?
function doOnClose() {
    quip("arrrrrr")
    closeAll()
}