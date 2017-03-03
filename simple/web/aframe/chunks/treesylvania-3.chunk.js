
chunkHandle = function () {
    return {  //a big object of functions

	//do it with a callback to enabled timed loading!!  ha!
	hydrate: function(gather,newRes) { //container already has pos,rot,etc.....we provide contents here

	    //start with empty container with....
	    //alert("bugbug where is tree?");
	    ja.a.into(gather).mit([
		ja.a.platform.red
		    //col("#aec572")
		    //.pos("0 0 0").rot("0 0 0")
		    .mit([
		    //ja.a.seed(42).tree;
		    ja.a.tower.orange.pos("0 0 0")
		])
   
		//bugbug todo .texture("grass") remember you made imgs/grass
		//,ja.a.tower.z(-44).col("#3c1").adv("opacity",0.3)  //.pos("1 1 10")
	    ]);


	    
	}  
	

	
    };



};


