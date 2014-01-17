// tree.js  copyright 2014 Ayvex Light Industries

//use a 'promise' to defer tree detail (just save the hash for the tree!)
//tree at first level presents as a markerPole + promise of more small details if requested
//tree at second level present the small details, + promise of even smaller details if requested. 

//bugbug make this into a function and just return the interface ... like pre3d.js is packaged


function tree(xx,zz)
{
	var pathLevel1=twoSegmentPath( 'green',
								  1,
								  xx,62,zz,   //the floor is at 62  //bugbug var or setting or ???
								  xx,362,zz,
								  xx,362 ,zz-10);  //minus Z is north

	tree.getLevel=function getLevel(size) //size of features you care about (and bigger)
	{
		//do we implement this by passing in the size or by having the object itself hold promise to compute the next layer down e.g. by
		//having it's own hash cached and a function not forced yet to be called later which will take that hash and implement tree details
		
		//wouldn't that mean all paths have to be additive?  What if the tree should Curl or something
		
		//do we need to defer work on this until we have polygons and textures?
	
	}
}