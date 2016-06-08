//buildPointList.js

function lastItem(arr) {
	return arr[arr.length-1];
}

function getNum(x) {  //where    x  isLike  wwwwwwwwdddddddd   
	if (x===null)
		return 0;
	while(1) {
		if (x==='') 
			return 0;
		if ( !isNaN(x) )
			return 0+x;
		x=x.substring(1);	
	}
	return 0; //can never run because of above loop, just here for linter
}

function buildPointList(pointh, drawCode, closeLoop) {
	var pointList = [pointh];  //only 1 point so far!
	//point0=pointh
	//point1=first segment's endpoint, second

	var instructions=drawCode.split(" ");
	if (instructions[0]=="bilateral")	{
		instructions.shift(); //and throw it away
		runInstructions(pointList,instructions,1);
		instructions=instructions.reverse();
		runInstructions(pointList,instructions,-1);
	} else {
		runInstructions(pointList,instructions,1);
	}
	
	if (closeLoop) 
		pointList.push(pointList[0]);  //bugbug or move this logic to draw-time?
	
	return pointList;
}

//point list already contains exactly one item (pointh)!
function runInstructions(pointList,instructions, parity)
{	
	if (!parity)
		parity=1;

	var p=lastItem(pointList);
	for(var ii=0,il=instructions.length; ii<il; ii++) {
		var newPoint={x:p.x,y:p.y,z:p.z}; //bugbug what about the hiDim stuff?	
		var instruction=instructions[ii];
		
		//parity bit shouldn't be used on horizontals
		if (instruction.startsWith("right")) {
			newPoint.x += 1*getNum(instruction);
		}
		else if (instruction.startsWith("left")) {
			newPoint.x -= 1*getNum(instruction);
		}
		else if (instruction.startsWith("up")) {
			newPoint.y += parity*getNum(instruction);
		}
		else if (instruction.startsWith("down")) {
			newPoint.y -= parity*getNum(instruction);
		}
		else if (instruction.startsWith("forward"))	{
			newPoint.z += parity*getNum(instruction);
		}
		else if (instruction.startsWith("back")) {
			newPoint.z -= parity*getNum(instruction);
		}
		
		p=newPoint;
		pointList.push(p);
	}
}
