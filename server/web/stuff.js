

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


function getTalkChannel() {
    var cd = channelData;
    if (!cd) return "---";
    const talkChannel = cd.channelList[parseInt(cd.talk)-1];
    return talkChannel || "-.-";
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
	    talkChannel:getTalkChannel(),
	    type:'plain',
	    clientTime:shortNow()
	})
    }).then(function(result) {
	//alert(JSON.stringify(result));
	sendText.value=null;
	fillConvo(channelData);  
    }).catch(function(reason){
	alert("sendall fail:"+reason);
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

//remove channelData as arg since now global???? bugbug
function registerServiceWorker(channelData) {
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
	    var msg = 'errCode1128u: (missing https?):'+err;
	    alert(msg);
	    console.log('errCode1128u:', err);
	}).then(function(subscription) {
	    var wrappedSubscription = {channelData:channelData, subscription:subscription};
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

//bugbug it would be ideal if instead of passing channelData from userland,  we'd pull the server version
//   of channel list from the reg/sub stuff
//...but then we have to pass at least a ref to that info !   a user table emerges out of that, and logins etc.
// only the conversation and the registrations NEED to be serverside i think.
function fillConvo(channelData) {

    fetch("/api/beep/convo/", {
	method: 'put',
	headers: {
	    'Content-type': 'application/json'
	},
	body: JSON.stringify({  channelList:channelData.channelList })
    }).then(function(response) {
	return response.json();  //bugbug json()
    }).then(function(bodyJson) {
    	convo.innerHTML = ""+bodyJson.result;  
	convo.scrollTop = convo.scrollHeight;
    }).catch(function(err) {
	alert("errCode227n:"+JSON.stringify(err));
	convo.innerHTML = JSON.stringify(err);
	convo.scrollTop = convo.scrollHeight;
    });
}


function updateChannelUI(channelData) {

    var ll = channelData.channelList;
    channel1.value = ll[0];
    channel2.value = ll[1] || "";
    channel3.value = ll[2] || "";
    channel4.value = ll[3] || "";
    channel5.value = ll[4] || "";

    
    //radio selection how?
    //bugbug you are here
    document.all['channelUI'].talkChannel.value = channelData.talk;
    

}


function getStorageObject(k,defaultVal) { //e.g. k="channelText"
    const t=window.localStorage.getItem(k);
    if (!t)
	return defaultVal;
    const o=JSON.parse(t);
    return o;
}

function setStorageObject(k,vo) {
    const vs = JSON.stringify(vo);
    window.localStorage.setItem(k,vs);
}


function validateChannelConfigOrDie(channelData) {
    //bugbug--nyi
}

function vv(ch) {
    if (ch.value) return ch.value;
    return '';
}
 

let channelData = {
    isDefault:1,
    channelList:['public'],
    talk:1
}


window.onload = function() {
    var pkView = document.all("pkView");
    pkView.innerText = vapidPublicKey;

    const channelKey="channelKey";
    channelData=getStorageObject(channelKey,channelData); 
    
    if (channelData.isDefault) {
	delete channelData['isDefault']; //it is no longer default, just "starting out"

	if (!confirm("I want to receive alerts")) {
	    window.location.href="https://www.google.com";
	    return;
	} else {
	    //a new user who has accepted ... how much more welcome mat needed?
	    alert("welcome legacy user: entering channel=public");
	    setStorageObject(channelKey,channelData);
	}
    } //else we got the channelData so we're good to proceed

    validateChannelConfigOrDie(channelData); 

    updateChannelUI(channelData);
    
    channelUI.onsubmit=function(evt) {
	//bugbug sterlize here, but also at server
	evt.preventDefault();
	//alert(document.querySelector('input[name="talkChannel"]:checked').value);
	channelData = {
	    channelList:[vv(channel1),vv(channel2),vv(channel3),vv(channel4),vv(channel5)],
	    talk:document.querySelector('input[name="talkChannel"]:checked').value
	};
	registerServiceWorker(channelData);  //re-register really    bugbug remove use of global variable here
	//alert("about to set key"+JSON.stringify(channelData));
	setStorageObject(channelKey,channelData);
	return false;
    }


    //bugbug not happy with this want to do it triggering off earlier events and triggering later ones
    setTimeout(function(){
	registerServiceWorker(channelData);
    },50);  
    
    fillConvo(channelData);

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




