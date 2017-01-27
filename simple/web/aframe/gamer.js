//most of this info will now be store in aframe object (it's mostly for drawing anyway, right?)
//..inside $otherUsers

function Gamer()
{
	this.color='#7777FF';
	this.pointh=null; //bugbug{ x:4700, y:4700, z:4700 };  //more fiedlds needed?  todo todo consts
	this.prevPoint=null; //{ x:4600, y:4700, z:4700 };
	this.prevPrevPoint=null;
	this.lastPublicPoint=null;
	this.orientation={ rotx:0, roty:0, rotz:0 };
	this.stepSize=5;
	this.type="Gamer";  //bugbug wish I didn't have to do this
	this.pointList=null;
}


Gamer.prototype.constructor=Gamer;



//all object types AFAIK will be "repositionable"...
//todo again with the passing too much...change this to an object.  time should be in a pointh optionally, for instance
Gamer.prototype.updateFromData=function (item)
{
   
    this.reposition( item.cam.x, item.cam.y, item.cam.z,
		     item.cam.rotate_x, item.cam.rotate_y, item.cam.rotate_z,
		     item.saveTime, item.mostRecentQuote
		   );
}


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

// function age(pointh)
// {
// 	//todo of course, ideally draw() would get handed the current time instead of this expensive getOfficialTime() call!!!!
// 	var ageSeconds=(getOfficialTime()-pointh.t)/1000;
// 	return (typeof ageSeconds == 'undefined')  ?  'noAge'  :  ageSeconds.toFixed(1)	 ;
// }

// Gamer.prototype.doStuff = function()
// {
	// //spin up a thread to move around almost randomly, but in this general direction
	// this.moveDelta({x:1,y:0,z:4})


// }
