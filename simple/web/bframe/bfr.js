// typical usage.....
//     ja.blank.green().platform().mixin("something").color('blue')

class ja {

    
    constructor() {
	this.und = document.createElement('a-entity');
    }  //understood "return this"



    static get testblank() {
	var retval = new ja();
	retval.und.setAttribute('geometry','primitive: cone; height:7; radiusTop:0, radiusBottom:0.25');
	retval.und.setAttribute('material','color','orange');
	retval.und.setAttribute("position",{x:0, y:0, z:0});
	return retval;
    }
    
    into(destFn) {
	if (typeof destFn != 'function') 
	    alert( "bugbug1217c" );

	destFn(this.und);
    }
}



$("document").ready( function(event) {
    var foo = document.querySelector("#scene");  //bugbug or #foo??
    var collector = function(x){
	foo.appendChild(x);
	x.flushToDOM(true);
	console.log(x);
    };



    setTimeout(function(){
	//for this experiment all the following should work...
	//ja.blank.box.into(collector);  //green.box.pos("-11 3 -3").into(collector);
	//scale("1 1 1").id("foo2").into(collector);
	
	//bugbug
	//afh.blank().box().position("1 1 1").scale("44 44 44").green().useWith(collect);
	//afh.blank().green().platform().mixin("something").color('blue').useWith(collect);

	//bugbug not even this????
    ja.testblank.into(collector);

    },2000);
});
		     


//keep as reference....worked in other code!
// function createBlankUser() {
//     var retval=document.createElement('a-entity');
//     retval.setAttribute('geometry','primitive: cone; height:7; radiusTop:0, radiusBottom:0.25');
//     retval.setAttribute('material','color','orange');
//     retval.setAttribute('cursor-listener',{});
//     retval.doMainAction=conferenceJsHook;//bugbug should just take user as argument now!
//     return retval;
// }


//     makeBigText:function(size) {
// 	var label = steve.createBlank();
// 	label.setAttribute('text','text',""+size);
// 	label.setAttribute('material','color','red');
// 	label.setAttribute('position','0 0 0');
// 	label.setAttribute('scale','1 1 1');
// 	return label;
//     },

//     //function drawCityBlock(size,pos)  ....etc etc

// }




    


    // $(this).keydown(function(evt) {
    // 	if (evt.key=='v')
    // 	    blah();
    // });
    // user.appendChild(label);   

