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

	if (!this.und) {
	    alert("bugbug753q you are here--why is this.und null????");
	    return;
	}

	//bugbugalert("type of x:"+typeof x);

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
    
    adv3delta(name,sub,delta) {
	//bugbug didn't work...WHY??
	//this.und.getAttribute(name)[sub]+=delta;
	//return this;

	var val = this.und.getAttribute(name)[sub];
	this.und.setAttribute(name,sub,delta+val);
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

    dx(v) { return this.adv3delta("position","x",v); }
    dy(v) { return this.adv3delta("position","y",v); }
    dz(v) { return this.adv3delta("position","z",v); }


    
    sca(s) {
	return this.adv("scale",s);
    }

    id(x) {
	this.und["id"]=x;
	return this;
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

    get orange() {
	return this.col("orange");
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
	return this
	    .id(name).adv("res",0)
	    .mit([
		ja.a.platform.green
	    ])
	;
    }


    //bugbug doesn't work yet
    sign(fontHeight,str) {
	this.adv3("text","text",str);
	this.adv3("text","font","#optimerBoldFont");
	return this.sca("1 1 1");
    }

    static prepDestination(destName) {
	alert("prepping..."+destName);//bugbug
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
	    .mach( ()=>{doSkyhook(destObj,destName);} );	

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

		++spreader;
		item.dx( size*Math.sin(spreader) );
		item.dy( size/4*Math.cos(spreader*0.2 ));
		item.dz( size*Math.sin(spreader*2.583));
		this.append( item );
		//return nothing...desire only the side effect of multi-append
	    });
	} else {
	    alert("spread requires an array bugbug700y");
	}
	return this;
    }

    into(dest) {
	if (!dest) {
	    alert("bugbug1037p");
	    debugger;
	}

	if (typeof dest == 'undefined') {
	    alert("bugbug727s");
	    debugger;
	}
	

	//coerce entity tags to gather functions 
	var tag=(dest.tagName || "").toLowerCase();
	if ( ['a-entity','a-scene'].indexOf(tag) > -1) {
	    var that = dest;
	    dest=function(x){that.appendChild(x);}
	}

	//and at this point, it better be a function
	if (typeof dest != 'function') {
	    alert("bugbug708:" + result);
	    return this;
	}
	
	dest(this.und);  //run it
	return this;
    }


    static de(classFn) {
	var retval = ja.a;
	retval.adv("seed",seed);
	retval.drawingObject = classFn();
	return retval;
    }




} //end class






