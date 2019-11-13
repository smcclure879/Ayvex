'use strict';
// const webPush = require('web-push');
const http = require('http');
const sqlite=require('sqlite3');
const sqa=require('./sqliteAsync');
const crypto=require('crypto');
const fs = require('fs');
const print = function(x){	process.stdout.write(""+x+"\n");    /*log to a file here?   sqa requires this*/    };

// const https = require('https');
// const fs = require('fs');
// const path = require('path');
// const ext = /[\w\d_-]+\.[\w\d]+$/;
//const util = require("util");
// const datastore = require('nedb');

// const exec = require('child_process').exec;

Object.prototype.startsWith = function (sought) {
    return this.indexOf(sought) == 0;
}



const dbx = new sqlite.Database('uniMsg.db');  //bugbug do i need code to insure stays with script (same dir)???
const db = sqa.promote(dbx);
//build tables here bugbug you are here
(async function(){
    
    await dbx.forceTable('subs',[
	"subscription   varchar(2000)    primary key",    
	"id             varchar(20)      ",                //like a hash of the sub+, but mapped to a name (not chosen)
	"userNick       varchar(20)      not null",       //their "name" on the system, chosen by them
	"userDev        varchar(20)      not null",       //the function of the device like "acer-laptop"
    ]);
    await dbx.runAsync('CREATE INDEX if not exists findByNick ON subs(userNick);');
    await dbx.runAsync('CREATE INDEX if not exists findById   ON subs(id      );');

    
    await dbx.forceTable('msg',[
	"rndId     varchar(20)    primary key",  //provided by client, is OK because only needs to be a rnd guid  (bugbug needs be hash?)
	//"sender    varchar(2000)    references(subs)",
	//"receiver  varchar(2000)    references(subs)",
	"text      varchar(200)   not null",
	//"oob       varchar(200)   null ",
	"state     integer        not null"
    ]);
    await dbx.runAsync('CREATE INDEX if not exists msgByState ON msg(state);');

    process.exit(1);

`

create table if not exists player (
       playerid integer primary key,  --mastered elsewhere???
       uniquename varchar(20) not null
);

create table if not exists playergame (  --can player play game, etc
       playerid integer player,
       gameid integer game references game,
       canPlay varchar(10) not null,
       primary key (playerId,gameid)
);
    `;

    
})();


function intdiv(a,b) {
    return Math.trunc(a/b);
}



async function receivePut(req,res) {
    return new Promise(function(resolve,reject){
	var body='';
	req.on('data',function(data){	    body+=data;   	});
	req.on('end' ,function(    ){	    resolve(body);    	});
    });
}



//script_dir = os.path.dirname(__file__) #<-- absolute dir the script is in
//absFilePath = os.path.join(script_dir, relPath)


var relPath = "../../server/subJobs/names.txt";
function fileAsLines(path) {
    return fs.readFileSync(path).toString().split("\n");
}
const nicks=fileAsLines(relPath);
function lookupNick(index) {
    let y = intdiv(index,2);
    let x = 1 + index%2;
    return nicks[y].split('\t')[x].trim();    //  +1 for skipping the 0th column which is enumeration
}




function dump(b) {
    return JSON.stringify(b);
}

async function reg(req,res,path) {
    var body = await receivePut(req,res);
    print(body);
    var b=JSON.parse(body);
    var stuff=b.userNick+b.userDev+b.subscription;
    const hash = ""+crypto.createHash('sha256').update(stuff).digest('hex');
    const hashd= BigInt("0x"+hash);
    const ind=parseInt(hashd)%2000;
    const id=lookupNick(ind);
    b.id=id;

    //write it to a database here  bugbug
    
    

    var outstuff="b="+dump(b);
    writeSub(b);
    print(outstuff);



    res.end(outstuff);
    
    return 1;
}

async function queryNick(req,res,path) {
    var results = await db.query("nick=="+path);
    print(results);
    res.end(results);
    return 1;
}

async function send(req,res,path) {
    var who=path;
    var body = await receivePut(req,res);
    print(body);
    res.end("bugbug1944r");
    return 0;
}

function wol() {
    return 0;
}
function sendall() {
    return 0;
}
function prefixHandler(req,res,path,prefix,h) {
    print("ph--"+prefix);
    if (!path.startsWith(prefix)) return 0;
    path=path.substr(prefix.length);
    return h(req,res,path);
}

function defaultHandler(req,res,path) {
    res.end("nope");
    return 1;
}


//in keeping with goal of replicating the "big" server on the laptop
		    //two goals here 1. get beep api to work as before including convo
		    //but mostly want 2. new beep api register/send/queryName(name)/queryNick(nick)
		    //later wol might move elsewhere...
function beepApiHandler (req, res) {
    let path=""+req.url;
    return prefixHandler(req,res,path,"/api/beep/",function(req,res,path) {
	return prefixHandler(req,res,path,"register/",reg)
	    || prefixHandler(req,res,path,"queryNick",queryNick)
	    || prefixHandler(req,res,path,"send",send)
	    || prefixHandler(req,res,path,"wol/",wol)  //might move out of the "beep" api?
	    || prefixHandler(req,res,path,"sendall/",sendall)
	    || defaultHandler(req,res,path);

    });
}

const port=6339;  //6339=bEEp in "leetspeek"
http.createServer(beepApiHandler).listen(port);  

