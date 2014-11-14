

//is this duplicated elsewhere?  at any length should go into 
function projection(start, length, orientation)
{
	//it's wrong but for now ignore rotZ
	var diff={
				x: cos(orientation.rotx)*sin(orientation.roty),
				y: sin(orientation.rotx),
				z: cos(orientation.rotx)*cos(orientation.roty)	
	};
	return vecMultAdd(start,diff,length);
}

function drawLineAbsRel(ctx,from2d,to2dRel)
{
	drawLineAbsAbs(ctx,from2d,mm.addPoints2d(from2d,to2dRel));
}

function drawLineAbsAbs(ctx,from2d,to2d)
{
	moveTo(ctx,from2d);
	lineTo(ctx,to2d);
}


function drawDot(ctx,ctrPoint2d,radiusPix)
{
	ctx.fillStyle="red";  //todo make an arg?
	//todo should this be a circle given these arg names? 
	if (fillPoint(ctx,ctrPoint2d,radiusPix)==null)
		return null;  //todo is retval check even needed?
}




//Gamers are iDrawables that always take 1 (or 4 depending on "big" checkbox) pixels on the screen. 
//They also support more than 3 dimensions 

function Gamer()
{
	this.color='7777FF';
	this.pointh={ x:4700, y:4700, z:4700 };  //more fiedlds needed?  todo todo consts
	this.prevPoint={ x:4600, y:4700, z:4700 };
	this.prevPrevPoint=null;
	this.lastPublicPoint=null;
	this.orientation={ rotx:0, roty:0, rotz:0 };
	this.stepSize=5; 	
}


Gamer.prototype=new iDrawable();  //todo should be "tree"??? else why sharing so much code?
Gamer.prototype.constructor=Gamer;

Gamer.prototype.reposition2 = function(newPos)
{
	//this.lastPublicPoint  can only be set elsewhere
	this.prevPrevPoint=this.prevPoint;
	this.prevPoint=this.pointh;
	this.pointh=newPos; 	
}

Gamer.prototype.reposition = function(x,y,z, rotx, roty, rotz, t, quote)  //todo should take structs....clean up this interface
{
	//to show user "flowing" from one point to another (might generalize to a "ring buffer")  todo implement this as ring buffer???
	this.prevPrevPoint=this.prevPoint;
	this.prevPoint=this.pointh;
	this.pointh = {
		t:t,
		x:x,
		y:y,
		z:z
	};
	this.mostRecentQuote=quote;
	//from the 'camera' or camera pulls from user?
	this.orientation.rotx=rotx || 0;
	this.orientation.roty=roty || 0;
	this.orientation.rotz=rotz || 0;  //todo abstract a 3D rotate-able object out and have gamer inherit from that...a later refactoring
}



Gamer.prototype.moveForward = function()
{
	var newPoint = projection(this.pointh, this.stepSize, this.orientation);
	newPoint.t=getOfficialTime();
	this.reposition2(newPoint);
}

Gamer.prototype.mutateOrientation1 = function()
{
	this.orientation.roty += rad(Math.random()*100-50); //todo not random enough  && const
	loop(0,twoPi,this.orientation.rotY); 
	this.stepSize+=0.01;

}

Gamer.prototype.name = function(name)
{
	this.text=name;
}

var phase=0;
Gamer.prototype.realDraw=function(renderer,log2size) //,gameTime)  //todo need to pass in gameTime soon where this is called--OR should time be a global???
{
	//todo this is second copy of this routine....move to some type of sharign ??
	//and dynamically creating it each call here???
	var tpt = function (pointh) {	
	
		if (pointh==null) 
			return null;
	
		var scaleDim = -1;
		var phaseMax= 50000; //todo settings?
		phase--;
		phase %= phaseMax;	//todo base off the absolute frameNum or time or something???? unify time-handling
		
		//todo
		//knock it down to 3 dimensions based on hiDimProjection settings (controller should have told renderer, what is the control structure?)
		var offsetForHiDim = computeOffsetFromHi(renderer,pointh);  //   projection N ==> 3,   code in/near iDrawable?
		var plainPoint3 = vecMultAdd(pointh,offsetForHiDim,scaleDim*phase/phaseMax);
		debugSet("phase="+phase);
		//we will not consolidate this with the "tree.js"....this is where I insert higher-dimensional projection code
		//but should this go straight into the renderer and less code here?
		var point2d = transformPoint(renderer,plainPoint3);  //   projection 3 ==> 2

		return point2d;
	} ;  
	
	//todo this is copy from DataPoint...should be completely revamped....

	if (typeof this.selfDraw == 'function')
		this.selfDraw({
				renderer:renderer,
				log2size:log2size,
				transformFunction:tpt
			});  //todo boundingBox3d, etc etc here?  vs. how much of this already in "this"  (cache "age"?)
		
	
	//else...crappy default code...todo can we call the superclass instead???
	if (this.pointh==null) 
		return null;  
	
	var ctx = renderer.ctx;
	ctx.beginPath();

	var footPoint2d=tpt(this.pointh);  //the foot is where you "are"...compute early to eliminate stuff we don't need to draw
	if (footPoint2d==null)
		return null;  //offscreen!
	
		
	if (typeof this.text=='undefined')
	{
		this.text == 'playerUNDEF?';  
	}
	


	if (footPoint2d==null) 
		return null;
	
	var noseLength=25;  //todo settings? or property of object?
	var height=100;
	//var activity=5;  //soon there will be strings allowed for this value (activityLevel)!!! todo
	//todo based on activity, randomly fuzz the points' positions
	
	//todo("build" the person like we built a tree)
	var headPoint3d=mm.addPoints3d(this.pointh,{x:0,y:height,z:0});
	var nosePoint3d=projection(headPoint3d, noseLength, this.orientation);

	if (nosePoint3d==null) 
		return null;
		
	var nosePoint2d=tpt(nosePoint3d);
	var headPoint2d=tpt(headPoint3d);
	var prevPoint2d=tpt(this.prevPoint);
	var prevPrevPoint2d=tpt(this.prevPrevPoint);
	var lastPublicPoint2d=tpt(this.lastPublicPoint);
	//footPoint2d already done early
	
	if (nosePoint2d==null) 
	{
		//console.log('no nose');  
		return null;
	}
	if (headPoint2d==null)
	{
		//console.log('no head');  
		return null;
	}
	//todo if any more points turn that into an array or something!
	

	
	//ctx.drawTetrahedron()  TODO do this now with drawTriangleAbs()
	
	ctx.beginPath();

	//gamer can be selected, e.g. as a target for whisper or voice conf!!!
	if (this.isSelected) 
	{
		ctx.strokeStyle = 'purple';  //etc etc
		ctx.fillStyle = 'purple';
	}
	else
	{
		ctx.strokeStyle = this.color;
		ctx.fillStyle = this.color;
	}
	
	drawLineAbsAbs(ctx,nosePoint2d,headPoint2d);  //nose
	//drawLineAbsAbs(ctx,headPoint2d,footPoint2d);  //body
	
	if (prevPrevPoint2d!=null && prevPoint2d!=null)  //todo:   && ghostCloseEnoughAndLargeEnoughToMatter() 
	{
		drawLineAbsAbs(ctx,prevPoint2d,prevPrevPoint2d); 
	}
	
	if (prevPoint2d!=null)
	{
		//drawLineAbsAbs(ctx,footPoint2d,prevPoint2d);  //tail
		drawTriangleAbs(ctx,headPoint2d,footPoint2d,prevPoint2d,this.color);  
	}
	else
	{
		console.log("missing tail");  
	}
	
	
	ctx.stroke();
	
	//drawDot(ctx,lastPublicPoint2d,4);
	//ctx.stroke();
	
	
	ctx.strokeStyle="rgba(128,128,128,0.0)";
	ctx.fillStyle="rgba(128,128,128,0.7)";
	ctx.lineWidth=4;
	// ctx.fillStyle=contrastBackground();  TODO
	ctx.font="11px Arial";
	ctx.fillText(this.text,headPoint2d.x,headPoint2d.y-10);   //RETAIN for debugging... + '  age='+age(this.pointh)
	ctx.fill();
	ctx.font="13px Arial";
	ctx.fillText(fixQuote(this.mostRecentQuote),headPoint2d.x-20,headPoint2d.y-20);   
	ctx.fill();//todo is a ctx.fill needed here???  why not needed so far?
	
	ctx.stroke();
	ctx.strokeStyle="red";
	
	if (this.isCallee() && $remoteVideo)
	{
		var vidScale = 150;  //bugbug find other uses of this constant and rationalize
		var distScale = Math.abs(headPoint2d['y']-footPoint2d['y']);
		  
		var ww = vidScale/10 * distScale;  
		var hh = ww;    //bugbug do something special if looking away!  or off at an angle
		
		// var xx = footPoint2d['x']-vidScale/1.5;
		// var yy = footPoint2d['y']-vidScale/1.5;
		
		ww = clip(ww,vidScale/5,vidScale*5);
		hh = clip(hh,vidScale/5,vidScale*5);

		var xx=headPoint2d.x-0 -20;
		var yy=headPoint2d.y-hh-20;
		
		xx=clip(xx,0,screenWidth -vidScale/1.1);
		yy=clip(yy,0,screenHeight-vidScale/1.1); 
		
		$remoteVideo.css('left'  ,pixel(xx))
					.css('top'   ,pixel(yy))
					.css('width' ,pixel(ww))
					.css('height',pixel(hh))
		;
		//bugbugSOON also change size if they are far away, and default to a corner for behind???
	}
}

function pixel(z)     // 58 --> 58px
{
	return ""+parseInt(z)+"px";
}

function clip(x,a,b)    //
{
	if (x<a)
		return a;
	if (x>b) 
		return b;
	return x;
}

Gamer.prototype.isCallee=function()
{
	var otherParty=getCallee();
	if (!otherParty) 
		return false;
	if (otherParty==this.text || otherParty=="user_"+this.text)   //bugbugSOON resolve this issue at source
		return true;
	return false;
}

function fixQuote(str)
{
	if (typeof str==='undefined' || str==null || str=='') 
		return '';
		
	return "\""+str+"\"";
}

function age(pointh)
{
	//todo of course, ideally draw() would get handed the current time instead of this expensive getOfficialTime() call!!!!
	var ageSeconds=(getOfficialTime()-pointh.t)/1000;
	return (typeof ageSeconds == 'undefined')  ?  'noAge'  :  ageSeconds.toFixed(1)	 ;  
}

// Gamer.prototype.doStuff = function()
// {
	// //spin up a thread to move around almost randomly, but in this general direction
	// this.moveDelta({x:1,y:0,z:4})


// }