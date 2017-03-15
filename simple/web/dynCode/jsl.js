class jsl extends Object {  //bugbug this could be more object oriented...later


    static load(url,cb) {
	return $.getScript(url,cb);
    }




    static load_good(url, cb) {
	//url is URL of external file, implementationCode is the code
	//to be called from the file, location is the location to 
	//insert the <script> element
	
	var scriptTag = document.createElement('script');
	scriptTag.src = url;
	//scriptTag.id = makeIdFrom(url);  //bugbug to facilitate debugging of DOM???

	var realCallback = function() {
	    cb(scriptTag);
	}

	
	scriptTag.onload = realCallback;
	scriptTag.onreadystatechange = realCallback;
	
	document.head.appendChild(scriptTag);

	return scriptTag;  //as a "handle"
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




    //bugbug later
    static unload(handle) {
	var scriptTag = handle;

    	delete scriptTag.onreadystatechange;
    	delete scriptTag.onload;
    	delete scriptTag.src;
    	scriptTag.parentElement.removeChild(scriptTag);	
    }


}

    

