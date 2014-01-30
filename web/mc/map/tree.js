// tree.js  copyright 2014 Ayvex Light Industries


function combinePaths(path1,path2)
{
	var offset = path1.points.length;
	var newColor= path1 || path2 || "purple";  //bugbug not much we can do here, need more general view of object
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









//bugbug make this into a function and just return the interface ... like pre3d.js is packaged



//bugbug separate to its own class Fractal.js
//this fractal class shouldn't need the memoization.  do it at object level only ?
function FractalPath(pointh,levelsToDraw,arrInstructions)
{
	if (levelsToDraw<=0) return pointh;

	for(var ii=0, l=arrInstructions.length; ii<l; ii++)
	{
		var instr=arrInstructions[ii];
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
	
	//do something with _arrInstructions...
	//['branch',0.47,30,0.25,  //go scale 0.47 forward, branch 30deg, set scale in branch to 0.25
	// 'branch',0.41,-33,12]  etc
	return 'bugbugnyi you will get here soon';
}





//bugbug make this into a function and just return the interface ... like pre3d.js is packaged


//use a 'promise' to defer tree detail (just save the hash for the tree!)
//tree at first level presents as a markerPole + promise of more small details if requested
//tree at second level present the small details, + promise of even smaller details if requested. 

//bugbug a whole new kind of object....the guy on the other side (renderer) needs to be taught how to use these
function Tree(x,y,z,h)  //tree has this position forever, and can be regrown from hash
{
	this.pointh={x:x,y:y,z:z,h:h};  
	//bugbug can these be made as .prototype functions?
	this.lateDraw=memoize(function(x){ return this.getLevelPath(x); });  
	this.lateDrawSet=function(x) { var n=this.lateDraw(x); this.become(n);}; 
	//bugbug change getting of paths to calling .Draw method and passing the ctx to it?
	//bugbug but assuming we keep with it for tonights checkin...can't set "this" directly...what if different callers? .... memoized points, curves, methods instead?

}

//bugbug remove this in favor of the class item itself knowing more of its info
Tree.prototype.become = function(n)   
{
	this.color=n.color; 
	this.bugbug="bugbug from lateDraw";
	this.points=n.points; 
	this.labels=n.labels; 
	this.curves=n.curves;
}
//bugbug make Tree inherit from path something like this...
//Tree.prototype=new Path();


Tree.prototype.getLevelPath=function (log2Size) //size= log of features you care about (and bigger)
{
	var p = this.pointh; 
	var height=40;
	//if only need details above 1m level, just send the supertall marker pole
	if (log2Size>0) return //pathLevel0  
				twoSegmentPath( 'red',
							  1,
							  p.x, p.y,      p.z,
							  p.x, p.y+height, p.z,  //bugbug supertall for now
							  p.x, p.y+height, p.z-10);  //minus Z is north
	
	
	if (log2Size>-10) 
		return combinePaths(
				twoSegmentPath( 'pink',
							  1,
							  p.x, p.y,      p.z,
							  p.x, p.y+height, p.z,  //bugbug supertall for now
							  p.x, p.y+height, p.z-20),  //minus Z is north
				twoSegmentPath( 'pink',
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


Tree.prototype.isLateDrawable=1;




