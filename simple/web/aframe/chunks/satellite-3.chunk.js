
chunkHandle = function () {
    return {  //a big object of functions

	//do it with a callback to enabled timed loading!!  ha!
	hydrate: function(gather,newRes) { //container already has pos,rot,etc.....we provide contents here
	    ja.a.mit(
		[
		    ja.a.platform.green
		    ,ja.a.tower.x(55).red
		    ,ja.a.tower.z(-44).blue  //.pos("1 1 10")
		    ,ja.a.tower.z(70).x(65).yellow

		]).into(gather);
	    
	},  

	
    };



};


