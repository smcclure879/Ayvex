
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
	//this.und.setAttribute("id","barney");
	//this.und.setAttribute("wireframe",true);
	//this.und.setAttribute("material","color","red");
	//this.und.setAttribute("position",{x:0, y:0, z:0});
	//this.und.setAttribute("geometry","depth",2);
	//this.und.setAttribute("geometry","width",2);
	//this.und.setAttribute("geometry","height",2);
	//this.und.setAttribute("scale","1 1 1");
	return this;
    }


    pos(po) {
	return this.adv("position",po);
    }
    
    sca(s) {
	return this.adv("scale",s);
    }

    id(x) {
	return this.adv("id",x);
    }

    col(co) {
	this.und.setAttribute("material","color",co);
	return this;
    }

    get green() {
	return this.col("green");
    }

    get wire() {
	return this.adv("wireframe","true"); 
    }
    
    
    mixin(foo) {
	return this.adv("mixin",foo);
    }

    adv(name,val) {
	this.und.setAttribute(name,val);
	return this;
    }

    into(dest) {
	if (typeof dest != 'function') {
	    alert("bugbug708:" + result);
	    return this;
	}
	
	dest(this.und);
	
	return this;  //continue the chain if needed.
    }
}


////////////////////////


$("document").ready( function(event) {

    //var urlParams = new URLSearchParams(window.location.search);

    var scene = document.querySelector("#scene");

    var collector = function(x){
	scene.appendChild(x);
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

	//works
	ja.blank.box.green.pos("-5 5 -3").into(collector);
	ja.blank.box.col("red").pos("-10 1 -10").into(collector);
	ja.blank.mixin("platform").pos("100 100 -400").green.into(collector);
	//ja.blank.pos("5 1 -5").mixin("platform").into(collector);
	    //.green
	    //.pos("-1 1 1")
	    //.sca("4 4 4")


    },1500);
});
		     



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

