
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

//bugbug needed???
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




var allWord = function(x) {
	return /^\w[\w\d]+$/.test(x);
};





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







