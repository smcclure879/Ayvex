


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
	ctx.fillStyle="red";  //bugbug make an arg?
	//bugbug should this be a circle given these arg names?
	if (fillPoint(ctx,ctrPoint2d,radiusPix)==null)
		return null;  //bugbug retval check even needed?
}




//Gamers are iDrawables that always take 1 (or 4 depending on "big" checkbox) pixels on the screen. 
//They also support more than 3 dimensions 

function Gamer()
{
	this.color='blue';
	this.pointh={ x:4700, y:4700, z:4700 };  //more fiedlds needed?  bugbug   bugbug consts
	this.prevPoint={ x:4600, y:4700, z:4700 };
	this.prevPrevPoint=null;
	this.lastPublicPoint=null;
	this.orientation={ rotx:0, roty:0, rotz:0 };
	this.stepSize=5; 	
}

Gamer.prototype=new iDrawable();
Gamer.prototype.constructor=Gamer;
Gamer.prototype.canSelfDraw=true;  //bugbug OK??

Gamer.prototype.reposition2 = function(newPos)
{
	//this.lastPublicPoint  can only be set elsewhere
	this.prevPrevPoint=this.prevPoint;
	this.prevPoint=this.pointh;
	this.pointh=newPos; 	
}

Gamer.prototype.reposition = function(x,y,z, rotx, roty, rotz, t)  //bugbug need version that takes structs....clean up this interface
{
	//to show user "flowing" from one point to another (might generalize to a "ring buffer")  bugbug implement this right !!!
	this.prevPrevPoint=this.prevPoint;
	this.prevPoint=this.pointh;
	this.pointh = {
		t:t,
		x:x,
		y:y,
		z:z
	};
	
	//from the 'camera' or camera pulls from user?
	this.orientation.rotx=rotx || 0;
	this.orientation.roty=roty || 0;
	this.orientation.rotz=rotz || 0;  //bugbug abstract a 3D rotate-able object out and have gamer inherit from that...a later refactoring
}

Gamer.prototype.moveForward = function()
{
	var newPoint = projection(this.pointh, this.stepSize, this.orientation);
	newPoint.t=getOfficialTime();
	this.reposition2(newPoint);
}

Gamer.prototype.mutateOrientation1 = function()
{
	this.orientation.roty += rad(Math.random()*100-50); //bugbug not random enough  bugbug const
	loop(0,twoPi,this.orientation.rotY); 
	this.stepSize+=0.01;

}

Gamer.prototype.name = function(name)
{
	this.text=name;
}

var phase=0;
Gamer.prototype.draw=function(renderer,log2size) //,gameTime)  //bugbug need to pass in gameTime soon where this is called--OR should time be a global???
{
	//bugbug this is second copy of this routine....move to some type of sharign ??
	//and dynamically creating it each call here???
	var tpt = function (pointh) {	
	
		if (pointh==null) 
			return null;
	
		var scaleDim = -1;
		var phaseMax= 50000; //bugbug settings?
		phase--;
		phase %= phaseMax;	//bugbug base off the absolute frameNum or time or something???? unify time-handling
		
		//bugbug
		//knock it down to 3 dimensions based on hiDimProjection settings (controller should have told renderer, what is the control structure?)
		var offsetForHiDim = computeOffsetFromHi(renderer,pointh);  //   projection N ==> 3,   code in/near iDrawable?
		var plainPoint3 = vecMultAdd(pointh,offsetForHiDim,scaleDim*phase/phaseMax);
		debugSet("phase="+phase);
		//we will not consolidate this with the "tree.js"....this is where I insert higher-dimensional projection code
		//but should this go straight into the renderer and less code here?
		var point2d = transformPoint(renderer,plainPoint3);  //   projection 3 ==> 2

		return point2d;
	} ;  
	
	//bugbug this is copy from DataPoint...should be completely revamped....

	if (typeof this.selfDraw == 'function')
		return this.selfDraw({
				renderer:renderer,
				log2size:log2size,
				transformFunction:tpt
			});  //bugbug boundingBox3d, etc etc here?  vs. how much of this already in "this"  (cache "age"?)
		
	
	//else...crappy default code
	if (this.pointh==null) 
		return null;  
	
	//bugbug move lower??
	var ctx = renderer.ctx;
	ctx.beginPath();
	
	

	var footPoint2d=tpt(this.pointh);  //the foot is where you "are"...compute early to eliminate stuff we don't need to draw
	if (footPoint2d==null)
		return null;  //offscreen!
	
		
	if (typeof this.text=='undefined')
	{
		this.text == 'playerUNDEF?';  //bugbug
	}
	


	if (footPoint2d==null) 
		return null;
	
	var noseLength=25;  //bugbug settings? or property of object?
	var height=100;
	//var activity=5;  //soon there will be strings allowed for this value (activityLevel)!!! bugbug
	//bugbug based on activity, randomly fuzz the points' positions
	
	//bugbug you are here ("build" the person like we built a tree)
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
		console.log('no nose');  //bugbug
		return null;
	}
	if (headPoint2d==null)
	{
		console.log('no head');  //bugbug
		return null;
	}
	//bugbug if any more points turn that into an array or something!
	
	//bugbug we'll want to do more than draw lines
	if (this.isSelected) 
	{
		ctx.strokeStyle = 'purple';
	}
	else
	{
		ctx.strokeStyle = this.color;
	}
	
	drawLineAbsAbs(ctx,nosePoint2d,headPoint2d);  //nose
	drawLineAbsAbs(ctx,headPoint2d,footPoint2d);  //body
	
	if (prevPoint2d!=null)
	{
		drawLineAbsAbs(ctx,footPoint2d,prevPoint2d);  //tail
	}
	else
	{
		console.log("missing tail");  //bugbug
	}
	
	if (prevPrevPoint2d!=null && prevPoint2d!=null)  //bugbug and if right scale and distance to care
	{
		drawLineAbsAbs(ctx,prevPoint2d,prevPrevPoint2d); 
	}
	ctx.stroke();
	
	drawDot(ctx,lastPublicPoint2d,4);
	ctx.stroke();
	
	ctx.font="11px Arial";
	ctx.fillStyle=contrastBackground();
	
	//moveTo(ctx, headPoint2d);
	ctx.fillText(this.text + '  age='+age(this.pointh),nosePoint2d.x,nosePoint2d.y);  
	// if (prevPrevPoint2d!=null)  //bugbug put this back in some other way (pixie dust instead of numbers?)
		// ctx.fillText(age(this.pointh),prevPrevPoint2d.x,prevPrevPoint2d.y);

	ctx.stroke();	 
}


function age(pointh)
{
	//bugbug of course, ideally draw() would get handed the current time instead of this expensive getOfficialTime() call!!!!
	var ageSeconds=(getOfficialTime()-pointh.t)/1000;
	return (typeof ageSeconds == 'undefined')  ?  'noAge'  :  ageSeconds.toFixed(1)	 ;  
}

// Gamer.prototype.doStuff = function()
// {
	// //spin up a thread to move around almost randomly, but in this general direction
	// this.moveDelta({x:1,y:0,z:4})


// }