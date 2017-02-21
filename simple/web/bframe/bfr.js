// class Model {
//   constructor(properties) {
//     this.properties = properties;
//   }

//   toObject() {
//     return this.properties;
//   }
// }


// typical usage.....
//     ja.blank.green().platform().mixin("something").color('blue')

class ja {

    static get blank() {
	return new ja();
    }
    
    constructor() {
	this.und = document.createElement('a-entity');
    }  //understood "return this"



    static get testblank() {
	//var retval=document.createElement('a-entity');
	var retval = new ja();
	retval.und.setAttribute('geometry','primitive: cone; height:7; radiusTop:0, radiusBottom:0.25');
	retval.und.setAttribute('material','color','orange');
	retval.und.setAttribute('cursor-listener',{});
	return retval;
    }

    


    get box() { 
	this.und.setAttribute("geometry","primitive","box");
	this.und.setAttribute("id","barney");
	this.und.setAttribute("wireframe",true);
	this.und.setAttribute("material","color","red");
	this.und.setAttribute("position",{x:0, y:0, z:0});
	//this.und.setAttribute("geometry","depth",2);
	//this.und.setAttribute("geometry","width",2);
	//this.und.setAttribute("geometry","height",2);
	//this.und.setAttribute("scale","1 1 1");
	return this;
    }


    pos(po) {
	this.und.setAttribute("position","position",po);
	return this;
    }
    
    scale(s) {
	this.und.setAttribute("scale","scale",s);
	return this;
    }

    id(x) {
	this.und.setAttribute("id",x);
	return this;
    }

    color(co) {
	this.und.setAttribute("material","color",co);
	return this;
    }

    get green() {
	return this.color("green");
    }

    get wire() {
	this.und.setAttribute("wireframe","true"); 
	return this;
    }
    
    into(dest) {
	var result = this._into(dest);
	if (result!=0)
	    alert("bugbug708:" + result);
	return this;
    }

    _into(dest) {
	if (typeof dest != 'function') {
	    return "bugbug1217c";
	}
	// if (typeof this != 'ja') {
	//     return "bugbug1138u"+JSON.stringify(this);
	// }
	//if (typeof this.und != "a-entity") {
	//    return "bugbug1139i"+typeof this.und;
	//}
	
	//debugger; //bugbug you are here
	dest.call(null, this.und);
	return 0;
    }


}




////////////////////////






$("document").ready( function(event) {

    //var urlParams = new URLSearchParams(window.location.search);

    var foo = document.querySelector("#foo");
    //var collector =  (x)=>{foo.appendChild(x);};  //fnPointer  bugbug simplify
    var collector = function(x){
	foo.appendChild(x);
	x.flushToDOM(false);
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

