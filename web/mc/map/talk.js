//talk.js
var talkKeyIsDead=false;
function talkJsHook()
{
	if (talkKeyIsDead) 
		return;
	talkKeyIsDead=true;
	setTimeout(	doTalkDialog, 20 );

}

var userQuote="";  //bugbug global just for now
function doTalkDialog()
{
	talkKeyIsDead=true;
	userQuote=prompt("say something:");
	setTimeout( function() {
			DemoUtils.KeyTracker.forceKeyUp(84); //bugbug T
			talkKeyIsDead=false;	
				},500);
}
