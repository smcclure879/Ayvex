
var fs = require('fs');

// file is included here:
//bugbug did below work instead?   
eval(fs.readFileSync('../web/mc/map/stepper.js')+'');

//var stepper = require('../web/mc/map/stepper');
var fs = require('fs');
var path = require('path');
var http=require('http');

String.prototype.endsWith = function (sought) 
{
	var advance=this.length-sought.length;
	if (advance<0) return false;
	return (this.substring(advance)==sought);
}


function unenquote(str)
{
	return str.replace(/^\"+/, '').replace(/\"+$/, '');
}

function isBinary(file)
{
	return (file.endsWith('.bmp')   ||
			file.endsWith('.gif')) ;
}

function fileSize(file)
{
	var stats = fs.statSync(file);
	var fileSizeInBytes = stats["size"];
	return fileSizeInBytes;
}

function fileContents(file)
{
	return fs.readFileSync(file, "utf8");
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

function getRelativeUrl(file)  //bugbug is this value really used???
{
	return file.substring(3);  //bugbug
}













var basePath='/cosmos/_design/passthru';

var _mostRecentRev=null;
var getMostRecentRev=function()
{
	debugger;
	return _mostRecentRev;
}

var setMostRecentRev=function(val)
{
	debugger;
	_mostRecentRev=val;
}


function buildQueryString(obj) 
{
	if (obj==null) return '';
	if (typeof obj==='undefined') return '';
	var str = [];
	for(var p in obj)
	{
		if (obj.hasOwnProperty(p)) 
		{
			str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
		}
	}
	return "?"+str.join("&");
}


var baseOptions=function()
{
	var options = {	
		rev: getMostRecentRev(),
		hostname: '127.0.0.1',
		port: 5984,
		path: basePath,  //these are typically filled in by the specific action function...here we opt for least-destructive action for examples...
		method: 'HEAD',
		encoding: 'utf8',
		verbose: 1,
		headers: { 'Content-Type': 'application/json', 'Content-Length': 256 } 
	};
	return options;
}

function setMainDocRev()
{
	console.log("doing setMainDocRev");
	var options=baseOptions();
	options.method='HEAD';
	options.headers={};
	makeRequest(options,'',function (res) { 
			var etag=unenquote(res.headers.etag);
			console.log("etag="+etag); 
			setMostRecentRev(etag); 
		});  //shoudl be json?	
}


function eraseAllAttachments()
{
	var options=baseOptions();
	options.method='DELETE';
	var rev=getMostRecentRev();
	if (rev) 
		options.path += buildQueryString({ rev: rev });
	console.log("path="+options.path);
	makeRequest(options,'',function(res) { console.log("erase was attempted"); });
}


function copyFileToCouch(file,newUrl)
{
	if (isBinary(file)) 
	{
		console.log("skipping binary for now:"+file);
		return;
	}
	//bugbug run somtehing like this
	//  curl --upload-file ../data/iris.json  -H "Content-Type:application/json" -X POST http://127.0.0.1:5984/cosmos/_bulk_docs
	//but platform specific
	
	
	var options = baseOptions();
	options.path=basePath+file;
	options.method='PUT';
	options.headers={
				"Content-Length": fileSize(file),  //bugbug get these vals by examining file
				"Content-Type": "text/html"
			};
	makeRequest(options,fileContents(file));
}
  
  


function makeRequest(options,body,thenner)
{	
	var req = http.request(options,function(res) {
		if (options.verbose)
		{
			console.log('STATUS: ' + res.statusCode);
			console.log('HEADERS: ' + JSON.stringify(res.headers));
		}
		
		res.setEncoding(options.encoding);

		var theOutput = "";
		res.on('data', function (chunk) {
			console.log('BODY: ' + chunk);
			theOutput+=chunk;  //bugbug and then what with this?
		});
		
		if (typeof thenner === 'function')
		{
			res.on('end', function() { thenner(res); } );  //bugbug does thenner need to be passed theOutput??
		}
	});

	req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	});

	//bugbug used to be before 
	req.write(body);
	req.end();
}





var fileCount = 0; 
function doForAllFilesSync(maxfileCount,dir,fnProcess)
{
	if (fileCount>maxfileCount) return;
	var items = fs.readdirSync(dir);
	for(var ii=0, il=items.length; ii<il; ii++)
	{
		var item=path.join(dir,items[ii]);
		if (isDirectory(item))
		{
			if (skippable(items[ii])) 
				continue;
			doForAllFilesSync(maxfileCount,item,fnProcess)
		}
		else
		{
			fnProcess(item);
			fileCount++
		}	
	};

}

function main()
{
	var maxFilesToDo=1;
	var stepper=StepperModule.Stepper.Create([
		 (function() { setMainDocRev(); })  //which is needed by
		,function() { eraseAllAttachments(); }
		// ,function() { doForAllFilesSync(maxFilesToDo,"../",
						// function(file)
						// {
							// //console.log("FILE:"+file);			
							
							// var newUrl=getRelativeUrl(file);
							// copyFileToCouch(file,newUrl);
							
							
							// //console.log("DONE\r\n");
						// });
					// }
		// ,function() { console.log(fileCount); }
	]);					
	stepper.run();
	

	
}




main(); //bugbug get below stuff working first



