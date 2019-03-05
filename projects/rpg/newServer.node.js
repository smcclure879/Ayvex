
const express = require('express');
const vhost = require('vhost');  //sorting on domain name virtual host
const morgan = require('morgan'); //logging
const bodyParser = require("body-parser");
const path = require('path');
const util = require('util')
const htmlEncode = require('htmlencode').htmlEncode;
const fs = require('fs');
const nedb = require('nedb');

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

      17. to support color and stuff..... fields in message: 
          IP sent, local time, server time, local claimed identity 1 and 2  (eg dm speaking as ragnar)
          , crypt id from the messaging system??, color, whether italic, whether bold, and most importantly
          : which game.  index on game and time
      18. we've gone to file to store everything.  we don't allow much formatting in text. certainly we would roundtrip html rather than executing it.




*/


const assert = (testCond, label) => {
    if (testCond) return;
    throw new Error(label);
};






var okGame = /\w{3,8}/;   //is 3 to 8 word chars, ONLY !
var serveGameFile = function(req,res,next) {

    var gameName = req.params.gameName;  
    if (!okGame.test(gameName)) {  //"test" does opposite of what you'd think!!
	console.log("about to call next or throw or something...");
	throw new Error('err1739o '+gameName);
	//next();
	//return;
    }

    console.log("bugbug1620a:"+gameName);
    
    var absPath=path.join(__dirname,"game",gameName+".game");
    serveStaticAbsPartial(res,absPath,'text/html',4000,1);   //4000 bytes, use whole lines
}



var serveStaticAbs = function(res,absPath,mimeType) {
    console.log("serveStaticAbs");
    mimeType=mimeType || 'text/plain';
    res.setHeader('Content-Type', mimeType);
    res.sendFile(absPath);
    //res.end();  bugbug why having this is bad??? already ended once?
    console.log("ssa2");
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

    var x = fhw.write(text,function(){
	fhw.end();
	next();
    }, function() {
	//bugbug anything goes here??
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
    console.log("sought="+sought);
    
    if (  allowedFiles.indexOf(sought) < 0  ) {
	console.log("bugbug905:"+sought);
	quip(res,"what the heck905..."+sought);
	res.end();
	next();
	return;
    }
    var absPath=path.join(__dirname,"statics",sought);
    var mimeType = typeFromExtension(sought);
    serveStaticAbs(res,absPath,mimeType);
    console.log("youve been served"+absPath);
}
;

var serveIconFile = function(req,res,next){
    console.log("bugbug icon nyi");
    res.status(404).send();
    res.end();
}


const validate = function(val,label,reg){
    if (val.match(reg)) return;

    throw new Error("cannot validate "+label+"   "+reg);
}



var urlEncodedParser = bodyParser.urlencoded({ extended:true });
var appendGameFile = function(req,res,next) {
    var gameName = req.params.gameName;

    if (!okGame.test(gameName)) {  //"test" does opposite of what you'd think!!
	console.log("about to call next or throw or something...");
	throw new Error('err1739o '+gameName);
    }

    //bugbug options below do not work!!!
    var xamin = util.inspect(req.body,{breakLength:Infinity,compact:true});
    console.log(xamin);

    //bugbug validate, take apart, put back together HTMLEncoded etc etc
    var who1=htmlEncode(req.body.who1);
    var who2=htmlEncode(req.body.who2);
    var c=htmlEncode(req.body.color);
    var t=htmlEncode(req.body.t);
    var timeCode= new Date().getTime();  //should be server time in UTC but verify
    
    try{
	validate(who1,"who1",/\w{2,15}/);
	validate(who2,"who2",/\w{2,15}/);
	validate(c,"color",/black|red/);
	validate(t,"text", /.{2,140}/);
    }catch(ex) {
	console.log(ex);
	res.status(422).end('error:'+ex);
    }

    
    var lineToPersist=[timeCode,who1,who2,c,t].join("|") + "\n";
    console.log(lineToPersist);
    
    var absPath=path.join(__dirname,"game",gameName+".game");
    appendToFileAsync(absPath,lineToPersist,function(){
	res.status(200).end();
    });
    //console.log("append to game="+absPath);
    //console.log(''+t);
    
}

;




				    
var badHostApp = express();
badHostApp.use(function(req,res,next){
    if (req.vhost[0]=='rpg') {
	return next();
    }
    
    console.log("err729i: badhost:"+util.inspect(req.vhost));
    res.status(503).send();
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

app.use(vhost('localhost', badHostApp));

app.use(vhost('rpg.localhost', rpgApp));
app.use(vhost('*.localhost', badHostApp));

app.listen(3000);

//DONE
