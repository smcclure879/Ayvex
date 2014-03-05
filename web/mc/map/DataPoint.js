function DataPoint(arrDims) 
{
	this.pointh = 
		{
			x: arrDims[0],
			y: arrDims[1],
			z: arrDims[2],
			h: 'foo'
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
	moveTo(ctx, tpt(this.pointh));  //bugbug fix the dots by keeping this 2d xy point, then box in 2d around that!
	//bugbug here and elsewhere is .fillStyle really needed?  or strokeStyle sufficient?
	
	if (this.isSelected) 
	{
		ctx.strokeStyle='purple';
		ctx.lineWidth=3;
	}
	else
	{
		ctx.strokeStyle=this.color;
		ctx.lineWidth=1;
	}
	
		
	var tip3=mm.addPoints3d(this.pointh,{x:0.5,y:0,z:0});  //bugbug better dot needed!
	if (tip3==null) return null;
	
	var tip2=tpt(tip3);
	if (tip2==null) 
		return null;

	
	if (lineTo(ctx,tip2)==null) 
		return null;
	ctx.stroke();
	
}