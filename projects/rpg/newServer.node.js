
const express = require('express');
const vhost = require('vhost');  //sorting on domain name virtual host
const morgan = require('morgan'); //logging
const bodyParser = require("body-parser");
const path = require('path');
const util = require('util')
const fs = require('fs');
//quip didn't work I wrote my own below....

/*      DESIGN notes: 
      1. goto https://<anything>.DOMAIN.com:PORT/whatever  goes to where it did before
          so we don't hurt VR or messaging
      2. if anything != rpg or apg then default
      3. if whatever == roll then serve static rolling page, querystring feeds action  e.g. /roll/2d6+2
      4. later if /roll/sword  then can see a random sword etc etc which means bring down a data file also 
      5. later /roll/9400xx  patterns also work which means bring down data file(s) also
      6. if /game/gameName  then serve  /games/gameName.game to the user, just the last 10K or so,
           unless more args to say full range or something?  
      7. some facility to search within a game log, e.g. to look up a stat previously determined.
      8. over time can grow more state than just a file? (keep all mods to a user's strength, so can answer 
      "what is user strength" when DM queries.  Should we move to a DB  sooner?
      9. big lookup tables...access statically, they are stored as 100 or 1000 line files by number
      10. can read all number files periodically for fast random lookup?
      11. files live on github for updating.  
      12. game files are checked in there.
      13. (use blockchain to store game state????)--doublespending of arrows??

      14. api vs. page calls....there's a page of html and js that hosts game and calls to api for game content and rolls and stuff within that game.

      15. simple rolls can be local. game rolls should be in api or by dm. player can initiate a "standard saving throw, and the api has to do it to avoid cheat.  or for standard combat, it happens at server as part of much larger process. dm can roll any time, 
16. in all cases a roll SHOWS. you know the DM rolled, maybe 1d6+3, maybe just "roll roll". 



*/


const assert = (testCond, label) => {
    if (testCond) return;
    throw new Error(label);
};



var okGame = /\w{3,8}/;   //is 3 to 8 word chars, ONLY !
var serveGameFile = function(req,res,next) {

    var gameName = req.params.gameName;  
    if (!okGame.test()) {  //"test" does opposite of what you'd think!!
	console.log("about to call next or throw or something...");
	throw new Error('err1739o '+gameName);
	//next();
	//return;
    }
    var absPath=path.join(__dirname,"game",gameName+".game");
    serveStaticAbsPartial(res,absPath,'text/html',4000,1);   //4000 bytes, use whole lines
}


var serveStaticAbs = function(res,absPath,mimeType) {
    mimeType=mimeType || 'text/plain';
    res.setHeader('Content-Type', mimeType);
    res.sendFile(absPath);
}

function min(a,b) {
    if (a<b) return a;
    return b;
}


//don't call this unless it's a verified allowedFile!!
var serveStaticAbsPartial = function(res,absPath,mimeType,bytesMax,useWholeLines) {

    var stats=fs.statSync(absPath);
    var bytesToSkip = min(0,stats.size-bytesMax);

    fs.createReadStream(absPath, { start:bytesToSkip, end:bytesMax })
	.pipe(res);
};

var appendToFileAsync = function(absPath,text,next){
    var fhw = fs.createWriteStream(absPath, {flags: 'a'});

    var x = fhw.write(text,function(q){
	fhw.end();
	console.log('x'+util.inspect(x));
	console.log('q'+util.inspect(q));
	next();
    }, function(q) {

	console.log("q2" + util.inspect(q));

    });
}




const allowedFiles = "view.js     view.htm".split(/[^\w\.]+/);
assert(   allowedFiles.indexOf("view.js")>-1 , "quick test of allowed Files" );

//var serveStaticDir = serveStatic(path.join(__dirname));  wasn't working so well


function last(x) {  //x is array
    return x[x.length-1];
}


function getExtension(fileName) {
    var parts=fileName.split('.');
    return last(parts);
}


function typeFromExtension(fileName) {
    var ext=getExtension(fileName);

    switch(ext) {
    case 'js':  	return  'text/javascript';
    case 'htm':         return  'text/html';
    }

    throw new Error("unregistered file type");
}


var serveStaticDir = function(req,res,next){
    
    var sought = req.params.sought;
    //console.log("sought="+sought);
    
    if (  allowedFiles.indexOf(sought) < 0  ) {
	quip(res,"what the heck905..."+sought);
	res.end();
	next();
	return;
    }
    var absPath=path.join(__dirname,"statics",sought);
    var mimeType = typeFromExtension(sought);
    serveStaticAbs(res,absPath,mimeType);
}
;

var serveIconFile = function(req,res,next){
    console.log("bugbug icon nyi");
    res.status(404).send();
    res.end();
}

var urlEncodedParser = bodyParser.urlencoded({ extended:true });
var appendGameFile = function(req,res,next) {
    var gameName = req.params.gameName;

    if (!okGame.test()) {  //"test" does opposite of what you'd think!!
	console.log("about to call next or throw or something...");
	throw new Error('err1739o '+gameName);
    }

    //console.log(util.inspect(req.body));
    var t = req.body.t+"\n";
    
    var absPath=path.join(__dirname,"game",gameName+".game");
    appendToFileAsync(absPath,t,function(){
	res.status(200).end();
    });
    //console.log("append to game="+absPath);
    //console.log(''+t);
    
}
//)
;




				    
//a default app, will eventually pass to the old server.  maybe a watcher will insure it stays running.
var badHostApp = express();
badHostApp.use(function(req,res,next){
	// res.setHeader('Content-Type', 'text/plain');
	// res.end("bad host");
    console.log("xxxxy badhost");
    res.status(503).send();
    res.end();
});



function quip(res,x) {
    res.setHeader('Content-Type', 'text/plain');
    res.end('quip....  '+x);
}


var rpgApp = express();
rpgApp.use('/statics/:sought', serveStaticDir);
rpgApp.get('/game/:gameName', serveGameFile);
rpgApp.post('/game/:gameName', urlEncodedParser, appendGameFile);
rpgApp.use('/favicon.ico', serveIconFile);
//handle bad urls common cases





    


// create main app
var app = express();
app.use(morgan('combined'));  //or 'tiny'


// vhost dispatching
app.use(vhost('rpg.ayvexllc.com', rpgApp));
app.use(vhost('www.ayvexllc.com', badHostApp));
app.use(vhost('ayvexllc.com', badHostApp));

app.use(vhost('rpg.localhost', rpgApp));
app.use(vhost('localhost', badHostApp));
app.use(vhost('*.localhost', badHostApp));

app.listen(3000);

//DONE
