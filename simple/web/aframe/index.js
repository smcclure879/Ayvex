var z=150;
var disp,sphere;
var $localVideo,$remoteVideo,$otherUsers;
var selectedItem = null;

var otherUsers = {};
var myState = {};


function log(x) {
    disp.textContent=(""+x);
}

function select(x) {
    if (selectedItem==x)
	return unselect(x);

    x.setAttribute('normalColor', x.getAttribute('material','color'));
    x.setAttribute('material', 'color', "#995599");
    x.setAttribute('material', 'wireframe', true);
    selectedItem = x;  //global
}

function unselect(x) {
    if (!x) return;
    x.setAttribute('material', 'color', x.getAttribute('material','normalColor'));
    x.setAttribute('material', 'wireframe', false);
}



$("document").ready( function(event) {

    var urlParams = new URLSearchParams(window.location.search);

    //"login"
    if (!urlParams.has('user'))
	alert("no login");
    else 
	user={key:urlParams['user']};



    disp= document.querySelector("#readout");
    sphere = document.querySelector("#sphere");
    viewer = document.querySelector("#viewer");
    window.setInterval(function(){
        z-=3;
        if (z<4) return;
        viewer.setAttribute('position',{'x':0,'y':1.7,'z':z});
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
    

    //bugbug you are here this didn't seem to register  (probably need to commitpush next tho)
    $(this).keydown(function(evt) {
	if (evt.key=='v')
	    requestConference();
    });


    

    //all the conference stuff in one place for now
    $remoteVideo=document.querySelector("#remoteVideo");  //bugbug probably wait until a user being conferenced with??
    $localVideo=document.querySelector("#localVideo");
    $otherUsers = document.querySelector("#otherUsers");

    if (!$remoteVideo)
      alert("wtfbugbug1236");
    if (!$localVideo)
      alert("wtfbugbug224");
    
    
    //autocall on startup
    //window.setTimeout(function(){
    //    conferenceJsHook();
    //},2000);
    
    window.setInterval(function(){
	updateServerCallback(myState,updateOtherUsers);
    },2000);
    
});
 
function getSelectedItem() { return selectedItem; }


function requestConference() {
    if (!selectedItem) return;
    if (!selectedItem.id) return;  //selectedItem (req for a call) gets to other user when they are drawing me!!
    conferenceJsHook();
}



function saveMyFeatures() {  //parallels below function updateOtherUsers (serialization/deserialization pair)
    //bugbug not yet called but should be 2017  !!



}


function updateOtherUsers(newUserDataFromServer) {
    //bring code here from commented out code in comm.js
    $.each(newUserDataFromServer,function(id,details) {
	//bugbug here should be code that lets anything be reconstituted,but instead just make gross assumptions...
	var user = document.querySelector('#otherUsers a-entity[id="' + id + '"'); //bugbug better way?
	if (!user) {
	    user = createBlankUser();
	    user.setAttribute('id',id);
	    $otherUsers.appendChild(user);
	}

	user.setAttribute('position',details.pos);
	user.setAttribute('rotation',details.rot);
	//bugbug todo user.setAttribute(geometry.scale  ....etc  etc)

    });
}




function createBlankUser() {
    var retval=document.createElement('a-entity');
    retval.setAttribute('geometry','primitive: cone; height:5; radiusTop:0, radiusBottom:0.25');
    retval.setAttribute('material','color','orange');
    retval.setAttribute('cursor-listener',{});
    return retval;
}





    
