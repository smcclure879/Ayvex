





//parameterize with time?? unlikely...probably no params.
chunkHandle = function () {


    var defaultPosition = {x:120,y:120,z:-500};



    return {  //a big object of functions

	hydrate: function(chunkContainer,newRes) {  //which already has the correct position, rotation, etc.....we provide contents here

	    //bugbug   if (no position attibute) 
	    //bugbug       retval.setAttribute('position',defaultPosition);  //default rotation? scale?

	    //NO: expected pre-purified  !!!  chunkContainer.purifyAttributes();  //to just a whitelist just pos,rot,scale, and what???
	    //note the above should also do....	    chunkContainer.removeAllChildren();
	    
	    //most hydrate functions just do a bunch of appendChild calls





	    chunkContainer.appendChild(steve.makeBigText(-3));  //this is a test file, so it's just a resolution scan.



	    //bugbug you are here...loadToRes works but now this script needs to create this stuff but with MORE details...
/*		<a-entity id="satellite" position="120 120 -500" res="0">
		<a-entity material="color:green" 
	    mixin="platform"></a-entity>
		<a-box scale="10 40 10" position="10 20 -70" material="color:red"></a-box>
		
		<a-entity text="text: -SATELLITE-; font: #optimerBoldFont" scale="5 5 5" position="0 0 -15" material="color:red" rotation="0 0 0"></a-entity>
		</a-entity>

*/



	    //return nothing!!! bugbug
	},  

	
    };



};


