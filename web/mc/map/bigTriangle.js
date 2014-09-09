//bigTriangle.js

var sealevel=62;   //bugbug
var lowerPlane = sealevel; //-1000;
var lowerPlaneScale = 500000;  //1e+5;  //bugbug should be 7. 
	
	
	
//todo should be in some base class when refactoring
function standardTransform(renderer,pointh,skipOffscreenPoint) {	
	
		if (pointh==null) 
			return null;
	
		//var scaleDim = -1;
		// var phaseMax= 50000; //bugbug settings?
		// phase--;
		// phase %= phaseMax;	//bugbug base off the absolute frameNum or time or something???? unify time-handling
		
		//todoSOON add this back in when refactoring...supports "magic" in the game
		//knock it down to 3 dimensions based on hiDimProjection settings (controller should have told renderer, what is the control structure?)
		// var offsetForHiDim = computeOffsetFromHi(renderer,pointh);  //   projection N ==> 3,   code in/near iDrawable?
		// var plainPoint3 = vecMultAdd(pointh,offsetForHiDim,scaleDim*phase/phaseMax);
		// debugSet("phase="+phase);
		
		// //we will not consolidate this with the "tree.js"....this is where I insert higher-dimensional projection code
		// //but should this go straight into the renderer and less code here?
		
		var pt3d = renderer.transformPoint(pointh); 
		var pt2d = renderer.projectPointToCanvas(pt3d,skipOffscreenPoint);
		
		if (pt2d==null)
			alert("bugbug null@1237");
		
		return pt2d;
	} ;  
	
	
	
	
function BigTriangle()  //bugbug used to be "world"....but will now be a triangle to sort out bad 3d issues.
{
	this.planeColor='rgba(0,60,60,1)';
	this.pointh={ x: -lowerPlaneScale, y:lowerPlane, z: -lowerPlaneScale, skipOffscreenPoint:false};  
	this.pointb={ x: 0 , y:lowerPlane, z: 0, skipOffscreenPoint:false};
	this.pointc={ x: lowerPlaneScale, y:lowerPlane, z: -lowerPlaneScale, skipOffscreenPoint:false};  //bugbugDRY
	this.bugbugplaneColor="rgba(255,255,120,0.2)";
	this.skipOffscreenPoint=false;  //important MUST be here  bugbugNOW did this work?
}


function SmallWorldbugbug()
{
	this.planeColor='rgba(0,60,60,0.87)';
	this.pointh={ x: 1162, y:sealevel, z: 62, skipOffscreenPoint:false};  
	this.pointb={ x: 1162, y:sealevel, z: 1162, skipOffscreenPoint:false};
	this.pointc={ x: 2262, y:sealevel, z: 1162, skipOffscreenPoint:false};  //bugbugDRY
	this.bugbugplaneColor="rgba(255,255,120,0.2)";
	this.skipOffscreenPoint=false;  //important MUST be here  bugbugNOW did this work?
}

BigTriangle.prototype=new iDrawable();  //bugbug should be "tree"??? else why sharing so much code?
BigTriangle.prototype.constructor=BigTriangle;

var phase=0;
BigTriangle.prototype.draw=function(renderer,log2size) //,gameTime)  //bugbug need to pass in gameTime soon where this is called--OR should time be a global???
{
	var tpt = function (pointh) { 
			return standardTransform(renderer,pointh,this.skipOffscreenPoint); 
		}
	;
	
	//bugbug this is copy from DataPoint...should be completely revamped....

	if (typeof this.selfDraw == 'function')
		//return   bugbug
			this.selfDraw({
				renderer:renderer,
				log2size:log2size,
				transformFunction:tpt
			});  //bugbug boundingBox3d, etc etc here?  vs. how much of this already in "this"  (cache "age"?)
		
	
	//else...crappy default code...can we call the superclass instead???
	if (this.pointh==null) 
		return null;  
	
	//bugbug move lower??
	var ctx = renderer.ctx;
	this.drawTri(ctx,tpt,0);
	//this.drawTri(ctx,tpt,1);
	//this.drawTri(ctx,tpt,2);
	
	
	ctx.strokeStyle="red";  //NB: to insure we've closed the stroke! 
}

//bugbugNOW move to helpers!!!
function shallowCopy(oldObject)
{
	var retObj = jQuery.extend({}, oldObject);
	return retObj;
}


BigTriangle.prototype.drawTri=function drawTri(ctx,tpt)  //,extra)   note right now this is "DrawDebugLine"
{
	var SCALE = 100;

	ctx.beginPath();
	
	// var aa=shallowCopy(this.pointh); //bugbug 'cause we are messing with them
	// var bb=shallowCopy(this.pointb); 
	// var cc=shallowCopy(this.pointc); 
	
	// aa.x += extra*SCALE;
	// bb.x += extra*SCALE;

	// cc.x += extra*SCALE;
	//and use aa,bb,cc below instead of this.pointX
	
	var a=tpt(this.pointh),b=tpt(this.pointb),c=tpt(this.pointc);
	
	if ( a && a.isBehind && b && b.isBehind )  //bugbug  && c && c.isBehind) 
		return null;
	
	//drawTriangleAbs(ctx,a,b,c,this.planeColor); //bugbugSOON put this back be this call instead of the lines...
	
	drawLineBugbug(ctx,a,b,c,this.isDebug);
}

function drawLineBugbug(ctx,a,b,c,isDebug)
{
	ctx.strokeStyle="red";  //rgba(255,0,0,1.0)";
	ctx.lineWidth=2;
	drawLineAbsAbs(ctx,a,b);  //bugbug
	ctx.stroke();
		
	if (!isDebug)
		return;
	
	debugPoint(ctx,10,22,a,'a');
	debugPoint(ctx,10,44,b,'b');
	//debugPoint(ctx,20,66,this.pointb,"b3");
	//debugPoint(ctx,10,88,c,'c');
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


