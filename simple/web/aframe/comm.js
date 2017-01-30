
//copyright 2017 smcclure,ayvexLightIndustries







//  COMB COMB  COMB COMB  COMB COMB  COMB COMB




// var debug=false; 

// var floor=62;  //minecraftWaterLevel todo setting or ???

// var darkBrown='rgba(101,67,33,1.0)';

// //todo jquerify and consolidate...there are more of these...
// var toolbar = document.getElementById("toolbar");
// var $anim = $("#animate"); 


// //This section is connection/init to conference.js  (bugbug make a better class/object) (needed to be here because wasn't working from inside conference.js!)
// var localStream, localPeerConnection, remotePeerConnection;
// var $localVideo = $('#localVideo');
// var $remoteVideo = $('#remoteVideo');
// var $canvas = $('#c');
// var screenWidth;
// var screenHeight;


//todo we need an OBJECT here that implements a local k-d tree  there is an opensource k-d tree we should use....	
//var theDrawings=[];

// function debugAdd(s) {
//     toolbar.innerHTML+=s+'<br/>';
// }

// function debugSet(s) {
//     if (toolbar)
// 	toolbar.innerHTML=s;
// }


// function definedAndTrue(val) {
//     try {
//         val = eval(val);
//         if (typeof val == 'undefined') return false;
//     } catch (ex) {
//         return false;
//     }

//     return val;
// }

// function pushAll(ofThese,intoThese)  {
//     if (ofThese instanceof Array) {
// 	for(var ii=0,il=ofThese.length; ii<il; ii++) {
// 	    intoThese.push(ofThese[ii]);
// 	}
//     } else {
// 	intoThese.push(ofThese);
//     }
// }



// //this works, but the script won't be live until you yield the thread for a while.  call it carefully!
// function addScript(filename) {
//     //a neat trick from  http://www.javascriptkit.com/javatutors/loadjavascriptcss.shtml  
//     var newScriptTag=document.createElement('script')
//     newScriptTag.setAttribute("type","text/javascript")
//     newScriptTag.setAttribute("src", filename)
//     document.getElementsByTagName("head")[0].appendChild(newScriptTag);
// }	





//bugbug needed?  persist?
// var theUser =  {
//     type: "Gamer",
//     userId:"",  //later set right value in a sub sub sub of doc.ready()
//     _rev:-1,
//     cam:null, //todo better sentinel value?
//     _id:""
// };

//two locks...one to not run more than once per 2s, one to keep 2 copies from running at same time
var lastCalled=Date.now();
var serverCallbackLocked=false;  //open it  -- like a semaphore??  todo revisit
var fakeServer=0; //bugbug

//bugbug rename globally to "doAllServerComm" or similar
function updateServerCallback(me,cb) {  //me is "the user"  
    //myState is "input" and cb gets output of "other users and stuff" (dynamic objects)
    
    var reason = (function checkArgs() {
	if ( !cb )    return "err240p: cb is missing";
	if ( !me )    return "err241p: var.me is missing";
	if ( typeof me.getAttribute !='function' )    return "err250p: bad var.me needs to be a-frame entity";
	if ( !me.getAttribute('id') || me.getAttribute('id')!='user' )   return "err242p: bad var.me";
	if ( !userId ) /*globalbugbug*/  return "err1123y: no userId";
	return null;
    })();

    if (reason) {
	log(reason);
	return;
    }

    var theUser={
	type:"user",
	userId:userId,  //bugbug global
	pos:me.getAttribute('position'),
	rot:me.getAttribute('rotation'),
	//bugbug others
    };

    

    //lock 1
    var thisCall=Date.now();
    if (thisCall-lastCalled<2000)  //at most every 2 sec (todo const)
	return;
    else
	lastCalled=thisCall;

    //lock 2
    if (serverCallbackLocked)  //this is the actual door
	return;
    else
	serverCallbackLocked=true;  //closes behind you, one at a time

    
    //if (theUser._rev<1) 
    //{
    //	initServerCallback(theUser);
    //	return;
    //}
    //
    //if (theUser._rev==1) 
    //{
    //	delete theUser._rev;  //we'll get a new one, this is just sentinel value  
    //	theUser._id="user/"+theUser.userId;   //todo const
    //}	



    //theUser.mostRecentQuote=userQuote;
    theUser.telecInfo=telecInfo;  //global local user's telecInfo goes into the local user being persisted
    theUser.saveTime=getOfficialTime();  //ideally the protocol would save a serverSaveTime as well and other clients will see cheating.
    if (theUser.saveTime<1400000000) { //1B, roughly 2001
	console.log('cannot get official time');  //can't do much yet  ...wait for next callback...continue anyway with bad time...
    }
    

    if (fakeServer) {
	console.log("skipping server write");
    } else {
	var data = JSON.stringify(theUser);
	var putUrl=getUserDocUrl(theUser);  //+revString(theUser._rev);
	
	$.ajax({
	    type:"PUT",
	    headers: { 
		'Accept': 'application/json',
		'Content-Type': 'application/json'
	    },
	    url: putUrl,
	    data: data,
	    //contentType: "application/json",	    //dataType: "json",
	    success: function( data, textStatus, jqXHR ) {
		//no _rev for now....   theUser._rev = unquote(jqXHR.getResponseHeader("ETAG"));  //so we can save next time
	    },
	    error: function( jqXHR, textStatus, errorThrown ) {
		alert('err1047u: put bad'+errorThrown)+putUrl+""+data;
	    },
	    complete: function(jqResp) {
		serverCallbackLocked=false;  //open again one way or another
	    }
	});
	//notice that was a best-effort send!
    
    }//end of SEND PORTION!!!

    // START RECEIVE PORTION
    // call  http://WHATEVER/api/getCurrentUsers
    //and put those users into "theDrawings" 
    //need to get time of each user's writing from server, to show fading-of-color or ??
    


    //bugbug FAKE RECEIVE  until running on the real server
    if (fakeServer) {  //use this fake data
	var fakeData = {
	    'user_mikey':{type:'Gamer',id:'mikey',
			  pos: {x: 0, y:0, z:0},
			  rot: {x:0,y:0,z:0},
			  saveTime: '2016-01-01Z13:01:19', mostRecentQuote:'myquotefake'
			 },
	    'column_skyPortal':{type:'Feature',id:'skyPortal',pos:{x:-3,y:50,z:-50}} //bugbug
	};

	setTimeout(function(){
	    cb(fakeData);  
	},300);
	return;
    } else {  //---- else really do the receive-----

	//receive after we send is a good check of our write??
	$.ajax({
	    type: "GET",
	    url: getCurrentUsersUrl(),
	    contentType: "application/json",
	    success: function(data) {
		var obj = deString(data);  
		cb(obj);  //previously 	updateDynamicObjects(data); //see below
	    },
	    error: function(resp) {
		if (resp.status==404)
		    theUser._rev=1;  //which = a NEW 
		else
		    alert("err523x: do not know how to deal with this error"+resp.status+"  "+JSON.stringify(resp));
	    },
	    complete: function(jqResp) {
		//not needed now
	    }
	    
	});	
    }
}


function deString(data) {  //might be object, might be dehydrated JSON object
    var ttt=typeof data;
    if (ttt=='string') return $.parseJSON(data);
    if (ttt=='object') return data;
    return {"badData":"err1115t"};
}	


//keep this as an example how to handle the output
//var dynamicObjects={};  //eventually needs to be some space partitioning class  kd-dataStructure?  todo
// function updateDynamicObjects(data) {
//     var obj = deString(data);  
//     var count=Object.keys(obj).count;
//     $.each(obj,function(prop,val) {
// 	updateDynamicObjectFromServerData(val);
//     });
// }

// function isSelf(item) {
//     return (item.userId==theUser.userId);
// }


// function updateDynamicObjectFromServerData(item) {   //item is the data from server

//     item = deString(item);

//     if (isSelf(item)) //todo revisit... for now disallow drawing self (strict first person for demo, can change later)
// 	return; 

//     var dynObj=dynamicObjects[item.id];
    
//     //todo: apply factory pattern here instead.
//     switch(item.type)	{
//     case "Gamer":	
// 	if (!dynObj) {
// 	    dynObj=new Gamer();  
// 	    //wtf  bugbugb   dynObj.name(item.userId);
// 	    dynamicObjects[item.userId]=dynObj;
// 	}
// 	dynObj.updateFromData(item);
// 	maybeDoTeleconf(dynObj,item);  //item is from server  //users can do teleconf but probably no other types
// 	break;
	
//     case "Feature":
// 	//bugbug todo later
// 	// if (!dynObj) {
// 	//     dynObj=new DrawnObject();
// 	//     dynamicObjects[item.id]=dynObj; 
// 	// }
// 	// dynObj.updateFromData(item);  //todo consider not updating unless "changed" e.g. a timestamp?
// 	// break;
	
//     default:	//todo what other kinds of dynObjs do we have for now tho??
// 	trace("unknown type from db:"+dumps(item));
// 	break;
//     }
    
    

// }






// function isMe(someKey) {
//     return (someKey==theUser._id);
// }



// function unquote(x) {
//     for(ii=0, il=x.length; ii<il && x.substring(ii,1)=="\""; ii++);
//     for(      jj=x.length; jj>=0 && x.substring(jj,1)=="\""; --jj); 
//     return x.substring(ii,jj-ii);
// }

//bugbug needed??
//function initServerCallback(theUser)
//{
//	console.log("called init server callback");
//	var userInfo = getUserDocUrl(theUser);
//	
//	//todo consolidate this call with similar call above somehow?  worth it?
//	$.ajax({
//		type: "GET",
//		url: userInfo,
//		contentType: "application/json",
//		success: function(data) {
//			initUserFromData(theUser,data); //it better be a userDoc
//		},
//		error: function(resp) {
//			if (resp.status==404)
//				theUser._rev=1;  //which = NEW todo const
//			else
//				alert("err523p:do not know how to deal with this error"+JSON.stringify(resp)+"   "+userInfo);
//		},
//		complete: function(jqResp) {
//			setServerTimeOffset(jqResp.getResponseHeader('Date'));
//			serverCallbackLocked=false;  //open again one way or another
//		}
//		
//	});
//}

//todo figure both of these programmatically...find all "localhost" and fix them
var protocol = window.location.protocol;
var server=window.location.hostname; //todo must figure dynamically
var port = ""+window.location.port;
//var database = "api";
//var viewLocation = "_design/views/_view";
//todo all the above from config???


function getProtocol() {
    return window.location.protocol;
}

function getDatabaseUrl () {
    return getProtocol()+"//"+server+""+port+"/api";  //bugbug simplify
}

function getCurrentUsersUrl() {
    var retval = getDatabaseUrl()+"/user/";  //like doing a directory query
    //alert(retval);  bugbug simplify this function
    return retval;
}

function getUserDocUrl(user) {
    return getDatabaseUrl()+"/user/"+user.userId;
}

//this user is probably "theUser"...but maybe we change our mind later?
//function initUserFromData(user,data) {
//
//
//	//bugbug yeah ???    var obj = $.parseJSON(data);
//	var obj = data; //why parse not needed now???
//
//
//	user.cam=obj.cam;
//	//user._rev=obj._rev;
//	user._id=obj._id;
//	//etc todo
//	
//	debugger;
//	if (user._rev<1) {
//		user._rev=1;
//	}
//	
//}

function revString(rev) {
    if (typeof rev === 'undefined') 
	return "";
    if (rev<=1) //brand new
	return "";
    return "?rev="+rev;
}

//todo make a serverTimeSync module
var timeOffset=0;      // later null when we again have "server time" concept;
function getOfficialTime() {  //we want it as an int for compactness and speed of math....but ideally we'd be putting this info in on the server side!
    if (timeOffset==null) {
	return -1;  //not ready this call...try again next time
    }
    return getCurrentTime()+timeOffset;
}

//function setServerTimeOffset(serverTime)
//{
//	serverTime=(new Date(serverTime)).getTime();
//	if (serverTime<1400000000) 
//		return;
//	timeOffset=serverTime-getCurrentTime();
//	console.log("timeOffset="+timeOffset);
//}

function getCurrentTime() {
    return 0+(new Date()).getTime();
}

//# sourceURL=index.html




function simpleStart(oGetVars) {

    //default to black
    $("#black").prop('checked',true);
    updateBackground(null);

    document.body.bgColor='black';

    //c.position.left="0px";
    //c.style.position.top="0px";
    //c.width=screen.width-100;
    //c.height = screen.height-100;



    //hide display numbers or make tiny!

    //support tablet drags etc


}
