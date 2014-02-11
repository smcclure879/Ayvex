//hasher.js


//bugbug make this into a function and just return the interface ... like pre3d.js is packaged

var maxInt=0xFFFFFFF;  //bugbug chopped to 23 bits or so
function hRndBool(h,frac)
{
	//given a hash value h, which might be any set of 32 bits (check this bugbug)
	//...we need to only return true treePoleFrac % of the time 
	//var x = (h/2+maxInt/2)/maxInt; //ranged to 0..1
	var x = h/maxInt; //ranged to 0..1, bugbug if using positive-only hash (24 bits)
	//debugAdd(h+","+x+",");
	return (x<frac);
}

//lo and hi are both included as posible output values
//bugbug same as linearInterp in Pre3d?
function hRndRange(lo,hi,h8)  //h8=8 bits of hash data from 0-255
{
	var s=Math.abs(hi-lo);  //bugbug
	return s*h8/256 + lo;
}

function hFloat(h)
{
	return hRndRange(0,1,h%256);
}

//bugbug move hashing and hashRands to separate class (no members needed)
function Hasher()
{
	this._hashState=424242;
}

//Hasher.prototype._hashState=424242;
Hasher.prototype.process=function(s)  //string
{
	for (var i = 0, l = s.length; i < l; i++) //find more efficient base hash function later.  let nothing be predicated on using THIS hash algo!
	{
		var c  = s.charCodeAt(i);
		this._hashState  = 33*this._hashState+c;  //bugbug unimproved algo
		this._hashState = maxInt & this._hashState; // Convert to 32bit integer  bugbug 24bit for now to insure stays positive!
	}

}
Hasher.prototype.get=function()
{
	return this._hashState;
}

Hasher.consistentHash=function consistentHash(arr)  //for now we only support array of stringables (ints, strings, chars)
{
	var hr=new Hasher();  //h is a hash value, hr is a hasher
	for(var ii=0,l=arr.length;ii<l;ii++)
	{
		if (arr[ii]===undefined)
		{
			alert("foobugbug155am");
		}
		hr.process(arr[ii].toString());  //bugbug .toString??
		hr.process("-x-");  //tab    //not safe, fix this part of the hash also!  bugbug
	}
	var retval=hr.get();
	delete(hr);
	return retval;
}

//bugbug redo things so we pass around hasher objects instead???
Hasher.rehash=function rehash(h,r)
{
	h=h*33+r;
	return maxInt&h;
}



