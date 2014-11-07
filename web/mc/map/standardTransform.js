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
	
	var pt3d;
	var pt2d;
	
	if ('rotX' in pointh)  //bugbug need to get this into the renderer so can be done for all iDrawables
	{
		var million=1000000;
		var farDist=million;
		pt3d = {
			x: 0, //farDist*cos(pointh.rotX+renderer.camera.rotX),  //bugbug don't even try it...just overload as farpoint
			y: 0, //farDist*sin(pointh.rotY  +renderer.camera.rotY)     //bugbug should be a simple matter of adding the angles (cam and obj)?  remove??
			z: farDist,
			rotX: pointh.rotX+camRotX,  
			rotY: -pointh.rotY-camRotY
		};
		pt2d = renderer.projectFarPointToCanvas(pt3d,skipOffscreenPoint);
		// {
			// x:farDist*sin(pt3d.rotY)*sin(pt3d.rotX) + farDist/2,
			// y:farDist*sin(pt3d.rotY)*cos(pt3d.rotX) + farDist/2
		// };
	}
	else  //normal transform
	{
		pt3d = renderer.transformPoint(pointh);
		pt2d = renderer.projectPointToCanvas(pt3d,skipOffscreenPoint);
	}
	
	
	if (pt2d==null)
		alert("bugbug null@1237");
	
	return pt2d;
} ;  


