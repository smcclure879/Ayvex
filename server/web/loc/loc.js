
window.onload=function(evt){
    setTimeout(function(){
	let loc="uninit";
	loc=navigator.geolocation.getCurrentPosition(function(ll) {

	    alert(JSON.stringify(ll));

	});
	//alert(loc);
	
    },500);
}
