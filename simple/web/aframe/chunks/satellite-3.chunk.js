var afh={
    // A-FRAME HELPERS
    
    platform: function(){
	return this.mixin("platform");  //.green();
    },
    mixin: function(){
	

    blank:function(){
	
    },

    tower: function() {
	      <a-entity material="color:green" 
		mixin="platform"></a-entity>
      <a-box scale="10 40 10" position="10 20 -70" material="color:red"></a-box>




//parameterize with time?? unlikely...probably no params.
chunkHandle = function () {

    return {  //a big object of functions

	hydrate: function(container,newRes) {  //which already has the correct position, rotation, etc.....we provide contents here

	    var collect = container.appendChild;

	    //collect( steve.makeBigText(-3) );  //this is a test file, so it's just a resolution scan.


	    //bugbug you are here...loadToRes works but now this script needs to create this stuff but with MORE details...
	    collect( afh.platform().green() );  //id("bugbugtest") );    //  entity.material("color:green").mixin("platform") );
	    collect( afh.blank().tower() );           //  <a-box scale="10 40 10" position="10 20 -70" material="color:red"></a-box>
	    //words...<a-entity text="text: -SATELLITE-; font: #optimerBoldFont" scale="5 5 5" position="0 0 -15" material="color:red" rotation="0 0 0"></a-entity>

	    
	    //return nothing!!! bugbug
	},  

	
    };



};


