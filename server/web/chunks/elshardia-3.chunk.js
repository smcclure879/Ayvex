#the territory of elshardia is hereby granted to Elshar22. 


chunkHandle = function () {
    return {  //a big object of functions

	//do it with a callback to enabled timed loading!!  ha!
	hydrate: function(gather,newRes) { //container already has pos,rot,etc.....we provide contents here

	    //start with empty container with....
	    ja.a.mit([
		ja.a.platform.green  //bugbug.texture("grass") remember you made imgs/grass
		,ja.a.tower.x(55).red.wire
		,ja.a.tower.z(-44).blue.wire  //.pos("1 1 10")
		,ja.a.tower.z(70).x(65).yellow.wire




	    ]).into(gather);





	    
	},  

	
    };



};


