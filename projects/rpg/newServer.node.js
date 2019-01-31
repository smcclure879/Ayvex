var connect = require('connect');
var express = require('express');
var serveStatic = require('serve-static');
var vhost = require('vhost');  //sorting on domain name virtual host
var morgan = require('morgan'); //logging
var dispatch = require('dispatch');  //sorting on various parts of url except domain name
var http = require('http');
var path = require('path');

/*

      DESIGN: 

      1. goto https://<anything>.DOMAIN.com:PORT/whatever  goes to where it did before
          so we don't hurt VR or messaging
      2. if anything != rpg or apg then default
      3. if whatever == roll then serve static rolling page, querystring feeds action  e.g. /roll/2d6+2
      4. later if /roll/sword  then can see a random sword etc etc which means bring down a data file also 
      5. later /roll/9400xx  patterns also work which means bring down data file(s) also
      6. if /game/gameName  then serve  /games/gameName.game to the user, just the last 10K or so,
           unless more args to say full range or something?  
      7. some facility to search within a game, e.g. to look up a stat previously determined.
      8. over time can grow more state than just a file? (keep all mods to a user's strength, so can answer 
      "what is user strength" when DM queries.  Should we move to a DB  sooner?
      9. big lookup tables...access statically, they are stored as 100 or 1000 line files by number
      10. can read all number files periodically for fast random lookup?
      11. files live on github for updating.  
      12. game files are checked in there.
      13. (use blockchain to store game state????)--doublespending of arrows??

      14. api vs. page calls....there's a page of html and js that hosts game and calls to api for game content and rolls and stuff within that game.









*/



//a static server for serving files that are clientside code, for example.
//var serveFromFoo = serveStatic('foo',{'index':['index.html','index.htm']});

var serveRollFile = express().use(function(req,res) {
    var absPath = path.join(__dirname, "statics", "roll.htm");
    res.sendFile(absPath);
})

var okGame = /\w{,8}/;
var serveGameFile = function(req,res,next,gameName) {
    if (okGame.test())
	throw new Error('bugbug1739o');

    var absPath=path.join(__dirname,"game",gameName);
    res.setHeader('Content-Type', 'text/html');
    res.sendFile(absPath);
}


//a default app, will eventually pass to the old server.  maybe a watcher will insure it stays running.
var badHostApp = express();
badHostApp.use(function(req,res,next){
	// res.setHeader('Content-Type', 'text/plain');
	// res.end("bad host");
    console.log("xxxxy");
    //res.status(503).send();
    res.status(503).send();
    //next();
    
    //return res.badRequest('go away!');
});  //bugbug should be to serve an error !!





function blah(res,x) {
    res.setHeader('Content-Type', 'text/plain');
    res.end('blah  '+x);
}


var rpgApp = express();
rpgApp.use(
    dispatch({
	'/roll/?.*': serveRollFile
	,'GET /game/:gameName': serveGameFile
	,'POST /game/:gameName': express().use(function(req,res,next,gameName){
	    //append body to file indexed by gameName (after sanity and security checks)   bugbug
	    //do not return tail....request it if wanted.

	    blah(res,gameName+"posting foobar");
	    
	    //also, periodically try to persist to a backup location (github?)

	    //do not call next we are done
	    
	})
    })
);




// function(req,res,next){
	    
// 	    blah(res,something);///bugbug make a staticd fl for this  bugbug
// 	    next();
// 	}

// rpgApp.use('/roll/',function(req,res,next){
//     res.setHeader('Content-Type', 'text/plain')
//     var re = /(\d+)d(\d+)/;
//     x=req.url.match(re)
//     res.end('rolling-fine'+x);
//     next();
// })



    


// create main app
var app = connect();
app.use(morgan('tiny'));


// vhost dispatching
app.use(vhost('rpg.ayvexllc.com', rpgApp));
app.use(vhost('www.ayvexllc.com', badHostApp));
app.use(vhost('ayvexllc.com', badHostApp));

app.use(vhost('rpg.localhost',rpgApp));
app.use(vhost('localhost', badHostApp));
app.use(vhost('*.localhost', badHostApp));


app.listen(3000);

//DONE


    // create app that will server user content from public/{username}/
// var userapp = connect()
// userapp.use(function(req, res, next){
//     var username = req.vhost[0] // username is the "*"

//     // pretend request was for /{username}/* for file serving
//     req.originalUrl = req.url
//     req.url = '/' + username + req.url

//     next()
// })
// userapp.use(serveStatic('public'))






    
// listen on all subdomains for user pages
//app.use(vhost('*.userpages.local', userapp))
