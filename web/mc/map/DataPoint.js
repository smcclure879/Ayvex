//DataPoints are iDrawables that always take 1 (or 4 depending on "big" checkbox) pixels on the screen. 
//They also support more than 3 dimensions 

function DataPoint()
{
	this.pointh={};
	this.size=1;
	this.color='pink';
}

DataPoint.FromArr = function(arr,text)
{
	var retval=new DataPoint();
	retval.initFromArrDims(arr,text);
	return retval;
}


DataPoint.FromJson=function(jsonData)   //bugbug should be 
{
	var retval=new DataPoint();
	retval.initFromJson(jsonData);
	return retval;
}



DataPoint.prototype=new iDrawable();
DataPoint.prototype.constructor=DataPoint;

//bugbug is there a faster way that involves e.g. changing the type?  didn't work when tried
DataPoint.prototype.initFromJson=function(jsonData)
{		
	this.pointh=
		{
			x: jsonData.x,  
			y: jsonData.y,
			z: jsonData.z,
			xd: jsonData.xd, 
			h: null,  //not yet figured
			t: '' //jsonData._id || '*'  //bugbug default setting or ???
		};
	this.size=1;
	this.color='#0489B1';
}
 
DataPoint.prototype.initFromArrDims=function (arrDims,text) 
{
	this.pointh = 
		{
			x: arrDims[0],
			y: arrDims[1],
			z: arrDims[2],
			xd: arrDims,  //just pack them all in here, later we can get rid of x,y,z (bugbug)  bugbug should these really be in pointh or elsewhere in dataPoint?
			h: null,   //bugbug needed for any reason downstream??  if so, maybe do it right?  (or is DataPoint a special case)  or can we just compute later if needed
			t: text
		};
	this.size=1;
	this.color='red';
}


//DataPoint.FromJson_old = function(jsonData) 
//{
//	bugbug just change its class...does this work???NO apparently
//	jsonData.__proto__= DataPoint.prototype;
//	jsonData.constructor.call(jsonData);
//	jsonData.t='bugbug1004';
//	return jsonData;
//}

var phase=0;
DataPoint.prototype.draw=function(renderer,log2Size) //,gameTime)  //bugbug need to pass in gameTime soon where this is called--OR should time be a global???
{
	var tpt = function (pointh) {	
	
		var scaleDim = -1;
		var phaseMax= 50000; //bugbug settings?
		phase--;
		phase %= phaseMax;	//bugbug base off the absolute frameNum or time or something???? unify time-handling
		
		//bugbug
		//knock it down to 3 dimensions based on hiDimProjection settings (controller should have told renderer, what is the control structure?)
		var offsetForHiDim = computeOffsetFromHi(renderer,pointh);  //   projection N ==> 3,   code in/near iDrawable?
		var plainPoint3 = vecMultAdd(pointh,offsetForHiDim,scaleDim*phase/phaseMax);
		debugSet("phase="+phase);
		//we will not consolidate this with the "tree.js"....this is where I insert higher-dimensional projection code
		//but should this go straight into the renderer and less code here?
		var point2d = transformPoint(renderer,plainPoint3);  //   projection 3 ==> 2

		return point2d;
	} ;  
	
	
	if (this.pointh==null) return;
	
	var ctx = renderer.ctx;
	ctx.beginPath();
	var pointIn2d=tpt(this.pointh);
	if (pointIn2d==null)
		return null;  //offscreen!
	
	if (typeof this.pointh.t!='undefined')
	{
		moveTo(ctx, pointIn2d);
		
		ctx.font="10px Arial";
		ctx.fillStyle=contrastBackground();
		
		ctx.fillText(this.pointh.t,pointIn2d.x,pointIn2d.y);  //bugbug redo startingPoint logic we inherited here
		ctx.stroke();
	}
	
	var size=big;
	if (this.isSelected) 
	{
		ctx.fillStyle='purple';
		size++;
	}
	else
	{
		ctx.fillStyle=this.color;
	}
	
		
	// var tip3=mm.addPoints3d(this.pointh,{x:0.5,y:0,z:0});  //bugbug better dot needed!
	// if (tip3==null) return null;
	
	// var tip2=tpt(tip3);
	// if (tip2==null) 
		// return null;

	// if (lineTo(ctx,tip2)==null) 
	if (fillPoint(ctx,pointIn2d,size)==null)
		return null;
	
	ctx.stroke();
	
}