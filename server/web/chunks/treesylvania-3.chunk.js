//bugbug todo:  lib this stuff

//bugbug global for now, per-world later (keep refs or refcounts or___?)
//store all classes




String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}


var debuggingIsOn=true;
var assert = {
    exists: function(a,msg) { 
	if (debuggingIsOn && !a) {
	    alert("ASSERTFAIL:"+msg);
	}
    }
}



function preloadSingle(libName) {
    var retval = new $.Deferred(function(thisDeferral) {
	var path = "/web/chunks/" + libName + ".dyn.js";

	jsl.load(path, function(evt) {
	    
	    var typeName = libName.capitalize();

	    assert.exists(myClasses[typeName],"class not existing:"+typeName+"..."+dumps(myClasses));

	    thisDeferral.resolve();  //else this.reject();
	    
	},function(ooo){
	    alert("bugbug ooo--"+ooo);
	});
    });
}


function preload(libList,cb){  //e.g. "tree branch squirrel"
    
    var libs=libList.split(" ");
    
    $.when.apply( $, libs.map( preloadSingle ) )
	.then(function(){
	    debugger; //bugbug you are here
	    cb();
	}).fail(function(){ 
	    alert("bugbug1258u");
	});
    
}



chunkHandle = function () {

    var treeSeed=42;


    function theRealBuild(gather) {

	//let's build the tree first and stick in the scene momentarily!!
	debugger;
	var theFirstTree = myClasses["Tree"](treeSeed);


	ja.a.into(gather).mit([  //an empty container gathered UP into the scene
	    ja.a.platform.col("#aec572")  //dry grass colored "world"

	    //add stuff here
	    ,ja.a.tower.orange.pos("4 0 14")
	    ,ja.de(theFirstTree)
	    
	    //bugbug todo .texture("grass") remember you made imgs/grass
	    //,ja.a.tower.z(-44).col("#3c1").adv("opacity",0.3)  //.pos("1 1 10")
	    

	]);
	
    }	







    return {  //a big object of functions

	//todo this should ideally be in a lib itself....DRY x every level anyone ever makes

	hydrate: function(gather,newRes) { //container already has pos,rot,etc.....we provide contents here

	    //preliminary loads of extra js files
	    debugger;  //bugbug 
	    var libs="tree branch leaf";
	    preload(libs, function(){   //and then do the real build...
		theRealBuild(gather);
	    });
	}	    

    };  




};


