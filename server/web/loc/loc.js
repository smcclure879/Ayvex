



function getOrCreateCookie(name,fn){
    let sought  =  name + "=" ;
    let q=document.cookie.split(';').filter((item) => item.trim().startsWith(sought));
    if (q.length) return q[0].split('=')[1];
    let val=fn();
    document.cookie=sought+val+"; expires=Fri, 31 Dec 9999 23:59:59 GMT";
    return val;
}

var locid = getOrCreateCookie( "locid", ()=> Math.random().toString(36).substring(2,8) );





function posToStr(pos){
    return locid+"  "+count+"  "+pos.coords.latitude + "  " + pos.coords.longitude + "   --" + pos.timestamp;
}

function submitInfoStr(x){
    var request = new XMLHttpRequest();
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/locrep/'+encodeURIComponent(x));
    xhr.onload = function() {
	if (xhr.status === 200) {
	    show('response= ' + xhr.responseText);
	}
	else {
	    show('err1457i...Request failed.  Returned status of ' + xhr.status);
	}
    };
    xhr.send();
}


var count=0;
function showPos(pos) {
    count++;
    console.log(pos);
    show(posToStr(pos));
}
function show(x) {
    document.querySelector('#foo').innerText += x;
}
function submitPos(pos) {
    submitInfoStr(posToStr(pos));
}
function go(){
    let x=navigator.geolocation.watchPosition(function (pos){
	showPos(pos);
	submitPos(pos);
	
},function(err){
	document.body.style.backgroundColor = "blue";
    });
    
    console.log(x);

}



window.onload=function(evt){
    setTimeout(go,500);
}
