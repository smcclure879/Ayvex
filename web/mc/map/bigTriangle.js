//bigTriangle.js

var sealevel=62;   //bugbug consts
var lowerPlane = sealevel; //-1000;
var lowerPlaneScale = 500000;  //1e+5;  //bugbug should be 7? 



//////// section DRAW HELPERS  //////

//todo move to main helpers!!!
// function shallowCopy(oldObject)
// {
	// var retObj = jQuery.extend({}, oldObject);
	// return retObj;
// }


function drawLine(ctx,a,b,isDebug)
{
	ctx.lineWidth=2;
	drawLineAbsAbs(ctx,a,b);  
	ctx.stroke();
	ctx.strokeStyle="red"; //bugbug

	if (!isDebug)
		return;

	debugPoint(ctx,10,22,a,'a');
	debugPoint(ctx,10,44,b,'b');
}


function debugPoint(ctx,labelX,labelY,p,label)
{
	if (!p || !p.debug) 
		return;
	
	//var str="point: "+label+"   x="+round(p.x)+" y="+round(p.y); //+" z="+round(p.z)+":::"+p.debug;
	var str=""+p.debug;  //bugbug
	
	ctx.font="16px Verdana";
	ctx.fillStyle="red";
	ctx.fillText(str,labelX,labelY);
	ctx.fill();
}


function round(x)
{
	return Number(x).toFixed(0);
}




////// CLASS BigShape ///////	
	
function BigShape()
{
	this.skipOffscreenPoint = false;  //essentially the hallmark of "big" shapes...parts of the shape might be behind, and we should draw past screen edge for coverage

	this.color = 'rgba(0,60,60,1)';
	this.pointh = { x: -lowerPlaneScale, y:lowerPlane, z: -lowerPlaneScale, skipOffscreenPoint:false};  
	this.pointList = [];
	this.tpt = standardTransform;  //tpt=transformTo2d  bad name but it stuck
	
	//bugbug this.pointc={ x: lowerPlaneScale, y:lowerPlane, z: -lowerPlaneScale, skipOffscreenPoint:false};  //bugbugDRY
	//this.bugbugplaneColor="rgba(255,255,120,0.2)";
}


BigShape.prototype=new iDrawable();  //bugbug should be "tree"??? else why sharing so much code?
BigShape.prototype.constructor=BigShape;
BigShape.prototype.get2dPoints=function(renderer){
	return $.map(	this.pointList,
					function(pt3d){ 
						return this.tpt(renderer,pt3d,pt3d.skipOffscreenPoint); 
					}
				);
}


////////  class  /////////

function BigLine()
{


}

BigLine.prototype=new BigShape();
BigLine.prototype.constructor=BigLine;

function MakeBigLine(pointhA,pointB)  //={x: 0 , y:lowerPlane, z: 0, skipOffscreenPoint:false}	
{
	var retval = new BigLine();
	retval.pointh=pointhA;  //remember the h means maybe some hash info, etc in there as well (for the whole object)
	retval.pointList=[ 
						pointhA,
						pointB
					];
	return retval;
}

BigLine.prototype.draw=function(renderer,log2size) //,gameTime)  //bugbug need to pass in gameTime soon where this is called--OR should time be a global???
{
	if (typeof this.selfDraw == 'function')  //bugbug needed???
	{
		return	this.selfDraw({    
						renderer:renderer,
						log2size:log2size,
						transformFunction:this.tpt
						//bugbug boundingBox3d, etc etc here?  vs. how much of this already in "this"  (cache "age"?)
					});     
	}	
	
	if (this.pointh==null) 
		return null;  
	
	var ctx=renderer.ctx;
	ctx.strokeStyle=this.color;
	ctx.beginPath();
	var tpt = this.tpt;
	var a=tpt(renderer,this.pointList[0],false);  //todo shorten these calls somehow?
	var b=tpt(renderer,this.pointList[1],false);
	
	drawLine(ctx,a,b,this.isDebug);
	
}


	
/////////////  class BigTriangle  /////////

	
function BigTriangle()  
{
	this.color='rgba(0,60,60,1)';
	this.pointh={ x: -lowerPlaneScale, y:lowerPlane, z: -lowerPlaneScale, skipOffscreenPoint:false};  
	var pointb={ x: 0 , y:lowerPlane, z: 0, skipOffscreenPoint:false};
	var pointc={ x: lowerPlaneScale, y:lowerPlane, z: -lowerPlaneScale, skipOffscreenPoint:false};  //bugbugDRY
	this.pointList=[
						this.pointh,
						pointb,
						pointc
					];
	this.skipOffscreenPoint=false;  //important MUST be here  
}

BigTriangle.prototype=new BigShape();  //bugbug should be "tree"??? else why sharing so much code?
BigTriangle.prototype.constructor=BigTriangle;

BigTriangle.prototype.draw=function(renderer,log2size) //,gameTime)  //bugbug need to pass in gameTime soon where this is called--OR should time be a global???
{
	//bugbug pull this into the BigShape class somehow since it's behavior-in-common
	if (typeof this.selfDraw == 'function')
		//return   bugbug
			this.selfDraw({
				renderer:renderer,
				log2size:log2size,
				transformFunction:tpt
			});  //bugbug boundingBox3d, etc etc here?  vs. how much of this already in "this"  (cache "age"?)
			
	if (this.pointh==null) 
		return null;  
	
	var ctx = renderer.ctx;
	this.drawTri(ctx);  //the "real" draw function!
	ctx.strokeStyle="red";  //NB: to insure we've closed the stroke! 
}

BigTriangle.prototype.drawTri=function drawTri(ctx)  
{	
	ctx.beginPath();
	var pts2 = this.get2dPoints();
	var a=pts2[0], b=pts2[1], c=pts2[2];
	
	if (   a && a.isBehind 
		&& b && b.isBehind 
		&& c && c.isBehind
		) 
		return null;
	
	drawTriangleAbs(ctx,a,b,c,this.planeColor); 
}



