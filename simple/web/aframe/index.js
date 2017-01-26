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
		log("selected="+selectedItem.tagName+" "+selectedItem.key+" "+selectedItem.id);
            });
	}
    });
    

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
	updateServerCallback(myState);
    },2000);
    
});
 
function getSelectedItem() { return selectedItem; }


function requestConference() {
    if (!selectedItem) return;
    if (!selectedItem.key) return;  //selectedItem (req for a call) gets to other user when they are drawing me!!
    conferenceJsHook();
}

