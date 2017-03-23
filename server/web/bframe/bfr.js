
// typical usage.....
//     ja.blank.green().platform().mixin("something").color('blue')

class ja {

    static get blank() {
	return new ja();
    }
    
    constructor() {
	this.und = document.createElement('a-entity');
    }

    adv(name,val) {
	this.und.setAttribute(name,val);
	return this;
    }

    static get testblank() {
	var retval = new ja();
	retval.und.setAttribute('geometry','primitive: cone; height:7; radiusTop:0, radiusBottom:0.25');
	retval.und.setAttribute('material','color','orange');
	retval.und.setAttribute('cursor-listener',{});
	return retval;
    }


    get box() { 
	this.und.setAttribute("geometry","primitive","box");
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


    into(dest) {
	if (typeof dest != 'function') {
	    alert("bugbug708:" + result);
	    return this;
	}
	
	dest(this.und);
	return this;
    }

}


////////////////////////


$("document").ready( function(event) {
    var scene = document.querySelector("#scene");
    var collector = function(x){
	scene.appendChild(x);
	x.flushToDOM(false);
	console.log(x);
    };

    setTimeout(function(){
	//works
	ja.blank.box.green.pos("-5 5 -3").into(collector);
	ja.blank.box.col("red").pos("-10 1 -10").into(collector);
	ja.blank.mixin("platform").pos("100 100 -400").green.into(collector);

    },1500);
});
		     


//
