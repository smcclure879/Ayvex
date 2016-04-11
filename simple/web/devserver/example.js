
console.log('starting up');



var     //lazy    = require("lazy"),
        fs  = require("fs"),
		http = require('http');

var port = 8124;



String.prototype.contains = function (sought) {
	return this.indexOf(sought) >= 0 ;
};

function isAlphaNumeric() {
	return  /[^a-zA-Z0-9]/.test( this );
};



http.createServer(function (request, response) //request is node.js "message" obj
	{
		console.log(request.url);
		response.writeHead(200, {'Content-Type': 'text/plain'});
		if (isAlphaNumeric(request.url[0]) && request.url.contains("erq"))  //bugbug switch
		{
			var localFile = "C:\\Users\\steve\\Documents\\GitHub\\Ayvex\\web\\mc\\map\\data\\"+
				"erq_all_month.csv";
			fs.readFile(localFile, function (err, data) 
				{
					if (err) throw err;
					//console.log(data);
					response.end(data+'\n');
				});
		}
		else
		{
			response.end('Hello World\n');
		}
	}
).listen(port);

console.log('Server running at http://127.0.0.1:'+port+'/');



 // new lazy(fs.createReadStream('./MyVeryBigFile.csv'))
     // .lines
     // .forEach(function(line){
         // console.log(line.toString());
     // }
 // );
