//sign.js

//bugbug rely on this one value from other files int he include chain...
//var sealevel=62;   //bugbug consts


//// section DRAW HELPERS  is in bigShape.js but might move from there to drawHelpers.js or similar.


////////  class  /////////

function BigSign(pointh,text)
{
	this.pointh=pointh;
	this.text=text;
	this.skipOffscreenPoint = false;  //thus not actually "big"...oh well
	this.color = 'red';  //bugbug
	this.pointList = buildPointList(this.pointh, "bilateral left10 up100 left160 up100 right160 right10");
	//this.drawOrder="12345678";  //todo in future?
	this.tpt = standardTransform;  //NB:  "tpt" means "transformTo2d" bad name but it stuck
	//this.isSign=1;  //use for debugging
}

BigSign.prototype=new BigShape();
BigSign.prototype.constructor=BigSign;

BigSign.prototype.realDraw = function(renderer,log2size)
{	
	var ctx=renderer.ctx;
	ctx.beginPath();
	var pts2 = this.get2dPoints(renderer);
	var pointh=pts2[0];
	
	if ( pointh && pointh.isBehind)
		return null;
	

	//sign background...
	ctx.strokeStyle="purple";  //bugbug
	ctx.fillStyle="rgba(12,120,255,0.5)";
	ctx.lineWidth=10;
	ctx.beginPath();
	ctx.moveTo(pts2[0].x,pts2[0].y);
	for(var ii=1, il=pts2.length; ii<il; ii++)
	{
		ctx.lineTo(pts2[ii].x,pts2[ii].y);
	}
	ctx.stroke();
	ctx.fill();
	
	ctx.beginPath();
	//var center=
	var textStart = {
					x:pts2[4].x+20,
					y:pts2[4].y+20
				};
	ctx.font="16px Verdana";
	ctx.fillStyle="red"; //bugbug
	
	//var theta = 45;  //bugbug
	var magX=1;
	var skewX=0;
	var skewY=0;
	var magY=1;
	var moveX=0;
	var moveY=0;
		
	ctx.transform(magX,skewX,skewY,magY,moveX,moveY);
	ctx.fillText(this.text,textStart.x,textStart.y);
	ctx.setTransform(1,0,0,1,0,0); //ctx.untransform();  bugbug
	ctx.fill();
	ctx.stroke();
	ctx.fillStyle="purple";
}



