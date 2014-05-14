


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






//Gamers are iDrawables that always take 1 (or 4 depending on "big" checkbox) pixels on the screen. 
//They also support more than 3 dimensions 

function Gamer()
{
	this.color='pink';
	this.pointh={ x:4700, y:4700, z:4700};  //more fiedlds needed?  bugbug
	this.prevPoint={ x:4600, y:4700, z:4700};
	this.orientation={ rotx:0, roty:0, rotz:0};
}

Gamer.prototype=new iDrawable();
Gamer.prototype.constructor=Gamer;

Gamer.prototype.moveTo = function(x,y,z, rotx, roty, rotz)  //bugbug need version that takes structs....clean up this interface
{
	//to show user "flowing" from one point to another (might generalize to a "ring buffer")
	this.prevPoint=this.pointh;

	this.pointh.x=x;
	this.pointh.y=y;
	this.pointh.z=z;
	
	//bugbug pass these in!
	
	//from the 'camera' or camera pulls from user?
	this.orientation.rotx=0;
	this.orientation.roty=0;
	this.orientation.rotz=0;  //bugbug abstract a 3D rotate-able object out and have gamer inherit from that...a later refactoring
}

Gamer.prototype.name = function(name)
{
	this.t=name;
}

var phase=0;
Gamer.prototype.draw=function(renderer,log2size) //,gameTime)  //bugbug need to pass in gameTime soon where this is called--OR should time be a global???
{
	//bugbug this is second copy of this routine....move to some type of sharign ??
	var tpt = function (pointh) {	
	
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

	if (this.pointh==null) return;
	
	//bugbug move lower??
	var ctx = renderer.ctx;
	ctx.beginPath();
	
	
	var footPoint2d=tpt(this.pointh);  //the foot is where you "are"

	if (footPoint2d==null)
		return null;  //offscreen!
	
		
	if (typeof this.t=='undefined')
	{
		this.t == 'playerZERO?';  //bugbug
	}
	
	
	if (this.isSelected) 
	{
		ctx.fillStyle='purple';
	}
	else
	{
		ctx.fillStyle=this.color;
	}
	
	if (footPoint2d==null) return null;
	
	var noseLength=20;  //bugbug settings? or property of object?
	var height=100;
	//var activity=5;  //soon there will be strings allowed for this value (activityLevel)!!! bugbug
	//bugbug based on activity, randomly fuzz the points' positions
	
	//bugbug you are here ("build" the person like we built a tree)
	var prevPoint2d=tpt(this.prevPoint);
	var orientationPoint2d=tpt(projection(this.pointh, noseLength, this.orientation));
	
	
	//bugbug we'll want to do more than draw lines
	drawLineAbsRel(ctx,footPoint2d,{x:0,y:-height});
	drawLineAbsAbs(ctx,footPoint2d,orientationPoint2d);
	drawLineAbsAbs(ctx,footPoint2d,prevPoint2d);
	
	
	
	
	//bugbug somethign else instead of...
	// ctx.fillRect(footPoint2d.x,footPoint2d.y,headingPoint2d.x-footPoint2d.x,headingPoint2d.y-footPoint2d.y);
	ctx.stroke();

	moveTo(ctx, orientationPoint2d);
	
	ctx.font="12px Arial";
	ctx.fillStyle=contrastBackground();
	
	ctx.fillText(this.t,orientationPoint2d.x,orientationPoint2d.y);  //bugbug redo startingPoint logic we inherited here
	ctx.stroke();
	
}


