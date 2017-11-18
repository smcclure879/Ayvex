

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


// Sunday: Nichiyôbi (にちようび – 日曜日)
// Monday: Getsuyôbi (げつようび – 月曜日)
// Tuesday: Kayôbi (かようび – 火曜日)
// Wednesday: Suiyôbi (すいようび – 水曜日)
// Thursday: Mokuyôbi (もくようび – 木曜日)
// Friday: Kinyôbi (きんようび – 金曜日)
// Saturday: Doyôbi (どようび – 土曜日)



function shortNow() {
    const x = new Date();
    return "" 
    // starting Sunday: 日月火水木金土  <-- want to use this!!! one char each
	+ ['Su','M','Tu','W','Th','F','Sa'][ x.getDay() ]
	+ x.getHours() + "L" + x.getMinutes() ;      
}


function sendMessages(evt) {
    
    fetch('/api/beep/sendall', {
	method: 'put',
	headers: {
	    'Content-type': 'application/json'
	},
	body: JSON.stringify({
	    msg:sendText.value,
	    type:'plain',
	    clientTime:shortNow()
	})
    }).then(function(result) {
	//alert(JSON.stringify(result));
    }).catch(function(reason){
	alert(reason);
    });
}


function apiCall(url) {
    var request = new XMLHttpRequest();
    request.open('GET', url, false);  // `false` makes the request synchronous
    request.send(null);
    if (request.status === 200) {
	console.log(request.responseText);
    }else{
	alert("something very wrong doing apiCall:"+url);
    }

    return JSON.parse(request.responseText);
}


//bugbug need to get this from the server...it matches only because of my paste!!!
//const vapidPublicKey="BKJ4qoXhzumDNe0-8z9guILYzmuYJdWzR5N3fAeSDKWEk9xnH3sfgG8uYwuWNDlERDOv5egThZSbTkU1QwxOJnE";
var vapidPublicKey=apiCall("/api/vapidpk/").publicKey;
alert(vapidPublicKey);
var applicationServerKey=urlBase64ToUint8Array(vapidPublicKey);
var endpoint;

function registerServiceWorker() {
    //https://stackoverflow.com/a/27256165		    
    if (! ('serviceWorker' in navigator)) {
	alert('this browser does not have serviceWorker capability');
	return;
    }

    navigator.serviceWorker.register('/web/serv.work.js').then(function(reg) {  //a service worker registration
	reg.update();
	if(reg.installing) {
	    //alert('Service worker installing');
	} else if(reg.waiting) {
	    //alert('Service worker installed');
	} else if(reg.active) {
	    //alert('Service worker active');
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
		headers: { 'Content-type': 'application/json' },
		body: JSON.stringify(subscription)
	    }).then(function(result) {
		alert("ready for messaging"); //JSON.stringify(result));
	    });
	});
    }).catch(function(err) {
	alert('boo2:'+err);
    });
}




window.onload = function() {

    setTimeout(registerServiceWorker,50);
    senderButton.onclick = sendMessages;

    

    //geek buttons....
    button1.onclick = function() {
	alert("yo");
	testNotify();
    }
    button2.onclick = testWorkerNotify;
    button3.onclick = registerServiceWorker;
    //button4.onclick = null;
}




