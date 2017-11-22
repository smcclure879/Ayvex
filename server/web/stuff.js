

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



function pad2(x) {
    x="00"+x;    
    x=x.substr(-2);
    return x;
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
    //	+ "日月火水木金土".substr(x.getDay()) //need to fix encoding first.  want 1 char per day
	+ ['Su','M','Tu','W','Th','F','Sa'][ x.getDay() ]  //oh well
    	+ pad2(x.getHours()) + "L" + pad2(x.getMinutes()) ;    //L=local  
}


function sendMessages(evt) {
    if (!sendText.value)
	return;
    
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
	sendText.value=null;
	fillConvo();
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



var vapidPublicKey=apiCall("/api/beep/vapidpk/").publicKey;
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
	    var wrappedSubscription = {channels:chList, subscription:subscription};
	    //alert("with me"+JSON.stringify(wrappedSubscription));
	    
	    convo.style.backgroundColor="pink";
	    fetch('/api/beep/register', {
		method: 'put',
		headers: { 'Content-type': 'application/json' },
		body: JSON.stringify(wrappedSubscription)
	    }).then(function(result) {
		//alert("ready for messaging"); //JSON.stringify(result));
		convo.style.backgroundColor="#aaee99";
	    });
	});
    }).catch(function(err) {
	alert('boo2:'+err);
    });
}


function fillConvo() {
    var x = apiCall("/api/beep/convo/");
    convo.innerHTML=x.result;
    convo.scrollTop = convo.scrollHeight;
}


function updateChannelsUI(chList) {
    //bugbug sanitize
    channel1.value=chList[0];
    channel2.value=chList[1] || "";
    channel3.value=chList[2] || "";
    channel4.value=chList[3] || "";
    channel5.value=chList[4] || "";

    //radio selection how?
}

var channelText,chList;
window.onload = function() {
    var pkView = document.all("pkView");
    pkView.innerText = vapidPublicKey;

    channelText=window.localStorage.getItem("channelText");
    if (channelText==null) {
    	if (!confirm("I want to receive alerts")) {
	    window.location.href="https://www.google.com";
	    return;
	} else {
	    alert("legacy user: you are being placed in channel=public");
	    channelText='public';  //must be comma separated list
	    window.localStorage.setItem("channelText",channelText);
	}
    } //else it's ready already
    
    chList=channelText.split(",");
    
    updateChannelsUI(chList);
    channelUI.onsubmit=function(evt) {
	//bugbug sterlize here, but also at server
	evt.preventDefault();
	chList = [channel1.value, channel2.value];   //bugbug,ch2.v,ch3.v  etc
	channelText = chList.join(",");
	registerServiceWorker();
	alert(channelText);
	window.localStorage.setItem("channelText",channelText);
	return false;
    }



    //bugbug not happy with this want to do it triggering off earlier events and triggering later ones
    setTimeout(registerServiceWorker,50);  



    fillConvo(chList);

    senderButton.onclick = sendMessages;
    sendText.onkeyup = function(evt) {
	if (evt.keyCode==13) {
	    sendMessages();
	}
    };
    sendText.focus();
    

/*

you monitor up 1-5 channels.
you are set to talk in only 1 channel.

one is "public"
one is "carbon" for demos.
one is "<not given>" used internally for family stuff

*/
    
    //geek buttons....
    button1.onclick = function() {
	alert("yo");
	testNotify();
    };

    
    button2.onclick = testWorkerNotify;
    button3.onclick = registerServiceWorker;
    //button4.onclick = null;
}




