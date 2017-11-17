

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
	        alert(event.data);
		document.getElementById("result").innerHTML = event.data;
	    };
	}

    } else {
	alert("no");

    }

}



function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
          .replace(/\-/g, '+')
          .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
	outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}


function sendMessages(evt) {
    
    fetch('/api/beep/sendall', {
	method: 'put',
	headers: {
	    'Content-type': 'application/json'
	},
	body: JSON.stringify({msg:sendText.value})
	
	//{endpoint: subscription.endpoint
	// ,keys:{p256dh:"bugbug256dh",auth:"bugbugauth"}}
    }).then(function(result) {
	//alert(JSON.stringify(result));
    });
}

//bugbug need to get this from the server...it matches only because of my paste!!!
const vapidPublicKey="BKJ4qoXhzumDNe0-8z9guILYzmuYJdWzR5N3fAeSDKWEk9xnH3sfgG8uYwuWNDlERDOv5egThZSbTkU1QwxOJnE";
var applicationServerKey=urlBase64ToUint8Array(vapidPublicKey);
var endpoint;

function testServiceWorker() {
    //https://stackoverflow.com/a/27256165		    
    if (! ('serviceWorker' in navigator)) {
	alert('this browser does not have serviceWorker capability');
	return;
    }

    navigator.serviceWorker.register('/web/serv.work.js').then(function(reg) {
	if(reg.installing) {
	    alert('Service worker installing');
	} else if(reg.waiting) {
	    alert('Service worker installed');
	} else if(reg.active) {
	    alert('Service worker active');
	} else {
	    alert("err1948");
	}
	
	reg.pushManager.getSubscription().then(function(subscription){

	    return subscription ?   //the old or new subscription
		subscription : 
		reg.pushManager.subscribe({
		    userVisibleOnly: true
		    ,applicationServerKey: applicationServerKey});
	    
	    
	}).catch(function(err) {
	    alert('boo'+err);
	    console.log('Boo!', err);
	}).then(function(subscription) {

	    //alert("with me"+JSON.stringify(subscription));
	    
	    fetch('/api/beep/register', {
		method: 'put',
		headers: {
		    'Content-type': 'application/json'
		},
		body: JSON.stringify(subscription)
		//{endpoint: subscription.endpoint
		// ,keys:{p256dh:"bugbug256dh",auth:"bugbugauth"}}
	    }).then(function(result) {
		alert(JSON.stringify(result));
	    });

	    
	});
    }).catch(function(err) {
	alert('boo2:'+err);
	
    });
      
}
    



window.onload = function() {

    button1.onclick = function() {
	alert("yo");
	testNotify();
    }
    button2.onclick = testWorkerNotify;

    button3.onclick = testServiceWorker;

    button4.onclick = sendMessages;
}




