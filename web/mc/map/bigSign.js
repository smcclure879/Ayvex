//sign.js

//bugbug rely on this one value from other files int he include chain...
//var sealevel=62;   //bugbug consts


//// section DRAW HELPERS  is in bigShape.js but might move from there to drawHelpers.js or similar.


////////  class  /////////

function BigSign(pointh,text)
{
	this.pointh=pointh;
	this.text=text;
}

BigSign.prototype=BigShape;
BigSign.prototype.constructor=BigSign;

BigSign.prototype.realDraw=function (ctx)  
{	
	// ctx.beginPath();
	// var pts2 = this.get2dPoints();
	// var a=pts2[0], b=pts2[1], c=pts2[2];
	
	// if (   a && a.isBehind 
		// && b && b.isBehind 
		// && c && c.isBehind
		// ) 
		// return null;
	
	// drawTriangleAbs(ctx,a,b,c,this.planeColor); 
}



