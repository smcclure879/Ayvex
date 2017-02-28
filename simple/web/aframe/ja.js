// class ja
// copyright 2017 ayvex light industries llc 
// typical usage.....
//     ja.blank.green().platform().mixin("something").color('blue')
//     ja.blank.cyl.col("blue")




function gausW(seed,width) {
    return 10*Math.sin(seed*10*3.14159/4.1)*width;  //bugbug230u
}

function fuzzedPosition(seed,w) {
    return gausW(seed,w) + " " + gausW(seed+1,w) + " " + gausW(seed+2,w);
}



class ja {

    static get a() {  //like the "indefinite article" "a"
	return new ja();
    }
    
    constructor() {
	this.und = document.createElement('a-entity');
    }




    fuzz(seed) {
	return this.adv("position",fuzzedPosition(seed));
    }




    append(x) {
	if (x instanceof ja)
	    x=x.und;

	this.und.appendChild(x);
	//note do NOT return this...called from map where we don't want returns, and other places 
    }

    //however...most things return "this" to enable them to be chained.
    adv(name,val) {
	this.und.setAttribute(name,val);
	return this;
    }

    adv3(name,sub,val) {
	this.und.setAttribute(name,sub,val);
	return this;
    }




    //save known good for testing...but don't use in the app!!!
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

    x(v) { return this.adv3("position","x",v); }
    y(v) { return this.adv3("position","y",v); }
    z(v) { return this.adv3("position","z",v); }


    
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

    get red() {
	return this.col("red");
    }

    get blue() {
	return this.col("blue");
    }

    get yellow() {
	return this.col("yellow");
    }

    get gray() {
	return this.col("gray");
    }

    get tower() {
	 return ja.a.box.sca("25 70 25").pos("0 35 0");
    }

    get wire() {
	return this.adv("wireframe","true"); 
    }
    
    
    mixin(m) {
	return this.adv("mixin",m);
    }

    get box() {
	return this.adv("geometry","primitive:box");
    }

    get platform() {
	return this.mixin("platform");
    }

    world(name) {
	return this.id(name).mixin("platform");
    }


    //bugbug doesn't work yet
    sign(fontHeight,str) {
	this.adv3("text","text",str);
	this.adv3("text","font","#optimerBoldFont");
	return this.sca("1 1 1");
    }

    static prepDestination(destName) {
	alert(destName);//bugbug
	return ja.a.platform.id(destName).position;
    }



    //note if you build a skyhook it attempts auto-res the destination to cheap resolution (prepDestination)
    //and you gotta have doSkyhook ready to go
    skyhook(destName) {
	var destObj = document.querySelector("#"+destName);
	if (!destObj) {
	    alert("bugbug836b");
	}

	this.mixin("skyhook")
	    .id("skyhook-"+destName)
	    .mach( ()=>{doSkyhook(destObj);} );	

	return this;
    }

    mach(fn) {
	return this.und.mach=fn;
    }

    get exp() {  //make this "experimental" in some unified way
	return this.yellow;  //bugbug extra wireframe?
    }

    texture(tex) {
	return this.adv("texture",tex);
    }

    get grass() {
	return this.texture("texture","blah blah bugbug207 grass");
    }


    mit(ss) {  //note: array flattening is OK?  (ss can be array or single item)
	if (ss instanceof Array) 
	    ss.map( (item)=>{this.append(item);} );
	else 
	    this.append(ss);
	return this;
    }


    //bugbug you are here, spread worked once for skyhooks, never for worlds
    spread(size, ss) { //ss is array of sub-ja's ... "subs"
	if (ss instanceof Array) {
	    var spreader=0;
	    ss.map( (item)=>{
		if (!item.und.getAttribute("position"))
		    item.adv("position","0 0 0");

		//bugbug better detrand
		item.x( size*Math.sin(spreader++) );
		item.y( size/40*Math.cos(spreader*3 ));
		item.z( size*Math.sin(spreader*2.583));
		this.append( item );
		//return nothing...desire only the side effect of multi-append
	    });
	} else {
	    alert("spread requires an array bugbug700y");
	}
	return this;
    }

    into(dest) {
	if (!dest)
	    alert("bugbug1037p");

	var tag=(dest.tagName || "").toLowerCase();
	if ( ['a-entity','a-scene'].indexOf(tag) > -1) {
	    var that = dest;
	    dest=function(x){that.appendChild(x);}
	}

	if (typeof dest != 'function') {
	    alert("bugbug708:" + result);
	    return this;
	}
	
	dest(this.und);  //run it
	return this;
    }

}

