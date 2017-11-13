

function notify() {
    var n = new Notification('Title', {
	body: 'I am the body text!'
	//,icon: '/path/to/icon.png' // optional
    });
}

function doit(then) {
    if (!window.Notification) 
	throw new Exception("notification capability does not exist on this browser");
        
    if (Notification.permission !== "granted") {
	Notification.requestPermission(function(result){
	    if (result === "granted") {
		then();
	    }
	    alert(result);
	});
    }

    then();    
}


function testNotify() {
    doit(notify);
    alert("didit");
}

var w;
function testWorkerNotify() {
    if (typeof(Worker) !== "undefined") {
	alert("yes");

	if (typeof(w) == "undefined") {
	    w = new Worker("worker.js");
	    w.onmessage = function(event){
	        //alert(event.data);
		document.getElementById("result").innerHTML = event.data;
	    };
	}

    } else {
	alert("no");

    }

}


function testServiceWorker() {
    //https://stackoverflow.com/a/27256165
		    
    if ('serviceWorker' in navigator) {
	alert('2115a');
	navigator.serviceWorker.register('/web/servwork.jss').then(function(reg) {
	    alert('yay');
	    console.log('Yey!', reg);



	    if(reg.installing) {
		alert('Service worker installing');
	    } else if(reg.waiting) {
		alert('Service worker installed');
	    } else if(reg.active) {
		alert('Service worker active');
	    }



	}).catch(function(err) {
	    alert('boo'+err);
	    console.log('Boo!', err);
	});
    }
    

}


window.onload = function() {

    button1.onclick = function() {
	alert("yo");
	testNotify();
    }
    button2.onclick = testWorkerNotify;

    button3.onclick = testServiceWorker;

}




