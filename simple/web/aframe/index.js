var z=150;
var sphere;
var $localVideo,$remoteVideo,$otherUsers,$user,$terminator;
var selectedItem = null;
var MINUTES = 60;
var weAreResing=1;
var userScaleFactor = -3;  //bugbug make member of user



function term(x) {
    x=""+x;
    $terminator.setAttribute("text","text",x);
}
var log = term;  

function select(x) {
    if (selectedItem==x)
	return unselect(x);

    x.setAttribute('material', 'wireframe', true);
    selectedItem = x;  //global
}

function unselect(x) {
    if (!x) 
	return;
    x.setAttribute('material', 'wireframe', false);
}



function doMirror1() {
    getUserMedia(
	{video:true,audio:true},
	function doMirror2(mirrorStream){
	    var blobUrl = URL.createObjectURL(mirrorStream);
	    $localVideo.setAttribute('src',blobUrl);  // NOTE: $localVideo.src DOES NOT WORK
	    
	    //mute to avoid local echo and squeal
	    mirrorStream.getAudioTracks()[0].enabled = false;  //bugbug does audio still go to the remote stream????
	    
	},
	function(err){
	    alert(err);
	}
    );
}


function copyAttribute(trg,src,name) {
    var val=src.getAttribute(name);
    trg.setAttribute(name,val);
}



function tween(numer,denom,init,fin){
    var inver = denom-numer;
    return {
	x:(init.x * inver + fin.x * numer) / denom,
	y:(init.y * inver + fin.y * numer) / denom,
	z:(init.z * inver + fin.z * numer) / denom
    };
}


function signedInt(y) {
    var x=Math.floor(y);
    if (x!=y) 
	alert("why--bugbug723n");

    if (x<0) return x;
    if (x==0) return "+0";
    if (x>0) return "+"+x;
    
    alert("why---bugbug726v");
    return "+0";
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



function loadJS(url, implementationCode){
    //url is URL of external file, implementationCode is the code
    //to be called from the file, location is the location to 
    //insert the <script> element
    
    var scriptTag = document.createElement('script');
    scriptTag.src = url;
    
    scriptTag.onload = implementationCode;
    scriptTag.onreadystatechange = implementationCode;
    
    document.head.appendChild(scriptTag);
};

    


//notes on multi-resolution loading
//all permanent world changes are thru master copy at github
// resLevel 0 = 1m and up
//         -2 = 1cm and up
//    remember user is scale -3 !! millimeter!
// resLevel +2 = 100m and up, so maybe like a mountain
//file  mountWannaHockaLoogi+2.chunk.js  would be at much coarser level than mountBlahBlahWestFaceLowerSide4-2.chunk.js

//    loadNewChunk(containerObj, newRes, cbGood, cbBad)
function loadNewChunk(containerObj,newRes,cbGood,cbBad) {
    //reasons to leave early
    if ( ! weAreResing ) 
	return cbGood();
    if (containerObj.getAttribute('res') == newRes) 
	return cbGood();
    var chunkId=containerObj.id;
    var gather = function(x){ 
	containerObj.appendChild(x); 
    };

    if (!allWord(chunkId))     //bugbug todo write this function to sanitize the id!!  bugbug already wrote this somewhere...
	return cbBad("err1034d");
  
    //bugbug for now the newRes should be coming from the skyHook entry.  so the file better exist.
    var path = "/web/aframe/chunks/" + chunkId + signedInt(newRes) + ".chunk.js";


    loadJS(path, function(scriptContents) {
	if (typeof chunkHandle == 'function') {  
	    if (typeof cbGood == 'function') {
		var chunk = chunkHandle();
		if (typeof chunk.hydrate == 'function') {
		    //bugbug todo verify that purify worked...any leak??
		    purify(containerObj);
		    var obj = chunk.hydrate(gather,newRes);
		    cbGood(obj);                          //   <------- THE GOAL of this function  (bugbug invert logic??)
		} else {
		    cbBad("bugbug139x:"+dumps(chunk.hydrate));
		}
	    } else {
		cbBad("bugbug746e:"+dumps(cbGood));
	    }
	} else {
	    cbBad("bugbug746ff:"+dumps(chunkHandle));
	}
    });

    
}



function loadToRes(containerObj,newRes,cb) {
    loadNewChunk(
	containerObj,
	newRes,  //<----two real "input params"
	cb,  //cbGood
	function(reasonForError) {  //cbBad
	    var msg="bugbug803w:"+reasonForError;
	    alert(msg);
	    log(msg);
	    cb();
	}
    );
}



function doSkyhook(activator) {
    
    var destObj = document.querySelector("#"+activator.getAttribute('destination'));
    
    //load enough levels of destination (newRes = userScaleFactor, which might change over time)
    loadToRes(destObj,userScaleFactor, function() {  // "then..."
	
	var firstPos = $user.getAttribute('position');
	var lastPos = destObj.getAttribute('position');
	var tickCount = 0;
	var maxTickCount = 10;
	
	//don't jump RIGHT to the center...
	lastPos.y += 4; 
	lastPos.x += 20;
	
	
	var skyhookAnim=setInterval(function(){
	    var newPos = tween(tickCount, maxTickCount, firstPos, lastPos);
	    $user.setAttribute('position',newPos);
	    
	    if (++tickCount>maxTickCount) 
		clearInterval(skyhookAnim);
	},100);

    });

}


 // function(reasonForError){  //cbBad
 // 	    var msg="bugbug803w:"+reasonForError;
 // 	    alert(msg);
 // 	    log(msg);
 // 	    cb();
 // 	}


//bugbug some of this should happen when you prep a skyhook
function prepSkyhooks() {
    var skyhooks = document.querySelectorAll("[id^='skyhook-']");

    for(var ii=0,il=skyhooks.length; ii<il; ii++) {
	var sh = skyhooks[ii];
	//crappy lambda per object way to do this...
	sh.doMainAction=function() { doSkyhook(sh); };  //kinda a "this" being passed...objectify better later
    }
}




//bugbug instead of "anon" below in .ready(),,,maybe this code to retain anon id between sessions??
//function anonUserHandler() {  //bugbug insure you aren't calling this twice from anywhere

    //userId="anon"+getIpAddr();  //here is how to get the IP
// window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;   //compatibility for firefox and chrome
//     var pc = new RTCPeerConnection({iceServers:[]}), noop = function(){};      
//     pc.createDataChannel("");    //create a bogus data channel
//     pc.createOffer(pc.setLocalDescription.bind(pc), noop);    // create offer and set local description
//     pc.onicecandidate = function(ice){  //listen for candidate events
//         if(!ice || !ice.candidate || !ice.candidate.candidate)  return;
//         var myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)[1];
//         console.log('my IP: ', myIP);   
//         pc.onicecandidate = noop;
//     };



    // --- and/or ---

    // // Build the expiration date string:
    // var expiration_date = new Date();
    // var cookie_string = '';
    // expiration_date.setFullYear(expiration_date.getFullYear() + 1);
    // // Build the set-cookie string:
    // cookie_string = "test_cookies=true; path=/; expires=" + expiration_date.toUTCString();
    // // Create or update the cookie:
    // document.cookie = cookie_string;
//}



$("document").ready( function(event) {

    if (window.location.protocol!='https:' 
	&& window.location.host!='localhost') {

	alert("you should be using https...conferencing won't work without it!");
    }




    var urlParams = new URLSearchParams(window.location.search);

    //"login"
    if (!urlParams.has('user'))
	userId="anon"+Date.now()%10000;
    else 
	userId=urlParams.get('user');


    //all the conference stuff in one place for now
    $remoteVideo=document.querySelector("#remoteVideo");
    $localVideo=document.querySelector("#localVideo");
    $otherUsers = document.querySelector("#otherUsers");
    $user = document.querySelector("#user");
    $terminator = document.querySelector("#terminator");
    sphere = document.querySelector("#sphere");



    var initAnim=window.setInterval(function(){
        z-=6;
        if (z<4) {
	    clearInterval(initAnim);
	    return;
	}
        $user.setAttribute('position',{'x':0,'y':1.7,'z':z});
        log("sphere: pos3d="+sphere.attributes.position.value);  //+"  pos2d="+sphere.position.left);
    },60);
    
    
    
    // Component to change to random color on click.
    AFRAME.registerComponent('cursor-listener', {
	init: function () {
            this.el.addEventListener('click', function (evt) {

		if (selectedItem)
		    unselect(selectedItem);

		select(this);

		log("selected="+selectedItem.tagName+" "+selectedItem.id);
            });
	}
    });
    


    $(this).keydown(function(evt) {
	if (evt.key=='v')
	    onSpaceKey(evt);
    });


    
    if (!$remoteVideo)
      alert("err1236t");
    if (!$localVideo)
      alert("err224t");
    



    //autocall on startup
    window.setTimeout(function(){
	doMirror1();
	prepSkyhooks();
    },3000);

    
    //this should ideally be based on something besides a timer...like user movement or inactivity    
    window.setInterval(function(){
	updateServerCallback($user,log,updateOtherUsers);  //saves $user then calls updateOtherUsers as our cb()
    },2000);
    
});
 
function getSelectedItem() { return selectedItem; }


function onSpaceKey(evt) {
    if (!selectedItem)   return;
    if (!selectedItem.id)   return;  //selectedItem (req for a call) gets to other user when they are drawing me!!
    if (!selectedItem.doMainAction)   return;
    if ( typeof selectedItem.doMainAction != 'function' )   return;
    return selectedItem.doMainAction(evt);  //which should be conferenceJsHook() for a user
}




function timedOut(item) {
    //bugbug compact this logic (this is optimized for debugging) 
    //  ( it would be smart to have this logic in the server, tho it could be a nightly reboot for a fix ha  :-)   )
    var secondsDiff = (getOfficialTime()-item.saveTime)/1000;
    //debugger;
    if (secondsDiff > 1*MINUTES) {
	return secondsDiff;
    }

    return 0;
}







function updateOtherUsers(newUserDataFromServer) {
    //bring code here from commented out code in comm.js
    var logStr="--";
    $.each(newUserDataFromServer,function(id,details) {

	details = $.parseJSON(details);
	logStr += ( ',' + id + '-' );
	
	//don't build an icon for "self"  
	if (id==userId) {
	    logStr+='s';
	    return true; //next-each
	    //bugbug todo check returned version of self (is my last write up to date? etc)
	}
	
	if (details.telecInfo && details.telecInfo.callee) {
	    logStr+=details.telecInfo.callee;
	}
	
	

	var secondsAge=timedOut(details);
	if (secondsAge) {
	    logStr+=('o='+secondsAge);
	    //bugbug todo delete child in #otherUsers!!
	    return true;  //next-each
	}

	//bugbug todo: here should be code that lets anything be reconstituted,
        //     but instead just make gross assumptions...
	var user = document.querySelector('#otherUsers a-entity[id="' + id + '"'); //bugbug better way?
	if (!user) {
	    user = createBlankUser();
	    user.setAttribute('id',id);

	    //and label the user visually
	    var label = document.createElement('a-entity');
	    label.setAttribute('material','color','red');
	    label.setAttribute('text','text',id);
	    label.setAttribute('position','0 1.8 0.5');
	    label.setAttribute('rotation','0 0 45');
	    label.setAttribute('scale','0.3 0.3 0.3');
	    user.appendChild(label);

	    $otherUsers.appendChild(user);
	}

	//update our representation of other person based on the details from server 
	user.setAttribute('position',details.pos);
	user.setAttribute('rotation',details.rot);
	//bugbug todo user.setAttribute(geometry.scale  ....etc  etc)
	
	
	maybeDoTeleconf(user,details); //bugbug dynObj,item);  //item is from server  //users can do teleconf but probably no other types
	
    });

    log(logStr);
}




function createBlankUser() {
    var retval=document.createElement('a-entity');
    retval.setAttribute('geometry','primitive: cone; height:7; radiusTop:0, radiusBottom:0.25');
    retval.setAttribute('material','color','orange');
    retval.setAttribute('cursor-listener',{});
    retval.doMainAction=conferenceJsHook;//bugbug should just take user as argument now!
    return retval;
}









    


    
