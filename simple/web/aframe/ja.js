// class ja
// copyright 2017 ayvex light industries llc 
// typical usage.....
//     ja.blank.green().platform().mixin("something").color('blue')
//     ja.blank.cyl.col("blue")


class ja {

    static get a() {  //like the "indefinite article" "a"
	return new ja();
    }
    
    constructor() {
	this.und = document.createElement('a-entity');
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


    mit(ss) {  //note: array flattening is OK?  (ss can be array or single item)
	if (ss instanceof Array) 
	    ss.map( (x)=>{this.append(x);} );
	else 
	    this.append(ss);
	return this;
    }

    into(dest) {
	if (typeof dest != 'function') {
	    alert("bugbug708:" + result);
	    return this;
	}
	
	dest(this.und);  //run it
	return this;
    }

}

