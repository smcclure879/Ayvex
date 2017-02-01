var z=150;
var disp,sphere;
var $localVideo,$remoteVideo,$otherUsers,$user;
var selectedItem = null;
var MINUTES = 60;



function log(x) {
    disp.textContent=(""+x);
}

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



$("document").ready( function(event) {

    var urlParams = new URLSearchParams(window.location.search);

    //"login"
    if (!urlParams.has('user'))
	alert("no user in URL querystring");
    else 
	userId=urlParams.get('user');


    //all the conference stuff in one place for now
    $remoteVideo=document.querySelector("#remoteVideo");
    $localVideo=document.querySelector("#localVideo");
    $otherUsers = document.querySelector("#otherUsers");
    $user = document.querySelector("#user");
    disp= document.querySelector("#readout");
    sphere = document.querySelector("#sphere");


    window.setInterval(function(){
        z-=3;
        if (z<4) return;
        $user.setAttribute('position',{'x':0,'y':1.7,'z':z});
        log("sphere: pos3d="+sphere.attributes.position.value);  //+"  pos2d="+sphere.position.left);
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
	    requestConference();
    });


    
    if (!$remoteVideo)
      alert("err1236t");
    if (!$localVideo)
      alert("err224t");
    


    function doMirror1() {
	getUserMedia(
	    {video:true,audio:true},
	    function(mirrorStream){
		var blobUrl = URL.createObjectURL(mirrorStream);
		$localVideo.setAttribute('src',blobUrl);  // NOTE: $localVideo.src DOES NOT WORK
	    },
	    function(err){
		alert(err);
	    }
	);
    }



    //autocall on startup
    window.setTimeout(function(){
	doMirror1();
    },500);

    
    //this should ideally be based on something besides a timer...like user movement or inactivity    
    window.setInterval(function(){
	updateServerCallback($user,updateOtherUsers);  //saves $user then calls updateOtherUsers as our cb()
    },2000);
    
});
 
function getSelectedItem() { return selectedItem; }


function requestConference() {
    if (!selectedItem) return;
    if (!selectedItem.id) return;  //selectedItem (req for a call) gets to other user when they are drawing me!!
    conferenceJsHook();
}





function timedOut(item) {
    //bugbug compact this logic (this is optimized for debugging) 
    //  ( it would be smart to have this logic in the server, tho it could be a nightly reboot for a fix ha  :-)   )
    var secondsDiff = getOfficialTime()-item.saveTime;
    //debugger;
    if (secondsDiff > 15*MINUTES) {
	return true;
    }

    return false;
}


function updateOtherUsers(newUserDataFromServer) {
    //bring code here from commented out code in comm.js
    $.each(newUserDataFromServer,function(id,details) {

	details = $.parseJSON(details);

	//don't build an icon for "self"  
	if (id==userId) {
	    return true; //next-each
	    //bugbug todo check returned version of self (is my last write up to date? etc)
	}

	if (timedOut(details))
	    return true;  //next-each

	//bugbug todo: here should be code that lets anything be reconstituted,
        //     but instead just make gross assumptions...
	var user = document.querySelector('#otherUsers a-entity[id="' + id + '"'); //bugbug better way?
	if (!user) {
	    user = createBlankUser();
	    user.setAttribute('id',id);
	    $otherUsers.appendChild(user);
	}
	
	//update our representation of other person based on the details from server 
	user.setAttribute('position',details.pos);
	user.setAttribute('rotation',details.rot);
	//bugbug todo user.setAttribute(geometry.scale  ....etc  etc)
	
	
	maybeDoTeleconf(user,details); //bugbug dynObj,item);  //item is from server  //users can do teleconf but probably no other types
	
    });
}




function createBlankUser() {
    var retval=document.createElement('a-entity');
    retval.setAttribute('geometry','primitive: cone; height:7; radiusTop:0, radiusBottom:0.25');
    retval.setAttribute('material','color','orange');
    retval.setAttribute('cursor-listener',{});
    return retval;
}





    
