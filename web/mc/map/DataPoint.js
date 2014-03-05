function DataPoint(arrDims,text) 
{
	this.pointh = 
		{
			x: arrDims[0],
			y: arrDims[1],
			z: arrDims[2],
			h: 'foo',  //bugbug needed for any reason downstream??  if so, maybe do it right?  (or is DataPoint a special case)
			t: text
		}
	this.size=1;
	this.color='red';
}

DataPoint.prototype=new iDrawable();
DataPoint.prototype.constructor=DataPoint;

DataPoint.prototype.draw=function(renderer,log2Size)
{
	var tpt = function (point)  {	return transformPoint(renderer,point);	} ;  //bugbug consolidate with the "tree.js"???
	
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
		ctx.fillStyle="black";
		
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