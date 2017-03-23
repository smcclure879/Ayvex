// tree.js  copyright 2014 Ayvex Light Industries

//"importing" the Pre3d math functions...
var mm = Pre3d.Math;

function transformPoint(renderer,pointh) { //transformPoint ThreeTo2AkaTheCamera  (see standardTransform in bigTriangle.js)
	if (pointh==null)
		return null;
		
	var skipOffscreenPoint = (pointh.skipOffscreenPoint===false) ? false:true;
		
	//move into renderer if working todo  and combine with similar code in getNearest?
	var pt3d = renderer.transformPoint(pointh);
		
	var pt2d = renderer.projectPointToCanvas(pt3d,skipOffscreenPoint);
	
	if (pt2d == null)
		return null;

	pt2d.behind=(pt3d.z > 0); 

	return pt2d;
}

//todo should these two functions (above & below) be in the renderer???
//or at least iDrawable??
function computeOffsetFromHi(renderer,pointhi)  //todo in effect this is a second camera!
{	
	if (pointhi==null)
		return null;
		
	//move into renderer if working todo  and combine with similar code in getNearest?
	var offset = renderer.computeOffsetFromHi(pointhi);
	if (offset==null) 
		return null;
		
	return offset;
}


function mutateByHash1(vec3d,h)
{
	var v=vec3d;
	var retval = {
			x:  5+(h&1>0)?44:v.x,
			y: (h&2>0)?-88:v.y/2,
			z: 10+(h&4>0)?0:v.z
		};
	return retval;
}

function mutateByHash2(vec3d,h)  
{
	var v=vec3d;
	var s=mm.vecMag3d(v);
	var retval = {
			x: hRndRange(-s,s,		h%256),
			y: hRndRange(-s,s,		h/256%256),
			z: hRndRange(-s,s,		h/256/256%256)
		};
	return retval;
}




//todo can't believe i had to write this but a || b || c wasn't quite doing it.
function firstAva(a,b,c)
{
	if (a) return a;
	if (b) return b;
	return c;
}

function combinePaths(path1,path2)
{
	var offset = path1.points.length;
	var newColor = firstAva(path1.color, path2.color, "00cccc");  //todo not much we can do here, need more general view of object
	
	var retval =
			{
				starting_point:0, //zeroeth point
				points:path1.points.concat(path2.points),
				curves:path1.curves.concat(path2.curves.map(function(crv){
						return crv.atOffset(offset);  //todo actually needs to go into the curve objects and rebuild them with new indexes
											})),  //move the indexes in this array forward
				labels:path1.labels.concat(path2.labels),
				color:newColor
			};
	return retval;
}




////  These are the 2d drawing helper functions....todo where should they go?

function moveTo(ctx,pt)
{
	if (pt==null) return null;
	ctx.moveTo(pt.x,pt.y);
	return 1;
}

function lineTo(ctx,pt)
{
	if (pt==null) return null;
	ctx.lineTo(pt.x,pt.y);
	return 1;
}

function fillPoint(ctx,pt,size)
{
	if (pt==null) return null;
	if (size<=0) return null;
	ctx.fillRect(pt.x,pt.y,size,size);
	return 1;
}



function drawTriangleAbs(ctx,a2,b2,c2,color,edgeColor)  //a,b,c=2d pts!!!
{
	if (a2==null || b2==null || c2==null) 
		return;
	edgeColor=edgeColor || "rgba(0,0,0,0)";  //black transparent
	var oldStroke=ctx.strokeStyle;  //todo need save fill type also?
	var oldFill=ctx.fillStyle;
	ctx.stroke();  //whatever was before  todo maybe keep a bit for this??
	ctx.strokeStyle=edgeColor; 
	ctx.fillStyle=color;  
	ctx.moveTo(a2.x,a2.y);
	ctx.lineTo(b2.x,b2.y);
	ctx.lineTo(c2.x,c2.y);
	ctx.lineTo(a2.x,a2.y);
	ctx.fill();
	ctx.beginPath();
	ctx.strokeStyle=oldStroke;
	ctx.fillStyle=oldFill;	
}

//todo make separate class  //this is an "abstract class"
function iDrawable() {}  

//NOTE: this should be the ONLY draw function around.....everyone else should use "realDraw".  This gives a change to intercept draw call dynamically.
iDrawable.prototype.draw=function (renderer,log2Size)
{
	if (this.wantsToSelfDraw())
	{
		this.selfDraw(renderer,log2Size);
	}
	else
	{
		this.realDraw(renderer,log2Size);
	}
}

iDrawable.prototype.wantsToSelfDraw=function()
{
	return (typeof this.selfDraw==='function');
}

//near dup of code in renderer...can we consolidate?  todo
iDrawable.prototype.getNearest=function(x,y,renderer,best,thisDrawingIndex)
{
	//todo should this be a call to renderer or this semi-duplicate code?
	
	if (typeof this.pointh==='undefined') 
		return best;
	
	var pt3d = renderer.transformPoint(this.pointh);
	if (pt3d.z > 0) 
		return best;
		
	var pt2d = renderer.projectPointToCanvas(pt3d,true);
	if (pt2d == null)
		return best;
		
	var newQuadrance = mm.quadr(x,y,pt2d);
	if (isNaN(newQuadrance))
		return best;
	if (newQuadrance >= best.bestQuadranceSoFar) 
		return best;

		
	//we found a new winner!
	best.bestQuadranceSoFar = newQuadrance;
	best.closestPointIndex = 0;  //this is the point index within the drawable...by convention the zeroeth point is selected as the center for rotations, zipTo, etc
	best.closestDrawingIndex = thisDrawingIndex;
	best.x=this.pointh.x;
	best.y=this.pointh.y;
	best.z=this.pointh.z;
	best.xd=this.pointh.xh;
	best.actualItem=this;
	debugSet("winner"+thisDrawingIndex);
	return best;
}

//todo make this into a function and just return the interface ... like pre3d.js is packaged




	/*
	this is some of the recursion code (rough) ....todo get this working ??

	for(var ii=0, l=arrBranchInstructions.length; ii<l; ii++)
	{
		var instr=arrBranchInstructions[ii];
		if (instr[0]=='branch')  //todo later just have the instructions be lambdas or similar
		{
			//to be continued   todo  recursive descent here needs to be based on more variables (x,y,z,theta,phi,px,py,pz, ptheta, pphi ??)
			//write this with a geom shader in mind (can they be recursive?)
			//branch(instr,pointh,)
			
		}
		else
		{
			alert("unknown fractalPath verb");
		}
	}

	var currPoint={x:pointh.x,y:pointh.y,z:pointh.z};
	
	//do something with _arrBranchInstructions...
	//['branch',0.47,30,0.25,  //go scale 0.47 forward, branch 30deg, set scale in branch to 0.25
	// 'branch',0.41,-33,12]  etc
	return 'nyi408 you will get here soon';
} */



//bugbug dup of code in bigShape....pull into its own library (or more into buildPointList)?
//don't make it "this" because moving out of here probably
//also refactor out draw code, since this doens't e.g.  know about colors.
iDrawable.prototype.performInstructions=function(renderer)
{
	if (!this.drawInstructions)
		return;
	
	var pointList=buildPointList(this.pointh,this.drawInstructions);
		
	var pts2 = $.map(	
								pointList,
								function(pt3d,seqNum,foo){ 
									return standardTransform(renderer,pt3d,false);   //don't skip offscreen
								},
								this  // --> becomes "foo" above  ("that" didn't work!)
							);
	var ctx=renderer.ctx;	
	var myLoc=pts2[0];
	
	if ( !myLoc )
		return null;
	if (myLoc.isBehind)
		return null;

	ctx.strokeStyle="rgba(0,44,144,0.3)";  //bugbug
	ctx.fillStyle=null;  //"rgba(12,250,155,0.8)";
	ctx.lineWidth=2;  //make dependent on dist ...bugbug
	ctx.beginPath();
	ctx.moveTo(pts2[0].x,pts2[0].y);
	for(var ii=1, il=pts2.length; ii<il; ii++)
	{
		ctx.lineTo(pts2[ii].x,pts2[ii].y);
	}
	ctx.stroke();
	//ctx.fill();

}








//todo make this into a function and just return the interface ... like pre3d.js is packaged


//use a 'promise' to defer tree detail (just save the hash for the tree!)
//tree at first level presents as a markerPole + promise of more small details if requested
//tree at second level present the small details, + promise of even smaller details if requested. 

//todo a whole new kind of object....the guy on the other side (renderer) needs to be taught how to use these
function Tree(x,y,z,h)  //tree has this position forever, and can be regrown from hash
{
	if (typeof h === 'undefined' || h==null || h=='' || !h || h=='calculate')
		h=Hasher.consistentHash(['marker',x,y,z]);  // 'marker' =?= atom at first position  

	this.pointh={x:x,y:y,z:z,h:h};  
	this.skipOffscreenPoint=true;
	//todo can these be made as .prototype functions?
	this.lateDraw=memoize(function(x){ return this.getLevelPath(x); });  //todo is late-draw this still in use???
	this.lateDrawSet=function(x) { var n=this.lateDraw(x); this.become(n);}; 
	this.color='22CC00';  //todo reduce size of this obj by making these class props???
	//todo change getting of paths to calling .Draw method and passing the ctx to it?
	//todo but assuming we keep with it for tonights checkin...can't set "this" directly...what if different callers? .... memoized points, curves, methods instead?
}

Tree.prototype=new iDrawable();
Tree.prototype.constructor=Tree;

Tree.prototype.realDraw=function(renderer,log2Size)
{
	var oldStroke=renderer.ctx.strokeStyle;
	var oldFill = renderer.ctx.fillStyle;
	var log2Size=1;  //todo later figure out real quick about how much detail is needed.  (this is like a geom shader)

	//todo how to get from above to below based on dist between camear and object?  
	//todo why is this in the tree or its base object and not the "camera"?
	var levelsToGo=4;  //todo for now
	//todo   need to only have this value high for things close to renderer
	
	this.drawFractalPath(
						renderer,
						this.pointh.h,  //passing hash separately to allow "the hash updating trick"
						this.pointh,  //passed as ordinary point
						{x:0,y:60,z:0},  //momentum (todo tuck into a pointh?)  //60 m tall
						'tree',  //label  todo needed?
						levelsToGo, //=pathlevel1,2,3 etc  //todo
						//todo a place to potentially multithread....or GPU can do graph alg?  is there a copyPlusForkBit() in GLSL?
						[  								//instructions for next step down...
							//todo needed?['branch',0.3, 30,0.25],  //go scale 0.47 forward, branch 30deg, set scale in branch to 0.25
							//['branch',0.41,-33,0.11],
							//['branch',0.61,4,0.11],
							['nprobbranch',5,0.5,1.0]  
							//['branch',0.09,88,0.33]
							
						]
					 );
	renderer.ctx.stroke();
	renderer.ctx.beginPath();
	renderer.ctx.strokeStyle=oldStroke;
	renderer.ctx.fillStyle=oldFill;
}
	

//todo remove this in favor of the class item itself knowing more of its info
Tree.prototype.become = function(n)   
{
	this.color=n.color; 
	this.points=n.points; 
	this.labels=n.labels; 
	this.curves=n.curves;
}


Tree.prototype.getLevelPath=function (log2Size) //size= log of features you care about (and bigger)
{
	var p = this.pointh; 
	var height=140;
	//if only need details above 1m level, just send the supertall marker pole
	if (log2Size>0) return //pathLevel0  
				twoSegmentPath( 'red',
							  1,
							  p.x, p.y,      p.z,
							  p.x, p.y+height, p.z,  //todo supertall for now
							  p.x, p.y+height, p.z-10);  //minus Z is north
	
	
	if (log2Size>-10) 
		return combinePaths(
				twoSegmentPath( 'green',
							  1,
							  p.x, p.y,      p.z,
							  p.x, p.y+height, p.z,  //todog supertall for now
							  p.x, p.y+height, p.z-20),  //minus Z is north
				twoSegmentPath( 'green',
							1,
							p.x, p.y+height, p.z-20,
							p.x, p.y+height-10, p.z-22,
							p.x+8, p.y+height-20, p.z-15)
			);
				
	alert("bugbug nyi222");
	//todo put this in later
	//else.... return FractalPath( this.pointh,
						// -log2Size, //=pathlevel1,2,3 etc
						// [
							// ['branch',0.47, 30,0.25],  //go scale 0.47 forward, branch 30deg, set scale in branch to 0.25
							// ['branch',0.41,-33,0.11]
						// ]
					// ); //think of this as "deferred rendering" if you want

					
					}


strokeOut=function(ctx)
{
	ctx.stroke();
	return null;
}

//todo separate to its own class 
Tree.prototype.drawFractalPath=function(renderer,h,pointh,momentumVector,tag,levelsToDraw,arrBranchInstructions)
{
	//recursion terminator
	if (levelsToDraw<=0) 
		return;
	
    var ctx = renderer.ctx;
	
	var tpt = function (point)  {	return transformPoint(renderer,point);	} ;
	
	//lateDraw is now superceded by "normal draw" (this fn)     //this.doLateDrawIfApplicable(path);
	//probably want singlepoint version    todo  ....var screenPts = renderer.projectPointsToCanvas(renderer.transformPoints(currentTransform, path.points),true);
	var firstPoint = tpt(pointh);
	if (firstPoint==null) return null;
	
	ctx.beginPath();
    //ctx.moveTo(screenPts.x, screenPts.y);
	//ctx.font="10px Arial";
	//ctx.fillStyle=contrastBackground();
	//ctx.fillText(path.points[path.starting_point].t,start_point.x,start_point.y);  //todo redo startingPoint logic we inherited here

	var width = this.width || levelsToDraw || 1;  
	this.color = this.color || 'rgba(255,170,44,0.7)'
	
	if (this.isSelected) 
	{
		ctx.strokeStyle='purple';
		ctx.fillStyle='purple';
		ctx.lineWidth=width+1;
	}
	else
	{
		ctx.strokeStyle=this.color;  //todo is deciding and setting every time a perf hit?  bunch 'em up by color?
		ctx.fillStyle=this.color;
		ctx.lineWidth=width;
	}
	
	
	if (moveTo(ctx,firstPoint)==null) 
		return strokeOut(ctx);
	
	var tip3=mm.addPoints3d(pointh,momentumVector);
	if (tip3==null) 
		return strokeOut(ctx);
	
	var tip2=tpt(tip3);
	if (tip2==null) 
		return strokeOut(ctx);

	if (mm.vecMag2d(tip2,firstPoint)<ctx.lineWidth && !this.isSelected)
		return strokeOut(ctx); //no point descending either!
	
	if (lineTo(ctx,tip2)==null) 
		return strokeOut(ctx);
	ctx.stroke();
	//no more drawing, now just pass info to child iterations...
	
	
	//  e.g.   ['branch',0.47, 30,0.25],  //go scale 0.47 forward, branch 30deg, set scale in branch to 0.25
	for(var ii=0, li=arrBranchInstructions.length; ii<li; ii++)
	{
		var x=arrBranchInstructions[ii];
		var cmd=x[0];
		
		if (cmd=='branch')
		{
			var howFarOutFrac=x[1];
			var branchAngle=x[2];  //todo use this later
			var branchScale=x[3];
			
			//todo consider take rotational approach instead??--->rotate(ang,aboutVec3d,vec3d) 
			var newMomentumVector=mm.mulPoint3d(momentumVector,branchScale);
			h=Hasher.rehash(h,levelsToDraw*1000+ii);
			newMomentumVector=mutateByHash2(newMomentumVector,h);
			
			this.drawFractalPath(renderer,h,mm.linearInterpolatePoints3d(pointh,tip3,howFarOutFrac),newMomentumVector,tag,levelsToDraw-1,arrBranchInstructions);
		}
		else if (cmd=='nprobbranch')  //todo remove dup code here, consolidate
		{
			var quantityOfPossibleBranches=x[1];  
			var probabilityOfBranch=x[2];
			var scaleDownRatio=x[3];
			for(var jj=0; jj<quantityOfPossibleBranches; jj++)
			{
				h=Hasher.rehash(h,levelsToDraw*100000+ii*100+jj);
				if (!hRndBool(h,probabilityOfBranch)) 
					continue;
				var howFarOutFrac=hFloat(h);
				var newMomentumVector=mm.mulPoint3d(momentumVector,scaleDownRatio*(1-howFarOutFrac));
				
				newMomentumVector=mutateByHash2(newMomentumVector,h); 
				this.drawFractalPath(renderer,h,mm.linearInterpolatePoints3d(pointh,tip3,howFarOutFrac),newMomentumVector,tag,levelsToDraw-1,arrBranchInstructions);
	
			}
			
		}
		else
		{
			alert('unknown cmd bugbug1046:'+x);
		}
	}
	
	// todo recurse here without redoing the intro stuff if possible ...Using levelsToDraw-1 !
	// function()  //todo a place to potentially multithread....or GPU can do graph alg?  is there a copyPlusForkBit() in GLSL?
	// {
		// branch(0.47, 30,0.25);
	// }

	
				// We've connected all our Curves into a <canvas> path, now draw it.
				// if (opts.fill === true) {
				  // ctx.fill();  //todo get this working next?  should this really be a feature of ctx and not the "drawing"?
				// } else {
    //if unstroked then ctx.stroke();  todo needed?
				// }
	
	
};



