//jsl = javascript loading  


class jsl extends Object {  //bugbug this could be more object oriented...later


    static load(url,cb) {

	//i know the load2 function needs this, and it cannot hurt 
	if (this.loaded[url]) {
	    cb();
	} else {
	    this.load2(url,cb);
	    this.loaded[url]=1;
	}

    }


// jQuery version wasn't working as desired (and the other script-tag version is working better)
//    static load1(url,cb) {
//	return $.getScript(url,cb);
//    }


    static makeIdFrom(url) {
	return url.replace(/\./g,"-");
    }



    static load2(url, cb) {
	//url is URL of external file, implementationCode is the code
	//to be called from the file, location is the location to 
	//insert the <script> element
	
	var scriptTag = document.createElement('script');
	scriptTag.src = url;
	scriptTag.id = this.makeIdFrom(url); 
	
	var realCallback = function() {
	    cb(scriptTag.id);
	}

	
	scriptTag.onload = realCallback;
	scriptTag.onreadystatechange = realCallback;
	
	document.head.appendChild(scriptTag);

	return scriptTag.id;  //as a handle  
    }



    //bugbug later
    // static strload(str,cb) {
    // 	var scriptTag = document.createElement('script');
    // 	//scriptTag.onload = cb;
    // 	//scriptTag.onreadystatechange = cb;
	
    // 	scriptTag.innerText = str;
    // 	if (cb) cb();
    // 	return scriptTag;  //as a "handle"
    // }




    //doesn't work as well as I'd like, may just remove it!!!
    static unload(url) {
	assert.exist(url,"url1");
	var scriptTag = document.querySelector("#"+this.makeIdFrom(url));
	assert.exist(scriptTag,"scriptTag");
    	delete scriptTag.onreadystatechange;
    	delete scriptTag.onload;
    	delete scriptTag.src;
    	scriptTag.parentElement.removeChild(scriptTag);	
    }


}

    
jsl.loaded=[];
