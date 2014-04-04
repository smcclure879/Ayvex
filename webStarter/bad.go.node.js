
//bugbug dont' try to run this.  it didn't work


var fs = require('fs');
var alert=function(x) { console.log(x); };


// file is included here:
//bugbug did below work instead?   
eval(fs.readFileSync('../web/mc/map/stepper.js')+'');

//var stepper = require('../web/mc/map/stepper');
var fs = require('fs');
var path = require('path');
var http=require('http');

//bugbug why this doesn't work right with .prototype. syntax
function endsWith(within,sought) 
{
	if (typeof within == 'undefined') 
		return false;
	var advance=within.length-sought.length;
	if (advance<0) 
		return false;
	return (within.substring(advance)==sought);
}


function startsWith(within,sought)
{
	var advance=sought.length;
	if (advance>within.length) 
		return false;
	return (within.substring(0,advance)==sought)
}



function unenquote(str)
{
	return str.replace(/^\"+/, '').replace(/\"+$/, '');
}

function isBinary(file)
{
	return (endsWith(file,'.bmp')   ||
			endsWith(file,'.gif')) ;
}

function fileSize(file)
{
	var stats = fs.statSync(file);
	var fileSizeInBytes = stats["size"];
	return fileSizeInBytes;
}

function fileType(file)
{
	return "application/octet-stream";  //until proven that I need more ala...
	// var ext=getExtension(file);
	// switch(ext)
	// {
		// case "js": return 
		// default: return "application/octet-stream";
	// }
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
	if (startsWith(u,"..")) return true;
	if (u==".git") return true;
	if (u==".metadata") return true;
	if (u=="oldnotused") return true;
	if (u.indexOf("qq")==0) return true;
	//more here bugbug???
	
	return false;
}

function getRelativeUrl(file)  //bugbug is this value really used???
{
	var retval=file.substring(3).replace(/\\+/g,"/");  //bugbug
	//debugger;
	return retval;
}













var basePath='/cosmos/_design/passthru';

var _mostRecentRev=null;
var getMostRecentRev=function()
{
	//debugger;
	if (_mostRecentRev) 
		return _mostRecentRev;
	return null;
}

var setMostRecentRev=function(val)
{
	_mostRecentRev=val;
}

function buildRevQueryString(rev)
{
	if (rev==null) return '';
	if (typeof rev==='undefined') return '';
	
	return buildQueryString({ rev: rev });
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
	var rev = getMostRecentRev();
	var options = {	
		hostname: '127.0.0.1',
		port: 5984,
		path: basePath,  //these are typically filled in by the specific action function...here we opt for least-destructive action for examples...
		method: 'HEAD',
		encoding: 'utf8',
		verbose: true,
		headers: { 'Content-Type': 'application/json', 'Content-Length': 256 } 
	};
	if (rev) options.rev=rev;   //add if if we got it
	
	return options;
}



function setMostRecentRevFromOutput(theOutput,required)
{
	debugger;  //here
	
	//bugbug you are here
	if (!theOutput) return;
	var outputJson = JSON.parse(theOutput);
	if (!outputJson) return;
	if (typeof outputJson.etag !='undefined' && outputJson.etag.length>10)
		setMostRecentRev(outputJson.etag);
	else if (typeof outputJson._rev != 'undefined' && outputJson._rev.length>10)
		setMostRecentRev(outputJson._rev);
	else if (typeof outputJson.rev != 'undefined' && outputJson.rev.length>10)
		setMostRecentRev(outputJson.rev);
	else
		console.log("no rev found in output:"+theOutput);
	
	
}


function setMainDocRev(thenner)
{
	console.log("doing setMainDocRev");
	var options=baseOptions();
	options.method='HEAD';
	options.headers={};
	options.ignore404=true;  //file not there yet is OK too
	makeRequest(options,'',function (res,theOutput) {   //theOutput not yet used (bugbug)
			var etag=unenquote(res.headers.etag);
			console.log("etag="+etag); 
			setMostRecentRev(etag);
			thenner();
			debugger;			
		},"setMainDocRev");  //shoudl be json?	
}


function eraseAllAttachments()
{
	var options=baseOptions();
	options.method='DELETE';
	var rev=getMostRecentRev();
	options.path += buildRevQueryString(rev);  //shoudln't erase without this
	console.log("path="+options.path);
	makeRequest(options,'',function(res,theOutput) { console.log("erase was attempted"); },'eraseAllAttachments');
}


function copyFileToCouch(file,newUrl,thenner)
{
	if (isBinary(file)) 
	{
		console.log("skipping binary for now:"+file);
		return;
	}
	console.log("attempting copy of "+file);
	//bugbug run somtehing like this
	//  curl --upload-file ../data/iris.json  -H "Content-Type:application/json" -X POST http://127.0.0.1:5984/cosmos/_bulk_docs
	//but platform specific
		
	var options = baseOptions();
	options.path=basePath+'/'+newUrl+buildRevQueryString();
	options.method='PUT';
	options.headers={
				"Content-Length": fileSize(file),  //bugbug get these vals by examining file
				"Content-Type": fileType(file)
			};
			
	makeRequest(options,fileContents(file),thenner,"copyFileToCouch:"+newUrl);
}
  
  


function makeRequest(options,body,thenner,text)
{	
	var req = http.request(options,function(res) {
		if (options.verbose)
		{
			console.log('STATUS: ' + res.statusCode);
			console.log('HEADERS: ' + JSON.stringify(res.headers));
		}
		
		debugger;
		if (options.ignore404 && (""+res.statusCode)=='404') 
			return;
		
		res.setEncoding(options.encoding);  //bugbug needed??

		//res.on('error', function() {  } );  bugbug needed
		
		
		var theOutput = "";
		res.on('data', function(chunk) {
			console.log('BODY: ' + chunk);
			theOutput=chunk;  //bugbug and then what with this?
		});
		
		if (typeof thenner === 'function')
		{
			res.on('end', function() {
					if (		startsWith(""+res.statusCode,"2")
							&& typeof theOutput != 'undefined'
						)  //only valid responses get the "thenner"...no "fail" case yet "failer"
					{
						setMostRecentRevFromOutput(theOutput);  //if possible
						thenner(res,theOutput); 
					}
					else
					{
						//bugbug put retry logic here
						console.log("no retry logic yet bugbug");
						console.log("res.statusCode="+res.statusCode);
						console.log("theOutput="+theOutput);
						console.log("text="+text);
						debugger;
					}
				} 
			);  //bugbug does thenner need to be passed theOutput??
		}
	});

	req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	});

	//bugbug used to be before 
	req.write(body);
	req.end();
	
}






function listAllRelevantFiles(maxFileCount,dir)
{
	if (typeof fileList=='undefined')
		fileList=[];
	
	function _fileLister(dir)
	{
		if (fileList.length>maxFileCount) 
			return;
		var items = fs.readdirSync(dir);
		for(var ii=0, il=items.length; ii<il; ii++)
		{
			var item=path.join(dir,items[ii]);
			if (skippable(items[ii])) 
				continue;
			else if (isDirectory(item))
				_fileLister(item)
			else  //file we can't ignore
				fileList.push(item);
		};	
	}
	
	_fileLister(maxFileCount,dir);
	return fileList;
}

function pushSyncStep(steps,fnToRun)
{
	var flagVal = Math.random();
	var thenner = function(){  
						signal=flagVal;
					}.bind(this);
	var whenner = function(){
					return (signal==flagVal); 
				}.bind(this);					
	
	steps.push(function(){ fnToRun(thenner); });
	steps.push(['waiton', whenner]);
}

var signal='';
function main()
{
	var maxFilesToDo=1;  //bugbug config or arg?
	
	var steps=[];
	
	if (0)
	{
		//FILE EXISTS
		pushSyncStep(steps, function(thenner) { setMainDocRev(thenner); } );	//which is needed by
		pushSyncStep(steps, function(thenner) { eraseAllAttachments(thenner); } );
	}
	else
	{
		//FILE NOT EXISTS
		//do nothing???? bugbug
	}
	
	//note again assuming that # of files is not too high and sizes are small, can just do them one at a time
	var filesToDo=listAllRelevantFiles("../web/",maxFilesToDo); //bugbug see doForAllFilesSync
	filesToDo.forEach(function(file){
		if (file.length<5)
			throw "wtfbugbug="+file;
		//thenner and whenner bridge the gap across threads.  filename used as signal
		
		var thenner = function(){  //ff = file by another name, essentially
						signal=file;
					}.bind(this);
		var whenner = function(){
						return (signal==file); 
					}.bind(this);					
		
		steps.push(	function()
					{
						//console.log("FILE:"+file);			
						var newUrl=getRelativeUrl(file);
						debugger;
						copyFileToCouch(file,newUrl,thenner);  //copy will run the thenner 
						//console.log("DONE\r\n");
					}.bind(this));
						
		 steps.push(['waiton', whenner]);  //and next step will wait until the whenner  (like a semaphor)
	});
		
	//console.log(steps);
	var stepper=StepperModule.Stepper.Create(steps);
	stepper.waitsLimit=50;
	stepper.run();
}




main(); //bugbug get below stuff working first



