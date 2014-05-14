// tree.js  copyright 2014 Ayvex Light Industries

//"importing" the Pre3d math functions...
var mm = Pre3d.Math;

function transformPoint(renderer,pointh)  //transformPoint ThreeTo2AkaTheCamera  
{
	if (pointh==null)
		return null;
		
	//move into renderer if working bugbug  and combine with similar code in getNearest?
	var pt3d = renderer.transformPoint(pointh);
	if (pt3d.z > 0) 
		return null;
		
	var pt2d = renderer.projectPointToCanvas(pt3d,true);
	if (pt2d == null)
		return null;

	return pt2d;
}

//bugbug should these two functions (above & below) be in the renderer???
//or at least iDrawable??
function computeOffsetFromHi(renderer,pointhi)  //bugbug in effect this is a second camera!
{	
	if (pointhi==null)
		return null;
		
	//move into renderer if working bugbug  and combine with similar code in getNearest?
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




//bugbug can't believe i had to write this but a || b || c wasn't quite doing it.
function firstAva(a,b,c)
{
	if (a) return a;
	if (b) return b;
	return c;
}

function combinePaths(path1,path2)
{
	var offset = path1.points.length;
	var newColor = firstAva(path1.color, path2.color, "00cccc");  //bugbug not much we can do here, need more general view of object
	
	var retval =
			{
				starting_point:0, //zeroeth point
				points:path1.points.concat(path2.points),
				curves:path1.curves.concat(path2.curves.map(function(crv){
						return crv.atOffset(offset);  //bugbug actually needs to go into the curve objects and rebuild them with new indexes
											})),  //move the indexes in this array forward
				labels:path1.labels.concat(path2.labels),
				color:newColor
			};
	return retval;
}




////  These are the 2d drawing helper functions....bugbug where should they go?

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

//bugbug make separate class  //this is an "abstract class"
function iDrawable() {}  

iDrawable.prototype.draw=function (renderer,log2Size)
{
	alert("errCode100p7: cannot directly draw a raw iDrawable...treat it like abstract!");
}

//near dup of code in renderer...can we consolidate?  bugbug
iDrawable.prototype.getNearest=function(x,y,renderer,best,thisDrawingIndex)
{
	//bugbug should this be a call to renderer or this semi-duplicate code?
	
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
	best.closestPointIndex = 0;  //this is the point index within the drawable...by convention the zeroeth point is selected as the center for rotations, flyTo, etc
	best.closestDrawingIndex = thisDrawingIndex;
	best.x=this.pointh.x;
	best.y=this.pointh.y;
	best.z=this.pointh.z;
	best.xd=this.pointh.xh;
	debugSet("winner"+thisDrawingIndex);
	return best;
}

//bugbug make this into a function and just return the interface ... like pre3d.js is packaged




	/*
	this is some of the recursion code (rough) ....bugbug get this working next??

	for(var ii=0, l=arrBranchInstructions.length; ii<l; ii++)
	{
		var instr=arrBranchInstructions[ii];
		if (instr[0]=='branch')  //bugbug later just have the instructions be lambdas or similar
		{
			//to be continued   bugbug   recursive descent here needs to be based on more variables (x,y,z,theta,phi,px,py,pz, ptheta, pphi ??)
			//write this with a geom shader in mind (can they be recursive?)
			//branch(instr,pointh,)
			
		}
		else
		{
			alert("bugbug unknown fractalPath verb");
		}
	}

	var currPoint={x:pointh.x,y:pointh.y,z:pointh.z};
	
	//do something with _arrBranchInstructions...
	//['branch',0.47,30,0.25,  //go scale 0.47 forward, branch 30deg, set scale in branch to 0.25
	// 'branch',0.41,-33,12]  etc
	return 'bugbugnyi you will get here soon';
} */





//bugbug make this into a function and just return the interface ... like pre3d.js is packaged


//use a 'promise' to defer tree detail (just save the hash for the tree!)
//tree at first level presents as a markerPole + promise of more small details if requested
//tree at second level present the small details, + promise of even smaller details if requested. 

//bugbug a whole new kind of object....the guy on the other side (renderer) needs to be taught how to use these
function Tree(x,y,z,h)  //tree has this position forever, and can be regrown from hash
{
	if (typeof h === 'undefined' || h==null || h=='' || !h || h=='calculate')
		h=Hasher.consistentHash(['marker',x,y,z]);  // 'marker' =?= atom at first position  

	this.pointh={x:x,y:y,z:z,h:h};  
	//bugbug can these be made as .prototype functions?
	this.lateDraw=memoize(function(x){ return this.getLevelPath(x); });  //bugbug is late-draw this still in use???
	this.lateDrawSet=function(x) { var n=this.lateDraw(x); this.become(n);}; 
	this.color='22CC00';  //bugbug reduce size of this obj by making these class props???
	//bugbug change getting of paths to calling .Draw method and passing the ctx to it?
	//bugbug but assuming we keep with it for tonights checkin...can't set "this" directly...what if different callers? .... memoized points, curves, methods instead?
}

Tree.prototype=new iDrawable();
Tree.prototype.constructor=Tree;

Tree.prototype.draw=function(renderer,log2Size)
{
	var log2Size=1;  //bugbug later figure out real quick about how much detail is needed.  (this is like a geom shader)

	//bugbug how to get from above to below based on dist between camear and object?  
	//bugbug why is this in the tree or its base object and not the "camera"?
	var levelsToGo=4;  //bugbug for now
	//bugbug   need to only have this value high for things close to renderer
	
	this.drawFractalPath(
						renderer,
						this.pointh.h,  //passing hash separately to allow "the hash updating trick"
						this.pointh,  //passed as ordinary point
						{x:0,y:60,z:0},  //momentum (bugbug tuck into a pointh?)  //60 m tall
						'tree',  //label  bugbug needed?
						levelsToGo, //=pathlevel1,2,3 etc  //bugbug 
						//bugbug a place to potentially multithread....or GPU can do graph alg?  is there a copyPlusForkBit() in GLSL?
						[  								//instructions for next step down...
							//bugbug needed?['branch',0.3, 30,0.25],  //go scale 0.47 forward, branch 30deg, set scale in branch to 0.25
							//['branch',0.41,-33,0.11],
							//['branch',0.61,4,0.11],
							['nprobbranch',5,0.5,1.0]  //bugbug why no work?
							//['branch',0.09,88,0.33]
							
						]
					 );
}
	

//bugbug remove this in favor of the class item itself knowing more of its info
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
							  p.x, p.y+height, p.z,  //bugbug supertall for now
							  p.x, p.y+height, p.z-10);  //minus Z is north
	
	
	if (log2Size>-10) 
		return combinePaths(
				twoSegmentPath( 'green',
							  1,
							  p.x, p.y,      p.z,
							  p.x, p.y+height, p.z,  //bugbug supertall for now
							  p.x, p.y+height, p.z-20),  //minus Z is north
				twoSegmentPath( 'green',
							1,
							p.x, p.y+height, p.z-20,
							p.x, p.y+height-10, p.z-22,
							p.x+8, p.y+height-20, p.z-15)
			);
				
	alert("bugbug nyi222");
	//bugbug put this in later
	//else.... return FractalPath( this.pointh,
						// -log2Size, //=pathlevel1,2,3 etc
						// [
							// ['branch',0.47, 30,0.25],  //go scale 0.47 forward, branch 30deg, set scale in branch to 0.25
							// ['branch',0.41,-33,0.11]
						// ]
					// ); //think of this as "deferred rendering" if you want

					
					}




//bugbug separate to its own class 
Tree.prototype.drawFractalPath=function(renderer,h,pointh,momentumVector,tag,levelsToDraw,arrBranchInstructions)
{
	//recursion terminator
	if (levelsToDraw<=0) 
		return;
	
    var ctx = renderer.ctx;
	
	var tpt = function (point)  {	return transformPoint(renderer,point);	} ;
	
	//lateDraw is now superceded by "normal draw" (this fn)     //this.doLateDrawIfApplicable(path);
	//probably want singlepoint version    bugbug  ....var screenPts = renderer.projectPointsToCanvas(renderer.transformPoints(currentTransform, path.points),true);
	var firstPoint = tpt(pointh);
	if (firstPoint==null) return null;
	
	ctx.beginPath();
    //ctx.moveTo(screenPts.x, screenPts.y);
	//ctx.font="10px Arial";
	//ctx.fillStyle=contrastBackground();
	//ctx.fillText(path.points[path.starting_point].t,start_point.x,start_point.y);  //bugbug redo startingPoint logic we inherited here

	var width=this.width || levelsToDraw || 1;  
	
	if (this.isSelected) 
	{
		ctx.strokeStyle='purple';
		ctx.lineWidth=width+1;
	}
	else
	{
		ctx.strokeStyle=this.color || 'red';  //bugbug is deciding and setting every time a perf hit?  bunch 'em up by color?
		ctx.lineWidth=width;
	}
	
	if (moveTo(ctx,firstPoint)==null) return null;
	
	var tip3=mm.addPoints3d(pointh,momentumVector);
	if (tip3==null) return null;
	
	var tip2=tpt(tip3);
	if (tip2==null) 
		return null;

	if (mm.vecMag2d(tip2,firstPoint)<ctx.lineWidth && !this.isSelected)
		return null; //no point descending either!
	
	if (lineTo(ctx,tip2)==null) 
		return null;
	ctx.stroke();
	
	
	//  e.g.   ['branch',0.47, 30,0.25],  //go scale 0.47 forward, branch 30deg, set scale in branch to 0.25
	for(var ii=0, li=arrBranchInstructions.length; ii<li; ii++)
	{
		var x=arrBranchInstructions[ii];
		var cmd=x[0];
		
		if (cmd=='branch')
		{
			var howFarOutFrac=x[1];
			var branchAngle=x[2];  //bugbug use this later
			var branchScale=x[3];
			
			//bugbug take rotational approach instead??--->rotate(ang,aboutVec3d,vec3d) 
			var newMomentumVector=mm.mulPoint3d(momentumVector,branchScale);
			h=Hasher.rehash(h,levelsToDraw*1000+ii);
			newMomentumVector=mutateByHash2(newMomentumVector,h);
			
			this.drawFractalPath(renderer,h,mm.linearInterpolatePoints3d(pointh,tip3,howFarOutFrac),newMomentumVector,tag,levelsToDraw-1,arrBranchInstructions);
		}
		else if (cmd=='nprobbranch')  //bugbug remove dup code here, consolidate
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
	
	// bugbug recurse here without redoing the intro stuff if possible ...Using levelsToDraw-1 !
	// function()  //bugbug a place to potentially multithread....or GPU can do graph alg?  is there a copyPlusForkBit() in GLSL?
	// {
		// branch(0.47, 30,0.25);
	// }

	
				// We've connected all our Curves into a <canvas> path, now draw it.
				// if (opts.fill === true) {
				  // ctx.fill();  //bugbug get this working next?  should this really be a feature of ctx and not the "drawing"?
				// } else {
    //if unstroked then ctx.stroke();  bugbug needed?
				// }
	
	
};



