//todo should be in some base class when refactoring
function standardTransform(renderer,pointh,skipOffscreenPoint) 
{	
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


