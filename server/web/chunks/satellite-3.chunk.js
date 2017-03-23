
chunkHandle = function () {
    return {  //a big object of functions

	//do it with a callback to enabled timed loading!!  ha!
	hydrate: function(gather,newRes) { //container already has pos,rot,etc.....we provide contents here

	    //start with empty container with....
	    ja.a.into(gather).mit([
		ja.a.platform.green  //bugbug.texture("grass") remember you made imgs/grass
		,ja.a.tower.x(55).red.wire
		,ja.a.tower.z(-44).blue.wire  //.pos("1 1 10")
		,ja.a.tower.z(70).x(65).yellow.wire
	    ]);


		
	    //make a cluster of skyhooks (do all worlds for now)
	    ja.a.pos("-10 2 1").into(gather)
		.spread(4,  //bugbug mark these somehow....exp  //experimental
			worldList.map(  (worldName) => ja.a.box.pos("0 0 0")
					//.yellow.sca("100 100 100") )  
					.skyhook(worldName) ) 
			    //bugbug.append(ja.a.sign("This is satellite world, the transportation nexus"))
		       )
	    ;
		    

	    
	},  

	
    };



};


