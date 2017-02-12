var z=150;
var sphere;
var $localVideo,$remoteVideo,$otherUsers,$user,$terminator;
var selectedItem = null;
var MINUTES = 60;



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
    var inv = denom-numer;
    return {
	x:(init.x*inv+fin.x*numer)/denom,
	y:(init.y*inv+fin.y*numer)/denom,
	z:(init.z*inv+fin.z*numer)/denom
    };
}


function doSkyhook() {
    var destObj = document.querySelector("#"+this.getAttribute('destination'));

    //note user is the target of this copy
    //bugbug the old way...instant but jarring....
    // //  copyAttribute($user,destObj,'position');
    

    //bugbug should be a loop so user flies...an animate added to user object then removed???
    //anim(1second,10steps,$user.positionV=targ, $user.positionV=init, $destObj.positionV=final)

    //bugbug you are here...and it looks like "let" might work?  or use THREE.js vectors? tween class?

    var firstPos = $user.getAttribute('position');
    var lastPos = destObj.getAttribute('position');
    var tickCount = 0;
    var maxTickCount = 10;

    lastPos.y += 4; 
    lastPos.x += 20;


    var skyhookAnim=setInterval(function(){

	var newPos = tween(tickCount, maxTickCount, firstPos, lastPos);
	$user.setAttribute('position',newPos);

	if (++tickCount>maxTickCount) {
	    clearInterval(skyhookAnim);
	}

    },100);
}


function prepSkyhooks() {
    var skyhooks = document.querySelectorAll("[id^='skyhook-']");

    for(var ii=0,il=skyhooks.length; ii<il; ii++) {
	var sh = skyhooks[ii];
	sh.doMainAction=doSkyhook;
    }
}




//bugbug instead of "anon" below in .ready(),,,maybe this code to retain anon id between sessions??
//function anonUserHandler() {  //bugbug insure you aren't calling this twice from anywhere

    //userId="anon"+getIpAddr();

    //and/or 

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



    window.setInterval(function(){
        z-=4;
        if (z<4) return;
        $user.setAttribute('position',{'x':0,'y':1.7,'z':z});
        //log("sphere: pos3d="+sphere.attributes.position.value);  //+"  pos2d="+sphere.position.left);
    },20);
    
    
    
    // Component to change to random color on click.
    AFRAME.registerComponent('cursor-listener', {
	init: function () {
            this.el.addEventListener('click', function (evt) {

		if (selectedItem)
		    unselect(selectedItem);

		select(this);

		//bugbug need to unselect old item (visually) !!!  TODO
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
    },500);

    
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





    
