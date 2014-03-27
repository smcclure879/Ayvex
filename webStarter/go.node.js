

var fs = require('fs');
var path = require('path');
var http=require('http');

function onPC()
{
	return true; //bugbug
}

function onLinux()
{
	return false;  //bugbug
}

function isDirectory(x)
{
	return fs.lstatSync(x).isDirectory();
}

function skippable(u)  //u is a filename, not full path
{
	u=u.toLowerCase();
	if (u==".git") return true;
	if (u==".metadata") return true;
	if (u=="oldnotused") return true;
	if (u.indexOf("qq")==0) return true;
	//more here bugbug???
	
	return false;
}

function getRelativeUrl(file)
{
	return file;  // bugbug
}

function copyFileToCouch(file,newUrl)
{
	//bugbug run somtehing like this
	//  curl --upload-file ../data/iris.json  -H "Content-Type:application/json" -X POST http://127.0.0.1:5984/cosmos/_bulk_docs
	//but platform specific

	if (onPC()) 
	{	
		//bugbug you are here
	}
	// if (onLinux())
	// {
	
	// }
}





var jj = 0; 
function doForAllFilesSync(dir,fnProcess)
{
	var items = fs.readdirSync(dir);
	for(var ii=0, il=items.length; ii<il; ii++)
	{
		var item=path.join(dir,items[ii]);
		if (isDirectory(item))
		{
			if (skippable(items[ii])) 
				continue;
			doForAllFilesSync(item,fnProcess)
		}
		else
		{
			fnProcess(item);
			jj++
		}	
	};

}

function main()
{
	doForAllFilesSync("../",
		function(file)
		{
			console.log("FILE:"+file);
			
			
			var newUrl=getUrl(file);
			copyFileToCouch(file,newUrl);
			
			
			//console.log("DONE\r\n");
		}
		
		
	); 

	console.log(jj);
}




//main(); //bugbug get below stuff working first



var options = {
	hostname: '127.0.0.1',
	port: 5984,
	path: '/cosmos/foo/bar',
	method: 'PUT',
	headers: {
		"Content-Length": 8,
		"Content-Type": "text/html"
	}
};

var req = http.request(options,function(res){
  console.log('STATUS: ' + res.statusCode);
  console.log('HEADERS: ' + JSON.stringify(res.headers));
  res.setEncoding('utf8');
  // res.on('data', function (chunk) {
    // console.log('BODY: ' + chunk);
  // });
});
req.write("this is text at 1:14am\n");
req.end();

req.on('error', function(e) {
  console.log('problem with request: ' + e.message);
});

console.log("now what");
