//conference.js:   smcclure879


//old e.g.....
// var configuration = { iceServers: [{ url: "stun:stun.services.mozilla.com",
                                     // username: "louis@mozilla.com", 
                                     // credential: "webrtcdemo" }]

//old single-server way
// var STUN = {
    // url: 'stun:stun.l.google.com:19302'   //bugbug need more complete list

	// };

// var TURN = {    //bugbug don't want to "relay" so don't want to use TURN
    // url: 'turn:homeo@turn.bistri.com:80',
    // credential: 'homeo'
// };



var servers = {
	   iceServers: [
				{url:"stun:stun.l.google.com:19302"},
				{url:"stun:stun1.l.google.com:19302"},
				{url:"stun:stun2.l.google.com:19302"},
				{url:"stun:stun3.l.google.com:19302"},
				{url:"stun:stun4.l.google.com:19302"},
				{
					url: 'turn:numb.viagenie.ca',
					credential: 'muazkh',
					username: 'webrtc@live.com'
				}
					//was...
					// [STUN
					// //, TURN  //bugbug probably don't want to use this since it's leakier
					// ]
		]
};
   






var pc = null;  //the peer connection (RTCPeerConnection)  (webrtc)

var inCall=false;  //state bit

var dumps = JSON.stringify;




var telecInfo={};  //global for now bugbug



////////     "PUBLIC INTERFACE"     ////////
function conferenceJsHook()  {  //don't change this name
    initiateTheCall();
}

function maybeDoTeleconf(localCopyOfItem,itemFromServer)  {
	maybeDoTeleconfInternal(localCopyOfItem,itemFromServer);
}


function getCallee()
{
	return telecInfo._otherParty;
}

function hangup() 
{
	trace("Ending call");
	pc.close(); 
	pc=null;
	inCall=false;
	//bugbug video controls off, etc.
	//bugbug event driven hangup for both parties...
}





///////////   END PUBLIC INTERFACE  /////////////


//===============end public api============



////INITIATOR CODE//////
function initiateTheCall() 
{	
	pc=new RTCPeerConnection(servers);
	//bugbug  doesn't fire...why?pc.onconnection = function() { alert("you are here onConnection fired"); };
	pc.oniceconnectionstatechange = showIceConnectionStateChange;
	//bugbug doesn't seem to work   pc.ongatheringchange = showGatheringStateChange;
	
	pc.onicecandidate = gotIceCandidateForSender;
	pc.onaddstream = gotRemoteStream;  //for when we get the answer back!
		
	//local self video
	var constraints = {video:true, audio:true};
	inCall=true;
	getUserMedia(constraints, initiateConnection, errorHandler);
}
//THENTO
function initiateConnection(localStream) 
{
	//bugbug still needed??? 
	//window.stream = localStream; // stream available to console

	$localVideo.src = window.URL.createObjectURL(localStream);
		
	if (localStream.getVideoTracks().length > 0) 
	{
		trace('Using video device: ' + localStream.getVideoTracks()[0].label);
	}
	if (localStream.getAudioTracks().length > 0) 
	{
		trace('Using audio device: ' + localStream.getAudioTracks()[0].label);
	}

	pc.addStream(localStream);
	trace("Added localStream to connection");
	//createAndUseOffer called by the last (null) ice candidate (see gotIceCandidate)??bugbug
	createAndUseOffer();  //trickle didn't work, have to have this here.
}
//sorta THENTO
function createAndUseOffer()
{
	pc.createOffer(useLocalOffer,errorHandler);	//constraints as 3rd arg??? bugbug
}
//THENTO
function useLocalOffer(offer)
{
	trace("use local offer="+dumps(offer));
	pc.setLocalDescription(new RTCSessionDescription(offer), 
							function() {/* sendMyOffer(offer)  */  },
							errorHandler);
}
//THENTO

////////  RECEIVER AND RECEIVE-ANSWER CODE  //////////

//hook to maybe receive a call...
function maybeDoTeleconfInternal(localCopyOfItem,itemFromServer)  {

    if (inCall) //?? what if other party hung up?  bugbug
	return;

    if (!localCopyOfItem) //bugbugSoon do we even need this here?  maybe to mark who is calling us, e.g. to paint larger or something.
	return;	
    
    var otherParty=itemFromServer;  //bugbugOK??  .value;
    if (!otherParty || !otherParty.telecInfo)
	return;

    //explicitly already tested to make sure this is not us, but maybe do it again???
    var calleeKey = otherParty.telecInfo.callee;
    if (!calleeKey) 
	return;

    if (!inCall && isOK(calleeKey) && !isMe(calleeKey) )  	{
	processAsIncomingCall(otherParty);
    } else if (inCall===true && otherParty.telecInfo.answer) { //might be in THIS call, so can't use that bit!!!
	if (theyAreWhoWeCalled(otherParty))	{
	    finalizeOfferCycle(otherParty);  //sets inCall to 2
	} else {
	    //bugbug anything?
	}
    } else {
	//passthru: got a telecInfo, but it's not for us
	if (typeof debug !== 'undefined' && debug)  {
	    alert("bugbug115p: unknown state:"+inCall+" "+dumps(pc));
	    alert("otherParty="+dumps(otherParty));
	}
    }
    
}

function theyAreWhoWeCalled(otherParty) {
    debugger;  //bugbug you are here
    return true;
}


function isMe(x) {
    return (x=='userId');  //bugbug const
}

function isOK(x) {

    if (typeof x == 'undefined') return false;
    if (!x) return false;
    return true; //bugbug whatelse, consolidate?	
}



////////  RECEIVER CODE  ////////

function processAsIncomingCall(callee) {

    var currentOffer = callee.telecInfo.currentOffer;

    if (!currentOffer)
	return;
    
    if (!confirm("accept call from "+callee.userId+"?"))  //bugbug just the key??
	return; //ignoring it  //prolly need to record this somehow?bugbug
    
    telecInfo._otherParty=callee.userId;    //this one already has user_ stripped
    
    if (inCall) 
	return; //busy
    inCall=true;
    
    pc=new RTCPeerConnection(servers);  
    pc.oniceconnectionstatechange = showIceConnectionStateChange; 
    
    //bugbug try without ice candidates on this side as well...
    pc.onicecandidate = gotIceCandidateForReceiver;  //function(ev) { gotIceCandidate(ev,blah); } ;  
    pc.onaddstream = function(event) { 
	debugger; 
	gotRemoteStream(event,createAnswer); 
    } ;  //bugbug WHY did this make it go farther....why did I have to do this
    //bugbug doesn't seem to work  pc.ongatheringchange = showGatheringStateChange;
    
    getUserMedia(
	{video:true},
	function(stream){acknowledgeConnection(stream,currentOffer);},
	errorHandler
    );
}

// THENTO
function acknowledgeConnection(localStream,currentOffer) {
	//pc.onaddstream({stream: localStream});  //calling gotRemoteStream with local???
	//show it locally
    alert("setting video source during ack");
	$localVideo.setAttribute('src', URL.createObjectURL(localStream));
	
	//send it to originator  (bugbug is this too early, move to createAnswer??)
	pc.addStream(localStream);
	
	
	var description=new RTCSessionDescription(currentOffer);
	alert("about to set description to:"+dumps(description)+dumps(pc));
	pc.setRemoteDescription(description,createAnswer,errorHandler);
}
// THENTO
function createAnswer() {
	alert("creatingAnswer"+dumps(pc));
	pc.createAnswer(useAnswer,errorHandler);
}
// THENTO
function useAnswer(answer) {
	alert("connection going thru now");
	//alert("pc state="+dumps(pc));
	pc.setLocalDescription(new RTCSessionDescription(answer));
			//, function(){/* sendAnswer(answer) */}, minorErrorHandler);
}
// THENTO  nope


function handleIceCandidateMessage(iceCandidate) {
	pc.addIceCandidate(new RTCIceCandidate(iceCandidate));
}


 

// function streamAddedNowWhat(ev) 
// {
	// var remoteStream=ev.stream; 
	// var remoteStreamUrl=window.URL.createObjectURL(remoteStream);
	// alert("starting remoteStreamUrl="+remoteStreamUrl);
	// $remoteVideo.prop('src',remoteStreamUrl).change();  
	// //$remoteVideo.get().play();bugbug
	// alert("remote video should be playing");
// }

 

/////////  ANSWER TO THE ANSWER  ////////////
function finalizeOfferCycle(otherParty){
	//alert("finalizeConn..."+dumps(pc))	
        debugger;
	pc.setRemoteDescription(new RTCSessionDescription(otherParty.telecInfo.answer),endOfFinalize,errorHandler);
	inCall=2;
}

function endOfFinalize() {
	//nothing
    debugger;
}


//////  ice candidate handling  //////
function gotIceCandidateForSender(event) { //,outgoingStream)
	if (event.candidate === null) {
		//alert("last of sender trickle: here is SDP"+pc.localDescription.sdp);
		//sendCandidateSdpInfo();
		sendMyOffer();
	} //else {
		//pc.addIceCandidate(new RTCIceCandidate(event.candidate)); 
		//alert("send got ICE candidate: " + dumps(event));
	//}
}

function gotIceCandidateForReceiver(event) {  //skipped for now actually
	if (event.candidate === null) {
		//alert("last of receiver trickle done...      localsdp"+pc.localDescription.sdp);
		sendAnswer();  //bugbug sendMyAnswer
	} //else {
		//pc.addIceCandidate(new RTCIceCandidate(event.candidate));
		//alert("recv got ICE candidate: \n" + dumps(event));
		//alert("recv ice, pc.localDescription:"+dumps(pc.localDescription));
	//}
}

function stripUserPrefix(s){
	return stripPrefix("user_",s);
}

function stripPrefix(prefix,s){
	if (s.startsWith(prefix))
		return s.substring(prefix.length);
	return s;		
}


function sendMyOffer(){
    var sel = getSelectedItem();
    if (!sel) 
	return;

    //trace("sending the following offer from localPeerConnection: \n" + offer);
    var offer=pc.localDescription;
    telecInfo.currentOffer=offer;  
    telecInfo.callee=sel.id;
    telecInfo._otherParty=stripUserPrefix(telecInfo.callee);  //bugbug better way than new function, maybe a fix to line before this one?
    trace("pc state while postOfferSend:"+dumps(pc));
    
    //extra hooks for tests
    if (typeof postOfferSend=='function')
		postOfferSend(dumps(offer));

    //debugger;
}

//bugbug consolidate with the above
function sendAnswer() {
	//alert("setting global answer--state while postOfferSend from receiver: "+pc.iceConnectionState);
	//alert("bugbugCHECK: localDescription --pc state in sendAnswer="+dumps(pc));
	var answer = pc.localDescription;
	telecInfo.answer=answer;

    debugger;
	if (typeof postOfferSend=='function')
		postOfferSend(dumps(answer));
	
	
}



//////  EVERYBODY //////
function gotRemoteStream(ev,then)  {  //note similar function elsewhere in this file  _mine
	var remoteStream=ev.stream; //bugbug
	//alert("gotRemoteStream"+dumps(remoteStream));
	//trace(remoteStream);
	
	var remoteStreamUrl = window.URL.createObjectURL(remoteStream);  //bugbug release all of these on hangup
	//alert("remote stream url="+remoteStreamUrl);
	
	$remoteVideo.src=remoteStreamUrl;
	//$remoteVideo.get().play();  //bugbug needed???
	
	if (then) 
		then();
}



function showIceConnectionStateChange(ev){
	trace( "in showIceConnectionStateChange:"+	pc.iceConnectionState );
}

function errorHandler(err) { //bugbug consolidate with other similars.  3 functions!
	trace(err);
	alert("err"+getStackTrace()+"  "+dumps(err));  //bugbug separate for separate cases????
}

function minorErrorHandler(err) {  //bugbug consolidate with other similars.  3 functions!
	trace(err);
	trace("err"+getStackTrace()+"  "+dumps(err));  //bugbug separate for separate cases????
}

function getStackTrace() {
	var obj = {};
	Error.captureStackTrace(obj, getStackTrace);
	return obj.stack;
}

function trace(text) {
	console.log((performance.now() / 1000).toFixed(3) + ": " + text);
}



//keep for testing...



//bugbug move these elsewhere...valuable!!!?
// function enable(jqButton)
// {
	// jqButton.prop('disabled', false).change();
// }

// function disable(jqButton)
// {
	// jqButton.prop('disabled', true).change();
// }

			
// var testConfRecepJson={_id: "user_HarryPotter029", _rev: "21547-8878e4e8b0e01a49f2452902f204628f", userId: "HarryPotter029", 
	// cam: {rotate_x: 0.13962634000000002, rotate_y: 0.802851455, rotate_z: 0, x: 289, y: -292, z: -637}, 
	// mostRecentQuote: "", drawInstructions: "bilateral up100 right100 down50 left200 down50", 
	// telecInfo: {currentOffer: {sdp: 
			// "v=0\r\no=- 6749225876606550730 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE audio video\r\na=msid-semantic: WMS ojXoWJIee0JVKmKIHXI1KdVKbabfoLswQNK6\r\nm=audio 1 RTP/SAVPF 111 103 104 0 8 106 105 13 126\r\nc=IN IP4 0.0.0.0\r\na=rtcp:1 IN IP4 0.0.0.0\r\na=ice-ufrag:VzXufVwblH4om8MD\r\na=ice-pwd:LPzHqYW7Qx+w0BjouFcBQMYg\r\na=ice-options:google-ice\r\na=fingerprint:sha-256 3F:F6:C6:E7:3E:26:17:89:83:34:FA:F1:97:0A:3A:A9:71:B8:73:A5:C0:E3:48:7E:36:17:12:D4:3B:E8:A5:F8\r\na=setup:actpass\r\na=mid:audio\r\na=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level\r\na=extmap:3 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time\r\na=sendrecv\r\na=rtcp-mux\r\na=rtpmap:111 opus/48000/2\r\na=fmtp:111 minptime=10\r\na=rtpmap:103 ISAC/16000\r\na=rtpmap:104 ISAC/32000\r\na=rtpmap:0 PCMU/8000\r\na=rtpmap:8 PCMA/8000\r\na=rtpmap:106 CN/32000\r\na=rtpmap:105 CN/16000\r\na=rtpmap:13 CN/8000\r\na=rtpmap:126 telephone-event/8000\r\na=maxptime:60\r\na=ssrc:687274967 cname:/FpdTECaV19PSyat\r\na=ssrc:687274967 msid:ojXoWJIee0JVKmKIHXI1KdVKbabfoLswQNK6 aadb8e3a-82a5-482d-9bdc-d14633956928\r\na=ssrc:687274967 mslabel:ojXoWJIee0JVKmKIHXI1KdVKbabfoLswQNK6\r\na=ssrc:687274967 label:aadb8e3a-82a5-482d-9bdc-d14633956928\r\nm=video 1 RTP/SAVPF 100 116 117 96\r\nc=IN IP4 0.0.0.0\r\na=rtcp:1 IN IP4 0.0.0.0\r\na=ice-ufrag:VzXufVwblH4om8MD\r\na=ice-pwd:LPzHqYW7Qx+w0BjouFcBQMYg\r\na=ice-options:google-ice\r\na=fingerprint:sha-256 3F:F6:C6:E7:3E:26:17:89:83:34:FA:F1:97:0A:3A:A9:71:B8:73:A5:C0:E3:48:7E:36:17:12:D4:3B:E8:A5:F8\r\na=setup:actpass\r\na=mid:video\r\na=extmap:2 urn:ietf:params:rtp-hdrext:toffset\r\na=extmap:3 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time\r\na=sendrecv\r\na=rtcp-mux\r\na=rtpmap:100 VP8/90000\r\na=rtcp-fb:100 ccm fir\r\na=rtcp-fb:100 nack\r\na=rtcp-fb:100 nack pli\r\na=rtcp-fb:100 goog-remb\r\na=rtpmap:116 red/90000\r\na=rtpmap:117 ulpfec/90000\r\na=rtpmap:96 rtx/90000\r\na=fmtp:96 apt=100\r\na=ssrc-group:FID 1998620391 2674792308\r\na=ssrc:1998620391 cname:/FpdTECaV19PSyat\r\na=ssrc:1998620391 msid:ojXoWJIee0JVKmKIHXI1KdVKbabfoLswQNK6 eeec1b92-9c61-49dc-8eb3-ef13da685833\r\na=ssrc:1998620391 mslabel:ojXoWJIee0JVKmKIHXI1KdVKbabfoLswQNK6\r\na=ssrc:1998620391 label:eeec1b92-9c61-49dc-8eb3-ef13da685833\r\na=ssrc:2674792308 cname:/FpdTECaV19PSyat\r\na=ssrc:2674792308 msid:ojXoWJIee0JVKmKIHXI1KdVKbabfoLswQNK6 eeec1b92-9c61-49dc-8eb3-ef13da685833\r\na=ssrc:2674792308 mslabel:ojXoWJIee0JVKmKIHXI1KdVKbabfoLswQNK6\r\na=ssrc:2674792308 label:eeec1b92-9c61-49dc-8eb3-ef13da685833\r\n"
				// , type: "offer"}, callee: "user_HarryPotter030"}, 
	// saveTime: 1413840756775};

// function fakeRingBugbug()
// {
	// processAsIncomingCall(testConfRecepJson);
// }

