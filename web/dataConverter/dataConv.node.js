var fs = require('fs');


var inputFilename = '../data/bezdekIris.data.txt';
var outputFilename = '../data/iris.json';

var stuff=fs.readFileSync(inputFilename);

//console.log((""+stuff).split(/[\n\r]+/)[0]);

var lines = (""+stuff).split(/[\n\r]+/)
var all = {};
all.docs=[];
for(var ii=0, il=lines.length; ii<il; ii++)
{
	var f = lines[ii].split(/,/);
	var obj={
				_id:"iris-"+ii,
				x:f[0],
				y:f[1],
				z:f[2],
				xd: f,  //just pack them all in here, later we can get rid of x,y,z (bugbug)  bugbug should these really be in pointh or elsewhere in dataPoint?
				h: null //, //bugbug ok to defer?  (here and elsewhere?)
				//t: "bugbug1204r"				
			};
	all.docs.push(obj)
}


fs.writeFile(outputFilename, JSON.stringify(all, null, 4), function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log("JSON saved to " + outputFilename);
    }
}); 

// uploaded file (which is 100's of "docs") thusly...
//    >>> curl --upload-file ../data/iris.json  -H "Content-Type:application/json" -X POST http://127.0.0.1:5984/cosmos/_bulk_docs



