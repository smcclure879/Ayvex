var z=150;
var disp,sphere;
var $localVideo,$remoteVideo;

function log(x) {
    disp.textContent=(""+x);
}

function getSelectedItem() {
    return {
        key : "user_aframe", // + (Date.now()%10000) //bugbug testing only TODO
    };
}



$("document").ready( function(event) {
    disp= document.querySelector("#readout");
    sphere = document.querySelector("#sphere");
    viewer = document.querySelector("#viewer");
    window.setInterval(function(){
        z-=3;
        if (z<4) return;
        viewer.setAttribute('position',{'x':0,'y':1.7,'z':z});
        log("sphere: pos3d="+sphere.attributes.position.value);  //+"  pos2d="+sphere.position.left);
    },20);
    
    //window.setTimeout(function(){
    //    alert("447bugbug");
    //},2000);
    
    //all the conference stuff in one place for now
    $remoteVideo=document.querySelector("#remoteVideo");
    $localVideo=document.querySelector("#localVideo");
    
    if (!$remoteVideo)
      alert("wtfbugbug1236");
    if (!$localVideo)
      alert("wtfbugbug224");
    
    
    window.setTimeout(function(){
        conferenceJsHook();
    },2000);
    
    
});
