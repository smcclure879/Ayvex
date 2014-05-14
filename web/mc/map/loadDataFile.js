
String.prototype.splitLines=function ()
{
	return this.split( /\r?\n/ );
}

String.prototype.splitTabs=function ()
{
	return this.split("\t");
}

String.prototype.splitCommas=function ()
{
	return this.split(",");
}

function convertAndScale(columnInfo,chunk)
{
	return columnInfo.scale * (convertToNumber(columnInfo,chunk) -  columnInfo.offset);
}

function convertToNumber(columnInfo,chunk)
{
	switch(columnInfo.readas)
	{
		case "utc":  	return Date.parse(chunk); 	
		case "int":  	return parseInt(chunk); 	
		case "float": 	return parseFloat(chunk); 	
		default: 		return 0;
	}
}


function zip2(arrayA,arrayB)
{
	return zip([arrayA,arrayB]);
}

//http://stackoverflow.com/questions/4856717/javascript-equivalent-of-pythons-zip-function
//bugbug might need a different one from that page that truncates to length of shortest input array
function zip(arrays) 
{
    return arrays[0].map(function(_,i){
        return arrays.map(function(array){return array[i]})
    });
}

String.prototype.startsWith = function (prefix)
{
	return this.indexOf(prefix) == 0;
};
//bugbug move all these to a helper class
String.prototype.contains = function (sought)
{
	return this.indexOf(sought) >= 0;
}

String.prototype.replaceStart = function (prefix,newText)
{
	if (!url.toLowerCase().startsWith(prefix.toLowerCase()))
		return newText+url.substring(prefix.length);
	else
		return url;
}







function addTextData(drawables,text,columns,options,transformFunction)
{
	//bugbug later this should check if text is a readable stream and go do streaming instead.  
	options = options || {};
	var lines = text.splitLines();
	if (options["skipFirstLine"]) 
		lines.shift();  //remove first line
	for(var ii=0, il=lines.length; ii<il; ii++)
	{
		var line = lines[ii];
		if (options["skipCommentLines"] && line.startsWith("#")) 
			continue;		
		
		var item=null;
		//bugbug this should be a delegate passed in.  takes rows and turns them to items.
		//  but if the function is null
		if (typeof transformFunction=='function')
		{
			item = transformFunction(chunks);			
		}
		else
		{	
			var chunks=line.splitCommas();		
			var labelledChunks = zip2(columns,chunks);
						
			item = DataPoint.FromArr(  //higher dimensional data point
							labelledChunks
								.map( function(colAndChunk){ return convertAndScale(colAndChunk[0],colAndChunk[1]); }     ) 
							//,{width: color etc here based on labelledChunks
					);
		}
		drawables.push(item);
	}
}

function loadFileRemoteSync(url,options)
{
  // strUrl is whatever URL you need to call
  var retval = "";

  jQuery.ajax({
    url: url,
    success: function(html) 
		{
			retval = html;
		},
    async:false
  });

  return retval;
}

// function loadFileRemoteAsync(url,options,thenDoFn)
// {
	// $.get(url, function(data) {
			
			// alert(data);
			
			// //$('#text-file-container').html(data);
			// },"json"
		// );
				
// }

