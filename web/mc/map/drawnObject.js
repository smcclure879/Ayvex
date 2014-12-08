//drawnObject.js

function DrawnObject()
{
	this.color='7777FF';
	this.pointh={ x:4700, y:4700, z:4700 };  //more fiedlds needed?  todo todo consts
	this.orientation={ rotx:0, roty:0, rotz:0 };  //bugbug needed?
	this.type="DrawnObject";
} 

DrawnObject.prototype=new iDrawable();
DrawnObject.prototype.constructor=DrawnObject;

DrawnObject.prototype.updateFromData=function (item)
{
	this.drawInstructions=item.drawInstructions;
}

DrawnObject.prototype.setInstructions = function(instructions)
{
	this.drawInstructions=instructions;
}

DrawnObject.prototype.save = function()
{
	alert("NYI bugbug1007");
}