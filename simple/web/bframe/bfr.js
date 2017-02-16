// class Model {
//   constructor(properties) {
//     this.properties = properties;
//   }

//   toObject() {
//     return this.properties;
//   }
// }




class ja {

    constructor() {
	this.und = document.createElement('a-entity');
    }  //understood "return this"

    // typical usage.....
    //     ja.blank.green().platform().mixin("something").color('blue')


    static get blank() {
	return new ja();
    }

    get box() { 
	this.und.setAttribute("geometry","primitive","box");
	this.und.setAttribute("depth","2");
	this.und.setAttribute("width","2");
	this.und.setAttribute("height",2);
	this.und.setAttribute("scale","1 1 1");
	return this.wire;
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
	if (typeof dest === 'function')
	    return dest(this.und); 
	//else if (typeof x === 'string') {  //then make it a parent entity!
	//    alert("trying the thing bugbug1259i");
	//    return this.into(document.querySelector("#"+x).appendChild);
	//}
	else 
	    alert("bugbug1217c");
	

	return this;
    }


}




////////////////////////






$("document").ready( function(event) {

    //var urlParams = new URLSearchParams(window.location.search);

    var foo = document.querySelector("#foo");
    //var collector =  (x)=>{foo.appendChild(x);};  //fnPointer  bugbug simplify
    var collector = (x)=>{
	x.flushToDOM();
	console.log(x);
    };
    //for this experiment all the following should work...
    ja.blank.green.into(collector);  //green.box.pos("-11 3 -3").into(collector);
    //scale("1 1 1").id("foo2").into(collector);

    //bugbug
    //afh.blank().box().position("1 1 1").scale("44 44 44").green().useWith(collect);
    //afh.blank().green().platform().mixin("something").color('blue').useWith(collect);
});
		     



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



function copyAttribute(trg,src,name) {
    var val=src.getAttribute(name);
    trg.setAttribute(name,val);
}




function runIfFunction(f,arg) {
    if (typeof f != 'function') 
	return null;
    
    return f(arg);
}



var allowedAttribs=['position','rotation','scale','id','visible'];
function purify(obj) {
    
    //obj.removeAllChildren();
    while (obj.hasChildNodes()) {
	obj.removeChild(obj.lastChild);
    }
    
    //obj.removeAllNonAllowedAttributes()...
    for (var ii = 0; ii < obj.attributes.length; ii++) {
	var attrib = obj.attributes[ii];
	if (!attrib.specified) continue;
	if (allowedAttribs.indexOf(attrib.name)<0) continue;
	if (attrib.name.startsWith('_')) continue;

	obj.attributes.removeNamedItem(attrib.name);
        //console.log(attrib.name + " = " + attrib.value);
    }

}



function hydrate(){



}
